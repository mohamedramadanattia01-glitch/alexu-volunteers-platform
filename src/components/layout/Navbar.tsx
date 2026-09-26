import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, AlertTriangle, CheckCircle, CheckCircle2,
  Sparkles, LogOut, X, Trash2,
  Sliders, MessageSquare, User,
  UserCheck, Smartphone, BellRing
} from 'lucide-react';

interface NavbarProps {
  onOpenSOSModal: () => void;
  onOpenQRModal: () => void;
  onOpenAIChat: () => void;
  onOpenSettings: () => void;
  onOpenComplaintModal: () => void;
  onOpenApprovalsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSOSModal, 
  onOpenQRModal, 
  onOpenAIChat,
  onOpenSettings,
  onOpenComplaintModal,
  onOpenApprovalsModal
}) => {
  const { 
    currentUser, 
    sosAlerts, notifications, markNotificationRead, 
    markAllNotificationsRead, deleteNotification, clearAllNotifications,
    notificationPermission, requestNotificationPermission,
    setActiveTab,
    branding, complaints, isHighLeadership, pendingMembers, logout
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'sos' | 'task' | 'announcement' | 'eval'>('all');

  const notifRef = useRef<HTMLDivElement>(null);

  // Global click-away listener to automatically dismiss notifications dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (showNotifMenu && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };

    if (showNotifMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showNotifMenu]);

  const unreadNotifs = notifications.filter(n => !n.read);
  const openSOSCount = sosAlerts.filter(s => s.status === 'Open' || s.status === 'Acknowledged').length;
  const newComplaintsCount = complaints.filter(c => c.status === 'New').length;

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'sos') return n.type === 'sos';
    if (notifFilter === 'task') return n.type === 'task' || n.type === 'achievement';
    if (notifFilter === 'announcement') return n.type === 'announcement';
    if (notifFilter === 'eval') return n.type === 'eval' || n.type === 'complaint';
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Logo & Union Identity (Transparent and perfectly fitted) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div 
            onClick={isHighLeadership ? onOpenSettings : undefined}
            title={isHighLeadership ? "تعديل الشعار وإعدادات المنصة" : (branding.appTitle || "فريق المتطوعين")}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-transparent p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all shrink-0 group relative ${isHighLeadership ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="شعار اتحاد طلاب جامعة الإسكندرية" className="w-full h-full object-contain filter drop-shadow-md" />
            ) : (
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-blue-400 text-xs sm:text-base">
                AU
              </div>
            )}
            {isHighLeadership && (
              <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[10px] transition-all">
                <Sliders className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center gap-1">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[140px] xl:max-w-none">
                {branding.appTitle || 'فريق المتطوعين'}
              </h1>
            </div>
            <p className="text-[9px] text-slate-400 hidden xl:block truncate max-w-xs">
              {branding.subtitle || 'اتحاد طلاب جامعة الإسكندرية'}
            </p>
          </div>
        </div>

        {/* Center & Actions Row: Horizontally Scrollable Roll Container on Mobile */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none max-w-[calc(100vw-110px)] sm:max-w-none py-0.5 px-0.5 touch-pan-x flex-nowrap shrink">
          
          {/* Direct Profile Tab Button */}
          <button
            onClick={() => setActiveTab('profile')}
            title="الصفحة الشخصية وكارنيه العضوية"
            className="shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-all cursor-pointer shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">الصفحة الشخصية</span>
          </button>

          {/* Quick Complaints Button */}
          <button
            onClick={() => setActiveTab('complaints')}
            title="منظومة الشكاوى والمقترحات"
            className={`shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              newComplaintsCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">الشكاوى</span>
            {newComplaintsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-slate-950 font-extrabold">
                {newComplaintsCount}
              </span>
            )}
          </button>

          {/* AI Quick Button */}
          <button
            onClick={onOpenAIChat}
            title="المساعد الشخصي الذكي «شربيني»"
            className="shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 transition-all cursor-pointer shadow-sm shadow-purple-500/10 hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span className="hidden md:inline">شربيني AI</span>
          </button>

          {/* Pending Join Requests for Leadership */}
          {(isHighLeadership || currentUser.role === 'hr_admin') && (
            <button
              onClick={onOpenApprovalsModal}
              title="طلبات الانضمام والتسجيل الجديدة بانتظار الاعتماد"
              className={`shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                pendingMembers.length > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">طلبات الانضمام</span>
              {pendingMembers.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-slate-950 font-black">
                  {pendingMembers.length}
                </span>
              )}
            </button>
          )}

          {/* SOS Emergency Live Indicator */}
          <button
            onClick={onOpenSOSModal}
            className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              openSOSCount > 0 
                ? 'bg-rose-600 hover:bg-rose-500 text-white sos-pulse shadow-lg shadow-rose-600/40' 
                : 'bg-slate-800/80 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-600/40 text-slate-300 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${openSOSCount > 0 ? 'text-white' : 'text-rose-400'}`} />
            <span className="hidden xs:inline">طوارئ SOS</span>
            {openSOSCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white text-rose-700 font-extrabold">
                {openSOSCount}
              </span>
            )}
          </button>

        </div>

        {/* Left Side: Settings + Notifications + Persona Switcher + Logout */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Settings Trigger (Restricted to High Leadership) */}
          {isHighLeadership && (
            <button
              onClick={onOpenSettings}
              title="إعدادات المنصة، الشعار، النغمات، وحجم الخط"
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            </button>
          )}

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifMenu(prev => !prev)}
              title="مركز الإشعارات والتنبيهات الميدانية"
              className={`relative p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                showNotifMenu 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md shadow-blue-600/50">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
                  onClick={() => setShowNotifMenu(false)} 
                />
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:left-0 top-14 sm:top-full mt-2 w-auto sm:w-[420px] max-w-[calc(100vw-16px)] glass-card bg-slate-950/98 backdrop-blur-2xl border border-blue-500/40 shadow-2xl shadow-blue-500/20 p-3 sm:p-4 z-50 animate-in fade-in rounded-2xl text-right">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>مركز الإشعارات والتنبيهات الميدانية</span>
                        {unreadNotifs.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black">
                            {unreadNotifs.length} جديد
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">تحديثات فورية للفعاليات، المهام، البلاغات والقرارات</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadNotifs.length > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="px-2 py-1 text-[10px] font-bold text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-all cursor-pointer"
                        title="تحديد كافة التنبيهات كمقروءة"
                      >
                        قراءة الكل
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="مسح كافة الإشعارات"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                      title="إغلاق نافذة الإشعارات"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Background Push Notifications Banner */}
                {notificationPermission !== 'granted' ? (
                  <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-500/40 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white flex items-center gap-1">
                          <span>إشعارات الهاتف بالخلفية</span>
                          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold border border-amber-500/30">مهم</span>
                        </p>
                        <p className="text-[9px] text-slate-300 truncate">تفعيل ظهور الإشعارات والصوت خارج التطبيق</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => requestNotificationPermission()}
                      className="px-2.5 py-1 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-lg shrink-0 shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>تفعيل الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-[10px] text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      إشعارات الهاتف بالخلفية مفعلة ونشطة
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">خارج التطبيق ✓</span>
                  </div>
                )}

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none border-b border-slate-800/60">
                  {[
                    { id: 'all', label: 'الكل', count: notifications.length },
                    { id: 'unread', label: 'غير مقروء', count: unreadNotifs.length },
                    { id: 'sos', label: '🚨 طوارئ', count: notifications.filter(n => n.type === 'sos').length },
                    { id: 'task', label: '📋 مهام', count: notifications.filter(n => n.type === 'task' || n.type === 'achievement').length },
                    { id: 'announcement', label: '📢 قرارات', count: notifications.filter(n => n.type === 'announcement').length },
                    { id: 'eval', label: '🎯 تقييمات', count: notifications.filter(n => n.type === 'eval' || n.type === 'complaint').length },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setNotifFilter(f.id as any)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        notifFilter === f.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{f.label}</span>
                      {f.count > 0 && (
                        <span className={`px-1 py-0.2 rounded-full text-[9px] font-mono ${
                          notifFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {f.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-300">لا توجد إشعارات في هذا القسم</p>
                      <p className="text-[10px] text-slate-500">كافة العمليات الميدانية والمهام تسير بانضباط تام! ✨</p>
                    </div>
                  ) : (
                    filteredNotifications.map(n => {
                      const getNotificationTypeConfig = (type: string) => {
                        switch (type) {
                          case 'sos':
                            return {
                              badgeText: '🚨 طوارئ وعاجل',
                              badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                              borderClass: 'border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/30',
                              iconEmoji: '🚨'
                            };
                          case 'task':
                            return {
                              badgeText: '📋 تكليف ومهمة',
                              badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                              borderClass: 'border-sky-500/40 bg-sky-950/20 hover:bg-sky-950/30',
                              iconEmoji: '📋'
                            };
                          case 'announcement':
                            return {
                              badgeText: '📢 قرار وتعميم',
                              badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                              borderClass: 'border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/30',
                              iconEmoji: '📢'
                            };
                          case 'achievement':
                            return {
                              badgeText: '🏆 إنجاز ووسام',
                              badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                              borderClass: 'border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/30',
                              iconEmoji: '🏆'
                            };
                          case 'eval':
                            return {
                              badgeText: '🎯 تقييم أداء',
                              badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                              borderClass: 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/30',
                              iconEmoji: '🎯'
                            };
                          case 'complaint':
                            return {
                              badgeText: '⚖️ شكوى وتظلم',
                              badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
                              borderClass: 'border-teal-500/40 bg-teal-950/20 hover:bg-teal-950/30',
                              iconEmoji: '⚖️'
                            };
                          default:
                            return {
                              badgeText: 'تنبيه نظام',
                              badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600',
                              borderClass: 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80',
                              iconEmoji: '🔔'
                            };
                        }
                      };

                      const config = getNotificationTypeConfig(n.type);

                      return (
                        <div 
                          key={n.id} 
                          className={`p-3 rounded-xl border text-right transition-all group relative ${
                            !n.read 
                              ? `${config.borderClass} shadow-md` 
                              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-1 ${config.badgeClass}`}>
                                <span>{config.badgeText}</span>
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-slate-500">{n.createdAt}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                title="حذف هذا الإشعار"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-white mb-1 leading-snug">{n.title}</h5>
                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-2">{n.message}</p>

                          {n.linkTab && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px]">
                              <button
                                onClick={() => {
                                  markNotificationRead(n.id);
                                  if (n.linkTab) setActiveTab(n.linkTab);
                                  setShowNotifMenu(false);
                                }}
                                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-all hover:translate-x-[-2px]"
                              >
                                <span>عرض التفاصيل والتنفيذ ↗</span>
                              </button>
                              {!n.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationRead(n.id);
                                  }}
                                  className="text-slate-500 hover:text-slate-300 text-[9px] cursor-pointer"
                                >
                                  تحديد كمقروء
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Info */}
                <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>منظومة متطوعي اتحاد طلاب جامعة الإسكندرية</span>
                  <span className="text-emerald-400 font-semibold">مزامنة حية 🟢</span>
                </div>

              </div>
              </>
            )}
          </div>

          {/* User Profile Badge (Direct Profile Navigation - No Persona Switching) */}
          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm group"
            title="الانتقال إلى الملف الشخصي وكارنيه العضوية"
          >
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName} 
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-blue-400/40 group-hover:border-blue-400 transition-all"
            />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                <span className="truncate max-w-[90px]">{currentUser.fullName.split(' ')[0]}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                  {currentUser.volunteerId || 'AU-001'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px]">
                {currentUser.position}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="تسجيل الخروج من الحساب"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-rose-600/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
