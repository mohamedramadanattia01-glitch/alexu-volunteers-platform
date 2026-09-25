import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, Sparkles, Send, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { members, committees, teamHealthScore, currentUser } = useApp();

  const getUserHonorific = () => {
    if (currentUser.role === 'super_admin') return `يا رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'vice_president') return `يا نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'advisor') return `يا مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية ${currentUser.fullName}`;
    if (currentUser.role === 'general_coordinator') return `يا منسق عام فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'operations_manager') return `يا مسؤول عمليات وميدان فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'quality_officer') return `يا مسؤول جودة وتقييم فريق المتطوعين ${currentUser.fullName}`;
    if (currentUser.role === 'hr_admin') return `يا مسؤول الموارد البشرية ${currentUser.fullName}`;
    if (currentUser.role === 'head') return `يا قائد وهيد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    if (currentUser.role === 'vice_head') return `يا نائب قائد ${currentUser.currentCommitteeName || 'اللجنة'} ${currentUser.fullName}`;
    return `يا بطلنا المتطوع ${currentUser.fullName}`;
  };

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: `أهلاً بك ${getUserHonorific()}! 🌟 أنا «شربيني» المساعد والمرشد الذكي لفريق متطوعين اتحاد طلاب جامعة الإسكندرية. كيف يمكنني مساعدتك وإرشادك اليوم صوتياً أو كتابياً؟`
    }
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-EG';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('التعرف على الصوت غير مدعوم في متصفحك الحالي.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/•/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = 0.95;

    utterance.onend = () => setCurrentlySpeakingIndex(null);
    utterance.onerror = () => setCurrentlySpeakingIndex(null);

    setCurrentlySpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (userText.includes('أفضل') || userText.includes('أعلى') || userText.includes('top')) {
        reply = `أفضل المتطوعين أداءً حالياً يا قائدنا: أحمد عادل (96%، تنظيم)، سارة محمود (94%، تصميم)، وحازم الملاح (93%، مونتاج).`;
      } else if (userText.includes('صحة') || userText.includes('أداء') || userText.includes('Health')) {
        reply = `مؤشر صحة الفريق العام هو ${teamHealthScore}% 🟢 بنسبة التزام وانضباط ممتازة لكافة اللجان الـ 6.`;
      } else if (userText.includes('ورشة') || userText.includes('تدريب')) {
        reply = `يمكنك فتح تبويب "صانع السشنات والورش" لإنشاء خطة تدريب تفاعلية كاملة مع التمارين ونماذج التقييم!`;
      } else {
        reply = `أهلاً بك يا بطلنا. أنا «شربيني» معك على مدار الساعة لدعم كافة عمليات فريق متطوعين اتحاد طلاب جامعة الإسكندرية.`;
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-5 border border-purple-500/40 shadow-2xl bg-slate-950 text-right flex flex-col h-[540px]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>المساعد الشخصي الذكي «شربيني» (Sherbini AI)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-purple-300 font-medium">{getUserHonorific()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer text-lg font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-2xl text-xs max-w-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
                {msg.role === 'ai' && (
                  <div className="mt-2 pt-1 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => speakText(msg.text, i)}
                      className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {currentlySpeakingIndex === i ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-400" />
                          <span className="text-rose-400">إيقاف</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>استماع 🔊</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-[11px] text-purple-400 animate-pulse p-2 bg-purple-950/30 rounded-xl border border-purple-500/20">
              جاري صياغة التوجيه الذكي...
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40'
            }`}
            title="تحدث بالصوت"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input 
            type="text"
            placeholder={isListening ? 'جاري الاستماع لصوتك...' : 'اكتب أو تحدث مع المرشد...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-input text-xs flex-1"
          />
          <button 
            type="submit" 
            disabled={!query.trim()}
            className="btn-primary text-xs py-2 px-3.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
