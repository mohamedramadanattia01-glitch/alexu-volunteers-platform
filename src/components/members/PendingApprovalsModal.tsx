import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, UserX, X, Mail, Phone, Building2, 
  Layers, CheckCircle2, Clock, Calendar, Sparkles, 
  Send, ExternalLink, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { Role } from '../../types';
import { getWhatsAppUrl, hasValidWhatsApp } from '../../utils/whatsapp';

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({ isOpen, onClose }) => {
  const { 
    pendingMembers, approveMemberRegistration, 
    rejectMemberRegistration, committees, showNotification 
  } = useApp();

  const [selectedCommitteeMap, setSelectedCommitteeMap] = useState<{ [memberId: string]: string }>({});
  const [selectedRoleMap, setSelectedRoleMap] = useState<{ [memberId: string]: Role }>({});
  const [rejectReasonMap, setRejectReasonMap] = useState<{ [memberId: string]: string }>({});
  const [rejectingMemberId, setRejectingMemberId] = useState<string | null>(null);
  const [lastApprovedInfo, setLastApprovedInfo] = useState<{ name: string; id: string; commName: string } | null>(null);

  if (!isOpen) return null;

  const handleApprove = (memberId: string) => {
    const targetMember = pendingMembers.find(m => m.id === memberId);
    if (!targetMember) return;

    const assignedCommId = selectedCommitteeMap[memberId] || targetMember.preferredCommitteeId || committees[0]?.id || 'comm-org';
    const assignedRole = selectedRoleMap[memberId] || 'member';

    const res = approveMemberRegistration(memberId, assignedCommId, assignedRole);
    if (res.success) {
      const comm = committees.find(c => c.id === assignedCommId);
      setLastApprovedInfo({
        name: targetMember.fullName,
        id: res.volunteerId,
        commName: comm?.name || 'لجنة التنظيم'
      });
      setTimeout(() => setLastApprovedInfo(null), 6000);
    }
  };

  const handleConfirmReject = (memberId: string) => {
    const reason = rejectReasonMap[memberId] || 'عدم توافق الشروط للمرحلة الحالية';
    rejectMemberRegistration(memberId, reason);
    setRejectingMemberId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-card border border-white/10 bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  طلبات الانضمام والتسجيل الجديدة
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                  {pendingMembers.length} طلبات معلقة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مراجعة واعتماد المتقدمين الجدد وتعيين لجانهم وإصدار الأرقام التطوعية الفريدة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner if just approved */}
        {lastApprovedInfo && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">تم اعتماد وقبول "{lastApprovedInfo.name}" بنجاح!</span>
                <span className="mx-1.5 text-emerald-400">•</span>
                <span>الرقم التطوعي الصادر: <strong className="font-mono text-white bg-slate-950 px-1.5 py-0.5 rounded">{lastApprovedInfo.id}</strong></span>
                <span className="mx-1.5 text-emerald-400">•</span>
                <span>اللجنة: {lastApprovedInfo.commName}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 hidden sm:inline">جاهز للدخول الآن ✅</span>
          </div>
        )}

        {/* Modal Body List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {pendingMembers.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-300">لا توجد طلبات انضمام معلقة حالياً</p>
              <p className="text-xs text-slate-500">
                سيظهر هنا أي متطوع جديد يقوم بإنشاء حساب في المنصة لاعتماده
              </p>
            </div>
          ) : (
            pendingMembers.map(applicant => {
              const selectedCommId = selectedCommitteeMap[applicant.id] || applicant.preferredCommitteeId || committees[0]?.id || 'comm-org';
              const selectedRole = selectedRoleMap[applicant.id] || 'member';
              const isRejectingThis = rejectingMemberId === applicant.id;

              return (
                <div 
                  key={applicant.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Top info row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      <img 
                        src={applicant.avatarUrl} 
                        alt={applicant.fullName} 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{applicant.fullName}</h4>
                          <span className="px-2 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                            طلب جديد
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {applicant.college} ({applicant.academicYear})
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300 font-mono text-[11px]">{applicant.universityEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp & Contacts */}
                    <div className="flex items-center gap-2 text-xs">
                      {hasValidWhatsApp(applicant.whatsappNumber || applicant.phone) && (
                        <a
                          href={getWhatsAppUrl(applicant.whatsappNumber || applicant.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold transition-all text-xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>واتساب: {applicant.whatsappNumber || applicant.phone}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                        </a>
                      )}
                    </div>

                  </div>

                  {/* Bio / Reason */}
                  {applicant.bio && (
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      💬 <span className="font-semibold text-slate-400">النبذة والمهارات:</span> {applicant.bio}
                    </p>
                  )}

                  {/* Committee & Role Selection Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        تعيين اللجنة المعتمدة:
                      </label>
                      <select
                        value={selectedCommId}
                        onChange={e => setSelectedCommitteeMap({ ...selectedCommitteeMap, [applicant.id]: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        {committees.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.name} ({c.code}) {applicant.preferredCommitteeId === c.id ? '⭐ المرغوبة' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        الصفة / الدور الممنوح:
                      </label>
                      <select
                        value={selectedRole}
                        onChange={e => setSelectedRoleMap({ ...selectedRoleMap, [applicant.id]: e.target.value as Role })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="member" className="bg-slate-900 text-white">🌟 عضو متطوع (Volunteer Member)</option>
                        <option value="vice_head" className="bg-slate-900 text-white">⚔️ نائب رئيس لجنة (Vice Head)</option>
                        <option value="head" className="bg-slate-900 text-white">🛡️ رئيس لجنة (Committee Head)</option>
                        <option value="hr_admin" className="bg-slate-900 text-white">👥 مسؤول الموارد البشرية (HR Lead)</option>
                        <option value="event_manager" className="bg-slate-900 text-white">🎪 مسؤول الفعاليات والمشاريع (Event Lead)</option>
                        <option value="quality_officer" className="bg-slate-900 text-white">💎 مسؤول الجودة والتقييم المؤسسي</option>
                        <option value="operations_manager" className="bg-slate-900 text-white">🚨 مسؤول العمليات والميدان</option>
                        <option value="general_coordinator" className="bg-slate-900 text-white">⚡ المنسق العام لفريق المتطوعين</option>
                        <option value="advisor" className="bg-slate-900 text-white">🎓 مستشار فريق متطوعين اتحاد الطلاب</option>
                        <option value="vice_president" className="bg-slate-900 text-white">⭐ نائب رئيس فريق متطوعين اتحاد الطلاب</option>
                        <option value="super_admin" className="bg-slate-900 text-white">👑 رئيس فريق متطوعين اتحاد الطلاب (Super Admin)</option>
                      </select>
                    </div>
                  </div>

                  {/* Reject reason input (if expanding reject) */}
                  {isRejectingThis && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-rose-300">
                        سبب رفض الطلب:
                      </label>
                      <input
                        type="text"
                        value={rejectReasonMap[applicant.id] || ''}
                        onChange={e => setRejectReasonMap({ ...rejectReasonMap, [applicant.id]: e.target.value })}
                        placeholder="e.g. عدم استيفاء الشروط أو اكتمال الأعداد"
                        className="w-full bg-slate-950 border border-rose-700/60 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingMemberId(null)}
                          className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleConfirmReject(applicant.id)}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                        >
                          تأكيد الرفض
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  {!isRejectingThis && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => setRejectingMemberId(applicant.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>رفض الطلب</span>
                      </button>

                      <button
                        onClick={() => handleApprove(applicant.id)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>قبول وتفعيل العضوية وإصدار الكود</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>* عند القبول، يتم تفعيل العضو فوراً وإصدار كود العضوية بحسب كود اللجنة المعتمد.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
