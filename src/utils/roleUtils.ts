import { Role } from '../types';

export interface RoleInfo {
  role: Role;
  title: string;
  shortTitle: string;
  englishTitle: string;
  description: string;
  icon: string;
  badgeClass: string;
  pillBg: string;
  isHighLeadership: boolean;
  isCommitteeLeadership: boolean;
}

export const ALL_ROLES_INFO: Record<Role, RoleInfo> = {
  super_admin: {
    role: 'super_admin',
    title: 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    shortTitle: 'رئيس الفريق',
    englishTitle: 'Volunteers Team President (Super Admin)',
    description: 'القيادة العامة والاعتماد النهائي لكافة قرارات وسياسات فريق متطوعي اتحاد طلاب جامعة الإسكندرية.',
    icon: '👑',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    pillBg: 'bg-amber-500/20 text-amber-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  vice_president: {
    role: 'vice_president',
    title: 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    shortTitle: 'نائب رئيس الفريق',
    englishTitle: 'Vice President of Volunteers Team',
    description: 'الإشراف التنفيذي والميداني المباشر والتنسيق بين رؤساء اللجان ومتابعة تدفق العمليات.',
    icon: '⭐',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    pillBg: 'bg-indigo-500/20 text-indigo-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  advisor: {
    role: 'advisor',
    title: 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    shortTitle: 'مستشار الفريق',
    englishTitle: 'Volunteers Team General Advisor',
    description: 'التوجيه الاستراتيجي وحوكمة الأداء الطلابي ودعم اتخاذ القرارات وحل النزاعات الكبرى.',
    icon: '🎓',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    pillBg: 'bg-emerald-500/20 text-emerald-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  general_coordinator: {
    role: 'general_coordinator',
    title: 'المنسق العام لفريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    shortTitle: 'المنسق العام للفريق',
    englishTitle: 'General Coordinator',
    description: 'إدارة وتنسيق الجداول الزمنية الشاملة والمشاريع المشتركة بين كافة اللجان التخصصية.',
    icon: '⚡',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
    pillBg: 'bg-cyan-500/20 text-cyan-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  operations_manager: {
    role: 'operations_manager',
    title: 'مسؤول العمليات والميدان لفريق المتطوعين',
    shortTitle: 'مسؤول العمليات والميدان',
    englishTitle: 'Operations & Field Manager',
    description: 'التحكم المباشر في غرفة العمليات الحية، إدارة الحشود الميدانية، والتدخل السريع في الطوارئ.',
    icon: '🚨',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    pillBg: 'bg-rose-500/20 text-rose-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  quality_officer: {
    role: 'quality_officer',
    title: 'مسؤول الجودة والتقييم والتطوير المؤسسي',
    shortTitle: 'مسؤول الجودة والتقييم',
    englishTitle: 'Quality & Evaluation Officer',
    description: 'تدقيق معايير الأداء 360°، مراقبة صحة اللجان، وتطوير معايير الجودة ومخرجات التدريب.',
    icon: '💎',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
    pillBg: 'bg-teal-500/20 text-teal-300',
    isHighLeadership: true,
    isCommitteeLeadership: true
  },
  hr_admin: {
    role: 'hr_admin',
    title: 'مسؤول الموارد البشرية وشؤون المتطوعين',
    shortTitle: 'مسؤول الموارد البشرية (HR Lead)',
    englishTitle: 'HR & Volunteer Affairs Lead',
    description: 'إدارة شؤون العضوية، ملفات المتطوعين، الحضور والغياب، التعيين، وترقيات الأوسمة.',
    icon: '👥',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    pillBg: 'bg-purple-500/20 text-purple-300',
    isHighLeadership: false,
    isCommitteeLeadership: true
  },
  event_manager: {
    role: 'event_manager',
    title: 'مسؤول الفعاليات والمشاريع الميدانية',
    shortTitle: 'مسؤول الفعاليات',
    englishTitle: 'Events & Projects Lead',
    description: 'تخطيط وتنظيم المؤتمرات والملتقيات والاحتفاليات الجامعية وتوزيع المهام اللوجستية.',
    icon: '🎪',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    pillBg: 'bg-blue-500/20 text-blue-300',
    isHighLeadership: false,
    isCommitteeLeadership: true
  },
  head: {
    role: 'head',
    title: 'رئيس لجنة تخصصية',
    shortTitle: 'رئيس اللجنة (Head)',
    englishTitle: 'Committee Head',
    description: 'الإدارة الفنية والميدانية المباشرة لأعضاء اللجنة، إسناد المهام، ومراجعة وتقييم التسليمات.',
    icon: '🛡️',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    pillBg: 'bg-sky-500/20 text-sky-300',
    isHighLeadership: false,
    isCommitteeLeadership: true
  },
  vice_head: {
    role: 'vice_head',
    title: 'نائب رئيس لجنة تخصصية',
    shortTitle: 'نائب رئيس اللجنة (Vice Head)',
    englishTitle: 'Committee Vice Head',
    description: 'معاونة رئيس اللجنة في المتابعة التشغيلية للأعضاء وتوزيع التكليفات اليومية.',
    icon: '⚔️',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    pillBg: 'bg-slate-500/20 text-slate-300',
    isHighLeadership: false,
    isCommitteeLeadership: true
  },
  member: {
    role: 'member',
    title: 'عضو متطوع',
    shortTitle: 'متطوع (Volunteer)',
    englishTitle: 'Volunteer Member',
    description: 'المشاركة الفعالة في تنفيذ المهام والفعاليات الميدانية واكتساب نقاط الخبرة والأوسمة.',
    icon: '🌟',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    pillBg: 'bg-emerald-500/20 text-emerald-300',
    isHighLeadership: false,
    isCommitteeLeadership: false
  }
};

/**
 * Returns full official title for a role, with committee context if applicable
 */
export function getRoleOfficialTitle(role: Role, committeeName?: string): string {
  if (role === 'head' && committeeName) {
    return `رئيس ${committeeName}`;
  }
  if (role === 'vice_head' && committeeName) {
    return `نائب رئيس ${committeeName}`;
  }
  if (role === 'member' && committeeName) {
    return `عضو ${committeeName}`;
  }
  return ALL_ROLES_INFO[role]?.title || 'عضو متطوع';
}

/**
 * Returns short badge label
 */
export function getRoleShortLabel(role: Role, committeeName?: string): string {
  if (role === 'head' && committeeName) {
    return `هيد ${committeeName.replace('لجنة ', '')}`;
  }
  if (role === 'vice_head' && committeeName) {
    return `فايس ${committeeName.replace('لجنة ', '')}`;
  }
  return ALL_ROLES_INFO[role]?.shortTitle || 'متطوع';
}

/**
 * Checks if role is high executive leadership (super_admin, vice_president, advisor, general_coordinator, operations_manager, quality_officer)
 */
export function isHighLeadershipRole(role?: Role): boolean {
  if (!role) return false;
  return (
    role === 'super_admin' ||
    role === 'vice_president' ||
    role === 'advisor' ||
    role === 'general_coordinator' ||
    role === 'operations_manager' ||
    role === 'quality_officer'
  );
}
