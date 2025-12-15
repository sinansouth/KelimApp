

import React, { useState, useEffect, useRef } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { Shuffle, RotateCcw, CheckCircle, HelpCircle, Grid3X3 } from 'lucide-react';
import { playSound } from '../services/soundService';
// FIX: Import `updateGameStats` to handle game-specific statistics.
import { updateStats, updateQuestProgress, updateGameStats, XP_GAINS, handleGameWordCompletion } from '../services/userService';
import { getSmartDistractors } from '../services/contentService'; 
import { syncLocalToCloud } from '../services/supabase';

interface MatchingGameProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  onBadgeUnlock?: (badge: Badge) => void;
  grade?: GradeLevel | null;
}

interface CardItem {
  id: string;
  text: string;
  type: 'eng' | 'tr';
  wordId: string;
  isMatched: boolean;
  isFlipped: boolean;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ words, onFinish, onBack, onCelebrate, onBadgeUnlock, grade }) => {
  const [gameMode, setGameMode] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [pairCount, setPairCount] = useState(6);
  
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardItem[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
      return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, []);

  useEffect(() => {
      if (isTimerRunning) {
          timerIntervalRef.current = setInterval(() => {
              setTimer(prev => prev + 1);
          }, 1000);
      } else {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
      return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning]);

  const handleExit = () => {
       syncLocalToCloud(); // Sync if exit
       onBack();
  };

  const startGame = (count: number) => {
    const uniqueWords = words.filter((word, index, self) => 
        index === self.findIndex((t) => (
            t.english.toLowerCase() === word.english.toLowerCase()
        ))
    );
    
    let selectedWords: WordCard[] = uniqueWords.sort(() => 0.5 - Math.random()).slice(0, count);

    const newCards: CardItem[] = [];
    selectedWords.forEach(w => {
        newCards.push({ id: `eng-${w.english}`, text: w.english, type: 'eng', wordId: w.english, isMatched: false, isFlipped: false });
        newCards.push({ id: `tr-${w.english}`, text: w.turkish, type: 'tr', wordId: w.english, isMatched: false, isFlipped: false });
    });

    setCards(newCards.sort(() => 0.5 - Math.random()));
    setMatches(0);
    setMoves(0);
    setTimer(0);
    setFinalScore(0);
    setPairCount(count);
    setGameMode('playing');
    setIsTimerRunning(true);
    setFlippedCards([]);
  };

  const handleCardClick = (clickedCard: CardItem) => {
    if (clickedCard.isMatched || clickedCard.isFlipped || flippedCards.length >= 2) return;

    playSound('flip');
    
    const newCards = cards.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
        setMoves(prev => prev + 1);
        checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (currentFlipped: CardItem[], currentCards: CardItem[]) => {
      const [card1, card2] = currentFlipped;
      
      if (card1.wordId === card2.wordId) {
          playSound('correct');
          
          // --- IMMEDIATE XP UPDATE START (Centralized Value) ---
          const xpGained = XP_GAINS.matching_pair;
          const newBadges = updateStats(xpGained, { grade });
          updateQuestProgress('play_matching', 1);
          updateQuestProgress('earn_xp', xpGained);
          if (newBadges.length > 0 && onBadgeUnlock) newBadges.forEach(b => onBadgeUnlock(b));
          
          // Add word to SRS when matched
          handleGameWordCompletion(card1.wordId);
          
          syncLocalToCloud(); // Immediate sync
          // --- IMMEDIATE XP UPDATE END ---

          setTimeout(() => {
              setCards(prev => prev.map(c =>
                  (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true, isFlipped: false } : c
              ));
              setFlippedCards([]);
              setMatches(prev => {
                  const newMatches = prev + 1;
                  if (newMatches === pairCount) handleGameComplete();
                  return newMatches;
              });
          }, 500);
      } else {
          playSound('wrong');
          setTimeout(() => {
              setCards(prev => prev.map(c =>
                  (c.id === card1.id || c.id === card2.id) ? { ...c, isFlipped: false } : c
              ));
              setFlippedCards([]);
          }, 1000);
      }
  };

  const handleGameComplete = () => {
      setIsTimerRunning(false);
      
      // Score Calculation:
      const calculatedScore = Math.floor((Math.pow(pairCount, 2) * 100) / Math.max(timer, 1));
      
      setFinalScore(calculatedScore);
      setGameMode('finished');
      playSound('success');
      
      // Bonus XP for finishing
      updateQuestProgress('earn_xp', 20);
      
      // Send SCORE to leaderboard
      updateGameStats('matching', calculatedScore);
      
      syncLocalToCloud(); // Sync after game finishes
      
      if (onCelebrate) onCelebrate('Tebrikler! Hepsini eşleştirdin.', 'goal');
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- SETUP SCREEN ---
  if (gameMode === 'setup') {
      const uniqueWordCount = new Set(words.map(w => w.english.toLowerCase())).size;
      const maxPairs = Math.min(uniqueWordCount, 30);
      const options = [6, 8, 10, 12, 15, 20, 24].filter(n => n <= maxPairs);
      if (options.length === 0 && maxPairs > 0) options.push(maxPairs);

      return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in">
             <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
                 <Grid3X3 size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Eşleştirme Oyunu</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-8 text-center">Kaç çift kartla oynamak istersin?</p>
             
             <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                 {options.map(count => (
                     <button
                        key={count}
                        onClick={() => startGame(count)}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-bold text-lg text-slate-700 dark:text-slate-200"
                     >
                         {count} Çift
                     </button>
                 ))}
             </div>
             <button onClick={onBack} className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-bold">Vazgeç</button>
        </div>
      );
  }

  if (gameMode === 'finished') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-lg">
                  <CheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Oyun Bitti!</h2>
              <div className="text-6xl font-black text-indigo-600 my-6">{finalScore}<span className="text-lg text-slate-400 ml-2">Puan</span></div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 uppercase font-bold">Süre</div>
                      <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{formatTime(timer)}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 uppercase font-bold">Hamle</div>
                      <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{moves}</div>
                  </div>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={() => setGameMode('setup')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">
                      Tekrar Oyna
                  </button>
                  <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold transition-all active:scale-95">
                      Geri Dön
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><RotateCcw size={14} /> {moves}</span>
                <span className="flex items-center gap-1"><HelpCircle size={14} /> {matches}/{pairCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{pairCount} Çift</span>
                <div className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-mono font-bold text-lg">
                    {formatTime(timer)}
                </div>
            </div>
        </div>

        <div className={`grid gap-2 sm:gap-3 flex-1 content-start overflow-y-auto pb-24 custom-scrollbar
            ${pairCount <= 8 ? 'grid-cols-4' : pairCount <= 12 ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-5 sm:grid-cols-6'}`}>
            {cards.map((card) => (
                <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={card.isMatched}
                    className={`aspect-[3/4] sm:aspect-square rounded-xl border-2 flex items-center justify-center p-1 text-center transition-all duration-300 transform
                        ${card.isMatched 
                            ? 'opacity-0 pointer-events-none scale-0' 
                            : card.isFlipped 
                                ? 'bg-white dark:bg-slate-800 border-indigo-500 dark:border-indigo-500 text-slate-800 dark:text-white rotate-y-180' 
                                : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                        }
                    `}
                >
                    <span className={`font-bold text-xs sm:text-sm md:text-base select-none break-words leading-tight ${card.isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                        {card.text}
                    </span>
                    
                    {!card.isFlipped && !card.isMatched && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                            <HelpCircle size={20} />
                        </div>
                    )}
                </button>
            ))}
        </div>

        <div className="shrink-0 pt-2 flex justify-between pb-safe px-4">
             <button onClick={handleExit} className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold">
                Çıkış
            </button>
            <button onClick={() => startGame(pairCount)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors text-xs font-bold">
                <Shuffle size={14} /> Yeniden Dağıt
            </button>
        </div>
    </div>
  );
};

export default MatchingGame;
