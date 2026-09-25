import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VoicePlayerProps {
  audioUrl: string;
  durationSeconds?: number;
  label?: string;
  className?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  durationSeconds = 0,
  label = 'تسجيل صوتي',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between gap-3 text-right ${className}`}>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 transition-all shadow-md cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-white truncate">{label}</span>
            <span className="font-mono text-slate-400 font-semibold">
              {formatTime(currentTime)} / {formatTime(totalDuration || durationSeconds || 15)}
            </span>
          </div>

          {/* Waveform / Progress bar */}
          <div 
            onClick={(e) => {
              if (!audioRef.current || totalDuration <= 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              // In RTL, flip or standard
              const newTime = clickPos * totalDuration;
              audioRef.current.currentTime = newTime;
              setCurrentTime(Math.round(newTime));
            }}
            className="w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMute}
        className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
      </button>
    </div>
  );
};
