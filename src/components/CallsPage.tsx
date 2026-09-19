import { useState, useEffect } from 'react';
import { useApp, getUserById } from '@/store';
import { Avatar } from '@/components/Avatar';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Mic, MicOff, VideoOff, Volume2, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeTime, formatDuration } from '@/utils';

export function CallsPage({ onCall }: { onCall: (userId: string, type: 'voice' | 'video') => void }) {
  const { calls } = useApp();

  return (
    <div className="flex flex-col h-full">
      <div className="glass-strong sticky top-0 z-20 px-4 pt-3 pb-3 border-b border-white/5">
        <h1 className="font-display text-2xl font-bold text-ink-50">Calls</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-ink-300" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink-50 mb-1">No calls yet</h3>
            <p className="text-sm text-ink-300">Your call history will appear here.</p>
          </div>
        ) : (
          calls.map(call => {
            const user = getUserById(call.userId);
            if (!user) return null;
            const isMissed = call.direction === 'missed';

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <Avatar src={user.avatar} name={user.name} size={48} isOnline={user.isOnline} />

                <div className="flex-1 min-w-0">
                  <h3 className={cn('font-semibold text-sm truncate', isMissed ? 'text-error-400' : 'text-ink-50')}>
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {isMissed ? (
                      <PhoneMissed className="w-3.5 h-3.5 text-error-400" />
                    ) : call.direction === 'incoming' ? (
                      <PhoneIncoming className="w-3.5 h-3.5 text-success-400" />
                    ) : (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-ink-300" />
                    )}
                    <span className="text-xs text-ink-300">
                      {isMissed ? 'Missed' : call.direction} · {formatRelativeTime(call.timestamp)}
                      {call.duration ? ` · ${formatDuration(call.duration)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onCall(user.id, 'voice')}
                    className="icon-btn"
                  >
                    <Phone className="w-5 h-5 text-violet-400" />
                  </button>
                  <button
                    onClick={() => onCall(user.id, 'video')}
                    className="icon-btn"
                  >
                    <Video className="w-5 h-5 text-violet-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div className="h-24" />
      </div>
    </div>
  );
}

export function CallOverlay({ userId, type, onEnd }: { userId: string; type: 'voice' | 'video'; onEnd: () => void }) {
  const user = getUserById(userId);
  const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected'>('calling');
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setCallState('ringing'), 1500);
    const t2 = setTimeout(() => setCallState('connected'), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-ink-950 animate-fade-in safe-top safe-bottom">
      {/* Background for video call */}
      {type === 'video' && !videoOff ? (
        <img src={user.avatar} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 via-ink-950 to-ink-950" />
      )}

      {/* Video area */}
      {type === 'video' && !videoOff && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Top info */}
      <div className="relative z-10 flex flex-col items-center pt-16 px-6">
        {type === 'video' && videoOff && (
          <div className="mb-6">
            <Avatar src={user.avatar} name={user.name} size={96} />
          </div>
        )}
        <h1 className="font-display text-2xl font-bold text-white mb-1">{user.name}</h1>
        <p className="text-white/60 text-sm">
          {callState === 'calling' && (type === 'video' ? 'Video calling...' : 'Calling...')}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'connected' && formatDuration(duration)}
        </p>
      </div>

      {/* Self preview for video */}
      {type === 'video' && callState === 'connected' && !videoOff && (
        <div className="absolute top-14 right-4 w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-float">
          <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" alt="You" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Pulse animation for calling state */}
      {callState !== 'connected' && (
        <div className="relative z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-violet-600/20 animate-ping" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-10 pb-12 px-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90',
              muted ? 'bg-white text-ink-900' : 'bg-white/10 backdrop-blur-md text-white'
            )}
          >
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {type === 'video' && (
            <button
              onClick={() => setVideoOff(!videoOff)}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90',
                videoOff ? 'bg-white text-ink-900' : 'bg-white/10 backdrop-blur-md text-white'
              )}
            >
              {videoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90',
              speakerOn ? 'bg-white text-ink-900' : 'bg-white/10 backdrop-blur-md text-white'
            )}
          >
            <Volume2 className="w-6 h-6" />
          </button>

          <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* End call */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-error-500 flex items-center justify-center shadow-glow hover:bg-error-600 transition-all active:scale-90 animate-pulse-glow"
          >
            <X className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
