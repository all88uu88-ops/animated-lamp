
import React, { useState, useEffect, useRef } from 'react';
import { AppState, User, Post, ClubLocation, Comment, Theme, Idea, IdeaType, Specialization, UserStatus, Notification, Mood, BadgeDefinition, Story, HelpRequest, LiveSession } from './types';
import { INITIAL_USERS, INITIAL_LOCATIONS, INITIAL_POSTS, INITIAL_IDEAS, BADGE_DEFINITIONS, SOUNDS, INITIAL_STORIES, INITIAL_HELP_REQUESTS } from './constants';
import PostCard, { SpecIcon } from './components/PostCard';
import AdminDashboard from './components/AdminDashboard';
import IdeaCard from './components/IdeaCard';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import StoryViewer from './components/StoryViewer';
import IdentityReveal from './components/IdentityReveal';
import CinematicPreview from './components/CinematicPreview';
import CinematicEntrance from './components/CinematicEntrance';
import CreativeHub from './modules/creative-hub/CreativeHub';
import ChatSystem from './components/ChatSystem';
import LiveDashboard from './components/LiveDashboard';
import LiveRoom from './components/LiveRoom';
import { NotificationToast, NotificationCenter } from './components/NotificationSystem';
import { moderateContent } from './services/geminiService';
import { 
  Users, 
  LayoutGrid, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  UserCircle,
  Image as ImageIcon,
  X,
  Loader2, 
  Camera,
  User as UserIcon,
  Search,
  Plus,
  Sun,
  Moon,
  Lightbulb,
  ChevronDown,
  Sparkles,
  Bell,
  Heart,
  MessageCircle,
  Shield,
  Volume2,
  VolumeX,
  Trash2,
  MessageSquare,
  Zap,
  Activity,
  Focus,
  Disc,
  Menu,
  Scan,
  Radio,
  Eye,
  Settings,
  Briefcase,
  ArrowRight,
  Globe,
  Film
} from 'lucide-react';

const COMMON_EMOJIS = ['😊', '😂', '🔥', '❤️', '👏', '🎬', '📸', '✨', '🎥', '🙌', '💡', '💯'];

// THE LOGO URL
const CLUB_LOGO = "https://raw.githubusercontent.com/user-attachments/assets/7594582e-9d22-491d-92a8-06797a39d892";

