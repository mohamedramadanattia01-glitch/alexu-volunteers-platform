import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, EvaluationRubric, HeadEvaluationRubric, MemberEvaluationRecord, HeadEvaluationRecord } from '../../types';
import { 
  Target, Award, Sliders, AlertTriangle, ShieldCheck, 
  Sparkles, CheckCircle2, User, ChevronLeft, Save, 
  Star, Check, History, Clock, FileCheck, Crown, Shield,
  Download, FileSpreadsheet, Calendar, Edit, Trash2, CheckSquare
} from 'lucide-react';
import { EvaluationRubricModal } from './EvaluationRubricModal';
import { exportEvaluationsToExcel, exportHeadEvaluationsToExcel } from '../../utils/excelExport';

export const EvaluationsView: React.FC = () => {
  const { 
    members, events, evaluationRubric, submitMemberEvaluation, 
    updateMemberEvaluation, deleteMemberEvaluation,
    memberEvaluations, headEvaluations, headEvaluationRubric,
    evaluateHead, updateHeadEvaluation, deleteHeadEvaluation,
    currentUser, isHighLeadership 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'heads'>('members');
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedHead, setSelectedHead] = useState<Member | null>(null);

  // Edit states for evaluations
  const [editingMemberEval, setEditingMemberEval] = useState<MemberEvaluationRecord | null>(null);
  const [editingHeadEval, setEditingHeadEval] = useState<HeadEvaluationRecord | null>(null);

  // Date selectors for evaluations (defaults to today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [evalDate, setEvalDate] = useState<string>(todayStr);
  const [headEvalDate, setHeadEvalDate] = useState<string>(todayStr);
  const [headEventId, setHeadEventId] = useState<string>('');

  // Dynamic evaluation scores map: { [criterionId]: number }
  const [evalScores, setEvalScores] = useState<{ [critId: string]: number }>({});
  const [evalFeedback, setEvalFeedback] = useState('');

  // Head dynamic evaluation scores map
  const [headEvalScores, setHeadEvalScores] = useState<{ [critId: string]: number }>({});
  const [headEvalFeedback, setHeadEvalFeedback] = useState('');

  // Permission check: High Leadership and Committee Heads can edit/delete daily evaluations
  const canManageEvaluations = isHighLeadership || ['head', 'vice_head', 'hr_admin'].includes(currentUser.role);

  // Member rubric metrics
  const totalMaxScore = evaluationRubric.criteria.reduce((a, b) => a + (Number(b.maxPoints) || 0), 0);
  const currentTotalEarned = Object.values(evalScores).reduce((a, b) => a + (Number(b) || 0), 0);
  const currentPercentage = totalMaxScore > 0 ? Math.round((currentTotalEarned / totalMaxScore) * 100) : 0;

  // Head rubric metrics
  const headTotalMaxScore = headEvaluationRubric.criteria.reduce((a, b) => a + (Number(b.maxPoints) || 0), 0);
  const headCurrentTotalEarned = Object.values(headEvalScores).reduce((a, b) => a + (Number(b) || 0), 0);
  const headCurrentPercentage = headTotalMaxScore > 0 ? Math.round((headCurrentTotalEarned / headTotalMaxScore) * 100) : 0;

  // Filter regular members ONLY (excluding Heads, Vice Heads, and High Leadership)
  const regularMembers = members.filter(m => m.status === 'Active' && m.role === 'member');
  // Filter Heads and Vice Heads ONLY
  const committeeHeads = members.filter(m => m.status === 'Active' && (m.role === 'head' || m.role === 'vice_head'));

  // Open New Member Evaluation
  const handleOpenEvaluateMember = (member: Member) => {
    setEditingMemberEval(null);
    setSelectedMember(member);
    setEvalDate(todayStr);
    const initialScores: { [critId: string]: number } = {};
    evaluationRubric.criteria.forEach(crit => {
      initialScores[crit.id] = Math.round(crit.maxPoints * 0.9);
    });
    setEvalScores(initialScores);
    setEvalFeedback('');
  };

  // Open Edit Member Evaluation
  const handleOpenEditMemberEvaluation = (evalRecord: MemberEvaluationRecord) => {
    setEditingMemberEval(evalRecord);
    const targetMember = members.find(m => m.id === evalRecord.memberId) || {
      id: evalRecord.memberId,
      fullName: evalRecord.memberName,
      volunteerId: evalRecord.memberVolunteerId,
      currentCommitteeName: evalRecord.committeeName,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    } as Member;

    setSelectedMember(targetMember);
    setEvalDate(evalRecord.evaluationDate || evalRecord.evaluatedAt?.split(' ')[0] || todayStr);
    setEvalScores({ ...evalRecord.scores });
    setEvalFeedback(evalRecord.feedback || '');
  };

  // Open New Head Evaluation
  const handleOpenEvaluateHead = (headMember: Member) => {
    setEditingHeadEval(null);
    setSelectedHead(headMember);
    setHeadEvalDate(todayStr);
    setHeadEventId('');
    const initialScores: { [critId: string]: number } = {};
    headEvaluationRubric.criteria.forEach(crit => {
      initialScores[crit.id] = Math.round(crit.maxPoints * 0.9);
    });
    setHeadEvalScores(initialScores);
    setHeadEvalFeedback('');
  };

  // Open Edit Head Evaluation
  const handleOpenEditHeadEvaluation = (evalRecord: HeadEvaluationRecord) => {
    setEditingHeadEval(evalRecord);
    const targetHead = members.find(m => m.id === evalRecord.headId) || {
      id: evalRecord.headId,
      fullName: evalRecord.headName,
      volunteerId: evalRecord.headVolunteerId,
      position: evalRecord.headPosition || 'رئيس لجنة',
      currentCommitteeName: evalRecord.committeeName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    } as Member;

    setSelectedHead(targetHead);
    setHeadEvalDate(evalRecord.evaluationDate || evalRecord.evaluatedAt?.split(' ')[0] || todayStr);
    setHeadEventId(evalRecord.eventId || '');
    setHeadEvalScores({ ...evalRecord.scores });
    setHeadEvalFeedback(evalRecord.feedback || '');
  };

  const handleScoreChange = (critId: string, value: number, maxPoints: number) => {
    const clamped = Math.max(0, Math.min(maxPoints, value));
    setEvalScores(prev => ({
      ...prev,
      [critId]: clamped
    }));
  };

  const handleHeadScoreChange = (critId: string, value: number, maxPoints: number) => {
    const clamped = Math.max(0, Math.min(maxPoints, value));
    setHeadEvalScores(prev => ({
      ...prev,
      [critId]: clamped
    }));
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (editingMemberEval) {
      updateMemberEvaluation(editingMemberEval.id, {
        scores: evalScores,
        maxTotalScore: totalMaxScore,
        feedback: evalFeedback,
        evaluationDate: evalDate
      });
    } else {
      submitMemberEvaluation({
        memberId: selectedMember.id,
        memberName: selectedMember.fullName,
        memberVolunteerId: selectedMember.volunteerId || selectedMember.id,
        committeeName: selectedMember.currentCommitteeName,
        evaluatorId: currentUser.id,
        evaluatorName: currentUser.fullName,
        evaluatorRole: currentUser.role,
        scores: evalScores,
        maxTotalScore: totalMaxScore,
        feedback: evalFeedback,
        evaluationDate: evalDate
      });
    }

    setSelectedMember(null);
    setEditingMemberEval(null);
  };

  const handleSaveHeadEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHead) return;

    const matchedEvent = events.find(ev => ev.id === headEventId);
    const eventName = matchedEvent ? matchedEvent.name : undefined;

    if (editingHeadEval) {
      updateHeadEvaluation(editingHeadEval.id, {
        scores: headEvalScores,
        maxTotalScore: headTotalMaxScore,
        feedback: headEvalFeedback,
        evaluationDate: headEvalDate,
        eventId: headEventId || undefined,
        eventName: eventName || undefined,
      });
    } else {
      evaluateHead({
        headId: selectedHead.id,
        headName: selectedHead.fullName,
        headVolunteerId: selectedHead.volunteerId || selectedHead.id,
        headPosition: selectedHead.position || 'رئيس لجنة',
        committeeName: selectedHead.currentCommitteeName,
        evaluatorId: currentUser.id,
        evaluatorName: currentUser.fullName,
        evaluatorRole: currentUser.role,
        scores: headEvalScores,
        maxTotalScore: headTotalMaxScore,
        leadershipRating: 5,
        feedback: headEvalFeedback,
        evaluationDate: headEvalDate,
        eventId: headEventId || undefined,
        eventName: eventName || undefined,
      });
    }

    setSelectedHead(null);
    setEditingHeadEval(null);
  };

  const handleDeleteMemberEvaluation = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف سجل تقييم المتطوع "${name}"؟`)) {
      deleteMemberEvaluation(id);
    }
  };

  const handleDeleteHeadEvaluation = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف سجل التقييم القيادي للمسؤول "${name}"؟`)) {
      deleteHeadEvaluation(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 text-right">
      
      {/* 1. Header & Sub-Tab Switcher */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-blue-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-end sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              منظومة التقييم الشامل 360° اليومية
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>منظومة تقييم الأداء اليومي والجدارة</span>
            <Target className="w-6 h-6 text-sky-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل وتعديل التقييمات اليومية للمتطوعين ورؤساء اللجان بدقة وحساب الإجماليات والنسب المكتسبة
          </p>
        </div>

        {/* SubTab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'members'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تقييم الأعضاء والمتطوعين
          </button>

          {isHighLeadership && (
            <button
              onClick={() => setActiveSubTab('heads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'heads'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>تقييم رؤساء اللجان (القيادة)</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'members' ? (
        /* MEMBERS EVALUATION VIEW */
        <div className="space-y-6">
          {/* Rubric Overview Card */}
          <div className="glass-card p-5 border-sky-500/30 bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{evaluationRubric.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {evaluationRubric.description || 'المعايير المعتمدة رسمياً لقياس أداء المتطوعين اليومي والميداني'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  إجمالي درجات المعايير: {totalMaxScore} نقطة
                </span>
                {isHighLeadership && (
                  <button
                    onClick={() => setIsRubricModalOpen(true)}
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    <span>تعديل معايير المتطوعين</span>
                  </button>
                )}
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {evaluationRubric.criteria.map((crit, index) => (
                <div key={crit.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">معيار {index + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 font-mono font-bold text-[11px]">
                        {crit.maxPoints} نقطة
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-200 text-xs mb-1">{crit.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{crit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regular Members Evaluation Table */}
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>تقييم أداء الأعضاء المتطوعين بالمعايير الموحدة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تقييم يومي ميداني مخصص للأعضاء مع تحديد يوم التقييم وربط الدرجات بالإجمالي العام
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportEvaluationsToExcel(memberEvaluations, 'الأعضاء')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="تصدير نتائج وسجل التقييمات إلى Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير نتائج التقييم (Excel)</span>
                </button>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  إجمالي الأعضاء: {regularMembers.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 pb-2">
                    <th className="py-2.5 font-bold">الرقم التطوعي</th>
                    <th className="py-2.5 font-bold">المتطوع</th>
                    <th className="py-2.5 font-bold">اللجنة</th>
                    <th className="py-2.5 font-bold">الحضور</th>
                    <th className="py-2.5 font-bold">المهام</th>
                    <th className="py-2.5 font-bold text-amber-400">التقييم الشامل</th>
                    <th className="py-2.5 font-bold">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {regularMembers.map(member => (
                    <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 font-mono text-sky-400 font-bold text-[11px]">
                        {member.volunteerId || member.id}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={member.avatarUrl} 
                            alt="" 
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0" 
                          />
                          <span className="font-bold text-white">{member.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-300">{member.currentCommitteeName}</td>
                      <td className="py-3 font-mono text-emerald-400">{member.performance.attendanceRate}%</td>
                      <td className="py-3 font-mono text-blue-400">{member.performance.taskCompletionRate}%</td>
                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold font-mono text-xs border border-blue-500/30">
                          {member.performance.overallScore}%
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleOpenEvaluateMember(member)}
                          className="btn-primary text-[11px] py-1 px-3 cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-300" />
                          <span>تقييم يومي جديد</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Member Evaluations Log with Date and Edit/Delete Actions */}
          {memberEvaluations.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>سجل التقييمات اليومية للأعضاء (المعاينات والتعديل)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {canManageEvaluations ? '✓ يحق لك تعديل وحذف درجات التقييم اليومية' : 'سجل للعرض فقط'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-2">
                      <th className="py-2 font-bold">يوم التقييم</th>
                      <th className="py-2 font-bold">المتطوع</th>
                      <th className="py-2 font-bold">الرقم التطوعي</th>
                      <th className="py-2 font-bold">اللجنة</th>
                      <th className="py-2 font-bold">المقيم</th>
                      <th className="py-2 font-bold">الدرجة المكتسبة</th>
                      <th className="py-2 font-bold">النسبة (%)</th>
                      {canManageEvaluations && <th className="py-2 font-bold text-center">إجراءات التعديل</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {memberEvaluations.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-900/30">
                        <td className="py-2.5 font-mono text-amber-300 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-400" />
                          <span>{ev.evaluationDate || ev.evaluatedAt?.split(' ')[0]}</span>
                        </td>
                        <td className="py-2.5 font-bold text-white">{ev.memberName}</td>
                        <td className="py-2.5 font-mono text-sky-400">{ev.memberVolunteerId}</td>
                        <td className="py-2.5 text-slate-300">{ev.committeeName}</td>
                        <td className="py-2.5 text-slate-400">{ev.evaluatorName}</td>
                        <td className="py-2.5 font-mono font-bold text-amber-400">{ev.totalScore} / {ev.maxTotalScore}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-bold">{ev.percentage}%</td>
                        
                        {canManageEvaluations && (
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditMemberEvaluation(ev)}
                                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                                title="تعديل درجات هذا اليوم"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMemberEvaluation(ev.id, ev.memberName)}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                title="حذف تقييم هذا اليوم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* HEADS EVALUATION VIEW (HIGH LEADERSHIP) */
        <div className="space-y-6">
          {/* Head Rubric Overview Card */}
          <div className="glass-card p-5 border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{headEvaluationRubric.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {headEvaluationRubric.description || 'معايير تقييم الكفاءة القيادية والإشرافية المعتمدة من الإدارة العليا'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  إجمالي درجات القيادة: {headTotalMaxScore} نقطة
                </span>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {headEvaluationRubric.criteria.map((crit, index) => (
                <div key={crit.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300 text-xs">معيار قيادي {index + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px]">
                        {crit.maxPoints} نقطة
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-200 text-xs mb-1">{crit.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{crit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Committee Heads Evaluation Table */}
          <div className="glass-card p-5 border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>تقييم الأداء الإشرافي لرؤساء ونواب اللجان</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  يتم التقييم والاعتماد حصرياً من القيادة العليا لفريق متطوعين اتحاد طلاب جامعة الإسكندرية
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportHeadEvaluationsToExcel(headEvaluations, 'القيادات')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="تصدير تقييمات رؤساء اللجان إلى Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير تقييمات الهيدات (Excel)</span>
                </button>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  إجمالي القيادات: {committeeHeads.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 pb-2">
                    <th className="py-2.5 font-bold">الرقم التطوعي</th>
                    <th className="py-2.5 font-bold">المسؤول القيادي</th>
                    <th className="py-2.5 font-bold">اللجنة</th>
                    <th className="py-2.5 font-bold">المسمى القيادي</th>
                    <th className="py-2.5 font-bold">مؤشر القيادة</th>
                    <th className="py-2.5 font-bold text-amber-400">التقييم الشامل</th>
                    <th className="py-2.5 font-bold">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {committeeHeads.map(head => {
                    const myHeadEvals = headEvaluations.filter(e => e.headId === head.id);
                    const hasEvals = myHeadEvals.length > 0;
                    const avgScore = hasEvals 
                      ? Math.round(myHeadEvals.reduce((a, b) => a + b.percentage, 0) / myHeadEvals.length)
                      : (head.performance?.evaluationsCount && head.performance.evaluationsCount > 0 ? head.performance.overallScore : 0);

                    return (
                      <tr key={head.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-mono text-sky-400 font-bold text-[11px]">
                          {head.volunteerId || head.id}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={head.avatarUrl} 
                              alt="" 
                              className="w-7 h-7 rounded-lg object-cover border border-amber-500/40 shrink-0" 
                            />
                            <span className="font-bold text-white">{head.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-300">{head.currentCommitteeName}</td>
                        <td className="py-3 font-semibold text-amber-300">{head.position}</td>
                        <td className="py-3 font-mono text-purple-400 font-bold">
                          {hasEvals ? `${avgScore}%` : '0%'}
                        </td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full font-bold font-mono text-xs border ${
                            hasEvals 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {hasEvals ? `${avgScore}%` : 'لم يُقيّم بعد'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleOpenEvaluateHead(head)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1"
                          >
                            <Crown className="w-3 h-3" />
                            <span>تقييم قيادي جديد</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Head Evaluations Log with Date and Edit/Delete Actions */}
          {headEvaluations.length > 0 && (
            <div className="glass-card p-5 space-y-3 border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>سجل التقييمات القيادية المعتمدة وتعديلها</span>
                </h4>
                <span className="text-[11px] text-amber-300/80">
                  {isHighLeadership ? '👑 الإدارة العليا: متاح تعديل وحذف التقييمات القيادية' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-2">
                      <th className="py-2 font-bold">يوم التقييم</th>
                      <th className="py-2 font-bold">المسؤول القيادي</th>
                      <th className="py-2 font-bold">الكود</th>
                      <th className="py-2 font-bold">اللجنة</th>
                      <th className="py-2 font-bold">الفاعلية / المناسبة</th>
                      <th className="py-2 font-bold">المقيم</th>
                      <th className="py-2 font-bold">الدرجة</th>
                      <th className="py-2 font-bold">النسبة (%)</th>
                      {isHighLeadership && <th className="py-2 font-bold text-center">إجراءات التعديل</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {headEvaluations.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-900/30">
                        <td className="py-2.5 font-mono text-amber-300 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span>{ev.evaluationDate || ev.evaluatedAt?.split(' ')[0]}</span>
                        </td>
                        <td className="py-2.5 font-bold text-white">{ev.headName}</td>
                        <td className="py-2.5 font-mono text-sky-400">{ev.headVolunteerId}</td>
                        <td className="py-2.5 text-slate-300">{ev.committeeName}</td>
                        <td className="py-2.5">
                          {ev.eventName ? (
                            <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                              {ev.eventName}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">تقييم دوري عام</span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-400">{ev.evaluatorName}</td>
                        <td className="py-2.5 font-mono font-bold text-amber-400">{ev.totalScore} / {ev.maxTotalScore}</td>
                        <td className="py-2.5 font-mono text-emerald-400 font-bold">{ev.percentage}%</td>
                        
                        {isHighLeadership && (
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditHeadEvaluation(ev)}
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                                title="تعديل درجات هذا التقييم"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHeadEvaluation(ev.id, ev.headName)}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                title="حذف هذا التقييم القيادي"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Member Evaluation Form Modal (Create or Edit) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="glass-card max-w-xl w-full p-6 border border-blue-500/40 bg-slate-950 text-right shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedMember.avatarUrl} 
                  alt="" 
                  className="w-11 h-11 rounded-xl object-cover border border-blue-400" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {editingMemberEval ? 'تعديل تقييم المتطوع:' : 'تقييم المتطوع:'} {selectedMember.fullName}
                    </h3>
                    {editingMemberEval && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        وضع التعديل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedMember.volunteerId || selectedMember.id} • {selectedMember.currentCommitteeName}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedMember(null); setEditingMemberEval(null); }} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              
              {/* Day / Evaluation Date Picker */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">يوم وتاريخ التقييم الميداني:</span>
                    <span className="text-[10px] text-slate-400">حدد اليوم المراد تسجيل أو احتساب الدرجة له</span>
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={evalDate}
                  onChange={(e) => setEvalDate(e.target.value)}
                  className="glass-input font-mono font-bold text-sky-300 text-xs py-1.5 px-3 rounded-lg border-blue-500/40 cursor-pointer bg-slate-900"
                />
              </div>

              {/* Dynamic Rubric Scoring Fields */}
              <div className="space-y-3">
                <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>تحديد النقاط لكل بند من المعايير المعتمدة:</span>
                </span>

                {evaluationRubric.criteria.map((crit, idx) => {
                  const score = evalScores[crit.id] || 0;

                  return (
                    <div key={crit.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-xs">
                            {idx + 1}. {crit.name}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{crit.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={crit.maxPoints}
                            value={score}
                            onChange={(e) => handleScoreChange(crit.id, Number(e.target.value), crit.maxPoints)}
                            className="glass-input w-16 text-center font-mono font-bold text-amber-400 text-xs py-1"
                          />
                          <span className="text-slate-400 font-mono text-[11px]">/ {crit.maxPoints}</span>
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max={crit.maxPoints}
                        value={score}
                        onChange={(e) => handleScoreChange(crit.id, Number(e.target.value), crit.maxPoints)}
                        className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Total Live Calculation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">الدرجة الإجمالية المحتسبة:</span>
                  <span className="text-[11px] text-slate-400">تعتمد تلقائياً وتنعكس على نسبة أداء العضو</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-2xl font-mono font-black text-amber-400">{currentTotalEarned}</span>
                    <span className="text-xs text-slate-400">/ {totalMaxScore}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    النسبة: {currentPercentage}%
                  </span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات التقييم والتوصيات الإدارية
                </label>
                <textarea 
                  rows={2}
                  placeholder="اكتب كلمة تشجيعية أو نقاط تحتاج للتطوير في المرحلة القادمة..."
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { setSelectedMember(null); setEditingMemberEval(null); }} 
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingMemberEval ? 'حفظ وتحديث درجات التقييم 💾' : 'اعتماد وحفظ تقييم اليوم ⭐'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Head Evaluation Form Modal (Create or Edit) */}
      {selectedHead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="glass-card max-w-xl w-full p-6 border-2 border-amber-500/50 bg-slate-950 text-right shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedHead.avatarUrl} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      {editingHeadEval ? 'تعديل تقييم القيادة:' : 'تقييم القيادة:'} {selectedHead.fullName}
                    </h3>
                    {editingHeadEval && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                        وضع التعديل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-300/90 font-medium">
                    {selectedHead.position} • {selectedHead.currentCommitteeName}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedHead(null); setEditingHeadEval(null); }} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHeadEvaluation} className="space-y-4 text-xs">
              
              {/* Day / Evaluation Date Picker */}
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white text-xs block">يوم وتاريخ التقييم القيادي:</span>
                    <span className="text-[10px] text-slate-400">حدد اليوم المراد تقييم أداء رئيس/نائب اللجنة فيه</span>
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={headEvalDate}
                  onChange={(e) => setHeadEvalDate(e.target.value)}
                  className="glass-input font-mono font-bold text-amber-300 text-xs py-1.5 px-3 rounded-lg border-amber-500/40 cursor-pointer bg-slate-900"
                />
              </div>

              {/* Event Association Selector */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <label className="font-bold text-white text-xs block flex items-center justify-between">
                  <span>الفاعلية أو المشروع المرتبط بالتقييم (اختياري):</span>
                  <span className="text-[10px] text-amber-400">ربط التقييم بفاعلية محددة</span>
                </label>
                <select
                  value={headEventId}
                  onChange={(e) => setHeadEventId(e.target.value)}
                  className="glass-input w-full text-xs py-2 px-3 rounded-lg border-slate-700 bg-slate-900 text-slate-200 cursor-pointer"
                >
                  <option value="">-- تقييم دوري عام (بدون فاعلية محددة) --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Head Rubric Scoring Fields */}
              <div className="space-y-3">
                <span className="font-bold text-amber-300 block mb-1 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>معايير التقييم القيادي والإشرافي (الإدارة العليا):</span>
                </span>

                {headEvaluationRubric.criteria.map((crit, idx) => {
                  const score = headEvalScores[crit.id] || 0;

                  return (
                    <div key={crit.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-xs">
                            {idx + 1}. {crit.name}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{crit.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={crit.maxPoints}
                            value={score}
                            onChange={(e) => handleHeadScoreChange(crit.id, Number(e.target.value), crit.maxPoints)}
                            className="glass-input w-16 text-center font-mono font-bold text-amber-400 text-xs py-1"
                          />
                          <span className="text-slate-400 font-mono text-[11px]">/ {crit.maxPoints}</span>
                        </div>
                      </div>

                      {/* Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max={crit.maxPoints}
                        value={score}
                        onChange={(e) => handleHeadScoreChange(crit.id, Number(e.target.value), crit.maxPoints)}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Total Live Calculation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-900/30 border border-amber-500/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">درجة الكفاءة القيادية الإجمالية:</span>
                  <span className="text-[11px] text-slate-400">تعتمد وتحدث مؤشر القيادة والتقييم العام للمسؤول</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-2xl font-mono font-black text-amber-400">{headCurrentTotalEarned}</span>
                    <span className="text-xs text-slate-400">/ {headTotalMaxScore}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    النسبة: {headCurrentPercentage}%
                  </span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  توجيهات وملاحظات القيادة العليا لرئيس/نائب اللجنة
                </label>
                <textarea 
                  rows={2}
                  placeholder="ملاحظات توجيهية لقيادة اللجنة وتحقيق مستهدفات الموسم..."
                  value={headEvalFeedback}
                  onChange={(e) => setHeadEvalFeedback(e.target.value)}
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { setSelectedHead(null); setEditingHeadEval(null); }} 
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/30 flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  <span>{editingHeadEval ? 'حفظ وتحديث تقييم القيادة 💾' : 'اعتماد تقييم القيادة العليا 👑'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Rubric Customizer Modal */}
      <EvaluationRubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
      />

    </div>
  );
};
