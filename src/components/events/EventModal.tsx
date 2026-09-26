import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventEntity, EventCommitteeQuota } from '../../types';
import { 
  Calendar, Clock, MapPin, Users, Plus, Minus, X, Sparkles, 
  Sun, Sunset, Compass, CheckCircle2, Award, Zap, Edit3, Save,
  Crown, Layers, CheckSquare, Square, Ban, Hash, Copy, Repeat, CalendarDays, Trash2
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventEntity | null;
  eventToDuplicate?: EventEntity | null;
  initialDate?: string | null;
}

export const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  eventToEdit,
  eventToDuplicate,
  initialDate
}) => {
  const { committees, members, createEvent, updateEvent, showNotification } = useApp();

  const todayStr = initialDate || new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00 ص');
  const [endTime, setEndTime] = useState('03:00 م');
  const [location, setLocation] = useState('مركز مؤتمرات جامعة الإسكندرية');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'heads_leadership' | 'members_only'>('all');
  
  // Committee modes: 'all' | 'custom' | 'excluded'
  const [commModesMap, setCommModesMap] = useState<{ [commId: string]: 'all' | 'custom' | 'excluded' }>({});
  const [commQuotasMap, setCommQuotasMap] = useState<{ [commId: string]: number }>({});

  // Multi-date Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [additionalDates, setAdditionalDates] = useState<string[]>([]);
  const [newExtraDateInput, setNewExtraDateInput] = useState('');

  useEffect(() => {
    const operationalComms = committees.filter(c => c.id !== 'comm-leadership');
    const targetComms = operationalComms.length > 0 ? operationalComms : committees;

    const sourceEvent = eventToEdit || eventToDuplicate;

    if (sourceEvent) {
      setName(eventToDuplicate ? `${sourceEvent.name} (نسخة)` : (sourceEvent.name || ''));
      setDate(initialDate || sourceEvent.date || todayStr);
      setStartTime(sourceEvent.startTime || '09:00 ص');
      setEndTime(sourceEvent.endTime || '03:00 م');
      setLocation(sourceEvent.location || 'مركز مؤتمرات جامعة الإسكندرية');
      setDescription(sourceEvent.description || '');
      setTargetAudience(sourceEvent.targetAudience || 'all');
      setIsRecurring(false);
      setAdditionalDates([]);

      const modes: { [commId: string]: 'all' | 'custom' | 'excluded' } = {};
      const quotas: { [commId: string]: number } = {};

      targetComms.forEach(c => {
        const q = sourceEvent.committeeQuotas?.[c.id];
        const commMemCount = members.filter(m => m.currentCommitteeId === c.id && m.status === 'Active').length || 1;
        if (q) {
          modes[c.id] = q.mode || (q.required === commMemCount ? 'all' : 'custom');
          quotas[c.id] = q.required || 5;
        } else if (sourceEvent.selectedCommitteeIds?.includes(c.id)) {
          modes[c.id] = 'custom';
          quotas[c.id] = 5;
        } else {
          modes[c.id] = 'excluded';
          quotas[c.id] = 5;
        }
      });

      setCommModesMap(modes);
      setCommQuotasMap(quotas);
    } else {
      setName('');
      setDate(initialDate || todayStr);
      setStartTime('09:00 ص');
      setEndTime('03:00 م');
      setLocation('مركز مؤتمرات جامعة الإسكندرية');
      setDescription('');
      setTargetAudience('all');
      setIsRecurring(false);
      setAdditionalDates([]);

      const modes: { [commId: string]: 'all' | 'custom' | 'excluded' } = {};
      const quotas: { [commId: string]: number } = {};
      targetComms.forEach(c => {
        modes[c.id] = 'all';
        const commMemCount = members.filter(m => m.currentCommitteeId === c.id && m.status === 'Active').length || 1;
        quotas[c.id] = commMemCount;
      });
      setCommModesMap(modes);
      setCommQuotasMap(quotas);
    }
  }, [eventToEdit, eventToDuplicate, initialDate, isOpen, committees, members]);

  if (!isOpen) return null;

  // Set mode for committee
  const handleSetCommMode = (commId: string, mode: 'all' | 'custom' | 'excluded') => {
    const commMemCount = members.filter(m => m.currentCommitteeId === commId && m.status === 'Active').length || 1;
    setCommModesMap(prev => ({ ...prev, [commId]: mode }));
    if (mode === 'all') {
      setCommQuotasMap(prev => ({ ...prev, [commId]: commMemCount }));
    } else if (mode === 'custom') {
      if (!commQuotasMap[commId] || commQuotasMap[commId] === 0) {
        setCommQuotasMap(prev => ({ ...prev, [commId]: Math.min(5, commMemCount) }));
      }
    }
  };

  // Change quota count
  const handleQuotaCountChange = (commId: string, delta: number) => {
    const current = commQuotasMap[commId] || 1;
    const nextVal = Math.max(1, current + delta);
    setCommQuotasMap(prev => ({ ...prev, [commId]: nextVal }));
    setCommModesMap(prev => ({ ...prev, [commId]: 'custom' }));
  };

  const handleQuotaDirectInput = (commId: string, value: number) => {
    const val = Math.max(1, value);
    setCommQuotasMap(prev => ({ ...prev, [commId]: val }));
    setCommModesMap(prev => ({ ...prev, [commId]: 'custom' }));
  };

  // Add extra date for multi-date recurrence
  const handleAddExtraDate = () => {
    if (!newExtraDateInput.trim()) return;
    if (!additionalDates.includes(newExtraDateInput.trim()) && newExtraDateInput.trim() !== date) {
      setAdditionalDates([...additionalDates, newExtraDateInput.trim()]);
      setNewExtraDateInput('');
    }
  };

  const handleRemoveExtraDate = (dateToRemove: string) => {
    setAdditionalDates(additionalDates.filter(d => d !== dateToRemove));
  };

  // Bulk presets
  const handleApplyBulkAll = () => {
    const modes: { [commId: string]: 'all' | 'custom' | 'excluded' } = {};
    const quotas: { [commId: string]: number } = {};
    const targetComms = committees.filter(c => c.id !== 'comm-leadership');
    targetComms.forEach(c => {
      const commMemCount = members.filter(m => m.currentCommitteeId === c.id && m.status === 'Active').length || 1;
      modes[c.id] = 'all';
      quotas[c.id] = commMemCount;
    });
    setCommModesMap(modes);
    setCommQuotasMap(quotas);
  };

  const handleApplyBulkFixed = (count: number) => {
    const modes: { [commId: string]: 'all' | 'custom' | 'excluded' } = {};
    const quotas: { [commId: string]: number } = {};
    const targetComms = committees.filter(c => c.id !== 'comm-leadership');
    targetComms.forEach(c => {
      modes[c.id] = 'custom';
      quotas[c.id] = count;
    });
    setCommModesMap(modes);
    setCommQuotasMap(quotas);
  };

  const handleApplyBulkExcludeAll = () => {
    const modes: { [commId: string]: 'all' | 'custom' | 'excluded' } = {};
    const targetComms = committees.filter(c => c.id !== 'comm-leadership');
    targetComms.forEach(c => {
      modes[c.id] = 'excluded';
    });
    setCommModesMap(modes);
  };

  // Live total required members calculation
  const targetComms = committees.filter(c => c.id !== 'comm-leadership');
  const totalRequiredMembers = targetComms.reduce((acc, comm) => {
    const mode = commModesMap[comm.id] || 'excluded';
    if (mode === 'excluded') return acc;
    if (mode === 'all') {
      const commMemCount = members.filter(m => m.currentCommitteeId === comm.id && m.status === 'Active').length || 1;
      return acc + commMemCount;
    }
    return acc + (commQuotasMap[comm.id] || 1);
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
    const operationalComms = committees.filter(c => c.id !== 'comm-leadership');
    const selectedIds: string[] = [];

    operationalComms.forEach(comm => {
      const mode = commModesMap[comm.id] || 'excluded';
      if (mode !== 'excluded') {
        selectedIds.push(comm.id);
        const commMemCount = members.filter(m => m.currentCommitteeId === comm.id && m.status === 'Active').length || 1;
        const req = mode === 'all' ? commMemCount : (commQuotasMap[comm.id] || 1);
        structuredQuotas[comm.id] = {
          committeeId: comm.id,
          committeeName: comm.name,
          required: req,
          assigned: req,
          present: 0,
          mode
        };
      }
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
        selectedCommitteeIds: selectedIds,
        committeeQuotas: structuredQuotas,
        expectedMembersCount: totalRequiredMembers || 20,
      });

      showNotification('success', `تم حفظ وتحديث بيانات الفعالية "${name}" بنجاح 💾`);
      onClose();
      return;
    }

    // 1. Create Primary Event
    createEvent({
      name: name.trim(),
      date,
      startTime,
      endTime,
      location: location.trim(),
      description: description.trim() || `فعالية ميدانية معتمدة لمتطوعي اتحاد طلاب جامعة الإسكندرية في ${location}`,
      targetAudience,
      selectedCommitteeIds: selectedIds,
      committeeQuotas: structuredQuotas,
      expectedMembersCount: totalRequiredMembers || 20,
      status: 'Planned'
    });

    // 2. Create Recurring Extra Dates if any
    if (isRecurring && additionalDates.length > 0) {
      additionalDates.forEach(extraDate => {
        createEvent({
          name: `${name.trim()} (يوم ${extraDate})`,
          date: extraDate,
          startTime,
          endTime,
          location: location.trim(),
          description: description.trim() || `فعالية ميدانية معتمدة لمتطوعي اتحاد طلاب جامعة الإسكندرية في ${location}`,
          targetAudience,
          selectedCommitteeIds: selectedIds,
          committeeQuotas: structuredQuotas,
          expectedMembersCount: totalRequiredMembers || 20,
          status: 'Planned'
        });
      });
      showNotification('success', `تم إنشاء وجدولة الفعالية وتكرارها بنجاح في ${additionalDates.length + 1} أيام مختلفة 📅✨`);
    } else {
      showNotification('success', `تم جدولة وإضافة الفعالية "${name}" وتخصيص اللجان بنجاح 🎉`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-3xl w-full p-5 sm:p-6 border border-sky-500/40 shadow-2xl bg-slate-950 text-right rounded-2xl max-h-[90vh] overflow-y-auto">
        
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
                تحديد الفئة المستهدفة، اختيار اللجان المطلوبة، وتعيين كوتة الأعداد الميدانية بدقة
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

          {/* 1. TARGET AUDIENCE SELECTOR */}
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

          {/* 2. COMMITTEES SELECTION & QUOTA PER COMMITTEE */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>تخصيص اللجان واحتياج المتطوعين لكل لجنة:</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  يمكن جعل اللجنة خارج الاحتياج، أو طلب كامل أعضائها، أو تحديد عدد مخصص بأزرار الزيادة والنقصان.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  ⚡ إجمالي المطلوب: {totalRequiredMembers} متطوع
                </span>
              </div>
            </div>

            {/* Quick Bulk Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 text-[10px] shrink-0 font-bold">خيارات سريعة:</span>
              <button
                type="button"
                onClick={handleApplyBulkAll}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/60 border border-slate-800 text-slate-300 hover:text-sky-300 shrink-0 cursor-pointer transition-all"
              >
                👥 كل اللجان (كاملة)
              </button>
              <button
                type="button"
                onClick={() => handleApplyBulkFixed(5)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/60 border border-slate-800 text-slate-300 hover:text-sky-300 shrink-0 cursor-pointer transition-all"
              >
                🎯 5 متطوعين من كل لجنة
              </button>
              <button
                type="button"
                onClick={() => handleApplyBulkFixed(3)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-sky-950/60 border border-slate-800 text-slate-300 hover:text-sky-300 shrink-0 cursor-pointer transition-all"
              >
                🎯 3 متطوعين من كل لجنة
              </button>
              <button
                type="button"
                onClick={handleApplyBulkExcludeAll}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-300 shrink-0 cursor-pointer transition-all"
              >
                🚫 تفريغ / خارج الاحتياج للجميع
              </button>
            </div>

            {/* Individual Committee Controls */}
            <div className="space-y-2.5">
              {committees.filter(c => c.id !== 'comm-leadership').map(comm => {
                const commMemCount = members.filter(m => m.currentCommitteeId === comm.id && m.status === 'Active').length || 1;
                const mode = commModesMap[comm.id] || 'excluded';
                const quota = commQuotasMap[comm.id] || Math.min(5, commMemCount);

                return (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border transition-all ${
                      mode === 'excluded'
                        ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                        : mode === 'all'
                        ? 'bg-slate-950 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950 border-amber-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      
                      {/* Committee Name & Info */}
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: comm.color }}
                        />
                        <div>
                          <span className="font-bold text-xs text-white">{comm.name}</span>
                          <span className="text-[10px] text-slate-400 mr-2 font-mono">
                            (إجمالي أعضاء اللجنة: {commMemCount})
                          </span>
                        </div>
                      </div>

                      {/* 3 Mode Selection Buttons & Stepper Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        
                        {/* Mode 1: Excluded */}
                        <button
                          type="button"
                          onClick={() => handleSetCommMode(comm.id, 'excluded')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            mode === 'excluded'
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          خارج الاحتياج 🚫
                        </button>

                        {/* Mode 2: Full Committee */}
                        <button
                          type="button"
                          onClick={() => handleSetCommMode(comm.id, 'all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            mode === 'all'
                              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          كامل اللجنة ({commMemCount}) 👥
                        </button>

                        {/* Mode 3: Custom Quota with Stepper */}
                        <div className={`flex items-center rounded-lg border transition-all ${
                          mode === 'custom'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <button
                            type="button"
                            onClick={() => handleSetCommMode(comm.id, 'custom')}
                            className={`px-2 py-1 text-xs font-bold border-l border-slate-700/50 cursor-pointer ${
                              mode === 'custom' ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                            }`}
                          >
                            عدد محدد 🎯
                          </button>

                          {/* Stepper buttons & direct input */}
                          <div className="flex items-center px-1 py-0.5 gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuotaCountChange(comm.id, -1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              title="إنقاص العدد"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={mode === 'all' ? commMemCount : mode === 'excluded' ? 0 : quota}
                              disabled={mode === 'excluded' || mode === 'all'}
                              onChange={(e) => handleQuotaDirectInput(comm.id, Number(e.target.value))}
                              className={`w-10 bg-transparent text-center font-mono font-black text-xs focus:outline-none ${
                                mode === 'excluded' ? 'text-slate-600' : mode === 'all' ? 'text-sky-300' : 'text-amber-300'
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() => handleQuotaCountChange(comm.id, 1)}
                              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              title="زيادة العدد"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
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

          {/* MULTI-DATE RECURRENCE / تكرار الفعالية في أيام وتواريخ متعددة */}
          {!eventToEdit && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>تكرار الفعالية في أيام أخرى (Multi-Day Event)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-bold">ميزة جديدة ✨</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">إنشاء نسخ مجدولة من هذه الفعالية بنفس البيانات واللجان في تواريخ إضافية</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRecurring 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isRecurring ? 'مفعل ✓' : 'تفعيل التكرار'}</span>
                </button>
              </div>

              {isRecurring && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-indigo-300">أضف تواريخ إضافية للفعالية:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={newExtraDateInput}
                      onChange={(e) => setNewExtraDateInput(e.target.value)}
                      className="glass-input text-xs font-mono flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraDate}
                      disabled={!newExtraDateInput}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة يوم</span>
                    </button>
                  </div>

                  {/* List of Additional Dates */}
                  {additionalDates.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {additionalDates.map(extraD => (
                        <div key={extraD} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-500/40 text-xs font-mono text-indigo-200">
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{extraD}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraDate(extraD)}
                            className="p-0.5 hover:text-rose-400 cursor-pointer transition-colors mr-1"
                            title="حذف هذا اليوم"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {additionalDates.length > 0 && (
                    <p className="text-[10px] text-emerald-400 font-medium">
                      ✓ سيتم إنشاء عدد ({additionalDates.length + 1}) فعاليات مكررة بنفس كوتة اللجان والإعدادات تلقائياً.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
