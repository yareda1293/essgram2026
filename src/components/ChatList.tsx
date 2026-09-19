import { useState, useMemo } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { MomentsBar } from '@/components/MomentsBar';
import { Search, Pin, VolumeX, Check, CheckCheck, MessageCircle, Radio, Users, ChevronRight } from 'lucide-react';
import type { Chat } from '@/types';
import { cn } from '@/lib/cn';
import { formatChatTimestamp } from '@/utils';

interface ChatListProps {
  onOpenChat: (chatId: string) => void;
  onOpenMoment: (userId: string, index: number) => void;
  onSearchFocus: () => void;
}

export function ChatList({ onOpenChat, onOpenMoment, onSearchFocus }: ChatListProps) {
  const { chats, currentUserId, markChatRead } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups' | 'channels'>('all');

  const sortedChats = useMemo(() => {
    let filtered = [...chats];

    if (filter === 'unread') filtered = filtered.filter(c => c.unreadCount > 0);
    if (filter === 'groups') filtered = filtered.filter(c => c.type === 'group');
    if (filter === 'channels') filtered = filtered.filter(c => c.type === 'channel');

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessagePreview?.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = new Date(a.lastMessageTimestamp || 0).getTime();
      const bTime = new Date(b.lastMessageTimestamp || 0).getTime();
      return bTime - aTime;
    });
  }, [chats, filter, search]);

  const handleChatClick = (chatId: string) => {
    markChatRead(chatId);
    onOpenChat(chatId);
  };

  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'unread' as const, label: 'Unread' },
    { key: 'groups' as const, label: 'Groups' },
    { key: 'channels' as const, label: 'Channels' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-20 px-4 pt-3 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold text-ink-50">Chats</h1>
          <button className="icon-btn">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={onSearchFocus}
            placeholder="Search chats, messages, people..."
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                filter === f.key
                  ? 'accent-bg text-white'
                  : 'bg-white/5 text-ink-300 hover:bg-white/10'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Moments bar */}
      <MomentsBar onOpenMoment={onOpenMoment} />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-ink-300" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No chats found</h3>
            <p className="text-sm text-ink-300">Try adjusting your search or filters.</p>
          </div>
        ) : (
          sortedChats.map(chat => (
            <ChatRow
              key={chat.id}
              chat={chat}
              currentUserId={currentUserId}
              onClick={() => handleChatClick(chat.id)}
            />
          ))
        )}
        <div className="h-24" />
      </div>
    </div>
  );
}

function ChatRow({ chat, currentUserId, onClick }: { chat: Chat; currentUserId: string; onClick: () => void }) {
  const otherUser = chat.type === 'dm' ? getUserById(chat.id.replace('c_', 'u_')) : null;
  const isOnline = otherUser?.isOnline ?? false;
  const isTyping = false; // could be dynamic

  const messageIcon = chat.type === 'channel' ? (
    <Radio className="w-3.5 h-3.5 text-ink-400 shrink-0" />
  ) : chat.type === 'group' ? (
    <Users className="w-3.5 h-3.5 text-ink-400 shrink-0" />
  ) : null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors active:bg-white/8 text-left"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          src={chat.avatar}
          name={chat.name}
          size={56}
          isOnline={isOnline && chat.type === 'dm'}
        />
        {chat.type === 'channel' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center border-2 border-ink-900">
            <Radio className="w-3 h-3 text-violet-400" />
          </div>
        )}
        {chat.type === 'group' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center border-2 border-ink-900">
            <Users className="w-3 h-3 text-coral-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-sm text-ink-50 truncate">{chat.name}</h3>
            {chat.type === 'channel' && chat.isPublic && (
              <span className="text-2xs text-ink-400 shrink-0">public</span>
            )}
          </div>
          <span className="text-2xs text-ink-400 shrink-0">
            {chat.lastMessageTimestamp ? formatChatTimestamp(chat.lastMessageTimestamp) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isTyping ? (
              <span className="text-sm text-violet-400 truncate">typing...</span>
            ) : (
              <>
                {messageIcon}
                <p className={cn(
                  'text-sm truncate',
                  chat.unreadCount > 0 ? 'text-ink-100 font-medium' : 'text-ink-300'
                )}>
                  {chat.lastMessagePreview || 'No messages yet'}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-ink-400" />}
            {chat.isPinned && <Pin className="w-3.5 h-3.5 text-ink-400 fill-ink-400" />}
            {chat.unreadCount > 0 ? (
              <span className={cn(
                'min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-2xs font-bold text-white',
                chat.isMuted ? 'bg-ink-400' : 'accent-bg'
              )}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}
