
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LiveSession, LiveParticipant, LiveMessage, User } from '../types';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, MessageSquare, 
  Users, MoreVertical, Lock, Unlock, Hand, Smile, Send, X, Shield, 
  Wifi, Minimize2, Maximize2, LayoutGrid
} from 'lucide-react';

interface LiveRoomProps {
  session: LiveSession;
  currentUser: User;
  onLeave: () => void;
  onEndSession: () => void; // Admin only
}

// Simple signaling service using BroadcastChannel for local tab-to-tab communication
// This acts as a "serverless" backend for the demo.
class LiveSignaling {
  private channel: BroadcastChannel;
  
  constructor(sessionId: string, onMessage: (msg: any) => void) {
    this.channel = new BroadcastChannel(`live_room_${sessionId}`);
    this.channel.onmessage = (ev) => onMessage(ev.data);
  }

  send(type: string, payload: any) {
    this.channel.postMessage({ type, payload });
  }

  close() {
    this.channel.close();
  }
}

const LiveRoom: React.FC<LiveRoomProps> = ({ session, currentUser, onLeave, onEndSession }) => {
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const signaling = useRef<LiveSignaling | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Room
  useEffect(() => {
    // 1. Setup Local Stream
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("Camera/Mic access denied", e);
        // Fallback or alert
      }
    };
    startStream();

    // 2. Setup Signaling & Join
    signaling.current = new LiveSignaling(session.id, (data) => {
      handleSignal(data);
    });

    const me: LiveParticipant = {
      id: currentUser.id,
      sessionId: session.id,
      name: currentUser.fullName,
      avatar: currentUser.avatar,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      isHandRaised: false,
      joinedAt: Date.now(),
      connectionQuality: 'GOOD'
    };

    // Broadcast Join
    signaling.current.send('JOIN', me);
    setParticipants([me]);

    // Initial sync request (ask others who is here)
    signaling.current.send('SYNC_REQ', me.id);

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      signaling.current?.send('LEAVE', currentUser.id);
      signaling.current?.close();
    };
  }, []);

  // Handle Signals
  const handleSignal = (data: { type: string, payload: any }) => {
    switch (data.type) {
      case 'JOIN':
        setParticipants(prev => {
          if (prev.find(p => p.id === data.payload.id)) return prev;
          return [...prev, data.payload];
        });
        // Reply to new joiner if I am host or simply present
        if (data.payload.id !== currentUser.id) {
           const me = participants.find(p => p.id === currentUser.id);
           if (me) signaling.current?.send('SYNC_RES', me);
        }
        break;
      case 'LEAVE':
        setParticipants(prev => prev.filter(p => p.id !== data.payload));
        break;
      case 'SYNC_REQ':
        // A new user asked for list, send my presence
        const me = participants.find(p => p.id === currentUser.id);
        if (me) signaling.current?.send('SYNC_RES', me);
        break;
      case 'SYNC_RES':
        setParticipants(prev => {
          if (prev.find(p => p.id === data.payload.id)) return prev;
          return [...prev, data.payload];
        });
        break;
      case 'UPDATE_STATUS':
        setParticipants(prev => prev.map(p => p.id === data.payload.id ? { ...p, ...data.payload.updates } : p));
        break;
      case 'CHAT':
        setMessages(prev => [...prev, data.payload]);
        break;
      case 'END_SESSION':
        alert('The host has ended the session.');
        onLeave();
        break;
    }
  };

  // Toggle Controls
  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStream?.getAudioTracks().forEach(t => t.enabled = !newState);
    updateMyStatus({ isMuted: newState });
  };

  const toggleCamera = () => {
    const newState = !isCameraOff;
    setIsCameraOff(newState);
    localStream?.getVideoTracks().forEach(t => t.enabled = !newState);
    updateMyStatus({ isCameraOff: newState });
  };

  const toggleHand = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    updateMyStatus({ isHandRaised: newState });
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        
        const track = stream.getVideoTracks()[0];
        track.onended = () => {
           stopScreenShare();
        };
        setIsScreenSharing(true);
        updateMyStatus({ isScreenSharing: true });
      } catch (e) {
        console.error("Screen share failed", e);
        alert("Failed to share screen. Please allow permission or try a different browser.");
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
     // Revert to camera
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
       setLocalStream(stream);
       if (videoRef.current) videoRef.current.srcObject = stream;
       setIsScreenSharing(false);
       updateMyStatus({ isScreenSharing: false });
     } catch (e) {
       console.error("Failed to revert to camera", e);
     }
  };

  const updateMyStatus = (updates: Partial<LiveParticipant>) => {
    setParticipants(prev => prev.map(p => p.id === currentUser.id ? { ...p, ...updates } : p));
    signaling.current?.send('UPDATE_STATUS', { id: currentUser.id, updates });
  };

  // Chat Logic
  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const msg: LiveMessage = {
      id: Math.random().toString(36),
      sessionId: session.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text: chatInput,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    signaling.current?.send('CHAT', msg);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Admin Actions
  const handleEndSession = () => {
    if (confirm('End session for everyone?')) {
      signaling.current?.send('END_SESSION', {});
      onEndSession();
    }
  };

  // Layout Logic
  const gridCols = useMemo(() => {
    const count = participants.length;
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4';
  }, [participants.length]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col animate-in fade-in duration-500">
      
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-xl z-20">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-500 rounded-full border border-red-500/30">
               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">LIVE {formatTime(Date.now() - (session.startedAt || Date.now()))}</span>
            </div>
            <h2 className="text-white font-bold text-sm hidden md:block">{session.title}</h2>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
               {participants.slice(0, 4).map(p => (
                  <img key={p.id} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-[#050505]" />
               ))}
               {participants.length > 4 && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold border-2 border-[#050505]">+{participants.length - 4}</div>}
            </div>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <button className="p-2 text-white/50 hover:text-white transition"><LayoutGrid size={20}/></button>
            <button onClick={() => setShowChat(!showChat)} className={`p-2 transition ${showChat ? 'text-indigo-400' : 'text-white/50 hover:text-white'}`}><MessageSquare size={20}/></button>
         </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* Video Grid */}
         <div className={`flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar grid ${gridCols} gap-4 content-center`}>
            {participants.map(participant => {
               const isMe = participant.id === currentUser.id;
               return (
                  <div key={participant.id} className={`relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 aspect-video shadow-2xl group transition-all duration-300 ${participant.isScreenSharing ? 'col-span-full row-span-2' : ''}`}>
                     
                     {/* Video/Placeholder */}
                     {isMe ? (
                        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''} transform ${!isScreenSharing ? 'scale-x-[-1]' : ''}`} />
                     ) : (
                        // Mock Remote Video: In a real app, this would be a WebRTC stream URL
                        <div className={`w-full h-full object-cover ${participant.isCameraOff ? 'hidden' : ''}`}>
                           {/* Simulating a remote stream with a static image or a loopback if implemented */}
                           <img src={participant.avatar} className="w-full h-full object-cover opacity-50 blur-sm" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white/20 text-xs font-mono uppercase tracking-widest">Remote Stream</span>
                           </div>
                        </div>
                     )}

                     {/* Camera Off State */}
                     {(isMe ? isCameraOff : participant.isCameraOff) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                           <img src={participant.avatar} className="w-24 h-24 rounded-full border-4 border-white/5 mb-4 shadow-xl" />
                           <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-widest">
                              <VideoOff size={14} /> Camera Off
                           </div>
                        </div>
                     )}

                     {/* Overlays */}
                     <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {participant.isHandRaised && <div className="bg-amber-500 text-black p-2 rounded-full animate-bounce shadow-lg"><Hand size={16}/></div>}
                        {participant.isMuted && <div className="bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md"><MicOff size={14}/></div>}
                        {participant.connectionQuality === 'POOR' && <div className="bg-white/10 text-red-400 p-2 rounded-full backdrop-blur-md"><Wifi size={14}/></div>}
                     </div>

                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                        <div>
                           <p className="text-white font-bold text-sm shadow-sm">{participant.name} {isMe && '(You)'}</p>
                           {participant.id === session.hostId && <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider">Host</span>}
                        </div>
                        {/* Audio Visualizer Mock */}
                        {!participant.isMuted && (
                           <div className="flex gap-0.5 items-end h-4">
                              {[1,2,3,4].map(i => <div key={i} className="w-1 bg-emerald-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: '0.5s' }}></div>)}
                           </div>
                        )}
                     </div>

                     {/* Border Glow for Speaker */}
                     {!participant.isMuted && (
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-3xl pointer-events-none transition-opacity duration-300"></div>
                     )}
                  </div>
               );
            })}
         </div>

         {/* Chat Sidebar */}
         {showChat && (
            <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
               <div className="p-4 border-b border-white/10 font-bold text-white text-sm flex justify-between items-center">
                  <span>Chat Room</span>
                  <button onClick={() => setShowChat(false)}><X size={16} className="text-white/50 hover:text-white"/></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map(msg => (
                     <div key={msg.id} className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between">
                           <span className={`text-[10px] font-bold ${msg.senderId === currentUser.id ? 'text-indigo-400' : 'text-white/60'}`}>{msg.senderName}</span>
                           <span className="text-[8px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${msg.senderId === currentUser.id ? 'bg-indigo-600/20 text-white rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none'}`}>
                           {msg.text}
                        </div>
                     </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>
               <form onSubmit={sendMessage} className="p-4 border-t border-white/10 relative">
                  <input 
                     type="text" 
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition"
                     placeholder="Say something..."
                     value={chatInput}
                     onChange={e => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-indigo-400 transition"><Send size={16}/></button>
               </form>
            </div>
         )}
      </div>

      {/* Bottom Controls */}
      <div className="h-24 flex items-center justify-center gap-4 px-6 relative z-50">
         <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 bg-[#111]/80 border border-white/10 shadow-2xl">
            <button onClick={toggleMute} className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'hover:bg-white/10 text-white'}`}>
               {isMuted ? <MicOff size={20}/> : <Mic size={20}/>}
            </button>
            <button onClick={toggleCamera} className={`p-4 rounded-xl transition-all ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'hover:bg-white/10 text-white'}`}>
               {isCameraOff ? <VideoOff size={20}/> : <Video size={20}/>}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button onClick={toggleScreenShare} className={`p-4 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-white/10 text-white'}`} title="Share Screen">
               <Monitor size={20}/>
            </button>
            <button onClick={toggleHand} className={`p-4 rounded-xl transition-all ${isHandRaised ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white'}`} title="Raise Hand">
               <Hand size={20}/>
            </button>
            {currentUser.role === 'ADMIN' && (
               <>
                  <div className="w-px h-8 bg-white/10 mx-2"></div>
                  <button className="p-4 rounded-xl hover:bg-white/10 text-white" title="Security">
                     <Shield size={20}/>
                  </button>
               </>
            )}
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button onClick={currentUser.role === 'ADMIN' ? handleEndSession : onLeave} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 transition">
               <PhoneOff size={16}/> {currentUser.role === 'ADMIN' ? 'End for All' : 'Leave'}
            </button>
         </div>
      </div>

    </div>
  );
};

// Helper
function formatTime(ms: number) {
   if (ms < 0) return "00:00";
   const s = Math.floor((ms / 1000) % 60);
   const m = Math.floor((ms / 1000 / 60) % 60);
   const h = Math.floor((ms / 1000 / 3600));
   return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default LiveRoom;
