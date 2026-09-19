import { useState, useEffect } from 'react';

interface TypingDotsProps {
  size?: number;
  color?: string;
}

export function TypingDots({ size = 6, color = 'bg-violet-400' }: TypingDotsProps) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`rounded-full ${color} animate-typing-dot`}
          style={{ width: size, height: size, animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-16 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-5 text-ink-300">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-50 mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-ink-300 max-w-xs leading-relaxed mb-6">{subtitle}</p>}
      {action}
    </div>
  );
}

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-slide-in-up">
      <div className="glass-strong px-5 py-3 rounded-full text-sm font-medium text-ink-50 shadow-float">
        {message}
      </div>
    </div>
  );
}

export function useTypingSimulation(active: boolean, duration = 3000): boolean {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setIsTyping(true), 1000);
    const stop = setTimeout(() => setIsTyping(false), duration);
    return () => {
      clearTimeout(timeout);
      clearTimeout(stop);
    };
  }, [active, duration]);

  return isTyping;
}
