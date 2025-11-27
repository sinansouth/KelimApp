
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, Shield, Palette, Sun, Moon, Zap, Droplets, Sunset, TreePine, Crown, Candy, Image, Gamepad2, Coffee, Rocket, Heart, Leaf, CloudSnow, Timer, MessageCircle, Flame } from 'lucide-react';
import { getUserStats, getUserProfile, buyTheme, buyFrame, buyBackground, buyFreeze, buyXPBoost, getTheme, saveTheme, equipFrame, equipBackground, UserStats } from '../services/userService';
import { MarketItem, ThemeType } from '../types';
import { playSound } from '../services/soundService';
import { FRAMES, BACKGROUNDS } from '../data/assets';

interface MarketModalProps {
  onClose: () => void;
  onThemeChange: () => void;
}

const MarketModal: React.FC<MarketModalProps> = ({ onClose, onThemeChange }) => {
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [profile, setProfile] = useState(getUserProfile());
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [activeTab, setActiveTab] = useState<'themes' | 'frames' | 'backgrounds' | 'powerups'>('themes');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
      const updateTimer = () => {
          const now = Date.now();
          if (stats.xpBoostEndTime > now) {
              const diff = stats.xpBoostEndTime - now;
              const minutes = Math.floor(diff / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
          } else {
              setTimeLeft('');
          }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
  }, [stats.xpBoostEndTime]);

  // Helper to sort items: Owned first, then by Cost (Ascending)
  const sortItems = (items: MarketItem[]) => {
      return [...items].sort((a, b) => {
          let aOwned = false;
          let bOwned = false;

          if (a.type === 'theme') aOwned = profile.purchasedThemes.includes(a.value);
          if (b.type === 'theme') bOwned = profile.purchasedThemes.includes(b.value);
          
          if (a.type === 'frame') aOwned = profile.purchasedFrames.includes(a.id);
          if (b.type === 'frame') bOwned = profile.purchasedFrames.includes(b.id);

          if (a.type === 'background') aOwned = profile.purchasedBackgrounds?.includes(a.id) || a.id === 'bg_default';
          if (b.type === 'background') bOwned = profile.purchasedBackgrounds?.includes(b.id) || b.id === 'bg_default';

          // 1. Sort by ownership (Owned comes first)
          if (aOwned && !bOwned) return -1;
          if (!aOwned && bOwned) return 1;

          // 2. Sort by cost (Cheapest first)
          return a.cost - b.cost;
      });
  };

  const rawThemes: MarketItem[] = [
    { id: 'theme_light', name: 'Aydınlık', description: 'Klasik beyaz.', cost: 0, type: 'theme', value: 'light', icon: <Sun size={20} />, previewColor: '#ffffff' },
    { id: 'theme_dark', name: 'Karanlık', description: 'Klasik koyu.', cost: 0, type: 'theme', value: 'dark', icon: <Moon size={20} />, previewColor: '#0f172a' },
    { id: 'theme_ocean', name: 'Okyanus', description: 'Mavi tonları.', cost: 1000, type: 'theme', value: 'ocean', icon: <Droplets size={20} />, previewColor: '#0c4a6e' },
    { id: 'theme_sunset', name: 'Gün Batımı', description: 'Sıcak turuncu.', cost: 1000, type: 'theme', value: 'sunset', icon: <Sunset size={20} />, previewColor: '#431407' },
    { id: 'theme_forest', name: 'Orman', description: 'Doğal yeşil.', cost: 1500, type: 'theme', value: 'forest', icon: <TreePine size={20} />, previewColor: '#052e16' },
    { id: 'theme_coffee', name: 'Kahve', description: 'Kahverengi.', cost: 2000, type: 'theme', value: 'coffee', icon: <Coffee size={20} />, previewColor: '#3e2723' },
    { id: 'theme_neon', name: 'Neon', description: 'Canlı siyah.', cost: 3000, type: 'theme', value: 'neon', icon: <Zap size={20} />, previewColor: '#000000' },
    { id: 'theme_candy', name: 'Şeker', description: 'Tatlı pembe.', cost: 3500, type: 'theme', value: 'candy', icon: <Candy size={20} />, previewColor: '#831843' },
    { id: 'theme_cyberpunk', name: 'Siber', description: 'Fütüristik sarı.', cost: 5000, type: 'theme', value: 'cyberpunk', icon: <Gamepad2 size={20} />, previewColor: '#18181b' },
    { id: 'theme_royal', name: 'Kraliyet', description: 'Altın ve mor.', cost: 7500, type: 'theme', value: 'royal', icon: <Crown size={20} />, previewColor: '#312e81' },
    { id: 'theme_galaxy', name: 'Galaksi', description: 'Mor uzay.', cost: 8000, type: 'theme', value: 'galaxy', icon: <Rocket size={20} />, previewColor: '#2e1065' },
    { id: 'theme_retro', name: 'Retro', description: 'Eski kağıt.', cost: 4000, type: 'theme', value: 'retro', icon: <Image size={20} />, previewColor: '#fdf6e3' },
    { id: 'theme_matrix', name: 'Matrix', description: 'Yeşil kod.', cost: 6000, type: 'theme', value: 'matrix', icon: <div className="text-green-500 font-mono font-bold text-xs">101</div>, previewColor: '#001100' },
    { id: 'theme_midnight', name: 'Gece', description: 'Derin mavi.', cost: 2500, type: 'theme', value: 'midnight', icon: <Moon className="fill-current" size={20} />, previewColor: '#020617' },
    { id: 'theme_volcano', name: 'Volkan', description: 'Koyu kırmızı.', cost: 5500, type: 'theme', value: 'volcano', icon: <Flame size={20} />, previewColor: '#1a0505' },
    { id: 'theme_ice', name: 'Buzul', description: 'Soğuk camgöbeği.', cost: 4500, type: 'theme', value: 'ice', icon: <CloudSnow size={20} />, previewColor: '#083344' },
    { id: 'theme_lavender', name: 'Lavanta', description: 'Yumuşak mor.', cost: 2000, type: 'theme', value: 'lavender', icon: <Heart size={20} />, previewColor: '#2e1065' },
    { id: 'theme_gamer', name: 'Gamer', description: 'RGB siyah.', cost: 9000, type: 'theme', value: 'gamer', icon: <Gamepad2 size={20} className="text-red-500" />, previewColor: '#000000' },
    { id: 'theme_luxury', name: 'Lüks', description: 'Zengin altın.', cost: 10000, type: 'theme', value: 'luxury', icon: <Crown size={20} className="text-yellow-500" />, previewColor: '#1a1a1a' },
    { id: 'theme_comic', name: 'Çizgi Roman', description: 'Canlı renkler.', cost: 6500, type: 'theme', value: 'comic', icon: <MessageCircle size={20} />, previewColor: '#ffffff' },
    { id: 'theme_nature_soft', name: 'Yumuşak Doğa', description: 'Rahatlatıcı yeşil.', cost: 3000, type: 'theme', value: 'nature_soft', icon: <Leaf size={20} />, previewColor: '#f0fdf4' },
  ];

  const rawFrames: MarketItem[] = FRAMES.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      cost: f.cost,
      type: 'frame',
      value: f.style,
      icon: <div className={`w-4 h-4 rounded-full ${f.style.includes('border') ? f.style : 'border-2 border-gray-400'}`}></div>,
      image: f.image
  }));
  
  const rawBackgrounds: MarketItem[] = BACKGROUNDS.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      cost: b.cost,
      type: 'background',
      value: b.style,
      icon: <div className={`w-4 h-4 rounded-full ${b.style}`}></div>,
      image: b.image
  }));

  const powerups: MarketItem[] = [
    { id: 'streak_freeze', name: 'Dondurma', description: '1 gün korur.', cost: 500, type: 'consumable', value: 'freeze', icon: <Shield size={20} /> },
    { id: 'xp_boost', name: '2x XP (30dk)', description: 'İki kat puan.', cost: 500, type: 'consumable', value: 'xp_boost', icon: <Zap size={20} /> },
  ];

  // APPLY SORTING
  const themes = sortItems(rawThemes);
  const frameMarketItems = sortItems(rawFrames);
  const backgroundMarketItems = sortItems(rawBackgrounds);

  const handlePurchase = (item: MarketItem) => {
    if (item.type === 'theme') {
        if (profile.purchasedThemes.includes(item.value)) {
            saveTheme(item.value as ThemeType);
            setCurrentTheme(item.value as ThemeType);
            onThemeChange();
            playSound('click');
        } else {
            if (buyTheme(item.value as ThemeType, item.cost)) {
                playSound('success');
                setStats(getUserStats());
                setProfile(getUserProfile());
            } else {
                playSound('wrong');
                alert("Yetersiz XP!");
            }
        }
    } else if (item.type === 'frame') {
        if (profile.purchasedFrames.includes(item.id)) { 
            equipFrame(item.id);
            setProfile(getUserProfile());
            playSound('click');
        } else {
            if (buyFrame(item.id, item.cost)) {
                playSound('success');
                setStats(getUserStats());
                setProfile(getUserProfile());
            } else {
                playSound('wrong');
                alert("Yetersiz XP!");
            }
        }
    } else if (item.type === 'background') {
        if (profile.purchasedBackgrounds?.includes(item.id)) {
            equipBackground(item.id);
            setProfile(getUserProfile());
            playSound('click');
        } else {
             if (buyBackground(item.id, item.cost)) {
                playSound('success');
                setStats(getUserStats());
                setProfile(getUserProfile());
             } else {
                 playSound('wrong');
                 alert("Yetersiz XP!");
             }
        }
    } else if (item.type === 'consumable') {
        if (item.value === 'freeze') {
            if (buyFreeze(item.cost)) {
                playSound('success');
                setStats(getUserStats());
                setProfile(getUserProfile());
            } else {
                playSound('wrong');
                alert("Yetersiz XP!");
            }
        } else if (item.value === 'xp_boost') {
            if (buyXPBoost(item.cost)) {
                playSound('success');
                setStats(getUserStats());
            } else {
                playSound('wrong');
                alert("Zaten aktif veya Yetersiz XP!");
            }
        }
    }
  };

  const isBoostActive = stats.xpBoostEndTime > Date.now();

  const PreviewBox = ({ item }: { item: MarketItem }) => {
    if (item.image) {
        return (
            <div className="w-full h-16 rounded-lg overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
        );
    }
    
    if (item.type === 'theme') {
        return (
            <div className="w-full h-16 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden border" style={{ backgroundColor: item.previewColor }}>
                <div className="absolute inset-0 opacity-20 bg-white transform rotate-45 translate-x-1/2"></div>
                <div className="text-white text-xs font-bold z-10 drop-shadow-md">Aa</div>
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-white/30"></div>
            </div>
        )
    }

    if (item.type === 'frame') {
        return (
            <div className="w-full h-16 rounded-lg mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className={`w-10 h-10 rounded-full bg-gray-300 ${item.value}`}></div>
            </div>
        )
    }
    
    if (item.type === 'background') {
        return (
            <div className="w-full h-16 rounded-lg mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <div className={`w-10 h-10 rounded-full ${item.value}`}></div>
            </div>
        )
    }

    return (
        <div className="w-full h-16 rounded-lg mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            {item.icon}
        </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
         className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 h-[80vh]"
         style={{
             backgroundColor: 'var(--color-bg-card)', 
             borderColor: 'var(--color-border)'
         }}
      >
        
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 shrink-0 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <ShoppingBag size={20} />
                 <h2 className="text-lg font-black">XP Market</h2>
             </div>
             <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <Star size={14} className="fill-yellow-300 text-yellow-300" />
                    <span className="font-black text-sm">{stats.xp}</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
             </div>
        </div>

        {isBoostActive && (
             <div className="bg-yellow-500 text-white px-4 py-1 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
                 <Timer size={12} /> {timeLeft} (2x XP Aktif)
             </div>
        )}

        <div className="flex border-b px-2 gap-2 shrink-0 overflow-x-auto no-scrollbar" style={{borderColor: 'var(--color-border)'}}>
            <button 
                onClick={() => setActiveTab('themes')}
                className={`py-3 px-3 font-bold text-xs whitespace-nowrap relative transition-colors ${activeTab === 'themes' ? 'text-yellow-500' : 'opacity-60'}`}
                style={{color: activeTab === 'themes' ? '#eab308' : 'var(--color-text-muted)'}}
            >
                Temalar
                {activeTab === 'themes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('frames')}
                className={`py-3 px-3 font-bold text-xs whitespace-nowrap relative transition-colors ${activeTab === 'frames' ? 'text-purple-500' : 'opacity-60'}`}
                style={{color: activeTab === 'frames' ? '#a855f7' : 'var(--color-text-muted)'}}
            >
                Çerçeveler
                {activeTab === 'frames' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('backgrounds')}
                className={`py-3 px-3 font-bold text-xs whitespace-nowrap relative transition-colors ${activeTab === 'backgrounds' ? 'text-orange-500' : 'opacity-60'}`}
                style={{color: activeTab === 'backgrounds' ? '#f97316' : 'var(--color-text-muted)'}}
            >
                Arka Plan
                {activeTab === 'backgrounds' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('powerups')}
                className={`py-3 px-3 font-bold text-xs whitespace-nowrap relative transition-colors ${activeTab === 'powerups' ? 'text-blue-500' : 'opacity-60'}`}
                style={{color: activeTab === 'powerups' ? '#3b82f6' : 'var(--color-text-muted)'}}
            >
                Güçlendirme
                {activeTab === 'powerups' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>}
            </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1" style={{backgroundColor: 'var(--color-bg-main)'}}>
            <div className="grid grid-cols-2 gap-3">
                {(activeTab === 'themes' ? themes : activeTab === 'frames' ? frameMarketItems : activeTab === 'backgrounds' ? backgroundMarketItems : powerups).map((item) => {
                    const isOwned = 
                        (item.type === 'theme' && profile.purchasedThemes.includes(item.value)) ||
                        (item.type === 'frame' && profile.purchasedFrames.includes(item.id)) ||
                        (item.type === 'background' && profile.purchasedBackgrounds?.includes(item.id));
                        
                    const isActive = 
                        (item.type === 'theme' && currentTheme === item.value) ||
                        (item.type === 'frame' && profile.frame === item.id) ||
                        (item.type === 'background' && profile.background === item.id);
                        
                    const canAfford = stats.xp >= item.cost;
                    
                    const isBoostItem = item.value === 'xp_boost';
                    const isBoostRunning = isBoostItem && isBoostActive;

                    const freezeCount = item.value === 'freeze' ? profile.inventory.streakFreezes : 0;

                    return (
                        <button 
                            key={item.id}
                            disabled={(!canAfford && !isOwned && !isBoostItem && item.type !== 'consumable') || isBoostRunning}
                            onClick={() => handlePurchase(item)}
                            className={`relative p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all active:scale-[0.98]
                                ${isActive 
                                    ? 'border-yellow-500 ring-1 ring-yellow-500' 
                                    : 'hover:border-yellow-500/50'
                                }
                                ${(!canAfford && !isOwned && !isBoostItem && item.type !== 'consumable') ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            style={{
                                backgroundColor: 'var(--color-bg-card)',
                                borderColor: isActive ? '#eab308' : 'var(--color-border)'
                            }}
                        >
                            <PreviewBox item={item} />
                            
                            <div>
                                <h3 className="font-bold text-xs truncate" style={{color: 'var(--color-text-main)'}}>{item.name}</h3>
                                <p className="text-[10px] leading-tight line-clamp-1" style={{color: 'var(--color-text-muted)'}}>{item.description}</p>
                            </div>

                            <div className="mt-auto pt-1 w-full">
                                {isActive ? (
                                    <div className="w-full py-1.5 bg-green-500 text-white rounded-lg text-center text-[10px] font-bold">
                                        Seçili
                                    </div>
                                ) : isOwned && !isBoostItem && item.type !== 'consumable' ? (
                                    <div className="w-full py-1.5 rounded-lg text-center text-[10px] font-bold" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>
                                        Kullan
                                    </div>
                                ) : (
                                    <div className={`w-full py-1.5 rounded-lg text-center text-[10px] font-bold
                                        ${canAfford ? 'bg-yellow-500 text-white' : ''}
                                    `} style={!canAfford ? {backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'} : {}}>
                                        {item.cost} XP
                                    </div>
                                )}
                                {item.value === 'freeze' && (
                                     <div className="text-[10px] text-center mt-1" style={{color: 'var(--color-text-muted)'}}>
                                        (Sahip olunan: {freezeCount})
                                     </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketModal;
