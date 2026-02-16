
import React, { useState, useRef } from 'react';
import { User, PortfolioItem } from '../types';
import { X, Heart, Plus, Trash2, Image as ImageIcon, Tag, Upload, Maximize2, Film } from 'lucide-react';

interface CinematicPortfolioProps {
  userId: string;
  currentUser: User | null;
  author: User;
  items: PortfolioItem[];
  onClose: () => void;
  onLike: (itemId: string) => void;
  onAddItem: (item: Omit<PortfolioItem, 'id' | 'likes' | 'timestamp'>) => void;
  onDeleteItem: (itemId: string) => void;
}

const CinematicPortfolio: React.FC<CinematicPortfolioProps> = ({ 
  userId, currentUser, author, items, onClose, onLike, onAddItem, onDeleteItem 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', mediaUrl: '', mediaType: 'image' as 'image' | 'video', tags: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = currentUser?.id === userId;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewItem(prev => ({
          ...prev,
          mediaUrl: reader.result as string,
          mediaType: file.type.startsWith('video') ? 'video' : 'image'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!newItem.mediaUrl || !newItem.title) return;
    onAddItem({
      userId: currentUser!.id,
      title: newItem.title,
      description: newItem.description,
      mediaUrl: newItem.mediaUrl,
      mediaType: newItem.mediaType,
      tags: newItem.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setShowAddModal(false);
    setNewItem({ title: '', description: '', mediaUrl: '', mediaType: 'image', tags: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between z-20 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4">
           <img src={author.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
           <div>
              <h2 className="text-2xl font-black text-white tracking-tighter">{author.fullName}</h2>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Creative Portfolio</p>
           </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"><X size={24}/></button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {isOwner && (
               <button 
                 onClick={() => setShowAddModal(true)}
                 className="aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-white/30 hover:bg-white/5 transition group"
               >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:scale-110 transition">
                     <Plus size={32} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white">Add Project</span>
               </button>
            )}
            
            {items.map(item => (
               <div key={item.id} className="group relative break-inside-avoid mb-6 rounded-3xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]">
                  <div className="aspect-[4/5] relative bg-black">
                     {item.mediaType === 'image' ? (
                        <img src={item.mediaUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700" />
                     ) : (
                        <video src={item.mediaUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700" controls />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => setSelectedImage(item.mediaUrl)} className="p-2 bg-black/50 backdrop-blur rounded-lg text-white hover:bg-white hover:text-black transition"><Maximize2 size={16}/></button>
                     </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition duration-300">
                     <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                     <p className="text-xs text-white/60 line-clamp-2 mb-3">{item.description}</p>
                     
                     <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                           {item.tags.map(tag => (
                              <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded text-white/80">{tag}</span>
                           ))}
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => onLike(item.id)} className="flex items-center gap-1 text-white/60 hover:text-rose-500 transition">
                              <Heart size={16} fill={item.likes.includes(currentUser?.id || '') ? "currentColor" : "none"} className={item.likes.includes(currentUser?.id || '') ? "text-rose-500" : ""} />
                              <span className="text-xs font-bold">{item.likes.length}</span>
                           </button>
                           {isOwner && (
                              <button onClick={() => onDeleteItem(item.id)} className="text-white/40 hover:text-rose-500 transition"><Trash2 size={16}/></button>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl">
               <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white"><X size={24}/></button>
               <h3 className="text-2xl font-black text-white mb-6">New Piece</h3>
               
               <div className="space-y-4">
                  <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full h-48 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition relative overflow-hidden group"
                  >
                     {newItem.mediaUrl ? (
                        newItem.mediaType === 'image' ? <img src={newItem.mediaUrl} className="w-full h-full object-cover" /> : <video src={newItem.mediaUrl} className="w-full h-full object-cover" />
                     ) : (
                        <>
                           <Upload size={32} className="text-white/30 group-hover:text-white mb-2 transition" />
                           <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Upload Media</span>
                        </>
                     )}
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  </div>

                  <input type="text" placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500 transition" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium h-24 resize-none outline-none focus:border-indigo-500 transition" value={newItem.description} onChange={