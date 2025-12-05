
import React from 'react';
import { Ghost, LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onRegister, onGuest }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-300">
        
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-900/20 pointer-events-none"></div>
             
             <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-6 animate-bounce-subtle overflow-hidden bg-white dark:bg-slate-800">
                 <img 
                    src="https://8upload.com/image/4864223e0a7b82f8/AppLogo.png" 
                    alt="KelimApp Logo" 
                    className="w-full h-full object-cover"
                 />
             </div>
             
             <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                 Kelim<span className="text-indigo-600">App</span>
             </h1>
             
             <p className="text-slate-600 dark:text-slate-300 font-medium max-w-xs leading-relaxed">
                 Eğlenceli oyunlar ve akıllı tekrar sistemiyle İngilizce kelimeleri kalıcı olarak öğren.
             </p>
        </div>

        {/* Actions */}
        <div className="p-6 pb-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
            
            <div className="flex gap-3 mb-4">
                 <button 
                    onClick={onLogin}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                 >
                     <LogIn size={20} /> Giriş Yap
                 </button>
                 <button 
                    onClick={onRegister}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all hover:bg-indigo-700 flex items-center justify-center gap-2"
                 >
                     <UserPlus size={20} /> Kayıt Ol
                 </button>
            </div>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-900 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">veya</span>
                </div>
            </div>

            <button 
                onClick={onGuest}
                className="w-full py-4 mt-4 text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-slate-800 dark:hover:text-white transition-colors group"
            >
                <Ghost size={18} className="group-hover:scale-110 transition-transform" /> Misafir Olarak Başla <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
            </button>
            
        </div>
    </div>
  );
};

export default WelcomeScreen;