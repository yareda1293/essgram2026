export type ID = string;

export interface User {
  id: ID;
  name: string;
  username: string;
  phone: string;
  avatar: string;
  bio: string;
  status?: string;
  isOnline: boolean;
  lastSeen?: string;
  isVerified?: boolean;
}

export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'document' | 'sticker';

export interface Reaction {
  emoji: string;
  userId: ID;
}

export interface Message {
  id: ID;
  chatId: ID;
  senderId: ID;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  mediaName?: string;
  duration?: number; // seconds for voice
  timestamp: string; // ISO
  status: 'sent' | 'delivered' | 'read';
  readAt?: string; // ISO timestamp when the message was seen
  reactions: Reaction[];
  replyTo?: ID;
  edited?: boolean;
  deleted?: boolean;
  forwardedFrom?: string;
  stickerUrl?: string;
}

export type ChatType = 'dm' | 'group' | 'channel';

export interface Chat {
  id: ID;
  type: ChatType;
  name: string;
  avatar: string;
  description?: string;
  members?: User[];
  adminIds?: ID[];
  moderatorIds?: ID[];
  memberCount?: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  lastMessageId?: ID;
  lastMessagePreview?: string;
  lastMessageTimestamp?: string;
  // Channel-specific
  isPublic?: boolean;
  subscriberCount?: number;
  // Ess Space link
  spaceId?: ID;
}

export interface ChannelPost {
  id: ID;
  channelId: ID;
  authorId: ID;
  text: string;
  mediaUrl?: string;
  timestamp: string;
  reactions: Reaction[];
  commentCount: number;
  isPinned: boolean;
  views: number;
  comments: Comment[];
}

export interface Comment {
  id: ID;
  postId: ID;
  authorId: ID;
  text: string;
  timestamp: string;
  reactions: Reaction[];
}

export interface Moment {
  id: ID;
  userId: ID;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  viewedBy: ID[];
  type: 'photo' | 'video';
}

export interface Call {
  id: ID;
  userId: ID;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: number; // seconds
}

export interface Poll {
  id: ID;
  question: string;
  options: { id: ID; text: string; votes: ID[] }[];
  isMulti: boolean;
  isClosed: boolean;
}

export interface EventItem {
  id: ID;
  title: string;
  description: string;
  date: string;
  location: string;
  going: ID[];
  maybe: ID[];
}

export interface EssSpace {
  id: ID;
  name: string;
  description: string;
  avatar: string;
  coverUrl: string;
  memberCount: number;
  roles: { id: ID; name: string; color: string; permissions: string[] }[];
  channelId: ID;
  groupId: ID;
  events: EventItem[];
  isPublic: boolean;
}

export type TabKey = 'chats' | 'discover' | 'create' | 'calls' | 'profile';

export interface AppSettings {
  accentColor: string;
  darkMode: boolean;
  notifications: boolean;
  showPhoneNumber: boolean;
  usernameVisible: boolean;
  profilePhotoVisible: boolean;
  lastSeenVisible: boolean;
  readReceipts: boolean;
  twoStepVerification: boolean;
  blockedUsers: ID[];
}

export interface Notification {
  id: ID;
  type: 'message' | 'call' | 'mention' | 'reaction' | 'system';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}
