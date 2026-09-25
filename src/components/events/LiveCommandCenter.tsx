import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, AlertTriangle, Users, CheckCircle2, Clock, 
  MapPin, ShieldAlert, Check, RefreshCw, Send, Volume2,
  Radio, Compass, Activity, Bell, Flame, Shield, ArrowUpRight,
  Sparkles, CheckCircle, MessageSquare, PlusCircle
} from 'lucide-react';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { VoicePlayer } from '../common/VoicePlayer';
import { CommitteeBadge } from '../common/CommitteeBadge';

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

export const LiveCommandCenter: React.FC<LiveCommandCenterProps> = ({
  onOpenSOSModal, onOpenQRModal
}) => {
  const { 
    events, liveEvent, tasks, attendanceRecords, 
    sosAlerts, acknowledgeSOS, resolveSOS, committees,
    currentUser, canManageAll
  } = useApp();

  const [selectedCommFilter, setSelectedCommFilter] = useState<string>('all');
  const [showVoiceOrderModal, setShowVoiceOrderModal] = useState<boolean>(false);
  const [orderTitle, setOrderTitle] = useState<string>('');
  const [orderAudioUrl, setOrderAudioUrl] = useState<string>('');
  const [orderDuration, setOrderDuration] = useState<number>(0);
  const [orderPriority, setOrderPriority] = useState<'urgent' | 'standard'>('urgent');
  const [orderTargetCommittee, setOrderTargetCommittee] = useState<string>('all');

  // Tactical Sectors state
  const [sectors, setSectors] = useState<SectorStatus[]>([
    {
      id: 'sec-1',
      name: 'بوابة الدخول الرئيسية (Gate A)',
      code: 'SEC-A1',
      location: 'المدخل الخارجي - الممر الرئيسي',
      capacity: 150,
      currentCount: 132,
      status: 'busy',
      leadName: 'أحمد محمود (تنظيم)',
      committeeId: 'comm-org',
      lastUpdate: 'منذ دقيقتين'
    },
    {
      id: 'sec-2',
      name: 'منصة التسجيل واستلام البادجات (Registration)',
      code: 'SEC-B2',
      location: 'البهو المركزي - الطابق الأرضي',
      capacity: 80,
      currentCount: 45,
      status: 'optimal',
      leadName: 'نورهان عادل (HR)',
      committeeId: 'comm-hr',
      lastUpdate: 'منذ 5 دقائق'
    },
    {
      id: 'sec-3',
      name: 'القاعة الكبرى والمسرح الرئيسي (Main Hall)',
      code: 'SEC-C3',
      location: 'مدرج الاحتفالات الكبرى',
      capacity: 500,
      currentCount: 420,
      status: 'busy',
      leadName: 'محمد طارق (تنظيم ومسرح)',
      committeeId: 'comm-org',
      lastUpdate: 'الآن'
    },
    {
      id: 'sec-4',
      name: 'منطقة كبار الزوار والضيوف (VIP Lounge)',
      code: 'SEC-D4',
      location: 'الجناح الشرقي - الطابق الأول',
      capacity: 40,
      currentCount: 22,
      status: 'calm',
      leadName: 'ياسمين حسام (علاقات عامة)',
      committeeId: 'comm-hr',
      lastUpdate: 'منذ 10 دقائق'
    },
    {
      id: 'sec-5',
      name: 'غرفة التحكم والإنتاج الإعلامي (Media Control)',
      code: 'SEC-E5',
      location: 'الكابينة الفنية الخلفية',
      capacity: 25,
      currentCount: 20,
      status: 'optimal',
      leadName: 'حازم الملاح (مونتاج وميديا)',
      committeeId: 'comm-montage',
      lastUpdate: 'منذ دقيقة'
    }
  ]);

  // Tactical Voice Orders stream
  const [voiceOrders, setVoiceOrders] = useState<LiveVoiceOrder[]>([
    {
      id: 'vo-1',
      senderName: 'زياد أشرف (رئيس فريق المتطوعين)',
      senderRole: 'super_admin',
      time: '10:45 ص',
      title: 'توجيه عاجل: فتح البوابة الفرعية B لتخفيف الضغط عن المدخل الرئيسي',
      audioUrl: '', // demo voice or empty
      duration: 18,
      priority: 'urgent',
      targetCommittee: 'comm-org'
    },
    {
      id: 'vo-2',
      senderName: 'مريم علاء (رئيس لجنة التصوير)',
      senderRole: 'head',
      time: '11:15 ص',
      title: 'بدء توثيق كلمة عميد الكلية في القاعة الرئيسية - فريق التصوير الاستعداد',
      audioUrl: '',
      duration: 24,
      priority: 'standard',
      targetCommittee: 'comm-photo'
    }
  ]);

  const fallbackEvent: any = {
    id: 'live-operations-room',
    name: 'غرفة العمليات المركزية والقيادة الميدانية الموحدة',
    description: 'المتابعة المباشرة لانتشار المتطوعين، تدفق الحشود، وإدارة العمليات اللحظية بجامعة الإسكندرية.',
    date: new Date().toISOString().slice(0, 10),
    time: 'طوال اليوم (Live)',
    location: 'المجمع المركزي للأنشطة والفعاليات — جامعة الإسكندرية',
    expectedMembersCount: 150,
    status: 'Live',
    committeeQuotas: {
      'comm-org': { required: 30, present: 0 },
      'comm-hr': { required: 15, present: 0 },
      'comm-montage': { required: 10, present: 0 },
      'comm-media': { required: 15, present: 0 },
      'comm-content': { required: 10, present: 0 },
      'comm-design': { required: 10, present: 0 },
    },
    liveDashboardActive: true
  };

  const currentEvent = liveEvent || (events && events.length > 0 ? events[0] : fallbackEvent) || fallbackEvent;
  const eventTasks = tasks.filter(t => t.eventId === currentEvent.id || !t.eventId);
  const eventAttendance = attendanceRecords.filter(a => a.eventId === currentEvent.id);
  const activeSOS = sosAlerts.filter(s => s.status !== 'Closed');

  const totalExpected = currentEvent.expectedMembersCount || 100;
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

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Live Event Header Radar Bar */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/90 border-2 border-emerald-500/40 shadow-2xl">
        {/* Radar scanline animation */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 animate-pulse" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <Radio className="w-3.5 h-3.5" />
                <span>غرفة العمليات والقيادة التكتيكية الميدانية • LIVE OPERATIONS</span>
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentEvent.location}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{currentEvent.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              {currentEvent.description}
            </p>
          </div>

          {/* Live Tactical Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
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
              <span>سرعة التدفق (Velocity)</span>
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono mt-1">
              +14 <span className="text-xs text-slate-400 font-normal">حضور / دقيقة</span>
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
              <span>المهام الميدانية المعتمدة</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono mt-1">
              {eventTasks.filter(t => t.status === 'Approved').length} / {eventTasks.length}
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
                <span className="text-[11px] font-mono text-slate-400">{order.time}</span>
              </div>

              <p className="text-xs font-semibold text-slate-200 mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                {order.title}
              </p>

              {order.audioUrl ? (
                <VoicePlayer 
                  audioUrl={order.audioUrl} 
                  durationSeconds={order.duration} 
                  label="استمع للتوجيه الصوتي" 
                />
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-amber-400/90">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>تسجيل صوتي ميداني مشفر</span>
                  </div>
                  <span className="font-mono text-slate-400">{order.duration || 15} ثانية</span>
                </div>
              )}

              {order.targetCommittee && (
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>موجه خصيصاً إلى:</span>
                  <CommitteeBadge committeeId={order.targetCommittee} size="sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tactical Sector Tracking Grid */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <span>مصفوفة تتبع القطاعات الميدانية (Sectors & Zones Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400">مراقبة الطاقة الاستيعابية والمسؤولين عن كل قطاع حيوي في الفعالية</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            5 قطاعات نشطة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map(sector => {
            const pct = Math.round((sector.currentCount / sector.capacity) * 100);
            return (
              <div 
                key={sector.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 font-extrabold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                      {sector.code}
                    </span>
                    <h4 className="text-xs font-black text-white mt-1 group-hover:text-sky-300 transition-colors">
                      {sector.name}
                    </h4>
                  </div>
                  {getSectorStatusBadge(sector.status)}
                </div>

                <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{sector.location}</span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 mb-3 bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">الاستيعاب والكثافة:</span>
                    <span className="font-mono font-bold text-white">
                      {sector.currentCount} / {sector.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                {/* Sector Lead & Committee */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                  <div className="text-slate-300 font-semibold truncate max-w-[140px]">
                    👤 {sector.leadName}
                  </div>
                  <CommitteeBadge committeeId={sector.committeeId} size="sm" showIcon={true} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SOS Alerts Command Stream */}
      <div className="glass-card p-5 border-rose-500/30 bg-rose-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-base font-black text-white">
              شريط استغاثات وطوارئ الفعالية (Live SOS Dispatch)
            </h3>
          </div>
          <span className="text-xs text-rose-300 font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
            {activeSOS.length} بلاغات قيد المتابعة
          </span>
        </div>

        {activeSOS.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-emerald-400 font-bold">
            ✅ لا توجد أي بلاغات طوارئ نشطة حالياً. الفعالية تسير بأمان تام وانضباط كامل.
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

      {/* Committees Live Headcount Roster (6 Committees) */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-white">جاهزية وتواجد اللجان الميدانية الـ 6 (Committee Live Quotas)</h3>
            <p className="text-xs text-slate-400">متابعة لحظية لعدد المتطوعين الحاضرين مقارنة بالخطة المقررة لكل لجنة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentEvent.committeeQuotas || fallbackEvent.committeeQuotas || {}).map(([commId, quota]: [string, any]) => {
            const pct = quota && quota.required > 0 ? Math.round(((quota.present || 0) / quota.required) * 100) : 0;
            const presentCount = quota?.present || 0;
            const requiredCount = quota?.required || 0;
            return (
              <div key={commId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <CommitteeBadge committeeId={commId} size="sm" />
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    {presentCount} / {requiredCount} حاضر
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>نسبة التواجد: {pct}%</span>
                  <span className={pct >= 90 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {pct >= 90 ? 'مكتمل العدد 🟢' : 'جاري التوافد 🟡'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Check-ins Stream */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-black text-white">سجل الدخول اللحظي عبر Dynamic QR Code</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">آخر عمليات التسجيل الحية</span>
        </div>

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
                  <td className="py-3 text-slate-300 font-mono">{record.durationFormatted}</td>
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

    </div>
  );
};
