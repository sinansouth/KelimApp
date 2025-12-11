
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel, QuizDifficulty, Challenge } from '../types';
import { CheckCircle, XCircle, Bookmark, Info, Clock, Swords, Copy, Trophy, HelpCircle, Zap, Divide, RotateCcw, Home } from 'lucide-react';
import { updateStats, handleQuizResult, handleReviewResult, addToMemorized, getMemorizedSet, removeFromMemorized, updateQuestProgress, getUserProfile, saveUserStats, XP_GAINS, syncLocalToCloud } from '../services/userService';
import { playSound } from '../services/soundService';
import { createChallenge, completeChallenge, submitTournamentScore, forfeitTournamentMatch, updateCumulativeStats } from '../services/supabase';
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
      if (challengeMode === 'join' && challengeData) {
          if (navigator.onLine) {
              await completeChallenge(challengeData.id, getUserProfile().name, 0);
          }
      } else if (challengeMode === 'tournament' && challengeData) {
          if (navigator.onLine && challengeData.tournamentId && challengeData.matchId) {
              await forfeitTournamentMatch(challengeData.tournamentId, challengeData.matchId);
          }
      }

      syncLocalToCloud();
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
        
        if (isReviewMode) {
            handleReviewResult(wordId, true);
            updateStats(XP_GAINS.flashcard_memorize, { grade, unitId: wordId });
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

    // Dynamic delay: 1.5s for correct, 3s for wrong
    const delay = isCorrect ? 1500 : 3000; 
    
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
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      playSound('success');
      setShowResults(true);
      
      const percentage = Math.round((actualScore / questions.length) * 100);
      
      if (challengeMode === 'create') {
           if (allWords && unitIdForChallenge) {
                const wordIndices = words.map(w => allWords!.findIndex(aw => aw.english === w.english && aw.unitId === w.unitId));
                const profile = getUserProfile();
                createChallenge(profile.name, percentage, wordIndices, unitIdForChallenge, difficulty as QuizDifficulty, words.length, challengeType, targetFriendId)
                    .then((id) => setCreatedChallengeId(id));
           }
      } else if (challengeMode === 'join' || challengeMode === 'tournament') {
           if (challengeData) {
                if (percentage > challengeData.creatorScore) {
                    setChallengeResult('win');
                } else if (percentage < challengeData.creatorScore) {
                    setChallengeResult('loss');
                } else {
                    setChallengeResult('tie');
                }
                
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
      
      await syncLocalToCloud();
    }
  };

  const handleShareChallenge = () => {
      if (createdChallengeId) {
          navigator.clipboard.writeText(createdChallengeId);
          alert("Düello kodu kopyalandı!");
      }
  };

  // Determine Joker Visibility based on Question Count
  const totalQuestions = questions.length;
  // 10 Soruluk Test -> Sadece %50
  // 25 Soruluk Test -> %50 ve Çift Hak
  // 50+ Soruluk Test -> Tümü
  const showFiftyJoker = true; // Always available for quizzes
  const showDoubleJoker = totalQuestions >= 25;
  const showAskJoker = totalQuestions >= 50;

  // --- RENDER ---
  if (showResults) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in text-center" style={{color: 'var(--color-text-main)'}}>
              {challengeMode === 'create' ? (
                  <div className="p-8 rounded-3xl shadow-xl border max-w-sm w-full" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-4">
                          <Swords size={40} />
                      </div>
                      <h2 className="text-2xl font-black mb-2" style={{color: 'var(--color-text-main)'}}>Meydan Okuma Hazır!</h2>
                      <p className="mb-6" style={{color: 'var(--color-text-muted)'}}>Skorun: <strong style={{color: 'var(--color-primary)'}}>% {percentage}</strong></p>
                      
                      {createdChallengeId ? (
                          <div className="p-4 rounded-xl mb-6" style={{backgroundColor: 'var(--color-bg-main)'}}>
                              <p className="text-xs uppercase font-bold mb-1" style={{color: 'var(--color-text-muted)'}}>Düello Kodu</p>
                              <div className="text-3xl font-black tracking-widest select-all" style={{color: 'var(--color-text-main)'}}>{createdChallengeId}</div>
                              <button onClick={handleShareChallenge} className="mt-3 text-xs font-bold text-indigo-500 flex items-center justify-center gap-1 w-full py-2 rounded-lg hover:opacity-80 transition-opacity" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}>
                                  <Copy size={14} /> Kodu Kopyala
                              </button>
                          </div>
                      ) : (
                          <div className="text-sm mb-6" style={{color: 'var(--color-text-muted)'}}>Düello oluşturuluyor...</div>
                      )}
                      
                      <button onClick={onHome} className="w-full py-3 text-white rounded-xl font-bold transition-all" style={{backgroundColor: 'var(--color-primary)'}}>Ana Menüye Dön</button>
                  </div>
              ) : challengeMode === 'join' || challengeMode === 'tournament' ? (
                  <div className="p-8 rounded-3xl shadow-xl border max-w-sm w-full" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${challengeResult === 'win' ? 'bg-green-100 text-green-600' : challengeResult === 'loss' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                           <Trophy size={40} />
                       </div>
                       <h2 className="text-2xl font-black mb-2" style={{color: 'var(--color-text-main)'}}>
                           {challengeResult === 'win' ? 'Kazandın!' : challengeResult === 'loss' ? 'Kaybettin!' : 'Berabere!'}
                       </h2>
                       <div className="flex justify-center gap-8 mb-6">
                           <div className="text-center">
                               <div className="text-xs font-bold mb-1" style={{color: 'var(--color-text-muted)'}}>SEN</div>
                               <div className="text-3xl font-black" style={{color: 'var(--color-primary)'}}>{percentage}%</div>
                           </div>
                           <div className="text-center">
                               <div className="text-xs font-bold mb-1" style={{color: 'var(--color-text-muted)'}}>RAKİP</div>
                               <div className="text-3xl font-black" style={{color: 'var(--color-text-main)'}}>{challengeData?.creatorScore}%</div>
                           </div>
                       </div>
                       <button onClick={onHome} className="w-full py-3 rounded-xl font-bold transition-all" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>Kapat</button>
                  </div>
              ) : (
                  <div className="p-8 rounded-3xl shadow-xl border max-w-sm w-full" style={{backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)'}}>
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)'}}>
                          <CheckCircle size={48} />
                      </div>
                      <h2 className="text-3xl font-black mb-2" style={{color: 'var(--color-text-main)'}}>Tamamlandı!</h2>
                      <div className="text-5xl font-black mb-2" style={{color: 'var(--color-primary)'}}>{score} / {questions.length}</div>
                      <p className="font-bold mb-8" style={{color: 'var(--color-text-muted)'}}>Doğru Cevap</p>
                      
                      <div className="flex flex-col gap-3">
                          <button onClick={onRestart} className="w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2" style={{backgroundColor: 'var(--color-primary)'}}>
                             <RotateCcw size={20} /> Tekrar Dene
                          </button>
                          <button onClick={onHome} className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>
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
    <div className="flex flex-col h-full max-w-3xl mx-auto relative overflow-hidden">
        
        {/* Top Bar - Solid Background to prevent overlap */}
        <div 
            className="flex justify-between items-center p-3 px-4 shrink-0 z-20 shadow-sm border-b"
            style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
            }}
        >
             <div className="flex items-center gap-4">
                 {/* Timer */}
                 <div className="relative w-10 h-10 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                         <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" style={{color: 'var(--color-border)'}} />
                         <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - (100 * (timeLeft / QUESTION_TIME_LIMIT))} style={{color: timeLeft <= 5 ? '#ef4444' : 'var(--color-primary)'}} className="transition-all duration-1000 ease-linear" />
                     </svg>
                     <span className={`absolute font-bold text-xs ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}`} style={timeLeft > 5 ? {color: 'var(--color-text-main)'} : {}}>{timeLeft}</span>
                 </div>
                 
                 {/* Counter */}
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-wider" style={{color: 'var(--color-text-muted)'}}>Soru</span>
                     <span className="text-base font-black" style={{color: 'var(--color-text-main)'}}>{currentQuestionIndex + 1} <span className="text-xs" style={{color: 'var(--color-text-muted)'}}>/ {questions.length}</span></span>
                 </div>
             </div>

             <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-bold text-xs flex items-center gap-1">
                      <CheckCircle size={14} /> {score}
                  </div>
                  <button onClick={handleExit} className="p-2 rounded-xl transition-colors hover:text-red-500" style={{backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-muted)'}}>
                      <XCircle size={20} />
                  </button>
             </div>
        </div>

        {/* Scrollable Middle Area - Added py-6 to ensure spacing from header */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
             <div className="flex flex-col items-center justify-center min-h-full py-6">
                 
                 {/* Mascot - Reduced size */}
                 <div className="w-full mb-4 flex justify-center shrink-0">
                     <Mascot mood={mascotMood} message={mascotMessage} size={70} />
                 </div>

                 {/* Question Text */}
                 <div className="w-full text-center mb-6 relative z-10 shrink-0">
                     <h2 className="text-2xl sm:text-5xl font-black mb-2 tracking-tight drop-shadow-sm px-2 break-words leading-tight" style={{color: 'var(--color-text-main)'}}>
                         {currentQ.word}
                     </h2>
                     {currentQ.explanation && (
                         <div className="inline-block px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide border" style={{backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)'}}>
                             {currentQ.explanation}
                         </div>
                     )}
                     {/* Feedback Indicators */}
                     {autoBookmarked && (
                         <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                             <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full shadow-lg animate-bounce">
                                 <Bookmark size={16} className="fill-current" />
                             </div>
                         </div>
                     )}
                     {addedToMemorized && (
                         <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                             <div className="bg-green-100 text-green-600 p-2 rounded-full shadow-lg animate-bounce">
                                 <CheckCircle size={16} />
                             </div>
                         </div>
                     )}
                 </div>

                 {/* Options */}
                 <div className="grid grid-cols-1 gap-3 w-full max-w-2xl relative z-10 pb-4">
                     {currentQ.options.map((opt, idx) => {
                         const isSelected = selectedOption === idx;
                         const isHidden = hiddenOptions.includes(idx);
                         
                         let btnStyle = {
                             backgroundColor: 'var(--color-bg-card)',
                             borderColor: 'var(--color-border)',
                             color: 'var(--color-text-muted)'
                         };
                         
                         let btnClass = "border-2 hover:border-opacity-50"; 

                         if (isAnswered) {
                             if (opt.isCorrect) {
                                 btnStyle = { backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' };
                                 btnClass = "shadow-lg shadow-green-500/30 scale-[1.01]";
                             }
                             else if (isSelected) {
                                 btnStyle = { backgroundColor: '#ef4444', borderColor: '#ef4444', color: 'white' };
                                 btnClass = "opacity-50";
                             }
                             else {
                                btnStyle = { backgroundColor: 'var(--color-bg-main)', borderColor: 'transparent', color: 'var(--color-text-muted)' };
                                btnClass = "opacity-50";
                             }
                         }

                         if (isHidden) return <div key={idx} className="h-[60px]"></div>;

                         return (
                             <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isAnswered && !isDoubleChanceActive}
                                className={`relative p-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-sm ${btnClass} ${!isAnswered ? 'active:scale-95' : ''} flex items-center justify-center min-h-[60px]`}
                                style={btnStyle}
                             >
                                 {opt.text}
                                 {isAnswered && opt.isCorrect && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2" size={20} />}
                             </button>
                         );
                     })}
                 </div>
             </div>
        </div>

        {/* Jokers - Fixed at bottom, separated from scroll view with solid background */}
        {!challengeMode && (
            <div 
                className="p-4 pb-safe shrink-0 z-30 border-t"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                }}
            >
                 <div className="flex justify-center gap-4">
                     {/* 50/50 Joker - Always Visible */}
                     <button 
                        onClick={handleFiftyFifty} 
                        disabled={jokersUsed.fifty || isAnswered}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all min-w-[70px] ${jokersUsed.fifty ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 active:scale-95'}`}
                     >
                         <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-black shadow-sm text-xs">50%</div>
                         <span className="text-[9px] font-bold uppercase">Yarı</span>
                     </button>

                     {/* Double Chance - >= 25 Questions */}
                     {showDoubleJoker && (
                         <button 
                            onClick={handleDoubleChance} 
                            disabled={jokersUsed.double || isAnswered}
                            className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all min-w-[70px] ${jokersUsed.double ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 active:scale-95'}`}
                         >
                             <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"><Zap size={14} className="fill-current" /></div>
                             <span className="text-[9px] font-bold uppercase">Çift</span>
                         </button>
                     )}

                     {/* Ask Teacher - >= 50 Questions */}
                     {showAskJoker && (
                         <button 
                            onClick={handleAskTeacher} 
                            disabled={jokersUsed.ask || isAnswered}
                            className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition-all min-w-[70px] ${jokersUsed.ask ? 'opacity-30 grayscale cursor-not-allowed border-slate-200' : 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 active:scale-95'}`}
                         >
                             <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"><HelpCircle size={14} /></div>
                             <span className="text-[9px] font-bold uppercase">Hoca</span>
                         </button>
                     )}
                 </div>
            </div>
        )}

    </div>
  );
};

export default Quiz;
