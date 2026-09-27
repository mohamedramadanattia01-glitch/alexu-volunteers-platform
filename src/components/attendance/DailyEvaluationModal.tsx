import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { 
  Award, Star, CheckCircle2, X, Sparkles, 
  MapPin, Clock, ShieldCheck, Download, User, ThumbsUp,
  Search, Filter, Check, LogIn, LogOut, Navigation, FileSpreadsheet
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
    submitDailyAttendanceEvaluation, 
    currentUser, 
    members,
    committees,
    showNotification 
  } = useApp();

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [evalFilter, setEvalFilter] = useState<'all' | 'pending' | 'evaluated'>('all');

  const [attScore, setAttScore] = useState<number>(10);
  const [partScore, setPartScore] = useState<number>(10);
  const [commitScore, setCommitScore] = useState<number>(10);
  const [bonusXP, setBonusXP] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Base records for session or today
  const sessionRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      const mem = members.find(m => m.id === r.memberId);
      if (mem && mem.role !== 'member' && mem.role !== 'head' && mem.role !== 'vice_head') {
        return false; // Exclude high leadership from evaluations
      }
      if (selectedSessionId) {
        return r.sessionId === selectedSessionId || r.date === todayStr;
      }
      return r.date === todayStr || true;
    });
  }, [attendanceRecords, members, selectedSessionId, todayStr]);

  // Filtered by search, committee, and eval status
  const recordsToEvaluate = useMemo(() => {
    return sessionRecords.filter(r => {
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
  }, [sessionRecords, searchQuery, committeeFilter, evalFilter]);

  const activeRecord = attendanceRecords.find(r => r.id === selectedRecordId) || recordsToEvaluate[0] || sessionRecords[0];

  const handleOpenEvaluate = (record: AttendanceRecord) => {
    setSelectedRecordId(record.id);
    if (record.dailyEvaluation) {
      setAttScore(record.dailyEvaluation.attendanceScore ?? 10);
      setPartScore(record.dailyEvaluation.participationScore ?? 10);
      setCommitScore(record.dailyEvaluation.commitmentScore ?? 10);
      setBonusXP(record.dailyEvaluation.bonusXP ?? 10);
      setNotes(record.dailyEvaluation.notes || '');
    } else {
      setAttScore(10);
      setPartScore(10);
      setCommitScore(10);
      setBonusXP(10);
      setNotes('أداء وانضباط ممتاز خلال الجلسة الميدانية');
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    submitDailyAttendanceEvaluation(activeRecord.id, {
      attendanceScore: attScore,
      participationScore: partScore,
      commitmentScore: commitScore,
      bonusXP,
      notes
    });

    // Auto-advance to next unevaluated record if any
    const remainingUnevaluated = recordsToEvaluate.filter(r => r.id !== activeRecord.id && !r.dailyEvaluation);
    if (remainingUnevaluated.length > 0) {
      handleOpenEvaluate(remainingUnevaluated[0]);
    }
  };

  const handleExportToday = () => {
    exportAttendanceToExcel(sessionRecords, `تقييمات_جلسة_${todayStr}`);
    showNotification('success', 'تم تصدير شيت تقييمات الحضور إلى Excel بنجاح 📊');
  };

  const totalPoints = attScore + partScore + commitScore;
  const percentage = Math.round((totalPoints / 30) * 100);
  const totalEvaluatedCount = sessionRecords.filter(r => Boolean(r.dailyEvaluation)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in text-right">
      <div className="w-full max-w-5xl glass-card border border-amber-500/30 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/50 via-slate-900 to-blue-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تقييمات جلسة اليوم الميدانية وسحب شيت الـ Excel
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 font-mono">
                  {totalEvaluatedCount} / {sessionRecords.length} تم تقييمهم
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تقييم المتطوعين الحاضرين بالدرجات والملاحظات وإرسال إشعار فوري وزيادة نقاط الـ XP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleExportToday}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>سحب شيت Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Attendees List Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col max-h-[560px]">
            
            {/* Filters Header */}
            <div className="space-y-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو كود العضو..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={committeeFilter}
                  onChange={e => setCommitteeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                >
                  <option value="all">جميع اللجان ({sessionRecords.length})</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={evalFilter}
                  onChange={e => setEvalFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                >
                  <option value="all">الكل ({sessionRecords.length})</option>
                  <option value="pending">بانتظار التقييم ({sessionRecords.length - totalEvaluatedCount})</option>
                  <option value="evaluated">تم تقييمهم ({totalEvaluatedCount})</option>
                </select>
              </div>
            </div>

            {/* Attendees Cards List */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {recordsToEvaluate.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                  لا توجد تسجيلات حضور مطابقة لهذا الفلتر.
                </div>
              ) : (
                recordsToEvaluate.map(record => {
                  const isSelected = activeRecord?.id === record.id;
                  const isEvaluated = Boolean(record.dailyEvaluation);

                  return (
                    <div
                      key={record.id}
                      onClick={() => handleOpenEvaluate(record)}
                      className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={record.memberAvatar}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">
                              {record.memberName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="text-blue-400 font-bold">{record.memberVolunteerId || 'عضو'}</span>
                              <span>•</span>
                              <span>{record.committeeName}</span>
                            </div>
                          </div>
                        </div>

                        {isEvaluated ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{record.dailyEvaluation?.totalDailyScore}/30</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30 animate-pulse">
                            بانتظار التقييم
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 gap-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-emerald-400 font-bold">🟢 دخول: {record.checkInTime}</span>
                          {record.checkOutTime ? (
                            <span className="text-purple-300 font-bold">➔ 🔴 انصراف: {record.checkOutTime}</span>
                          ) : (
                            <span className="text-amber-400 text-[9px] bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/30">⏳ بالميدان</span>
                          )}
                        </div>
                        {record.durationFormatted && (
                          <span className="text-sky-300 font-medium">⏱️ {record.durationFormatted}</span>
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
            {activeRecord ? (
              <form onSubmit={handleSaveEvaluation} className="space-y-4">
                
                {/* Active Member Header Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeRecord.memberAvatar}
                      alt=""
                      className="w-13 h-13 rounded-xl object-cover border-2 border-amber-500/40 shrink-0 shadow-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{activeRecord.memberName}</h4>
                        <span className="px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                          {activeRecord.memberVolunteerId || 'عضو'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeRecord.committeeName} • جلسة: {activeRecord.eventName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                        <span className="text-emerald-400">🟢 دخول: {activeRecord.checkInTime}</span>
                        {activeRecord.checkOutTime ? (
                          <span className="text-purple-300">| 🔴 انصراف: {activeRecord.checkOutTime} ({activeRecord.durationFormatted})</span>
                        ) : (
                          <span className="text-amber-400 text-[10px]">| متواجد بالميدان</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeRecord.gpsLocation && (
                    <div className="text-right sm:text-left text-[10px] bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-300 shrink-0">
                      <div className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>الموقع الميداني (GPS):</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-300 block mt-0.5">
                        {activeRecord.gpsLocation.address || `${activeRecord.gpsLocation.lat?.toFixed(4)}, ${activeRecord.gpsLocation.lng?.toFixed(4)}`}
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

                  {/* Bonus XP & Notes */}
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
