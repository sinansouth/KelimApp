
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel, QuizDifficulty, Challenge } from '../types';
import { CheckCircle, XCircle, Bookmark, Info, Clock, Swords, Copy, Trophy } from 'lucide-react';
import { updateStats, handleQuizResult, handleReviewResult, addToMemorized, getMemorizedSet, removeFromMemorized, updateQuestProgress, getUserProfile } from '../services/userService';
import { playSound } from '../services/soundService';
import { createChallenge, completeChallenge } from '../services/firebase';
import Mascot from './Mascot';

interface QuizProps {
  words: WordCard[];
  allWords?: WordCard[];
  onRestart: () => void;
  onBack: () => void;
  onHome: () => void;
  isBookmarkQuiz?: boolean;
  isReviewMode?: boolean;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  onBadgeUnlock?: (badge: Badge) => void;
  grade?: GradeLevel | null;
  difficulty?: QuizDifficulty;
  
  // Challenge Props
  challengeMode?: 'create' | 'join';
  challengeData?: Challenge;
  unitIdForChallenge?: string; // To reconstruct or save reference
}

const Quiz: React.FC<QuizProps> = ({ words, allWords, onRestart, onBack, onHome, isBookmarkQuiz, isReviewMode, onCelebrate, onBadgeUnlock, grade, difficulty = 'normal', challengeMode, challengeData, unitIdForChallenge }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoBookmarked, setAutoBookmarked] = useState(false);
  const [addedToMemorized, setAddedToMemorized] = useState(false);
  
  // Challenge States
  const [createdChallengeId, setCreatedChallengeId] = useState<string | null>(null);
  const [challengeResult, setChallengeResult] = useState<'win' | 'loss' | 'tie' | null>(null);
  
  // Determine Time Limit based on Difficulty
  const getTimeLimit = (diff: QuizDifficulty) => {
      switch(diff) {
          case 'relaxed': return 30;
          case 'easy': return 20;
          case 'normal': return 15;
          case 'hard': return 10;
          case 'impossible': return 5;
          default: return 15;
      }
  };
  
  const QUESTION_TIME_LIMIT = getTimeLimit(difficulty as QuizDifficulty);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  
  // Mascot State
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'sad' | 'thinking'>('thinking');
  const [mascotMessage, setMascotMessage] = useState<React.ReactNode | undefined>(undefined);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = useMemo(() => {
    if (!words || words.length === 0) return [];
    const distractorPool = (allWords && allWords.length > 3) ? allWords : words;

    return words.map((word) => {
      const sameContextWords = distractorPool.filter(w => 
          w.english !== word.english && 
          w.turkish.trim().toLowerCase() !== word.turkish.trim().toLowerCase() &&
          w.context === word.context
      );

      const otherWords = distractorPool.filter(w => 
        w.english !== word.english && 
        w.turkish.trim().toLowerCase() !== word.turkish.trim().toLowerCase() &&
        w.context !== word.context
      );

      const selectedDistractors: WordCard[] = [];
      const seenMeanings = new Set<string>();
      seenMeanings.add(word.turkish.trim().toLowerCase());

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

      addDistractor(sameContextWords);
      
      if (selectedDistractors.length < 3) {
          addDistractor(otherWords);
      }

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

  // Helper to highlight the target word (and its forms) in the example sentence
  const getHighlightedSentence = (sentence: string, targetWord: string) => {
      if (!sentence || !targetWord) return <span>{sentence}</span>;

      // Clean punctuation from target word just in case
      const cleanTarget = targetWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      // Break target phrase into words (e.g., "back up" -> ["back", "up"])
      const stems = cleanTarget.trim().split(/\s+/);
      
      // Create a regex that matches any of these words, followed by optional alphabetical characters (suffixes like -ing, -s, -ed)
      // The pattern looks like: \b(back|up)[a-z]*\b
      const patternString = `(\\b(?:${stems.join('|')})[a-z]*\\b)`;
      const pattern = new RegExp(patternString, 'gi');

      const parts = sentence.split(pattern);

      return (
          <span>
              "{parts.map((part, i) => {
                  // Check if this part matches our target pattern
                  if (pattern.test(part)) {
                      return (
                          <span key={i} className="text-indigo-600 dark:text-indigo-400 font-black border-b-2 border-indigo-400">
                              {part}
                          </span>
                      );
                  }
                  return <span key={i}>{part}</span>;
              })}"
          </span>
      );
  };

  useEffect(() => {
    if (questions[currentQuestionIndex] && !isAnswered) {
        const currentQ = questions[currentQuestionIndex];
        
        setMascotMessage(getHighlightedSentence(currentQ.wordObj.exampleEng, currentQ.word));
        setMascotMood('thinking');
        
        // Reset and Start Timer
        setTimeLeft(QUESTION_TIME_LIMIT);
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
        
        questionTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Time is up!
                    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
                    handleOptionClick(-1); // Trigger wrong answer (-1 is invalid index)
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
  }, [currentQuestionIndex, questions, isAnswered, QUESTION_TIME_LIMIT]);

  useEffect(() => {
    return () => { 
        if (timerRef.current) clearTimeout(timerRef.current);
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, []);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    setIsAnswered(true);
    setSelectedOption(index);

    // -1 means Time's Up (treated as wrong)
    const isTimeUp = index === -1;
    const isCorrect = !isTimeUp && questions[currentQuestionIndex].options[index].isCorrect;
    const wordId = getUniqueId(questions[currentQuestionIndex].wordObj);
    
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (!isTimeUp && navigator.vibrate) navigator.vibrate(isCorrect ? 50 : 200);

    if (isCorrect) {
        playSound('correct');
        setMascotMood('happy');
        setMascotMessage('Harika! Doğru bildin.');
        
        if (isReviewMode) {
            handleReviewResult(wordId, true);
            updateStats('review_remember', grade, wordId);
        } else if (!challengeMode) {
            const newBadges = updateStats('quiz_correct', grade);
            if (newBadges.length > 0 && onBadgeUnlock) {
                newBadges.forEach(b => onBadgeUnlock(b));
            }
            handleQuizResult(wordId, true);

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
        }

    } else {
        playSound('wrong');
        setMascotMood('sad');
        if (isTimeUp) {
            setMascotMessage(`Süre doldu! Doğru cevap: ${questions[currentQuestionIndex].correctAnswer}`);
        } else {
            setMascotMessage(`Üzgünüm. Doğru cevap: ${questions[currentQuestionIndex].correctAnswer}`);
        }
        
        if (isReviewMode) {
             handleReviewResult(wordId, false); 
             updateStats('review_forgot', grade, wordId);
        } else if (!challengeMode) {
             updateStats('quiz_wrong', grade);
             handleQuizResult(wordId, false);

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
    }

    const delay = 2500; 
    timerRef.current = setTimeout(() => {
        handleNext(newScore);
    }, delay);
  };

  const handleNext = async (currentScoreValue?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const actualScore = currentScoreValue !== undefined ? currentScoreValue : score;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAutoBookmarked(false);
      setAddedToMemorized(false);
    } else {
      playSound('success');
      setShowResults(true);
      
      const percentage = Math.round((actualScore / questions.length) * 100);
      
      // HANDLE CHALLENGE COMPLETION
      if (challengeMode === 'create') {
           // Map current words back to indices in ALL_WORDS (requires passing a huge list or just storing specific IDs)
           // Simplification: We need to store sufficient info to reconstruct this quiz.
           // Since we passed specific `words` to this component, we can just find their indices in the full VOCABULARY.
           // For optimization, let's assume `allWords` was passed correctly containing these words.
           if (allWords && unitIdForChallenge) {
                const wordIndices = words.map(w => allWords.findIndex(aw => aw.english === w.english && aw.unitId === w.unitId));
                const user = getUserProfile();
                
                // Calculate score based on percentage (0-100) for simplicity in comparison
                const finalScore = percentage;
                
                try {
                    const id = await createChallenge(user.name, finalScore, wordIndices, unitIdForChallenge, difficulty);
                    setCreatedChallengeId(id);
                } catch (e) {
                    console.error("Error creating challenge", e);
                }
           }
      } else if (challengeMode === 'join' && challengeData) {
          const myScore = percentage;
          const oppScore = challengeData.creatorScore;
          const user = getUserProfile();
          
          await completeChallenge(challengeData.id, user.name, myScore);
          
          if (myScore > oppScore) setChallengeResult('win');
          else if (myScore < oppScore) setChallengeResult('loss');
          else setChallengeResult('tie');
      }
      
      if (!isReviewMode && !challengeMode) {
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
      } else if (isReviewMode) {
          if (onCelebrate) onCelebrate("Günlük tekrar tamamlandı!", 'goal');
      }
    }
  };

  const copyCode = () => {
      if (createdChallengeId) {
          navigator.clipboard.writeText(createdChallengeId);
          alert("Kopyalandı!");
      }
  };

  if (!questions.length) return <div className="p-10 text-center text-slate-500">Soru bulunamadı.</div>;

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    if (challengeMode === 'create') {
        return (
             <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full border-2 border-orange-400 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-2 bg-orange-400"></div>
                     
                     <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                         <Swords size={40} />
                     </div>
                     
                     <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Düello Hazır!</h2>
                     <p className="text-slate-500 text-sm mb-6">Skorun: <span className="font-bold text-indigo-500">% {percentage}</span></p>
                     
                     {createdChallengeId ? (
                         <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 mb-6">
                             <p className="text-xs text-slate-500 uppercase font-bold mb-2">Düello Kodu</p>
                             <div className="flex items-center justify-center gap-3">
                                 <span className="text-3xl font-black tracking-widest text-slate-800 dark:text-white">{createdChallengeId}</span>
                                 <button onClick={copyCode} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:scale-105 transition-transform">
                                     <Copy size={20} className="text-slate-600 dark:text-slate-300" />
                                 </button>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2">Bu kodu arkadaşına gönder!</p>
                         </div>
                     ) : (
                         <div className="mb-6 text-slate-400 text-sm animate-pulse">Kod oluşturuluyor...</div>
                     )}

                     <button onClick={onHome} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Ana Menüye Dön</button>
                </div>
             </div>
        )
    }

    if (challengeMode === 'join' && challengeData) {
        return (
             <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full border-4 ${challengeResult === 'win' ? 'border-green-500' : challengeResult === 'loss' ? 'border-red-500' : 'border-yellow-500'}`}>
                     
                     <div className="mb-6">
                         {challengeResult === 'win' ? <Trophy size={60} className="text-yellow-500 mx-auto animate-bounce" /> : 
                          challengeResult === 'loss' ? <XCircle size={60} className="text-red-500 mx-auto" /> :
                          <div className="text-4xl">🤝</div>}
                     </div>
                     
                     <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-6">
                         {challengeResult === 'win' ? 'KAZANDIN!' : challengeResult === 'loss' ? 'KAYBETTİN' : 'BERABERE'}
                     </h2>
                     
                     <div className="flex justify-center items-center gap-8 mb-8">
                         <div className="text-center">
                             <div className="text-sm font-bold text-slate-400 mb-1">SEN</div>
                             <div className={`text-4xl font-black ${challengeResult === 'win' ? 'text-green-500' : ''}`}>{percentage}%</div>
                         </div>
                         <div className="text-2xl text-slate-300 font-black">VS</div>
                         <div className="text-center">
                             <div className="text-sm font-bold text-slate-400 mb-1 truncate max-w-[80px]">{challengeData.creatorName}</div>
                             <div className={`text-4xl font-black ${challengeResult === 'loss' ? 'text-red-500' : ''}`}>{challengeData.creatorScore}%</div>
                         </div>
                     </div>

                     <button onClick={onHome} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Ana Menüye Dön</button>
                </div>
             </div>
        )
    }

    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full border border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl font-black mb-2 dark:text-white">{isReviewMode ? 'Tekrar Tamamlandı!' : 'Quiz Bitti!'}</h2>
          <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 my-8">{score}<span className="text-3xl text-slate-300 font-bold">/{questions.length}</span></div>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-lg">Başarı Oranı: <span className="font-bold text-indigo-600 dark:text-indigo-400">% {percentage}</span></p>
          
           <div className="mb-6 flex justify-center">
              <Mascot mood={percentage >= 70 ? 'happy' : 'sad'} size={100} message={percentage >= 70 ? 'Harika iş! Böyle devam et.' : 'Biraz daha çalışmalısın. Pes etmek yok!'} />
           </div>

          <div className="flex flex-col gap-4">
             {!isReviewMode && (
                 <button onClick={onRestart} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-transform">Tekrar Çöz</button>
             )}
             <button onClick={onBack} className={`w-full py-4 ${isReviewMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700'} dark:bg-slate-800 dark:text-slate-300 rounded-2xl font-bold active:scale-95 transition-transform`}>
                {isReviewMode ? 'Ana Sayfaya Dön' : 'Üniteye Dön'}
             </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // CHANGED: Use min-h-full and justify-start to prevent cutting off content on small screens.
  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col min-h-full justify-start pt-4 pb-20">
       
       <div className="flex justify-between items-center mb-2 shrink-0">
         <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 shadow-sm">
            {currentQuestionIndex + 1}
         </div>
         <div className="flex-1 mx-5 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
         </div>
         <div className="text-sm font-bold text-slate-400">{questions.length}</div>
      </div>

      {/* Timer Bar */}
      {!isAnswered && (
          <div className="w-full flex items-center gap-2 mb-2 px-1 shrink-0">
              <Clock size={14} className={`${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-400'}`} 
                    style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
                  ></div>
              </div>
              <span className={`text-xs font-bold w-4 text-right ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-400'}`}>{timeLeft}</span>
          </div>
      )}

      {/* Challenge Banner */}
      {challengeMode && (
           <div className="mb-2 w-full text-center">
               <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                   <Swords size={10} className="inline mr-1" /> DÜELLO
               </span>
           </div>
      )}

      {/* Reduced size to prevent overflow */}
      <div className="flex justify-center mb-2 relative shrink-0" style={{minHeight: '85px'}}>
          <Mascot mood={mascotMood} size={85} message={mascotMessage} />
      </div>

      <div className="flex-grow flex flex-col justify-center mb-4 mt-2">
         <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 relative shrink-0">
             <h2 className="text-3xl sm:text-5xl font-black text-center text-slate-800 dark:text-white leading-tight break-words px-4">
                {currentQuestion.word}
             </h2>
             {isReviewMode && (
                 <div className="mt-2 text-xs font-bold text-center text-orange-500 uppercase tracking-widest opacity-80">Günlük Tekrar</div>
             )}
             {autoBookmarked && !isReviewMode && !challengeMode && (
                 <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 py-1 px-3 rounded-full w-fit mx-auto">
                     <Bookmark size={14} className="fill-current"/> 
                     <span className="text-xs font-bold">Favorilere eklendi</span>
                 </div>
             )}
             {addedToMemorized && !isReviewMode && !challengeMode && (
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

         {/* Explanation Box */}
         {isAnswered && currentQuestion.explanation && (
             <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-sm text-blue-800 dark:text-blue-200 flex gap-3 items-start animate-in slide-in-from-bottom-2 shrink-0">
                 <Info size={20} className="shrink-0 mt-0.5" />
                 <p className="font-medium leading-relaxed">
                     <strong>Bağlam:</strong> {currentQuestion.explanation}
                 </p>
             </div>
         )}
      </div>
      
      {isAnswered && (
          <button onClick={() => handleNext()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-transform mt-4 mb-6 animate-in slide-in-from-bottom-4 text-lg shrink-0">
              {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
          </button>
      )}
    </div>
  );
};

export default Quiz;
