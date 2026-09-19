import { useApp } from '@/store';
import { Avatar } from '@/components/Avatar';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function MomentsBar({ onOpenMoment }: { onOpenMoment: (userId: string, index: number) => void }) {
  const { moments, currentUser, users } = useApp();

  // Group moments by user
  const userMoments = moments.reduce((acc, m) => {
    if (!acc[m.userId]) acc[m.userId] = [];
    acc[m.userId].push(m);
    return acc;
  }, {} as Record<string, typeof moments>);

  const userIds = Object.keys(userMoments);
  const myMoment = userMoments[currentUser.id];

  const getMomentUser = (uid: string) => users.find(u => u.id === uid);

  return (
    <div className="px-4 py-3 border-b border-white/5">
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {/* My moment / Add moment */}
        <button
          onClick={() => myMoment ? onOpenMoment(currentUser.id, 0) : undefined}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="relative">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size={56}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-violet-coral flex items-center justify-center border-2 border-ink-900">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-2xs text-ink-200 font-medium">Your Moment</span>
        </button>

        {/* Other users' moments */}
        {userIds.filter(id => id !== currentUser.id).map(userId => {
          const userMomentsList = userMoments[userId];
          const allViewed = userMomentsList.every(m => m.viewedBy.includes(currentUser.id));
          const user = getMomentUser(userId);
          if (!user) return null;

          return (
            <button
              key={userId}
              onClick={() => onOpenMoment(userId, 0)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className={cn(
                  'p-[2px] rounded-full transition-transform active:scale-95',
                  allViewed
                    ? 'bg-ink-400'
                    : 'bg-gradient-violet-coral'
                )}
              >
                <div className="p-[2px] rounded-full bg-ink-900">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size={52}
                  />
                </div>
              </div>
              <span className="text-2xs text-ink-200 font-medium max-w-[60px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
