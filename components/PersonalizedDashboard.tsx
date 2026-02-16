
import React, { useMemo } from 'react';
import { User, Post, Idea, Notification, Specialization } from '../types';
import { Sparkles, TrendingUp, Calendar, Zap, Award, ArrowRight, PenTool, Camera, Film, Mic, Crown, BellRing } from 'lucide-react';

interface PersonalizedDashboardProps {
  user: User;
  posts: Post[];
  ideas: Idea[];
  notifications: Notification[];
  onNavigate: (view: any) => void;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ user, posts, ideas, notifications, onNavigate }) => {
  
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Morning Session', icon: '🌅' };
    if (hour < 17) return { text: 'Afternoon Shoot', icon: '☀️' };
    return { text: 'Night Edit', icon: '🌙' };
  };

  const timeCtx = getTimeContext();

  const myStats = useMemo(() => {
    const myPosts = posts.filter(p => p.authorId === user.id);
    const myLikesReceived = myPosts.reduce((acc, curr) => acc + curr.likes.length, 0);
    const myIdeas = ideas.filter(i => i.authorId === user.id);
    return { posts: myPosts.length, likes: myLikesReceived, ideas: myIdeas.length };
  }, [posts, ideas, user.id]);

  const getSmartTask = () => {
    if (user.role === 'ADMIN') {
      const pendingCount = posts.filter(p => p.status === 'PENDING').length;
      return {
        title: 'Executive Action',
        desc: `${pendingCount} Items Awaiting Authorization`,
        action: 'ADMIN',
        icon: Crown,
        bgClass: 'bg-gradient-to-r from-amber-600 to-orange-700'
      };
    }
    
    switch (user.specialization) {
      case 'مصور': return { title: 'On Assignment', desc: 'Capture the next scene.', action: 'FEED', icon: Camera, bgClass: 'bg-gradient-to-r from-blue-600 to-cyan-600' };
      case 'كاتب': return { title: 'Screenplay', desc: 'Draft the next headline.', action: 'FEED', icon: PenTool, bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600' };
      case 'مونتاج': return { title: 'Post-Production', desc: 'Raw footage ready for editing.', action: 'FEED', icon: Film, bgClass: 'bg-gradient-to-r from-purple-600 to-indigo-600' };
      default: return { title: 'Creative Brief', desc: 'Propose a new concept.', action: 'IDEAS', icon: Sparkles, bgClass: 'bg-gradient-to-r from-pink-600 to-rose-600' };
    }
  };

  const smartTask = getSmartTask();

  const trendingPost = useMemo(() => {
    return [...posts].sort((a, b) => b.likes.length - a.likes.length)[0];
  }, [posts]);

  return (
    <div className="space-y-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Hero Welcome - Director Monitor Style */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black border border-white/10 shadow-2xl p-10 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
               <span>{timeCtx.icon}</span>
               <span>{timeCtx.text}</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight text-white tracking-tighter">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">{user.fullName.split(' ')[0]}</span>
            </h2>
            <p className="text-white/60 font-medium max-w-md text-sm leading-relaxed border-l-2 border-indigo-500 pl-4">
              {user.bio || 'Ready for another take? The studio is yours.'}
            </p>
          </div>

          <div className="flex gap-4">
             <div className="text-center p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-24">
                <div className="text-2xl font-black text-white">{myStats.posts}</div>
                <div className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-1">Shots</div>
             </div>
             <div className="text-center p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-24">
                <div className="text-2xl font-black text-white">{myStats.likes}</div>
                <div className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-1">Impact</div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Smart Task Card */}
        <div 
          onClick={() => onNavigate(smartTask.action)}
          className={`col-span-1 md:col-span-2 relative overflow-hidden rounded-[2rem] ${smartTask.bgClass} text-white p-8 shadow-2xl cursor-pointer group transition-all hover:scale-[1.01]`}
        >
           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
           <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <smartTask.icon size={32} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight uppercase mb-1">{smartTask.title}</h3>
                    <p className="text-white/80 text-sm font-bold tracking-wide">{smartTask.desc}</p>
                 </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                 <ArrowRight size={20} />
              </div>
           </div>
        </div>

        {/* 2. Trending Insight */}
        <div className="rounded-[2rem] bg-black/40 backdrop-blur-md p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
           <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-rose-500" size={18} />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Trending Shot</span>
           </div>
           {trendingPost ? (
              <div className="relative z-10">
                 <p className="text-sm font-bold text-white line-clamp-2 mb-4 leading-relaxed">"{trendingPost.content}"</p>
                 <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
                    <Award size={12} className="text-amber-500" />
                    <span>{trendingPost.likes.length} LIKES RECORDED</span>
                 </div>
              </div>
           ) : (
              <p className="text-white/20 text-xs font-mono">Awaiting data...</p>
           )}
           <div className="absolute bottom-0 right-0 p-12 bg-white/5 rounded-full blur-2xl -mr-6 -mb-6 group-hover:bg-white/10 transition"></div>
        </div>

      </div>
    </div>
  );
};

export default PersonalizedDashboard;
