
import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { Bell, Heart, MessageCircle, Shield, Award, Megaphone, Gift, Activity, X, Check, Filter, Trash2, Clock } from 'lucide-react';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick: (id: string) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ notification, onDismiss, onClick }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Auto dismiss logic
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300); // Wait for animation
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'ADMIN': return { icon: <Shield size={18} />, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
      case 'LIKE': return { icon: <Heart size={18} fill="currentColor" />, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50' };
      case 'COMMENT': return { icon: <MessageCircle size={18} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50' };
      case 'BADGE': return { icon: <Award size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/50' };
      case 'ANNOUNCEMENT': return { icon: <Megaphone size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' };
      default: return { icon: <Activity size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' };
    }
  };

  const style = getStyle(notification.type);

  return (
    <div 
      className={`
        w-full max-w-sm rounded-2xl p-4 mb-2 cursor-pointer relative overflow-hidden group
        backdrop-blur-xl bg-[#0a0a0a]/90 border border-white/10 shadow-2xl
        transition-all duration-300 transform translate-z-0
        ${isExiting ? 'notif-exit' : 'notif-enter'}
        hover:bg-[#1a1a1a]
      `}
      onClick={() => { onClick(notification.id); handleClose(); }}
    >
      {/* Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('/10', '')}`}></div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full">
        <div 
            className="h-full bg-white/50 notif-progress" 
            style={{ animationDuration: '5000ms' }}
        ></div>
      </div>

      <div className="flex items-start gap-4 pl-3">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.color} border ${style.border} shadow-lg`}>
           {style.icon}
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
           <div className="flex justify-between items-start mb-0.5">
              <h4 className="text-sm font-black text-white truncate">{notification.senderName}</h4>
              <span className="text-[9px] font-mono text-white/40">{new Date(notification.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
           </div>
           <p className="text-xs text-white/70 font-medium leading-relaxed line-clamp-2">{notification.content}</p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="text-white/20 hover:text-white transition p-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkRead, onClearAll, isOpen, onClose, onNavigate }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ADMIN'>('ALL');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'ADMIN') return n.type === 'ADMIN' || n.type === 'ANNOUNCEMENT';
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose}></div>
      <div className="absolute top-full right-0 mt-4 w-96 max-w-[90vw] z-[70] origin-top-right animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]">
          
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                   <Bell size={16} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-white">Notifications</h3>
                   <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Real-time Feed</p>
                </div>
             </div>
             <button onClick={onClearAll} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                <Trash2 size={12}/> Clear
             </button>
          </div>

          {/* Filters */}
          <div className="flex p-2 gap-1 bg-black/20">
             {(['ALL', 'UNREAD', 'ADMIN'] as const).map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
               >
                 {f}
               </button>
             ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
             {filteredNotifications.length === 0 ? (
               <div className="py-20 text-center flex flex-col items-center opacity-30">
                  <Bell size={48} className="mb-4"/>
                  <p className="text-xs font-bold uppercase tracking-widest">All Caught Up</p>
               </div>
             ) : (
               filteredNotifications.map(notif => (
                 <div 
                   key={notif.id}
                   onClick={() => { onMarkRead(notif.id); if(notif.relatedId) onNavigate('FEED'); }}
                   className={`p-4 rounded-2xl flex gap-4 cursor-pointer transition-all border border-transparent hover:border-white/10 ${notif.read ? 'opacity-50 hover:opacity-100 bg-transparent' : 'bg-white/5'}`}
                 >
                    <div className="relative">
                       <img src={notif.senderAvatar} className="w-10 h-10 rounded-xl object-cover bg-black" />
                       {!notif.read && <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 border-2 border-[#0f0f0f] rounded-full animate-pulse"></div>}
                    </div>
                    <div className="flex-1">
                       <p className="text-xs text-white leading-relaxed">
                          <span className="font-bold hover:text-indigo-400 transition">{notif.senderName}</span> <span className="opacity-80">{notif.content}</span>
                       </p>
                       <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-white/30 uppercase tracking-wider">
                          <Clock size={10} />
                          <span>{new Date(notif.timestamp).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/5 bg-black/40 text-center">
             <button className="text-[10px] font-bold text-white/40 hover:text-white transition uppercase tracking-widest">View Full History</button>
          </div>

        </div>
      </div>
    </>
  );
};
