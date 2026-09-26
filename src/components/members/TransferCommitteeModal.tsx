import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Role } from '../../types';
import { X, ArrowRightLeft, Crown, Shield, Users, Sparkles } from 'lucide-react';

interface TransferCommitteeModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferCommitteeModal: React.FC<TransferCommitteeModalProps> = ({
  member,
  isOpen,
  onClose
}) => {
  const { committees, transferMemberCommittee } = useApp();

  const [newCommId, setNewCommId] = useState('');
  const [newRole, setNewRole] = useState<Role>('member');
  const [newPosition, setNewPosition] = useState('');
  const [reason, setReason] = useState('');

  // When member opens, initialize defaults
  useEffect(() => {
    if (member && isOpen) {
      const defaultComm = committees.find(c => c.id !== member.currentCommitteeId) || committees[0];
      const initialCommId = defaultComm?.id || 'comm-leadership';
      setNewCommId(initialCommId);

      const isLeadership = initialCommId === 'comm-leadership';
      const initialRole: Role = isLeadership 
        ? (member.role === 'vice_president' ? 'vice_president' : 'advisor') 
        : (member.role === 'head' ? 'head' : 'member');
      setNewRole(initialRole);

      setNewPosition(getDefaultPosition(initialCommId, initialRole, defaultComm?.name || ''));
      setReason('');
    }
  }, [member, isOpen, committees]);

  // Helper to suggest default position title
  const getDefaultPosition = (commId: string, role: Role, commName: string): string => {
    if (commId === 'comm-leadership') {
      switch (role) {
        case 'advisor': return 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية';
        case 'vice_president': return 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية';
        case 'super_admin': return 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية';
        case 'general_coordinator': return 'منسق عام فريق المتطوعين';
        case 'operations_manager': return 'مدير العمليات الميدانية';
        case 'quality_officer': return 'مسؤول الجودة والمتابعة المؤسسية';
        default: return 'عضو القيادة العليا والمجلس الاستشاري';
      }
    } else {
      switch (role) {
        case 'head': return `رئيس ${commName}`;
        case 'vice_head': return `نائب رئيس ${commName}`;
        case 'hr_admin': return `مسؤول موارد بشرية بـ ${commName}`;
        default: return `عضو متطوع بـ ${commName}`;
      }
    }
  };

  // Handle Committee change
  const handleCommChange = (commId: string) => {
    setNewCommId(commId);
    const comm = committees.find(c => c.id === commId);
    const isLeadership = commId === 'comm-leadership';
    const nextRole: Role = isLeadership ? 'advisor' : 'member';
    setNewRole(nextRole);
    setNewPosition(getDefaultPosition(commId, nextRole, comm?.name || ''));
  };

  // Handle Role change
  const handleRoleChange = (role: Role) => {
    setNewRole(role);
    const comm = committees.find(c => c.id === newCommId);
    setNewPosition(getDefaultPosition(newCommId, role, comm?.name || ''));
  };

  if (!isOpen || !member) return null;

  const isMovingToLeadership = newCommId === 'comm-leadership';
  const isMovingFromLeadership = member.currentCommitteeId === 'comm-leadership';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommId || !reason.trim()) return;

    transferMemberCommittee(member.id, newCommId, reason.trim(), newRole, newPosition.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-lg w-full p-5 sm:p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">نقل وتسكين العضو / القائد</h3>
              <p className="text-xs text-slate-400">تعديل التسكين التنظيمي، اللجنة، والرتبة الإدارية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Member Info Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400">العضو المستهدف: <strong className="text-white font-bold">{member.fullName}</strong></div>
            <div className="text-slate-400 mt-1 flex items-center gap-1.5">
              <span>اللجنة الحالية:</span>
              <strong className="text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                {member.currentCommitteeName}
              </strong>
            </div>
            <div className="text-slate-400 mt-1">
              المنصب الحالي: <span className="text-slate-200">{member.position}</span>
            </div>
          </div>
          <div className="text-left font-mono text-[11px] text-slate-400">
            كود: <span className="text-sky-400 font-bold">{member.volunteerId || '—'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Committee Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اللجنة الجديدة المراد النقل والتسكين إليها *
            </label>
            <select
              value={newCommId}
              onChange={(e) => handleCommChange(e.target.value)}
              className="glass-input text-xs w-full cursor-pointer font-bold"
            >
              {committees.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.id === 'comm-leadership' ? '👑 القيادة العليا والمجلس الاستشاري' : `🏢 ${c.name} (${c.code})`}
                </option>
              ))}
            </select>
          </div>

          {/* Role / Rank Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              الدور / الصفة التنظيمية الجديدة *
            </label>
            <select
              value={newRole}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="glass-input text-xs w-full cursor-pointer font-bold"
            >
              {isMovingToLeadership ? (
                <>
                  <option value="advisor" className="bg-slate-900 text-white">مستشار الفريق (Advisor) 👑</option>
                  <option value="vice_president" className="bg-slate-900 text-white">نائب رئيس الفريق (Vice President) 👑</option>
                  <option value="super_admin" className="bg-slate-900 text-white">رئيس الفريق (President / Super Admin) 👑</option>
                  <option value="general_coordinator" className="bg-slate-900 text-white">منسق عام الفريق (General Coordinator)</option>
                  <option value="operations_manager" className="bg-slate-900 text-white">مدير العمليات الميدانية (Operations Manager)</option>
                  <option value="quality_officer" className="bg-slate-900 text-white">مسؤول الجودة والمتابعة (Quality Officer)</option>
                </>
              ) : (
                <>
                  <option value="head" className="bg-slate-900 text-white">رئيس اللجنة (Head) ⭐</option>
                  <option value="vice_head" className="bg-slate-900 text-white">نائب رئيس اللجنة (Vice Head)</option>
                  <option value="hr_admin" className="bg-slate-900 text-white">مسؤول موارد بشرية باللجنة (HR Officer)</option>
                  <option value="member" className="bg-slate-900 text-white">عضو متطوع باللجنة (Volunteer Member)</option>
                </>
              )}
            </select>
          </div>

          {/* New Position Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              المسمى الوظيفي / المنصب الرسمي *
            </label>
            <input
              type="text"
              required
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="مثال: مستشار فريق متطوعين، نائب رئيس الفريق، رئيس لجنة التنظيم..."
              className="glass-input text-xs w-full"
            />
          </div>

          {/* Action Impact Callout */}
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            isMovingToLeadership 
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
              : isMovingFromLeadership
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            {isMovingToLeadership ? (
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <div>
              {isMovingToLeadership && (
                <span>👑 ترقية العضو إلى <strong>الإدارة العليا والمجلس الاستشاري</strong> مع منحه صلاحيات القيادة وإشراف عام على اللجان.</span>
              )}
              {isMovingFromLeadership && !isMovingToLeadership && (
                <span>🏢 نقل العضو من الإدارة العليا إلى <strong>لجنة تشغيلية ميدانية</strong>.</span>
              )}
              {!isMovingToLeadership && !isMovingFromLeadership && (
                <span>🔄 نقل وتسكين العضو بين اللجان التخصصية مع تحديث كود التطوع وسجل التنقلات.</span>
              )}
            </div>
          </div>

          {/* Reason & Notes with Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                سبب ومسوغ قرار النقل والتسكين *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setReason(isMovingToLeadership ? 'ترقية وتكليف ضمن القيادة العليا والمجلس الاستشاري' : 'إعادة توزيع المهام والتسكين التنظيمي')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30 cursor-pointer"
                >
                  ⚡ نص جاهز سريع
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              required
              placeholder="اكتب أسباب النقل (قرار رئاسي، تكليف قيادي، كفاءة ميدانية، إعادة هيكلة)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="glass-input text-xs w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
              إلغاء
            </button>
            <button type="submit" className="btn-primary text-xs py-2 px-6 font-bold cursor-pointer flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>تأكيد النقل والتسكين وتوثيق القرار</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
