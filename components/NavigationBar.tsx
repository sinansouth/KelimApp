
import React from 'react';
import { Home, User, Settings, HelpCircle } from 'lucide-react';
import { AppMode } from '../types';

interface NavigationBarProps {
    currentMode: AppMode;
    onNavigate: (mode: AppMode) => void;
    onOpenMenu: () => void;
    onResetHome: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentMode, onNavigate, onOpenMenu, onResetHome }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-[50] safe-area-bottom">
            <button
                onClick={() => {
                    onResetHome();
                }}
                className={`flex flex-col items-center gap-1 transition-colors ${currentMode === AppMode.HOME ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <div className={`p-2 rounded-xl ${currentMode === AppMode.HOME ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <Home size={24} />
                </div>
                <span className="text-[10px] font-bold">Ana Sayfa</span>
            </button>

            <button
                onClick={() => onNavigate(AppMode.PROFILE)}
                className={`flex flex-col items-center gap-1 transition-colors ${currentMode === AppMode.PROFILE ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <div className={`p-2 rounded-xl ${currentMode === AppMode.PROFILE ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <User size={24} />
                </div>
                <span className="text-[10px] font-bold">Profil</span>
            </button>

            <button
                onClick={() => onNavigate(AppMode.SETTINGS)}
                className={`flex flex-col items-center gap-1 transition-colors ${currentMode === AppMode.SETTINGS ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <div className={`p-2 rounded-xl ${currentMode === AppMode.SETTINGS ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <Settings size={24} />
                </div>
                <span className="text-[10px] font-bold">Ayarlar</span>
            </button>

            <button
                onClick={() => onNavigate(AppMode.INFO)}
                className={`flex flex-col items-center gap-1 transition-colors ${currentMode === AppMode.INFO ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <div className={`p-2 rounded-xl ${currentMode === AppMode.INFO ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                    <HelpCircle size={24} />
                </div>
                <span className="text-[10px] font-bold">Rehber</span>
            </button>
        </div>
    );
};

export default NavigationBar;
