import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel, QuizDifficulty, Challenge } from '../types';
import { CheckCircle, XCircle, Bookmark, Info, Clock, Swords, Copy, Trophy, HelpCircle, Zap, Divide, RotateCcw, Home } from 'lucide-react';
import { updateStats, handleQuizResult, handleReviewResult, addToMemorized, getMemorizedSet, removeFromMemorized, updateQuestProgress, getUserProfile, saveUserStats, XP_GAINS } from '../services/userService';
import { playSound } from '../services/soundService';
import { createChallenge, completeChallenge, syncLocalToCloud, submitTournamentScore, forfeitTournamentMatch, updateCumulativeStats } from '../services/supabase';
import { getSmartDistractors } from '../services/contentService';
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
  challengeMode?: 'create' | 'join' | 'tournament';
  challengeData?: any;
  unitIdForChallenge?: string;
  challengeType?: 'public' | 'private' | 'friend';
  targetFriendId?: string;
  tournamentMatchId?: string;
  tournamentName?: string;
}

const Quiz: React.FC<QuizProps> = ({ words, allWords, onRestart, onBack, onHome, isBookmarkQuiz, isReviewMode, onCelebrate, onBadgeUnlock, grade, difficulty = 'normal', challengeMode, challengeData, unitIdForChallenge, challengeType, targetFriendId, tournamentMatchId, tournamentName }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0); 
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoBookmarked, setAutoBookmarked] = useState(false);
  const [addedToMemorized, setAddedToMemorized] = useState(false);
  
  // Joker States
  const [jokersUsed, setJokersUsed] = useState({ fifty: false, double: false, ask: false });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [isDoubleChanceActive, setIsDoubleChanceActive] = useState(false);
  const [doubleChanceUsedForQuestion, setDoubleChanceUsedForQuestion] = useState(false); 
  const [showTeacherHint, setShowTeacherHint] = useState(false);

  // Challenge States
  const [createdChallengeId, setCreatedChallengeId] = useState<string | null>(null);
  const [challengeResult, setChallengeResult] = useState<'win' | 'loss' | 'tie' | null>(null);
  
  // Timer for Total Duration
  const [totalSeconds, setTotalSeconds] = useState(0);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
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

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  
  const [mascotMood, setMascotMood] = useState<'neutral' | 'happy' | 'sad' | 'thinking'>('thinking');
  const [mascotMessage, setMascotMessage] = useState<React.ReactNode | undefined>(undefined);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = useMemo(() => {
    if (!words || words.length === 0) return [];
    const distractorPool = (allWords && allWords.length > 3) ? allWords : words;

    return words.map((word) => {
      const selectedDistractors = getSmartDistractors(word, distractorPool, 3);
      
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

  // Start total timer
  useEffect(() => {
      totalTimerRef.current = setInterval(() => {
          setTotalSeconds(prev => prev + 1);
      }, 1000);
      return () => {
          if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      };
  }, []);

  useEffect(() => {
    if (questions[currentQuestionIndex] && !isAnswered) {
        const currentQ = questions[currentQuestionIndex];
        
        // Simple plain text for mascot, no highlighting
        setMascotMessage(currentQ.wordObj.exampleEng ? `"${currentQ.wordObj.exampleEng}"` : "");
        setMascotMood('thinking');
        
        setHiddenOptions([]);
        setIsDoubleChanceActive(false);
        setDoubleChanceUsedForQuestion(false);
        setShowTeacherHint(false);

        setTimeLeft(QUESTION_TIME_LIMIT);
        if (questionTimerRef.current) clearInterval(questionTimerRef.current);
        
        questionTimerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
                    handleOptionClick(-1);
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
        if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, []);

  const handleExit = async () => {
      // Aborting logic
      if (challengeMode === 'join' && challengeData) {
          // If exiting while playing a duel, count as loss (0 points)
          if (navigator.onLine) {
              await completeChallenge(challengeData.id, getUserProfile().name, 0);
          }
      } else if (challengeMode === 'tournament' && challengeData) {
          // If exiting tournament match, forfeit
          if (navigator.onLine && challengeData.tournamentId && challengeData.matchId) {
              await forfeitTournamentMatch(challengeData.tournamentId, challengeData.matchId);
          }
      }

      syncLocalToCloud(); // Sync before leaving
      onBack();
  };

  const handleFiftyFifty = () => {
      if (jokersUsed.fifty || isAnswered) return;
      
      const currentQ = questions[currentQuestionIndex];
      const wrongIndices = currentQ.options
          .map((opt, idx) => ({ idx, isCorrect: opt.isCorrect }))
          .filter(opt => !opt.isCorrect)
          .map(opt => opt.idx);
      
      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      const toHide = shuffledWrong.slice(0, 2);
      
      setHiddenOptions(toHide);
      setJokersUsed(prev => ({ ...prev, fifty: true }));
      playSound('pop');
  };

  const handleAskTeacher = () => {
      if (jokersUsed.ask || isAnswered) return;
      
      setMascotMessage(
          <span>
              Psst! Doğru cevap: "{questions[currentQuestionIndex].correctAnswer}"
          </span>
      );
      setMascotMood('happy');
      setShowTeacherHint(true);
      setJokersUsed(prev => ({ ...prev, ask: true }));
      playSound('pop');
  };

  const handleDoubleChance = () => {
      if (jokersUsed.double || isAnswered) return;
      
      setIsDoubleChanceActive(true);
      setJokersUsed(prev => ({ ...prev, double: true }));
      setMascotMessage("İki hakkın var! Yanlış yaparsan bir şansın daha olacak.");
      playSound('pop');
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered && !isDoubleChanceActive) return;

    if (isDoubleChanceActive && index !== -1) {
         const isCorrect = questions[currentQuestionIndex].options[index].isCorrect;
         if (!isCorrect) {
             setIsDoubleChanceActive(false);
             setDoubleChanceUsedForQuestion(true);
             setHiddenOptions(prev => [...prev, index]);
             playSound('wrong');
             setMascotMood('sad');
             setMascotMessage("Yanlış! Bir hakkın daha var.");
             return;
         }
    }

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    
    setIsAnswered(true);
    setSelectedOption(index);

    const isTimeUp = index === -1;
    const isCorrect = !isTimeUp && questions[currentQuestionIndex].options[index].isCorrect;
    const wordId = getUniqueId(questions[currentQuestionIndex].wordObj);
    
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
        setScore(newScore);
    } else {
        setWrongCount(prev => prev + 1);
    }

    if (!isTimeUp && navigator.vibrate) navigator.vibrate(isCorrect ? 50 : 200);

    // Update stats on server and locally
    if (!challengeMode) {
        const xpForCorrect = XP_GAINS.quiz_correct[difficulty] || 20;
        if (isCorrect) {
            updateCumulativeStats('quiz_correct', 1);
            const newBadges = updateStats(xpForCorrect, { grade, unitId: wordId });
            if (newBadges.length > 0 && onBadgeUnlock) newBadges.forEach(b => onBadgeUnlock(b));
        } else {
            updateCumulativeStats('quiz_wrong', 1);
            updateStats(1, { grade, unitId: wordId });
        }
    }

    if (isCorrect) {
        playSound('correct');
        setMascotMood('happy');
        setMascotMessage('Harika! Doğru bildin.');
        
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

        if (isReviewMode) {
            updateStats(XP_GAINS.flashcard_memorize, { grade, unitId: wordId });
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
             updateStats(XP_GAINS.flashcard_view, { grade, unitId: wordId });
        } else {
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
      // Finish Quiz
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      playSound('success');
      setShowResults(true);
      
      const percentage = Math.round((actualScore / questions.length) * 100);
      
      if (challengeMode === 'create') {
           if (allWords && unitIdForChallenge) {
                const wordIndices = words.map(w => allWords!.findIndex(aw => aw.english === w.english && aw.unitId === w.unitId));
                const profile = getUserProfile();
                // FIX: Cast difficulty to QuizDifficulty to ensure type safety
                createChallenge(profile.name, percentage, wordIndices, unitIdForChallenge, difficulty as QuizDifficulty, words.length, challengeType, targetFriendId)
                    .then((id) => setCreatedChallengeId(id));
           }
      } else if (challengeMode === 'join' || challengeMode === 'tournament') {
           if (challengeData) {
                // Set result for UI feedback only. Server RPC is source of truth for stats.
                if (percentage > challengeData.creatorScore) {
                    setChallengeResult('win');
                } else if (percentage < challengeData.creatorScore) {
                    setChallengeResult('loss');
                } else {
                    setChallengeResult('tie');
                }
                
                // Call RPC to update status & stats for BOTH players
                await completeChallenge(challengeData.id, getUserProfile().name, percentage);

                if (challengeMode === 'tournament' && tournamentMatchId) {
                     submitTournamentScore(challengeData.tournamentId || challengeData.id, tournamentMatchId, percentage, totalSeconds);
                }
           }
      } else {
          updateQuestProgress('finish_quiz', 1);
          
          if (actualScore === questions.length) {
              const newBadges = updateStats(XP_GAINS.perfect_quiz_bonus, { grade, action: 'perfect_quiz', quizSize: words.length });
              if (newBadges.length > 0 && onBadgeUnlock) newBadges.forEach(b => onBadgeUnlock(b));
              updateQuestProgress('perfect_quiz', 1);
          }
          
          if (onCelebrate) {
              if (actualScore === questions.length) onCelebrate("Mükemmel! Hepsini bildin.", 'quiz');
              else if (percentage >= 80) onCelebrate("Harika iş çıkardın!", 'quiz');
          }
      }
      
      // Sync cloud data when quiz finishes to ensure leaderboard is updated
      await syncLocalToCloud();
    }
  };

  const handleShareChallenge = () => {
      if (createdChallengeId) {
          navigator.clipboard.writeText(createdChallengeId);
          alert("Düello kodu kopyalandı!");
      }
  };

  // --- RENDER ---
  if (showResults) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in text-center">
              {challengeMode === 'create' ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full">
                      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-4">
                          <Swords size={40} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Meydan Okuma Hazır!</h2>
                      <p className="text-slate-500 mb-6">Skorun: <strong className="text-indigo-600">% {percentage}</strong></p>
                      
                      {createdChallengeId ? (
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-6">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Düello Kodu</p>
                              <div className="text-3xl font-black tracking-widest text-slate-800 dark:text-white select-all">{createdChallengeId}</div>
                              <button onClick={handleShareChallenge} className="mt-3 text-xs font-bold text-indigo-500 flex items-center justify-center gap-1 w-full py-2 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg">
                                  <Copy size={14} /> Kodu Kopyala
                              </button>
                          </div>
                      ) : (
                          <div className="text-sm text-slate-400 mb-6">Düello oluşturuluyor...</div>
                      )}
                      
                      <button onClick={onHome} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">Ana Menüye Dön</button>
                  </div>
              ) : challengeMode === 'join' || challengeMode === 'tournament' ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full">
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${challengeResult === 'win' ? 'bg-green-100 text-green-600' : challengeResult === 'loss' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                           <Trophy size={40} />
                       </div>
                       <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                           {challengeResult === 'win' ? 'Kazandın!' : challengeResult === 'loss' ? 'Kaybettin!' : 'Berabere!'}
                       </h2>
                       <div className="flex justify-center gap-8 mb-6">
                           <div className="text-center">
                               <div className="text-xs text-slate-400 font-bold mb-1">SEN</div>
                               <div className="text-3xl font-black text-indigo-600">{percentage}%</div>
                           </div>
                           <div className="text-center">
                               <div className="text-xs text-slate-400 font-bold mb-1">RAKİP</div>
                               <div className="text-3xl font-black text-slate-600 dark:text-slate-400">{challengeData?.creatorScore}%</div>
                           </div>
                       </div>
                       <button onClick={onHome} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold">Kapat</button>
                  </div>
              ) : (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full">
                      <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                          <CheckCircle size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Tamamlandı!</h2>
                      <div className="text-5xl font-black text-indigo-600 mb-2">{score} / {questions.length}</div>
                      <p className="text-slate-500 font-bold mb-8">Doğru Cevap</p>
                      
                      <div className="flex flex-col gap-3">
                          <button onClick={onRestart} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                             <RotateCcw size={20} /> Tekrar Dene
                          </button>
                          <button onClick={onHome} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                             <Home size={20} /> Ana Menü
                          </button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- QUIZ UI ---
  const currentQ = questions[currentQuestionIndex];
  
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 relative">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 shrink-0 relative z-20">
             <div className="flex items-center gap-3">
                 <div className="relative w-12 h-12 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                         <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                         <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * (timeLeft / QUESTION_TIME_LIMIT))} className={`text-indigo-500 transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'text-red-500' : ''}`} />
                     </svg>
                     <span className={`absolute font-bold text-sm ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>{timeLeft}</span>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Soru</span>
                     <span className="text-lg font-black text-slate-800 dark:text-white">{currentQuestionIndex + 1} <span className="text-slate-400 text-sm">/ {questions.length}</span></span>
                 </div>
             </div>

             <div className="flex gap-2">
                  <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm flex items-center gap-1">
                      <CheckCircle size={16} /> {score}
                  </div>
                  <button onClick={handleExit} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors">
                      <XCircle size={20} />
                  </button>
             </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
             <div className="w-full mb-6 flex justify-center">
                 <Mascot mood={mascotMood} message={mascotMessage} size={110} />
             </div>

             <div className="w-full text-center mb-8 relative z-10">
                 <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight drop-shadow-sm">
                     {currentQ.word}
                 </h2>
                 {currentQ.explanation && (
                     <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                         {currentQ.explanation}
                     </div>
                 )}
                 {/* Feedback Indicators */}
                 {autoBookmarked && (
                     <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                         <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full shadow-lg animate-bounce">
                             <Bookmark size={20} className="fill-current" />
                         </div>
                     </div>
                 )}
                 {addedToMemorized && (
                     <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                         <div className="bg-green-100 text-green-600 p-2 rounded-full shadow-lg animate-bounce">
                             <CheckCircle size={20} />
                         </div>
                     </div>
                 )}
             </div>

             {/* Options */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl relative z-10">
                 {currentQ.options.map((opt, idx) => {
                     const isSelected = selectedOption === idx;
                     const isHidden = hiddenOptions.includes(idx);
                     
                     let btnClass = "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700";
                     
                     if (isAnswered) {
                         if (opt.isCorrect) btnClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]";
                         else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white opacity-50";
                         else btnClass = "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 opacity-50";
                     }

                     if (isHidden) return <div key={idx} className="h-[72px]"></div>;

                     return (
                         <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswered && !isDoubleChanceActive}
                            className={`relative p-5 rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm ${btnClass} ${!isAnswered ? 'active:scale-95' : ''}`}
                         >
                             {opt.text}
                             {isAnswered && opt.isCorrect && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2" size={24} />}
                         </button>
                     );
                 })}
             </div>
        </div>

        {/* Jokers - Hidden in Challenge Mode */}
        {!challengeMode && (
            <div className="mt-auto pt-6 pb-2 shrink-0">
                 <div className="flex justify-center gap-4">
                     <button 
                        onClick={handleFiftyFifty} 
                        disabled={jokersUsed.fifty || isAnswered}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${jokersUsed.fifty ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 active:scale-95'}`}
                     >
                         <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-black shadow-sm text-sm">50%</div>
                         <span className="text-[10px] font-bold uppercase">Yarı Yarıya</span>
                     </button>

                     <button 
                        onClick={handleDoubleChance} 
                        disabled={jokersUsed.double || isAnswered}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${jokersUsed.double ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 active:scale-95'}`}
                     >
                         <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"><Zap size={20} className="fill-current" /></div>
                         <span className="text-[10px] font-bold uppercase">Çift Hak</span>
                     </button>

                     <button 
                        onClick={handleAskTeacher} 
                        disabled={jokersUsed.ask || isAnswered}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${jokersUsed.ask ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 active:scale-95'}`}
                     >
                         <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"><HelpCircle size={20} /></div>
                         <span className="text-[10px] font-bold uppercase">Hocaya Sor</span>
                     </button>
                 </div>
            </div>
        )}

    </div>
  );
};

export default Quiz;
