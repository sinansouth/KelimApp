

import React, { useState } from 'react';
import { X, Lock, Image, Smile, Palette } from 'lucide-react';
import { saveUserProfile, getUserProfile, equipFrame, equipBackground } from '../services/userService';
import { UserStats } from '../types';
import { getAvatars, getFrames, getBackgrounds } from '../services/contentService';

interface AvatarModalProps {
  onClose: () => void;
  userStats: UserStats;
  onUpdate: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({ onClose, userStats, onUpdate }) => {
  const currentProfile = getUserProfile();
  const [activeTab, setActiveTab] = useState<'avatars' | 'frames' | 'backgrounds'>('avatars');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const AVATARS = getAvatars();
  const FRAMES = getFrames();
  const BACKGROUNDS = getBackgrounds();

  // Sort avatars by unlock level (Ascending: 1 -> 100)
  const sortedAvatars = [...AVATARS].sort((a, b) => a.unlockLevel - b.unlockLevel);

  const handleAvatarSelect = (icon: string) => {
      const newProfile = { ...currentProfile, avatar: icon };
      saveUserProfile(newProfile);
      onUpdate();
  };

  const handleFrameSelect = (frameId: string) => {
      equipFrame(frameId);
      onUpdate();
  };

  const handleBackgroundSelect = (bgId: string) => {
      equipBackground(bgId);
      onUpdate();
  };

  const handleImageError = (id: string) => {
      setImageErrors(prev => ({...prev, [id]: true}));
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
         className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 h-[80vh]"
         style={{
             backgroundColor: 'var(--color-bg-card)', 
             borderColor: 'var(--color-border)'
         }}
      >
        
        <div className="flex items-center justify-between p-5 border-b shrink-0" style={{borderColor: 'var(--color-border)'}}>
            <h2 className="text-xl font-black" style={{color: 'var(--color-text-main)'}}>Profil Görünümü</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                <X size={24} />
            </button>
        </div>

        <div className="flex border-b px-4 gap-4 shrink-0 overflow-x-auto no-scrollbar" style={{borderColor: 'var(--color-border)'}}>
            <button 
                onClick={() => setActiveTab('avatars')}
                className="py-4 px-2 font-bold text-sm relative transition-colors flex items-center gap-2 whitespace-nowrap"
                style={{color: activeTab === 'avatars' ? 'var(--color-primary)' : 'var(--color-text-muted)'}}
            >
                <Smile size={18} /> Avatar
                {activeTab === 'avatars' && <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full" style={{backgroundColor: 'var(--color-primary)'}}></div>}
            </button>
            <button 
                onClick={() => setActiveTab('frames')}
                className="py-4 px-2 font-bold text-sm relative transition-colors flex items-center gap-2 whitespace-nowrap"
                style={{color: activeTab === 'frames' ? '#a855f7' : 'var(--color-text-muted)'}}
            >
                <Image size={18} /> Çerçeve
                {activeTab === 'frames' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-full"></div>}
            </button>
             <button 
                onClick={() => setActiveTab('backgrounds')}
                className="py-4 px-2 font-bold text-sm relative transition-colors flex items-center gap-2 whitespace-nowrap"
                style={{color: activeTab === 'backgrounds' ? '#eab308' : 'var(--color-text-muted)'}}
            >
                <Palette size={18} /> Arka Plan
                {activeTab === 'backgrounds' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full"></div>}
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1" style={{backgroundColor: 'var(--color-bg-main)'}}>
            {activeTab === 'avatars' ? (
                <div className="grid grid-cols-3 gap-4">
                    {sortedAvatars.map((avatar) => {
                        const isLocked = userStats.level < avatar.unlockLevel;
                        const isSelected = currentProfile.avatar === avatar.icon;
                        const hasError = imageErrors[avatar.id];

                        return (
                            <button 
                                key={avatar.id}
                                disabled={isLocked}
                                onClick={() => handleAvatarSelect(avatar.icon)}
                                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all group
                                    ${isSelected 
                                        ? 'ring-2' 
                                        : isLocked 
                                            ? 'opacity-60' 
                                            : 'hover:border-opacity-100'
                                    }
                                `}
                                style={{
                                    backgroundColor: isSelected ? 'rgba(var(--color-primary-rgb), 0.1)' : 'var(--color-bg-card)',
                                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                    '--tw-ring-color': isSelected ? 'var(--color-primary)' : 'transparent'
                                } as React.CSSProperties}
                            >
                                {/* Avatar Icon Container - CENTERED */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl shadow-sm overflow-hidden ${avatar.image && !hasError ? 'bg-transparent' : `bg-gradient-to-br ${avatar.bgGradient}`}`}>
                                    {/* If image exists and no error, show image. Otherwise show icon. */}
                                    {avatar.image && !hasError ? (
                                        <img 
                                            src={avatar.image} 
                                            alt={avatar.name} 
                                            className="w-full h-full object-cover scale-[1.01]" 
                                            onError={() => handleImageError(avatar.id)}
                                        />
                                    ) : (
                                        <span className="flex items-center justify-center w-full h-full leading-none">{avatar.icon}</span>
                                    )}
                                </div>
                                
                                {isLocked ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <Lock size={14} style={{color: 'var(--color-text-muted)'}} />
                                        <span className="text-[10px] font-bold" style={{color: 'var(--color-text-muted)'}}>Lvl {avatar.unlockLevel}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-center leading-tight px-1" style={{color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)'}}>
                                        {avatar.name}
                                    </span>
                                )}

                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full ring-2 ring-white" style={{backgroundColor: 'var(--color-primary)'}}></div>
                                )}
                            </button>
                        )
                    })}
                </div>
            ) : activeTab === 'frames' ? (
                <div className="grid grid-cols-2 gap-4">
                    {FRAMES.map((frame) => {
                        const isOwned = currentProfile.purchasedFrames.includes(frame.id) || frame.id === 'frame_none';
                        const isSelected = currentProfile.frame === frame.id;

                        if (!isOwned && frame.id !== 'frame_none') return null;

                        // Current Avatar Preview Logic
                        const currentAvatarDef = AVATARS.find(a => a.icon === currentProfile.avatar);
                        const avatarImageSrc = currentAvatarDef?.image || (currentProfile.avatar.length > 4 && (currentProfile.avatar.includes('/') || currentProfile.avatar.includes('http')) ? currentProfile.avatar : null);
                        const avatarIcon = currentAvatarDef?.icon || currentProfile.avatar;
                        
                        // Current Background Preview Logic
                        const currentBgDef = BACKGROUNDS.find(b => b.id === currentProfile.background) || BACKGROUNDS[0];

                        return (
                             <button 
                                key={frame.id}
                                onClick={() => handleFrameSelect(frame.id)}
                                className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all`}
                                style={{
                                    backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'var(--color-bg-card)',
                                    borderColor: isSelected ? '#a855f7' : 'var(--color-border)'
                                }}
                            >
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    {/* Frame Border */}
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frame.style}`}></div>
                                    
                                    {/* Background */}
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${currentBgDef.style}`}></div>

                                    {/* Content - CENTERED */}
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl relative z-20 overflow-hidden bg-transparent`}>
                                        {avatarImageSrc ? ( 
                                            <img src={avatarImageSrc} alt="Avatar" className="w-full h-full object-cover scale-[1.01]" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerText = avatarIcon || '👤';}} />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full leading-none">{avatarIcon || '👤'}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-sm font-bold" style={{color: isSelected ? '#a855f7' : 'var(--color-text-main)'}}>
                                        {frame.name}
                                    </div>
                                    <div className="text-[10px]" style={{color: 'var(--color-text-muted)'}}>{frame.description}</div>
                                </div>

                                {isSelected && (
                                     <div className="absolute top-3 right-3 w-3 h-3 bg-purple-500 rounded-full ring-2 ring-white"></div>
                                )}
                            </button>
                        );
                    })}
                     {currentProfile.purchasedFrames.length <= 1 && (
                        <div className="col-span-2 text-center p-6 text-sm" style={{color: 'var(--color-text-muted)'}}>
                            Daha fazla çerçeve almak için <strong>XP Market</strong>'i ziyaret et!
                        </div>
                    )}
                </div>
            ) : (
                 <div className="grid grid-cols-2 gap-4">
                    {BACKGROUNDS.map((bg) => {
                        const isOwned = currentProfile.purchasedBackgrounds?.includes(bg.id) || bg.id === 'bg_default';
                        const isSelected = currentProfile.background === bg.id;

                        if (!isOwned && bg.id !== 'bg_default') return null;
                        
                        // Current Avatar & Frame Logic for Preview
                        const currentAvatarDef = AVATARS.find(a => a.icon === currentProfile.avatar);
                        const avatarImageSrc = currentAvatarDef?.image || (currentProfile.avatar.length > 4 && (currentProfile.avatar.includes('/') || currentProfile.avatar.includes('http')) ? currentProfile.avatar : null);
                        const avatarIcon = currentAvatarDef?.icon || currentProfile.avatar;
                        
                        const currentFrameDef = FRAMES.find(f => f.id === currentProfile.frame) || FRAMES[0];


                         return (
                             <button 
                                key={bg.id}
                                onClick={() => handleBackgroundSelect(bg.id)}
                                className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all`}
                                style={{
                                    backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'var(--color-bg-card)',
                                    borderColor: isSelected ? '#eab308' : 'var(--color-border)'
                                }}
                            >
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    {/* Frame Border */}
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${currentFrameDef.style}`}></div>
                                    
                                    {/* Background (Target) */}
                                    <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${bg.style}`}></div>

                                    {/* Content - CENTERED */}
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl relative z-20 overflow-hidden bg-transparent`}>
                                        {avatarImageSrc ? ( 
                                            <img src={avatarImageSrc} alt="Avatar" className="w-full h-full object-cover scale-[1.01]" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerText = avatarIcon || '👤';}} />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full leading-none">{avatarIcon || '👤'}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-sm font-bold" style={{color: isSelected ? '#eab308' : 'var(--color-text-main)'}}>
                                        {bg.name}
                                    </div>
                                    <div className="text-[10px]" style={{color: 'var(--color-text-muted)'}}>{bg.description}</div>
                                </div>

                                {isSelected && (
                                     <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-white"></div>
                                )}
                            </button>
                        );
                    })}
                     {(!currentProfile.purchasedBackgrounds || currentProfile.purchasedBackgrounds.length <= 1) && (
                        <div className="col-span-2 text-center p-6 text-sm" style={{color: 'var(--color-text-muted)'}}>
                            Daha fazla arka plan almak için <strong>XP Market</strong>'i ziyaret et!
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AvatarModal;