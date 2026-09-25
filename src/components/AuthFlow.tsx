import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui';
import { Phone, Mail, Lock, Shield, ChevronRight, Check, ArrowLeft, Camera, Send, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

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
    return 'Too many requests. Please wait a minute before requesting another code.';
  }
  if (msg.includes('invalid') && (msg.includes('otp') || msg.includes('token') || msg.includes('code'))) {
    return 'The verification code is invalid or has expired. Please request a new code.';
  }
  if (msg.includes('expired')) {
    return 'This code has expired. Please request a new one.';
  }
  if (msg.includes('email provider') || msg.includes('not enabled') || msg.includes('not configured')) {
    return 'Email authentication is not enabled. The Supabase project owner must enable the Email provider in Authentication > Providers.';
  }
  if (msg.includes('email_not_confirmed')) {
    return 'Your email is not confirmed yet. Please enter the verification code sent to your email.';
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'This email is already registered. Try signing in instead.';
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

export function AuthFlow() {
  const { authStage, setAuthStage, phoneNumber, setPhoneNumber, email, setEmail, completeProfile, signOut } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // ---- Send email OTP ----
  const handleRegisterSubmit = useCallback(async () => {
    const normalizedPhone = normalizePhone(phoneNumber);

    if (!isValidPhone(normalizedPhone)) {
      setError('Please enter a valid phone number in international format, e.g. +2519XXXXXXXX');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    setPhoneNumber(normalizedPhone);

    // Sign up with email + password. Supabase will send a confirmation email.
    // The email will contain either a 6-digit OTP code (if the template uses {{ .Token }})
    // or a confirmation link (if the template uses {{ .ConfirmationURL }}).
    // We need the OTP code path, so the email template MUST use {{ .Token }}.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: normalizedPhone,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(mapAuthError(signUpError));
      return;
    }

    // If Supabase returned a session immediately, email confirmation is disabled.
    // In that case the user is already authenticated — skip the OTP screen.
    if (signUpData?.session && signUpData?.user) {
      setAuthStage('profile');
      return;
    }

    // No session returned — Supabase sent a confirmation email with the OTP code.
    // The user must enter the 6-digit code from the email to verify their account.
    setInfo('A 6-digit verification code has been sent to your email. Check your inbox (and spam folder).');
    setResendCooldown(60);
    setCode(['', '', '', '', '', '']);
    setAuthStage('code');
  }, [phoneNumber, email, password, setAuthStage, setPhoneNumber]);

  // ---- Resend OTP ----
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || loading) return;
    if (!isValidEmail(email)) return;

    setError('');
    setInfo('');
    setLoading(true);

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
    setResendCooldown(60);
    setCode(['', '', '', '', '', '']);
    codeRefs.current[0]?.focus();
  }, [email, resendCooldown, loading]);

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

      // Verify the email OTP code using Supabase's signup OTP verification.
      // The type: 'signup' matches the signUp flow — the code in the email
      // is a signup confirmation token.
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: 'signup',
      });

      setLoading(false);

      if (verifyError) {
        setError(mapAuthError(verifyError));
        setCode(['', '', '', '', '', '']);
        codeRefs.current[0]?.focus();
        return;
      }

      // verifyOtp returns a session on success — user is now authenticated.
      // The onAuthStateChange listener in store.tsx will also fire, but we
      // transition here to ensure the UI moves forward immediately.
      if (data?.user || data?.session) {
        setAuthStage('profile');
      } else {
        // No error but also no session — unexpected state
        setError('Verification completed but no session was created. Please try again.');
        setCode(['', '', '', '', '', '']);
        codeRefs.current[0]?.focus();
      }
    }
  }, [code, email, setAuthStage]);

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

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

  // ---- Registration screen ----
  if (authStage === 'register') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 35%, #0f4a5e 70%, #064e3b 100%)' }}
        />
        <div className="absolute top-[-10%] left-[-15%] w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-15%] w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[60%] w-60 h-60 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }} />

        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <div className="mb-6">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2 text-center tracking-tight">
            Ess Gram
          </h1>
          <p className="text-sky-200/80 text-center mb-1 font-medium">Your people. Your space.</p>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            Create your account. We'll send a verification code to your email.
          </p>

          <div className="w-full space-y-3">
            {/* Phone number (profile info, not SMS-verified) */}
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
                className="w-full pl-14 pr-4 py-3.5 text-base rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-300/80 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            {/* Email */}
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
                className="w-full pl-14 pr-4 py-3.5 text-base rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-300/80 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] backdrop-blur-sm"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
                aria-label="Password"
                className="w-full pl-14 pr-12 py-3.5 text-base rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-300/80 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] backdrop-blur-sm"
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

            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Your phone number is stored in your profile. Verification is sent to your email, not your phone.
            </p>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handleRegisterSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 8px 24px -8px rgba(14, 165, 233, 0.6)' }}
            >
              {loading ? (
                <>
                  <Spinner size={20} />
                  <span>Sending code...</span>
                </>
              ) : (
                <>
                  Create Account
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-8 text-center leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // ---- Code verification ----
  if (authStage === 'code') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 35%, #0f4a5e 70%, #064e3b 100%)' }}
        />
        <div className="absolute top-[-10%] left-[-15%] w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up">
          <button
            onClick={() => { setAuthStage('register'); setCode(['', '', '', '', '', '']); setError(''); setInfo(''); }}
            className="self-start mb-6 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
            <Shield className="w-8 h-8 text-sky-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">
            Enter the code
          </h1>
          <p className="text-sm text-slate-400 text-center mb-2 leading-relaxed">
            We sent a 6-digit code to your email
          </p>
          <p className="text-sm font-semibold text-sky-400 mb-2">{email}</p>
          <p className="text-xs text-slate-500 text-center mb-8 leading-relaxed">
            Check your inbox and spam folder. The code expires after 10 minutes.
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

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 max-w-sm">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

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
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 35%, #0f4a5e 70%, #064e3b 100%)' }}
        />
        <div className="absolute top-[-10%] left-[-15%] w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

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
