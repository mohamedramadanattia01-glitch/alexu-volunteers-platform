import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Shield, Crown, Star, Layers, Search, 
  Phone, MessageSquare, Mail, Award, CheckCircle2, 
  ExternalLink, Sparkles, UserCheck, HelpCircle, 
  ChevronRight, Building2, Flame, HeartHandshake,
  FileCheck, ShieldAlert, Laptop, Camera, Film, Palette, FileText, AlertTriangle
} from 'lucide-react';
import { ALL_ROLES_INFO, getRoleShortLabel } from '../../utils/roleUtils';

export const OrgChartView: React.FC = () => {
  const { members, committees, branding, currentUser, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'high_leadership' | 'committees' | 'responsibilities'>('all');
  const [responsibilitySearch, setResponsibilitySearch] = useState('');

  // 1. High Leadership Members
  const advisor = members.find(m => m.role === 'advisor') || {
    id: 'user-advisor-mohamed-ramadan',
    fullName: 'محمد رمضان',
    position: 'المستشار والمشرف الأكاديمي العام لفريق المتطوعين',
    volunteerId: 'AU-001',
    role: 'advisor',
    whatsappNumber: '+201000000000',
    universityEmail: 'mohamed.ramadan50060@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentCommitteeName: 'القيادة العليا والمجلس الاستشاري'
  };

  const superAdmin = members.find(m => m.role === 'super_admin');
  const vicePresidents = members.filter(m => m.role === 'vice_president');
  const generalCoordinators = members.filter(m => m.role === 'general_coordinator');
  const operationsManagers = members.filter(m => m.role === 'operations_manager');
  const qualityOfficers = members.filter(m => m.role === 'quality_officer');
  const hrAdmins = members.filter(m => m.role === 'hr_admin');

  // Filtered members by search
  const searchLower = searchQuery.toLowerCase().trim();

  // Operational Responsibilities Directory Map
  const operationalDuties = [
    {
      id: 'duty-membership',
      title: 'شؤون العضوية، الانضمام، وتحديث البيانات',
      category: 'الموارد البشرية والإدارية',
      description: 'استقبال طلبات المتطوعين الجدد، تدقيق الأرقام القومية، حل مشكلات التسجيل، وتحديث الملفات الشخصية.',
      responsibleRole: 'مسؤول الموارد البشرية وشؤون العضوية (HR Admin)',
      responsibleLeaderName: hrAdmins[0]?.fullName || 'إدارة الموارد البشرية (HR)',
      contactPhone: hrAdmins[0]?.whatsappNumber || '+201000000000',
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
    },
    {
      id: 'duty-certificates',
      title: 'ساعات التطوع، الشهادات، والإفادات الرسمية',
      category: 'التوثيق والاعتماد',
      description: 'احتساب الساعات الميدانية المعتمدة، إصدار شهادات التقدير، واعتماد الأداء الفصلي والسنوي للاتحاد.',
      responsibleRole: 'المنسق العام وإدارة التوثيق والاعتماد',
      responsibleLeaderName: generalCoordinators[0]?.fullName || 'المنسق العام للجان',
      contactPhone: generalCoordinators[0]?.whatsappNumber || '+201000000000',
      icon: FileCheck,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400'
    },
    {
      id: 'duty-field-ops',
      title: 'غرفة العمليات الحية وإدارة الميدان والطوارئ (SOS)',
      category: 'العمليات والميدان',
      description: 'الاستجابة لبلاغات الطوارئ اللحظية في الفعاليات، تحريك الفرق الميدانية، وتوزيع نقاط التمركز.',
      responsibleRole: 'مدير العمليات الميدانية ونواب الرئيس',
      responsibleLeaderName: operationsManagers[0]?.fullName || vicePresidents[0]?.fullName || 'مدير العمليات الميدانية',
      contactPhone: operationsManagers[0]?.whatsappNumber || '+201000000000',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-400'
    },
    {
      id: 'duty-media-photo',
      title: 'التغطية الفوتوغرافية وتصوير الفعاليات والمؤتمرات',
      category: 'الإعلام والتوثيق البصري',
      description: 'توزيع المصورين داخل القاعات، تسليم الصور بدقة عالية، وتوثيق لحظات التكريم وكبار الضيوف.',
      responsibleRole: 'رئيس ونواب لجنة التصوير (MEDIA)',
      responsibleLeaderName: members.find(m => m.currentCommitteeId === 'comm-media' && m.role === 'head')?.fullName || 'هيد لجنة التصوير',
      contactPhone: '+201000000000',
      icon: Camera,
      color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-400'
    },
    {
      id: 'duty-montage-video',
      title: 'مونتاج الريلز، الأفلام التوثيقية، والموشن جرافيكس',
      category: 'الإعلام والإنتاج',
      description: 'إنتاج فيديوهات التغطية السريعة، الأفلام الختامية للمؤتمرات، وإخراج المواد المرئية الرسمية للاتحاد.',
      responsibleRole: 'رئيس ونواب لجنة المونتاج (MONTAGE)',
      responsibleLeaderName: members.find(m => m.currentCommitteeId === 'comm-montage' && m.role === 'head')?.fullName || 'هيد لجنة المونتاج',
      contactPhone: '+201000000000',
      icon: Film,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-400'
    },
    {
      id: 'duty-design-branding',
      title: 'تصميم البنرات، البوسترات، الكارنيهات، والهوية البصرية',
      category: 'التصميم والهوية',
      description: 'تطبيق دليل الهوية البصرية لجامعة الإسكندرية، تصميم مطبوعات المؤتمرات وبطاقات التعريف.',
      responsibleRole: 'رئيس ونواب لجنة التصميم (DESIGN)',
      responsibleLeaderName: members.find(m => m.currentCommitteeId === 'comm-design' && m.role === 'head')?.fullName || 'هيد لجنة التصميم',
      contactPhone: '+201000000000',
      icon: Palette,
      color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      id: 'duty-content-press',
      title: 'صياغة المحتوى، البيانات الصحفية، والمنشورات الرسمية',
      category: 'الإعلام والمحتوى',
      description: 'كتابة محتوى منصات التواصل الاجتماعي، صياغة الخطابات الرسمية، وتوثيق التقارير الأدبية للاتحاد.',
      responsibleRole: 'رئيس ونواب لجنة صناعة المحتوى (CONTENT)',
      responsibleLeaderName: members.find(m => m.currentCommitteeId === 'comm-content' && m.role === 'head')?.fullName || 'هيد لجنة صناعة المحتوى',
      contactPhone: '+201000000000',
      icon: FileText,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400'
    },
    {
      id: 'duty-crowd-org',
      title: 'تنظيم الحشود، تأمين البوابات، وإدارة القاعات والمسارح',
      category: 'التنظيم والإشراف',
      description: 'وضع خطط التدفق للزوار والطلاب، تأمين منصات التكريم، واستقبال كبار الضيوف والوفود الخارجية.',
      responsibleRole: 'رئيس ونواب لجنة التنظيم (OC)',
      responsibleLeaderName: members.find(m => m.currentCommitteeId === 'comm-org' && m.role === 'head')?.fullName || 'هيد لجنة التنظيم',
      contactPhone: '+201000000000',
      icon: Shield,
      color: 'from-blue-600/20 to-sky-600/20 border-blue-500/40 text-sky-400'
    },
    {
      id: 'duty-platform-tech',
      title: 'الدعم التقني للمنصة، حسابات الدخول، والأنظمة الذكية',
      category: 'التطوير والدعم الفني',
      description: 'متابعة تشغيل الأبلكيشن، مسح كود الـ QR، تسجيل الحضور بـ GPS، وحل مشكلات تسجيل الدخول.',
      responsibleRole: 'فريق الدعم الفني وإدارة المنصة الرقمية',
      responsibleLeaderName: 'مسؤول الدعم الفني والأنظمة',
      contactPhone: '+201000000000',
      icon: Laptop,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400'
    },
    {
      id: 'duty-complaints-disputes',
      title: 'الشكاوى والمقترحات والتحقيقات وحل النزاعات',
      category: 'الجودة والرقابة والحوكمة',
      description: 'فحص التظلمات، ضمان الشفافية والعدالة بين المتطوعين، والرفع للقيادة العليا والمستشار العام.',
      responsibleRole: 'المستشار العام ومسؤول الجودة والرقابة',
      responsibleLeaderName: advisor.fullName || 'أ. محمد رمضان (المستشار العام)',
      contactPhone: advisor.whatsappNumber || '+201000000000',
      icon: HelpCircle,
      color: 'from-rose-500/20 to-purple-500/20 border-rose-500/40 text-rose-300'
    }
  ];

  const filteredDuties = operationalDuties.filter(duty => {
    if (!responsibilitySearch) return true;
    const q = responsibilitySearch.toLowerCase();
    return (
      duty.title.toLowerCase().includes(q) ||
      duty.description.toLowerCase().includes(q) ||
      duty.responsibleRole.toLowerCase().includes(q) ||
      duty.responsibleLeaderName.toLowerCase().includes(q) ||
      duty.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
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
              <span>الهيكل الإداري والقيادي وخريطة المسؤوليات</span>
              <Building2 className="w-6 h-6 text-sky-400" />
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              دليل شامل ومباشر لجميع قيادات الفريق ولجانه التخصصية، وخريطة مسؤوليات واضحة توضح اختصاص ومسؤول كل قطاع ومهمة تشغيلية.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('responsibilities')}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>مين مسؤول إيه؟ (دليل المهام)</span>
            </button>
          </div>
        </div>

        {/* View Selection Filter Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'الهيكل الكامل 🏛️' },
            { id: 'high_leadership', label: 'الإدارة العليا والمستشار 👑' },
            { id: 'committees', label: 'قيادات اللجان (الهيدات والنواب) 🛡️' },
            { id: 'responsibilities', label: 'خريطة المسؤوليات والمهام 📋' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: SUPREME LEADERSHIP & GENERAL ADVISOR */}
      {(selectedCategory === 'all' || selectedCategory === 'high_leadership') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>المجلس الاستشاري والإدارة العليا للفريق</span>
            </h3>
            <span className="text-xs text-slate-400">التوجيه الاستراتيجي والحوكمة</span>
          </div>

          {/* General Advisor Card (Special Spotlight) */}
          <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-amber-950/20 via-slate-900 to-blue-950/30 border border-amber-500/40 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={advisor.avatarUrl} 
                    alt={advisor.fullName} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg shadow-amber-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-500 text-slate-950 shadow-md">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/40">
                      المستشار والمشرف الأكاديمي العام 🌟
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-mono text-[10px] font-bold">
                      {advisor.volunteerId || 'AU-001'}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white">{advisor.fullName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {advisor.position || 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                    الإشراف والتوجيه الاستراتيجي، اعتماد اللوائح المنظمة، والتحكيم النهائي في التظلمات والمقترحات الكبرى.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                {advisor.whatsappNumber && (
                  <a
                    href={`https://wa.me/${advisor.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تواصل واتساب</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Other High Leadership Members Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members
              .filter(m => ['super_admin', 'vice_president', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin'].includes(m.role) && m.id !== advisor.id)
              .map(leader => {
                const roleInfo = ALL_ROLES_INFO[leader.role];

                return (
                  <div 
                    key={leader.id}
                    className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={leader.avatarUrl} 
                        alt={leader.fullName} 
                        className="w-12 h-12 rounded-xl object-cover border border-blue-400/30 group-hover:border-blue-400 transition-all shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block mb-1 border ${
                          roleInfo?.badgeClass || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {roleInfo?.icon} {getRoleShortLabel(leader.role, leader.currentCommitteeName)}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{leader.fullName}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{leader.position}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{leader.volunteerId || 'AU-VOL'}</span>
                      {leader.whatsappNumber && (
                        <a
                          href={`https://wa.me/${leader.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
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
      )}

      {/* SECTION 2: COMMITTEES HEADS & VICE HEADS */}
      {(selectedCategory === 'all' || selectedCategory === 'committees') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <span>قيادات ورؤساء اللجان التخصصية (Heads & Vice Heads)</span>
            </h3>
            <span className="text-xs text-slate-400">6 لجان تخصصية رئيسية</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {committees.map(comm => {
              // Find heads and vice heads for this committee
              const commHeads = members.filter(m => m.currentCommitteeId === comm.id && m.role === 'head');
              const commViceHeads = members.filter(m => m.currentCommitteeId === comm.id && m.role === 'vice_head');
              const totalCommMembers = members.filter(m => m.currentCommitteeId === comm.id).length;

              return (
                <div 
                  key={comm.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-sky-500/40 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div>
                    {/* Committee Header */}
                    <div className="flex items-start justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                          {comm.code}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">{comm.name}</h4>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {totalCommMembers} متطوع
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {comm.description}
                    </p>

                    {/* Heads Section */}
                    <div className="space-y-2 mb-3">
                      <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        رئيس اللجنة (Head):
                      </div>
                      {commHeads.length > 0 ? (
                        commHeads.map(head => (
                          <div key={head.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={head.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <div>
                                <div className="text-xs font-bold text-white leading-tight">{head.fullName}</div>
                                <div className="text-[10px] text-slate-400">{head.volunteerId}</div>
                              </div>
                            </div>
                            {head.whatsappNumber && (
                              <a 
                                href={`https://wa.me/${head.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                title="مراسلة"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500 italic p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                          شاغر إداري أو بتكليف مباشر من الإدارة العليا
                        </div>
                      )}
                    </div>

                    {/* Vice Heads Section */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        النواب ومساعدو الرؤساء (Vice Heads):
                      </div>
                      {commViceHeads.length > 0 ? (
                        commViceHeads.map(vHead => (
                          <div key={vHead.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={vHead.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                              <div>
                                <div className="text-xs font-bold text-white leading-tight">{vHead.fullName}</div>
                                <div className="text-[10px] text-slate-400">{vHead.volunteerId}</div>
                              </div>
                            </div>
                            {vHead.whatsappNumber && (
                              <a 
                                href={`https://wa.me/${vHead.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                title="مراسلة"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500 italic p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                          يتم تعيين النواب عبر التقييم الفصلي
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Committee Key Duties */}
                  {comm.responsibilities && comm.responsibilities.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 mb-1">أبرز اختصاصات اللجنة:</div>
                      <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc list-inside">
                        {comm.responsibilities.slice(0, 2).map((r, i) => (
                          <li key={i} className="truncate">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: OPERATIONAL RESPONSIBILITIES DIRECTORY (WHO IS RESPONSIBLE FOR WHAT?) */}
      {(selectedCategory === 'all' || selectedCategory === 'responsibilities') && (
        <div className="space-y-4 pt-2">
          <div className="glass-card p-5 sm:p-6 bg-slate-900/90 border-slate-800 rounded-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>دليل "من مسؤول كل شيء في الفريق؟" (خريطة المهام)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ابحث عن أي موضوع أو مشكلة أو استفسار لمعرفة المسؤول المباشر وطريقة التواصل معه فوراً
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث عن: شهادات، كارنيهات، كاميرا، شكوى..."
                  value={responsibilitySearch}
                  onChange={(e) => setResponsibilitySearch(e.target.value)}
                  className="glass-input pr-9 text-xs w-full"
                />
              </div>
            </div>

            {/* Responsibilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDuties.map(duty => {
                const Icon = duty.icon;

                return (
                  <div 
                    key={duty.id}
                    className={`p-4 rounded-2xl border bg-gradient-to-r ${duty.color} flex flex-col justify-between space-y-3 transition-all`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/10 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-300 font-semibold block">{duty.category}</span>
                            <h4 className="text-sm font-bold text-white">{duty.title}</h4>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-white/5 my-2">
                        {duty.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">المسؤول المباشر:</div>
                        <div className="font-bold text-white flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span>{duty.responsibleLeaderName}</span>
                        </div>
                        <div className="text-[10px] text-slate-300">{duty.responsibleRole}</div>
                      </div>

                      {duty.contactPhone && (
                        <a
                          href={`https://wa.me/${duty.contactPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>تواصل</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Leadership Charter / Code of Responsibilities Footer Banner */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">ميثاق العمل والمسؤولية الجماعية</h4>
            <p className="text-[11px] text-slate-300">كل قائد في منصبه مسخر لخدمة وتيسير مهام المتطوعين وتمثيل جامعة الإسكندرية بأعلى درجات الانضباط.</p>
          </div>
        </div>
        
        <button
          onClick={() => setActiveTab('complaints')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold whitespace-nowrap cursor-pointer transition-all"
        >
          تقديم اقتراح أو استفسار ✍️
        </button>
      </div>

    </div>
  );
};
