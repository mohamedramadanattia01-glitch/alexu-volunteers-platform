import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';
import { 
  Users, Search, Filter, Plus, Shield, Award, 
  ChevronLeft, Eye, ArrowRightLeft, AlertTriangle, 
  Download, FileSpreadsheet, ChevronDown, Check,
  Upload, Trash2, ShieldAlert, UserPlus, Phone, Ban, RotateCcw
} from 'lucide-react';
import { exportMembersToExcel } from '../../utils/excelExport';
import { RecruitmentPipeline } from '../recruitment/RecruitmentPipeline';
import { ALEXANDRIA_UNIVERSITY_COLLEGES } from '../../data/colleges';

interface MembersDirectoryProps {
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenTransferModal: (member: Member) => void;
  onOpenImportModal?: () => void;
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({
  onSelectMember,
  onOpenAddMember,
  onOpenTransferModal,
  onOpenImportModal
}) => {
  const { 
    members, committees, currentUser, isHighLeadership, 
    deleteMember, banMember, unbanMember, showNotification 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'recruitment'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Delete Modal State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [alsoBanOnDelete, setAlsoBanOnDelete] = useState(false);
  const [deleteBanReason, setDeleteBanReason] = useState('');

  // Ban Modal State
  const [memberToBan, setMemberToBan] = useState<Member | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  const filteredMembers = members.filter(m => {
    const volId = m.volunteerId || '';
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.universityEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComm = selectedCommittee === 'all' || m.currentCommitteeId === selectedCommittee;
    const matchesCollege = selectedCollege === 'all' || m.college === selectedCollege;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || m.engagementRisk === selectedRisk;
    return matchesSearch && matchesComm && matchesCollege && matchesStatus && matchesRisk;
  });

  const canManage = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head' || currentUser.role === 'hr_admin';

  const handleExportFullTeam = () => {
    exportMembersToExcel(members, 'جميع_أعضاء_الفريق');
    setShowExportMenu(false);
  };

  const handleExportFiltered = () => {
    const commName = selectedCommittee === 'all' ? 'الفريق_المصفى' : (committees.find(c => c.id === selectedCommittee)?.name || 'اللجنة');
    exportMembersToExcel(filteredMembers, commName);
    setShowExportMenu(false);
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    deleteMember(memberToDelete.id, alsoBanOnDelete, deleteBanReason || 'حظر دائم مع حذف السجل');
    showNotification('success', `تم حذف العضو ${memberToDelete.fullName} بنجاح ${alsoBanOnDelete ? 'وإدراجه بالقائمة السوداء' : ''}`);
    setMemberToDelete(null);
    setAlsoBanOnDelete(false);
    setDeleteBanReason('');
  };

  const confirmBanMember = () => {
    if (!memberToBan) return;
    const reason = banReasonInput.trim() || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي';
    banMember(memberToBan.id, reason);
    setMemberToBan(null);
    setBanReasonInput('');
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-10">
      
      {/* Sub-tab Navigation */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 w-fit text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>سجل الأعضاء النشطين ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('recruitment')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'recruitment'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>مسار الاستقطاب والمقابلات (Recruitment)</span>
        </button>
      </div>

      {activeSubTab === 'recruitment' ? (
        <RecruitmentPipeline />
      ) : (
        <>
          {/* Header */}
      <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              شؤون المتطوعين وسجل العضوية
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            دليل وأرشيف فريق المتطوعين
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة بيانات الأعضاء، الأرقام التطوعية الفريدة (AU- / OC- / HR- / MD- / DS-)، واستيراد وتصدير ملفات Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تصدير Excel</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-30 text-right space-y-1 animate-in fade-in">
                <button
                  onClick={handleExportFullTeam}
                  className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span>تصدير الفريق بالكامل ({members.length} عضو)</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={handleExportFiltered}
                  className="w-full text-right p-2.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <span>تصدير القائمة الحالية ({filteredMembers.length} عضو)</span>
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Import Button for Leadership */}
          {canManage && onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white border-blue-500/40 text-blue-300"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>استيراد Excel / CSV</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={onOpenAddMember}
              className="btn-primary text-xs py-2 px-3.5 cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عضو جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3.5 flex flex-col lg:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكلية أو الكود التطوعي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input text-xs pr-9 py-2"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="glass-input text-xs py-2"
          >
            <option value="all">جميع اللجان</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="glass-input text-xs py-2 max-w-[150px] truncate"
          >
            <option value="all">جميع الكليات (21)</option>
            {ALEXANDRIA_UNIVERSITY_COLLEGES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="glass-input text-xs py-2"
          >
            <option value="all">جميع الحالات</option>
            <option value="Active">نشط (Active)</option>
            <option value="Pending">تحت التأهيل (Pending)</option>
            <option value="Banned">⛔ المحظورين (Banned)</option>
            <option value="On Leave">إجازة (On Leave)</option>
            <option value="Alumni">خريج (Alumni)</option>
            <option value="Archived">مؤرشف (Archived)</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="glass-input text-xs py-2"
          >
            <option value="all">مستويات التفاعل</option>
            <option value="High">⚠️ مخاطر عالية</option>
            <option value="Medium">متوسط</option>
            <option value="Low">طبيعي وممتاز</option>
          </select>
        </div>
      </div>

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredMembers.map(member => (
          <div 
            key={member.id}
            className={`glass-card p-4 glass-card-hover border-slate-800 flex flex-col justify-between ${
              member.status === 'Banned' ? 'border-rose-900/60 bg-rose-950/20' : ''
            }`}
          >
            <div>
              {/* Member Top Bar */}
              <div className="flex items-start justify-between gap-2.5 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={member.avatarUrl} 
                    alt="" 
                    className={`w-11 h-11 rounded-xl object-cover border shadow-md ${
                      member.status === 'Banned' ? 'border-rose-500/60 grayscale' : 'border-blue-400/40'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white leading-snug">{member.fullName}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-sky-400 font-bold bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/30">
                        {member.volunteerId || member.id}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{member.college}</p>
                    </div>
                  </div>
                </div>

                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                  member.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  member.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  member.status === 'Banned' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 font-bold flex items-center gap-1' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {member.status === 'Banned' && <Ban className="w-2.5 h-2.5" />}
                  <span>{member.status === 'Banned' ? 'محظور نهائياً' : member.status}</span>
                </span>
              </div>

              {/* Banned Notice Banner if Banned */}
              {member.status === 'Banned' && (
                <div className="bg-rose-950/50 p-2 rounded-xl border border-rose-800/50 text-[10px] text-rose-200 mb-2.5 space-y-0.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>سبب الحظر والاستبعاد:</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">{member.banReason || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي'}</p>
                  {member.bannedAt && (
                    <div className="text-[9px] text-rose-400/80 font-mono mt-0.5">
                      بتاريخ: {new Date(member.bannedAt).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>
              )}

              {/* Committee & Position */}
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-[11px] mb-2.5 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">اللجنة:</span>
                  <span className="font-bold text-blue-400">{member.currentCommitteeName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الموقع:</span>
                  <span className="text-slate-200">{member.position}</span>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-2.5">
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                  <div className="text-[9px] text-slate-400">الأداء العام</div>
                  <div className="font-bold text-emerald-400 font-mono text-xs">{member.performance.overallScore}%</div>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                  <div className="text-[9px] text-slate-400">الحضور</div>
                  <div className="font-bold text-sky-400 font-mono text-xs">{member.performance.attendanceRate}%</div>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                  <div className="text-[9px] text-slate-400">النقاط</div>
                  <div className="font-bold text-amber-400 font-mono text-xs">{member.points} XP</div>
                </div>
              </div>

              {/* Engagement Risk Warning if High */}
              {member.engagementRisk === 'High' && member.status !== 'Banned' && (
                <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1 mb-2">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>تنبيه: معرض لانخفاض النشاط (High Risk)</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-800">
              <button
                onClick={() => onSelectMember(member.id)}
                className="btn-primary text-xs py-1.5 flex-1 cursor-pointer flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>عرض الملف</span>
              </button>

              {member.whatsappNumber && member.status !== 'Banned' && (
                <a
                  href={`https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="محادثة واتساب فورية"
                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-200 cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}

              {canManage && member.status !== 'Banned' && (
                <button
                  onClick={() => onOpenTransferModal(member)}
                  title="نقل إلى لجنة أخرى"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Ban / Unban Button for High Leadership */}
              {isHighLeadership && member.id !== currentUser.id && (
                <>
                  {member.status === 'Banned' ? (
                    <button
                      onClick={() => unbanMember(member.id)}
                      title="إلغاء الحظر واستعادة العضو"
                      className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/60 text-emerald-400 hover:text-emerald-200 cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إلغاء الحظر</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setMemberToBan(member)}
                      title="حظر واستبعاد العضو نهائياً"
                      className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-400 hover:text-amber-200 cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => setMemberToDelete(member)}
                    title="حذف العضو"
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-400 hover:text-rose-200 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Ban Member Confirmation Modal */}
      {memberToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-amber-500/50 p-6 space-y-4 text-right">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">حظر واستبعاد العضو نهائياً</h3>
                <p className="text-[11px] text-slate-400">إدراج العضو بالقائمة السوداء ومنعه من المنصة</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-200 leading-relaxed">
              تنبيه: سيتم إيقاف حساب العضو <strong className="text-white font-bold">{memberToBan.fullName}</strong> فورا ومنعه نهائيا من تسجيل الدخول أو إنشاء حساب جديد بنفس البريد أو الرقم القومي.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                سبب الحظر والاستبعاد الرسمي *
              </label>
              <textarea
                rows={3}
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                placeholder="اكتب سبب قرار الاستبعاد (مثال: مخالفة اللائحة التنظيمية، عدم الالتزام الميداني...)"
                className="glass-input w-full text-xs resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setMemberToBan(null); setBanReasonInput(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmBanMember}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>تأكيد الحظر والإدراج بالقائمة السوداء</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (with optional permanent ban) */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-rose-900/60 p-6 space-y-4 text-right">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">تأكيد حذف سجل العضو</h3>
                <p className="text-[11px] text-slate-400">حذف بيانات المتطوع من قاعدة بيانات الفريق</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف العضو <strong className="text-white font-bold">{memberToDelete.fullName}</strong> ({memberToDelete.universityEmail})؟
            </p>

            {/* Blacklist checkbox */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoBanOnDelete}
                  onChange={(e) => setAlsoBanOnDelete(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-700 focus:ring-rose-500 cursor-pointer"
                />
                <span>إدراج البريد والرقم القومي في القائمة السوداء (حظر دائم)</span>
              </label>

              {alsoBanOnDelete && (
                <input
                  type="text"
                  value={deleteBanReason}
                  onChange={(e) => setDeleteBanReason(e.target.value)}
                  placeholder="سبب الحظر بالقائمة السوداء..."
                  className="glass-input w-full text-xs mt-1"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => { setMemberToDelete(null); setAlsoBanOnDelete(false); setDeleteBanReason(''); }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteMember}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )}

    </div>
  );
};
