import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, DailySessionEvaluation } from '../../types';
import { 
  Award, Star, CheckCircle2, X, Sparkles, 
  MapPin, Clock, ShieldCheck, Download, User, ThumbsUp 
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
    showNotification 
  } = useApp();

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [attScore, setAttScore] = useState<number>(10);
  const [partScore, setPartScore] = useState<number>(10);
  const [commitScore, setCommitScore] = useState<number>(10);
  const [bonusXP, setBonusXP] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Filter records for today or selected session (excluding High Leadership)
  const todayStr = new Date().toISOString().split('T')[0];
  const recordsToEvaluate = attendanceRecords.filter(r => {
    const mem = members.find(m => m.id === r.memberId);
    if (mem && mem.role !== 'member' && mem.role !== 'head' && mem.role !== 'vice_head') {
      return false; // Exclude high leadership from evaluations
    }
    if (selectedSessionId) return r.sessionId === selectedSessionId;
    return r.date === todayStr || true; // Show latest attendees
  });

  const activeRecord = attendanceRecords.find(r => r.id === selectedRecordId) || recordsToEvaluate[0];

  const handleOpenEvaluate = (record: AttendanceRecord) => {
    setSelectedRecordId(record.id);
    if (record.dailyEvaluation) {
      setAttScore(record.dailyEvaluation.attendanceScore || 10);
      setPartScore(record.dailyEvaluation.participationScore || 10);
      setCommitScore(record.dailyEvaluation.commitmentScore || 10);
      setBonusXP(record.dailyEvaluation.bonusXP || 10);
      setNotes(record.dailyEvaluation.notes || '');
    } else {
      setAttScore(10);
      setPartScore(10);
      setCommitScore(10);
      setBonusXP(10);
      setNotes('أداء وانضباط ممتاز خلال الجلسة');
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

    // Move to next unevaluated record if any
    const unevaluated = recordsToEvaluate.filter(r => r.id !== activeRecord.id && !r.dailyEvaluation);
    if (unevaluated.length > 0) {
      handleOpenEvaluate(unevaluated[0]);
    }
  };

  const handleExportToday = () => {
    exportAttendanceToExcel(recordsToEvaluate, `تقييمات_جلسة_${todayStr}`);
    showNotification('success', 'تم تصدير شيت تقييمات الحضور إلى Excel بنجاح');
  };

  const totalPoints = attScore + partScore + commitScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl glass-card border border-amber-500/30 bg-slate-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-slate-900 to-blue-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تقييمات جلسة اليوم الميدانية وسحب الشيت
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                  {recordsToEvaluate.length} حاضرين
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تقييم المتطوعين الحاضرين بنقاط تفاعل والتزام ومنح نقاط XP فورية وتصدير شيت Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportToday}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
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
          <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <div className="text-xs font-bold text-slate-400 px-1 mb-1">
              قائمة المتطوعين الحاضرين ({recordsToEvaluate.length}):
            </div>

            {recordsToEvaluate.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl">
                لا توجد تسجيلات حضور في هذه الجلسة حتى الآن.
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={record.memberAvatar}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">
                            {record.memberName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {record.memberVolunteerId || record.committeeName}
                          </div>
                        </div>
                      </div>

                      {isEvaluated ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{record.dailyEvaluation?.totalDailyScore}/30</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                          بانتظار التقييم
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>دخول: {record.checkInTime}</span>
                      </span>
                      {record.gpsLocation && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="w-3 h-3" />
                          <span>GPS مؤكد ✓</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Evaluation Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            {activeRecord ? (
              <form onSubmit={handleSaveEvaluation} className="space-y-4">
                
                {/* Active Member Header Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeRecord.memberAvatar}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{activeRecord.memberName}</h4>
                        <span className="px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                          {activeRecord.memberVolunteerId || 'عضو'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeRecord.committeeName} • جلسة: {activeRecord.eventName}
                      </p>
                    </div>
                  </div>

                  {activeRecord.gpsLocation && (
                    <div className="text-left text-[10px] bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30 text-emerald-300">
                      <div className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>موقع الـ GPS:</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-300">
                        {activeRecord.gpsLocation.lat.toFixed(4)}, {activeRecord.gpsLocation.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rubric Sliders */}
                <div className="space-y-3 pt-1">
                  
                  {/* 1. Attendance & Punctuality */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-slate-200">1. الحضور والانضباط بالمواعيد:</span>
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
                      <span className="font-bold text-slate-200">2. التفاعل والمبادرة والمشاركة:</span>
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
                      <span className="font-bold text-slate-200">3. جودة التنفيذ الميداني والتعاون:</span>
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
                        نقاط إضافية (Bonus XP):
                      </label>
                      <select
                        value={bonusXP}
                        onChange={e => setBonusXP(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                      >
                        <option value={0}>0 XP إضافي</option>
                        <option value={10}>+10 XP (مجهود مميز)</option>
                        <option value={20}>+20 XP (أداء استثنائي)</option>
                        <option value={30}>+30 XP (بطل الجلسة 🌟)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        مجموع درجات اليوم:
                      </label>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">المجموع النهائي:</span>
                        <span className="text-amber-400 font-black text-sm font-mono">{totalPoints} / 30</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ملاحظات وتوجيهات الهيد للمتطوع:
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="كلمة تشجيعية أو توجيه ميداني..."
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
                    <span>حفظ تقييم اليوم واعتماد زيادة نقاط الـ XP للمتطوع</span>
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
