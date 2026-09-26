import React, { useState } from 'react';
import { useApp, isHighLeadershipMember } from '../../context/AppContext';
import { Member } from '../../types';
import { isHeadMember } from '../../utils/roleUtils';
import { getMemberExactBirthData } from '../../utils/nationalId';
import { getWhatsAppUrl, hasValidWhatsApp } from '../../utils/whatsapp';
import { 
  X, Eye, EyeOff, ShieldCheck, Award, FileText, 
  Calendar, Phone, Mail, GraduationCap, Clock, 
  Sparkles, History, Star, ArrowRightLeft, HeartHandshake,
  Heart, Edit3, Ban, ShieldAlert, RotateCcw, Crown, Shield,
  Layers, CheckSquare, Activity, UserCheck
} from 'lucide-react';

interface MemberProfileModalProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDigitalPortfolio: (member: Member) => void;
  onOpenEditProfile?: (member: Member) => void;
  onOpenTransferModal?: (member: Member) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  memberId,
  isOpen,
  onClose,
  onOpenDigitalPortfolio,
  onOpenEditProfile,
  onOpenTransferModal
}) => {
  const { 
    members, revealNationalId, currentUser, badges, 
    isHighLeadership, banMember, unbanMember, filterOutMember, 
    grantBadgeToMember, revokeBadgeFromMember,
    attendanceRecords, memberEvaluations, headEvaluations,
    evaluationRubric, committees, tasks, calculateCommitteeHealth
  } = useApp();

  const [isNationalIdRevealed, setIsNationalIdRevealed] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [actionType, setActionType] = useState<'ban' | 'filter'>('ban');

  if (!isOpen || !memberId) return null;

  const member = members.find(m => m.id === memberId);
  if (!member) return null;

  const isHead = isHeadMember(member);
  const isHighLead = isHighLeadershipMember(member);

  // Committee details if head
  const memberComm = committees.find(c => c.id === member.currentCommitteeId);
  const commMembers = memberComm ? members.filter(m => m.currentCommitteeId === memberComm.id && m.status === 'Active') : [];
  const commTasks = memberComm ? tasks.filter(t => t.committeeId === memberComm.id) : [];
  const commCompletedTasks = commTasks.filter(t => t.status === 'Approved').length;
  const commHealth = memberComm ? calculateCommitteeHealth(memberComm.id) : 0;

  // Real attendance calculation for regular member
  const memberAttRecords = attendanceRecords.filter(a => a.memberId === member.id);
  const presentRecordsCount = memberAttRecords.filter(a => a.status === 'Present').length;
  const realAttendanceRate = memberAttRecords.length > 0 
    ? Math.round((presentRecordsCount / memberAttRecords.length) * 100) 
    : (member.performance?.attendanceRate || 0);

  // Member evaluations & criteria scores
  const memberEvals = memberEvaluations.filter(e => e.memberId === member.id);
  const latestMemberEval = memberEvals.length > 0 ? memberEvals[0] : null;

  // Head evaluations (visible only to High Leadership)
  const myHeadEvals = headEvaluations.filter(e => e.headId === member.id);
  const latestHeadEval = myHeadEvals.length > 0 ? myHeadEvals[0] : null;
  const headAvgPercentage = myHeadEvals.length > 0
    ? Math.round(myHeadEvals.reduce((a, b) => a + b.percentage, 0) / myHeadEvals.length)
    : (member.performance?.evaluationsCount && member.performance.evaluationsCount > 0 ? member.performance.overallScore : 0);

  // Member calculated overall score
  const calculatedMemberOverallScore = memberEvals.length > 0
    ? Math.round(memberEvals.reduce((a, b) => a + b.percentage, 0) / memberEvals.length)
    : (member.performance?.evaluationsCount && member.performance.evaluationsCount > 0 ? member.performance.overallScore : (realAttendanceRate > 0 ? realAttendanceRate : 0));

  const handleToggleNationalId = () => {
    if (!isNationalIdRevealed) {
      revealNationalId(member.id);
      setIsNationalIdRevealed(true);
    } else {
      setIsNationalIdRevealed(false);
    }
  };

  const handleConfirmBanOrFilter = () => {
    const reason = banReasonInput.trim() || (actionType === 'filter' ? 'تصفية واستبعاد من الفريق' : 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي');
    if (actionType === 'filter') {
      filterOutMember(member.id, reason);
    } else {
      banMember(member.id, reason);
    }
    setIsBanModalOpen(false);
    setBanReasonInput('');
  };

  const handleUnban = () => {
    unbanMember(member.id);
  };

  const earnedBadges = badges.filter(b => member.badges.includes(b.id));
  const isMe = member.id === currentUser.id;
  const canEdit = isMe || currentUser.role === 'super_admin' || currentUser.role === 'hr_admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-3xl w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Banned Alert Banner if Member is Banned */}
        {member.status === 'Banned' && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-950/60 border border-rose-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>هذا الحساب محظور ومستبعد نهائياً ⛔</span>
                  {member.bannedBy && <span className="text-xs text-rose-400">({member.bannedBy})</span>}
                </div>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  السبب: {member.banReason || 'مخالفة اللائحة التنظيمية'}
                  {member.bannedAt && ` • ${new Date(member.bannedAt).toLocaleDateString('ar-EG')}`}
                </p>
              </div>
            </div>

            {isHighLeadership && (
              <button
                onClick={handleUnban}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء الحظر</span>
              </button>
            )}
          </div>
        )}

        {/* Header with Background Glow */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-800 mb-6 gap-4 relative">
          <div className="flex items-center gap-4">
            <img 
              src={member.avatarUrl} 
              alt="" 
              className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-xl ${
                member.status === 'Banned' 
                  ? 'border-rose-500/60 grayscale' 
                  : isHighLead 
                    ? 'border-amber-400/80 shadow-amber-500/20' 
                    : isHead 
                      ? 'border-sky-400/80 shadow-sky-500/20' 
                      : 'border-blue-500/50'
              }`}
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  {member.currentCommitteeName}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 font-bold border border-sky-500/40">
                  {member.volunteerId || member.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  member.status === 'Banned' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : isHighLead
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isHead
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {member.status === 'Banned' 
                    ? 'محظور' 
                    : isHighLead 
                    ? '👑 قيادة عليا وإشراف عام' 
                    : isHead 
                    ? `👑 ${member.position || (member.role === 'head' ? 'رئيس لجنة' : 'نائب رئيس')}` 
                    : `المستوى ${member.level} (${member.points} XP)`}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{member.fullName}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {member.position} • {member.college} - {member.academicYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Reassign / Transfer Button for High Leadership */}
            {isHighLeadership && onOpenTransferModal && member.status !== 'Banned' && (
              <button
                onClick={() => { onClose(); onOpenTransferModal(member); }}
                className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="تعديل التسكين، اللجنة، والرتبة الإدارية"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>تسكين / نقل المنصب</span>
              </button>
            )}

            {canEdit && onOpenEditProfile && member.status !== 'Banned' && (
              <button
                onClick={() => { onClose(); onOpenEditProfile(member); }}
                className="btn-secondary text-xs py-2 px-3 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>تعديل الملف</span>
              </button>
            )}

            <button
              onClick={() => onOpenDigitalPortfolio(member)}
              className="btn-primary text-xs py-2 px-3 cursor-pointer shadow-md shadow-blue-600/30"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>توليد السيرة الذاتية (CV)</span>
            </button>

            {isHighLeadership && !isMe && member.status !== 'Banned' && (
              <>
                <button
                  onClick={() => { setActionType('filter'); setIsBanModalOpen(true); }}
                  className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="تصفية واستبعاد العضو مع حظر الدخول"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>تصفية واستبعاد</span>
                </button>

                <button
                  onClick={() => { setActionType('ban'); setIsBanModalOpen(true); }}
                  className="px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-400 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="حظر وإدراج بالقائمة السوداء"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>حظر</span>
                </button>
              </>
            )}

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bio if exists */}
        {member.bio && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 mb-6">
            💬 {member.bio}
          </div>
        )}

        {/* 2-Columns Grid: Personal Info & Leadership/Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Personal & Sensitive Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>البيانات الشخصية والأكاديمية</span>
            </h4>

            <div className="space-y-2.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الكلية:</span>
                <span className="font-semibold text-white">{member.college}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الفرقة الدراسية:</span>
                <span className="font-semibold text-white">{member.academicYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">البريد الجامعي:</span>
                <span className="font-mono text-slate-300">{member.universityEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">رقم الواتساب:</span>
                {hasValidWhatsApp(member.whatsappNumber || member.phone) ? (
                  <a
                    href={getWhatsAppUrl(member.whatsappNumber || member.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{member.whatsappNumber || member.phone}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-300">(فتح الشات 💬)</span>
                  </a>
                ) : (
                  <span className="font-mono text-slate-500">—</span>
                )}
              </div>

              {/* Social Media Links if present */}
              {(member.facebookUrl || member.instagramUrl || member.tiktokUrl || member.linkedinUrl) && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">حسابات التواصل:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {member.facebookUrl && (
                      <a href={member.facebookUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 hover:bg-blue-600/40">
                        Facebook
                      </a>
                    )}
                    {member.instagramUrl && (
                      <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30 hover:bg-pink-500/40">
                        Instagram
                      </a>
                    )}
                    {member.tiktokUrl && (
                      <a href={member.tiktokUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 hover:bg-cyan-500/40">
                        TikTok
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded bg-sky-600/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 hover:bg-sky-600/40">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {(() => {
                const bData = getMemberExactBirthData(member);
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">تاريخ الميلاد والسن:</span>
                      <span className="text-slate-200 font-medium">
                        {bData.formattedFullDate} (<strong className="text-sky-300 font-bold font-mono">{bData.currentAge} سنة</strong>)
                      </span>
                    </div>
                    {bData.governorate && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">المحافظة (الرقم القومي):</span>
                        <span className="text-slate-300 font-medium">محافظة {bData.governorate}</span>
                      </div>
                    )}
                    {bData.zodiacSign && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">البرج الفلكي:</span>
                        <span className="text-amber-300 font-medium">{bData.zodiacSign}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">تاريخ الانضمام:</span>
                <span className="text-slate-300">{member.joinDate}</span>
              </div>

              {/* Secure Masked National ID */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>الرقم القومي (بيانات حساسة)</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {isNationalIdRevealed ? member.nationalId : `*** *** *** ${member.nationalId.substring(10)}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleNationalId}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isNationalIdRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-blue-400" />}
                  <span>{isNationalIdRevealed ? 'إخفاء' : 'كشف (تسجيل تدقيق)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Leadership Profile / Member 360 Matrix */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                {isHighLead 
                  ? 'بيانات الصفة الإدارية والإشراف العام' 
                  : isHead 
                  ? 'بطاقة قيادة وإشراف اللجنة' 
                  : 'مصفوفة الأداء ومعايير التقييم 360°'}
              </span>
            </h4>

            {/* A) HIGH LEADERSHIP VIEW */}
            {isHighLead ? (
              <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/70 to-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-amber-500/20 pb-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>👑 القيادة العليا والمجلس الاستشاري</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  هذا العضو يمثل القيادة العليا والإشرافية المباشرة على فريق المتطوعين واتحاد طلاب جامعة الإسكندرية.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-amber-300/90 leading-normal">
                  📌 <strong>ملاحظة تنظيمية:</strong> القيادة العليا معفية من قياس نقاط التطوع والتقييمات الميدانية لأنها تمثل جهة الاعتماد والتقييم العليا.
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                  <span>الصلاحيات:</span>
                  <span className="font-bold text-white">إشراف شامل على كافة اللجان والعمليات</span>
                </div>
              </div>
            ) : isHead ? (
              /* B) COMMITTEE HEAD VIEW (Clean Profile Data + High Leadership Evaluation) */
              <div className="bg-slate-900/60 p-4 rounded-xl border border-sky-500/30 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>إشراف وإدارة: {member.currentCommitteeName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px] border border-sky-500/30">
                    {member.role === 'head' ? 'رئيس اللجنة' : 'نائب رئيس'}
                  </span>
                </div>

                {/* Committee KPIs under this Head */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">فريق اللجنة</div>
                    <div className="font-black text-white font-mono mt-0.5">{commMembers.length} عضو</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">المهام المنجزة</div>
                    <div className="font-black text-blue-400 font-mono mt-0.5">{commCompletedTasks} / {commTasks.length}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">صحة اللجنة</div>
                    <div className="font-black text-emerald-400 font-mono mt-0.5">{commHealth}%</div>
                  </div>
                </div>

                {/* Committee Responsibilities Summary */}
                {memberComm?.responsibilities && memberComm.responsibilities.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400">المسؤوليات القيادية المشرف عليها:</div>
                    <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                      {memberComm.responsibilities.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Head Evaluation - Visible EXCLUSIVELY to High Leadership */}
                {isHighLeadership ? (
                  <div className="mt-2 pt-2 border-t border-amber-500/20 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>تقييم الأداء القيادي (من الإدارة العليا):</span>
                      </span>
                      <span className="font-mono text-xs font-black text-amber-400">
                        {myHeadEvals.length > 0 ? `${headAvgPercentage}%` : 'لم يُسجل تقييم بعد'}
                      </span>
                    </div>

                    {latestHeadEval ? (
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>آخر تقييم: {latestHeadEval.evaluationDate}</span>
                          <span>المقيم: {latestHeadEval.evaluatorName}</span>
                        </div>
                        {latestHeadEval.feedback && (
                          <div className="bg-slate-950/60 p-1.5 rounded border border-amber-500/20 text-slate-300 text-[10px]">
                            💬 {latestHeadEval.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">
                        يمكن لإدارة الفريق إضافة تقييم قيادي جديد لهذا المسؤول من قسم "التقييمات".
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-[10px] text-slate-400 text-center">
                    ⭐ قيادة وإشراف معتمد من اتحاد طلاب جامعة الإسكندرية
                  </div>
                )}
              </div>
            ) : (
              /* C) REGULAR MEMBER VIEW (Criteria Breakdown + Attendance + Overall Score) */
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3.5">
                
                {/* Overall Score Header Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-purple-950/40 border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">الإجمالي العام والتقييم الشامل:</div>
                    <div className="text-xs text-slate-200 mt-0.5">
                      {calculatedMemberOverallScore >= 90 ? 'امتياز 🟢' : calculatedMemberOverallScore >= 75 ? 'جيد جداً 🟡' : calculatedMemberOverallScore > 0 ? 'جيد 🔵' : 'قيد التقييم الميداني ⚪'}
                    </div>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">
                    {calculatedMemberOverallScore}%
                  </div>
                </div>

                {/* 1. Real Attendance Rate */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-bold">نسبة الحضور والانضباط الميداني:</span>
                    <span className="font-bold text-emerald-400 font-mono">{realAttendanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all" style={{ width: `${realAttendanceRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>جلسات الحضور: {presentRecordsCount} من {memberAttRecords.length}</span>
                    <span>الوزن: 20%</span>
                  </div>
                </div>

                {/* 2. Quality & Tasks */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-bold">جودة ودقة تنفيذ المهام:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {latestMemberEval?.scores ? (latestMemberEval.scores['taskQuality'] || latestMemberEval.scores['crit-2'] || Math.round((member.performance.taskQuality / 5) * 100)) : (member.performance.taskQuality ? Math.round((member.performance.taskQuality / 5) * 100) : 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all" 
                      style={{ width: `${latestMemberEval?.scores ? (latestMemberEval.scores['taskQuality'] || latestMemberEval.scores['crit-2'] || (member.performance.taskQuality / 5) * 100) : (member.performance.taskQuality / 5) * 100}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>مستوى الإتقان والمواصفات الفنية</span>
                    <span>الوزن: 25%</span>
                  </div>
                </div>

                {/* 3. Task Completion */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-bold">نسبة إنجاز المهام المسندة:</span>
                    <span className="font-bold text-blue-400 font-mono">{member.performance.taskCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${member.performance.taskCompletionRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>تسليم المهام في المواعيد المحددة</span>
                    <span>الوزن: 25%</span>
                  </div>
                </div>

                {/* 4. Commitment & Teamwork */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-bold">الالتزام والعمل الجماعي:</span>
                    <span className="font-bold text-sky-400 font-mono">{member.performance.commitment}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full transition-all" style={{ width: `${member.performance.commitment}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>التعاون ودعم الزملاء والمبادرة</span>
                    <span>الوزن: 30%</span>
                  </div>
                </div>

                {/* Evaluator Notes if present */}
                {latestMemberEval?.feedback && (
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300 mt-1">
                    <span className="font-bold text-sky-300">ملاحظات التقييم الميداني ({latestMemberEval.evaluatorName}):</span>
                    <p className="mt-0.5">{latestMemberEval.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Hobbies & Learning Aspirations Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Hobbies Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              <span>الهوايات والمواهب الشخصية:</span>
            </h4>
            {(!member.hobbies || member.hobbies.length === 0) ? (
              <p className="text-[11px] text-slate-500">لم يتم تحديد هوايات بعد.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {member.hobbies.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 text-[11px] font-semibold">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Learning Aspirations Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>ما يطمح لتعلمه وتطويره:</span>
            </h4>
            {(!member.learningAspirations || member.learningAspirations.length === 0) ? (
              <p className="text-[11px] text-slate-500">لم يتم تحديد أهداف تعليمية بعد.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {member.learningAspirations.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] font-semibold">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Badges & Honors Section (الأوسمة والأنواط) */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40 border border-amber-500/30">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الأوسمة والأنواط الممنوحة ({member.badges?.length || 0})</span>
            </h4>
            
            {isHighLeadership && (
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      grantBadgeToMember(member.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-950 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                >
                  <option value="" disabled>+ منح وسام جديد للعضو</option>
                  {badges.filter(b => !(member.badges || []).includes(b.id)).map(b => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.icon} {b.titleAr || b.title} (+{b.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(!member.badges || member.badges.length === 0) ? (
            <p className="text-xs text-slate-500 py-2">لا توجد أوسمة ممنوحة لهذا العضو حتى الآن.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {member.badges.map(bId => {
                const bInfo = badges.find(b => b.id === bId);
                return (
                  <div key={bId} className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2 shadow-sm group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{bInfo?.icon || '🏅'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{bInfo?.titleAr || bInfo?.title || bId}</div>
                        <div className="text-[9px] text-amber-400 font-mono">+{bInfo?.xpReward || 50} XP</div>
                      </div>
                    </div>

                    {isHighLeadership && (
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من سحب وسام "${bInfo?.titleAr || bId}" من هذا العضو؟`)) {
                            revokeBadgeFromMember(member.id, bId);
                          }
                        }}
                        className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer text-[10px]"
                        title="سحب الوسام"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skills Matrix */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>مصفوفة المهارات المعتمدة (Skills Matrix)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(member.skills).map(([skill, score]) => (
              <div key={skill} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{skill}</span>
                <div className="flex text-amber-400">
                  {'⭐'.repeat(score)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Skills & Certificates (المهارات المعتمدة والشهادات) */}
        {member.certifiedSkills && member.certifiedSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>المهارات والشهادات المعتمدة الموثقة ({member.certifiedSkills.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {member.certifiedSkills.map((cert) => (
                <div 
                  key={cert.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-amber-500/30 flex flex-col justify-between space-y-1 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-amber-300 text-xs">{cert.skillName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      {cert.issueDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    🏛️ {cert.provider}
                  </div>
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-sky-400 hover:underline truncate block"
                    >
                      رابط / كود الاعتماد: {cert.credentialUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Committee Transfer History */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-sky-400" />
            <span>السجل التاريخي والانتقال بين اللجان والمواسم (Multi-Season History)</span>
          </h4>

          <div className="space-y-2">
            {member.committeeHistory.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                مستمر في لجنته الحالية منذ الانضمام.
              </p>
            ) : (
              member.committeeHistory.map(hist => (
                <div key={hist.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{hist.committeeName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{hist.role}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">السبب: {hist.reason}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {hist.season} • {hist.startDate} ➔ {hist.endDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ban / Filter Confirmation Dialog Modal */}
        {isBanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-rose-600/60 p-6 space-y-4 text-right">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  {actionType === 'filter' ? <ShieldAlert className="w-5 h-5 text-rose-400" /> : <Ban className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {actionType === 'filter' ? 'تصفية واستبعاد العضو من الفريق' : 'حظر العضو نهائياً من المنصة'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {actionType === 'filter' ? 'سحب العضوية وإيقاف الحساب ومنع الدخول' : 'إدراج العضو بالقائمة السوداء وحظر حسابه'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-200 leading-relaxed">
                هل أنت متأكد من {actionType === 'filter' ? 'تصفية واستبعاد' : 'حظر'} العضو <strong className="text-white font-bold">{member.fullName}</strong>؟ سيتم إيقاف صلاحياته وجلسته فورا.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {actionType === 'filter' ? 'سبب قرار التصفية والاستبعاد *' : 'سبب قرار الحظر الرسمي *'}
                </label>
                <textarea
                  rows={3}
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder={actionType === 'filter' ? 'اكتب سبب تصفية واستبعاد العضو...' : 'اكتب سبب قرار الحظر...'}
                  className="glass-input w-full text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsBanModalOpen(false); setBanReasonInput(''); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBanOrFilter}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {actionType === 'filter' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  <span>{actionType === 'filter' ? 'تأكيد التصفية والاستبعاد' : 'تأكيد الحظر والإدراج بالقائمة السوداء'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