const CinematicWrapper: React.FC<{ children: React.ReactNode, showHud?: boolean }> = ({ children, showHud = true }) => (
  <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-500">
    <div className="film-grain"></div>
    {showHud && (
      <div className="fixed inset-0 z-[60] pointer-events-none p-6 md:p-10 opacity-10 dark:opacity-30 select-none">
         <div className="w-full h-full border border-slate-900/10 dark:border-white/5 rounded-[3rem] relative transition-colors duration-500">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[9px] font-mono tracking-widest text-slate-500 dark:text-white/60 bg-white/50 dark:bg-black/50 px-4 py-1 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-sm transition-colors duration-500">
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>REC</span>
               <span>ISO 400</span>
               <span>4K 60FPS</span>
               <span className="text-emerald-500 dark:text-emerald-400">LIVE</span>
            </div>
         </div>
      </div>
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

const CinematicInput: React.FC<{
  id: string; type?: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType; isPassword?: boolean; dimmed?: boolean; onFocus?: () => void; onBlur?: () => void;
}> = ({ id, type = 'text', label, value, onChange, icon: Icon, isPassword = false, dimmed = false, onFocus, onBlur }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputType = isPassword ? 'password' : type;
  return (
    <div className={`relative group transition-all duration-500 ${dimmed ? 'opacity-30 scale-95 blur-[2px]' : ''}`}>
      <div className={`relative bg-white/60 dark:bg-[#050505]/60 backdrop-blur-xl border rounded-2xl transition-all duration-300 overflow-hidden ${isFocused ? 'border-indigo-500/50 shadow-lg' : 'border-slate-200 dark:border-white/10'}`}>
        <label htmlFor={id} className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 font-black uppercase tracking-widest ${isFocused || value ? 'top-2.5 text-[8px] text-indigo-500 translate-y-0' : 'top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-white/30'}`}>{label}</label>
        <input id={id} type={inputType} value={value} onChange={onChange} onFocus={() => {setIsFocused(true); onFocus?.();}} onBlur={() => {setIsFocused(false); onBlur?.();}} className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-bold px-4 pt-6 pb-2.5 outline-none relative z-10" autoComplete="off" />
        {Icon && <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-indigo-500' : 'text-slate-400 dark:text-white/30'}`}><Icon size={16} /></div>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('mediaClubState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.theme = parsed.theme || 'dark';
        parsed.liveSessions = parsed.liveSessions || []; // Ensure liveSessions exists
        return parsed;
      } catch (e) {}
    }
    return {
      users: INITIAL_USERS.map(u => ({ ...u, status: 'ACTIVE' })),
      posts: INITIAL_POSTS,
      ideas: INITIAL_IDEAS,
      locations: INITIAL_LOCATIONS,
      stories: INITIAL_STORIES,
      notifications: [],
      portfolioItems: [],
      socialLinks: [],
      helpRequests: INITIAL_HELP_REQUESTS,
      liveSessions: [],
      currentUser: null,
      theme: 'dark',
      settings: { cinematicEntrance: true }
    };
  });

  const [view, setView] = useState<'FEED' | 'MEMBERS' | 'LOCATIONS' | 'PROFILE' | 'ADMIN' | 'IDEAS' | 'CREATIVE_HUB' | 'COMMUNICATIONS' | 'LIVE_DASHBOARD' | 'LIVE_ROOM'>('FEED');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newPostForm, setNewPostForm] = useState({ content: '', mediaType: 'image' as 'image' | 'video', mediaData: '' });
  const [newIdeaForm, setNewIdeaForm] = useState({ title: '', description: '', type: 'تقرير' as IdeaType, showModal: false });
  const [isUploading, setIsUploading] = useState(false);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPhase, setLoginPhase] = useState<'HERO' | 'FORM' | 'AUTHENTICATING' | 'SUCCESS' | 'REVEAL' | 'COMPLETED'>('HERO');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.theme]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('mediaClubState', JSON.stringify(state));
  }, [state]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginPhase('AUTHENTICATING');
    setTimeout(() => {
      const user = state.users.find(u => u.username.toLowerCase() === loginForm.username.toLowerCase() && u.password === loginForm.password);
      if (user) {
        setState(prev => ({ ...prev, currentUser: { ...user, isOnline: true } }));
        setLoginPhase('SUCCESS');
        setTimeout(() => setLoginPhase('REVEAL'), 800);
      } else {
        alert('Unauthorized Access Attempt.');
        setLoginPhase('FORM');
      }
      setLoginLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    setView('FEED');
    setLoginPhase('HERO');
  };

  // --- Live Session Handlers ---
  const handleCreateSession = (title: string, description: string, scheduledFor?: number) => {
    if (!state.currentUser) return;
    const newSession: LiveSession = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: scheduledFor ? 'SCHEDULED' : 'LIVE',
      hostId: state.currentUser.id,
      hostName: state.currentUser.fullName,
      hostAvatar: state.currentUser.avatar,
      startedAt: scheduledFor ? undefined : Date.now(),
      scheduledFor,
      participants: [],
      isLocked: false
    };
    
    setState(prev => ({ ...prev, liveSessions: [newSession, ...prev.liveSessions] }));
    
    if (!scheduledFor) {
      setActiveSessionId(newSession.id);
      setView('LIVE_ROOM');
    }
  };

  const handleJoinSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setView('LIVE_ROOM');
  };

  const handleEndSession = () => {
    if (!activeSessionId) return;
    setState(prev => ({
      ...prev,
      liveSessions: prev.liveSessions.map(s => s.id === activeSessionId ? { ...s, status: 'ENDED', endedAt: Date.now() } : s)
    }));
    setActiveSessionId(null);
    setView('LIVE_DASHBOARD');
  };

  const handleLeaveSession = () => {
    setActiveSessionId(null);
    setView('LIVE_DASHBOARD');
  };

  const isLoggedIn = !!state.currentUser;
  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <CinematicWrapper showHud={isLoggedIn && view !== 'LIVE_ROOM'}>
      {isLoggedIn && loginPhase === 'REVEAL' && (
        <IdentityReveal user={state.currentUser!} onEnter={() => setLoginPhase('COMPLETED')} />
      )}

      {isLoggedIn && showPreview && state.currentUser && (
        <CinematicPreview draftContent={newPostForm} currentUser={state.currentUser} onClose={() => setShowPreview(false)} onPublish={() => {}} />
      )}

      {isLoggedIn ? (
        <div className={`transition-all duration-1000 ${loginPhase === 'REVEAL' || showPreview ? 'blur-xl grayscale' : ''}`}>
          
          {/* Full Screen Live Room Overlay */}
          {view === 'LIVE_ROOM' && activeSessionId ? (
             <LiveRoom 
                session={state.liveSessions.find(s => s.id === activeSessionId)!}
                currentUser={state.currentUser!}
                onLeave={handleLeaveSession}
                onEndSession={handleEndSession}
             />
          ) : (
            <div className="flex flex-col lg:flex-row min-h-screen">
              <aside className="hidden lg:flex w-24 flex-col items-center fixed inset-y-0 right-0 z-50 py-8">
                <div className="glass-panel w-16 flex-1 rounded-[2rem] flex flex-col items-center py-6 gap-6 shadow-2xl bg-white/40 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                  <div className="w-10 h-10 mb-4 cursor-pointer hover:scale-110 transition-transform" onClick={() => setView('FEED')}>
                    <img src={CLUB_LOGO} alt="Club Logo" className="w-full h-full object-contain" />
                  </div>
                  <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    {[ 
                      { id: 'FEED', icon: LayoutGrid, label: 'Feed' }, 
                      { id: 'CREATIVE_HUB', icon: Briefcase, label: 'Creative Hub' },
                      { id: 'LIVE_DASHBOARD', icon: Radio, label: 'Studio' }, // New Studio Tab
                      { id: 'COMMUNICATIONS', icon: MessageSquare, label: 'Chat' },
                      { id: 'IDEAS', icon: Lightbulb, label: 'Ideas' }, 
                      { id: 'MEMBERS', icon: Users, label: 'Crew' }, 
                      { id: 'LOCATIONS', icon: MapPin, label: 'Sets' }, 
                      { id: 'ADMIN', icon: ShieldCheck, label: 'Admin', adminOnly: true }, 
                      { id: 'PROFILE', icon: UserCircle, label: 'Me' } 
                    ].map(item => {
                      if (item.adminOnly && state.currentUser?.role !== 'ADMIN') return null;
                      return (
                        <button key={item.id} onClick={() => setView(item.id as any)} className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all group relative ${view === item.id ? 'bg-white dark:bg-white text-indigo-600 dark:text-black shadow-xl scale-105' : 'text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/10'}`}>
                          <item.icon size={20} className={view === item.id && item.id === 'LIVE_DASHBOARD' ? 'text-red-600 animate-pulse' : ''} />
                          <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="flex flex-col gap-3 w-full px-2">
                    <button onClick={toggleTheme} className="w-full aspect-square rounded-xl flex items-center justify-center transition-all text-slate-500 dark:text-white/40 hover:text-amber-500">
                      {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} className="text-rose-500 hover:bg-rose-500/10 p-3 rounded-xl transition w-full flex justify-center"><LogOut size={20}/></button>
                  </div>
                </div>
              </aside>

              <div className="lg:hidden fixed top-0 left-0 right-0 z-50 p-4">
                <div className="glass-panel rounded-2xl p-4 flex justify-between items-center bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 shadow-lg">
                    <div className="flex items-center gap-3">
                      <img src={CLUB_LOGO} className="w-8 h-8 object-contain" />
                      <span className="font-black text-sm tracking-widest text-slate-900 dark:text-white">MEDIA CLUB</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><Menu /></button>
                </div>
                {mobileMenuOpen && (
                    <div className="glass-panel mt-2 rounded-2xl p-2 absolute left-4 right-4 flex flex-col gap-1 bg-white/95 dark:bg-black/90 shadow-2xl animate-in slide-in-from-top-2">
                      {['FEED', 'CREATIVE_HUB', 'LIVE_DASHBOARD', 'COMMUNICATIONS', 'IDEAS', 'MEMBERS', 'LOCATIONS', 'PROFILE'].map(id => (
                          <button key={id} onClick={() => { setView(id as any); setMobileMenuOpen(false); }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{id.replace('_', ' ')}</button>
                      ))}
                      <button onClick={handleLogout} className="flex items-center gap-4 p-3 rounded-xl text-rose-500 font-bold text-sm uppercase tracking-wider"><LogOut size={18}/> Logout</button>
                    </div>
                )}
              </div>

              <main className="flex-1 lg:mr-24 p-6 lg:p-10 pt-24 lg:pt-10 overflow-x-hidden relative z-10">
                <header className="hidden lg:flex justify-between items-center mb-10">
                  <div className="flex items-center gap-6">
                      <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-white/60 uppercase tracking-widest border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
                        <Focus size={14} className="text-indigo-500"/>
                        <span>MODE: <span className="text-slate-900 dark:text-white font-bold">{view}</span></span>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 relative">
                      <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        ONLINE: {state.users.filter(u => u.isOnline).length}
                      </div>
                      <div className="relative">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition group text-slate-600 dark:text-white">
                          <Bell size={20} className="group-hover:scale-110 transition"/>
                          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 cursor-pointer group glass-panel pl-4 pr-1 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-300 dark:hover:border-white/10" onClick={() => setView('PROFILE')}>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition">{state.currentUser!.fullName}</p>
                            <p className="text-[9px] text-slate-500 dark:text-white/40 font-mono tracking-wider uppercase">{state.currentUser!.specialization}</p>
                        </div>
                        <img src={state.currentUser!.avatar} className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-white/20 group-hover:border-indigo-500 transition shadow-sm" />
                      </div>
                  </div>
                </header>

                <CinematicEntrance active={state.settings.cinematicEntrance} viewKey={view}>
                  <div className="max-w-6xl mx-auto">
                    {view === 'FEED' && (
                      <div className="space-y-12">
                        <PersonalizedDashboard user={state.currentUser!} posts={state.posts} ideas={state.ideas} notifications={state.notifications} onNavigate={setView} />
                        <div className="space-y-12">
                          {state.posts.filter(p => p.status === 'APPROVED' || p.authorId === state.currentUser?.id).map(post => (
                              <PostCard key={post.id} post={post} currentUser={state.currentUser} allUsers={state.users} onLike={() => {}} onAddComment={() => {}} onDeleteComment={() => {}} isAdminView={state.currentUser?.role === 'ADMIN'} />
                          ))}
                        </div>
                      </div>
                    )}
                    {view === 'CREATIVE_HUB' && <CreativeHub currentUser={state.currentUser!} users={state.users} helpRequests={state.helpRequests} onAddRequest={() => {}} onUpdateRequest={() => {}} onUpdateUser={() => {}} />}
                    {view === 'COMMUNICATIONS' && <ChatSystem currentUser={state.currentUser!} />}
                    {view === 'LIVE_DASHBOARD' && (
                       <LiveDashboard 
                          sessions={state.liveSessions} 
                          currentUser={state.currentUser!} 
                          onJoinSession={handleJoinSession}
                          onCreateSession={handleCreateSession}
                       />
                    )}
                    {view === 'IDEAS' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {state.ideas.map(idea => <IdeaCard key={idea.id} idea={idea} currentUser={state.currentUser} onVote={() => {}} />)}
                      </div>
                    )}
                    {view === 'MEMBERS' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {state.users.map(user => (
                          <div key={user.id} className="glass-panel p-8 rounded-[2rem] flex flex-col items-center text-center hover:scale-105 transition-transform border border-slate-200 dark:border-white/5">
                              <img src={user.avatar} className="w-24 h-24 rounded-[1.5rem] object-cover mb-6 ring-2 ring-indigo-500/20 shadow-xl" />
                              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{user.fullName}</h3>
                              <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{user.specialization}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {view === 'LOCATIONS' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {state.locations.map(loc => (
                          <div key={loc.id} className="group relative h-80 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl">
                              <img src={loc.image} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-1000" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                              <div className="absolute bottom-0 left-0 p-10 w-full">
                                <h3 className="text-3xl font-black text-white mb-2">{loc.name}</h3>
                                <p className="text-white/60 text-sm font-medium">{loc.description}</p>
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {view === 'PROFILE' && (
                      <div className="glass-panel p-12 rounded-[3rem] text-center max-w-4xl mx-auto border border-slate-200 dark:border-white/10 shadow-2xl bg-white/50 dark:bg-transparent">
                          <div className="inline-block relative mb-8 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 rounded-[2.5rem] blur opacity-30 dark:opacity-50 group-hover:opacity-80 transition duration-700"></div>
                            <img src={state.currentUser!.avatar} className="w-40 h-40 rounded-[2.2rem] object-cover border-4 border-white dark:border-black relative z-10 shadow-xl" />
                          </div>
                          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{state.currentUser!.fullName}</h2>
                          <div className="flex items-center justify-center gap-2 mb-8">
                            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded uppercase tracking-[0.2em] border border-indigo-500/20">{state.currentUser!.role}</span>
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 px-3 py-1 rounded uppercase tracking-[0.2em] border border-slate-200 dark:border-white/5">{state.currentUser!.specialization}</span>
                          </div>
                          <p className="text-slate-600 dark:text-white/60 max-w-md mx-auto leading-relaxed">{state.currentUser!.bio}</p>
                      </div>
                    )}
                  </div>
                </CinematicEntrance>
              </main>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-screen w-full flex flex-col overflow-y-auto custom-scrollbar mesh-bg snap-y snap-mandatory">
          {/* TOP NAVIGATION BAR */}
          <nav className="fixed top-0 left-0 right-0 z-[60] p-6 md:p-8 flex justify-between items-center bg-black/10 backdrop-blur-md border-b border-white/5">
             <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <img src={CLUB_LOGO} alt="Club Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110" />
                <span className="text-white font-black tracking-[0.2em] text-xs uppercase hidden sm:block">Al Ahliah Media Club</span>
             </div>
             <div className="flex items-center gap-6">
                <button onClick={() => setLoginPhase('FORM')} className="px-6 py-2.5 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Agent Access</button>
             </div>
          </nav>

          {/* HERO SECTION */}
          {loginPhase === 'HERO' && (
            <>
              <section className="relative h-screen w-full flex items-center justify-center shrink-0 snap-start">
                <div className="relative z-10 text-center px-6 max-w-5xl animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
                  <div className="hero-glow"></div>
                  
                  <div className="mb-12 relative group">
                    <div className="absolute -inset-8 bg-indigo-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <img 
                      src={CLUB_LOGO} 
                      alt="Branding" 
                      className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-[bounce_5s_infinite_ease-in-out]" 
                    />
                  </div>

                  <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter animated-text-gradient drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Al Ahliah Media Club
                  </h1>

                  <p className="text-white/60 text-sm md:text-xl font-black uppercase tracking-[0.8em] mb-16 max-w-2xl leading-relaxed">
                    Create <span className="text-indigo-400 opacity-100">•</span> Capture <span className="text-indigo-400 opacity-100">•</span> Inspire
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                    <button 
                      onClick={() => setLoginPhase('FORM')}
                      className="light-sweep px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all w-full sm:w-64 border border-white"
                    >
                      Join The Club
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 animate-bounce">
                  <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white">Scroll</span>
                  <ChevronDown size={14} className="text-white" />
                </div>
              </section>
            </>
          )}

          {/* LOGIN FORM SECTION */}
          {loginPhase === 'FORM' && (
            <div className="h-screen w-full flex items-center justify-center p-6">
              <div className="relative z-20 w-full max-w-sm p-8 glass-panel rounded-[2.5rem] border border-white/10 animate-in slide-in-from-bottom-8 duration-700">
                 <button onClick={() => setLoginPhase('HERO')} className="absolute -top-12 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><ArrowRight size={14} className="rotate-180"/> Return to Hub</button>
                 <div className="text-center mb-10">
                    <img src={CLUB_LOGO} className="w-20 h-20 mx-auto mb-6 drop-shadow-xl" />
                    <h2 className="text-2xl font-black text-white tracking-tighter">AGENT ACCESS</h2>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-mono">Encrypted Session Only</p>
                 </div>
                 <form onSubmit={handleLogin} className="space-y-6">
                    <CinematicInput id="username" label="Member ID" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} icon={UserIcon} />
                    <CinematicInput id="password" label="Access Key" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} isPassword icon={Shield} />
                    <button 
                      type="submit" 
                      disabled={loginLoading}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                    >
                      {loginLoading ? <Loader2 className="animate-spin" size={18}/> : 'Initialize Session'}
                    </button>
                 </form>
              </div>
            </div>
          )}

          {/* AUTH LOADING SECTION */}
          {loginPhase === 'AUTHENTICATING' && (
             <div className="h-screen w-full flex items-center justify-center relative z-20 text-center space-y-8 animate-in zoom-in duration-500">
                <div>
                  <div className="relative w-32 h-32 mx-auto mb-8">
                     <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                     <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                     <img src={CLUB_LOGO} className="absolute inset-4 w-24 h-24 object-contain grayscale opacity-50" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tighter animate-pulse uppercase">Verifying Credentials</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-2">Data Link Secure</p>
                </div>
             </div>
          )}
        </div>
      )}
    </CinematicWrapper>
  );
};

export default App;
