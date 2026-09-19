import { useState } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { seedSpaces } from '@/data';
import {
  ArrowLeft, Radio, Users, Calendar, ImageIcon, Crown,
  MoreVertical, Bell, Share2, ChevronRight, MapPin, Check, Clock,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeTime, formatCount } from '@/utils';

type SpaceTab = 'channel' | 'group' | 'media' | 'events' | 'members';

export function SpaceView({ spaceId, onBack, onOpenChat }: { spaceId: string; onBack: () => void; onOpenChat: (chatId: string) => void }) {
  const { chats } = useApp();
  const space = seedSpaces.find(s => s.id === spaceId);
  const [tab, setTab] = useState<SpaceTab>('channel');

  if (!space) return null;

  const channelChat = chats.find(c => c.id === space.channelId);
  const groupChat = chats.find(c => c.id === space.groupId);

  const tabs: { key: SpaceTab; label: string; icon: typeof Radio }[] = [
    { key: 'channel', label: 'Channel', icon: Radio },
    { key: 'group', label: 'Group', icon: Users },
    { key: 'media', label: 'Media', icon: ImageIcon },
    { key: 'events', label: 'Events', icon: Calendar },
    { key: 'members', label: 'Roles', icon: Crown },
  ];

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Cover */}
      <div className="relative h-40 shrink-0">
        <img src={space.coverUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-ink-900" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-1">
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
              <Bell className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Space info */}
      <div className="px-4 pb-3 -mt-10 relative z-10">
        <div className="flex items-end gap-3 mb-3">
          <div className="rounded-2xl overflow-hidden border-3 border-ink-900 shadow-float">
            <Avatar src={space.avatar} name={space.name} size={72} />
          </div>
          <div className="flex-1 mb-1">
            <h2 className="font-display text-lg font-bold text-ink-50">{space.name}</h2>
            <p className="text-xs text-ink-300">{formatCount(space.memberCount)} members · Ess Space</p>
          </div>
        </div>
        <p className="text-sm text-ink-200 leading-relaxed mb-3">{space.description}</p>
        <button className="btn-accent w-full">
          Join Space
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors',
              tab === t.key
                ? 'border-violet-500 text-ink-50'
                : 'border-transparent text-ink-300 hover:text-ink-100'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'channel' && (
          <div className="px-4 py-3">
            <button
              onClick={() => channelChat && onOpenChat(channelChat.id)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-white/15 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <Radio className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-50">{channelChat?.name}</p>
                <p className="text-xs text-ink-300">{formatCount(channelChat?.subscriberCount || 0)} subscribers</p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-400" />
            </button>
          </div>
        )}

        {tab === 'group' && (
          <div className="px-4 py-3">
            <button
              onClick={() => groupChat && onOpenChat(groupChat.id)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-white/15 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-coral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-50">{groupChat?.name}</p>
                <p className="text-xs text-ink-300">{groupChat?.memberCount} members</p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-400" />
            </button>
          </div>
        )}

        {tab === 'media' && (
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Shared Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
                'https://images.pexels.com/photos/1966448/pexels-photo-1966448.jpeg?auto=compress&cs=tinysrgb&w=200',
                'https://images.pexels.com/photos/13450828/pexels-photo-13450828.jpeg?auto=compress&cs=tinysrgb&w=200',
                'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=200',
                'https://images.pexels.com/photos/317356/pexels-photo-317356.jpeg?auto=compress&cs=tinysrgb&w=200',
                'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=200',
              ].map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden glass-card">
                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="px-4 py-3 space-y-3">
            {space.events.map(event => {
              const goingCount = event.going.length;
              const maybeCount = event.maybe.length;
              const eventDate = new Date(event.date);
              return (
                <div key={event.id} className="glass-card rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-14 rounded-xl bg-gradient-violet-coral flex flex-col items-center justify-center shrink-0">
                      <span className="text-2xs text-white/70 uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="font-display text-lg font-bold text-white">{eventDate.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-ink-50 mb-0.5">{event.title}</h4>
                      <div className="flex items-center gap-1 text-2xs text-ink-300 mb-1">
                        <Clock className="w-3 h-3" />
                        {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1 text-2xs text-ink-300">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed mb-3">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2 rounded-xl text-xs font-semibold accent-bg text-white flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                      <Check className="w-3.5 h-3.5" /> Going ({goingCount})
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/5 text-ink-100 hover:bg-white/10 transition-colors">
                      Maybe ({maybeCount})
                    </button>
                  </div>
                </div>
              );
            })}
            {space.events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-8 h-8 text-ink-400 mb-2" />
                <p className="text-sm text-ink-300">No upcoming events.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'members' && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Member Roles</p>
            {space.roles.map(role => (
              <div key={role.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${role.color}20` }}
                >
                  <Crown className="w-5 h-5" style={{ color: role.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-50">{role.name}</p>
                    <span
                      className="text-2xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${role.color}20`, color: role.color }}
                    >
                      {role.permissions.length} permissions
                    </span>
                  </div>
                  <p className="text-xs text-ink-300 mt-0.5">
                    {role.permissions.join(', ')}
                  </p>
                </div>
              </div>
            ))}

            <div className="h-3" />
            <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Members</p>
            {['u_james', 'u_sofia', 'u_omar', 'u_priya'].map(uid => {
              const u = getUserById(uid);
              if (!u) return null;
              const role = uid === 'u_james' ? space.roles[0] : uid === 'u_sofia' ? space.roles[1] : uid === 'u_omar' ? space.roles[2] : space.roles[3];
              return (
                <div key={uid} className="flex items-center gap-3 py-2">
                  <Avatar src={u.avatar} name={u.name} size={40} isOnline={u.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-50 truncate">{u.name}</p>
                    <p className="text-xs text-ink-300 truncate">{u.username}</p>
                  </div>
                  <span
                    className="text-2xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${role.color}20`, color: role.color }}
                  >
                    {role.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-24" />
      </div>
    </div>
  );
}
