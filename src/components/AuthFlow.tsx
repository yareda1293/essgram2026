import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import {
  Mail, Lock, ChevronRight, Check, ArrowLeft, Camera, Send,
  AlertCircle, Eye, EyeOff, Loader2, Phone, Sparkles, User as UserIcon, AtSign,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ---- Helpers ----

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUsername(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function mapAuthError(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_send') || msg.includes('for security reasons')) {
    return 'Too many requests. Please wait a minute before trying again.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email_not_confirmed')) {
    return 'Please check your email to confirm your account before signing in.';
  }
  if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (msg.includes('password') && msg.includes('weak')) {
    return 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (msg.includes('email') && msg.includes('format')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('oauth') || msg.includes('provider')) {
    return 'Google sign-in is not configured. Please enable Google OAuth in your Supabase project settings.';
  }
  if (msg.includes('unique constraint') || msg.includes('duplicate key')) {
    return 'That username is already taken. Please choose another.';
  }
  return 'Something went wrong. Please try again.';
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Too short', color: '#6e7690' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
    { label: 'Very strong', color: '#10b981' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ---- Google Icon ----

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ---- Shared visual components ----

function AuthBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-[-15%] left-[-20%] w-96 h-96 rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #7c5cff 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] right-[-20%] w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #ff4784 0%, transparent 70%)' }} />
      <div className="absolute top-[30%] right-[10%] w-72 h-72 rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #ff5a3c 0%, transparent 70%)' }} />
    </>
  );
}

function Logo({ size = 'large' }: { size?: 'small' | 'large' }) {
  const dim = size === 'large' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-7 h-7';
  const radius = size === 'large' ? 'rounded-[1.4rem]' : 'rounded-[1rem]';
  return (
    <div className={cn('relative', dim)}>
      <div className={cn('absolute inset-0', radius, 'rotate-6 opacity-40 blur-md bg-gradient-violet-coral')} />
      <div
        className={cn('absolute inset-0', radius, 'flex items-center justify-center')}
        style={{ background: 'linear-gradient(135deg, #7c5cff 0%, #ff4784 50%, #ff5a3c 100%)', boxShadow: '0 8px 32px -8px rgba(124, 92, 255, 0.5)' }}
      >
        <Send className={cn(iconSize, 'text-white -rotate-12')} fill="white" />
      </div>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-error-500/10 border border-error-500/20 animate-fade-in">
      <AlertCircle className="w-4 h-4 text-error-400 shrink-0 mt-0.5" />
      <p className="text-sm text-error-400 leading-relaxed">{error}</p>
    </div>
  );
}

function InfoBanner({ info }: { info: string }) {
  if (!info) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 animate-fade-in">
      <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
      <p className="text-sm text-violet-300 leading-relaxed">{info}</p>
    </div>
  );
}

const inputClass = 'w-full pl-14 pr-4 py-4 text-base rounded-2xl bg-white/[0.04] border border-white/[0.08] text-ink-50 placeholder:text-ink-300 outline-none transition-all focus:border-violet-400/50 focus:bg-white/[0.06] backdrop-blur-sm';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="self-start mb-6 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-ink-200 hover:bg-white/10 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-white/[0.08]" />
      <span className="text-xs text-ink-400 font-medium uppercase tracking-wider">or</span>
      <div className="flex-1 h-px bg-white/[0.08]" />
    </div>
  );
}

const accentBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c5cff 0%, #ff4784 100%)',
  boxShadow: '0 8px 24px -8px rgba(124, 92, 255, 0.6)',
};

