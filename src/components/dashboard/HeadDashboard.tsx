import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, CheckSquare, Clock, Plus, Target, 
  ChevronLeft, Award, Sparkles, AlertCircle, TrendingUp
} from 'lucide-react';

interface HeadDashboardProps {
  onOpenNewTask: () => void;
  onSelectMember: (memberId: string) => void;
}

export const HeadDashboard: React.FC<HeadDashboardProps> = ({ onOpenNewTask, onSelectMember }) => {
  const { currentUser, committees, members, tasks, setActiveTab } = useApp();

  const myCommittee = committees.find(c => c.id === currentUser.currentCommitteeId) || committees[0];
  const committeeMembers = members.filter(m => m.currentCommitteeId === myCommittee.id && m.status === 'Active');
  const committeeTasks = tasks.filter(t => t.committeeId === myCommittee.id);
  const pendingTasks = committeeTasks.filter(t => t.status === 'Submitted' || t.status === 'Under Review');
  const overdueTasks = committeeTasks.filter(t => t.status === 'Overdue');
  const unassignedMembers = committeeMembers.filter(m => m.workloadStatus === 'Underutilized');

  return (
    <div className="space-y-6">
      
      {/* Committee Head Banner */}
      <div className="glass-card p-6 relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-slate-900/80 to-slate-900/60 border border-blue-500/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
                لوحة قيادة اللجنة • {myCommittee.name}
              </span>
              <span className="text-xs text-slate-400">القائد: {currentUser.fullName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              إدارة ومتابعة {myCommittee.name}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {myCommittee.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-blue-500/30 shadow-xl">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-400">مؤشر صحة اللجنة (Health Score)</div>
              <div className="text-xs text-emerald-400 font-medium">{myCommittee.healthScore >= 90 ? 'أداء ممتاز 🟢' : 'أداء جيد 🟡'}</div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 flex items-center justify-center text-lg font-extrabold text-white font-mono">
              {myCommittee.healthScore}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={onOpenNewTask}
            className="btn-primary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إسناد مهمة جديدة للجنة</span>
          </button>

          <button 
            onClick={() => setActiveTab('evaluations')}
            className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span>تقييم أعضاء اللجنة (360°)</span>
          </button>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">أعضاء اللجنة</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{committeeMembers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">جميعهم في حالة نشاط</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">المهام قيد المراجعة</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{pendingTasks.length}</div>
          <div className="text-[11px] text-amber-300 mt-1">بانتظار تقييمك واعتمادك</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">نسبة حضور اللجنة</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{myCommittee.attendanceRate}%</div>
          <div className="text-[11px] text-emerald-400 mt-1">التزام ميداني مرتفع</div>
        </div>

        <div className="glass-card p-4">
          <div className="text-xs font-bold text-slate-400">أعضاء متاحون للتكليف</div>
          <div className="text-2xl font-extrabold text-sky-400 mt-1 font-mono">{unassignedMembers.length}</div>
          <div className="text-[11px] text-sky-300 mt-1">لديهم سعة لمهام جديدة</div>
        </div>
      </div>

      {/* Committee Roster & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Submissions to Review */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>تسليمات تنتظر تقييم الهيد ({pendingTasks.length})</span>
            </h3>
            <button onClick={() => setActiveTab('tasks')} className="text-xs text-blue-400 hover:underline">
              كل المهام
            </button>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">لا توجد تسليمات معلقة، كل المهام محدثة ومقيمة! ✨</p>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="p-3.5 rounded-xl bg-slate-900/70 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{task.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Submitted</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">المسند إليه: {task.assignedToMemberNames.join('، ')}</div>
                  {task.submission && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800 mb-2">
                      📝 {task.submission.notes}
                    </div>
                  )}
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="btn-primary text-xs py-1.5 px-3 w-full"
                  >
                    مراجعة وتقييم المهمة
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Committee Members List */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>أعضاء اللجنة ({committeeMembers.length})</span>
            </h3>
            <button onClick={() => setActiveTab('members')} className="text-xs text-blue-400 hover:underline">
              سجل الأعضاء
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {committeeMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <div className="text-xs font-bold text-white">{member.fullName}</div>
                    <div className="text-[10px] text-slate-400">{member.college} • عبء العمل: {member.activeWorkload} مهام</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    member.workloadStatus === 'Underutilized' ? 'bg-sky-500/20 text-sky-400' :
                    member.workloadStatus === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {member.workloadStatus === 'Underutilized' ? 'سعة إضافية' : member.workloadStatus === 'Optimal' ? 'مثالي' : 'ممتلئ'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">أداء {member.performance.overallScore}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
