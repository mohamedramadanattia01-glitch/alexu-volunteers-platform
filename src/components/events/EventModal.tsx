import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventEntity, EventCommitteeQuota } from '../../types';
import { 
  Calendar, Clock, MapPin, Users, Plus, X, Sparkles, 
  Sun, Sunset, Compass, CheckCircle2, Award, Zap, Edit3, Save,
  Crown, Layers, CheckSquare, Square
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventEntity | null;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, eventToEdit }) => {
  const { committees, createEvent, updateEvent, showNotification } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00 ص');
  const [endTime, setEndTime] = useState('03:00 م');
  const [location, setLocation] = useState('مركز مؤتمرات جامعة الإسكندرية');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'heads_leadership' | 'members_only'>('all');
  
  // Committee selection and specific quotas map: { [commId]: number }
  const [selectedCommIds, setSelectedCommIds] = useState<string[]>([]);
  const [commQuotasMap, setCommQuotasMap] = useState<{ [commId: string]: number }>({});

  useEffect(() => {
    // Filter operational committees (or all)
    const operationalComms = committees.filter(c => c.id !== 'comm-leadership');
    const defaultCommIds = operationalComms.length > 0 ? operationalComms.map(c => c.id) : committees.map(c => c.id);

    if (eventToEdit) {
      setName(eventToEdit.name || '');
      setDate(eventToEdit.date || todayStr);
      setStartTime(eventToEdit.startTime || '09:00 ص');
      setEndTime(eventToEdit.endTime || '03:00 م');
      setLocation(eventToEdit.location || 'مركز مؤتمرات جامعة الإسكندرية');
      setDescription(eventToEdit.description || '');
      setTargetAudience(eventToEdit.targetAudience || 'all');

      if (eventToEdit.committeeQuotas && Object.keys(eventToEdit.committeeQuotas).length > 0) {
        const activeIds = Object.keys(eventToEdit.committeeQuotas);
        setSelectedCommIds(activeIds);
        const qMap: { [commId: string]: number } = {};
        activeIds.forEach(id => {
          qMap[id] = eventToEdit.committeeQuotas[id]?.required || 5;
        });
        setCommQuotasMap(qMap);
      } else {
        setSelectedCommIds(eventToEdit.selectedCommitteeIds || defaultCommIds);
        const qMap: { [commId: string]: number } = {};
        defaultCommIds.forEach(id => { qMap[id] = 5; });
        setCommQuotasMap(qMap);
      }
    } else {
      setName('');
      setDate(todayStr);
      setStartTime('09:00 ص');
      setEndTime('03:00 م');
      setLocation('مركز مؤتمرات جامعة الإسكندرية');
      setDescription('');
      setTargetAudience('all');
      setSelectedCommIds(defaultCommIds);
      const qMap: { [commId: string]: number } = {};
      defaultCommIds.forEach(id => { qMap[id] = 5; });
      setCommQuotasMap(qMap);
    }
  }, [eventToEdit, isOpen, committees]);

  if (!isOpen) return null;

  // Toggle committee inclusion
  const handleToggleCommittee = (commId: string) => {
    setSelectedCommIds(prev => {
      if (prev.includes(commId)) {
        return prev.filter(id => id !== commId);
      } else {
        if (!commQuotasMap[commId]) {
          setCommQuotasMap(q => ({ ...q, [commId]: 5 }));
        }
        return [...prev, commId];
      }
    });
  };

  // Change quota for a specific committee
  const handleQuotaChange = (commId: string, count: number) => {
    const val = Math.max(1, count);
    setCommQuotasMap(prev => ({
      ...prev,
      [commId]: val
    }));
  };

  // Live total required members calculation
  const totalRequiredMembers = selectedCommIds.reduce((acc, commId) => {
    return acc + (commQuotasMap[commId] || 5);
  }, 0);

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

    // Build structured quotas
    const structuredQuotas: { [commId: string]: EventCommitteeQuota } = {};
    selectedCommIds.forEach(commId => {
      const commObj = committees.find(c => c.id === commId);
      const req = commQuotasMap[commId] || 5;
      structuredQuotas[commId] = {
        committeeId: commId,
        committeeName: commObj?.name || 'لجنة تخصصية',
        required: req,
        assigned: req,
        present: 0
      };
    });

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        name: name.trim(),
        date,
        startTime,
        endTime,
        location: location.trim(),
        description: description.trim() || `فعالية ميدانية معتمدة لمتطوعي اتحاد طلاب جامعة الإسكندرية في ${location}`,
        targetAudience,
        selectedCommitteeIds: selectedCommIds,
        committeeQuotas: structuredQuotas,
        expectedMembersCount: totalRequiredMembers || 20,
      });

      showNotification('success', `تم حفظ وتحديث بيانات الفعالية "${name}" بنجاح 💾`);
      onClose();
      return;
    }

    createEvent({
      name: name.trim(),
      date,
      startTime,
      endTime,
      location: location.trim(),
      description: description.trim() || `فعالية ميدانية معتمدة لمتطوعي اتحاد طلاب جامعة الإسكندرية في ${location}`,
      targetAudience,
      selectedCommitteeIds: selectedCommIds,
      committeeQuotas: structuredQuotas,
      expectedMembersCount: totalRequiredMembers || 20,
      status: 'Planned'
    });

    showNotification('success', `تم جدولة وإضافة الفعالية "${name}" وتخصيص اللجان بنجاح 🎉`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-2xl w-full p-5 sm:p-6 border border-sky-500/40 shadow-2xl bg-slate-950 text-right rounded-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              {eventToEdit ? <Edit3 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {eventToEdit ? 'تعديل وتخصيص بيانات الفعالية' : 'إضافة وتخصيص فعالية ميدانية جديدة'}
              </h3>
              <p className="text-[11px] text-slate-400">
                تحديد الفئة المستهدفة، اختيار اللجان المطلوبة، وتعيين كوتة الأعداد الميدانية
              </p>
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
              placeholder="مثال: هاكاثون الابتكار 2026 / استقبال الطلاب الجدد / اجتماع مجلس القيادة..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input text-xs"
            />
          </div>

          {/* 1. TARGET AUDIENCE SELECTOR (NEW) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>الفئة المستهدفة بالفعالية وتخصيص الحضور:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTargetAudience('all')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  targetAudience === 'all'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                👥 لكل الفريق (عام)
              </button>
              
              <button
                type="button"
                onClick={() => setTargetAudience('heads_leadership')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  targetAudience === 'heads_leadership'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                👑 للهيدات والإدارة العليا فقط
              </button>

              <button
                type="button"
                onClick={() => setTargetAudience('members_only')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  targetAudience === 'members_only'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🌟 للأعضاء المتطوعين فقط
              </button>
            </div>
          </div>

          {/* 2. COMMITTEES SELECTION & QUOTA PER COMMITTEE (NEW) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>اختيار اللجان المطلوبة وتحديد العدد المطلوب من كل لجنة:</span>
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                إجمالي المطلوب: {totalRequiredMembers} متطوع
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {committees.map(comm => {
                const isSelected = selectedCommIds.includes(comm.id);
                const quota = commQuotasMap[comm.id] || 5;

                return (
                  <div
                    key={comm.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-950 border-sky-500/40 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCommittee(comm.id)}
                      className="flex items-center gap-2 text-right flex-1 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {comm.name}
                      </span>
                    </button>

                    {isSelected && (
                      <div className="flex items-center gap-1 shrink-0 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                        <span className="text-[10px] text-slate-400">العدد:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={quota}
                          onChange={(e) => handleQuotaChange(comm.id, Number(e.target.value))}
                          className="w-12 bg-transparent text-center font-mono font-bold text-amber-300 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              className={`btn-primary text-xs py-2 px-6 font-bold cursor-pointer flex items-center gap-1.5 shadow-lg ${
                eventToEdit 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30' 
                  : 'shadow-sky-600/30'
              }`}
            >
              {eventToEdit ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ وتحديث بيانات الفعالية 💾</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>جدولة واعتماد الفعالية 🚀</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
