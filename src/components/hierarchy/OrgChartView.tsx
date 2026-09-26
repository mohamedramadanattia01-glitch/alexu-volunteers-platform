import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, Committee, Role } from '../../types';
import { 
  Users, Shield, Crown, Star, Layers, Search, 
  Phone, MessageSquare, Mail, Award, CheckCircle2, 
  ExternalLink, Sparkles, UserCheck, HelpCircle, 
  ChevronRight, Building2, Flame, HeartHandshake,
  FileCheck, ShieldAlert, Laptop, Camera, Film, Palette, FileText,
  ArrowRightLeft, UserMinus, UserPlus, ChevronDown, ChevronUp,
  X, Check, AlertTriangle
} from 'lucide-react';
import { ALL_ROLES_INFO, getRoleShortLabel, isHighLeadershipRole } from '../../utils/roleUtils';
import { getWhatsAppUrl, hasValidWhatsApp } from '../../utils/whatsapp';
import { TransferCommitteeModal } from '../members/TransferCommitteeModal';

export const OrgChartView: React.FC = () => {
  const { 
    members, committees, branding, currentUser, isHighLeadership,
    transferMemberCommittee, assignCommitteeHead, assignCommitteeViceHead,
    removeCommitteeHead, removeCommitteeViceHead
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Transfer Modal state
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] = useState<Member | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Quick Assign Modal state
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    committeeId: string;
    committeeName: string;
    role: 'head' | 'vice_head';
  } | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  // Expand committee members roster accordion state
  const [expandedCommId, setExpandedCommId] = useState<string | null>(null);

  // 1. Advisory Board Members (Advisors)
  const advisors = members.filter(m => 
    m.status === 'Active' && (
      m.role === 'advisor' || 
      (m.currentCommitteeId === 'comm-leadership' && Boolean(m.position?.includes('مستشار')))
    )
  );

  const fallbackAdvisor: Member = {
    id: 'user-advisor-mohamed-ramadan',
    fullName: 'محمد رمضان',
    position: 'المستشار والمشرف الأكاديمي العام لفريق المتطوعين',
    volunteerId: 'AU-001',
    role: 'advisor',
    status: 'Active',
    whatsappNumber: '+201000000000',
    universityEmail: 'mohamed.ramadan50060@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentCommitteeId: 'comm-leadership',
    currentCommitteeName: 'القيادة العليا والمجلس الاستشاري',
    college: 'جامعة الإسكندرية',
    joinDate: '2026-09-01',
    committeeHistory: [],
    badges: [],
    points: 0,
    level: 1,
    bio: 'التوجيه الاستراتيجي وحوكمة العمل التطوعي، إقرار اللوائح والسياسات العامة، والتحكيم النهائي في التظلمات والمقترحات الكبرى.'
  } as unknown as Member;

  const displayAdvisors = advisors.length > 0 ? advisors : [fallbackAdvisor];

  // 2. Other High Leadership Members (President, Vice President, General Coordinator, Operations, etc.)
  const highLeadershipMembers = members.filter(m => 
    m.status === 'Active' &&
    (isHighLeadershipRole(m.role) || m.currentCommitteeId === 'comm-leadership') && 
    !displayAdvisors.some(a => a.id === m.id)
  );

  // Operational Committees (Excluding leadership meta-committee)
  const operationalCommittees = committees.filter(c => c.id !== 'comm-leadership');

  // Search filter
  const q = searchQuery.toLowerCase().trim();
  const matchesSearch = (text?: string) => text ? text.toLowerCase().includes(q) : false;

  const filteredAdvisors = displayAdvisors.filter(m => 
    !q || matchesSearch(m.fullName) || matchesSearch(m.position) || matchesSearch(m.volunteerId) || matchesSearch(m.college)
  );

  const filteredLeadership = highLeadershipMembers.filter(m => 
    !q || matchesSearch(m.fullName) || matchesSearch(m.position) || matchesSearch(m.volunteerId) || matchesSearch(m.college)
  );

  // Handlers for interactive actions
  const handleOpenTransfer = (member: Member) => {
    setSelectedMemberForTransfer(member);
    setIsTransferModalOpen(true);
  };

  const handleDemoteFromLeadership = (member: Member) => {
    if (window.confirm(`هل أنت متأكد من إعفاء "${member.fullName}" من منصب القيادة العليا ونقله كعضو متطوع في لجنة التنظيم؟`)) {
      transferMemberCommittee(member.id, 'comm-org', 'إعفاء من منصب القيادة العليا والتحويل لعضو متطوع', 'member');
    }
  };

  const handleRemoveHead = (committeeId: string, headMember: Member) => {
    if (window.confirm(`هل أنت متأكد من إعفاء "${headMember.fullName}" من رئاسة اللجنة وتحويله لعضو متطوع في نفس اللجنة؟`)) {
      removeCommitteeHead(committeeId, headMember.id);
    }
  };

  const handleRemoveViceHead = (committeeId: string, viceMember: Member) => {
    if (window.confirm(`هل أنت متأكد من إعفاء "${viceMember.fullName}" من منصب نائب رئيس اللجنة وتحويله لعضو متطوع؟`)) {
      removeCommitteeViceHead(committeeId, viceMember.id);
    }
  };

  const handleOpenAssignModal = (committee: Committee, role: 'head' | 'vice_head') => {
    setAssignModal({
      isOpen: true,
      committeeId: committee.id,
      committeeName: committee.name,
      role
    });
    // Pre-select first candidate
    const firstCand = members.find(m => m.status === 'Active');
    setSelectedCandidateId(firstCand ? firstCand.id : '');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal || !selectedCandidateId) return;

    if (assignModal.role === 'head') {
      assignCommitteeHead(assignModal.committeeId, selectedCandidateId);
    } else {
      assignCommitteeViceHead(assignModal.committeeId, selectedCandidateId);
    }

    setAssignModal(null);
    setSelectedCandidateId('');
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12 text-right">
      
      {/* Header Banner */}
      <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>الهيكل التنظيمي والإداري المعتمد</span>
              </span>
              <span className="text-[11px] text-slate-400">اتحاد طلاب جامعة الإسكندرية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>الهيكل الإداري والقيادي للفريق</span>
              <Building2 className="w-6 h-6 text-sky-400" />
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              دليل تنظيمي موحد يربط الإدارة العليا والمجلس الاستشاري ورؤساء ونواب اللجان الـ 6، مع إمكانية النقل والتسكين والإعفاء الفوري للإدارة العليا.
            </p>
          </div>

          {/* Actions & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            {isHighLeadership && (
              <button
                onClick={() => {
                  const firstMem = members.find(m => m.status === 'Active');
                  if (firstMem) handleOpenTransfer(firstMem);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>🔄 نقل وتسكين عضو بالهيكل</span>
              </button>
            )}

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قائد، هيد، أو لجنة..."
                className="glass-input pr-9 text-xs w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART 1: SUPREME LEADERSHIP & ADVISORY BOARD (القسم الأول: الإدارة العليا) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              الجزء الأول: القيادة العليا والمجلس الاستشاري
            </h3>
          </div>
          <span className="text-xs text-amber-300/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
            الإشراف العام والحوكمة والاعتماد
          </span>
        </div>

        {/* Advisors Spotlight Cards */}
        {filteredAdvisors.length > 0 && (
          <div className="space-y-4">
            {filteredAdvisors.map(adv => (
              <div 
                key={adv.id}
                className="glass-card p-5 sm:p-6 bg-gradient-to-r from-amber-950/30 via-slate-900 to-blue-950/40 border-2 border-amber-500/50 rounded-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={adv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={adv.fullName} 
                        className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/20"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-500 text-slate-950 shadow-md">
                        <Crown className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>المستشار والمشرف الأكاديمي العام</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-mono text-xs font-bold">
                          {adv.volunteerId || 'AU-001'}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white">{adv.fullName}</h4>
                      <p className="text-xs text-amber-200/90 font-semibold mt-0.5">
                        {adv.position || 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية'}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        {adv.bio || 'التوجيه الاستراتيجي وحوكمة العمل التطوعي، إقرار اللوائح والسياسات العامة، والتحكيم النهائي في التظلمات والمقترحات الكبرى.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & WhatsApp Contact */}
                  <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                    {isHighLeadership && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenTransfer(adv)}
                          className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="نقل أو تعديل منصب المستشار"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>تعديل التسكين</span>
                        </button>
                        <button
                          onClick={() => handleDemoteFromLeadership(adv)}
                          className="px-2.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title="إعفاء من منصب المستشار"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {hasValidWhatsApp(adv.whatsappNumber || (adv as any).phone) && (
                      <a
                        href={getWhatsAppUrl(adv.whatsappNumber || (adv as any).phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>واتساب</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other High Leadership Members Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeadership.map(leader => {
            const roleInfo = ALL_ROLES_INFO[leader.role];

            return (
              <div 
                key={leader.id}
                className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={leader.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                    alt={leader.fullName} 
                    className="w-13 h-13 rounded-xl object-cover border border-purple-400/40 group-hover:border-purple-400 transition-all shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block mb-1 border ${
                      roleInfo?.badgeClass || 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                    }`}>
                      {roleInfo?.icon || '👑'} {getRoleShortLabel(leader.role, leader.currentCommitteeName)}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{leader.fullName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{leader.position}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-sky-400 font-bold">{leader.volunteerId || 'AU-VOL'}</span>
                  
                  <div className="flex items-center gap-1.5">
                    {isHighLeadership && (
                      <>
                        <button
                          onClick={() => handleOpenTransfer(leader)}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                          title="نقل وتغيير تسكين القائد"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDemoteFromLeadership(leader)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                          title="إعفاء من القيادة العليا"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {hasValidWhatsApp(leader.whatsappNumber || leader.phone) && (
                      <a
                        href={getWhatsAppUrl(leader.whatsappNumber || leader.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>تواصل</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART 2: COMMITTEE HEADS & VICE HEADS (القسم الثاني: هيدات ونواب اللجان) */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              الجزء الثاني: رؤساء ونواب اللجان التخصصية (هيدات اللجان الـ 6)
            </h3>
          </div>
          <span className="text-xs text-sky-300/80 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-bold">
            6 لجان تخصصية معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operationalCommittees
            .filter(comm => !q || matchesSearch(comm.name) || matchesSearch(comm.code) || members.some(m => m.currentCommitteeId === comm.id && matchesSearch(m.fullName)))
            .map(comm => {
              // Find heads and vice heads strictly for this committee
              const commHeads = members.filter(m => 
                m.status === 'Active' &&
                m.currentCommitteeId === comm.id && 
                m.role === 'head'
              );
              const commViceHeads = members.filter(m => 
                m.status === 'Active' &&
                m.currentCommitteeId === comm.id && 
                m.role === 'vice_head'
              );
              const commRegularMembers = members.filter(m => 
                m.status === 'Active' &&
                m.currentCommitteeId === comm.id && 
                m.role === 'member'
              );
              const totalCommMembers = members.filter(m => m.status === 'Active' && m.currentCommitteeId === comm.id).length;

              const isExpanded = expandedCommId === comm.id;

              return (
                <div 
                  key={comm.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-sky-500/40 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div>
                    {/* Committee Header */}
                    <div className="flex items-start justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                          {comm.code}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{comm.name}</h4>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {totalCommMembers} متطوع
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {comm.description}
                    </p>

                    {/* Heads Section */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        <span>👑 رئيس اللجنة (Head):</span>
                        {isHighLeadership && commHeads.length === 0 && (
                          <button
                            onClick={() => handleOpenAssignModal(comm, 'head')}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>تعيين رئيس</span>
                          </button>
                        )}
                      </div>

                      {commHeads.length > 0 ? (
                        commHeads.map(head => (
                          <div key={head.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={head.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover border border-blue-400/40 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{head.fullName}</div>
                                <div className="text-[10px] text-sky-400 font-mono font-bold">{head.volunteerId || 'HEAD'}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isHighLeadership && (
                                <>
                                  <button
                                    onClick={() => handleOpenTransfer(head)}
                                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                                    title="نقل أو تعديل تسكين الهيد"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveHead(comm.id, head)}
                                    className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                    title="إعفاء من رئاسة اللجنة"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                  </button>
                                </>
                              )}

                              {hasValidWhatsApp(head.whatsappNumber || head.phone) && (
                                <a 
                                  href={getWhatsAppUrl(head.whatsappNumber || head.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                  title="مراسلة واتساب"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-amber-300/80 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                          <span>شاغر إداري - لا يوجد رئيس معين حالياً</span>
                          {isHighLeadership && (
                            <button
                              onClick={() => handleOpenAssignModal(comm, 'head')}
                              className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer"
                            >
                              تعيين رئيس
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Vice Heads Section */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        <span>🎖️ نواب ومساعدو الرؤساء (Vice Heads):</span>
                        {isHighLeadership && commViceHeads.length === 0 && (
                          <button
                            onClick={() => handleOpenAssignModal(comm, 'vice_head')}
                            className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>تعيين نائب</span>
                          </button>
                        )}
                      </div>

                      {commViceHeads.length > 0 ? (
                        commViceHeads.map(vHead => (
                          <div key={vHead.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={vHead.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'} alt="" className="w-7 h-7 rounded-lg object-cover border border-purple-400/40 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{vHead.fullName}</div>
                                <div className="text-[10px] text-purple-300 font-mono font-bold">{vHead.volunteerId || 'VICE'}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isHighLeadership && (
                                <>
                                  <button
                                    onClick={() => handleOpenTransfer(vHead)}
                                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                                    title="نقل أو تعديل تسكين النائب"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveViceHead(comm.id, vHead)}
                                    className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                                    title="إعفاء من نيابة اللجنة"
                                  >
                                    <UserMinus className="w-3 h-3" />
                                  </button>
                                </>
                              )}

                              {hasValidWhatsApp(vHead.whatsappNumber || vHead.phone) && (
                                <a 
                                  href={getWhatsAppUrl(vHead.whatsappNumber || vHead.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                  title="مراسلة واتساب"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                          <span>شاغر إداري - لا يوجد نائب معين</span>
                          {isHighLeadership && (
                            <button
                              onClick={() => handleOpenAssignModal(comm, 'vice_head')}
                              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer"
                            >
                              تعيين نائب
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Collapsible Committee Members Roster Accordion */}
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setExpandedCommId(isExpanded ? null : comm.id)}
                        className="w-full py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <span>أعضاء ومتطوعو اللجنة ({commRegularMembers.length})</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in">
                          {commRegularMembers.length > 0 ? (
                            commRegularMembers.map(m => (
                              <div key={m.id} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} alt="" className="w-6 h-6 rounded-md object-cover border border-slate-700 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-white font-medium truncate text-[11px]">{m.fullName}</div>
                                    <div className="text-[9px] font-mono text-sky-400">{m.volunteerId}</div>
                                  </div>
                                </div>

                                {isHighLeadership && (
                                  <button
                                    onClick={() => handleOpenTransfer(m)}
                                    className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="نقل هذا العضو للجنة أخرى أو للإدارة العليا"
                                  >
                                    <ArrowRightLeft className="w-2.5 h-2.5" />
                                    <span>نقل</span>
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 text-center py-2">لا يوجد أعضاء متطوعين مسجلين بهذه اللجنة حالياً</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>كود اللجنة: <strong className="text-sky-300 font-mono">{comm.code}</strong></span>
                    <span className="text-slate-500">جامعة الإسكندرية</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Placement / Assign Head / Vice Head Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 border-2 border-amber-500/50 bg-slate-950 text-right shadow-2xl">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    تعيين {assignModal.role === 'head' ? 'رئيس' : 'نائب رئيس'} لـ {assignModal.committeeName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    سيتم تسكين القائد فورياً في هذا المنصب وتوحيد بياناته في كامل البرنامج
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAssignModal(null)} 
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اختر العضو المراد تعيينه كـ {assignModal.role === 'head' ? 'رئيس' : 'نائب رئيس'} *
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  required
                  className="glass-input w-full text-xs py-2 px-3 rounded-lg border-slate-700 bg-slate-900 text-slate-200 cursor-pointer"
                >
                  <option value="">-- اختر من قائمة الأعضاء --</option>
                  {members.filter(m => m.status === 'Active').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.volunteerId || '—'}) • {m.currentCommitteeName} [{m.position || m.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>تأكيد قاعدة التسكين الواحد:</span>
                </div>
                <p>
                  بمجرد اعتماد التعيين، سيتم نقل العضو فورياً من لجنته ومنصبه السابق ليصبح حصرياً في منصب{' '}
                  <strong className="text-white font-bold">{assignModal.role === 'head' ? 'رئيس' : 'نائب رئيس'} {assignModal.committeeName}</strong>، مع تصفير نقاط الـ XP وتحديث بياناته في كافة أنحاء المنصة.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!selectedCandidateId}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد التعيين في الهيكل 👑</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Main Full Transfer & Reassignment Modal */}
      <TransferCommitteeModal
        member={selectedMemberForTransfer}
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedMemberForTransfer(null);
        }}
      />

    </div>
  );
};
