import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { TypingDots, EmptyState } from '@/components/ui';
import { ConfirmDialog } from '@/components/Modal';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip,
  Smile, Mic, Check, CheckCheck, Reply, Forward, Edit2, Trash2,
  Copy, Pin, Image as ImageIcon, File, Play, Pause, Sticker,
  Search, Users, Radio, MessageCircle,
} from 'lucide-react';
import type { Message } from '@/types';
import { cn } from '@/lib/cn';
import { formatTime, formatDateSeparator, formatDuration } from '@/utils';

interface ChatViewProps {
  chatId: string;
  onBack: () => void;
  onCall: (type: 'voice' | 'video') => void;
}

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👍', '😮', '😢', '🎉', '👏'];

export function ChatView({ chatId, onBack, onCall }: ChatViewProps) {
  const { chats, messages, currentUserId, sendMessage, toggleReaction, editMessage, deleteMessage, togglePinChat, toggleMuteChat } = useApp();
  const chat = chats.find(c => c.id === chatId);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatMessages = useMemo(() => {
    let msgs = messages.filter(m => m.chatId === chatId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      msgs = msgs.filter(m => m.text?.toLowerCase().includes(q));
    }
    return msgs;
  }, [messages, chatId, searchQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  // Simulate typing indicator for DMs
  useEffect(() => {
    if (chat?.type !== 'dm') return;
    const lastMsg = messages.find(m => m.chatId === chatId && m.senderId === currentUserId);
    if (lastMsg && Date.now() - new Date(lastMsg.timestamp).getTime() < 10000) {
      const t1 = setTimeout(() => setIsTyping(true), 1500);
      const t2 = setTimeout(() => setIsTyping(false), 4500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [messages, chatId, chat?.type, currentUserId]);

  if (!chat) return null;

  const otherUser = chat.type === 'dm' ? getUserById(chat.id.replace('c_', 'u_')) : null;

  const handleSend = () => {
    if (!text.trim() || editingId) return;
    sendMessage(chatId, text.trim());
    setText('');
    setReplyTo(null);
  };

  const handleEdit = () => {
    if (!editingId || !text.trim()) return;
    editMessage(editingId, text.trim());
    setEditingId(null);
    setText('');
  };

  const handleStartEdit = (msg: Message) => {
    setEditingId(msg.id);
    setText(msg.text || '');
    setActionMessage(null);
    inputRef.current?.focus();
  };

  const handleAttach = (type: Message['type']) => {
    setShowAttach(false);
    if (type === 'image') {
      sendMessage(chatId, '', 'image', {
        mediaUrl: 'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=400',
        text: '',
      });
    } else if (type === 'document') {
      sendMessage(chatId, 'project-brief.pdf', 'document', {
        mediaName: 'project-brief.pdf',
        mediaUrl: '#',
        text: '',
      });
    } else if (type === 'sticker') {
      sendMessage(chatId, '', 'sticker', {
        stickerUrl: '🌟',
        text: '',
      });
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    chatMessages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [chatMessages]);

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Header */}
      <div className="glass-strong px-3 py-2.5 border-b border-white/5 flex items-center gap-2 z-10">
        <button onClick={onBack} className="icon-btn shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
          <Avatar
            src={chat.avatar}
            name={chat.name}
            size={40}
            isOnline={otherUser?.isOnline && chat.type === 'dm'}
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-ink-50 truncate">{chat.name}</h2>
            {isTyping ? (
              <span className="text-xs text-violet-400 flex items-center gap-1">
                typing <TypingDots size={4} />
              </span>
            ) : chat.type === 'dm' ? (
              <span className="text-xs text-ink-300">
                {otherUser?.isOnline ? 'online' : otherUser?.lastSeen ? `last seen ${otherUser.lastSeen}` : 'offline'}
              </span>
            ) : chat.type === 'channel' ? (
              <span className="text-xs text-ink-300">
                {chat.subscriberCount?.toLocaleString()} subscribers
              </span>
            ) : (
              <span className="text-xs text-ink-300">
                {chat.memberCount} members
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          {chat.type === 'dm' && (
            <>
              <button onClick={() => onCall('voice')} className="icon-btn">
                <Phone className="w-5 h-5" />
              </button>
              <button onClick={() => onCall('video')} className="icon-btn">
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={() => setShowSearch(!showSearch)} className="icon-btn">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="icon-btn">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full right-3 mt-1 glass-strong rounded-xl shadow-float py-1.5 z-30 min-w-[180px] animate-scale-in">
              <button onClick={() => { togglePinChat(chatId); setShowMenu(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                <Pin className="w-4 h-4" /> {chat.isPinned ? 'Unpin chat' : 'Pin chat'}
              </button>
              <button onClick={() => { toggleMuteChat(chatId); setShowMenu(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                {chat.isMuted ? 'Unmute' : 'Mute'} notifications
              </button>
              {chat.type === 'group' && (
                <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink-100 hover:bg-white/5 transition-colors">
                  <Users className="w-4 h-4" /> View members
                </button>
              )}
              <div className="border-t border-white/5 my-1" />
              <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-error-400 hover:bg-white/5 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete chat
              </button>
            </div>
          </>
        )}
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-white/5 glass animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in conversation..."
              className="glass-input w-full pl-9 pr-4 py-2 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {chatMessages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-8 h-8" />}
            title="No messages yet"
            subtitle="Say hello and start the conversation."
          />
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              <div className="flex justify-center mb-3">
                <span className="text-2xs text-ink-400 bg-white/5 px-3 py-1 rounded-full">
                  {formatDateSeparator(group.messages[0].timestamp)}
                </span>
              </div>
              {group.messages.map((msg, mi) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.senderId === currentUserId}
                  currentUserId={currentUserId}
                  showAvatar={chat.type === 'group' && msg.senderId !== currentUserId && (mi === 0 || group.messages[mi - 1].senderId !== msg.senderId)}
                  showSender={chat.type === 'group' && msg.senderId !== currentUserId && (mi === 0 || group.messages[mi - 1].senderId !== msg.senderId)}
                  isGrouped={mi > 0 && group.messages[mi - 1].senderId === msg.senderId}
                  onReply={() => { setReplyTo(msg); setActionMessage(null); inputRef.current?.focus(); }}
                  onForward={() => setActionMessage(null)}
                  onEdit={() => handleStartEdit(msg)}
                  onDelete={() => { setActionMessage(msg); setConfirmDelete(true); }}
                  onReact={(emoji) => { toggleReaction(msg.id, emoji); setActionMessage(null); }}
                  onAction={() => setActionMessage(msg)}
                />
              ))}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
              <TypingDots size={6} />
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-3 py-2 border-t border-white/5 glass flex items-center gap-2 animate-slide-in-up">
          <Reply className="w-4 h-4 text-violet-400 shrink-0" />
          <div className="flex-1 min-w-0 border-l-2 border-violet-500 pl-2">
            <p className="text-xs font-semibold text-violet-400">
              Replying to {getUserById(replyTo.senderId)?.name || 'Unknown'}
            </p>
            <p className="text-xs text-ink-300 truncate">{replyTo.text || replyTo.mediaName || 'Media'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="icon-btn">
            <span className="text-ink-300 text-lg">✕</span>
          </button>
        </div>
      )}

      {/* Editing indicator */}
      {editingId && (
        <div className="px-3 py-2 border-t border-white/5 glass flex items-center gap-2 animate-slide-in-up">
          <Edit2 className="w-4 h-4 text-coral-400 shrink-0" />
          <p className="text-xs text-ink-300 flex-1">Editing message</p>
          <button onClick={() => { setEditingId(null); setText(''); }} className="text-xs text-ink-300">
            Cancel
          </button>
        </div>
      )}

      {/* Attachment panel */}
      {showAttach && (
        <div className="px-4 py-3 border-t border-white/5 glass animate-slide-in-up">
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => handleAttach('image')} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center group-hover:bg-violet-600/30 transition-colors">
                <ImageIcon className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-2xs text-ink-300">Photo</span>
            </button>
            <button onClick={() => handleAttach('document')} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-coral-500/20 flex items-center justify-center group-hover:bg-coral-500/30 transition-colors">
                <File className="w-5 h-5 text-coral-400" />
              </div>
              <span className="text-2xs text-ink-300">Document</span>
            </button>
            <button onClick={() => handleAttach('sticker')} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                <Sticker className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-2xs text-ink-300">Sticker</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl bg-success-500/20 flex items-center justify-center group-hover:bg-success-500/30 transition-colors">
                <Mic className="w-5 h-5 text-success-400" />
              </div>
              <span className="text-2xs text-ink-300">Audio</span>
            </button>
          </div>
        </div>
      )}

      {/* Emoji panel */}
      {showEmojis && (
        <div className="px-4 py-3 border-t border-white/5 glass animate-slide-in-up">
          <div className="grid grid-cols-8 gap-1">
            {'😀 😂 ❤️ 🔥 👍 👎 🎉 😮 😢 🤔 👏 🙌 ✨ 💯 🎯 🚀 ⭐ 💪 🤝 😎 🥳 😴 🍕 ☕ 🌟 💜 🩷 🧡'.split(' ').map((emoji, i) => (
              <button
                key={i}
                onClick={() => { setText(prev => prev + emoji); setShowEmojis(false); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-white/5 glass-strong safe-bottom">
        <div className="flex items-end gap-2">
          <button onClick={() => { setShowAttach(!showAttach); setShowEmojis(false); }} className="icon-btn shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 glass-input flex items-end px-3 py-2 min-h-[40px]">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  editingId ? handleEdit() : handleSend();
                }
              }}
              placeholder={editingId ? 'Edit message...' : 'Message...'}
              rows={1}
              className="flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-300 outline-none resize-none max-h-24"
              style={{ height: 'auto' }}
            />
            <button onClick={() => { setShowEmojis(!showEmojis); setShowAttach(false); }} className="shrink-0 ml-1 pb-0.5">
              <Smile className="w-5 h-5 text-ink-300 hover:text-violet-400 transition-colors" />
            </button>
          </div>

          {text.trim() ? (
            <button
              onClick={editingId ? handleEdit : handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-glow"
              style={{ background: 'rgb(var(--accent-rgb))' }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/5 transition-all active:scale-90">
              <Mic className="w-5 h-5 text-ink-200" />
            </button>
          )}
        </div>
      </div>

      {/* Message action sheet */}
      {actionMessage && !confirmDelete && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActionMessage(null)} />
          <div className="absolute bottom-0 left-0 right-0 glass-strong rounded-t-3xl p-4 z-50 animate-slide-in-up safe-bottom">
            {/* Quick reactions */}
            <div className="flex justify-center gap-2 mb-4 pb-4 border-b border-white/5">
              {QUICK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(actionMessage.id, emoji)}
                  className="w-11 h-11 rounded-full glass-card flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <button onClick={() => { setReplyTo(actionMessage); setActionMessage(null); inputRef.current?.focus(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
              <Reply className="w-5 h-5 text-ink-300" />
                <span className="text-sm text-ink-100">Reply</span>
              </button>
              <button onClick={() => setActionMessage(null)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                <Forward className="w-5 h-5 text-ink-300" />
                <span className="text-sm text-ink-100">Forward</span>
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(actionMessage.text || ''); setActionMessage(null); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                <Copy className="w-5 h-5 text-ink-300" />
                <span className="text-sm text-ink-100">Copy</span>
              </button>
              <button onClick={() => { togglePinChat(chatId); setActionMessage(null); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                <Pin className="w-5 h-5 text-ink-300" />
                <span className="text-sm text-ink-100">Pin message</span>
              </button>
              {actionMessage.senderId === currentUserId && actionMessage.type === 'text' && (
                <button onClick={() => handleStartEdit(actionMessage)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <Edit2 className="w-5 h-5 text-ink-300" />
                  <span className="text-sm text-ink-100">Edit</span>
                </button>
              )}
              {actionMessage.senderId === currentUserId && (
                <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <Trash2 className="w-5 h-5 text-error-400" />
                  <span className="text-sm text-error-400">Delete</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete message?"
        message="This message will be deleted for everyone in this chat."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (actionMessage) deleteMessage(actionMessage.id);
          setConfirmDelete(false);
          setActionMessage(null);
        }}
        onCancel={() => { setConfirmDelete(false); setActionMessage(null); }}
      />
    </div>
  );
}

function MessageBubble({
  msg, isOwn, currentUserId, showAvatar, showSender, isGrouped, onReply, onForward, onEdit, onDelete, onReact, onAction,
}: {
  msg: Message;
  isOwn: boolean;
  currentUserId: string;
  showAvatar: boolean;
  showSender: boolean;
  isGrouped: boolean;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  onAction: () => void;
}) {
  const sender = getUserById(msg.senderId);
  const [showReactions, setShowReactions] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);

  // Group reactions by emoji
  const groupedReactions = msg.reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, typeof msg.reactions>);

  if (msg.deleted) {
    return (
      <div className={cn('flex mb-1', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'px-3 py-2 rounded-2xl text-xs italic text-ink-400',
          isOwn ? 'bg-violet-600/10 rounded-br-md' : 'bg-white/5 rounded-bl-md'
        )}>
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex mb-1 items-end gap-2', isOwn ? 'justify-end' : 'justify-start', isGrouped && 'mt-0.5')}>
      {/* Avatar for group */}
      {!isOwn && showAvatar && (
        <Avatar src={sender?.avatar} name={sender?.name || '?'} size={28} className="mb-0.5" />
      )}
      {!isOwn && !showAvatar && <div className="w-7 shrink-0" />}

      <div className={cn('max-w-[75%] relative group', isOwn ? 'items-end' : 'items-start')}>
        {showSender && (
          <p className="text-2xs font-semibold text-violet-400 mb-0.5 ml-1">
            {sender?.name}
          </p>
        )}

        <div
          onClick={onAction}
          className={cn(
            'px-3.5 py-2 rounded-2xl cursor-pointer transition-all active:scale-[0.98]',
            isOwn
              ? 'bg-gradient-violet-pink text-white rounded-br-md'
              : 'glass-card text-ink-50 rounded-bl-md',
            isGrouped && (isOwn ? 'rounded-br-2xl' : 'rounded-bl-2xl'),
            msg.type === 'image' && 'p-1',
            msg.type === 'sticker' && 'bg-transparent p-0'
          )}
        >
          {/* Reply reference */}
          {msg.replyTo && (
            <div className={cn(
              'mb-1.5 px-2 py-1 rounded-lg text-xs border-l-2',
              isOwn ? 'bg-white/10 border-white/50' : 'bg-violet-500/10 border-violet-500'
            )}>
              <p className="font-semibold text-2xs opacity-80">
                {getUserById(messages_findSender(msg.replyTo) || '')?.name || 'Reply'}
              </p>
              <p className="opacity-60 truncate">Replied message</p>
            </div>
          )}

          {/* Forwarded label */}
          {msg.forwardedFrom && (
            <p className="text-2xs italic opacity-60 mb-1">
              Forwarded from {msg.forwardedFrom}
            </p>
          )}

          {/* Text */}
          {msg.type === 'text' && msg.text && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
          )}

          {/* Sticker */}
          {msg.type === 'sticker' && (
            <div className="text-6xl py-1">{msg.stickerUrl}</div>
          )}

          {/* Image */}
          {msg.type === 'image' && msg.mediaUrl && (
            <div className="relative">
              <img src={msg.mediaUrl} alt="Shared" className="rounded-xl max-w-full max-h-60 object-cover" loading="lazy" />
              {msg.text && <p className="text-xs mt-1 px-2 pb-1">{msg.text}</p>}
            </div>
          )}

          {/* Video */}
          {msg.type === 'video' && msg.mediaUrl && (
            <div className="relative">
              <img src={msg.mediaUrl} alt="Video" className="rounded-xl max-w-full max-h-60 object-cover" loading="lazy" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </div>
              {msg.text && <p className="text-xs mt-1 px-2 pb-1">{msg.text}</p>}
            </div>
          )}

          {/* Voice note */}
          {msg.type === 'voice' && (
            <div className="flex items-center gap-2 min-w-[160px] py-1">
              <button
                onClick={(e) => { e.stopPropagation(); setPlayingVoice(!playingVoice); }}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(124,92,255,0.3)' }}
              >
                {playingVoice ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-0.5 h-6">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full opacity-60"
                      style={{
                        height: `${Math.random() * 16 + 4}px`,
                        background: isOwn ? 'white' : 'rgb(var(--accent-rgb))',
                      }}
                    />
                  ))}
                </div>
                <p className="text-2xs opacity-60 mt-0.5">{formatDuration(msg.duration || 0)}</p>
              </div>
            </div>
          )}

          {/* Document */}
          {msg.type === 'document' && (
            <div className="flex items-center gap-2.5 min-w-[180px] py-1">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                isOwn ? 'bg-white/20' : 'bg-coral-500/20'
              )}>
                <File className={cn('w-5 h-5', isOwn ? 'text-white' : 'text-coral-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{msg.mediaName}</p>
                <p className="text-2xs opacity-60">PDF · 2.4 MB</p>
              </div>
            </div>
          )}

          {/* Timestamp + status */}
          <div className={cn(
            'flex items-center gap-1 mt-0.5',
            isOwn ? 'justify-end' : 'justify-start',
            msg.type === 'image' && msg.text ? 'px-2 pb-1' : '',
            msg.type === 'image' && !msg.text ? 'px-2 pb-1' : ''
          )}>
            {msg.edited && <span className="text-2xs opacity-50">edited</span>}
            <span className="text-2xs opacity-50">{formatTime(msg.timestamp)}</span>
            {isOwn && (
              msg.status === 'read' ? (
                <span className="flex items-center gap-0.5 text-sky-400">
                  <CheckCheck className="w-3 h-3" />
                  {msg.readAt && <span className="text-2xs">Seen {formatTime(msg.readAt)}</span>}
                </span>
              ) : msg.status === 'delivered' ? (
                <CheckCheck className="w-3 h-3 opacity-50" />
              ) : (
                <Check className="w-3 h-3 opacity-50" />
              )
            )}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn('flex gap-1 mt-0.5 flex-wrap', isOwn ? 'justify-end' : 'justify-start')}>
            {Object.entries(groupedReactions).map(([emoji, reactors]) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 transition-all active:scale-90',
                  reactors.some(r => r.userId === currentUserId)
                    ? 'bg-violet-600/30 border border-violet-500/50'
                    : 'glass-card'
                )}
              >
                <span>{emoji}</span>
                <span className="text-2xs text-ink-200">{reactors.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to find sender of a replied message
function messages_findSender(msgId: string): string | undefined {
  // This is a fallback - in production we'd look up the actual message
  return undefined;
}
