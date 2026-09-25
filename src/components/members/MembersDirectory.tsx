import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, MemberStatus } from '../../types';
import { 
  Users, Search, Filter, Plus, Shield, Award, 
  ChevronLeft, Eye, ArrowRightLeft, AlertTriangle, 
  Download, FileSpreadsheet, ChevronDown, Check,
  Upload, Trash2, ShieldAlert, UserPlus, Phone, Ban, RotateCcw,
  Printer, Table, Grid, Sparkles, Mail, Lock
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
    deleteMember, banMember, unbanMember, filterOutMember, showNotification 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'master_grid' | 'recruitment'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Delete Modal State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [alsoBanOnDelete, setAlsoBanOnDelete] = useState(true);
  const [deleteBanReason, setDeleteBanReason] = useState('');

  // Ban Modal State
  const [memberToBan, setMemberToBan] = useState<Member | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  // Filter Out Modal State
  const [memberToFilterOut, setMemberToFilterOut] = useState<Member | null>(null);
  const [filterOutReasonInput, setFilterOutReasonInput] = useState('');

  const filteredMembers = members.filter(m => {
    const volId = m.volunteerId || '';
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.universityEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery)) ||
      (m.whatsappNumber && m.whatsappNumber.includes(searchQuery)) ||
      (m.nationalId && m.nationalId.includes(searchQuery));

    const matchesComm = selectedCommittee === 'all' || m.currentCommitteeId === selectedCommittee;
    const matchesCollege = selectedCollege === 'all' || m.college === selectedCollege;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || m.engagementRisk === selectedRisk;
    return matchesSearch && matchesComm && matchesCollege && matchesStatus && matchesRisk;
  });

  const canManage = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head' || currentUser.role === 'hr_admin';

  const handleExportFullTeam = () => {
    exportMembersToExcel(members, 'شيت_قاعدة_بيانات_فريق_المتطوعين_الشامل');
    setShowExportMenu(false);
    showNotification('success', 'تم تصدير ملف Excel الشامل لجميع أعضاء الفريق بنجاح');
  };

  const handleExportFiltered = () => {
    const commName = selectedCommittee === 'all' ? 'شيت_أعضاء_الفريق_المصفى' : (committees.find(c => c.id === selectedCommittee)?.name || 'اللجنة');
    exportMembersToExcel(filteredMembers, commName);
    setShowExportMenu(false);
    showNotification('success', 'تم تصدير ملف Excel للقائمة المحددة بنجاح');
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    deleteMember(memberToDelete.id, alsoBanOnDelete, deleteBanReason || 'حظر دائم مع حذف السجل');
    showNotification('success', `تم حذف واستبعاد العضو ${memberToDelete.fullName} بنجاح وإدراجه بالقائمة السوداء لمنع دخوله.`);
    setMemberToDelete(null);
    setAlsoBanOnDelete(true);
    setDeleteBanReason('');
  };

  const confirmBanMember = () => {
    if (!memberToBan) return;
    const reason = banReasonInput.trim() || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي';
    banMember(memberToBan.id, reason);
    setMemberToBan(null);
    setBanReasonInput('');
  };

  const confirmFilterOutMember = () => {
    if (!memberToFilterOut) return;
    const reason = filterOutReasonInput.trim() || 'تصفية واستبعاد من الفريق مع إيقاف الحساب وسحب الصلاحيات';
    filterOutMember(memberToFilterOut.id, reason);
    setMemberToFilterOut(null);
    setFilterOutReasonInput('');
  };

  return (
    <div className="space-y-5 animate-in fade-in pb-10">
      
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900/90 p-1.5 border border-slate-800 w-fit text-xs font-bold shadow-lg">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'directory'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>بطاقات الأعضاء ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('master_grid')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'master_grid'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-emerald-300" />
          <span>📊 شيت وقاعدة بيانات كل الأعضاء (Master Grid)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recruitment')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
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
                  شؤون المتطوعين وسجل العضوية المعتمد
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {activeSubTab === 'master_grid' ? 'قاعدة بيانات وشيت جميع أعضاء الفريق' : 'دليل وأرشيف فريق المتطوعين'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeSubTab === 'master_grid' 
                  ? 'عرض تفصيلي بصيغة شيت إكسيل حيث كل معلومة في خلية مستقلة، مع إمكانية التصفية، التصدير، والطباعة'
                  : 'إدارة بيانات الأعضاء، الأرقام التطوعية الفريدة (AU- / OC- / HR- / MD- / DS-)، واستيراد وتصدير ملفات Excel'}
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
                  <span>تصدير Excel (.xlsx)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showExportMenu && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-30 text-right space-y-1 animate-in fade-in">
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
                      <span>تصدير القائمة المصفاة ({filteredMembers.length} عضو)</span>
                      <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Print PDF Button */}
              <button
                onClick={() => window.print()}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
                title="طباعة أو تصدير كـ PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>طباعة / PDF</span>
              </button>

              {canManage && onOpenImportModal && (
                <button
                  onClick={onOpenImportModal}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>استيراد Excel</span>
                </button>
              )}

              {canManage && (
                <button
                  onClick={onOpenAddMember}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عضو جديد</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الرقم التطوعي (AU-...)، الرقم القومي، البريد، أو رقم الهاتف..."
                  className="glass-input pr-10 text-xs w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Committee filter */}
                <select
                  value={selectedCommittee}
                  onChange={(e) => setSelectedCommittee(e.target.value)}
                  className="glass-input text-xs cursor-pointer w-full sm:w-auto"
                >
                  <option value="all" className="bg-slate-900 text-white">كل اللجان (6)</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                  ))}
                </select>

                {/* College filter */}
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="glass-input text-xs cursor-pointer w-full sm:w-auto"
                >
                  <option value="all" className="bg-slate-900 text-white">كل الكليات</option>
                  {ALEXANDRIA_UNIVERSITY_COLLEGES.map(col => (
                    <option key={col} value={col} className="bg-slate-900 text-white">{col}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="glass-input text-xs cursor-pointer w-full sm:w-auto"
                >
                  <option value="all" className="bg-slate-900 text-white">كل الحالات</option>
                  <option value="Active" className="bg-slate-900 text-emerald-400">🟢 نشط ومفعل</option>
                  <option value="Pending" className="bg-slate-900 text-amber-400">🟡 قيد المراجعة</option>
                  <option value="Banned" className="bg-slate-900 text-rose-400">⛔ المحظورين (Banned)</option>
                  <option value="Inactive" className="bg-slate-900 text-slate-400">غير نشط</option>
                  <option value="Archived" className="bg-slate-900 text-slate-400">مؤرشف</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>عرض {filteredMembers.length} من أصل {members.length} عضو مسجل</span>
              {(searchQuery || selectedCommittee !== 'all' || selectedCollege !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCommittee('all'); setSelectedCollege('all'); setSelectedStatus('all'); }}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW 1: MASTER EXCEL GRID TABLE VIEW (Every Field in Cell) */}
          {/* ========================================================= */}
          {activeSubTab === 'master_grid' && (
            <div className="glass-card overflow-hidden border border-emerald-500/30">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-bold whitespace-nowrap">
                      <th className="p-3 border-l border-slate-800">#</th>
                      <th className="p-3 border-l border-slate-800">الرقم التطوعي</th>
                      <th className="p-3 border-l border-slate-800 min-w-[180px]">الاسم الكامل</th>
                      <th className="p-3 border-l border-slate-800">الرقم القومي</th>
                      <th className="p-3 border-l border-slate-800">البريد الجامعي المعتمد</th>
                      <th className="p-3 border-l border-slate-800">رقم الهاتف / واتساب</th>
                      <th className="p-3 border-l border-slate-800 min-w-[140px]">الكلية</th>
                      <th className="p-3 border-l border-slate-800">الفرقة</th>
                      <th className="p-3 border-l border-slate-800 min-w-[130px]">اللجنة</th>
                      <th className="p-3 border-l border-slate-800">المسمى التنظيمي</th>
                      <th className="p-3 border-l border-slate-800">حالة الحساب</th>
                      <th className="p-3 border-l border-slate-800">فصيلة الدم</th>
                      <th className="p-3 border-l border-slate-800">تاريخ الانضمام</th>
                      <th className="p-3 border-l border-slate-800">نقاط التطوع</th>
                      <th className="p-3 border-l border-slate-800">التقييم</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={16} className="p-8 text-center text-slate-400 font-sans text-xs">
                          لا توجد بيانات مطابقة لخيارات البحث والفلاتر المحددة.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member, idx) => (
                        <tr key={member.id} className="hover:bg-slate-800/40 transition-colors whitespace-nowrap">
                          <td className="p-3 border-l border-slate-800/60 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3 border-l border-slate-800/60 font-bold text-sky-400">
                            {member.volunteerId || member.id}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans font-bold text-white flex items-center gap-2">
                            <img src={member.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover border border-slate-700 shrink-0" />
                            <span>{member.fullName}</span>
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-slate-300">
                            {member.nationalId || '—'}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-slate-300">
                            {member.universityEmail}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-emerald-400 font-bold">
                            {member.phone || member.whatsappNumber || '—'}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans text-slate-300">
                            {member.college}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans text-slate-300">
                            {member.academicYear}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                              {member.currentCommitteeName}
                            </span>
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans text-slate-200">
                            {member.position}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 font-sans">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              member.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              member.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              member.status === 'Banned' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {member.status === 'Active' ? 'نشط' : member.status === 'Pending' ? 'قيد المراجعة' : member.status === 'Banned' ? 'محظور ⛔' : member.status}
                            </span>
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-slate-300">
                            {member.bloodType || '—'}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-slate-400">
                            {member.joinDate}
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-amber-400 font-bold">
                            {member.points || 0} XP
                          </td>
                          <td className="p-3 border-l border-slate-800/60 text-emerald-400 font-bold">
                            {member.performance?.overallScore || 0}%
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1 font-sans">
                              <button
                                onClick={() => onSelectMember(member.id)}
                                className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/60 border border-blue-500/40 text-blue-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                عرض
                              </button>
                              {canManage && member.id !== currentUser.id && (
                                <button
                                  onClick={() => setMemberToFilterOut(member)}
                                  className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                  title="تصفية واستبعاد"
                                >
                                  استبعاد
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: CARDS DIRECTORY VIEW */}
          {/* ========================================================= */}
          {activeSubTab === 'directory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <div 
                  key={member.id}
                  className={`glass-card p-4 transition-all relative overflow-hidden group ${
                    member.status === 'Banned' ? 'border-rose-800/60 bg-rose-950/15' : 'hover:border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative cursor-pointer" onClick={() => onSelectMember(member.id)}>
                      <img 
                        src={member.avatarUrl} 
                        alt={member.fullName} 
                        className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-md ${
                          member.status === 'Banned' ? 'border-rose-500/60 grayscale' : 'border-blue-500/40'
                        }`}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        member.status === 'Active' ? 'bg-emerald-500' : 
                        member.status === 'Pending' ? 'bg-amber-500' :
                        member.status === 'Banned' ? 'bg-rose-600' : 'bg-slate-500'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30">
                          {member.volunteerId || member.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          member.status === 'Banned' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {member.currentCommitteeName}
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectMember(member.id)}
                        className="text-sm font-bold text-white truncate mt-1 cursor-pointer hover:text-sky-300 transition-colors"
                      >
                        {member.fullName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {member.position} • {member.college}
                      </p>
                    </div>
                  </div>

                  {/* Badges / Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center mb-3">
                    <div>
                      <div className="text-[9px] text-slate-400">النقاط XP</div>
                      <div className="text-xs font-mono font-bold text-amber-400">{member.points || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">الحضور</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">{member.performance?.attendanceRate || 0}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400">التقييم</div>
                      <div className="text-xs font-mono font-bold text-purple-400">{member.performance?.overallScore || 0}%</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() => onSelectMember(member.id)}
                      className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض الملف</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {canManage && (
                        <button
                          onClick={() => onOpenTransferModal(member)}
                          title="تحويل للجنة أخرى"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Ban / Filter / Delete Buttons for High Leadership */}
                      {isHighLeadership && member.id !== currentUser.id && (
                        <>
                          {member.status === 'Banned' ? (
                            <button
                              onClick={() => unbanMember(member.id)}
                              title="إلغاء الحظر وإعادة التفعيل"
                              className="px-2 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>إلغاء الحظر</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setMemberToFilterOut(member)}
                                title="تصفية واستبعاد العضو من الفريق وحظر الدخول"
                                className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                <span className="hidden sm:inline">تصفية واستبعاد</span>
                              </button>

                              <button
                                onClick={() => setMemberToBan(member)}
                                title="حظر العضو نهائياً"
                                className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 text-amber-400 hover:text-amber-200 cursor-pointer transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setMemberToDelete(member)}
                            title="حذف العضو نهائياً"
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-400 hover:text-rose-200 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Filter Out / Dismiss Member Confirmation Modal */}
          {memberToFilterOut && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-rose-600/60 p-6 space-y-4 text-right">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">تصفية واستبعاد عضو من الفريق</h3>
                    <p className="text-[11px] text-slate-400">إيقاف الحساب وسحب كافة الصلاحيات ومنع الدخول</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 leading-relaxed space-y-1">
                  <p>
                    سيتم تصفية واستبعاد العضو <strong className="text-white font-bold">{memberToFilterOut.fullName}</strong> ({memberToFilterOut.universityEmail}) من الفريق فوراً.
                  </p>
                  <p className="text-[11px] text-rose-300 font-semibold">
                    ⛔ سيتم إنهاء جلسته الحالية ومنعه تماماً من دخول التطبيق أو إعادة التسجيل.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    سبب التصفية والاستبعاد الرسمي *
                  </label>
                  <textarea
                    rows={3}
                    value={filterOutReasonInput}
                    onChange={(e) => setFilterOutReasonInput(e.target.value)}
                    placeholder="اكتب سبب تصفية واستبعاد العضو (مثال: عدم الالتزام بمهام اللجنة، الغياب المتكرر، تصفية المرحلة...)"
                    className="glass-input w-full text-xs resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setMemberToFilterOut(null); setFilterOutReasonInput(''); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={confirmFilterOutMember}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>تأكيد التصفية والاستبعاد والحظر</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* Delete Confirmation Modal */}
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
