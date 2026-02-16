
import React from 'react';
import { SocialLink } from '../types';
import { Instagram, Send, Globe, Mail, Youtube, ExternalLink, Copy, Check, Link } from 'lucide-react';

interface SocialLinksPanelProps {
  links: SocialLink[];
}

const SocialLinksPanel: React.FC<SocialLinksPanelProps> = ({ links }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={20} />;
      case 'telegram': return <Send size={20} />;
      case 'youtube': return <Youtube size={20} />;
      case 'email': return <Mail size={20} />;
      case 'website': return <Globe size={20} />;
      default: return <Link size={20} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-600 to-purple-600';
      case 'telegram': return 'from-blue-400 to-blue-600';
      case 'youtube': return 'from-red-600 to-red-700';
      case 'email': return 'from-emerald-500 to-teal-600';
      default: return 'from-indigo-600 to-violet-600';
    }
  };

  const handleCopy = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (links.length === 0) return null;

  return (
    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-black/40 relative overflow-hidden">
       {/* Decorative Background Blur */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
       
       <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
             <Link className="text-white" size={20} />
          </div>
          <div>
             <h3 className="text-xl font-black text-white tracking-tight">Connect With Us</h3>
             <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Official Channels</p>
          </div>
       </div>

       <div className="space-y-3 relative z-10">
          {links.map((link) => (
             <a 
               key={link.id} 
               href={link.url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden"
             >
                {/* Hover Light Sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                <div className="flex items-center gap-4 relative z-10">
                   <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPlatformColor(link.platform)} flex items-center justify-center text-white shadow-lg`}>
                      {getPlatformIcon(link.platform)}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">{link.platform}</p>
                      <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{link.label}</p>
                   </div>
                </div>

                <div className="flex items-center gap-2 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                   <button 
                     onClick={(e) => handleCopy(e, link.id, link.url)}
                     className="p-2 rounded-lg bg-black/40 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                     title="Copy Link"
                   >
                      {copiedId === link.id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} />}
                   </button>
                   <div className="p-2 rounded-lg bg-black/40 text-white/70">
                      <ExternalLink size={14} />
                   </div>
                </div>
             </a>
          ))}
       </div>
    </div>
  );
};

export default SocialLinksPanel;
