
import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, Check } from 'lucide-react';
import { loginUser, registerUser } from '../services/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(email, password, rememberMe);
      } else {
        if (!name) throw new Error("İsim gerekli");
        await registerUser(email, password, name);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bir hata oluştu. Lütfen bilgileri kontrol edin.");
    } finally {
      setLoading(false);
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
                {mode === 'login' ? 'Hesabına erişmek için giriş yap.' : 'İlerlemeni kaydetmek için hesap oluştur.'}
            </p>
        </div>

        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">İsim</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                placeholder="Adın Soyadın"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-posta</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>
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
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
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
