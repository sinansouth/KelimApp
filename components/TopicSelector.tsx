import React, { useState, useEffect } from 'react';
import { 
  BookOpen, GraduationCap, Bookmark, Target, Library, PencilRuler, Star, 
  School, Shapes, MessageCircle, Globe, Tv, Sun, Briefcase, Music, Heart, 
  MapPin, Film, Calendar, Zap, Smile, User, Utensils, Shirt, Home, Tent, 
  Play, BookType, CheckCircle, Layers, Flame, Baby, Award, PenTool,
  ListChecks, MousePointerClick, RefreshCw, BrainCircuit, ChevronRight, History
} from 'lucide-react';
import { VOCABULARY } from '../data/vocabulary';
import { getMemorizedSet, getUserStats, getNextDailyGoal, getDueWords, getLastActivity, LastActivity } from '../services/userService';

// Updated Grade Levels
export type GradeLevel = 
  | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' // General English
  | '12' | '11' | '10' | '9'               // High School
  | '8' | '7' | '6' | '5'                  // Middle School
  | '4' | '3' | '2';                       // Primary School

export type StudyMode = 'vocabulary' | 'grammar';
export type CategoryType = 'GENERAL' | 'HIGH_SCHOOL' | 'MIDDLE_SCHOOL' | 'PRIMARY_SCHOOL';

export interface UnitDef {
  id: string;
  unitNo: string;
  title: string;
  icon: React.ReactNode;
}

interface TopicSelectorProps {
  selectedCategory: CategoryType | null;
  selectedGrade: GradeLevel | null;
  selectedMode: StudyMode | null;
  selectedUnit: UnitDef | null;
  onSelectCategory: (cat: CategoryType | null) => void;
  onSelectGrade: (grade: GradeLevel | null) => void;
  onSelectMode: (mode: StudyMode | null) => void;
  onSelectUnit: (unit: UnitDef | null) => void;
  onStartModule: (action: 'study' | 'quiz' | 'quiz-bookmarks' | 'quiz-memorized' | 'grammar' | 'practice-select' | 'review' | 'review-flashcards', unit: UnitDef, count?: number) => void;
  onGoHome: () => void;
}

// --- DATA CONFIGURATION ---

