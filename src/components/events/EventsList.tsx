import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventEntity } from '../../types';
import { 
  Calendar as CalendarIcon, Plus, MapPin, Clock, Users, 
  CheckSquare, Zap, ChevronLeft, ChevronRight, AlertTriangle,
  Grid, CalendarDays, Eye, Sparkles, X, Layers
} from 'lucide-react';

interface EventsListProps {
  onOpenNewEvent: () => void;
  onOpenLiveCommand: (event: EventEntity) => void;
}

export const EventsList: React.FC<EventsListProps> = ({ onOpenNewEvent, onOpenLiveCommand }) => {
  const { events, committees, currentUser, isHighLeadership, branding } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);

  const canCreate = isHighLeadership || ['head', 'vice_head', 'event_manager'].includes(currentUser.role);

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // In Egypt week starts on Saturday:
  // Saturday = 6 in JS getDay(), Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5
  // Shift so Saturday = 0: (day + 1) % 7
  const startOffset = (firstDayIndex + 1) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events for a given day
  const getEventsForDay = (dayNum: number) => {
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              الأجندة والتشغيل الميداني
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>فعاليات وأنشطة اتحاد طلاب جامعة الإسكندرية</span>
            <CalendarIcon className="w-5 h-5 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تخطيط المؤتمرات والمعارض وتوزيع حصص اللجان وجدول التقويم التفاعلي
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
              onClick={onOpenNewEvent}
              className="btn-primary text-xs py-2 px-3.5 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فعالية جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar View Mode */}
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
                <span className="text-[11px] text-slate-400">انقر على أي يوم يحتوي على لوجو الاتحاد لعرض الفعالية</span>
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

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
            {daysOfWeek.map((day, i) => (
              <div key={i} className="py-2 text-[11px] sm:text-xs font-bold text-slate-400 bg-slate-900/60 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots for previous month offset */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-28 rounded-xl bg-slate-950/20 border border-slate-900/40 opacity-30" />
            ))}

            {/* Days in current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayEvents = getEventsForDay(dayNum);
              const hasEvents = dayEvents.length > 0;
              const isToday = 
                new Date().getDate() === dayNum && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedEvent(dayEvents[0]);
                    } else if (canCreate) {
                      onOpenNewEvent();
                    }
                  }}
                  className={`h-20 sm:h-28 p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between select-none relative group ${
                    hasEvents 
                      ? 'bg-blue-950/30 border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/30 cursor-pointer shadow-lg shadow-blue-500/10'
                      : isToday
                      ? 'bg-slate-900/90 border-sky-400/80'
                      : 'bg-slate-900/40 border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/40 cursor-default'
                  }`}
                >
                  {/* Top Day Number & Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-sky-500 text-slate-950 font-black' 
                        : hasEvents 
                        ? 'text-sky-300 font-extrabold' 
                        : 'text-slate-400'
                    }`}>
                      {dayNum}
                    </span>

                    {hasEvents && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/30 text-sky-200 font-bold border border-blue-500/40 hidden xs:inline">
                        {dayEvents.length} فعالية
                      </span>
                    )}
                  </div>

                  {/* Center Union Logo on Event Days */}
                  {hasEvents ? (
                    <div className="flex-1 flex flex-col items-center justify-center my-0.5 gap-1">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-white p-0.5 shadow-md shadow-blue-500/30 border border-blue-400/50 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        {branding.logoUrl ? (
                          <img src={branding.logoUrl} alt="اتحاد طلاب جامعة الإسكندرية" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-black text-[10px] text-blue-600">AU</span>
                        )}
                      </div>
                      <span className="text-[10px] text-white font-bold truncate max-w-[95%] text-center hidden sm:block">
                        {dayEvents[0].name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {/* Bottom Indicator */}
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
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => {
            const isLive = ev.status === 'Live';

            return (
              <div 
                key={ev.id}
                className={`glass-card p-6 glass-card-hover border-slate-800 flex flex-col justify-between ${
                  isLive ? 'border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-900 shadow-xl' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      isLive ? 'bg-emerald-500 text-slate-950 animate-pulse' :
                      ev.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-300' :
                      ev.status === 'Completed' ? 'bg-slate-700 text-slate-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {isLive ? '🔴 جاري الآن (Live)' : ev.status}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">{ev.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{ev.name}</h3>
                  <p className="text-xs text-slate-300 mb-4 line-clamp-2">{ev.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>المتطوعون المقررون: {ev.expectedMembersCount} متطوع</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1"
                    title="معاينة تفاصيل الفعالية"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تفاصيل</span>
                  </button>

                  {isLive ? (
                    <button
                      onClick={() => onOpenLiveCommand(ev)}
                      className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 font-bold"
                    >
                      <Zap className="w-4 h-4" />
                      <span>غرفة العمليات الحية (Live)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenLiveCommand(ev)}
                      className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <span>توزيع وخطة الفعالية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Simple Event Details Popup Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-slate-950 border-slate-800 p-6 max-w-lg w-full rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-blue-500/40 flex items-center justify-center shadow-md">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="لوجو الاتحاد" className="w-full h-full object-contain" />
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

            {/* Event Info Details */}
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

              {/* Committee Quotas if any */}
              {selectedEvent.committeeQuotas && Object.keys(selectedEvent.committeeQuotas).length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>حصص اللجان التخصصية في الفعالية:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedEvent.committeeQuotas).map(([cId, quota]) => {
                      const comm = committees.find(c => c.id === cId);
                      const assignedCount = typeof quota === 'number' ? quota : (quota?.assigned ?? 0);
                      return (
                        <span key={cId} className="px-2 py-0.5 rounded-lg bg-blue-600/20 text-blue-300 font-semibold text-[11px] border border-blue-500/30">
                          {comm ? comm.name : cId}: {assignedCount} متطوع
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2 justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  const ev = selectedEvent;
                  setSelectedEvent(null);
                  onOpenLiveCommand(ev);
                }}
                className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>فتح غرفة العمليات والمهام</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

