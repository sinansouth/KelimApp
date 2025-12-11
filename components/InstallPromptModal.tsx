
import React, { useState, useEffect } from 'react';
import { X, Share, Menu, PlusSquare, Smartphone, Download } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const InstallPromptModal: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Only show if NOT in a native app (Capacitor) and IS on a mobile device
    const isNative = Capacitor.isNativePlatform();
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (!isNative && isMobile && !isStandalone) {
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        setIsAndroid(/android/.test(userAgent));
        
        // Show after a short delay to let the app load
        const timer = setTimeout(() => {
            setShow(true);
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none p-4 pb-safe">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 duration-500 relative">
        
        <button 
            onClick={() => setShow(false)} 
            className="absolute top-2 right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-10"
        >
            <X size={20} />
        </button>

        <div className="p-5 flex flex-col items-center text-center">
             <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                 <Download size={28} />
             </div>
             
             <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                 Uygulamayı Yükle
             </h3>
             
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                 Daha iyi bir deneyim, tam ekran kullanımı ve hızlı erişim için KelimApp'i ana ekranına ekle.
             </p>

             <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-left">
                 {isIOS ? (
                     <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                         <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">1</span>
                             <span>Tarayıcının altındaki <Share size={16} className="inline mx-1 text-blue-500" /> <strong>Paylaş</strong> butonuna bas.</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">2</span>
                             <span>Açılan menüden <strong>"Ana Ekrana Ekle"</strong> <PlusSquare size={16} className="inline mx-1" /> seçeneğini bul.</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">3</span>
                             <span>Sağ üstteki <strong>Ekle</strong> butonuna bas.</span>
                         </div>
                     </div>
                 ) : (
                     <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">1</span>
                             <span>Tarayıcının sağ üstündeki <Menu size={16} className="inline mx-1" /> <strong>menü</strong> ikonuna tıkla.</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">2</span>
                             <span><strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> <Smartphone size={16} className="inline mx-1" /> seçeneğine bas.</span>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs">3</span>
                             <span>Onaylamak için <strong>Yükle/Ekle</strong> butonuna bas.</span>
                         </div>
                     </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptModal;
