
import React, { useState } from 'react';
import { Target, Play, X, Clock } from 'lucide-react';
import { QuizDifficulty } from '../types';

interface QuizSetupModalProps {
  onClose: () => void;
  onStart: (count: number, difficulty: QuizDifficulty) => void;
  totalWords: number;
  title: string;
}

const QuizSetupModal: React.FC<QuizSetupModalProps> = ({ onClose, onStart, totalWords, title }) => {
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('normal');

  const countOptions = [10, 25, 50, -1]; // -1 represents 'ALL'
  
  const difficultyOptions: { id: QuizDifficulty, label: string, time: string, color: string }[] = [
      { id: 'relaxed', label: 'Rahat', time: '30 sn', color: 'text-blue-500 bg-blue-100 border-blue-200' },
      { id: 'easy', label: 'Kolay', time: '20 sn', color: 'text-green-500 bg-green-100 border-green-200' },
      { id: 'normal', label: 'Normal', time: '15 sn', color: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
      { id: 'hard', label: 'Zor', time: '10 sn', color: 'text-orange-500 bg-orange-100 border-orange-200' },
      { id: 'impossible', label: 'İmkansız', time: '5 sn', color: 'text-red-500 bg-red-100 border-red-200' },
  ];

  const handleStart = () => {
      onStart(selectedCount, selectedDifficulty);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900" style={{borderColor: 'var(--color-border)'}}>
        
        <div className="bg-indigo-600 p-6 text-center relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
            </button>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-3 shadow-lg">
                <Target size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-1">Quiz Hazırlığı</h2>
            <p className="text-indigo-100 text-sm truncate px-4">{title}</p>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Question Count Selection */}
            <div>
                <p className="text-center mb-3 font-bold text-sm text-slate-700 dark:text-slate-300">
                    Soru Sayısı
                    <span className="block text-[10px] font-normal opacity-70">(Toplam {totalWords} kelime)</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {countOptions.map((opt) => {
                        const label = opt === -1 ? "TÜMÜ" : opt.toString();
                        const isDisabled = opt !== -1 && opt > totalWords;
                        const isSelected = selectedCount === opt;
                        
                        return (
                            <button
                                key={opt}
                                onClick={() => setSelectedCount(opt)}
                                disabled={isDisabled}
                                className={`p-2 rounded-xl border-2 font-bold text-sm transition-all
                                    ${isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}
                                    ${isSelected 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Difficulty Selection */}
            <div>
                 <p className="text-center mb-3 font-bold text-sm text-slate-700 dark:text-slate-300">
                    Zorluk Seviyesi
                </p>
                <div className="grid grid-cols-1 gap-2">
                    {difficultyOptions.map((diff) => (
                        <button
                            key={diff.id}
                            onClick={() => setSelectedDifficulty(diff.id)}
                            className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all
                                ${selectedCount !== -1 && selectedCount > totalWords ? 'opacity-50' : ''}
                                ${selectedDifficulty === diff.id 
                                    ? `${diff.color} border-current ring-1 ring-current dark:bg-opacity-20` 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            <span className="font-bold text-sm">{diff.label}</span>
                            <div className="flex items-center gap-1 text-xs font-medium opacity-80">
                                <Clock size={14} /> {diff.time}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleStart}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
                <Play size={20} fill="currentColor" /> Başla
            </button>

        </div>
      </div>
    </div>
  );
};

export default QuizSetupModal;