const GRADE_CONFIG: Record<GradeLevel, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  // General English
  'A1': { label: 'A1 - Beginner', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', border: 'hover:border-fuchsia-400', icon: <Award size={20} /> },
  'A2': { label: 'A2 - Elementary', color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', border: 'hover:border-fuchsia-400', icon: <Award size={20} /> },
  'B1': { label: 'B1 - Intermediate', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'hover:border-purple-400', icon: <Award size={20} /> },
  'B2': { label: 'B2 - Upper Int.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'hover:border-purple-400', icon: <Award size={20} /> },
  'C1': { label: 'C1 - Advanced', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-400', icon: <Award size={20} /> },
  'C2': { label: 'C2 - Proficient', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-400', icon: <Award size={20} /> },

  // High School
  '12': { label: '12. Sınıf', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'hover:border-rose-400', icon: <GraduationCap size={20} /> },
  '11': { label: '11. Sınıf', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'hover:border-rose-400', icon: <BookOpen size={20} /> },
  '10': { label: '10. Sınıf', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'hover:border-orange-400', icon: <Library size={20} /> },
  '9': { label: '9. Sınıf', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'hover:border-orange-400', icon: <School size={20} /> },

  // Middle School
  '8': { label: '8. Sınıf', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'hover:border-indigo-400', icon: <GraduationCap size={20} /> },
  '7': { label: '7. Sınıf', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'hover:border-violet-400', icon: <Zap size={20} /> },
  '6': { label: '6. Sınıf', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'hover:border-cyan-400', icon: <Globe size={20} /> },
  '5': { label: '5. Sınıf', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'hover:border-emerald-400', icon: <Shapes size={20} /> },

  // Primary School
  '4': { label: '4. Sınıf', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'hover:border-teal-400', icon: <Star size={20} /> },
  '3': { label: '3. Sınıf', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'hover:border-green-400', icon: <Smile size={20} /> },
  '2': { label: '2. Sınıf', color: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-900/20', border: 'hover:border-lime-400', icon: <Baby size={20} /> },
};

export const UNIT_DATA: Record<GradeLevel, UnitDef[]> = {
  // --- GENERAL ENGLISH ---
  'A1': [{ id: 'gen_a1', unitNo: 'LEVEL A1', title: 'Beginner Vocabulary', icon: <Star /> }],
  'A2': [{ id: 'gen_a2', unitNo: 'LEVEL A2', title: 'Elementary Vocabulary', icon: <Star /> }],
  'B1': [{ id: 'gen_b1', unitNo: 'LEVEL B1', title: 'Intermediate Vocabulary', icon: <Star /> }],
  'B2': [{ id: 'gen_b2', unitNo: 'LEVEL B2', title: 'Upper Intermediate', icon: <Star /> }],
  'C1': [{ id: 'gen_c1', unitNo: 'LEVEL C1', title: 'Advanced Vocabulary', icon: <Star /> }],
  'C2': [{ id: 'gen_c2', unitNo: 'LEVEL C2', title: 'Proficiency Vocabulary', icon: <Star /> }],

  // --- HIGH SCHOOL ---
  '12': [
    { id: 'g12u1', unitNo: '1. ÜNİTE', title: 'MUSIC', icon: <Music /> },
    { id: 'g12u2', unitNo: '2. ÜNİTE', title: 'FRIENDSHIP', icon: <User /> },
    { id: 'g12u3', unitNo: '3. ÜNİTE', title: 'HUMAN RIGHTS', icon: <Globe /> },
    { id: 'g12u4', unitNo: '4. ÜNİTE', title: 'COMING SOON', icon: <Calendar /> },
    { id: 'g12u5', unitNo: '5. ÜNİTE', title: 'PSYCHOLOGY', icon: <Brain /> }, 
    { id: 'g12u6', unitNo: '6. ÜNİTE', title: 'FAVORS', icon: <Heart /> },
    { id: 'g12u7', unitNo: '7. ÜNİTE', title: 'NEWS STORIES', icon: <Tv /> },
    { id: 'g12u8', unitNo: '8. ÜNİTE', title: 'ALTERNATIVE ENERGY', icon: <Zap /> },
    { id: 'g12u9', unitNo: '9. ÜNİTE', title: 'TECHNOLOGY', icon: <MessageCircle /> },
    { id: 'g12u10', unitNo: '10. ÜNİTE', title: 'MANNERS', icon: <User /> },
    { id: 'g12all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '11': [
    { id: 'g11u1', unitNo: '1. ÜNİTE', title: 'FUTURE JOBS', icon: <Briefcase /> },
    { id: 'g11u2', unitNo: '2. ÜNİTE', title: 'HOBBIES AND SKILLS', icon: <PenTool /> },
    { id: 'g11u3', unitNo: '3. ÜNİTE', title: 'HARD TIMES', icon: <Zap /> },
    { id: 'g11u4', unitNo: '4. ÜNİTE', title: 'WHAT A LIFE', icon: <Star /> },
    { id: 'g11u5', unitNo: '5. ÜNİTE', title: 'BACK TO THE PAST', icon: <Clock /> },
    { id: 'g11u6', unitNo: '6. ÜNİTE', title: 'OPEN YOUR HEART', icon: <Heart /> },
    { id: 'g11u7', unitNo: '7. ÜNİTE', title: 'FACTS ABOUT TURKEY', icon: <MapPin /> },
    { id: 'g11u8', unitNo: '8. ÜNİTE', title: 'SPORTS', icon: <Zap /> },
    { id: 'g11u9', unitNo: '9. ÜNİTE', title: 'MY FRIENDS', icon: <User /> },
    { id: 'g11u10', unitNo: '10. ÜNİTE', title: 'VALUES AND NORMS', icon: <Library /> },
    { id: 'g11all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '10': [
    { id: 'g10u1', unitNo: '1. ÜNİTE', title: 'SCHOOL LIFE', icon: <School /> },
    { id: 'g10u2', unitNo: '2. ÜNİTE', title: 'PLANS', icon: <Calendar /> },
    { id: 'g10u3', unitNo: '3. ÜNİTE', title: 'LEGENDARY FIGURES', icon: <Star /> },
    { id: 'g10u4', unitNo: '4. ÜNİTE', title: 'TRADITIONS', icon: <Globe /> },
    { id: 'g10u5', unitNo: '5. ÜNİTE', title: 'TRAVEL', icon: <MapPin /> },
    { id: 'g10u6', unitNo: '6. ÜNİTE', title: 'HELPFUL TIPS', icon: <CheckCircle /> },
    { id: 'g10u7', unitNo: '7. ÜNİTE', title: 'FOOD AND FESTIVALS', icon: <Utensils /> },
    { id: 'g10u8', unitNo: '8. ÜNİTE', title: 'DIGITAL ERA', icon: <MessageCircle /> },
    { id: 'g10u9', unitNo: '9. ÜNİTE', title: 'MODERN HEROES', icon: <Award /> },
    { id: 'g10u10', unitNo: '10. ÜNİTE', title: 'SHOPPING', icon: <Briefcase /> },
    { id: 'g10all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '9': [
    { id: 'g9u1', unitNo: '1. ÜNİTE', title: 'STUDYING ABROAD', icon: <Globe /> },
    { id: 'g9u2', unitNo: '2. ÜNİTE', title: 'MY ENVIRONMENT', icon: <MapPin /> },
    { id: 'g9u3', unitNo: '3. ÜNİTE', title: 'MOVIES', icon: <Film /> },
    { id: 'g9u4', unitNo: '4. ÜNİTE', title: 'HUMAN IN NATURE', icon: <Tent /> },
    { id: 'g9u5', unitNo: '5. ÜNİTE', title: 'INSPIRATIONAL PEOPLE', icon: <Star /> },
    { id: 'g9u6', unitNo: '6. ÜNİTE', title: 'BRIDGING CULTURES', icon: <Globe /> },
    { id: 'g9u7', unitNo: '7. ÜNİTE', title: 'WORLD HERITAGE', icon: <Library /> },
    { id: 'g9u8', unitNo: '8. ÜNİTE', title: 'EMERGENCY & HEALTH', icon: <Heart /> },
    { id: 'g9u9', unitNo: '9. ÜNİTE', title: 'INVITATIONS', icon: <MessageCircle /> },
    { id: 'g9u10', unitNo: '10. ÜNİTE', title: 'TV & SOCIAL MEDIA', icon: <Tv /> },
    { id: 'g9all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],

  // --- MIDDLE SCHOOL ---
  '8': [
    { id: 'u1', unitNo: '1. ÜNİTE', title: 'Friendship', icon: <User /> },
    { id: 'u2', unitNo: '2. ÜNİTE', title: 'Teen Life', icon: <Music /> },
    { id: 'u3', unitNo: '3. ÜNİTE', title: 'In The Kitchen', icon: <Utensils /> },
    { id: 'u4', unitNo: '4. ÜNİTE', title: 'On The Phone', icon: <MessageCircle /> },
    { id: 'u5', unitNo: '5. ÜNİTE', title: 'The Internet', icon: <Globe /> },
    { id: 'u6', unitNo: '6. ÜNİTE', title: 'Adventures', icon: <Zap /> },
    { id: 'u7', unitNo: '7. ÜNİTE', title: 'Tourism', icon: <MapPin /> },
    { id: 'u8', unitNo: '8. ÜNİTE', title: 'Chores', icon: <Briefcase /> },
    { id: 'u9', unitNo: '9. ÜNİTE', title: 'Science', icon: <Shapes /> },
    { id: 'u10', unitNo: '10. ÜNİTE', title: 'Natural Forces', icon: <Sun /> },
    { id: 'uAll', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '7': [
    { id: 'g7u1', unitNo: '1. ÜNİTE', title: 'APPEARANCE', icon: <User /> },
    { id: 'g7u2', unitNo: '2. ÜNİTE', title: 'SPORTS', icon: <Zap /> },
    { id: 'g7u3', unitNo: '3. ÜNİTE', title: 'BIOGRAPHIES', icon: <Library /> },
    { id: 'g7u4', unitNo: '4. ÜNİTE', title: 'WILD ANIMALS', icon: <Tent /> },
    { id: 'g7u5', unitNo: '5. ÜNİTE', title: 'TELEVISION', icon: <Tv /> },
    { id: 'g7u6', unitNo: '6. ÜNİTE', title: 'CELEBRATIONS', icon: <Star /> },
    { id: 'g7u7', unitNo: '7. ÜNİTE', title: 'DREAMS', icon: <Sun /> },
    { id: 'g7u8', unitNo: '8. ÜNİTE', title: 'PUBLIC BUILDINGS', icon: <MapPin /> },
    { id: 'g7u9', unitNo: '9. ÜNİTE', title: 'ENVIRONMENT', icon: <Globe /> },
    { id: 'g7u10', unitNo: '10. ÜNİTE', title: 'PLANETS', icon: <Shapes /> },
    { id: 'g7all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
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
    { id: 'g6all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
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
    { id: 'g5all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],

  // --- PRIMARY SCHOOL ---
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
    { id: 'g4all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '3': [
    { id: 'g3u1', unitNo: '1. ÜNİTE', title: 'GREETING', icon: <MessageCircle /> },
    { id: 'g3u2', unitNo: '2. ÜNİTE', title: 'MY FAMILY', icon: <User /> },
    { id: 'g3u3', unitNo: '3. ÜNİTE', title: 'PEOPLE I LOVE', icon: <Heart /> },
    { id: 'g3u4', unitNo: '4. ÜNİTE', title: 'FEELINGS', icon: <Smile /> },
    { id: 'g3u5', unitNo: '5. ÜNİTE', title: 'TOYS AND GAMES', icon: <Shapes /> },
    { id: 'g3u6', unitNo: '6. ÜNİTE', title: 'MY HOUSE', icon: <Home /> },
    { id: 'g3u7', unitNo: '7. ÜNİTE', title: 'IN MY CITY', icon: <MapPin /> },
    { id: 'g3u8', unitNo: '8. ÜNİTE', title: 'TRANSPORTATION', icon: <Briefcase /> },
    { id: 'g3u9', unitNo: '9. ÜNİTE', title: 'WEATHER', icon: <Sun /> },
    { id: 'g3u10', unitNo: '10. ÜNİTE', title: 'NATURE', icon: <Tent /> },
    { id: 'g3all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
  '2': [
    { id: 'g2u1', unitNo: '1. ÜNİTE', title: 'SCHOOL LIFE', icon: <School /> },
    { id: 'g2u2', unitNo: '2. ÜNİTE', title: 'CLASSROOM LIFE', icon: <PencilRuler /> },
    { id: 'g2u3', unitNo: '3. ÜNİTE', title: 'PERSONAL LIFE', icon: <User /> },
    { id: 'g2u4', unitNo: '4. ÜNİTE', title: 'FAMILY LIFE', icon: <Heart /> },
    { id: 'g2u5', unitNo: '5. ÜNİTE', title: 'HOMES & NEIGHBOURHOODS', icon: <Home /> },
    { id: 'g2u6', unitNo: '6. ÜNİTE', title: 'LIFE IN THE CITY', icon: <MapPin /> },
    { id: 'g2all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: <Layers /> },
  ],
};

function Brain(props: React.ComponentProps<"svg">) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
      </svg>
    )
}

function Clock(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}


const TopicSelector: React.FC<TopicSelectorProps> = ({ 
  selectedCategory,
  selectedGrade, 
  selectedMode, 
  selectedUnit, 
  onSelectCategory,
  onSelectGrade, 
  onSelectMode, 
  onSelectUnit,
  onStartModule,
  onGoHome
}) => {

  const [memorizedSet, setMemorizedSet] = useState<Set<string>>(new Set());
  const [dailyProgress, setDailyProgress] = useState({ current: 0, target: 5, streak: 0 });
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<{grade: GradeLevel, unit: UnitDef} | null>(null);
  
  // Quiz Configuration State
  const [quizConfigMode, setQuizConfigMode] = useState(false);

  useEffect(() => {
    setMemorizedSet(getMemorizedSet());
    const stats = getUserStats();
    const totalInteractions = (stats.flashcardsViewed || 0) + (stats.quizCorrect || 0) + (stats.quizWrong || 0);
    setDailyProgress({
       current: totalInteractions,
       target: stats.dailyGoal || 5,
       streak: stats.streak || 0
    });
    
    // Check for SRS Due words
    const dueWords = getDueWords();
    setDueReviewCount(dueWords.length);

    // Check for Last Activity
    const lastAct = getLastActivity();
    if (lastAct && UNIT_DATA[lastAct.grade as GradeLevel]) {
        const unit = UNIT_DATA[lastAct.grade as GradeLevel].find(u => u.id === lastAct.unitId);
        if (unit) {
            setLastActivity({
                grade: lastAct.grade as GradeLevel,
                unit: unit
            });
        }
    }

    setQuizConfigMode(false);
  }, [selectedGrade, selectedUnit, selectedCategory]);

  const handleGoBackToCategories = () => {
    onSelectCategory(null);
    onSelectGrade(null);
  };

  const handleContinueLastActivity = () => {
      if (!lastActivity) return;
      
      // Determine Category from Grade
      const grade = lastActivity.grade;
      let category: CategoryType = 'GENERAL';
      
      if (['9', '10', '11', '12'].includes(grade)) category = 'HIGH_SCHOOL';
      else if (['5', '6', '7', '8'].includes(grade)) category = 'MIDDLE_SCHOOL';
      else if (['2', '3', '4'].includes(grade)) category = 'PRIMARY_SCHOOL';
      
      onSelectCategory(category);
      onSelectGrade(grade);
      onSelectUnit(lastActivity.unit);
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        <button onClick={onGoHome} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center active:scale-95">
          <Home size={14} className="mr-1" /> Ana Sayfa
        </button>
        
        {selectedCategory && (
           <>
             <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
             <button 
               onClick={handleGoBackToCategories} 
               className={`hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors active:scale-95 ${!selectedGrade ? 'font-bold text-slate-800 dark:text-white' : ''}`}
             >
               {selectedCategory === 'GENERAL' && 'Genel İngilizce'}
               {selectedCategory === 'HIGH_SCHOOL' && 'Lise'}
               {selectedCategory === 'MIDDLE_SCHOOL' && 'Ortaokul'}
               {selectedCategory === 'PRIMARY_SCHOOL' && 'İlkokul'}
             </button>
           </>
        )}

        {selectedGrade && (
          <>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <button 
              onClick={() => { onSelectMode(null); onSelectUnit(null); }}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors active:scale-95 ${!selectedMode ? 'font-bold text-slate-800 dark:text-white' : ''}`}
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

  // Determine which grades to show based on category
  let visibleGrades: GradeLevel[] = [];
  if (selectedCategory === 'GENERAL') visibleGrades = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (selectedCategory === 'HIGH_SCHOOL') visibleGrades = ['9', '10', '11', '12'];
  if (selectedCategory === 'MIDDLE_SCHOOL') visibleGrades = ['5', '6', '7', '8'];
  if (selectedCategory === 'PRIMARY_SCHOOL') visibleGrades = ['2', '3', '4'];

  // Daily Goal Widget
  const goalPercent = Math.min(100, Math.round((dailyProgress.current / dailyProgress.target) * 100));

  // Fake Unit for Review Button
  const reviewUnitMock: UnitDef = { id: 'review', unitNo: 'SRS', title: 'Günlük Tekrar', icon: <RefreshCw /> };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-500 pb-20">
      
      {/* Breadcrumbs */}
      {(selectedCategory || selectedGrade || selectedUnit || selectedMode) && renderBreadcrumbs()}

      {/* --- VIEW 1: CATEGORY SELECTION (HOME) --- */}
      {!selectedCategory && !selectedGrade && !selectedUnit && !selectedMode && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">
              Kelim<span className="text-indigo-600 dark:text-indigo-400">App</span>
            </h1>

            {/* Horizontal Compact Daily Goal & Streak Summary */}
            <div className="mt-6 max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-2 px-4 flex items-center justify-between gap-4 shadow-sm">
               <div className="flex items-center gap-3 flex-grow">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Target size={16} />
                  </div>
                  <div className="flex flex-col w-full">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        <span className="uppercase tracking-wider">Günlük Hedef</span>
                        {/* Current capped at target for display */}
                        <span>{Math.min(dailyProgress.current, dailyProgress.target)}/{dailyProgress.target}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${goalPercent}%` }}
                        ></div>
                      </div>
                  </div>
               </div>
               
               {/* Vertical Separator */}
               <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>

               {/* Streak */}
               <div className="flex items-center gap-2 shrink-0">
                  <Flame size={18} className={`${dailyProgress.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  <div className="flex flex-col leading-none">
                     <span className={`text-sm font-black ${dailyProgress.streak > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{dailyProgress.streak}</span>
                     <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Gün Seri</span>
                  </div>
               </div>
            </div>
            
             {/* Goal Completion Message */}
             {dailyProgress.current >= dailyProgress.target && (
               <div className="text-center mt-2 animate-in fade-in slide-in-from-bottom-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                     <CheckCircle size={12} /> Hedef Tamamlandı! Yarınki hedef: {getNextDailyGoal(dailyProgress.target)}
                  </span>
               </div>
            )}
          </div>
          
          {/* Last Studied Section (If Exists) */}
          {lastActivity && (
             <div className="max-w-2xl mx-auto mb-4 animate-in zoom-in duration-300">
                <button
                  onClick={handleContinueLastActivity}
                  className="w-full p-1 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 group transition-all shadow-sm active:scale-[0.98] active:bg-slate-50 dark:active:bg-slate-800"
                >
                   <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm ${GRADE_CONFIG[lastActivity.grade].bg.replace('bg-', 'bg-opacity-100 bg-').replace('/20', '')} ${GRADE_CONFIG[lastActivity.grade].color.replace('text-', 'bg-').split(' ')[0]}`}>
                      {lastActivity.unit.icon}
                   </div>
                   <div className="flex-grow text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                         <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Kaldığın Yer</span>
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{GRADE_CONFIG[lastActivity.grade].label}</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-white truncate">{lastActivity.unit.title}</div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                      <ChevronRight size={18} />
                   </div>
                </button>
             </div>
          )}

          {/* Daily Review (SRS) Section - Always Visible if items due */}
          {dueReviewCount > 0 && (
            <div className={`max-w-2xl mx-auto mb-8 animate-in zoom-in duration-300 border rounded-3xl p-6 shadow-lg transition-all
                bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/30 dark:to-rose-900/20 border-rose-200 dark:border-rose-800 shadow-rose-100 dark:shadow-none`}>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg dark:shadow-none text-white bg-rose-500 shadow-rose-300">
                            <RefreshCw className="animate-spin-slow" size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-xl text-rose-800 dark:text-rose-100">
                                Günlük Tekrar
                            </h3>
                            <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                                <span className="font-bold text-rose-700 dark:text-rose-200">{dueReviewCount}</span> kelime tekrar edilmeyi bekliyor!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => onStartModule('review-flashcards', reviewUnitMock)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 active:bg-rose-50 dark:active:bg-slate-700 border-2 border-rose-200 dark:border-rose-800 rounded-xl font-bold text-rose-600 dark:text-rose-400 transition-all shadow-sm active:scale-95"
                    >
                        <BookOpen size={18} /> Kartlar
                    </button>
                    <button 
                        onClick={() => onStartModule('review', reviewUnitMock)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 active:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200 dark:shadow-none active:scale-95"
                    >
                        <BrainCircuit size={18} /> Quiz
                    </button>
                </div>
            </div>
          )}

          {/* Main Categories Grid - Mobile Optimized (Single Column usually) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <button 
               onClick={() => onSelectCategory('GENERAL')}
               className="p-6 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg active:scale-[0.98] transition-all duration-300 text-left relative overflow-hidden group min-h-[140px]"
             >
                <Award size={40} className="mb-3 text-white/80" />
                <h3 className="text-2xl font-bold">Genel İngilizce</h3>
                <p className="text-white/80 text-sm font-medium mt-1">A1 - C2 Seviyeleri</p>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                   <Globe size={100} />
                </div>
             </button>

             <button 
               onClick={() => onSelectCategory('HIGH_SCHOOL')}
               className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg active:scale-[0.98] transition-all duration-300 text-left relative overflow-hidden group min-h-[140px]"
             >
                <Library size={40} className="mb-3 text-white/80" />
                <h3 className="text-2xl font-bold">Lise</h3>
                <p className="text-white/80 text-sm font-medium mt-1">9, 10, 11, 12. Sınıf</p>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                   <GraduationCap size={100} />
                </div>
             </button>

             <button 
               onClick={() => onSelectCategory('MIDDLE_SCHOOL')}
               className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg active:scale-[0.98] transition-all duration-300 text-left relative overflow-hidden group min-h-[140px]"
             >
                <School size={40} className="mb-3 text-white/80" />
                <h3 className="text-2xl font-bold">Ortaokul</h3>
                <p className="text-white/80 text-sm font-medium mt-1">5, 6, 7, 8. Sınıf</p>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                   <Shapes size={100} />
                </div>
             </button>

             <button 
               onClick={() => onSelectCategory('PRIMARY_SCHOOL')}
               className="p-6 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg active:scale-[0.98] transition-all duration-300 text-left relative overflow-hidden group min-h-[140px]"
             >
                <Smile size={40} className="mb-3 text-white/80" />
                <h3 className="text-2xl font-bold">İlkokul</h3>
                <p className="text-white/80 text-sm font-medium mt-1">2, 3, 4. Sınıf</p>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                   <Star size={100} />
                </div>
             </button>
          </div>
        </>
      )}

      {/* --- VIEW 2: GRADE SELECTION (WITHIN CATEGORY) --- */}
      {selectedCategory && !selectedGrade && !selectedUnit && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Seviye Seçiniz</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {visibleGrades.map((grade) => {
               const conf = GRADE_CONFIG[grade];
               return (
                 <button
                   key={grade}
                   onClick={() => onSelectGrade(grade)}
                   className={`relative group p-5 rounded-2xl border-2 ${conf.bg} border-transparent ${conf.border} active:scale-95 transition-all duration-300 flex flex-col items-center justify-center text-center h-32`}
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
           </div>
        </div>
      )}

      {/* --- VIEW 3: UNIT SELECTION --- */}
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
              
              // Calculate Progress
              let totalWords = 0;
              let memorizedCount = 0;

              if (isAllInOne) {
                 const gradeUnits = UNIT_DATA[selectedGrade];
                 gradeUnits.forEach(u => {
                    if (!u.id.endsWith('all') && u.id !== 'uAll' && VOCABULARY[u.id]) {
                        const words = VOCABULARY[u.id];
                        totalWords += words.length;
                        memorizedCount += words.filter(w => memorizedSet.has(w.english)).length;
                    }
                 });
              } else {
                 const words = VOCABULARY[unit.id] || [];
                 totalWords = words.length;
                 memorizedCount = words.filter(w => memorizedSet.has(w.english)).length;
              }
              
              const progress = totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0;

              return (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  className={`group p-5 rounded-2xl border transition-all active:scale-[0.98] text-left flex items-center gap-4
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
                  <div className="flex-grow min-w-0">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isAllInOne ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {unit.unitNo}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {unit.title}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full mt-3">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                        <span>İlerleme</span>
                        <span className={progress === 100 ? 'text-green-500' : ''}>%{progress}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : isAllInOne ? 'bg-indigo-500' : 'bg-green-500'}`} 
                           style={{ width: `${progress}%` }}
                         />
                      </div>
                    </div>
                  </div>
                  
                  <div className="self-start opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-indigo-400">
                    <Target size={20} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- VIEW 4: ACTION SELECTION (Mode) --- */}
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
              className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex flex-col items-center text-center sm:col-span-2 active:scale-[0.98]"
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
            {quizConfigMode ? (
               <div className="group relative bg-white dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-500 text-slate-800 dark:text-white p-6 rounded-3xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                 <h3 className="text-lg font-bold mb-3 text-indigo-600 dark:text-indigo-400">Soru Sayısı Seç</h3>
                 <div className="grid grid-cols-3 gap-2 w-full mb-2">
                   {[10, 15, 20, 25, 50].map(count => (
                     <button 
                       key={count}
                       onClick={() => onStartModule('quiz', selectedUnit, count)}
                       className="py-2 px-1 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 active:bg-indigo-700 active:text-white rounded-lg font-bold text-sm transition-colors active:scale-95"
                     >
                       {count}
                     </button>
                   ))}
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setQuizConfigMode(false); }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-1 py-1 px-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                 >
                    İptal
                 </button>
               </div>
            ) : (
               <button
                 onClick={() => setQuizConfigMode(true)}
                 className="group relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-800 dark:text-white p-6 rounded-3xl transition-all flex flex-col items-center text-center active:scale-[0.98]"
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
            )}

            {/* 3. Favori Test */}
            <button
              onClick={() => onStartModule('quiz-bookmarks', selectedUnit)}
              className="group relative overflow-hidden bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-500 text-rose-800 dark:text-rose-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-200 rounded-2xl flex items-center justify-center mb-3">
                <Target size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Favori Test</h3>
              <p className="text-rose-600/80 dark:text-rose-300/80 text-sm">Favorilerinle dene</p>
            </button>
            
             {/* 4. Ezberlediklerimle Quiz */}
             <button
              onClick={() => onStartModule('quiz-memorized', selectedUnit)}
              className="group relative overflow-hidden bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-500 text-green-800 dark:text-green-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Ezber Quiz</h3>
              <p className="text-green-600/80 dark:text-green-300/80 text-sm">Bilgilerini test et</p>
            </button>

            {/* 5. Özel Çalışma (Custom Practice) */}
            <button
              onClick={() => onStartModule('practice-select', selectedUnit)}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-800 dark:text-white p-6 rounded-3xl transition-all flex flex-col items-center text-center active:scale-[0.98]"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 transform group-hover:scale-150 transition-transform duration-700">
                 <ListChecks size={100} />
               </div>
               <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                 <MousePointerClick size={32} />
               </div>
               <h3 className="text-xl font-bold mb-1">Özel Çalışma</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm">Kelime seç & Çalış</p>
            </button>

            {/* 6. Gramer Çalış */}
            <button
              onClick={() => onStartModule('grammar', selectedUnit)}
              className="group relative overflow-hidden bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-500 text-teal-800 dark:text-teal-100 p-6 rounded-3xl transition-all flex flex-col items-center text-center sm:col-span-2 active:scale-[0.98]"
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