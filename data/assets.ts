

import { Avatar, Badge, FrameDef, UnitDef, GradeDef, BackgroundDef, ThemeType } from '../types';
import { 
  BookOpen, GraduationCap, Target, Library, Star, 
  School, Globe, Tv, Sun, Briefcase, Music, Heart, 
  MapPin, Film, Calendar, Zap, Smile, User, Utensils, Shirt, Home, Tent, 
  Play, BookType, CheckCircle, Layers, Flame, Award, PenTool,
  ListChecks, Clock as ClockIcon, Brain as BrainIcon,
  PartyPopper, Lightbulb, MessageCircle, Sparkles,
  History, Palette, Microscope, Stethoscope, 
  Laptop, Gavel, Leaf, Plane, ShoppingBag as ShoppingBagIcon, Cpu, Crown,
  Bell, Settings, CircleHelp, Home as HomeIcon, UserCircle, Signal,
  Gamepad2, Search, Grid3X3, WholeWord, Moon, Droplets, Sunset, TreePine, Candy, Image, Coffee, Rocket, CloudSnow
} from 'lucide-react';
import React from 'react';

// EXPORT ALL ICONS MAP
export const ICON_MAP: Record<string, React.ReactElement> = {
    'BookOpen': React.createElement(BookOpen),
    'GraduationCap': React.createElement(GraduationCap),
    'Target': React.createElement(Target),
    'Library': React.createElement(Library),
    'Star': React.createElement(Star),
    'School': React.createElement(School),
    'Globe': React.createElement(Globe),
    'Tv': React.createElement(Tv),
    'Sun': React.createElement(Sun),
    'Briefcase': React.createElement(Briefcase),
    'Music': React.createElement(Music),
    'Heart': React.createElement(Heart),
    'MapPin': React.createElement(MapPin),
    'Film': React.createElement(Film),
    'Calendar': React.createElement(Calendar),
    'Zap': React.createElement(Zap),
    'Smile': React.createElement(Smile),
    'User': React.createElement(User),
    'Utensils': React.createElement(Utensils),
    'Shirt': React.createElement(Shirt),
    'Home': React.createElement(Home),
    'Tent': React.createElement(Tent),
    'Play': React.createElement(Play),
    'BookType': React.createElement(BookType),
    'CheckCircle': React.createElement(CheckCircle),
    'Layers': React.createElement(Layers),
    'Flame': React.createElement(Flame),
    'Award': React.createElement(Award),
    'PenTool': React.createElement(PenTool),
    'ListChecks': React.createElement(ListChecks),
    'Clock': React.createElement(ClockIcon),
    'Brain': React.createElement(BrainIcon),
    'PartyPopper': React.createElement(PartyPopper),
    'Lightbulb': React.createElement(Lightbulb),
    'MessageCircle': React.createElement(MessageCircle),
    'Sparkles': React.createElement(Sparkles),
    'History': React.createElement(History),
    'Palette': React.createElement(Palette),
    'Microscope': React.createElement(Microscope),
    'Stethoscope': React.createElement(Stethoscope),
    'Laptop': React.createElement(Laptop),
    'Gavel': React.createElement(Gavel),
    'Leaf': React.createElement(Leaf),
    'Plane': React.createElement(Plane),
    'ShoppingBag': React.createElement(ShoppingBagIcon),
    'Cpu': React.createElement(Cpu),
    'Crown': React.createElement(Crown),
    'Bell': React.createElement(Bell),
    'Settings': React.createElement(Settings),
    'CircleHelp': React.createElement(CircleHelp),
    'HomeIcon': React.createElement(HomeIcon),
    'UserCircle': React.createElement(UserCircle),
    'Signal': React.createElement(Signal),
    'Gamepad2': React.createElement(Gamepad2),
    'Search': React.createElement(Search),
    'Grid3X3': React.createElement(Grid3X3),
    'WholeWord': React.createElement(WholeWord),
    'Moon': React.createElement(Moon),
    'Droplets': React.createElement(Droplets),
    'Sunset': React.createElement(Sunset),
    'TreePine': React.createElement(TreePine),
    'Candy': React.createElement(Candy),
    'Image': React.createElement(Image),
    'Coffee': React.createElement(Coffee),
    'Rocket': React.createElement(Rocket),
    'CloudSnow': React.createElement(CloudSnow)
};

// THEME CONFIGURATION
export const THEME_COLORS: Record<ThemeType, { primary: string, bgMain: string, bgCard: string, textMain: string, textMuted: string, border: string, fontFamily: string }> = {
    // Basic Themes
    'light': { primary: '#4f46e5', bgMain: '#f8fafc', bgCard: '#ffffff', textMain: '#0f172a', textMuted: '#64748b', border: '#e2e8f0', fontFamily: "'Inter', sans-serif" },
    'dark': { primary: '#818cf8', bgMain: '#0f172a', bgCard: '#1e293b', textMain: '#f8fafc', textMuted: '#94a3b8', border: '#334155', fontFamily: "'Inter', sans-serif" },
    
    // Nature & Calm
    'ocean': { primary: '#0ea5e9', bgMain: '#0c4a6e', bgCard: '#075985', textMain: '#e0f2fe', textMuted: '#7dd3fc', border: '#0369a1', fontFamily: "'Inter', sans-serif" },
    'forest': { primary: '#22c55e', bgMain: '#052e16', bgCard: '#14532d', textMain: '#dcfce7', textMuted: '#86efac', border: '#15803d', fontFamily: "'Merriweather', serif" },
    'nature_soft': { primary: '#65a30d', bgMain: '#f7fee7', bgCard: '#ffffff', textMain: '#1a2e05', textMuted: '#4d7c0f', border: '#bef264', fontFamily: "'Merriweather', serif" },
    'lavender': { primary: '#c084fc', bgMain: '#2e1065', bgCard: '#4c1d95', textMain: '#ede9fe', textMuted: '#a78bfa', border: '#6d28d9', fontFamily: "'Fredoka', sans-serif" },
    
    // Vibrant & Fun
    'sunset': { primary: '#f97316', bgMain: '#431407', bgCard: '#7c2d12', textMain: '#ffedd5', textMuted: '#fdba74', border: '#9a3412', fontFamily: "'Fredoka', sans-serif" },
    'candy': { primary: '#ec4899', bgMain: '#831843', bgCard: '#9d174d', textMain: '#fce7f3', textMuted: '#fbcfe8', border: '#be185d', fontFamily: "'Fredoka', sans-serif" },
    'comic': { primary: '#000000', bgMain: '#ffffff', bgCard: '#fef3c7', textMain: '#000000', textMuted: '#4b5563', border: '#000000', fontFamily: "'Patrick Hand', cursive" },
    
    // Tech & Sci-Fi
    'neon': { primary: '#39ff14', bgMain: '#000000', bgCard: '#1a1a1a', textMain: '#39ff14', textMuted: '#228b22', border: '#33ff00', fontFamily: "'Orbitron', sans-serif" },
    'cyberpunk': { primary: '#facc15', bgMain: '#09090b', bgCard: '#27272a', textMain: '#facc15', textMuted: '#a1a1aa', border: '#eab308', fontFamily: "'Orbitron', sans-serif" },
    'matrix': { primary: '#00ff41', bgMain: '#0d0d0d', bgCard: '#001a00', textMain: '#00ff41', textMuted: '#008F11', border: '#003b00', fontFamily: "'Orbitron', sans-serif" },
    'gamer': { primary: '#ef4444', bgMain: '#111111', bgCard: '#000000', textMain: '#ffffff', textMuted: '#9ca3af', border: '#ef4444', fontFamily: "'Russo One', sans-serif" },
    'galaxy': { primary: '#d8b4fe', bgMain: '#0f172a', bgCard: '#2e1065', textMain: '#e9d5ff', textMuted: '#a855f7', border: '#6b21a8', fontFamily: "'Orbitron', sans-serif" },
    
    // Elegant & Retro
    'royal': { primary: '#fbbf24', bgMain: '#312e81', bgCard: '#4338ca', textMain: '#fef3c7', textMuted: '#ddd6fe', border: '#fbbf24', fontFamily: "'Playfair Display', serif" },
    'luxury': { primary: '#d4af37', bgMain: '#1c1917', bgCard: '#292524', textMain: '#fcfcd4', textMuted: '#a8a29e', border: '#d4af37', fontFamily: "'Playfair Display', serif" },
    'coffee': { primary: '#d7ccc8', bgMain: '#3e2723', bgCard: '#4e342e', textMain: '#d7ccc8', textMuted: '#a1887f', border: '#6d4c41', fontFamily: "'Courier Prime', monospace" },
    'retro': { primary: '#b58900', bgMain: '#fdf6e3', bgCard: '#eee8d5', textMain: '#657b83', textMuted: '#93a1a1', border: '#b58900', fontFamily: "'Courier Prime', monospace" },
    
    // Elemental
    'midnight': { primary: '#60a5fa', bgMain: '#172554', bgCard: '#1e3a8a', textMain: '#dbeafe', textMuted: '#93c5fd', border: '#2563eb', fontFamily: "'Inter', sans-serif" },
    'volcano': { primary: '#f87171', bgMain: '#450a0a', bgCard: '#7f1d1d', textMain: '#fee2e2', textMuted: '#fca5a5', border: '#991b1b', fontFamily: "'Russo One', sans-serif" },
    'ice': { primary: '#22d3ee', bgMain: '#083344', bgCard: '#164e63', textMain: '#cffafe', textMuted: '#67e8f9', border: '#155e75', fontFamily: "'Inter', sans-serif" },
};

