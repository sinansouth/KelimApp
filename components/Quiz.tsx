import React, { useState, useMemo } from 'react';
import { WordCard } from '../types';
import { CheckCircle, XCircle, RefreshCcw, ArrowLeft, Bookmark, Info, BookmarkMinus } from 'lucide-react';
import { updateStats } from '../services/userService';

interface QuizProps {
  words: WordCard[];
  allWords?: WordCard[];
  onRestart: () => void;
  onBack: () => void;
  onHome: () => void;
  isBookmarkQuiz?: boolean;
}

const Quiz: React.FC<QuizProps> = ({ words, allWords, onRestart, onBack, isBookmarkQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoBookmarked, setAutoBookmarked] = useState(false);
  const [removedFromBookmarks, setRemovedFromBookmarks] = useState(false);

  // Generate questions from words
  const questions = useMemo(() => {
    if (!words || words.length === 0) return [];
    
    const distractorPool = (allWords && allWords.length > 3) ? allWords : words;

    return words.map((word) => {
      const potentialDistractors = distractorPool.filter((w) => w.english !== word.english);
      
      const distractors = potentialDistractors.length > 0 
        ? potentialDistractors.sort(() => 0.5 - Math.random()).slice(0, 3)
        : [];
      
      const optionsRaw = [word, ...distractors];
      
      const options = optionsRaw
        .map((w) => ({ text: w.turkish, isCorrect: w.english === word.english }))
        .sort(() => 0.5 - Math.random());

      return {
        word: word.english,
        correctAnswer: word.turkish,
        options,
        explanation: word.context
      };
    });
  }, [words, allWords]);

  if (!questions || questions.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Yeterli Soru Yok</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Bu ünite için quiz oluşturulacak yeterli kelime bulunamadı.
        </p>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
     return (
       <div className="flex flex-col items-center justify-center h-full">
         <p className="dark:text-white">Bir hata oluştu.</p>
         <button onClick={onBack} className="mt-4 text-indigo-600 font-bold">Geri Dön</button>
       </div>
     );
  }

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = currentQuestion.options[index].isCorrect;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      updateStats('quiz_correct');

      // Remove from bookmarks if it is a bookmark quiz
      if (isBookmarkQuiz) {
        try {
           const wordToRemove = currentQuestion.word;
           const saved = localStorage.getItem('lgs_bookmarks');
           if (saved) {
              const currentBookmarks = new Set(JSON.parse(saved));
              if (currentBookmarks.has(wordToRemove)) {
                 currentBookmarks.delete(wordToRemove);
                 localStorage.setItem('lgs_bookmarks', JSON.stringify([...currentBookmarks]));
                 setRemovedFromBookmarks(true);
              }
           }
        } catch (e) {
           console.error("Failed to remove from bookmarks", e);
        }
     }

    } else {
      updateStats('quiz_wrong');
      // Wrong answer: Automatically add to bookmarks
      try {
        const wordToAdd = currentQuestion.word;
        const saved = localStorage.getItem('lgs_bookmarks');
        const currentBookmarks = saved ? new Set(JSON.parse(saved)) : new Set<string>();
        
        if (!currentBookmarks.has(wordToAdd)) {
          currentBookmarks.add(wordToAdd);
          localStorage.setItem('lgs_bookmarks', JSON.stringify([...currentBookmarks]));
          setAutoBookmarked(true);
        }
      } catch (e) {
        console.error("Failed to auto-bookmark", e);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAutoBookmarked(false);
      setRemovedFromBookmarks(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "İyi çaba!";
    if (percentage === 100) message = "Mükemmel!";
    else if (percentage >= 80) message = "Harika iş!";
    else if (percentage >= 50) message = "Fena değil.";

    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 w-full transition-colors">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Quiz Tamamlandı!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">İşte sonuçların:</p>
          
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
             <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  className="dark:stroke-slate-800"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={percentage > 70 ? "#10b981" : "#f59e0b"}
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  className="animate-[spin_1s_ease-out_reverse]"
                />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800 dark:text-white">{score}/{questions.length}</span>
             </div>
          </div>

          <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-10">{message}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-semibold transition-colors"
            >
              <ArrowLeft size={20} /> Üniteye Dön
            </button>
            <button 
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
            >
              <RefreshCcw size={20} /> Tekrar Et
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pt-6">
       {/* Header with Status (Back/Home moved to App Header) */}
       <div className="flex justify-end items-center mb-8">
         <div className="flex flex-col text-right">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Quiz</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">Soru {currentQuestionIndex + 1} <span className="text-slate-400 dark:text-slate-600 text-sm font-medium">/ {questions.length}</span></span>
         </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-8 text-center py-4">
        <h3 className="text-indigo-500 dark:text-indigo-400 text-sm mb-3 uppercase tracking-wide font-bold">Bu kelimenin anlamı nedir?</h3>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white flex flex-col sm:flex-row items-center justify-center gap-3">
          {currentQuestion.word}
          {autoBookmarked && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold animate-in fade-in zoom-in mt-2 sm:mt-0">
               <Bookmark size={12} className="fill-yellow-700 dark:fill-yellow-400" />
               Favorilere Eklendi
            </span>
          )}
          {removedFromBookmarks && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold animate-in fade-in zoom-in mt-2 sm:mt-0">
               <BookmarkMinus size={12} className="fill-red-700 dark:fill-red-400" />
               Favorilerden Çıkarıldı
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          let buttonStyle = "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-200 shadow-sm";
          
          if (isAnswered) {
            if (option.isCorrect) {
              buttonStyle = "bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-500/50 text-green-700 dark:text-green-400 shadow-none";
            } else if (selectedOption === index) {
              buttonStyle = "bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-500/50 text-red-700 dark:text-red-400 shadow-none";
            } else {
              buttonStyle = "bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50 shadow-none";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered}
              className={`relative p-5 rounded-xl text-lg font-medium text-left transition-all duration-200 group ${buttonStyle} ${!isAnswered && 'hover:shadow-md active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${isAnswered ? 'border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-indigo-300 group-hover:text-indigo-500'}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option.text}
                </span>
                {isAnswered && option.isCorrect && <CheckCircle size={24} className="text-green-600 dark:text-green-400" />}
                {isAnswered && selectedOption === index && !option.isCorrect && <XCircle size={24} className="text-red-600 dark:text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation Section */}
      {isAnswered && currentQuestion.explanation && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2 flex gap-4 items-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300 shrink-0">
               <Info size={20} />
            </div>
            <div>
               <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Bağlam</h4>
               <p className="text-slate-700 dark:text-slate-200 font-medium">
                 {currentQuestion.explanation}
               </p>
            </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="h-20 flex items-center justify-center">
        {isAnswered && (
          <button
            onClick={handleNext}
            className="animate-in slide-in-from-bottom-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
          </button>
        )}
      </div>

    </div>
  );
};

export default Quiz;