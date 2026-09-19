import { useState, useEffect, useRef } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { X, ChevronLeft, ChevronRight, Heart, Send, Eye } from 'lucide-react';
import { cn } from '@/lib/cn';

export function MomentsViewer({
  userId, startIndex, onClose,
}: {
  userId: string;
  startIndex: number;
  onClose: () => void;
}) {
  const { moments, currentUserId, viewMoment } = useApp();
  const userMoments = moments.filter(m => m.userId === userId);
  const user = getUserById(userId);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<number | null>(null);
  const DURATION = 5000;

  const currentMoment = userMoments[currentIndex];

  useEffect(() => {
    if (!currentMoment) return;
    viewMoment(currentMoment.id);
    setProgress(0);
  }, [currentIndex, currentMoment, viewMoment]);

  useEffect(() => {
    if (paused || !currentMoment) return;
    const startTime = Date.now();
    const startProgress = progress;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(startProgress + (elapsed / DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (currentIndex < userMoments.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onClose();
        }
      }
    };

    timerRef.current = window.setInterval(tick, 50);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, currentIndex, userMoments.length]);

  if (!currentMoment || !user) return null;

  const isOwn = userId === currentUserId;

  const goNext = () => {
    if (currentIndex < userMoments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <img
          src={currentMoment.mediaUrl}
          alt="Moment"
          className="max-w-full max-h-full object-contain"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-4 px-3 flex gap-1">
          {userMoments.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-20 px-4 flex items-center gap-3">
          <Avatar src={user.avatar} name={user.name} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-2xs text-white/60">
              {new Date(currentMoment.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Caption */}
        {currentMoment.caption && (
          <div className="absolute bottom-24 left-0 right-0 z-20 px-6 text-center">
            <p className="text-white text-sm font-medium drop-shadow-lg">{currentMoment.caption}</p>
          </div>
        )}

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {currentIndex < userMoments.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center z-20 active:scale-90 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Reply input */}
        {!isOwn && (
          <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
            <div className="flex items-center gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Reply to ${user.name.split(' ')[0]}...`}
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none"
                onPointerDown={e => e.stopPropagation()}
              />
              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {isOwn && (
          <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
              <Eye className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70">{currentMoment.viewedBy.length} views</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


