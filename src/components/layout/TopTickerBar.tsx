import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ChevronRight, ChevronLeft, Megaphone, Edit3, Volume2, VolumeX } from 'lucide-react';

interface TopTickerBarProps {
  onOpenSettings?: () => void;
}

export const TopTickerBar: React.FC<TopTickerBarProps> = ({ onOpenSettings }) => {
  const { branding, soundSettings, updateSoundSettings, isHighLeadership } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const messages = branding.tickerMessages && branding.tickerMessages.length > 0
    ? branding.tickerMessages
    : ['✨ أهلاً بكم في منصة فريق متطوعي اتحاد طلاب جامعة الإسكندرية V-OS 2.0'];

  useEffect(() => {
    if (!branding.tickerActive || isPaused || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, (branding.tickerSpeed || 5) * 1000);

    return () => clearInterval(interval);
  }, [branding.tickerActive, branding.tickerSpeed, isPaused, messages.length]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + messages.length) % messages.length);
  };

  if (!branding.tickerActive) return null;

  const canEdit = isHighLeadership;

  return (
    <div 
      className="w-full bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/20 px-3 py-1.5 text-xs text-slate-200 z-30 transition-all select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Right Tag / Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
            <Megaphone className="w-3 h-3 text-sky-400 animate-pulse" />
            <span className="hidden xs:inline">رسائل وعبارات المنصة</span>
          </span>
        </div>

        {/* Center Animated Message Content */}
        <div className="flex-1 overflow-hidden min-w-0 flex items-center justify-center text-center">
          <div 
            key={currentIndex} 
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-[11px] sm:text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0 inline" />
            <span className="truncate">{messages[currentIndex]}</span>
          </div>
        </div>

        {/* Left Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={() => updateSoundSettings({ enabled: !soundSettings.enabled })}
            title={soundSettings.enabled ? 'كتم الأصوات' : 'تفعيل الأصوات والنغمات'}
            className={`p-1 rounded-md text-[10px] transition-all cursor-pointer ${
              soundSettings.enabled ? 'text-sky-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundSettings.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Edit Phrases Button (Admin/Head) */}
          {canEdit && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="تعديل عبارات الشريط واللوجو"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
            >
              <Edit3 className="w-3 h-3 text-blue-400" />
              <span className="hidden md:inline">تعديل</span>
            </button>
          )}

          {/* Prev / Next Chevrons */}
          {messages.length > 1 && (
            <div className="flex items-center gap-0.5 text-slate-400">
              <button
                onClick={handlePrev}
                className="p-0.5 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                title="السابق"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-0.5">
                {currentIndex + 1}/{messages.length}
              </span>
              <button
                onClick={handleNext}
                className="p-0.5 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                title="التالي"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
