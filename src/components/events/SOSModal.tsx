import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SOSType } from '../../types';
import { AlertTriangle, X, ShieldAlert, MapPin, Send } from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const { createSOSAlert, liveEvent, events } = useApp();

  const [alertType, setAlertType] = useState<SOSType>('Crowd Emergency');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentEvent = liveEvent || events[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    setIsSubmitting(true);
    createSOSAlert({
      eventId: currentEvent.id,
      eventName: currentEvent.name,
      alertType,
      location,
      description
    });

    setIsSubmitting(false);
    onClose();
  };

  const alertTypesList: { type: SOSType; label: string; icon: string; desc: string }[] = [
    { type: 'Crowd Emergency', label: 'ازدحام وحشود', icon: '👥', desc: 'تكدس عند البوابات أو تدافع' },
    { type: 'Technical', label: 'عطل تقني وفني', icon: '⚡', desc: 'انقطاع صوت، إضاءة، أو شاشات' },
    { type: 'Guest', label: 'مشكلة مع ضيف / متحدث', icon: '👔', desc: 'تنسيق بروتوكول أو مقاعد كبار الزوار' },
    { type: 'Medical', label: 'حالة طبية وإسعاف', icon: '🚑', desc: 'إغماء، إصابة، أو إسعافات أولية' },
    { type: 'Security', label: 'طوارئ أمنية', icon: '🛡️', desc: 'اشتباه، مخالفة، أو فقدان مقتنيات' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-6 border-2 border-rose-500/60 shadow-2xl bg-slate-950 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/30 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>إطلاق بلاغ طوارئ فوري</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold">
                  EMERGENCY SOS
                </span>
              </h3>
              <p className="text-xs text-rose-300">يصل فوراً لرئيس فريق المتطوعين، مسؤول العمليات والميدان، ورؤساء اللجان</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Select SOS Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">نوع البلاغ الطارئ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {alertTypesList.map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setAlertType(item.type)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 cursor-pointer ${
                    alertType === item.type 
                      ? 'bg-rose-950/60 border-rose-500 text-white shadow-md shadow-rose-900/30' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>المكان الميداني بالتحديد *</span>
            </label>
            <input 
              type="text"
              required
              placeholder="مثال: البوابة رقم 3، مدخل قاعة المؤتمرات، ممر كبار الزوار..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وصف الموقف واحتياج الدعم *</label>
            <textarea 
              rows={3}
              required
              placeholder="اشرح المشكلة باختصار واذكر عدد المتطوعين أو نوع التدخل المطلوب فوراً..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-danger text-xs py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/40"
            >
              <Send className="w-4 h-4" />
              <span>إرسال البلاغ الآن 🚨</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
