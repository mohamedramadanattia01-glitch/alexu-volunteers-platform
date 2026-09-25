import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Check, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, durationSeconds: number) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم تسجيل الصوت المباشر.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedAudioUrl(base64data);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMsg(err.message || 'تعذر الوصول إلى المايكروفون. يرجى التأكد من السماح بالوصول.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setRecordedAudioUrl(null);
    setDuration(0);
    setIsPlayingPreview(false);
    setErrorMsg(null);
  };

  const togglePreview = () => {
    if (!recordedAudioUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(recordedAudioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleConfirm = () => {
    if (recordedAudioUrl) {
      onRecordingComplete(recordedAudioUrl, duration);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-right space-y-3">
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Initial state: Not recording & No recording yet */}
      {!isRecording && !recordedAudioUrl && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">تسجيل فويس نوت (Voice Brief)</div>
              <div className="text-[11px] text-slate-400">سجل صوتك بوضوح لتوجيه المتطوع أو الفريق</div>
            </div>
          </div>

          <button
            type="button"
            onClick={startRecording}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-md bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>بدء التسجيل</span>
          </button>
        </div>
      )}

      {/* Recording in progress */}
      {isRecording && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div className="text-xs">
              <span className="font-bold text-rose-300 block">جاري التسجيل الصوتي...</span>
              <span className="font-mono text-white text-xs font-extrabold">{formatSeconds(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={stopRecording}
              className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف وحفظ</span>
            </button>
          </div>
        </div>
      )}

      {/* Recorded & Ready to preview/confirm */}
      {recordedAudioUrl && !isRecording && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePreview}
              className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
            </button>
            <div className="text-xs">
              <span className="font-bold text-emerald-400 block">تم التسجيل بنجاح ✓</span>
              <span className="font-mono text-slate-400 text-[10px]">{formatSeconds(duration)} دقيقة</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetRecording}
              title="إعادة التسجيل"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer font-bold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>اعتماد الفويس</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
