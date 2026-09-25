import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, Sparkles, Send, X, Mic, MicOff, Volume2, VolumeX, 
  Trash2, Play, Pause, Radio, RefreshCw, Smile, Lightbulb, Zap, Shield, Heart, User
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { members, committees, teamHealthScore, currentUser, tasks, events } = useApp();

  const getUserHonorific = () => {
    if (currentUser.role === 'super_admin') return `يا رئيس فريق متطوعي اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'vice_president') return `يا نائب رئيس فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'advisor') return `يا سيادة المستشار ${currentUser.fullName}`;
    if (currentUser.role === 'general_coordinator') return `يا منسق عام فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'operations_manager') return `يا قائد عمليات وميدان المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'quality_officer') return `يا مسؤول الجودة والتقييم ${currentUser.fullName}`;
    if (currentUser.role === 'hr_admin') return `يا مسؤول الموارد البشرية ${currentUser.fullName}`;
    if (currentUser.role === 'head') return `يا قائد وهيد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    if (currentUser.role === 'vice_head') return `يا نائب قائد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    return `يا بطلنا المتطوع ${currentUser.fullName}`;
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'ai',
      text: `أهلاً بيك ${getUserHonorific()}! 🌟\nأنا «شربيني» المرشد الذكي والمستشار الميداني لفريق متطوعي اتحاد طلاب جامعة الإسكندرية.\nمعاك بكل حكمة وخفة دم لدعم شغلك، حل أي أزمة ميدانية، أو تنظيم أفكارك.. تحب نسولف بالكتابة ولا تسجل لي ريكورد زي الواتساب؟ 🎙️💬`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // WhatsApp-like Voice Recording States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping, isRecordingVoice]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-EG';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setLiveTranscript(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // WhatsApp Voice Recording Handlers
  const startVoiceRecording = async () => {
    try {
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      setLiveTranscript('');

      // Start duration counter
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Start recognition in background if supported
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // already started
        }
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل الريكورد 🎙️');
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    setAudioBlobUrl(null);
    setLiveTranscript('');
  };

  const sendVoiceRecording = () => {
    if (!mediaRecorderRef.current || !isRecordingVoice) return;

    clearInterval(recordingTimerRef.current);
    const capturedSeconds = recordingSeconds;
    const finalTranscript = liveTranscript.trim() || 'تسجيل صوتي 🎙️';

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);

      const userVoiceMsg: ChatMessage = {
        id: `user-voice-${Date.now()}`,
        role: 'user',
        text: finalTranscript,
        audioUrl: url,
        audioDuration: capturedSeconds,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, userVoiceMsg]);
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
      setLiveTranscript('');

      // Trigger AI smart & witty response
      generateSmartWittyResponse(finalTranscript);
    };

    mediaRecorderRef.current.stop();
  };

  // Play / Pause Audio Bubble
  const togglePlayAudio = (msgId: string, url?: string) => {
    if (!url) return;

    if (playingAudioId === msgId) {
      activeAudioElementRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
    }

    const audio = new Audio(url);
    activeAudioElementRef.current = audio;
    setPlayingAudioId(msgId);

    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio.play();
  };

  // Format seconds as 0:00
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Smart, Wise, Cheerful & Witty AI Response Engine
  const generateSmartWittyResponse = (userPrompt: string) => {
    setIsTyping(true);
    const prompt = userPrompt.toLowerCase();

    setTimeout(() => {
      let reply = '';

      if (prompt.includes('سلام') || prompt.includes('صباح') || prompt.includes('مساء') || prompt.includes('ازيك') || prompt.includes('عامل ايه')) {
        reply = `يا هلا بيك وبطلعتك المنورة! 🌟 أنا تمام والحمد لله جاهز بالورقة والقلم والابتسامة الاسكندراني! قولي، اليوم في معركة تنظيمية ولا عايزين نخطط لحاجة عظمة؟`;
      } 
      else if (prompt.includes('تعبان') || prompt.includes('ضغط') || prompt.includes('مرهق') || prompt.includes('زهقت') || prompt.includes('مش قادر')) {
        reply = `يا غالي روق وهدي اللعب شوية.. ☕ كوباية شاي بلبن اسكندراني مع نسمة بحر من الكورنيش وهترجع زي الفل! افتكر دايماً إن التطوع متعة مش عقاب، وزّع المهام على باقي الأبطال وخد لك بريك نص ساعة، الاتحاد مش هيطير وإحنا وراك دايماً! 💙`;
      }
      else if (prompt.includes('تنظيم') || prompt.includes('حشود') || prompt.includes('قاعة') || prompt.includes('فعالية') || prompt.includes('مدرج')) {
        reply = `يا باشا سر التنظيم الناجح في كلمتين: «الابتسامة والهدوء»! 😉\n1. حط نقطة استقبال واضحة عند الباب الرئيسي.\n2. قسّم قاعة المدرج قطاعات (يمين، شمال، وسط) ولكل قطاع متطوعين ثابتين.\n3. خلي اللاسلكي أو جروب الواتساب شغال للأمور الطارئة بس، وبلاش زحمة كلام عشان التركيز!`;
      }
      else if (prompt.includes('صحة الفريق') || prompt.includes('أداء') || prompt.includes('مؤشر') || prompt.includes('تقييم')) {
        reply = `مؤشر صحة الفريق العام حالياً واصل ${teamHealthScore}% 🟢\nاللجان شغالة بروح عالية، وأهم حاجة نفضل محافظين على التناغم ونشجع المتطوعين الجدد بكلمة حلوة وشكر فوري في الاجتماع الجاي!`;
      }
      else if (prompt.includes('متطوع زعلان') || prompt.includes('مشكلة') || prompt.includes('خناقة') || prompt.includes('شكوى')) {
        reply = `حكمة شربيني الميدانية: «المتطوع الزعلان محتاج ودان تسمعه وقلب يقدره»! 🤝\nاسمع منه الأول على انفراد من غير مقاطعة، حسسه إن رأيه فارق جداً، واديله تكليف يظهر فيه شطارته.. هتلاقيه اتحول لأكتر واحد متحمس في الفريق!`;
      }
      else if (prompt.includes('نكتة') || prompt.includes('اضحك') || prompt.includes('دمك خفيف') || prompt.includes('هزار')) {
        reply = `مرة متطوع في لجنة التنظيم سألوه: إيه أحلى حاجة في الإيفنت؟ قالهم: اللحظة اللي بنقول فيها للحضور "تفضلوا بالجلوس" والكل يقعد فعلاً ومحدش يعترض! دي لوحدها معجزة إدارية بتفرح القلب 😂❤️`;
      }
      else if (prompt.includes('لجنة') || prompt.includes('لجان') || prompt.includes('هيد')) {
        const commCount = committees.length;
        reply = `عندنا ${commCount} لجان تخصصية وحوش في الميدان (تنظيم، إعلام، علاقات عامة، موارد بشرية، لوجستيات، طبي)! كل هيد ومعاه نوابه عاملين شغل عالمي.. تحب نركز على خطة لجنة معينة منهم؟`;
      }
      else if (prompt.includes('مستشار') || prompt.includes('محمد رمضان') || prompt.includes('رئيس')) {
        reply = `تحياتي وتقديري الخالص لقيادات ومستشاري فريق متطوعي جامعة الإسكندرية! 👑 التوجيه الحكيم والإدارة الواعية هما سر النجاح والانضباط اللي الفريق عايش فيه.`;
      }
      else {
        reply = `كلامك على راسي يا قائد! 🌟 الموضوع ده محتاج تركيز وتنسيق حلو.. نصيحتي ليك: ابدأ بالخطوة الأولى البسيطة، وثّق كل حاجة على الأبلكيشن، وخلي روح الفريق دايماً رقم واحد. لو محتاج أصيغلك مسودة قرار أو خطة مهام فورية، اديني إشارة وأنا في الخدمة! 🚀`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setQuery('');
    generateSmartWittyResponse(userText);
  };

  // Text to Speech
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.95;

    utterance.onend = () => setCurrentlySpeakingId(null);
    utterance.onerror = () => setCurrentlySpeakingId(null);

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-xl w-full p-4 sm:p-5 border border-purple-500/40 shadow-2xl bg-slate-950 text-right flex flex-col h-[580px] rounded-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>المساعد الذكي «شربيني AI»</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  حكيم & دمه خفيف 🌟
                </span>
              </h3>
              <p className="text-[10px] text-purple-300 truncate max-w-[240px] sm:max-w-none">
                {getUserHonorific()}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0 text-[10px]">
          <button
            onClick={() => generateSmartWittyResponse('إزاي أحل مشكلة الإرهاق وضغط الفعاليات مع المتطوعين؟')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-purple-500/30 text-purple-300 hover:bg-purple-950/40 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Heart className="w-3 h-3 text-pink-400" />
            <span>علاج إرهاق المتطوعين</span>
          </button>
          <button
            onClick={() => generateSmartWittyResponse('إيه خطة إدارة الحشود وتوزيع الأبواب في المدرجات؟')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-blue-500/30 text-blue-300 hover:bg-blue-950/40 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-sky-400" />
            <span>تنظيم الحشود والمدرج</span>
          </button>
          <button
            onClick={() => generateSmartWittyResponse('قولي حكمة أو فزورة تضحك الشباب في اجتماع اللجنة!')}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-950/40 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
          >
            <Smile className="w-3 h-3 text-amber-400" />
            <span>نكتة أو حكمة للاجتماع</span>
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 mb-2">
          {chatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'ai' ? (
                <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] sm:max-w-md leading-relaxed shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                
                {/* Voice Note Bubble UI if audio exists */}
                {msg.audioUrl ? (
                  <div className="space-y-2 mb-1">
                    <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10">
                      <button
                        onClick={() => togglePlayAudio(msg.id, msg.audioUrl)}
                        className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 hover:scale-105 transition-all cursor-pointer"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>

                      {/* Animated Sound Waveform */}
                      <div className="flex items-center gap-0.5 flex-1 h-6 px-1">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 95, 60, 40].map((h, i) => (
                          <span 
                            key={i} 
                            style={{ height: `${playingAudioId === msg.id ? (i % 2 === 0 ? h : h * 0.6) : 30}%` }}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono text-slate-300">
                        {formatSeconds(msg.audioDuration || 0)}
                      </span>
                    </div>

                    {msg.text && (
                      <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/10">
                        "{msg.text}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                )}

                {/* Footer of Bubble */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {msg.role === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-all"
                      title="استماع صوتي"
                    >
                      {currentlySpeakingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400 font-bold">إيقاف 🔊</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>استماع 🔊</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-purple-950/40 rounded-2xl border border-purple-500/30 text-purple-300 text-xs animate-pulse max-w-xs">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>«شربيني» بيفكر ويجهزلك الرد الحكيم...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Voice Recording Active Bar OR Input Form */}
        {isRecordingVoice ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-emerald-950/80 border-2 border-rose-500/50 flex items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-bottom-2 shrink-0">
            
            {/* Recording Pulse & Timer */}
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div className="text-right">
                <span className="text-xs font-black text-rose-400 font-mono tracking-wider">
                  {formatSeconds(recordingSeconds)}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">جاري تسجيل الريكورد صوتياً...</p>
              </div>
            </div>

            {/* Live Audio Waves Simulation */}
            <div className="hidden sm:flex items-center gap-1 h-5 px-2">
              {[60, 100, 40, 80, 50, 90, 70, 100, 30, 85].map((h, i) => (
                <span 
                  key={i} 
                  style={{ height: `${(i % 3 === 0 ? 100 : (i % 2 === 0 ? 60 : 40))}%` }}
                  className="w-1 bg-rose-400 rounded-full animate-pulse"
                />
              ))}
            </div>

            {/* Action Buttons: Cancel Trash & Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                title="إلغاء وحذف الريكورد"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={sendVoiceRecording}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer animate-pulse"
                title="إرسال الريكورد لشربيني"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال 🚀</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0">
            
            {/* WhatsApp Mic Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
              title="اضغط لتسجيل ريكورد صوتي زي الواتساب 🎙️"
            >
              <Mic className="w-4 h-4" />
              <span className="text-[10px] font-bold hidden sm:inline">ريكورد</span>
            </button>

            <input 
              type="text"
              placeholder="اكتب رسالتك أو سجل ريكورد مع شربيني..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="glass-input text-xs flex-1"
            />

            <button 
              type="submit" 
              disabled={!query.trim()}
              className="btn-primary text-xs py-2.5 px-4 cursor-pointer shrink-0 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
