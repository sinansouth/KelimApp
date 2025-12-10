

import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, MessageSquare, Lock, Key, RotateCcw, ShieldCheck } from 'lucide-react';
import { AppSettings, getAppSettings, saveAppSettings, getUserProfile, saveUserProfile } from '../services/userService';
import { APP_CONFIG } from '../config/appConfig';
import { playSound } from '../services/soundService';
import { syncLocalToCloud, getAuthInstance } from '../services/supabase';

interface SettingsModalProps {
    onClose: () => void;
    onOpenFeedback: () => void;
    onOpenAdmin: () => void;
    onRestartTutorial: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenFeedback, onOpenAdmin }) => {
    const [settings, setSettings] = useState<AppSettings>({ soundEnabled: true, theme: 'dark' });
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminUser, setIsAdminUser] = useState(false);

    useEffect(() => {
        setSettings(getAppSettings());
        const profile = getUserProfile();
        // Check both boolean true and string 'true' just in case
        setIsAdminUser(profile.isAdmin === true || String(profile.isAdmin) === 'true');
    }, []);

    const toggleSound = () => {
        const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
        setSettings(newSettings);
        saveAppSettings(newSettings);
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Access Vite environment variable via a type cast to 'any' to resolve TypeScript error.
        if (adminPassword === (import.meta as any).env.VITE_ADMIN_PASSWORD) {
            // 1. Yetkiyi yerel profile kaydet
            const currentProfile = getUserProfile();
            const newProfile = { ...currentProfile, isAdmin: true };
            saveUserProfile(newProfile);

            // 2. State'i güncelle (butonun görünmesi için)
            setIsAdminUser(true);

            // 3. Varsa buluta senkronize et (kalıcı olması için)
            const auth = getAuthInstance();
            const currentUser = await auth.currentUser; // Await the promise
            if (currentUser && !newProfile.isGuest) {
                await syncLocalToCloud(currentUser.id);
            }

            playSound('success');
            onClose();
            onOpenAdmin();

            setAdminPassword('');
            setShowAdminInput(false);
        } else {
            playSound('wrong');
            alert("Hatalı şifre!");
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white">Ayarlar</h2>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${settings.soundEnabled ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                    {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">Ses Efektleri</div>
                                </div>
                            </div>
                            <button
                                onClick={toggleSound}
                                className={`w-10 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.soundEnabled ? 'left-5' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <button
                            onClick={() => { onClose(); onOpenFeedback(); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 text-left"
                        >
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 dark:text-white text-sm">Hata veya Öneri Bildir</div>
                                <div className="text-xs text-slate-500">Görüşlerinizi bizimle paylaşın</div>
                            </div>
                        </button>

                        {isAdminUser ? (
                            <button
                                onClick={() => { onClose(); onOpenAdmin(); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95 text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <div className="font-black text-sm">Yönetici Paneli</div>
                                    <div className="text-xs text-red-100 font-medium">Sistem kontrolü</div>
                                </div>
                            </button>
                        ) : (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-800/30 text-center">
                                <p className="text-[10px] text-yellow-700 dark:text-yellow-500 font-medium">
                                    Temalar ve diğer özellikler için <strong>XP Market</strong>'i ziyaret et!
                                </p>
                            </div>
                        )}

                        {/* Admin Login Section (Only show if NOT admin already) */}
                        {!isAdminUser && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                {!showAdminInput ? (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400">v{APP_CONFIG.version}</span>
                                        <button
                                            onClick={() => setShowAdminInput(true)}
                                            className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            <Lock size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAdminLogin} className="flex gap-2 animate-in fade-in">
                                        <input
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="Yönetici Şifresi"
                                            className="flex-1 text-xs p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-red-500 outline-none"
                                            autoFocus
                                        />
                                        <button type="submit" className="p-2 bg-red-500 text-white rounded-lg">
                                            <Key size={14} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;