// ... UI ICONS, GRADE_DATA, UNIT_ASSETS preserved ...
// UI ICONS
export const UI_ICONS = {
    home: React.createElement(HomeIcon, { size: 24 }),
    profile: React.createElement(UserCircle, { size: 24 }),
    settings: React.createElement(Settings, { size: 24 }),
    info: React.createElement(CircleHelp, { size: 24 }),
    notifications: React.createElement(Bell, { size: 24 }),
};

// GRADES
export const GRADE_DATA: Record<string, GradeDef> = {
    'PRIMARY_SCHOOL': { id: 'PRIMARY_SCHOOL', label: 'İlkokul', subLabel: '2-4. Sınıflar', icon: React.createElement(Star, { size: 28 }) },
    'MIDDLE_SCHOOL': { id: 'MIDDLE_SCHOOL', label: 'Ortaokul', subLabel: '5-8. Sınıflar', icon: React.createElement(School, { size: 28 }) },
    'HIGH_SCHOOL': { id: 'HIGH_SCHOOL', label: 'Lise', subLabel: '9-12. Sınıflar', icon: React.createElement(GraduationCap, { size: 28 }) },
    'GENERAL_ENGLISH': { id: 'GENERAL_ENGLISH', label: 'Genel İngilizce', subLabel: 'A1 - C1 Seviyeleri', icon: React.createElement(Globe, { size: 28 }) },
    '2': { id: '2', label: '2. Sınıf', icon: React.createElement(Star, { size: 24 }) },
    '3': { id: '3', label: '3. Sınıf', icon: React.createElement(Star, { size: 24 }) },
    '4': { id: '4', label: '4. Sınıf', icon: React.createElement(Star, { size: 24 }) },
    '5': { id: '5', label: '5. Sınıf', icon: React.createElement(School, { size: 24 }) },
    '6': { id: '6', label: '6. Sınıf', icon: React.createElement(School, { size: 24 }) },
    '7': { id: '7', label: '7. Sınıf', icon: React.createElement(School, { size: 24 }) },
    '8': { id: '8', label: '8. Sınıf', icon: React.createElement(School, { size: 24 }) },
    '9': { id: '9', label: '9. Sınıf', icon: React.createElement(GraduationCap, { size: 24 }) },
    '10': { id: '10', label: '10. Sınıf', icon: React.createElement(GraduationCap, { size: 24 }) },
    '11': { id: '11', label: '11. Sınıf', icon: React.createElement(GraduationCap, { size: 24 }) },
    '12': { id: '12', label: '12. Sınıf', icon: React.createElement(GraduationCap, { size: 24 }) },
    'A1': { id: 'A1', label: 'A1 Seviye', icon: React.createElement(Signal, { size: 24, className: "text-green-500" }) },
    'A2': { id: 'A2', label: 'A2 Seviye', icon: React.createElement(Signal, { size: 24, className: "text-blue-500" }) },
    'B1': { id: 'B1', label: 'B1 Seviye', icon: React.createElement(Signal, { size: 24, className: "text-yellow-500" }) },
    'B2': { id: 'B2', label: 'B2 Seviye', icon: React.createElement(Signal, { size: 24, className: "text-orange-500" }) },
    'C1': { id: 'C1', label: 'C1 Seviye', icon: React.createElement(Signal, { size: 24, className: "text-red-500" }) },
};

