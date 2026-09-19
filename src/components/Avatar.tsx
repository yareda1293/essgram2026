import { getInitials } from '@/utils';
import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  isOnline?: boolean;
  showRing?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Avatar({ src, name, size = 48, isOnline, showRing, className, onClick }: AvatarProps) {
  const initials = getInitials(name);
  const ringClass = showRing
    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-ink-900'
    : '';

  return (
    <div
      className={cn('relative shrink-0', className)}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          'w-full h-full rounded-full overflow-hidden bg-ink-600 flex items-center justify-center',
          ringClass,
          onClick && 'cursor-pointer'
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="font-semibold text-ink-100" style={{ fontSize: size * 0.35 }}>
            {initials}
          </span>
        )}
      </div>
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-success-500 border-2 border-ink-900"
          style={{ width: size * 0.28, height: size * 0.28, minWidth: 10, minHeight: 10 }}
        />
      )}
    </div>
  );
}
