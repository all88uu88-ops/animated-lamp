
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { BADGE_DEFINITIONS } from '../constants';
import { ArrowRight, Star, Activity, Layers, Sparkles } from 'lucide-react';

interface IdentityRevealProps {
  user: User;
  onEnter: () => void;
}

const IdentityReveal: React.FC<IdentityRevealProps> = ({ user, onEnter }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger internal mount animations
    setTimeout(() => setMounted(true), 100);
  }, []);

  const stats = [
    { label: 'Posts', value: '12', icon: Layers },
    { label: 'Impact', value: '8.5k', icon: Activity },
    { label: 'Level', value: 'PRO', icon: Star },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Dimmed Background Overlay with Blur */}
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Main Card Container */}
      <div className={`relative w-full max-w-sm mx-6 perspective-1000 animate-reveal-card`}>
        
        {/* Glow Effects behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-[60px] animate-pulse"></div>

        {/* The Card */}
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
          
          {/* Inner Content Wrapper */}
          <div className="bg-gradient-to-b from-white/5 to-transparent rounded-[2.2rem] p-8 px-6 text-center relative overflow-hidden">
            
            {/* Top Shine */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

            {/* Profile Image */}
            <div className="relative mb-8 inline-block animate-slide-up-item" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 blur-md opacity-60"></div>
              <div className="relative rounded-full p-[3px] bg-gradient-to-tr from-indigo-400 via-purple-400 to-rose-400">
                <div className="rounded-full overflow-hidden w-28 h-28 border-4 border-black">
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 rounded-full p-2 text-yellow-400 shadow-lg">
                <Sparkles size={16} fill="currentColor" />
              </div>
            </div>

            {/* Identity Info */}
            <div className="space-y-2 mb-8 animate-slide-up-item" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-xl">{user.fullName}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {user.specialization}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Online
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-white/60 text-xs font-medium leading-relaxed mb-8 px-4 animate-slide-up-item" style={{ animationDelay: '0.5s' }}>
              "{user.bio || 'Ready to create something extraordinary.'}"
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-8 animate-slide-up-item" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-1 group hover:bg-white/10 transition-colors">
                  <stat.icon size={14} className="text-white/40 group-hover:text-white transition-colors" />
                  <span className="text-lg font-black text-white">{stat.value}</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="animate-slide-up-item" style={{ animationDelay: '0.8s' }}>
              <button 
                onClick={onEnter}
                className="group relative w-full overflow-hidden rounded-xl bg-white p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#312E81_50%,#E2E8F0_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-3xl transition-all group-hover:bg-gray-900 gap-3">
                  Enter Studio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityReveal;
