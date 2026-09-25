import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecruitmentCandidate } from '../../types';
import { 
  UserPlus, CheckCircle2, XCircle, Clock, 
  ChevronLeft, Award, FileText, Check, Users 
} from 'lucide-react';

export const RecruitmentPipeline: React.FC = () => {
  const { candidates, committees, updateCandidateStatus, convertCandidateToMember } = useApp();

  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [interviewScore, setInterviewScore] = useState(85);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [assignedCommId, setAssignedCommId] = useState(committees[0]?.id || 'comm-org');

  const stages: { id: RecruitmentCandidate['status']; label: string; color: string }[] = [
    { id: 'Application', label: 'طلبات التقديم', color: 'border-blue-500/40 bg-blue-950/20' },
    { id: 'Screening', label: 'الفرز والتدقيق', color: 'border-sky-500/40 bg-sky-950/20' },
    { id: 'Interview', label: 'المقابلات الشخصية', color: 'border-purple-500/40 bg-purple-950/20' },
    { id: 'Accepted', label: 'المقبولون (Onboarding)', color: 'border-emerald-500/40 bg-emerald-950/20' },
  ];

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    updateCandidateStatus(selectedCandidate.id, 'Interview', interviewScore, interviewNotes);
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              دورة حياة المتطوع • Recruitment & Onboarding
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>نظام الاستقطاب والمقابلات وتأهيل الجدد</span>
            <UserPlus className="w-5 h-5 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة مسار المتقدمين، تقييم المقابلات، ونقل المقبولين إلى اللجان كأعضاء نشطين
          </p>
        </div>
      </div>

      {/* Recruitment Pipeline Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(stage => {
          const stageCandidates = candidates.filter(c => c.status === stage.id);

          return (
            <div key={stage.id} className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[480px] ${stage.color}`}>
              
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white">{stage.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                {stageCandidates.map(cand => (
                  <div key={cand.id} className="glass-card p-3.5 border-slate-800 space-y-2 text-right bg-slate-900/90">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{cand.fullName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{cand.appliedDate}</span>
                    </div>

                    <p className="text-[11px] text-slate-400">{cand.college} • {cand.academicYear}</p>
                    <div className="text-[10px] text-blue-300 bg-blue-950/60 p-1.5 rounded border border-blue-500/20">
                      الرغبات: {cand.preferredCommittees.join('، ')}
                    </div>

                    {cand.interviewScore !== undefined && (
                      <div className="flex justify-between items-center text-[10px] text-slate-300 border-t border-slate-800 pt-1.5">
                        <span>درجة المقابلة:</span>
                        <span className="font-extrabold text-amber-400 font-mono">{cand.interviewScore}/100</span>
                      </div>
                    )}

                    {/* Stage Actions */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      {cand.status === 'Application' && (
                        <button
                          onClick={() => updateCandidateStatus(cand.id, 'Screening')}
                          className="btn-secondary text-[11px] py-1 w-full"
                        >
                          نقل للفرز (Screening)
                        </button>
                      )}

                      {cand.status === 'Screening' && (
                        <button
                          onClick={() => { setSelectedCandidate(cand); setInterviewScore(85); }}
                          className="btn-primary text-[11px] py-1 w-full"
                        >
                          بدء المقابلة الشخصية 🎤
                        </button>
                      )}

                      {cand.status === 'Interview' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateCandidateStatus(cand.id, 'Accepted')}
                            className="btn-primary text-[10px] py-1 flex-1 bg-emerald-600 hover:bg-emerald-500"
                          >
                            قبول (Accept)
                          </button>
                          <button
                            onClick={() => updateCandidateStatus(cand.id, 'Rejected')}
                            className="btn-secondary text-[10px] py-1 flex-1 text-rose-400"
                          >
                            رفض
                          </button>
                        </div>
                      )}

                      {cand.status === 'Accepted' && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-emerald-400 font-bold">
                            Onboarding: {cand.onboardingProgress}% مكتمل
                          </div>
                          <button
                            onClick={() => convertCandidateToMember(cand.id, assignedCommId)}
                            className="btn-primary text-[11px] py-1.5 w-full flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>تفعيل كعضو نشط باللجنة</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Interview Assessment Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 border border-purple-500/30 shadow-2xl bg-slate-950 text-right">
            <h3 className="text-base font-bold text-white mb-1">تقييم المقابلة الشخصية (Interview Score)</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedCandidate.fullName} ({selectedCandidate.college})</p>

            <form onSubmit={handleSaveInterview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الدرجة من 100 *</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={interviewScore}
                  onChange={(e) => setInterviewScore(Number(e.target.value))}
                  className="glass-input text-xs font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات المقابلة وانطباع المقيم</label>
                <textarea 
                  rows={3}
                  placeholder="حضور الذهن، الالتزام، اللباقة، واللجنة الأنسب..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setSelectedCandidate(null)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
                  حفظ التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
