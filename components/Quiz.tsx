
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { CheckCircle, XCircle, Bookmark, Info, Lightbulb } from 'lucide-react';
import { updateStats, handleQuizResult, addToMemorized, getMemorizedSet, removeFromMemorized, updateQuestProgress } from '../services/userService';
import { playSound } from '../services/soundService';
import Mascot from './Mascot';

interface QuizProps {
  words: WordCard[];
  allWords?: WordCard[];
  onRestart: () => void;
  onBack: () => void;
  onHome: () => void;
  isBookmarkQuiz?: boolean;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  onBadgeUnlock?: (badge: Badge) => void;
  grade?: GradeLevel | null;
}

const Quiz: React.FC<QuizProps> = ({ words, allWords, onRestart, onBack, onHome, isBookmarkQuiz, onCelebrate, onBadgeUnlock, grade }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoBookmarked, setAutoBookmarked] = useState(false);
  const [addedToMemorized, setAddedToMemorized] = useState(false);
  
  // Hint System
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [isHintUsed, setIsHintUsed] = useState(false);
  
  // Mascot State
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'sad' | 'thinking'>('thinking');
  const [mascotMessage, setMascotMessage] = useState<string | undefined>(undefined);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate initial hints based on question count (e.g., ~1 hint per 10 questions)
  useEffect(() => {
      const calculatedHints = Math.ceil(words.length / 10);
      setHintsRemaining(calculatedHints);
  }, [words.length]);

  const questions = useMemo(() => {
    if (!words || words.length === 0) return [];
    const distractorPool = (allWords && allWords.length > 3) ? allWords : words;

    return words.map((word) => {
      // SMART DISTRACTOR LOGIC:
      // 1. Try to find words with the same context/category first
      const sameContextWords = distractorPool.filter(w => 
          w.english !== word.english && 
          w.turkish.trim().toLowerCase() !== word.turkish.trim().toLowerCase() &&
          w.context === word.context
      );

      // 2. If not enough context matches, use random words
      const otherWords = distractorPool.filter(w => 
        w.english !== word.english && 
        w.turkish.trim().toLowerCase() !== word.turkish.trim().toLowerCase() &&
        w.context !== word.context
      );

      const selectedDistractors: WordCard[] = [];
      const seenMeanings = new Set<string>();
      seenMeanings.add(word.turkish.trim().toLowerCase());

      // Helper to add unique distractors
      const addDistractor = (pool: WordCard[]) => {
          const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
          for (const d of shuffledPool) {
              if (selectedDistractors.length >= 3) break;
              const meaning = d.turkish.trim().toLowerCase();
              if (!seenMeanings.has(meaning)) {
                  selectedDistractors.push(d);
                  seenMeanings.add(meaning);
              }
          }
      };

      // First fill with same context
      addDistractor(sameContextWords);
      
      // If we still need more, fill with others
      if (selectedDistractors.length < 3) {
          addDistractor(otherWords);
      }

      // Fallback if still not enough (rare, but possible in very small sets)
      if (selectedDistractors.length < 3 && words.length > 3) {
         const remaining = words.filter(w => !seenMeanings.has(w.turkish.trim().toLowerCase()) && w.english !== word.english);
         addDistractor(remaining);
      }
      
      const optionsRaw = [word, ...selectedDistractors];

      const options = optionsRaw
        .map((w) => ({ text: w.turkish, isCorrect: w.english === word.english }))
        .sort(() => 0.5 - Math.random());

      return {
        wordObj: word,
        word: word.english,
        correctAnswer: word.turkish,
        options,
        explanation: word.context
      };
    });
  }, [words, allWords]);

  const getUniqueId = (word: WordCard) => word.unitId ? `${word.unitId}|${word.english}` : word.english;

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const useHint = () => {
      if (hintsRemaining > 0 && !isHintUsed && !isAnswered) {
          setHintsRemaining(prev => prev - 1);
          setIsHintUsed(true);
          playSound('flip');
          
          const currentQ = questions[currentQuestionIndex];
          const hiddenSentence = currentQ.wordObj.exampleEng.replace(new RegExp(currentQ.word, 'gi'), '______');
          
          setMascotMessage(`İpucu (${currentQ.wordObj.context}): "${hiddenSentence}"`);
      }
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = questions[currentQuestionIndex].options[index].isCorrect;
    const wordId = getUniqueId(questions[currentQuestionIndex].wordObj);
    
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (isCorrect) {
        playSound('correct');
        setMascotMood('happy');
        setMascotMessage('Harika! Doğru bildin.');
        const newBadges = updateStats('quiz_correct', grade);
        if (newBadges.length > 0 && onBadgeUnlock) {
            newBadges.forEach(b => onBadgeUnlock(b));
        }
        
        const memorizedSet = getMemorizedSet();
        if (!memorizedSet.has(wordId)) {
             try {
                 const savedBookmarks = localStorage.getItem('lgs_bookmarks');
                 if (savedBookmarks) {
                     const bookmarkSet = new Set(JSON.parse(savedBookmarks));
                     if (bookmarkSet.has(wordId)) {
                         bookmarkSet.delete(wordId);
                         localStorage.setItem('lgs_bookmarks', JSON.stringify([...bookmarkSet]));
                     }
                 }
             } catch (e) {}

             addToMemorized(wordId);
             setAddedToMemorized(true);
        }

    } else {
        playSound('wrong');
        setMascotMood('sad');
        setMascotMessage(`Üzgünüm. Doğru cevap: ${questions[currentQuestionIndex].correctAnswer}`);
        updateStats('quiz_wrong', grade);
        
        try {
            const savedBookmarks = localStorage.getItem('lgs_bookmarks');
            const bookmarkSet = savedBookmarks ? new Set(JSON.parse(savedBookmarks)) : new Set();
            if (!bookmarkSet.has(wordId)) {
                const memorizedSet = getMemorizedSet();
                if (memorizedSet.has(wordId)) {
                     removeFromMemorized(wordId);
                }
                
                bookmarkSet.add(wordId);
                localStorage.setItem('lgs_bookmarks', JSON.stringify([...bookmarkSet]));
                setAutoBookmarked(true);
            }
        } catch (e) {}
    }

    handleQuizResult(wordId, isCorrect);

    // Wait time is now same for both correct and wrong answers to allow reading feedback
    const delay = 2500; 
    timerRef.current = setTimeout(() => {
        handleNext(newScore);
    }, delay);
  };

  const handleNext = (currentScoreValue?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const actualScore = currentScoreValue !== undefined ? currentScoreValue : score;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAutoBookmarked(false);
      setAddedToMemorized(false);
      setIsHintUsed(false); // Reset hint usage for next question
      setMascotMood('thinking');
      setMascotMessage(undefined);
    } else {
      playSound('success');
      setShowResults(true);
      
      const percentage = Math.round((actualScore / questions.length) * 100);
      
      updateQuestProgress('finish_quiz', 1);
      if (percentage === 100) {
         updateQuestProgress('perfect_quiz', 1);
         const newBadges = updateStats('perfect_quiz', grade, undefined, questions.length);
         if (newBadges.length > 0 && onBadgeUnlock) {
              newBadges.forEach(b => onBadgeUnlock(b));
         }
      }
      
      if (percentage >= 70 && onCelebrate) {
          onCelebrate(percentage === 100 ? "Mükemmel!" : "Tebrikler!", 'quiz');
      }
    }
  };

  if (!questions.length) return <div className="p-10 text-center text-slate-500">Soru bulunamadı.</div>;

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full border border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl font-black mb-2 dark:text-white">Quiz Bitti!</h2>
          <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 my-8">{score}<span className="text-3xl text-slate-300 font-bold">/{questions.length}</span></div>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg">Başarı Oranı: <span className="font-bold text-indigo-600 dark:text-indigo-400">% {percentage}</span></p>
          
           {/* Result Mascot */}
           <div className="mb-6 flex justify-center">
              <Mascot mood={percentage >= 70 ? 'happy' : 'sad'} size={100} message={percentage >= 70 ? 'Harika iş! Böyle devam et.' : 'Biraz daha çalışmalısın. Pes etmek yok!'} />
           </div>

          <div className="flex flex-col gap-4">
             <button onClick={onRestart} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-transform">Tekrar Çöz</button>
             <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-transform">Üniteye Dön</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col h-full justify-center">
       
       <div className="flex justify-between items-center mb-4">
         <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 shadow-sm">
            {currentQuestionIndex + 1}
         </div>
         <div className="flex-1 mx-5 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
         </div>
         <div className="text-sm font-bold text-slate-400">{questions.length}</div>
      </div>

      <div className="flex justify-center mb-2 relative" style={{minHeight: '120px'}}>
          <Mascot mood={mascotMood} size={120} message={mascotMessage} />
          
          {/* Hint Button near Mascot */}
          <button 
            onClick={useHint} 
            disabled={isAnswered || hintsRemaining === 0 || isHintUsed}
            className={`absolute bottom-0 right-0 sm:right-10 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow-sm border transition-all
                ${isAnswered || hintsRemaining === 0 || isHintUsed 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-50 cursor-not-allowed' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 active:scale-95 cursor-pointer'
                }`}
          >
             <Lightbulb size={16} className={hintsRemaining > 0 && !isHintUsed ? "fill-yellow-500 text-yellow-500" : ""} />
             <span>İpucu ({hintsRemaining})</span>
          </button>
      </div>

      <div className="flex-grow flex flex-col justify-center mb-8 mt-4">
         <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 relative">
             <h2 className="text-3xl sm:text-5xl font-black text-center text-slate-800 dark:text-white leading-tight break-words">
                {currentQuestion.word}
             </h2>
             {autoBookmarked && (
                 <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 py-1 px-3 rounded-full w-fit mx-auto">
                     <Bookmark size={14} className="fill-current"/> 
                     <span className="text-xs font-bold">Favorilere eklendi</span>
                 </div>
             )}
             {addedToMemorized && (
                 <div className="mt-3 flex items-center justify-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 py-1 px-3 rounded-full w-fit mx-auto">
                     <CheckCircle size={14} /> 
                     <span className="text-xs font-bold">Ezberlenenlere eklendi</span>
                 </div>
             )}
         </div>
         
         <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
                let style = "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-indigo-800";
                if (isAnswered) {
                    if (option.isCorrect) style = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                    else if (selectedOption === index) style = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                    else style = "opacity-40 border-transparent";
                }
                return (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        disabled={isAnswered}
                        className={`p-4 sm:p-5 rounded-2xl text-base sm:text-lg font-bold transition-all active:scale-[0.99] shadow-sm text-left flex items-center justify-between ${style}`}
                    >
                        <span>{option.text}</span>
                        {isAnswered && option.isCorrect && <CheckCircle size={24} />}
                        {isAnswered && selectedOption === index && !option.isCorrect && <XCircle size={24} />}
                    </button>
                );
            })}
         </div>

         {isAnswered && currentQuestion.explanation && (
             <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-sm text-blue-800 dark:text-blue-200 flex gap-3 items-start animate-in slide-in-from-bottom-2">
                 <Info size={20} className="shrink-0 mt-0.5" />
                 <p className="font-medium leading-relaxed">
                     <strong>Bağlam:</strong> {currentQuestion.explanation} <br/>
                     <strong>Örnek:</strong> {currentQuestion.wordObj.exampleEng}
                 </p>
             </div>
         )}
      </div>
      
      {isAnswered && (
          <button onClick={() => handleNext()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-transform mb-4 animate-in slide-in-from-bottom-4 text-lg">
              {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
          </button>
      )}
    </div>
  );
};

export default Quiz;
