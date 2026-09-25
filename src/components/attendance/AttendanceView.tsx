import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord } from '../../types';
import { 
  QrCode, Search, Filter, Download, Clock, UserCheck, 
  Calendar, CheckCircle2, UserX, AlertCircle, Plus, 
  Shield, Check, User, MapPin, Award, Trash2, Sparkles, Star
} from 'lucide-react';
import { exportAttendanceToExcel } from '../../utils/excelExport';
import { DailyEvaluationModal } from './DailyEvaluationModal';

interface AttendanceViewProps {
  onOpenQRModal: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenQRModal }) => {
  const { 
    attendanceRecords, 
    committees, 
    events, 
    members, 
    manualRecordAttendance, 
    deleteAttendanceRecord,
    canCreateAttendanceSession,
    isHighLeadership,
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [isDailyEvalModalOpen, setIsDailyEvalModalOpen] = useState(false);

  // Manual record modal form
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualEventId, setManualEventId] = useState('');
  const [manualCheckIn, setManualCheckIn] = useState('09:00 ص');
  const [manualCheckOut, setManualCheckOut] = useState('03:30 م');
  const [manualHours, setManualHours] = useState(6.5);
  const [manualStatus, setManualStatus] = useState<'Present' | 'Late' | 'Excused'>('Present');

  const isMember = currentUser?.role === 'member';

  // Filtered records
  const allFilteredRecords = attendanceRecords.filter(r => {
    const mem = members.find(m => m.id === r.memberId);
    const volId = mem?.volunteerId || '';
    const matchesQuery = 
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesComm = selectedCommittee === 'all' || r.committeeId === selectedCommittee;
    const matchesEvt = selectedEvent === 'all' || r.eventId === selectedEvent;

    return matchesQuery && matchesComm && matchesEvt;
  });

  const filteredRecords = isMember
    ? allFilteredRecords.filter(r => r.memberId === currentUser.id)
    : allFilteredRecords;

  const handleExportExcel = () => {
    const commName = selectedCommittee === 'all' 
      ? 'جميع_اللجان' 
      : (committees.find(c => c.id === selectedCommittee)?.name || 'لجنة');
    exportAttendanceToExcel(filteredRecords, commName);
  };

  const handleSaveManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMemberId) {
      alert('يرجى اختيار المتطوع أولاً');
      return;
    }

    const selectedEvtObj = events.find(ev => ev.id === manualEventId) || events[0];

    manualRecordAttendance({
      memberId: manualMemberId,
      eventId: selectedEvtObj?.id || 'event-manual',
      eventName: selectedEvtObj?.name || 'حضور ميداني',
      checkInTime: manualCheckIn,
      checkOutTime: manualCheckOut,
      durationMinutes: Math.round(manualHours * 60),
      durationFormatted: `${manualHours} ساعة`,
      status: manualStatus
    });

    setShowManualModal(false);
    setManualMemberId('');
  };

  // KPI calculations based on view context
  const myOrAllRecords = isMember 
    ? attendanceRecords.filter(r => r.memberId === currentUser.id)
    : attendanceRecords;

  const presentCount = myOrAllRecords.filter(r => r.status === 'Present').length;
  const checkedOutCount = myOrAllRecords.filter(r => !!r.checkOutTime).length;
  const totalLoggedHours = myOrAllRecords.reduce((acc, curr) => acc + (curr.durationMinutes || 300), 0) / 60;
  const canManage = canCreateAttendanceSession || isHighLeadership;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* 1. Header & Quick Actions */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-blue-500/30 text-right">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-end md:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              {isMember ? 'سجل حضوري وساعاتي الميدانية' : 'نظام الحضور والانصراف الميداني المعتمد والـ GPS'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>{isMember ? 'سجل الحضور والغياب الخاص بي' : 'سجلات الحضور وتوقيتات الدخول والانصراف'}</span>
            <Clock className="w-6 h-6 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isMember 
              ? 'متابعة سجل حضورك الميداني، الساعات المعتمدة، التقييمات اليومية، ومسح كود الـ QR عند الدخول'
              : 'توثيق دقيق لساعات العمل الميداني، إحداثيات الـ GPS، تقييمات اليوم من الهيد، وسحب ملفات Excel المعتمدة'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {canManage && (
            <button
              onClick={handleExportExcel}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel (.xlsx)</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setIsDailyEvalModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>تقييمات جلسة اليوم</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setShowManualModal(true)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>تسجيل يدوي</span>
            </button>
          )}

          <button
            onClick={onOpenQRModal}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <QrCode className="w-4 h-4" />
            <span>{isMember ? '📷 مسح كود الحضور (QR Scanner)' : 'كود الـ QR والمسح المباشر'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
        <div className="glass-card p-4 border-blue-500/20 bg-blue-950/10">
          <span className="text-[11px] text-slate-400">{isMember ? 'جلساتي المسجلة' : 'إجمالي السجلات المسجلة'}</span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{myOrAllRecords.length}</p>
          <span className="text-[10px] text-blue-400">سجل موثق بالنظام</span>
        </div>

        <div className="glass-card p-4 border-emerald-500/20 bg-emerald-950/10">
          <span className="text-[11px] text-slate-400">مرات الحضور (Present)</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{presentCount}</p>
          <span className="text-[10px] text-emerald-300">نسبة الالتزام الممتازة</span>
        </div>

        <div className="glass-card p-4 border-sky-500/20 bg-sky-950/10">
          <span className="text-[11px] text-slate-400">تسجيلات الانصراف</span>
          <p className="text-xl sm:text-2xl font-black text-sky-400 mt-1">{checkedOutCount}</p>
          <span className="text-[10px] text-sky-300">مكتمل الساعات</span>
        </div>

        <div className="glass-card p-4 border-amber-500/20 bg-amber-950/10">
          <span className="text-[11px] text-slate-400">{isMember ? 'ساعاتي المعتمدة' : 'إجمالي الساعات الميدانية'}</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{totalLoggedHours.toFixed(1)}</p>
          <span className="text-[10px] text-amber-300">ساعة عمل تطوعي</span>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-right">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم التطوعي (OC-..)، أو الفعالية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input text-xs pr-9 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="all">جميع اللجان</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="all">جميع الفعاليات</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Attendance Records Table */}
      <div className="glass-card p-5 text-right">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 pb-2">
                <th className="py-2.5 font-bold">الرقم التطوعي</th>
                <th className="py-2.5 font-bold">المتطوع</th>
                <th className="py-2.5 font-bold">اللجنة</th>
                <th className="py-2.5 font-bold">الفعالية / الجلسة</th>
                <th className="py-2.5 font-bold">التاريخ</th>
                <th className="py-2.5 font-bold text-emerald-400">تسجيل الحضور (Check-in)</th>
                <th className="py-2.5 font-bold text-sky-400">تسجيل الانصراف (Check-out)</th>
                <th className="py-2.5 font-bold">موقع الـ GPS</th>
                <th className="py-2.5 font-bold">تقييم اليوم</th>
                <th className="py-2.5 font-bold">الحالة</th>
                {canManage && <th className="py-2.5 font-bold text-center">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400 text-xs">
                    لا توجد سجلات تطابق خيارات البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const memberObj = members.find(m => m.id === record.memberId);
                  const volId = record.memberVolunteerId || memberObj?.volunteerId || record.memberId;

                  return (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-mono text-sky-400 font-bold text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/30">
                          {volId}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={record.memberAvatar || memberObj?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={record.memberName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <span className="font-bold text-white">{record.memberName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-300">{record.committeeName}</td>
                      <td className="py-3 text-slate-200 font-medium">{record.eventName}</td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">{record.date}</td>
                      
                      <td className="py-3 font-mono font-bold text-emerald-400">
                        {record.checkInTime || '—'}
                      </td>
                      <td className="py-3 font-mono font-bold text-sky-400">
                        {record.checkOutTime || (
                          <span className="text-[10px] text-amber-400 font-normal bg-amber-500/10 px-2 py-0.5 rounded">
                            متواجد بالموقع ⏳
                          </span>
                        )}
                      </td>

                      {/* GPS Location Column */}
                      <td className="py-3">
                        {record.gpsLocation ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1 w-fit" title={`${record.gpsLocation.lat}, ${record.gpsLocation.lng}`}>
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span>GPS مؤكد ✓</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">جامعة الإسكندرية</span>
                        )}
                      </td>

                      {/* Daily Evaluation Score Column */}
                      <td className="py-3">
                        {record.dailyEvaluation ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{record.dailyEvaluation.totalDailyScore}/30 (+{record.dailyEvaluation.bonusXP} XP)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">لم يقيم بعد</span>
                        )}
                      </td>

                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          record.status === 'Late' ? 'bg-amber-500/20 text-amber-300' :
                          record.status === 'Excused' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {record.status === 'Present' ? 'حاضر ✓' :
                           record.status === 'Late' ? 'متأخر' :
                           record.status === 'Excused' ? 'معتذر' : 'غائب'}
                        </span>
                      </td>

                      {canManage && (
                        <td className="py-3 text-center">
                          <button
                            onClick={() => deleteAttendanceRecord(record.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="حذف هذا السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 border border-blue-500/40 bg-slate-950 text-right">
            <h3 className="text-base font-bold text-white mb-1">تسجيل حضور / انصراف يدوي</h3>
            <p className="text-xs text-slate-400 mb-4">تسجيل معتمد من قِبل المشرف الميداني للفعالية</p>

            <form onSubmit={handleSaveManualRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">اختيار المتطوع *</label>
                <select
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  className="glass-input w-full text-xs"
                  required
                >
                  <option value="">-- اختر المتطوع --</option>
                  {members.filter(m => m.role === 'member' || m.role === 'head' || m.role === 'vice_head').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.volunteerId || m.id}) - {m.currentCommitteeName} ({m.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">الفعالية أو اليوم الميداني *</label>
                <select
                  value={manualEventId}
                  onChange={(e) => setManualEventId(e.target.value)}
                  className="glass-input w-full text-xs"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">وقت تسجيل الحضور</label>
                  <input
                    type="text"
                    value={manualCheckIn}
                    onChange={(e) => setManualCheckIn(e.target.value)}
                    className="glass-input w-full text-xs font-mono"
                    placeholder="09:00 ص"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">وقت تسجيل الانصراف</label>
                  <input
                    type="text"
                    value={manualCheckOut}
                    onChange={(e) => setManualCheckOut(e.target.value)}
                    className="glass-input w-full text-xs font-mono"
                    placeholder="03:30 م"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">إجمالي الساعات</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    className="glass-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الحالة</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as any)}
                    className="glass-input w-full text-xs"
                  >
                    <option value="Present">حاضر (Present)</option>
                    <option value="Late">متأخر (Late)</option>
                    <option value="Excused">معتذر بعذر (Excused)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-5 cursor-pointer shadow-lg"
                >
                  حفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Evaluation Modal */}
      <DailyEvaluationModal
        isOpen={isDailyEvalModalOpen}
        onClose={() => setIsDailyEvalModalOpen(false)}
      />

    </div>
  );
};
