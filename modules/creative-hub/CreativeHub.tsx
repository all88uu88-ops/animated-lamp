
import React, { useState, useMemo, useEffect } from 'react';
import { User, HelpRequest, HelpCategory, Urgency } from '../../types';
import { 
  Sparkles, Plus, MessageSquare, Heart, Bookmark, Clock, User as UserIcon, 
  Send, X, Search, Filter, Palette, Film, Camera, PenTool, Lightbulb, 
  Settings, CheckCircle2, ChevronRight, Award, Trophy, Zap, Radio, Globe,
  Activity, Star
} from 'lucide-react';

interface CreativeHubProps {
  currentUser: User;
  users: User[];
  helpRequests: HelpRequest[];
  onAddRequest: (req: HelpRequest) => void;
  onUpdateRequest: (id: string, updates: Partial<HelpRequest>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const CATEGORIES: { id: HelpCategory; icon: any; color: string; label: string }[] = [
  { id: 'تصميم', icon: Palette, color: 'indigo', label: 'Design' },
  { id: 'مونتاج', icon: Film, color: 'purple', label: 'Editing' },
  { id: 'تصوير', icon: Camera, color: 'emerald', label: 'Photography' },
  { id: 'كتابة', icon: PenTool, color: 'blue', label: 'Writing' },
  { id: 'أفكار', icon: Lightbulb, color: 'amber', label: 'Ideas' },
  { id: 'تقني', icon: Settings, color: 'rose', label: 'Technical' },
];

const CreativeHub: React.FC<CreativeHubProps> = ({ 
  currentUser, users, helpRequests, onAddRequest, onUpdateRequest, onUpdateUser 
}) => {
  const [filter, setFilter] = useState<HelpCategory | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newReq, setNewReq] = useState({ title: '', description: '', category: 'تصميم' as HelpCategory, urgency: 'NORMAL' as Urgency });
  const [chatInput, setChatInput] = useState('');

  const filteredRequests = useMemo(() => {
    let list = [...helpRequests];
    if (filter !== 'ALL') {
      list = list.filter(r => r.category === filter);
    }
    // Sort by Urgency then Time
    return list.sort((a, b) => {
      if (a.urgency === 'URGENT' && b.urgency !== 'URGENT') return -1;
      if (a.urgency !== 'URGENT' && b.urgency === 'URGENT') return 1;
      return b.timestamp - a.timestamp;
    });
  }, [helpRequests, filter]);

  const topHelpers = useMemo(() => {
    return [...users]
      .filter(u => u.reputationPoints && u.reputationPoints > 0)
      .sort((a, b) => (b.reputationPoints || 0) - (a.reputationPoints || 0))
      .slice(0, 3);
  }, [users]);

  const suggestedMembers = useMemo(() => {
    if (!activeChatId) return [];
    const req = helpRequests.find(r => r.id === activeChatId);
    if (!req) return [];
    return users.filter(u => u.id !== currentUser.id && u.skills?.includes(req.category) && u.isAvailableForHelp);
  }, [activeChatId, helpRequests, users, currentUser.id]);

  const handleCreateRequest = () => {
    if (!newReq.title || !newReq.description) return;
    const request: HelpRequest = {
      id: Math.random().toString(36).substr(2, 9),
      title: newReq.title,
      description: newReq.description,
      category: newReq.category,
      urgency: newReq.urgency,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      timestamp: Date.now(),
      status: 'OPEN',
      chatMessages: []
    };
    onAddRequest(request);
    setShowAddModal(false);
    setNewReq({ title: '', description: '', category: 'تصميم', urgency: 'NORMAL' });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChatId) return;
    const req = helpRequests.find(r => r.id === activeChatId);
    if (!req) return;

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text: chatInput,
      timestamp: Date.now()
    };

