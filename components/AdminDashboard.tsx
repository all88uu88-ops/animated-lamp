
import React, { useState } from 'react';
import { User, AppState, Idea, Specialization, ClubLocation, Notification, IdeaStatus, SocialLink } from '../types';
import { Shield, Users, FileClock, Trash2, CheckCircle2, XCircle, UserX, Lightbulb, MessageSquare, ChevronDown, BarChart3, TrendingUp, Heart, Bell, Megaphone, Gift, Zap, Volume2, Activity, Radio, Cpu, Lock, MapPin, Plus, Save, UserPlus, Film, Camera, Edit3, Copy, RefreshCw, Link, Globe } from 'lucide-react';
import { SpecIcon } from './PostCard';

interface AdminDashboardProps {
  state: AppState;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onPostAction: (postId: string, action: 'APPROVE' | 'DELETE') => void;
  onUpdateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  onUpdateLocation?: (locId: string, updates: Partial<ClubLocation>) => void;
  onAddLocation?: (name: string, description: string, image: string) => void;
  onDeleteLocation?: (locId: string) => void;
  onCreateUser?: (newUser: User) => void;
  onSendNotification?: (recipientId: string, type: Notification['type'], content: string, sound: string) => void;
  onAddSocialLink?: (link: Omit<SocialLink, 'id'>) => void;
  onDeleteSocialLink?: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onUpdateUser, onDeleteUser, onPostAction, onUpdateIdea, onUpdateLocation, onAddLocation, onDeleteLocation, onCreateUser, onSendNotification, onAddSocialLink, onDeleteSocialLink }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PERSONNEL' | 'TRANSMISSIONS' | 'INTEL' | 'OPERATIONS' | 'BROADCAST' | 'LINKS'>('OVERVIEW');
  
  // Forms State
  const [newUserForm, setNewUserForm] = useState({ username: '', fullName: '', password: '', role: 'MEMBER' as 'MEMBER' | 'ADMIN', specialization: 'عام' as Specialization, show: false });
  const [newLocForm, setNewLocForm] = useState({ name: '', description: '', image: '', show: false });
  const [notifForm, setNotifForm] = useState({ recipientId: 'ALL', type: 'ANNOUNCEMENT' as Notification['type'], content: '', sound: 'default' });
  const [newLinkForm, setNewLinkForm] = useState({ platform: 'instagram' as SocialLink['platform'], url: '', label: '' });
  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [ideaNote, setIdeaNote] = useState('');

  const stats = {
    totalPosts: state.posts.length,
    pendingPosts: state.posts.filter(p => p.status === 'PENDING').length,
    activeMembers: state.users.filter(u => u.isOnline).length,
    totalEngagement: state.posts.reduce((acc, curr) => acc + curr.likes.length + curr.comments.length, 0),
    totalUsers: state.users.length,
    totalLocations: state.locations.length
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for(let i=0; i<12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
  };

  const handleOpenRecruitModal = () => {
    setNewUserForm({ 
        username: '', 
        fullName: '', 
        password: generatePassword(), 
        role: 'MEMBER', 
        specialization: 'عام', 
        show: true 
    });
  };

  const handleCopyCredentials = () => {
      const text = `
🔒 MEDIA CLUB ACCESS
-----------------------
Agent: ${newUserForm.fullName || 'N/A'}
Username: ${newUserForm.username}
Password: ${newUserForm.password}
-----------------------
`.trim();
      navigator.clipboard.writeText(text);
      alert("✅ Credentials copied to clipboard!");
  };

  const handleCreateUser = () => {
    if (!newUserForm.username || !newUserForm.password || !newUserForm.fullName) return;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUserForm.username,
      password: newUserForm.password,
      fullName: newUserForm.fullName,
      role: newUserForm.role,
      specialization: newUserForm.specialization,
      avatar: `https://picsum.photos/seed/${newUserForm.username}/200`,
      bio: 'New recruit.',
      status: 'ACTIVE',
      isOnline: false,
      lastActive: Date.now(),
      badges: []
    };
    onCreateUser?.(newUser);
    setNewUserForm({ ...newUserForm, username: '', fullName: '', password: '', show: false });
  };

  const handleCreateLocation = () => {
    if (!newLocForm.name) return;
    onAddLocation?.(newLocForm.name, newLocForm.description, newLocForm.image);
    setNewLocForm({ name: '', description: '', image: '', show: false });
  };

  const handleSendAlert = () => {
    if (!notifForm.content.trim()) return;
    onSendNotification?.(notifForm.recipientId, notifForm.type, notifForm.content, notifForm.sound);
    setNotifForm(prev => ({ ...prev, content: '' }));
    alert('Signal transmitted successfully.');
  };

  const handleAddLink = () => {
     if (!newLinkForm.url || !newLinkForm.label) return;
     onAddSocialLink?.(newLinkForm);
     setNewLinkForm({ platform: 'instagram', url: '', label: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 min-h-screen">
      
      {/* COMMAND CENTER HEADER */}
      <div className="glass-panel p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/60 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 dark:bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="relative">
                <div className="absolute inset-0 bg-red-500 dark:bg-red-600 blur-xl opacity-30 dark:opacity-50 animate-pulse"></div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-950 flex items-center justify-center border border-red-400/30 dark:border-red-500/30 relative z-10 shadow-lg">
                   <Shield className="text-white" size={36} strokeWidth={1.5} />
                </div>
             </div>
             <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">COMMAND CENTER</h2>
                <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-500 dark:text-white/50 uppercase tracking-widest">
                   <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Activity size={10} className="animate-pulse"/> SYSTEM ONLINE</span>
                   <span className="flex items-center gap-1.5"><Lock size={10}/> ENCRYPTED</span>
                   <span className="text-slate-400 dark:text-white/30">ID: {state.currentUser?.username.toUpperCase()}</span>
                </div>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
             {[
               { id: 'OVERVIEW', icon: BarChart3, label: 'Overview' },
               { id: 'PERSONNEL', icon: Users, label: 'Personnel' },
               { id: 'TRANSMISSIONS', icon: Radio, label: 'Pending', count: stats.pendingPosts },
               { id: 'INTEL', icon: Lightbulb, label: 'Intel' },
               { id: 'OPERATIONS', icon: MapPin, label: 'Ops' },
               { id: 'BROADCAST', icon: Megaphone, label: 'Alerts' },
               { id: 'LINKS', icon: Link, label: 'Comms' }
             ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`
                    px-5 py-3 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider flex items-center gap-2
                    ${activeTab === tab.id 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}
                  `}
                >
                   <tab.icon size={14} />
                   <span>{tab.label}</span>
                   {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1 bg-white text-red-600 px-1.5 py-0.5 rounded text-[9px]">{tab.count}</span>
                   )}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-indigo-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-black/60 relative overflow-hidden group hover:border-indigo-500/30 transition shadow-lg">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/20 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10">Archives</span>
                  <Film className="text-indigo-500" size={20}/>
               </div>
               <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 relative z-10">{stats.totalPosts}</p>
               <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">Total Records</p>
            </div>
            
            <div className="glass-panel p-6 rounded-3xl border border-emerald-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-emerald-900/40 dark:to-black/60 relative overflow-hidden group hover:border-emerald-500/30 transition shadow-lg">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10">Engagement</span>
                  <Activity className="text-emerald-500" size={20}/>
               </div>
               <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 relative z-10">{stats.totalEngagement}</p>
               <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">Interactions</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-amber-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-amber-900/40 dark:to-black/60 relative overflow-hidden group hover:border-amber-500/30 transition shadow-lg">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-200 dark:border-amber-500/20 px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10">Queue</span>
                  <FileClock className="text-amber-500" size={20}/>
               </div>
               <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 relative z-10">{stats.pendingPosts}</p>
               <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">Pending Review</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-blue-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-black/60 relative overflow-hidden group hover:border-blue-500/30 transition shadow-lg">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-200 dark:border-blue-500/20 px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10">Agents</span>
                  <Users className="text-blue-500" size={20}/>
               </div>
               <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 relative z-10">{stats.totalUsers}</p>
               <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">{stats.activeMembers} Online</p>
            </div>
         </div>
      )}

      {/* PERSONNEL TAB */}
      {activeTab === 'PERSONNEL' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Agents</h3>
               <button onClick={handleOpenRecruitModal} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition">
                  <UserPlus size={16}/> Recruit Agent
               </button>
            </div>

            {/* User List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {state.users.map(user => (
                  <div key={user.id} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-black/40 relative group overflow-hidden shadow-sm hover:shadow-md transition">
                     {user.status === 'BLOCKED' && <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 flex items-center justify-center"><span className="text-red-500 font-black uppercase tracking-widest border border-red-500 px-4 py-2 rounded">Terminated</span></div>}
                     <div className="flex items-start gap-4 mb-4">
                        <img src={user.avatar} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                        <div>
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">{user.fullName}</h4>
                           <p className="text-slate-500 dark:text-white/40 text-xs font-mono mb-2">@{user.username}</p>
                           <div className="flex gap-2">
                              <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'}`}>{user.role}</span>
                              <span className="text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/10">{user.specialization}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                        <select 
                           className="bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white text-[10px] p-2 rounded border border-slate-200 dark:border-white/10 outline-none"
                           value={user.role}
                           onChange={(e) => onUpdateUser(user.id, { role: e.target.value as any })}
                        >
                           <option value="MEMBER">Member</option>
                           <option value="ADMIN">Admin</option>
                        </select>
                        <select 
                           className="bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white text-[10px] p-2 rounded border border-slate-200 dark:border-white/10 outline-none"
                           value={user.specialization}
                           onChange={(e) => onUpdateUser(user.id, { specialization: e.target.value as any })}
                        >
                           <option value="عام">General</option>
                           <option value="مصور">Photographer</option>
                           <option value="كاتب">Writer</option>
                           <option value="مونتاج">Editor</option>
                           <option value="تصميم">Designer</option>
                        </select>
                        <button 
                           onClick={() => onUpdateUser(user.id, { status: user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' })}
                           className={`col-span-1 p-2 rounded text-[10px] font-black uppercase tracking-wider border ${user.status === 'ACTIVE' ? 'border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10'}`}
                        >
                           {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                        <button 
                           onClick={() => onDeleteUser(user.id)}
                           className="col-span-1 p-2 rounded text-[10px] font-black uppercase tracking-wider border border-rose-500/30 text-rose-600 dark:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-1"
                        >
                           <Trash2 size={12}/> Expel
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            {/* New User Modal */}
            {newUserForm.show && (
               <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white dark:bg-black relative shadow-2xl">
                     <button onClick={() => setNewUserForm(p => ({...p, show: false}))} className="absolute top-6 right-6 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white"><XCircle size={24}/></button>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">New Recruit</h3>
                     <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                            <input type="text" placeholder="e.g. Sarah Connor" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none focus:border-indigo-500 transition" value={newUserForm.fullName} onChange={e => setNewUserForm(p => ({...p, fullName: e.target.value}))} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Username</label>
                            <input type="text" placeholder="e.g. sarah.c" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none focus:border-indigo-500 transition" value={newUserForm.username} onChange={e => setNewUserForm(p => ({...p, username: e.target.value}))} />
                        </div>
                        <div className="space-y-1 relative">
                            <div className="flex justify-between items-center mb-1 ml-1">
                                <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Access Key (Auto)</label>
                                <button onClick={() => setNewUserForm(p => ({...p, password: generatePassword()}))} className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white flex items-center gap-1"><RefreshCw size={10}/> Regenerate</button>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" readOnly className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-mono tracking-widest outline-none focus:border-indigo-500 transition" value={newUserForm.password} />
                                <button onClick={handleCopyCredentials} className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition" title="Copy Credentials"><Copy size={18}/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none" value={newUserForm.role} onChange={e => setNewUserForm(p => ({...p, role: e.target.value as any}))}>
                              <option value="MEMBER">Member</option>
                              <option value="ADMIN">Admin</option>
                           </select>
                           <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none" value={newUserForm.specialization} onChange={e => setNewUserForm(p => ({...p, specialization: e.target.value as any}))}>
                              <option value="عام">General</option>
                              <option value="مصور">Photographer</option>
                              <option value="كاتب">Writer</option>
                              <option value="مونتاج">Editor</option>
                              <option value="تصميم">Designer</option>
                           </select>
                        </div>
                        <button onClick={handleCreateUser} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition mt-4">Onboard Agent</button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      )}

      {/* TRANSMISSIONS (PENDING) TAB */}
      {activeTab === 'TRANSMISSIONS' && (
         <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Intercepted Content</h3>
            {state.posts.filter(p => p.status === 'PENDING').length === 0 ? (
               <div className="text-center py-24 opacity-30 text-slate-900 dark:text-white font-mono border border-slate-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/5 flex flex-col items-center">
                  <CheckCircle2 size={64} className="mb-6 text-emerald-500"/>
                  <span className="text-2xl font-black tracking-widest">ALL CLEAR</span>
                  <span className="text-sm mt-2 tracking-wider">NO PENDING TRANSMISSIONS</span>
               </div>
            ) : (
               state.posts.filter(p => p.status === 'PENDING').map(post => (
                  <div key={post.id} className="glass-panel p-6 rounded-3xl flex gap-8 items-start border border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 relative overflow-hidden group shadow-lg">
                     <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">Action Required</div>
                     
                     {post.mediaUrl && (
                        <div className="w-64 h-40 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black shadow-xl relative">
                           {post.mediaType === 'image' ? (
                              <img src={post.mediaUrl} className="w-full h-full object-cover" />
                           ) : (
                              <video src={post.mediaUrl} className="w-full h-full object-cover" />
                           )}
                        </div>
                     )}

                     <div className="flex-1 py-2">
                        <div className="flex items-center gap-3 mb-3">
                           <span className="text-lg font-bold text-slate-900 dark:text-white">{post.authorName}</span>
                           <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded">{new Date(post.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-lg text-slate-700 dark:text-white/90 mb-8 font-medium leading-relaxed max-w-3xl">"{post.content}"</p>
                        <div className="flex gap-4">
                           <button onClick={() => onPostAction(post.id, 'APPROVE')} className="bg-emerald-500 text-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition shadow-lg flex items-center gap-2">
                              <CheckCircle2 size={14}/> Authorize
                           </button>
                           <button onClick={() => onPostAction(post.id, 'DELETE')} className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/30 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition flex items-center gap-2">
                              <XCircle size={14}/> Reject
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      )}

      {/* INTEL (IDEAS) TAB */}
      {activeTab === 'INTEL' && (
         <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Creative Intelligence</h3>
            <div className="grid grid-cols-1 gap-4">
               {state.ideas.map(idea => (
                  <div key={idea.id} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 hover:bg-slate-50 dark:hover:bg-white/5 transition group shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${idea.status === 'مقبولة' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white'}`}>
                              {idea.title.charAt(0)}
                           </div>
                           <div>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{idea.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-white/40">Proposed by {idea.authorName}</p>
                           </div>
                        </div>
                        <select 
                           className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none border ${
                              idea.status === 'مقبولة' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 
                              idea.status === 'مرفوضة' ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' :
                              idea.status === 'قيد التنفيذ' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' :
                              'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                           }`}
                           value={idea.status}
                           onChange={(e) => onUpdateIdea(idea.id, { status: e.target.value as IdeaStatus })}
                        >
                           <option value="قيد المراجعة">In Review</option>
                           <option value="قيد التنفيذ">In Production</option>
                           <option value="مقبولة">Greenlit</option>
                           <option value="مرفوضة">Scrapped</option>
                        </select>
                     </div>
                     <p className="text-slate-600 dark:text-white/80 text-sm mb-4 pl-16 max-w-3xl">{idea.description}</p>
                     
                     <div className="pl-16">
                        {editingIdea === idea.id ? (
                           <div className="flex gap-2 animate-in fade-in">
                              <input 
                                 type="text" 
                                 className="flex-1 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white outline-none" 
                                 placeholder="Director's Note..." 
                                 value={ideaNote} 
                                 onChange={e => setIdeaNote(e.target.value)} 
                                 autoFocus
                              />
                              <button onClick={() => { onUpdateIdea(idea.id, { adminNote: ideaNote }); setEditingIdea(null); setIdeaNote(''); }} className="bg-indigo-600 p-2 rounded-lg text-white hover:bg-indigo-500"><Save size={14}/></button>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2 group/note cursor-pointer" onClick={() => { setEditingIdea(idea.id); setIdeaNote(idea.adminNote || ''); }}>
                              <Edit3 size={12} className="text-slate-400 dark:text-white/20 group-hover/note:text-slate-900 dark:group-hover/note:text-white transition" />
                              <p className="text-xs text-slate-400 dark:text-white/40 italic group-hover/note:text-slate-600 dark:group-hover/note:text-white/60 transition">{idea.adminNote || 'Add director note...'}</p>
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* OPERATIONS (LOCATIONS) TAB */}
      {activeTab === 'OPERATIONS' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Field Operations</h3>
               <button onClick={() => setNewLocForm(p => ({...p, show: true}))} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition">
                  <Plus size={16}/> New Operation
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {state.locations.map(loc => (
                  <div key={loc.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group relative h-64 shadow-lg">
                     <img src={loc.image} className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-40 group-hover:opacity-60 dark:group-hover:opacity-30 transition duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-black dark:via-black/40 dark:to-transparent"></div>
                     <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => onDeleteLocation?.(loc.id)} className="bg-white/80 dark:bg-black/50 p-2 rounded-full text-slate-500 dark:text-white/40 hover:text-rose-500 hover:bg-white dark:hover:bg-black transition backdrop-blur-md"><Trash2 size={16}/></button>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full p-6">
                        <div className="flex justify-between items-end mb-2">
                           <h4 className="text-2xl font-black text-slate-900 dark:text-white">{loc.name}</h4>
                           <button 
                              onClick={() => onUpdateLocation?.(loc.id, { status: loc.status === 'VISITED' ? 'PLANNED' : 'VISITED' })}
                              className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${loc.status === 'VISITED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'}`}
                           >
                              {loc.status === 'VISITED' ? 'Mission Complete' : 'Planned'}
                           </button>
                        </div>
                        <p className="text-slate-700 dark:text-white/70 text-sm line-clamp-2 max-w-sm">{loc.description}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* New Location Modal */}
            {newLocForm.show && (
               <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white dark:bg-black relative shadow-2xl">
                     <button onClick={() => setNewLocForm(p => ({...p, show: false}))} className="absolute top-6 right-6 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white"><XCircle size={24}/></button>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Initialize Operation</h3>
                     <div className="space-y-4">
                        <input type="text" placeholder="Location Name" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none focus:border-indigo-500" value={newLocForm.name} onChange={e => setNewLocForm(p => ({...p, name: e.target.value}))} />
                        <textarea placeholder="Brief Description" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none focus:border-indigo-500 h-24 resize-none" value={newLocForm.description} onChange={e => setNewLocForm(p => ({...p, description: e.target.value}))} />
                        <input type="text" placeholder="Image URL (Optional)" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 outline-none focus:border-indigo-500" value={newLocForm.image} onChange={e => setNewLocForm(p => ({...p, image: e.target.value}))} />
                        <button onClick={handleCreateLocation} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition mt-4">Confirm Coordinates</button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      )}

      {/* LINKS TAB */}
      {activeTab === 'LINKS' && (
         <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Secure Communication Lines</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Add New Link */}
               <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-lg">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Add New Link</h4>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Platform</label>
                        <select 
                           className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                           value={newLinkForm.platform}
                           onChange={(e) => setNewLinkForm(p => ({...p, platform: e.target.value as any}))}
                        >
                           <option value="instagram">Instagram</option>
                           <option value="telegram">Telegram</option>
                           <option value="youtube">YouTube</option>
                           <option value="website">Website</option>
                           <option value="email">Email</option>
                           <option value="other">Other</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Label</label>
                        <input type="text" placeholder="@username or Channel Name" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500" value={newLinkForm.label} onChange={e => setNewLinkForm(p => ({...p, label: e.target.value}))} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">URL / Address</label>
                        <input type="text" placeholder="https://..." className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500" value={newLinkForm.url} onChange={e => setNewLinkForm(p => ({...p, url: e.target.value}))} />
                     </div>
                     <button onClick={handleAddLink} className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition mt-2">Establish Link</button>
                  </div>
               </div>

               {/* Existing Links */}
               <div className="space-y-4">
                  {state.socialLinks?.map(link => (
                     <div key={link.id} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/20 transition shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white">
                              {link.platform === 'instagram' ? <Camera size={18}/> : 
                               link.platform === 'telegram' ? <Save size={18}/> : 
                               link.platform === 'youtube' ? <Film size={18}/> : 
                               link.platform === 'email' ? <Globe size={18}/> : <Link size={18}/>}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{link.platform}</p>
                              <p className="text-sm font-medium text-slate-600 dark:text-white/60">{link.label}</p>
                           </div>
                        </div>
                        <button onClick={() => onDeleteSocialLink?.(link.id)} className="p-2 text-slate-400 dark:text-white/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition">
                           <Trash2 size={18}/>
                        </button>
                     </div>
                  ))}
                  {(!state.socialLinks || state.socialLinks.length === 0) && (
                     <div className="text-center py-10 opacity-30 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl">
                        <Link size={32} className="mx-auto mb-2 text-slate-900 dark:text-white"/>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">No Active Links</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* BROADCAST TAB */}
      {activeTab === 'BROADCAST' && (
         <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-transparent">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none text-indigo-900 dark:text-white"><Radio size={300}/></div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 tracking-tight"><Bell className="text-indigo-500"/> BROADCAST SYSTEM</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Target Audience</label>
                      <select className="w-full p-4 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition appearance-none" value={notifForm.recipientId} onChange={e => setNotifForm(p => ({...p, recipientId: e.target.value}))}>
                        <option value="ALL">All Crew</option>
                        {state.users.filter(u => u.role !== 'ADMIN').map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Signal Type</label>
                        <select className="w-full p-4 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition appearance-none" value={notifForm.type} onChange={e => setNotifForm(p => ({...p, type: e.target.value as any}))}>
                           <option value="ANNOUNCEMENT">Announcement</option>
                           <option value="MESSAGE">Private Message</option>
                           <option value="REWARD">Award / Badge</option>
                           <option value="ACTIVITY">Activity Update</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Alert Sound</label>
                        <select className="w-full p-4 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition appearance-none" value={notifForm.sound} onChange={e => setNotifForm(p => ({...p, sound: e.target.value}))}>
                           <option value="default">Default</option>
                           <option value="success">Success Chime</option>
                           <option value="alert">Siren</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Transmission Data</label>
                      <textarea className="w-full p-4 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold h-40 resize-none outline-none focus:border-indigo-500 transition leading-relaxed" placeholder="Enter message..." value={notifForm.content} onChange={e => setNotifForm(p => ({...p, content: e.target.value}))} />
                  </div>
                  <button onClick={handleSendAlert} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition shadow-lg">Initiate Transmission</button>
               </div>
               <div className="border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center p-8 bg-slate-50 dark:bg-black/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-20"></div>
                  <div className="text-center relative z-10">
                     <div className="w-20 h-20 bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-inner"><Radio size={32}/></div>
                     <p className="text-slate-400 dark:text-white/30 text-[9px] font-mono tracking-widest uppercase mb-2">OUTPUT PREVIEW</p>
                     <p className="text-slate-900 dark:text-white font-bold text-xl">{notifForm.content || 'Waiting for input...'}</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
