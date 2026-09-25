import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Trophy } from 'lucide-react';

export const CelebrationOverlay: React.FC = () => {
  const { celebrationData } = useApp();

  useEffect(() => {
    if (celebrationData?.active) {
      // Trigger canvas confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [celebrationData]);

  if (!celebrationData?.active) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="glass-card p-4 rounded-2xl border-2 border-amber-400 bg-slate-950 shadow-2xl flex items-center gap-3.5 glow-primary max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="text-right">
          <div className="text-xs font-black text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{celebrationData.badgeTitle}</span>
          </div>
          <div className="text-xs font-extrabold text-white mt-0.5">
            تمت إضافة <span className="text-amber-400 font-mono">+{celebrationData.points} XP</span> إلى رصيدك!
          </div>
        </div>
      </div>
    </div>
  );
};
