import { 
  Season, Committee, Member, Task, EventEntity, AttendanceRecord, 
  SOSAlert, EvaluationTemplate, TrainingCourse, BadgeItem, 
  Announcement, AuditLogItem, DocumentItem, RecruitmentCandidate, Permission, SystemNotification,
  Complaint, AppSoundSettings, AppBrandingSettings, RolePermissionsMap, EvaluationRubric,
  HeadEvaluationRubric, HeadEvaluationRecord, AttendancePointsConfig
} from '../types';

export const initialSeasons: Season[] = [
  {
    id: 'season-2026-2027',
    name: 'الموسم 2026/2027 (الحالي)',
    isCurrent: true,
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    totalMembers: 1,
    totalEvents: 0,
    totalTasks: 0,
    archived: false,
  }
];

export const initialCommittees: Committee[] = [
  {
    id: 'comm-leadership',
    name: 'القيادة العليا والمجلس الاستشاري',
    code: 'LEAD',
    description: 'المجلس الاستشاري، رئاسة الاتحاد، ونواب الرئيس، وإدارة العمليات والجودة وشؤون العضوية.',
    responsibilities: [
      'التوجيه الاستراتيجي وحوكمة العمل التطوعي',
      'الإشراف الميداني واعتماد الخطط والقرارات',
      'إدارة الأزمات الكبرى وبلاغات الطوارئ',
      'التحكيم النهائي في التظلمات وتطوير الكوادر'
    ],
    memberCount: 1,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 100,
    performanceScore: 100,
    healthScore: 100,
    seasonId: 'season-2026-2027',
    color: '#f59e0b',
    icon: 'Crown'
  },
  {
    id: 'comm-org',
    name: 'لجنة التنظيم',
    code: 'OC',
    description: 'تنظيم الحشود، الدخول والخروج، تجهيز القاعات، استقبال كبار الضيوف، وإدارة الحركة والسلامة الميدانية.',
    responsibilities: [
      'تنظيم الحشود وإدارة حركة الزوار والممرات',
      'تجهيز مسارح وقاعات الفعاليات والمؤتمرات',
      'استقبال الشخصيات الهامة والوفود الرسمية',
      'إدارة أمن وسلامة الفعالية والتعامل مع الطوارئ'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#2563eb',
    icon: 'ShieldCheck'
  },
  {
    id: 'comm-hr',
    name: 'لجنة الموارد البشرية',
    code: 'HR',
    description: 'متابعة شؤون الأعضاء، الحضور والانصراف، تقييمات الأداء، خطط الاستبقاء، والتطوير القيادي والتحفيز.',
    responsibilities: [
      'متابعة الحضور والانصراف والالتزام الميداني بدقة',
      'إجراء التقييمات الدورية ومتابعة مؤشرات الأداء KPIs',
      'استقطاب وتأهيل المتطوعين الجدد (Onboarding)',
      'حل النزاعات والشكاوى وتعزيز الروح المعنوية للفريق'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#10b981',
    icon: 'UserCheck'
  },
  {
    id: 'comm-montage',
    name: 'لجنة المونتاج',
    code: 'MONTAGE',
    description: 'مونتاج مقاطع الفيديو، تحرير الريلز، الموشن جرافيكس، هندسة الصوت، والأفلام التوثيقية والملخصات الختامية.',
    responsibilities: [
      'مونتاج الفيديوهات والريلز السريعة للفعاليات',
      'تصميم الموشن جرافيكس والأنيميشن الترويجي',
      'المكساج الصوتي والمؤثرات البصرية للأفلام',
      'إنتاج الفيديوهات الختامية للأفواج والمواسم'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#ec4899',
    icon: 'Film'
  },
  {
    id: 'comm-media',
    name: 'لجنة التصوير الفوتوغرافي والفيديوغرافي',
    code: 'MEDIA',
    description: 'التغطية الفوتوغرافية الحية، تصوير الفيديو الميداني، التقاط وتوثيق الفعاليات الرسمية للاتحاد بجودة فائقة.',
    responsibilities: [
      'التغطية الفوتوغرافية الاحترافية للفعاليات والمؤتمرات',
      'تصوير الفيديو السينمائي والمقابلات الحية',
      'فرز ومعالجة الصور اليومية بدقة وسرعة',
      'أرشفة وتوثيق الألبوم البصري للاتحاد'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#8b5cf6',
    icon: 'Camera'
  },
  {
    id: 'comm-content',
    name: 'لجنة صناعة المحتوى',
    code: 'CONTENT',
    description: 'صياغة المحتوى الإبداعي لمنشورات السوشيال ميديا، سيناريوهات الفيديوهات، البيانات الرسمية، وتوثيق التقارير.',
    responsibilities: [
      'كتابة كابشن وبوستات الفعاليات والأخبار الرسمية',
      'صياغة البيانات الصحفية والخطابات والتكريمات',
      'إعداد السيناريو والسكربت للفيديوهات والريلز',
      'توثيق وأرشفة التقارير الأدبية والختامية للاتحاد'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#f59e0b',
    icon: 'FileText'
  },
  {
    id: 'comm-design',
    name: 'لجنة التصميم',
    code: 'DESIGN',
    description: 'تصميم البنرات، إعلانات السوشيال ميديا، المطبوعات، الكارنيهات، وتطوير الهوية البصرية للاتحاد.',
    responsibilities: [
      'تصميم بنرات ومطبوعات الفعاليات والمؤتمرات',
      'إنتاج بوستات وإعلانات منصات التواصل الاجتماعي',
      'تصميم الكارنيهات والشهادات والبادجات الرسمية',
      'تطبيق دليل الهوية البصرية الصارم لجامعة الإسكندرية'
    ],
    memberCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    attendanceRate: 0,
    performanceScore: 0,
    healthScore: 0,
    seasonId: 'season-2026-2027',
    color: '#06b6d4',
    icon: 'Palette'
  }
];

export const initialMembers: Member[] = [
  {
    id: 'user-advisor-mohamed-ramadan',
    volunteerId: 'AU-001',
    fullName: 'محمد رمضان',
    universityEmail: 'mohamed.ramadan50060@gmail.com',
    college: 'جامعة الإسكندرية',
    academicYear: 'مستشار الفريق',
    whatsappNumber: '+201000000000',
    birthDate: '1995-01-01',
    age: 30,
    nationalId: '29501010200000',
    currentCommitteeId: 'comm-leadership',
    currentCommitteeName: 'القيادة العليا والمجلس الاستشاري',
    position: 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
    role: 'advisor',
    joinDate: '2026-09-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'admin',
    performance: {
      overallScore: 0,
      attendanceRate: 100,
      taskCompletionRate: 100,
      taskQuality: 0,
      commitment: 100,
      teamwork: 100,
      leadership: 0,
      evaluationsCount: 0
    },
    skills: {
      'الاستشارات الاستراتيجية': 5,
      'إدارة وتوجيه الفرق': 5,
      'حوكمة العمل التطوعي': 5,
      'إدارة الأزمات والفعاليات': 5,
      'فض النزاعات وتطوير الأداء': 5
    },
    activeWorkload: 0,
    workloadStatus: 'Optimal',
    engagementRisk: 'Low',
    points: 2000,
    level: 10,
    badges: ['badge-reliable', 'badge-future-leader', 'badge-event-master'],
    committeeHistory: [],
    availability: 'Available',
    bio: 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية • التوجيه الاستراتيجي وحوكمة الأداء الطلابي ودعم اتخاذ القرارات والاعتماد الإداري.',
    hobbies: ['التطوير المؤسسي', 'كتابة اللوائح التنظيمية', 'إدارة المشاريع'],
    learningAspirations: ['حوكمة المؤسسات غير الربحية', 'الذكاء الاصطناعي في إدارة العمليات']
  }
];

export const initialTasks: Task[] = [];

export const initialEvents: EventEntity[] = [];

export const initialAttendanceRecords: AttendanceRecord[] = [];

export const initialSOSAlerts: SOSAlert[] = [];

export const initialEvaluationTemplate: EvaluationTemplate = {
  id: 'eval-tmpl-default',
  name: 'معيار تقييم الأداء الموسمي القياسي 2026/2027',
  seasonId: 'season-2026-2027',
  isDefault: true,
  criteria: [
    { key: 'attendance', label: 'نسبة الحضور والانضباط الميداني', weight: 20, description: 'حضور الفعاليات والاجتماعات في الموعد دون تأخير' },
    { key: 'taskQuality', label: 'جودة ودقة تنفيذ المهام', weight: 25, description: 'مستوى الإتقان والالتزام بالمواصفات الفنية المطلوبة' },
    { key: 'taskCompletion', label: 'نسبة إنجاز المهام المسندة', weight: 25, description: 'تسليم المهام كاملة قبل أو عند الموعد النهائي' },
    { key: 'commitment', label: 'الالتزام والمسؤولية والروح الإيجابية', weight: 15, description: 'احترام اللوائح والتعاون والحرص على نجاح الفريق' },
    { key: 'teamwork', label: 'العمل الجماعي ودعم الزملاء', weight: 10, description: 'مساعدة أعضاء اللجان الأخرى والمبادرة المشتركة' },
    { key: 'initiative', label: 'المبادرة وحل المشكلات والأفكار الإبداعية', weight: 5, description: 'تقديم مقترحات لتطوير العمل وإيجاد حلول سريعة' }
  ]
};

export const initialTrainings: TrainingCourse[] = [];

export const initialBadges: BadgeItem[] = [
  {
    id: 'badge-reliable',
    title: 'Reliable Volunteer',
    titleAr: '🏅 المتطوع الموثوق',
    description: 'حضور نسبة تفوق 95% من الفعاليات وتسليم المهام في موعدها دون تأخير.',
    icon: 'Award',
    category: 'Commitment',
    criteria: 'نسبة حضور 95% + تسليم 10 مهام في الموعد',
    xpReward: 100
  },
  {
    id: 'badge-event-master',
    title: 'Event Master',
    titleAr: '🏆 نجم الفعاليات',
    description: 'المشاركة الفعالة في تنظيم 10 فعاليات كبرى مع تقييم أداء امتياز.',
    icon: 'Star',
    category: 'Operations',
    criteria: 'المشاركة في 10 فعاليات',
    xpReward: 150
  },
  {
    id: 'badge-creative-mind',
    title: 'Creative Mind',
    titleAr: '💡 العقل المبدع',
    description: 'تقديم تصاميم أو أفكار استثنائية حازت على أعلى تقييم جودة (5/5).',
    icon: 'Zap',
    category: 'Creativity',
    criteria: 'الحصول على 5/5 في تقييم جودة 5 مهام',
    xpReward: 120
  },
  {
    id: 'badge-future-leader',
    title: 'Future Leader',
    titleAr: '🚀 قائد المستقبل',
    description: 'إظهار مهارات قيادية عالية وحل مشكلات ميدانية ومساعدة الزملاء.',
    icon: 'Crown',
    category: 'Leadership',
    criteria: 'درجة قيادة تفوق 90% في التقييم الشامل',
    xpReward: 200
  },
  {
    id: 'badge-team-player',
    title: 'Team Player',
    titleAr: '🤝 روح الفريق',
    description: 'مساعدة اللجان الأخرى ودعم الزملاء في الأوقات الحرجة والمزدحمة.',
    icon: 'HeartHandshake',
    category: 'Teamwork',
    criteria: 'دعم 3 لجان أخرى أثناء الفعاليات',
    xpReward: 100
  },
  {
    id: 'badge-problem-solver',
    title: 'Problem Solver',
    titleAr: '⚡ منقذ الطوارئ',
    description: 'حل بلاغ طوارئ SOS ميداني بنجاح وسرعة استجابة فائقة.',
    icon: 'Flame',
    category: 'Crisis',
    criteria: 'المشاركة في حل بلاغ SOS معتمد',
    xpReward: 130
  }
];

export const initialAnnouncements: Announcement[] = [];

export const initialAuditLogs: AuditLogItem[] = [];

export const initialEvaluationRubric: EvaluationRubric = {
  id: 'rubric-unified',
  title: 'معايير التقييم الشامل الموحدة لأعضاء اللجان المتطوعين',
  description: 'المعايير المعتمدة رسمياً لقياس الأداء، تسليم المهام، والانضباط الميداني',
  lastUpdatedBy: 'مستشار الفريق (محمد رمضان)',
  lastUpdatedAt: '2026-09-24',
  criteria: [
    { id: 'crit-1', name: 'الالتزام والانضباط في المواعيد والحضور', maxPoints: 25, description: 'الحضور في الوقت المحدد للاجتماعات والفعاليات والالتزام باللوائح والتعليمات' },
    { id: 'crit-2', name: 'جودة ودقة تسليم المهام والمخرجات', maxPoints: 30, description: 'مدى مطابقة المهام للمواصفات المطلوبة والإتقان وسرعة التسليم' },
    { id: 'crit-3', name: 'روح الفريق والتعاون والتواصل الإيجابي', maxPoints: 25, description: 'التنسيق الفعال مع باقي الأعضاء ولجان العمل والتفاعل الإيجابي مع التوجيهات' },
    { id: 'crit-4', name: 'المبادرة والإبداع وحل المشكلات الميدانية', maxPoints: 20, description: 'تقديم أفكار تطويرية والتعامل بمرونة مع المواقف الطارئة' }
  ]
};

export const initialDocuments: DocumentItem[] = [];

export const initialCandidates: RecruitmentCandidate[] = [];

export const initialPermissions: Permission[] = [
  { code: 'members.view', name: 'استعراض الأعضاء', category: 'members', scope: 'all', enabled: true },
  { code: 'members.create', name: 'إضافة عضو جديد', category: 'members', scope: 'all', enabled: true },
  { code: 'members.edit', name: 'تعديل بيانات الأعضاء', category: 'members', scope: 'own_committee', enabled: true },
  { code: 'members.archive', name: 'أرشفة وتعطيل العضو', category: 'members', scope: 'all', enabled: true },
  
  { code: 'tasks.view', name: 'استعراض المهام', category: 'tasks', scope: 'all', enabled: true },
  { code: 'tasks.create', name: 'إنشاء مهام جديدة', category: 'tasks', scope: 'own_committee', enabled: true },
  { code: 'tasks.assign', name: 'إسناد المهام للأعضاء', category: 'tasks', scope: 'own_committee', enabled: true },
  { code: 'tasks.evaluate', name: 'تقييم جودة المهام', category: 'tasks', scope: 'own_committee', enabled: true },

  { code: 'events.view', name: 'استعراض الفعاليات', category: 'events', scope: 'all', enabled: true },
  { code: 'events.create', name: 'إنشاء فعالية جديدة', category: 'events', scope: 'all', enabled: true },
  { code: 'events.manage', name: 'إدارة غرفة العمليات الحية', category: 'events', scope: 'all', enabled: true },

  { code: 'attendance.view', name: 'استعراض سجلات الحضور', category: 'attendance', scope: 'all', enabled: true },
  { code: 'attendance.manage', name: 'تسجيل وتعديل الحضور بـ QR', category: 'attendance', scope: 'all', enabled: true },

  { code: 'evaluations.view', name: 'استعراض التقييمات', category: 'evaluations', scope: 'own_committee', enabled: true },
  { code: 'evaluations.create', name: 'إجراء تقييم 360', category: 'evaluations', scope: 'own_committee', enabled: true },

  { code: 'reports.view', name: 'استعراض التقارير الإحصائية', category: 'reports', scope: 'all', enabled: true },
  { code: 'reports.export', name: 'تصدير التقارير (PDF/Excel)', category: 'reports', scope: 'all', enabled: true },

  { code: 'sos.create', name: 'إطلاق بلاغ طوارئ', category: 'sos', scope: 'all', enabled: true },
  { code: 'sos.manage', name: 'إدارة وحل بلاغات الطوارئ', category: 'sos', scope: 'all', enabled: true },

  { code: 'documents.manage', name: 'إدارة ملفات اللجنة', category: 'documents', scope: 'own_committee', enabled: true },
  { code: 'settings.manage', name: 'إدارة إعدادات النظام والصلاحيات', category: 'settings', scope: 'all', enabled: true }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-welcome',
    title: '👑 مرحباً بك في المنظومة الرقمية الرسمية',
    message: 'أهلاً بك يا أستاذ محمد رمضان (مستشار الفريق). المنظومة مهيأة وجاهزة لاستقبال وتسجيل المتطوعين الجدد واعتمادهم رسمياً.',
    type: 'announcement',
    read: true,
    createdAt: 'سابقاً',
    linkTab: 'members'
  }
];

export const initialComplaints: Complaint[] = [];

export const initialSoundSettings: AppSoundSettings = {
  taskSound: 'crystal_chime',
  alertSound: 'cyber_alert',
  announcementSound: 'fanfare_win',
  enabled: true,
  volume: 0.75
};

export const initialBrandingSettings: AppBrandingSettings = {
  logoUrl: '/logo.png',
  appTitle: 'فريق متطوعين اتحاد طلاب جامعة الإسكندرية',
  subtitle: 'المنظومة الرقمية الرسمية • Alexandria University Student Union',
  tickerMessages: [
    '✨ أهلاً بكم في المنصة الموحدة لإدارة وتشغيل فريق المتطوعين • نصنع الفرق بروح الفريق الواحد!',
    '🌟 "التطوع ليس مجرد عمل، بل هو شغف يبني شخصية القائد ويصنع أثراً يدوم."',
    '🚀 البوابة الرسمية جاهزة لاستقبال المتطوعين الجدد وتوزيعهم على اللجان التخصصية.'
  ],
  tickerActive: true,
  tickerSpeed: 5,
  fontSizeMode: 'compact'
};

export const initialRolePermissionsMap: RolePermissionsMap = {
  super_admin: {
    'members.view': true, 'members.create': true, 'members.edit': true, 'members.archive': true,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': true
  },
  vice_president: {
    'members.view': true, 'members.create': true, 'members.edit': true, 'members.archive': true,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': true
  },
  advisor: {
    'members.view': true, 'members.create': true, 'members.edit': true, 'members.archive': true,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': true
  },
  general_coordinator: {
    'members.view': true, 'members.create': true, 'members.edit': true, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  operations_manager: {
    'members.view': true, 'members.create': false, 'members.edit': true, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': false,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  quality_officer: {
    'members.view': true, 'members.create': false, 'members.edit': true, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': false, 'events.manage': false,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': false, 'sos.manage': false,
    'documents.manage': true, 'settings.manage': false
  },
  head: {
    'members.view': true, 'members.create': false, 'members.edit': true, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': false, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  vice_head: {
    'members.view': true, 'members.create': false, 'members.edit': true, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': false, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': false,
    'reports.view': true, 'reports.export': false,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  hr_admin: {
    'members.view': true, 'members.create': true, 'members.edit': true, 'members.archive': true,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': true,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': true,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  event_manager: {
    'members.view': true, 'members.create': false, 'members.edit': false, 'members.archive': false,
    'tasks.view': true, 'tasks.create': true, 'tasks.assign': true, 'tasks.evaluate': false,
    'events.view': true, 'events.create': true, 'events.manage': true,
    'attendance.view': true, 'attendance.manage': true,
    'evaluations.view': true, 'evaluations.create': false,
    'reports.view': true, 'reports.export': true,
    'sos.create': true, 'sos.manage': true,
    'documents.manage': true, 'settings.manage': false
  },
  member: {
    'members.view': true, 'members.create': false, 'members.edit': false, 'members.archive': false,
    'tasks.view': true, 'tasks.create': false, 'tasks.assign': false, 'tasks.evaluate': false,
    'events.view': true, 'events.create': false, 'events.manage': false,
    'attendance.view': true, 'attendance.manage': false,
    'evaluations.view': false, 'evaluations.create': false,
    'reports.view': false, 'reports.export': false,
    'sos.create': true, 'sos.manage': false,
    'documents.manage': false, 'settings.manage': false
  }
};

export const initialHeadEvaluationRubric: HeadEvaluationRubric = {
  id: 'rubric-heads-2026',
  title: 'المعايير القيادية الموحدة لتقييم رؤساء ونواب اللجان',
  description: 'معايير إدارية وتشغيلية تضعها الإدارة العليا لتقييم أداء قادة اللجان وفريق العمل',
  lastUpdatedBy: 'مستشار الفريق (محمد رمضان)',
  lastUpdatedAt: '2026-09-24',
  criteria: [
    { id: 'crit-lead-1', name: 'القيادة التشغيلية وإدارة أعضاء اللجنة', maxPoints: 20, description: 'القدرة على توجيه وتوزيع المهام وتحفيز أعضاء اللجنة ومتابعتهم' },
    { id: 'crit-lead-2', name: 'جودة وتسليم المخرجات ومؤشرات الـ KPIs', maxPoints: 25, description: 'تحقيق أهداف اللجنة في المواعيد المحددة وبأعلى درجات الجودة' },
    { id: 'crit-lead-3', name: 'التواصل المؤسسي والتقارير الدورية للإدارة العليا', maxPoints: 20, description: 'الالتزام برفع تقارير الإنجازات وسجلات الحضور والتقييمات اليومية' },
    { id: 'crit-lead-4', name: 'المبادرة وحل المشكلات وإدارة الأزمات الميدانية', maxPoints: 20, description: 'المرونة وسرعة التصرف في المواقف الطارئة والفعاليات الكبرى' },
    { id: 'crit-lead-5', name: 'الانضباط وحضور الاجتماعات القيادية الرسمية', maxPoints: 15, description: 'الالتزام بمواعيد اجتماعات مجلس القيادة والتنسيق المشترك بين اللجان' }
  ]
};

export const initialHeadEvaluations: HeadEvaluationRecord[] = [];

export const initialAttendancePointsConfig: AttendancePointsConfig = {
  onTimePoints: 30,
  minorDelayThresholdMinutes: 15,
  minorDelayPoints: 20,
  majorDelayPoints: 10,
  excusedAbsencePoints: 0,
  unexcusedAbsencePenalty: -15,
};
