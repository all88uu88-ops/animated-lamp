
import React, { useState, useEffect, useRef } from 'react';
import { Story, User, Comment } from '../types';
import { X, Heart, Send, Eye, MessageCircle } from 'lucide-react';

interface StoryViewerProps {
  story: Story;
  author: User;
  currentUser: User;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onLike: (storyId: string) => void;
  onComment: (storyId: string, text: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  story, author, currentUser, onClose, onNext, onPrev, onLike, onComment 
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [liveViewers, setLiveViewers] = useState(story.viewers);
  const [localLikes, setLocalLikes] = useState(story.likes);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Simulated Live Viewer Count Updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate viewer count +/- 5
      setLiveViewers(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Progress Bar Logic
  useEffect(() => {
    if (isPaused) return;
    
    const duration = story.mediaType === 'video' ? (videoRef.current?.duration || 10) * 1000 : 5000; // 5s for image
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [story.id, isPaused, onNext, story.mediaType]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setLiveViewers(story.viewers);
    setLocalLikes(story.likes);
    setParticles([]);
  }, [story.id]);

  const handleLike = () => {
    onLike(story.id);
    setLocalLikes(prev => prev + 1);
    
    // Add visual particles
    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() * 40 - 20), // Center variation
      y: 80 + (Math.random() * 10),
      emoji: ['❤️', '🔥', '😍', '✨'][Math.floor(Math.random() * 4)]
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id < Date.now())); // Simple clear logic
    }, 2000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(story.id, commentText);
    setCommentText('');
    
    // Show a comment bubble effect
    setParticles(prev => [...prev, { id: Date.now(), x: 50, y: 70, emoji: '💬' }]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
      {/* Background Blur */}
      <div className="absolute inset-0 opacity-30 blur-3xl scale-110" style={{ backgroundImage: `url(${story.mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <div className="relative w-full md:w-[450px] h-full md:h-[90vh] bg-gray-900 md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 flex gap-1">
           {/* In a real app with multiple stories per user, we'd map bars here. For now, 1 bar. */}
           <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
             <div className="h-full bg-white transition-all ease-linear" style={{ width: `${progress}%` }}></div>
           </div>
        </div>

        {/* Header: User Info & Close */}
        <div className="absolute top-8 left-0 right-0 z-20 px-4 flex justify-between items-center text-white">
           <div className="flex items-center gap-3">
              <img src={author.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-500" alt="" />
              <div>
                 <p className="font-bold text-sm leading-none">{author.fullName}</p>
                 <p className="text-[10px] opacity-80">{new Date(story.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                 <Eye size={14} className="text-emerald-400" />
                 <span className="text-xs font-black tabular-nums">{liveViewers}</span>
              </div>
              <button onClick={onClose}><X size={24} /></button>
           </div>
        </div>

        {/* Navigation Hit Areas */}
        <div className="absolute inset-0 z-10 flex">
           <div className="w-1/3 h-full" onClick={onPrev}></div>
           <div className="w-1/3 h-full" onClick={() => setIsPaused(!isPaused)}></div>
           <div className="w-1/3 h-full" onClick={onNext}></div>
        </div>

        {/* Media Display */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
           {story.mediaType === 'video' ? (
             <video 
               ref={videoRef}
               src={story.mediaUrl} 
               className="w-full h-full object-cover" 
               autoPlay 
               playsInline
               onEnded={onNext}
               onPause={() => setIsPaused(true)}
               onPlay={() => setIsPaused(false)}
             />
           ) : (
             <img src={story.mediaUrl} className="w-full h-full object-cover animate-in zoom-in-105 duration-[10s]" alt="" />
           )}
           
           {/* Visual Particles Container */}
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map(p => (
                <div 
                  key={p.id} 
                  className="particle-float text-4xl absolute"
                  style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
                >
                  {p.emoji}
                </div>
              ))}
           </div>
        </div>

        {/* Footer: Interactions */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
           
           {/* Live Comments Preview (Last 2) */}
           <div className="mb-4 space-y-2 h-16 overflow-hidden flex flex-col justify-end pointer-events-none">
              {story.comments.slice(-2).map(comment => (
                 <div key={comment.id} className="animate-in slide-in-from-bottom-2 fade-in">
                    <span className="font-bold text-xs text-white ml-2">{comment.authorName}</span>
                    <span className="text-xs text-white/90">{comment.content}</span>
                 </div>
              ))}
           </div>

           <div className="flex items-center gap-4">
              <form onSubmit={handleSendComment} className="flex-1 relative">
                 <input 
                   type="text" 
                   className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-3 px-5 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all text-sm font-bold"
                   placeholder="أرسل تعليقاً..."
                   value={commentText}
                   onChange={e => setCommentText(e.target.value)}
                   onFocus={() => setIsPaused(true)}
                   onBlur={() => setIsPaused(false)}
                 />
                 <button className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-1.5 hover:text-indigo-400 transition-colors">
                    <Send size={18} />
                 </button>
              </form>
              
              <button onClick={handleLike} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-rose-500/20 hover:text-rose-500 transition-all active:scale-90 border border-white/10 relative group">
                 <Heart size={24} fill={localLikes > story.likes ? "currentColor" : "none"} className={localLikes > story.likes ? "text-rose-500" : ""} />
                 <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">{localLikes}</span>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