    onUpdateRequest(activeChatId, {
      chatMessages: [...req.chatMessages, newMessage]
    });
    setChatInput('');
  };

  const activeChatRequest = helpRequests.find(r => r.id === activeChatId);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative">
         <div className="relative z-10">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter drop-shadow-sm dark:drop-shadow-2xl">مركز التعاون الإعلامي</h2>
            <p className="text-slate-500 dark:text-white/50 text-sm font-medium tracking-wide border-l-2 border-indigo-500 pl-4">اطلب المساعدة أو شارك خبرتك مع فريق النادي</p>
         </div>
         
         <div className="flex items-center gap-4 relative z-10">
            {/* Available Toggle */}
            <button 
              onClick={() => onUpdateUser(currentUser.id, { isAvailableForHelp: !currentUser.isAvailableForHelp })}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 flex items-center gap-2 ${currentUser.isAvailableForHelp ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40'}`}
            >
               <div className={`w-2 h-2 rounded-full ${currentUser.isAvailableForHelp ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-slate-300 dark:bg-white/20'}`}></div>
               متاح للمساعدة
            </button>

            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition shadow-lg flex items-center gap-2 group"
            >
               <Plus size={18} className="group-hover:rotate-90 transition-transform" /> طلب مساعدة
            </button>
         </div>

         {/* Decorative Background Blob */}
         <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
         <button 
            onClick={() => setFilter('ALL')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === 'ALL' ? 'bg-white dark:bg-white text-indigo-600 dark:text-black shadow-xl scale-105' : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'}`}
         >
            All Requests
         </button>
         {CATEGORIES.map(cat => (
            <button 
               key={cat.id}
               onClick={() => setFilter(cat.id)}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 group ${filter === cat.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'}`}
            >
               <cat.icon size={14} className={filter === cat.id ? 'text-white' : 'text-slate-400 dark:text-white/20 group-hover:text-slate-900 dark:group-hover:text-white'} />
               {cat.label}
            </button>
         ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         
         {/* LEFT COLUMN: REQUEST FEED */}
         <div className="xl:col-span-3 space-y-6">
            {filteredRequests.length === 0 ? (
               <div className="glass-panel p-20 rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center opacity-50 dark:opacity-30">
                  <Search size={64} className="mb-6 text-slate-400 dark:text-white" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">No Signals Detected</h3>
                  <p className="text-sm font-medium mt-2 text-slate-500 dark:text-white/60">All creative units are operational.</p>
               </div>
            ) : (
               filteredRequests.map(req => (
                  <div 
                    key={req.id} 
                    className={`glass-panel p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 relative overflow-hidden transition-all duration-500 hover:scale-[1.01] group ${req.urgency === 'URGENT' ? 'border-rose-200 dark:border-rose-500/30 shadow-lg dark:shadow-[0_0_40px_rgba(244,63,94,0.1)]' : 'hover:border-indigo-200 dark:hover:border-indigo-500/30'} shadow-sm hover:shadow-xl`}
                  >
                     {/* Floating Glow Elements */}
                     <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 dark:opacity-10 pointer-events-none ${req.urgency === 'URGENT' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>

                     <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-4">
                              {req.urgency === 'URGENT' && (
                                 <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-white rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse">
                                    <Zap size={10} fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase tracking-wider">Urgent</span>
                                 </div>
                              )}
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                                 {req.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-white/30 uppercase tracking-widest">
                                 {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>

                           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{req.title}</h3>
                           <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                              {req.description}
                           </p>

                           <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                              <img src={req.authorAvatar} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                              <div>
                                 <p className="text-xs font-black text-slate-900 dark:text-white">{req.authorName}</p>
                                 <p className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest">Requester</p>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto md:shrink-0">
                           <button 
                              onClick={() => setActiveChatId(req.id)}
                              className="flex-1 md:w-32 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition"
                           >
                              ساعده
                           </button>
                           <button 
                              onClick={() => setActiveChatId(req.id)}
                              className="flex-1 md:w-32 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center justify-center gap-2"
                           >
                              <MessageSquare size={14} /> دردشة
                           </button>
                           <button className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 rounded-xl hover:text-indigo-600 dark:hover:text-white transition group/save">
                              <Bookmark size={18} className="group-hover/save:fill-current" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* RIGHT COLUMN: REPUTATION & SUGGESTIONS */}
         <div className="space-y-8">
            
            {/* TOP HELPERS LEADERBOARD */}
            <div className="glass-panel p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 relative overflow-hidden shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                     <Trophy size={20} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">أفضل المساعدين</h3>
               </div>

               <div className="space-y-4">
                  {topHelpers.map((helper, i) => (
                     <div key={helper.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="relative">
                              <img src={helper.avatar} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10 group-hover:scale-105 transition" />
                              {i === 0 && <Award size={14} className="absolute -top-1.5 -right-1.5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" fill="currentColor" />}
                           </div>
                           <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{helper.fullName}</p>
                              <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest">{helper.specialization}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black text-slate-900 dark:text-white">{helper.reputationPoints}</p>
                           <p className="text-[8px] text-slate-400 dark:text-white/30 uppercase tracking-widest">Points</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4">
               <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 text-center shadow-sm">
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{helpRequests.filter(r => r.status === 'OPEN').length}</p>
                  <p className="text-[8px] text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] mt-1 font-black">Open Requests</p>
               </div>
               <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 text-center shadow-sm">
                  <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tracking-tighter">{helpRequests.filter(r => r.status === 'COMPLETED').length}</p>
                  <p className="text-[8px] text-slate-500 dark:text-white/40 uppercase tracking-[0.2em] mt-1 font-black">Resolved</p>
               </div>
            </div>

            {/* AVAILABLE NOW LIST */}
            <div className="glass-panel p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 shadow-lg">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> متاح حالياً
                  </h3>
               </div>
               <div className="flex -space-x-3 overflow-hidden">
                  {users.filter(u => u.isAvailableForHelp).map(u => (
                     <div key={u.id} className="relative group cursor-pointer">
                        <img src={u.avatar} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#030303] object-cover hover:scale-110 hover:z-10 transition duration-300 ring-1 ring-emerald-500/30" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                           <div className="bg-slate-900 dark:bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border border-white/10">
                              {u.fullName}
                           </div>
                        </div>
                     </div>
                  ))}
                  {users.filter(u => u.isAvailableForHelp).length === 0 && (
                     <p className="text-[9px] text-slate-400 dark:text-white/20 italic uppercase tracking-widest">No active units.</p>
                  )}
               </div>
            </div>

         </div>
      </div>

      {/* CHAT PANEL SLIDE-OVER */}
      {activeChatId && activeChatRequest && (
         <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setActiveChatId(null)}></div>
            <div className="w-full max-w-lg h-full glass-panel bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 relative z-10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
               
               {/* Chat Header */}
               <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <MessageSquare size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{activeChatRequest.title}</h3>
                        <p className="text-[9px] text-slate-500 dark:text-white/40 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                           <UserIcon size={10} /> {activeChatRequest.authorName} • {activeChatRequest.category}
                        </p>
                     </div>
                  </div>
                  <button onClick={() => setActiveChatId(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white transition">
                     <X size={24} />
                  </button>
               </div>

               {/* Suggested Helpers for this specific task */}
               <div className="p-4 bg-indigo-50 dark:bg-indigo-600/5 border-b border-slate-200 dark:border-white/5 flex items-center gap-4">
                  <div className="text-[9px] font-black text-indigo-500 dark:text-indigo-300 uppercase tracking-widest shrink-0">أشخاص يمكنهم مساعدتك:</div>
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                     {suggestedMembers.map(u => (
                        <div key={u.id} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-1 shrink-0 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
                           <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" />
                           <span className="text-[8px] font-bold text-slate-700 dark:text-white/80">{u.fullName.split(' ')[0]}</span>
                        </div>
                     ))}
                     {suggestedMembers.length === 0 && <span className="text-[8px] text-slate-400 dark:text-white/20 uppercase tracking-widest">Searching for experts...</span>}
                  </div>
               </div>

               {/* Messages Container */}
               <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-6 rounded-2xl text-center mb-8">
                     <Sparkles size={24} className="mx-auto text-indigo-500 dark:text-indigo-400 mb-2 animate-pulse" />
                     <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed px-4">
                        "مرحباً! لقد فتحت قناة تعاون مباشرة. ناقش تفاصيل الطلب هنا، وعند الانتهاء سيقوم صاحب الطلب بتقييم مجهودك."
                     </p>
                  </div>

                  {activeChatRequest.chatMessages.map(msg => {
                     const isMine = msg.senderId === currentUser.id;
                     const sender = users.find(u => u.id === msg.senderId);
                     return (
                        <div key={msg.id} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : ''}`}>
                           <img src={sender?.avatar} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                           <div className={`flex flex-col ${isMine ? 'items-end' : ''}`}>
                              <div className={`max-w-[280px] p-4 rounded-2xl text-sm font-medium leading-relaxed ${isMine ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/80 rounded-tl-none border border-slate-200 dark:border-white/5'}`}>
                                 {msg.text}
                              </div>
                              <span className="text-[8px] text-slate-400 dark:text-white/20 mt-1 uppercase tracking-widest font-mono">
                                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                     )
                  })}
               </div>

               {/* Chat Input */}
               <div className="p-8 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10">
                  <div className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                     <div className="relative flex items-center bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/50 transition-colors shadow-sm">
                        <input 
                           type="text" 
                           placeholder="اكتب رسالتك هنا..."
                           className="flex-1 bg-transparent border-none text-slate-900 dark:text-white px-6 py-5 text-sm font-bold placeholder-slate-400 dark:placeholder-white/20 outline-none"
                           value={chatInput}
                           onChange={e => setChatInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                           onClick={handleSendMessage}
                           className="p-3 mr-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center group/send"
                        >
                           <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      )}

      {/* NEW REQUEST MODAL */}
      {showAddModal && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
            <div className="w-full max-w-xl glass-panel bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 relative z-10 animate-in zoom-in-95 duration-300 shadow-[0_0_100px_rgba(0,0,0,0.5)] dark:shadow-[0_0_100px_rgba(0,0,0,0.8)]">
               <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white transition">
                  <X size={24} />
               </button>
               
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">إنشاء طلب مساعدة جديد</h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">عنوان الطلب</label>
                     <input 
                        type="text" 
                        placeholder="مثال: نحتاج لتعديل لقطات الفيديو..."
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/10"
                        value={newReq.title}
                        onChange={e => setNewReq({...newReq, title: e.target.value})}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">التصنيف</label>
                        <div className="relative">
                           <select 
                              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white font-bold appearance-none outline-none focus:border-indigo-500/50 transition-all"
                              value={newReq.category}
                              onChange={e => setNewReq({...newReq, category: e.target.value as HelpCategory})}
                           >
                              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                           </select>
                           <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 dark:text-white/20 pointer-events-none" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">درجة الأهمية</label>
                        <div className="relative">
                           <select 
                              className={`w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 font-bold appearance-none outline-none focus:border-indigo-500/50 transition-all ${newReq.urgency === 'URGENT' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}
                              value={newReq.urgency}
                              onChange={e => setNewReq({...newReq, urgency: e.target.value as Urgency})}
                           >
                              <option value="NORMAL">Normal</option>
                              <option value="URGENT">Urgent ⚡</option>
                           </select>
                           <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 dark:text-white/20 pointer-events-none" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] ml-1">شرح التفاصيل</label>
                     <textarea 
                        placeholder="اشرح ما تحتاجه بوضوح ليتمكن الآخرون من مساعدتك..."
                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white font-medium h-40 resize-none outline-none focus:border-indigo-500/50 transition-all leading-relaxed placeholder:text-slate-400 dark:placeholder:text-white/10"
                        value={newReq.description}
                        onChange={e => setNewReq({...newReq, description: e.target.value})}
                     />
                  </div>

                  <div className="pt-4">
                     <button 
                        onClick={handleCreateRequest}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                        إرسال الطلب للوحدة الإبداعية
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* STYLES FOR ANIMATIONS */}
      <style>{`
         .custom-scrollbar::-webkit-scrollbar { height: 4px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
         .no-scrollbar::-webkit-scrollbar { display: none; }
         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default CreativeHub;
