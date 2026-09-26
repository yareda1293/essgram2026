import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import { Phone, Mail, Lock, Shield, ChevronRight, Check, ArrowLeft, Camera, Send, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { cn } from '@/lib/cn';

// ---- Helpers ----

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(input: string): string {
  let cleaned = input.replace(/[\s\-()]/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    } else if (cleaned.startsWith('0')) {
      return input;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

function isValidPhone(phone: string): boolean {
  return /^\+\d{7,15}$/.test(phone);
}

function mapAuthError(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_send') || msg.includes('for security reasons')) {
    return 'Too many requests. Please wait a minute before trying again.';
  }
  if (msg.includes('invalid') && (msg.includes('otp') || msg.includes('token') || msg.includes('code'))) {
    return 'The verification code is invalid or has expired. Please request a new code.';
  }
  if (msg.includes('expired')) {
    return 'This code has expired. Please request a new one.';
  }
  if (msg.includes('phone') && (msg.includes('not enabled') || msg.includes('not configured') || msg.includes('provider'))) {
    return 'Phone authentication is not enabled. The Supabase project owner must enable the Phone provider and configure an SMS gateway in Authentication > Providers.';
  }
  if (msg.includes('email') && (msg.includes('not enabled') || msg.includes('not configured'))) {
    return 'Email authentication is not enabled. The Supabase project owner must enable the Email provider in Authentication > Providers.';
  }
  if (msg.includes('email_not_confirmed')) {
    return 'Your email is not confirmed yet. Please enter the verification code sent to your email.';
  }
  if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('password') && msg.includes('weak')) {
    return 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (msg.includes('email') && msg.includes('format')) {
    return 'Invalid email address format.';
  }
  return error.message;
}

// ---- Shared visual components ----

function AuthBackground() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 35%, #0f4a5e 70%, #064e3b 100%)' }}
      />
      <div className="absolute top-[-10%] left-[-15%] w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-15%] w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[60%] w-60 h-60 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }} />
    </>
  );
}

function Logo({ size = 'large' }: { size?: 'small' | 'large' }) {
  const dim = size === 'large' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'large' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className={cn('relative', dim)}>
      <div className="absolute inset-0 rounded-[1.4rem] rotate-6 opacity-50 blur-md" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' }} />
      <div
        className={cn('absolute inset-0 rounded-[1.4rem] flex items-center justify-center shadow-lg')}
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 50%, #10b981 100%)', boxShadow: '0 8px 32px -8px rgba(14, 165, 233, 0.5)' }}
      >
        <Send className={cn(iconSize, 'text-white -rotate-12')} fill="white" />
      </div>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-sm text-red-400 leading-relaxed">{error}</p>
    </div>
  );
}

