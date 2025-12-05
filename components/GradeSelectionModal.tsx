
import React from 'react';
import { X, GraduationCap } from 'lucide-react';
import { GradeLevel } from '../types';

interface GradeSelectionModalProps {
  onClose: () => void;
  onSelect: (grade: GradeLevel) => void;
  grades: string[];
  title?: string;
  description?: string;
}

const GradeSelectionModal: React.FC<GradeSelectionModalProps> = ({ onClose, onSelect, grades, title, description }) => {
  // Sort grades logically
  const sortedGrades = [...grades].sort((a, b) => {
      const isNumA = !isNaN(Number(a));
      const isNumB = !isNaN(Number(b));
      if (isNumA && isNumB) return Number(a) - Number(b);
      return a.localeCompare(b);
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">{title || 'Sınıf Seç'}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">
                {description || 'Hangi sınıfın kelimelerini tekrar etmek istiyorsun?'}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
                {sortedGrades.map(g => (
                    <button 
                        key={g} 
                        onClick={() => onSelect(g as GradeLevel)}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 flex flex-col items-center justify-center gap-2 group transition-all active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <GraduationCap size={20} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{g}. Sınıf</span>
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default GradeSelectionModal;
