import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store';
import { Spinner } from '@/components/ui';
import { Phone, Shield, ChevronRight, Check, ArrowLeft, Camera, Send } from 'lucide-react';
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

export function AuthFlow() {
  const { authStage, setAuthStage, phoneNumber, setPhoneNumber, completeProfile } = useApp();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handlePhoneSubmit = () => {
    if (phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthStage('code');
    }, 1500);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    if (newCode.every(d => d !== '') && newCode.join('') === '123456') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setAuthStage('profile');
      }, 1000);
    } else if (newCode.every(d => d !== '') && newCode.join('') !== '123456') {
      // Still accept any code for demo
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setAuthStage('profile');
      }, 1000);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleProfileSubmit = () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Please enter your name and username');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      completeProfile({ name: fullName, username: '@' + username.replace('@', ''), bio, status, avatar: photoUrl });
    }, 1500);
  };

  // ---- Phone screen ----
  if (authStage === 'phone') {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 safe-top safe-bottom overflow-hidden">
        {/* Realistic gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 35%, #0f4a5e 70%, #064e3b 100%)' }}
        />
        {/* Decorative glow orbs */}
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
          <p className="text-sm text-slate-400 text-center mb-10 leading-relaxed">
            Enter your phone number to get started. We'll send you a verification code via SMS.
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
                onFocus={() => {
                  if (!phoneNumber) setPhoneNumber('+1 ');
                }}
                placeholder="+1 415 555 0192"
                aria-label="Phone number including country code"
                className="w-full pl-14 pr-4 py-4 text-base rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-300/80 outline-none transition-all focus:border-sky-400/50 focus:bg-white/[0.08] backdrop-blur-sm"
                onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              />
            </div>

            {error && <p className="text-sm text-red-400 animate-fade-in">{error}</p>}

            <button
              onClick={handlePhoneSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 8px 24px -8px rgba(14, 165, 233, 0.6)' }}
            >
              {loading ? <Spinner size={20} /> : (
                <>
                  Continue
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
            onClick={() => { setAuthStage('phone'); setCode(['', '', '', '', '', '']); }}
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
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-sky-400 mb-8">{phoneNumber}</p>

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

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          {loading && (
            <div className="flex items-center gap-2 text-sky-400">
              <Spinner size={20} />
              <span className="text-sm">Verifying...</span>
            </div>
          )}

          <button className="text-sm text-slate-400 hover:text-sky-400 transition-colors mt-4">
            Didn't receive a code? Resend
          </button>

          <div className="w-full mt-8 p-4 rounded-xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
                <Check className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demo tip: enter any 6 digits to continue.
              </p>
            </div>
          </div>
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
          <div className="mb-6 flex justify-center">
            <Logo size="small" />
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
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 shadow-lg mt-2"
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
