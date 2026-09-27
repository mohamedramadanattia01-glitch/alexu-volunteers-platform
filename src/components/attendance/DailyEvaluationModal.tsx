import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, Member } from '../../types';
import { 
  Award, Star, CheckCircle2, X, Sparkles, 
  MapPin, Clock, ShieldCheck, Download, User, ThumbsUp,
  Search, Filter, Check, LogIn, LogOut, Navigation, FileSpreadsheet,
  Users, Calendar, CheckSquare, Zap, AlertCircle
} from 'lucide-react';
import { exportAttendanceToExcel } from '../../utils/excelExport';

interface DailyEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSessionId?: string;
}

export const DailyEvaluationModal: React.FC<DailyEvaluationModalProps> = ({
  isOpen,
  onClose,
  selectedSessionId
}) => {
  const { 
    attendanceRecords, 
    attendanceSessions,
    events,
    liveEvent,
    submitDailyAttendanceEvaluation, 
    currentUser, 
    members,
    committees,
    showNotification 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected event filter state
  const defaultEvt = events.find(e => e.date === todayStr || e.status === 'Live') || liveEvent;
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  
  // List mode: scanned attendance records vs all team members roster
  const [rosterMode, setRosterMode] = useState<'scanned' | 'all_members'>('scanned');

  const [selectedMemberOrRecordId, setSelectedMemberOrRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [evalFilter, setEvalFilter] = useState<'all' | 'pending' | 'evaluated'>('all');

  const [attScore, setAttScore] = useState<number>(10);
  const [partScore, setPartScore] = useState<number>(10);
  const [commitScore, setCommitScore] = useState<number>(10);
  const [bonusXP, setBonusXP] = useState<number>(10);
  const [notes, setNotes] = useState<string>('أداء وانضباط ممتاز خلال الجلسة الميدانية');

  // Eligible team members (members, heads, vice heads)
  const evaluableMembers = useMemo(() => {
    return members.filter(m => m.status === 'Active' && (m.role === 'member' || m.role === 'head' || m.role === 'vice_head'));
  }, [members]);

  // Attendance records filtered by event/session/today
  const baseAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      const mem = members.find(m => m.id === r.memberId);
      if (mem && mem.role !== 'member' && mem.role !== 'head' && mem.role !== 'vice_head') {
        return false;
      }
      if (selectedEventFilter !== 'all') {
        return r.eventId === selectedEventFilter;
      }
      if (selectedSessionId) {
        return r.sessionId === selectedSessionId || r.date === todayStr;
      }
      return true;
    });
  }, [attendanceRecords, members, selectedEventFilter, selectedSessionId, todayStr]);

  // Combined active evaluation targets
  const displayItems = useMemo(() => {
    if (rosterMode === 'scanned') {
      // If there are zero scanned records and user is on scanned mode, fallback to show guidance or prompt
      return baseAttendanceRecords.filter(r => {
        const matchesSearch = 
          r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.memberVolunteerId && r.memberVolunteerId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (r.committeeName && r.committeeName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesComm = committeeFilter === 'all' || r.committeeId === committeeFilter;
        const isEvaluated = Boolean(r.dailyEvaluation);
        const matchesStatus = 
          evalFilter === 'all' ? true :
          evalFilter === 'evaluated' ? isEvaluated :
          !isEvaluated;

        return matchesSearch && matchesComm && matchesStatus;
      });
    } else {
      // All Members list
      return evaluableMembers.filter(m => {
        const matchesSearch = 
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.volunteerId && m.volunteerId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.currentCommitteeName && m.currentCommitteeName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesComm = committeeFilter === 'all' || m.currentCommitteeId === committeeFilter;
        
        // Find existing attendance record if any
        const existingAtt = attendanceRecords.find(a => 
          (a.memberId === m.id || a.memberVolunteerId === m.volunteerId) && 
          (selectedEventFilter !== 'all' ? a.eventId === selectedEventFilter : (a.date === todayStr || true))
        );
        const isEvaluated = Boolean(existingAtt?.dailyEvaluation);

        const matchesStatus = 
          evalFilter === 'all' ? true :
          evalFilter === 'evaluated' ? isEvaluated :
          !isEvaluated;

        return matchesSearch && matchesComm && matchesStatus;
      });
    }
  }, [rosterMode, baseAttendanceRecords, evaluableMembers, attendanceRecords, searchQuery, committeeFilter, evalFilter, selectedEventFilter, todayStr]);

  // Resolve currently active evaluated target
  const currentSelectedTarget = useMemo(() => {
    if (selectedMemberOrRecordId) {
      // Check in attendance records
      const rec = attendanceRecords.find(r => r.id === selectedMemberOrRecordId);
      if (rec) {
        const mem = members.find(m => m.id === rec.memberId);
        return { record: rec, member: mem || null };
      }
      // Check in members list
      const mem = members.find(m => m.id === selectedMemberOrRecordId);
      if (mem) {
        const rec = attendanceRecords.find(a => 
          (a.memberId === mem.id || a.memberVolunteerId === mem.volunteerId) &&
          (selectedEventFilter !== 'all' ? a.eventId === selectedEventFilter : (a.date === todayStr || true))
        );
        return { record: rec || null, member: mem };
      }
    }

    // Default fallback to first item
    if (displayItems.length > 0) {
      const first = displayItems[0];
      if ('checkInTime' in first) {
        const rec = first as AttendanceRecord;
        const mem = members.find(m => m.id === rec.memberId);
        return { record: rec, member: mem || null };
      } else {
        const mem = first as Member;
        const rec = attendanceRecords.find(a => 
          (a.memberId === mem.id || a.memberVolunteerId === mem.volunteerId) &&
          (selectedEventFilter !== 'all' ? a.eventId === selectedEventFilter : (a.date === todayStr || true))
        );
        return { record: rec || null, member: mem };
      }
    }

    // If still empty, return first available member
    if (evaluableMembers.length > 0) {
      return { record: null, member: evaluableMembers[0] };
    }

    return { record: null, member: null };
  }, [selectedMemberOrRecordId, displayItems, attendanceRecords, members, evaluableMembers, selectedEventFilter, todayStr]);

  // Update evaluation form scores when selected target changes
  const targetRecord = currentSelectedTarget.record;
  const targetMember = currentSelectedTarget.member;

  const handleSelectTarget = (targetId: string, recordObj?: AttendanceRecord | null) => {
    setSelectedMemberOrRecordId(targetId);
    if (recordObj && recordObj.dailyEvaluation) {
      setAttScore(recordObj.dailyEvaluation.attendanceScore ?? 10);
      setPartScore(recordObj.dailyEvaluation.participationScore ?? 10);
      setCommitScore(recordObj.dailyEvaluation.commitmentScore ?? 10);
      setBonusXP(recordObj.dailyEvaluation.bonusXP ?? 10);
      setNotes(recordObj.dailyEvaluation.notes || '');
    } else {
      setAttScore(10);
      setPartScore(10);
      setCommitScore(10);
      setBonusXP(10);
      setNotes('أداء وانضباط متميز خلال الفعالية الميدانية');
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMember && !targetRecord) return;

    const recordIdToUse = targetRecord ? targetRecord.id : (targetMember ? targetMember.id : '');
    const chosenEvent = events.find(ev => ev.id === selectedEventFilter) || defaultEvt;

    submitDailyAttendanceEvaluation(recordIdToUse, {
      attendanceScore: attScore,
      participationScore: partScore,
      commitmentScore: commitScore,
      bonusXP,
      notes,
      memberId: targetMember?.id || targetRecord?.memberId,
      eventId: chosenEvent?.id || 'event-live',
      eventName: chosenEvent?.name || 'جلسة عمل ميدانية',
      date: todayStr
    });

    // Auto-advance to next unevaluated item in list
    if (displayItems.length > 1) {
      const currentIndex = displayItems.findIndex(item => {
        const id = 'id' in item ? item.id : '';
        return id === (targetRecord?.id || targetMember?.id);
      });
      const nextItem = displayItems[currentIndex + 1] || displayItems[0];
      if (nextItem) {
        const nextId = 'id' in nextItem ? nextItem.id : '';
        const nextRec = 'checkInTime' in nextItem ? (nextItem as AttendanceRecord) : null;
        handleSelectTarget(nextId, nextRec);
      }
    }
  };

  const handleExportToday = () => {
    const recordsToExport = baseAttendanceRecords.length > 0 ? baseAttendanceRecords : attendanceRecords;
    const chosenEvent = events.find(ev => ev.id === selectedEventFilter);
    const title = chosenEvent ? `تقييمات_فعالية_${chosenEvent.name.replace(/\s+/g, '_')}_${todayStr}` : `تقييمات_جلسة_${todayStr}`;
    exportAttendanceToExcel(recordsToExport, title);
    showNotification('success', 'تم تصدير كشف الحضور والتقييمات الميدانية إلى Excel بنجاح 📊');
  };

  const totalPoints = attScore + partScore + commitScore;
  const percentage = Math.round((totalPoints / 30) * 100);
  const totalEvaluatedCount = baseAttendanceRecords.filter(r => Boolean(r.dailyEvaluation)).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in text-right">
      <div className="w-full max-w-5xl glass-card border border-amber-500/30 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/50 via-slate-900 to-blue-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تقييمات الحاضرين بالفعالية والجلسة الميدانية
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 font-mono">
                  {totalEvaluatedCount} تم تقييمهم
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تقييم المتطوعين الحاضرين بالدرجات والملاحظات، إرسال إشعار فوري، وزيادة نقاط الـ XP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleExportToday}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>تصدير شيت Excel 📊</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event Selector & Roster Mode Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          
          {/* Linked Event Selector */}
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-bold shrink-0">الفعالية المستهدفة:</span>
            <select
              value={selectedEventFilter}
              onChange={e => setSelectedEventFilter(e.target.value)}
              className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold w-full focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">🌐 كل الفعاليات وجلسات اليوم ({attendanceRecords.length} سجل حضور إجمالي)</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.date === todayStr ? '✨ [اليوم] ' : ''}{ev.name} ({ev.date}) — {ev.location}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher Tabs (Scanned vs All Team Members) */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setRosterMode('scanned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                rosterMode === 'scanned'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>الحاضرون بالكود ({baseAttendanceRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setRosterMode('all_members')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                rosterMode === 'all_members'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>فريق المتطوعين بالكامل ({evaluableMembers.length})</span>
            </button>
          </div>

        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Attendees List Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col max-h-[520px]">
            
            {/* Search & Committee Filters Header */}
            <div className="space-y-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو كود المتطوع..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={committeeFilter}
                  onChange={e => setCommitteeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 cursor-pointer"
                >
                  <option value="all">جميع اللجان</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={evalFilter}
                  onChange={e => setEvalFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 cursor-pointer"
                >
                  <option value="all">الكل ({displayItems.length})</option>
                  <option value="pending">بانتظار التقييم</option>
                  <option value="evaluated">تم تقييمهم</option>
                </select>
              </div>
            </div>

            {/* List items */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {displayItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="font-bold text-white">لا توجد تسجيلات حضور في هذه الفعالية حتى الآن.</p>
                  <p className="text-[11px] text-slate-400">
                    يمكنك التبديل إلى تبويب <strong>"فريق المتطوعين بالكامل"</strong> أعلاه لاختيار وتقييم أي عضو وتحضيره مباشرة!
                  </p>
                  <button
                    type="button"
                    onClick={() => setRosterMode('all_members')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs"
                  >
                    عرض جميع المتطوعين 👥
                  </button>
                </div>
              ) : (
                displayItems.map(item => {
                  const isRec = 'checkInTime' in item;
                  const rec = isRec ? (item as AttendanceRecord) : attendanceRecords.find(a => 
                    (a.memberId === item.id || a.memberVolunteerId === (item as Member).volunteerId) &&
                    (selectedEventFilter !== 'all' ? a.eventId === selectedEventFilter : (a.date === todayStr || true))
                  );
                  const mem = isRec ? members.find(m => m.id === (item as AttendanceRecord).memberId) : (item as Member);

                  const memberName = isRec ? (item as AttendanceRecord).memberName : (item as Member).fullName;
                  const memberAvatar = isRec ? (item as AttendanceRecord).memberAvatar : (item as Member).avatarUrl;
                  const memberVolId = isRec ? (item as AttendanceRecord).memberVolunteerId : (item as Member).volunteerId;
                  const committeeName = isRec ? (item as AttendanceRecord).committeeName : (item as Member).currentCommitteeName;

                  const isSelected = (targetRecord && isRec && targetRecord.id === item.id) || (targetMember && !isRec && targetMember.id === item.id) || (targetMember && mem && targetMember.id === mem.id);
                  const isEvaluated = Boolean(rec?.dailyEvaluation);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTarget(item.id, rec || null)}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={memberAvatar}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {memberName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="text-blue-400 font-bold">{memberVolId || 'عضو'}</span>
                              <span>•</span>
                              <span>{committeeName}</span>
                            </div>
                          </div>
                        </div>

                        {isEvaluated ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{rec?.dailyEvaluation?.totalDailyScore}/30</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
                            بانتظار التقييم
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 gap-1">
                        {rec ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-emerald-400 font-bold">🟢 دخول: {rec.checkInTime}</span>
                            {rec.checkOutTime ? (
                              <span className="text-purple-300 font-bold">➔ 🔴 انصراف: {rec.checkOutTime}</span>
                            ) : (
                              <span className="text-amber-400 text-[9px] bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/30">⏳ بالميدان</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">لم يمسح كود الـ QR بعد (جاهز للتقييم المباشر)</span>
                        )}
                        {rec?.durationFormatted && (
                          <span className="text-sky-300 font-medium">⏱️ {rec.durationFormatted}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Evaluation Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            {targetMember || targetRecord ? (
              <form onSubmit={handleSaveEvaluation} className="space-y-4">
                
                {/* Active Member Header Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={targetRecord?.memberAvatar || targetMember?.avatarUrl}
                      alt=""
                      className="w-13 h-13 rounded-xl object-cover border-2 border-amber-500/40 shrink-0 shadow-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {targetRecord?.memberName || targetMember?.fullName}
                        </h4>
                        <span className="px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                          {targetRecord?.memberVolunteerId || targetMember?.volunteerId || 'عضو'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {targetRecord?.committeeName || targetMember?.currentCommitteeName} • فعالية: {targetRecord?.eventName || events.find(e => e.id === selectedEventFilter)?.name || 'جلسة الميدان'}
                      </p>
                      
                      {targetRecord ? (
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                          <span className="text-emerald-400">🟢 دخول: {targetRecord.checkInTime}</span>
                          {targetRecord.checkOutTime ? (
                            <span className="text-purple-300">| 🔴 انصراف: {targetRecord.checkOutTime} ({targetRecord.durationFormatted})</span>
                          ) : (
                            <span className="text-amber-400 text-[10px]">| متواجد بالميدان</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-300 font-bold block mt-1">
                          ⚡ تقييم واعتماد حضور مباشر للمتطوع
                        </span>
                      )}
                    </div>
                  </div>

                  {targetRecord?.gpsLocation && (
                    <div className="text-right sm:text-left text-[10px] bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-300 shrink-0">
                      <div className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>الموقع الميداني (GPS):</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-300 block mt-0.5">
                        {targetRecord.gpsLocation.address || `${targetRecord.gpsLocation.lat?.toFixed(4)}, ${targetRecord.gpsLocation.lng?.toFixed(4)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rubric Sliders */}
                <div className="space-y-3 pt-1">
                  
                  {/* 1. Attendance & Punctuality */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-200">1. الحضور والانضباط بالمواعيد والزي الرسمي:</span>
                      <span className="font-extrabold text-sky-400 font-mono text-sm">{attScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={attScore}
                      onChange={e => setAttScore(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* 2. Participation & Initiative */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-200">2. التفاعل والمبادرة والمشاركة والروح الإيجابية:</span>
                      <span className="font-extrabold text-amber-400 font-mono text-sm">{partScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={partScore}
                      onChange={e => setPartScore(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* 3. Performance & Quality */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-200">3. جودة التنفيذ الميداني والتعاون مع الفريق:</span>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">{commitScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={commitScore}
                      onChange={e => setCommitScore(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Bonus XP & Total Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نقاط تشجيعية إضافية (Bonus XP):
                      </label>
                      <select
                        value={bonusXP}
                        onChange={e => setBonusXP(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 cursor-pointer font-bold"
                      >
                        <option value={0}>0 XP إضافي</option>
                        <option value={10}>+10 XP (مجهود مميز)</option>
                        <option value={20}>+20 XP (أداء استثنائي)</option>
                        <option value={30}>+30 XP (بطل الجلسة 🌟)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        مجموع الدرجات والنسبة المئوية:
                      </label>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">الدرجة النهائية:</span>
                        <span className="text-amber-400 font-black text-sm font-mono">{totalPoints} / 30 ({percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ملاحظات وتوجيهات المقيم للمتطوع (ستصله في إشعار شخصي):
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="اكتب كلمة تشجيعية أو توجيه ميداني للمتطوع..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>حفظ تقييم اليوم واعتماد زيادة نقاط الـ XP وإرسال الإشعار للمتطوع</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                اختر متطوعاً من القائمة الجانبية للبدء في تقييمه.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
