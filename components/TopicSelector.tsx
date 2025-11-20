import React, { useState, useEffect } from 'react';
import { 
  BookOpen, GraduationCap, Bookmark, Target, Library, PencilRuler, Star, 
  School, Shapes, MessageCircle, Globe, Tv, Sun, Briefcase, Music, Heart, 
  MapPin, Film, Calendar, Zap, Smile, User, Utensils, Shirt, Home, Tent, 
  Quote, Play, BookType, CheckCircle, Layers 
} from 'lucide-react';

export type GradeLevel = '4' | '5' | '6' | '7' | '8';
export type StudyMode = 'vocabulary' | 'grammar';

export interface UnitDef {
  id: string;
  unitNo: string;
  title: string;
  icon: React.ReactNode;
}

interface TopicSelectorProps {
  selectedGrade: GradeLevel | null;
  selectedMode: StudyMode | null;
  selectedUnit: UnitDef | null;
  onSelectGrade: (grade: GradeLevel | null) => void;
  onSelectMode: (mode: StudyMode | null) => void;
  onSelectUnit: (unit: UnitDef | null) => void;
  onStartModule: (action: 'study' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar', unit: UnitDef) => void;
  onGoHome: () => void;
}

// --- DATA CONFIGURATION ---

const GRADE_CONFIG: Record<GradeLevel, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  '4': { 
    label: '4. Sınıf', 
    color: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    border: 'hover:border-orange-400 dark:hover:border-orange-500/50', 
    icon: <Star size={20} /> 
  },
  '5': { 
    label: '5. Sınıf', 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    border: 'hover:border-emerald-400 dark:hover:border-emerald-500/50', 
    icon: <Shapes size={20} /> 
  },
  '6': { 
    label: '6. Sınıf', 
    color: 'text-cyan-600 dark:text-cyan-400', 
    bg: 'bg-cyan-50 dark:bg-cyan-900/20', 
    border: 'hover:border-cyan-400 dark:hover:border-cyan-500/50', 
    icon: <Globe size={20} /> 
  },
  '7': { 
    label: '7. Sınıf', 
    color: 'text-violet-600 dark:text-violet-400', 
    bg: 'bg-violet-50 dark:bg-violet-900/20', 
    border: 'hover:border-violet-400 dark:hover:border-violet-500/50', 
    icon: <Zap size={20} /> 
  },
  '8': { 
    label: '8. Sınıf', 
    color: 'text-indigo-600 dark:text-indigo-400', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
    border: 'hover:border-indigo-400 dark:hover:border-indigo-500/50', 
    icon: <GraduationCap size={20} /> 
  },
};

// You can add more quotes here. They will rotate automatically.
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Hayatta en hakiki mürşit ilimdir.", author: "M. K. Atatürk" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Bir lisan bir insan, iki lisan iki insan.", author: "Atasözü" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Başarı, başarısızlıklar arasında hevesini kaybetmeden geçebilmektir.", author: "W. Churchill" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Bilgi güçtür.", author: "Francis Bacon" },
  { text: "Believe you can and you're halfway there.", author: "T. Roosevelt" },
  { text: "Zafer, 'Zafer benimdir' diyebilenindir.", author: "M. K. Atatürk" },
  { text: "Genius is 1% inspiration and 99% perspiration.", author: "Thomas Edison" },
  { text: "Aklın yolu birdir.", author: "Atasözü" }
];

