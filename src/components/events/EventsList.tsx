import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventEntity, EventRSVP } from '../../types';
import { 
  Calendar as CalendarIcon, Plus, MapPin, Clock, Users, 
  CheckSquare, Zap, ChevronLeft, ChevronRight, AlertTriangle,
  Grid, CalendarDays, Eye, Sparkles, X, Layers, Edit3, Trash2, 
  ShieldAlert, CheckCircle2, XCircle, Bell, Download, FileSpreadsheet, 
  Crown, Send, UserCheck, UserX, BarChart3, Copy
} from 'lucide-react';
import { exportEventRosterToExcel } from '../../utils/excelExport';

interface EventsListProps {
  onOpenNewEvent: (initialDate?: string) => void;
  onOpenLiveCommand: (event: EventEntity) => void;
  onEditEvent?: (event: EventEntity) => void;
  onDuplicateEvent?: (event: EventEntity) => void;
}

export const EventsList: React.FC<EventsListProps> = ({ 
  onOpenNewEvent, 
  onOpenLiveCommand,
  onEditEvent,
  onDuplicateEvent
}) => {
  const { 
    events, committees, currentUser, isHighLeadership, 
    branding, deleteEvent, respondToEventRSVP, sendEventDayReminder 
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventEntity | null>(null);
  const [statsEvent, setStatsEvent] = useState<EventEntity | null>(null);
  const [apologizingEvent, setApologizingEvent] = useState<EventEntity | null>(null);
  const [apologyReasonText, setApologyReasonText] = useState('');
  const [expectedTimeMap, setExpectedTimeMap] = useState<{ [eventId: string]: string }>({});

  const isHead = currentUser.role === 'head' || currentUser.role === 'vice_head';
  const canCreate = isHighLeadership || isHead || ['event_manager', 'hr_admin'].includes(currentUser.role);
  const canViewStats = isHighLeadership || isHead || ['event_manager', 'hr_admin'].includes(currentUser.role);

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = (firstDayIndex + 1) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Filter events for calendar day
  const getEventsForDay = (dayNum: number) => {
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return events.filter(e => e.date === dateStr);
  };

  // Submit Apology
  const handleConfirmApology = () => {
    if (!apologizingEvent) return;
    if (!apologyReasonText.trim()) {
      alert('يرجى كتابة سبب الاعتذار');
      return;
    }

    respondToEventRSVP(apologizingEvent.id, 'Apologized', undefined, apologyReasonText.trim());
    setApologizingEvent(null);
    setApologyReasonText('');
  };

  // Submit Attending
  const handleConfirmAttending = (ev: EventEntity) => {
    const time = expectedTimeMap[ev.id] || ev.startTime;
    respondToEventRSVP(ev.id, 'Attending', time);
  };

  // Export Roster Excel
  const handleExportRoster = (ev: EventEntity) => {
    const rsvps = Object.values(ev.rsvps || {});
    exportEventRosterToExcel(ev, rsvps);
  };

  return (
    <div className="space-y-6 animate-in fade-in text-right">
      
      {/* 1. Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-end sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              الأجندة والتشغيل الميداني
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>فعاليات وأنشطة اتحاد طلاب جامعة الإسكندرية</span>
            <CalendarIcon className="w-5 h-5 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل تأكيدات الحضور والاعتذارات، إحصائيات اللجان، توزيع الكوتة، وتنبيهات يوم الفعالية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>التقويم الشهري</span>
            </button>
          </div>

          {canCreate && (
            <button
              onClick={() => onOpenNewEvent()}
              className="btn-primary text-xs py-2 px-3.5 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وتخصيص فعالية</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Calendar View Mode */}
      {viewMode === 'calendar' ? (
        <div className="glass-card p-4 sm:p-6 space-y-4">
          
          {/* Month Header Controller */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{monthNames[month]} {year}</span>
                </h3>
                <span className="text-[11px] text-slate-400">انقر على أي يوم يحتوي على لوجو الاتحاد لعرض تفاصيل الفعالية</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                اليوم
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="الشهر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 pb-1">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="py-1.5 rounded-lg bg-slate-900/60">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[105px] rounded-xl bg-slate-950/30 border border-slate-900/50 p-1.5 opacity-30" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDay = String(dayNum).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayEvents = getEventsForDay(dayNum);
              const isToday = 
                new Date().getDate() === dayNum && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;

              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedEvent(dayEvents[0]);
                    } else if (canCreate) {
                      onOpenNewEvent(dateStr);
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[110px] rounded-xl p-2 border transition-all flex flex-col justify-between relative group cursor-pointer ${
                    hasEvents 
                      ? 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-sky-500/40 hover:border-sky-400 shadow-md' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-900/60'
                  } ${isToday ? 'ring-2 ring-sky-400 bg-sky-950/30' : ''}`}
                  title={hasEvents ? `عرض فعالية: ${dayEvents[0].name}` : canCreate ? `انقر لإنشاء فعالية بتاريخ ${dateStr}` : `يوم ${dayNum}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-black ${
                      isToday ? 'px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950' : 
                      hasEvents ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-300'
                    }`}>
                      {dayNum}
                    </span>

                    {hasEvents ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ) : canCreate ? (
                      <span className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold transition-opacity">
                        + فعالية
                      </span>
                    ) : null}
                  </div>

                  {hasEvents ? (
                    <div className="flex flex-col items-center justify-center my-1 group-hover:scale-105 transition-transform">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-1 shadow-lg border border-sky-400/50 flex items-center justify-center">
                        {branding.logoUrl ? (
                          <img src={branding.logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-black text-blue-600 text-[10px]">AU</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-white text-center line-clamp-1 mt-1 leading-tight">
                        {dayEvents[0].name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      {canCreate && (
                        <span className="text-[10px] text-slate-600 group-hover:text-sky-400 transition-colors font-medium">
                          + حجز اليوم
                        </span>
                      )}
                    </div>
                  )}

                  {hasEvents && (
                    <div className="w-full text-center">
                      <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold block truncate ${
                        dayEvents[0].status === 'Live' ? 'bg-emerald-500 text-slate-950' : 'text-blue-300'
                      }`}>
                        {dayEvents[0].status === 'Live' ? '🔴 مباشر الآن' : dayEvents[0].startTime}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* 3. Events Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => {
            const isLive = ev.status === 'Live';
            const rsvps = ev.rsvps || {};
            const myRSVP = rsvps[currentUser.id];
            const confirmedCount = Object.values(rsvps).filter(r => r.status === 'Attending').length;
            const apologizedCount = Object.values(rsvps).filter(r => r.status === 'Apologized').length;

            return (
              <div 
                key={ev.id}
                className={`glass-card p-5 glass-card-hover border-slate-800 flex flex-col justify-between ${
                  isLive ? 'border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-900 shadow-xl' : ''
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        isLive ? 'bg-emerald-500 text-slate-950 animate-pulse' :
                        ev.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-300' :
                        ev.status === 'Completed' ? 'bg-slate-700 text-slate-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isLive ? '🔴 جاري الآن (Live)' : ev.status}
                      </span>

                      {/* Audience Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        {ev.targetAudience === 'heads_leadership' ? '👑 القيادة والهيدات' :
                         ev.targetAudience === 'members_only' ? '🌟 للأعضاء فقط' : '👥 لكل الفريق'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">{ev.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{ev.name}</h3>
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2">{ev.description}</p>

                  {/* Info Box */}
                  <div className="space-y-1.5 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate text-slate-200">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                      <span className="text-emerald-400 font-bold">
                        المستهدف: {ev.expectedMembersCount} متطوع
                      </span>
                      <span className="text-sky-300 font-mono">
                        تأكيدات: {confirmedCount} • اعتذارات: {apologizedCount}
                      </span>
                    </div>
                  </div>

                  {/* Member RSVP Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">موقفك من الحضور:</span>
                      {myRSVP ? (
                        myRSVP.status === 'Attending' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مؤكد الحضور ({myRSVP.expectedArrivalTime || ev.startTime})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>معتذر: {myRSVP.apologyReason}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-amber-400 font-bold">بانتظار ردك ⏳</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          placeholder={ev.startTime}
                          value={expectedTimeMap[ev.id] || ''}
                          onChange={(e) => setExpectedTimeMap({ ...expectedTimeMap, [ev.id]: e.target.value })}
                          className="w-24 glass-input text-center text-[10px] py-1 px-1.5 font-mono"
                          title="حدد وقت الحضور المتوقع إن كان يختلف عن البداية"
                        />
                        <button
                          onClick={() => handleConfirmAttending(ev)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            myRSVP?.status === 'Attending'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>سأحضر</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setApologizingEvent(ev);
                          setApologyReasonText(myRSVP?.apologyReason || '');
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          myRSVP?.status === 'Apologized'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>اعتذار</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                  
                  {/* Event Statistics Button for Leadership & Heads */}
                  {canViewStats && (
                    <button
                      onClick={() => setStatsEvent(ev)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      title="إحصائية الفعالية وكشف حضور اللجان"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                      <span>إحصائية</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="btn-secondary text-xs py-1.5 px-2.5 flex items-center justify-center gap-1 cursor-pointer"
                    title="معاينة تفاصيل الفعالية"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>تفاصيل</span>
                  </button>

                  {/* High Leadership Edit, Duplicate & Delete Action Buttons */}
                  {isHighLeadership && (
                    <>
                      <button
                        onClick={() => onDuplicateEvent?.(ev)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs transition-all cursor-pointer"
                        title="نسخ وتكرار الفعالية ببيانات جديدة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditEvent?.(ev)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs transition-all cursor-pointer"
                        title="تعديل الفعالية وتخصيص اللجان"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEventToDelete(ev)}
                        className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs transition-all cursor-pointer"
                        title="مسح وحذف الفعالية"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isLive ? (
                    <button
                      onClick={() => onOpenLiveCommand(ev)}
                      className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-md font-bold cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>غرفة العمليات</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenLiveCommand(ev)}
                      className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>توزيع الميدان</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. EVENT STATISTICS & ROSTER MODAL (FOR HEADS & LEADERSHIP) */}
      {statsEvent && (() => {
        const rsvps = Object.values(statsEvent.rsvps || {});
        const attendingList = rsvps.filter(r => r.status === 'Attending');
        const apologizedList = rsvps.filter(r => r.status === 'Apologized');
        const quotas = statsEvent.committeeQuotas || {};

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="glass-card bg-slate-950 border border-sky-500/40 p-5 sm:p-6 max-w-3xl w-full rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      إحصائية وكشف حضور فعالية: {statsEvent.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {statsEvent.date} • {statsEvent.location} • {statsEvent.startTime} - {statsEvent.endTime}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStatsEvent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons: Export Excel & Send Reminder */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex-wrap">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-emerald-400">المؤكدون: {attendingList.length}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-rose-400">المعتذرون: {apologizedList.length}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sky-300">المستهدف الكلي: {statsEvent.expectedMembersCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendEventDayReminder(statsEvent.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="إرسال إشعار تذكير فوري بيوم الفعالية لجميع المؤكدين"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>تذكير يوم الفعالية 🔔</span>
                  </button>

                  <button
                    onClick={() => handleExportRoster(statsEvent)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="تصدير كشف الحضور والاعتذارات بالكامل إلى Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>تصدير Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Committee Quotas Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>توزيع الحضور الفعلي وحصص اللجان:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {committees.map(comm => {
                    const quota = quotas[comm.id]?.required || 0;
                    const commAttending = attendingList.filter(r => r.committeeId === comm.id).length;
                    const commApologies = apologizedList.filter(r => r.committeeId === comm.id).length;
                    const pct = quota > 0 ? Math.min(100, Math.round((commAttending / quota) * 100)) : 0;

                    return (
                      <div key={comm.id} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-white truncate">{comm.name}</span>
                          <span className="text-emerald-400 font-mono">{commAttending} / {quota || '—'}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>نسبة التحقيق: {pct}%</span>
                          {commApologies > 0 && <span className="text-rose-400">{commApologies} اعتذار</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirmed Attendees List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>سجل الأعضاء المؤكدين للحضور ({attendingList.length})</span>
                </h4>

                <div className="overflow-x-auto max-h-48 border border-slate-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-900/90 sticky top-0 text-slate-400">
                      <tr className="border-b border-slate-800">
                        <th className="p-2 font-bold">الرقم التطوعي</th>
                        <th className="p-2 font-bold">المتطوع</th>
                        <th className="p-2 font-bold">اللجنة</th>
                        <th className="p-2 font-bold">وقت الحضور المحدد</th>
                        <th className="p-2 font-bold">توقيت التسجيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {attendingList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                            لم يسجل أي عضو تأكيد الحضور بعد.
                          </td>
                        </tr>
                      ) : (
                        attendingList.map(att => (
                          <tr key={att.memberId} className="hover:bg-slate-900/40">
                            <td className="p-2 font-mono text-sky-400 text-[11px]">{att.memberVolunteerId || att.memberId}</td>
                            <td className="p-2 font-bold text-white">{att.memberName}</td>
                            <td className="p-2 text-slate-300">{att.committeeName}</td>
                            <td className="p-2 font-mono text-emerald-400 font-bold">{att.expectedArrivalTime || statsEvent.startTime}</td>
                            <td className="p-2 text-slate-500 font-mono text-[10px]">{att.registeredAt}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Apologies List */}
              {apologizedList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <UserX className="w-4 h-4" />
                    <span>سجل المعتذرين وأسباب الاعتذار ({apologizedList.length})</span>
                  </h4>

                  <div className="overflow-x-auto max-h-40 border border-slate-800 rounded-xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900/90 sticky top-0 text-slate-400">
                        <tr className="border-b border-slate-800">
                          <th className="p-2 font-bold">المتطوع</th>
                          <th className="p-2 font-bold">اللجنة</th>
                          <th className="p-2 font-bold">سبب الاعتذار</th>
                          <th className="p-2 font-bold">توقيت الاعتذار</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {apologizedList.map(ap => (
                          <tr key={ap.memberId} className="hover:bg-slate-900/40">
                            <td className="p-2 font-bold text-white">{ap.memberName}</td>
                            <td className="p-2 text-slate-300">{ap.committeeName}</td>
                            <td className="p-2 text-rose-300 font-medium">{ap.apologyReason || '—'}</td>
                            <td className="p-2 text-slate-500 font-mono text-[10px]">{ap.registeredAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* 5. APOLOGY REASON POPUP MODAL */}
      {apologizingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-slate-950 border border-rose-500/40 p-5 max-w-md w-full rounded-2xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white">تسجيل اعتذار عن فعالية: {apologizingEvent.name}</h4>
              </div>
              <button onClick={() => setApologizingEvent(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                سبب الاعتذار عن الحضور الميداني *
              </label>
              <textarea
                rows={3}
                required
                placeholder="يرجى توضيح سبب عدم التمكن من الحضور (ظرف دراسي، صحي، عائلي...)"
                value={apologyReasonText}
                onChange={(e) => setApologyReasonText(e.target.value)}
                className="glass-input text-xs w-full resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApologizingEvent(null)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmApology}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                تأكيد الاعتذار ⚠️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-slate-950 border-slate-800 p-6 max-w-lg w-full rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-blue-500/40 flex items-center justify-center shadow-md">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-extrabold text-blue-600 text-xs">AU</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">فعالية رسمية معتمدة</span>
                  <h3 className="text-base font-bold text-white leading-tight">{selectedEvent.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                {selectedEvent.description || 'لا يوجد وصف تفصيلي مسجل للفعالية.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">التاريخ</div>
                    <div className="font-bold text-white font-mono">{selectedEvent.date}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">التوقيت</div>
                    <div className="font-bold text-white">{selectedEvent.startTime} - {selectedEvent.endTime}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400">الموقع</div>
                    <div className="font-bold text-white truncate">{selectedEvent.location}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">حصة المتطوعين</div>
                    <div className="font-bold text-white font-mono">{selectedEvent.expectedMembersCount} متطوع</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {canCreate && onDuplicateEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      const ev = selectedEvent;
                      setSelectedEvent(null);
                      onDuplicateEvent(ev);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    title="نسخ وتكرار الفعالية"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ وتكرار</span>
                  </button>
                )}
                {canCreate && onEditEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      const ev = selectedEvent;
                      setSelectedEvent(null);
                      onEditEvent(ev);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const ev = selectedEvent;
                    setSelectedEvent(null);
                    onOpenLiveCommand(ev);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>غرفة العمليات</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Delete Event Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-slate-950 border border-rose-500/50 p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف الفعالية</h3>
                <span className="text-xs text-rose-300">صلاحية الإدارة العليا فقط</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              هل أنت متأكد من رغبتك في حذف الفعالية <strong className="text-white">"{eventToDelete.name}"</strong> نهائياً من النظام؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteEvent(eventToDelete.id);
                  setEventToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/30"
              >
                نعم، احذف الفعالية نهائياً 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
