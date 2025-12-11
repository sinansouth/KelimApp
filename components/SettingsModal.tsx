import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, MessageSquare, Lock, Key, ShieldCheck } from 'lucide-react';
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
            const currentProfile = getUserProfile();
            const newProfile = { ...currentProfile, isAdmin: true };
            saveUserProfile(newProfile);

            setIsAdminUser(true);

            const auth = getAuthInstance();
            const currentUser = await auth.currentUser;
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-xs rounded-3xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}
            >
                <div className="flex items-center justify-between p-5 border-b shrink-0" style={{borderColor: 'var(--color-border)'}}>
                    <h2 className="text-xl font-black" style={{color: 'var(--color-text-main)'}}>Ayarlar</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{color: 'var(--color-text-muted)'}}>
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.soundEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </div>
                            <span className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Ses Efektleri</span>
                        </div>
                        <button 
                            onClick={toggleSound}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Feedback */}
                    <button onClick={() => { onClose(); onOpenFeedback(); }} className="w-full p-3 rounded-2xl border flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left" style={{borderColor: 'var(--color-border)'}}>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>Geri Bildirim</div>
                            <div className="text-[10px]" style={{color: 'var(--color-text-muted)'}}>Öneri veya hata bildir</div>
                        </div>
                    </button>

                    {/* Admin Panel Access */}
                    {isAdminUser ? (
                        <button onClick={() => { onClose(); onOpenAdmin(); }} className="w-full p-3 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-red-600 dark:text-red-400">Yönetici Paneli</div>
                                <div className="text-[10px] text-red-400 dark:text-red-300">Sistem ayarları</div>
                            </div>
                        </button>
                    ) : (
                        <div className="pt-2">
                            {showAdminInput ? (
                                <form onSubmit={handleAdminLogin} className="flex gap-2">
                                    <input 
                                        type="password" 
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Admin Şifresi"
                                        className="flex-1 p-2 text-xs border rounded-lg outline-none focus:border-indigo-500"
                                        style={{backgroundColor: 'var(--color-bg-main)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)'}}
                                        autoFocus
                                    />
                                    <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg">
                                        <Key size={16} />
                                    </button>
                                </form>
                            ) : (
                                <button onClick={() => setShowAdminInput(true)} className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto">
                                    <Lock size={12} /> Yönetici Girişi
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t text-center" style={{borderColor: 'var(--color-border)'}}>
                    <div className="text-[10px] font-bold text-indigo-500">KelimApp v{APP_CONFIG.version}</div>
                    <div className="text-[9px]" style={{color: 'var(--color-text-muted)'}}>Made by {APP_CONFIG.developer}</div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;