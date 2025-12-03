
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, User, Check, GraduationCap } from 'lucide-react';
import { loginUser, registerUser } from '../services/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !password) {
        setError("Lütfen tüm alanları doldurun.");
        return;
    }

    // Login Logic
    if (mode === 'login') {
         setLoading(true);
         try {
            await loginUser(name, password, rememberMe);
            onSuccess();
            onClose();
         } catch (err: any) {
            console.error(err);
            setError(err.message || "Giriş başarısız. Bilgilerinizi kontrol edin.");
         } finally {
            setLoading(false);
         }
         return;
    }

    // Registration Logic & Validation
    if (mode === 'register') {
        if (!grade) {
            setError("Lütfen sınıfınızı seçin.");
            return;
        }

        if (name.length < 3) {
            setError("Kullanıcı adı en az 3 karakter olmalıdır.");
            return;
        }

        // Strict Username Validation: Lowercase, English chars, Numbers, Underscore only. No spaces.
        const usernameRegex = /^[a-z0-9_]+$/;
        if (!usernameRegex.test(name)) {
            setError("Kullanıcı adı sadece küçük İngilizce harfler (a-z), rakamlar (0-9) ve alt çizgi (_) içerebilir. Boşluk veya Türkçe karakter (ç,ğ,ı,ö,ş,ü) kullanılamaz.");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            await registerUser(name, password, grade);
            onSuccess();
            onClose(); 
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Kayıt oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="relative bg-indigo-600 p-6 text-center">
           <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white mb-1">
                {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <p className="text-indigo-100 text-sm">
                {mode === 'login' ? 'Hesabına erişmek için kullanıcı adını gir.' : 'İlerlemeni kaydetmek için bir hesap oluştur.'}
            </p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kullanıcı Adı</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder={mode === 'register' ? "örn: ali_yilmaz123" : "Kullanıcı Adı"}
                            required
                            autoCapitalize="none"
                            autoCorrect="off"
                        />
                    </div>
                    {mode === 'register' && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-[10px] text-blue-600 dark:text-blue-300 leading-relaxed">
                                <strong>Dikkat:</strong> Kullanıcı adı sadece <strong>küçük harf</strong>, rakam ve alt çizgi içerebilir. Boşluk veya Türkçe karakter kullanılamaz.
                                <br/><span className="opacity-80 mt-1 block font-medium text-slate-500 dark:text-slate-400">Bu sadece giriş yaparken kullanacağın kullanıcı adı, görünecek ismini profilinden değiştirebilirsin.</span>
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Şifre</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder="******"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                {mode === 'register' && (
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Sınıf / Seviye</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none"
                                required
                            >
                                <option value="" disabled>Seçiniz</option>
                                <optgroup label="İlkokul">
                                    <option value="2">2. Sınıf</option>
                                    <option value="3">3. Sınıf</option>
                                    <option value="4">4. Sınıf</option>
                                </optgroup>
                                <optgroup label="Ortaokul">
                                    <option value="5">5. Sınıf</option>
                                    <option value="6">6. Sınıf</option>
                                    <option value="7">7. Sınıf</option>
                                    <option value="8">8. Sınıf</option>
                                </optgroup>
                                <optgroup label="Lise">
                                    <option value="9">9. Sınıf</option>
                                    <option value="10">10. Sınıf</option>
                                    <option value="11">11. Sınıf</option>
                                    <option value="12">12. Sınıf</option>
                                </optgroup>
                                <optgroup label="Genel İngilizce">
                                    <option value="A1">A1 (Başlangıç)</option>
                                    <option value="A2">A2 (Temel)</option>
                                    <option value="B1">B1 (Orta)</option>
                                    <option value="B2">B2 (Orta Üstü)</option>
                                    <option value="C1">C1 (İleri)</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                )}

                {mode === 'login' && (
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => setRememberMe(!rememberMe)}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}>
                                {rememberMe && <Check size={14} strokeWidth={3} />}
                            </div>
                            Beni Hatırla
                        </button>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? 'İşleniyor...' : (mode === 'login' ? <><LogIn size={18} /> Giriş Yap</> : <><UserPlus size={18} /> Kayıt Ol</>)}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
                    <button 
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                        className="ml-2 font-bold text-indigo-600 hover:underline"
                    >
                        {mode === 'login' ? "Kayıt Ol" : "Giriş Yap"}
                    </button>
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
