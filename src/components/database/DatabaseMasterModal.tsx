import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Role, Committee, MemberStatus } from '../../types';
import { 
  Database, X, Search, Filter, Edit3, Trash2, ShieldCheck, 
  Check, Save, RefreshCw, Crown, AlertCircle, Plus, Users, 
  Key, ArrowRightLeft, Sparkles, Sliders, CheckCircle2, Cloud
} from 'lucide-react';
import { ALL_ROLES_INFO, isHighLeadershipRole, isHeadRole } from '../../utils/roleUtils';
import { parseEgyptianNationalId } from '../../utils/nationalId';

interface DatabaseMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseMasterModal: React.FC<DatabaseMasterModalProps> = ({ isOpen, onClose }) => {
  const { 
    members, committees, updateMember, deleteMember, addMember, 
    changeVolunteerId, isVolunteerIdAvailable,
    syncWithCloud, isSupabaseConnected, currentUser, isHighLeadership 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommitteeFilter, setSelectedCommitteeFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Form State for editing / inserting
  const [editForm, setEditForm] = useState<{
    id: string;
    fullName: string;
    universityEmail: string;
    volunteerId: string;
    password?: string;
    nationalId: string;
    phone: string;
    whatsappNumber: string;
    college: string;
    academicYear: string;
    currentCommitteeId: string;
    role: Role;
    position: string;
    points: number;
    level: number;
    status: MemberStatus;
  }>({
    id: '',
    fullName: '',
    universityEmail: '',
    volunteerId: '',
    password: '',
    nationalId: '',
    phone: '',
    whatsappNumber: '',
    college: 'جامعة الإسكندرية',
    academicYear: 'الفرقة الثالثة',
    currentCommitteeId: 'comm-org',
    role: 'member',
    position: 'عضو متطوع',
    points: 0,
    level: 1,
    status: 'Active'
  });

  if (!isOpen) return null;

  // Filter Members
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      m.fullName.toLowerCase().includes(q) ||
      m.volunteerId.toLowerCase().includes(q) ||
      m.universityEmail.toLowerCase().includes(q) ||
      (m.position && m.position.toLowerCase().includes(q)) ||
      (m.nationalId && m.nationalId.includes(q)) ||
      (m.phone && m.phone.includes(q));

    const matchesComm = selectedCommitteeFilter === 'all' || m.currentCommitteeId === selectedCommitteeFilter;
    const matchesRole = selectedRoleFilter === 'all' || m.role === selectedRoleFilter;

    return matchesQuery && matchesComm && matchesRole;
  });

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setEditForm({
      id: m.id,
      fullName: m.fullName || '',
      universityEmail: m.universityEmail || '',
      volunteerId: m.volunteerId || '',
      password: m.password || '',
      nationalId: m.nationalId || '',
      phone: m.phone || m.whatsappNumber || '',
      whatsappNumber: m.whatsappNumber || m.phone || '',
      college: m.college || 'جامعة الإسكندرية',
      academicYear: m.academicYear || 'الفرقة الثالثة',
      currentCommitteeId: m.currentCommitteeId || 'comm-org',
      role: m.role || 'member',
      position: m.position || 'عضو متطوع',
      points: m.points || 0,
      level: m.level || 1,
      status: m.status || 'Active'
    });
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.fullName.trim()) return;

    const targetComm = committees.find(c => c.id === editForm.currentCommitteeId);
    const commName = targetComm ? targetComm.name : 'لجنة التنظيم';
    const isLeadOrHead = isHighLeadershipRole(editForm.role) || editForm.role === 'head' || editForm.role === 'vice_head' || editForm.currentCommitteeId === 'comm-leadership';

    // 1. Handle Volunteer ID change or swap if changed
    const originalVolId = (editingMember?.volunteerId || '').trim().toUpperCase();
    const newVolId = editForm.volunteerId.trim().toUpperCase();
    if (newVolId && newVolId !== originalVolId) {
      changeVolunteerId(editForm.id, newVolId, true);
    }

    const updates: Partial<Member> = {
      fullName: editForm.fullName.trim(),
      universityEmail: editForm.universityEmail.trim(),
      volunteerId: newVolId || originalVolId,
      password: editForm.password?.trim() || undefined,
      nationalId: editForm.nationalId.trim(),
      phone: editForm.phone.trim(),
      whatsappNumber: editForm.whatsappNumber.trim(),
      college: editForm.college.trim(),
      academicYear: editForm.academicYear.trim(),
      currentCommitteeId: editForm.currentCommitteeId,
      currentCommitteeName: commName,
      role: editForm.role,
      position: editForm.position.trim(),
      points: isLeadOrHead ? 0 : Number(editForm.points),
      level: isLeadOrHead ? 1 : Number(editForm.level),
      status: editForm.status
    };

    updateMember(editForm.id, updates);
    setEditingMember(null);
    setSaveSuccessNotice(`تم حفظ وتحديث بيانات العضو "${editForm.fullName}" وتثبيت الرقم التطوعي (${newVolId || originalVolId}) بنجاح في قاعدة البيانات ✓`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleRoleChangeInForm = (newRole: Role) => {
    const isLeadership = editForm.currentCommitteeId === 'comm-leadership' || isHighLeadershipRole(newRole);
    let defaultPos = editForm.position;
    const targetComm = committees.find(c => c.id === editForm.currentCommitteeId);

    if (isLeadership) {
      switch (newRole) {
        case 'super_admin': defaultPos = 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية'; break;
        case 'vice_president': defaultPos = 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية'; break;
        case 'advisor': defaultPos = 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية'; break;
        case 'general_coordinator': defaultPos = 'المنسق العام لفريق المتطوعين'; break;
        case 'operations_manager': defaultPos = 'مدير العمليات والميدان'; break;
        case 'quality_officer': defaultPos = 'مسؤول الجودة والتقييم والتطوير المؤسسي'; break;
        default: defaultPos = 'عضو القيادة العليا والمجلس الاستشاري';
      }
    } else {
      switch (newRole) {
        case 'head': defaultPos = `رئيس ${targetComm?.name || 'اللجنة'}`; break;
        case 'vice_head': defaultPos = `نائب رئيس ${targetComm?.name || 'اللجنة'}`; break;
        case 'hr_admin': defaultPos = `مسؤول موارد بشرية بـ ${targetComm?.name || 'اللجنة'}`; break;
        default: defaultPos = `عضو متطوع بـ ${targetComm?.name || 'اللجنة'}`;
      }
    }

    setEditForm(prev => ({
      ...prev,
      role: newRole,
      position: defaultPos,
      points: isLeadership || newRole === 'head' || newRole === 'vice_head' ? 0 : prev.points,
      level: isLeadership || newRole === 'head' || newRole === 'vice_head' ? 1 : prev.level
    }));
  };

  const handleCommitteeChangeInForm = (commId: string) => {
    const targetComm = committees.find(c => c.id === commId);
    let newRole = editForm.role;
    let newPos = editForm.position;

    if (commId === 'comm-leadership') {
      newRole = editForm.role === 'super_admin' ? 'super_admin' : (editForm.role === 'vice_president' ? 'vice_president' : 'advisor');
      newPos = newRole === 'super_admin' ? 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية' :
               newRole === 'vice_president' ? 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية' :
               'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية';
    } else {
      if (isHighLeadershipRole(newRole)) {
        newRole = 'member';
      }
      newPos = newRole === 'head' ? `رئيس ${targetComm?.name}` :
               newRole === 'vice_head' ? `نائب رئيس ${targetComm?.name}` :
               `عضو متطوع بـ ${targetComm?.name}`;
    }

    setEditForm(prev => ({
      ...prev,
      currentCommitteeId: commId,
      role: newRole,
      position: newPos
    }));
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
    setSaveSuccessNotice('تمت المزامنة الكاملة مع قاعدة بيانات Supabase السحابية بنجاح ☁️');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-6xl w-full p-4 sm:p-6 border border-blue-500/40 shadow-2xl bg-slate-950 text-right my-4 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">لوحة التحكم الشاملة في قاعدة البيانات والتسكين</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                  صلاحية القيادة العليا
                </span>
              </div>
              <p className="text-xs text-slate-400">تعديل بيانات المتطوعين، المناصب، اللجان، كلمات المرور، والأكواد التطوعية مع الحفظ المباشر</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
              title="مزامنة فورية مع السحابة"
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جارِ المزامنة...' : 'مزامنة السحابة'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Success Alert */}
        {saveSuccessNotice && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Controls / Filter Bar */}
        <div className="my-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الكود، البريد، الهاتف، القومي..."
              className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 text-right"
            />
          </div>

          <div>
            <select
              value={selectedCommitteeFilter}
              onChange={e => setSelectedCommitteeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 text-right"
            >
              <option value="all">كل اللجان (الـ 6 + القيادة العليا)</option>
              {committees.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRoleFilter}
              onChange={e => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 text-right"
            >
              <option value="all">كل الأدوار والمناصب</option>
              <option value="super_admin">رئيس الفريق (Super Admin)</option>
              <option value="vice_president">نائب رئيس الفريق</option>
              <option value="advisor">مستشار الفريق</option>
              <option value="head">رئيس لجنة (Head)</option>
              <option value="vice_head">نائب رئيس لجنة (Vice Head)</option>
              <option value="hr_admin">مسؤول موارد بشرية</option>
              <option value="member">عضو متطوع</option>
            </select>
          </div>
        </div>

        {/* Database Records Table */}
        <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-900/50">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="p-3">الكود</th>
                <th className="p-3">الاسم الكامل</th>
                <th className="p-3">اللجنة المسكن عليها</th>
                <th className="p-3">الدور الإداري</th>
                <th className="p-3">المسمى الوظيفي الرسمي</th>
                <th className="p-3">النقاط</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    لا توجد سجلات تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const roleInfo = ALL_ROLES_INFO[m.role] || ALL_ROLES_INFO.member;
                  const isLead = isHighLeadershipRole(m.role) || m.currentCommitteeId === 'comm-leadership';

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-400">{m.volunteerId}</td>
                      <td className="p-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <img src={m.avatarUrl || '/logo.png'} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-700" />
                          <span>{m.fullName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          m.currentCommitteeId === 'comm-leadership' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {m.currentCommitteeName || 'لجنة التنظيم'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${roleInfo.badgeClass}`}>
                          {roleInfo.shortTitle}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium truncate max-w-xs">{m.position}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {isLead ? <span className="text-slate-500 text-[10px]">—</span> : `${m.points || 0} XP`}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' :
                          m.status === 'Banned' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {m.status === 'Active' ? 'نشط' : m.status === 'Banned' ? 'محظور' : m.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-xs"
                          title="تعديل وتسكين كامل في قاعدة البيانات"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل التسكين</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>إجمالي السجلات: {filteredMembers.length} من {members.length}</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            كافة التعديلات تحفظ فوراً في التخزين المحلي وتتزامن مع السحابة
          </span>
        </div>

        {/* Edit Member Database Record Modal */}
        {editingMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="glass-card max-w-xl w-full p-5 border border-blue-500/50 shadow-2xl bg-slate-950 text-right max-h-[92vh] overflow-y-auto my-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">تعديل سجل وقاعدة بيانات: {editingMember.fullName}</h4>
                    <p className="text-[10px] text-slate-400">تعديل التسكين، الدور، المسمى، الكود، وكلمة المرور</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">الكود التطوعي (Volunteer ID) *</label>
                      {editForm.volunteerId && (
                        (() => {
                          const check = isVolunteerIdAvailable(editForm.volunteerId, editForm.id);
                          if (!check.isAvailable && check.heldByMember) {
                            return (
                              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                <span>⚠️ مستخدم: {check.heldByMember.fullName}</span>
                              </span>
                            );
                          }
                          if (editForm.volunteerId !== editingMember?.volunteerId) {
                            return <span className="text-[10px] text-emerald-400 font-bold">✓ كود متاح وجديد</span>;
                          }
                          return null;
                        })()
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={editForm.volunteerId}
                      onChange={e => setEditForm(prev => ({ ...prev, volunteerId: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-sky-400 font-bold"
                    />
                    {(() => {
                      const check = isVolunteerIdAvailable(editForm.volunteerId, editForm.id);
                      if (!check.isAvailable && check.heldByMember) {
                        return (
                          <div className="mt-1.5 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-200">
                            <span>📌 هذا الكود مسجل لـ <b>{check.heldByMember.fullName}</b> ({check.heldByMember.currentCommitteeName || 'لجنة'}). عند الحفظ سيتم تبديل الكود ونقله لـ <b>{editForm.fullName}</b> تلقائياً ومزامنته في قاعدة البيانات.</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">اللجنة المسكن عليها *</label>
                    <select
                      value={editForm.currentCommitteeId}
                      onChange={e => handleCommitteeChangeInForm(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      {committees.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">الدور الإداري والصلاحية *</label>
                    <select
                      value={editForm.role}
                      onChange={e => handleRoleChangeInForm(e.target.value as Role)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="super_admin">👑 رئيس الفريق (Super Admin)</option>
                      <option value="vice_president">⭐ نائب رئيس الفريق</option>
                      <option value="advisor">🎓 مستشار الفريق</option>
                      <option value="general_coordinator">⚡ منسق عام الفريق</option>
                      <option value="operations_manager">🚨 مدير العمليات والميدان</option>
                      <option value="quality_officer">💎 مسؤول الجودة والتقييم</option>
                      <option value="head">🛡️ رئيس لجنة (Head)</option>
                      <option value="vice_head">🌟 نائب رئيس لجنة (Vice Head)</option>
                      <option value="hr_admin">👥 مسؤول موارد بشرية (HR)</option>
                      <option value="member">👤 عضو متطوع</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">المسمى الوظيفي الرسمي المعتمد *</label>
                  <input
                    type="text"
                    required
                    value={editForm.position}
                    onChange={e => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">البريد الجامعي / الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={editForm.universityEmail}
                      onChange={e => setEditForm(prev => ({ ...prev, universityEmail: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">كلمة المرور / الرمز السري</label>
                    <input
                      type="text"
                      value={editForm.password || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="كلمة مرور الحساب..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">الرقم القومي (14 رقم)</label>
                    <input
                      type="text"
                      value={editForm.nationalId}
                      onChange={e => setEditForm(prev => ({ ...prev, nationalId: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">رقم الواتساب</label>
                    <input
                      type="text"
                      value={editForm.whatsappNumber}
                      onChange={e => setEditForm(prev => ({ ...prev, whatsappNumber: e.target.value, phone: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">حالة العضوية</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="Active">🟢 نشط (Active)</option>
                      <option value="Pending">🟡 قيد المراجعة (Pending)</option>
                      <option value="Archived">⚪ مؤرشف (Archived)</option>
                      <option value="Banned">🔴 محظور ومستبعد (Banned)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ وتحديث في قاعدة البيانات فوراً</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
