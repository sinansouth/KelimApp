
import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { sendFeedback } from '../services/supabase';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [type, setType] = useState<'bug' | 'suggestion'>('suggestion');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    try {
      await sendFeedback(type, message, contact);
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="relative bg-indigo-600 p-5 flex items-center justify-between text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
               <MessageSquare size={20} /> İletişim
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6">
            {status === 'success' ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Teşekkürler!</h3>
                    <p className="text-slate-500 mt-2">Mesajın başarıyla iletildi.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button 
                            type="button"
                            onClick={() => setType('suggestion')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'suggestion' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Öneri
                        </button>
                         <button 
                            type="button"
                            onClick={() => setType('bug')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'bug' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Hata Bildir
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Mesajınız</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white min-h-[120px] resize-none"
                            placeholder={type === 'suggestion' ? 'Uygulamayı geliştirmek için fikirlerinizi yazın...' : 'Karşılaştığınız hatayı detaylıca anlatın...'}
                            required
                        />
                    </div>

                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">İletişim (İsteğe Bağlı)</label>
                         <input 
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            placeholder="E-posta veya telefon"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                            <AlertTriangle size={18} /> Gönderilemedi. Tekrar deneyin.
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={status === 'sending' || !message.trim()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {status === 'sending' ? 'Gönderiliyor...' : 'Gönder'} <Send size={18} />
                    </button>

                </form>
            )}
        </div>

      </div>
    </div>
  );
};

export default FeedbackModal;
