
import React from 'react';
import { BadgeRarity } from '../types';

interface BadgeProps {
  name: string;
  icon: string;
  rarity: BadgeRarity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ name, icon, rarity, size = 'md', showTooltip = true, className = '' }) => {
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-5 h-5 text-[10px]';
      case 'md': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-16 h-16 text-2xl';
      case 'xl': return 'w-32 h-32 text-6xl';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getRarityStyles = () => {
    switch (rarity) {
      case 'COMMON': return 'bg-slate-100 border-slate-300 text-slate-600';
      case 'RARE': return 'bg-amber-50 border-amber-300 text-amber-600 badge-rare shadow-amber-500/20';
      case 'EPIC': return 'bg-purple-50 border-purple-400 text-purple-600 badge-epic shadow-purple-500/30';
      case 'LEGENDARY': return 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent badge-legendary shadow-indigo-500/40';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className={`relative group/badge cursor-default inline-block ${className}`}>
      <div className={`
        ${getSizeClass()} 
        ${getRarityStyles()}
        rounded-full flex items-center justify-center border-2 shadow-sm
        transition-transform hover:scale-110 select-none
      `}>
        <span className="relative z-10 filter drop-shadow-sm">{icon}</span>
        
        {/* Legendary Shine Effect */}
        {rarity === 'LEGENDARY' && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
          {name}
        </div>
      )}
    </div>
  );
};

export default Badge;
