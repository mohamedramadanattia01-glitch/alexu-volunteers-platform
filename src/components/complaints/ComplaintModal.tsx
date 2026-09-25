import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintCategory } from '../../types';
import { 
  X, AlertCircle, Shield, Send, Lock, 
  HelpCircle, Sparkles, MessageSquare 
} from 'lucide-react';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose }) => {
  const { createComplaint, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('administrative');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createComplaint({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency,
      isAnonymous
    });

    setTitle('');
    setDescription('');
    setUrgency('Medium');
    setIsAnonymous(false);
    onClose();
  };

  const categories: { id: ComplaintCategory; label: string; icon: string; desc: string }[] = [
    { id: 'administrative', label: 'شكوى إدارية', icon: '📋', desc: 'تخص الإجراءات، المواعيد، أو اللوائح' },
    { id: 'workload', label: 'ضغط وتوزيع المهام', icon: '⚡', desc: 'تكدس المهام أو تضاربها مع مواعيد الامتحانات' },
    { id: 'interpersonal', label: 'سلوك وخلافات باللجنة', icon: '🤝', desc: 'مواقف تحتاج لتدخل ودي وحكيم' },
    { id: 'evaluation', label: 'تظلم من تقييم شهري', icon: '🎯', desc: 'استفسار أو إعادة مراجعة درجات التقييم' },
    { id: 'suggestion', label: 'مقترح تطوير إبداعي', icon: '💡', desc: 'فكرة أو مقترح للارتقاء بأداء الفريق والفعاليات' },
    { id: 'confidential', label: 'شكوى سرية خاصة', icon: '🔒', desc: 'موضوع حساس يُعامل بسرية تامة' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-xl w-full p-6 border border-rose-500/30 shadow-2xl bg-slate-950 text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">تقديم شكوى أو مقترح رسمي</h3>
              <p className="text-[11px] text-slate-400">صوتك مسموع وحقك محفوظ باحترافية وسرية</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Automatic Routing */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 mb-5 text-xs text-blue-200 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <div className="font-bold text-white mb-0.5">التوجيه الآلي المضمون (3 جهات استماع):</div>
            <span>
              هذه الشكوى/المقترح ستصل وتظهر تلقائياً في لوحة تحكم: 
              <strong className="text-sky-300"> رئيس لجنتك ({currentUser.currentCommitteeName})</strong>، 
              و<strong className="text-emerald-300"> مسؤول الموارد البشرية (HR)</strong>، 
              و<strong className="text-purple-300"> رئيس فريق المتطوعين</strong> لضمان سرعة الحل والعدالة.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Category Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-2">نوع ومجال الشكوى أو المقترح:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    category === cat.id
                      ? 'bg-rose-600/20 border-rose-500 text-white font-bold shadow-md shadow-rose-600/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-base mb-1">{cat.icon}</div>
                  <div className="text-[11px] font-bold">{cat.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">درجة الأهمية والاستعجال:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Low', label: 'عادية (Low)', color: 'border-slate-700 hover:border-blue-500/50', active: 'bg-blue-600/30 border-blue-500 text-white' },
                { id: 'Medium', label: 'متوسطة (Med)', color: 'border-slate-700 hover:border-amber-500/50', active: 'bg-amber-600/30 border-amber-500 text-amber-200' },
                { id: 'High', label: 'عالية (High)', color: 'border-slate-700 hover:border-orange-500/50', active: 'bg-orange-600/30 border-orange-500 text-orange-200' },
                { id: 'Emergency', label: 'طوارئ 🚨', color: 'border-slate-700 hover:border-rose-500/50', active: 'bg-rose-600/40 border-rose-500 text-rose-200 font-bold animate-pulse' },
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgency(u.id as any)}
                  className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer ${
                    urgency === u.id ? u.active : `bg-slate-900/80 text-slate-400 ${u.color}`
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">عنوان الموضوع بشكل موجز:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تداخل موعد تسليم المهمة مع جدول محاضراتي..."
              className="glass-input text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">تفاصيل الشكوى أو المقترح والحل المطلوب:</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح الموقف بوضوح مع ذكر التواريخ أو التفاصيل ذات الصلة..."
              className="glass-input text-xs resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-bold text-white">تقديم الشكوى بشكل سري / مجهول الهوية (Anonymous)</div>
                <div className="text-[10px] text-slate-400">لن يظهر اسمك أو صورتك لمتلقي الشكوى</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isAnonymous ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAnonymous ? 'سري ✓' : 'بالاسم الحقيقي'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className="btn-primary text-xs py-2 px-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال الشكوى والتوجيه الفوري</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
