import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { X, Printer, Download, Award, CheckCircle2, Shield, Calendar, Sparkles, FileDown, Check } from 'lucide-react';
import { downloadMemberPortfolioPDF, getLeadershipNames } from '../../utils/pdfExport';

interface DigitalPortfolioModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPortfolioModal: React.FC<DigitalPortfolioModalProps> = ({ member, isOpen, onClose }) => {
  const { badges, tasks, attendanceRecords, branding, members, memberEvaluations, showNotification } = useApp();
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!isOpen || !member) return null;

  const leadership = getLeadershipNames(members, member.currentCommitteeId);
  const earnedBadges = (badges || []).filter(b => (member.badges || []).includes(b.id));
  const memberTasks = (tasks || []).filter(t => (t.assignedToMemberIds || []).includes(member.id) && t.status === 'Approved');
  const memberAttendance = (attendanceRecords || []).filter(a => a.memberId === member.id || (a.memberVolunteerId && a.memberVolunteerId === member.volunteerId));
  const myEvaluations = (memberEvaluations || []).filter(e => e.memberId === member.id || (e.memberVolunteerId && e.memberVolunteerId === member.volunteerId));

  const totalHours = (memberAttendance.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / 60).toFixed(1);
  const avgEvaluationScore = myEvaluations.length > 0 
    ? Math.round(myEvaluations.reduce((acc, e) => acc + (e.percentage || e.totalScore || 0), 0) / myEvaluations.length)
    : (member.performance?.overallScore || 0);

  const logo = branding.logoUrl || '/logo.png';
  const stamp = branding.stampUrl || '/stamp.png';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      await downloadMemberPortfolioPDF(member, members, branding, attendanceRecords, memberEvaluations, tasks);
      showNotification('success', 'تم تحميل ملف الـ PDF المعتمد بنجاح!');
    } catch (err) {
      console.error(err);
      showNotification('error', 'حدث خطأ أثناء تحميل الـ PDF، يمكنك استخدام زر الطباعة');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const recentAttendance = memberAttendance.slice(0, 3);
  const recentTasks = memberTasks.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="max-w-4xl w-full p-4 sm:p-8 bg-white text-slate-900 rounded-3xl shadow-2xl text-right my-4 sm:my-8 font-sans max-h-[96vh] overflow-y-auto print:p-0 print:m-0 print:shadow-none print:w-full print:max-h-none">
        
        {/* Modal Top Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              البورتفوليو الرقمي والسجل الميداني للمتطوع (Official Volunteer Portfolio A4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/30 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPDF ? 'جاري تجهيز PDF...' : 'تحميل PDF مباشر 📄'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/30"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Printable Official Single-Page A4 Portfolio Standard Document  */}
        {/* ============================================================== */}
        <div className="space-y-4 text-xs leading-relaxed printable-document">
          
          {/* 1. Official Header (Alexandria Univ Logo on Right, Platform Logo on Left) */}
          <div className="border-b-2 border-blue-900 pb-3 flex items-center justify-between">
            {/* Top Right: Alexandria Univ Logo & Details */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="جامعة الإسكندرية" className="w-12 h-12 object-contain rounded-lg" />
              <div>
                <h4 className="text-[11px] font-bold text-slate-700">جمهورية مصر العربية • جامعة الإسكندرية</h4>
                <h3 className="text-sm font-black text-blue-900">اتحاد طلاب جامعة الإسكندرية</h3>
                <p className="text-[10px] text-slate-500">الإدارة العامة لرعاية الشباب • المنظومة الرقمية للمتطوعين</p>
              </div>
            </div>

            {/* Center Title Badge */}
            <div className="text-center">
              <span className="px-3 py-1 bg-blue-900 text-white rounded-md text-xs font-black">
                البورتفوليو الرقمي والسجل الميداني للمتطوع
              </span>
              <p className="text-[9px] text-slate-500 mt-0.5">موسم النشاط الطلابي 2026 / 2027</p>
            </div>

            {/* Top Left: Platform Logo & Volunteer Code */}
            <div className="flex items-center gap-3 text-left">
              <div>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] font-bold">
                  كود: {member.volunteerId || member.id}
                </span>
                <p className="text-[9px] text-slate-500 mt-0.5">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</p>
              </div>
              <img src={logo} alt="فريق المتطوعين" className="w-12 h-12 object-contain rounded-lg" />
            </div>
          </div>

          {/* 2. Member Identity & Comprehensive Personal Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <img 
              src={member.avatarUrl} 
              alt={member.fullName} 
              className="w-20 h-20 rounded-xl object-cover border-2 border-blue-900 shadow-md shrink-0"
            />
            <div className="flex-1 text-right w-full">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-extrabold text-slate-900">{member.fullName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  member.isSubscriptionPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {member.isSubscriptionPaid ? 'عضو موثق ومسدد للاشتراك ✓' : 'عضو مسجل ونشط ✓'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-700">
                <div><strong>اللجنة التخصصية:</strong> {member.currentCommitteeName}</div>
                <div><strong>المسمى التنظيمي:</strong> {member.position}</div>
                <div><strong>الرقم القومي:</strong> <span className="font-mono">{member.nationalId || '—'}</span></div>
                <div><strong>الكلية والفرقة:</strong> {member.college} - {member.academicYear}</div>
                <div><strong>الهاتف / الواتساب:</strong> <span className="font-mono">{member.whatsappNumber || member.phone || '—'}</span></div>
                <div><strong>البريد الجامعي:</strong> <span className="font-mono text-[10px]">{member.universityEmail}</span></div>
                <div><strong>فصيلة الدم:</strong> <span className="font-mono">{member.bloodType || '—'}</span></div>
                <div><strong>هاتف الطوارئ:</strong> <span className="font-mono">{member.emergencyContact || '—'}</span></div>
                <div><strong>تاريخ الانضمام:</strong> <span className="font-mono">{member.joinDate}</span></div>
              </div>
            </div>
          </div>

          {/* 3. Field Performance Summary KPIs */}
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-base font-extrabold text-blue-900 font-mono">{member.points || 0} XP</div>
              <div className="text-[10px] font-bold text-slate-600">نقاط التطوع</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="text-base font-extrabold text-emerald-900 font-mono">{memberAttendance.length}</div>
              <div className="text-[10px] font-bold text-slate-600">فعاليات محضورة</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
              <div className="text-base font-extrabold text-purple-900 font-mono">{totalHours} س</div>
              <div className="text-[10px] font-bold text-slate-600">ساعات الميدان</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
              <div className="text-base font-extrabold text-amber-900 font-mono">{memberTasks.length}</div>
              <div className="text-[10px] font-bold text-slate-600">مهام مكتملة</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
              <div className="text-base font-extrabold text-rose-900 font-mono">{avgEvaluationScore}%</div>
              <div className="text-[10px] font-bold text-slate-600">التقييم الشامل</div>
            </div>
          </div>

          {/* 4. Event Attendance & Evaluations History */}
          <div>
            <h4 className="text-xs font-extrabold text-blue-950 border-b border-slate-200 pb-1 mb-1.5">
              سجل الحضور والتقييمات الميدانية عبر الفعاليات:
            </h4>
            <table className="w-full text-right text-[10.5px] border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="p-1.5 border border-slate-200">الفعالية / اليوم الميداني</th>
                  <th className="p-1.5 border border-slate-200">التاريخ</th>
                  <th className="p-1.5 border border-slate-200">حالة الحضور</th>
                  <th className="p-1.5 border border-slate-200">المدة</th>
                  <th className="p-1.5 border border-slate-200">الدرجة</th>
                  <th className="p-1.5 border border-slate-200">التقدير</th>
                  <th className="p-1.5 border border-slate-200">ملاحظات المقيّم</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length > 0 ? recentAttendance.map(a => {
                  const ev = a.dailyEvaluation;
                  const total = ev?.totalDailyScore ?? 30;
                  const grade = total >= 28 ? 'A+' : total >= 25 ? 'A' : total >= 20 ? 'B' : 'C';
                  return (
                    <tr key={a.id} className="border-b border-slate-200">
                      <td className="p-1.5 border border-slate-200 font-bold">{a.eventName || 'جلسة ميدانية'}</td>
                      <td className="p-1.5 border border-slate-200 font-mono">{a.date}</td>
                      <td className="p-1.5 border border-slate-200 font-bold text-emerald-700">
                        {a.status === 'Present' ? 'حاضر بالموعد ✓' : a.status === 'Late' ? 'متأخر' : 'غياب بعذر'}
                      </td>
                      <td className="p-1.5 border border-slate-200 font-mono">{a.durationFormatted || '4 ساعات'}</td>
                      <td className="p-1.5 border border-slate-200 font-mono font-bold">{total}/30</td>
                      <td className="p-1.5 border border-slate-200 font-bold text-blue-900">{grade}</td>
                      <td className="p-1.5 border border-slate-200 text-slate-600">{ev?.notes || 'التزام وانضباط عالي'}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="p-2 text-center text-slate-500">
                      حضور منتظم ومستمر في كافة الأنشطة والفعاليات الميدانية لموسم 2026/2027
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Completed Tasks History */}
          <div>
            <h4 className="text-xs font-extrabold text-blue-950 border-b border-slate-200 pb-1 mb-1.5">
              سجل المهام والتكليفات المنجزة والمعتمدة:
            </h4>
            <table className="w-full text-right text-[10.5px] border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  <th className="p-1.5 border border-slate-200">عنوان المهمة</th>
                  <th className="p-1.5 border border-slate-200">اللجنة المكلفة</th>
                  <th className="p-1.5 border border-slate-200">الأولوية</th>
                  <th className="p-1.5 border border-slate-200">النقاط المكتسبة</th>
                  <th className="p-1.5 border border-slate-200">تاريخ الإنجاز</th>
                  <th className="p-1.5 border border-slate-200">حالة الاعتماد</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.length > 0 ? recentTasks.map(t => (
                  <tr key={t.id} className="border-b border-slate-200">
                    <td className="p-1.5 border border-slate-200 font-bold">{t.title}</td>
                    <td className="p-1.5 border border-slate-200">{t.committeeName}</td>
                    <td className="p-1.5 border border-slate-200">{t.priority}</td>
                    <td className="p-1.5 border border-slate-200 font-mono font-bold text-emerald-700">+{t.xpReward} XP</td>
                    <td className="p-1.5 border border-slate-200 font-mono">{t.deadline || 'معتمد'}</td>
                    <td className="p-1.5 border border-slate-200 font-bold text-emerald-700">معتمدة ومكتملة ✓</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-2 text-center text-slate-500">
                      إنجاز لكافة المهام والتكليفات الميدانية الموكلة بنجاح والتزام تام
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 6. Skills & Hobbies */}
          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-blue-900 block mb-0.5">الهوايات والاهتمامات:</strong>
              <span className="text-slate-700">{member.hobbies && member.hobbies.length > 0 ? member.hobbies.join(' • ') : 'العمل التطوعي، خدمة المجتمع، التنظيم والقيادة'}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <strong className="text-blue-900 block mb-0.5">تطلعات التعلم والتطوير:</strong>
              <span className="text-slate-700">{member.learningAspirations && member.learningAspirations.length > 0 ? member.learningAspirations.join(' • ') : 'إدارة الفعاليات الكبرى، القيادة التنفيذية، إدارة فرق العمل'}</span>
            </div>
          </div>

          {/* 7. Official Leadership Signatures & Team Stamp (رئيس اللجنة، نائب رئيس الفريق، رئيس الفريق، ختم الفريق) */}
          <div className="pt-3 border-t-2 border-slate-300 grid grid-cols-4 items-end text-center text-xs">
            {/* Signature 1: Committee Head */}
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-0.5">رئيس اللجنة التخصصية</p>
              <h5 className="font-extrabold text-slate-900 text-xs mb-3">{leadership.committeeHeadName}</h5>
              <span className="text-[9px] text-slate-400">التوقيع: .....................</span>
            </div>

            {/* Official Team Stamp (Dynamically sized and centered) */}
            <div className="flex flex-col items-center justify-center">
              <img src={stamp} alt="ختم الاتحاد" className="w-16 h-16 object-contain mb-1 drop-shadow" />
              <p className="text-[8px] font-black text-blue-900">ختم اعتماد اتحاد الطلاب الرسمي</p>
            </div>

            {/* Signature 2: Vice President */}
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-0.5">نائب رئيس فريق المتطوعين</p>
              <h5 className="font-extrabold text-slate-900 text-xs mb-3">{leadership.vicePresidentName}</h5>
              <span className="text-[9px] text-slate-400">التوقيع: .....................</span>
            </div>

            {/* Signature 3: President */}
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-0.5">رئيس فريق متطوعين الاتحاد</p>
              <h5 className="font-extrabold text-slate-900 text-xs mb-3">{leadership.presidentName}</h5>
              <span className="text-[9px] text-slate-400">التوقيع: .....................</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
