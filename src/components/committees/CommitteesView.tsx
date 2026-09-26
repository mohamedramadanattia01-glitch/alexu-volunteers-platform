import React from 'react';
import { useApp } from '../../context/AppContext';
import { Committee } from '../../types';
import { 
  Layers, Plus, Users, CheckSquare, HeartPulse, Shield, 
  ChevronLeft, Sparkles, Activity, Award
} from 'lucide-react';
import { CommitteeBadge } from '../common/CommitteeBadge';

interface CommitteesViewProps {
  onOpenNewCommittee: () => void;
  onSelectCommittee: (committee: Committee) => void;
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  onOpenNewCommittee,
  onSelectCommittee
}) => {
  const { committees, currentUser, isHighLeadership, members, tasks, attendanceRecords, calculateCommitteeHealth } = useApp();
  const canCreate = isHighLeadership;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/60 border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              الهيكل التنظيمي واللجان الـ 6 الرسمية
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>اللجان التخصصية لفريق المتطوعين</span>
            <Layers className="w-5 h-5 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            متابعة اللجان الـ 6 ومؤشرات الصحة التشغيلية المحسوبة بالمعادلة الرياضية الدقيقة وتعيين القيادات
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenNewCommittee}
            className="btn-primary text-xs py-2.5 px-4 cursor-pointer shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء لجنة جديدة</span>
          </button>
        )}
      </div>

      {/* Committees Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {committees.map(comm => {
          const commMembers = members.filter(m => m.currentCommitteeId === comm.id && m.status === 'Active');
          const commTasks = tasks.filter(t => t.committeeId === comm.id);
          const completedTasks = commTasks.filter(t => t.status === 'Approved').length;
          const healthScore = calculateCommitteeHealth(comm.id);

          const commMemberIds = new Set(commMembers.map(m => m.id));
          const commRecords = attendanceRecords.filter(a => commMemberIds.has(a.memberId));
          const presentRecords = commRecords.filter(a => a.status === 'Present').length;
          const realAttendanceRate = commRecords.length > 0 ? Math.round((presentRecords / commRecords.length) * 100) : 0;

          const committeeHeads = members.filter(m => 
            m.currentCommitteeId === comm.id && 
            (m.role === 'head' || m.position?.includes('رئيس لجنة') || (m.position && m.position.startsWith('رئيس ')))
          );
          const committeeVices = members.filter(m => 
            m.currentCommitteeId === comm.id && 
            (m.role === 'vice_head' || m.position?.includes('نائب رئيس'))
          );

          const headsNamesList = committeeHeads.length > 0 
            ? committeeHeads.map(h => h.fullName).join(' • ')
            : (comm.headNames?.length ? comm.headNames.join(' • ') : (comm.headName || 'بانتظار تعيين القائد'));

          const vicesNamesList = committeeVices.length > 0
            ? committeeVices.map(v => v.fullName).join(' • ')
            : (comm.viceNames?.length ? comm.viceNames.join(' • ') : (comm.viceName || ''));

          const isMultipleHeads = committeeHeads.length > 1 || (comm.headNames && comm.headNames.length > 1);
          const isMultipleVices = committeeVices.length > 1 || (comm.viceNames && comm.viceNames.length > 1);

          return (
            <div 
              key={comm.id}
              className="glass-card p-5 glass-card-hover border-slate-800 flex flex-col justify-between group hover:border-sky-500/40 transition-all bg-slate-900/90"
            >
              <div>
                {/* Committee Header with Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <CommitteeBadge committeeId={comm.id} size="lg" />

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span>صحة اللجنة {healthScore}%</span>
                    </span>
                  </div>
                </div>

                {/* Leader & Vice */}
                <div className="text-xs text-slate-300 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                  <div className="font-semibold text-white flex items-start gap-1.5">
                    <span className="shrink-0">{isMultipleHeads ? '👑 القادة (Co-Heads):' : '👑 القائد (Head):'}</span>
                    <strong className="text-sky-300 font-bold leading-tight">{headsNamesList}</strong>
                  </div>
                  {vicesNamesList && (
                    <div className="text-[11px] text-slate-400 flex items-start gap-1.5">
                      <span className="shrink-0">{isMultipleVices ? '🥈 النواب (Vice Heads):' : '🥈 النائب (Vice):'}</span>
                      <span className="text-slate-200 leading-tight">{vicesNamesList}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-2">
                  {comm.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">الأعضاء النشطون</div>
                    <div className="font-black text-white font-mono mt-0.5">{commMembers.length || comm.memberCount}</div>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">المهام المنجزة</div>
                    <div className="font-black text-blue-400 font-mono mt-0.5">{completedTasks} / {commTasks.length}</div>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">نسبة الحضور</div>
                    <div className="font-black text-emerald-400 font-mono mt-0.5">{realAttendanceRate > 0 ? `${realAttendanceRate}%` : '0%'}</div>
                  </div>
                </div>

                {/* Health Algorithm Breakdown Pill */}
                <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[10px] text-slate-400 space-y-1 mb-4">
                  <div className="flex justify-between items-center">
                    <span>معادلة مؤشر الصحة:</span>
                    <span className="text-emerald-400 font-bold">انضباط {realAttendanceRate}% • مهام {completedTasks > 0 ? 'مكتملة' : 'قيد المتابعة'}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Responsibilities list preview */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5">المسؤوليات الرئيسية:</div>
                  <div className="space-y-1">
                    {comm.responsibilities.slice(0, 2).map((resp, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="truncate">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">2026/2027</span>
                <button
                  onClick={() => onSelectCommittee(comm)}
                  className="btn-secondary text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1 group-hover:border-sky-500/40 transition-all"
                >
                  <span>استعراض أعضاء اللجنة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
