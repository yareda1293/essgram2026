import { useState } from 'react';
import { BottomSheet } from '@/components/Modal';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/store';
import {
  MessageCircle, Users, Radio, Camera, Sparkles,
  ArrowRight, Hash, Lock, Globe, Check,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface CreateSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenChat: (chatId: string) => void;
}

type CreateType = 'menu' | 'chat' | 'group' | 'channel' | 'moment' | 'space';

export function CreateSheet({ open, onClose, onOpenChat }: CreateSheetProps) {
  const { users, currentUser, createChat, addMoment } = useApp();
  const [type, setType] = useState<CreateType>('menu');

  // Forms
  const [groupName, setGroupName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [channelPublic, setChannelPublic] = useState(true);
  const [spaceName, setSpaceName] = useState('');
  const [spaceDesc, setSpaceDesc] = useState('');
  const [spacePublic, setSpacePublic] = useState(true);
  const [momentCaption, setMomentCaption] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const reset = () => {
    setType('menu');
    setGroupName('');
    setChannelName('');
    setChannelDesc('');
    setSpaceName('');
    setSpaceDesc('');
    setMomentCaption('');
    setSelectedUsers([]);
    setSearch('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const menuItems = [
    { type: 'chat' as const, icon: MessageCircle, label: 'New Chat', desc: 'Start a private conversation', gradient: 'from-violet-500 to-violet-600' },
    { type: 'group' as const, icon: Users, label: 'New Group', desc: 'Create a group with up to 200K members', gradient: 'from-coral-500 to-coral-600' },
    { type: 'channel' as const, icon: Radio, label: 'New Channel', desc: 'Broadcast to unlimited subscribers', gradient: 'from-pink-500 to-pink-600' },
    { type: 'moment' as const, icon: Camera, label: 'Post a Moment', desc: 'Share a photo visible for 24 hours', gradient: 'from-violet-500 to-pink-500' },
    { type: 'space' as const, icon: Sparkles, label: 'Create Ess Space', desc: 'A community hub with channel, group & events', gradient: 'from-violet-500 to-coral-500' },
  ];

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const filteredUsers = otherUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    const id = createChat({
      type: 'group',
      name: groupName,
      avatar: selectedUsers[0] ? users.find(u => u.id === selectedUsers[0])?.avatar : '',
      description: 'New group',
      memberCount: selectedUsers.length + 1,
      adminIds: [currentUser.id],
      moderatorIds: [],
    });
    handleClose();
    onOpenChat(id);
  };

  const handleCreateChannel = () => {
    if (!channelName.trim()) return;
    const id = createChat({
      type: 'channel',
      name: channelName,
      avatar: '',
      description: channelDesc,
      isPublic: channelPublic,
      subscriberCount: 1,
    });
    handleClose();
    onOpenChat(id);
  };

  const handleCreateSpace = () => {
    if (!spaceName.trim()) return;
    const channelId = createChat({
      type: 'channel',
      name: spaceName + ' Channel',
      avatar: '',
      description: spaceDesc,
      isPublic: spacePublic,
      subscriberCount: 1,
    });
    const groupId = createChat({
      type: 'group',
      name: spaceName + ' Discussion',
      avatar: '',
      description: spaceDesc,
      memberCount: 1,
      adminIds: [currentUser.id],
    });
    handleClose();
    onOpenChat(channelId);
  };

  const handleCreateMoment = () => {
    addMoment({
      userId: currentUser.id,
      mediaUrl: 'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: momentCaption,
      type: 'photo',
    });
    handleClose();
  };

  const handleStartChat = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const existingChatId = `c_${user.id.replace('u_', '')}`;
    handleClose();
    onOpenChat(existingChatId);
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={type === 'menu' ? 'Create' : undefined}>
      {/* ---- MENU ---- */}
      {type === 'menu' && (
        <div className="px-2 py-2 pb-6">
          {menuItems.map((item, i) => (
            <button
              key={item.type}
              onClick={() => setType(item.type)}
              className="w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl hover:bg-white/5 transition-colors text-left animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg', item.gradient)}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-ink-50">{item.label}</h3>
                <p className="text-xs text-ink-300 truncate">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-400" />
            </button>
          ))}
        </div>
      )}

      {/* ---- NEW CHAT ---- */}
      {type === 'chat' && (
        <div className="px-4 py-3 pb-6">
          <div className="relative mb-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="glass-input w-full px-4 py-2.5 text-sm"
              autoFocus
            />
          </div>
          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2 px-1">Suggested</p>
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => handleStartChat(user.id)}
              className="w-full flex items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <Avatar src={user.avatar} name={user.name} size={44} isOnline={user.isOnline} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-ink-50 truncate">{user.name}</h3>
                <p className="text-xs text-ink-300 truncate">{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ---- NEW GROUP ---- */}
      {type === 'group' && (
        <div className="px-4 py-3 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
              <Camera className="w-6 h-6 text-ink-300" />
            </div>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name"
              className="glass-input flex-1 px-4 py-3 text-sm"
              autoFocus
            />
          </div>

          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Add Members</p>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
              {selectedUsers.map(id => {
                const u = users.find(u => u.id === id);
                return u ? (
                  <button
                    key={id}
                    onClick={() => toggleUser(id)}
                    className="flex flex-col items-center gap-1 shrink-0"
                  >
                    <div className="relative">
                      <Avatar src={u.avatar} name={u.name} size={48} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 flex items-center justify-center border-2 border-ink-800">
                        <span className="text-white text-xs">✕</span>
                      </div>
                    </div>
                    <span className="text-2xs text-ink-200 max-w-[56px] truncate">{u.name.split(' ')[0]}</span>
                  </button>
                ) : null;
              })}
            </div>
          )}

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className="w-full flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <Avatar src={user.avatar} name={user.name} size={40} isOnline={user.isOnline} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-ink-50 truncate">{user.name}</h3>
                  <p className="text-xs text-ink-300 truncate">{user.username}</p>
                </div>
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center',
                  selectedUsers.includes(user.id)
                    ? 'accent-border accent-bg'
                    : 'border-ink-400'
                )}>
                  {selectedUsers.includes(user.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="btn-accent w-full mt-4 disabled:opacity-40"
          >
            Create Group {selectedUsers.length > 0 && `(${selectedUsers.length + 1})`}
          </button>
        </div>
      )}

      {/* ---- NEW CHANNEL ---- */}
      {type === 'channel' && (
        <div className="px-4 py-3 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full glass-card flex items-center justify-center">
              <Radio className="w-6 h-6 text-violet-400" />
            </div>
            <input
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              placeholder="Channel name"
              className="glass-input flex-1 px-4 py-3 text-sm"
              autoFocus
            />
          </div>

          <textarea
            value={channelDesc}
            onChange={e => setChannelDesc(e.target.value)}
            placeholder="Channel description (optional)"
            rows={3}
            maxLength={200}
            className="glass-input w-full px-4 py-3 text-sm resize-none mb-4"
          />

          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Channel Type</p>
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setChannelPublic(true)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                channelPublic ? 'accent-border bg-violet-600/10' : 'border-white/5 bg-white/5'
              )}
            >
              <Globe className="w-5 h-5 text-violet-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink-50">Public Channel</p>
                <p className="text-xs text-ink-300">Anyone can find and subscribe</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', channelPublic ? 'accent-border accent-bg' : 'border-ink-400')}>
                {channelPublic && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
            <button
              onClick={() => setChannelPublic(false)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                !channelPublic ? 'accent-border bg-violet-600/10' : 'border-white/5 bg-white/5'
              )}
            >
              <Lock className="w-5 h-5 text-coral-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink-50">Private Channel</p>
                <p className="text-xs text-ink-300">Only with invite link</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', !channelPublic ? 'accent-border accent-bg' : 'border-ink-400')}>
                {!channelPublic && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          </div>

          <button
            onClick={handleCreateChannel}
            disabled={!channelName.trim()}
            className="btn-accent w-full disabled:opacity-40"
          >
            Create Channel
          </button>
        </div>
      )}

      {/* ---- POST MOMENT ---- */}
      {type === 'moment' && (
        <div className="px-4 py-3 pb-6">
          <div className="relative rounded-2xl overflow-hidden mb-4">
            <img
              src="https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Moment"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={32} />
              <span className="text-xs font-medium text-white">{currentUser.name}</span>
            </div>
          </div>

          <input
            value={momentCaption}
            onChange={e => setMomentCaption(e.target.value)}
            placeholder="Add a caption..."
            maxLength={100}
            className="glass-input w-full px-4 py-3 text-sm mb-2"
          />
          <p className="text-2xs text-ink-400 mb-4">Visible for 24 hours · {momentCaption.length}/100</p>

          <button
            onClick={handleCreateMoment}
            className="btn-accent w-full"
          >
            Post Moment
          </button>
        </div>
      )}

      {/* ---- CREATE ESS SPACE ---- */}
      {type === 'space' && (
        <div className="px-4 py-3 pb-6">
          <div className="glass-card rounded-2xl p-4 mb-4 bg-gradient-violet-coral/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">Ess Space</span>
            </div>
            <p className="text-xs text-ink-300 leading-relaxed">
              An Ess Space is a complete community hub that includes a channel for broadcasts, a group for discussions, shared media, events, and member roles — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-violet-coral flex items-center justify-center shadow-glow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <input
              value={spaceName}
              onChange={e => setSpaceName(e.target.value)}
              placeholder="Space name"
              className="glass-input flex-1 px-4 py-3 text-sm"
              autoFocus
            />
          </div>

          <textarea
            value={spaceDesc}
            onChange={e => setSpaceDesc(e.target.value)}
            placeholder="Describe your community..."
            rows={3}
            maxLength={200}
            className="glass-input w-full px-4 py-3 text-sm resize-none mb-4"
          />

          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Visibility</p>
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setSpacePublic(true)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                spacePublic ? 'accent-border bg-violet-600/10' : 'border-white/5 bg-white/5'
              )}
            >
              <Globe className="w-5 h-5 text-violet-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink-50">Public Space</p>
                <p className="text-xs text-ink-300">Discoverable in search</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', spacePublic ? 'accent-border accent-bg' : 'border-ink-400')}>
                {spacePublic && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
            <button
              onClick={() => setSpacePublic(false)}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all',
                !spacePublic ? 'accent-border bg-violet-600/10' : 'border-white/5 bg-white/5'
              )}
            >
              <Lock className="w-5 h-5 text-coral-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink-50">Private Space</p>
                <p className="text-xs text-ink-300">Invite only</p>
              </div>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', !spacePublic ? 'accent-border accent-bg' : 'border-ink-400')}>
                {!spacePublic && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          </div>

          <button
            onClick={handleCreateSpace}
            disabled={!spaceName.trim()}
            className="btn-accent w-full disabled:opacity-40"
          >
            Create Ess Space
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
