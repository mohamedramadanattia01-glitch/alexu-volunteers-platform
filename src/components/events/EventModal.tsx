import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, Clock, MapPin, Users, Plus, X, Sparkles, 
  Sun, Sunset, Compass, CheckCircle2, Award, Zap
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  const { committees, createEvent, showNotification } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00 ص');
  const [endTime, setEndTime] = useState('03:00 م');
  const [location, setLocation] = useState('مركز مؤتمرات جامعة الإسكندرية');
  const [description, setDescription] = useState('');
  const [expectedMembersCount, setExpectedMembersCount] = useState<number>(30);

  if (!isOpen) return null;

  // Date Presets
  const handleSetPresetDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDate(d.toISOString().split('T')[0]);
  };

  // Time Presets
  const applyTimePreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const alexLocations = [
    'مركز مؤتمرات جامعة الإسكندرية',
    'مجمع العلوم الإنسانية (الشاطبي)',
    'مجمع الكليات الطبية (الأزاريطة)',
    'مدرجات كلية الهندسة',
    'مبنى إدارة رعاية الشباب',
    'استاد جامعة الإسكندرية الرياضي'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification('error', 'يرجى كتابة اسم الفعالية');
      return;
    }

    // Default quotas per committee
    const quotas: Record<string, any> = {};
    const perComm = Math.max(2, Math.round(expectedMembersCount / (committees.length || 6)));
    
    committees.forEach(c => {
      quotas[c.id] = {
        committeeId: c.id,
        committeeName: c.name,
        required: perComm,
        assigned: perComm,
        present: 0
      };
    });

    createEvent({
      name: name.trim(),
      date,
      startTime,
      endTime,
      location: location.trim(),
      description: description.trim() || `فعالية ميدانية معتمدة لمتطوعي اتحاد طلاب جامعة الإسكندرية في ${location}`,
      expectedMembersCount,
      committeeQuotas: quotas,
      status: 'Planned'
    });

    showNotification('success', `تم جدولة وإضافة الفعالية "${name}" بنجاح في المنظومة 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-xl w-full p-5 sm:p-6 border border-sky-500/40 shadow-2xl bg-slate-950 text-right rounded-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">إضافة وجدولة فعالية كبرى جديدة</h3>
              <p className="text-[11px] text-slate-400">تخطيط وتوزيع كوادر المتطوعين وتحديد المواعيد الميدانية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم ومسمى الفعالية *</label>
            <input 
              type="text"
              required
              placeholder="مثال: هاكاثون الابتكار 2026 / استقبال الطلاب الجدد / مؤتمر القيادة..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* DATE PICKER & SMART SHORTCUTS */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>تاريخ انعقاد الفعالية *</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input text-xs font-mono w-full"
            />

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => handleSetPresetDate(0)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 shrink-0 cursor-pointer transition-all"
              >
                اليوم ⚡
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate(1)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 shrink-0 cursor-pointer transition-all"
              >
                غداً ☀️
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate(3)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 shrink-0 cursor-pointer transition-all"
              >
                بعد 3 أيام 🏖️
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate(7)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 shrink-0 cursor-pointer transition-all"
              >
                الأسبوع القادم (+7 أيام) 📅
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetDate(14)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 shrink-0 cursor-pointer transition-all"
              >
                بعد أسبوعين 🎯
              </button>
            </div>
          </div>

          {/* TIME RANGE PICKER & SHIFT PRESETS */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>التوقيت والورديات الميدانية *</span>
              </label>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                من {startTime} إلى {endTime}
              </span>
            </div>

            {/* Quick Shift Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => applyTimePreset('09:00 ص', '02:00 م')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  startTime === '09:00 ص' && endTime === '02:00 م'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>صباحي</span>
                </div>
                <div className="text-[9px] text-slate-400">09:00 ص - 02:00 م</div>
              </button>

              <button
                type="button"
                onClick={() => applyTimePreset('02:00 م', '08:00 م')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  startTime === '02:00 م' && endTime === '08:00 م'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Sunset className="w-3 h-3 text-purple-400" />
                  <span>مسائي</span>
                </div>
                <div className="text-[9px] text-slate-400">02:00 م - 08:00 م</div>
              </button>

              <button
                type="button"
                onClick={() => applyTimePreset('09:00 ص', '06:00 م')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  startTime === '09:00 ص' && endTime === '06:00 م'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Compass className="w-3 h-3 text-blue-400" />
                  <span>يوم كامل</span>
                </div>
                <div className="text-[9px] text-slate-400">09:00 ص - 06:00 م</div>
              </button>

              <button
                type="button"
                onClick={() => applyTimePreset('10:00 ص', '01:00 م')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  startTime === '10:00 ص' && endTime === '01:00 م'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>سريع (3 ساعات)</span>
                </div>
                <div className="text-[9px] text-slate-400">10:00 ص - 01:00 م</div>
              </button>
            </div>

            {/* Custom Time Selector Dropdowns */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">وقت البدء الميداني:</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="glass-input text-xs"
                >
                  {['07:00 ص', '08:00 ص', '08:30 ص', '09:00 ص', '09:30 ص', '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م', '05:00 م', '06:00 م'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">وقت الانتهاء والإخلاء:</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="glass-input text-xs"
                >
                  {['11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م', '05:00 م', '06:00 م', '07:00 م', '08:00 م', '09:00 م', '10:00 م'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Picker & Shortcuts */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>موقع ومقر الفعالية *</span>
            </label>
            <input 
              type="text"
              required
              placeholder="اكتب اسم القاعة أو المدرج أو الموقع..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input text-xs mb-1.5"
            />
            {/* Quick Alexandria University Location Badges */}
            <div className="flex flex-wrap gap-1.5">
              {alexLocations.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    location === loc
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Volunteers Count & Quota Slider */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>العدد المستهدف للمتطوعين:</span>
              </label>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {expectedMembersCount} متطوع
              </span>
            </div>

            <input 
              type="range"
              min={10}
              max={300}
              step={5}
              value={expectedMembersCount}
              onChange={(e) => setExpectedMembersCount(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <p className="text-[10px] text-slate-400">
              سيتم توزيع النصاب التقديري بالتساوي على لجان الفريق (حوالي {Math.round(expectedMembersCount / (committees.length || 6))} متطوع لكل لجنة).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">وصف وتفاصيل الفعالية (اختياري)</label>
            <textarea 
              rows={2}
              placeholder="اكتب ملاحظات توجيهية عن طبيعة الفعالية والمتطلبات اللوجستية..."
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
              className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>جدولة واعتماد الفعالية 🚀</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
