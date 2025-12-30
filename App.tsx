
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { supabase } from './services/supabaseClient';
import { store } from './services/storeService';
import { Button } from './components/Button';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { ChatView } from './views/ChatView';
import { SavingsView } from './views/SavingsView';
import { GalleryView } from './views/GalleryView';
import { AdminView } from './views/AdminView';
import { SearchView } from './views/SearchView';
import { GameView } from './views/GameView';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wallet, 
  Image as ImageIcon, 
  Settings, 
  Search, 
  LogOut,
  Infinity,
  Gamepad2,
  Loader2
} from 'lucide-react';

type View = 'dashboard' | 'chat' | 'savings' | 'gallery' | 'admin' | 'search' | 'game';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        store.getCurrentProfile(session.user.id).then(profile => {
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        store.getCurrentProfile(session.user.id).then(profile => setUser(profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Infinity size={48} className="text-indigo-500 animate-pulse" />
        <Loader2 size={24} className="text-slate-700 animate-spin" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Establishing Neural Connection...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-500 ${
        currentView === view ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <div className={`p-2.5 rounded-2xl transition-all duration-500 ${currentView === view ? 'bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : ''}`}>
        <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 md:pb-0 md:pl-72 flex flex-col">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 glass border-r border-white/5 flex-col p-8 z-50">
        <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:rotate-12 transition-all duration-500">
            <Infinity size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter">COUPLE<span className="text-indigo-400">CONNECT</span></h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Cloud Sync Active</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard size={20}/>} label="Beranda" />
          <SidebarLink active={currentView === 'search'} onClick={() => setCurrentView('search')} icon={<Search size={20}/>} label="Partner Link" />
          <SidebarLink active={currentView === 'chat'} onClick={() => setCurrentView('chat')} icon={<MessageSquare size={20}/>} label="Neural Chat" />
          <SidebarLink active={currentView === 'game'} onClick={() => setCurrentView('game')} icon={<Gamepad2 size={20}/>} label="Game Bersama" />
          <SidebarLink active={currentView === 'savings'} onClick={() => setCurrentView('savings')} icon={<Wallet size={20}/>} label="Digital Vault" />
          <SidebarLink active={currentView === 'gallery'} onClick={() => setCurrentView('gallery')} icon={<ImageIcon size={20}/>} label="Memories" />
          {user.role === 'admin' && (
            <SidebarLink active={currentView === 'admin'} onClick={() => setCurrentView('admin')} icon={<Settings size={20}/>} label="Admin Control" />
          )}
        </nav>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-4 p-4 glass rounded-[28px] border border-indigo-500/10 mb-6 bg-indigo-500/5 group hover:bg-indigo-500/10 transition-all duration-500">
            <img src={user.photoUrl} alt={user.displayName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all" />
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-indigo-400/70 truncate font-black uppercase tracking-widest">{user.userId}</p>
            </div>
          </div>
          <Button variant="ghost" fullWidth onClick={handleLogout} className="justify-start gap-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20">
            <LogOut size={18} />
            <span className="font-black uppercase tracking-widest text-[10px]">Terminate Session</span>
          </Button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Infinity size={22} />
          </div>
          <span className="font-black text-white tracking-tighter uppercase text-sm">Connect</span>
        </div>
        <img src={user.photoUrl} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 animate-in fade-in duration-1000">
        {currentView === 'dashboard' && <DashboardView user={user} onNavigate={setCurrentView} />}
        {currentView === 'search' && <SearchView currentUser={user} onStartChat={() => setCurrentView('chat')} />}
        {currentView === 'chat' && <ChatView currentUser={user} onNavigate={setCurrentView} />}
        {currentView === 'game' && <GameView user={user} />}
        {currentView === 'savings' && <SavingsView currentUser={user} />}
        {currentView === 'gallery' && <GalleryView currentUser={user} />}
        {currentView === 'admin' && user.role === 'admin' && <AdminView />}
      </main>

      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-[60] glass border border-white/10 rounded-[32px] p-2 flex justify-between items-center shadow-2xl">
        <NavItem view="dashboard" icon={LayoutDashboard} label="Home" />
        <NavItem view="chat" icon={MessageSquare} label="Chat" />
        <NavItem view="game" icon={Gamepad2} label="Game" />
        <NavItem view="savings" icon={Wallet} label="Vault" />
        <NavItem view="gallery" icon={ImageIcon} label="Gallery" />
      </nav>
    </div>
  );
};

const SidebarLink = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
      active ? 'bg-indigo-600/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>}
    <span className={`${active ? 'text-indigo-400 scale-110 shadow-indigo-500/50' : 'group-hover:scale-110'} transition-all duration-500`}>{icon}</span>
    <span className={`font-black uppercase tracking-widest text-[11px] ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
  </button>
);

export default App;
