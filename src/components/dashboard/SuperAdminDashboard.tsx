import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, CheckCircle2, Calendar, TrendingUp, AlertTriangle, 
  Shield, Zap, Award, ArrowUpRight, Clock, Plus, 
  ChevronLeft, Sparkles, HeartPulse, ShieldAlert, UserCheck, Crown
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onOpenNewTask: () => void;
  onOpenNewEvent: () => void;
  onOpenAnnouncement: () => void;
  onSelectMember: (memberId: string) => void;
  onOpenApprovals?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenNewTask, onOpenNewEvent, onOpenAnnouncement, onSelectMember, onOpenApprovals
}) => {
  const { 
    members, committees, tasks, events, sosAlerts, 
    teamHealthScore, setActiveTab, getHighRiskMembers, pendingMembers,
    calculateCommitteeHealth
  } = useApp();

  const activeMembers = members.filter(m => m.status === 'Active');
  const regularMembers = activeMembers.filter(m => m.role === 'member');
  const committeeHeads = activeMembers.filter(m => m.role === 'head' || m.role === 'vice_head');

  const completedTasks = tasks.filter(t => t.status === 'Approved');
  const overdueTasks = tasks.filter(t => t.status === 'Overdue');
  const highRiskMembers = getHighRiskMembers();
  
  // Top Regular Members ONLY (Strictly excluding Heads and High Leadership)
  const topRegularMembers = [...regularMembers]
    .sort((a, b) => (b.performance?.overallScore || 0) - (a.performance?.overallScore || 0) || (b.points || 0) - (a.points || 0))
    .slice(0, 4);

  // Top Heads & Leadership Matrix ONLY (Separated for High Leadership)
  const topHeads = [...committeeHeads]
    .sort((a, b) => {
      const scoreA = ((a.performance?.leadership || 85) * 0.5) + ((a.performance?.overallScore || 85) * 0.3) + (a.points * 0.2);
      const scoreB = ((b.performance?.leadership || 85) * 0.5) + ((b.performance?.overallScore || 85) * 0.3) + (b.points * 0.2);
      return scoreB - scoreA;
    })
    .slice(0, 4);

  const openSOS = sosAlerts.filter(s => s.status === 'Open' || s.status === 'Acknowledged');
  const liveEvents = events.filter(e => e.status === 'Live' || e.liveDashboardActive);

  // Accurate Overall Score (Dynamic)
  const averagePerformanceScore = regularMembers.length > 0
    ? Math.round(regularMembers.reduce((a, b) => a + (b.performance?.overallScore || 0), 0) / regularMembers.length)
    : 0;

  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* Top Banner with Welcome & Team Health Gauge */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-slate-900/80 to-slate-900/60 border border-blue-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
                لوحة القيادة والمتابعة المركزية • الإدارة العليا
              </span>
              <span className="text-xs text-slate-400">اتحاد طلاب جامعة الإسكندرية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              نظرة عامة على تشغيل فريق المتطوعين
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              متابعة مباشرة وشاملة للـ 6 لجان تخصصية، الفعاليات الميدانية، مؤشرات الأداء، واعتماد المتطوعين الجدد لموسم 2026/2027.
            </p>
          </div>

          {/* Health Score Box */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-blue-500/30 shadow-xl">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400">مؤشر صحة الفريق العام</div>
              <div className="text-xs text-emerald-400 font-medium">
                {teamHealthScore >= 90 ? 'أداء تشغيلي ممتاز 🟢' : 'أداء تشغيلي مستقر 🟡'}
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 border-r-blue-500 flex items-center justify-center text-xl font-extrabold text-white font-mono">
                {teamHealthScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operational Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={onOpenNewTask}
            className="btn-primary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء مهمة جديدة</span>
          </button>

          <button 
            onClick={onOpenNewEvent}
            className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>إضافة فعالية</span>
          </button>

          <button 
            onClick={onOpenAnnouncement}
            className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>إرسال تعميم للفريق</span>
          </button>

          <button 
            onClick={() => setActiveTab('live-command')}
            className="btn-secondary text-xs py-2 px-3.5 text-emerald-300 hover:text-emerald-200 border-emerald-500/30 bg-emerald-950/40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>غرفة العمليات الحية</span>
          </button>
        </div>
      </div>

      {/* Critical Alerts Ribbon if any */}
      {(pendingMembers.length > 0 || openSOS.length > 0 || overdueTasks.length > 0 || highRiskMembers.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingMembers.length > 0 && (
            <div 
              onClick={onOpenApprovals || (() => setActiveTab('members'))}
              className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-900/50 transition-all animate-pulse"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">📝 طلبات انضمام جديدة ({pendingMembers.length})</div>
                  <div className="text-[11px] text-amber-300">مراجعة واعتماد المتقدمين وتعيين اللجان</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-amber-400" />
            </div>
          )}
          {openSOS.length > 0 && (
            <div 
              onClick={() => setActiveTab('live-command')}
              className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-center justify-between cursor-pointer hover:bg-rose-900/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white">🚨 بلاغ طوارئ ميداني نشط ({openSOS.length})</div>
                  <div className="text-[11px] text-rose-300">{openSOS[0].location}</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-rose-400" />
            </div>
          )}

          {overdueTasks.length > 0 && (
            <div 
              onClick={() => setActiveTab('tasks')}
              className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-900/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">⚠️ مهام تجاوزت الموعد ({overdueTasks.length})</div>
                  <div className="text-[11px] text-amber-300">تحتاج إلى مراجعة وتعيين بديل</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-amber-400" />
            </div>
          )}

          {highRiskMembers.length > 0 && (
            <div 
              onClick={() => setActiveTab('ai-hub')}
              className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 flex items-center justify-between cursor-pointer hover:bg-purple-900/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-xs font-bold text-white">🔍 أعضاء بحاجة لدعم ومتابعة ({highRiskMembers.length})</div>
                  <div className="text-[11px] text-purple-300">اكتشاف الذكاء الاصطناعي للمخاطر</div>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-purple-400" />
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Members */}
        <div className="glass-card p-4 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي المتطوعين</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {activeMembers.length}
            <span className="text-xs text-slate-400 font-normal mr-1.5">عضو نشط</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{regularMembers.length} متطوع • {committeeHeads.length} قادة لجان</span>
          </div>
        </div>

        {/* Tasks Completion Rate */}
        <div className="glass-card p-4 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">نسبة إنجاز المهام</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {completedTasks.length} مهمة مكتملة من إجمالي {tasks.length}
          </div>
        </div>

        {/* Total Events */}
        <div className="glass-card p-4 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">الفعاليات الميدانية</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {events.length}
            <span className="text-xs text-slate-400 font-normal mr-1.5">فعالية</span>
          </div>
          <div className="text-[11px] text-sky-400 mt-2">
            {liveEvents.length > 0 ? `${liveEvents.length} جارية الآن (Live) 🟢` : 'لا توجد فعاليات جارية الآن'}
          </div>
        </div>

        {/* Overall Performance */}
        <div className="glass-card p-4 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">متوسط الأداء الميداني</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {averagePerformanceScore}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-2">
            {averagePerformanceScore >= 90 ? 'تقييم امتياز (Outstanding) ⭐' : 'تقييم جيد جداً 🟢'}
          </div>
        </div>

      </div>

      {/* Committees Performance Matrix & Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Committees Health & Stats */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">أداء وصحة اللجان التخصصية (الـ 6 لجان)</h3>
              <p className="text-xs text-slate-400">معدلات الحضور، إنجاز المهام، ومؤشر صحة كل لجنة</p>
            </div>
            <button 
              onClick={() => setActiveTab('committees')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>عرض كل اللجان</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {committees.map(comm => {
              const commMembers = regularMembers.filter(m => m.currentCommitteeId === comm.id);
              const commTasks = tasks.filter(t => t.committeeId === comm.id);
              const commCompleted = commTasks.filter(t => t.status === 'Approved').length;
              const commTaskPct = commTasks.length > 0 ? Math.round((commCompleted / commTasks.length) * 100) : 100;
              const currentHealth = calculateCommitteeHealth(comm.id);

              return (
                <div 
                  key={comm.id}
                  onClick={() => setActiveTab('committees')}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: comm.color }}
                      />
                      <span className="text-xs font-bold text-white">{comm.name}</span>
                      <span className="text-[10px] text-slate-400">({commMembers.length} عضو متطوع)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-300">
                        القائد: <strong className="text-white">{comm.headName || 'بانتظار تعيين القائد'}</strong>
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {currentHealth}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${currentHealth}%`,
                        backgroundColor: comm.color
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>المهام المكتملة: {commCompleted} من {commTasks.length} ({commTaskPct}%)</span>
                    <span>نسبة الحضور: {comm.attendanceRate}%</span>
                    <span>مؤشر الجودة: {comm.performanceScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stacked Leaderboard Column: Top Members & Heads Ranking */}
        <div className="space-y-6">
          
          {/* Top Regular Volunteers Card */}
          <div className="glass-card p-5 border-amber-500/20 bg-slate-900/70">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>لوحة شرف المتطوعين</span>
                </h3>
                <p className="text-[10px] text-slate-400">خاص بالأعضاء المتطوعين فقط</p>
              </div>
              <button 
                onClick={() => setActiveTab('leaderboard')}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                الترتيب الكامل
              </button>
            </div>

            {topRegularMembers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>بانتظار تسجيل المتطوعين الجدد واعتمادهم</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topRegularMembers.map((member, index) => (
                  <div 
                    key={member.id}
                    onClick={() => onSelectMember(member.id)}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        index === 0 ? 'bg-amber-500 text-slate-950 font-extrabold' :
                        index === 1 ? 'bg-slate-300 text-slate-950 font-bold' :
                        index === 2 ? 'bg-amber-700 text-white font-bold' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <img src={member.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[110px]">{member.fullName}</div>
                        <div className="text-[9px] text-slate-400">{member.currentCommitteeName}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-amber-400 font-mono">
                        {member.performance?.overallScore || 0}%
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {member.points} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated Heads & Committee Leadership Ranking Card */}
          <div className="glass-card p-5 border-purple-500/20 bg-slate-900/70">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>ترتيب رؤساء ونواب اللجان</span>
                </h3>
                <p className="text-[10px] text-purple-300/80">مؤشرات الأداء والقيادة التشغيلية</p>
              </div>
              <button 
                onClick={() => setActiveTab('evaluations')}
                className="text-xs text-purple-400 hover:underline cursor-pointer"
              >
                التقييم الشامل
              </button>
            </div>

            {topHeads.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                <Crown className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>بانتظار تعيين قادة اللجان وتقييمهم</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topHeads.map((headMember, index) => (
                  <div 
                    key={headMember.id}
                    onClick={() => onSelectMember(headMember.id)}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/30 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {index + 1}
                      </span>
                      <img src={headMember.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-purple-500/30 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[110px]">{headMember.fullName}</div>
                        <div className="text-[9px] text-purple-300">{headMember.position}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-purple-400 font-mono">
                        {headMember.performance?.overallScore || 0}%
                      </div>
                      <div className="text-[9px] text-slate-400">
                        قيادة: {headMember.performance?.leadership || 90}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
