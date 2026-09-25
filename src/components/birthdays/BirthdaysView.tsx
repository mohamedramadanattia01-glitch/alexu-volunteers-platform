import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cake, Sparkles, Send, MessageCircle, Copy, Check, 
  Calendar, Search, Filter, Gift, Heart, User, Clock,
  Edit3, Share2, Shield, Award, Users, AlertCircle, Bell
} from 'lucide-react';
import { Member } from '../../types';

interface MemberBirthInfo {
  birthMonth: number;
  birthDay: number;
  birthYear: number;
  nextAge: number;
  diffDays: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  formattedDate: string;
}

interface MemberBirthdayItem {
  member: Member;
  info: MemberBirthInfo;
}

export const BirthdaysView: React.FC = () => {
  const { members, currentUser, isHighLeadership, showNotification } = useApp();

  // Access check: only Heads and High Leadership
  const isAuthorized = isHighLeadership || currentUser.role === 'head' || currentUser.role === 'vice_head' || currentUser.role === 'hr_admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommitteeFilter, setSelectedCommitteeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  // Custom template state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedMemberForCustomMessage, setSelectedMemberForCustomMessage] = useState<Member | null>(null);
  const [customGreetingText, setCustomGreetingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default Birthday Template
  const [greetingTemplate, setGreetingTemplate] = useState<string>(
    `كل سنة وأنت طيب وبألف خير يا بطلنا الغالي {name}! 🎉🎂🎈\nأسرة فريق متطوعي اتحاد طلاب جامعة الإسكندرية ({committee}) فخورة جداً بجهودك وبتتمنى لك سنة جديدة مليانة نجاح وتألق وإنجازات عظيمة! 🌟💙\nدمت فخراً وسنداً دائماً للاتحاد! 🎁✨`
  );

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  // Helper to extract birth date info (from birthDate string or Egyptian nationalId)
  const getMemberBirthInfo = (m: Member): MemberBirthInfo | null => {
    let bMonth = 0;
    let bDay = 0;
    let bYear = 2000;

    if (m.birthDate && m.birthDate.includes('-')) {
      const parts = m.birthDate.split('-');
      if (parts.length === 3) {
        bYear = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10);
        bDay = parseInt(parts[2], 10);
      }
    } else if (m.nationalId && m.nationalId.length === 14) {
      // Egyptian National ID format: C YY MM DD SS SSS K
      const century = m.nationalId[0] === '3' ? 2000 : 1900;
      const yy = parseInt(m.nationalId.substring(1, 3), 10);
      bYear = century + yy;
      bMonth = parseInt(m.nationalId.substring(3, 5), 10);
      bDay = parseInt(m.nationalId.substring(5, 7), 10);
    }

    if (!bMonth || !bDay) {
      return null;
    }

    // Calculate days until next birthday
    const thisYearBday = new Date(today.getFullYear(), bMonth - 1, bDay);
    if (thisYearBday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      thisYearBday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = thisYearBday.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isToday = bMonth === currentMonth && bDay === currentDay;
    const isThisWeek = diffDays > 0 && diffDays <= 7;
    const isThisMonth = bMonth === currentMonth;
    const nextAge = today.getFullYear() - bYear + (thisYearBday.getFullYear() > today.getFullYear() ? 1 : 0);

    return {
      birthMonth: bMonth,
      birthDay: bDay,
      birthYear: bYear,
      nextAge,
      diffDays,
      isToday,
      isThisWeek,
      isThisMonth,
      formattedDate: `${bDay} / ${bMonth}`
    };
  };

  // Compile member list with birthday info strictly typed
  const membersWithBirthdays: MemberBirthdayItem[] = members
    .map(m => ({ member: m, info: getMemberBirthInfo(m) }))
    .filter((item): item is MemberBirthdayItem => item.info !== null);

  // Sort: Today first, then by days remaining
  membersWithBirthdays.sort((a, b) => {
    if (a.info.isToday) return -1;
    if (b.info.isToday) return 1;
    return a.info.diffDays - b.info.diffDays;
  });

  // Filter lists
  const todayBirthdays = membersWithBirthdays.filter(item => item.info.isToday);
  const weekBirthdays = membersWithBirthdays.filter(item => item.info.isThisWeek);
  const monthBirthdays = membersWithBirthdays.filter(item => item.info.isThisMonth && !item.info.isToday);

  // Filtered members for display
  const filteredList = membersWithBirthdays.filter(item => {
    const m = item.member;
    const info = item.info;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchComm = m.currentCommitteeName?.toLowerCase().includes(q);
      const matchPhone = m.phone?.includes(q) || m.whatsappNumber?.includes(q);
      if (!matchName && !matchComm && !matchPhone) return false;
    }

    if (selectedCommitteeFilter !== 'all' && m.currentCommitteeId !== selectedCommitteeFilter) {
      return false;
    }

    if (timeFilter === 'today' && !info.isToday) return false;
    if (timeFilter === 'week' && !info.isToday && !info.isThisWeek) return false;
    if (timeFilter === 'month' && !info.isThisMonth) return false;

    return true;
  });

  // Unique committees
  const committeesList = Array.from(new Set(members.map(m => m.currentCommitteeName).filter(Boolean)));

  // Generate personalized greeting text
  const generateMessage = (m: Member, info?: MemberBirthInfo | null) => {
    return greetingTemplate
      .replace(/{name}/g, m.fullName)
      .replace(/{committee}/g, m.currentCommitteeName || 'لجان المتطوعين')
      .replace(/{position}/g, m.position || 'عضو متطوع')
      .replace(/{age}/g, (info?.nextAge || m.age || '').toString());
  };

  const handleOpenCustomModal = (m: Member, info: MemberBirthInfo) => {
    setSelectedMemberForCustomMessage(m);
    setCustomGreetingText(generateMessage(m, info));
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('success', 'تم نسخ رسالة التهنئة إلى الحافظة بنجاح ✓');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (m: Member, customText?: string) => {
    const textToSend = customText || generateMessage(m, getMemberBirthInfo(m));
    const phone = (m.whatsappNumber || m.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('0') ? `20${phone.substring(1)}` : phone;

    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleSendInAppBirthdayPraise = (m: Member) => {
    showNotification('success', `تم إرسال تهنئة المنظومة الرسمية للعضو ${m.fullName} بنجاح 🎉`);
  };

  if (!isAuthorized) {
    return (
      <div className="glass-card p-8 text-center max-w-lg mx-auto mt-12 border-amber-500/30 bg-amber-950/20 space-y-4">
        <Shield className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">منطقة خاصة بقيادات الفريق والهيدات</h3>
        <p className="text-xs text-slate-300">
          سجل أعياد الميلاد والتهنئة التلقائية متاح فقط لرؤساء اللجان، نوابهم، والإدارة العليا لمتابعة وتهنئة المتطوعين.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-16 text-right">
      
      {/* Top Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold flex items-center gap-1.5">
              <Cake className="w-3.5 h-3.5 text-pink-400" />
              <span>منظومة المناسبات وأعياد الميلاد التلقائية</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>سجل أعياد ميلاد متطوعي اتحاد الطلاب</span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            متابعة تواريخ ميلاد المتطوعين، وإرسال التهاني المخصصة والمؤتمتة عبر واتساب وإشعارات المنظومة
          </p>
        </div>

        {/* Template Button */}
        <button
          onClick={() => setIsTemplateModalOpen(true)}
          className="btn-secondary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-2 border-purple-500/40 hover:bg-purple-600/20 text-purple-200"
        >
          <Edit3 className="w-4 h-4 text-purple-400" />
          <span>تخصيص صيغة التهنئة الافتراضية ✍️</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 bg-pink-950/20 border-pink-500/30 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-pink-300 font-bold">أعياد ميلاد اليوم 🎉</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{todayBirthdays.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 bg-purple-950/20 border-purple-500/30 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-purple-300 font-bold">خلال الـ 7 أيام القادمة 🎈</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{weekBirthdays.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 bg-blue-950/20 border-blue-500/30 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-blue-300 font-bold">خلال هذا الشهر 📅</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{monthBirthdays.length + todayBirthdays.length}</div>
          </div>
        </div>

        <div className="glass-card p-4 bg-slate-900 border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-800 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">إجمالي السجل الموثق</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{membersWithBirthdays.length}</div>
          </div>
        </div>
      </div>

      {/* TODAY'S CELEBRATIONS SECTION (Prominently Highlighted) */}
      {todayBirthdays.length > 0 && (
        <div className="glass-card p-5 border-2 border-pink-500/50 bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-slate-950 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-pink-500/30 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎂</span>
              <div>
                <h3 className="text-base font-black text-pink-300">أعياد ميلاد أبطالنا اليوم ({today.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })})</h3>
                <p className="text-[11px] text-pink-200/80">احتفل معهم الآن وأرسل التهنئة الرسمية بنقرة واحدة!</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-pink-500 text-slate-950 font-black text-xs animate-bounce shadow-md">
              اليوم 🎉
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBirthdays.map(({ member: m, info }) => (
              <div 
                key={m.id} 
                className="p-4 rounded-2xl bg-slate-950/80 border border-pink-500/40 flex flex-col justify-between space-y-3 relative group shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img 
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                      alt={m.fullName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-pink-400"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm">🎂</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{m.fullName}</h4>
                    <p className="text-[11px] text-pink-300 font-medium truncate">{m.position} • {m.currentCommitteeName}</p>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>العمر: <strong className="text-white font-mono">{info.nextAge} سنة</strong></span>
                      <span>•</span>
                      <span>الهاتف: <strong className="text-slate-200 font-mono">{m.phone || m.whatsappNumber || 'غير مسجل'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-500/20">
                  <button
                    onClick={() => handleSendWhatsApp(m)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-md cursor-pointer"
                    title="إرسال رسالة واتساب مخصصة فورياً"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </button>

                  <button
                    onClick={() => handleSendInAppBirthdayPraise(m)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-md cursor-pointer"
                    title="إرسال إشعار تهنئة في المنظومة"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>إشعار 🔔</span>
                  </button>

                  <button
                    onClick={() => handleOpenCustomModal(m, info)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-[11px] font-bold transition-all border border-purple-500/30 cursor-pointer"
                    title="تعديل ومعاينة الرسالة"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل ✍️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 bg-slate-900/90 border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، اللجنة، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pr-9 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Committee Filter */}
          <select
            value={selectedCommitteeFilter}
            onChange={(e) => setSelectedCommitteeFilter(e.target.value)}
            className="glass-input text-xs py-1.5 shrink-0"
          >
            <option value="all">كل اللجان ({members.length})</option>
            {committeesList.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* Time Filter Pills */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeFilter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeFilter === 'today' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              اليوم ({todayBirthdays.length})
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeFilter === 'week' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الأسبوع ({weekBirthdays.length})
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${timeFilter === 'month' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              الشهر ({monthBirthdays.length + todayBirthdays.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Members Birthdays Directory Table / Cards */}
      <div className="glass-card overflow-hidden border-slate-800 bg-slate-950/80">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>جدول أعياد الميلاد المرتب زمنياً ({filteredList.length} متطوع)</span>
          </h3>
          <span className="text-[11px] text-slate-400">مرتب بالأقرب تاريخاً</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لا توجد أعياد ميلاد مطابقة لمعايير البحث الحالية.
            </div>
          ) : (
            filteredList.map(({ member: m, info }) => {
              const msg = generateMessage(m, info);
              const isCopied = copiedId === m.id;

              return (
                <div 
                  key={m.id}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-all ${
                    info.isToday ? 'bg-pink-950/15 border-r-4 border-pink-500' : ''
                  }`}
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img 
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                      alt={m.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{m.fullName}</h4>
                        {info.isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500 text-slate-950 text-[10px] font-black">
                            عيد ميلاده اليوم 🎂
                          </span>
                        )}
                        {info.isThisWeek && !info.isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                            بعد {info.diffDays} {info.diffDays === 1 ? 'يوم' : 'أيام'} 🎈
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-sky-300 font-medium">{m.currentCommitteeName || 'متطوع'}</span>
                        <span>•</span>
                        <span>تاريخ الميلاد: <strong className="text-white font-mono">{info.formattedDate}</strong> ({info.nextAge} سنة)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & WhatsApp Message */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleCopyMessage(msg, m.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="نسخ صيغة التهنئة"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden md:inline">{isCopied ? 'تم النسخ' : 'نسخ التهنئة'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenCustomModal(m, info)}
                      className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="معاينة وتعديل الرسالة قبل الإرسال"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="hidden md:inline">معاينة وتعديل</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsApp(m)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>إرسال واتساب 💬</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Edit Default Template */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full p-6 border border-purple-500/40 shadow-2xl bg-slate-950 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">تخصيص قالب رسالة التهنئة الافتراضية</h3>
              </div>
              <button 
                onClick={() => setIsTemplateModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                يمكنك استخدام المتغيرات التلقائية التالية داخل النص ليتم استبدالها آلياً لكل متطوع:
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">{`{name}`} - اسم المتطوع</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300">{`{committee}`} - اللجنة التابع لها</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">{`{position}`} - المنصب</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-300">{`{age}`} - العمر</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نص الرسالة المعتمد:</label>
              <textarea
                rows={5}
                value={greetingTemplate}
                onChange={(e) => setGreetingTemplate(e.target.value)}
                className="glass-input text-xs leading-relaxed"
              />
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <div className="text-[10px] font-bold text-purple-400 mb-1">معاينة حية للمتطوع (مثال: أحمد عادل):</div>
              <p className="whitespace-pre-line text-[11px] text-slate-200">
                {greetingTemplate
                  .replace(/{name}/g, 'أحمد عادل')
                  .replace(/{committee}/g, 'لجنة التنظيم الميداني')
                  .replace(/{position}/g, 'مسؤول قطاع')
                  .replace(/{age}/g, '21')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  showNotification('success', 'تم حفظ وتحديث قالب التهنئة الرسمي بنجاح ✓');
                  setIsTemplateModalOpen(false);
                }}
                className="btn-primary text-xs py-2 px-5 cursor-pointer"
              >
                حفظ القالب المعتمد ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Custom Message Modal for Specific Member */}
      {selectedMemberForCustomMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card max-w-lg w-full p-6 border border-pink-500/40 shadow-2xl bg-slate-950 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">تهنئة خاصة للعضو: {selectedMemberForCustomMessage.fullName}</h3>
                  <p className="text-[11px] text-pink-300">{selectedMemberForCustomMessage.currentCommitteeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMemberForCustomMessage(null)} 
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نص التهنئة المخصص للإرسال:</label>
              <textarea
                rows={5}
                value={customGreetingText}
                onChange={(e) => setCustomGreetingText(e.target.value)}
                className="glass-input text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCopyMessage(customGreetingText, selectedMemberForCustomMessage.id)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ النص</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSendInAppBirthdayPraise(selectedMemberForCustomMessage);
                    setSelectedMemberForCustomMessage(null);
                  }}
                  className="py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>إشعار بالمنظومة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSendWhatsApp(selectedMemberForCustomMessage, customGreetingText);
                    setSelectedMemberForCustomMessage(null);
                  }}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال واتساب فوراً 🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
