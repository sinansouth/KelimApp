
import React from 'react';
import { X, Home, User, Swords, ShoppingBag, Bell, Settings, CircleHelp, ExternalLink, ShieldCheck } from 'lucide-react';
import { getUserProfile } from '../services/userService';

interface MenuModalProps {
  onClose: () => void;
  onNavigate: (target: 'home' | 'profile' | 'settings' | 'announcements' | 'market' | 'info' | 'challenge' | 'admin') => void;
  hasUnreadAnnouncements?: boolean;
}

const MenuModal: React.FC<MenuModalProps> = ({ onClose, onNavigate, hasUnreadAnnouncements }) => {
  const profile = getUserProfile();

  const menuItems = [
    { id: 'home', label: 'Ana Sayfa', icon: <Home size={24} /> },
    { id: 'profile', label: 'Profil', icon: <User size={24} /> },
    { id: 'challenge', label: 'Meydan Oku', icon: <Swords size={24} /> },
    { id: 'market', label: 'Market', icon: <ShoppingBag size={24} /> },
    { id: 'announcements', label: 'Duyurular', icon: <Bell size={24} />, badge: hasUnreadAnnouncements },
    { id: 'info', label: 'Rehber', icon: <CircleHelp size={24} /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={24} /> },
  ];

  if (profile.isAdmin) {
      menuItems.push({ id: 'admin', label: 'Yönetici', icon: <ShieldCheck size={24} /> });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div 
        className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
        style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
      >
        
        <div className="flex items-center justify-between p-5 border-b shrink-0" style={{borderColor: 'var(--color-border)'}}>
            <h2 className="text-xl font-black" style={{color: 'var(--color-text-main)'}}>Menü</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                <X size={24} />
            </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:border-opacity-50 relative overflow-hidden group`}
                    style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-main)'}}
                >
                    <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        style={{
                            backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
                            color: 'var(--color-primary)'
                        }}
                    >
                        {item.icon}
                    </div>
                    <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>{item.label}</span>
                    
                    {item.badge && (
                        <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                    )}
                </button>
            ))}
            
            {/* External Links */}
            <a 
                href="https://kelimapp.vercel.app" 
                target="_blank" 
                rel="noreferrer"
                className="col-span-2 p-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-opacity mt-2"
                style={{borderColor: 'var(--color-border)', color: 'var(--color-text-muted)'}}
            >
                <ExternalLink size={14} /> Websitemizi Ziyaret Et
            </a>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
