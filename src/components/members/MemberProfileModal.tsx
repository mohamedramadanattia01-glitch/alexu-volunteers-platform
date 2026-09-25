import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  X, Eye, EyeOff, ShieldCheck, Award, FileText, 
  Calendar, Phone, Mail, GraduationCap, Clock, 
  Sparkles, History, Star, ArrowRightLeft, HeartHandshake,
  Heart, Edit3, Ban, ShieldAlert, RotateCcw 
} from 'lucide-react';

interface MemberProfileModalProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDigitalPortfolio: (member: Member) => void;
  onOpenEditProfile?: (member: Member) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  memberId,
  isOpen,
  onClose,
  onOpenDigitalPortfolio,
  onOpenEditProfile
}) => {
  const { members, revealNationalId, currentUser, badges, isHighLeadership, banMember, unbanMember, filterOutMember } = useApp();
  const [isNationalIdRevealed, setIsNationalIdRevealed] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [actionType, setActionType] = useState<'ban' | 'filter'>('ban');

  if (!isOpen || !memberId) return null;

  const member = members.find(m => m.id === memberId);
  if (!member) return null;

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
                member.status === 'Banned' ? 'border-rose-500/60 grayscale' : 'border-blue-500/50'
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
                    : isHighLeadershipMember(member)
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {member.status === 'Banned' ? 'محظور' : isHighLeadershipMember(member) ? '👑 قيادة عليا وإشراف عام' : `المستوى ${member.level} (${member.points} XP)`}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{member.fullName}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {member.position} • {member.college} - {member.academicYear}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        {/* 2-Columns Grid: Personal Info & Performance */}
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
                {member.whatsappNumber ? (
                  <a
                    href={`https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
                  >
                    <span>{member.whatsappNumber}</span>
                    <span className="text-[10px]">(فتح الشات 💬)</span>
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

              <div className="flex justify-between items-center">
                <span className="text-slate-400">تاريخ الميلاد والعمر:</span>
                <span className="text-slate-300">{member.birthDate} ({member.age} سنة)</span>
              </div>
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

          {/* Performance 360 Matrix (Hidden for High Leadership) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{isHighLeadershipMember(member) ? 'بيانات الصفة الإدارية والإشراف العام' : 'مصفوفة الأداء الشامل 360°'}</span>
            </h4>

            {isHighLeadershipMember(member) ? (
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-bold border-b border-purple-500/20 pb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>👑 صفة القيادة العليا والإشراف العام</span>
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
            ) : (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">نسبة الحضور والانضباط</span>
                    <span className="font-bold text-emerald-400 font-mono">{member.performance.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${member.performance.attendanceRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">نسبة إنجاز المهام</span>
                    <span className="font-bold text-blue-400 font-mono">{member.performance.taskCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${member.performance.taskCompletionRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">جودة المهام (Task Quality)</span>
                    <span className="font-bold text-amber-400 font-mono">{member.performance.taskQuality} / 5</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(member.performance.taskQuality / 5) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">الالتزام والمسؤولية</span>
                    <span className="font-bold text-sky-400 font-mono">{member.performance.commitment}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${member.performance.commitment}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">القيادة والمبادرة (Leadership Potential)</span>
                    <span className="font-bold text-purple-400 font-mono">{member.performance.leadership}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${member.performance.leadership}%` }} />
                  </div>
                </div>
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
