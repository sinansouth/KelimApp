
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WordCard, Badge, GradeLevel } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Bookmark, CheckCircle, XCircle, ThumbsUp, Play, Pause, Loader2 } from 'lucide-react';
import { updateStats, getMemorizedSet, addToMemorized, removeFromMemorized, addToBookmarks, removeFromBookmarks, handleReviewResult, registerSRSInteraction, updateQuestProgress } from '../services/userService';
import { playSound } from '../services/soundService';

interface FlashcardDeckProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  isReviewMode?: boolean;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
  onBadgeUnlock?: (badge: Badge) => void;
  grade?: GradeLevel | null;
}

type FilterMode = 'all' | 'bookmarks' | 'memorized';

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ words: initialWords, onFinish, onBack, isReviewMode = false, onCelebrate, onBadgeUnlock, grade }) => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('lgs_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const [memorized, setMemorized] = useState<Set<string>>(getMemorizedSet());
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [shuffledDeck, setShuffledDeck] = useState<WordCard[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto Play State
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'remove-memorized' | 'bookmark' | 'remove-bookmark';
    message: string;
  } | null>(null);
  
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Touch handling states
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  
  const minSwipeDistance = 50;

  const getUniqueId = (word: WordCard) => {
      if (word.unitId) {
          return `${word.unitId}|${word.english}`;
      }
      return word.english;
  };

  const triggerFeedback = (type: 'success' | 'remove-memorized' | 'bookmark' | 'remove-bookmark', message: string) => {
      if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
      }
      if (navigator.vibrate) navigator.vibrate(50);

      setFeedback({ visible: true, type, message });
      feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
          feedbackTimerRef.current = null;
      }, 1200);
  };

  useEffect(() => {
    setShuffledDeck(initialWords);
    setCurrentIndex(0);
    setIsShuffled(false);
    setIsFlipped(false);
    setFilterMode('all');
    setFeedback(null);
    setIsProcessing(false);
    setIsAutoPlay(false);
  }, [initialWords]);

  const activeDeck = useMemo(() => {
    let deck = shuffledDeck;
    if (filterMode === 'bookmarks') {
      deck = deck.filter(word => bookmarks.has(getUniqueId(word)));
    } else if (filterMode === 'memorized') {
      deck = deck.filter(word => memorized.has(getUniqueId(word)));
    }
    return deck;
  }, [shuffledDeck, filterMode, bookmarks, memorized]);

  const currentWord = activeDeck.length > 0 ? activeDeck[currentIndex] : null;

  // Auto Play Logic
  useEffect(() => {
    if (!isAutoPlay) {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
        return;
    }

    // Clear existing timer
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);

    const READ_TIME = 3500; // time to read front
    const ANSWER_TIME = 3000; // time to read back

    autoPlayTimerRef.current = setTimeout(() => {
        if (!isFlipped) {
            // Flip card
            playSound('flip');
            setIsFlipped(true);
            
            // RECORD STATS IN AUTO PLAY
            if (currentWord) {
                const wordId = getUniqueId(currentWord);
                const newBadges = updateStats('card_view', grade, wordId);
                updateQuestProgress('view_cards', 1);
                registerSRSInteraction(wordId);
                if (newBadges.length > 0 && onBadgeUnlock) {
                    newBadges.forEach(b => onBadgeUnlock(b));
                }
            }

        } else {
            // Next card
            if (currentIndex < activeDeck.length - 1) {
                handleNext();
            } else {
                // Finish
                setIsAutoPlay(false);
                onFinish();
            }
        }
    }, isFlipped ? ANSWER_TIME : READ_TIME);

    return () => {
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, isFlipped, currentIndex, currentWord, activeDeck.length]);


  useEffect(() => {
    if (currentIndex >= activeDeck.length && activeDeck.length > 0) {
      setCurrentIndex(activeDeck.length - 1);
    }
  }, [activeDeck.length, currentIndex]);


  const setFilter = (mode: FilterMode) => {
    if (isProcessing) return;
    setIsAutoPlay(false);
    setIsFlipped(false);
    setTimeout(() => {
      setFilterMode(prev => prev === mode ? 'all' : mode);
      setCurrentIndex(0);
    }, 200);
  };

  const toggleBookmark = (e: React.MouseEvent | null, word: WordCard) => {
    if (e) e.stopPropagation();
    if (isProcessing) return;
    
    const uniqueId = getUniqueId(word);
    const newBookmarks = new Set(bookmarks);
    
    if (newBookmarks.has(uniqueId)) {
      newBookmarks.delete(uniqueId);
      removeFromBookmarks(uniqueId);
      triggerFeedback('remove-bookmark', 'Favorilerden Çıkarıldı');
    } else {
      if (memorized.has(uniqueId)) {
          const newMem = new Set(memorized);
          newMem.delete(uniqueId);
          setMemorized(newMem);
          removeFromMemorized(uniqueId);
      }
      newBookmarks.add(uniqueId);
      addToBookmarks(uniqueId);
      triggerFeedback('bookmark', 'Favorilere Eklendi');
    }
    setBookmarks(newBookmarks);
  };

  const toggleMemorize = (e: React.MouseEvent | null, word: WordCard) => {
    if (e) e.stopPropagation();
    if (isProcessing) return;
    
    setIsAutoPlay(false);
    setIsProcessing(true);
    
    const uniqueId = getUniqueId(word);
    const newMemorized = new Set(memorized);
    
    if (newMemorized.has(uniqueId)) {
        newMemorized.delete(uniqueId);
        removeFromMemorized(uniqueId);
        triggerFeedback('remove-memorized', 'Ezberlenenlerden Çıkarıldı');
        playSound('wrong');
    } else {
        if (bookmarks.has(uniqueId)) {
            const newBk = new Set(bookmarks);
            newBk.delete(uniqueId);
            setBookmarks(newBk);
            removeFromBookmarks(uniqueId);
        }

        newMemorized.add(uniqueId);
        addToMemorized(uniqueId);
        
        const newBadges = updateStats('memorized', grade, uniqueId);
        if (newBadges.length > 0 && onBadgeUnlock) {
             newBadges.forEach(b => onBadgeUnlock(b));
        }

        triggerFeedback('success', 'Ezberlendi! (+10 XP)');
        playSound('success');
    }
    setMemorized(newMemorized);
    
    setTimeout(() => {
        if (currentIndex < activeDeck.length - 1) {
            handleNext();
        } else {
            setIsProcessing(false);
        }
    }, 800);
  };

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      playSound('flip');
      setIsFlipped(false);
      setTimeout(() => {
         setCurrentIndex(prev => prev + 1);
         setFeedback(null);
         if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
         setIsProcessing(false);
      }, 200); 
    } else {
      playSound('success');
      if (onCelebrate && !isReviewMode) {
          onCelebrate("Tebrikler! Kartları tamamladın.", 'unit');
      }
      onFinish();
      setIsProcessing(false);
      setIsAutoPlay(false);
    }
  };

  const handleRate = (e: React.MouseEvent, success: boolean) => {
      e.stopPropagation();
      if (!currentWord || isProcessing) return;
      
      setIsAutoPlay(false);
      setIsProcessing(true);
      
      if (navigator.vibrate) navigator.vibrate(success ? 50 : 100);

      if (success) playSound('success');
      else playSound('wrong');

      const wordId = getUniqueId(currentWord);
      
      handleReviewResult(wordId, success);

      if (success) {
          if (!memorized.has(wordId)) {
              if (bookmarks.has(wordId)) {
                  const newBk = new Set(bookmarks);
                  newBk.delete(wordId);
                  setBookmarks(newBk);
                  removeFromBookmarks(wordId);
              }
              addToMemorized(wordId);
              setMemorized(prev => new Set(prev).add(wordId));
          }
          updateStats('review_remember', grade, wordId);
          triggerFeedback('success', 'Harika! Sonraki Kutuya Geçti (+10 XP)');
      } else {
          updateStats('review_forgot', grade, wordId);
          triggerFeedback('remove-memorized', 'Kutu 1\'e Döndü (+2 XP)');
      }

      setTimeout(() => {
          if (currentIndex < activeDeck.length - 1) {
              setIsFlipped(false);
              setTimeout(() => {
                 setCurrentIndex(prev => prev + 1);
                 setFeedback(null);
                 setIsProcessing(false);
              }, 300);
          } else {
              onFinish();
              setIsProcessing(false);
          }
      }, 800);
  };

  const handlePrev = () => {
    if (currentIndex > 0 && !isProcessing) {
      setIsAutoPlay(false);
      setIsProcessing(true);
      playSound('flip');
      setIsFlipped(false);
      setFeedback(null);
      setTimeout(() => { 
          setCurrentIndex(prev => prev - 1);
          setIsProcessing(false);
      }, 300);
    }
  };

  const handleRestart = () => {
    if (isProcessing) return;
    setIsAutoPlay(false);
    setIsFlipped(false);
    setFeedback(null);
    setTimeout(() => {
       setCurrentIndex(0);
    }, 200);
  };

  const handleShuffle = () => {
    if (isProcessing) return;
    setIsAutoPlay(false);
    setIsFlipped(false);
    setFeedback(null);
    setTimeout(() => {
      if (isShuffled) {
        setShuffledDeck(initialWords);
        setIsShuffled(false);
      } else {
        const shuffled = [...initialWords].sort(() => Math.random() - 0.5);
        setShuffledDeck(shuffled);
        setIsShuffled(true);
      }
      setCurrentIndex(0);
    }, 200);
  };

  const handleCardClick = () => {
    if (isAutoPlay) setIsAutoPlay(false);
    
    playSound('flip');
    if (!isFlipped) {
      if (currentWord) {
          const wordId = getUniqueId(currentWord);
          const newBadges = updateStats('card_view', grade, wordId);
          updateQuestProgress('view_cards', 1);
          registerSRSInteraction(wordId);
          if (newBadges.length > 0 && onBadgeUnlock) {
              newBadges.forEach(b => onBadgeUnlock(b));
          }
      }
    }
    setIsFlipped(!isFlipped);
  };
  
  const toggleAutoPlay = () => {
      setIsAutoPlay(!isAutoPlay);
  };

  // Touch Handlers (Swipe)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null); 
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  }

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX || !touchStartY || !touchEndY) return;
    
    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;
        
        if (isLeftSwipe) {
            if (!isProcessing) {
                 setIsAutoPlay(false);
                 setIsProcessing(true);
                 handleNext();
            }
        } else if (isRightSwipe) {
            handlePrev();
        }
    } else {
        const isUpSwipe = distanceY > minSwipeDistance;
        const isDownSwipe = distanceY < -minSwipeDistance;
        
        if (isUpSwipe) {
             if (!isReviewMode && currentWord) {
                 toggleMemorize(null, currentWord);
             }
        } else if (isDownSwipe) {
             if (!isReviewMode && currentWord) {
                 toggleBookmark(null, currentWord);
             }
        }
    }
  }

  if ((filterMode === 'bookmarks' || filterMode === 'memorized') && activeDeck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${filterMode === 'bookmarks' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          {filterMode === 'bookmarks' ? <Bookmark className="text-yellow-500" size={40} /> : <CheckCircle className="text-green-500" size={40} />}
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{filterMode === 'bookmarks' ? 'Favorilerde kelime yok' : 'Henüz ezberlenen yok'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            {filterMode === 'bookmarks' ? 'Görüntülenecek favori kelime kalmadı.' : 'Bu ünitede henüz ezberlenen kelime yok.'}
        </p>
        <button 
          onClick={() => setFilterMode('all')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
        >
          Tüm Kelimelere Dön
        </button>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center text-slate-500 dark:text-slate-400 mb-6">Görüntülenecek kelime bulunamadı.</div>
      </div>
    );
  }

  const currentUniqueId = getUniqueId(currentWord);
  const isBookmarked = bookmarks.has(currentUniqueId);
  const isMemorized = memorized.has(currentUniqueId);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl lg:max-w-4xl mx-auto h-full px-4 py-2">
      
      <div className="w-full flex justify-between items-center mb-4 shrink-0">
        <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
             {currentIndex + 1} / {activeDeck.length}
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleAutoPlay}
             className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 ${isAutoPlay ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
             title="Otomatik Oynat"
           >
              {isAutoPlay ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
           </button>

          {initialWords.length > 1 && !isReviewMode && (
            <>
              <button
                onClick={() => setFilter('bookmarks')}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${filterMode === 'bookmarks' ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Bookmark size={20} className={filterMode === 'bookmarks' ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => setFilter('memorized')}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${filterMode === 'memorized' ? 'bg-green-100 text-green-700' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <CheckCircle size={20} className={filterMode === 'memorized' ? 'fill-current' : ''} />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            </>
          )}
          <button onClick={handleShuffle} disabled={filterMode !== 'all'} className={`p-2.5 rounded-full transition-all active:scale-95 ${isShuffled ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Shuffle size={20} />
          </button>
          <button onClick={handleRestart} className="p-2.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div 
        className="perspective-1000 w-full flex-1 min-h-0 relative group cursor-pointer mb-4 sm:mb-8 max-h-[600px] sm:max-h-[700px] z-10" 
        onClick={handleCardClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'none' }}
      >
         {feedback?.visible && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200 flex flex-col items-center gap-4 text-center max-w-[80%]">
                      {feedback.type === 'success' && <CheckCircle className="text-green-500 w-12 h-12" />}
                      {feedback.type === 'remove-memorized' && <XCircle className="text-slate-500 w-12 h-12" />}
                      {feedback.type === 'bookmark' && <Bookmark className="text-yellow-500 w-12 h-12 fill-current" />}
                      {feedback.type === 'remove-bookmark' && <Bookmark className="text-slate-400 w-12 h-12" />}
                      <span className={`text-lg font-black ${feedback.type === 'success' ? 'text-green-600' : feedback.type === 'bookmark' ? 'text-yellow-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {feedback.message}
                      </span>
                  </div>
              </div>
         )}

        <div 
            className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-lg rounded-3xl origin-center`}
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 p-8 transition-colors overflow-hidden">
             <div className="flex-grow flex flex-col items-center justify-center text-center px-4 w-full">
                 <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white break-words leading-tight max-w-full">{currentWord.english}</h2>
                 <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 italic font-medium max-w-md">
                    "{currentWord.exampleEng}"
                 </p>
             </div>
             <div className="text-xs text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest mt-auto shrink-0">
                 {isAutoPlay ? 'Otomatik Oynatılıyor...' : 'Çevirmek için Dokun'}
             </div>
          </div>

          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-slate-900 text-white rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-indigo-500 dark:border-slate-700 overflow-hidden">
            <div className="flex-grow flex flex-col items-center justify-center w-full overflow-y-auto no-scrollbar relative z-10">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4 break-words max-w-full">{currentWord.turkish}</h3>
              <p className="text-indigo-200 text-sm italic mb-6 pb-3 border-b border-white/20">{currentWord.context}</p>
              <div className="bg-white/10 rounded-2xl p-5 w-full backdrop-blur-sm">
                <p className="text-lg font-medium mb-2">"{currentWord.exampleEng}"</p>
                <p className="text-indigo-200 text-sm font-medium">{currentWord.exampleTr}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isReviewMode ? (
        <div className="flex flex-col w-full gap-4 shrink-0">
            <div className="flex gap-4">
                <button 
                    onClick={(e) => toggleBookmark(e, currentWord)}
                    disabled={isProcessing}
                    className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border-2 disabled:opacity-70 ${isBookmarked ? 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
                >
                    <Bookmark size={24} className={isBookmarked ? 'fill-current' : ''} />
                    <span className="text-sm font-bold hidden sm:inline">{isBookmarked ? 'Favori' : 'Favorilere Ekle'}</span>
                </button>
                <button 
                    onClick={(e) => toggleMemorize(e, currentWord)}
                    disabled={isProcessing}
                    className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border-2 disabled:opacity-70 ${isMemorized ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-800'}`}
                >
                    <CheckCircle size={24} />
                    <span className="text-sm font-bold hidden sm:inline">{isMemorized ? 'Ezberlendi' : 'Ezberle'}</span>
                </button>
            </div>
            <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                  disabled={currentIndex === 0 || isProcessing} 
                  className="h-14 w-16 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 disabled:opacity-30 active:scale-95 transition-all hover:border-indigo-200"
                >
                    <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsProcessing(true); setIsAutoPlay(false); handleNext(); }} 
                  disabled={isProcessing}
                  className="flex-grow h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-2 transition-all text-lg"
                >
                    {currentIndex === activeDeck.length - 1 ? 'Bitir' : 'Sonraki'} <ChevronRight size={24} />
                </button>
            </div>
        </div>
      ) : (
        isFlipped && (
          <div className="flex w-full gap-4 shrink-0">
             <button 
                onClick={(e) => handleRate(e, false)} 
                disabled={isProcessing}
                className="flex-1 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-50"
             >
                <XCircle size={24} /> Hatırlamadım
             </button>
             <button 
                onClick={(e) => handleRate(e, true)} 
                disabled={isProcessing}
                className="flex-1 bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-50"
             >
                <ThumbsUp size={24} /> Hatırladım
             </button>
          </div>
        )
      )}
    </div>
  );
};

export default FlashcardDeck;
