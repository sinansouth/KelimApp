import React from 'react';
import { BookOpen, Home, Bookmark, CheckCircle } from 'lucide-react';

interface EmptyStateWarningProps {
  type: 'bookmarks' | 'memorized';
  onStudy: () => void;
  onHome: () => void;
}

const EmptyStateWarning: React.FC<EmptyStateWarningProps> = ({ type, onStudy, onHome }) => {
  const isBookmarks = type === 'bookmarks';
  const title = isBookmarks ? "Favori Kelime Yok" : "Ezberlenen Kelime Yok";
  const message = isBookmarks
    ? "Bu ünite için henüz favorilere eklediğiniz kelime bulunmuyor. 'Kelime Çalış' modunda zorlandığınız kelimeleri favorilere ekleyerek kendinize özel testler oluşturabilirsiniz."
    : "Bu ünite için henüz 'Ezberledim' olarak işaretlediğiniz kelime bulunmuyor. Kelime kartları ile çalışırken öğrendiğiniz kelimeleri işaretleyerek ilerlemenizi takip edebilirsiniz.";

  const Icon = isBookmarks ? Bookmark : CheckCircle;
  const iconColor = isBookmarks ? "text-rose-500" : "text-green-500";
  const iconBg = isBookmarks ? "bg-rose-50 dark:bg-rose-900/20" : "bg-green-50 dark:bg-green-900/20";
  const borderColor = isBookmarks ? "border-rose-100 dark:border-rose-800" : "border-green-100 dark:border-green-800";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in zoom-in duration-300 max-w-2xl mx-auto">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 ${borderColor} ${iconBg} ${iconColor}`}>
        <Icon size={48} />
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-4">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={onStudy}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          <BookOpen size={24} />
          Kelime Çalış
        </button>
        
        <button 
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
        >
          <Home size={24} />
          Anasayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default EmptyStateWarning;