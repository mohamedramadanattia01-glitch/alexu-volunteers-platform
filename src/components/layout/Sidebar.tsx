import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Zap, Users, Layers, CheckSquare, 
  Calendar, QrCode, Target, GraduationCap, Trophy, 
  Bot, Megaphone, FolderGit2, ShieldAlert, 
  BarChart3, Activity, Sparkles, HeartPulse, MessageSquare, User, FileText, Cake, Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, setActiveTab, tasks, isLiveCommandCenterActive, 
    sosAlerts, teamHealthScore, currentUser, complaints 
  } = useApp();

  const activeTasksCount = tasks.filter(t => t.status !== 'Approved' && t.status !== 'Cancelled').length;
  const openSOSCount = sosAlerts.filter(s => s.status === 'Open').length;

  const allNavItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['*'] },
    { 
      id: 'profile', 
      label: 'الصفحة الشخصية', 
      icon: User,
      badge: currentUser.volunteerId || undefined,
      badgeColor: 'bg-blue-600/30 text-blue-200 font-mono text-[9px]',
      roles: ['*']
    },
    { 
      id: 'org-hierarchy', 
      label: 'الهيكل الإداري وخريطة المهام 🏛️', 
      icon: Building2, 
      roles: ['*'] 
    },
    { 
      id: 'birthdays', 
      label: 'أعياد الميلاد والمناسبات 🎂', 
      icon: Cake, 
      badgeColor: 'bg-pink-500/30 text-pink-300 font-bold',
      roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head'] 
    },
    { 
      id: 'live-command', 
      label: 'غرفة العمليات الحية', 
      icon: Zap, 
      highlight: isLiveCommandCenterActive,
      badge: isLiveCommandCenterActive ? 'LIVE' : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-extrabold',
      roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'head', 'vice_head', 'event_manager']
    },
    { id: 'members', label: 'سجل الأعضاء والتوظيف', icon: Users, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin'] },
    { id: 'committees', label: 'اللجان التخصصية', icon: Layers, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head'] },
    { 
      id: 'tasks', 
      label: 'إدارة المهام', 
      icon: CheckSquare, 
      badge: activeTasksCount > 0 ? activeTasksCount.toString() : undefined,
      badgeColor: 'bg-blue-600/60 text-blue-200',
      roles: ['*']
    },
    { id: 'events', label: 'الفعاليات والميدان', icon: Calendar, roles: ['*'] },
    { id: 'attendance', label: 'الحضور بـ QR والتقييم', icon: QrCode, roles: ['*'] },
    { id: 'evaluations', label: 'التقييم الشامل 360°', icon: Target, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head'] },
    { id: 'documents', label: 'مكتبة الوثائق PDF', icon: FolderGit2, roles: ['*'] },
    { id: 'leaderboard', label: 'لوحة الشرف والرتب', icon: Trophy, roles: ['*'] },
    { 
      id: 'ai-hub', 
      label: 'شربيني AI والمخاطر', 
      icon: Bot, 
      sparkle: true,
      roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head']
    },
    { id: 'announcements', label: 'التعميمات والإعلانات', icon: Megaphone, roles: ['*'] },
    { 
      id: 'complaints', 
      label: 'الشكاوى والمقترحات', 
      icon: MessageSquare,
      badge: complaints.filter(c => c.status === 'New').length > 0 
        ? `${complaints.filter(c => c.status === 'New').length} جديدة` 
        : undefined,
      badgeColor: 'bg-amber-500/30 text-amber-300',
      roles: ['*']
    },
    { 
      id: 'admin', 
      label: 'الصلاحيات وسجل التدقيق', 
      icon: ShieldAlert,
      badge: openSOSCount > 0 ? `🚨 ${openSOSCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer']
    },
    { id: 'reports', label: 'التقارير والتصدير', icon: BarChart3, roles: ['super_admin', 'vice_president', 'advisor', 'general_coordinator', 'operations_manager', 'quality_officer', 'hr_admin', 'head', 'vice_head', 'event_manager'] },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.roles.includes('*')) return true;
    return item.roles.includes(currentUser.role);
  });

  return (
    <aside className="w-64 glass-card border-r border-white/5 hidden lg:flex flex-col justify-between p-3 min-h-[calc(100vh-65px)] sticky top-[65px]">
      
      {/* Top Navigation Links */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
        <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
          التشغيل وإدارة العمليات
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 font-bold'
                  : item.highlight
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.sparkle && <Sparkles className="w-3 h-3 text-purple-400" />}
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Health Score Widget */}
      <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">صحة أداء الفريق</span>
          </div>
          <span className="text-sm font-extrabold text-emerald-400 font-mono">
            {teamHealthScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${teamHealthScore}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
          <span>النشاط المستمر</span>
          <span className="text-emerald-400 font-medium">حالة ممتازة 🟢</span>
        </div>
      </div>

    </aside>
  );
};

