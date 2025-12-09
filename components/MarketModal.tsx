

import React, { useState } from 'react';
import { X, ShoppingBag, Star, Palette, Sun, Moon, Droplets, Sunset, TreePine, Crown, Candy, Image, Gamepad2, Coffee, Rocket, Heart, Leaf, CloudSnow, MessageCircle, Flame, Lock, Zap, Shield } from 'lucide-react';
import { getUserStats, getUserProfile, buyTheme, buyFrame, buyBackground, buyItem, getTheme, saveTheme, equipFrame, equipBackground } from '../services/userService';
import { MarketItem, ThemeType, UserStats } from '../types';
import { playSound } from '../services/soundService';
import { getFrames, getBackgrounds } from '../services/contentService';
import CustomAlert, { AlertType } from './CustomAlert';

interface MarketModalProps {
  onClose: () => void;
  onThemeChange: () => void;
}

const MarketModal: React.FC<MarketModalProps> = ({ onClose, onThemeChange }) => {
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [profile, setProfile] = useState(getUserProfile());
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [activeTab, setActiveTab] = useState<'themes' | 'frames' | 'backgrounds' | 'powerups'>('themes');
  
  // Internal Alert State
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: AlertType }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertType) => {
      setAlert({ visible: true, title, message, type });
  };

  const FRAMES = getFrames();
  const BACKGROUNDS = getBackgrounds();

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

          if (aOwned && !bOwned) return -1;
          if (!aOwned && bOwned) return 1;

          return a.cost - b.cost;
      });
  };

  const rawThemes: MarketItem[] = [
    { id: 'theme_light', name: 'Aydınlık', description: 'Klasik beyaz.', cost: 0, type: 'theme', value: 'light', icon: <Sun size={20} />, previewColor: '#ffffff', unlockLevel: 1 },
    { id: 'theme_dark', name: 'Karanlık', description: 'Klasik koyu.', cost: 0, type: 'theme', value: 'dark', icon: <Moon size={20} />, previewColor: '#0f172a', unlockLevel: 1 },
    { id: 'theme_ocean', name: 'Okyanus', description: 'Mavi tonları.', cost: 1000, type: 'theme', value: 'ocean', icon: <Droplets size={20} />, previewColor: '#0c4a6e', unlockLevel: 2 },
    { id: 'theme_sunset', name: 'Gün Batımı', description: 'Sıcak turuncu.', cost: 1000, type: 'theme', value: 'sunset', icon: <Sunset size={20} />, previewColor: '#431407', unlockLevel: 3 },
    { id: 'theme_forest', name: 'Orman', description: 'Doğal yeşil.', cost: 1500, type: 'theme', value: 'forest', icon: <TreePine size={20} />, previewColor: '#052e16', unlockLevel: 4 },
    { id: 'theme_lavender', name: 'Lavanta', description: 'Yumuşak mor.', cost: 2000, type: 'theme', value: 'lavender', icon: <Heart size={20} />, previewColor: '#2e1065', unlockLevel: 5 },
    { id: 'theme_coffee', name: 'Kahve', description: 'Kahverengi.', cost: 2000, type: 'theme', value: 'coffee', icon: <Coffee size={20} />, previewColor: '#3e2723', unlockLevel: 6 },
    { id: 'theme_candy', name: 'Şeker', description: 'Tatlı pembe.', cost: 3500, type: 'theme', value: 'candy', icon: <Candy size={20} />, previewColor: '#831843', unlockLevel: 7 },
    { id: 'theme_nature_soft', name: 'Yumuşak Doğa', description: 'Rahatlatıcı yeşil.', cost: 3000, type: 'theme', value: 'nature_soft', icon: <Leaf size={20} />, previewColor: '#f0fdf4', unlockLevel: 8 },
    { id: 'theme_midnight', name: 'Gece', description: 'Derin mavi.', cost: 2500, type: 'theme', value: 'midnight', icon: <Moon className="fill-current" size={20} />, previewColor: '#020617', unlockLevel: 9 },
    { id: 'theme_neon', name: 'Neon', description: 'Canlı siyah.', cost: 3000, type: 'theme', value: 'neon', icon: <Zap size={20} />, previewColor: '#000000', unlockLevel: 10 },
    { id: 'theme_ice', name: 'Buzul', description: 'Soğuk camgöbeği.', cost: 4500, type: 'theme', value: 'ice', icon: <CloudSnow size={20} />, previewColor: '#083344', unlockLevel: 11 },
    { id: 'theme_retro', name: 'Retro', description: 'Eski kağıt.', cost: 4000, type: 'theme', value: 'retro', icon: <Image size={20} />, previewColor: '#fdf6e3', unlockLevel: 12 },
    { id: 'theme_cyberpunk', name: 'Siber', description: 'Fütüristik sarı.', cost: 5000, type: 'theme', value: 'cyberpunk', icon: <Gamepad2 size={20} />, previewColor: '#18181b', unlockLevel: 14 },
    { id: 'theme_volcano', name: 'Volkan', description: 'Koyu kırmızı.', cost: 5500, type: 'theme', value: 'volcano', icon: <Flame size={20} />, previewColor: '#1a0505', unlockLevel: 16 },
    { id: 'theme_galaxy', name: 'Galaksi', description: 'Mor uzay.', cost: 8000, type: 'theme', value: 'galaxy', icon: <Rocket size={20} />, previewColor: '#2e1065', unlockLevel: 18 },
    { id: 'theme_comic', name: 'Çizgi Roman', description: 'Canlı renkler.', cost: 6500, type: 'theme', value: 'comic', icon: <MessageCircle size={20} />, previewColor: '#ffffff', unlockLevel: 20 },
    { id: 'theme_royal', name: 'Kraliyet', description: 'Altın ve mor.', cost: 7500, type: 'theme', value: 'royal', icon: <Crown size={20} />, previewColor: '#312e81', unlockLevel: 25 },
    { id: 'theme_matrix', name: 'Matrix', description: 'Yeşil kod.', cost: 6000, type: 'theme', value: 'matrix', icon: <div className="text-green-500 font-mono font-bold text-xs">101</div>, previewColor: '#001100', unlockLevel: 30 },
    { id: 'theme_gamer', name: 'Gamer', description: 'RGB siyah.', cost: 9000, type: 'theme', value: 'gamer', icon: <Gamepad2 size={20} className="text-red-500" />, previewColor: '#000000', unlockLevel: 35 },
    { id: 'theme_luxury', name: 'Lüks', description: 'Zengin altın.', cost: 10000, type: 'theme', value: 'luxury', icon: <Crown size={20} className="text-yellow-500" />, previewColor: '#1a1a1a', unlockLevel: 40 },
  ];

  const rawFrames: MarketItem[] = FRAMES.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      cost: f.cost,
      type: 'frame',
      value: f.style,
      icon: <div className={`w-4 h-4 rounded-full ${f.style.includes('border') ? f.style : 'border-2 border-gray-400'}`}></div>,
      image: f.image,
      unlockLevel: f.unlockLevel || 1
  }));
  
  const rawBackgrounds: MarketItem[] = BACKGROUNDS.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      cost: b.cost,
      type: 'background',
      value: b.style,
      icon: <div className={`w-4 h-4 rounded-full ${b.style}`}></div>,
      image: b.image,
      unlockLevel: b.unlockLevel || 1
  }));

  const powerups: MarketItem[] = [
      { 
          id: 'streak_freeze', 
          name: 'Seri Dondurucu', 
          description: 'Bir gün girmeyi unutursan serin bozulmaz.', 
          cost: 500, 
          type: 'powerup' as any, 
          value: 'streak_freeze', 
          icon: <Shield size={24} className="text-blue-500" />, 
          unlockLevel: 1 
      },
      { 
          id: 'xp_boost', 
          name: '2x XP (1 Saat)', 
          description: '1 saat boyunca iki kat puan kazan.', 
          cost: 250, 
          type: 'powerup' as any, 
          value: 'xp_boost', 
          icon: <Zap size={24} className="text-yellow-500" />, 
          unlockLevel: 1 
      }
  ];

  const themes = sortItems(rawThemes);
  const frameMarketItems = sortItems(rawFrames);
  const backgroundMarketItems = sortItems(rawBackgrounds);

  const handlePurchase = (item: MarketItem) => {
    if (item.unlockLevel && stats.level < item.unlockLevel) {
         playSound('wrong');
         showAlert("Seviye Yetersiz", `Bu ürünü almak için ${item.unlockLevel}. seviyeye ulaşmalısın!`, "warning");
         return;
    }

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
                showAlert("Yetersiz XP", "Bu temayı almak için yeterli puanın yok.", "error");
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
                showAlert("Yetersiz XP", "Bu çerçeveyi almak için yeterli puanın yok.", "error");
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
                 showAlert("Yetersiz XP", "Bu arka planı almak için yeterli puanın yok.", "error");
             }
        }
    } else if ((item.type as any) === 'powerup') {
        if (item.value === 'xp_boost' && stats.xpBoostEndTime > Date.now()) {
             playSound('wrong');
             showAlert("Zaten Aktif", "Zaten aktif bir XP Takviyen var!", "warning");
             return;
        }

        if (buyItem(item.value as any, item.cost)) {
            playSound('success');
            setStats(getUserStats());
            setProfile(getUserProfile());
            if (item.value === 'xp_boost') {
                showAlert("Başarılı", "XP Boost aktif! 1 saat boyunca 2 kat puan kazanacaksın.", "success");
                onThemeChange();
            } else {
                showAlert("Başarılı", "Satın alma işlemi tamamlandı!", "success");
            }
        } else {
            playSound('wrong');
            showAlert("Yetersiz XP", "Bu güçlendirmeyi almak için yeterli puanın yok.", "error");
        }
    }
  };

  const PreviewBox = ({ item }: { item: MarketItem }) => {
    const isLocked = item.unlockLevel && stats.level < item.unlockLevel;

    if (item.image) {
        return (
            <div className="w-full h-16 rounded-lg overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${isLocked ? 'opacity-50 grayscale' : ''}`} />
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock size={20} className="text-white" />
                    </div>
                )}
            </div>
        );
    }
    
    if (item.type === 'theme') {
        return (
            <div className={`w-full h-16 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden border ${isLocked ? 'opacity-50 grayscale' : ''}`} style={{ backgroundColor: item.previewColor }}>
                <div className="absolute inset-0 opacity-20 bg-white transform rotate-45 translate-x-1/2"></div>
                <div className="text-white text-xs font-bold z-10 drop-shadow-md">Aa</div>
                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-white/30"></div>
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                        <Lock size={20} className="text-white" />
                    </div>
                )}
            </div>
        )
    }

    if (item.type === 'frame') {
        return (
            <div className="w-full h-16 rounded-lg mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                <div className={`w-10 h-10 rounded-full bg-gray-300 ${item.value} ${isLocked ? 'opacity-50' : ''}`}></div>
                 {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={20} className="text-slate-500" />
                    </div>
                )}
            </div>
        )
    }
    
    if (item.type === 'background') {
        return (
            <div className="w-full h-16 rounded-lg mb-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                 <div className={`w-10 h-10 rounded-full ${item.value} ${isLocked ? 'opacity-50' : ''}`}></div>
                 {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={20} className="text-slate-500" />
                    </div>
                )}
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
    <>
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
         className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 h-[80vh]"
         style={{
             backgroundColor: 'var(--color-bg-card)', 
             borderColor: 'var(--color-border)'
         }}
      >
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shrink-0 text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <ShoppingBag size={20} />
                 <h2 className="text-lg font-black">Kozmetikler</h2>
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

        {/* Tabs Logic same as before ... */}
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
                {(activeTab === 'powerups' ? powerups : activeTab === 'themes' ? themes : activeTab === 'frames' ? frameMarketItems : backgroundMarketItems).map((item) => {
                    const isOwned = 
                        (item.type === 'theme' && profile.purchasedThemes.includes(item.value)) ||
                        (item.type === 'frame' && profile.purchasedFrames.includes(item.id)) ||
                        (item.type === 'background' && profile.purchasedBackgrounds?.includes(item.id));
                        
                    const isActive = 
                        (item.type === 'theme' && currentTheme === item.value) ||
                        (item.type === 'frame' && profile.frame === item.id) ||
                        (item.type === 'background' && profile.background === item.id);
                        
                    const canAfford = stats.xp >= item.cost;
                    const isLevelLocked = item.unlockLevel && stats.level < item.unlockLevel;
                    const isPowerup = (item.type as any) === 'powerup';
                    
                    // Check for active boost
                    const isBoostActive = item.value === 'xp_boost' && stats.xpBoostEndTime > Date.now();

                    return (
                        <button 
                            key={item.id}
                            disabled={(!canAfford && !isOwned && !isPowerup) || isLevelLocked || isBoostActive}
                            onClick={() => handlePurchase(item)}
                            className={`relative p-3 rounded-xl border-2 flex flex-col gap-1 text-left transition-all active:scale-[0.98]
                                ${isActive 
                                    ? 'border-yellow-500 ring-1 ring-yellow-500' 
                                    : isBoostActive ? 'border-green-500 bg-green-50/10 cursor-default' : 'hover:border-yellow-500/50'
                                }
                                ${((!canAfford && !isOwned && !isPowerup) || isLevelLocked) ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                            style={{
                                backgroundColor: 'var(--color-bg-card)',
                                borderColor: isActive ? '#eab308' : isBoostActive ? '#22c55e' : 'var(--color-border)'
                            }}
                        >
                            <PreviewBox item={item} />
                            
                            <div>
                                <h3 className="font-bold text-xs truncate" style={{color: 'var(--color-text-main)'}}>{item.name}</h3>
                                <p className="text-[10px] leading-tight line-clamp-2" style={{color: 'var(--color-text-muted)'}}>
                                    {isLevelLocked ? `Lvl ${item.unlockLevel} Gerekli` : item.description}
                                    {isPowerup && item.value === 'streak_freeze' && ` (Sahip: ${profile.inventory?.streakFreezes || 0})`}
                                </p>
                            </div>

                            <div className="mt-auto pt-1 w-full">
                                {isActive ? (
                                    <div className="w-full py-1.5 bg-green-500 text-white rounded-lg text-center text-[10px] font-bold">
                                        Seçili
                                    </div>
                                ) : isBoostActive ? (
                                     <div className="w-full py-1.5 bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1">
                                         <Zap size={12} className="fill-current" /> Aktif
                                     </div>
                                ) : isOwned && !isPowerup ? (
                                    <div className="w-full py-1.5 rounded-lg text-center text-[10px] font-bold" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>
                                        Kullan
                                    </div>
                                ) : isLevelLocked ? (
                                     <div className="w-full py-1.5 rounded-lg text-center text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center gap-1">
                                         <Lock size={10} /> Kilitli
                                     </div>
                                ) : (
                                    <div className={`w-full py-1.5 rounded-lg text-center text-[10px] font-bold
                                        ${canAfford ? 'bg-yellow-500 text-white' : ''}
                                    `} style={!canAfford ? {backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'} : {}}>
                                        {item.cost} XP
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

    {/* Custom Alert */}
    <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
    />
    </>
  );
};

export default MarketModal;