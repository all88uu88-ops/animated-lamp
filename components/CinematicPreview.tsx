
import React, { useState, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import PostCard from './PostCard';
import { X, CheckCircle2, Sliders, Eye, Film, Layers, Monitor, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface CinematicPreviewProps {
  draftContent: { content: string; mediaType: 'image' | 'video'; mediaData: string };
  currentUser: User;
  onClose: () => void;
  onPublish: () => void;
}

const CinematicPreview: React.FC<CinematicPreviewProps> = ({ draftContent, currentUser, onClose, onPublish }) => {
  const [mounted, setMounted] = useState(false);
  const [showGrain, setShowGrain] = useState(true);
  const [showAmbient, setShowAmbient] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Local state for simulated interactions
  const [simulatedLikes, setSimulatedLikes] = useState<string[]>([]);
  const [simulatedComments, setSimulatedComments] = useState<Comment[]>([]);

  // Construct a temporary post object for the preview
  const previewPost: Post = {
    id: 'preview-1',
    authorId: currentUser.id,
    authorName: currentUser.fullName,
    content: draftContent.content || 'Your caption will appear here...',
    mediaType: draftContent.mediaType,
    mediaUrl: draftContent.mediaData,
    timestamp: Date.now(),
    likes: simulatedLikes,
    reactions: {},
    comments: simulatedComments,
    status: 'PENDING'
  };

  useEffect(() => {
    setMounted(true);
    // Hide overflow on body when preview is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSimulatedLike = () => {
    if (simulatedLikes.includes(currentUser.id)) {
      setSimulatedLikes(prev => prev.filter(id => id !== currentUser.id));
    } else {
      setSimulatedLikes(prev => [...prev, currentUser.id]);
    }
  };

  const handleSimulatedComment = (postId: string, content: string, parentId?: string) => {
    const newComment: Comment = {
      id: Math.random().toString(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      content,
      timestamp: Date.now(),
      replies: []
    };
    
    if (parentId) {
       // Deep nesting simulation simplified for preview
       setSimulatedComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c));
    } else {
       setSimulatedComments(prev => [...prev, newComment]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- Ambient Layers --- */}
      
      {/* 1. Dynamic Background Blur (Ambiance) */}
      {showAmbient && draftContent.mediaData && (
        <div 
          className="absolute inset-0 opacity-30 blur-[100px] scale-125 transition-opacity duration-1000 pointer-events-none z-0"
          style={{ 
            backgroundImage: `url(${draftContent.mediaData})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        />
      )}

      {/* 2. Film Grain Overlay */}
      {showGrain && (
        <div className="film-grain opacity-[0.07] absolute inset-0 z-10 pointer-events-none mix-blend-overlay"></div>
      )}

      {/* 3. Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none"></div>

      {/* 4. Top HUD */}
      <div className="relative z-50 flex justify-between items-center p-6 w-full max-w-7xl mx-auto animate-in slide-in-from-top-4 duration-700">
         <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Studio Preview</span>
            </div>
            <div className="text-white/30 text-[10px] font-mono uppercase tracking-widest hidden md:block">
               Render Mode: High Fidelity
            </div>
         </div>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition group">
            <X size={24} className="group-hover:rotate-90 transition-transform"/>
         </button>
      </div>

      {/* --- Main Stage --- */}
      <div className="relative z-40 flex-1 overflow-y-auto custom-scrollbar flex items-start justify-center py-10 px-4">
         <div className={`w-full max-w-2xl transition-all duration-700 transform ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'}`}>
            
            {/* Draft Watermark */}
            {showWatermark && (
               <div className="absolute -top-6 -right-6 md:-right-12 z-50 pointer-events-none select-none">
                  <div className="bg-amber-500 text-black text-[10px] font-black px-6 py-2 rotate-12 shadow-xl border-2 border-white uppercase tracking-[0.3em]">
                     Draft Mode
                  </div>
               </div>
            )}

            {/* The Content Card */}
            <div className="relative shadow-[0_0_100px_-20px_rgba(0,0,0,0.7)] rounded-[2rem]">
               <PostCard 
                  post={previewPost}
                  currentUser={currentUser}
                  allUsers={[currentUser]} // In preview, only show current user as known
                  onLike={handleSimulatedLike}
                  onAddComment={(pid, txt, parent) => handleSimulatedComment(pid, txt, parent)}
                  onDeleteComment={() => {}} // No delete in preview
                  onReaction={() => {}}
               />
               
               {/* Reflection/Sheen Effect on the Card */}
               <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>

            <p className="text-center text-white/20 text-[10px] font-mono uppercase tracking-widest mt-8 mb-20">
               Interactive Simulation • Does not affect live data
            </p>
         </div>
      </div>

      {/* --- Bottom Controls (HUD) --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-700 delay-100 w-auto max-w-[90vw]">
         <div className="glass-panel p-2 rounded-2xl flex items-center gap-4 border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-2xl">
            
            {/* Effect Toggles */}
            <div className="flex gap-1 border-r border-white/10 pr-4 mr-2">
               <button 
                  onClick={() => setShowAmbient(!showAmbient)} 
                  className={`p-3 rounded-xl transition-all ${showAmbient ? 'bg-white/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-white/30 hover:text-white'}`}
                  title="Toggle Ambient Light"
               >
                  <Sparkles size={18} />
               </button>
               <button 
                  onClick={() => setShowGrain(!showGrain)} 
                  className={`p-3 rounded-xl transition-all ${showGrain ? 'bg-white/10 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'text-white/30 hover:text-white'}`}
                  title="Toggle Film Grain"
               >
                  <Film size={18} />
               </button>
               <button 
                  onClick={() => setShowWatermark(!showWatermark)} 
                  className={`p-3 rounded-xl transition-all ${showWatermark ? 'bg-white/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'text-white/30 hover:text-white'}`}
                  title="Toggle Watermark"
               >
                  <Layers size={18} />
               </button>
               <button 
                  onClick={toggleFullscreen} 
                  className="p-3 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all"
                  title="Fullscreen"
               >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
               </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
               <button onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition">
                  Edit
               </button>
               <button onClick={onPublish} className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-2">
                  <CheckCircle2 size={14}/> Publish Now
               </button>
            </div>

         </div>
      </div>

    </div>
  );
};

export default CinematicPreview;
