
import React, { useState } from 'react';
import { Post, User, Comment, Specialization } from '../types';
import { BADGE_DEFINITIONS } from '../constants';
import Badge from './components/Badge';
import { Clock, MessageCircle, MessageSquare, Send, Trash2, Heart, Share2, MoreVertical, Camera, Pen, Film, Palette, User as UserIcon, CheckCircle2, Reply } from 'lucide-react';

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
  const isAdmin = currentUser?.role === 'ADMIN';
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(post.id, replyText, parentId);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleLikeClick = () => {
    onLike(post.id);
    if (!isLiked) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 400);
    }
  };

  const author = allUsers.find(u => u.id === post.authorId);

  const renderComment = (comment: Comment, isReply = false) => {
    const commentAuthor = allUsers.find(u => u.id === comment.authorId);
    return (
      <div key={comment.id} className={`flex gap-4 group ${isReply ? 'mr-12 mt-2 border-r-2 border-slate-100 dark:border-slate-800 pr-4' : ''}`}>
        <img src={commentAuthor?.avatar} className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-[1.2rem] object-cover shadow-sm transition-transform hover:scale-105`} alt="" />
        <div className="flex-1 space-y-2">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[1.8rem] p-4 relative border border-white dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">{comment.authorName}</span>
                {commentAuthor && (
                  <SpecIcon spec={commentAuthor.specialization} size={10} className="text-slate-300" />
                )}
                {/* Comment Author Badges (Tiny) */}
                {commentAuthor && commentAuthor.badges && commentAuthor.badges.length > 0 && (
                   <div className="flex -space-x-1">
                      {commentAuthor.badges.slice(0, 2).map(b => (
                         <Badge key={b.id} {...BADGE_DEFINITIONS[b.id]} size="sm" showTooltip={false} className="scale-75" />
                      ))}
                   </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isReply && (
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[10px] font-black text-indigo-500 flex items-center gap-1 hover:underline interactive-icon">
                    <Reply size={12}/> رد
                  </button>
                )}
                {(isAdmin || comment.authorId === currentUser?.id) && (
                  <button onClick={() => onDeleteComment(post.id, comment.id)} className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity interactive-icon"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <p className="text-sm text-[var(--text-main)] font-medium leading-relaxed">{comment.content}</p>
          </div>
          
          {replyingTo === comment.id && (
            <div className="flex gap-2 animate-in slide-in-from-right-2">
               <input 
                autoFocus 
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold outline-none input-animated" 
                placeholder={`الرد على ${comment.authorName}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReplySubmit(comment.id)}
               />
               <button onClick={() => handleReplySubmit(comment.id)} className="bg-indigo-600 text-white p-2 rounded-xl btn-bounce"><Send size={14}/></button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 mt-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card-premium overflow-hidden transition-all duration-500 bg-[var(--bg-card)] border-none shadow-2xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={author?.avatar || `https://picsum.photos/seed/${post.authorId}/60`} 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md transition-transform hover:scale-110" 
              alt={post.authorName} 
            />
            {author?.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[var(--text-main)] text-sm leading-tight hover:text-indigo-600 transition-colors cursor-pointer">{post.authorName}</h3>
              {author && (
                <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <SpecIcon spec={author.specialization} size={10} />
                  <span className="text-[9px] font-black uppercase tracking-wider">{author.specialization}</span>
                </div>
              )}
              {/* Badges Display */}
              {author && author.badges && author.badges.length > 0 && (
                 <div className="flex items-center -space-x-1.5 mr-2">
                   {author.badges.map(b => (
                     <Badge key={b.id} {...BADGE_DEFINITIONS[b.id]} size="sm" />
                   ))}
                 </div>
              )}
            </div>
            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest mt-1">
              <Clock size={10} /> {new Date(post.timestamp).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminView && post.status === 'PENDING' && (
            <button onClick={() => onApprove?.(post.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 btn-bounce">
               <CheckCircle2 size={12}/> اعتماد
            </button>
          )}
          {isAdminView && (
            <button onClick={() => onDelete?.(post.id)} className="text-slate-300 hover:text-rose-500 p-2.5 transition-colors interactive-icon"><Trash2 size={20} strokeWidth={2.5}/></button>
          )}
          <button className="text-slate-300 hover:text-indigo-500 p-2.5 transition-colors interactive-icon"><MoreVertical size={20} strokeWidth={2.5}/></button>
        </div>
      </div>

      <div className="px-8 pb-6">
        <p className="text-[var(--text-main)] text-sm md:text-lg font-bold leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.mediaUrl && (
        <div className="relative mx-6 mb-6 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-900 group img-zoom-container">
          {post.mediaType === 'image' ? (
            <img src={post.mediaUrl} className="w-full h-auto max-h-[550px] object-cover img-zoom" alt="" />
          ) : (
            <video src={post.mediaUrl} className="w-full h-auto max-h-[550px] object-cover" controls />
          )}
          {post.status === 'PENDING' && (
            <div className="absolute top-6 left-6 bg-yellow-400 text-black px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce">تحت المراجعة</div>
          )}
        </div>
      )}

      <div className="px-8 pb-6 pt-2">
        <div className="flex flex-col gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
          
          {/* Reaction Stats Display */}
          {(Object.keys(post.reactions || {}).length > 0) && (
            <div className="flex items-center gap-2 mb-2">
               <div className="flex -space-x-2">
                 {Array.from(new Set(Object.values(post.reactions || {}))).slice(0, 3).map((emoji, i) => (
                   <span key={i} className="bg-white dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm border border-slate-100 dark:border-slate-800 animate-in zoom-in">{emoji}</span>
                 ))}
               </div>
               <span className="text-[10px] font-bold text-slate-400">تفاعل {Object.keys(post.reactions || {}).length} عضو</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <button 
                  onClick={handleLikeClick} 
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                  className={`flex items-center gap-2 transition-all duration-300 btn-bounce ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
                >
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2.5} className={isLikeAnimating ? 'reaction-active' : ''} />
                  <span className="text-xs font-black">{post.likes.length}</span>
                </button>
                
                {showReactionPicker && (
                  <div 
                    onMouseEnter={() => setShowReactionPicker(true)}
                    onMouseLeave={() => setShowReactionPicker(false)}
                    className="absolute bottom-full mb-4 left-0 glass-card p-2 rounded-2xl flex gap-1 z-50 animate-in fade-in zoom-in duration-200 shadow-2xl"
                  >
                    {COMMON_REACTIONS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => {
                          onReaction?.(post.id, emoji);
                          setShowReactionPicker(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform p-1.5 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 transition-all interactive-icon ${showComments ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-indigo-500'}`}>
                <MessageCircle size={22} strokeWidth={2.5} />
                <span className="text-xs font-black">{post.comments.length}</span>
              </button>
              
              <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors interactive-icon">
                <Share2 size={22} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {showComments && (
          <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => renderComment(comment))
              ) : (
                <div className="text-center py-10 opacity-20">
                  <MessageSquare size={32} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">بانتظار أول تعليق</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-4 items-center bg-[var(--input-bg)] p-2 rounded-[2rem] border border-[var(--border-color)] input-animated">
               <img src={currentUser?.avatar} className="w-10 h-10 rounded-[1.2rem] object-cover shadow-sm" alt="" />
               <div className="flex-1 relative flex items-center">
                 <input 
                  type="text" 
                  placeholder="شارك المبدعين برأيك..." 
                  className="w-full bg-transparent border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-0 outline-none placeholder-slate-300" 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)} 
                 />
                 <div className="flex items-center gap-2 mr-auto ml-3">
                   <button type="button" onClick={() => setCommentText(prev => prev + '🔥')} className="text-xl hover:scale-125 transition-transform active:scale-90">🔥</button>
                   <button type="button" onClick={() => setCommentText(prev => prev + '🎬')} className="text-xl hover:scale-125 transition-transform active:scale-90">🎬</button>
                   <button type="submit" className="text-indigo-600 p-2 hover:scale-110 transition-transform active:scale-95 btn-bounce"><Send size={20} strokeWidth={2.5}/></button>
                 </div>
               </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
