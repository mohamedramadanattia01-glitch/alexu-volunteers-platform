import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, AlertTriangle, Users, CheckCircle2, Clock, 
  MapPin, ShieldAlert, Check, Send, Volume2,
  Radio, Activity, Shield, Sparkles, CheckCircle, 
  MessageSquare, PlusCircle, Play, StopCircle, Trash2,
  Layers, ChevronRight, ShieldCheck, RefreshCw, AlertCircle
} from 'lucide-react';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { VoicePlayer } from '../common/VoicePlayer';
import { CommitteeBadge } from '../common/CommitteeBadge';
import { EventEntity } from '../../types';

interface LiveCommandCenterProps {
  onOpenSOSModal: () => void;
  onOpenQRModal: () => void;
}

interface SectorStatus {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  currentCount: number;
  status: 'optimal' | 'busy' | 'critical' | 'calm';
  leadName: string;
  committeeId: string;
  lastUpdate: string;
}

interface LiveVoiceOrder {
  id: string;
  senderName: string;
  senderRole: string;
  time: string;
  title: string;
  audioUrl: string;
  duration: number;
  priority: 'urgent' | 'standard';
  targetCommittee?: string;
}

const STORAGE_SECTORS_KEY = 'ALEXU_LIVE_SECTORS_PROD';
const STORAGE_VOICE_KEY = 'ALEXU_LIVE_VOICE_ORDERS_PROD';

