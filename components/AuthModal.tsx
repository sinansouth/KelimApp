
import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Lock, User, Check, GraduationCap, Mail, HelpCircle } from 'lucide-react';
import { loginUser, registerUser, resetUserPassword, getUserData, syncLocalToCloud, getAuthInstance, signInWithGoogle } from '../services/supabase';
import { getUserProfile, getUserStats, clearLocalUserData, overwriteLocalWithCloud, saveUserProfile } from '../services/userService';
import CustomSelect from './CustomSelect';
import DataConflictModal from './DataConflictModal';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, initialView = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialView);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [grade, setGrade] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Conflict State
    const [conflictData, setConflictData] = useState<any>(null);

    useEffect(() => {
        setMode(initialView);
    }, [initialView]);

    // Options for CustomSelect
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (mode === 'register') {
                if (!name || !email || !password || !grade) {
                    setError("Lütfen tüm alanları doldur.");
                    setLoading(false);
                    return;
                }
                await registerUser(name, email, password, grade);
                // Local state should already be updated by registerUser logic in userService.ts
                onSuccess();
            } else if (mode === 'login') {
                await loginUser(email || name, password, rememberMe);

                // After login success, check for conflict or sync
                const auth = getAuthInstance();
                const user = await auth.currentUser;

                if (user) {
                    try {
                        const cloudData = await getUserData(user.id);
                        const localStats = getUserStats();

                        // If local data exists and is significant (e.g. gained XP as guest)
                        // and differs from cloud, ask user.
                        // Simplified check: If local XP > 0 and different from cloud XP
                        const localXP = localStats.xp;
                        const cloudXP = cloudData?.stats?.xp || 0;

                        const isGuestProfile = getUserProfile().isGuest;

                        if (isGuestProfile && localXP > 0 && Math.abs(localXP - cloudXP) > 10) {
                            // Conflict!
                            setConflictData({
                                local: { xp: localXP, level: localStats.level },
                                cloud: { xp: cloudXP, level: cloudData?.stats?.level || 1 },
                                fullCloudData: cloudData,
                                user: user
                            });
                            setLoading(false);
                            return;
                        } else {
                            // No significant conflict, just overwrite local with cloud to be safe
                            // OR if cloud is empty, sync local to cloud (handled in App.tsx generally)
                            if (cloudData) {
                                overwriteLocalWithCloud(cloudData);
                            }
                            onSuccess();
                        }
                    } catch (syncError) {
                        console.error("Sync error during login:", syncError);
                        // Even if sync fails, let the user in
                        onSuccess();
                    }
                } else {
                    onSuccess();
                }
            } else if (mode === 'forgot') {
                await resetUserPassword(email);
                setSuccessMsg("Şifre sıfırlama bağlantısı e-postana gönderildi.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("email already in use")) setError("Bu e-posta zaten kullanımda.");
            else if (err.message.includes("wrong-password") || err.message.includes("user-not-found") || err.message.includes("invalid-credential")) setError("Hatalı kullanıcı adı veya şifre.");
            else setError(err.message || "Bir hata oluştu.");
        } finally {
            if (!conflictData) setLoading(false);
        }

    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            // Redirect will happen, no need to handle success here immediately
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Google ile giriş yapılamadı.");
            setLoading(false);
        }
    };

    const handleResolveConflict = async (choice: 'local' | 'cloud') => {
        if (!conflictData) return;

        setLoading(true);

        try {
            if (choice === 'local') {
                // Push local data to cloud
                // We need to update the profile with the logged in user's ID but keep stats
                // Just calling syncLocalToCloud should work as it takes local and pushes to current authenticated user
                await syncLocalToCloud(conflictData.user.id);

                // Also update local profile to not be guest anymore
                const localProfile = getUserProfile();
                const newProfile = {
                    ...localProfile,
                    isGuest: false,
                    name: conflictData.fullCloudData.profile.name || localProfile.name, // Use cloud name usually
                    friendCode: conflictData.fullCloudData.profile.friend_code || localProfile.friendCode
                };
                saveUserProfile(newProfile);

            } else {
                // Pull cloud data to local
                overwriteLocalWithCloud(conflictData.fullCloudData);
            }

            onSuccess();
        } catch (e: any) {
            setError("Veri eşitleme hatası: " + e.message);
        } finally {
            setLoading(false);
            setConflictData(null);
        }
    };

    if (conflictData) {
        return (
            <DataConflictModal
                localXP={conflictData.local.xp}
                localLevel={conflictData.local.level}
                cloudXP={conflictData.cloud.xp}
                cloudLevel={conflictData.cloud.level}
                onChooseLocal={() => handleResolveConflict('local')}
                onChooseCloud={() => handleResolveConflict('cloud')}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                <div className="relative bg-indigo-600 p-6 flex flex-col items-center text-center text-white shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-3 shadow-lg">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-black">
                        {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Şifre Sıfırla'}
                    </h2>
                    <p className="text-indigo-100 text-xs font-medium mt-1">
                        {mode === 'login' ? 'Kaldığın yerden devam et.' : mode === 'register' ? 'Aramıza katıl!' : 'E-postanı gir.'}
                    </p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {mode === 'register' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Adın Soyadın / Kullanıcı Adı</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>
                            </div>
                        )}

                        {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                                    {mode === 'login' ? 'E-posta veya Kullanıcı Adı' : 'E-posta'}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder={mode === 'login' ? 'E-posta veya Kullanıcı Adı' : 'ornek@email.com'}
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'register' && (
                            <div className="space-y-1">
                                <CustomSelect
                                    options={gradeOptions}
                                    value={grade}
                                    onChange={setGrade}
                                    label="Sınıf / Seviye"
                                    icon={<GraduationCap size={18} />}
                                />
                            </div>
                        )}

                        {(mode === 'login' || mode === 'register') && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                    Beni Hatırla
                                </label>
                                <button type="button" onClick={() => setMode('forgot')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Şifremi Unuttum?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-2">
                                <HelpCircle size={16} /> {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-2">
                                <Check size={16} /> {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Gönder'
                            )}
                        </button>

                        {mode === 'login' && (
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">veya</span>
                                </div>
                            </div>
                        )}



                        {(mode === 'login' || mode === 'register') && (
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {mode === 'login' ? 'Google ile Giriş Yap' : 'Google ile Kayıt Ol'}
                            </button>
                        )}

                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        {mode === 'login' ? (
                            <p>Hesabın yok mu? <button onClick={() => setMode('register')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Hemen Kayıt Ol</button></p>
                        ) : (
                            <p>Zaten hesabın var mı? <button onClick={() => setMode('login')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Giriş Yap</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
