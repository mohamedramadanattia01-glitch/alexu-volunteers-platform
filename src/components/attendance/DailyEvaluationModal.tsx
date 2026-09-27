import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, Member } from '../../types';
import { 
  Award, Star, CheckCircle2, X, Sparkles, 
  MapPin, Clock, ShieldCheck, Download, User, ThumbsUp,
  Search, Filter, Check, LogIn, LogOut, Navigation, FileSpreadsheet,
  Users, Calendar, CheckSquare, Zap, AlertCircle, UserPlus, Info,
  TrendingUp, Sliders, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import { exportAttendanceToExcel } from '../../utils/excelExport';

interface DailyEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSessionId?: string;
}

// Criteria Configurations with 3 Standard Grades (A = 100%, B = 50%, C = 15%)
const EVAL_CRITERIA_CONFIG = [
  {
    key: 'attendanceCommitment',
    title: 'الالتزام والحضور والانضباط',
    maxScore: 25,
    description: 'الحضور في الموعد المحدد، الالتزام بالزي والسلوك والمظهر اللائق، والجدية طوال فترة الفعالية.',
    grades: {
      A: { label: 'A (ممتاز)', score: 25, pct: '100%', desc: 'انضباط كامل وحضور مبكر' },
      B: { label: 'B (متوسط)', score: 12.5, pct: '50%', desc: 'تأخير بسيط أو انضباط جزئي' },
      C: { label: 'C (مقبول)', score: 3.75, pct: '15%', desc: 'انضباط ضعيف وتأخير ملحوظ' }
    }
  },
  {
    key: 'taskQuality',
    title: 'جودة الأداء وإتقان المهام',
    maxScore: 35,
    description: 'تنفيذ التكليفات الميدانية بدقة وسرعة وبدون أخطاء، وتحمل المسؤولية وحسن التصرف.',
    grades: {
      A: { label: 'A (ممتاز)', score: 35, pct: '100%', desc: 'إتقان فائق وإنجاز مهام مثالي' },
      B: { label: 'B (متوسط)', score: 17.5, pct: '50%', desc: 'أداء جيد مع حاجة لمتابعة خفيفة' },
      C: { label: 'C (مقبول)', score: 5.25, pct: '15%', desc: 'إنجاز بطيء أو بحاجة لتوجيه مستمر' }
    }
  },
  {
    key: 'teamworkCommunication',
    title: 'العمل الجماعي والتواصل',
    maxScore: 25,
    description: 'التعاون مع الزملاء وقادة اللجان، التواصل الفعال وحل المشكلات بروح الفريق الواحد.',
    grades: {
      A: { label: 'A (ممتاز)', score: 25, pct: '100%', desc: 'روح فريق استثنائية وتواصل راقٍ' },
      B: { label: 'B (متوسط)', score: 12.5, pct: '50%', desc: 'تعاون معقول مع الفريق' },
      C: { label: 'C (مقبول)', score: 3.75, pct: '15%', desc: 'تفاعل محدود أو صعوبة في التواصل' }
    }
  },
  {
    key: 'initiativePassion',
    title: 'المبادرة والشغف والإيجابية',
    maxScore: 15,
    description: 'طرح أفكار مبتكرة، التطوع للمهام الإضافية، ونشر الطاقة الإيجابية والحماس بين الحضور.',
    grades: {
      A: { label: 'A (ممتاز)', score: 15, pct: '100%', desc: 'مبادرة مستمرة وشغف ملهم' },
      B: { label: 'B (متوسط)', score: 7.5, pct: '50%', desc: 'مبادرة جيدة عند الطلب' },
      C: { label: 'C (مقبول)', score: 2.25, pct: '15%', desc: 'تطبيق التوجيهات فقط دون مبادرة' }
    }
  }
];

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

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [evalFilter, setEvalFilter] = useState<'all' | 'pending' | 'evaluated'>('all');

  // 4 Criteria Scores state (out of 25, 35, 25, 15)
  const [scores, setScores] = useState<{ [key: string]: number }>({
    attendanceCommitment: 25,
    taskQuality: 35,
    teamworkCommunication: 25,
    initiativePassion: 15
  });

  // 4 Criteria Grade Selection (A | B | C | Custom)
  const [grades, setGrades] = useState<{ [key: string]: 'A' | 'B' | 'C' | 'Custom' }>({
    attendanceCommitment: 'A',
    taskQuality: 'A',
    teamworkCommunication: 'A',
    initiativePassion: 'A'
  });

  // Criteria individual comments
  const [criteriaNotes, setCriteriaNotes] = useState<{ [key: string]: string }>({
    attendanceCommitment: '',
    taskQuality: '',
    teamworkCommunication: '',
    initiativePassion: ''
  });

  // Extra Bonus Points & Reason
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [bonusReason, setBonusReason] = useState<string>('');

  const [bonusXP, setBonusXP] = useState<number>(15);
  const [generalNotes, setGeneralNotes] = useState<string>('أداء وانضباط ميداني متميز طوال فترة الفعالية');

  // Manual Add Member Popup state
  const [showAddMemberPicker, setShowAddMemberPicker] = useState<boolean>(false);
  const [memberPickerSearch, setMemberPickerSearch] = useState<string>('');
  const [memberPickerCommFilter, setMemberPickerCommFilter] = useState<string>('all');

  // Filter attendance records to ONLY those who have an attendance record for this session/event/today
  const scannedAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      // Must be an active role
      const mem = members.find(m => m.id === r.memberId || m.volunteerId === r.memberVolunteerId);
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

  // Filtered displayed attendee records
  const displayRecords = useMemo(() => {
    return scannedAttendanceRecords.filter(r => {
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
  }, [scannedAttendanceRecords, searchQuery, committeeFilter, evalFilter]);

  // Resolve currently active target attendance record (ONLY from scanned list or manually selected)
  const currentSelectedRecord = useMemo(() => {
    if (selectedRecordId) {
      const rec = scannedAttendanceRecords.find(r => r.id === selectedRecordId);
      if (rec) return rec;
    }
    // Default to first item in display records if any
    if (displayRecords.length > 0) {
      return displayRecords[0];
    }
    return null;
  }, [selectedRecordId, displayRecords, scannedAttendanceRecords]);

  // Member object associated with current target
  const currentMember = useMemo(() => {
    if (!currentSelectedRecord) return null;
    return members.find(m => m.id === currentSelectedRecord.memberId || m.volunteerId === currentSelectedRecord.memberVolunteerId) || null;
  }, [currentSelectedRecord, members]);

  // Handle selecting an attendee from the list
  const handleSelectRecord = (record: AttendanceRecord) => {
    setSelectedRecordId(record.id);
    const ev = record.dailyEvaluation;
    if (ev) {
      const c1 = Number(ev.attendanceCommitment ?? ev.attendanceScore ?? 25);
      const c2 = Number(ev.taskQuality ?? ev.participationScore ?? 35);
      const c3 = Number(ev.teamworkCommunication ?? ev.commitmentScore ?? 25);
      const c4 = Number(ev.initiativePassion ?? ev.taskExecutionScore ?? 15);

      setScores({
        attendanceCommitment: c1,
        taskQuality: c2,
        teamworkCommunication: c3,
        initiativePassion: c4
      });

      setGrades(ev.criteriaGrades as any || {
        attendanceCommitment: c1 === 25 ? 'A' : c1 === 12.5 ? 'B' : c1 === 3.75 ? 'C' : 'Custom',
        taskQuality: c2 === 35 ? 'A' : c2 === 17.5 ? 'B' : c2 === 5.25 ? 'C' : 'Custom',
        teamworkCommunication: c3 === 25 ? 'A' : c3 === 12.5 ? 'B' : c3 === 3.75 ? 'C' : 'Custom',
        initiativePassion: c4 === 15 ? 'A' : c4 === 7.5 ? 'B' : c4 === 2.25 ? 'C' : 'Custom'
      });

      setCriteriaNotes(ev.criteriaNotes || {
        attendanceCommitment: '',
        taskQuality: '',
        teamworkCommunication: '',
        initiativePassion: ''
      });

      setBonusPoints(ev.bonusPoints ?? 0);
      setBonusReason(ev.bonusReason ?? '');
      setBonusXP(ev.bonusXP ?? 15);
      setGeneralNotes(ev.notes || '');
    } else {
      // Default to full marks (A) for new evaluation
      setScores({
        attendanceCommitment: 25,
        taskQuality: 35,
        teamworkCommunication: 25,
        initiativePassion: 15
      });
      setGrades({
        attendanceCommitment: 'A',
        taskQuality: 'A',
        teamworkCommunication: 'A',
        initiativePassion: 'A'
      });
      setCriteriaNotes({
        attendanceCommitment: '',
        taskQuality: '',
        teamworkCommunication: '',
        initiativePassion: ''
      });
      setBonusPoints(0);
      setBonusReason('');
      setBonusXP(15);
      setGeneralNotes('أداء وانضباط ممتاز ومميز خلال الفعالية');
    }
  };

  // Helper to set a specific grade (A / B / C) for a criterion
  const handleSetCriterionGrade = (key: string, gradeLetter: 'A' | 'B' | 'C', scoreVal: number) => {
    setGrades(prev => ({ ...prev, [key]: gradeLetter }));
    setScores(prev => ({ ...prev, [key]: scoreVal }));
  };

  // Helper to set custom score for a criterion
  const handleSetCustomScore = (key: string, val: number, maxScore: number) => {
    const cleanVal = Math.min(maxScore, Math.max(0, Number(val) || 0));
    setScores(prev => ({ ...prev, [key]: cleanVal }));
    setGrades(prev => ({ ...prev, [key]: 'Custom' }));
  };

  // Quick Preset: Apply all A's or all B's
  const handleApplyPreset = (preset: 'all_A' | 'all_B') => {
    if (preset === 'all_A') {
      setScores({
        attendanceCommitment: 25,
        taskQuality: 35,
        teamworkCommunication: 25,
        initiativePassion: 15
      });
      setGrades({
        attendanceCommitment: 'A',
        taskQuality: 'A',
        teamworkCommunication: 'A',
        initiativePassion: 'A'
      });
    } else {
      setScores({
        attendanceCommitment: 12.5,
        taskQuality: 17.5,
        teamworkCommunication: 12.5,
        initiativePassion: 7.5
      });
      setGrades({
        attendanceCommitment: 'B',
        taskQuality: 'B',
        teamworkCommunication: 'B',
        initiativePassion: 'B'
      });
    }
  };

  // Calculate live total score (out of 100 + bonus)
  const totalPoints = useMemo(() => {
    const sum = (scores.attendanceCommitment || 0) + 
                (scores.taskQuality || 0) + 
                (scores.teamworkCommunication || 0) + 
                (scores.initiativePassion || 0) + 
                (Number(bonusPoints) || 0);
    return Math.min(120, Math.max(0, Math.round(sum * 10) / 10));
  }, [scores, bonusPoints]);

  const percentage = Math.min(100, Math.round(totalPoints));

  const overallGrade = useMemo(() => {
    if (totalPoints >= 95) return 'A+';
    if (totalPoints >= 85) return 'A';
    if (totalPoints >= 70) return 'B';
    if (totalPoints >= 50) return 'C';
    return 'D';
  }, [totalPoints]);

  // Handle Save Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedRecord) return;

    const chosenEvent = events.find(ev => ev.id === selectedEventFilter) || defaultEvt;

    submitDailyAttendanceEvaluation(currentSelectedRecord.id, {
      attendanceCommitment: scores.attendanceCommitment,
      taskQuality: scores.taskQuality,
      teamworkCommunication: scores.teamworkCommunication,
      initiativePassion: scores.initiativePassion,
      bonusPoints: Number(bonusPoints) || 0,
      bonusReason: bonusReason.trim() || undefined,
      criteriaGrades: grades,
      criteriaNotes: criteriaNotes,
      totalDailyScore: totalPoints,
      overallGrade: overallGrade,
      bonusXP,
      notes: generalNotes,
      memberId: currentSelectedRecord.memberId,
      eventId: chosenEvent?.id || currentSelectedRecord.eventId || 'event-live',
      eventName: chosenEvent?.name || currentSelectedRecord.eventName || 'جلسة عمل ميدانية',
      date: currentSelectedRecord.date || todayStr
    });

    // Auto-advance to next unevaluated record
    if (displayRecords.length > 1) {
      const currentIndex = displayRecords.findIndex(r => r.id === currentSelectedRecord.id);
      const nextRecord = displayRecords[currentIndex + 1] || displayRecords[0];
      if (nextRecord && nextRecord.id !== currentSelectedRecord.id) {
        handleSelectRecord(nextRecord);
      }
    }
  };

  // Handle Manual Member Addition to Attendance List
  const handleAddMemberManually = (member: Member) => {
    const chosenEvent = events.find(ev => ev.id === selectedEventFilter) || defaultEvt;
    const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Submit evaluation with manual creation
    submitDailyAttendanceEvaluation(member.id, {
      attendanceCommitment: 25,
      taskQuality: 35,
      teamworkCommunication: 25,
      initiativePassion: 15,
      criteriaGrades: { attendanceCommitment: 'A', taskQuality: 'A', teamworkCommunication: 'A', initiativePassion: 'A' },
      totalDailyScore: 100,
      overallGrade: 'A+',
      bonusXP: 15,
      notes: 'تمت الإضافة والتقييم يدوياً بواسطة الإدارة',
      memberId: member.id,
      eventId: chosenEvent?.id || 'event-live',
      eventName: chosenEvent?.name || 'جلسة عمل ميدانية',
      date: todayStr
    });

    setShowAddMemberPicker(false);
    showNotification('success', `تمت إضافة العضو "${member.fullName}" لقائمة التقييم واعتماد حضوره بنجاح ✓`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const recordsToExport = scannedAttendanceRecords.length > 0 ? scannedAttendanceRecords : attendanceRecords;
    const chosenEvent = events.find(ev => ev.id === selectedEventFilter);
    const title = chosenEvent ? `تقييمات_فعالية_${chosenEvent.name.replace(/\s+/g, '_')}_${todayStr}` : `تقييمات_جلسة_${todayStr}`;
    exportAttendanceToExcel(recordsToExport, title, members);
    showNotification('success', 'تم تصدير كشف التقييمات والحضور بنجاح 📊');
  };

  const totalEvaluatedCount = scannedAttendanceRecords.filter(r => Boolean(r.dailyEvaluation)).length;

  // Candidates for manual addition
  const candidateMembers = useMemo(() => {
    const alreadyAttendingIds = new Set(scannedAttendanceRecords.map(r => r.memberId));
    return members.filter(m => {
      if (m.status !== 'Active') return false;
      if (alreadyAttendingIds.has(m.id)) return false;
      const matchesSearch = 
        m.fullName.toLowerCase().includes(memberPickerSearch.toLowerCase()) ||
        (m.volunteerId && m.volunteerId.toLowerCase().includes(memberPickerSearch.toLowerCase())) ||
        (m.nationalId && m.nationalId.includes(memberPickerSearch));
      const matchesComm = memberPickerCommFilter === 'all' || m.currentCommitteeId === memberPickerCommFilter;
      return matchesSearch && matchesComm;
    });
  }, [members, scannedAttendanceRecords, memberPickerSearch, memberPickerCommFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in text-right">
      <div className="w-full max-w-6xl glass-card border border-amber-500/30 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/60 via-slate-900 to-blue-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  منظومة تقييم الحاضرين بالفعالية (المعايير المعتمدة 100 درجة)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 font-mono">
                  {totalEvaluatedCount} من {scannedAttendanceRecords.length} تم تقييمهم
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تقييم المتطوعين الحاضرين بمسح الباركود، رصد الدرجات الـ 4، وإرسال التقييم الشخصي فوراً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddMemberPicker(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة متطوع يدوياً</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>تصدير Excel 📊</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Event Selector & Filter Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          
          {/* Linked Event Selector */}
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-bold shrink-0">الفعالية / اليوم الميداني:</span>
            <select
              value={selectedEventFilter}
              onChange={e => setSelectedEventFilter(e.target.value)}
              className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-bold w-full focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">🌐 كل الفعاليات وجلسات اليوم ({scannedAttendanceRecords.length} حاضر مسجل)</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.date === todayStr ? '✨ [اليوم] ' : ''}{ev.name} ({ev.date}) — {ev.location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-xs">عرض:</span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEvalFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${evalFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                الكل ({scannedAttendanceRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setEvalFilter('pending')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${evalFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                بانتظار التقييم ({scannedAttendanceRecords.length - totalEvaluatedCount})
              </button>
              <button
                type="button"
                onClick={() => setEvalFilter('evaluated')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${evalFilter === 'evaluated' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
              >
                المقيّمون ({totalEvaluatedCount})
              </button>
            </div>
          </div>

        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Attendees List Column (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5 flex flex-col max-h-[560px]">
            
            {/* Search Header */}
            <div className="space-y-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث في الحاضرين بالاسم أو الكود..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={committeeFilter}
                onChange={e => setCommitteeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">كل اللجان ({displayRecords.length})</option>
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* List of Attendees */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 custom-scrollbar">
              {displayRecords.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 my-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">لا يوجد متطوعين مسجلين حضوراً بالكود</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                      بمجرد عمل مسح (Scan) لكود الحضور سيظهر المتطوع هنا، أو أضفه يدوياً للتقييم الفوري.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMemberPicker(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ إضافة متطوع يدوياً</span>
                  </button>
                </div>
              ) : (
                displayRecords.map(rec => {
                  const isSelected = currentSelectedRecord?.id === rec.id;
                  const isEvaluated = Boolean(rec.dailyEvaluation);
                  const memObj = members.find(m => m.id === rec.memberId || m.volunteerId === rec.memberVolunteerId);

                  return (
                    <div
                      key={rec.id}
                      onClick={() => handleSelectRecord(rec)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                          : isEvaluated
                          ? 'bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500/60'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={rec.memberAvatar || memObj?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop'}
                            alt={rec.memberName}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          {isEvaluated && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{rec.memberName}</h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {rec.committeeName} • {rec.memberVolunteerId || memObj?.volunteerId || 'عضو'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              {rec.checkInTime || 'حاضر'}
                            </span>
                            {rec.checkOutTime && (
                              <span className="flex items-center gap-0.5">
                                <LogOut className="w-3 h-3 text-blue-400" />
                                {rec.checkOutTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        {isEvaluated ? (
                          <div className="flex flex-col items-end">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                              {rec.dailyEvaluation?.totalDailyScore || 100}/100
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                              تقدير {rec.dailyEvaluation?.overallGrade || 'A'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                            بانتظار التقييم
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Evaluation Form Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {currentSelectedRecord ? (
              <form onSubmit={handleSaveEvaluation} className="space-y-4 flex flex-col h-full justify-between">
                
                {/* Volunteer Quick Info Banner */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={currentSelectedRecord.memberAvatar || currentMember?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop'}
                      alt={currentSelectedRecord.memberName}
                      className="w-13 h-13 rounded-xl object-cover border-2 border-amber-400/50 shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{currentSelectedRecord.memberName}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {currentMember?.position || currentMember?.role || 'عضو متطوع'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 truncate">
                        الرقم القومي: <span className="font-mono text-amber-300 font-bold">{currentMember?.nationalId || 'ميداني موثق'}</span> | الكود: <span className="font-mono text-cyan-300">{currentSelectedRecord.memberVolunteerId || currentMember?.volunteerId}</span>
                      </p>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span>اللجنة: <strong className="text-white">{currentSelectedRecord.committeeName}</strong></span>
                        <span>•</span>
                        <span>الحضور: <strong className="text-emerald-400 font-mono">{currentSelectedRecord.checkInTime || '—'}</strong></span>
                        {currentSelectedRecord.checkOutTime && (
                          <>
                            <span>•</span>
                            <span>الانصراف: <strong className="text-blue-400 font-mono">{currentSelectedRecord.checkOutTime}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span>المدة: <strong className="text-purple-300 font-mono">{currentSelectedRecord.durationFormatted || 'حاضر'}</strong></span>
                      </div>

                      {/* GPS Location & Map verification */}
                      {currentSelectedRecord.gpsLocation && (
                        <div className="flex items-center gap-2 text-[10px] text-emerald-300 mt-1">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-mono">
                            {currentSelectedRecord.gpsLocation.address || `GPS: ${currentSelectedRecord.gpsLocation.lat.toFixed(4)}, ${currentSelectedRecord.gpsLocation.lng.toFixed(4)}`}
                          </span>
                          {currentSelectedRecord.gpsLocation.mapsUrl && (
                            <a
                              href={currentSelectedRecord.gpsLocation.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:text-sky-300 underline font-bold"
                            >
                              (خرائط Google ↗)
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold ml-1">تطبيق سريع:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('all_A')}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 cursor-pointer transition-all"
                    >
                      A كامل (100)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('all_B')}
                      className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold border border-blue-500/30 cursor-pointer transition-all"
                    >
                      B نصف (50)
                    </button>
                  </div>
                </div>

                {/* 4 Criteria Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EVAL_CRITERIA_CONFIG.map((crit, idx) => {
                    const currentVal = scores[crit.key] ?? crit.maxScore;
                    const currentGrade = grades[crit.key] || 'A';

                    return (
                      <div 
                        key={crit.key}
                        className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 p-3 rounded-xl space-y-2.5 transition-all"
                      >
                        {/* Criterion Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-white">{crit.title}</h5>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{crit.description}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={crit.maxScore}
                              step="0.5"
                              value={currentVal}
                              onChange={e => handleSetCustomScore(crit.key, parseFloat(e.target.value), crit.maxScore)}
                              className="w-12 bg-transparent text-center text-xs font-bold font-mono text-amber-400 focus:outline-none"
                            />
                            <span className="text-slate-500 text-[10px] font-bold">/ {crit.maxScore}</span>
                          </div>
                        </div>

                        {/* Grade Buttons A / B / C */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['A', 'B', 'C'] as const).map(gradeKey => {
                            const gradeObj = crit.grades[gradeKey];
                            const isSelected = currentGrade === gradeKey;

                            return (
                              <button
                                key={gradeKey}
                                type="button"
                                onClick={() => handleSetCriterionGrade(crit.key, gradeKey, gradeObj.score)}
                                className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                                  isSelected
                                    ? gradeKey === 'A'
                                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                                      : gradeKey === 'B'
                                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 font-bold'
                                      : 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                                }`}
                              >
                                <div className="text-xs font-bold">{gradeKey}</div>
                                <div className="text-[10px] opacity-80 font-mono">{gradeObj.score} د ({gradeObj.pct})</div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Individual criterion note */}
                        <input
                          type="text"
                          value={criteriaNotes[crit.key] || ''}
                          onChange={e => setCriteriaNotes(prev => ({ ...prev, [crit.key]: e.target.value }))}
                          placeholder={`ملاحظة اختيارية حول ${crit.title}...`}
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Extra Bonus Points Card (+بونص مع ذكر السبب) */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">إضافة بونص ودرجات إضافية للمتطوع (اختياري):</span>
                        <span className="text-[10px] text-slate-400">تمنح للمبادرات الاستثنائية والمساعدة في التنظيم خارج نطاق المهام</span>
                      </div>
                    </div>

                    {/* Quick Bonus Chips */}
                    <div className="flex items-center gap-1">
                      {[0, 3, 5, 10, 15].map(bVal => (
                        <button
                          key={bVal}
                          type="button"
                          onClick={() => setBonusPoints(bVal)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                            bonusPoints === bVal 
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md' 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          +{bVal}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={bonusPoints}
                        onChange={e => setBonusPoints(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 bg-slate-950 border border-purple-500/40 rounded-md px-1 py-0.5 text-center text-xs font-mono font-bold text-purple-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bonus Reason Input */}
                  <input
                    type="text"
                    value={bonusReason}
                    onChange={e => setBonusReason(e.target.value)}
                    placeholder="سبب منح البونص (مثال: مبادرة تطوعية، تنظيم القاعة، إنجاز مهام إضافية...)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Score Summary & General Notes Banner */}
                <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* General Notes Input (7 cols) */}
                  <div className="sm:col-span-7 space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>الملاحظات والتوجيهات العامة للمتطوع:</span>
                    </label>
                    <input
                      type="text"
                      value={generalNotes}
                      onChange={e => setGeneralNotes(e.target.value)}
                      placeholder="اكتب توجيهاً أو إشادة بالمتطوع (ستظهر له في الإشعار)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Bonus XP selector (2 cols) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>مكافأة XP:</span>
                    </label>
                    <select
                      value={bonusXP}
                      onChange={e => setBonusXP(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={10}>+10 XP</option>
                      <option value={15}>+15 XP (قياسي)</option>
                      <option value={25}>+25 XP (متميز)</option>
                      <option value={40}>+40 XP (استثنائي)</option>
                    </select>
                  </div>

                  {/* Total Live Points & Grade (3 cols) */}
                  <div className="sm:col-span-3 bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 text-center flex flex-col justify-center items-center">
                    <div className="text-[10px] text-slate-400 font-bold">
                      النتيجة الإجمالية لليوم {bonusPoints > 0 && <span className="text-purple-400 font-mono">(+{bonusPoints} بونص)</span>}
                    </div>
                    <div className="flex items-center gap-1.5 my-0.5">
                      <span className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                        {totalPoints}
                      </span>
                      <span className="text-xs text-slate-500 font-bold font-mono">/ 100</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                        overallGrade === 'A+' || overallGrade === 'A'
                          ? 'bg-emerald-500 text-slate-950'
                          : overallGrade === 'B'
                          ? 'bg-blue-500 text-white'
                          : overallGrade === 'C'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-red-500 text-white'
                      }`}>
                        {overallGrade}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {percentage}% ({overallGrade === 'A+' ? 'ممتاز مرتفع' : overallGrade === 'A' ? 'ممتاز' : overallGrade === 'B' ? 'جيد جداً' : overallGrade === 'C' ? 'مقبول' : 'بحاجة تحسين'})
                    </div>
                  </div>

                </div>

                {/* Save and Submit Button */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    المقيّم: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.position || currentUser.role})
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>حفظ واعتماد تقييم المتطوع ({totalPoints}/100) وإرسال الإشعار ✓</span>
                  </button>
                </div>

              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">اختر متطوعاً من قائمة الحاضرين للتقييم</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  انقر على أي متطوع من القائمة الجانبية أو اضغط على زر "إضافة متطوع يدوياً" لإدخال عضو جديد وتقييم أدائه الميداني.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddMemberPicker(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ إضافة متطوع يدوياً للتقييم الآن</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Manual Member Add Popup Modal */}
      {showAddMemberPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">إضافة متطوع يدوياً لقائمة التقييم</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberPicker(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-2 border-b border-slate-800 bg-slate-950/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberPickerSearch}
                  onChange={e => setMemberPickerSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الرقم القومي، أو الكود التطوعي..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={memberPickerCommFilter}
                onChange={e => setMemberPickerCommFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">كل اللجان ({candidateMembers.length} عضو متاح)</option>
                {committees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-2 max-h-96 custom-scrollbar">
              {candidateMembers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لا يوجد متطوعين مطابقين للبحث أو أن جميع المتطوعين مسجلون بالفعل.
                </div>
              ) : (
                candidateMembers.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleAddMemberManually(m)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop'}
                        alt={m.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{m.fullName}</h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {m.currentCommitteeName} • <span className="font-mono text-cyan-300">{m.volunteerId}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          الرقم القومي: {m.nationalId || '—'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 hover:bg-amber-400 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>إضافة وتقييم</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowAddMemberPicker(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
