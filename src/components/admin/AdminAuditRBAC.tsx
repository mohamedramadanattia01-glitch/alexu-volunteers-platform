import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, Permission } from '../../types';
import { 
  ShieldAlert, Shield, Search, Lock, CheckCircle2, History, 
  Users, Layers, Check, Plus, Trash2, Edit2, Sliders, Save, Sparkles 
} from 'lucide-react';

export const AdminAuditRBAC: React.FC = () => {
  const { 
    auditLogs, permissions, rolePermissions, updateRolePermissions, 
    committees, updateCommittee, currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rbac' | 'responsibilities' | 'audit'>('rbac');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Role for Permissions Editor
  const [selectedRole, setSelectedRole] = useState<Role>('head');
  
  // Selected Committee for Responsibilities Editor
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>(committees[0]?.id || 'comm-org');
  const [newRespText, setNewRespText] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    return log.action.includes(searchQuery) || log.targetEntity.includes(searchQuery) || log.userName.includes(searchQuery);
  });

  const rolesList: { role: Role; label: string; desc: string; color: string }[] = [
    { role: 'super_admin', label: 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية (Super Admin)', desc: 'القيادة العامة والاعتماد النهائي لكافة قرارات وسياسات النظام دون قيود', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { role: 'vice_president', label: 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية', desc: 'الإشراف التنفيذي والميداني المباشر والتنسيق بين لجان العمل', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    { role: 'advisor', label: 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية', desc: 'التوجيه الاستراتيجي وحوكمة الأداء الطلابي ودعم اتخاذ القرارات', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { role: 'general_coordinator', label: 'المنسق العام لفريق متطوعين اتحاد طلاب جامعة الإسكندرية', desc: 'إدارة وتنسيق الجداول الزمنية الشاملة والمشاريع المشتركة بين اللجان', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { role: 'operations_manager', label: 'مسؤول العمليات والميدان لفريق المتطوعين', desc: 'التحكم في غرفة العمليات الحية، إدارة الحشود، والتدخل السريع', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { role: 'quality_officer', label: 'مسؤول الجودة والتقييم والتطوير المؤسسي', desc: 'تدقيق معايير الأداء 360°، مراقبة صحة اللجان، وتطوير التدريب', color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' },
    { role: 'hr_admin', label: 'مسؤول الموارد البشرية وشؤون المتطوعين (HR)', desc: 'متابعة الحضور، المقابلات، التقييمات الشاملة، والشكاوى والأوسمة', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { role: 'event_manager', label: 'مسؤول الفعاليات والمشاريع (Event Mgr)', desc: 'إدارة وتخطيط الفعاليات وغرفة العمليات الحية والتنظيم اللوجستي', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { role: 'head', label: 'رئيس لجنة تخصصية (Committee Head)', desc: 'إدارة مهام لجنته، أعضائه، وتقييم الأداء ومراجعة التسليمات', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
    { role: 'vice_head', label: 'نائب رئيس لجنة تخصصية (Vice Head)', desc: 'مساندة رئيس اللجنة في المتابعة التشغيلية وإسناد المهام اليومية', color: 'text-slate-300 border-slate-500/40 bg-slate-500/10' },
    { role: 'member', label: 'عضو متطوع (Volunteer Member)', desc: 'تنفيذ المهام، حضور الفعاليات، واكتساب نقاط الخبرة والأوسمة', color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' },
  ];

  const currentRolePerms = rolePermissions[selectedRole] || {};

  const handleToggleRolePerm = (code: string) => {
    const isCurrentlyEnabled = currentRolePerms[code] !== undefined ? currentRolePerms[code] : true;
    const updated = {
      ...currentRolePerms,
      [code]: !isCurrentlyEnabled
    };
    updateRolePermissions(selectedRole, updated);
  };

  const selectedComm = committees.find(c => c.id === selectedCommitteeId) || committees[0];

  const handleAddResponsibility = () => {
    if (!newRespText.trim() || !selectedComm) return;
    const updated = [...(selectedComm.responsibilities || []), newRespText.trim()];
    updateCommittee(selectedComm.id, { responsibilities: updated });
    setNewRespText('');
  };

  const handleRemoveResponsibility = (idx: number) => {
    if (!selectedComm) return;
    const updated = selectedComm.responsibilities.filter((_, i) => i !== idx);
    updateCommittee(selectedComm.id, { responsibilities: updated });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
              الحوكمة والأمان وتخصيص الصلاحيات
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>مركز إدارة الصلاحيات ومسؤوليات اللجان (RBAC & Governance)</span>
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            التحكم الكامل لمدير النظام في تحديد مسؤوليات وصلاحيات كل دور وهيد وعضو مباشرة من المنصة
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'rbac' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            مصفوفة الصلاحيات (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('responsibilities')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'responsibilities' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            مسؤوليات اللجان والهيدز
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل التدقيق (Audit Log)
          </button>
        </div>
      </div>

      {/* Tab 1: Granular Role Permissions Matrix */}
      {activeTab === 'rbac' && (
        <div className="glass-card p-6 space-y-6 animate-in fade-in">
          
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              اختر الدور (Role) لتحديد وتخصيص الصلاحيات المتاحة له:
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              يمكن لمدير النظام تفعيل أو تعطيل أي إجراء لكل فئة ومستوى إداري
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {rolesList.map(r => (
                <button
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedRole === r.role
                      ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`text-xs font-bold ${selectedRole === r.role ? 'text-white' : 'text-slate-300'} truncate`}>
                    {r.label.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {r.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Details Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>تخصيص صلاحيات دور: {rolesList.find(r => r.role === selectedRole)?.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  {selectedRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {rolesList.find(r => r.role === selectedRole)?.desc}
              </p>
            </div>

            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>يتم الحفظ والتطبيق فورياً</span>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissions.map(perm => {
              const isEnabled = currentRolePerms[perm.code] !== undefined 
                ? currentRolePerms[perm.code] 
                : (selectedRole === 'super_admin' ? true : perm.enabled);

              return (
                <div 
                  key={perm.code}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate flex items-center gap-1.5">
                      <span>{perm.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {perm.code}
                    </div>
                    <div className="text-[9px] text-sky-400 mt-0.5">
                      النطاق: {perm.scope === 'all' ? 'كافة اللجان' : 'لجنة المستخدم فقط'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRolePerm(perm.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isEnabled 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isEnabled ? 'مفعل ✓' : 'معطل ✕'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 2: Committee & Head Responsibilities Management */}
      {activeTab === 'responsibilities' && (
        <div className="glass-card p-6 space-y-6 animate-in fade-in">
          
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              تحديد وضبط مسؤوليات ومهام اللجان ورؤسائها (Committee & Head Responsibilities)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              يمكن لمدير النظام إضافة وتعديل المسؤوليات المسندة لكل لجنة وهيد لعرضها في ملف اللجنة والتقارير الرسمية
            </p>

            {/* Committee Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {committees.map(comm => (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommitteeId(comm.id)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedCommitteeId === comm.id
                      ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`text-xs font-bold ${selectedCommitteeId === comm.id ? 'text-white' : 'text-slate-300'} truncate`}>
                    {comm.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    الهيد: {comm.headName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Committee Responsibilities Editor */}
          {selectedComm && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>مسؤوليات: {selectedComm.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      رئيس اللجنة: {selectedComm.headName}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedComm.description}
                  </p>
                </div>

                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                  {selectedComm.responsibilities?.length || 0} مسؤوليات محددة
                </span>
              </div>

              {/* Add New Responsibility */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  إضافة مسؤولية جديدة للجنة / الهيد:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRespText}
                    onChange={(e) => setNewRespText(e.target.value)}
                    placeholder="مثال: التنسيق مع إدارة الكليات والمدرجات لحجز القاعات..."
                    className="glass-input text-xs flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddResponsibility(); }}
                  />
                  <button
                    onClick={handleAddResponsibility}
                    className="btn-primary text-xs px-4 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مسؤولية</span>
                  </button>
                </div>
              </div>

              {/* List of Responsibilities */}
              <div className="space-y-2 pt-2">
                <label className="block text-slate-400 font-bold">
                  قائمة المسؤوليات المعتمدة حالياً:
                </label>
                {(!selectedComm.responsibilities || selectedComm.responsibilities.length === 0) ? (
                  <p className="text-slate-400 text-xs py-4 text-center">لا توجد مسؤوليات مسجلة، أضف أول مسؤولية أعلاه.</p>
                ) : (
                  selectedComm.responsibilities.map((resp, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium">{resp}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveResponsibility(idx)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer shrink-0"
                        title="حذف المسؤولية"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Tab 3: Immutable Audit Log Table */}
      {activeTab === 'audit' && (
        <div className="glass-card p-5 space-y-4 animate-in fade-in">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في سجل العمليات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input text-xs pr-9"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 font-bold">الوقت والتاريخ</th>
                  <th className="py-2.5 font-bold">المستخدم والمنصب</th>
                  <th className="py-2.5 font-bold">نوع الإجراء</th>
                  <th className="py-2.5 font-bold">العنصر المستهدف</th>
                  <th className="py-2.5 font-bold">التفاصيل</th>
                  <th className="py-2.5 font-bold">القيمة السابقة / الجديدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-all font-sans">
                    <td className="py-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 font-semibold text-white whitespace-nowrap">{log.userName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-200">{log.targetEntity}</td>
                    <td className="py-3 text-slate-400 max-w-xs">{log.details}</td>
                    <td className="py-3 text-slate-300">
                      {log.newValue ? (
                        <span className="text-emerald-400 font-bold">{log.newValue}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
