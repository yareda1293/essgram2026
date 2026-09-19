import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Search, Radio, Users, Sparkles, BadgeCheck, TrendingUp, Hash, X } from 'lucide-react';
import { discoverChannels, discoverGroups, discoverCreators } from '@/data';
import { cn } from '@/lib/cn';
import { formatCount } from '@/utils';

type DiscoverTab = 'channels' | 'groups' | 'creators';

export function DiscoverPage({ onOpenChannel }: { onOpenChannel?: (chatId: string) => void }) {
  const [tab, setTab] = useState<DiscoverTab>('channels');
  const [search, setSearch] = useState('');

  const tabs = [
    { key: 'channels' as const, label: 'Channels', icon: Radio },
    { key: 'groups' as const, label: 'Groups', icon: Users },
    { key: 'creators' as const, label: 'Creators', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-20 px-4 pt-3 pb-3 border-b border-white/5">
        <h1 className="font-display text-2xl font-bold text-ink-50 mb-3">Discover</h1>

        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search channels, groups, people..."
            className="glass-input w-full pl-10 pr-10 py-2.5 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                tab === t.key
                  ? 'accent-bg text-white'
                  : 'bg-white/5 text-ink-300 hover:bg-white/10'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'channels' && (
          <DiscoverChannels search={search} onOpenChannel={onOpenChannel} />
        )}
        {tab === 'groups' && (
          <DiscoverGroups search={search} />
        )}
        {tab === 'creators' && (
          <DiscoverCreators search={search} />
        )}
        <div className="h-24" />
      </div>
    </div>
  );
}

function DiscoverChannels({ search, onOpenChannel }: { search: string; onOpenChannel?: (id: string) => void }) {
  const filtered = discoverChannels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Featured banner */}
      {!search && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-violet-coral p-5 shadow-glow">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">Trending</span>
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-1">Lo-Fi Beats</h2>
              <p className="text-sm text-white/80 mb-3">234K subscribers · Daily lo-fi mixes</p>
              <button className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-semibold text-white hover:bg-white/30 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3">
        <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Popular Channels</h3>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
            <Radio className="w-7 h-7 text-ink-300" />
          </div>
          <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No channels found</h3>
          <p className="text-sm text-ink-300">Try a different search term.</p>
        </div>
      ) : (
        filtered.map(channel => (
          <div key={channel.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
            <div className="relative">
              <Avatar src={channel.avatar} name={channel.name} size={52} />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ink-700 flex items-center justify-center border-2 border-ink-900">
                <Radio className="w-3 h-3 text-violet-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-ink-50 truncate">{channel.name}</h3>
                {channel.isVerified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />}
              </div>
              <p className="text-xs text-ink-300 truncate">{channel.description}</p>
              <p className="text-2xs text-violet-400 mt-0.5">{formatCount(channel.subscribers)} subscribers</p>
            </div>
            <button
              onClick={(event) => {
                event.currentTarget.textContent = 'Joined';
                event.currentTarget.classList.remove('accent-bg', 'text-white');
                event.currentTarget.classList.add('bg-success-500/20', 'text-success-400');
                event.currentTarget.disabled = true;
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold accent-bg text-white active:scale-95 transition-transform"
            >
              Join
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function DiscoverGroups({ search }: { search: string }) {
  const filtered = discoverGroups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in px-4 pt-4 space-y-3">
      <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-2">Active Groups</h3>
      {filtered.map(group => (
        <div key={group.id} className="glass-card p-4 rounded-2xl hover:border-white/15 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={group.avatar} name={group.name} size={48} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-ink-50 truncate">{group.name}</h3>
              <p className="text-2xs text-ink-300">{formatCount(group.members)} members</p>
            </div>
            <button
              onClick={(event) => {
                event.currentTarget.textContent = 'Joined';
                event.currentTarget.classList.remove('bg-white/5', 'text-ink-100', 'hover:bg-white/10');
                event.currentTarget.classList.add('bg-success-500/20', 'text-success-400');
                event.currentTarget.disabled = true;
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-ink-100 hover:bg-white/10 transition-colors active:scale-95"
            >
              Join
            </button>
          </div>
          <p className="text-xs text-ink-300 leading-relaxed">{group.description}</p>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-ink-300" />
          </div>
          <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No groups found</h3>
          <p className="text-sm text-ink-300">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

function DiscoverCreators({ search }: { search: string }) {
  const filtered = discoverCreators.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Featured Creators</h3>
      </div>
      {filtered.map(creator => (
        <div key={creator.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
          <Avatar src={creator.avatar} name={creator.name} size={52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-ink-50 truncate">{creator.name}</h3>
              {creator.isVerified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />}
            </div>
            <p className="text-xs text-ink-300 truncate">{creator.username}</p>
            <p className="text-2xs text-ink-400 mt-0.5">{formatCount(creator.followers)} followers</p>
          </div>
          <button
            onClick={(event) => {
              event.currentTarget.textContent = 'Following';
              event.currentTarget.classList.remove('accent-bg', 'text-white');
              event.currentTarget.classList.add('bg-success-500/20', 'text-success-400');
              event.currentTarget.disabled = true;
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold accent-bg text-white active:scale-95 transition-transform"
          >
            Follow
          </button>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-ink-300" />
          </div>
          <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No creators found</h3>
          <p className="text-sm text-ink-300">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
