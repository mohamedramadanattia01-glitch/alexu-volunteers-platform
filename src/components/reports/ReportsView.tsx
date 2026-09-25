import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, Download, Printer, FileSpreadsheet, 
  Calendar, Users, CheckCircle2, TrendingUp, Sparkles,
  Building2, Award, PieChart, ShieldCheck, FileText, CheckCheck,
  Percent, ArrowUpRight, Crown, Shield, Eye, X 
} from 'lucide-react';
import { ALEXANDRIA_UNIVERSITY_COLLEGES } from '../../data/colleges';
import { CommitteeBadge } from '../common/CommitteeBadge';
import { 
  exportMembersToExcel, 
  exportTasksToExcel, 
  exportAttendanceToExcel, 
  exportEvaluationsToExcel, 
  exportHeadEvaluationsToExcel,
  downloadCsvFile 
} from '../../utils/excelExport';

export const ReportsView: React.FC = () => {
  const { 
    members, committees, tasks, events, activeSeason, 
    teamHealthScore, calculateCommitteeHealth, branding,
    memberEvaluations, headEvaluations, isHighLeadership, currentUser 
  } = useApp();

  const [reportType, setReportType] = useState<'season' | 'monthly' | 'weekly' | 'colleges' | 'committees'>('season');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Filter regular members vs heads vs leadership
  const regularMembers = members.filter(m => m.role === 'member');
  const committeeHeads = members.filter(m => m.role === 'head' || m.role === 'vice_head');
  const highLeadershipTeam = members.filter(m => m.role !== 'member' && m.role !== 'head' && m.role !== 'vice_head');

  const completedTasks = tasks.filter(t => t.status === 'Approved');
  const avgAttendance = regularMembers.length > 0 
    ? Math.round(regularMembers.reduce((a, b) => a + (b.performance?.attendanceRate || 0), 0) / regularMembers.length) 
    : 100;
  const avgPerformance = regularMembers.length > 0 
    ? Math.round(regularMembers.reduce((a, b) => a + (b.performance?.overallScore || 0), 0) / regularMembers.length) 
    : 100;

  // Faculty Distribution Analytics (21 Alexandria Faculties)
  const facultyStats = ALEXANDRIA_UNIVERSITY_COLLEGES.map(collegeName => {
    const facultyMembers = regularMembers.filter(m => m.college === collegeName);
    const count = facultyMembers.length;
    const percentage = regularMembers.length > 0 ? Math.round((count / regularMembers.length) * 100) : 0;
    const avgScore = count > 0 
      ? Math.round(facultyMembers.reduce((a, b) => a + (b.performance?.overallScore || 0), 0) / count) 
      : 0;
    return {
      name: collegeName,
      count,
      percentage,
      avgScore,
      members: facultyMembers
    };
  }).sort((a, b) => b.count - a.count);

  // Export 21 Faculties breakdown to CSV/Excel
  const handleExportFacultyCSV = () => {
    const csvRows = [
      ['اسم الكلية / المعهد', 'عدد المتطوعين المسجلين', 'نسبة التمثيل من قوام الاتحاد (%)', 'متوسط التقييم العام (%)'],
      ...facultyStats.map(f => [
        `"${f.name}"`,
        f.count.toString(),
        `${f.percentage}%`,
        `${f.avgScore}%`
      ])
    ];

    const csvContent = csvRows.map(e => e.join(',')).join('\r\n');
    downloadCsvFile(csvContent, `تقرير_توزيع_كليات_جامعة_الإسكندرية_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Export Committee Health comparison to CSV/Excel
  const handleExportCommitteesCSV = () => {
    const csvRows = [
      ['اللجنة التخصصية', 'رئيس / قائد اللجنة', 'قوام المتطوعين', 'نسبة الحضور (%)', 'إنجاز المهام (%)', 'التقييم الفني (%)', 'مؤشر الصحة (Health %)'],
      ...committees.map(c => {
        const health = calculateCommitteeHealth(c.id);
        const commMembers = regularMembers.filter(m => m.currentCommitteeId === c.id);
        const commTasks = tasks.filter(t => t.committeeId === c.id);
        const taskPct = commTasks.length > 0 
          ? Math.round((commTasks.filter(t => t.status === 'Approved').length / commTasks.length) * 100) 
          : 100;

        return [
          `"${c.name}"`,
          `"${c.headName || 'بانتظار التعيين'}"`,
          commMembers.length.toString(),
          `${c.attendanceRate}%`,
          `${taskPct}%`,
          `${c.performanceScore}%`,
          `${health}%`
        ];
      })
    ];

    const csvContent = csvRows.map(e => e.join(',')).join('\r\n');
    downloadCsvFile(csvContent, `مصفوفة_صحة_وأداء_اللجان_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>الذكاء الإحصائي والتقارير التنفيذية المعتمدة</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>مركز التقارير الشاملة وتوزيع الكليات واللجان</span>
            <BarChart3 className="w-5 h-5 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            مؤشرات دقيقة لـ 21 كلية بجامعة الإسكندرية و 6 لجان تخصصية مع إمكانية التصدير والطباعة الرسمية
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportMembersToExcel(members, 'شامل_المتطوعين')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
            title="تصدير بيانات المتطوعين الشاملة إلى Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setShowPrintPreview(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30 transition-all"
            title="معاينة وطباعة التقرير الرسمي المعتمد"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير رسمي (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report View Mode Tabs */}
      <div className="flex flex-wrap rounded-xl bg-slate-900/80 p-1 border border-slate-800 gap-1 no-print">
        {[
          { id: 'season', label: '📊 تقرير الموسم الشامل' },
          { id: 'colleges', label: '🏛️ توزيع الـ 21 كلية (Alexandria)' },
          { id: 'committees', label: '👥 مقارنة اللجان الـ 6' },
          { id: 'monthly', label: '📅 التقرير الشهري والأسبوعي' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              reportType === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Export Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <div 
          onClick={handleExportFacultyCSV}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-sky-300">شيت توزيع الـ 21 كلية</h4>
              <p className="text-[10px] text-slate-400">تصدير إكسل بنسب تمثيل الكليات</p>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
        </div>

        <div 
          onClick={handleExportCommitteesCSV}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">شيت صحة وأداء اللجان الـ 6</h4>
              <p className="text-[10px] text-slate-400">مصفوفة نسب الحضور والمهام</p>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
        </div>

        <div 
          onClick={() => exportTasksToExcel(tasks, 'جميع_المهام')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-300">شيت المهام والتكليفات الميدانية</h4>
              <p className="text-[10px] text-slate-400">سجل إنجاز المهام ونقاط الـ XP</p>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
        </div>
      </div>

      {/* Official Document Card */}
      <div className="glass-card p-6 sm:p-8 border-slate-800 space-y-8 bg-slate-900/90 relative overflow-hidden">
        
        {/* Official Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-blue-500/40 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="شعار اتحاد طلاب جامعة الإسكندرية" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-extrabold text-blue-600 text-lg">AU</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400">{branding.subtitle || 'جامعة الإسكندرية • اتحاد طلاب الجامعة'}</div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                التقرير التنفيذي لأداء {branding.appTitle || 'فريق متطوعين اتحاد طلاب جامعة الإسكندرية'} — {activeSeason.name}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>تاريخ الاعتماد: {new Date().toLocaleDateString('ar-EG')}</span>
                <span>•</span>
                <span>الرقم المرجعي: ALEXU-VOL-{new Date().getFullYear()}-REP</span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>مؤشر الصحة العام للفريق: {teamHealthScore}% 🟢</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">حالة العمليات: تشغيلي ممتاز</span>
          </div>
        </div>

        {/* 4 Executive KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>إجمالي الأعضاء الميدانيين</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{regularMembers.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              + {committeeHeads.length} رؤساء لجان • {highLeadershipTeam.length} إدارة عليا
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>متوسط الالتزام بالحضور</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{avgAttendance}%</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">انضباط ميداني عالي بـ QR</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>المهام المنجزة والمعتمدة</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 font-mono">{completedTasks.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">من أصل {tasks.length} مهمة</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>معدل التقييم الشامل</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">{avgPerformance}%</div>
            <div className="text-[10px] text-amber-400/80 mt-1">مستوى أداء ممتاز</div>
          </div>
        </div>

        {/* Section 1: 21 Alexandria University Faculties Breakdown */}
        {(reportType === 'season' || reportType === 'colleges') && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>توزيع متطوعي الاتحاد عبر كليات ومعاهد جامعة الإسكندرية (21 كلية)</span>
                </h4>
                <p className="text-xs text-slate-400">تحليل التمثيل الطلابي والنسب المئوية لكل كلية داخل قوام التطوع</p>
              </div>
              <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/30 w-fit">
                21 كلية ممثلة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {facultyStats.map((fac, idx) => (
                <div 
                  key={fac.name} 
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-sky-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white leading-snug">{fac.name}</span>
                    </div>
                    <span className="text-xs font-black text-sky-400 font-mono">
                      {fac.count} عضو
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(fac.percentage * 2, fac.count > 0 ? 10 : 0)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>نسبة التمثيل: <strong className="text-white">{fac.percentage}%</strong></span>
                    {fac.count > 0 && (
                      <span>متوسط التقييم: <strong className="text-amber-400">{fac.avgScore}%</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: 6 Specialized Committees Direct Comparison Matrix */}
        {(reportType === 'season' || reportType === 'committees') && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>مصفوفة مقارنة الأداء ومؤشر الصحة للجان التخصصية الـ 6</span>
                </h4>
                <p className="text-xs text-slate-400">مؤشرات الأداء المحسوبة بالمعادلة الرياضية المعتمدة للاتحاد</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 pb-2">
                    <th className="py-2.5 font-bold">اللجنة الرسمية</th>
                    <th className="py-2.5 font-bold">القائد (Head)</th>
                    <th className="py-2.5 font-bold">القوام</th>
                    <th className="py-2.5 font-bold">نسبة الحضور</th>
                    <th className="py-2.5 font-bold">إنجاز المهام</th>
                    <th className="py-2.5 font-bold">التقييم الفني</th>
                    <th className="py-2.5 font-bold">مؤشر الصحة (Health)</th>
                    <th className="py-2.5 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {committees.map(c => {
                    const health = calculateCommitteeHealth(c.id);
                    const commMembers = regularMembers.filter(m => m.currentCommitteeId === c.id);
                    const commTasks = tasks.filter(t => t.committeeId === c.id);
                    const taskPct = commTasks.length > 0 
                      ? Math.round((commTasks.filter(t => t.status === 'Approved').length / commTasks.length) * 100) 
                      : 100;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3">
                          <CommitteeBadge committeeId={c.id} size="md" />
                        </td>
                        <td className="py-3 font-semibold text-slate-200">{c.headName || 'بانتظار التعيين'}</td>
                        <td className="py-3 font-mono text-slate-300">{commMembers.length || c.memberCount} عضو</td>
                        <td className="py-3 font-mono text-emerald-400 font-bold">{c.attendanceRate}%</td>
                        <td className="py-3 font-mono text-sky-400 font-bold">{taskPct}%</td>
                        <td className="py-3 font-mono text-amber-400 font-bold">{c.performanceScore}%</td>
                        <td className="py-3">
                          <span className="font-mono font-black text-sm text-emerald-400">
                            {health}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                            health >= 90 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : health >= 75 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {health >= 90 ? 'أداء استثنائي 🟢' : health >= 75 ? 'أداء ممتاز 🔵' : 'جيد / متابعة 🟡'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Digital Verification & Security Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
              ✓
            </div>
            <div>
              <div className="font-bold text-white text-xs">مستند رسمي إلكتروني موثق من منظومة متطوعي اتحاد طلاب جامعة الإسكندرية</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                كود التوثيق الأمني: ALEXU-REP-2026-SEC-{new Date().getFullYear()}
              </div>
            </div>
          </div>

          <div className="text-right sm:text-left flex items-center gap-3">
            <div className="text-[11px] text-slate-400">
              <span>تاريخ التوليد: <strong>{new Date().toLocaleDateString('ar-EG')}</strong></span>
              <span className="mx-2">•</span>
              <span>الحالة: <strong className="text-emerald-400">معتمد تشغيلياً</strong></span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[10px] font-mono">
              OFFICIAL REPORT
            </div>
          </div>
        </div>

      </div>

      {/* Official PDF Print Preview Modal */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-right print:m-0 print:p-0 print:shadow-none">
            
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  معاينة الطباعة الرسمية المعتمدة (PDF Preview)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الآن (Print / Save as PDF)</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div className="space-y-6 print:space-y-4">
              
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div className="text-right">
                  <h4 className="font-extrabold text-sm text-slate-700">جمهورية مصر العربية • وزارة التعليم العالي</h4>
                  <h3 className="font-black text-base text-blue-900">جامعة الإسكندرية • الإدارة العامة لرعاية الشباب</h3>
                  <h2 className="font-black text-lg text-slate-900 mt-0.5">اتحاد طلاب جامعة الإسكندرية — فريق المتطوعين</h2>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 p-1 flex items-center justify-center">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black text-blue-900 text-xl">AU</span>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-600 block">موضوع التقرير:</span>
                  <span className="font-extrabold text-slate-900 text-sm">التقرير الإحصائي والتنفيذي الشامل لأداء فرق العمل واللجان</span>
                </div>
                <div className="text-left font-mono text-slate-600">
                  <div>العام الجامعي: 2026/2027</div>
                  <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</div>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-bold">قوام المتطوعين</div>
                  <div className="text-xl font-black text-blue-900 font-mono">{regularMembers.length}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-bold">مؤشر الانضباط والحضور</div>
                  <div className="text-xl font-black text-emerald-700 font-mono">{avgAttendance}%</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-bold">المهام المعتمدة</div>
                  <div className="text-xl font-black text-sky-700 font-mono">{completedTasks.length}</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-bold">مؤشر الصحة العام</div>
                  <div className="text-xl font-black text-amber-700 font-mono">{teamHealthScore}%</div>
                </div>
              </div>

              {/* Committees Table */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-2">أولاً: مؤشرات اللجان التخصصية الـ 6 المعتمدة:</h4>
                <table className="w-full text-right text-xs border border-slate-300">
                  <thead className="bg-slate-200 text-slate-800">
                    <tr>
                      <th className="p-2 border border-slate-300">اللجنة</th>
                      <th className="p-2 border border-slate-300">مسؤول اللجنة</th>
                      <th className="p-2 border border-slate-300">العدد</th>
                      <th className="p-2 border border-slate-300">نسبة الحضور</th>
                      <th className="p-2 border border-slate-300">إنجاز المهام</th>
                      <th className="p-2 border border-slate-300">مؤشر الصحة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committees.map(c => {
                      const health = calculateCommitteeHealth(c.id);
                      const commMembers = regularMembers.filter(m => m.currentCommitteeId === c.id);
                      const commTasks = tasks.filter(t => t.committeeId === c.id);
                      const taskPct = commTasks.length > 0 
                        ? Math.round((commTasks.filter(t => t.status === 'Approved').length / commTasks.length) * 100) 
                        : 100;

                      return (
                        <tr key={c.id} className="border-b border-slate-200">
                          <td className="p-2 border border-slate-300 font-bold">{c.name}</td>
                          <td className="p-2 border border-slate-300">{c.headName || 'بانتظار التعيين'}</td>
                          <td className="p-2 border border-slate-300 font-mono">{commMembers.length || c.memberCount}</td>
                          <td className="p-2 border border-slate-300 font-mono">{c.attendanceRate}%</td>
                          <td className="p-2 border border-slate-300 font-mono">{taskPct}%</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-emerald-800">{health}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Faculties Top 6 */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 mb-2">ثانياً: أعلى كليات جامعة الإسكندرية تمثيلاً داخل الاتحاد:</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {facultyStats.slice(0, 6).map((f, i) => (
                    <div key={f.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{i + 1}. {f.name}</span>
                      <span className="font-mono font-extrabold text-blue-900">{f.count} متطوع</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Signatures */}
              <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">مسؤول الجودة والتقييم</span>
                  <span className="font-extrabold text-slate-800 block text-xs">سارة إبراهيم</span>
                  <span className="text-[10px] text-slate-400 block mt-4">التوقيع والاعتماد: ____________</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block mb-1">نائب رئيس فريق المتطوعين</span>
                  <span className="font-extrabold text-slate-800 block text-xs">أحمد عادل</span>
                  <span className="text-[10px] text-slate-400 block mt-4">التوقيع والاعتماد: ____________</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block mb-1">رئيس فريق متطوعين اتحاد الطلاب</span>
                  <span className="font-extrabold text-slate-800 block text-xs">عمر خالد</span>
                  <span className="text-[10px] text-slate-400 block mt-4">التوقيع والاعتماد: ____________</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