function AccentButton({ children, loading, disabled, onClick }: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white text-sm transition-all active:scale-[0.98] shadow-glow disabled:opacity-50"
      style={accentBtnStyle}
    >
      {loading ? (
        <>
          <Spinner size={20} />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {children}
          <ChevronRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

// ---- Animated splash logo for the loading stage ----

function SplashLogo() {
  return (
    <div className="relative flex flex-col items-center animate-scale-in">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 rounded-[1.8rem] rotate-12 opacity-30 blur-xl bg-gradient-violet-coral" />
        <div
          className="absolute inset-0 rounded-[1.8rem] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c5cff 0%, #ff4784 50%, #ff5a3c 100%)', boxShadow: '0 12px 48px -12px rgba(124, 92, 255, 0.6)' }}
        >
          <Send className="w-12 h-12 text-white -rotate-12 animate-pulse-glow" fill="white" />
        </div>
      </div>
      <h1 className="font-display text-2xl font-bold text-ink-50 tracking-tight">Ess Gram</h1>
      <p className="text-ink-300 text-sm mt-1">Connecting you to your people...</p>
      <div className="mt-6">
        <Spinner size={28} className="text-violet-400" />
      </div>
    </div>
  );
}

// ---- Main component ----

export function AuthFlow() {
  const { authStage, setAuthStage, email, setEmail, completeProfile, signOut } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Profile setup
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Username check state
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  // ---- Username availability check (debounced) ----
  useEffect(() => {
    if (!isValidUsername(username)) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    usernameCheckTimer.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('app_users')
          .select('id')
          .eq('username', username)
          .maybeSingle();
        setUsernameStatus(data ? 'taken' : 'available');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
    return () => {
      if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    };
  }, [username]);

  // ---- Google OAuth ----
  const handleGoogleSignIn = useCallback(async () => {
    setError('');
    setGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (oauthError) {
      setGoogleLoading(false);
      setError(mapAuthError(oauthError));
      return;
    }
  }, []);

  // ---- Email Continue (proceed to password screen) ----
  const handleEmailContinue = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    setLoading(false);
    setAuthStage('email_password');
  }, [email, setAuthStage]);

  // ---- Email sign in ----
  const handleEmailSignIn = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(mapAuthError(signInError));
      return;
    }
  }, [email, password]);

  // ---- Email sign up ----
  const handleEmailSignUp = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(mapAuthError(signUpError));
      return;
    }

    if (signUpData?.session && signUpData?.user) {
      setAuthStage('profile');
      return;
    }

    setInfo('Account created! Please check your email to confirm your account, then come back to sign in.');
  }, [email, password, confirmPassword, setAuthStage]);

  // ---- Forgot password ----
  const handleForgotPassword = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });

    setLoading(false);

    if (resetError) {
      setError(mapAuthError(resetError));
      return;
    }

    setInfo('A password reset link has been sent to your email. Open it to set a new password.');
  }, [email]);

  // ---- Profile submit ----
  const handleProfileSubmit = useCallback(async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters: lowercase letters, numbers, and underscores only.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('That username is already taken. Please choose another.');
      return;
    }
    if (usernameStatus !== 'available') {
      setError('Please wait for username availability to be checked.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await completeProfile({
      name: fullName,
      username: username,
      bio,
      avatar: photoUrl,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }, [fullName, username, usernameStatus, bio, photoUrl, completeProfile]);

  const pwStrength = passwordStrength(password);

  // ============ SCREENS ============

  // ---- Loading / splash ----
  if (authStage === 'loading') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <SplashLogo />
      </div>
    );
  }

  // ---- Login (main screen) — Telegram-style ----
  if (authStage === 'login') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-2 text-center tracking-tight">
            Ess Gram
          </h1>
          <p className="text-ink-300 text-center mb-10 font-medium">Your people. Your space.</p>

          <div className="w-full space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-gray-700 font-semibold text-sm transition-all hover:bg-gray-50 active:scale-[0.98] shadow-lg disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <Divider />

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className={inputClass}
                disabled={loading || googleLoading}
                onKeyDown={e => { if (e.key === 'Enter') handleEmailContinue(); }}
              />
            </div>

            <ErrorBanner error={error} />

            <AccentButton onClick={handleEmailContinue} disabled={loading || googleLoading || !email}>
              Continue
            </AccentButton>
          </div>

          <p className="text-xs text-ink-400 mt-8 text-center leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // ---- Email password (sign in) — Telegram-style ----
  if (authStage === 'email_password') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center py-8 animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setPassword(''); setInfo(''); setAuthStage('login'); }} />

          <div className="mb-6">
            <Logo size="small" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-50 mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-ink-300 text-center mb-8 leading-relaxed">
            Sign in to your Ess Gram account
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className={cn(inputClass, 'pr-12')}
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter') handleEmailSignIn(); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-100 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={() => { setError(''); setInfo(''); setAuthStage('forgot_password'); }}
              disabled={loading}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors self-start font-medium"
            >
              Forgot password?
            </button>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <AccentButton onClick={handleEmailSignIn} disabled={loading || !email || !password}>
              Sign In
            </AccentButton>

            <p className="text-sm text-ink-400 text-center pt-2">
              Don't have an account?{' '}
              <button
                onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setInfo(''); setAuthStage('email_signup'); }}
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Email sign up — Telegram-style with password strength ----
  if (authStage === 'email_signup') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center py-8 animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setInfo(''); setAuthStage('email_password'); }} />

          <div className="mb-6">
            <Logo size="small" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-50 mb-2 text-center">
            Create Account
          </h1>
          <p className="text-sm text-ink-300 text-center mb-8 leading-relaxed">
            Join the Ess Gram community
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 8 characters)"
                  aria-label="Password"
                  className={cn(inputClass, 'pr-12')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-100 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <div className="flex-1 flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i < pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium w-20 text-right" style={{ color: pwStrength.color }}>
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                aria-label="Confirm password"
                className={cn(inputClass, showPassword ? '' : 'pr-12')}
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter') handleEmailSignUp(); }}
              />
              {!showPassword && confirmPassword.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmPassword === password ? (
                    <Check className="w-5 h-5 text-success-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-error-400" />
                  )}
                </div>
              )}
            </div>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <AccentButton onClick={handleEmailSignUp} disabled={loading || !email || !password || !confirmPassword}>
              Create Account
            </AccentButton>

            <p className="text-sm text-ink-400 text-center pt-2">
              Already have an account?{' '}
              <button
                onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setInfo(''); setAuthStage('email_password'); }}
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Forgot password ----
  if (authStage === 'forgot_password') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center py-8 animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setInfo(''); setAuthStage('email_password'); }} />

          <div className="mb-6">
            <Logo size="small" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-50 mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-sm text-ink-300 text-center mb-8 leading-relaxed">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className={inputClass}
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter') handleForgotPassword(); }}
              />
            </div>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <AccentButton onClick={handleForgotPassword} disabled={loading || !email}>
              Send Reset Link
            </AccentButton>

            <button
              onClick={() => { setError(''); setInfo(''); setAuthStage('email_password'); }}
              className="w-full text-sm text-ink-300 hover:text-violet-400 transition-colors text-center pt-2"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Profile setup — Telegram-style with floating labels and avatar ----
  if (authStage === 'profile') {
    return (
      <div className="min-h-screen relative flex flex-col px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm mx-auto flex flex-col py-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => {
                signOut();
                setFullName('');
                setUsername('');
                setBio('');
                setPhotoUrl('');
                setError('');
                setUsernameStatus('idle');
              }}
              className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-ink-200 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo size="small" />
            <div className="w-10" />
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-50 mb-1 text-center">
            Set up your profile
          </h1>
          <p className="text-sm text-ink-300 text-center mb-8">
            Tell the Ess Gram community who you are
          </p>

          {/* Photo upload */}
          <div className="flex justify-center mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              {photoUrl ? (
                <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-violet-500 ring-offset-4 ring-offset-ink-950">
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/[0.04] border-2 border-dashed border-white/15 flex items-center justify-center group-hover:border-violet-400/50 transition-colors">
                  <Camera className="w-10 h-10 text-ink-300" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center border-2 border-ink-950" style={{ background: 'linear-gradient(135deg, #7c5cff 0%, #ff4784 100%)' }}>
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className={cn(inputClass, 'pl-4')}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-300 mb-1.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5" /> Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 font-medium">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(sanitizeUsername(e.target.value))}
                  placeholder="alexrivera"
                  className={cn(
                    'w-full pl-8 pr-10 py-4 text-base rounded-2xl bg-white/[0.04] border text-ink-50 placeholder:text-ink-300 outline-none transition-all focus:bg-white/[0.06]',
                    usernameStatus === 'available'
                      ? 'border-success-500/40 focus:border-success-400/60'
                      : usernameStatus === 'taken'
                      ? 'border-error-500/40 focus:border-error-400/60'
                      : 'border-white/[0.08] focus:border-violet-400/50'
                  )}
                />
                {usernameStatus === 'checking' && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 animate-spin" />
                )}
                {usernameStatus === 'available' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success-500" />
                )}
                {usernameStatus === 'taken' && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-error-400" />
                )}
              </div>
              {username && !isValidUsername(username) && (
                <p className="text-xs text-ink-400 mt-1">3-20 characters: lowercase letters, numbers, underscores</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-xs text-success-500 mt-1">Username available</p>
              )}
              {usernameStatus === 'taken' && (
                <p className="text-xs text-error-400 mt-1">Username already taken</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-ink-300 mb-1.5 block">Bio (optional)</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Designer & coffee enthusiast"
                rows={2}
                maxLength={120}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-ink-50 placeholder:text-ink-300 outline-none transition-all focus:border-violet-400/50 focus:bg-white/[0.06] resize-none"
              />
              <p className="text-2xs text-ink-400 mt-1 text-right">{bio.length}/120</p>
            </div>

            {error && <ErrorBanner error={error} />}

            <div className="pt-2">
              <AccentButton onClick={handleProfileSubmit} disabled={loading || !fullName.trim() || !isValidUsername(username) || usernameStatus !== 'available'}>
                {loading ? <Spinner size={20} /> : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Complete Setup
                  </>
                )}
              </AccentButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