function InfoBanner({ info }: { info: string }) {
  if (!info) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 animate-fade-in">
      <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
      <p className="text-sm text-sky-300 leading-relaxed">{info}</p>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 8px 24px -8px rgba(14, 165, 233, 0.6)' }}
    >
      {loading ? (
        <>
          <Spinner size={20} />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="self-start mb-6 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}

const inputClass = 'w-full pl-14 pr-4 py-3.5 text-base rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-300/80 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] backdrop-blur-sm';

// ---- Main component ----

export function AuthFlow() {
  const { authStage, setAuthStage, phoneNumber, setPhoneNumber, email, setEmail, completeProfile, signOut } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP context: 'email_signup' | 'phone'
  const [otpContext, setOtpContext] = useState<'email_signup' | 'phone'>('email_signup');

  // Profile setup
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (authStage === 'code' && codeRefs.current[0]) {
      setTimeout(() => codeRefs.current[0]?.focus(), 300);
    }
  }, [authStage]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetCode = () => {
    setCode(['', '', '', '', '', '']);
    setError('');
  };

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

    // onAuthStateChange in store.tsx will handle the stage transition
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

    // If session returned immediately, email confirmation is disabled
    if (signUpData?.session && signUpData?.user) {
      setAuthStage('profile');
      return;
    }

    // Confirmation email sent — go to code screen
    setOtpContext('email_signup');
    setInfo('A 6-digit verification code has been sent to your email. Check your inbox (and spam folder).');
    setResendCooldown(60);
    resetCode();
    setAuthStage('code');
  }, [email, password, confirmPassword, setAuthStage]);

  // ---- Phone OTP send ----
  const handlePhoneSendOtp = useCallback(async () => {
    const normalizedPhone = normalizePhone(phoneNumber);

    if (!isValidPhone(normalizedPhone)) {
      setError('Please enter a valid phone number in international format, e.g. +2519XXXXXXXX');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    setPhoneNumber(normalizedPhone);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });

    setLoading(false);

    if (otpError) {
      setError(mapAuthError(otpError));
      return;
    }

    setOtpContext('phone');
    setInfo(`A 6-digit code has been sent to ${normalizedPhone} via SMS.`);
    setResendCooldown(60);
    resetCode();
    setAuthStage('code');
  }, [phoneNumber, setAuthStage, setPhoneNumber]);

  // ---- Resend OTP ----
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || loading) return;

    setError('');
    setInfo('');
    setLoading(true);

    if (otpContext === 'phone') {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        phone: normalizePhone(phoneNumber),
      });
      setLoading(false);
      if (resendError) {
        setError(mapAuthError(resendError));
        return;
      }
      setInfo(`A new code has been sent to ${normalizePhone(phoneNumber)} via SMS.`);
    } else {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      setLoading(false);
      if (resendError) {
        setError(mapAuthError(resendError));
        return;
      }
      setInfo('A new code has been sent to your email.');
    }

    setResendCooldown(60);
    resetCode();
    codeRefs.current[0]?.focus();
  }, [otpContext, phoneNumber, email, resendCooldown, loading]);

  // ---- Verify OTP ----
  const handleCodeChange = useCallback(async (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    setInfo('');

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    if (newCode.every(d => d !== '')) {
      setLoading(true);
      const otpToken = newCode.join('');

      let verifyError: { message: string } | null = null;
      let verifyData: any = null;

      if (otpContext === 'phone') {
        const result = await supabase.auth.verifyOtp({
          phone: normalizePhone(phoneNumber),
          token: otpToken,
          type: 'sms',
        });
        verifyError = result.error;
        verifyData = result.data;
      } else {
        const result = await supabase.auth.verifyOtp({
          email,
          token: otpToken,
          type: 'signup',
        });
        verifyError = result.error;
        verifyData = result.data;
      }

      setLoading(false);

      if (verifyError) {
        setError(mapAuthError(verifyError));
        resetCode();
        codeRefs.current[0]?.focus();
        return;
      }

      if (verifyData?.user || verifyData?.session) {
        // onAuthStateChange will check if profile exists and set the right stage.
        // But we also set it here for immediate UI feedback.
        setAuthStage('profile');
      } else {
        setError('Verification completed but no session was created. Please try again.');
        resetCode();
        codeRefs.current[0]?.focus();
      }
    }
  }, [code, otpContext, phoneNumber, email, setAuthStage]);

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  // ---- Forgot password ----
  const handleForgotPassword = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Please enter your email address first.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (resetError) {
      setError(mapAuthError(resetError));
      return;
    }

    setInfo('A password reset link has been sent to your email. Open it to set a new password.');
  }, [email]);

  // ---- Profile submit ----
  const handleProfileSubmit = useCallback(() => {
    if (!fullName.trim() || !username.trim()) {
      setError('Please enter your name and username');
      return;
    }
    setError('');
    setLoading(true);
    completeProfile({
      name: fullName,
      username: '@' + username.replace('@', ''),
      bio,
      status,
      avatar: photoUrl,
      phone: phoneNumber,
    });
  }, [fullName, username, bio, status, photoUrl, phoneNumber, completeProfile]);

  // ============ SCREENS ============

  // ---- Method chooser ----
  if (authStage === 'method') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 text-center tracking-tight">
            Ess Gram
          </h1>
          <p className="text-sky-200/80 text-center mb-1 font-medium">Your people. Your space.</p>
          <p className="text-sm text-slate-400 text-center mb-10 leading-relaxed">
            Sign in or create an account to get started.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => { setError(''); setAuthStage('phone'); }}
              className="w-full flex items-center gap-4 py-4 px-5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-sm transition-all hover:bg-white/[0.1] hover:border-sky-400/30 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
                <Phone className="w-5 h-5 text-sky-400" />
              </div>
              <span className="flex-1 text-left">Continue with Phone</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button
              onClick={() => { setError(''); setAuthStage('email'); }}
              className="w-full flex items-center gap-4 py-4 px-5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-sm transition-all hover:bg-white/[0.1] hover:border-sky-400/30 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
                <Mail className="w-5 h-5 text-teal-400" />
              </div>
              <span className="flex-1 text-left">Continue with Email</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-8 text-center leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // ---- Phone number entry ----
  if (authStage === 'phone') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setAuthStage('method'); }} />

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
            <Phone className="w-8 h-8 text-sky-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Enter your phone number
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            We'll send you a 6-digit verification code via SMS.
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                onFocus={() => { if (!phoneNumber) setPhoneNumber('+'); }}
                placeholder="+2519XXXXXXXX"
                aria-label="Phone number in international format"
                className={inputClass}
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter') handlePhoneSendOtp(); }}
              />
            </div>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <PrimaryButton onClick={handlePhoneSendOtp} disabled={loading || !phoneNumber}>
              {loading ? 'Sending code...' : (<><Send className="w-5 h-5" /> Send Code</>)}
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // ---- Email: Sign in / Create account ----
  if (authStage === 'email') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setAuthStage('method'); }} />

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(20, 184, 166, 0.15)' }}>
            <Mail className="w-8 h-8 text-teal-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Continue with Email
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            Sign in to your account or create a new one.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => { setError(''); setPassword(''); setAuthStage('email_signin'); }}
              className="w-full flex items-center gap-4 py-4 px-5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-sm transition-all hover:bg-white/[0.1] hover:border-sky-400/30 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
                <Lock className="w-5 h-5 text-sky-400" />
              </div>
              <span className="flex-1 text-left">Sign In</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button
              onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setAuthStage('email_signup'); }}
              className="w-full flex items-center gap-4 py-4 px-5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-sm transition-all hover:bg-white/[0.1] hover:border-sky-400/30 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="flex-1 text-left">Create Account</span>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Email sign in ----
  if (authStage === 'email_signin') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center py-8 animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setAuthStage('email'); }} />

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Sign In
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            Enter your email and password to continue.
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm text-slate-400 hover:text-sky-400 transition-colors self-start"
            >
              Forgot password?
            </button>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <PrimaryButton onClick={handleEmailSignIn} disabled={loading || !email || !password}>
              {loading ? 'Signing in...' : (<>Sign In <ChevronRight className="w-5 h-5" /></>)}
            </PrimaryButton>

            <p className="text-sm text-slate-500 text-center pt-2">
              Don't have an account?{' '}
              <button
                onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setAuthStage('email_signup'); }}
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Email sign up ----
  if (authStage === 'email_signup') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center py-8 animate-fade-in-up">
          <BackButton onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setAuthStage('email'); }} />

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Create Account
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            We'll send a verification code to your email.
          </p>

          <div className="w-full space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                aria-label="Confirm password"
                className={inputClass}
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter') handleEmailSignUp(); }}
              />
            </div>

            <ErrorBanner error={error} />
            <InfoBanner info={info} />

            <PrimaryButton onClick={handleEmailSignUp} disabled={loading || !email || !password || !confirmPassword}>
              {loading ? 'Creating account...' : (<>Create Account <ChevronRight className="w-5 h-5" /></>)}
            </PrimaryButton>

            <p className="text-sm text-slate-500 text-center pt-2">
              Already have an account?{' '}
              <button
                onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setAuthStage('email_signin'); }}
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Code verification (shared for phone SMS and email signup OTP) ----
  if (authStage === 'code') {
    const target = otpContext === 'phone' ? normalizePhone(phoneNumber) : email;
    const targetLabel = otpContext === 'phone' ? 'phone number' : 'email';

    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <AuthBackground />
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <BackButton onClick={() => {
            resetCode();
            setInfo('');
            setAuthStage(otpContext === 'phone' ? 'phone' : 'email_signup');
          }} />

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
            <Shield className="w-8 h-8 text-sky-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Enter the code
          </h1>
          <p className="text-sm text-slate-400 text-center mb-2 leading-relaxed">
            We sent a 6-digit code to your {targetLabel}
          </p>
          <p className="text-sm font-semibold text-sky-400 mb-2">{target}</p>
          <p className="text-xs text-slate-500 text-center mb-8 leading-relaxed">
            Check your {otpContext === 'phone' ? 'SMS messages' : 'inbox and spam folder'}. The code expires after 10 minutes.
          </p>

          <div className="flex gap-2 mb-6">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { codeRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(i, e)}
                disabled={loading}
                className={cn(
                  'w-12 h-14 rounded-xl text-center text-xl font-bold transition-all',
                  digit
                    ? 'border-2 text-white'
                    : 'bg-white/[0.06] border border-white/10 text-white outline-none'
                )}
                style={digit ? { background: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.5)' } : {}}
              />
            ))}
          </div>

          <ErrorBanner error={error} />

          {info && !error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 mb-4 max-w-sm">
              <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-sm text-sky-300 leading-relaxed">{info}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sky-400 mb-4">
              <Spinner size={20} />
              <span className="text-sm">Verifying code...</span>
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className={cn(
              'text-sm transition-colors mt-2',
              resendCooldown > 0 || loading
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-sky-400'
            )}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive a code? Resend"}
          </button>
        </div>
      </div>
    );
  }

  // ---- Profile setup ----
  if (authStage === 'profile') {
    return (
      <div className="min-h-screen relative flex flex-col px-6 safe-top safe-bottom overflow-y-auto">
        <AuthBackground />
        <div className="relative w-full max-w-sm mx-auto flex flex-col py-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                signOut();
                setFullName('');
                setUsername('');
                setBio('');
                setStatus('');
                setPhotoUrl('');
                setError('');
              }}
              className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo size="small" />
            <div className="w-10" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-1 text-center">
            Set up your profile
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8">
            Tell the Ess Gram community who you are.
          </p>

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
                <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-sky-500 ring-offset-4 ring-offset-slate-900">
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:border-sky-400/50 transition-colors">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' }}>
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="alexrivera"
                  className="w-full pl-8 pr-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Bio (optional)</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Designer & coffee enthusiast"
                rows={2}
                maxLength={120}
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] resize-none"
              />
              <p className="text-2xs text-slate-500 mt-1 text-right">{bio.length}/120</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Status (optional)</label>
              <input
                value={status}
                onChange={e => setStatus(e.target.value)}
                placeholder="Available"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08]"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={handleProfileSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg mt-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 8px 24px -8px rgba(14, 165, 233, 0.6)' }}
            >
              {loading ? <Spinner size={20} /> : (
                <>
                  Start Messaging
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
