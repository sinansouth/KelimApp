
import React, { useState } from 'react';
import { X, Zap, Trophy, Unlock, Trash2, ShieldAlert, Plus, UserCheck, Award } from 'lucide-react';
import { adminAddXP, adminSetLevel, adminUnlockAllItems, adminResetDailyQuests, adminUnlockAllBadges, adminUnlockAllAvatars, getUserStats } from '../services/userService';
import { playSound } from '../services/soundService';

interface AdminModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onUpdate }) => {
  const [currentStats, setCurrentStats] = useState(getUserStats());

  const handleAddXP = (amount: number) => {
    adminAddXP(amount);
    playSound('success');
    refresh();
  };

  const handleSetLevel = (level: number) => {
    adminSetLevel(level);
    playSound('success');
    refresh();
  };

  const handleUnlockAll = () => {
    adminUnlockAllItems();
    playSound('success');
    alert("XP eklendi. Marketten her şeyi alabilirsin.");
    refresh();
  };

  const handleUnlockBadges = () => {
    adminUnlockAllBadges();
    playSound('success');
    alert("Tüm Rozetler Açıldı!");
    refresh();
  };

  const handleUnlockAvatars = () => {
    adminUnlockAllAvatars();
    playSound('success');
    alert("Seviye 500 yapıldı. Tüm Avatarlar Açıldı!");
    refresh();
  };

  const handleResetQuests = () => {
    adminResetDailyQuests();
    playSound('click');
    alert("Günlük görevler sıfırlandı.");
    refresh();
  };

  const refresh = () => {
    setCurrentStats(getUserStats());
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl shadow-2xl border-2 border-red-500/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 bg-slate-900 text-white">
        
        <div className="bg-red-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg">
                <ShieldAlert size={24} /> YÖNETİCİ MODU
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            
            {/* Current Stats Info */}
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold">Mevcut XP</div>
                    <div className="text-2xl font-black text-yellow-400">{currentStats.xp}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold">Seviye</div>
                    <div className="text-2xl font-black text-green-400">{currentStats.level}</div>
                </div>
            </div>

            {/* XP Cheats */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase">XP Ekle</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleAddXP(100)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">+100 XP</button>
                    <button onClick={() => handleAddXP(1000)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">+1.000 XP</button>
                    <button onClick={() => handleAddXP(10000)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">+10.000 XP</button>
                </div>
            </div>

            {/* Level Cheats */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase">Seviye Ata</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleSetLevel(10)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">Lvl 10</button>
                    <button onClick={() => handleSetLevel(50)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">Lvl 50</button>
                    <button onClick={() => handleSetLevel(100)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl font-bold text-sm transition-colors border border-slate-700">Lvl 100</button>
                </div>
            </div>

            {/* Unlocks */}
            <div className="space-y-3">
                <button 
                    onClick={handleUnlockBadges}
                    className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Award size={20} /> Tüm Rozetleri Aç
                </button>
                <button 
                    onClick={handleUnlockAvatars}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <UserCheck size={20} /> Tüm Avatarları Aç (Max Lvl)
                </button>
                <button 
                    onClick={handleUnlockAll}
                    className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Unlock size={20} /> Sınırsız XP (Market İçin)
                </button>
            </div>

            {/* Reset Quests */}
            <button 
                onClick={handleResetQuests}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 mt-4"
            >
                <Trash2 size={20} /> Günlük Görevleri Sıfırla
            </button>

        </div>
      </div>
    </div>
  );
};

export default AdminModal;
