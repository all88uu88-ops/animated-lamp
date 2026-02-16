
import React from 'react';
import { Idea, User } from '../types';
import { ThumbsUp, Calendar, User as UserIcon, Tag, Trophy, Sparkles } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  currentUser: User | null;
  onVote: (ideaId: string) => void;
  isTopVoted?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, currentUser, onVote, isTopVoted }) => {
  const hasVoted = currentUser ? idea.votes.includes(currentUser.id) : false;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'مقبولة': return { color: 'bg-emerald-500', label: 'Authorized' };
      case 'مرفوضة': return { color: 'bg-rose-500', label: 'Rejected' };
      case 'قيد التنفيذ': return { color: 'bg-indigo-500', label: 'In Production' };
      default: return { color: 'bg-amber-500', label: 'In Review' };
    }
  };

  const status = getStatusInfo(idea.status);

  return (
    <div className={`glass-panel p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/10 rounded-[2rem] bg-black/40 ${isTopVoted ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]' : 'hover:border-white/20'}`}>
      {isTopVoted && (
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-bl-2xl flex items-center gap-2 shadow-lg z-10">
          <Trophy size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Top Rated</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
           <span className={`w-2 h-2 rounded-full ${status.color} shadow-[0_0_10px_currentColor] animate-pulse`}></span>
           <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">{status.label}</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
          <Tag size={10} />
          <span className="text-[9px] font-black uppercase tracking-widest">{idea.type}</span>
        </div>
      </div>

      <h3 className="text-2xl font-black mb-3 text-white tracking-tight">{idea.title}</h3>
      <p className="text-white/60 text-sm mb-8 leading-relaxed line-clamp-3 font-medium">
        {idea.description}
      </p>

      {idea.adminNote && (
        <div className="mb-8 p-4 bg-indigo-500/5 rounded-xl border-l-2 border-indigo-500 relative">
          <p className="text-[8px] font-black text-indigo-400 mb-1 uppercase tracking-widest">Director's Note</p>
          <p className="text-xs italic text-white/80">{idea.adminNote}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-white font-black text-xs">
              <UserIcon size={12} className="text-white/40" />
              {idea.authorName}
            </div>
          </div>
        </div>

        <button 
          onClick={() => onVote(idea.id)}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-wider ${hasVoted ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5'}`}
        >
          <ThumbsUp size={16} fill={hasVoted ? "currentColor" : "none"} />
          <span>{idea.votes.length} Votes</span>
        </button>
      </div>
    </div>
  );
};

export default IdeaCard;
