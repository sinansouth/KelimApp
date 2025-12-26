
import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Edit3, Trophy, Flame, Star, User, ShoppingBag, CheckCircle, ChevronRight, X, GraduationCap, ShieldCheck, Zap } from 'lucide-react';
import { getUserProfile, getUserStats, saveUserProfile, UserProfile as IUserProfile, UserStats, getMemorizedSet, getXPForLevel } from '../services/userService';
import { Badge } from '../types';
import { StatsModal } from './StatsModal';
import AvatarModal from './AvatarModal';
import { getAvatars, getBadges, getFrames, getBackgrounds } from '../services/contentService';
import { THEME_COLORS } from '../data/assets';
import { AlertType } from './CustomAlert';
import CustomSelect from './CustomSelect';

interface ProfileProps {
    onBack: () => void;
    onProfileUpdate?: () => void;
    onOpenMarket?: () => void;
    onLoginRequest?: (initialView?: 'login' | 'register') => void;
    externalStats?: UserStats;
    showAlert: (title: string, message: string, type: AlertType, onConfirm?: () => void) => void;
    onViewProfile: (userId: string) => void;
}

const gradeOptions = [
    { value: "2", label: "2. Sınıf", group: "İlkokul" },
    { value: "3", label: "3. Sınıf", group: "İlkokul" },
    { value: "4", label: "4. Sınıf", group: "İlkokul" },
    { value: "5", label: "5. Sınıf", group: "Ortaokul" },
    { value: "6", label: "6. Sınıf", group: "Ortaokul" },
    { value: "7", label: "7. Sınıf", group: "Ortaokul" },
    { value: "8", label: "8. Sınıf", group: "Ortaokul" },
    { value: "9", label: "9. Sınıf", group: "Lise" },
    { value: "10", label: "10. Sınıf", group: "Lise" },
    { value: "11", label: "11. Sınıf", group: "Lise" },
    { value: "12", label: "12. Sınıf", group: "Lise" },
    { value: "A1", label: "A1 (Başlangıç)", group: "Genel İngilizce" },
    { value: "A2", label: "A2 (Temel)", group: "Genel İngilizce" },
    { value: "B1", label: "B1 (Orta)", group: "Genel İngilizce" },
    { value: "B2", label: "B2 (Orta Üstü)", group: "Genel İngilizce" },
    { value: "C1", label: "C1 (İleri)", group: "Genel İngilizce" },
];

