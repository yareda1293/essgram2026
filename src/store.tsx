import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { User, Chat, Message, Moment, Call, Notification, AppSettings, ChannelPost, Comment, TabKey, Reaction } from './types';
import {
  CURRENT_USER_ID,
  seedUsers,
  seedChats,
  seedMessages,
  seedMoments,
  seedCalls,
  seedNotifications,
  seedChannelPosts,
  getUserById as getUserByIdFromSeed,
} from './data';
import { generateId } from './utils';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type AuthStage = 'method' | 'phone' | 'email' | 'email_signin' | 'email_signup' | 'code' | 'profile' | 'authenticated' | 'loading';

interface AppState {
  authStage: AuthStage;
  phoneNumber: string;
  email: string;
  currentUserId: string;
  currentUser: User;
  setAuthStage: (s: AuthStage) => void;
  setPhoneNumber: (p: string) => void;
  setEmail: (e: string) => void;
  completeProfile: (data: Partial<User>) => void;
  signOut: () => void;

  activeTab: TabKey;
  setActiveTab: (t: TabKey) => void;

  users: User[];
  chats: Chat[];
  messages: Message[];
  moments: Moment[];
  calls: Call[];
  notifications: Notification[];
  channelPosts: ChannelPost[];

  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;

  sendMessage: (chatId: string, text: string, type?: Message['type'], extra?: Partial<Message>) => void;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  togglePinChat: (chatId: string) => void;
  toggleMuteChat: (chatId: string) => void;
  markChatRead: (chatId: string) => void;
  createChat: (chat: Partial<Chat>) => string;
  addMoment: (m: Omit<Moment, 'id' | 'timestamp' | 'viewedBy'>) => void;
  viewMoment: (momentId: string) => void;
  addChannelPost: (channelId: string, text: string, mediaUrl?: string) => void;
  togglePostReaction: (postId: string, emoji: string) => void;
  addComment: (postId: string, text: string) => void;
  togglePinPost: (postId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ---- DB row → domain type mappers ----

function dbUserToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    phone: row.phone || '',
    avatar: row.avatar || '',
    bio: row.bio || '',
    status: row.status || undefined,
    isOnline: row.is_online ?? false,
    lastSeen: row.last_seen || undefined,
    isVerified: row.is_verified ?? false,
  };
}

function dbChatToChat(row: any): Chat {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    avatar: row.avatar || '',
    description: row.description || undefined,
    memberCount: row.member_count ?? undefined,
    subscriberCount: row.subscriber_count ?? undefined,
    isPublic: row.is_public ?? false,
    unreadCount: row.unread_count ?? 0,
    isPinned: row.is_pinned ?? false,
    isMuted: row.is_muted ?? false,
    lastMessageId: row.last_message_id || undefined,
    lastMessagePreview: row.last_message_preview || undefined,
    lastMessageTimestamp: row.last_message_timestamp || undefined,
    spaceId: row.space_id || undefined,
  };
}

function dbMessageToMessage(row: any, reactions: Reaction[]): Message {
  return {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    type: row.type,
    text: row.text || undefined,
    mediaUrl: row.media_url || undefined,
    mediaName: row.media_name || undefined,
    duration: row.duration ?? undefined,
    timestamp: row.timestamp,
    status: row.status,
    readAt: row.read_at || undefined,
    reactions,
    replyTo: row.reply_to || undefined,
    edited: row.edited ?? false,
    deleted: row.deleted ?? false,
    forwardedFrom: row.forwarded_from || undefined,
    stickerUrl: row.sticker_url || undefined,
  };
}

function dbMomentToMoment(row: any, viewedBy: string[]): Moment {
  return {
    id: row.id,
    userId: row.user_id,
    mediaUrl: row.media_url,
    caption: row.caption || undefined,
    timestamp: row.timestamp,
    viewedBy,
    type: row.type,
  };
}

function dbCallToCall(row: any): Call {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    direction: row.direction,
    timestamp: row.timestamp,
    duration: row.duration ?? undefined,
  };
}

function dbNotificationToNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    timestamp: row.timestamp,
    read: row.read ?? false,
    avatar: row.avatar || undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStage, setAuthStage] = useState<AuthStage>('loading');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState(CURRENT_USER_ID);
  const [activeTab, setActiveTab] = useState<TabKey>('chats');

  const [users, setUsers] = useState<User[]>(seedUsers);
  const [chats, setChats] = useState<Chat[]>(seedChats);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [moments, setMoments] = useState<Moment[]>(seedMoments);
  const [calls, setCalls] = useState<Call[]>(seedCalls);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [channelPosts, setChannelPosts] = useState<ChannelPost[]>(seedChannelPosts);

  const [settings, setSettings] = useState<AppSettings>({
    accentColor: '#0ea5e9',
    darkMode: true,
    notifications: true,
    showPhoneNumber: false,
    usernameVisible: true,
    profilePhotoVisible: true,
    lastSeenVisible: true,
    readReceipts: true,
    twoStepVerification: false,
    blockedUsers: [],
  });

  const loadedRef = useRef(false);

  // ---- Check for existing Supabase session on mount ----
  // Restores authentication if the user reloads the page.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supabaseUserId = session.user.id;
          setCurrentUserId(supabaseUserId);
          if (session.user.email) setEmail(session.user.email);
          if (session.user.phone) setPhoneNumber(session.user.phone);
          // Check if this user already has a profile in app_users
          const { data: existingUser } = await supabase
            .from('app_users')
            .select('id, phone, email')
            .eq('id', supabaseUserId)
            .maybeSingle();
          if (existingUser) {
            setAuthStage('authenticated');
          } else {
            setAuthStage('profile');
          }
        } else {
          setAuthStage('method');
        }
      } catch (err) {
        console.warn('Failed to restore Supabase session', err);
        setAuthStage('method');
      }
    })();

    // ---- Listen for auth state changes ----
    // Uses the async IIFE pattern to avoid deadlocking onAuthStateChange.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setCurrentUserId(CURRENT_USER_ID);
          setAuthStage('method');
          setPhoneNumber('');
          setEmail('');
          return;
        }
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const supabaseUserId = session.user.id;
          setCurrentUserId(supabaseUserId);
          // The AuthFlow component handles the stage transition to 'profile'
          // after OTP verification. Here we only restore if the user already
          // has a profile (e.g. page reload while signed in).
          try {
            const { data: existingUser } = await supabase
              .from('app_users')
              .select('id')
              .eq('id', supabaseUserId)
              .maybeSingle();
            if (existingUser) {
              setAuthStage('authenticated');
            }
          } catch {
            // If the query fails, leave the current stage as-is
          }
          if (session.user.email) setEmail(session.user.email);
        }
      })();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ---- Load all data from Supabase on mount ----
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (!isSupabaseConfigured) return;

    (async () => {
      try {
        const [
          { data: dbUsers },
          { data: dbChats },
          { data: dbMessages },
          { data: dbReactions },
          { data: dbMoments },
          { data: dbMomentViews },
          { data: dbCalls },
          { data: dbNotifications },
          { data: dbSettings },
          { data: dbChannelPosts },
          { data: dbChannelPostReactions },
          { data: dbChannelComments },
        ] = await Promise.all([
          supabase.from('app_users').select('*').order('created_at'),
          supabase.from('app_chats').select('*').order('updated_at', { ascending: false }),
          supabase.from('app_messages').select('*').order('timestamp', { ascending: true }),
          supabase.from('app_message_reactions').select('*'),
          supabase.from('app_moments').select('*').order('timestamp', { ascending: false }),
          supabase.from('app_moment_views').select('*'),
          supabase.from('app_calls').select('*').order('timestamp', { ascending: false }),
          supabase.from('app_notifications').select('*').order('timestamp', { ascending: false }),
          supabase.from('app_settings').select('*').eq('id', 'demo').maybeSingle(),
          supabase.from('app_channel_posts').select('*').order('timestamp', { ascending: true }),
          supabase.from('app_channel_post_reactions').select('*'),
          supabase.from('app_channel_comments').select('*').order('timestamp', { ascending: true }),
        ]);

        if (dbChannelPosts && dbChannelPosts.length > 0) {
          const postReactionMap = new Map<string, Reaction[]>();
          for (const r of dbChannelPostReactions || []) {
            const arr = postReactionMap.get(r.post_id) || [];
            arr.push({ emoji: r.emoji, userId: r.user_id });
            postReactionMap.set(r.post_id, arr);
          }
          const commentMap = new Map<string, Comment[]>();
          for (const c of dbChannelComments || []) {
            const arr = commentMap.get(c.post_id) || [];
            arr.push({
              id: c.id,
              postId: c.post_id,
              authorId: c.author_id,
              text: c.text,
              timestamp: c.timestamp,
              reactions: c.reactions || [],
            });
            commentMap.set(c.post_id, arr);
          }
          setChannelPosts(dbChannelPosts.map((p: any) => ({
            id: p.id,
            channelId: p.channel_id,
            authorId: p.author_id,
            text: p.text,
            mediaUrl: p.media_url || undefined,
            timestamp: p.timestamp,
            reactions: postReactionMap.get(p.id) || [],
            commentCount: commentMap.get(p.id)?.length || 0,
            isPinned: p.is_pinned ?? false,
            views: p.views || 0,
            comments: commentMap.get(p.id) || [],
          })));
        }

        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers.map(dbUserToUser));
        }
        if (dbChats && dbChats.length > 0) {
          setChats(dbChats.map(dbChatToChat));
        }
        if (dbMessages && dbMessages.length > 0) {
          const reactionMap = new Map<string, Reaction[]>();
          for (const r of dbReactions || []) {
            const arr = reactionMap.get(r.message_id) || [];
            arr.push({ emoji: r.emoji, userId: r.user_id });
            reactionMap.set(r.message_id, arr);
          }
          setMessages(dbMessages.map((m: any) => dbMessageToMessage(m, reactionMap.get(m.id) || [])));
        }
        if (dbMoments && dbMoments.length > 0) {
          const viewMap = new Map<string, string[]>();
          for (const v of dbMomentViews || []) {
            const arr = viewMap.get(v.moment_id) || [];
            arr.push(v.user_id);
            viewMap.set(v.moment_id, arr);
          }
          setMoments(dbMoments.map((m: any) => dbMomentToMoment(m, viewMap.get(m.id) || [])));
        }
        if (dbCalls && dbCalls.length > 0) {
          setCalls(dbCalls.map(dbCallToCall));
        }
        if (dbNotifications && dbNotifications.length > 0) {
          setNotifications(dbNotifications.map(dbNotificationToNotification));
        }
        if (dbSettings) {
          setSettings({
            accentColor: dbSettings.accent_color || '#0ea5e9',
            darkMode: dbSettings.dark_mode ?? true,
            notifications: dbSettings.notifications ?? true,
            showPhoneNumber: dbSettings.show_phone_number ?? false,
            usernameVisible: dbSettings.username_visible ?? true,
            profilePhotoVisible: dbSettings.profile_photo_visible ?? true,
            lastSeenVisible: dbSettings.last_seen_visible ?? true,
            readReceipts: dbSettings.read_receipts ?? true,
            twoStepVerification: dbSettings.two_step_verification ?? false,
            blockedUsers: dbSettings.blocked_users || [],
          });
        }
      } catch (err) {
        // Keep seed data as fallback
        console.warn('Supabase load failed, using seed data', err);
      }
    })();
  }, []);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const completeProfile = useCallback((data: Partial<User>) => {
    setAuthStage('authenticated');
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || currentUserId;
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
        await supabase.from('app_users').upsert({
          id: userId,
          name: data.name || 'New User',
          username: data.username || '@newuser',
          phone: data.phone || phoneNumber || '',
          email: session?.user?.email || email || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
          status: data.status || null,
          is_online: true,
          is_verified: false,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to save profile to Supabase', err);
      }
    })();
  }, [currentUserId, phoneNumber, email]);

  const signOut = useCallback(() => {
    setAuthStage('method');
    setPhoneNumber('');
    setEmail('');
    setCurrentUserId(CURRENT_USER_ID);
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Failed to sign out from Supabase', err);
      }
    })();
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      if (isSupabaseConfigured) (async () => {
        try {
          await supabase.from('app_settings').upsert({
            id: 'demo',
            accent_color: next.accentColor,
            dark_mode: next.darkMode,
            notifications: next.notifications,
            show_phone_number: next.showPhoneNumber,
            username_visible: next.usernameVisible,
            profile_photo_visible: next.profilePhotoVisible,
            last_seen_visible: next.lastSeenVisible,
            read_receipts: next.readReceipts,
            two_step_verification: next.twoStepVerification,
            blocked_users: next.blockedUsers,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to save settings to Supabase', err);
        }
      })();
      return next;
    });
  }, []);

  const sendMessage = useCallback((chatId: string, text: string, type: Message['type'] = 'text', extra?: Partial<Message>) => {
    const newMsg: Message = {
      id: generateId(),
      chatId,
      senderId: currentUserId,
      type,
      text: type === 'text' ? text : text,
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      ...extra,
    };
    setMessages(prev => [...prev, newMsg]);

    const preview = type === 'text' ? text : type === 'voice' ? 'Voice message' : type === 'image' ? 'Photo' : type === 'video' ? 'Video' : type === 'document' ? (extra?.mediaName || 'Document') : type === 'sticker' ? 'Sticker' : text;
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, lastMessageId: newMsg.id, lastMessagePreview: preview, lastMessageTimestamp: newMsg.timestamp }
        : c
    ));

    if (isSupabaseConfigured) (async () => {
      try {
        await supabase.from('app_messages').insert({
          id: newMsg.id,
          chat_id: chatId,
          sender_id: currentUserId,
          type,
          text: type === 'text' ? text : (extra?.text || null),
          media_url: extra?.mediaUrl || null,
          media_name: extra?.mediaName || null,
          duration: extra?.duration || null,
          timestamp: newMsg.timestamp,
          status: 'sent',
          sticker_url: extra?.stickerUrl || null,
        });
        await supabase.from('app_chats').update({
          last_message_id: newMsg.id,
          last_message_preview: preview,
          last_message_timestamp: newMsg.timestamp,
          updated_at: new Date().toISOString(),
        }).eq('id', chatId);
      } catch (err) {
        console.warn('Failed to save message to Supabase', err);
      }
    })();

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 800);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read', readAt: new Date().toISOString() } : m));
      if (!isSupabaseConfigured) return;
      (async () => {
        try {
          await supabase.from('app_messages').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', newMsg.id);
        } catch (err) {
          console.warn('Failed to update message status', err);
        }
      })();
    }, 2500);
  }, [currentUserId]);

  const editMessage = useCallback((messageId: string, newText: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, edited: true } : m));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        await supabase.from('app_messages').update({ text: newText, edited: true }).eq('id', messageId);
      } catch (err) {
        console.warn('Failed to edit message in Supabase', err);
      }
    })();
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted: true, text: undefined, mediaUrl: undefined } : m));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        await supabase.from('app_messages').update({ deleted: true, text: null, media_url: null }).eq('id', messageId);
      } catch (err) {
        console.warn('Failed to delete message in Supabase', err);
      }
    })();
  }, []);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji && r.userId === currentUserId);
      if (existing) {
        return { ...m, reactions: m.reactions.filter(r => !(r.emoji === emoji && r.userId === currentUserId)) };
      }
      return { ...m, reactions: [...m.reactions, { emoji, userId: currentUserId }] };
    }));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const { data: existing } = await supabase
          .from('app_message_reactions')
          .select('id')
          .eq('message_id', messageId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji)
          .maybeSingle();
        if (existing) {
          await supabase.from('app_message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', currentUserId)
            .eq('emoji', emoji);
        } else {
          await supabase.from('app_message_reactions').insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          });
        }
      } catch (err) {
        console.warn('Failed to toggle reaction in Supabase', err);
      }
    })();
  }, [currentUserId]);

  const togglePinChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isPinned: !c.isPinned } : c));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          await supabase.from('app_chats').update({ is_pinned: !chat.isPinned }).eq('id', chatId);
        }
      } catch (err) {
        console.warn('Failed to toggle pin in Supabase', err);
      }
    })();
  }, [chats]);

  const toggleMuteChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, isMuted: !c.isMuted } : c));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          await supabase.from('app_chats').update({ is_muted: !chat.isMuted }).eq('id', chatId);
        }
      } catch (err) {
        console.warn('Failed to toggle mute in Supabase', err);
      }
    })();
  }, [chats]);

  const markChatRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        await supabase.from('app_chats').update({ unread_count: 0 }).eq('id', chatId);
      } catch (err) {
        console.warn('Failed to mark chat read in Supabase', err);
      }
    })();
  }, []);

  const createChat = useCallback((chat: Partial<Chat>): string => {
    const id = generateId();
    const newChat: Chat = {
      id,
      type: chat.type || 'dm',
      name: chat.name || 'New Chat',
      avatar: chat.avatar || '',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      ...chat,
    };
    setChats(prev => [newChat, ...prev]);
    if (isSupabaseConfigured) (async () => {
      try {
        await supabase.from('app_chats').insert({
          id,
          type: newChat.type,
          name: newChat.name,
          avatar: newChat.avatar,
          description: newChat.description || null,
          member_count: newChat.memberCount || null,
          is_public: newChat.isPublic ?? false,
          unread_count: 0,
          is_pinned: false,
          is_muted: false,
          space_id: newChat.spaceId || null,
        });
      } catch (err) {
        console.warn('Failed to create chat in Supabase', err);
      }
    })();
    return id;
  }, []);

  const addMoment = useCallback((m: Omit<Moment, 'id' | 'timestamp' | 'viewedBy'>) => {
    const newMoment: Moment = { ...m, id: generateId(), timestamp: new Date().toISOString(), viewedBy: [] };
    setMoments(prev => [newMoment, ...prev]);
    if (isSupabaseConfigured) (async () => {
      try {
        await supabase.from('app_moments').insert({
          id: newMoment.id,
          user_id: m.userId,
          media_url: m.mediaUrl,
          caption: m.caption || null,
          timestamp: newMoment.timestamp,
          type: m.type,
        });
      } catch (err) {
        console.warn('Failed to add moment to Supabase', err);
      }
    })();
  }, []);

  const viewMoment = useCallback((momentId: string) => {
    setMoments(prev => prev.map(m =>
      m.id === momentId && !m.viewedBy.includes(currentUserId)
        ? { ...m, viewedBy: [...m.viewedBy, currentUserId] }
        : m
    ));
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        await supabase.from('app_moment_views').upsert({
          moment_id: momentId,
          user_id: currentUserId,
        });
      } catch (err) {
        console.warn('Failed to record moment view in Supabase', err);
      }
    })();
  }, [currentUserId]);

  const addChannelPost = useCallback((channelId: string, text: string, mediaUrl?: string) => {
    const newPost: ChannelPost = {
      id: generateId(),
      channelId,
      authorId: currentUserId,
      text,
      mediaUrl,
      timestamp: new Date().toISOString(),
      reactions: [],
      commentCount: 0,
      isPinned: false,
      views: 0,
      comments: [],
    };
    setChannelPosts(prev => [newPost, ...prev]);
    if (isSupabaseConfigured) (async () => {
      try {
        await supabase.from('app_channel_posts').insert({
          id: newPost.id,
          channel_id: channelId,
          author_id: currentUserId,
          text,
          media_url: mediaUrl || null,
          timestamp: newPost.timestamp,
        });
      } catch (err) {
        console.warn('Failed to save channel post to Supabase', err);
      }
    })();
  }, [currentUserId]);

  const togglePostReaction = useCallback((postId: string, emoji: string) => {
    setChannelPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const existing = p.reactions.find(r => r.emoji === emoji && r.userId === currentUserId);
      if (existing) {
        return { ...p, reactions: p.reactions.filter(r => !(r.emoji === emoji && r.userId === currentUserId)) };
      }
      return { ...p, reactions: [...p.reactions, { emoji, userId: currentUserId }] };
    }));
    if (isSupabaseConfigured) (async () => {
      try {
        const { data: existing } = await supabase
          .from('app_channel_post_reactions')
          .select('post_id')
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji)
          .maybeSingle();
        if (existing) {
          await supabase.from('app_channel_post_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUserId)
            .eq('emoji', emoji);
        } else {
          await supabase.from('app_channel_post_reactions').insert({
            post_id: postId,
            user_id: currentUserId,
            emoji,
          });
        }
      } catch (err) {
        console.warn('Failed to toggle post reaction in Supabase', err);
      }
    })();
  }, [currentUserId]);

  const addComment = useCallback((postId: string, text: string) => {
    const newComment: Comment = {
      id: generateId(),
      postId,
      authorId: currentUserId,
      text,
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    setChannelPosts(prev => prev.map(p => p.id === postId
      ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 }
      : p
    ));
    if (isSupabaseConfigured) (async () => {
      try {
        await supabase.from('app_channel_comments').insert({
          id: newComment.id,
          post_id: postId,
          author_id: currentUserId,
          text,
          timestamp: newComment.timestamp,
          reactions: '[]',
        });
      } catch (err) {
        console.warn('Failed to save comment to Supabase', err);
      }
    })();
  }, [currentUserId]);

  const togglePinPost = useCallback((postId: string) => {
    setChannelPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
    if (isSupabaseConfigured) (async () => {
      try {
        const post = channelPosts.find(p => p.id === postId);
        if (post) {
          await supabase.from('app_channel_posts').update({ is_pinned: !post.isPinned }).eq('id', postId);
        }
      } catch (err) {
        console.warn('Failed to toggle post pin in Supabase', err);
      }
    })();
  }, [channelPosts]);

  return (
    <AppContext.Provider value={{
      authStage, phoneNumber, email, currentUserId, currentUser,
      setAuthStage, setPhoneNumber, setEmail, completeProfile, signOut,
      activeTab, setActiveTab,
      users, chats, messages, moments, calls, notifications, channelPosts,
      settings, updateSettings,
      sendMessage, editMessage, deleteMessage, toggleReaction,
      togglePinChat, toggleMuteChat, markChatRead, createChat,
      addMoment, viewMoment,
      addChannelPost, togglePostReaction, addComment, togglePinPost,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export { getUserByIdFromSeed as getUserById };
