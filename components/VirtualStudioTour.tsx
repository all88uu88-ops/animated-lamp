
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Info, MapPin, Camera, Mic, Monitor, Music, Volume2, VolumeX, Minimize2, ArrowLeftCircle } from 'lucide-react';

interface TourItem {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  label: string;
  type: 'EQUIPMENT' | 'PROJECT' | 'INFO';
  icon: React.ElementType;
  description: string;
  image?: string;
}

interface TourRoom {
  id: string;
  name: string;
  description: string;
  bgImage: string;
  connections: { roomId: string; label: string; x: number; y: number }[];
  items: TourItem[];
}

const ROOMS: Record<string, TourRoom> = {
  'ATRIUM': {
    id: 'ATRIUM',
    name: 'Main Atrium',
    description: 'The central hub connecting all creative departments.',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    connections: [
      { roomId: 'EDITING', label: 'Editing Suites', x: 20, y: 55 },
      { roomId: 'PRODUCTION', label: 'Production Floor', x: 80, y: 55 },
      { roomId: 'AUDIO', label: 'Audio Lab', x: 50, y: 40 },
    ],
    items: [
      { id: 'item-1', x: 50, y: 80, label: 'Welcome Desk', type: 'INFO', icon: Info, description: 'Check in here for equipment rentals and studio booking schedules.' }
    ]
  },
  'EDITING': {
    id: 'EDITING',
    name: 'Post-Production Bay',
    description: 'High-performance workstations for 4K video editing and VFX.',
    bgImage: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop',
    connections: [
      { roomId: 'ATRIUM', label: 'Back to Atrium', x: 10, y: 80 },
    ],
    items: [
      { id: 'edit-1', x: 35, y: 45, label: 'Master Station', type: 'EQUIPMENT', icon: Monitor, description: 'Dual calibrated displays with full color grading panel.', image: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?q=80&w=2070&auto=format&fit=crop' },
      { id: 'edit-2', x: 70, y: 50, label: 'Render Farm', type: 'PROJECT', icon: Monitor, description: 'Dedicated server cluster for background rendering.', image: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2072&auto=format&fit=crop' }
    ]
  },
  'PRODUCTION': {
    id: 'PRODUCTION',
    name: 'Production Floor',
    description: 'Professional soundstage with cyclorama and lighting grid.',
    bgImage: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2056&auto=format&fit=crop',
    connections: [
      { roomId: 'ATRIUM', label: 'Back to Atrium', x: 10, y: 80 },
    ],
    items: [
      { id: 'cam-1', x: 45, y: 60, label: 'Cinema Camera', type: 'EQUIPMENT', icon: Camera, description: '8K Digital Cinema Camera with Prime Lens Kit.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop' },
      { id: 'light-1', x: 20, y: 30, label: 'Softbox Array', type: 'EQUIPMENT', icon: Info, description: 'Remote controlled RGBWW LED soft lighting.', image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=1976&auto=format&fit=crop' }
    ]
  },
  'AUDIO': {
    id: 'AUDIO',
    name: 'Audio Lab',
    description: 'Acoustically treated room for voiceovers and sound design.',
    bgImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop',
    connections: [
      { roomId: 'ATRIUM', label: 'Back to Atrium', x: 15, y: 85 },
    ],
    items: [
      { id: 'mic-1', x: 50, y: 40, label: 'Condenser Mic', type: 'EQUIPMENT', icon: Mic, description: 'Professional large-diaphragm condenser for broadcast quality voice.', image: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?q=80&w=1974&auto=format&fit=crop' },
      { id: 'mix-1', x: 50, y: 70, label: 'Mixing Console', type: 'EQUIPMENT', icon: Music, description: '24-channel analog mixing board with digital interface.', image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop' }
    ]
  }
};

interface VirtualStudioTourProps {
  onClose: () => void;
}

const VirtualStudioTour: React.FC<VirtualStudioTourProps> = ({ onClose }) => {
  const [currentRoomId, setCurrentRoomId] = useState<string>('ATRIUM');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TourItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default off for auto-play policy
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentRoom = ROOMS[currentRoomId];

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Room Transition
  const handleNavigate = (roomId: string) => {
    setIsTransitioning(true);
    setSelectedItem(null);
    playSound('whoosh');
    setTimeout(() => {
      setCurrentRoomId(roomId);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 800);
  };

  // Audio Logic
  useEffect(() => {
    if (soundEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=room-tone-low-hum-19637.mp3'); // Placeholder ambient
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;
      }
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    } else {
      audioRef.current?.pause();
    }
    return () => { audioRef.current?.pause(); };
  }, [soundEnabled]);

  const playSound = (type: 'click' | 'whoosh' | 'hover') => {
    if (!soundEnabled) return;
    // Simple synthesized sounds or placeholders would go here
    // For this demo, we assume user interaction allows audio context
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans select-none" ref={containerRef}>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-black pointer-events-none z-0"></div>
      <div className="absolute inset-0 z-50 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]"></div>
      <div className="film-grain opacity-10 absolute inset-0 z-50 pointer-events-none mix-blend-overlay"></div>

      {/* Background Layer (Parallax) */}
      <div 
        className={`absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center transition-all duration-700 ease-out z-10 ${isTransitioning ? 'opacity-0 scale-110 blur-md' : 'opacity-100 scale-100 blur-0'}`}
        style={{
          backgroundImage: `url(${currentRoom.bgImage})`,
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`
        }}
      ></div>

      {/* Interactive Layer (Foreground Parallax) */}
      <div 
        className={`absolute inset-0 z-20 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 0)` }}
      >
        {/* Navigation Connections */}
        {currentRoom.connections.map((conn, idx) => (
          <button
            key={idx}
            onClick={() => handleNavigate(conn.roomId)}
            className="absolute group flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-300"
            style={{ left: `${conn.x}%`, top: `${conn.y}%` }}
            onMouseEnter={() => playSound('hover')}
          >
            <div className="w-12 h-12 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 group-hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-pulse">
              <ChevronRight size={24} className="text-white ml-0.5" />
            </div>
            <span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded backdrop-blur border border-white/10 uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors">
              {conn.label}
            </span>
          </button>
        ))}

        {/* Room Items */}
        {currentRoom.items.map((item) => (
          <button
            key={item.id}
            onClick={() => { setSelectedItem(item); playSound('click'); }}
            className="absolute group transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onMouseEnter={() => playSound('hover')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
              <div className="w-8 h-8 rounded-full bg-indigo-600/80 border border-indigo-400/50 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover:scale-125 transition-transform duration-300">
                <item.icon size={14} />
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-bold text-white whitespace-nowrap text-shadow">{item.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* UI HUD Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-6 md:p-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex items-center gap-4">
             <div className="glass-panel px-6 py-3 rounded-full flex flex-col items-start border border-white/10 bg-black/40 backdrop-blur-xl">
                <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-0.5">Current Location</span>
                <span className="text-lg font-black text-white flex items-center gap-2">
                   <MapPin size={16} className="text-indigo-500"/> {currentRoom.name}
                </span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition backdrop-blur-md border border-white/10 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end pointer-events-auto">
           <div className="glass-panel p-4 rounded-2xl max-w-md border border-white/10 bg-black/60 backdrop-blur-xl hidden md:block">
              <p className="text-white/80 text-xs font-medium leading-relaxed">
                 {currentRoom.description}
              </p>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-full transition backdrop-blur-md border border-white/10 ${soundEnabled ? 'bg-white text-black' : 'bg-black/40 text-white/60 hover:text-white'}`}
              >
                 {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
              </button>
           </div>
        </div>
      </div>

      {/* Item Detail Overlay */}
      {selectedItem && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4" onClick={() => setSelectedItem(null)}>
           <div 
             className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300" 
             onClick={e => e.stopPropagation()}
           >
              {selectedItem.image && (
                 <div className="h-48 w-full relative">
                    <img src={selectedItem.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                 </div>
              )}
              <div className="p-8 relative">
                 <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"><X size={16}/></button>
                 
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                       <selectedItem.icon size={24} />
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/10 block w-fit mb-1">{selectedItem.type}</span>
                       <h3 className="text-2xl font-black text-white">{selectedItem.label}</h3>
                    </div>
                 </div>
                 
                 <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {selectedItem.description}
                 </p>

                 <div className="flex gap-3">
                    <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition">Close</button>
                    {selectedItem.type === 'PROJECT' && (
                       <button className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition">View Project</button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default VirtualStudioTour;
