import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/store';
import { AuthFlow } from '@/components/AuthFlow';
import { ChatList } from '@/components/ChatList';
import { ChatView } from '@/components/ChatView';
import { ChannelView } from '@/components/ChannelView';
import { DiscoverPage } from '@/components/DiscoverPage';
import { CreateSheet } from '@/components/CreateSheet';
import { CallsPage, CallOverlay } from '@/components/CallsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { SpaceView } from '@/components/SpaceView';
import { MomentsViewer } from '@/components/MomentsViewer';
import { NavBar } from '@/components/NavBar';
import { Spinner } from '@/components/ui';
import { Send } from 'lucide-react';

type View =
  | { type: 'tab' }
  | { type: 'chat'; chatId: string }
  | { type: 'channel'; chatId: string }
  | { type: 'space'; spaceId: string };

function AppContent() {
  const { authStage, activeTab, chats, settings } = useApp();
  const [view, setView] = useState<View>({ type: 'tab' });
  const [showCreate, setShowCreate] = useState(false);
  const [momentViewer, setMomentViewer] = useState<{ userId: string; index: number } | null>(null);
  const [callOverlay, setCallOverlay] = useState<{ userId: string; type: 'voice' | 'video' } | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    const rgb = hexToRgb(settings.accentColor);
    if (rgb) document.documentElement.style.setProperty('--accent-rgb', rgb);
  }, [settings.darkMode, settings.accentColor]);

  if (authStage === 'loading') {
    return (
      <div className="fixed inset-0 max-w-md mx-auto bg-ink-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 50%, #10b981 100%)' }}>
            <Send className="w-7 h-7 text-white -rotate-12" fill="white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Spinner size={18} />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (authStage !== 'authenticated') {
    return <AuthFlow />;
  }

  const openChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat?.type === 'channel') {
      setView({ type: 'channel', chatId });
    } else if (chat?.spaceId) {
      setView({ type: 'space', spaceId: chat.spaceId });
    } else {
      setView({ type: 'chat', chatId });
    }
  };

  const goBack = () => setView({ type: 'tab' });

  // Moments viewer overlay
  if (momentViewer) {
    return (
      <>
        <AppScreen />
        <MomentsViewer
          userId={momentViewer.userId}
          startIndex={momentViewer.index}
          onClose={() => setMomentViewer(null)}
        />
      </>
    );
  }

  // Call overlay
  if (callOverlay) {
    return (
      <>
        <AppScreen />
        <CallOverlay
          userId={callOverlay.userId}
          type={callOverlay.type}
          onEnd={() => setCallOverlay(null)}
        />
      </>
    );
  }

  function AppScreen() {
    if (view.type === 'chat') {
      return (
        <ChatView
          chatId={view.chatId}
          onBack={goBack}
          onCall={(type) => {
            const userId = view.chatId.replace('c_', 'u_');
            setCallOverlay({ userId, type });
          }}
        />
      );
    }

    if (view.type === 'channel') {
      return <ChannelView chatId={view.chatId} onBack={goBack} />;
    }

    if (view.type === 'space') {
      return <SpaceView spaceId={view.spaceId} onBack={goBack} onOpenChat={openChat} />;
    }

    // Tab views
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ChatList
              onOpenChat={openChat}
              onOpenMoment={(userId, index) => setMomentViewer({ userId, index })}
              onSearchFocus={() => {}}
            />
          )}
          {activeTab === 'discover' && (
            <DiscoverPage onOpenChannel={(chatId) => setView({ type: 'channel', chatId })} />
          )}
          {activeTab === 'calls' && (
            <CallsPage onCall={(userId, type) => setCallOverlay({ userId, type })} />
          )}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
        <NavBar onCreate={() => setShowCreate(true)} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-ink-950 overflow-hidden">
      <AppScreen />
      <CreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onOpenChat={(chatId) => {
          setShowCreate(false);
          openChat(chatId);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function hexToRgb(hex: string): string | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default App;
