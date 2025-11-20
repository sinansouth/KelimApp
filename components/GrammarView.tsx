import React from 'react';
import { UnitDef } from './TopicSelector';
import { getGrammarForUnit } from '../data/grammarContent';
import { BookOpen, ChevronLeft, Home } from 'lucide-react';

interface GrammarViewProps {
  unit: UnitDef;
  onBack: () => void;
  onHome: () => void;
}

const GrammarView: React.FC<GrammarViewProps> = ({ unit, onBack, onHome }) => {
  const topics = getGrammarForUnit(unit.id);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 h-full flex flex-col">
      
      {/* Header Toolbar (Similar to FlashcardDeck) */}
      <div className="w-full flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <ChevronLeft size={20} />
          <span>Üniteye Dön</span>
        </button>

        {/* Unit Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800/50">
           <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
           <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">{unit.unitNo} - Gramer</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
          <BookOpen size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Konu Anlatımı</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{unit.title}</span> ünitesi için önemli gramer kuralları ve ipuçları.
        </p>
      </div>

      <div className="space-y-6 pb-12">
        {topics.map((topic, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                {index + 1}
              </span>
              {topic.title}
            </h3>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {topic.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex justify-center pb-8">
         <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            Tamamladım, Geri Dön
          </button>
      </div>

    </div>
  );
};

export default GrammarView;
