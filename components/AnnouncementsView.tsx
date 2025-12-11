
import React, { useState, useEffect } from 'react';
import { Bell, Loader2, ArrowLeft } from 'lucide-react';
import { getAnnouncements } from '../services/contentService';
import { Announcement } from '../types';

interface AnnouncementsViewProps {
  onBack: () => void;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        const data = await getAnnouncements();
        setAnnouncements(data);
        setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full">
      
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-lg transform rotate-3"
            style={{backgroundColor: 'var(--color-bg-card)', border: '2px solid var(--color-border)', color: 'var(--color-primary)'}}
        >
          <Bell size={32} />
        </div>
        <h1 className="text-2xl font-black mb-2" style={{color: 'var(--color-text-main)'}}>Duyurular</h1>
        <p className="text-sm font-medium opacity-70 max-w-xs mx-auto" style={{color: 'var(--color-text-muted)'}}>
          Uygulama hakkında yenilikler ve önemli bilgilendirmeler.
        </p>
      </div>

      <div className="space-y-4 pb-20">
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" size={32} style={{color: 'var(--color-primary)'}} />
            </div>
        ) : announcements.length > 0 ? (
            announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="rounded-3xl p-6 border shadow-sm relative overflow-hidden group"
                style={{
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: 'var(--color-border)'
                }}
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>

                <div className="flex justify-between items-start mb-3 relative z-10">
                  <h3 className="text-lg font-bold leading-tight" style={{color: 'var(--color-text-main)'}}>{ann.title}</h3>
                  <span 
                    className="text-[10px] font-bold px-3 py-1 rounded-full border opacity-80"
                    style={{
                        backgroundColor: 'var(--color-bg-main)', 
                        color: 'var(--color-text-muted)',
                        borderColor: 'var(--color-border)'
                    }}
                  >
                    {ann.date}
                  </span>
                </div>
                <div 
                    className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap relative z-10" 
                    style={{color: 'var(--color-text-muted)'}}
                >
                  {ann.content}
                </div>
              </div>
            ))
        ) : (
            <div 
                className="text-center py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 opacity-60"
                style={{borderColor: 'var(--color-border)', color: 'var(--color-text-muted)'}}
            >
                <Bell size={32} className="opacity-50" />
                <span>Henüz bir duyuru bulunmamaktadır.</span>
            </div>
        )}
      </div>

      {/* Back Button (Floating for mobile convenience) */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-transform active:scale-95"
            style={{backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)'}}
          >
              <ArrowLeft size={18} /> Geri Dön
          </button>
      </div>
    </div>
  );
};

export default AnnouncementsView;