export const UNIT_DATA: Record<GradeLevel, UnitDef[]> = {
  '4': [
    { id: 'g4u1', unitNo: '1. ÜNİTE', title: 'CLASSROOM RULES', icon: <School /> },
    { id: 'g4u2', unitNo: '2. ÜNİTE', title: 'NATIONALITY', icon: <Globe /> },
    { id: 'g4u3', unitNo: '3. ÜNİTE', title: 'CARTOON CHARACTERS', icon: <Smile /> },
    { id: 'g4u4', unitNo: '4. ÜNİTE', title: 'FREE TIME', icon: <Calendar /> },
    { id: 'g4u5', unitNo: '5. ÜNİTE', title: 'MY DAY', icon: <Sun /> },
    { id: 'g4u6', unitNo: '6. ÜNİTE', title: 'FUN WITH SCIENCE', icon: <Zap /> },
    { id: 'g4u7', unitNo: '7. ÜNİTE', title: 'JOBS', icon: <Briefcase /> },
    { id: 'g4u8', unitNo: '8. ÜNİTE', title: 'MY CLOTHES', icon: <Shirt /> },
    { id: 'g4u9', unitNo: '9. ÜNİTE', title: 'MY FRIENDS', icon: <User /> },
    { id: 'g4u10', unitNo: '10. ÜNİTE', title: 'FOOD AND DRINKS', icon: <Utensils /> },
    { id: 'g4all', unitNo: 'TAMAMI', title: 'ALL IN ONE (TÜM KELİMELER)', icon: <Layers /> },
  ],
  '5': [
    { id: 'g5u1', unitNo: '1. ÜNİTE', title: 'HELLO', icon: <MessageCircle /> },
    { id: 'g5u2', unitNo: '2. ÜNİTE', title: 'MY TOWN', icon: <MapPin /> },
    { id: 'g5u3', unitNo: '3. ÜNİTE', title: 'GAMES AND HOBBIES', icon: <Shapes /> },
    { id: 'g5u4', unitNo: '4. ÜNİTE', title: 'MY DAILY ROUTINE', icon: <Calendar /> },
    { id: 'g5u5', unitNo: '5. ÜNİTE', title: 'HEALTH', icon: <Heart /> },
    { id: 'g5u6', unitNo: '6. ÜNİTE', title: 'MOVIES', icon: <Film /> },
    { id: 'g5u7', unitNo: '7. ÜNİTE', title: 'PARTY TIME', icon: <Music /> },
    { id: 'g5u8', unitNo: '8. ÜNİTE', title: 'FITNESS', icon: <Zap /> },
    { id: 'g5u9', unitNo: '9. ÜNİTE', title: 'THE ANIMAL SHELTER', icon: <Tent /> },
    { id: 'g5u10', unitNo: '10. ÜNİTE', title: 'FESTIVALS', icon: <Star /> },
    { id: 'g5all', unitNo: 'TAMAMI', title: 'ALL IN ONE (TÜM KELİMELER)', icon: <Layers /> },
  ],
  '6': [
    { id: 'g6u1', unitNo: '1. ÜNİTE', title: 'LIFE', icon: <Sun /> },
    { id: 'g6u2', unitNo: '2. ÜNİTE', title: 'YUMMY BREAKFAST', icon: <Utensils /> },
    { id: 'g6u3', unitNo: '3. ÜNİTE', title: 'DOWNTOWN', icon: <MapPin /> },
    { id: 'g6u4', unitNo: '4. ÜNİTE', title: 'WEATHER AND EMOTIONS', icon: <Sun /> },
    { id: 'g6u5', unitNo: '5. ÜNİTE', title: 'AT THE FAIR', icon: <Star /> },
    { id: 'g6u6', unitNo: '6. ÜNİTE', title: 'OCCUPATIONS', icon: <Briefcase /> },
    { id: 'g6u7', unitNo: '7. ÜNİTE', title: 'HOLIDAYS', icon: <Globe /> },
    { id: 'g6u8', unitNo: '8. ÜNİTE', title: 'BOOKWORMS', icon: <Library /> },
    { id: 'g6u9', unitNo: '9. ÜNİTE', title: 'SAVING THE PLANET', icon: <Globe /> },
    { id: 'g6u10', unitNo: '10. ÜNİTE', title: 'DEMOCRACY', icon: <MessageCircle /> },
    { id: 'g6all', unitNo: 'TAMAMI', title: 'ALL IN ONE (TÜM KELİMELER)', icon: <Layers /> },
  ],
  '7': [
    { id: 'g7u1', unitNo: '1. ÜNİTE', title: 'APPEARANCE AND PERSONALITY', icon: <User /> },
    { id: 'g7u2', unitNo: '2. ÜNİTE', title: 'SPORTS', icon: <Zap /> },
    { id: 'g7u3', unitNo: '3. ÜNİTE', title: 'BIOGRAPHIES', icon: <Library /> },
    { id: 'g7u4', unitNo: '4. ÜNİTE', title: 'WILD ANIMALS', icon: <Tent /> },
    { id: 'g7u5', unitNo: '5. ÜNİTE', title: 'TELEVISION', icon: <Tv /> },
    { id: 'g7u6', unitNo: '6. ÜNİTE', title: 'CELEBRATIONS', icon: <Star /> },
    { id: 'g7u7', unitNo: '7. ÜNİTE', title: 'DREAMS', icon: <Sun /> },
    { id: 'g7u8', unitNo: '8. ÜNİTE', title: 'PUBLIC BUILDINGS', icon: <MapPin /> },
    { id: 'g7u9', unitNo: '9. ÜNİTE', title: 'ENVIRONMENT', icon: <Globe /> },
    { id: 'g7u10', unitNo: '10. ÜNİTE', title: 'PLANETS', icon: <Shapes /> },
    { id: 'g7all', unitNo: 'TAMAMI', title: 'ALL IN ONE (TÜM KELİMELER)', icon: <Layers /> },
  ],
  '8': [
    { id: 'u1', unitNo: '8. Sınıf Ünite 1', title: 'Friendship', icon: <User /> },
    { id: 'u2', unitNo: '8. Sınıf Ünite 2', title: 'Teen Life', icon: <Music /> },
    { id: 'u3', unitNo: '8. Sınıf Ünite 3', title: 'In The Kitchen', icon: <Utensils /> },
    { id: 'u4', unitNo: '8. Sınıf Ünite 4', title: 'On The Phone', icon: <MessageCircle /> },
    { id: 'u5', unitNo: '8. Sınıf Ünite 5', title: 'The Internet', icon: <Globe /> },
    { id: 'u6', unitNo: '8. Sınıf Ünite 6', title: 'Adventures', icon: <Zap /> },
    { id: 'u7', unitNo: '8. Sınıf Ünite 7', title: 'Tourism', icon: <MapPin /> },
    { id: 'u8', unitNo: '8. Sınıf Ünite 8', title: 'Chores', icon: <Briefcase /> },
    { id: 'u9', unitNo: '8. Sınıf Ünite 9', title: 'Science', icon: <Shapes /> },
    { id: 'u10', unitNo: '8. Sınıf Ünite 10', title: 'Natural Forces', icon: <Sun /> },
    { id: 'uAll', unitNo: 'TAMAMI', title: 'ALL IN ONE (TÜM KELİMELER)', icon: <Layers /> },
  ]
};