// UNITS (Keep existing data)
export const UNIT_ASSETS: Record<string, UnitDef[]> = {
  'A1': [
    { id: 'gen_a1', unitNo: 'Level A1', title: 'Beginner General English', icon: React.createElement(BookOpen) }
  ],
  'A2': [
    { id: 'gen_a2', unitNo: 'Level A2', title: 'Elementary General English', icon: React.createElement(BookOpen) }
  ],
  'B1': [
    { id: 'gen_b1', unitNo: 'Level B1', title: 'Intermediate General English', icon: React.createElement(BookOpen) }
  ],
  'B2': [
    { id: 'gen_b2', unitNo: 'Level B2', title: 'Upper Intermediate General English', icon: React.createElement(BookOpen) }
  ],
  'C1': [
    { id: 'gen_c1', unitNo: 'Level C1', title: 'Advanced General English', icon: React.createElement(BookOpen) }
  ],
  '12': [
    { id: 'g12u1', unitNo: '1. ÜNİTE', title: 'MUSIC', icon: React.createElement(Music) },
    { id: 'g12u2', unitNo: '2. ÜNİTE', title: 'FRIENDSHIP', icon: React.createElement(User) },
    { id: 'g12u3', unitNo: '3. ÜNİTE', title: 'HUMAN RIGHTS', icon: React.createElement(Globe) },
    { id: 'g12u4', unitNo: '4. ÜNİTE', title: 'CYBER & NATURE', icon: React.createElement(Laptop) },
    { id: 'g12u5', unitNo: '5. ÜNİTE', title: 'PSYCHOLOGY', icon: React.createElement(BrainIcon) }, 
    { id: 'g12u6', unitNo: '6. ÜNİTE', title: 'FAVORS', icon: React.createElement(Heart) },
    { id: 'g12u7', unitNo: '7. ÜNİTE', title: 'NEWS STORIES', icon: React.createElement(Tv) },
    { id: 'g12u8', unitNo: '8. ÜNİTE', title: 'ALTERNATIVE ENERGY', icon: React.createElement(Zap) },
    { id: 'g12u9', unitNo: '9. ÜNİTE', title: 'TECHNOLOGY', icon: React.createElement(Cpu) }, 
    { id: 'g12u10', unitNo: '10. ÜNİTE', title: 'MANNERS', icon: React.createElement(Smile) },
    { id: 'g12all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '11': [
    { id: 'g11u1', unitNo: '1. ÜNİTE', title: 'FUTURE JOBS', icon: React.createElement(Briefcase) },
    { id: 'g11u2', unitNo: '2. ÜNİTE', title: 'HOBBIES AND SKILLS', icon: React.createElement(Palette) },
    { id: 'g11u3', unitNo: '3. ÜNİTE', title: 'HARD TIMES', icon: React.createElement(Sun) },
    { id: 'g11u4', unitNo: '4. ÜNİTE', title: 'WHAT A LIFE', icon: React.createElement(Star) },
    { id: 'g11u5', unitNo: '5. ÜNİTE', title: 'BACK TO THE PAST', icon: React.createElement(History) },
    { id: 'g11u6', unitNo: '6. ÜNİTE', title: 'OPEN YOUR HEART', icon: React.createElement(Heart) },
    { id: 'g11u7', unitNo: '7. ÜNİTE', title: 'FACTS ABOUT TURKEY', icon: React.createElement(MapPin) },
    { id: 'g11u8', unitNo: '8. ÜNİTE', title: 'SPORTS', icon: React.createElement(Zap) },
    { id: 'g11u9', unitNo: '9. ÜNİTE', title: 'MY FRIENDS', icon: React.createElement(User) },
    { id: 'g11u10', unitNo: '10. ÜNİTE', title: 'VALUES AND NORMS', icon: React.createElement(Gavel) },
    { id: 'g11all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '10': [
    { id: 'g10u1', unitNo: '1. ÜNİTE', title: 'SCHOOL LIFE', icon: React.createElement(School) },
    { id: 'g10u2', unitNo: '2. ÜNİTE', title: 'PLANS', icon: React.createElement(Calendar) },
    { id: 'g10u3', unitNo: '3. ÜNİTE', title: 'LEGENDARY FIGURES', icon: React.createElement(Crown) }, 
    { id: 'g10u4', unitNo: '4. ÜNİTE', title: 'TRADITIONS', icon: React.createElement(Globe) },
    { id: 'g10u5', unitNo: '5. ÜNİTE', title: 'TRAVEL', icon: React.createElement(Plane) },
    { id: 'g10u6', unitNo: '6. ÜNİTE', title: 'HELPFUL TIPS', icon: React.createElement(Lightbulb) },
    { id: 'g10u7', unitNo: '7. ÜNİTE', title: 'FOOD AND FESTIVALS', icon: React.createElement(Utensils) },
    { id: 'g10u8', unitNo: '8. ÜNİTE', title: 'DIGITAL ERA', icon: React.createElement(Zap) },
    { id: 'g10u9', unitNo: '9. ÜNİTE', title: 'MODERN HEROES', icon: React.createElement(Award) },
    { id: 'g10u10', unitNo: '10. ÜNİTE', title: 'SHOPPING', icon: React.createElement(ShoppingBagIcon) },
    { id: 'g10all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '9': [
    { id: 'g9u1', unitNo: '1. ÜNİTE', title: 'STUDYING ABROAD', icon: React.createElement(Globe) },
    { id: 'g9u2', unitNo: '2. ÜNİTE', title: 'MY ENVIRONMENT', icon: React.createElement(MapPin) },
    { id: 'g9u3', unitNo: '3. ÜNİTE', title: 'MOVIES', icon: React.createElement(Film) },
    { id: 'g9u4', unitNo: '4. ÜNİTE', title: 'HUMAN IN NATURE', icon: React.createElement(Leaf) },
    { id: 'g9u5', unitNo: '5. ÜNİTE', title: 'INSPIRATIONAL PEOPLE', icon: React.createElement(Sparkles) },
    { id: 'g9u6', unitNo: '6. ÜNİTE', title: 'BRIDGING CULTURES', icon: React.createElement(Globe) },
    { id: 'g9u7', unitNo: '7. ÜNİTE', title: 'WORLD HERITAGE', icon: React.createElement(School) },
    { id: 'g9u8', unitNo: '8. ÜNİTE', title: 'EMERGENCY & HEALTH', icon: React.createElement(Stethoscope) },
    { id: 'g9u9', unitNo: '9. ÜNİTE', title: 'INVITATIONS', icon: React.createElement(PartyPopper) },
    { id: 'g9u10', unitNo: '10. ÜNİTE', title: 'TV & SOCIAL MEDIA', icon: React.createElement(Tv) },
    { id: 'g9all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '8': [
    { id: 'u1', unitNo: '1. ÜNİTE', title: 'FRIENDSHIP', icon: React.createElement(User) },
    { id: 'u2', unitNo: '2. ÜNİTE', title: 'TEEN LIFE', icon: React.createElement(Music) },
    { id: 'u3', unitNo: '3. ÜNİTE', title: 'IN THE KITCHEN', icon: React.createElement(Utensils) },
    { id: 'u4', unitNo: '4. ÜNİTE', title: 'ON THE PHONE', icon: React.createElement(MessageCircle) },
    { id: 'u5', unitNo: '5. ÜNİTE', title: 'THE INTERNET', icon: React.createElement(Globe) },
    { id: 'u6', unitNo: '6. ÜNİTE', title: 'ADVENTURES', icon: React.createElement(Tent) },
    { id: 'u7', unitNo: '7. ÜNİTE', title: 'TOURISM', icon: React.createElement(MapPin) },
    { id: 'u8', unitNo: '8. ÜNİTE', title: 'CHORES', icon: React.createElement(Home) },
    { id: 'u9', unitNo: '9. ÜNİTE', title: 'SCIENCE', icon: React.createElement(Microscope) },
    { id: 'u10', unitNo: '10. ÜNİTE', title: 'NATURAL FORCES', icon: React.createElement(Flame) },
    { id: 'uAll', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '7': [
    { id: 'g7u1', unitNo: '1. ÜNİTE', title: 'APPEARANCE', icon: React.createElement(User) },
    { id: 'g7u2', unitNo: '2. ÜNİTE', title: 'SPORTS', icon: React.createElement(Zap) },
    { id: 'g7u3', unitNo: '3. ÜNİTE', title: 'BIOGRAPHIES', icon: React.createElement(BookOpen) },
    { id: 'g7u4', unitNo: '4. ÜNİTE', title: 'WILD ANIMALS', icon: React.createElement(Smile) },
    { id: 'g7u5', unitNo: '5. ÜNİTE', title: 'TELEVISION', icon: React.createElement(Tv) },
    { id: 'g7u6', unitNo: '6. ÜNİTE', title: 'CELEBRATIONS', icon: React.createElement(PartyPopper) },
    { id: 'g7u7', unitNo: '7. ÜNİTE', title: 'DREAMS', icon: React.createElement(Sun) },
    { id: 'g7u8', unitNo: '8. ÜNİTE', title: 'PUBLIC BUILDINGS', icon: React.createElement(School) },
    { id: 'g7u9', unitNo: '9. ÜNİTE', title: 'ENVIRONMENT', icon: React.createElement(Leaf) },
    { id: 'g7u10', unitNo: '10. ÜNİTE', title: 'PLANETS', icon: React.createElement(Zap) },
    { id: 'g7all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '6': [
    { id: 'g6u1', unitNo: '1. ÜNİTE', title: 'LIFE', icon: React.createElement(Sun) },
    { id: 'g6u2', unitNo: '2. ÜNİTE', title: 'YUMMY BREAKFAST', icon: React.createElement(Utensils) },
    { id: 'g6u3', unitNo: '3. ÜNİTE', title: 'DOWNTOWN', icon: React.createElement(School) },
    { id: 'g6u4', unitNo: '4. ÜNİTE', title: 'WEATHER AND EMOTIONS', icon: React.createElement(Sun) },
    { id: 'g6u5', unitNo: '5. ÜNİTE', title: 'AT THE FAIR', icon: React.createElement(Play) },
    { id: 'g6u6', unitNo: '6. ÜNİTE', title: 'OCCUPATIONS', icon: React.createElement(Briefcase) },
    { id: 'g6u7', unitNo: '7. ÜNİTE', title: 'HOLIDAYS', icon: React.createElement(Sun) },
    { id: 'g6u8', unitNo: '8. ÜNİTE', title: 'BOOKWORMS', icon: React.createElement(BookType) },
    { id: 'g6u9', unitNo: '9. ÜNİTE', title: 'SAVING THE PLANET', icon: React.createElement(Globe) },
    { id: 'g6u10', unitNo: '10. ÜNİTE', title: 'DEMOCRACY', icon: React.createElement(CheckCircle) },
    { id: 'g6all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '5': [
    { id: 'g5u1', unitNo: '1. ÜNİTE', title: 'HELLO', icon: React.createElement(Smile) },
    { id: 'g5u2', unitNo: '2. ÜNİTE', title: 'MY TOWN', icon: React.createElement(MapPin) },
    { id: 'g5u3', unitNo: '3. ÜNİTE', title: 'GAMES AND HOBBIES', icon: React.createElement(Play) },
    { id: 'g5u4', unitNo: '4. ÜNİTE', title: 'MY DAILY ROUTINE', icon: React.createElement(ClockIcon) },
    { id: 'g5u5', unitNo: '5. ÜNİTE', title: 'HEALTH', icon: React.createElement(Heart) },
    { id: 'g5u6', unitNo: '6. ÜNİTE', title: 'MOVIES', icon: React.createElement(Film) },
    { id: 'g5u7', unitNo: '7. ÜNİTE', title: 'PARTY TIME', icon: React.createElement(PartyPopper) },
    { id: 'g5u8', unitNo: '8. ÜNİTE', title: 'FITNESS', icon: React.createElement(Zap) },
    { id: 'g5u9', unitNo: '9. ÜNİTE', title: 'THE ANIMAL SHELTER', icon: React.createElement(Smile) },
    { id: 'g5u10', unitNo: '10. ÜNİTE', title: 'FESTIVALS', icon: React.createElement(MapPin) },
    { id: 'g5all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '4': [
    { id: 'g4u1', unitNo: '1. ÜNİTE', title: 'CLASSROOM RULES', icon: React.createElement(School) },
    { id: 'g4u2', unitNo: '2. ÜNİTE', title: 'NATIONALITY', icon: React.createElement(MapPin) },
    { id: 'g4u3', unitNo: '3. ÜNİTE', title: 'CARTOON CHARACTERS', icon: React.createElement(Smile) },
    { id: 'g4u4', unitNo: '4. ÜNİTE', title: 'FREE TIME', icon: React.createElement(ClockIcon) },
    { id: 'g4u5', unitNo: '5. ÜNİTE', title: 'MY DAY', icon: React.createElement(Sun) },
    { id: 'g4u6', unitNo: '6. ÜNİTE', title: 'FUN WITH SCIENCE', icon: React.createElement(Zap) },
    { id: 'g4u7', unitNo: '7. ÜNİTE', title: 'JOBS', icon: React.createElement(Briefcase) },
    { id: 'g4u8', unitNo: '8. ÜNİTE', title: 'MY CLOTHES', icon: React.createElement(Shirt) },
    { id: 'g4u9', unitNo: '9. ÜNİTE', title: 'MY FRIENDS', icon: React.createElement(User) },
    { id: 'g4u10', unitNo: '10. ÜNİTE', title: 'FOOD AND DRINKS', icon: React.createElement(Utensils) },
    { id: 'g4all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '3': [
    { id: 'g3u1', unitNo: '1. ÜNİTE', title: 'GREETING', icon: React.createElement(Smile) },
    { id: 'g3u2', unitNo: '2. ÜNİTE', title: 'MY FAMILY', icon: React.createElement(User) },
    { id: 'g3u3', unitNo: '3. ÜNİTE', title: 'PEOPLE I LOVE', icon: React.createElement(Heart) },
    { id: 'g3u4', unitNo: '4. ÜNİTE', title: 'FEELINGS', icon: React.createElement(Smile) },
    { id: 'g3u5', unitNo: '5. ÜNİTE', title: 'TOYS AND GAMES', icon: React.createElement(Play) },
    { id: 'g3u6', unitNo: '6. ÜNİTE', title: 'MY HOUSE', icon: React.createElement(Home) },
    { id: 'g3u7', unitNo: '7. ÜNİTE', title: 'IN MY CITY', icon: React.createElement(School) },
    { id: 'g3u8', unitNo: '8. ÜNİTE', title: 'TRANSPORTATION', icon: React.createElement(Play) },
    { id: 'g3u9', unitNo: '9. ÜNİTE', title: 'WEATHER', icon: React.createElement(Sun) },
    { id: 'g3u10', unitNo: '10. ÜNİTE', title: 'NATURE', icon: React.createElement(Leaf) },
    { id: 'g3all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ],
  '2': [
    { id: 'g2u1', unitNo: '1. ÜNİTE', title: 'WORDS', icon: React.createElement(BookType) },
    { id: 'g2u2', unitNo: '2. ÜNİTE', title: 'FRIENDS', icon: React.createElement(User) },
    { id: 'g2u3', unitNo: '3. ÜNİTE', title: 'IN THE CLASSROOM', icon: React.createElement(School) },
    { id: 'g2u4', unitNo: '4. ÜNİTE', title: 'NUMBERS', icon: React.createElement(ListChecks) },
    { id: 'g2u5', unitNo: '5. ÜNİTE', title: 'COLORS', icon: React.createElement(PenTool) },
    { id: 'g2u6', unitNo: '6. ÜNİTE', title: 'AT THE PLAYGROUND', icon: React.createElement(Smile) },
    { id: 'g2all', unitNo: 'TAMAMI', title: 'ALL IN ONE', icon: React.createElement(Layers) },
  ]
};

// AVATARS (ALL PRESERVED)
export const AVATARS: Avatar[] = [
  // ... (Existing avatars are preserved as requested) ...
  // Level 1-10
  { id: 'student', icon: '🧑‍🎓', image: 'https://8upload.com/image/302720d3d5ab5c31/student.png', name: 'Öğrenci', unlockLevel: 1, bgGradient: 'from-blue-400 to-indigo-500', border: 'border-blue-200' },
  { id: 'cat', icon: '🐱', image: 'https://8upload.com/image/322dda0da52f30af/cat.png', name: 'Kedi', unlockLevel: 2, bgGradient: 'from-orange-300 to-amber-400', border: 'border-orange-200' },
  { id: 'dog', icon: '🐶', image: 'https://8upload.com/image/0c0a93919cf94942/dog.png', name: 'Köpek', unlockLevel: 3, bgGradient: 'from-stone-300 to-stone-500', border: 'border-stone-300' },
  { id: 'fox', icon: '🦊', image: 'https://8upload.com/image/9f5fcd0b227c5917/fox.png', name: 'Tilki', unlockLevel: 4, bgGradient: 'from-orange-500 to-red-600', border: 'border-orange-300' },
  { id: 'panda', icon: '🐼', image: 'https://8upload.com/image/05cc116de4267c55/panda.png', name: 'Panda', unlockLevel: 5, bgGradient: 'from-slate-800 to-black', border: 'border-slate-400' },
  { id: 'koala', icon: '🐨', image: 'https://8upload.com/image/c688a9ac2dfe761b/koala.png', name: 'Koala', unlockLevel: 6, bgGradient: 'from-gray-300 to-gray-500', border: 'border-gray-300' },
  { id: 'rabbit', icon: '🐰', image: 'https://8upload.com/image/f092e13a8ab8508c/rabbit.png', name: 'Tavşan', unlockLevel: 7, bgGradient: 'from-pink-200 to-pink-400', border: 'border-pink-200' },
  { id: 'lion', icon: '🦁', image: 'https://8upload.com/image/2b3f1bbe6d1c2969/lion.png', name: 'Aslan', unlockLevel: 8, bgGradient: 'from-yellow-400 to-orange-500', border: 'border-yellow-300' },
  { id: 'tiger', icon: '🐯', image: 'https://8upload.com/image/b1d8404e5ab1066f/tiger.png', name: 'Kaplan', unlockLevel: 9, bgGradient: 'from-orange-400 to-red-500', border: 'border-orange-300' },
  { id: 'wolf', icon: '🐺', image: 'https://8upload.com/image/0a00af0ffc3b2d90/wolf.png', name: 'Kurt', unlockLevel: 10, bgGradient: 'from-slate-400 to-slate-600', border: 'border-slate-400' },
  // ... (All other avatars preserved) ...
   { id: 'bear', icon: '🐻', image: 'https://8upload.com/image/e18a3a2df098e3a1/bear.png', name: 'Ayı', unlockLevel: 11, bgGradient: 'from-amber-700 to-amber-900', border: 'border-amber-600' },
  { id: 'detective', icon: '🕵️', image: 'https://8upload.com/image/75da781a118c9f12/detective.png', name: 'Dedektif', unlockLevel: 12, bgGradient: 'from-neutral-600 to-neutral-800', border: 'border-neutral-400' },
  { id: 'chicken', icon: '🐔', image: 'https://8upload.com/image/5a28e29d0ba881cf/chicken.png', name: 'Tavuk', unlockLevel: 13, bgGradient: 'from-red-100 to-red-300', border: 'border-red-200' },
  { id: 'frog', icon: '🐸', image: 'https://8upload.com/image/09a004e9aba108e7/frog.png', name: 'Kurbağa', unlockLevel: 14, bgGradient: 'from-green-500 to-green-700', border: 'border-green-400' },
  { id: 'scientist', icon: '👩‍🔬', image: 'https://8upload.com/image/5558efd2a4ecddd8/scientist.png', name: 'Bilim İnsanı', unlockLevel: 15, bgGradient: 'from-green-400 to-teal-500', border: 'border-green-200' },
  { id: 'pig', icon: '🐷', image: 'https://8upload.com/image/6cbee484ed8ff99c/pig.png', name: 'Domuzcuk', unlockLevel: 16, bgGradient: 'from-pink-300 to-rose-400', border: 'border-pink-300' },
  { id: 'cow', icon: '🐮', image: 'https://8upload.com/image/44b46019424664ea/cow.png', name: 'İnek', unlockLevel: 17, bgGradient: 'from-stone-200 to-stone-400', border: 'border-stone-300' },
  { id: 'artist', icon: '🎨', image: 'https://8upload.com/image/952edf27cde8c38e/artist.png', name: 'Sanatçı', unlockLevel: 18, bgGradient: 'from-pink-400 to-rose-500', border: 'border-pink-200' },
  { id: 'mouse', icon: '🐭', image: 'https://8upload.com/image/c8e1cda952a18ec5/mouse.png', name: 'Fare', unlockLevel: 19, bgGradient: 'from-gray-400 to-gray-600', border: 'border-gray-300' },
  { id: 'astronaut', icon: '👨‍🚀', image: 'https://8upload.com/image/f00595de30e32300/astronaut.png', name: 'Astronot', unlockLevel: 20, bgGradient: 'from-blue-600 to-blue-900', border: 'border-blue-300' },
  { id: 'hamster', icon: '🐹', image: 'https://8upload.com/image/37cd70ce17659561/hamster.png', name: 'Hamster', unlockLevel: 21, bgGradient: 'from-orange-200 to-orange-400', border: 'border-orange-200' },
  { id: 'pilot', icon: '👨‍✈️', image: 'https://8upload.com/image/af3d26187006c7ef/pilot.png', name: 'Pilot', unlockLevel: 22, bgGradient: 'from-sky-400 to-sky-600', border: 'border-sky-200' },
  { id: 'chef', icon: '👨‍🍳', image: 'https://8upload.com/image/6892b352cca39efc/chef.png', name: 'Şef', unlockLevel: 23, bgGradient: 'from-white to-gray-200', border: 'border-gray-300' },
  { id: 'firefighter', icon: '👨‍🚒', image: 'https://8upload.com/image/adb1297b46d3b00e/fireman.png', name: 'İtfaiyeci', unlockLevel: 24, bgGradient: 'from-red-500 to-orange-500', border: 'border-yellow-400' },
  { id: 'doctor', icon: '👨‍⚕️', image: 'https://8upload.com/image/4749482413688d94/doctor.png', name: 'Doktor', unlockLevel: 25, bgGradient: 'from-emerald-400 to-emerald-600', border: 'border-emerald-200' },
  { id: 'judge', icon: '👨‍⚖️', image: 'https://8upload.com/image/c7d7ff25ff9a3df1/judge.png', name: 'Hakim', unlockLevel: 26, bgGradient: 'from-slate-700 to-black', border: 'border-slate-500' },
  { id: 'mechanic', icon: '👨‍🔧', image: 'https://8upload.com/image/ccc0c3f9f78a3937/mechanic.png', name: 'Tamirci', unlockLevel: 27, bgGradient: 'from-blue-700 to-blue-900', border: 'border-blue-500' },
  { id: 'cowboy', icon: '🤠', image: 'https://8upload.com/image/9e069b8bdd2254b3/cowboy.png', name: 'Kovboy', unlockLevel: 28, bgGradient: 'from-orange-300 to-amber-600', border: 'border-amber-700' },
  { id: 'clown', icon: '🤡', image: 'https://8upload.com/image/deb4c4b6fff72a48/clown.png', name: 'Palyaço', unlockLevel: 29, bgGradient: 'from-red-400 to-yellow-400', border: 'border-blue-400' },
  { id: 'party_face', icon: '🥳', image: 'https://8upload.com/image/e5c37ec1fafcbfb5/party_face.png', name: 'Partici', unlockLevel: 30, bgGradient: 'from-purple-400 to-pink-400', border: 'border-purple-300' },
  { id: 'superhero', icon: '🦸', image: 'https://8upload.com/image/2731df0991928821/superhero.png', name: 'Kahraman', unlockLevel: 35, bgGradient: 'from-blue-500 to-red-500', border: 'border-yellow-400' },
  { id: 'villain', icon: '🦹', image: 'https://8upload.com/image/d3f7dea0d38b8fd2/villain.png', name: 'Kötü Adam', unlockLevel: 38, bgGradient: 'from-green-700 to-purple-800', border: 'border-green-500' },
  { id: 'wizard', icon: '🧙‍♂️', image: 'https://8upload.com/image/1b805006c4134236/wizard.png', name: 'Büyücü', unlockLevel: 40, bgGradient: 'from-purple-600 to-indigo-800', border: 'border-purple-400' },
  { id: 'fairy', icon: '🧚', image: 'https://8upload.com/image/ffd854bdfa3eca5d/fairy.png', name: 'Peri', unlockLevel: 41, bgGradient: 'from-pink-300 to-green-300', border: 'border-white' },
  { id: 'pirate', icon: '🏴‍☠️', name: 'Korsan', unlockLevel: 42, bgGradient: 'from-red-800 to-black', border: 'border-gray-400' },
  { id: 'robot', icon: '🤖', image: 'https://8upload.com/image/51d1d90badb33139/robot.png', name: 'Robot', unlockLevel: 45, bgGradient: 'from-gray-300 to-slate-500', border: 'border-gray-200' },
  { id: 'alien', icon: '👽', image: 'https://8upload.com/image/feedb4b26526d602/alien.png', name: 'Uzaylı', unlockLevel: 50, bgGradient: 'from-green-400 to-emerald-600', border: 'border-green-200' },
  { id: 'ninja_master', icon: '🥷', image: 'https://8upload.com/image/cfffe57295f528de/ninja_master.png', name: 'Ninja Ustası', unlockLevel: 55, bgGradient: 'from-gray-800 to-black', border: 'border-red-600' },
  { id: 'queen', icon: '👸', image: 'https://8upload.com/image/df42c5aba17096b9/queen.png', name: 'Kraliçe', unlockLevel: 60, bgGradient: 'from-pink-400 to-rose-500', border: 'border-pink-300' },
  { id: 'king', icon: '🤴', image: 'https://8upload.com/image/55f0446ef5fb49f3/king.png', name: 'Kral', unlockLevel: 65, bgGradient: 'from-yellow-500 to-red-600', border: 'border-yellow-500' },
  { id: 'dragon', icon: '🐉', image: 'https://8upload.com/image/bf262451f02a6436/dragon.png', name: 'Ejderha', unlockLevel: 70, bgGradient: 'from-red-600 to-orange-600', border: 'border-yellow-500' },
  { id: 'dino', icon: '🦖', image: 'https://8upload.com/image/f7a69d84e192a8d9/dino.png', name: 'T-Rex', unlockLevel: 75, bgGradient: 'from-green-700 to-stone-700', border: 'border-green-600' },
  { id: 'unicorn', icon: '🦄', image: 'https://8upload.com/image/a021b5e564ea2308/unicorn.png', name: 'Tekboynuz', unlockLevel: 80, bgGradient: 'from-pink-200 to-indigo-200', border: 'border-white' },
  { id: 'octopus', icon: '🐙', image: 'https://8upload.com/image/21a55ef4bec1b8e8/octopus.png', name: 'Ahtapot', unlockLevel: 85, bgGradient: 'from-purple-500 to-pink-500', border: 'border-purple-400' },
  { id: 'phoenix', icon: '🦅', image: 'https://8upload.com/image/9fe1d5055f68fdfd/phoenix.png', name: 'Anka Kuşu', unlockLevel: 90, bgGradient: 'from-orange-500 to-red-600', border: 'border-orange-400' },
  { id: 'ghost', icon: '👻', image: 'https://8upload.com/image/162dd0ef98b74ba0/ghost.png', name: 'Hayalet', unlockLevel: 95, bgGradient: 'from-gray-200 to-white', border: 'border-gray-300' },
  { id: 'diamond', icon: '💎', image: 'https://8upload.com/image/faa9aee65b00e036/diamond.png', name: 'Efsane', unlockLevel: 100, bgGradient: 'from-cyan-200 to-blue-400', border: 'border-white' },
  { id: 'vampire', icon: '🧛', image: 'https://8upload.com/image/52f47bfe3dfdf12c/vampire.png', name: 'Vampir', unlockLevel: 110, bgGradient: 'from-red-900 to-slate-900', border: 'border-red-600' },
  { id: 'cyborg', icon: '🦾', image: 'https://8upload.com/image/edc67cd7538a74ad/cyborg.png', name: 'Sayborg', unlockLevel: 120, bgGradient: 'from-slate-700 to-cyan-500', border: 'border-cyan-400' },
  { id: 'zombie', icon: '🧟', image: 'https://8upload.com/image/88e918704733f92f/zombie.png', name: 'Zombi', unlockLevel: 130, bgGradient: 'from-green-800 to-stone-700', border: 'border-green-700' },
  { id: 'genie', icon: '🧞', image: 'https://8upload.com/image/36b838266e6d59da/genie.png', name: 'Cin', unlockLevel: 140, bgGradient: 'from-cyan-500 to-blue-600', border: 'border-cyan-300' },
  { id: 'angel', icon: '👼', image: 'https://8upload.com/image/84b0a8d210900976/angel.png', name: 'Melek', unlockLevel: 150, bgGradient: 'from-sky-200 to-white', border: 'border-sky-200' },
  { id: 'elf', icon: '🧝', image: 'https://8upload.com/image/8915ca85d909ab03/elf.png', name: 'Elf', unlockLevel: 160, bgGradient: 'from-green-300 to-emerald-500', border: 'border-emerald-300' },
  { id: 'mermaid', icon: '🧜‍♀️', image: 'https://8upload.com/image/c6d612b4bb6366c4/mermaid.png', name: 'Deniz Kızı', unlockLevel: 180, bgGradient: 'from-blue-400 to-green-400', border: 'border-cyan-300' },
  { id: 'demon', icon: '👿', image: 'https://8upload.com/image/d42b6e92e8fdb0f0/demon.png', name: 'İblis', unlockLevel: 200, bgGradient: 'from-red-900 to-black', border: 'border-red-800' },
  { id: 'zeus', icon: '⚡', image: 'https://8upload.com/image/e50706c10d5cc63f/zeus.png', name: 'Zeus', unlockLevel: 250, bgGradient: 'from-yellow-300 to-blue-500', border: 'border-yellow-400' },
  { id: 'master', icon: '🧘', image: 'https://8upload.com/image/7bc305af25244d12/master.png', name: 'Usta', unlockLevel: 300, bgGradient: 'from-indigo-500 to-purple-600', border: 'border-white' },
  { id: 'rockstar', icon: '🎸', image: 'https://8upload.com/image/457c29669394a28b/rockstar.png', name: 'Rock Yıldızı', unlockLevel: 350, bgGradient: 'from-pink-600 to-purple-800', border: 'border-pink-500' },
  { id: 'gamer', icon: '🎮', image: 'https://8upload.com/image/88c44d8a3be86004/gamer.png', name: 'Oyuncu', unlockLevel: 400, bgGradient: 'from-green-400 to-black', border: 'border-green-500' },
  { id: 'brain', icon: '🧠', image: 'https://8upload.com/image/aafd6be6446927d3/brain.png', name: 'Dahi', unlockLevel: 500, bgGradient: 'from-pink-300 to-rose-400', border: 'border-white' },
];

// UPDATED ECONOMY: Prices increased ~2.5x to match easier XP gain
// Unlock Levels increased slightly to extend progression

// FRAMES
export const FRAMES: FrameDef[] = [
  { id: 'frame_none', name: 'Yok', description: 'Çerçevesiz', cost: 0, style: '' },

  { id: 'frame_wood', name: 'Ahşap', description: 'Doğal ahşap', cost: 2500,
    style: 'border-8 border-amber-800 ring-2 ring-amber-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]', unlockLevel: 5 },

  { id: 'frame_star', name: 'Yıldız', description: 'Yıldızlı', cost: 3500,
    style: 'border-4 border-yellow-300 border-dotted ring-4 ring-yellow-100 shadow-[0_0_10px_#fde047]', unlockLevel: 10 },

  { id: 'frame_gold', name: 'Altın', description: 'Parlak altın', cost: 5000,
    style: 'border-4 border-yellow-400 ring-4 ring-yellow-200 shadow-[0_0_20px_#facc15]', unlockLevel: 15 },

  { id: 'frame_nature', name: 'Doğa', description: 'Yeşil yaprak', cost: 6500,
    style: 'border-8 border-emerald-600 ring-2 ring-emerald-300 border-double shadow-[0_0_10px_#059669]', unlockLevel: 20 },

  { id: 'frame_metal', name: 'Metal', description: 'Gümüş metal', cost: 7500,
    style: 'border-4 border-slate-400 ring-2 ring-slate-200 shadow-inner shadow-slate-500/40', unlockLevel: 25 },

  { id: 'frame_neon', name: 'Neon', description: 'Parlayan yeşil', cost: 8500,
    style: 'frame-neon', unlockLevel: 30 },

  { id: 'frame_love', name: 'Aşk', description: 'Pembe kalp', cost: 9000,
    style: 'border-4 border-pink-500 ring-4 ring-rose-300 shadow-[0_0_20px_#f43f5e]', unlockLevel: 35 },

  { id: 'frame_fire', name: 'Ateş', description: 'Alevli kırmızı', cost: 10000,
    style: 'frame-fire', unlockLevel: 40 },

  { id: 'frame_pixel', name: 'Piksel', description: 'Retro oyun', cost: 10000,
    style: 'border-4 border-green-500 outline outline-4 outline-black outline-dashed', unlockLevel: 45 },

  { id: 'frame_ice', name: 'Buz', description: 'Soğuk mavi', cost: 11000,
    style: 'border-4 border-slate-200 ring-4 ring-sky-200 shadow-[0_0_15px_#bae6fd]', unlockLevel: 50 },

  { id: 'frame_royal', name: 'Asil', description: 'Mor ve altın', cost: 12500,
    style: 'border-4 border-purple-600 ring-2 ring-yellow-400 shadow-[0_0_20px_#9333ea]', unlockLevel: 60 },

  { id: 'frame_dark', name: 'Karanlık', description: 'Gece siyahı', cost: 12500,
    style: 'border-4 border-gray-900 ring-1 ring-gray-600 shadow-[0_0_15px_#0f0f0f]', unlockLevel: 70 },

  { id: 'frame_ghost', name: 'Hayalet', description: 'Yarı saydam', cost: 13500,
    style: 'frame-ghost', unlockLevel: 80 },

  { id: 'frame_cyber', name: 'Siber', description: 'Fütüristik', cost: 15000,
    style: 'border-2 border-yellow-400 ring-2 ring-cyan-400 shadow-[0_0_15px_#22d3ee] border-dashed', unlockLevel: 90 },

  { id: 'frame_glitch', name: 'Glitch', description: 'Bozuk efekt', cost: 17500,
    style: 'frame-glitch', unlockLevel: 100 },

  { id: 'frame_diamond', name: 'Elmas', description: 'Buz mavisi', cost: 20000,
    style: 'border-4 border-cyan-300 ring-2 ring-blue-100 shadow-[0_0_25px_#67e8f9]', unlockLevel: 120 },

  { id: 'frame_lightning', name: 'Yıldırım', description: 'Elektrikli', cost: 22500,
    style: 'frame-lightning', unlockLevel: 150 },

  { id: 'frame_rainbow', name: 'Gökkuşağı', description: 'Renkli', cost: 25000,
    style: 'frame-rainbow', unlockLevel: 200 },

  { id: 'frame_rgb', name: 'RGB Gamer', description: 'Renk değiştiren', cost: 30000,
    style: 'frame-rgb', unlockLevel: 250 },

  { id: 'frame_magma', name: 'Magma', description: 'Hareketli lav', cost: 35000,
    style: 'border-4 border-orange-600 ring-2 ring-red-500 shadow-[0_0_20px_#f97316] animate-pulse', unlockLevel: 300 },

  { id: 'frame_leaf', name: 'Yaprak', description: 'Doğa dostu', cost: 8500,
    style: 'border-8 border-green-600 border-dashed ring-2 ring-green-300 shadow-[0_0_10px_#16a34a]', unlockLevel: 45 },

  { id: 'frame_tech', name: 'Tekno', description: 'Devre kartı', cost: 18000,
    style: 'border-4 border-blue-800 ring-2 ring-cyan-500 border-double shadow-[0_0_15px_#0ea5e9]', unlockLevel: 110 },

  { id: 'frame_shadow', name: 'Gölge', description: 'Derin karanlık efekt', cost: 22000, style: 'border-4 border-black shadow-[0_0_40px_#000] animate-pulse', unlockLevel: 140 },

  { id: 'frame_plasma', name: 'Plazma', description: 'Akışkan neon', cost: 28000, style: 'border-4 border-purple-400 shadow-[0_0_35px_#a855f7] animate-pulse', unlockLevel: 180 },

  { id: 'frame_crystal', name: 'Kristal', description: 'Kırılmış cam efekti', cost: 32000, style: 'border-4 border-blue-200 shadow-[0_0_30px_#bfdbfe] animate-pulse', unlockLevel: 220 },
];

// BACKGROUNDS (UPDATED ECONOMY)
export const BACKGROUNDS: BackgroundDef[] = [
  { id: 'bg_default', name: 'Varsayılan', description: 'Sade geçiş', cost: 0,
    style: 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800' },

  { id: 'bg_blue', name: 'Gökyüzü', description: 'Mavi tonları', cost: 1500,
    style: 'bg-gradient-to-br from-blue-400 to-indigo-500', unlockLevel: 5 },

  { id: 'bg_sunset', name: 'Gün Batımı', description: 'Turuncu ve mor', cost: 2500,
    style: 'bg-gradient-to-br from-orange-400 to-purple-600', unlockLevel: 10 },

  { id: 'bg_nature', name: 'Doğa', description: 'Yeşil ve ferah', cost: 3500,
    style: 'bg-gradient-to-br from-green-400 to-emerald-600', unlockLevel: 15 },

  { id: 'bg_lavender', name: 'Lavanta', description: 'Yumuşak mor', cost: 3500,
    style: 'bg-gradient-to-br from-purple-300 to-indigo-400', unlockLevel: 15 },

  { id: 'bg_fire', name: 'Alev', description: 'Kırmızı ve sarı', cost: 5000,
    style: 'bg-gradient-to-br from-red-500 to-yellow-500', unlockLevel: 20 },

  { id: 'bg_ocean', name: 'Okyanus', description: 'Derin mavi', cost: 5000,
    style: 'bg-gradient-to-br from-cyan-500 to-blue-800', unlockLevel: 20 },

  { id: 'bg_forest', name: 'Orman', description: 'Koyu yeşil', cost: 5000,
    style: 'bg-gradient-to-br from-emerald-700 to-green-900', unlockLevel: 20 },

  { id: 'bg_love', name: 'Aşk', description: 'Pembe rüya', cost: 6000,
    style: 'bg-gradient-to-br from-pink-300 to-rose-500', unlockLevel: 25 },

  { id: 'bg_galaxy', name: 'Galaksi', description: 'Uzay renkleri', cost: 7500,
    style: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800', unlockLevel: 30 },

  { id: 'bg_midnight', name: 'Gece Yarısı', description: 'Koyu lacivert', cost: 8500,
    style: 'bg-gradient-to-br from-slate-900 to-blue-900', unlockLevel: 35 },

  { id: 'bg_ice', name: 'Buzul', description: 'Buz mavisi', cost: 10000,
    style: 'bg-gradient-to-br from-white via-blue-100 to-cyan-200', unlockLevel: 40 },

  { id: 'bg_neon', name: 'Neon', description: 'Parlak siyah', cost: 10000,
    style: 'bg-gradient-to-br from-gray-900 to-black border-2 border-green-400 shadow-[inset_0_0_40px_#00ff00]', unlockLevel: 40 },

  { id: 'bg_candy', name: 'Şekerleme', description: 'Tatlı renkler', cost: 11000,
    style: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400', unlockLevel: 45 },

  { id: 'bg_gold', name: 'Altın', description: 'Lüks görünüm', cost: 12500,
    style: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-[inset_0_0_20px_#facc15]', unlockLevel: 50 },

  { id: 'bg_deep_sea', name: 'Derin Deniz', description: 'Okyanus dibi', cost: 12500,
    style: 'bg-gradient-to-b from-blue-600 via-blue-900 to-black', unlockLevel: 50 },

  { id: 'bg_volcano', name: 'Volkan', description: 'Kızgın lav', cost: 13500,
    style: 'bg-gradient-to-t from-red-900 via-red-600 to-orange-500 shadow-[inset_0_20px_40px_rgba(0,0,0,0.4)]', unlockLevel: 55 },

  { id: 'bg_aurora', name: 'Aurora', description: 'Kuzey ışıkları', cost: 15000,
    style: 'bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600 animate-[pulse_10s_infinite]', unlockLevel: 60 },

  { id: 'bg_matrix', name: 'Matrix', description: 'Dijital kod', cost: 17500,
    style: 'bg-black border-2 border-green-500 shadow-[inset_0_0_20px_#00ff00] shadow-[inset_0_40px_40px_rgba(0,255,0,0.15)]', unlockLevel: 70 },

  { id: 'bg_royal', name: 'Kraliyet', description: 'Asil mor', cost: 20000,
    style: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900 border-2 border-yellow-500 shadow-[0_0_30px_#9333ea]', unlockLevel: 80 },

  { id: 'bg_library', name: 'Kütüphane', description: 'Sakin ortam', cost: 6000,
    style: 'bg-[#f5f5dc] dark:bg-[#2b1a0e] shadow-inner', unlockLevel: 25 },

  { id: 'bg_space_dark', name: 'Derin Uzay', description: 'Sonsuz karanlık', cost: 16000,
    style: 'bg-black border border-white/10 shadow-[inset_0_0_40px_#111]', unlockLevel: 65 },

  { id: 'bg_geometry', name: 'Geometri', description: 'Modern desenler', cost: 10000,
    style: 'bg-gradient-to-tr from-gray-200 to-gray-400 dark:from-gray-800 dark:to-gray-900', unlockLevel: 40 },
  
  { id: 'bg_holo', name: 'Hologram', description: '3D parlama', cost: 22000, style: 'bg-gradient-to-br from-cyan-300 via-purple-300 to-blue-300 animate-pulse', unlockLevel: 90 },

  { id: 'bg_digital', name: 'Dijital Akış', description: 'Akışkan neon çizgiler', cost: 30000, style: 'bg-gradient-to-br from-black via-blue-900 to-black animate-pulse', unlockLevel: 120 },

  { id: 'bg_crystal', name: 'Kristal Buz', description: 'Kırık buz efekti', cost: 35000, style: 'bg-gradient-to-br from-blue-50 via-cyan-200 to-white animate-pulse', unlockLevel: 150 },
];

export const BADGES: Badge[] = [
    // ... BADGES are PRESERVED ...
  { id: 'first_step', name: 'İlk Adım', description: 'İlk kelime kartını inceledin.', icon: '🌱', condition: (s: any) => s.flashcardsViewed >= 1, unlocked: false },
  { id: 'streak_3', name: 'Isınma Turu', description: '3 gün üst üste çalıştın.', icon: '🔥', condition: (s: any) => s.streak >= 3, unlocked: false },
  { id: 'streak_7', name: 'Haftalık Seri', description: '7 gün üst üste çalıştın!', icon: '📅', condition: (s: any) => s.streak >= 7, unlocked: false },
  { id: 'streak_14', name: 'İki Hafta', description: '14 gün üst üste çalıştın.', icon: '🚀', condition: (s: any) => s.streak >= 14, unlocked: false },
  { id: 'streak_30', name: 'Disiplin Abidesi', description: '30 gün boyunca aralıksız çalıştın.', icon: '🏆', condition: (s: any) => s.streak >= 30, unlocked: false },
  { id: 'streak_60', name: 'Seri Katili', description: '60 gün boyunca aralıksız çalıştın.', icon: '⚔️', condition: (s: any) => s.streak >= 60, unlocked: false },
  { id: 'streak_100', name: 'Yüzlük Seri', description: '100 gün seriye ulaştın!', icon: '💯', condition: (s: any) => s.streak >= 100, unlocked: false },
  { id: 'level_5', name: 'Çırak', description: '5. Seviyeye ulaştın.', icon: '🥉', condition: (s: any) => s.level >= 5, unlocked: false },
  { id: 'level_10', name: 'Kalfa', description: '10. Seviyeye ulaştın.', icon: '🥈', condition: (s: any) => s.level >= 10, unlocked: false },
  { id: 'level_25', name: 'Usta', description: '25. Seviyeye ulaştın.', icon: '🥇', condition: (s: any) => s.level >= 25, unlocked: false },
  { id: 'level_50', name: 'Yarım Dalya', description: '50. Seviyeye ulaştın.', icon: '💎', condition: (s: any) => s.level >= 50, unlocked: false },
  { id: 'level_100', name: 'Efsane', description: '100. Seviyeye ulaştın.', icon: '👑', condition: (s: any) => s.level >= 100, unlocked: false },
  { id: 'vocab_50', name: 'Meraklı', description: '50 kelime kartı inceledin.', icon: '👀', condition: (s: any) => s.flashcardsViewed >= 50, unlocked: false },
  { id: 'vocab_100', name: 'Kelime Avcısı', description: '100 kelime kartı inceledin.', icon: '📖', condition: (s: any) => s.flashcardsViewed >= 100, unlocked: false },
  { id: 'vocab_500', name: 'Kelime Kurdu', description: '500 kelime kartı inceledin.', icon: '🐛', condition: (s: any) => s.flashcardsViewed >= 500, unlocked: false },
  { id: 'vocab_1000', name: 'Sözlük Gibi', description: '1000 kelime kartı inceledin.', icon: '🧠', condition: (s: any) => s.flashcardsViewed >= 1000, unlocked: false },
  { id: 'vocab_5000', name: 'Ansiklopedi', description: '5000 kelime kartı inceledin.', icon: '📚', condition: (s: any) => s.flashcardsViewed >= 5000, unlocked: false },
  { id: 'quiz_rookie', name: 'Test Çırağı', description: 'İlk test sorusunu doğru bildin.', icon: '🎯', condition: (s: any) => s.quizCorrect >= 1, unlocked: false },
  { id: 'quiz_50', name: 'Test Meraklısı', description: '50 doğru cevap verdin.', icon: '📝', condition: (s: any) => s.quizCorrect >= 50, unlocked: false },
  { id: 'quiz_100', name: 'Bilgi Küpü', description: '100 doğru cevap verdin.', icon: '💡', condition: (s: any) => s.quizCorrect >= 100, unlocked: false },
  { id: 'quiz_500', name: 'Test Ustası', description: '500 doğru cevap verdin.', icon: '🎓', condition: (s: any) => s.quizCorrect >= 500, unlocked: false },
  { id: 'quiz_1000', name: 'Soru Profesörü', description: '1000 doğru cevap verdin.', icon: '🔬', condition: (s: any) => s.quizCorrect >= 1000, unlocked: false },
  
  { id: 'badge_10', name: 'Rozet Avcısı', description: '10 rozet kazandın.', icon: '🎖️', condition: (s: any) => s.badges.length >= 10, unlocked: false },
  { id: 'badge_20', name: 'Rozet Koleksiyoncusu', description: '20 rozet kazandın.', icon: '🎗️', condition: (s: any) => s.badges.length >= 20, unlocked: false },
  { id: 'badge_30', name: 'Madalyalı', description: '30 rozet kazandın.', icon: '🏅', condition: (s: any) => s.badges.length >= 30, unlocked: false },
  { id: 'badge_50', name: 'Yıldızlı General', description: '50 rozet kazandın.', icon: '🌟', condition: (s: any) => s.badges.length >= 50, unlocked: false },
  { id: 'badge_75', name: 'Onur Madalyası', description: '75 rozet kazandın.', icon: '⚜️', condition: (s: any) => s.badges.length >= 75, unlocked: false },
  { id: 'badge_100', name: 'KelimApp Efsanesi', description: '100 rozet kazandın.', icon: '🔱', condition: (s: any) => s.badges.length >= 100, unlocked: false },

  { id: 'perfect_10', name: 'Kusursuz 10', description: '10 soruluk testi %100 başarıyla bitir.', icon: '🔟', condition: (s: any, ctx: any) => (ctx?.quizSize === 10), unlocked: false },
  { id: 'perfect_25', name: 'Kusursuz 25', description: '25 soruluk testi %100 başarıyla bitir.', icon: '🎯', condition: (s: any, ctx: any) => (ctx?.quizSize === 25), unlocked: false },
  { id: 'perfect_50', name: 'Kusursuz 50', description: '50 soruluk testi %100 başarıyla bitir.', icon: '🏹', condition: (s: any, ctx: any) => (ctx?.quizSize === 50), unlocked: false },
  { id: 'perfect_all', name: 'Ünite Hakimi', description: 'Tüm ünite testini %100 başarıyla bitir.', icon: '🔱', condition: (s: any, ctx: any) => (ctx?.quizSize === -1), unlocked: false },

  { id: 'perfect_streak_5', name: 'Dikkatli', description: '5 testi hatasız bitir.', icon: '👌', condition: (s: any) => s.perfectQuizzes >= 5, unlocked: false },
  { id: 'perfect_streak_10', name: 'Odaklanmış', description: '10 testi hatasız bitir.', icon: '🧐', condition: (s: any) => s.perfectQuizzes >= 10, unlocked: false },
  { id: 'perfect_streak_25', name: 'Keskin Nişancı', description: '25 testi hatasız bitir.', icon: '🏹', condition: (s: any) => s.perfectQuizzes >= 25, unlocked: false },
  { id: 'perfect_streak_50', name: 'Hatasız', description: '50 testi hatasız bitir.', icon: '🤖', condition: (s: any) => s.perfectQuizzes >= 50, unlocked: false },
  { id: 'perfect_streak_100', name: 'Mükemmeliyetçi', description: '100 testi hatasız bitir.', icon: '💎', condition: (s: any) => s.perfectQuizzes >= 100, unlocked: false },

  { id: 'quest_3', name: 'Görev Adamı', description: '3 günlük görev tamamla.', icon: '📜', condition: (s: any) => s.questsCompleted >= 3, unlocked: false },
  { id: 'quest_10', name: 'Maceracı', description: '10 günlük görev tamamla.', icon: '⚔️', condition: (s: any) => s.questsCompleted >= 10, unlocked: false },
  { id: 'quest_25', name: 'Kahraman', description: '25 günlük görev tamamla.', icon: '🛡️', condition: (s: any) => s.questsCompleted >= 25, unlocked: false },
  { id: 'quest_50', name: 'Efsanevi', description: '50 günlük görev tamamla.', icon: '🦄', condition: (s: any) => s.questsCompleted >= 50, unlocked: false },
  { id: 'quest_100', name: 'Destansı', description: '100 günlük görev tamamla.', icon: '🐲', condition: (s: any) => s.questsCompleted >= 100, unlocked: false },

  { id: 'time_15m', name: 'Isınma', description: '15 dakika çalış.', icon: '⏱️', condition: (s: any) => s.totalTimeSpent >= 15, unlocked: false },
  { id: 'time_1h', name: 'Odaklı', description: '1 saat çalış.', icon: '⌛', condition: (s: any) => s.totalTimeSpent >= 60, unlocked: false },
  { id: 'time_2h', name: 'Çalışkan', description: '2 saat çalış.', icon: '📚', condition: (s: any) => s.totalTimeSpent >= 120, unlocked: false },
  { id: 'time_5h', name: 'Azimli', description: '5 saat çalış.', icon: '🕯️', condition: (s: any) => s.totalTimeSpent >= 300, unlocked: false },
  { id: 'time_10h', name: 'Bilgin', description: '10 saat çalış.', icon: '🦉', condition: (s: any) => s.totalTimeSpent >= 600, unlocked: false },
  { id: 'time_24h', name: 'İngilizce Kurdu', description: '24 saat çalış (1 tam gün!).', icon: '☀️', condition: (s: any) => s.totalTimeSpent >= 1440, unlocked: false },

  { id: 'night_owl', name: 'Gece Kuşu', description: 'Gece yarısından sonra çalıştın.', icon: '🦉', condition: () => { const h = new Date().getHours(); return h >= 0 && h < 5; }, unlocked: false },
  { id: 'early_bird', name: 'Erkenci Kuş', description: 'Sabah erken (05-08) çalıştın.', icon: '🌅', condition: () => { const h = new Date().getHours(); return h >= 5 && h < 8; }, unlocked: false },
  { id: 'weekend_warrior', name: 'Haftasonu Savaşçısı', description: 'Haftasonu çalıştın.', icon: '🎉', condition: () => { const d = new Date().getDay(); return d === 0 || d === 6; }, unlocked: false },
  { id: 'persistent', name: 'Azimli', description: 'Yanlış yapsan da çalışmaya devam ettin (50 Yanlış).', icon: '💪', condition: (s: any) => s.quizWrong >= 50, unlocked: false },
  { id: 'bookworm', name: 'Kitap Kurdu', description: 'Toplam 10.000 XP puana ulaştın.', icon: '📜', condition: (s: any) => s.xp >= 10000, unlocked: false },
  { id: 'millionaire', name: 'XP Milyoneri', description: '1.000.000 XP puana ulaştın.', icon: '💰', condition: (s: any) => s.xp >= 1000000, unlocked: false },
  { id: 'fast_learner', name: 'Hız Tutkunu', description: 'Bir günde 100 kelimeye baktın.', icon: '⚡', condition: (s: any) => s.viewedWordsToday.length >= 100, unlocked: false },
  { id: 'dedicated', name: 'Adanmış', description: 'Toplam 5000 XP kazandın.', icon: '🎗️', condition: (s: any) => s.xp >= 5000, unlocked: false },

  { id: 'maze_runner', name: 'Labirent Gezgini', description: 'Labirent oyununda 100 puan topla.', icon: '🏃', condition: (s: any) => s.weekly.mazeHighScore >= 100, unlocked: false },
  { id: 'maze_solver', name: 'Kaşif', description: 'Labirent oyununda 500 puan topla.', icon: '🧭', condition: (s: any) => s.weekly.mazeHighScore >= 500, unlocked: false },
  { id: 'maze_master', name: 'Yol Bulucu', description: 'Labirent oyununda 1000 puan topla.', icon: '🏰', condition: (s: any) => s.weekly.mazeHighScore >= 1000, unlocked: false },

  { id: 'search_novice', name: 'Meraklı', description: 'Kelime Bulmaca oyununda 100 puan yap.', icon: '🔎', condition: (s: any) => s.weekly.wordSearchHighScore >= 100, unlocked: false },
  { id: 'search_pro', name: 'Dedektif', description: 'Kelime Bulmaca oyununda 300 puan yap.', icon: '🕵️', condition: (s: any) => s.weekly.wordSearchHighScore >= 300, unlocked: false },
  { id: 'search_expert', name: 'Şahin Göz', description: 'Kelime Bulmaca oyununda 600 puan yap.', icon: '🦅', condition: (s: any) => s.weekly.wordSearchHighScore >= 600, unlocked: false },

  { id: 'matching_pro', name: 'Hafıza Ustası', description: 'Eşleştirme oyununda 200+ puan al.', icon: '🧠', condition: (s: any) => s.weekly.matchingBestTime >= 200, unlocked: false },
  { id: 'matching_eagle', name: 'Keskin Göz', description: 'Eşleştirme oyununda 500+ puan al.', icon: '🦅', condition: (s: any) => s.weekly.matchingBestTime >= 500, unlocked: false },

  { id: 'shopper_bronze', name: 'Müşteri', description: 'Marketten 1 eşya satın al.', icon: '🛍️', condition: (s: any) => {
      const stored = localStorage.getItem('lgs_user_profile');
      if (stored) {
          const p = JSON.parse(stored);
          const purchasedCount = (p.purchasedFrames?.length || 1) + (p.purchasedThemes?.length || 2) + (p.purchasedBackgrounds?.length || 1);
          return purchasedCount >= 5; 
      }
      return false;
  }, unlocked: false },
  { id: 'shopper_silver', name: 'Koleksiyoner', description: 'Marketten 5 eşya satın al.', icon: '🎩', condition: (s: any) => {
       const stored = localStorage.getItem('lgs_user_profile');
       if (stored) {
           const p = JSON.parse(stored);
           const purchasedCount = (p.purchasedFrames?.length || 1) + (p.purchasedThemes?.length || 2) + (p.purchasedBackgrounds?.length || 1);
           return purchasedCount >= 9;
       }
       return false;
  }, unlocked: false },
   { id: 'shopper_gold', name: 'Market Kralı', description: 'Marketten 10 eşya satın al.', icon: '💎', condition: (s: any) => {
       const stored = localStorage.getItem('lgs_user_profile');
       if (stored) {
           const p = JSON.parse(stored);
           const purchasedCount = (p.purchasedFrames?.length || 1) + (p.purchasedThemes?.length || 2) + (p.purchasedBackgrounds?.length || 1);
           return purchasedCount >= 14; 
       }
       return false;
  }, unlocked: false },

  { id: 'vocab_treasure', name: 'Kelime Hazinesi', description: 'Toplam 1000 kelime kartı görüntüle.', icon: '📚', condition: (s: any) => s.flashcardsViewed >= 1000, unlocked: false },
  { id: 'wealthy', name: 'Servet', description: 'Hesabında 20.000 XP biriktir.', icon: '💰', condition: (s: any) => s.xp >= 20000, unlocked: false },
  { id: 'marathon', name: 'Maraton', description: 'Uygulamada toplam 50 saat geçir.', icon: '⏳', condition: (s: any) => s.totalTimeSpent >= 3000, unlocked: false },
];