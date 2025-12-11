
import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Lock, User, Check, GraduationCap, Ghost, Mail, HelpCircle } from 'lucide-react';
import { loginUser, registerUser, resetUserPassword, getUserData, syncLocalToCloud, getAuthInstance } from '../services/supabase';
import { createGuestProfile, getUserProfile, getUserStats, clearLocalUserData, overwriteLocalWithCloud, saveUserProfile } from '../services/userService';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
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
