import React from 'react';
import { Brain, Calendar, CheckCircle, X, BookOpen } from 'lucide-react';

interface SRSInfoModalProps {
  onClose: () => void;
}

const SRSInfoModal: React.FC<SRSInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
        
        <div className="bg-indigo-600 p-6 relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600">
                    <Brain size={20} />
                </div>
                <h2 className="text-xl font-black text-white">Akıllı Tekrar Sistemi</h2>
            </div>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
                Şu an tekrar edilecek kelimen yok. Harika gidiyorsun!
            </p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold mb-4" style={{color: 'var(--color-text-main)'}}>Nasıl Çalışır?</h3>
            
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-indigo-500" style={{backgroundColor: 'var(--color-bg-main)'}}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>1. Başlangıç</h4>
                        <p className="text-xs mt-1" style={{color: 'var(--color-text-muted)'}}>
                            "Kelime Çalış" modunda kartların arkasını çevirdiğin her kelime sisteme eklenir.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-green-500" style={{backgroundColor: 'var(--color-bg-main)'}}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>2. Aralıklı Tekrar</h4>
                        <p className="text-xs mt-1" style={{color: 'var(--color-text-muted)'}}>
                            Kelimeleri unutmaya başlamadan hemen önce sana sorarız. Doğru bildikçe aralık uzar:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {['1 Gün', '3 Gün', '1 Hafta', '2 Hafta', '1 Ay'].map((t, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-orange-500" style={{backgroundColor: 'var(--color-bg-main)'}}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm" style={{color: 'var(--color-text-main)'}}>3. Kalıcı Hafıza</h4>
                        <p className="text-xs mt-1" style={{color: 'var(--color-text-muted)'}}>
                            Bir kelimeyi 5 kez üst üste doğru zamanlarda hatırlarsan, o artık kalıcı hafızandadır!
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium text-center">
                    İpucu: Tekrar etmen gereken kelimeleri uzun süre tekrar etmezsen ilk kutuya döner. Günlük tekrarlarını her gün kontrol etmeyi unutma.
                </p>
            </div>
        </div>
        
        <div className="p-4 border-t" style={{borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)'}}>
            <button 
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors active:scale-[0.98]"
            >
                Anlaşıldı
            </button>
        </div>

      </div>
    </div>
  );
};

export default SRSInfoModal;