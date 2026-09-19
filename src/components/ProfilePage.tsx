import { useEffect, useState } from 'react';
import { useApp } from '@/store';
import { Avatar } from '@/components/Avatar';
import { BottomSheet, Modal } from '@/components/Modal';
import {
  Settings, Bell, Shield, Palette, Eye, Phone, AtSign,
  Camera, Lock, UserX, ChevronRight, Check, X, Edit2,
  CircleHelp, LogOut, Crown, Moon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type SettingsSection = 'main' | 'privacy' | 'notifications' | 'appearance';

const ACCENT_COLORS = [
  { name: 'Violet', value: '#7c5cff', rgb: '124, 92, 255' },
  { name: 'Coral', value: '#ff5a3c', rgb: '255, 90, 60' },
  { name: 'Pink', value: '#ff4784', rgb: '255, 71, 132' },
  { name: 'Sky', value: '#3b82f6', rgb: '59, 130, 246' },
  { name: 'Emerald', value: '#10b981', rgb: '16, 185, 129' },
  { name: 'Amber', value: '#f59e0b', rgb: '245, 158, 11' },
  { name: 'Teal', value: '#14b8a6', rgb: '20, 184, 166' },
  { name: 'Cyan', value: '#06b6d4', rgb: '6, 182, 212' },
  { name: 'Orange', value: '#f97316', rgb: '249, 115, 22' },
  { name: 'Rose', value: '#f43f5e', rgb: '244, 63, 94' },
  { name: 'Lime', value: '#84cc16', rgb: '132, 204, 22' },
  { name: 'Fuchsia', value: '#d946ef', rgb: '217, 70, 239' },
  { name: 'Indigo', value: '#6366f1', rgb: '99, 102, 241' },
  { name: 'Green', value: '#22c55e', rgb: '34, 197, 94' },
  { name: 'Red', value: '#ef4444', rgb: '239, 68, 68' },
  { name: 'Blue', value: '#0ea5e9', rgb: '14, 165, 233' },
];

export function ProfilePage() {
  const { currentUser, settings, updateSettings, users } = useApp();
  const [section, setSection] = useState<SettingsSection>('main');
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);

  // Edit form
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [status, setStatus] = useState(currentUser.status || '');

  const openSettings = (s: SettingsSection) => {
    setSection(s);
    setOpen(true);
  };

  const blockedUsers = users.filter(u => settings.blockedUsers.includes(u.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-20 px-4 pt-3 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-ink-50">Profile</h1>
          <button onClick={() => openSettings('main')} className="icon-btn">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="relative px-4 pt-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-violet-coral opacity-10" />

          <div className="relative flex flex-col items-center">
            <button onClick={() => setEditingProfile(true)} className="relative group">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={96} />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-violet-coral flex items-center justify-center border-3 border-ink-900 shadow-glow">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>

            <div className="flex items-center gap-1.5 mt-3">
              <h2 className="font-display text-xl font-bold text-ink-50">{currentUser.name}</h2>
              {currentUser.isVerified && (
                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-violet-400">{currentUser.username}</p>
            <p className="text-xs text-ink-300 mt-1 text-center max-w-xs">{currentUser.bio}</p>
            {currentUser.status && (
              <div className="mt-2 px-3 py-1 rounded-full bg-white/5 text-xs text-ink-200">
                {currentUser.status}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink-50">248</p>
              <p className="text-2xs text-ink-300">Contacts</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink-50">12</p>
              <p className="text-2xs text-ink-300">Groups</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-lg font-bold text-ink-50">5</p>
              <p className="text-2xs text-ink-300">Channels</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 py-2">
          <button
            onClick={() => setEditingProfile(true)}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 hover:border-white/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-ink-50">Edit Profile</p>
              <p className="text-xs text-ink-300">Update your name, bio, and photo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-400" />
          </button>
        </div>

        {/* Settings list */}
        <div className="px-4 py-2 space-y-1">
          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide px-1 pt-2 pb-1">Settings</p>

          <SettingsRow
            icon={Shield}
            label="Privacy & Security"
            desc="Phone number, last seen, blocked users"
            onClick={() => openSettings('privacy')}
            iconColor="text-coral-400"
            iconBg="bg-coral-500/20"
          />
          <SettingsRow
            icon={Bell}
            label="Notifications"
            desc="Message and call alerts"
            onClick={() => openSettings('notifications')}
            iconColor="text-violet-400"
            iconBg="bg-violet-600/20"
          />
          <SettingsRow
            icon={Palette}
            label="Appearance"
            desc="Dark mode, accent color"
            onClick={() => openSettings('appearance')}
            iconColor="text-pink-400"
            iconBg="bg-pink-500/20"
          />

          <div className="h-2" />

          <SettingsRow
            icon={CircleHelp}
            label="Help & Support"
            desc="FAQ, contact us, report a bug"
            onClick={() => window.open('https://t.me/novajared', '_blank')}
            iconColor="text-ink-300"
            iconBg="bg-white/5"
          />
          <SettingsRow
            icon={LogOut}
            label="Log Out"
            desc="Sign out of your account"
            onClick={() => {}}
            iconColor="text-error-400"
            iconBg="bg-error-500/20"
          />
        </div>

        <div className="px-4 py-6 text-center">
          <p className="text-2xs text-ink-400">Ess Gram v1.0.0 · Your people. Your space.</p>
        </div>

        <div className="h-24" />
      </div>

      {/* Settings sheet */}
      <BottomSheet
        open={open}
        onClose={() => { setOpen(false); setSection('main'); }}
        title={section === 'main' ? 'Settings' : section === 'privacy' ? 'Privacy & Security' : section === 'notifications' ? 'Notifications' : 'Appearance'}
      >
        {section === 'main' && (
          <div className="px-2 py-2 pb-6">
            <SettingsRow icon={Shield} label="Privacy & Security" onClick={() => setSection('privacy')} iconColor="text-coral-400" iconBg="bg-coral-500/20" />
            <SettingsRow icon={Bell} label="Notifications" onClick={() => setSection('notifications')} iconColor="text-violet-400" iconBg="bg-violet-600/20" />
            <SettingsRow icon={Palette} label="Appearance" onClick={() => setSection('appearance')} iconColor="text-pink-400" iconBg="bg-pink-500/20" />
            <SettingsRow icon={CircleHelp} label="Help & Support" onClick={() => window.open('https://t.me/novajared', '_blank')} iconColor="text-ink-300" iconBg="bg-white/5" />
            <SettingsRow icon={LogOut} label="Log Out" onClick={() => {}} iconColor="text-error-400" iconBg="bg-error-500/20" />
          </div>
        )}

        {section === 'privacy' && (
          <div className="px-2 py-2 pb-6 space-y-1">
            <ToggleRow
              icon={Phone}
              label="Show Phone Number"
              desc="Let others see your phone number"
              value={settings.showPhoneNumber}
              onChange={v => updateSettings({ showPhoneNumber: v })}
              iconColor="text-coral-400"
              iconBg="bg-coral-500/20"
            />
            <ToggleRow
              icon={AtSign}
              label="Username Visibility"
              desc="Allow people to find you by username"
              value={settings.usernameVisible}
              onChange={v => updateSettings({ usernameVisible: v })}
              iconColor="text-violet-400"
              iconBg="bg-violet-600/20"
            />
            <ToggleRow
              icon={Camera}
              label="Profile Photo Visibility"
              desc="Show your photo to everyone"
              value={settings.profilePhotoVisible}
              onChange={v => updateSettings({ profilePhotoVisible: v })}
              iconColor="text-pink-400"
              iconBg="bg-pink-500/20"
            />
            <ToggleRow
              icon={Eye}
              label="Last Seen"
              desc="Show when you were last active"
              value={settings.lastSeenVisible}
              onChange={v => updateSettings({ lastSeenVisible: v })}
              iconColor="text-sky-400"
              iconBg="bg-sky-500/20"
            />
            <ToggleRow
              icon={Check}
              label="Read Receipts"
              desc="Send read confirmations"
              value={settings.readReceipts}
              onChange={v => updateSettings({ readReceipts: v })}
              iconColor="text-success-400"
              iconBg="bg-success-500/20"
            />
            <ToggleRow
              icon={Lock}
              label="Two-Step Verification"
              desc="Add an extra layer of security"
              value={settings.twoStepVerification}
              onChange={v => updateSettings({ twoStepVerification: v })}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/20"
            />

            <div className="h-2" />
            <button
              onClick={() => setBlockedOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-error-500/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-error-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink-50">Blocked Users</p>
                <p className="text-xs text-ink-300">{blockedUsers.length} blocked</p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-400" />
            </button>
          </div>
        )}

        {section === 'notifications' && (
          <div className="px-2 py-2 pb-6 space-y-1">
            <ToggleRow
              icon={Bell}
              label="Push Notifications"
              desc="Receive alerts for new messages"
              value={settings.notifications}
              onChange={v => updateSettings({ notifications: v })}
              iconColor="text-violet-400"
              iconBg="bg-violet-600/20"
            />
          </div>
        )}

        {section === 'appearance' && (
          <div className="px-4 py-3 pb-6">
            <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Dark Mode</p>
            <ToggleRow
              icon={Moon}
              label="Dark Mode"
              desc="Use dark theme"
              value={settings.darkMode}
              onChange={v => updateSettings({ darkMode: v })}
              iconColor="text-violet-400"
              iconBg="bg-violet-600/20"
            />

            <div className="h-4" />
            <p className="text-xs font-semibold text-ink-300 uppercase tracking-wide mb-3">Accent Color</p>
            <div className="grid grid-cols-3 gap-3">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => {
                    updateSettings({ accentColor: color.value });
                    document.documentElement.style.setProperty('--accent', color.value);
                    document.documentElement.style.setProperty('--accent-rgb', color.rgb);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all',
                    settings.accentColor === color.value
                      ? 'border-white/20 bg-white/5'
                      : 'border-white/5 hover:bg-white/5'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      settings.accentColor === color.value && 'ring-2 ring-white/30 ring-offset-2 ring-offset-ink-800'
                    )}
                    style={{ background: color.value }}
                  >
                    {settings.accentColor === color.value && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <span className="text-xs text-ink-200">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Edit profile modal */}
      <Modal open={editingProfile} onClose={() => setEditingProfile(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-ink-50">Edit Profile</h3>
            <button onClick={() => setEditingProfile(false)} className="icon-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={72} />
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-violet-coral flex items-center justify-center border-2 border-ink-700">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1 block">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="glass-input w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1 block">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} maxLength={120} className="glass-input w-full px-4 py-3 text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1 block">Status</label>
              <input value={status} onChange={e => setStatus(e.target.value)} className="glass-input w-full px-4 py-3 text-sm" />
            </div>
          </div>

          <button
            onClick={() => setEditingProfile(false)}
            className="btn-accent w-full mt-5"
          >
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Blocked users modal */}
      <Modal open={blockedOpen} onClose={() => setBlockedOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-ink-50">Blocked Users</h3>
            <button onClick={() => setBlockedOpen(false)} className="icon-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mx-auto mb-3">
                <UserX className="w-6 h-6 text-ink-300" />
              </div>
              <p className="text-sm text-ink-300">You haven't blocked anyone.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {blockedUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl glass-card">
                  <Avatar src={u.avatar} name={u.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-50 truncate">{u.name}</p>
                    <p className="text-xs text-ink-300 truncate">{u.username}</p>
                  </div>
                  <button className="text-xs font-semibold text-violet-400 px-3 py-1.5 rounded-full hover:bg-violet-600/10 transition-colors">
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function SettingsRow({
  icon: Icon, label, desc, onClick, iconColor, iconBg,
}: {
  icon: typeof Settings;
  label: string;
  desc?: string;
  onClick: () => void;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-50">{label}</p>
        {desc && <p className="text-xs text-ink-300 truncate">{desc}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
    </button>
  );
}

function ToggleRow({
  icon: Icon, label, desc, value, onChange, iconColor, iconBg,
}: {
  icon: typeof Settings;
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-50">{label}</p>
        {desc && <p className="text-xs text-ink-300 truncate">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'w-11 h-6 rounded-full transition-all relative shrink-0',
          value ? 'accent-bg' : 'bg-ink-500'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            value ? 'left-[22px]' : 'left-0.5'
          )}
        />
      </button>
    </div>
  );
}