const Profile: React.FC<ProfileProps> = ({ onBack, onProfileUpdate, onOpenMarket, externalStats, showAlert }) => {
    const [profile, setProfile] = useState<IUserProfile>(getUserProfile());
    const [stats, setStats] = useState<UserStats>(externalStats || getUserStats());
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [isBadgesExpanded, setIsBadgesExpanded] = useState(false);

    const AVATARS = getAvatars();
    const BADGES = getBadges();
    const FRAMES = getFrames();
    const BACKGROUNDS = getBackgrounds();

    const currentFrame = FRAMES.find(f => f.id === profile.frame) || FRAMES[0];
    const currentBackground = BACKGROUNDS.find(b => b.id === profile.background) || BACKGROUNDS[0];

    useEffect(() => {
        setProfile(getUserProfile());
        setStats(externalStats || getUserStats());
    }, [showStatsModal, showAvatarModal, externalStats]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        saveUserProfile(profile, false);
        setProfile(profile);
        showAlert("Başarılı", "Profilin güncellendi!", "success");
        setIsEditing(false);
        setIsSaving(false);
        if (onProfileUpdate) onProfileUpdate();
    };

    const unlockedBadges = useMemo(() => {
        if (!stats?.badges) return [];
        return stats.badges
            .map(id => BADGES.find(b => b.id === id))
            .filter((b): b is Badge => b !== undefined);
    }, [stats?.badges, BADGES]);

    const frameDef = FRAMES.find(f => f.id === profile.frame) || FRAMES[0];

    return (
        <div className="flex flex-col h-full transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)' }}>


            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Profile Card */}
                <div className="rounded-[2.5rem] p-6 shadow-xl flex flex-col items-center text-center border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}>
                    <div className="relative mb-4">
                        <div
                            className={`w-24 h-24 rounded-full p-1.5 flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all duration-300 ${currentFrame.style || 'border-4 border-white dark:border-slate-900'}`}
                            onClick={() => setShowAvatarModal(true)}
                        >
                            <div className={`absolute inset-0 ${currentBackground.style || 'bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 animate-spin-slow'}`}></div>
                            {AVATARS.find(a => a.icon === profile.avatar)?.image ? (
                                <img src={AVATARS.find(a => a.icon === profile.avatar)?.image} className="w-full h-full rounded-full object-cover z-10" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl z-10">
                                    {AVATARS.find(a => a.icon === profile.avatar)?.icon || '👤'}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex flex-col items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg z-20">
                            <span className="text-[8px] font-black uppercase leading-none opacity-80">LVL</span>
                            <span className="text-sm font-black leading-none">{stats.level}</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        {profile.name}
                        <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Edit3 size={16} className="text-indigo-500" />
                        </button>
                    </h2>

                    <div className="w-full mt-4 space-y-1.5">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seviye İlerlemesi</span>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                {stats.xp - getXPForLevel(stats.level)} / {getXPForLevel(stats.level + 1) - getXPForLevel(stats.level)} XP
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-sm"
                                style={{
                                    width: `${Math.max(0, Math.min(100, ((stats.xp - getXPForLevel(stats.level)) / (getXPForLevel(stats.level + 1) - getXPForLevel(stats.level))) * 100))}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Trophy size={20} className="text-yellow-500" /> Rozetlerim
                        </h3>
                        <span className="text-xs font-bold text-slate-400">{unlockedBadges.length}/{BADGES.length}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        {(isBadgesExpanded ? BADGES : BADGES.slice(0, 8)).map(badge => {
                            const isOwned = stats.badges.includes(badge.id);
                            return (
                                <div key={badge.id} className={`flex flex-col items-center text-center gap-1.5 transition-all ${isOwned ? 'opacity-100 scale-100' : 'opacity-20 grayscale scale-95'}`}>
                                    <div className="text-3xl filter drop-shadow-md">{badge.icon}</div>
                                    <span className="text-[8px] font-black leading-tight uppercase tracking-tighter" style={{ color: 'var(--color-text-muted)' }}>{badge.name.substring(0, 10)}</span>
                                </div>
                            );
                        })}
                        {BADGES.length > 8 && (
                            <button
                                onClick={() => setIsBadgesExpanded(!isBadgesExpanded)}
                                className="col-span-4 mt-2 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                {isBadgesExpanded ? 'Daha Az Gör' : `Hepsini Gör (${BADGES.length})`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Summary - NEW COMPACT VERSION */}
                <div className="space-y-3">
                    <h3 className="font-black text-slate-800 dark:text-white px-2">Başarı Özetim</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-3xl border border-orange-100 dark:border-orange-800 flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2">
                                <Zap size={20} className="fill-current" />
                            </div>
                            <span className="text-xl font-black text-orange-700 dark:text-orange-300">{stats.streak}</span>
                            <span className="text-[10px] font-bold text-orange-400 uppercase leading-none mt-1">GÜN</span>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                                <Star size={20} className="fill-current" />
                            </div>
                            <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{stats.xp}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase leading-none mt-1">TOPLAM XP</span>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-3xl border border-green-100 dark:border-green-800 flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 flex items-center justify-center mb-2">
                                <Trophy size={20} />
                            </div>
                            <span className="text-xl font-black text-green-700 dark:text-green-300">
                                {stats.quizCorrect + stats.quizWrong > 0
                                    ? Math.round((stats.quizCorrect / (stats.quizCorrect + stats.quizWrong)) * 100)
                                    : 0}%
                            </span>
                            <span className="text-[10px] font-bold text-green-400 uppercase leading-none mt-1">BAŞARI</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Actions */}
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={onOpenMarket} className="w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-colors text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white">Pazar Yeri</h4>
                                <p className="text-xs text-slate-500">Avatar ve çerçeve satın al</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button onClick={() => setShowStatsModal(true)} className="w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-colors text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Star size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white">İstatistikler</h4>
                                <p className="text-xs text-slate-500">Öğrenme verilerini incele</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* App Info */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KelimApp v2.0</p>
                </div>
            </div>

            {/* Modals */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white">Profili Düzenle</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full p-4 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white"
                                />
                            </div>
                            <div className="pt-2">
                                <CustomSelect
                                    options={gradeOptions}
                                    value={profile.grade}
                                    onChange={(val) => setProfile({ ...profile, grade: val })}
                                    label="Sınıf / Seviye"
                                    icon={<GraduationCap size={18} />}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">Vazgeç</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                                    {isSaving ? '...' : <><CheckCircle size={18} /> Kaydet</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAvatarModal && (
                <AvatarModal
                    onClose={() => setShowAvatarModal(false)}
                    userStats={stats}
                    onUpdate={() => {
                        setProfile(getUserProfile());
                        if (onProfileUpdate) onProfileUpdate();
                    }}
                />
            )}

            {showStatsModal && (
                <StatsModal
                    onClose={() => setShowStatsModal(false)}
                    currentGrade={profile.grade as any}
                />
            )}
        </div>
    );
};

export default Profile;
