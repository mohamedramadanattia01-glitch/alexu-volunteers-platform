import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Shield, Crown, Star, Layers, Search, 
  Phone, MessageSquare, Mail, Award, CheckCircle2, 
  ExternalLink, Sparkles, UserCheck, HelpCircle, 
  ChevronRight, Building2, Flame, HeartHandshake,
  FileCheck, ShieldAlert, Laptop, Camera, Film, Palette, FileText
} from 'lucide-react';
import { ALL_ROLES_INFO, getRoleShortLabel, isHighLeadershipRole } from '../../utils/roleUtils';
import { getWhatsAppUrl, hasValidWhatsApp } from '../../utils/whatsapp';

export const OrgChartView: React.FC = () => {
  const { members, committees, branding, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Advisory Board Members (All Advisors)
  const advisors = members.filter(m => 
    m.role === 'advisor' || 
    (m.currentCommitteeId === 'comm-leadership' && Boolean(m.position?.includes('مستشار')))
  );

  const fallbackAdvisor = {
    id: 'user-advisor-mohamed-ramadan',
    fullName: 'محمد رمضان',
    position: 'المستشار والمشرف الأكاديمي العام لفريق المتطوعين',
    volunteerId: 'AU-001',
    role: 'advisor' as const,
    whatsappNumber: '+201000000000',
    universityEmail: 'mohamed.ramadan50060@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentCommitteeName: 'القيادة العليا والمجلس الاستشاري',
    college: 'جامعة الإسكندرية',
    bio: 'التوجيه الاستراتيجي وحوكمة العمل التطوعي، إقرار اللوائح والسياسات العامة، والتحكيم النهائي في التظلمات والمقترحات الكبرى.'
  };

  const displayAdvisors = advisors.length > 0 ? advisors : [fallbackAdvisor];

  // 2. Other High Leadership Members (President, Vice President, General Coordinator, Operations, etc.)
  const highLeadershipMembers = members.filter(m => 
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

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>الهيكل التنظيمي المعتمد</span>
              </span>
              <span className="text-[11px] text-slate-400">اتحاد طلاب جامعة الإسكندرية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>الهيكل الإداري والقيادي للفريق</span>
              <Building2 className="w-6 h-6 text-sky-400" />
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              دليل تنظيمي معتمد يوضح الإدارة العليا والمجلس الاستشاري ورؤساء ونواب اللجان التخصصية الـ 6 لسهولة التواصل والتنسيق الميداني.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
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

                  {/* Contact Button */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
                    {hasValidWhatsApp(adv.whatsappNumber || (adv as any).phone) && (
                      <a
                        href={getWhatsAppUrl(adv.whatsappNumber || (adv as any).phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>تواصل واتساب مباشر</span>
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
              الجزء الثاني: رؤساء ونواب اللجان التخصصية (هيدات اللجان)
            </h3>
          </div>
          <span className="text-xs text-sky-300/80 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-bold">
            6 لجان تخصصية ميدانية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operationalCommittees
            .filter(comm => !q || matchesSearch(comm.name) || matchesSearch(comm.code) || members.some(m => m.currentCommitteeId === comm.id && matchesSearch(m.fullName)))
            .map(comm => {
              // Find heads and vice heads strictly for this committee
              const commHeads = members.filter(m => 
                m.currentCommitteeId === comm.id && 
                (m.role === 'head' || m.position?.includes('رئيس لجنة') || (m.position && m.position.startsWith('رئيس ')))
              );
              const commViceHeads = members.filter(m => 
                m.currentCommitteeId === comm.id && 
                (m.role === 'vice_head' || m.position?.includes('نائب رئيس'))
              );
              const totalCommMembers = members.filter(m => m.currentCommitteeId === comm.id).length;

              // Fallback head display from committee record if not populated in members yet
              const displayHeads = commHeads.length > 0 
                ? commHeads 
                : (comm.headName && comm.headName !== 'لم يحدد' ? [{
                    id: comm.headId || 'fallback-head',
                    fullName: comm.headName,
                    volunteerId: `${comm.code}-001`,
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    whatsappNumber: '',
                    phone: ''
                  }] : []);

              const displayViceHeads = commViceHeads.length > 0
                ? commViceHeads
                : (comm.viceName && comm.viceName !== 'لم يحدد' ? [{
                    id: comm.viceId || 'fallback-vice',
                    fullName: comm.viceName,
                    volunteerId: `${comm.code}-002`,
                    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    whatsappNumber: '',
                    phone: ''
                  }] : []);

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
                      <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        👑 رئيس اللجنة (Head):
                      </div>
                      {displayHeads.length > 0 ? (
                        displayHeads.map(head => (
                          <div key={head.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-blue-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={head.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover border border-blue-400/40 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{head.fullName}</div>
                                <div className="text-[10px] text-sky-400 font-mono font-bold">{head.volunteerId || 'HEAD'}</div>
                              </div>
                            </div>
                            {hasValidWhatsApp(head.whatsappNumber || head.phone) && (
                              <a 
                                href={getWhatsAppUrl(head.whatsappNumber || head.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="مراسلة واتساب"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
                          شاغر إداري أو بتكليف مباشر من الإدارة العليا
                        </div>
                      )}
                    </div>

                    {/* Vice Heads Section */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        🎖️ نواب ومساعدو الرؤساء (Vice Heads):
                      </div>
                      {displayViceHeads.length > 0 ? (
                        displayViceHeads.map(vHead => (
                          <div key={vHead.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={vHead.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'} alt="" className="w-7 h-7 rounded-lg object-cover border border-purple-400/40 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{vHead.fullName}</div>
                                <div className="text-[10px] text-purple-300 font-mono font-bold">{vHead.volunteerId || 'VICE'}</div>
                              </div>
                            </div>
                            {hasValidWhatsApp(vHead.whatsappNumber || vHead.phone) && (
                              <a 
                                href={getWhatsAppUrl(vHead.whatsappNumber || vHead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="مراسلة واتساب"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-slate-800/60">
                          يتم تعيين النواب عبر التقييم الفصلي
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

    </div>
  );
};
