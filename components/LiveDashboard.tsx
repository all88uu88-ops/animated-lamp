
import React, { useState } from 'react';
import { LiveSession, User } from '../types';
import { Radio, Calendar, Plus, Users, Clock, Play, Lock, MoreHorizontal, Video, AlertCircle } from 'lucide-react';

interface LiveDashboardProps {
  sessions: LiveSession[];
  currentUser: User;
  onJoinSession: (sessionId: string) => void;
  onCreateSession: (title: string, description: string, scheduledFor?: number) => void;
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({ sessions, currentUser, onJoinSession, onCreateSession }) => {
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', description: '', type: 'NOW' as 'NOW' | 'LATER', scheduledTime: '' });

  const activeSessions = sessions.filter(s => s.status === 'LIVE');
  const scheduledSessions = sessions.filter(s => s.status === 'SCHEDULED');
  const endedSessions = sessions.filter(s => s.status === 'ENDED');

  const handleCreate = () => {
    if (!newSession.title) return;
    const schedule = newSession.type === 'LATER' && newSession.scheduledTime ? new Date(newSession.scheduledTime).getTime() : undefined;
    onCreateSession(newSession.title, newSession.description, schedule);
    setShowModal(false);
    setNewSession({ title: '', description: '', type: 'NOW', scheduledTime: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                 <Radio size={24} className="text-white animate-pulse" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">STUDIO LIVE</h2>
           </div>
           <p className="text-slate-500 dark:text-white/50 text-sm font-medium border-l-2 border-red-500 pl-4">
              Real-time broadcasting and collaborative sessions.
           </p>
        </div>
        
        {currentUser.role === 'ADMIN' && (
           <button 
             onClick={() => setShowModal(true)}
             className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition shadow-xl flex items-center gap-3"
           >
              <Plus size={18} /> New Session
           </button>
        )}
      </div>

      {/* Live Now Section */}
      {activeSessions.length > 0 && (
         <div className="space-y-4">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> On Air Now
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {activeSessions.map(session => (
                  <div key={session.id} className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl group">
                     {/* Animated Background */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] group-hover:bg-red-600/30 transition duration-700"></div>
                     
                     <div className="relative z-10 p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                           <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-lg">LIVE</span>
                           <div className="flex items-center gap-2 text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                              <Users size={14} />
                              <span className="text-xs font-mono font-bold">{session.participants.length}</span>
                           </div>
                        </div>
                        
                        <div className="mt-auto">
                           <h4 className="text-2xl font-black text-white mb-2">{session.title}</h4>
                           <p className="text-white/60 text-sm mb-6 line-clamp-2">{session.description}</p>
                           
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <img src={session.hostAvatar} className="w-10 h-10 rounded-full border-2 border-white/20" />
                                 <div>
                                    <p className="text-white text-xs font-bold">{session.hostName}</p>
                                    <p className="text-white/40 text-[9px] uppercase tracking-wider">Host</p>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => onJoinSession(session.id)}
                                 className="px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition shadow-lg flex items-center gap-2"
                              >
                                 Join Room <Play size={14} fill="currentColor" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Scheduled & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
               <Calendar size={16} /> Scheduled
            </h3>
            {scheduledSessions.length === 0 ? (
               <div className="p-12 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center opacity-50">
                  <Clock size={48} className="mb-4 text-slate-400 dark:text-white/40" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No upcoming broadcasts.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {scheduledSessions.map(session => (
                     <div key={session.id} className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex items-center justify-between group hover:border-indigo-500/30 transition">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-white/5 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 font-black border border-indigo-100 dark:border-white/10">
                              <span className="text-lg">{new Date(session.scheduledFor!).getDate()}</span>
                              <span className="text-[9px] uppercase tracking-wider opacity-70">{new Date(session.scheduledFor!).toLocaleString('default', { month: 'short' })}</span>
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition">{session.title}</h4>
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/50">
                                 <span className="flex items-center gap-1"><Clock size={12}/> {new Date(session.scheduledFor!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 <span className="flex items-center gap-1"><Video size={12}/> By {session.hostName}</span>
                              </div>
                           </div>
                        </div>
                        {currentUser.role === 'ADMIN' && (
                           <button 
                              onClick={() => onJoinSession(session.id)} // Admin can start it early
                              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition"
                           >
                              Start
                           </button>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>

         <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 opacity-50">
               <Clock size={16} /> Past Sessions
            </h3>
            <div className="space-y-3">
               {endedSessions.slice(0, 5).map(session => (
                  <div key={session.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex justify-between items-center opacity-70 hover:opacity-100 transition">
                     <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{session.title}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-white/40">{new Date(session.endedAt!).toLocaleDateString()}</p>
                     </div>
                     <span className="px-2 py-1 bg-slate-200 dark:bg-white/10 rounded text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-white/50">Ended</span>
                  </div>
               ))}
               {endedSessions.length === 0 && <p className="text-xs text-slate-400 italic">No history available.</p>}
            </div>
         </div>
      </div>

      {/* Create Modal */}
      {showModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
            <div className="glass-panel w-full max-w-lg p-8 rounded-[2rem] bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 relative z-10 shadow-2xl animate-in zoom-in-95">
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Setup Broadcast</h3>
               <div className="space-y-4">
                  <input 
                     type="text" 
                     placeholder="Session Title" 
                     className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500"
                     value={newSession.title}
                     onChange={e => setNewSession({...newSession, title: e.target.value})}
                  />
                  <textarea 
                     placeholder="Description (Optional)" 
                     className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white font-medium outline-none focus:border-indigo-500 h-24 resize-none"
                     value={newSession.description}
                     onChange={e => setNewSession({...newSession, description: e.target.value})}
                  />
                  <div className="flex gap-4 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                     <button 
                        onClick={() => setNewSession({...newSession, type: 'NOW'})}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition ${newSession.type === 'NOW' ? 'bg-white dark:bg-white/10 shadow text-slate-900 dark:text-white' : 'text-slate-400'}`}
                     >
                        Go Live Now
                     </button>
                     <button 
                        onClick={() => setNewSession({...newSession, type: 'LATER'})}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition ${newSession.type === 'LATER' ? 'bg-white dark:bg-white/10 shadow text-slate-900 dark:text-white' : 'text-slate-400'}`}
                     >
                        Schedule
                     </button>
                  </div>
                  {newSession.type === 'LATER' && (
                     <input 
                        type="datetime-local" 
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white font-bold outline-none"
                        value={newSession.scheduledTime}
                        onChange={e => setNewSession({...newSession, scheduledTime: e.target.value})}
                     />
                  )}
                  <button 
                     onClick={handleCreate}
                     className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-500 transition shadow-lg mt-4"
                  >
                     {newSession.type === 'NOW' ? 'Start Broadcast' : 'Schedule Event'}
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default LiveDashboard;
