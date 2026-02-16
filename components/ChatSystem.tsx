
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Send, Hash, Search, Smile, Phone, Video, Info, Plus } from 'lucide-react';

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image';
}

interface Channel {
  id: string;
  name: string;
  description: string;
}

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', description: 'General club discussions' },
  { id: 'announcements', name: 'announcements', description: 'Important updates' },
  { id: 'production', name: 'production', description: 'Filming and gear talk' },
  { id: 'editing', name: 'editing', description: 'Post-production workflow' },
  { id: 'ideas', name: 'ideas', description: 'Brainstorming session' }
];

const ChatSystem: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from storage
  useEffect(() => {
    const saved = localStorage.getItem('mediaClubChatMessages');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // Listen for storage updates (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mediaClubChatMessages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      channelId: activeChannel.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatar,
      content: inputText,
      timestamp: Date.now(),
      type: 'text'
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('mediaClubChatMessages', JSON.stringify(updatedMessages));
    setInputText('');
  };

  const channelMessages = messages.filter(m => m.channelId === activeChannel.id);

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-2xl animate-in fade-in duration-500">
      
      {/* Sidebar */}
      <div className={`w-80 bg-slate-50 dark:bg-black/40 border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-20 h-full'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
           <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">MESSAGES</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search channels..." 
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-indigo-500 transition"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
           <p className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Channels</p>
           {CHANNELS.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeChannel.id === channel.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/5'}`}
              >
                 <Hash size={16} className={activeChannel.id === channel.id ? 'text-indigo-300' : 'text-slate-400 dark:text-white/30'} />
                 <span className="text-xs font-bold truncate">#{channel.name}</span>
              </button>
           ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
           <div className="flex items-center gap-3">
              <div className="relative">
                 <img src={currentUser.avatar} className="w-10 h-10 rounded-xl object-cover" />
                 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-100 dark:border-black rounded-full"></div>
              </div>
              <div>
                 <p className="text-xs font-black text-slate-900 dark:text-white">{currentUser.fullName}</p>
                 <p className="text-[10px] text-slate-500 dark:text-white/40">Online</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] relative">
         {/* Chat Header */}
         <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-white/80 dark:bg-black/60 backdrop-blur-xl z-10">
            <div className="flex items-center gap-2">
               <Hash size={20} className="text-slate-400" />
               <span className="font-black text-slate-900 dark:text-white text-sm tracking-wide">{activeChannel.name}</span>
               <span className="hidden md:block text-slate-400 dark:text-white/30 text-xs ml-2 border-l border-slate-300 dark:border-white/10 pl-2">{activeChannel.description}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
               <Phone size={18} className="hover:text-indigo-500 cursor-pointer transition" />
               <Video size={18} className="hover:text-indigo-500 cursor-pointer transition" />
               <Info size={18} className="hover:text-indigo-500 cursor-pointer transition" />
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
            {channelMessages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <Hash size={64} className="mb-4 text-slate-300 dark:text-white/20" />
                  <p className="text-sm font-bold text-slate-400 dark:text-white/40">Welcome to #{activeChannel.name}</p>
                  <p className="text-xs text-slate-400 dark:text-white/30 mt-1">This is the start of the conversation.</p>
               </div>
            ) : (
               channelMessages.map((msg, idx) => {
                  const isSameUser = idx > 0 && channelMessages[idx - 1].senderId === msg.senderId;
                  const isMe = msg.senderId === currentUser.id;
                  
                  return (
                     <div key={msg.id} className={`flex gap-4 group ${isSameUser ? 'mt-1' : 'mt-6'} ${isMe ? 'flex-row-reverse' : ''}`}>
                        {!isSameUser ? (
                           <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                        ) : (
                           <div className="w-10" /> 
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                           {!isSameUser && (
                              <div className="flex items-baseline gap-2 mb-1">
                                 <span className="text-xs font-black text-slate-900 dark:text-white">{msg.senderName}</span>
                                 <span className="text-[10px] text-slate-400 dark:text-white/30">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                              </div>
                           )}
                           <div className={`
                              px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm relative group-hover:shadow-md transition
                              ${isMe 
                                 ? 'bg-indigo-600 text-white rounded-tr-none' 
                                 : 'bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 rounded-tl-none'}
                           `}>
                              {msg.content}
                           </div>
                        </div>
                     </div>
                  );
               })
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-4 bg-white dark:bg-black/60 border-t border-slate-200 dark:border-white/10">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
               <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 transition rounded-xl hover:bg-slate-200 dark:hover:bg-white/10">
                  <Plus size={20} />
               </button>
               <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message #${activeChannel.name}...`}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm font-medium px-2 placeholder-slate-400 dark:placeholder-white/20"
               />
               <div className="flex items-center gap-1 pr-1">
                  <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 transition rounded-xl hover:bg-slate-200 dark:hover:bg-white/10">
                     <Smile size={20} />
                  </button>
                  <button 
                     type="submit" 
                     disabled={!inputText.trim()}
                     className={`p-2 rounded-xl transition-all ${inputText.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}
                  >
                     <Send size={18} className={inputText.trim() ? 'translate-x-0.5' : ''} />
                  </button>
               </div>
            </form>
         </div>

      </div>
    </div>
  );
};

export default ChatSystem;
