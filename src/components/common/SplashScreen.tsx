import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Sparkles, Shield, Award } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  durationMs = 1500 
}) => {
  const { branding } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setTimeout(onFinish, 180);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  const logoSrc = branding.logoUrl || '/logo.png';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] bg-[#050811] flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none"
    >
      {/* Dynamic Animated Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-gradient-to-tr from-blue-600/25 via-sky-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        
        {/* Central Logo Container (Completely Transparent - No solid background box) */}
        <div className="relative mb-6 flex items-center justify-center">
          
          {/* Outer Pulsing Aura */}
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.9, 0.5] 
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="absolute -inset-6 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 rounded-full blur-2xl opacity-60"
          />

          {/* Rotating Subtle Tech Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 rounded-full border border-dashed border-sky-400/30"
          />

          {/* Center Logo with Clean Transparency */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center bg-transparent drop-shadow-[0_10px_25px_rgba(59,130,246,0.5)]"
          >
            <img
              src={logoSrc}
              alt="شعار فريق متطوعين اتحاد طلاب جامعة الإسكندرية"
              className="w-full h-full object-contain filter drop-shadow-lg transform transition-transform"
            />
          </motion.div>
        </div>

        {/* Union & Application Identity Titles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>اتحاد طلاب جامعة الإسكندرية</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-300 tracking-tight leading-snug">
            {branding.appTitle || 'فريق متطوعين اتحاد الطلاب'}
          </h1>

          <p className="text-xs text-slate-400 font-medium max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {branding.subtitle || 'المنظومة الرقمية الرسمية لإدارة الفعاليات والعمل التطوعي'}
          </p>
        </motion.div>

        {/* Modern Creative Loading Track */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-48 sm:w-56 space-y-2"
        >
          <div className="h-1.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 rounded-full shadow-lg shadow-sky-500/50"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold px-1">
            <span className="text-slate-400">جاري بدء المنظومة...</span>
            <span className="text-sky-400">{progress}%</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
