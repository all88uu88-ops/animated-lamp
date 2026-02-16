
import React, { useState } from 'react';
import { Post, User, Comment, Specialization } from '../types';
import { Clock, MessageCircle, Send, Trash2, Heart, Share2, MoreVertical, Camera, Pen, Film, Palette, User as UserIcon, CheckCircle2, Reply, Maximize2, Monitor, Plus } from 'lucide-react';
import { BADGE_DEFINITIONS } from '../constants';
import Badge from './Badge';

const COMMON_REACTIONS = ['👍', '😂', '🔥', '😮', '😢', '😍'];

export const SpecIcon: React.FC<{ spec: Specialization; size?: number; className?: string }> = ({ spec, size = 14, className = "" }) => {
  switch (spec) {
    case 'مصور': return <Camera size={size} className={className} />;
    case 'كاتب': return <Pen size={size} className={className} />;
    case 'مونتاج': return <Film size={size} className={className} />;
    case 'تصميم': return <Palette size={size} className={className} />;
    default: return <UserIcon size={size} className={className} />;
  }
};

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  allUsers: User[];
  onLike: (postId: string) => void;
  onReaction?: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  isAdminView?: boolean;
  onApprove?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, currentUser, allUsers, onLike, onReaction, onAddComment, onDeleteComment, isAdminView = false, onApprove, onDelete
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const author = allUsers.find(u => u.id === post.authorId);

  const handleLikeClick = () => {
    onLike(post.id);
    if (!isLiked) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 400);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const commentAuthor = allUsers.find(u => u.id === comment.authorId);
    return (
      <div key={comment.id} className={`flex gap-3 group animate-in slide-in-from-left-2 duration-300 ${isReply ? 'ml-8 mt-3 pl-4 border-l border-slate-200 dark:border-white/10' : ''}`}>
        <img src={commentAuthor?.avatar} className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10 shadow-sm`} alt="" loading="lazy" decoding="async" />
        <div className="flex-1">
          <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">{comment.authorName}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {!isReply && <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[10px] text-slate-500 dark:text-white/40 hover:text-indigo-600 dark:hover:text-white flex items-center gap-1"><Reply size={10}/> Reply</button>}
                 {(currentUser?.role === 'ADMIN' || comment.authorId === currentUser?.id) && <button onClick={() => onDeleteComment(post.id, comment.id)} className="text-slate-400 dark:text-white/30 hover:text-rose-500"><Trash2 size={12}/></button>}
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-white/70 leading-relaxed font-mono tracking-wide">{comment.content}</p>
          </div>
          {replyingTo === comment.id && (
             <div className="flex gap-2 mt-2">
                <input autoFocus className="flex-1 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-white/30 transition" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && replyText.trim()){onAddComment(post.id, replyText, comment.id); setReplyText(''); setReplyingTo(null);}}} />
             </div>
          )}
          {comment.replies?.map(r => renderComment(r, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden hover:border-indigo-200 dark:hover:border-white/20 transition-all duration-500 group shadow-lg dark:shadow-2xl relative transform translate-z-0">
      {/* Decorative Film Sprockets - Visible only in dark mode or subtle in light */}
      <div className="absolute top-0 bottom-0 left-2 w-1 flex flex-col gap-1 opacity-10 dark:opacity-20 pointer-events-none">
          {Array.from({length: 10}).map((_, i) => <div key={i} className="flex-1 w-full bg-slate-900 dark:bg-white/20 rounded-full"></div>)}
      </div>

      {/* Header */}
      <div className="p-6 pl-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
             <img src={author?.avatar} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-md" loading="lazy" decoding="async" />
             {author?.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">{post.authorName}</h3>
                {author && (
                   <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/20 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/5">{author.specialization}</span>
                )}
             </div>
             <div className="text-[10px] text-slate-500 dark:text-white/40 font-mono mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock size={10}/> {new Date(post.timestamp).toLocaleDateString()} • RAW
             </div>
          </div>
        </div>
        <div className="flex gap-2">
           {isAdminView && <button onClick={() => onDelete?.(post.id)} className="text-slate-400 dark:text-white/20 hover:text-rose-500 p-2 transition"><Trash2 size={16}/></button>}
           <button className="text-slate-400 dark:text-white/20 hover:text-slate-900 dark:hover:text-white p-2 transition"><MoreVertical size={16}/></button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pl-8">
         <p className="text-slate-700 dark:text-white/90 text-sm font-medium leading-loose whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media Viewport - Layout Stable */}
      {post.mediaUrl && (
         <div className="px-6 pb-6 pl-8">
            {/* Added aspect-ratio and min-height container to prevent layout shift */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group/media bg-slate-100 dark:bg-black shadow-inner min-h-[300px]">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-30 dark:opacity-60 z-10 pointer-events-none"></div>
               
               {/* Digital Viewfinder Overlay */}
               <div className="absolute inset-4 border border-white/40 dark:border-white/20 opacity-0 group-hover/media:opacity-100 transition duration-500 z-20 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between text-[8px] font-mono text-white/80 uppercase tracking-widest">
                     <span>[REC]</span>
                     <span>1/1000</span>
                  </div>
                  <div className="flex justify-center text-white/20">
                     <Plus size={20} strokeWidth={1} />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-white/80 uppercase tracking-widest">
                     <span>ISO 1600</span>
                     <span>F/2.8</span>
                  </div>
               </div>

               {post.mediaType === 'image' ? (
                 <img src={post.mediaUrl} className="w-full max-h-[600px] object-contain transform group-hover/media:scale-105 transition duration-[2s]" loading="lazy" decoding="async" />
               ) : (
                 <video src={post.mediaUrl} className="w-full max-h-[600px]" controls />
               )}
               
               {post.status === 'PENDING' && (
                  <div className="absolute top-4 left-4 bg-amber-500/20 backdrop-blur border border-amber-500/50 text-amber-500 text-[9px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] z-30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">In Review</div>
               )}
               <button className="absolute top-4 right-4 text-white/50 hover:text-white z-30 opacity-0 group-hover/media:opacity-100 transition"><Maximize2 size={18}/></button>
            </div>
         </div>
      )}

      {/* Footer / Actions */}
      <div className="px-6 pb-6 pl-8">
         <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex gap-6">
               <div className="relative group/like">
                  <button onClick={handleLikeClick} onMouseEnter={() => setShowReactionPicker(true)} onMouseLeave={() => setShowReactionPicker(false)} className={`flex items-center gap-2.5 text-xs font-black transition-all ${isLiked ? 'text-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.2)] rounded-full px-3 py-1 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}>
                     <Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLikeAnimating ? 'animate-ping' : ''} />
                     <span className="tracking-wider">{post.likes.length} LIKES</span>
                  </button>
                  {showReactionPicker && (
                     <div onMouseEnter={() => setShowReactionPicker(true)} onMouseLeave={() => setShowReactionPicker(false)} className="absolute bottom-full left-0 mb-3 bg-white dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 flex gap-1 z-50 rounded-xl shadow-2xl">
                        {COMMON_REACTIONS.map(e => <button key={e} onClick={() => {onReaction?.(post.id, e); setShowReactionPicker(false);}} className="text-xl hover:scale-125 transition duration-300 p-1">{e}</button>)}
                     </div>
                  )}
               </div>
               <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2.5 text-xs font-black transition-all ${showComments ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}>
                  <MessageCircle size={18} />
                  <span className="tracking-wider">{post.comments.length} COMMENTS</span>
               </button>
            </div>
            {isAdminView && post.status === 'PENDING' && (
               <div className="flex gap-2">
                  <button onClick={() => onApprove?.(post.id)} className="bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition">Authorize</button>
               </div>
            )}
         </div>

         {/* Comments Section */}
         {showComments && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-500">
               <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar mb-4 pr-2">
                  {post.comments.length > 0 ? post.comments.map(c => renderComment(c)) : <p className="text-slate-400 dark:text-white/20 text-[10px] font-mono text-center uppercase tracking-widest py-4">No data recorded. Start the log.</p>}
               </div>
               <form onSubmit={(e) => { e.preventDefault(); if(commentText.trim()) { onAddComment(post.id, commentText); setCommentText(''); } }} className="flex gap-3 items-center">
                  <img src={currentUser?.avatar} className="w-8 h-8 rounded-lg object-cover opacity-50" loading="lazy" decoding="async" />
                  <div className="flex-1 relative">
                     <input type="text" placeholder="Add to the log..." className="w-full bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 dark:text-white focus:border-indigo-400 dark:focus:border-white/30 outline-none transition font-mono" value={commentText} onChange={e => setCommentText(e.target.value)} />
                     <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-1"><Send size={14}/></button>
                  </div>
               </form>
            </div>
         )}
      </div>
    </div>
  );
};

export default PostCard;