export const LiveCommandCenter: React.FC<LiveCommandCenterProps> = ({
  onOpenSOSModal, onOpenQRModal
}) => {
  const { 
    events, liveEvent, tasks, attendanceRecords, 
    sosAlerts, acknowledgeSOS, resolveSOS, committees,
    currentUser, canManageAll, updateEvent, createEvent, members
  } = useApp();

  // Voice Orders
  const [voiceOrders, setVoiceOrders] = useState<LiveVoiceOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_VOICE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_VOICE_KEY, JSON.stringify(voiceOrders));
  }, [voiceOrders]);

  // Tactical Sectors
  const [sectors, setSectors] = useState<SectorStatus[]>(() => {
    const saved = localStorage.getItem(STORAGE_SECTORS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_SECTORS_KEY, JSON.stringify(sectors));
  }, [sectors]);

  const [showVoiceOrderModal, setShowVoiceOrderModal] = useState<boolean>(false);
  const [showAddSectorModal, setShowAddSectorModal] = useState<boolean>(false);
  const [showQuickEventModal, setShowQuickEventModal] = useState<boolean>(false);

  // Voice Order Form
  const [orderTitle, setOrderTitle] = useState<string>('');
  const [orderAudioUrl, setOrderAudioUrl] = useState<string>('');
  const [orderDuration, setOrderDuration] = useState<number>(0);
  const [orderPriority, setOrderPriority] = useState<'urgent' | 'standard'>('urgent');
  const [orderTargetCommittee, setOrderTargetCommittee] = useState<string>('all');

  // New Sector Form
  const [newSecName, setNewSecName] = useState('');
  const [newSecCode, setNewSecCode] = useState('');
  const [newSecLocation, setNewSecLocation] = useState('');
  const [newSecCapacity, setNewSecCapacity] = useState<number>(100);
  const [newSecLead, setNewSecLead] = useState('');
  const [newSecComm, setNewSecComm] = useState('comm-org');

  // Quick Event Form
  const [quickEventName, setQuickEventName] = useState('');
  const [quickEventLocation, setQuickEventLocation] = useState('جامعة الإسكندرية - المجمع النظري');
  const [quickEventExpected, setQuickEventExpected] = useState<number>(100);

  const activeLiveEvent = liveEvent || events.find(e => e.liveDashboardActive);

  const eventTasks = activeLiveEvent ? tasks.filter(t => t.eventId === activeLiveEvent.id) : [];
  const eventAttendance = activeLiveEvent ? attendanceRecords.filter(a => a.eventId === activeLiveEvent.id) : [];
  const activeSOS = activeLiveEvent 
    ? sosAlerts.filter(s => s.eventId === activeLiveEvent.id && s.status !== 'Resolved')
    : sosAlerts.filter(s => s.status === 'Open');

  const totalExpected = activeLiveEvent?.expectedMembersCount || 0;
  const totalPresent = eventAttendance.length;
  const attendanceRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

  const handleBroadcastVoiceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitle.trim()) return;

    const newOrder: LiveVoiceOrder = {
      id: `vo-${Date.now()}`,
      senderName: `${currentUser.fullName} (${currentUser.position || 'القيادة الميدانية'})`,
      senderRole: currentUser.role,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      title: orderTitle.trim(),
      audioUrl: orderAudioUrl,
      duration: orderDuration,
      priority: orderPriority,
      targetCommittee: orderTargetCommittee === 'all' ? undefined : orderTargetCommittee
    };

    setVoiceOrders([newOrder, ...voiceOrders]);
    setOrderTitle('');
    setOrderAudioUrl('');
    setOrderDuration(0);
    setShowVoiceOrderModal(false);
  };

  const handleAddSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim()) return;

    const newSector: SectorStatus = {
      id: `sec-${Date.now()}`,
      name: newSecName.trim(),
      code: newSecCode.trim() || `SEC-${sectors.length + 1}`,
      location: newSecLocation.trim() || 'الموقع الميداني',
      capacity: Number(newSecCapacity) || 100,
      currentCount: 0,
      status: 'optimal',
      leadName: newSecLead.trim() || currentUser.fullName,
      committeeId: newSecComm,
      lastUpdate: 'الآن'
    };

    setSectors([...sectors, newSector]);
    setNewSecName('');
    setNewSecCode('');
    setNewSecLocation('');
    setNewSecLead('');
    setShowAddSectorModal(false);
  };

  const handleUpdateSectorCount = (secId: string, delta: number) => {
    setSectors(prev => prev.map(s => {
      if (s.id === secId) {
        const newCount = Math.max(0, s.currentCount + delta);
        const ratio = s.capacity > 0 ? (newCount / s.capacity) : 0;
        let newStatus: SectorStatus['status'] = 'optimal';
        if (ratio >= 0.9) newStatus = 'critical';
        else if (ratio >= 0.7) newStatus = 'busy';
        else if (ratio <= 0.25) newStatus = 'calm';

        return {
          ...s,
          currentCount: newCount,
          status: newStatus,
          lastUpdate: 'الآن'
        };
      }
      return s;
    }));
  };

  const handleDeleteSector = (secId: string) => {
    setSectors(prev => prev.filter(s => s.id !== secId));
  };

  const handleDeleteVoiceOrder = (orderId: string) => {
    setVoiceOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleActivateEventLive = (eventId: string) => {
    // Set all other events to false, this event to true
    events.forEach(e => {
      if (e.id === eventId) {
        updateEvent(e.id, { liveDashboardActive: true, status: 'Live' });
      } else if (e.liveDashboardActive) {
        updateEvent(e.id, { liveDashboardActive: false });
      }
    });
  };

  const handleStopLiveCommand = () => {
    if (!activeLiveEvent) return;
    updateEvent(activeLiveEvent.id, { liveDashboardActive: false, status: 'Completed' });
  };

  const handleCreateQuickLiveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEventName.trim()) return;

    createEvent({
      name: quickEventName.trim(),
      date: new Date().toISOString().split('T')[0],
      location: quickEventLocation.trim(),
      expectedMembersCount: Number(quickEventExpected) || 100,
      status: 'Live',
      liveDashboardActive: true,
      description: 'فعالية ميدانية حية لمتطوعي اتحاد طلاب جامعة الإسكندرية'
    });

    setQuickEventName('');
    setShowQuickEventModal(false);
  };

  const getSectorStatusBadge = (status: SectorStatus['status']) => {
    switch (status) {
      case 'optimal':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">مستقر ومنتظم 🟢</span>;
      case 'busy':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">كثافة عالية 🟡</span>;
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">تكدس حرج 🚨</span>;
      case 'calm':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">هادئ / استيعاب متاح 🔵</span>;
    }
  };

  // ==========================================
  // 1. STANDBY MODE (WHEN NO ACTIVE LIVE EVENT)
  // ==========================================
  if (!activeLiveEvent) {
    const plannedEvents = events.filter(e => e.status !== 'Completed');
    const activeVolunteersCount = members.filter(m => m.status === 'Active').length;

    return (
      <div className="space-y-6 animate-in fade-in pb-12 text-right">
        {/* Standby Hero Banner */}
        <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <Radio className="w-3.5 h-3.5" />
                  <span>وضع الاستعداد الميداني والجاهزية • STANDBY MODE 🟢</span>
                </span>
                <span className="text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  اتحاد طلاب جامعة الإسكندرية
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                غرفة العمليات المركزية والقيادة التكتيكية
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-medium leading-relaxed">
                غرفة العمليات جاهزة 100% ومربوطة بالخوادم الميدانية. سيتم تفعيل البث اللحظي، الخرائط التكتيكية، ومسح الـ QR التلقائي فور بدء إحدى الفعاليات الميدانية.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {canManageAll && (
                <button
                  onClick={() => setShowQuickEventModal(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>تدشين فعالية حية فورية 🚀</span>
                </button>
              )}

              <button
                onClick={onOpenQRModal}
                className="btn-primary text-xs py-3 px-4 cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <Zap className="w-4 h-4 text-emerald-300" />
                <span>اختبار كاميرا مسح QR</span>
              </button>

              <button
                onClick={onOpenSOSModal}
                className="btn-danger text-xs py-3 px-4 cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>بلاغ طوارئ تجريبي</span>
              </button>
            </div>
          </div>

          {/* Operational Readiness Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>المتطوعون الجاهزون</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {activeVolunteersCount} <span className="text-xs text-slate-400 font-normal">متطوع نشط</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>اللجان التخصصية</span>
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">
                {committees.length} <span className="text-xs text-slate-400 font-normal">لجان معتمدة</span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>حالة الطوارئ العامة</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                آمنة ومستقرة 🟢
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>الفعاليات المجدولة</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {plannedEvents.length} <span className="text-xs text-slate-400 font-normal">فعالية قادمة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Planned Events Launch List */}
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>الفعاليات المجدولة بانتظار الانطلاق الميداني</span>
              </h3>
              <p className="text-xs text-slate-400">اختر الفعالية المطلوب تشغيل ومتابعة غرفة العمليات الحية لها اليوم</p>
            </div>
          </div>

          {plannedEvents.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">لا توجد فعاليات مسجلة حالياً في النظام.</p>
              {canManageAll && (
                <button
                  onClick={() => setShowQuickEventModal(true)}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>إضافة فعالية جديدة وتفعيلها الآن</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plannedEvents.map(ev => (
                <div key={ev.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ev.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        {ev.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{ev.location}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      العدد المتوقع: {ev.expectedMembersCount || 100} متطوع
                    </p>
                  </div>

                  {canManageAll && (
                    <button
                      onClick={() => handleActivateEventLive(ev.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>تفعيل غرفة العمليات الميدانية للفعالية الآن 🚀</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Event Modal */}
        {showQuickEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="glass-card max-w-md w-full p-6 bg-slate-950 border-emerald-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>تدشين وتفعيل فعالية حية فورية</span>
                </h3>
                <button onClick={() => setShowQuickEventModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateQuickLiveEvent} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الفعالية / اليوم الميداني *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حفل استقبال الطلاب الجدد 2026"
                    value={quickEventName}
                    onChange={(e) => setQuickEventName(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الموقع الميداني *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مجمع العلوم الإنسانية - الشاطبي"
                    value={quickEventLocation}
                    onChange={(e) => setQuickEventLocation(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">العدد المستهدف للمتطوعين</label>
                  <input
                    type="number"
                    min={10}
                    value={quickEventExpected}
                    onChange={(e) => setQuickEventExpected(Number(e.target.value))}
                    className="glass-input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setShowQuickEventModal(false)} className="btn-secondary text-xs py-2 px-3">
                    إلغاء
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4 font-bold">
                    إطلاق الفعالية وغرفة العمليات 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. ACTIVE LIVE EVENT COMMAND CENTER MODE
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in pb-12 text-right">
      
      {/* Live Event Header Radar Bar */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/90 border-2 border-emerald-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 animate-pulse" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <Radio className="w-3.5 h-3.5" />
                <span>غرفة العمليات والقيادة التكتيكية الميدانية • LIVE OPERATIONS 🔴</span>
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{activeLiveEvent.location}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{activeLiveEvent.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              {activeLiveEvent.description || 'متابعة حية لانتشار المتطوعين، تدفق الحشود، وإدارة العمليات اللحظية بجامعة الإسكندرية.'}
            </p>
          </div>

          {/* Tactical Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canManageAll && (
              <button
                onClick={() => setShowVoiceOrderModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>بث توجيه صوتي للميدان 🎙️</span>
              </button>
            )}

            <button
              onClick={onOpenQRModal}
              className="btn-primary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>نقطة مسح الحضور (QR Scanner)</span>
            </button>

            <button
              onClick={onOpenSOSModal}
              className="btn-danger text-xs py-2.5 px-4 cursor-pointer sos-pulse flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>إطلاق بلاغ طوارئ 🚨</span>
            </button>

            {canManageAll && (
              <button
                onClick={handleStopLiveCommand}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                title="إنهاء الفعالية وإيقاف غرفة العمليات"
              >
                <StopCircle className="w-4 h-4 text-rose-400" />
                <span>إنهاء الفعالية</span>
              </button>
            )}
          </div>
        </div>

        {/* Tactical Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/10">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>الحضور الفعلي المباشر</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {totalPresent} <span className="text-xs text-slate-400 font-normal">/ {totalExpected}</span>
              <span className="text-xs text-emerald-400/80 font-normal mr-2">({attendanceRate}%)</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>القطاعات التشغيلية الحية</span>
              <Layers className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">
              {sectors.length} <span className="text-xs text-slate-400 font-normal">قطاعات ميدانية</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>بلاغات الطوارئ النشطة</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${activeSOS.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              {activeSOS.length} <span className="text-xs font-normal">بلاغ</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>التوجيهات الصوتية الحية</span>
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
              {voiceOrders.length} <span className="text-xs font-normal">توجيه معمم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Orders Broadcast Feed */}
      <div className="glass-card p-5 border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>توجيهات القيادة الصوتية اللحظية (Voice Command Broadcast)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {voiceOrders.length} توجيهات
                </span>
              </h3>
              <p className="text-xs text-slate-400">تعليمات مسجلة وموجهة فوراً للمتطوعين بالميدان لسرعة التنسيق</p>
            </div>
          </div>

          {canManageAll && (
            <button
              onClick={() => setShowVoiceOrderModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>تسجيل توجيه جديد</span>
            </button>
          )}
        </div>

        {voiceOrders.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            لا توجد توجيهات صوتية مذاعة حالياً. يمكنك تسجيل وبث التوجيهات الحية للميدان عبر زر "تسجيل توجيه جديد".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {voiceOrders.map(order => (
              <div 
                key={order.id} 
                className={`p-4 rounded-xl border transition-all ${
                  order.priority === 'urgent' 
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/5' 
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      order.priority === 'urgent' 
                        ? 'bg-rose-600/90 text-white' 
                        : 'bg-blue-600/90 text-white'
                    }`}>
                      {order.priority === 'urgent' ? '🚨 توجيه عاجل' : '📢 إرشادي'}
                    </span>
                    <span className="text-xs font-bold text-white">{order.senderName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">{order.time}</span>
                    {canManageAll && (
                      <button
                        onClick={() => handleDeleteVoiceOrder(order.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="حذف هذا التوجيه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-200 mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                  {order.title}
                </p>

                {order.audioUrl ? (
                  <VoicePlayer 
                    audioUrl={order.audioUrl} 
                    durationSeconds={order.duration} 
                  />
                ) : (
                  <div className="text-[11px] text-slate-400 italic">توجيه نصي مباشر</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tactical Sectors Grid (Interactive Real Headcount) */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>القطاعات الميدانية ونقاط التمركز الحية</span>
            </h3>
            <p className="text-xs text-slate-400">توزيع الكثافات والمسؤولين الميدانيين على بوابات ومحاور الفعالية</p>
          </div>

          {canManageAll && (
            <button
              onClick={() => setShowAddSectorModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة قطاع ميداني</span>
            </button>
          )}
        </div>

        {sectors.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
            لم يتم إنشاء قطاعات ميدانية مخصصة بعد. يمكنك إضافة بوابات ومناطق الفعالية (مثل: البوابة الرئيسية، المسرح، القاعة) عبر زر "إضافة قطاع ميداني".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map(sec => (
              <div key={sec.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                      {sec.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{sec.name}</h4>
                    <p className="text-[11px] text-slate-400">{sec.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getSectorStatusBadge(sec.status)}
                    {canManageAll && (
                      <button
                        onClick={() => handleDeleteSector(sec.id)}
                        className="text-slate-500 hover:text-red-400 text-xs p-1"
                        title="حذف القطاع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">التواجد / الطاقة الاستيعابية:</span>
                    <span className="font-bold text-white">{sec.currentCount} / {sec.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        sec.status === 'critical' ? 'bg-rose-500' :
                        sec.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, sec.capacity > 0 ? (sec.currentCount / sec.capacity) * 100 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                  <span>المسؤول: <strong className="text-white">{sec.leadName}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateSectorCount(sec.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateSectorCount(sec.id, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOS Alerts Monitor Feed */}
      <div className="glass-card p-5 border-rose-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-base font-black text-white">شاشة استجابة الطوارئ والنداءات العاجلة (SOS Radar)</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
            {activeSOS.length} بلاغات قيد المتابعة
          </span>
        </div>

        {activeSOS.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">الوضع الميداني آمن ومستقر 100%</p>
            <p className="text-xs text-slate-400">لا توجد بلاغات طوارئ أو استغاثات نشطة حالياً في موقع الفعالية.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSOS.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.status === 'Open' 
                    ? 'bg-rose-950/60 border-rose-500/60 glow-danger' 
                    : 'bg-slate-900/80 border-amber-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-black bg-rose-600 text-white shadow">
                      🚨 {alert.alertType}
                    </span>
                    <span className="text-xs font-bold text-white">{alert.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">المبلغ: {alert.reporterName}</span>
                    <span className="text-slate-500 font-mono">({alert.reportedAt})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 mb-3 bg-slate-950/50 p-2.5 rounded-lg border border-white/5 font-medium">
                  {alert.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-xs">
                  <div className="text-slate-400 font-medium">
                    الحالة: <strong className={alert.status === 'Open' ? 'text-rose-400' : 'text-amber-400'}>{alert.status}</strong>
                    {alert.acknowledgedBy && (
                      <span className="mr-2 text-slate-400">| تأكيد استلام: {alert.acknowledgedBy}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status === 'Open' && (
                      <button
                        onClick={() => acknowledgeSOS(alert.id)}
                        className="btn-primary text-xs py-1.5 px-3.5 cursor-pointer font-bold"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>تأكيد الاستلام والتحرك (Acknowledge)</span>
                      </button>
                    )}

                    {alert.status !== 'Resolved' && (
                      <button
                        onClick={() => resolveSOS(alert.id)}
                        className="btn-secondary text-xs py-1.5 px-3.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/50 cursor-pointer font-bold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تم الحل والسيطرة (Resolve)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Check-ins Stream */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-black text-white">سجل الدخول اللحظي عبر Dynamic QR Code</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {eventAttendance.length} عمليات حضور مسجلة
          </span>
        </div>

        {eventAttendance.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
            لم يتم تسجيل أي حضور حتى الآن في هذه الفعالية. استخدم زر "نقطة مسح الحضور" لمسح كود الـ QR بالكاميرا.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 font-bold">المتطوع</th>
                  <th className="py-2.5 font-bold">اللجنة</th>
                  <th className="py-2.5 font-bold">وقت الدخول</th>
                  <th className="py-2.5 font-bold">وقت الانصراف</th>
                  <th className="py-2.5 font-bold">المدة المقضية</th>
                  <th className="py-2.5 font-bold">حالة الكود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eventAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 flex items-center gap-2">
                      <img src={record.memberAvatar} alt="" className="w-6 h-6 rounded-md object-cover" />
                      <span className="font-bold text-white">{record.memberName}</span>
                    </td>
                    <td className="py-3">
                      <CommitteeBadge committeeId={record.committeeId} size="sm" />
                    </td>
                    <td className="py-3 font-mono text-emerald-400 font-bold">{record.checkInTime}</td>
                    <td className="py-3 font-mono text-slate-400">{record.checkOutTime || '—'}</td>
                    <td className="py-3 text-slate-300 font-mono">{record.durationFormatted || 'مستمر'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Dynamic QR Valid ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voice Order Broadcast Modal */}
      {showVoiceOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-lg p-6 bg-slate-900 border-amber-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Volume2 className="w-5 h-5" />
                <h3 className="text-base font-black text-white">بث توجيه صوتي للميدان (Live Voice Broadcast)</h3>
              </div>
              <button 
                onClick={() => setShowVoiceOrderModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastVoiceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نص التوجيه / عنوان الأمر الميداني *
                </label>
                <input 
                  type="text" 
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                  placeholder="مثال: تحريك 4 متطوعين من البوابة B إلى مدرج الاحتفالات فوراً..."
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">درجة الأهمية</label>
                  <select 
                    value={orderPriority}
                    onChange={(e) => setOrderPriority(e.target.value as any)}
                    className="input-field text-xs"
                  >
                    <option value="urgent">🚨 عاجل وهام جداً</option>
                    <option value="standard">📢 إرشادي وتنسيقي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اللجنة المستهدفة</label>
                  <select 
                    value={orderTargetCommittee}
                    onChange={(e) => setOrderTargetCommittee(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="all">🌐 كل لجان الفعالية</option>
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voice Recorder Component */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  تسجيل التوجيه الصوتي بالمايكروفون 🎙️
                </label>
                <VoiceRecorder 
                  onRecordingComplete={(audioUrl: string, duration: number) => {
                    setOrderAudioUrl(audioUrl);
                    setOrderDuration(duration);
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowVoiceOrderModal(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!orderTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  📢 تعميم وبث التوجيه الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sector Modal */}
      {showAddSectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-md p-6 bg-slate-950 border-sky-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>إضافة قطاع ميداني جديد</span>
              </h3>
              <button onClick={() => setShowAddSectorModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSector} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم القطاع الميداني *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: البوابة الشرقية (Gate B)"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود القطاع</label>
                  <input
                    type="text"
                    placeholder="SEC-B1"
                    value={newSecCode}
                    onChange={(e) => setNewSecCode(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعة الاستيعابية</label>
                  <input
                    type="number"
                    min={10}
                    value={newSecCapacity}
                    onChange={(e) => setNewSecCapacity(Number(e.target.value))}
                    className="glass-input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">الموقع المحدد</label>
                <input
                  type="text"
                  placeholder="مثال: الطابق الأرضي - الممر الرئيسي"
                  value={newSecLocation}
                  onChange={(e) => setNewSecLocation(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسؤول الميداني</label>
                  <input
                    type="text"
                    placeholder="اسم المسؤول..."
                    value={newSecLead}
                    onChange={(e) => setNewSecLead(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اللجنة المسؤولة</label>
                  <select
                    value={newSecComm}
                    onChange={(e) => setNewSecComm(e.target.value)}
                    className="glass-input text-xs"
                  >
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddSectorModal(false)} className="btn-secondary text-xs py-2 px-3">
                  إلغاء
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-4 font-bold">
                  إضافة القطاع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
