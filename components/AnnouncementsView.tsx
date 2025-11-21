
import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { ANNOUNCEMENTS } from '../data/announcements';

interface AnnouncementsViewProps {
  onBack: () => void;
}

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Toolbar */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <ChevronLeft size={20} />
          <span>Geri Dön</span>
        </button>
      </div>

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
        {ANNOUNCEMENTS.map((ann) => (
          <div key={ann.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{ann.title}</h3>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {ann.date}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              {ann.content}
            </p>
          </div>
        ))}

        {ANNOUNCEMENTS.length === 0 && (
            <div className="text-center text-slate-400 py-10">
                Henüz bir duyuru bulunmamaktadır.
            </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;