const TopicSelector: React.FC<TopicSelectorProps> = ({ 
  selectedGrade, 
  selectedMode, 
  selectedUnit, 
  onSelectGrade, 
  onSelectMode, 
  onSelectUnit,
  onStartModule,
  onGoHome
}) => {

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (QUOTES.length === 0) return;
    
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000); // Rotate every 6 seconds
    
    return () => clearInterval(timer);
  }, []);

  const renderBreadcrumbs = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap pb-2">
        <button onClick={onGoHome} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center">
          <Home size={14} className="mr-1" /> Ana Sayfa
        </button>
        {selectedGrade && (
          <>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <button 
              onClick={() => { onSelectMode(null); onSelectUnit(null); }}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${!selectedMode ? 'font-bold text-slate-800 dark:text-white' : ''}`}
            >
              {GRADE_CONFIG[selectedGrade].label}
            </button>
          </>
        )}
        {selectedUnit && (
          <>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-none">{selectedUnit.title}</span>
          </>
        )}
      </div>
    </div>
  );

  // Define the order of grades explicitly (8 to 4)
  const gradeOrder: GradeLevel[] = ['8', '7', '6', '5', '4'];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      {/* Breadcrumbs */}
      {(selectedGrade || selectedUnit || selectedMode) && renderBreadcrumbs()}

      {/* Grade Selection Grid (HOME VIEW) */}
      {!selectedGrade && !selectedUnit && !selectedMode && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              Kelim<span className="text-indigo-600 dark:text-indigo-400">App</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Sınıfını seç, üniteleri keşfet, kelimeleri öğren ve kendini test et.
              Başarıya giden yolda ilk adımı at!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* Grade Buttons - Reversed Order (8 -> 4) */}
            {gradeOrder.map((grade) => {
              const conf = GRADE_CONFIG[grade];
              return (
                <button
                  key={grade}
                  onClick={() => onSelectGrade(grade)}
                  className={`relative group p-5 rounded-2xl border-2 ${conf.bg} border-transparent ${conf.border} hover:shadow-lg dark:hover:shadow-none transition-all duration-300 flex flex-col items-center justify-center text-center h-32 sm:h-auto min-h-[120px]`}
                >
                  <div className={`mb-3 p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform duration-300 ${conf.color}`}>
                    {conf.icon}
                  </div>
                  <span className={`font-bold text-lg ${conf.color.split(' ')[0]}`}>
                    {conf.label}
                  </span>
                </button>
              );
            })}

            {/* MOTIVATION QUOTE CARD */}
            <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-default
                bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none overflow-hidden h-32 sm:h-auto min-h-[120px] group">
                
                <div className="absolute top-2 right-2 opacity-20">
                  <Quote size={40} />
                </div>
                
                <div className="z-10 text-center w-full flex flex-col h-full justify-between">
                   <div className="flex-grow flex items-center justify-center overflow-hidden">
                     {QUOTES.length > 0 && (
                       <p 
                          key={quoteIndex} 
                          className="text-sm font-bold italic leading-snug animate-in fade-in slide-in-from-bottom-2 duration-500 line-clamp-3"
                       >
                         "{QUOTES[quoteIndex].text}"
                       </p>
                     )}
                   </div>
                   {QUOTES.length > 0 && (
                     <p className="text-[10px] font-medium uppercase tracking-widest opacity-80 mt-2 truncate w-full">
                       — {QUOTES[quoteIndex].author}
                     </p>
                   )}
                </div>
             </div>
          </div>
        </>
      )}

      {/* Unit Selection Grid */}
      {selectedGrade && !selectedUnit && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               {GRADE_CONFIG[selectedGrade].icon}
               <span>{GRADE_CONFIG[selectedGrade].label} Üniteleri</span>
             </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UNIT_DATA[selectedGrade].map((unit) => {
              const isAllInOne = unit.id.endsWith('all') || unit.id === 'uAll';
              return (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  className={`group p-5 rounded-2xl border transition-all text-left flex items-center gap-4
                    ${isAllInOne 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 hover:shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md dark:hover:shadow-none'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors 
                    ${isAllInOne 
                      ? 'bg-indigo-500 text-white' 
                      : `${GRADE_CONFIG[selectedGrade].bg} ${GRADE_CONFIG[selectedGrade].color}`
                    }`}>
                    {unit.icon}
                  </div>
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isAllInOne ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {unit.unitNo}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {unit.title}
                    </div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-indigo-400">
                    <Target size={20} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode Selection (Inside a Unit) */}
      {selectedUnit && (
        <div className="animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-lg 
               ${(selectedUnit.id.endsWith('all') || selectedUnit.id === 'uAll')
                  ? 'bg-indigo-500 text-white'
                  : `${GRADE_CONFIG[selectedGrade!].bg} ${GRADE_CONFIG[selectedGrade!].color}`
               }`}>
               {selectedUnit.icon}
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{selectedUnit.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{selectedUnit.unitNo}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Kelime Çalış */}
            <button
              onClick={() => onStartModule('study', selectedUnit)}
              className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-150 transition-transform duration-700">
                <BookOpen size={100} />
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Play size={32} fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold mb-1">Kelime Çalış</h3>
              <p className="text-indigo-100 text-sm">Kartlarla kelimeleri öğren</p>
            </button>

            {/* 2. Test Çöz */}
            <button
              onClick={() => onStartModule('quiz', selectedUnit)}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-800 dark:text-white p-6 rounded-3xl transition-all flex flex-col items-center text-center"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 transform group-hover:scale-150 transition-transform duration-700">
                <Target size={100} />
              </div>
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                <PencilRuler size={32} />
              </div>
              <h3 className="text-xl font-bold mb-1">Test Çöz</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Kendini dene</p>
            </button>

            {/* 3. Favori Test */}
            <button
              onClick={() => onStartModule('quiz-bookmarks', selectedUnit)}
              className="group relative overflow-hidden bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-500 text-rose-800 dark:text-rose-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-200 rounded-2xl flex items-center justify-center mb-3">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Favori Test</h3>
              <p className="text-rose-600/80 dark:text-rose-300/80 text-sm">Favorilerinle kendini dene</p>
            </button>
            
             {/* 4. Ezberlediklerimle Quiz */}
             <button
              onClick={() => onStartModule('quiz-memorized', selectedUnit)}
              className="group relative overflow-hidden bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-500 text-green-800 dark:text-green-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Ezberlediklerimle Quiz</h3>
              <p className="text-green-600/80 dark:text-green-300/80 text-sm">Ezberlediklerini test et</p>
            </button>

            {/* 5. Gramer Çalış - AT BOTTOM, SPAN-2 */}
            <button
              onClick={() => onStartModule('grammar', selectedUnit)}
              className="group relative overflow-hidden bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-500 text-teal-800 dark:text-teal-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center sm:col-span-2"
            >
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-200 rounded-2xl flex items-center justify-center mb-3">
                <BookType size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Gramer Çalış</h3>
              <p className="text-teal-600/80 dark:text-teal-300/80 text-sm">Konu anlatımı ve ipuçları</p>
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSelector;