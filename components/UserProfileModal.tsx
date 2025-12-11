

import React, { useState, useEffect } from 'react';
import { X, Trophy, Flame, Clock, ShieldCheck, Gamepad2, ChevronDown, ChevronUp, Target, Swords } from 'lucide-react';
import { getPublicUserProfile } from '../services/supabase';
import { AVATARS, FRAMES, BACKGROUNDS, BADGES, THEME_COLORS } from '../data/assets';
import { Badge } from '../types';

interface UserProfileModalProps {
    userId: string;
    onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showAllBadges, setShowAllBadges] = useState(false);
    const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const data = await getPublicUserProfile(userId);
            if (data) {
                setUserData(data);
            } else {
                setError(true);
            }
            setLoading(false);
        };
        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !userData) {
        return null;
    }

    const avatarDef = AVATARS.find(a => a.icon === userData.avatar) || AVATARS[0];
    const frameDef = FRAMES.find(f => f.id === userData.frame) || FRAMES[0];
    const bgDef = BACKGROUNDS.find(b => b.id === userData.background) || BACKGROUNDS[0];

    const userTheme = THEME_COLORS[userData.theme as any] || THEME_COLORS['dark'];
    const isLightMode = userData.theme === 'light' || userData.theme === 'retro' || userData.theme === 'comic' || userData.theme === 'nature_soft';

    // Helper for dynamic secondary colors based on theme
    const secondaryBg = isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const borderColor = isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

    // Badges are stored in order of acquisition. Reverse them to show newest first.
    const unlockedBadges = (userData.badges || [])
        .slice() // Create a copy to not mutate original
        .reverse()
        .map((id: string) => BADGES.find(b => b.id === id))
        .filter(Boolean);

    // Only show top 5 badges initially
    const displayedBadges = showAllBadges ? unlockedBadges : unlockedBadges.slice(0, 5);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={`w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}
                style={{
                    backgroundColor: userTheme.bgCard,
                    borderColor: userTheme.border,
                    color: userTheme.textMain
                }}
            >

                {/* Close Button */}
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Profile Header */}
                <div className={`relative h-32 w-full overflow-hidden ${bgDef.style} shrink-0`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 pb-6 -mt-16 flex flex-col items-center overflow-y-auto custom-scrollbar flex-1 w-full">
                    {/* Avatar */}
                    <div className="relative w-28 h-28 flex items-center justify-center mb-3 shrink-0">
                        <div className={`absolute inset-0 w-full h-full rounded-full z-30 pointer-events-none ${frameDef.style}`}></div>
                        <div className={`absolute inset-0 w-full h-full rounded-full z-10 ${bgDef.style} border-4 border-white dark:border-slate-900`} style={{ borderColor: userTheme.bgCard }}></div>
                        <div className="w-full h-full rounded-full overflow-hidden relative z-20 flex items-center justify-center text-5xl bg-transparent">
                            {avatarDef.image ? <img src={avatarDef.image} alt={userData.name} className="w-full h-full object-cover scale-[1.01]" /> : <span>{avatarDef.icon}</span>}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-center" style={{ color: userTheme.textMain }}>{userData.name}</h2>

                    <div className="flex items-center gap-2 mt-1 mb-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: secondaryBg, color: userTheme.primary }}>
                            Lvl {userData.level}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: secondaryBg, color: userTheme.textMuted }}>
                            {userData.grade === 'GENERAL' ? 'Genel' : `${userData.grade}. Sınıf`}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 w-full mb-6">
                        <div className="p-3 rounded-2xl text-center border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                            <div className="flex justify-center text-orange-500 mb-1"><Flame size={20} className="fill-current" /></div>
                            <div className="text-lg font-black">{userData.streak || 0}</div>
                            <div className="text-[10px] font-bold uppercase opacity-60">Gün Seri</div>
                        </div>
                        <div className="p-3 rounded-2xl text-center border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                            <div className="flex justify-center text-yellow-500 mb-1"><Trophy size={20} className="fill-current" /></div>
                            <div className="text-lg font-black">{userData.xp || 0}</div>
                            <div className="text-[10px] font-bold uppercase opacity-60">Toplam XP</div>
                        </div>
                        <div className="p-3 rounded-2xl text-center border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                            <div className="flex justify-center text-blue-500 mb-1"><Clock size={20} /></div>
                            <div className="text-lg font-black">{Math.floor((userData.totalTimeSpent || 0) / 60)}</div>
                            <div className="text-[10px] font-bold uppercase opacity-60">Saat</div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="w-full mb-6">
                        <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: userTheme.textMuted }}>
                            <ShieldCheck size={16} /> Rozetler ({unlockedBadges.length})
                        </h3>

                        {unlockedBadges.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <div className="grid grid-cols-5 gap-2 w-full">
                                    {displayedBadges.map((badge: Badge) => (
                                        <div
                                            key={badge.id}
                                            className="group relative flex justify-center"
                                            onClick={() => setTooltipBadgeId(tooltipBadgeId === badge.id ? null : badge.id)}
                                        >
                                            <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shadow-sm cursor-pointer hover:scale-110 transition-transform relative"
                                                style={{ backgroundColor: isLightMode ? '#fff' : '#0f172a', borderColor: borderColor }}
                                            >
                                                {badge.image ? <img src={badge.image} alt={badge.name} className="w-full h-full object-cover rounded-xl" /> : <span>{badge.icon}</span>}

                                                {/* Tooltip */}
                                                {tooltipBadgeId === badge.id && (
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                                        {badge.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {unlockedBadges.length > 5 && (
                                    <button
                                        onClick={() => setShowAllBadges(!showAllBadges)}
                                        className="mt-3 text-xs font-bold flex items-center gap-1 hover:underline"
                                        style={{ color: userTheme.primary }}
                                    >
                                        {showAllBadges ? <><ChevronUp size={14} /> Daha Az Göster</> : <><ChevronDown size={14} /> Tümünü Göster ({unlockedBadges.length - 5})</>}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-xs py-4 rounded-xl border border-dashed" style={{ backgroundColor: secondaryBg, borderColor: borderColor, color: userTheme.textMuted }}>
                                Henüz rozet kazanılmamış.
                            </div>
                        )}
                    </div>

                    {/* Detailed Game Stats */}
                    <div className="w-full">
                        <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: userTheme.textMuted }}>
                            <Gamepad2 size={16} /> Oyun İstatistikleri
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 rounded-xl border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <Swords size={14} className="text-orange-500" />
                                    Düello
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded" title="Puan">{userData.duelPoints || 0} P</span>
                                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded" title="Galibiyet">{userData.duelWins || 0} G</span>
                                    <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded" title="Beraberlik">{userData.duelDraws || 0} B</span>
                                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded" title="Mağlubiyet">{userData.duelLosses || 0} M</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <Target size={14} className="text-violet-500" />
                                    Test (Quiz)
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">{userData.quizCorrect || 0} D</span>
                                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">{userData.quizWrong || 0} Y</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                                <span className="text-xs font-bold">Eşleştirme Rekoru</span>
                                <span className="text-sm font-black" style={{ color: userTheme.primary }}>{userData.matchingBestTime || 0} P</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                                <span className="text-xs font-bold">Labirent</span>
                                <span className="text-sm font-black text-red-500">{userData.mazeHighScore || 0} P</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl border" style={{ backgroundColor: secondaryBg, borderColor: borderColor }}>
                                <span className="text-xs font-bold">Bulmaca</span>
                                <span className="text-sm font-black text-blue-500">{userData.wordSearchHighScore || 0} P</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;