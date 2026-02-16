
import React, { useRef, useState, useEffect } from 'react';
import { User, CanvasStroke, CanvasNote } from '../types';
import { PenTool, Highlighter, Eraser, StickyNote, RotateCcw, Save, Trash2, MousePointer2, Move, Download, Palette } from 'lucide-react';

interface CollaborativeCanvasProps {
  currentUser: User;
}

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const HIGHLIGHT_COLORS = ['rgba(255, 255, 0, 0.4)', 'rgba(0, 255, 0, 0.4)', 'rgba(0, 255, 255, 0.4)', 'rgba(255, 0, 255, 0.4)'];

const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({ currentUser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'note' | 'move'>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [notes, setNotes] = useState<CanvasNote[]>([]);
  const [currentStroke, setCurrentStroke] = useState<CanvasStroke | null>(null);

  // Load initial state
  useEffect(() => {
    const savedData = localStorage.getItem('mediaClubCanvas');
    if (savedData) {
      const { strokes: savedStrokes, notes: savedNotes } = JSON.parse(savedData);
      setStrokes(savedStrokes || []);
      setNotes(savedNotes || []);
    }
  }, []);

  // Listen for changes from other tabs (Simulate Real-time)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mediaClubCanvas' && e.newValue) {
        const { strokes: newStrokes, notes: newNotes } = JSON.parse(e.newValue);
        setStrokes(newStrokes || []);
        setNotes(newNotes || []);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync to local storage
  const syncToStorage = (newStrokes: CanvasStroke[], newNotes: CanvasNote[]) => {
    localStorage.setItem('mediaClubCanvas', JSON.stringify({ strokes: newStrokes, notes: newNotes }));
  };

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Only resize if dimensions mismatch to prevent clearing constantly
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
       canvas.width = rect.width * dpr;
       canvas.height = rect.height * dpr;
       ctx.scale(dpr, dpr);
    }
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    [...strokes, currentStroke].forEach(stroke => {
      if (!stroke || stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = stroke.tool === 'highlighter' ? stroke.color : (stroke.tool === 'eraser' ? '#ffffff' : stroke.color);
      ctx.lineWidth = stroke.size;
      
      // Simplify Eraser logic for this demo: paint white (canvas background)
      if (stroke.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
      } else if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.lineWidth = 15;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

  }, [strokes, currentStroke]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'note' || tool === 'move') return;
    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStroke({
      id: Math.random().toString(36),
      points: [point],
      color: tool === 'highlighter' ? (color === '#000000' ? HIGHLIGHT_COLORS[0] : color) : color,
      size: brushSize,
      tool: tool
    });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    const point = getPoint(e);
    setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, point] } : null);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);
    syncToStorage(newStrokes, notes);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'note') {
      const point = getPoint(e);
      const newNote: CanvasNote = {
        id: Math.random().toString(36),
        x: point.x,
        y: point.y,
        text: '',
        color: ['#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5'][Math.floor(Math.random() * 4)],
        authorName: currentUser.fullName
      };
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      syncToStorage(strokes, newNotes);
      setTool('move'); // Switch back to move/select after placing note
    }
  };

  const updateNote = (id: string, text: string) => {
    const newNotes = notes.map(n => n.id === id ? { ...n, text } : n);
    setNotes(newNotes);
    syncToStorage(strokes, newNotes);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    syncToStorage(strokes, newNotes);
  };

  const clearCanvas = () => {
    if (window.confirm('هل أنت متأكد من مسح السبورة بالكامل؟')) {
      setStrokes([]);
      setNotes([]);
      syncToStorage([], []);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'media-club-canvas.png';
        link.href = canvas.toDataURL();
        link.click();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative animate-in fade-in duration-500">
      
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#0f0f0f] p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 z-20 overflow-x-auto max-w-[90vw]">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setTool('move')} className={`p-2 rounded-lg transition-all ${tool === 'move' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-500' : 'text-slate-400 hover:text-indigo-400'}`} title="تحريك"><MousePointer2 size={20} /></button>
          <button onClick={() => setTool('pen')} className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-500' : 'text-slate-400 hover:text-indigo-400'}`} title="قلم"><PenTool size={20} /></button>
          <button onClick={() => setTool('highlighter')} className={`p-2 rounded-lg transition-all ${tool === 'highlighter' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-500' : 'text-slate-400 hover:text-indigo-400'}`} title="تظليل"><Highlighter size={20} /></button>
          <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white dark:bg-slate-700 shadow-md text-rose-500' : 'text-slate-400 hover:text-rose-400'}`} title="ممحاة"><Eraser size={20} /></button>
          <button onClick={() => setTool('note')} className={`p-2 rounded-lg transition-all ${tool === 'note' ? 'bg-white dark:bg-slate-700 shadow-md text-amber-500' : 'text-slate-400 hover:text-amber-400'}`} title="ملاحظة"><StickyNote size={20} /></button>
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {tool !== 'eraser' && tool !== 'move' && tool !== 'note' && (
           <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(tool === 'highlighter' ? HIGHLIGHT_COLORS : COLORS).map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)} 
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
           </div>
        )}

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button onClick={clearCanvas} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors btn-bounce" title="مسح الكل"><RotateCcw size={20} /></button>
        <button onClick={downloadCanvas} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors btn-bounce" title="حفظ كصورة"><Download size={20} /></button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 bg-white relative rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 cursor-crosshair touch-none"
        style={{ cursor: tool === 'move' ? 'default' : tool === 'note' ? 'copy' : 'crosshair' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onClick={handleCanvasClick}
          className="w-full h-full relative z-10"
        />

        {/* Render Notes */}
        {notes.map(note => (
          <div
            key={note.id}
            className="absolute p-4 w-48 min-h-[160px] shadow-xl rounded-bl-3xl rounded-tr-xl flex flex-col z-20 animate-in zoom-in duration-300 transform transition-transform hover:scale-105"
            style={{ 
              top: note.y, 
              left: note.x, 
              backgroundColor: note.color,
              transform: 'rotate(-2deg)'
            }}
          >
            <div className="flex justify-between items-start mb-2 opacity-60 hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-black text-slate-700">{note.authorName}</span>
               <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-slate-500 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
            <textarea
              value={note.text}
              onChange={(e) => updateNote(note.id, e.target.value)}
              placeholder="اكتب ملاحظة..."
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-slate-800 font-bold text-sm leading-relaxed"
              autoFocus={!note.text}
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 rounded-tl-2xl pointer-events-none"></div>
          </div>
        ))}

        {/* Helper Hint */}
        {strokes.length === 0 && notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
             <div className="text-center opacity-30">
                <Palette size={64} className="mx-auto mb-4 text-indigo-300" />
                <h3 className="text-2xl font-black text-indigo-900">مساحة الإبداع الحر</h3>
                <p className="font-bold text-indigo-800">ارسم، اكتب، وشارك أفكارك مع الفريق مباشرة</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeCanvas;
