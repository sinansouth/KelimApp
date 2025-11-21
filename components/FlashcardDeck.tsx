
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WordCard } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Bookmark, Filter, CheckCircle, Sparkles, BookmarkMinus, MinusCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { updateStats, getMemorizedSet, addToMemorized, removeFromMemorized, handleQuizResult } from '../services/userService';

interface FlashcardDeckProps {
  words: WordCard[];
  onFinish: () => void;
  onBack: () => void;
  onHome: () => void;
  isReviewMode?: boolean;
  onCelebrate?: (message: string, type: 'unit' | 'quiz' | 'goal') => void;
}

type FilterMode = 'all' | 'bookmarks' | 'memorized';

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ words: initialWords, onFinish, onBack, isReviewMode = false, onCelebrate }) => {
  // Bookmark State (Persisted in LocalStorage)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('lgs_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Memorized State
  const [memorized, setMemorized] = useState<Set<string>>(getMemorizedSet());

  // View State
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  
  // Deck State
  const [shuffledDeck, setShuffledDeck] = useState<WordCard[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  
  // Animation/Feedback State
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'remove-memorized' | 'bookmark' | 'remove-bookmark';
    message: string;
  } | null>(null);
  
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to trigger feedback
  const triggerFeedback = (type: 'success' | 'remove-memorized' | 'bookmark' | 'remove-bookmark', message: string) => {
      if (feedbackTimerRef.current) {
          clearTimeout(feedbackTimerRef.current);
      }
      setFeedback({ visible: true, type, message });
      feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);
          feedbackTimerRef.current = null;
      }, 1200);
  };

  // Reset when initialWords change (new unit selected)
  useEffect(() => {
    setShuffledDeck(initialWords);
    setCurrentIndex(0);
    setIsShuffled(false);
    setIsFlipped(false);
    setFilterMode('all');
    setFeedback(null);
  }, [initialWords]);

  // Determine which deck to show based on filter
  const activeDeck = useMemo(() => {
    let deck = shuffledDeck;
    
    if (filterMode === 'bookmarks') {
      deck = deck.filter(word => bookmarks.has(word.english));
    } else if (filterMode === 'memorized') {
      deck = deck.filter(word => memorized.has(word.english));
    }
    return deck;
  }, [shuffledDeck, filterMode, bookmarks, memorized]);

  // Ensure currentIndex is valid when activeDeck shrinks
  useEffect(() => {
    if (currentIndex >= activeDeck.length && activeDeck.length > 0) {
      setCurrentIndex(activeDeck.length - 1);
    }
  }, [activeDeck.length, currentIndex]);

  const currentWord = activeDeck.length > 0 ? activeDeck[currentIndex] : null;

  // Bookmark Logic
  const toggleBookmark = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const newBookmarks = new Set(bookmarks);
    if (newBookmarks.has(word)) {
      newBookmarks.delete(word);
      triggerFeedback('remove-bookmark', 'Favorilerden Çıkarıldı');
    } else {
      newBookmarks.add(word);
      triggerFeedback('bookmark', 'Favorilere Eklendi');
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('lgs_bookmarks', JSON.stringify([...newBookmarks]));
  };

  // Memorize Logic (Toggle)
  const toggleMemorize = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const newMemorized = new Set(memorized);
    
    if (newMemorized.has(word)) {
        newMemorized.delete(word);
        removeFromMemorized(word);
        triggerFeedback('remove-memorized', 'Ezberlenenlerden Çıkarıldı');
    } else {
        newMemorized.add(word);
        addToMemorized(word);
        triggerFeedback('success', 'Ezberlendi!');
    }
    setMemorized(newMemorized);
  };

  const setFilter = (mode: FilterMode) => {
    setIsFlipped(false);
    setTimeout(() => {
      // If clicking the same mode, toggle off to 'all'
      setFilterMode(prev => prev === mode ? 'all' : mode);
      setCurrentIndex(0);
    }, 200);
  };

  // Navigation Logic
  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
         setCurrentIndex(prev => prev + 1);
         setFeedback(null); // Reset feedback immediately on slide
         if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      }, 200);
    } else {
      // Finished
      if (onCelebrate && !isReviewMode) {
          onCelebrate("Tebrikler! Kartları tamamladın.", 'unit');
      }
      onFinish();
    }
  };

  // SRS Rating Handler
  const handleRate = (e: React.MouseEvent, success: boolean) => {
      e.stopPropagation();
      if (!currentWord) return;

      // Update SRS (Leitner System)
      handleQuizResult(currentWord.english, success);

      // Visual Feedback
      if (success) {
          triggerFeedback('success', 'Harika! Sonraki Kutuya Geçti');
      } else {
          triggerFeedback('remove-memorized', 'Kutu 1\'e Döndü');
      }

      // Wait for feedback to show then move next
      setTimeout(() => {
          handleNext();
      }, 800);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setFeedback(null);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  const handleRestart = () => {
    setIsFlipped(false);
    setFeedback(null);
    setTimeout(() => {
       setCurrentIndex(0);
    }, 200);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setFeedback(null);
    setTimeout(() => {
      if (isShuffled) {
        setShuffledDeck(initialWords); // Restore original
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
    if (!isFlipped) {
      // Only count as viewed when user flips to see the back (meaning)
      updateStats('card_view');
    }
    setIsFlipped(!isFlipped);
  };

  // -- RENDER --

  // Empty State for Bookmarks Filter
  if (filterMode === 'bookmarks' && activeDeck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-6">
          <Bookmark className="text-yellow-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Favorilerde kelime yok</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Görüntülenecek favori kelime kalmadı. Henüz eklememiş olabilirsiniz.
        </p>
        <button 
          onClick={() => setFilterMode('all')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Tüm Kelimelere Dön
        </button>
      </div>
    );
  }

  // Empty State for Memorized Filter
  if (filterMode === 'memorized' && activeDeck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Henüz ezberlenen yok</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Bu ünitede henüz 'Ezberledim' olarak işaretlediğiniz kelime bulunmuyor.
        </p>
        <button 
          onClick={() => setFilterMode('all')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Tüm Kelimelere Dön
        </button>
      </div>
    );
  }

  // Fallback if strictly no words found (and not in a filter mode empty state)
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center text-slate-500 dark:text-slate-400 mb-6">Görüntülenecek kelime bulunamadı.</div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          Geri Dön
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarks.has(currentWord.english);
  const isMemorized = memorized.has(currentWord.english);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto h-full justify-center px-4 py-6">
      
      {/* Top Toolbar */}
      <div className="w-full flex justify-end items-center mb-6">
        <div className="flex items-center gap-2">
          
          {/* Filter Buttons */}
          {initialWords.length > 1 && !isReviewMode && (
            <>
              <button
                onClick={() => setFilter('bookmarks')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-bold
                  ${filterMode === 'bookmarks'
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 ring-2 ring-yellow-400 ring-offset-1 dark:ring-offset-slate-900' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title="Sadece Favoriler"
              >
                <Bookmark size={16} className={filterMode === 'bookmarks' ? 'fill-current' : ''} />
                <span className="hidden sm:inline">Favoriler</span>
              </button>

              <button
                onClick={() => setFilter('memorized')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-bold
                  ${filterMode === 'memorized'
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 ring-2 ring-green-400 ring-offset-1 dark:ring-offset-slate-900' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title="Sadece Ezberlediklerim"
              >
                <CheckCircle size={16} className={filterMode === 'memorized' ? 'fill-current' : ''} />
                <span className="hidden sm:inline">Ezberlediklerim</span>
              </button>
            </>
          )}

          {!isReviewMode && (
            <>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button
                onClick={handleShuffle}
                disabled={filterMode !== 'all'}
                className={`p-2 rounded-full transition-all ${isShuffled ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'} ${filterMode !== 'all' ? 'opacity-30 cursor-not-allowed' : ''}`}
                title="Kartları Karıştır"
              >
                <Shuffle size={20} />
              </button>
            </>
          )}
          
          <button
            onClick={handleRestart}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            title="Başa Dön"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Progress Info */}
      <div className="flex flex-col items-center w-full mb-6">
        <div className={`font-bold tracking-wider text-xs mb-2 uppercase 
          ${isReviewMode ? 'text-rose-600 dark:text-rose-400' :
            filterMode === 'bookmarks' ? 'text-yellow-600 dark:text-yellow-500' : 
            filterMode === 'memorized' ? 'text-green-600 dark:text-green-500' : 
            'text-indigo-600 dark:text-indigo-400'}`}>
          {isReviewMode ? 'Günlük Tekrar Modu' :
           filterMode === 'bookmarks' ? 'Favoriler Çalışılıyor' : 
           filterMode === 'memorized' ? 'Ezberlenenler Tekrar Ediliyor' : 
           'Çalışma Modu'} • Kart {currentIndex + 1} / {activeDeck.length}
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full 
              ${isReviewMode ? 'bg-rose-500' :
                filterMode === 'bookmarks' ? 'bg-yellow-500' : 
                filterMode === 'memorized' ? 'bg-green-500' : 
                'bg-indigo-500'}`}
            style={{ width: `${((currentIndex + 1) / activeDeck.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card Container */}
      <div className="perspective-1000 w-full aspect-[4/3] sm:aspect-[3/2] relative group cursor-pointer" onClick={handleCardClick}>
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl hover:shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT SIDE */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 p-6 sm:p-10 transition-colors overflow-hidden">
            
            {/* Feedback Animation Overlay */}
            {feedback?.visible && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200 rounded-3xl">
                <div className="relative">
                   {/* Icon logic based on feedback.type */}
                   {feedback.type === 'success' && (
                       <>
                           <CheckCircle size={80} className="text-green-500 fill-green-100 dark:fill-green-900 animate-[bounce_0.5s_infinite]" />
                           <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-spin" size={32} />
                       </>
                   )}
                   {feedback.type === 'remove-memorized' && (
                       <MinusCircle size={80} className="text-slate-400 fill-slate-100 dark:fill-slate-800" />
                   )}
                   {feedback.type === 'bookmark' && (
                       <Bookmark size={80} className="text-yellow-500 fill-yellow-100 dark:fill-yellow-900 animate-[pulse_0.5s_ease-in-out]" />
                   )}
                   {feedback.type === 'remove-bookmark' && (
                       <BookmarkMinus size={80} className="text-rose-500 fill-rose-100 dark:fill-rose-900" />
                   )}
                </div>
                <span className={`text-2xl font-black mt-6 animate-in slide-in-from-bottom-2 duration-300 text-center px-4
                    ${feedback.type === 'success' ? 'text-green-600 dark:text-green-400' : ''}
                    ${feedback.type === 'remove-memorized' ? 'text-slate-500 dark:text-slate-400' : ''}
                    ${feedback.type === 'bookmark' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                    ${feedback.type === 'remove-bookmark' ? 'text-rose-600 dark:text-rose-400' : ''}
                `}>
                    {feedback.message}
                </span>
              </div>
            )}

            {/* Bookmark Toggle Icon (Left) */}
            {!isReviewMode && (
                <button 
                onClick={(e) => toggleBookmark(e, currentWord.english)}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 p-3 -ml-2 -mt-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10 group/btn"
                title="Favorilere Ekle/Çıkar"
                >
                <Bookmark 
                    size={28} 
                    className={`transition-colors duration-300 ${isBookmarked ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-300 dark:text-slate-600 group-hover/btn:text-slate-400'}`} 
                />
                </button>
            )}

            {/* Memorize Button (Right) */}
            {!isReviewMode && (
                <button 
                onClick={(e) => toggleMemorize(e, currentWord.english)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 -mr-2 -mt-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors z-10 group/btn flex flex-col items-center"
                title={isMemorized ? "Ezberlediklerimden Çıkar" : "Ezberledim"}
                >
                <CheckCircle 
                    size={28} 
                    className={`transition-colors duration-300 ${isMemorized ? 'fill-green-500 text-green-600 dark:text-green-400' : 'text-slate-300 dark:text-slate-600 group-hover/btn:text-green-500'}`} 
                />
                <span className="text-[10px] font-bold text-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity absolute top-full mt-1 whitespace-nowrap">
                    {isMemorized ? 'Ezberledim' : 'Ezberle'}
                </span>
                </button>
            )}
            
            <div className="flex-grow flex items-center justify-center w-full">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 dark:text-white text-center drop-shadow-sm break-words max-w-full leading-tight select-none">
                {currentWord.english}
              </h2>
            </div>
            
            <div className="absolute bottom-4 text-xs text-slate-300 dark:text-slate-600 font-medium uppercase tracking-widest">
              Çevirmek için dokun
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-slate-900 text-white rounded-3xl flex flex-col items-center justify-center p-6 sm:p-10 text-center shadow-inner border border-indigo-500 dark:border-slate-700">
            
            {/* Bookmark Indicator (Read Only on Back) */}
            {!isReviewMode && isBookmarked && (
              <div className="absolute top-6 left-6 opacity-80">
                 <Bookmark size={24} className="fill-white/30 text-white/30" />
              </div>
            )}

            {/* Memorized Indicator (Read Only on Back) */}
            {!isReviewMode && isMemorized && (
              <div className="absolute top-6 right-6 opacity-80">
                 <CheckCircle size={24} className="fill-white/30 text-white/30" />
              </div>
            )}

            <div className="flex-grow flex flex-col items-center justify-center">
              <h3 className="text-3xl sm:text-4xl font-bold mb-3 select-none">{currentWord.turkish}</h3>
              <p className="text-indigo-200 dark:text-indigo-300 text-sm italic mb-6 max-w-xs mx-auto border-b border-indigo-500/30 pb-4 select-none">
                {currentWord.context}
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 w-full">
                <p className="text-lg sm:text-xl font-medium mb-2 leading-relaxed">
                   "{currentWord.exampleEng}"
                </p>
                <p className="text-indigo-200 dark:text-indigo-300 text-sm sm:text-base opacity-90">
                   {currentWord.exampleTr}
                </p>
              </div>
            </div>

            {/* REVIEW MODE BUTTONS */}
            {isReviewMode && (
               <div className="absolute bottom-6 w-full px-6 flex gap-4 justify-center">
                  <button 
                    onClick={(e) => handleRate(e, false)}
                    className="flex-1 bg-white/20 hover:bg-rose-500/80 text-white border border-white/30 hover:border-rose-400 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm active:scale-95"
                  >
                     <XCircle size={20} /> Hatırlayamadım
                  </button>
                  <button 
                    onClick={(e) => handleRate(e, true)}
                    className="flex-1 bg-white/20 hover:bg-green-500/80 text-white border border-white/30 hover:border-green-400 rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-sm active:scale-95"
                  >
                     <ThumbsUp size={20} /> Hatırladım
                  </button>
               </div>
            )}

          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      {!isReviewMode && (
        <div className="flex justify-between items-center w-full mt-8 px-2 sm:px-4 gap-6">
            <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={currentIndex === 0}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-200 dark:hover:border-indigo-600 hover:text-indigo-600 dark:text-indigo-400 transition-all"
            >
            <ChevronLeft size={28} />
            </button>

            {currentIndex === activeDeck.length - 1 ? (
            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className={`flex-grow h-14 rounded-full text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2
                ${filterMode === 'bookmarks' ? 'bg-yellow-500 shadow-yellow-200 dark:shadow-none hover:bg-yellow-600' : 
                    filterMode === 'memorized' ? 'bg-green-600 shadow-green-200 dark:shadow-none hover:bg-green-700' :
                    'bg-indigo-600 shadow-indigo-200 dark:shadow-none hover:bg-indigo-700'}`}
            >
                {filterMode !== 'all' ? 'Bitir' : 'Üniteyi Bitir'} <ChevronRight size={20} />
            </button>
            ) : (
            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="flex-grow h-14 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-lg shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all flex items-center justify-center"
            >
                Sonraki
            </button>
            )}
        </div>
      )}
      
      {/* In Review Mode */}
      {isReviewMode && (
          <div className="mt-8">
              <button 
                onClick={onFinish}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium underline decoration-dotted underline-offset-4"
              >
                  Çalışmayı Bitir
              </button>
          </div>
      )}
    </div>
  );
};

export default FlashcardDeck;