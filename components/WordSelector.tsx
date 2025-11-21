
import React, { useState, useMemo } from 'react';
import { WordCard } from '../types';
import { ChevronLeft, Search, CheckCircle, Circle, BookOpen, Target } from 'lucide-react';

interface WordSelectorProps {
  words: WordCard[];
  unitTitle: string;
  onStart: (selectedWords: WordCard[], mode: 'study' | 'quiz') => void;
  onBack: () => void;
}

const WordSelector: React.FC<WordSelectorProps> = ({ words, unitTitle, onStart, onBack }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWords = useMemo(() => {
    if (!searchTerm) return words;
    const lowerTerm = searchTerm.toLowerCase();
    return words.filter(
      (w) => 
        w.english.toLowerCase().includes(lowerTerm) || 
        w.turkish.toLowerCase().includes(lowerTerm)
    );
  }, [words, searchTerm]);

  // Helper to get original index from filtered list to manage selection correctly
  const getOriginalIndex = (filteredIndex: number) => {
    const word = filteredWords[filteredIndex];
    return words.indexOf(word);
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const toggleAll = () => {
    if (selectedIndices.size === words.length) {
      setSelectedIndices(new Set());
    } else {
      const allIndices = new Set(words.map((_, i) => i));
      setSelectedIndices(allIndices);
    }
  };

  const handleStart = (mode: 'study' | 'quiz') => {
    const selectedWords = words.filter((_, i) => selectedIndices.has(i));
    onStart(selectedWords, mode);
  };

  const selectedCount = selectedIndices.size;

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Kelime Seç</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{unitTitle}</p>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Search & Controls */}
      <div className="mb-4 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Kelime ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
        
        <div className="flex justify-between items-center">
           <button 
             onClick={toggleAll}
             className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
           >
             {selectedIndices.size === words.length ? 'Seçimleri Kaldır' : 'Tümünü Seç'}
           </button>
           <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
             {selectedCount} kelime seçildi
           </span>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-grow overflow-y-auto -mx-2 px-2 space-y-2 pb-20">
        {filteredWords.length > 0 ? (
          filteredWords.map((word, i) => {
            const originalIndex = getOriginalIndex(i);
            const isSelected = selectedIndices.has(originalIndex);
            
            return (
              <div 
                key={originalIndex}
                onClick={() => toggleSelection(originalIndex)}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {isSelected ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-slate-800 dark:text-white text-lg">{word.english}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">{word.turkish}</div>
                  {word.unitId && <div className="text-[10px] text-slate-400 dark:text-slate-600 uppercase mt-1">{word.unitId}</div>}
                </div>
              </div>
            );
          })
        ) : (
           <div className="text-center py-10 text-slate-400 dark:text-slate-500">
             Kelime bulunamadı.
           </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-10">
         <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => handleStart('study')}
              disabled={selectedCount === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
               <BookOpen size={20} /> Çalış ({selectedCount})
            </button>
            <button
              onClick={() => handleStart('quiz')}
              disabled={selectedCount < 4} // Need at least 4 for quiz distractors usually
              className="flex-1 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-white disabled:opacity-50 disabled:hover:border-indigo-100 disabled:cursor-not-allowed py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              title={selectedCount < 4 ? "Quiz için en az 4 kelime seçmelisin" : ""}
            >
               <Target size={20} /> Quiz Yap
            </button>
         </div>
      </div>
    </div>
  );
};

export default WordSelector;
