import { useApp } from '@/store';
import { MessagesSquare, Compass, Plus, PhoneCall, CircleUser } from 'lucide-react';
import type { TabKey } from '@/types';
import { cn } from '@/lib/cn';

interface NavBarProps {
  onCreate: () => void;
}

export function NavBar({ onCreate }: NavBarProps) {
  const { activeTab, setActiveTab, chats } = useApp();

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  const tabs: { key: TabKey; label: string; icon: typeof MessagesSquare; badge?: number }[] = [
    { key: 'chats', label: 'Chats', icon: MessagesSquare, badge: totalUnread },
    { key: 'discover', label: 'Discover', icon: Compass },
  ];

  const rightTabs: { key: TabKey; label: string; icon: typeof MessagesSquare }[] = [
    { key: 'calls', label: 'Calls', icon: PhoneCall },
    { key: 'profile', label: 'Profile', icon: CircleUser },
  ];

  return (
    <div className="border-t border-white/5 safe-bottom px-2 py-1.5 flex items-center justify-around relative z-30" style={{ background: '#0a0d1c' }}>
      {tabs.map(tab => (
        <NavButton
          key={tab.key}
          label={tab.label}
          icon={tab.icon}
          active={activeTab === tab.key}
          badge={tab.badge}
          onClick={() => setActiveTab(tab.key)}
        />
      ))}

      {/* Create button - center */}
      <button
        onClick={onCreate}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow active:scale-90 transition-all my-0.5"
        style={{ background: 'rgb(var(--accent-rgb))' }}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {rightTabs.map(tab => (
        <NavButton
          key={tab.key}
          label={tab.label}
          icon={tab.icon}
          active={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
        />
      ))}
    </div>
  );
}

function NavButton({
  label, icon: Icon, active, badge, onClick,
}: {
  label: string;
  icon: typeof MessagesSquare;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 relative',
        active ? 'text-violet-400' : 'text-ink-300'
      )}
    >
      <div className="relative">
        <Icon className="w-6 h-6" fill={active ? 'currentColor' : 'none'} />
        {badge && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-coral-500 flex items-center justify-center text-2xs font-bold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-2xs font-medium">{label}</span>
      {active && (
        <div className="absolute -bottom-0.5 w-1 h-1 rounded-full accent-bg" />
      )}
    </button>
  );
}
