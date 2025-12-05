import React, { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { getGlobalAnnouncements } from '../services/firebase';
import { Announcement } from '../data/announcements';

interface AnnouncementsViewProps {
  onBack: () => void;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchAnnouncements = async () => {
          try {
              const data = await getGlobalAnnouncements();
              setAnnouncements(data);
          } catch (e) {
              console.error("Failed to fetch announcements", e);
          } finally {
              setLoading(false);
          }
      };
      fetchAnnouncements();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-3xl mb-6 shadow-sm">
          <Bell size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-4">Duyurular</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg">
          Uygulama hakkında yenilikler ve önemli bilgilendirmeler.
        </p>
      </div>

      <div className="space-y-6 pb-12">
        {loading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        ) : announcements.length > 0 ? (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{ann.title}</h3>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {ann.date}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>
            ))
        ) : (
            <div className="text-center text-slate-400 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Henüz bir duyuru bulunmamaktadır.
            </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;