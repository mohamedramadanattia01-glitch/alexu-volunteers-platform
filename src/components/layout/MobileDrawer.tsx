import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, LayoutDashboard, Zap, Users, Layers, 
  CheckSquare, Calendar, QrCode, Target, 
  GraduationCap, Trophy, Bot, 
  Megaphone, FolderGit2, ShieldAlert, BarChart3, 
  HeartPulse, MessageSquare, Sliders, User, Smartphone, Download 
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenInstallModal?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSettings,
  onOpenInstallModal
}) => {
  const { activeTab, setActiveTab, teamHealthScore, isLiveCommandCenterActive, branding, complaints, currentUser, isHighLeadership } = useApp();

  if (!isOpen) return null;

  const newComplaintsCount = complaints.filter(c => c.status === 'New').length;

  const allNavItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['*'] },
    { 
      id: 'profile', 
      label: 'الصفحة الشخصية', 
      icon: User,
      badge: currentUser.volunteerId || undefined,
      roles: ['*']
    },
    { id: 'live-command', label: 'غرفة العمليات الحية', icon: Zap, highlight: isLiveCommandCenterActive, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'head', 'vice_head', 'event_manager'] },
    { id: 'members', label: 'سجل الأعضاء والتوظيف', icon: Users, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin'] },
    { id: 'committees', label: 'اللجان التخصصية', icon: Layers, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head'] },
    { id: 'tasks', label: 'إدارة المهام', icon: CheckSquare, roles: ['*'] },
    { id: 'events', label: 'الفعاليات والأنشطة', icon: Calendar, roles: ['*'] },
    { id: 'attendance', label: 'الحضور بـ QR والتقييم', icon: QrCode, roles: ['*'] },
    { id: 'evaluations', label: 'التقييم الشامل 360°', icon: Target, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head'] },
    { id: 'documents', label: 'مكتبة الوثائق PDF', icon: FolderGit2, roles: ['*'] },
    { id: 'leaderboard', label: 'لوحة الشرف والرتب', icon: Trophy, roles: ['*'] },
    { id: 'ai-hub', label: 'شربيني AI والمخاطر', icon: Bot, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head'] },
    { id: 'announcements', label: 'التعميمات والإعلانات', icon: Megaphone, roles: ['*'] },
    { 
      id: 'complaints', 
      label: 'الشكاوى والمقترحات', 
      icon: MessageSquare,
      badge: newComplaintsCount > 0 ? `${newComplaintsCount}` : undefined,
      roles: ['*']
    },
    { id: 'admin', label: 'الصلاحيات وسجل التدقيق', icon: ShieldAlert, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer'] },
    { id: 'reports', label: 'التقارير والتصدير', icon: BarChart3, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head', 'event_manager'] },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.roles.includes('*')) return true;
    return item.roles.includes(currentUser.role);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in">
      <div className="w-4/5 max-w-sm h-full glass-card bg-slate-950 p-4 flex flex-col justify-between border-l border-slate-800">
        
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-blue-500/40 flex items-center justify-center overflow-hidden p-0.5">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="شعار اتحاد طلاب جامعة الإسكندرية" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-extrabold text-blue-600 text-xs">AU</span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">{branding.appTitle || 'فريق المتطوعين'}</span>
                <span className="text-[10px] text-slate-400">{currentUser.position} • {currentUser.volunteerId}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onClose(); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white font-bold' 
                      : item.highlight 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 font-mono text-[9px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          {onOpenInstallModal && (
            <button
              onClick={() => { onOpenInstallModal(); onClose(); }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600/30 to-sky-500/30 hover:from-blue-600/40 text-sky-200 border border-sky-400/40 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Smartphone className="w-4 h-4 text-sky-300" />
              <span>تثبيت التطبيق على الموبايل 📱</span>
            </button>
          )}

          {isHighLeadership && onOpenSettings && (
            <button
              onClick={() => { onOpenSettings(); onClose(); }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>إعدادات الشعار، النغمات والخط</span>
            </button>
          )}

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
            <div className="flex justify-between items-center text-slate-300 mb-0.5">
              <span className="text-[11px]">صحة أداء الفريق:</span>
              <span className="font-bold text-emerald-400 font-mono text-[11px]">{teamHealthScore}%</span>
            </div>
            <div className="text-[9px] text-slate-500">اتحاد طلاب جامعة الإسكندرية</div>
          </div>
        </div>

      </div>
    </div>
  );
};

