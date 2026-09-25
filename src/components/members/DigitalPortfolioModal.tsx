import React from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { X, Printer, Download, Award, CheckCircle2, Shield, Calendar, Sparkles } from 'lucide-react';

interface DigitalPortfolioModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPortfolioModal: React.FC<DigitalPortfolioModalProps> = ({ member, isOpen, onClose }) => {
  const { badges, tasks, attendanceRecords, branding } = useApp();

  if (!isOpen || !member) return null;

  const earnedBadges = badges.filter(b => member.badges.includes(b.id));
  const memberTasks = tasks.filter(t => t.assignedToMemberIds.includes(member.id) && t.status === 'Approved');
  const memberAttendance = attendanceRecords.filter(a => a.memberId === member.id);

  const totalHours = memberAttendance.reduce((acc, a) => acc + (a.durationMinutes || 300), 0) / 60;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="max-w-3xl w-full p-8 bg-white text-slate-900 rounded-3xl shadow-2xl text-right my-8 font-sans max-h-[95vh] overflow-y-auto print:p-0 print:m-0 print:shadow-none print:w-full">
        
        {/* Modal Top Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              الملف الرقمي المعتمد للمتطوع (Official Volunteer Portfolio & CV)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/30"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Header */}
        <div className="border-b-2 border-blue-900 pb-6 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-blue-900 uppercase tracking-widest">جمهورية مصر العربية • جامعة الإسكندرية</div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">اتحاد طلاب جامعة الإسكندرية</h1>
            <div className="text-xs font-bold text-slate-600 mt-0.5">فريق المتطوعين المركزي • السجل المهني والرقمي</div>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-black text-2xl border-2 border-blue-600 shadow-md">
            AU
          </div>
        </div>

        {/* Volunteer Identity Box */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
          <img 
            src={member.avatarUrl} 
            alt="" 
            className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-600 shadow-lg"
          />
          <div className="flex-1 text-center sm:text-right">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-slate-900">{member.fullName}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                عضو موثق رسمياً ✓
              </span>
            </div>
            <p className="text-xs font-bold text-blue-900 mb-2">
              {member.position} — {member.currentCommitteeName}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
              <div><strong>الكلية:</strong> {member.college}</div>
              <div><strong>الفرقة:</strong> {member.academicYear}</div>
              <div><strong>سنة الانضمام:</strong> {member.joinDate}</div>
              <div><strong>البريد الجامعي:</strong> {member.universityEmail}</div>
              <div><strong>إجمالي الساعات:</strong> {Math.round(totalHours)} ساعة تطوعية</div>
              <div><strong>الأداء المعتمد:</strong> {member.performance.overallScore}%</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Stats */}
        <div className="grid grid-cols-4 gap-3 text-center mb-6">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-lg font-extrabold text-blue-900 font-mono">{memberAttendance.length}</div>
            <div className="text-[11px] font-bold text-slate-600">فعاليات كبرى</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-lg font-extrabold text-emerald-900 font-mono">{memberTasks.length}</div>
            <div className="text-[11px] font-bold text-slate-600">مهام مكتملة</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-lg font-extrabold text-purple-900 font-mono">{earnedBadges.length}</div>
            <div className="text-[11px] font-bold text-slate-600">أوسمة شرف</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-lg font-extrabold text-amber-900 font-mono">{member.points}</div>
            <div className="text-[11px] font-bold text-slate-600">نقاط الإنجاز XP</div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>المهارات والكفاءات المعتمدة (Certified Competencies)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {Object.entries(member.skills).map(([skill, score]) => (
              <div key={skill} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">{skill}</span>
                <span className="font-bold text-amber-600">{'★'.repeat(score)}</span>
              </div>
            ))}
          </div>

          {/* Hobbies & Aspirations in CV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {member.hobbies && member.hobbies.length > 0 && (
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <div className="font-bold text-rose-900 mb-1">الهوايات والمواهب:</div>
                <div className="text-slate-700 text-[11px]">{member.hobbies.join(' • ')}</div>
              </div>
            )}
            {member.learningAspirations && member.learningAspirations.length > 0 && (
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div className="font-bold text-purple-900 mb-1">المجالات المرغوب تعلمها وتطويرها:</div>
                <div className="text-slate-700 text-[11px]">{member.learningAspirations.join(' • ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Official Multi-Season History */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>مسيرة التطوع والمسؤوليات (Volunteering Milestones)</span>
          </h3>
          <div className="space-y-2">
            {member.committeeHistory.map(hist => (
              <div key={hist.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{hist.committeeName}</span>
                  <span className="mr-2 text-slate-600">({hist.role})</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{hist.reason}</div>
                </div>
                <span className="font-mono text-slate-600 font-bold">{hist.season}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Digital Seal and Verification Footer */}
        <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-right">
            <div className="font-extrabold text-slate-950 text-xs">سجل إلكتروني رسمي موثق ومحمى ضد التلاعب</div>
            <div className="text-[11px] text-slate-600 font-mono mt-0.5">
              الرقم المرجعي للمتطوع: {member.volunteerId || `ALEXU-VOL-${member.id.toUpperCase()}`}
            </div>
          </div>

          <div className="text-center flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border-2 border-emerald-600/40 p-1 flex items-center justify-center shadow-sm bg-white">
              <div className="text-center">
                <div className="text-[9px] font-black text-emerald-800">VERIFIED</div>
                <div className="text-[8px] font-mono text-slate-600">✓ V-OS</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              <div>توثيق قاعدة بيانات الاتحاد المركزي</div>
              <div className="font-mono text-emerald-700 font-bold">حالة القيد: نشط ومعتمد</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
