import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Season, Committee, Member, Task, EventEntity, AttendanceRecord, 
  SOSAlert, EvaluationTemplate, TrainingCourse, BadgeItem, 
  Announcement, AuditLogItem, DocumentItem, RecruitmentCandidate, 
  Permission, SystemNotification, TaskStatus, TaskEvaluation, KPICriterion,
  Complaint, ComplaintStatus, AppSoundSettings, AppBrandingSettings, 
  RolePermissionsMap, Role, EvaluationRubric, MemberEvaluationRecord, ComplaintCategory,
  MemberStatus, AttendanceSession, DailySessionEvaluation, GPSLocation,
  AnnouncementReaction, AnnouncementPoll, PollOption, PollVote,
  HeadEvaluationRecord, HeadEvaluationRubric, TaskAttachment,
  BannedUserRecord, CommitteeHistoryItem, EventRSVP, AttendancePointsConfig,
  CertifiedSkillItem, MemberPerformance
} from '../types';
import { 
  initialSeasons, initialCommittees, initialMembers, initialTasks, 
  initialEvents, initialAttendanceRecords, initialSOSAlerts, 
  initialEvaluationTemplate, initialTrainings, initialBadges, 
  initialAnnouncements, initialAuditLogs, initialDocuments, 
  initialCandidates, initialPermissions, initialNotifications,
  initialComplaints, initialSoundSettings, initialBrandingSettings,
  initialRolePermissionsMap, initialEvaluationRubric,
  initialHeadEvaluationRubric, initialHeadEvaluations,
  initialAttendancePointsConfig
} from '../data/initialData';
import { playAppTone } from '../utils/soundEngine';
import { generateCommitteeVolunteerId } from '../utils/volunteerId';
import { isHighLeadershipRole, getRoleOfficialTitle } from '../utils/roleUtils';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { getMemberExactBirthData } from '../utils/nationalId';
import { 
  getNotificationPermission, 
  requestNotificationPermission as reqPushPerm, 
  sendSystemPushNotification 
} from '../utils/pushNotifications';

export const isHighLeadershipMember = (member?: Member | null): boolean => {
  if (!member) return false;
  if (isHighLeadershipRole(member.role)) return true;
  if (member.currentCommitteeId === 'comm-leadership') return true;
  if (member.currentCommitteeName?.includes('القيادة العليا')) return true;
  if (
    member.position?.includes('رئيس فريق') || 
    member.position?.includes('رئيس الفريق') || 
    member.position?.includes('نائب رئيس') || 
    member.position?.includes('مستشار')
  ) return true;
  if (
    member.fullName?.includes('يوسف محمد') || 
    member.fullName?.includes('ملك محمد') || 
    member.fullName?.includes('أسامة ممدوح') || 
    member.fullName?.includes('محمد رمضان')
  ) return true;
  if (['user-president-youssef-mohamed', 'user-vp-malak-mohamed', 'user-advisor-osama-mamdouh', 'user-advisor-mohamed-ramadan'].includes(member.id)) return true;
  return false;
};

interface AppContextType {
  seasons: Season[];
  activeSeasonId: string;
  activeSeason: Season;
  committees: Committee[];
  members: Member[];
  currentUser: Member;
  tasks: Task[];
  events: EventEntity[];
  attendanceRecords: AttendanceRecord[];
  attendanceSessions: AttendanceSession[];
  activeAttendanceSession: AttendanceSession | null;
  canCreateAttendanceSession: boolean;
  sosAlerts: SOSAlert[];
  evaluationTemplate: EvaluationTemplate;
  evaluationRubric: EvaluationRubric;
  memberEvaluations: MemberEvaluationRecord[];
  headEvaluations: HeadEvaluationRecord[];
  headEvaluationRubric: HeadEvaluationRubric;
  trainings: TrainingCourse[];
  badges: BadgeItem[];
  announcements: Announcement[];
  auditLogs: AuditLogItem[];
  documents: DocumentItem[];
  candidates: RecruitmentCandidate[];
  permissions: Permission[];
  notifications: SystemNotification[];
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
  dispatchPushNotification: (title: string, message: string, type?: SystemNotification['type']) => Promise<boolean>;
  testPushNotification: () => Promise<boolean>;
  complaints: Complaint[];
  soundSettings: AppSoundSettings;
  branding: AppBrandingSettings;
  rolePermissions: RolePermissionsMap;
  activeTab: string;
  isLiveCommandCenterActive: boolean;
  liveEvent: EventEntity | undefined;
  teamHealthScore: number;
  
  // Leadership Helpers
  isHighLeadership: boolean;
  canManageAll: boolean;
  isHead: boolean;
  isHighLeadershipMember: (member?: Member | null) => boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  switchSeason: (seasonId: string) => void;
  switchPersona: (memberId: string) => void;
  addMember: (memberData: Partial<Member>) => void;
  importMembersBulk: (newMembers: Partial<Member>[]) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  isVolunteerIdAvailable: (volunteerId: string, excludeMemberId?: string) => { isAvailable: boolean; heldByMember?: Member };
  changeVolunteerId: (memberId: string, newVolunteerId: string, allowSwap?: boolean) => { success: boolean; message: string; swappedWithMemberId?: string; existingMember?: Member };
  deleteMember: (id: string, alsoBanEmail?: boolean, banReason?: string) => void;
  banMember: (id: string, reason: string) => void;
  unbanMember: (id: string) => void;
  filterOutMember: (id: string, reason?: string) => void;
  bannedList: BannedUserRecord[];
  isUserBanned: (emailOrNationalId: string) => boolean;
  archiveMember: (id: string, reason: string) => void;
  transferMemberCommittee: (memberId: string, newCommitteeId: string, reason: string, newRole?: Role, newPosition?: string) => void;
  assignCommitteeHead: (committeeId: string, memberId: string) => void;
  assignCommitteeViceHead: (committeeId: string, memberId: string) => void;
  removeCommitteeHead: (committeeId: string, memberId: string) => void;
  removeCommitteeViceHead: (committeeId: string, memberId: string) => void;
  revealNationalId: (memberId: string) => void;
  createCommittee: (committeeData: Partial<Committee>) => void;
  updateCommittee: (id: string, updates: Partial<Committee>) => void;
  deleteCommittee: (id: string) => void;
  createTask: (taskData: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  submitTask: (taskId: string, notes: string, attachments?: TaskAttachment[], fileUrls?: string[]) => void;
  evaluateTask: (taskId: string, evalData: TaskEvaluation, awardedPoints?: number) => void;
  calculateCommitteeHealth: (committeeId: string) => number;
  createEvent: (eventData: Partial<EventEntity>) => void;
  updateEvent: (id: string, updates: Partial<EventEntity>) => void;
  deleteEvent: (id: string) => void;
  respondToEventRSVP: (eventId: string, status: 'Attending' | 'Apologized', expectedArrivalTime?: string, apologyReason?: string) => void;
  sendEventDayReminder: (eventId: string) => void;
  attendancePointsConfig: AttendancePointsConfig;
  updateAttendancePointsConfig: (config: AttendancePointsConfig) => void;
  recordAttendance: (memberId: string, eventId: string, actionType: 'check-in' | 'check-out') => { success: boolean; message: string };
  recordAttendanceWithGPS: (params: { 
    memberId: string; 
    eventId?: string; 
    sessionId?: string; 
    actionType: 'check-in' | 'check-out' | 'auto'; 
    gpsLocation?: GPSLocation;
    qrToken?: string;
  }) => { 
    success: boolean; 
    message: string; 
    record?: AttendanceRecord; 
    actionDone?: 'check-in' | 'check-out'; 
    isCompleted?: boolean;
  };
  createAttendanceSession: (sessionData: Partial<AttendanceSession>) => AttendanceSession;
  closeAttendanceSession: (sessionId: string) => void;
  submitDailyAttendanceEvaluation: (recordId: string, evalData: {
    attendanceCommitment?: number;
    taskQuality?: number;
    teamworkCommunication?: number;
    initiativePassion?: number;
    attendanceScore?: number;
    participationScore?: number;
    commitmentScore?: number;
    taskExecutionScore?: number;
    criteriaScores?: { [criterionName: string]: number };
    criteriaGrades?: { [criterionName: string]: 'A' | 'B' | 'C' | 'Custom' };
    criteriaNotes?: { [criterionName: string]: string };
    totalDailyScore?: number;
    overallGrade?: 'A+' | 'A' | 'B' | 'C' | 'D';
    bonusXP?: number;
    notes?: string;
    memberId?: string;
    eventId?: string;
    eventName?: string;
    sessionId?: string;
    sessionTitle?: string;
    date?: string;
  }) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  manualRecordAttendance: (recordData: Partial<AttendanceRecord>) => void;
  createSOSAlert: (alertData: Partial<SOSAlert>) => void;
  acknowledgeSOS: (alertId: string) => void;
  resolveSOS: (alertId: string) => void;
  updateEvaluationTemplate: (criteria: KPICriterion[]) => void;
  updateEvaluationRubric: (rubric: EvaluationRubric) => void;
  submitMemberEvaluation: (evalRecord: Omit<MemberEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'> & { evaluationDate?: string }) => void;
  updateMemberEvaluation: (id: string, updates: Partial<MemberEvaluationRecord>) => void;
  deleteMemberEvaluation: (id: string) => void;
  evaluateHead: (evalRecord: Omit<HeadEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'> & { evaluationDate?: string }) => void;
  updateHeadEvaluation: (id: string, updates: Partial<HeadEvaluationRecord>) => void;
  deleteHeadEvaluation: (id: string) => void;
  updateHeadEvaluationRubric: (rubric: HeadEvaluationRubric) => void;
  addBadge: (badge: Omit<BadgeItem, 'id'>) => void;
  updateBadge: (id: string, updates: Partial<BadgeItem>) => void;
  deleteBadge: (id: string) => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  addTrainingCourse: (course: Omit<TrainingCourse, 'id' | 'enrolledMemberIds' | 'completedMemberIds'>) => void;
  updateTrainingCourse: (id: string, updates: Partial<TrainingCourse>) => void;
  deleteTrainingCourse: (id: string) => void;
  enrollTraining: (trainingId: string, memberId: string) => void;
  completeTraining: (trainingId: string, memberId: string) => void;
  setTaskStance: (taskId: string, stance: 'Committed' | 'Excused', excuseReason?: string) => void;
  voteOnPoll: (announcementId: string, optionId: string) => void;
  reactToAnnouncement: (announcementId: string, emoji: string, label?: string) => void;
  updateStamp: (stampUrl: string) => void;
  createAnnouncement: (
    titleOrData: string | Partial<Announcement>, 
    content?: string, 
    targetType?: Announcement['targetType'], 
    targetCommitteeId?: string, 
    targetCommitteeName?: string, 
    isPinned?: boolean
  ) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  updateCandidateStatus: (candId: string, status: RecruitmentCandidate['status'], score?: number, notes?: string) => void;
  convertCandidateToMember: (candId: string, committeeId: string) => void;
  addAuditLog: (action: string, targetEntity: string, details: string, prev?: string, next?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getAIRecommendationForTask: (requiredSkills: string[], committeeId?: string) => { member: Member; matchScore: number; reason: string }[];
  getHighRiskMembers: () => Member[];
  getSuccessionCandidates: (committeeId?: string) => { member: Member; leadershipScore: number; recommendedRole: string }[];
  triggerGamificationCelebration: (badgeTitle: string, points: number) => void;
  celebrationData: { active: boolean; badgeTitle: string; points: number } | null;

  // Customization & Workflow Actions
  updateLogo: (logoUrl: string) => void;
  updateBranding: (updates: Partial<AppBrandingSettings>) => void;
  updateTickerMessages: (messages: string[]) => void;
  updateSoundSettings: (updates: Partial<AppSoundSettings>) => void;
  playSound: (soundIdOrType?: 'task' | 'alert' | 'announcement' | 'normal' | 'success' | string) => void;
  createComplaint: (complaintData: Partial<Complaint>) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, responseNotes?: string, internalNotes?: string) => void;
  getVisibleComplaintsForUser: () => Complaint[];
  updateRolePermissions: (role: Role, perms: { [permCode: string]: boolean }) => void;
  updateMemberSelfProfile: (memberId: string, profileData: { 
    fullName?: string;
    nationalId?: string;
    birthDate?: string;
    age?: number;
    phone?: string;
    whatsappNumber?: string;
    college?: string;
    academicYear?: string;
    bloodType?: string;
    emergencyContact?: string;
    address?: string;
    avatarUrl?: string; 
    bio?: string;
    hobbies?: string[]; 
    learningAspirations?: string[];
    certifiedSkills?: CertifiedSkillItem[];
    facebookUrl?: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    committeeHistory?: CommitteeHistoryItem[];
    points?: number;
    level?: number;
    badges?: string[];
    position?: string;
    role?: Role;
    currentCommitteeId?: string;
    currentCommitteeName?: string;
    volunteerId?: string;
    performance?: Partial<MemberPerformance>;
  }) => void;
  toggleTaskSubtask: (taskId: string, subtaskId: string) => void;
  rateComplaintResolution: (complaintId: string, rating: number) => void;
  // Authentication & Approval State
  isAuthenticated: boolean;
  pendingMembers: Member[];
  loginWithEmail: (email: string, password?: string) => { success: boolean; message: string; status?: MemberStatus; member?: Member };
  registerVolunteer: (formData: {
    fullName: string;
    email: string;
    password?: string;
    college: string;
    academicYear: string;
    whatsapp: string;
    nationalId: string;
    birthDate: string;
    preferredCommitteeId: string;
    bio?: string;
    skills?: { [k: string]: number };
  }) => { success: boolean; message: string; member?: Member };
  approveMemberRegistration: (memberId: string, assignedCommitteeId: string, customRole?: Role, customPosition?: string) => { success: boolean; volunteerId: string };
  rejectMemberRegistration: (memberId: string, reason?: string) => void;
  grantBadgeToMember: (memberId: string, badgeId: string) => void;
  revokeBadgeFromMember: (memberId: string, badgeId: string) => void;
  logout: () => void;
  setFontSizeMode: (mode: 'compact' | 'normal' | 'large') => void;
  hasPermission: (permCode: string) => boolean;
  isSupabaseConnected: boolean;
  syncWithCloud: (options?: { forcePush?: boolean; silent?: boolean }) => Promise<void>;
  saveAllToCloud: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ALEXU_VOLUNTEERS_PLATFORM_V2_PROD';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SEASONS`);
    return saved ? JSON.parse(saved) : initialSeasons;
  });

  const [activeSeasonId, setActiveSeasonId] = useState<string>('season-2026-2027');

  const [committees, setCommittees] = useState<Committee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_COMMITTEES`);
    let list: Committee[] = saved ? JSON.parse(saved) : initialCommittees;
    if (!list.some(c => c.id === 'comm-leadership')) {
      const leadershipComm = initialCommittees.find(c => c.id === 'comm-leadership');
      if (leadershipComm) {
        list = [leadershipComm, ...list];
      }
    }
    return list;
  });

  const [deletedMemberIds, setDeletedMemberIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_DELETED_MEMBER_IDS`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_DELETED_MEMBER_IDS`, JSON.stringify(deletedMemberIds));
  }, [deletedMemberIds]);

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MEMBERS`);
    const deletedSet = new Set(JSON.parse(localStorage.getItem(`${STORAGE_KEY}_DELETED_MEMBER_IDS`) || '[]'));
    let list: Member[] = saved ? JSON.parse(saved) : initialMembers;

    // Filter out any explicitly deleted members
    list = list.filter(m => !deletedSet.has(m.id));

    // Zero points for leadership & heads
    list = list.map(m => {
      const isLeadOrHead = isHighLeadershipRole(m.role) || m.role === 'head' || m.role === 'vice_head' || m.currentCommitteeId === 'comm-leadership';
      const cleanPoints = isLeadOrHead ? 0 : (m.points || 0);
      const cleanLevel = isLeadOrHead ? 1 : (m.level || 1);

      return {
        ...m,
        points: cleanPoints,
        level: cleanLevel
      };
    });

    return list;
  });

  // Automatically keep committee head and vice names in 100% sync with active members list
  useEffect(() => {
    setCommittees(prev => prev.map(c => {
      if (c.id === 'comm-leadership') return c;
      const head = members.find(m => m.status === 'Active' && m.currentCommitteeId === c.id && (m.role === 'head' || (m.position && (m.position.includes('رئيس') || m.position.includes('هيد')))));
      const vice = members.find(m => m.status === 'Active' && m.currentCommitteeId === c.id && (m.role === 'vice_head' || (m.position && m.position.includes('نائب'))));
      
      const newHeadName = head ? head.fullName : (c.headName && c.headName !== 'لم يحدد' ? c.headName : 'لم يحدد');
      const newHeadId = head ? head.id : (c.headId || '');
      const newViceName = vice ? vice.fullName : (c.viceName && c.viceName !== 'لم يحدد' ? c.viceName : 'لم يحدد');
      const newViceId = vice ? vice.id : (c.viceId || '');

      if (c.headName !== newHeadName || c.headId !== newHeadId || c.viceName !== newViceName || c.viceId !== newViceId) {
        return {
          ...c,
          headName: newHeadName,
          headId: newHeadId,
          viceName: newViceName,
          viceId: newViceId
        };
      }
      return c;
    }));
  }, [members]);

  const [bannedList, setBannedList] = useState<BannedUserRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_BANNED`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BANNED`, JSON.stringify(bannedList));
  }, [bannedList]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_AUTH_STATUS`);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    return saved ? saved : '';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_AUTH_USER_ID`, currentUserId);
  }, [currentUserId]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TASKS`);
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [events, setEvents] = useState<EventEntity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EVENTS`);
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ATTENDANCE`);
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SOS`);
    return saved ? JSON.parse(saved) : initialSOSAlerts;
  });

  const [evaluationTemplate, setEvaluationTemplate] = useState<EvaluationTemplate>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EVAL_TMPL`);
    return saved ? JSON.parse(saved) : initialEvaluationTemplate;
  });

  const [trainings, setTrainings] = useState<TrainingCourse[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TRAININGS`);
    return saved ? JSON.parse(saved) : initialTrainings;
  });

  const [badges, setBadges] = useState<BadgeItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_BADGES`);
    return saved ? JSON.parse(saved) : initialBadges;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ANNOUNCEMENTS`);
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_AUDIT`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_DOCUMENTS`);
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CANDIDATES`);
    return saved ? JSON.parse(saved) : initialCandidates;
  });

  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PERMISSIONS`);
    return saved ? JSON.parse(saved) : initialPermissions;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_NOTIFS`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    return getNotificationPermission();
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_COMPLAINTS`);
    return saved ? JSON.parse(saved) : initialComplaints;
  });

  const [soundSettings, setSoundSettings] = useState<AppSoundSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_SOUND_SETTINGS`);
    return saved ? JSON.parse(saved) : initialSoundSettings;
  });

  const [branding, setBranding] = useState<AppBrandingSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_BRANDING`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.logoUrl || parsed.logoUrl.trim() === '') {
          parsed.logoUrl = '/logo.png';
        }
        return parsed;
      } catch (e) {
        return initialBrandingSettings;
      }
    }
    return initialBrandingSettings;
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ROLE_PERMS`);
    return saved ? JSON.parse(saved) : initialRolePermissionsMap;
  });

  const [evaluationRubric, setEvaluationRubric] = useState<EvaluationRubric>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EVAL_RUBRIC`);
    return saved ? JSON.parse(saved) : initialEvaluationRubric;
  });

  const [memberEvaluations, setMemberEvaluations] = useState<MemberEvaluationRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MEMBER_EVALS`);
    return saved ? JSON.parse(saved) : [];
  });

  const [headEvaluations, setHeadEvaluations] = useState<HeadEvaluationRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_HEAD_EVALS`);
    return saved ? JSON.parse(saved) : initialHeadEvaluations;
  });

  const [headEvaluationRubric, setHeadEvaluationRubric] = useState<HeadEvaluationRubric>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_HEAD_EVAL_RUBRIC`);
    return saved ? JSON.parse(saved) : initialHeadEvaluationRubric;
  });

  const [attendancePointsConfig, setAttendancePointsConfig] = useState<AttendancePointsConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ATTENDANCE_POINTS_CONFIG`);
    return saved ? JSON.parse(saved) : initialAttendancePointsConfig;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ATTENDANCE_POINTS_CONFIG`, JSON.stringify(attendancePointsConfig));
  }, [attendancePointsConfig]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [celebrationData, setCelebrationData] = useState<{ active: boolean; badgeTitle: string; points: number } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_MEMBERS`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TASKS`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EVENTS`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ATTENDANCE`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SOS`, JSON.stringify(sosAlerts));
  }, [sosAlerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_DOCUMENTS`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TRAININGS`, JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BADGES`, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ANNOUNCEMENTS`, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_AUDIT`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_COMPLAINTS`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SOUND_SETTINGS`, JSON.stringify(soundSettings));
  }, [soundSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BRANDING`, JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_HEAD_EVALS`, JSON.stringify(headEvaluations));
  }, [headEvaluations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_HEAD_EVAL_RUBRIC`, JSON.stringify(headEvaluationRubric));
  }, [headEvaluationRubric]);

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ATT_SESSIONS`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ATT_SESSIONS`, JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ROLE_PERMS`, JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_MEMBER_EVALS`, JSON.stringify(memberEvaluations));
  }, [memberEvaluations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_COMMITTEES`, JSON.stringify(committees));
  }, [committees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_SEASONS`, JSON.stringify(seasons));
  }, [seasons]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_NOTIFS`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CANDIDATES`, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_PERMISSIONS`, JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EVAL_TMPL`, JSON.stringify(evaluationTemplate));
  }, [evaluationTemplate]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EVAL_RUBRIC`, JSON.stringify(evaluationRubric));
  }, [evaluationRubric]);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());

  const saveAllToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase غير مهيأ' };
    }
    const res = await SupabaseService.saveAllDataToCloud({
      members,
      committees,
      seasons,
      tasks,
      events,
      attendanceRecords,
      attendanceSessions,
      memberEvaluations,
      headEvaluations,
      complaints,
      documents,
      announcements,
      bannedUsers: bannedList
    });
    if (res.success) {
      setIsSupabaseConnected(true);
      showNotification('success', res.message);
    } else {
      showNotification('error', res.message);
    }
    return res;
  };

  const syncWithCloud = async (options?: { forcePush?: boolean; silent?: boolean }) => {
    if (!isSupabaseConfigured()) return;
    try {
      if (options?.forcePush) {
        await SupabaseService.saveAllDataToCloud({
          members,
          committees,
          seasons,
          tasks,
          events,
          attendanceRecords,
          attendanceSessions,
          memberEvaluations,
          headEvaluations,
          complaints,
          documents,
          announcements,
          bannedUsers: bannedList
        });
      }

      const cloudData = await SupabaseService.loadAllData();
      if (cloudData) {
        // Smart Merge Members: sync from cloud and exclude any deleted members
        if (cloudData.members && cloudData.members.length > 0) {
          const currentDeleted = new Set(JSON.parse(localStorage.getItem(`${STORAGE_KEY}_DELETED_MEMBER_IDS`) || '[]'));

          setMembers(prev => {
            const localMap = new Map(prev.filter(m => !currentDeleted.has(m.id)).map(m => [m.id, m]));
            const merged: Member[] = [];

            cloudData.members!.forEach(cloudM => {
              if (currentDeleted.has(cloudM.id)) return;
              const localM = localMap.get(cloudM.id);
              if (localM) {
                merged.push({
                  ...cloudM,
                  points: localM.points !== undefined ? localM.points : cloudM.points,
                  level: localM.level !== undefined ? localM.level : cloudM.level,
                  badges: (localM.badges && localM.badges.length > 0) ? localM.badges : cloudM.badges,
                  phone: localM.phone || cloudM.phone,
                  whatsappNumber: localM.whatsappNumber || cloudM.whatsappNumber,
                  bloodType: localM.bloodType || cloudM.bloodType,
                  emergencyContact: localM.emergencyContact || cloudM.emergencyContact,
                  address: localM.address || cloudM.address,
                  bio: localM.bio || cloudM.bio,
                  hobbies: (localM.hobbies && localM.hobbies.length > 0) ? localM.hobbies : cloudM.hobbies,
                  learningAspirations: (localM.learningAspirations && localM.learningAspirations.length > 0) ? localM.learningAspirations : cloudM.learningAspirations,
                  certifiedSkills: (localM.certifiedSkills && localM.certifiedSkills.length > 0) ? localM.certifiedSkills : cloudM.certifiedSkills
                });
              } else {
                merged.push(cloudM);
              }
            });

            return merged;
          });
        }

        // Smart Merge Committees
        if (cloudData.committees && cloudData.committees.length > 0) {
          setCommittees(prev => {
            const cloudMap = new Map(cloudData.committees!.map(c => [c.id, c]));
            const merged = cloudData.committees!.slice();
            prev.forEach(localC => {
              if (!cloudMap.has(localC.id)) {
                merged.push(localC);
                SupabaseService.upsertCommittee(localC).catch(err => console.warn('Sync push local committee warning:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Seasons
        if (cloudData.seasons && cloudData.seasons.length > 0) {
          setSeasons(prev => {
            const cloudMap = new Map(cloudData.seasons!.map(s => [s.id, s]));
            const merged = cloudData.seasons!.slice();
            prev.forEach(localS => {
              if (!cloudMap.has(localS.id)) {
                merged.push(localS);
                SupabaseService.upsertSeason(localS).catch(err => console.warn('Sync push local season warning:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Tasks: preserve local tasks and subtasks
        if (cloudData.tasks) {
          setTasks(prev => {
            const cloudMap = new Map(cloudData.tasks!.map(t => [t.id, t]));
            const localMap = new Map(prev.map(t => [t.id, t]));
            const merged: Task[] = [];

            cloudData.tasks!.forEach(cloudT => {
              const localT = localMap.get(cloudT.id);
              if (localT) {
                merged.push({
                  ...cloudT,
                  subtasks: (localT.subtasks && localT.subtasks.length > 0) ? localT.subtasks : cloudT.subtasks,
                  submission: localT.submission || cloudT.submission,
                  stance: localT.stance || cloudT.stance
                });
              } else {
                merged.push(cloudT);
              }
            });

            // Push any local tasks not in cloud
            prev.forEach(localT => {
              if (!cloudMap.has(localT.id)) {
                merged.unshift(localT);
                SupabaseService.upsertTask(localT).catch(err => console.warn('Sync push local task warning:', err));
              }
            });

            return merged;
          });
        }

        // Smart Merge Events: preserve local events and RSVPs
        if (cloudData.events) {
          setEvents(prev => {
            const cloudMap = new Map(cloudData.events!.map(e => [e.id, e]));
            const localMap = new Map(prev.map(e => [e.id, e]));
            const merged: EventEntity[] = [];

            cloudData.events!.forEach(cloudE => {
              const localE = localMap.get(cloudE.id);
              if (localE) {
                merged.push({
                  ...cloudE,
                  rsvps: { ...(cloudE.rsvps || {}), ...(localE.rsvps || {}) }
                });
              } else {
                merged.push(cloudE);
              }
            });

            // Push local events not in cloud
            prev.forEach(localE => {
              if (!cloudMap.has(localE.id)) {
                merged.unshift(localE);
                SupabaseService.upsertEvent(localE).catch(err => console.warn('Sync push local event warning:', err));
              }
            });

            return merged;
          });
        }

        // Smart Merge Attendance Records
        if (cloudData.attendanceRecords) {
          setAttendanceRecords(prev => {
            const cloudMap = new Map(cloudData.attendanceRecords!.map(a => [a.id, a]));
            const merged = cloudData.attendanceRecords!.slice();
            prev.forEach(localA => {
              if (!cloudMap.has(localA.id)) {
                merged.unshift(localA);
                SupabaseService.insertAttendanceRecord(localA).catch(err => console.warn('Sync push local attendance record:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Attendance Sessions
        if (cloudData.attendanceSessions) {
          setAttendanceSessions(prev => {
            const cloudMap = new Map(cloudData.attendanceSessions!.map(s => [s.id, s]));
            const merged = cloudData.attendanceSessions!.slice();
            prev.forEach(localS => {
              if (!cloudMap.has(localS.id)) {
                merged.unshift(localS);
                SupabaseService.upsertAttendanceSession(localS).catch(err => console.warn('Sync push local attendance session:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Member Evaluations
        if (cloudData.memberEvaluations) {
          setMemberEvaluations(prev => {
            const cloudMap = new Map(cloudData.memberEvaluations!.map(e => [e.id, e]));
            const merged = cloudData.memberEvaluations!.slice();
            prev.forEach(localE => {
              if (!cloudMap.has(localE.id)) {
                merged.unshift(localE);
                SupabaseService.upsertMemberEvaluation(localE).catch(err => console.warn('Sync push local eval:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Head Evaluations
        if (cloudData.headEvaluations) {
          setHeadEvaluations(prev => {
            const cloudMap = new Map(cloudData.headEvaluations!.map(he => [he.id, he]));
            const merged = cloudData.headEvaluations!.slice();
            prev.forEach(localHE => {
              if (!cloudMap.has(localHE.id)) {
                merged.unshift(localHE);
                SupabaseService.upsertHeadEvaluation(localHE).catch(err => console.warn('Sync push local head eval:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Complaints
        if (cloudData.complaints) {
          setComplaints(prev => {
            const cloudMap = new Map(cloudData.complaints!.map(c => [c.id, c]));
            const merged = cloudData.complaints!.slice();
            prev.forEach(localC => {
              if (!cloudMap.has(localC.id)) {
                merged.unshift(localC);
                SupabaseService.upsertComplaint(localC).catch(err => console.warn('Sync push local complaint:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Documents
        if (cloudData.documents) {
          setDocuments(prev => {
            const cloudMap = new Map(cloudData.documents!.map(d => [d.id, d]));
            const merged = cloudData.documents!.slice();
            prev.forEach(localD => {
              if (!cloudMap.has(localD.id)) {
                merged.unshift(localD);
                SupabaseService.upsertDocument(localD).catch(err => console.warn('Sync push local doc:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Announcements
        if (cloudData.announcements) {
          setAnnouncements(prev => {
            const cloudMap = new Map(cloudData.announcements!.map(a => [a.id, a]));
            const merged = cloudData.announcements!.slice();
            prev.forEach(localA => {
              if (!cloudMap.has(localA.id)) {
                merged.unshift(localA);
                SupabaseService.upsertAnnouncement(localA).catch(err => console.warn('Sync push local announcement:', err));
              }
            });
            return merged;
          });
        }

        // Smart Merge Audit Logs
        if (cloudData.auditLogs) {
          setAuditLogs(prev => {
            const cloudMap = new Map(cloudData.auditLogs!.map(l => [l.id, l]));
            const merged = cloudData.auditLogs!.slice();
            prev.forEach(localL => {
              if (!cloudMap.has(localL.id)) {
                merged.unshift(localL);
              }
            });
            return merged;
          });
        }

        // Cloud Notifications Sync
        if (cloudData.notifications) {
          setNotifications(cloudData.notifications);
        }

        // Smart Merge Banned Users
        if (cloudData.bannedUsers && cloudData.bannedUsers.length > 0) {
          setBannedList(prev => {
            const cloudMap = new Map(cloudData.bannedUsers!.map(b => [b.id, b]));
            const merged = cloudData.bannedUsers!.slice();
            prev.forEach(localB => {
              if (!cloudMap.has(localB.id)) {
                merged.push(localB);
                SupabaseService.upsertBannedUser(localB).catch(err => console.warn('Sync push banned user:', err));
              }
            });
            return merged;
          });
        }

        setIsSupabaseConnected(true);
      }
    } catch (e) {
      console.warn('Supabase sync note:', e);
    }
  };

  // Realtime Cloud Listener & Polling Heartbeat
  useEffect(() => {
    syncWithCloud();

    // 1. Setup Supabase Realtime Subscription
    const channel = SupabaseService.subscribeToAllChanges((table, eventType, newRow, oldRow) => {
      try {
        if (table === 'tasks') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const taskObj: Task = {
              id: newRow.id,
              title: newRow.title,
              description: newRow.description,
              committeeId: newRow.committee_id,
              committeeName: newRow.committee_name,
              assignedToMemberIds: newRow.assigned_to_ids || [],
              assignedToMemberNames: newRow.assigned_to_names || [],
              createdByMemberId: newRow.created_by_id,
              createdByMemberName: newRow.created_by_name,
              priority: newRow.priority,
              deadline: newRow.deadline,
              status: newRow.status,
              attachments: newRow.attachments || [],
              submission: newRow.submission,
              evaluation: newRow.evaluation,
              requiredSkills: newRow.required_skills || [],
              eventId: newRow.event_id,
              eventName: newRow.event_name,
              completionPercentage: newRow.completion_percentage || 0,
              maxPoints: newRow.max_points || newRow.xp_reward || 30,
              xpReward: newRow.xp_reward || newRow.max_points || 30,
              subtasks: newRow.subtasks || [],
              voiceNoteUrl: newRow.voice_note_url,
              voiceDuration: newRow.voice_duration,
              stance: newRow.stance,
              excuseReason: newRow.excuse_reason,
              excusedAt: newRow.excused_at,
              excusedByMemberId: newRow.excused_by_id,
              excusedByMemberName: newRow.excused_by_name,
              awardedPoints: newRow.awarded_points,
              gradedBy: newRow.graded_by,
              gradedByName: newRow.graded_by_name,
              gradedAt: newRow.graded_at,
              feedback: newRow.feedback,
              createdAt: newRow.created_at
            };

            setTasks(prev => {
              const exists = prev.some(t => t.id === taskObj.id);
              if (exists) return prev.map(t => t.id === taskObj.id ? taskObj : t);
              return [taskObj, ...prev];
            });

            if (eventType === 'INSERT') {
              if (taskObj.createdByMemberId !== currentUserId) {
                const isAssignedToMe = taskObj.assignedToMemberIds.includes(currentUserId);
                if (isAssignedToMe) {
                  playSound('task');
                  showNotification('info', `📋 مهمة جديدة مسندة إليك: "${taskObj.title}"`);
                  sendSystemPushNotification({
                    title: '📋 تكليف بمهمة جديدة',
                    body: `تم تكليفك بمهمة "${taskObj.title}" (${taskObj.committeeName}) • +${taskObj.xpReward} XP`,
                    type: 'task',
                    data: { url: '/?tab=tasks', taskId: taskObj.id }
                  });
                } else if (taskObj.committeeId === currentUser.currentCommitteeId && (currentUser.role === 'head' || currentUser.role === 'vice_head')) {
                  playSound('task');
                  showNotification('info', `📋 تم إنشاء مهمة جديدة في لجنتك: "${taskObj.title}"`);
                  sendSystemPushNotification({
                    title: '📋 مهمة جديدة في لجنتك',
                    body: `تم إنشاء مهمة "${taskObj.title}" بواسطة ${taskObj.createdByMemberName}`,
                    type: 'task',
                    data: { url: '/?tab=tasks', taskId: taskObj.id }
                  });
                }
              }
            } else if (eventType === 'UPDATE') {
              // Check if member submitted task
              if (taskObj.submission && (taskObj.createdByMemberId === currentUserId || (taskObj.committeeId === currentUser.currentCommitteeId && (currentUser.role === 'head' || currentUser.role === 'vice_head')))) {
                playSound('task');
                showNotification('info', `📤 تم تسليم مخرجات المهمة: "${taskObj.title}" للمراجعة`);
                sendSystemPushNotification({
                  title: '📤 تسليم مخرجات مهمة',
                  body: `تم تسليم مخرجات المهمة "${taskObj.title}" للمراجعة والتقييم`,
                  type: 'task',
                  data: { url: '/?tab=tasks', taskId: taskObj.id }
                });
              }
              // Check if task approved/evaluated
              if (taskObj.status === 'Approved' && taskObj.assignedToMemberIds.includes(currentUserId)) {
                playSound('achievement');
                showNotification('success', `🎉 تم اعتماد وتقييم مهمتك: "${taskObj.title}" (+${taskObj.awardedPoints || taskObj.xpReward} XP)`);
                sendSystemPushNotification({
                  title: '🎉 اعتماد وتقييم المهمة بنجاح',
                  body: `تم اعتماد مهمتك "${taskObj.title}" وحصلت على ${taskObj.awardedPoints || taskObj.xpReward} XP!`,
                  type: 'achievement',
                  data: { url: '/?tab=tasks', taskId: taskObj.id }
                });
              }
            }
          } else if (eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== oldRow.id));
          }
        }

        if (table === 'events') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const eventObj: EventEntity = {
              id: newRow.id,
              name: newRow.name,
              date: newRow.date,
              startTime: newRow.start_time,
              endTime: newRow.end_time,
              location: newRow.location,
              description: newRow.description,
              eventManagerId: newRow.event_manager_id,
              eventManagerName: newRow.event_manager_name,
              committeeQuotas: newRow.committee_quotas || {},
              status: newRow.status,
              expectedMembersCount: newRow.expected_members_count || 0,
              actualAttendanceCount: newRow.actual_attendance_count || 0,
              tasksCount: newRow.tasks_count || 0,
              sosAlertsCount: newRow.sos_alerts_count || 0,
              seasonId: newRow.season_id,
              liveDashboardActive: newRow.live_dashboard_active || false,
              targetAudience: newRow.target_audience || 'all',
              selectedCommitteeIds: newRow.selected_committee_ids || [],
              rsvps: newRow.rsvps || {}
            };

            setEvents(prev => {
              const exists = prev.some(e => e.id === eventObj.id);
              if (exists) return prev.map(e => e.id === eventObj.id ? eventObj : e);
              return [eventObj, ...prev];
            });

            if (eventType === 'INSERT' && eventObj.eventManagerId !== currentUserId) {
              playSound('announcement');
              showNotification('info', `📅 فعالية جديدة: "${eventObj.name}" بتاريخ ${eventObj.date} في ${eventObj.location}`);
              sendSystemPushNotification({
                title: `📅 فعالية جديدة: ${eventObj.name}`,
                body: `بتاريخ ${eventObj.date} في ${eventObj.location} (${eventObj.startTime} - ${eventObj.endTime}) - يرجى تسجيل تأكيد الحضور (RSVP)`,
                type: 'event',
                data: { url: '/?tab=events', eventId: eventObj.id }
              });
            } else if (eventType === 'UPDATE') {
              if ((eventObj.status === 'Live' || eventObj.liveDashboardActive) && eventObj.eventManagerId !== currentUserId) {
                playSound('alert');
                showNotification('warning', `🔴 انطلاق غرفة العمليات الميدانية لفعالية: "${eventObj.name}"`);
                sendSystemPushNotification({
                  title: `🔴 انطلاق غرفة العمليات الميدانية`,
                  body: `بدأت الآن التغطية الحية لفعالية "${eventObj.name}" في ${eventObj.location}`,
                  type: 'sos',
                  data: { url: '/?tab=events', eventId: eventObj.id }
                });
              }
            }
          } else if (eventType === 'DELETE') {
            setEvents(prev => prev.filter(e => e.id !== oldRow.id));
          }
        }

        if (table === 'announcements') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const annObj: Announcement = {
              id: newRow.id,
              title: newRow.title,
              content: newRow.content,
              authorName: newRow.author_name,
              authorRole: newRow.author_role,
              targetType: newRow.target_type,
              targetCommitteeId: newRow.target_committee_id,
              targetCommitteeName: newRow.target_committee_name,
              isPinned: newRow.is_pinned,
              poll: newRow.poll,
              reactions: newRow.reactions || [],
              createdAt: newRow.created_at
            };
            setAnnouncements(prev => {
              const exists = prev.some(a => a.id === annObj.id);
              if (exists) return prev.map(a => a.id === annObj.id ? annObj : a);
              return [annObj, ...prev];
            });

            if (eventType === 'INSERT' && annObj.authorName !== currentUser.fullName) {
              const isTargetMe = annObj.targetType === 'all' || 
                                 annObj.targetType === 'members' ||
                                 (annObj.targetType === 'committee' && annObj.targetCommitteeId === currentUser.currentCommitteeId);
              if (isTargetMe) {
                playSound('announcement');
                if (annObj.poll) {
                  showNotification('info', `📊 استطلاع رأي وتصويت مطلوب: "${annObj.title}"`);
                  sendSystemPushNotification({
                    title: '📊 استطلاع رأي وتصويت جديد',
                    body: `${annObj.title} - شارك برأيك وصوتك الآن في المنظومة`,
                    type: 'announcement',
                    data: { url: '/?tab=announcements', annId: annObj.id }
                  });
                } else {
                  showNotification('info', `📢 إعلان وتعميم إداري جديد: "${annObj.title}"`);
                  sendSystemPushNotification({
                    title: '📢 تعميم إداري رسمي',
                    body: `${annObj.title} (من: ${annObj.authorName})`,
                    type: 'announcement',
                    data: { url: '/?tab=announcements', annId: annObj.id }
                  });
                }
              }
            }
          } else if (eventType === 'DELETE') {
            setAnnouncements(prev => prev.filter(a => a.id !== oldRow.id));
          }
        }

        if (table === 'system_notifications') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const notifObj: SystemNotification = {
              id: newRow.id,
              title: newRow.title,
              message: newRow.message,
              type: newRow.type,
              targetName: newRow.target_name,
              requiredAction: newRow.required_action,
              badgeText: newRow.badge_text,
              targetCommitteeId: newRow.target_committee_id,
              targetMemberIds: newRow.target_member_ids || [],
              senderName: newRow.sender_name,
              read: newRow.read,
              linkTab: newRow.link_tab,
              createdAt: newRow.created_at
            };
            setNotifications(prev => {
              if (prev.some(n => n.id === notifObj.id)) return prev.map(n => n.id === notifObj.id ? notifObj : n);
              return [notifObj, ...prev];
            });

            if (eventType === 'INSERT') {
              const isForMe = !notifObj.targetMemberIds || notifObj.targetMemberIds.length === 0 || notifObj.targetMemberIds.includes(currentUserId);
              const isForMyComm = !notifObj.targetCommitteeId || notifObj.targetCommitteeId === 'all' || notifObj.targetCommitteeId === currentUser.currentCommitteeId;
              
              if (isForMe && isForMyComm && notifObj.senderName !== currentUser.fullName) {
                if (notifObj.type === 'sos') {
                  playSound('alert');
                  showNotification('error', `🚨 ${notifObj.title}: ${notifObj.message}`);
                  sendSystemPushNotification({
                    title: `🚨 ${notifObj.title}`,
                    body: notifObj.message,
                    type: 'sos',
                    data: { url: notifObj.linkTab ? `/?tab=${notifObj.linkTab}` : '/' }
                  });
                } else {
                  playSound(notifObj.type || 'task');
                  sendSystemPushNotification({
                    title: notifObj.title,
                    body: notifObj.message,
                    type: notifObj.type || 'task',
                    data: { url: notifObj.linkTab ? `/?tab=${notifObj.linkTab}` : '/' }
                  });
                }
              }
            }
          } else if (eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== oldRow.id));
          }
        }

        if (table === 'live_voice_orders') {
          if (eventType === 'INSERT') {
            if (newRow && newRow.sender_name !== currentUser.fullName) {
              const targetComm = newRow.target_committee;
              if (!targetComm || targetComm === 'all' || targetComm === currentUser.currentCommitteeId) {
                playSound('alert');
                showNotification('warning', `🎙️ توجيه صوتي عاجل من القيادة: "${newRow.title}"`);
                sendSystemPushNotification({
                  title: '🎙️ توجيه صوتي عاجل من القيادة',
                  body: `${newRow.title} (صادر من: ${newRow.sender_name}) - انقر للاستماع الآن`,
                  type: 'voice',
                  data: { url: '/?tab=events', audioUrl: newRow.audio_url }
                });
              }
            }
          }
        }

        if (table === 'attendance_sessions') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const sessObj: AttendanceSession = {
              id: newRow.id,
              title: newRow.title,
              committeeId: newRow.committee_id,
              committeeName: newRow.committee_name,
              createdByMemberId: newRow.created_by_id,
              createdByMemberName: newRow.created_by_name,
              createdByRole: newRow.created_by_role,
              createdAt: newRow.created_at,
              requireGPS: newRow.require_gps,
              sessionType: newRow.session_type || 'members',
              eventId: newRow.event_id,
              eventName: newRow.event_name,
              eventDate: newRow.event_date,
              qrToken: newRow.qr_token,
              isActive: newRow.is_active,
              notes: newRow.notes
            };
            setAttendanceSessions(prev => {
              const exists = prev.some(s => s.id === sessObj.id);
              if (exists) return prev.map(s => s.id === sessObj.id ? sessObj : s);
              return [sessObj, ...prev];
            });

            if (eventType === 'INSERT' && sessObj.createdByMemberId !== currentUserId) {
              const isComm = sessObj.committeeId === 'all' || sessObj.committeeId === currentUser.currentCommitteeId;
              if (isComm) {
                playSound('task');
                showNotification('info', `📌 بدأت جلسة تسجيل حضور جديدة: "${sessObj.title}"`);
                sendSystemPushNotification({
                  title: '📌 بدء تسجيل الحضور والانصراف',
                  body: `تم فتح جلسة التحضير "${sessObj.title}" - يرجى تسجيل حضورك الآن بالباركود أو الموقع`,
                  type: 'task',
                  data: { url: '/?tab=attendance' }
                });
              }
            }
          } else if (eventType === 'DELETE') {
            setAttendanceSessions(prev => prev.filter(s => s.id !== oldRow.id));
          }
        }

        if (table === 'member_evaluations') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const evalObj: MemberEvaluationRecord = {
              id: newRow.id,
              memberId: newRow.member_id,
              memberName: newRow.member_name,
              memberVolunteerId: newRow.member_volunteer_id,
              committeeName: newRow.committee_name,
              evaluatorId: newRow.evaluator_id,
              evaluatorName: newRow.evaluator_name,
              evaluatorRole: newRow.evaluator_role,
              scores: newRow.scores || {},
              totalScore: newRow.total_score,
              maxTotalScore: newRow.max_total_score,
              percentage: newRow.percentage,
              feedback: newRow.feedback,
              evaluatedAt: newRow.evaluated_at
            };
            setMemberEvaluations(prev => {
              const exists = prev.some(e => e.id === evalObj.id);
              if (exists) return prev.map(e => e.id === evalObj.id ? evalObj : e);
              return [evalObj, ...prev];
            });

            if (evalObj.memberId === currentUserId && evalObj.evaluatorId !== currentUserId) {
              playSound('achievement');
              showNotification('success', `🌟 تم تسجيل تقييم أداء جديد لك بنسبة ${evalObj.percentage}%`);
              sendSystemPushNotification({
                title: '🌟 تقييم أداء جديد معتمد',
                body: `حصلت على نسبة ${evalObj.percentage}% في تقييم أدائك الأخير من ${evalObj.evaluatorName}`,
                type: 'achievement',
                data: { url: '/?tab=evaluations' }
              });
            }
          } else if (eventType === 'DELETE') {
            setMemberEvaluations(prev => prev.filter(e => e.id !== oldRow.id));
          }
        }

        if (table === 'head_evaluations') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const headEvalObj: HeadEvaluationRecord = {
              id: newRow.id,
              headId: newRow.head_id,
              headName: newRow.head_name,
              headVolunteerId: newRow.head_volunteer_id,
              headPosition: newRow.head_position,
              committeeName: newRow.committee_name,
              evaluatorId: newRow.evaluator_id,
              evaluatorName: newRow.evaluator_name,
              evaluatorRole: newRow.evaluator_role,
              scores: newRow.scores || {},
              totalScore: newRow.total_score,
              maxTotalScore: newRow.max_total_score,
              percentage: newRow.percentage,
              leadershipRating: newRow.leadership_rating,
              feedback: newRow.feedback,
              actionItems: newRow.action_items,
              evaluatedAt: newRow.evaluated_at
            };
            setHeadEvaluations(prev => {
              const exists = prev.some(e => e.id === headEvalObj.id);
              if (exists) return prev.map(e => e.id === headEvalObj.id ? headEvalObj : e);
              return [headEvalObj, ...prev];
            });
          } else if (eventType === 'DELETE') {
            setHeadEvaluations(prev => prev.filter(e => e.id !== oldRow.id));
          }
        }

        if (table === 'complaints') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const compObj: Complaint = {
              id: newRow.id,
              title: newRow.title,
              description: newRow.description,
              category: newRow.category,
              senderId: newRow.sender_id,
              senderName: newRow.sender_name,
              senderAvatar: newRow.sender_avatar,
              senderCommitteeId: newRow.sender_committee_id,
              senderCommitteeName: newRow.sender_committee_name,
              senderRole: newRow.sender_role,
              isAnonymous: newRow.is_anonymous,
              status: newRow.status,
              targetRecipients: newRow.target_recipients || [],
              responseNotes: newRow.response_notes,
              internalNotes: newRow.internal_notes,
              respondedBy: newRow.responded_by,
              respondedAt: newRow.responded_at,
              createdAt: newRow.created_at,
              resolvedAt: newRow.resolved_at,
              satisfactionRating: newRow.satisfaction_rating
            };
            setComplaints(prev => {
              const exists = prev.some(c => c.id === compObj.id);
              if (exists) return prev.map(c => c.id === compObj.id ? compObj : c);
              return [compObj, ...prev];
            });

            if (eventType === 'UPDATE' && compObj.senderId === currentUserId && compObj.respondedBy && compObj.respondedBy !== currentUser.fullName) {
              playSound('task');
              showNotification('info', `📬 تم الرد على طلبك/شكواك: "${compObj.title}"`);
              sendSystemPushNotification({
                title: '📬 تحديث بخصوص طلبك / شكواك',
                body: `تم الرد على: "${compObj.title}" بواسطة ${compObj.respondedBy} (${compObj.status})`,
                type: 'complaint',
                data: { url: '/?tab=complaints' }
              });
            }
          } else if (eventType === 'DELETE') {
            setComplaints(prev => prev.filter(c => c.id !== oldRow.id));
          }
        }

        if (table === 'members') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const memObj: Member = {
              id: newRow.id,
              volunteerId: newRow.volunteer_id,
              fullName: newRow.full_name,
              universityEmail: newRow.email,
              college: newRow.college,
              academicYear: newRow.academic_year,
              phone: newRow.phone || newRow.whatsapp_number || '',
              whatsappNumber: newRow.whatsapp_number || newRow.phone || '',
              birthDate: newRow.birth_date,
              age: newRow.age,
              nationalId: newRow.national_id,
              currentCommitteeId: newRow.current_committee_id,
              currentCommitteeName: newRow.current_committee_name,
              preferredCommitteeId: newRow.preferred_committee_id,
              preferredCommitteeName: newRow.preferred_committee_name,
              position: newRow.position,
              role: newRow.role,
              joinDate: newRow.join_date,
              status: newRow.status,
              avatarUrl: newRow.avatar_url,
              password: newRow.password,
              performance: newRow.performance || {
                overallScore: 90, attendanceRate: 100, taskCompletionRate: 90,
                taskQuality: 4.5, commitment: 90, teamwork: 90, leadership: 85, evaluationsCount: 0
              },
              skills: newRow.skills || {},
              activeWorkload: newRow.active_workload || 0,
              workloadStatus: newRow.workload_status || 'Optimal',
              engagementRisk: newRow.engagement_risk || 'Low',
              points: newRow.points || 0,
              level: newRow.level || 1,
              badges: newRow.badges || [],
              committeeHistory: newRow.committee_history || [],
              availability: newRow.availability || 'Available',
              bio: newRow.bio || '',
              hobbies: newRow.hobbies || [],
              learningAspirations: newRow.learning_aspirations || [],
              certifiedSkills: newRow.certified_skills || [],
              bloodType: newRow.blood_type || 'O+',
              emergencyContact: newRow.emergency_contact || '',
              address: newRow.address || '',
              banReason: newRow.ban_reason,
              bannedAt: newRow.banned_at,
              bannedBy: newRow.banned_by,
              rejectionReason: newRow.rejection_reason,
              registrationDate: newRow.registration_date,
              facebookUrl: newRow.facebook_url,
              tiktokUrl: newRow.tiktok_url,
              instagramUrl: newRow.instagram_url,
              linkedinUrl: newRow.linkedin_url
            };
            setMembers(prev => {
              const exists = prev.some(m => m.id === memObj.id);
              if (exists) return prev.map(m => m.id === memObj.id ? memObj : m);
              return [...prev, memObj];
            });
          } else if (eventType === 'DELETE') {
            setMembers(prev => prev.filter(m => m.id !== oldRow.id));
          }
        }

        if (table === 'attendance_records') {
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const recObj: AttendanceRecord = {
              id: newRow.id,
              memberId: newRow.member_id,
              memberName: newRow.member_name,
              memberAvatar: newRow.member_avatar,
              memberVolunteerId: newRow.member_volunteer_id,
              committeeId: newRow.committee_id,
              committeeName: newRow.committee_name,
              eventId: newRow.event_id,
              eventName: newRow.event_name,
              sessionId: newRow.session_id,
              sessionTitle: newRow.session_title,
              date: newRow.date,
              checkInTime: newRow.check_in_time,
              checkOutTime: newRow.check_out_time,
              durationMinutes: newRow.duration_minutes,
              durationFormatted: newRow.duration_formatted,
              status: newRow.status,
              qrHashToken: newRow.qr_hash_token,
              gpsLocation: newRow.gps_location,
              dailyEvaluation: newRow.daily_evaluation
            };
            setAttendanceRecords(prev => {
              const exists = prev.some(a => a.id === recObj.id);
              if (exists) return prev.map(a => a.id === recObj.id ? recObj : a);
              return [recObj, ...prev];
            });
          } else if (eventType === 'DELETE') {
            setAttendanceRecords(prev => prev.filter(a => a.id !== oldRow.id));
          }
        }

        if (table === 'audit_logs') {
          if (eventType === 'INSERT') {
            const logObj: AuditLogItem = {
              id: newRow.id,
              userId: newRow.user_id,
              userName: newRow.user_name,
              userRole: newRow.user_role,
              action: newRow.action,
              targetEntity: newRow.target_entity,
              details: newRow.details,
              previousValue: newRow.previous_value,
              newValue: newRow.new_value,
              timestamp: newRow.timestamp
            };
            setAuditLogs(prev => {
              if (prev.some(l => l.id === logObj.id)) return prev;
              return [logObj, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn('Realtime event parse warning:', err);
      }
    });

    // 2. Polling Heartbeat every 20s
    const interval = setInterval(() => {
      syncWithCloud();
    }, 20000);

    // 3. Focus-based Sync
    const handleFocus = () => {
      syncWithCloud();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [currentUserId]);

  // Security Watchdog: Automatically terminate session and block access if active user is banned or inactive
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      const activeMember = members.find(m => m.id === currentUserId);
      const isBanned = isUserBanned(activeMember?.universityEmail || '') || 
                       (activeMember?.nationalId ? isUserBanned(activeMember.nationalId) : false) ||
                       bannedList.some(b => b.id === currentUserId || (activeMember && b.email.toLowerCase() === activeMember.universityEmail.toLowerCase()));

      if (!activeMember || activeMember.status === 'Banned' || activeMember.status === 'Inactive' || isBanned) {
        setIsAuthenticated(false);
        setCurrentUserId('');
        localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
        localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
      }
    }
  }, [members, bannedList, isAuthenticated, currentUserId]);

  // Derived state: currentUser reflects current logged-in user or first available active member
  const currentUser = members.find(m => m.id === currentUserId) || members[0] || initialMembers[0];
  const activeSeason = seasons.find(s => s.id === activeSeasonId) || seasons[0] || initialSeasons[0];
  const isHighLeadership = isHighLeadershipMember(currentUser);

  const liveEvent = events.find(e => e.liveDashboardActive);

  // Dynamic Mathematical Health Score Computation (100% Real & Multi-factor, No Mock Fallbacks)
  const calculateCommitteeHealth = (commId: string): number => {
    const comm = committees.find(c => c.id === commId);
    if (!comm) return 0;

    const commMembers = members.filter(m => m.currentCommitteeId === commId && m.status === 'Active');
    const commMemberIds = new Set(commMembers.map(m => m.id));
    const commTasks = tasks.filter(t => t.committeeId === commId || t.assignedToMemberIds.some(id => commMemberIds.has(id)));

    const totalCommTasks = commTasks.length;
    const completedCommTasks = commTasks.filter(t => t.status === 'Approved').length;

    // 1. Real Attendance Rate: from actual attendanceRecords only
    const commRecords = attendanceRecords.filter(a => commMemberIds.has(a.memberId));
    const presentRecords = commRecords.filter(a => a.status === 'Present').length;
    const hasAttendance = commRecords.length > 0;
    const attendance = hasAttendance ? Math.round((presentRecords / commRecords.length) * 100) : 0;

    // 2. Task Completion Rate: from actual tasks
    const hasTasks = totalCommTasks > 0;
    const tasksRate = hasTasks ? Math.round((completedCommTasks / totalCommTasks) * 100) : 0;

    // 3. Evaluations & Quality Score from actual memberEvaluations only
    const commEvals = memberEvaluations.filter(e => commMemberIds.has(e.memberId));
    const hasEvals = commEvals.length > 0;
    const performance = hasEvals
      ? Math.round(commEvals.reduce((acc, e) => acc + e.percentage, 0) / commEvals.length)
      : 0;

    // If no active real operations / records exist yet, return 0 (بانتظار بدء الأنشطة)
    if (!hasAttendance && !hasTasks && !hasEvals) {
      return 0;
    }

    let weightedSum = 0;
    let totalWeight = 0;

    if (hasAttendance) {
      weightedSum += attendance * 0.35;
      totalWeight += 0.35;
    }
    if (hasTasks) {
      weightedSum += tasksRate * 0.35;
      totalWeight += 0.35;
    }
    if (hasEvals) {
      weightedSum += performance * 0.30;
      totalWeight += 0.30;
    }

    if (totalWeight === 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(weightedSum / totalWeight)));
  };

  // Team Health Score: Real dynamic average of operational committees with SOS emergency penalty
  const teamHealthScore = (() => {
    const operationalComms = committees.filter(c => c.id !== 'comm-leadership');
    if (operationalComms.length === 0) return 0;

    const commScores = operationalComms.map(c => calculateCommitteeHealth(c.id));
    const activeScores = commScores.filter(s => s > 0);

    // If no operational committees have real activity/scores yet, strictly return 0
    if (activeScores.length === 0) return 0;

    const baseScore = Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length);

    const openSOSCount = sosAlerts.filter(s => s.status === 'Open').length;
    const sosPenalty = openSOSCount * 4;

    return Math.min(100, Math.max(0, baseScore - sosPenalty));
  })();

  const activeAttendanceSession = attendanceSessions.find(s => s.isActive) || null;
  const canCreateAttendanceSession = isHighLeadership || ['head', 'vice_head', 'hr_admin', 'event_manager'].includes(currentUser.role);

  // Play Tone helper
  const playSound = (soundIdOrType?: 'task' | 'alert' | 'announcement' | 'normal' | 'success' | string) => {
    if (!soundSettings.enabled) return;

    let cat: 'task' | 'alert' | 'announcement' | 'normal' = 'normal';
    if (soundIdOrType === 'task') cat = 'task';
    else if (soundIdOrType === 'alert') cat = 'alert';
    else if (soundIdOrType === 'announcement') cat = 'announcement';

    playAppTone(cat, soundSettings);
  };

  // Request push notification permission
  const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    const perm = await reqPushPerm();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      showNotification('success', 'تم تفعيل إشعارات الهاتف بنجاح! ستصلك التنبيهات الميدانية والمهام لحظياً 🔔');
      if (currentUserId) {
        SupabaseService.savePushSubscription(currentUserId, {
          status: 'granted',
          timestamp: new Date().toISOString()
        }).catch(err => console.warn('Sync push sub error:', err));
      }
    }
    return perm;
  };

  // Test Push Notification helper
  const testPushNotification = async (): Promise<boolean> => {
    playSound('achievement');
    return await sendSystemPushNotification({
      title: '🔔 اختبار وصول الإشعارات الفورية بنجاح',
      body: 'منظومة متطوعين جامعة الإسكندرية متصلة بجهازك وتستقبل الإشعارات لحظياً خارج التطبيق! 🚀',
      type: 'achievement',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `test-push-${Date.now()}`,
      data: { url: '/' }
    });
  };

  // Dispatch System Push Notification (Mobile Lockscreen / Background & Foreground)
  const dispatchPushNotification = async (title: string, message: string, type: SystemNotification['type'] = 'announcement'): Promise<boolean> => {
    // 1. Audio tone
    if (type === 'sos' || type === 'eval' || type === 'complaint') {
      playSound('alert');
    } else if (type === 'task' || type === 'achievement') {
      playSound('task');
    } else {
      playSound('announcement');
    }

    // 2. Hardware Vibration
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'sos') navigator.vibrate([300, 100, 300, 100, 500]);
        else navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // ignore
    }

    // 3. System Push Notification
    return await sendSystemPushNotification({
      title,
      body: message,
      type,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `push-${Date.now()}`
    });
  };

  // Toast / High-priority system notification helper
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notifType: SystemNotification['type'] = type === 'error' ? 'sos' : type === 'success' ? 'achievement' : 'task';
    const newNotif: SystemNotification = {
      id: `toast-${Date.now()}`,
      title: type === 'success' ? 'نجاح العملية ✓' : type === 'error' ? 'تنبيه خطأ ⚠️' : 'إشعار من النظام 🔔',
      message,
      type: notifType,
      read: false,
      createdAt: 'الآن'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Audio Chime & Vibration
    if (type === 'error' || type === 'warning') {
      playSound('alert');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 50, 150]);
      }
    } else {
      playSound('task');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(80);
      }
    }

    // Native Browser / Mobile PWA ServiceWorker Push Notification
    sendSystemPushNotification({
      title: newNotif.title,
      body: message,
      type: notifType,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: newNotif.id
    });
  };

  // Audit Log
  const addAuditLog = (action: string, targetEntity: string, details: string, previousValue?: string, newValue?: string) => {
    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      targetEntity,
      details,
      previousValue,
      newValue,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [logItem, ...prev]);
    SupabaseService.insertAuditLog(logItem).catch(e => console.warn('Supabase audit log insert error:', e));
  };

  // Gamification Celebration
  const triggerGamificationCelebration = (badgeTitle: string, points: number) => {
    setCelebrationData({ active: true, badgeTitle, points });
    playSound('success');
    setTimeout(() => {
      setCelebrationData(null);
    }, 4500);
  };

  // Permission Verification
  const hasPermission = (permCode: string): boolean => {
    // President, Vice President, and Advisor always have 100% full permissions
    if (isHighLeadership) return true;

    const rolePerms = rolePermissions[currentUser.role];
    if (rolePerms && rolePerms[permCode] !== undefined) {
      return rolePerms[permCode];
    }
    return false;
  };

  const updateRolePermissions = (role: Role, perms: { [permCode: string]: boolean }) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], ...perms }
    }));
    addAuditLog('تحديث مصفوفة الصلاحيات', `الدور: ${role}`, 'تم تحديث أذونات الدور في النظام');
  };

  // Branding & Settings
  const updateLogo = (logoUrl: string) => {
    setBranding(prev => ({ ...prev, logoUrl }));
    addAuditLog('تحديث شعار المنصة', 'Branding Logo', 'تم تحديث لوجو الفريق والاتحاد');
  };

  const updateStamp = (stampUrl: string) => {
    setBranding(prev => ({ ...prev, stampUrl }));
    addAuditLog('تحديث ختم الاتحاد الرسمي', 'Branding Stamp', 'تم تحديث صورة ختم اتحاد طلاب جامعة الإسكندرية');
    showNotification('success', 'تم تحديث الختم الرسمي للاتحاد بنجاح');
  };

  const updateBranding = (updates: Partial<AppBrandingSettings>) => {
    setBranding(prev => ({ ...prev, ...updates }));
    addAuditLog('تحديث إعدادات الهوية والتصميم', 'Branding', 'تم تعديل إعدادات المظهر والخط');
  };

  const setFontSizeMode = (mode: 'compact' | 'normal' | 'large') => {
    setBranding(prev => ({ ...prev, fontSizeMode: mode }));
  };

  const updateTickerMessages = (messages: string[]) => {
    setBranding(prev => ({ ...prev, tickerMessages: messages }));
    addAuditLog('تحديث الشريط الإخباري', 'Ticker', `عدد الرسائل: ${messages.length}`);
  };

  const updateSoundSettings = (updates: Partial<AppSoundSettings>) => {
    setSoundSettings(prev => ({ ...prev, ...updates }));
    addAuditLog('تحديث إعدادات النغمات والأصوات', 'Sound Settings', 'تم حفظ التفضيلات الصوتية');
  };

  // Complaints
  const createComplaint = (complaintData: Partial<Complaint>) => {
    const rawCategory = complaintData.category as ComplaintCategory;
    const validCategory: ComplaintCategory = 
      ['administrative', 'workload', 'interpersonal', 'suggestion', 'evaluation', 'confidential'].includes(rawCategory) 
        ? rawCategory 
        : 'administrative';

    const newComp: Complaint = {
      id: `comp-${Date.now()}`,
      title: complaintData.title || 'شكوى / مقترح جديد',
      description: complaintData.description || (complaintData as any).content || '',
      category: validCategory,
      urgency: complaintData.urgency || 'Medium',
      senderId: complaintData.isAnonymous ? 'anonymous' : currentUser.id,
      senderName: complaintData.isAnonymous ? 'عضو (هوية مجهولة)' : currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderCommitteeId: currentUser.currentCommitteeId,
      senderCommitteeName: currentUser.currentCommitteeName,
      senderRole: currentUser.role,
      isAnonymous: Boolean(complaintData.isAnonymous),
      status: 'New',
      targetRecipients: ['head', 'hr', 'super_admin'],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setComplaints(prev => [newComp, ...prev]);
    SupabaseService.upsertComplaint(newComp).catch(e => console.warn('Supabase createComplaint error:', e));

    const notif: SystemNotification = {
      id: `notif-comp-${Date.now()}`,
      title: `📨 شكوى / مقترح جديد [${newComp.urgency === 'Emergency' ? 'طوارئ عاجلة' : newComp.urgency === 'High' ? 'عالية الأهمية' : 'عادية'}]: ${newComp.title}`,
      message: `تم رفع شكوى جديدة وتوجيهها للقيادة العليا ورئيس اللجنة المعنية.`,
      type: 'complaint',
      read: false,
      createdAt: 'الآن',
      linkTab: 'complaints'
    };
    setNotifications(prev => [notif, ...prev]);
    SupabaseService.upsertNotification(notif).catch(e => console.warn('Supabase notif error:', e));

    playSound('alert');
    addAuditLog('رفع شكوى / مقترح جديد', newComp.title, `التصنيف: ${newComp.category} - الأهمية: ${newComp.urgency}`);
  };

  const updateComplaintStatus = (complaintId: string, newStatus: ComplaintStatus, notes?: string, internalNotes?: string) => {
    let updatedComplaint: Complaint | null = null;
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        updatedComplaint = {
          ...c,
          status: newStatus,
          responseNotes: notes || c.responseNotes,
          internalNotes: internalNotes || c.internalNotes,
          respondedBy: currentUser.fullName,
          respondedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          resolvedAt: newStatus === 'Resolved' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.resolvedAt
        };
        return updatedComplaint;
      }
      return c;
    }));

    if (updatedComplaint) {
      SupabaseService.upsertComplaint(updatedComplaint).catch(e => console.warn('Supabase updateComplaint error:', e));
      const targetComp = updatedComplaint as Complaint;
      if (targetComp.senderId && targetComp.senderId !== 'anonymous' && targetComp.senderId !== currentUser.id) {
        const notif: SystemNotification = {
          id: `notif-comp-upd-${Date.now()}`,
          title: `📬 تحديث بخصوص شكواك: ${targetComp.title}`,
          message: `تم تغيير حالة الشكوى إلى: [${newStatus === 'Resolved' ? 'تم الحل والاعتماد' : newStatus === 'Under Review' ? 'قيد المراجعة والتحقيق' : newStatus}] بواسطة ${currentUser.fullName}`,
          type: 'complaint',
          targetMemberIds: [targetComp.senderId],
          read: false,
          createdAt: 'الآن',
          linkTab: 'complaints'
        };
        setNotifications(prev => [notif, ...prev]);
        SupabaseService.upsertNotification(notif).catch(e => console.warn(e));
      }
    }

    addAuditLog('تحديث حالة شكوى', `ID: ${complaintId}`, `تم تغيير الحالة إلى [${newStatus}] بواسطة ${currentUser.fullName}`);
    playSound('task');
  };

  const rateComplaintResolution = (complaintId: string, rating: number) => {
    let updatedComplaint: Complaint | null = null;
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        updatedComplaint = {
          ...c,
          satisfactionRating: rating
        };
        return updatedComplaint;
      }
      return c;
    }));

    if (updatedComplaint) {
      SupabaseService.upsertComplaint(updatedComplaint).catch(e => console.warn('Supabase rate complaint error:', e));
    }

    showNotification('success', 'شكراً لك على تقييم تجربة حل الشكوى!');
    playSound('success');
  };

  const getVisibleComplaintsForUser = (): Complaint[] => {
    if (isHighLeadership || currentUser.role === 'hr_admin' || currentUser.currentCommitteeId === 'comm-hr') {
      return complaints;
    }
    if (currentUser.role === 'head' || currentUser.role === 'vice_head') {
      return complaints.filter(c => c.senderCommitteeId === currentUser.currentCommitteeId || c.senderId === currentUser.id);
    }
    return complaints.filter(c => c.senderId === currentUser.id);
  };

  // Add Member
  const addMember = (memberData: Partial<Member>) => {
    const newId = `user-mem-${Date.now()}`;
    const commId = memberData.currentCommitteeId || 'comm-org';
    const memberRole = memberData.role || 'member';
    const volunteerId = memberData.volunteerId || generateCommitteeVolunteerId(commId, memberRole, members);

    const birthData = getMemberExactBirthData({
      nationalId: memberData.nationalId,
      birthDate: memberData.birthDate,
      age: memberData.age
    });

    const newMember: Member = {
      id: newId,
      volunteerId,
      fullName: memberData.fullName || 'متطوع جديد',
      universityEmail: memberData.universityEmail || `vol.${Date.now()}@alexu.edu.eg`,
      college: memberData.college || 'جامعة الإسكندرية',
      academicYear: memberData.academicYear || 'الفرقة الأولى',
      whatsappNumber: memberData.whatsappNumber || '+201000000000',
      birthDate: birthData.birthDate,
      age: birthData.currentAge,
      nationalId: memberData.nationalId || '30501010200000',
      currentCommitteeId: commId,
      currentCommitteeName: memberData.currentCommitteeName || 'لجنة التنظيم',
      position: memberData.position || 'عضو متطوع',
      role: memberRole,
      joinDate: new Date().toISOString().split('T')[0],
      seasonId: activeSeasonId,
      status: 'Active',
      avatarUrl: memberData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      performance: {
        overallScore: 0,
        attendanceRate: 100,
        taskCompletionRate: 0,
        taskQuality: 0,
        commitment: 100,
        teamwork: 0,
        leadership: 0,
        evaluationsCount: 0
      },
      skills: memberData.skills || { 'العمل الجماعي': 4, 'التواصل': 4 },
      hobbies: memberData.hobbies || ['القراءة', 'التطوع'],
      learningAspirations: memberData.learningAspirations || ['إدارة الفرق'],
      activeWorkload: 0,
      workloadStatus: 'Underutilized',
      engagementRisk: 'Low',
      points: 0,
      level: 1,
      badges: [],
      committeeHistory: [
        {
          id: `hist-${Date.now()}`,
          committeeName: memberData.currentCommitteeName || 'لجنة التنظيم',
          role: 'عضو جديد',
          season: activeSeason.name,
          startDate: new Date().toISOString().split('T')[0],
          endDate: 'مستمر',
          reason: 'انضمام كعضو متطوع',
          changedBy: currentUser.fullName
        }
      ],
      availability: 'Available',
      bio: memberData.bio || 'عضو جديد بفريق متطوعي اتحاد طلاب جامعة الإسكندرية.'
    };

    setMembers(prev => [newMember, ...prev]);
    SupabaseService.upsertMember(newMember).catch(e => console.warn('Supabase addMember error:', e));

    setCommittees(prev => prev.map(c => {
      if (c.id === newMember.currentCommitteeId) {
        const updatedC = { ...c, memberCount: c.memberCount + 1 };
        SupabaseService.upsertCommittee(updatedC).catch(err => console.warn(err));
        return updatedC;
      }
      return c;
    }));

    addAuditLog('إضافة متطوع جديد', `العضو: ${newMember.fullName} (${newMember.volunteerId})`, `تمت إضافة المتطوع وإسناده إلى ${newMember.currentCommitteeName}`);
  };

  // Bulk Import Members
  const importMembersBulk = (newMembers: Partial<Member>[]) => {
    if (newMembers.length === 0) return;

    const fullMembers: Member[] = newMembers.map((m, idx) => {
      const commId = m.currentCommitteeId || 'comm-org';
      const role = m.role || 'member';
      const volId = m.volunteerId || generateCommitteeVolunteerId(commId, role, members);
      const rawNatId = m.nationalId || (m as any).national_id || '30400000000000';
      const rawBirthDate = m.birthDate || (m as any).birth_date;

      const birthData = getMemberExactBirthData({
        nationalId: rawNatId,
        birthDate: rawBirthDate,
        age: m.age
      });

      return {
        id: m.id || `user-imp-${Date.now()}-${idx}`,
        volunteerId: volId,
        fullName: m.fullName || (m as any).name || 'متطوع جديد',
        universityEmail: m.universityEmail || (m as any).email || `vol.${Date.now() + idx}@alexu.edu.eg`,
        college: m.college || (m as any).faculty || 'جامعة الإسكندرية',
        academicYear: m.academicYear || 'الفرقة الثالثة',
        whatsappNumber: m.whatsappNumber || (m as any).phone || '+201000000000',
        birthDate: birthData.birthDate,
        age: birthData.currentAge,
        nationalId: rawNatId,
        currentCommitteeId: commId,
        currentCommitteeName: m.currentCommitteeName || 'لجنة التنظيم',
        position: m.position || 'عضو متطوع',
        role,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        avatarUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        performance: {
          overallScore: 0,
          attendanceRate: 100,
          taskCompletionRate: 0,
          taskQuality: 0,
          commitment: 100,
          teamwork: 0,
          leadership: 0,
          evaluationsCount: 0
        },
        skills: { 'التنظيم': 4, 'العمل الجماعي': 4 },
        hobbies: ['العمل الجماعي'],
        learningAspirations: ['إدارة الفعاليات'],
        activeWorkload: 0,
        workloadStatus: 'Underutilized',
        engagementRisk: 'Low',
        points: 0,
        level: 1,
        badges: [],
        committeeHistory: [],
        availability: 'Available',
        bio: 'عضو بفريق متطوعي اتحاد طلاب جامعة الإسكندرية'
      };
    });

    setMembers(prev => [...fullMembers, ...prev]);

    // Save all to Supabase
    fullMembers.forEach(m => {
      SupabaseService.upsertMember(m).catch(e => console.warn('Supabase bulk save error:', e));
    });

    // Update committee member counts
    setCommittees(prev => prev.map(c => {
      const addedCount = fullMembers.filter(m => m.currentCommitteeId === c.id).length;
      const updatedComm = { ...c, memberCount: c.memberCount + addedCount };
      if (addedCount > 0) {
        SupabaseService.upsertCommittee(updatedComm).catch(e => console.warn(e));
      }
      return updatedComm;
    }));

    addAuditLog('استيراد أعضاء جماعي (Excel)', `عدد: ${fullMembers.length}`, `تمت إضافة الأعضاء وتوليد الأكواد التطوعية`);
    playSound('announcement');
    triggerGamificationCelebration(`📥 تم استيراد ${fullMembers.length} عضو بنجاح!`, 100);
  };

  // Comprehensive Database-Level Member Update
  const updateMember = (id: string, updates: Partial<Member>) => {
    let savedMember: Member | null = null;
    let oldCommId = '';
    let newCommId = '';

    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      oldCommId = m.currentCommitteeId;
      newCommId = updates.currentCommitteeId !== undefined ? updates.currentCommitteeId : m.currentCommitteeId;

      const combined = { ...m, ...updates };

      if (updates.nationalId !== undefined || updates.birthDate !== undefined || updates.age !== undefined) {
        const bData = getMemberExactBirthData({
          nationalId: combined.nationalId,
          birthDate: combined.birthDate,
          age: combined.age
        });
        combined.birthDate = bData.birthDate;
        combined.age = bData.currentAge;
      }

      // If moved to leadership or high leadership role, keep 0 XP
      const isLead = isHighLeadershipRole(combined.role) || combined.currentCommitteeId === 'comm-leadership';
      if (isLead) {
        combined.points = 0;
        combined.level = 1;
      }

      savedMember = combined;
      return combined;
    }));

    // Update committee counts and leaders if committee or role changed
    if (oldCommId && newCommId && oldCommId !== newCommId) {
      setCommittees(prev => prev.map(c => {
        if (c.id === oldCommId) {
          const nextCount = Math.max(0, c.memberCount - 1);
          return {
            ...c,
            memberCount: nextCount,
            headId: c.headId === id ? '' : c.headId,
            headName: c.headId === id ? 'لم يحدد' : c.headName,
            viceId: c.viceId === id ? '' : c.viceId,
            viceName: c.viceId === id ? 'لم يحدد' : c.viceName
          };
        }
        if (c.id === newCommId) {
          return {
            ...c,
            memberCount: c.memberCount + 1,
            headId: updates.role === 'head' ? id : c.headId,
            headName: updates.role === 'head' && savedMember ? (savedMember as Member).fullName : c.headName,
            viceId: updates.role === 'vice_head' ? id : c.viceId,
            viceName: updates.role === 'vice_head' && savedMember ? (savedMember as Member).fullName : c.viceName
          };
        }
        return c;
      }));
    }

    addAuditLog('تعديل وحفظ بيانات العضو في قاعدة البيانات', savedMember ? (savedMember as Member).fullName : `ID: ${id}`, `تم حفظ التعديلات بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم حفظ وتحديث بيانات ${savedMember ? (savedMember as Member).fullName : 'العضو'} بنجاح ✓`);
    playSound('task');

    if (savedMember) {
      SupabaseService.upsertMember(savedMember).catch(e => console.warn('Supabase updateMember error:', e));
    }
  };

  // Check if a volunteer ID is available or held by another member
  const isVolunteerIdAvailable = (volunteerId: string, excludeMemberId?: string): { isAvailable: boolean; heldByMember?: Member } => {
    const cleanId = volunteerId.trim().toUpperCase();
    if (!cleanId) return { isAvailable: false };
    const found = members.find(m => m.id !== excludeMemberId && (m.volunteerId || '').trim().toUpperCase() === cleanId);
    if (found) {
      return { isAvailable: false, heldByMember: found };
    }
    return { isAvailable: true };
  };

  // Change or Swap Volunteer ID with complete Platform-wide and Database propagation
  const changeVolunteerId = (
    memberId: string, 
    newVolunteerId: string, 
    allowSwap: boolean = false
  ): { success: boolean; message: string; swappedWithMemberId?: string; existingMember?: Member } => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) {
      return { success: false, message: 'العضو غير موجود بالمنظومة' };
    }

    const cleanNewId = newVolunteerId.trim().toUpperCase();
    if (!cleanNewId) {
      return { success: false, message: 'يرجى إدخال رقم تطوعي صحيح وغير فارغ' };
    }

    const oldVolunteerId = (targetMember.volunteerId || '').trim().toUpperCase();
    if (oldVolunteerId === cleanNewId) {
      return { success: true, message: 'الرقم التطوعي هو نفسه بالفعل دون تغيير' };
    }

    const holder = members.find(m => m.id !== memberId && (m.volunteerId || '').trim().toUpperCase() === cleanNewId);

    if (holder && !allowSwap) {
      return { 
        success: false, 
        message: `الرقم التطوعي (${cleanNewId}) مسجل ومستخدم حالياً بواسطة "${holder.fullName}" (${holder.currentCommitteeName || 'لجنة غير محددة'}).`,
        existingMember: holder
      };
    }

    // If holder exists and allowSwap is true -> Swap the IDs
    if (holder && allowSwap) {
      const holderNewId = oldVolunteerId || generateCommitteeVolunteerId(holder.currentCommitteeId, holder.role, members);
      
      const updatedTargetMember: Member = { ...targetMember, volunteerId: cleanNewId };
      const updatedHolderMember: Member = { ...holder, volunteerId: holderNewId };

      setMembers(prev => prev.map(m => {
        if (m.id === targetMember.id) return updatedTargetMember;
        if (m.id === holder.id) return updatedHolderMember;
        return m;
      }));

      // Update Attendance records if needed
      setAttendanceRecords(prev => prev.map(a => {
        if (a.memberId === targetMember.id) return { ...a, memberName: targetMember.fullName };
        if (a.memberId === holder.id) return { ...a, memberName: holder.fullName };
        return a;
      }));

      // Audit Log
      addAuditLog(
        'تبديل ونقل رقم تطوعي',
        `${targetMember.fullName} ⇄ ${holder.fullName}`,
        `تم منح الرقم (${cleanNewId}) لـ ${targetMember.fullName} ونقل الرقم (${holderNewId}) لـ ${holder.fullName} بواسطة ${currentUser.fullName}`
      );

      // Cloud Sync
      SupabaseService.upsertMember(updatedTargetMember).catch(e => console.warn('Supabase target update error:', e));
      SupabaseService.upsertMember(updatedHolderMember).catch(e => console.warn('Supabase holder update error:', e));

      showNotification('success', `تم تبديل ونقل الرقم التطوعي (${cleanNewId}) لـ ${targetMember.fullName} وتعيين (${holderNewId}) لـ ${holder.fullName} بنجاح ✓`);
      playSound('task');

      return {
        success: true,
        message: `تم تبديل ونقل الرقم التطوعي بنجاح بين ${targetMember.fullName} و ${holder.fullName}`,
        swappedWithMemberId: holder.id,
        existingMember: holder
      };
    }

    // No holder: direct assignment
    const updatedMember: Member = { ...targetMember, volunteerId: cleanNewId };
    setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));

    addAuditLog(
      'تعديل رقم تطوعي',
      `${targetMember.fullName} (كود: ${cleanNewId})`,
      `تم تغيير الرقم التطوعي من ${oldVolunteerId || 'بدون'} إلى ${cleanNewId} بواسطة ${currentUser.fullName}`
    );

    SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase save error:', e));

    showNotification('success', `تم تعيين وتحديث الرقم التطوعي لـ ${targetMember.fullName} إلى (${cleanNewId}) بنجاح ✓`);
    playSound('task');

    return {
      success: true,
      message: `تم تحديث الرقم التطوعي إلى (${cleanNewId}) بنجاح ✓`
    };
  };

  // Ban Member & Blacklist (Permanent Access Revocation)
  const banMember = (id: string, reason: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    const banReason = reason.trim() || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي';
    const bannedAt = new Date().toISOString();
    const bannedBy = currentUser?.fullName || 'القيادة العليا';

    const updatedMember: Member = {
      ...target,
      status: 'Banned',
      banReason,
      bannedAt,
      bannedBy
    };

    setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));

    const bannedRecord: BannedUserRecord = {
      id: target.id,
      email: target.universityEmail,
      fullName: target.fullName,
      nationalId: target.nationalId,
      reason: banReason,
      bannedAt,
      bannedBy
    };

    setBannedList(prev => {
      const filtered = prev.filter(b => b.email.toLowerCase() !== target.universityEmail.toLowerCase() && b.id !== target.id);
      return [bannedRecord, ...filtered];
    });

    if (currentUserId === id) {
      setIsAuthenticated(false);
      setCurrentUserId('');
      localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
      localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    }

    addAuditLog('حظر واستبعاد عضو نهائياً', `${target.fullName} (${target.universityEmail})`, `تم تطبيق الحظر الدائم والإدراج في القائمة السوداء وسحب الصلاحيات. السبب: ${banReason}`);
    playSound('alert');
    showNotification('warning', `تم حظر واستبعاد العضو ${target.fullName} وإدراجه بالقائمة السوداء.`);
    SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase ban error:', e));
    SupabaseService.upsertBannedUser(bannedRecord).catch(e => console.warn('Supabase banned_users save error:', e));
  };

  // Filter Out / Dismiss Member from Team with Immediate Access Block
  const filterOutMember = (id: string, reason: string = 'تصفية واستبعاد من الفريق مع إيقاف الحساب ومنع الدخول') => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    const banReason = reason.trim() || 'تمت تصفية واستبعاد العضو من الفريق مع حظر الدخول للمنصة بقرار القيادة العليا';
    const bannedAt = new Date().toISOString();
    const bannedBy = currentUser?.fullName || 'القيادة العليا';

    const updatedMember: Member = {
      ...target,
      status: 'Banned',
      banReason,
      bannedAt,
      bannedBy
    };

    setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));

    const bannedRecord: BannedUserRecord = {
      id: target.id,
      email: target.universityEmail,
      fullName: target.fullName,
      nationalId: target.nationalId,
      reason: banReason,
      bannedAt,
      bannedBy
    };

    setBannedList(prev => {
      const filtered = prev.filter(b => b.email.toLowerCase() !== target.universityEmail.toLowerCase() && b.id !== target.id);
      return [bannedRecord, ...filtered];
    });

    // Update committee count
    setCommittees(prev => prev.map(c => c.id === target.currentCommitteeId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c));

    if (currentUserId === id) {
      setIsAuthenticated(false);
      setCurrentUserId('');
      localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
      localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    }

    addAuditLog('تصفية واستبعاد عضو', target.fullName, `تم استبعاد وتصفية العضو من الفريق وحظره من الدخول نهائياً. السبب: ${banReason}`);
    playSound('alert');
    showNotification('warning', `تمت تصفية واستبعاد ${target.fullName} من الفريق وإيقاف وصوله للمنصة.`);
    SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase filter error:', e));
    SupabaseService.upsertBannedUser(bannedRecord).catch(e => console.warn('Supabase filter ban save error:', e));
  };

  // Unban Member
  const unbanMember = (id: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    const updatedMember: Member = {
      ...target,
      status: 'Active',
      banReason: undefined,
      bannedAt: undefined,
      bannedBy: undefined
    };

    setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
    setBannedList(prev => prev.filter(b => b.email.toLowerCase() !== target.universityEmail.toLowerCase() && b.id !== target.id));

    addAuditLog('إلغاء حظر عضو', target.fullName, `تم رفع الحظر واستعادة العضو بواسطة ${currentUser.fullName}`);
    playSound('normal');
    showNotification('success', `تم رفع الحظر عن العضو ${target.fullName} واستعادة عضويته.`);
    SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase unban error:', e));
    SupabaseService.deleteBannedUser(target.universityEmail).catch(e => console.warn('Supabase unban delete error:', e));
  };

  // Check if User is Banned
  const isUserBanned = (emailOrNationalId: string): boolean => {
    if (!emailOrNationalId) return false;
    const clean = emailOrNationalId.trim().toLowerCase();
    const inBannedList = bannedList.some(b => 
      b.email?.trim().toLowerCase() === clean || 
      (b.nationalId && b.nationalId.trim() === emailOrNationalId.trim())
    );
    if (inBannedList) return true;

    const memberBanned = members.some(m => 
      m.status === 'Banned' && (
        m.universityEmail?.trim().toLowerCase() === clean ||
        (m.nationalId && m.nationalId.trim() === emailOrNationalId.trim())
      )
    );
    return memberBanned;
  };

  // Delete Member (with automatic permanent ban & access revocation & cloud cascade)
  const deleteMember = (id: string, alsoBanEmail: boolean = false, banReason: string = '') => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    // 1. Record ID in deletedMemberIds to prevent any sync re-upload or resurrection
    setDeletedMemberIds(prev => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(`${STORAGE_KEY}_DELETED_MEMBER_IDS`, JSON.stringify(next));
      return next;
    });

    // 2. If also banning, add to bannedList
    let bannedRecord: BannedUserRecord | null = null;
    if (alsoBanEmail) {
      const reason = banReason.trim() || 'تم حذف واستبعاد العضو نهائياً مع حظر الدخول';
      bannedRecord = {
        id: target.id,
        email: target.universityEmail,
        fullName: target.fullName,
        nationalId: target.nationalId,
        reason,
        bannedAt: new Date().toISOString(),
        bannedBy: currentUser.fullName
      };

      setBannedList(prev => {
        const filtered = prev.filter(b => b.email.toLowerCase() !== target.universityEmail.toLowerCase() && b.id !== target.id);
        return [bannedRecord!, ...filtered];
      });
      SupabaseService.upsertBannedUser(bannedRecord).catch(e => console.warn('Supabase ban record error:', e));
    }

    // 3. Remove from members state
    setMembers(prev => prev.filter(m => m.id !== id));

    // 4. Update committee count & clear leadership if assigned
    setCommittees(prev => prev.map(c => {
      if (c.id === target.currentCommitteeId) {
        return {
          ...c,
          memberCount: Math.max(0, c.memberCount - 1),
          headId: c.headId === id ? '' : c.headId,
          headName: c.headId === id ? 'لم يحدد' : c.headName,
          viceId: c.viceId === id ? '' : c.viceId,
          viceName: c.viceId === id ? 'لم يحدد' : c.viceName
        };
      }
      return c;
    }));

    // 5. Clean up from tasks
    setTasks(prev => prev.map(t => {
      if (t.assignedToMemberIds && t.assignedToMemberIds.includes(id)) {
        const remainingIds = t.assignedToMemberIds.filter(mId => mId !== id);
        const remainingNames = t.assignedToMemberNames.filter((_, idx) => t.assignedToMemberIds[idx] !== id);
        return {
          ...t,
          assignedToMemberIds: remainingIds,
          assignedToMemberNames: remainingNames
        };
      }
      return t;
    }));

    // 6. Clean up attendance & evaluations
    setAttendanceRecords(prev => prev.filter(a => a.memberId !== id));
    setMemberEvaluations(prev => prev.filter(e => e.memberId !== id));
    setHeadEvaluations(prev => prev.filter(e => e.headId !== id));

    // 7. If active user, log out
    if (currentUserId === id) {
      setIsAuthenticated(false);
      setCurrentUserId('');
      localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
      localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    }

    addAuditLog('حذف سجل عضو نهائياً من قاعدة البيانات', target.fullName, `تم الحذف النهائي بواسطة ${currentUser.fullName}.`);
    playSound('alert');
    showNotification('success', `تم حذف العضو "${target.fullName}" نهائياً من قاعدة البيانات والسحابة ✓`);

    // 8. Delete from Supabase
    SupabaseService.deleteMember(id).catch(e => console.warn('Supabase delete member error:', e));
  };



  // Archive Member
  const archiveMember = (id: string, reason: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'Archived',
          committeeHistory: [
            ...m.committeeHistory,
            {
              id: `hist-arch-${Date.now()}`,
              committeeName: m.currentCommitteeName,
              role: m.position,
              season: activeSeason.name,
              startDate: m.joinDate,
              endDate: new Date().toISOString().split('T')[0],
              reason,
              changedBy: currentUser.fullName
            }
          ]
        };
      }
      return m;
    }));
    addAuditLog('أرشفة ملف متطوع', `ID: ${id}`, `السبب: ${reason}`);
  };

  // Transfer Member Committee (Operational Committees or Supreme Leadership)
  const transferMemberCommittee = (
    memberId: string, 
    newCommitteeId: string, 
    reason: string,
    newRole?: Role,
    newPosition?: string
  ) => {
    const targetComm = committees.find(c => c.id === newCommitteeId);
    if (!targetComm) return;

    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const oldCommId = targetMember.currentCommitteeId;
    const oldCommName = targetMember.currentCommitteeName;
    const assignedRole = newRole || targetMember.role;
    const assignedPosition = newPosition || (
      newCommitteeId === 'comm-leadership'
        ? (assignedRole === 'advisor' ? 'مستشار فريق متطوعين اتحاد طلاب جامعة الإسكندرية' :
           assignedRole === 'vice_president' ? 'نائب رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية' :
           assignedRole === 'super_admin' ? 'رئيس فريق متطوعين اتحاد طلاب جامعة الإسكندرية' :
           assignedRole === 'general_coordinator' ? 'منسق عام فريق المتطوعين' :
           assignedRole === 'operations_manager' ? 'مدير العمليات الميدانية' :
           assignedRole === 'quality_officer' ? 'مسؤول الجودة والمتابعة' :
           'عضو القيادة العليا والمجلس الاستشاري')
        : (assignedRole === 'head' ? `رئيس ${targetComm.name}` :
           assignedRole === 'vice_head' ? `نائب رئيس ${targetComm.name}` :
           assignedRole === 'hr_admin' ? `مسؤول موارد بشرية بـ ${targetComm.name}` :
           `عضو متطوع بـ ${targetComm.name}`)
    );

    const isLeadershipOrHead = newCommitteeId === 'comm-leadership' || isHighLeadershipRole(assignedRole) || assignedRole === 'head' || assignedRole === 'vice_head';
    const newVolId = generateCommitteeVolunteerId(newCommitteeId, assignedRole, members);

    // 1. Update Members list ensuring strictly 1 placement and 1 role
    setMembers(prev => prev.map(m => {
      // The transferred member
      if (m.id === memberId) {
        return {
          ...m,
          currentCommitteeId: newCommitteeId,
          currentCommitteeName: targetComm.name,
          role: assignedRole,
          position: assignedPosition,
          volunteerId: newVolId,
          points: isLeadershipOrHead ? 0 : m.points,
          level: isLeadershipOrHead ? 1 : m.level,
          committeeHistory: [
            ...m.committeeHistory,
            {
              id: `hist-trans-${Date.now()}`,
              committeeName: oldCommName,
              role: targetMember.position,
              season: activeSeason.name,
              startDate: targetMember.joinDate,
              endDate: new Date().toISOString().split('T')[0],
              reason: `نقل إلى ${targetComm.name} (${assignedPosition}): ${reason}`,
              changedBy: currentUser.fullName
            }
          ]
        };
      }

      // If another member in target committee was head, and this member becomes head -> demote previous head to member
      if (assignedRole === 'head' && m.currentCommitteeId === newCommitteeId && m.role === 'head' && m.id !== memberId) {
        return {
          ...m,
          role: 'member' as Role,
          position: `عضو متطوع بـ ${targetComm.name}`
        };
      }

      // If another member in target committee was vice_head, and this member becomes vice_head -> demote previous vice_head to member
      if (assignedRole === 'vice_head' && m.currentCommitteeId === newCommitteeId && m.role === 'vice_head' && m.id !== memberId) {
        return {
          ...m,
          role: 'member' as Role,
          position: `عضو متطوع بـ ${targetComm.name}`
        };
      }

      return m;
    }));

    // 2. Synchronize Committees state: update headId / viceId cleanly
    setCommittees(prev => prev.map(c => {
      let updatedComm = { ...c };

      // Clear from old committee if member was listed as head or vice
      if (c.id === oldCommId && c.id !== newCommitteeId) {
        if (c.headId === memberId) {
          updatedComm.headId = '';
          updatedComm.headName = 'لم يحدد';
        }
        if (c.viceId === memberId) {
          updatedComm.viceId = '';
          updatedComm.viceName = 'لم يحدد';
        }
      }

      // Update target committee if assigned as head or vice
      if (c.id === newCommitteeId) {
        if (assignedRole === 'head') {
          updatedComm.headId = targetMember.id;
          updatedComm.headName = targetMember.fullName;
        } else if (assignedRole === 'vice_head') {
          updatedComm.viceId = targetMember.id;
          updatedComm.viceName = targetMember.fullName;
        }
      }

      // Update member count
      let count = updatedComm.memberCount || 0;
      if (c.id === oldCommId && c.id !== newCommitteeId) {
        count = Math.max(0, count - 1);
      }
      if (c.id === newCommitteeId && c.id !== oldCommId) {
        count = count + 1;
      }
      updatedComm.memberCount = count;

      return updatedComm;
    }));

    addAuditLog('نقل وتسكين عضو بين اللجان والإدارة العليا', targetMember.fullName, `تم النقل إلى ${targetComm.name} - المنصب: ${assignedPosition} - السبب: ${reason}`);
    showNotification('success', `تم نقل وتسكين ${targetMember.fullName} في ${targetComm.name} (${assignedPosition}) بنجاح ✓`);
    playSound('task');

    const finalTransferredMember: Member = {
      ...targetMember,
      currentCommitteeId: newCommitteeId,
      currentCommitteeName: targetComm.name,
      role: assignedRole,
      position: assignedPosition,
      volunteerId: newVolId,
      points: isLeadershipOrHead ? 0 : targetMember.points,
      level: isLeadershipOrHead ? 1 : targetMember.level,
    };
    SupabaseService.upsertMember(finalTransferredMember).catch(e => console.warn('Supabase transfer member error:', e));
  };

  // Dedicated Quick Placement Helpers from Org Chart & Committees
  const assignCommitteeHead = (committeeId: string, memberId: string) => {
    const comm = committees.find(c => c.id === committeeId);
    if (!comm) return;
    transferMemberCommittee(memberId, committeeId, 'تعيين رسمي كرئيس للجنة من الهيكل الإداري', 'head', `رئيس ${comm.name}`);
  };

  const assignCommitteeViceHead = (committeeId: string, memberId: string) => {
    const comm = committees.find(c => c.id === committeeId);
    if (!comm) return;
    transferMemberCommittee(memberId, committeeId, 'تعيين رسمي كنائب رئيس للجنة من الهيكل الإداري', 'vice_head', `نائب رئيس ${comm.name}`);
  };

  const removeCommitteeHead = (committeeId: string, memberId: string) => {
    const comm = committees.find(c => c.id === committeeId);
    if (!comm) return;
    transferMemberCommittee(memberId, committeeId, 'إعفاء من منصب قيادة اللجنة والتحويل لعضو متطوع', 'member', `عضو متطوع بـ ${comm.name}`);
  };

  const removeCommitteeViceHead = (committeeId: string, memberId: string) => {
    const comm = committees.find(c => c.id === committeeId);
    if (!comm) return;
    transferMemberCommittee(memberId, committeeId, 'إعفاء من منصب نائب رئيس اللجنة والتحويل لعضو متطوع', 'member', `عضو متطوع بـ ${comm.name}`);
  };

  // Reveal National ID
  const revealNationalId = (memberId: string) => {
    addAuditLog('كشف الرقم القومي', `عضو ID: ${memberId}`, `تم الاطلاع على الرقم القومي لحساب العضو لأسباب تدقيق رسمية`);
  };

  // Committee Actions
  const createCommittee = (committeeData: Partial<Committee>) => {
    const newComm: Committee = {
      id: `comm-${Date.now()}`,
      name: committeeData.name || 'لجنة جديدة',
      code: committeeData.code || 'COMM',
      description: committeeData.description || '',
      responsibilities: committeeData.responsibilities || ['المساهمة في تنظيم فعاليات الاتحاد'],
      headId: committeeData.headId || currentUser.id,
      headName: committeeData.headName || currentUser.fullName,
      viceId: committeeData.viceId || '',
      viceName: committeeData.viceName || '',
      memberCount: 0,
      activeTasksCount: 0,
      completedTasksCount: 0,
      attendanceRate: 100,
      performanceScore: 90,
      healthScore: 90,
      seasonId: activeSeasonId,
      color: committeeData.color || '#3b82f6',
      icon: committeeData.icon || 'Layers'
    };

    setCommittees(prev => [...prev, newComm]);
    addAuditLog('إنشاء لجنة تخصصية جديدة', newComm.name, `تم تأسيس اللجنة وتعيين ${newComm.headName} رئيساً لها`);
    SupabaseService.upsertCommittee(newComm).catch(e => console.warn('Supabase upsertCommittee error:', e));
  };

  const updateCommittee = (id: string, updates: Partial<Committee>) => {
    let updatedComm: Committee | null = null;
    setCommittees(prev => prev.map(c => {
      if (c.id === id) {
        updatedComm = { ...c, ...updates };
        return updatedComm;
      }
      return c;
    }));
    addAuditLog('تعديل بيانات لجنة', `ID: ${id}`, `تم تحديث الأهداف أو القيادة`);
    if (updatedComm) {
      SupabaseService.upsertCommittee(updatedComm).catch(e => console.warn('Supabase updateCommittee error:', e));
    }
  };

  // Create Task
  const createTask = (taskData: Partial<Task>) => {
    const points = taskData.maxPoints || taskData.xpReward || 25;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'مهمة جديدة',
      description: taskData.description || '',
      committeeId: taskData.committeeId || currentUser.currentCommitteeId,
      committeeName: taskData.committeeName || currentUser.currentCommitteeName,
      assignedToMemberIds: taskData.assignedToMemberIds || [],
      assignedToMemberNames: taskData.assignedToMemberNames || [],
      createdByMemberId: currentUser.id,
      createdByMemberName: currentUser.fullName,
      priority: taskData.priority || 'Medium',
      deadline: taskData.deadline || '2026-10-01',
      status: 'Assigned',
      attachments: taskData.attachments || [],
      subtasks: taskData.subtasks || [],
      voiceNoteUrl: taskData.voiceNoteUrl,
      voiceDuration: taskData.voiceDuration,
      requiredSkills: taskData.requiredSkills || [],
      eventId: taskData.eventId,
      eventName: taskData.eventName,
      completionPercentage: 0,
      maxPoints: points,
      xpReward: points,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTasks(prev => [newTask, ...prev]);
    SupabaseService.upsertTask(newTask).catch(e => console.warn('Supabase upsertTask error:', e));

    newTask.assignedToMemberIds.forEach(mId => {
      const targetM = members.find(m => m.id === mId);
      const notif: SystemNotification = {
        id: `notif-${Date.now()}-${mId}`,
        title: '📋 تكليف بمهمة ميدانية جديدة',
        message: `تم تكليفك بمهمة: "${newTask.title}" (${newTask.committeeName}) - الموعد النهائي: ${newTask.deadline}`,
        type: 'task',
        targetName: targetM ? targetM.fullName : 'عضو مكلف',
        requiredAction: 'المطلوب: مراجعة تفاصيل المهمة وتأكيد الالتزام أو الاعتذار وبدء التنفيذ',
        badgeText: `${newTask.priority === 'Critical' ? '🔥 حرجة' : newTask.priority === 'High' ? '⚡ هامة' : '📌 عادية'} • +${newTask.xpReward} XP`,
        targetCommitteeId: newTask.committeeId,
        targetMemberIds: newTask.assignedToMemberIds,
        senderName: currentUser.fullName,
        read: false,
        createdAt: 'الآن',
        linkTab: 'tasks'
      };
      setNotifications(prev => [notif, ...prev]);
      SupabaseService.upsertNotification(notif).catch(e => console.warn('Supabase notif error:', e));
    });

    sendSystemPushNotification({
      title: '📋 تكليف بمهمة جديدة',
      body: `تم إسناد مهمة "${newTask.title}" إليك بواسطة ${currentUser.fullName}`,
      type: 'task'
    });

    playSound('task');
    addAuditLog('إنشاء وإسناد مهمة جديدة', newTask.title, `تم إسنادها إلى: ${newTask.assignedToMemberNames.join('، ')}`);
  };

  // Update Task (Full Edit)
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    let updatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...updates };
        return updatedTask;
      }
      return t;
    }));
    addAuditLog('تعديل مهمة', `ID: ${taskId}`, `تم تعديل بيانات المهمة بواسطة ${currentUser.fullName}`);
    playSound('task');
    if (updatedTask) {
      SupabaseService.upsertTask(updatedTask).catch(e => console.warn('Supabase updateTask error:', e));
    }
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog('حذف مهمة', task?.title || taskId, `تم حذف المهمة بواسطة ${currentUser.fullName}`);
    playSound('task');
    SupabaseService.deleteTask(taskId).catch(e => console.warn('Supabase deleteTask error:', e));
  };

  // Update Task Status
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    let updatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          status: newStatus,
          completionPercentage: newStatus === 'Approved' ? 100 : newStatus === 'Submitted' ? 90 : t.completionPercentage
        };
        return updatedTask;
      }
      return t;
    }));
    addAuditLog('تحديث حالة مهمة', `ID: ${taskId}`, `تم تغيير الحالة إلى [${newStatus}]`);
    if (updatedTask) {
      SupabaseService.upsertTask(updatedTask).catch(e => console.warn('Supabase updateTaskStatus error:', e));
    }
  };

  // Submit Task (Report + Attachments)
  const submitTask = (taskId: string, notes: string, attachments?: TaskAttachment[], fileUrls?: string[]) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let submittedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        submittedTask = {
          ...t,
          status: 'Submitted',
          completionPercentage: 90,
          submission: {
            submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            notes,
            attachments: attachments || [],
            fileUrls: fileUrls || []
          }
        };
        return submittedTask;
      }
      return t;
    }));

    if (submittedTask) {
      SupabaseService.upsertTask(submittedTask).catch(e => console.warn('Supabase submitTask error:', e));
    }

    // Notify task creator and committee head
    const submitNotif: SystemNotification = {
      id: `notif-sub-${Date.now()}`,
      title: '📥 تم تسليم مخرجات مهمة',
      message: `قام ${currentUser.fullName} بتسليم مهمة: "${task.title}" بانتظار المراجعة والاعتماد`,
      type: 'task',
      read: false,
      createdAt: 'الآن',
      linkTab: 'tasks'
    };
    setNotifications(prev => [submitNotif, ...prev]);
    SupabaseService.upsertNotification(submitNotif).catch(e => console.warn(e));

    playSound('task');
    addAuditLog('تسليم مخرجات مهمة', task.title, `قام ${currentUser.fullName} برفع ملفات ومخرجات التسليم`);
  };

  // Set Task Stance (Commitment or Excusal with Reason)
  const setTaskStance = (taskId: string, stance: 'Committed' | 'Excused', excuseReason?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let updatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const timeStr = new Date().toISOString().substring(0, 10);
        const updatedStatus: TaskStatus = stance === 'Excused' ? 'Cancelled' : (t.status === 'Assigned' ? 'In Progress' : t.status);
        updatedTask = {
          ...t,
          status: updatedStatus,
          stance,
          excuseReason: stance === 'Excused' ? (excuseReason || 'اعتذار عن أداء المهمة') : undefined,
          excusedAt: stance === 'Excused' ? timeStr : undefined,
          excusedByMemberId: currentUser.id,
          excusedByMemberName: currentUser.fullName
        };
        return updatedTask;
      }
      return t;
    }));

    if (updatedTask) {
      SupabaseService.upsertTask(updatedTask).catch(e => console.warn(e));
    }

    if (stance === 'Excused') {
      addAuditLog('اعتذار عن مهمة', task.title, `اعتذر ${currentUser.fullName} عن المهمة. السبب: ${excuseReason || 'بدون سبب'}`);
      showNotification('warning', `تم تسجيل اعتذارك عن المهمة وإخطار رئيس اللجنة`);
      playSound('alert');
    } else {
      addAuditLog('تأكيد الالتزام بمهمة', task.title, `أكد ${currentUser.fullName} التزامه بالمهمة وبدء تنفيذها`);
      showNotification('success', `تم تأكيد التزامك بالمهمة "${task.title}" بنجاح! 🚀`);
      playSound('task');
    }
  };

  // Toggle Subtask Completion
  const toggleTaskSubtask = (taskId: string, subtaskId: string) => {
    let updatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const total = updatedSubtasks.length;
        const calcPercent = total > 0 ? Math.round((completedCount / total) * 100) : t.completionPercentage;
        updatedTask = {
          ...t,
          subtasks: updatedSubtasks,
          completionPercentage: t.status === 'Approved' ? 100 : calcPercent
        };
        return updatedTask;
      }
      return t;
    }));
    playSound('task');
    if (updatedTask) {
      SupabaseService.upsertTask(updatedTask).catch(e => console.warn(e));
    }
  };

  // Evaluate Task (With custom awardedPoints and maxPoints)
  const evaluateTask = (taskId: string, evalData: TaskEvaluation, awardedPoints?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const pointsAwarded = (awardedPoints !== undefined && awardedPoints !== null) 
      ? Number(awardedPoints) 
      : (task.maxPoints || task.xpReward || 25);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let evaluatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        evaluatedTask = {
          ...t,
          status: 'Approved',
          completionPercentage: 100,
          evaluation: evalData,
          awardedPoints: pointsAwarded,
          gradedBy: currentUser.id,
          gradedByName: currentUser.fullName,
          gradedAt: now,
          feedback: evalData.feedback
        };
        return evaluatedTask;
      }
      return t;
    }));

    if (evaluatedTask) {
      SupabaseService.upsertTask(evaluatedTask).catch(e => console.warn(e));
    }

    setMembers(prev => prev.map(m => {
      if (task.assignedToMemberIds.includes(m.id)) {
        const newPoints = m.points + pointsAwarded;
        const updatedM = {
          ...m,
          points: newPoints,
          level: Math.floor(newPoints / 150) + 1,
          performance: {
            ...m.performance,
            taskQuality: Number(((m.performance.taskQuality * m.performance.evaluationsCount + evalData.qualityScore) / (m.performance.evaluationsCount + 1)).toFixed(1)),
            evaluationsCount: m.performance.evaluationsCount + 1
          }
        };
        SupabaseService.upsertMember(updatedM).catch(e => console.warn(e));
        return updatedM;
      }
      return m;
    }));

    // Notify assigned members
    task.assignedToMemberIds.forEach(mId => {
      const evalNotif: SystemNotification = {
        id: `notif-eval-${Date.now()}-${mId}`,
        title: '🌟 تم اعتماد وتقييم مهمتك بنجاح',
        message: `تم اعتماد مهمتك "${task.title}" بنتيجة ${evalData.qualityScore}/5 وإضافة +${pointsAwarded} XP إلى رصيدك!`,
        type: 'achievement',
        read: false,
        createdAt: 'الآن',
        linkTab: 'tasks'
      };
      setNotifications(prev => [evalNotif, ...prev]);
      SupabaseService.upsertNotification(evalNotif).catch(e => console.warn(e));
    });

    triggerGamificationCelebration('🌟 تقييم متميز للمهمة!', pointsAwarded);
    addAuditLog('تقييم مهمة', task.title, `التقييم: ${evalData.qualityScore}/5 - النقاط الممنوحة: ${pointsAwarded}/${task.maxPoints || task.xpReward || 25}`);
  };

  // Create Event
  const createEvent = (eventData: Partial<EventEntity>) => {
    const newEvent: EventEntity = {
      id: `event-${Date.now()}`,
      name: eventData.name || 'فعالية جديدة',
      date: eventData.date || '2026-10-01',
      startTime: eventData.startTime || '09:00 ص',
      endTime: eventData.endTime || '04:00 م',
      location: eventData.location || 'جامعة الإسكندرية',
      description: eventData.description || '',
      eventManagerId: eventData.eventManagerId || currentUser.id,
      eventManagerName: eventData.eventManagerName || currentUser.fullName,
      targetAudience: eventData.targetAudience || 'all',
      selectedCommitteeIds: eventData.selectedCommitteeIds || [],
      committeeQuotas: eventData.committeeQuotas || {},
      rsvps: eventData.rsvps || {},
      status: eventData.status || 'Planned',
      expectedMembersCount: eventData.expectedMembersCount || 20,
      actualAttendanceCount: 0,
      tasksCount: 0,
      sosAlertsCount: 0,
      seasonId: activeSeasonId,
      liveDashboardActive: false
    };

    setEvents(prev => [newEvent, ...prev]);
    SupabaseService.upsertEvent(newEvent).catch(e => console.warn('Supabase upsertEvent error:', e));
    
    // Broadcast notification for new event to all members or target group
    const targetGroupText = newEvent.targetAudience === 'heads_leadership'
      ? '👑 رؤساء اللجان والقيادة العليا'
      : newEvent.targetAudience === 'members_only'
      ? '🌟 أعضاء المتطوعين'
      : '👥 جميع أعضاء ولجان المتطوعين';

    const eventNotif: SystemNotification = {
      id: `notif-event-${Date.now()}`,
      title: `📅 تم جدولة فعالية جديدة: "${newEvent.name}"`,
      message: `التاريخ: ${newEvent.date} في ${newEvent.location} (${newEvent.startTime} - ${newEvent.endTime})`,
      type: 'achievement',
      targetName: targetGroupText,
      requiredAction: 'المطلوب: فتح الفعالية وتأكيد الحضور (RSVP) أو تقديم اعتذار مسبق',
      badgeText: `حصة ${newEvent.expectedMembersCount} متطوع`,
      senderName: currentUser.fullName,
      read: false,
      createdAt: 'الآن',
      linkTab: 'events'
    };
    setNotifications(prev => [eventNotif, ...prev]);
    SupabaseService.upsertNotification(eventNotif).catch(e => console.warn(e));

    sendSystemPushNotification({
      title: `📅 فعالية جديدة: ${newEvent.name}`,
      body: `بتاريخ ${newEvent.date} في ${newEvent.location} - يرجى تسجيل تأكيد الحضور`,
      type: 'event'
    });

    addAuditLog('إنشاء فعالية جديدة', newEvent.name, `الموقع: ${newEvent.location} - الموعد: ${newEvent.date} - الفئة: ${newEvent.targetAudience || 'all'}`);
    playSound('task');
  };

  // Update Event
  const updateEvent = (id: string, updates: Partial<EventEntity>) => {
    let updatedEvent: EventEntity | null = null;
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        updatedEvent = { ...e, ...updates };
        return updatedEvent;
      }
      return e;
    }));
    addAuditLog('تعديل فعالية', `ID: ${id}`, `تم تحديث بيانات الفعالية أو حالتها`);
    if (updatedEvent) {
      SupabaseService.upsertEvent(updatedEvent).catch(e => console.warn('Supabase updateEvent error:', e));
    }
  };

  // Delete Event
  const deleteEvent = (id: string) => {
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('حذف فعالية', evt?.name || id, `تم حذف الفعالية بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم حذف الفعالية "${evt?.name || ''}" بنجاح`);
    SupabaseService.deleteEvent(id).catch(e => console.warn('Supabase deleteEvent error:', e));
  };

  // Event RSVP & Attendance Confirmation / Apology
  const respondToEventRSVP = (
    eventId: string,
    status: 'Attending' | 'Apologized',
    expectedArrivalTime?: string,
    apologyReason?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedEv: EventEntity | null = null;
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const rsvps = ev.rsvps || {};
        const userRSVP: EventRSVP = {
          memberId: currentUser.id,
          memberName: currentUser.fullName,
          memberVolunteerId: currentUser.volunteerId,
          committeeId: currentUser.currentCommitteeId,
          committeeName: currentUser.currentCommitteeName,
          role: currentUser.role,
          status,
          apologyReason: status === 'Apologized' ? apologyReason : undefined,
          expectedArrivalTime: status === 'Attending' ? (expectedArrivalTime || ev.startTime) : undefined,
          registeredAt: now
        };
        updatedEv = {
          ...ev,
          rsvps: {
            ...rsvps,
            [currentUser.id]: userRSVP
          }
        };
        return updatedEv;
      }
      return ev;
    }));

    if (updatedEv) {
      SupabaseService.upsertEvent(updatedEv).catch(e => console.warn(e));
    }

    addAuditLog(
      status === 'Attending' ? 'تأكيد حضور فعالية' : 'اعتذار عن حضور فعالية',
      currentUser.fullName,
      `الفعالية ID: ${eventId} - ${status === 'Attending' ? `موعد الحضور: ${expectedArrivalTime || 'في الموعد المحدد'}` : `السبب: ${apologyReason || 'عذر شخصي'}`}`
    );

    showNotification(
      'success',
      status === 'Attending'
        ? 'تم تسجيل وتأكيد حضورك في الفعالية بنجاح ✓'
        : 'تم تسجيل اعتذارك وإخطار قيادة اللجنة بالسبب'
    );
  };

  // Send Event Day Reminder Notification to Attending Members
  const sendEventDayReminder = (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const notif: SystemNotification = {
      id: `notif-event-day-${Date.now()}`,
      title: `🔔 تذكير: اليوم موعد فعالية "${targetEvent.name}"`,
      message: `نذكرك بأن الفعالية اليوم في ${targetEvent.location} في تمام ${targetEvent.startTime}. يرجى التواجد في الموعد المحدد ومسح كود الحضور الميداني.`,
      type: 'achievement',
      read: false,
      createdAt: 'الآن',
      linkTab: 'events'
    };

    setNotifications(prev => [notif, ...prev]);
    SupabaseService.upsertNotification(notif).catch(e => console.warn(e));
    playSound('announcement');
    showNotification('success', `تم إرسال إشعار تذكير يوم الفعالية لجميع المسجلين لحضور "${targetEvent.name}" بنجاح 🔔`);
  };

  // Update Attendance Points Config
  const updateAttendancePointsConfig = (config: AttendancePointsConfig) => {
    setAttendancePointsConfig(config);
    addAuditLog('تعديل معايير نقاط الحضور', 'Attendance Points Config', `تم تعديل قواعد حساب النقاط والتأخير بواسطة ${currentUser.fullName}`);
    showNotification('success', 'تم حفظ وتحديث معايير نقاط الحضور والتأخير بنجاح ⚙️');
  };

  // Delete Committee
  const deleteCommittee = (id: string) => {
    const comm = committees.find(c => c.id === id);
    setCommittees(prev => prev.filter(c => c.id !== id));
    addAuditLog('حذف لجنة', comm?.name || id, `تم حذف اللجنة بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم حذف اللجنة ${comm?.name || ''} بنجاح`);
    SupabaseService.deleteCommittee(id).catch(e => console.warn('Supabase deleteCommittee error:', e));
  };

  // Create Attendance Session (Head / VP / Super Admin / Advisor)
  const createAttendanceSession = (sessionData: Partial<AttendanceSession>): AttendanceSession => {
    const targetComm = sessionData.committeeId === 'all' 
      ? { name: 'جميع اللجان' } 
      : committees.find(c => c.id === sessionData.committeeId);

    const targetEvent = sessionData.eventId 
      ? events.find(e => e.id === sessionData.eventId)
      : undefined;

    const newSession: AttendanceSession = {
      id: `session-${Date.now()}`,
      title: sessionData.title || (targetEvent ? `جلسة حضور: ${targetEvent.name}` : 'جلسة حضور ميدانية جديدة'),
      committeeId: sessionData.committeeId || 'all',
      committeeName: sessionData.committeeName || (targetComm?.name || 'جميع اللجان'),
      createdByMemberId: currentUser.id,
      createdByMemberName: currentUser.fullName,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString().substring(0, 10),
      requireGPS: sessionData.requireGPS !== false,
      sessionType: sessionData.sessionType || 'members',
      eventId: sessionData.eventId || targetEvent?.id,
      eventName: sessionData.eventName || targetEvent?.name,
      eventDate: sessionData.eventDate || targetEvent?.date,
      qrToken: `ALEXU_QR_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now()}`,
      isActive: true,
      notes: sessionData.notes || ''
    };

    setAttendanceSessions(prev => [newSession, ...prev.map(s => ({ ...s, isActive: false }))]);
    SupabaseService.upsertAttendanceSession(newSession).catch(e => console.warn(e));
    playSound('task');
    addAuditLog('إنشاء جلسة حضور QR', newSession.title, `اللجنة: ${newSession.committeeName} [${newSession.sessionType === 'heads' ? 'رؤساء اللجان' : 'المتطوعين'}] - الفعالية: ${newSession.eventName || 'عامة'} - بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم إنشاء وتفعيل جلسة الحضور بنجاح: "${newSession.title}"`);
    return newSession;
  };

  // Close Attendance Session
  const closeAttendanceSession = (sessionId: string) => {
    let closedSession: AttendanceSession | null = null;
    setAttendanceSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        closedSession = { ...s, isActive: false };
        return closedSession;
      }
      return s;
    }));
    if (closedSession) {
      SupabaseService.upsertAttendanceSession(closedSession).catch(e => console.warn(e));
    }
    addAuditLog('إغلاق جلسة حضور QR', `ID: ${sessionId}`, 'تم إنهاء الجلسة وإيقاف استقبال المسح');
    showNotification('info', 'تم إغلاق جلسة الحضور');
  };

  // Record Attendance with Real GPS Location & Smart 2-Phase Check-In/Check-Out
  const recordAttendanceWithGPS = (params: { 
    memberId: string; 
    eventId?: string; 
    sessionId?: string; 
    actionType: 'check-in' | 'check-out' | 'auto'; 
    gpsLocation?: GPSLocation;
    qrToken?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord; actionDone?: 'check-in' | 'check-out'; isCompleted?: boolean } => {
    const targetMember = members.find(m => m.id === params.memberId || m.volunteerId === params.memberId || m.universityEmail === params.memberId);
    if (!targetMember) return { success: false, message: 'بيانات المتطوع غير مسجلة بالنظام' };

    const session = attendanceSessions.find(s => s.id === params.sessionId) || activeAttendanceSession;
    const targetEvent = events.find(e => e.id === (params.eventId || session?.eventId)) || events[0];

    const linkedEventId = params.eventId || session?.eventId || targetEvent?.id || 'event-live';
    const linkedEventName = session?.eventName || targetEvent?.name || session?.title || 'جلسة عمل ميدانية';
    const todayDateStr = new Date().toISOString().split('T')[0];

    // Find existing attendance record for today / this session / event
    const existing = attendanceRecords.find(a => 
      (a.memberId === targetMember.id || (a.memberVolunteerId && a.memberVolunteerId === targetMember.volunteerId)) && 
      (params.sessionId ? a.sessionId === params.sessionId : (a.eventId === linkedEventId || a.date === todayDateStr))
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const memberFirstName = targetMember.fullName.split(' ')[0] || targetMember.fullName;

    // Determine effective action (auto resolves check-in vs check-out)
    let effectiveAction: 'check-in' | 'check-out' = 'check-in';
    if (params.actionType === 'auto') {
      if (!existing) {
        effectiveAction = 'check-in';
      } else if (!existing.checkOutTime) {
        effectiveAction = 'check-out';
      } else {
        // Already completed both check-in and check-out
        return {
          success: false,
          isCompleted: true,
          record: existing,
          message: `أهلاً يا ${memberFirstName}، لقد أتممت تسجيل الحضور والانصراف مسبقاً لهذه الجلسة بنجاح! (المدة المسجلة: ${existing.durationFormatted || `${existing.durationMinutes} دقيقة`})`
        };
      }
    } else {
      effectiveAction = params.actionType;
    }

    if (effectiveAction === 'check-in') {
      if (existing) {
        return { 
          success: false, 
          record: existing,
          message: `عفواً يا ${memberFirstName}، لقد قمت بتسجيل الحضور مسبقاً في هذه الجلسة عند الساعة (${existing.checkInTime})!` 
        };
      }

      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        memberId: targetMember.id,
        memberName: targetMember.fullName,
        memberAvatar: targetMember.avatarUrl,
        memberVolunteerId: targetMember.volunteerId,
        committeeId: targetMember.currentCommitteeId,
        committeeName: targetMember.currentCommitteeName,
        eventId: linkedEventId,
        eventName: linkedEventName,
        sessionId: session?.id,
        sessionTitle: session?.title,
        date: todayDateStr,
        checkInTime: timeStr,
        checkInTimestamp: Date.now(),
        durationMinutes: 0,
        durationFormatted: 'متواجد حالياً بالميدان ⏳',
        status: 'Present',
        qrHashToken: params.qrToken || `ALEXU_QR_${Date.now()}`,
        gpsLocation: params.gpsLocation
      };

      setAttendanceRecords(prev => [newRec, ...prev.filter(a => a.id !== newRec.id)]);
      SupabaseService.insertAttendanceRecord(newRec).catch(e => console.warn('Supabase attendance record error:', e));

      // Award XP to member (+25 XP for presence)
      setMembers(prev => prev.map(m => {
        if (m.id === targetMember.id) {
          const updatedXP = (m.points || 0) + 25;
          const updatedM = {
            ...m,
            points: updatedXP,
            level: Math.floor(updatedXP / 150) + 1,
            performance: {
              ...m.performance,
              attendanceRate: Math.min(100, (m.performance?.attendanceRate || 90) + 1)
            }
          };
          SupabaseService.upsertMember(updatedM).catch(e => console.warn(e));
          return updatedM;
        }
        return m;
      }));

      playSound('task');
      triggerGamificationCelebration(`🟢 تم تسجيل حضور ${memberFirstName} بنجاح!`, 25);
      addAuditLog('تسجيل حضور QR مع GPS', targetMember.fullName, `الجلسة: ${session?.title || targetEvent?.name} - وقت الحضور: ${timeStr} - الإحداثيات: ${params.gpsLocation ? `${params.gpsLocation.lat.toFixed(4)}, ${params.gpsLocation.lng.toFixed(4)}` : 'تم تحديد الموقع'}`);

      return {
        success: true,
        actionDone: 'check-in',
        message: `تم تسجيل حضورك بنجاح يا ${memberFirstName}! (${timeStr})`,
        record: newRec
      };
    } else {
      // Check-out branch
      if (!existing) {
        return { 
          success: false, 
          message: `عفواً يا ${memberFirstName}، لم يتم العثور على تسجيل حضور سابق لك في هذه الجلسة لتسجيل الانصراف!` 
        };
      }

      if (existing.checkOutTime) {
        return {
          success: false,
          isCompleted: true,
          record: existing,
          message: `لقد قمت بتسجيل الانصراف مسبقاً عند الساعة (${existing.checkOutTime})، إجمالي المدة: ${existing.durationFormatted}`
        };
      }

      // Calculate elapsed minutes and formatted duration
      const checkInTs = existing.checkInTimestamp || (existing.date ? new Date(`${existing.date}T${existing.checkInTime || '09:00:00'}`).getTime() : Date.now() - 3600000);
      const diffMs = Math.max(0, Date.now() - checkInTs);
      const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      let durationFormatted = '';
      if (hours > 0 && mins > 0) {
        durationFormatted = `${hours} ساعة و ${mins} دقيقة`;
      } else if (hours > 0) {
        durationFormatted = `${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : hours <= 10 ? 'ساعات' : 'ساعة'}`;
      } else {
        durationFormatted = `${mins} دقيقة`;
      }

      let updatedRec: AttendanceRecord = {
        ...existing,
        checkOutTime: timeStr,
        checkOutTimestamp: Date.now(),
        durationMinutes: diffMinutes,
        durationFormatted: durationFormatted,
        gpsLocation: params.gpsLocation || existing.gpsLocation
      };

      setAttendanceRecords(prev => prev.map(a => a.id === existing.id ? updatedRec : a));
      SupabaseService.insertAttendanceRecord(updatedRec).catch(e => console.warn('Supabase attendance checkout error:', e));

      // Award XP for completing field hours (+15 XP)
      setMembers(prev => prev.map(m => {
        if (m.id === targetMember.id) {
          const updatedXP = (m.points || 0) + 15;
          const updatedM = {
            ...m,
            points: updatedXP,
            level: Math.floor(updatedXP / 150) + 1
          };
          SupabaseService.upsertMember(updatedM).catch(e => console.warn(e));
          return updatedM;
        }
        return m;
      }));

      playSound('task');
      triggerGamificationCelebration(`🔴 تم تسجيل انصراف ${memberFirstName}! المدة: ${durationFormatted}`, 15);
      addAuditLog('تسجيل انصراف QR مع GPS', targetMember.fullName, `الجلسة: ${session?.title || targetEvent?.name} - وقت الانصراف: ${timeStr} - المدة: ${durationFormatted}`);

      return {
        success: true,
        actionDone: 'check-out',
        message: `شكراً لعطائك المتميز يا ${memberFirstName}! تم تسجيل الانصراف بنجاح. المدة الميدانية: ${durationFormatted}`,
        record: updatedRec
      };
    }
  };

  // Submit Daily Session Evaluation (Head / Leadership)
  const submitDailyAttendanceEvaluation = (recordId: string, evalData: {
    attendanceCommitment?: number;
    taskQuality?: number;
    teamworkCommunication?: number;
    initiativePassion?: number;
    attendanceScore?: number;
    participationScore?: number;
    commitmentScore?: number;
    taskExecutionScore?: number;
    criteriaScores?: { [criterionName: string]: number };
    criteriaGrades?: { [criterionName: string]: 'A' | 'B' | 'C' | 'Custom' };
    criteriaNotes?: { [criterionName: string]: string };
    totalDailyScore?: number;
    overallGrade?: 'A+' | 'A' | 'B' | 'C' | 'D';
    bonusXP?: number;
    notes?: string;
    memberId?: string;
    eventId?: string;
    eventName?: string;
    sessionId?: string;
    sessionTitle?: string;
    date?: string;
  }) => {
    const c1 = Number(evalData.attendanceCommitment ?? evalData.attendanceScore ?? 25);
    const c2 = Number(evalData.taskQuality ?? evalData.participationScore ?? 35);
    const c3 = Number(evalData.teamworkCommunication ?? evalData.commitmentScore ?? 25);
    const c4 = Number(evalData.initiativePassion ?? evalData.taskExecutionScore ?? 15);

    const totalDaily = Math.min(100, Math.max(0, Math.round(c1 + c2 + c3 + c4)));
    const percentage = totalDaily; // Out of 100

    const overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 
      totalDaily >= 95 ? 'A+' :
      totalDaily >= 85 ? 'A' :
      totalDaily >= 70 ? 'B' :
      totalDaily >= 50 ? 'C' : 'D';

    const awardedXP = (Number(evalData.bonusXP) || 15) + (totalDaily >= 90 ? 30 : totalDaily >= 75 ? 20 : 10);
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const criteriaScoresBreakdown = {
      'الالتزام والحضور (25)': c1,
      'جودة الأداء وإتقان المهام (35)': c2,
      'العمل الجماعي والتواصل (25)': c3,
      'المبادرة والشغف (15)': c4
    };

    let targetMemberId = evalData.memberId || '';
    let updatedRecord: AttendanceRecord | null = null;
    let recFound = attendanceRecords.find(r => r.id === recordId);

    if (recFound) {
      targetMemberId = recFound.memberId;
      setAttendanceRecords(prev => prev.map(rec => {
        if (rec.id === recordId) {
          updatedRecord = {
            ...rec,
            dailyEvaluation: {
              attendanceCommitment: c1,
              taskQuality: c2,
              teamworkCommunication: c3,
              initiativePassion: c4,
              attendanceScore: c1,
              participationScore: c2,
              commitmentScore: c3,
              taskExecutionScore: c4,
              criteriaScores: criteriaScoresBreakdown,
              criteriaGrades: evalData.criteriaGrades || {},
              criteriaNotes: evalData.criteriaNotes || {},
              totalDailyScore: totalDaily,
              percentage: percentage,
              overallGrade: overallGrade,
              bonusXP: awardedXP,
              notes: evalData.notes || '',
              evaluatedBy: currentUser.fullName,
              evaluatorName: currentUser.fullName,
              evaluatorRole: currentUser.role,
              evaluatedAt: nowTimeStr
            }
          };
          return updatedRecord;
        }
        return rec;
      }));
    } else {
      // Direct member evaluation fallback: auto-create attendance record
      const targetM = members.find(m => m.id === recordId || m.id === evalData.memberId || m.volunteerId === recordId);
      if (targetM) {
        targetMemberId = targetM.id;
        const newAttRec: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          memberId: targetM.id,
          memberName: targetM.fullName,
          memberAvatar: targetM.avatarUrl,
          memberVolunteerId: targetM.volunteerId,
          committeeId: targetM.currentCommitteeId,
          committeeName: targetM.currentCommitteeName,
          eventId: evalData.eventId || 'event-live',
          eventName: evalData.eventName || 'جلسة عمل ميدانية',
          sessionId: evalData.sessionId,
          sessionTitle: evalData.sessionTitle,
          date: evalData.date || todayStr,
          checkInTime: nowTimeStr,
          checkInTimestamp: Date.now(),
          durationMinutes: 180,
          durationFormatted: 'حاضر ومعتمد',
          status: 'Present',
          qrHashToken: `DIRECT_EVAL_${Date.now()}`,
          dailyEvaluation: {
            attendanceCommitment: c1,
            taskQuality: c2,
            teamworkCommunication: c3,
            initiativePassion: c4,
            attendanceScore: c1,
            participationScore: c2,
            commitmentScore: c3,
            taskExecutionScore: c4,
            criteriaScores: criteriaScoresBreakdown,
            criteriaGrades: evalData.criteriaGrades || {},
            criteriaNotes: evalData.criteriaNotes || {},
            totalDailyScore: totalDaily,
            percentage: percentage,
            overallGrade: overallGrade,
            bonusXP: awardedXP,
            notes: evalData.notes || '',
            evaluatedBy: currentUser.fullName,
            evaluatorName: currentUser.fullName,
            evaluatorRole: currentUser.role,
            evaluatedAt: nowTimeStr
          }
        };
        updatedRecord = newAttRec;
        recFound = newAttRec;
        setAttendanceRecords(prev => [newAttRec, ...prev]);
      }
    }

    if (updatedRecord) {
      SupabaseService.insertAttendanceRecord(updatedRecord).catch(e => console.warn('Supabase attendance record error:', e));
    }

    const targetMember = members.find(m => m.id === targetMemberId || (updatedRecord && m.id === updatedRecord.memberId));
    const eventNameStr = updatedRecord?.eventName || recFound?.eventName || recFound?.sessionTitle || 'حضور ميداني';
    const evalDateStr = updatedRecord?.date || recFound?.date || todayStr;

    if (targetMember) {
      // 1. Create an official MemberEvaluationRecord in memberEvaluations
      const evalRecordId = `eval-daily-${recordId}-${Date.now()}`;
      const memberEvalObj: MemberEvaluationRecord = {
        id: evalRecordId,
        memberId: targetMember.id,
        memberName: targetMember.fullName,
        memberVolunteerId: targetMember.volunteerId,
        committeeName: targetMember.currentCommitteeName,
        evaluatorId: currentUser.id,
        evaluatorName: currentUser.fullName,
        evaluatorRole: currentUser.role,
        evaluationDate: evalDateStr,
        scores: criteriaScoresBreakdown,
        totalScore: totalDaily,
        maxTotalScore: 100,
        percentage: percentage,
        feedback: evalData.notes ? `${evalData.notes} [التقدير: ${overallGrade}] (+${awardedXP} XP)` : `تقييم جلسة: ${eventNameStr} [التقدير: ${overallGrade}] (+${awardedXP} XP)`,
        evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setMemberEvaluations(prev => {
        const filtered = prev.filter(e => e.id !== evalRecordId && !(e.memberId === targetMember.id && e.evaluationDate === memberEvalObj.evaluationDate && e.evaluatorId === currentUser.id));
        return [memberEvalObj, ...filtered];
      });
      SupabaseService.upsertMemberEvaluation(memberEvalObj).catch(e => console.warn('Supabase upsertMemberEvaluation error:', e));

      // 2. If evaluated member is a Head or Vice Head, also log HeadEvaluationRecord
      if (targetMember.role === 'head' || targetMember.role === 'vice_head') {
        const headEvalObj: HeadEvaluationRecord = {
          id: `head-eval-${recordId}-${Date.now()}`,
          headId: targetMember.id,
          headName: targetMember.fullName,
          headVolunteerId: targetMember.volunteerId,
          headPosition: targetMember.position || (targetMember.role === 'head' ? 'رئيس لجنة' : 'نائب رئيس لجنة'),
          committeeName: targetMember.currentCommitteeName,
          evaluatorId: currentUser.id,
          evaluatorName: currentUser.fullName,
          evaluatorRole: currentUser.role,
          evaluationDate: evalDateStr,
          scores: criteriaScoresBreakdown,
          totalScore: totalDaily,
          maxTotalScore: 100,
          percentage: percentage,
          leadershipRating: Number((totalDaily / 20).toFixed(1)),
          feedback: evalData.notes || `أداء قيادي وانضباط ميداني متميز [التقدير: ${overallGrade}]`,
          evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        setHeadEvaluations(prev => [headEvalObj, ...prev.filter(h => h.id !== headEvalObj.id)]);
        SupabaseService.upsertHeadEvaluation(headEvalObj).catch(e => console.warn('Supabase upsertHeadEvaluation error:', e));
      }

      // 3. Update member's XP points, level, and performance metrics
      setMembers(prev => prev.map(m => {
        if (m.id === targetMember.id) {
          const newXP = (m.points || 0) + awardedXP;
          const prevCount = m.performance?.evaluationsCount || 0;
          const currentOverall = m.performance?.overallScore || 90;
          const newOverall = Math.min(100, Math.round(((currentOverall * prevCount) + percentage) / (prevCount + 1)));

          const updatedM = {
            ...m,
            points: newXP,
            level: Math.floor(newXP / 150) + 1,
            performance: {
              ...m.performance,
              overallScore: newOverall,
              evaluationsCount: prevCount + 1,
              commitment: Math.min(100, Math.round(((m.performance?.commitment || 90) + (c1 * 4)) / 2)),
              taskQuality: Number(((c2 / 35) * 5).toFixed(1)),
              teamwork: Math.min(100, Math.round(((m.performance?.teamwork || 90) + (c3 * 4)) / 2))
            }
          };
          SupabaseService.upsertMember(updatedM).catch(e => console.warn(e));
          return updatedM;
        }
        return m;
      }));

      // 4. Send targeted personal notification to the volunteer with breakdown
      const evalNotif: SystemNotification = {
        id: `notif-daily-eval-${Date.now()}`,
        title: `🌟 تقييم اليوم الميداني: ${totalDaily}/100 (${overallGrade})`,
        message: `أهلاً يا ${targetMember.fullName.split(' ')[0]}، تم اعتماد تقييمك لجلسة (${eventNameStr}) بواسطة ${currentUser.fullName}: النتيجة ${totalDaily}/100 [تقدير: ${overallGrade}]. (حضور: ${c1}/25 | أداء: ${c2}/35 | عمل جماعي: ${c3}/25 | مبادرة: ${c4}/15). ${evalData.notes ? `ملاحظات: "${evalData.notes}"` : ''}`,
        type: 'eval',
        targetMemberIds: [targetMember.id],
        senderName: currentUser.fullName,
        read: false,
        createdAt: 'الآن',
        linkTab: 'evaluations'
      };
      setNotifications(prev => [evalNotif, ...prev]);
      SupabaseService.upsertNotification(evalNotif).catch(e => console.warn(e));

      // 5. Send Web Push Notification to user's device
      sendSystemPushNotification({
        title: `🌟 تقييم اليوم الميداني: ${totalDaily}/100 (${overallGrade})`,
        body: `تم اعتماد تقييمك لجلسة ${eventNameStr}: ${totalDaily}/100 (${percentage}%). مبروك +${awardedXP} XP!`,
        type: 'achievement',
        data: { url: '/?tab=evaluations' }
      });
    }

    playSound('task');
    triggerGamificationCelebration(`🌟 تم اعتماد تقييم ${targetMember?.fullName.split(' ')[0] || 'المتطوع'} بنجاح! (${totalDaily}/100 - تقدير ${overallGrade})`, awardedXP);
    addAuditLog('تسجيل تقييم اليوم الميداني', targetMember?.fullName || `Record ID: ${recordId}`, `الدرجة: ${totalDaily}/100 (${overallGrade}) - XP: +${awardedXP} - المقيم: ${currentUser.fullName}`);
    showNotification('success', `تم حفظ تقييم اليوم للمتطوع بنتيجة ${totalDaily}/100 (${overallGrade}) وإرسال الإشعار بنجاح!`);
  };

  // Delete Attendance Record
  const deleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    addAuditLog('حذف سجل حضور', `ID: ${recordId}`, `تم الحذف بواسطة ${currentUser.fullName}`);
    showNotification('info', 'تم حذف سجل الحضور بنجاح');
    SupabaseService.deleteAttendanceRecord(recordId).catch(e => console.warn(e));
  };

  // Legacy Record Attendance Helper
  const recordAttendance = (memberId: string, eventId: string, actionType: 'check-in' | 'check-out') => {
    return recordAttendanceWithGPS({
      memberId,
      eventId,
      actionType
    });
  };

  // Create SOS Alert
  const createSOSAlert = (alertData: Partial<SOSAlert>) => {
    const newAlert: SOSAlert = {
      id: `sos-${Date.now()}`,
      eventId: alertData.eventId || (liveEvent ? liveEvent.id : 'event-general'),
      eventName: alertData.eventName || (liveEvent ? liveEvent.name : 'الفعاليات الميدانية'),
      alertType: alertData.alertType || 'Crowd Emergency',
      location: alertData.location || 'الموقع الرئيسي',
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      reportedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      description: alertData.description || 'طلب دعم فوري',
      status: 'Open'
    };

    setSosAlerts(prev => {
      const updated = [newAlert, ...prev];
      SupabaseService.saveAppSetting('sos_alerts', updated).catch(e => console.warn(e));
      return updated;
    });

    const sosNotif: SystemNotification = {
      id: `notif-sos-${Date.now()}`,
      title: `🚨 بلاغ طوارئ جديد: ${newAlert.alertType}`,
      message: `${newAlert.description} (${newAlert.location})`,
      type: 'sos',
      read: false,
      createdAt: 'الآن',
      linkTab: 'events'
    };
    setNotifications(prev => [sosNotif, ...prev]);
    SupabaseService.upsertNotification(sosNotif).catch(e => console.warn(e));

    sendSystemPushNotification({
      title: `🚨 بلاغ طوارئ SOS عاجل: ${newAlert.alertType}`,
      body: `${newAlert.description} - الموقع: ${newAlert.location}`,
      type: 'sos'
    });

    playSound('alert');
    addAuditLog('إطلاق بلاغ طوارئ SOS', newAlert.alertType, newAlert.location);
  };

  const acknowledgeSOS = (alertId: string) => {
    setSosAlerts(prev => {
      const updated = prev.map(s => s.id === alertId ? {
        ...s,
        status: 'Acknowledged' as const,
        acknowledgedBy: currentUser.fullName,
        acknowledgedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      } : s);
      SupabaseService.saveAppSetting('sos_alerts', updated).catch(e => console.warn(e));
      return updated;
    });
    addAuditLog('تأكيد بلاغ طوارئ', `ID: ${alertId}`, `بواسطة ${currentUser.fullName}`);
  };

  const resolveSOS = (alertId: string) => {
    setSosAlerts(prev => {
      const updated = prev.map(s => s.id === alertId ? {
        ...s,
        status: 'Resolved' as const,
        resolvedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      } : s);
      SupabaseService.saveAppSetting('sos_alerts', updated).catch(e => console.warn(e));
      return updated;
    });
    playSound('success');
    addAuditLog('حل وإغلاق بلاغ طوارئ', `ID: ${alertId}`, 'تم التعامل مع الأزمة بنجاح');
  };

  const updateEvaluationTemplate = (criteria: KPICriterion[]) => {
    setEvaluationTemplate(prev => ({ ...prev, criteria }));
    addAuditLog('تحديث قالب معايير التقييم', 'Evaluation Template', 'تم تعديل أوزان بنود الأداء');
  };

  const updateEvaluationRubric = (rubric: EvaluationRubric) => {
    setEvaluationRubric(rubric);
    addAuditLog('تحديث مصفوفة التقييم الموحدة', rubric.title, `بواسطة ${currentUser.fullName}`);
  };

  const submitMemberEvaluation = (evalData: Omit<MemberEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'> & { evaluationDate?: string }) => {
    const totalScore = Object.values(evalData.scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / evalData.maxTotalScore) * 100);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const today = new Date().toISOString().split('T')[0];

    const record: MemberEvaluationRecord = {
      ...evalData,
      id: `eval-rec-${Date.now()}`,
      evaluationDate: evalData.evaluationDate || today,
      totalScore,
      percentage,
      evaluatedAt: now
    };

    setMemberEvaluations(prev => [record, ...prev]);
    SupabaseService.upsertMemberEvaluation(record).catch(e => console.warn('Supabase upsertMemberEvaluation error:', e));

    setMembers(prev => prev.map(m => {
      if (m.id === evalData.memberId) {
        const prevCount = m.performance.evaluationsCount || 1;
        const newOverall = Math.round(((m.performance.overallScore * prevCount) + percentage) / (prevCount + 1));
        const updatedM = {
          ...m,
          performance: {
            ...m.performance,
            overallScore: newOverall,
            evaluationsCount: prevCount + 1
          }
        };
        SupabaseService.upsertMember(updatedM).catch(e => console.warn(e));
        return updatedM;
      }
      return m;
    }));

    const notif: SystemNotification = {
      id: `notif-eval-${Date.now()}`,
      title: '🎯 تقييم أداء جديد',
      message: `تم اعتماد تقييمك ليوم ${record.evaluationDate} بنتيجة ${totalScore}/${evalData.maxTotalScore} (${percentage}%)`,
      type: 'eval',
      read: false,
      createdAt: 'الآن',
      linkTab: 'evaluations'
    };
    setNotifications(prev => [notif, ...prev]);
    SupabaseService.upsertNotification(notif).catch(e => console.warn(e));

    playSound('task');
    addAuditLog('تقييم متطوع شامل', evalData.memberName, `تاريخ التقييم: ${record.evaluationDate} - النتيجة: ${percentage}%`);
    showNotification('success', `تم حفظ واعتماد تقييم اليوم للمتطوع بنجاح (${percentage}%) 🎉`);
  };

  const updateMemberEvaluation = (id: string, updates: Partial<MemberEvaluationRecord>) => {
    let updatedRec: MemberEvaluationRecord | null = null;
    setMemberEvaluations(prev => prev.map(rec => {
      if (rec.id === id) {
        const scores = updates.scores || rec.scores;
        const maxTotalScore = updates.maxTotalScore || rec.maxTotalScore;
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const percentage = Math.round((totalScore / maxTotalScore) * 100);
        updatedRec = {
          ...rec,
          ...updates,
          scores,
          totalScore,
          maxTotalScore,
          percentage
        };
        return updatedRec;
      }
      return rec;
    }));

    if (updatedRec) {
      SupabaseService.upsertMemberEvaluation(updatedRec).catch(e => console.warn(e));
    }

    addAuditLog('تعديل تقييم عضو', `ID: ${id}`, `تم تحديث درجات تقييم المتطوع بواسطة ${currentUser.fullName}`);
    showNotification('success', 'تم تعديل وحفظ درجات التقييم بنجاح ✓');
  };

  const deleteMemberEvaluation = (id: string) => {
    const target = memberEvaluations.find(e => e.id === id);
    setMemberEvaluations(prev => prev.filter(rec => rec.id !== id));
    addAuditLog('حذف تقييم عضو', target?.memberName || id, `تم حذف سجل التقييم بواسطة ${currentUser.fullName}`);
    showNotification('info', 'تم حذف سجل التقييم بنجاح');
    SupabaseService.deleteMemberEvaluation(id).catch(e => console.warn(e));
  };

  // Evaluate Head (High Leadership evaluation for Committee Heads and Vice Heads)
  const evaluateHead = (evalData: Omit<HeadEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'> & { evaluationDate?: string }) => {
    const totalScore = Object.values(evalData.scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / evalData.maxTotalScore) * 100);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const today = new Date().toISOString().split('T')[0];

    const record: HeadEvaluationRecord = {
      ...evalData,
      id: `head-eval-${Date.now()}`,
      evaluationDate: evalData.evaluationDate || today,
      totalScore,
      percentage,
      evaluatedAt: now
    };

    setHeadEvaluations(prev => [record, ...prev]);
    SupabaseService.upsertHeadEvaluation(record).catch(e => console.warn('Supabase upsertHeadEvaluation error:', e));

    // Update Head's leadership performance metrics
    setMembers(prev => prev.map(m => {
      if (m.id === evalData.headId) {
        const prevCount = m.performance.evaluationsCount || 1;
        const newOverall = Math.round(((m.performance.overallScore * prevCount) + percentage) / (prevCount + 1));
        const newLeadership = Math.round(((m.performance.leadership * prevCount) + percentage) / (prevCount + 1));
        const updatedHead = {
          ...m,
          performance: {
            ...m.performance,
            overallScore: newOverall,
            leadership: newLeadership,
            evaluationsCount: prevCount + 1
          }
        };
        SupabaseService.upsertMember(updatedHead).catch(e => console.warn(e));
        return updatedHead;
      }
      return m;
    }));

    const notif: SystemNotification = {
      id: `notif-head-eval-${Date.now()}`,
      title: '👑 تقييم أداء قيادي جديد من الإدارة العليا',
      message: `تم اعتماد تقييمك القيادي ليوم ${record.evaluationDate} لـ (${evalData.committeeName}) بنتيجة ${totalScore}/${evalData.maxTotalScore} (${percentage}%)`,
      type: 'eval',
      read: false,
      createdAt: 'الآن',
      linkTab: 'evaluations'
    };
    setNotifications(prev => [notif, ...prev]);
    SupabaseService.upsertNotification(notif).catch(e => console.warn(e));

    playSound('task');
    addAuditLog('تقييم أداء رئيس/نائب لجنة', evalData.headName, `تاريخ: ${record.evaluationDate} - النتيجة: ${percentage}% - المقيم: ${currentUser.fullName}`);
    showNotification('success', `تم حفظ واعتماد تقييم الأداء القيادي لـ "${evalData.headName}" بنجاح (${percentage}%)`);
  };

  const updateHeadEvaluation = (id: string, updates: Partial<HeadEvaluationRecord>) => {
    let updatedRec: HeadEvaluationRecord | null = null;
    setHeadEvaluations(prev => prev.map(rec => {
      if (rec.id === id) {
        const scores = updates.scores || rec.scores;
        const maxTotalScore = updates.maxTotalScore || rec.maxTotalScore;
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
        const percentage = Math.round((totalScore / maxTotalScore) * 100);
        updatedRec = {
          ...rec,
          ...updates,
          scores,
          totalScore,
          maxTotalScore,
          percentage
        };
        return updatedRec;
      }
      return rec;
    }));

    if (updatedRec) {
      SupabaseService.upsertHeadEvaluation(updatedRec).catch(e => console.warn(e));
    }

    addAuditLog('تعديل تقييم قيادي', `ID: ${id}`, `تم تعديل درجات تقييم رئيس/نائب اللجنة بواسطة ${currentUser.fullName}`);
    showNotification('success', 'تم تعديل وحفظ درجات التقييم القيادي بنجاح ✓');
  };

  const deleteHeadEvaluation = (id: string) => {
    const target = headEvaluations.find(e => e.id === id);
    setHeadEvaluations(prev => prev.filter(rec => rec.id !== id));
    addAuditLog('حذف تقييم قيادي', target?.headName || id, `تم حذف سجل التقييم القيادي بواسطة ${currentUser.fullName}`);
    showNotification('info', 'تم حذف سجل التقييم القيادي بنجاح');
    SupabaseService.deleteHeadEvaluation(id).catch(e => console.warn(e));
  };

  const updateHeadEvaluationRubric = (rubric: HeadEvaluationRubric) => {
    setHeadEvaluationRubric(rubric);
    addAuditLog('تحديث معايير تقييم رؤساء اللجان', rubric.title, `بواسطة ${currentUser.fullName}`);
    showNotification('success', 'تم تحديث معايير مصفوفة تقييم رؤساء اللجان بنجاح');
  };

  // Badge Management (High Leadership CRUD)
  const addBadge = (badgeData: Omit<BadgeItem, 'id'>) => {
    const newBadge: BadgeItem = {
      ...badgeData,
      id: `badge-${Date.now()}`
    };
    setBadges(prev => [...prev, newBadge]);
    const badgeName = newBadge.titleAr || newBadge.title;
    addAuditLog('إضافة شارة وسام جديدة', badgeName, `النقاط: ${newBadge.xpReward} XP`);
    showNotification('success', `تمت إضافة الوسام الجديد "${badgeName}" إلى كتالوج الأوسمة`);
    playSound('task');
  };

  const updateBadge = (id: string, updates: Partial<BadgeItem>) => {
    setBadges(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addAuditLog('تعديل شارة وسام', `ID: ${id}`, 'تم تعديل بيانات الشارة');
    showNotification('success', 'تم تحديث بيانات الوسام بنجاح');
    playSound('task');
  };

  const deleteBadge = (id: string) => {
    const targetBadge = badges.find(b => b.id === id);
    const badgeName = targetBadge?.titleAr || targetBadge?.title || id;
    setBadges(prev => prev.filter(b => b.id !== id));
    // Also remove from any members who had this badge
    setMembers(prev => prev.map(m => ({
      ...m,
      badges: (m.badges || []).filter(bId => bId !== id)
    })));
    addAuditLog('حذف شارة وسام', badgeName, 'تم حذف الشارة من الكتالوج العام وسحبها من كافة الأعضاء');
    showNotification('info', `تم حذف الوسام "${badgeName}" بنجاح`);
    playSound('task');
  };

  const grantBadgeToMember = (memberId: string, badgeId: string) => {
    const targetBadge = badges.find(b => b.id === badgeId);
    const targetMember = members.find(m => m.id === memberId);
    if (!targetBadge || !targetMember) return;

    if (targetMember.badges?.includes(badgeId)) {
      showNotification('warning', `الوسام "${targetBadge.titleAr}" ممنوح بالفعل للعضو.`);
      return;
    }

    const updatedBadges = [...(targetMember.badges || []), badgeId];
    updateMemberSelfProfile(memberId, { badges: updatedBadges });
    addAuditLog('منح وسام لعضو', `${targetMember.fullName}`, `تم منح وسام: ${targetBadge.titleAr}`);
    showNotification('success', `تم منح الوسام "${targetBadge.titleAr}" للعضو ${targetMember.fullName} بنجاح 🏅`);
    playSound('achievement');
  };

  const revokeBadgeFromMember = (memberId: string, badgeId: string) => {
    const targetBadge = badges.find(b => b.id === badgeId);
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const updatedBadges = (targetMember.badges || []).filter(id => id !== badgeId);
    updateMemberSelfProfile(memberId, { badges: updatedBadges });
    const badgeName = targetBadge?.titleAr || badgeId;
    addAuditLog('سحب وسام من عضو', `${targetMember.fullName}`, `تم سحب وسام: ${badgeName}`);
    showNotification('info', `تم حذف وسام "${badgeName}" من العضو ${targetMember.fullName}`);
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'uploadedAt'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('رفع مستند رسمي', newDoc.title, newDoc.committeeName);
    showNotification('success', `تم رفع وحفظ الوثيقة "${newDoc.title}" في مكتبة الوثائق بنجاح`);
    playSound('task');
    SupabaseService.upsertDocument(newDoc).catch(e => console.warn('Supabase document save error:', e));
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    let updatedDoc: DocumentItem | null = null;
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        updatedDoc = { ...d, ...updates };
        return updatedDoc;
      }
      return d;
    }));
    addAuditLog('تعديل مستند', `ID: ${id}`, 'تم تحديث بيانات الملف');
    showNotification('success', 'تم تحديث بيانات الوثيقة بنجاح');
    if (updatedDoc) {
      SupabaseService.upsertDocument(updatedDoc).catch(e => console.warn('Supabase document update error:', e));
    }
  };

  const deleteDocument = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog('حذف مستند', `ID: ${id}`, 'تم حذف المستند من الأرشيف');
    showNotification('info', `تم حذف الوثيقة "${docToDelete?.title || id}" من المكتبة`);
    SupabaseService.deleteDocument(id).catch(e => console.warn('Supabase document delete error:', e));
  };

  const manualRecordAttendance = (recordData: Partial<AttendanceRecord>) => {
    const targetMember = members.find(m => m.id === recordData.memberId);
    if (!targetMember) return;

    const newRec: AttendanceRecord = {
      id: `att-man-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.fullName,
      memberAvatar: targetMember.avatarUrl,
      committeeId: targetMember.currentCommitteeId,
      committeeName: targetMember.currentCommitteeName,
      eventId: recordData.eventId || 'event-general',
      eventName: recordData.eventName || 'تسجيل يدوي عام',
      date: recordData.date || new Date().toISOString().split('T')[0],
      checkInTime: recordData.checkInTime || '09:00 ص',
      checkOutTime: recordData.checkOutTime || '03:00 م',
      durationMinutes: 360,
      durationFormatted: '6 ساعات',
      status: 'Present',
      qrHashToken: `MANUAL_${Date.now()}`
    };

    setAttendanceRecords(prev => [newRec, ...prev]);
    addAuditLog('تسجيل حضور يدوي', targetMember.fullName, 'بواسطة مشرف النظام');
    playSound('task');
  };

  // Training Management (Full CRUD)
  const addTrainingCourse = (courseData: Omit<TrainingCourse, 'id' | 'enrolledMemberIds' | 'completedMemberIds'>) => {
    const newCourse: TrainingCourse = {
      ...courseData,
      id: `train-${Date.now()}`,
      enrolledMemberIds: [],
      completedMemberIds: []
    };
    setTrainings(prev => [newCourse, ...prev]);
    addAuditLog('إضافة دورة تدريبية جديدة', newCourse.title, `بواسطة ${currentUser.fullName}`);
    playSound('task');
  };

  const updateTrainingCourse = (id: string, updates: Partial<TrainingCourse>) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addAuditLog('تعديل دورة تدريبية', `ID: ${id}`, 'تم تحديث محتوى الدورة');
    playSound('task');
  };

  const deleteTrainingCourse = (id: string) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
    addAuditLog('حذف دورة تدريبية', `ID: ${id}`, 'تم حذف الدورة التدريبية');
    playSound('task');
  };

  const enrollTraining = (trainingId: string, memberId: string) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === trainingId && !t.enrolledMemberIds.includes(memberId)) {
        return { ...t, enrolledMemberIds: [...t.enrolledMemberIds, memberId] };
      }
      return t;
    }));
  };

  const completeTraining = (trainingId: string, memberId: string) => {
    setTrainings(prev => prev.map(t => {
      if (t.id === trainingId && !t.completedMemberIds.includes(memberId)) {
        return { ...t, completedMemberIds: [...t.completedMemberIds, memberId] };
      }
      return t;
    }));

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, points: m.points + 50 } : m));
    triggerGamificationCelebration('🎓 مبروك إتمام الدورة التدريبية!', 50);
  };

  // Announcements Management (Full CRUD)
  const createAnnouncement = (
    titleOrData: string | Partial<Announcement>, 
    content?: string, 
    targetType?: Announcement['targetType'], 
    targetCommitteeId?: string, 
    targetCommitteeName?: string, 
    isPinned?: boolean
  ) => {
    let newAnn: Announcement;

    if (typeof titleOrData === 'object') {
      newAnn = {
        id: `ann-${Date.now()}`,
        title: titleOrData.title || 'إعلان رسمي',
        content: titleOrData.content || '',
        authorName: currentUser.fullName,
        authorRole: currentUser.position,
        targetType: titleOrData.targetType || 'all',
        targetCommitteeId: titleOrData.targetCommitteeId,
        targetCommitteeName: titleOrData.targetCommitteeName,
        isPinned: !!titleOrData.isPinned,
        poll: titleOrData.poll,
        reactions: titleOrData.reactions || [],
        createdAt: 'الآن'
      };
    } else {
      newAnn = {
        id: `ann-${Date.now()}`,
        title: titleOrData || 'إعلان رسمي',
        content: content || '',
        authorName: currentUser.fullName,
        authorRole: currentUser.position,
        targetType: targetType || 'all',
        targetCommitteeId,
        targetCommitteeName,
        isPinned: !!isPinned,
        createdAt: 'الآن',
        reactions: []
      };
    }

    setAnnouncements(prev => [newAnn, ...prev]);
    SupabaseService.upsertAnnouncement(newAnn).catch(e => console.warn('Supabase upsertAnnouncement error:', e));

    // Send notification to all or target committee
    const notifTitle = newAnn.poll ? '📊 استطلاع رأي وتصويت جديد' : '📢 إعلان وتعميم إداري جديد';
    const notifMsg = `${newAnn.title} (${newAnn.authorName})`;
    const targetMembers = newAnn.targetType === 'committee' && newAnn.targetCommitteeId 
      ? members.filter(m => m.currentCommitteeId === newAnn.targetCommitteeId)
      : members;

    targetMembers.forEach(m => {
      if (m.id !== currentUser.id) {
        const notif: SystemNotification = {
          id: `notif-ann-${Date.now()}-${m.id}`,
          title: notifTitle,
          message: notifMsg,
          type: 'announcement',
          targetName: newAnn.targetType === 'committee' ? (newAnn.targetCommitteeName || 'أعضاء اللجنة') : 'كافة المتطوعين والإدارة',
          requiredAction: newAnn.poll ? 'المطلوب: المشاركة في الاستطلاع وإبداء الرأي' : 'المطلوب: الاطلاع على القرار والالتزام بالتعليمات',
          senderName: newAnn.authorName,
          badgeText: newAnn.targetType === 'committee' ? 'خاص باللجنة' : 'تعميم عام',
          read: false,
          createdAt: 'الآن',
          linkTab: 'announcements'
        };
        setNotifications(prev => [notif, ...prev]);
        SupabaseService.upsertNotification(notif).catch(e => console.warn('Supabase notif error:', e));
      }
    });

    sendSystemPushNotification({
      title: notifTitle,
      body: `${newAnn.title} (${newAnn.authorName})`,
      type: 'announcement'
    });

    playSound('announcement');
    addAuditLog('نشر إعلان رسمي', newAnn.title, newAnn.targetType);
  };

  // Vote on Poll in Announcement
  const voteOnPoll = (announcementId: string, optionId: string) => {
    let updatedAnnouncement: Announcement | null = null;
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId && ann.poll) {
        const existingVoteIndex = (ann.poll.votes || []).findIndex(v => v.memberId === currentUser.id);
        let updatedVotes = [...(ann.poll.votes || [])];

        const newVote = {
          memberId: currentUser.id,
          memberName: currentUser.fullName,
          memberVolunteerId: currentUser.volunteerId,
          committeeName: currentUser.currentCommitteeName,
          optionId,
          votedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().substring(0, 10)
        };

        if (existingVoteIndex >= 0) {
          updatedVotes[existingVoteIndex] = newVote;
        } else {
          updatedVotes.push(newVote);
        }

        const updatedOptions = ann.poll.options.map(opt => {
          const count = updatedVotes.filter(v => v.optionId === opt.id).length;
          return { ...opt, voteCount: count };
        });

        updatedAnnouncement = {
          ...ann,
          poll: {
            ...ann.poll,
            options: updatedOptions,
            votes: updatedVotes,
            totalVotes: updatedVotes.length
          }
        };
        return updatedAnnouncement;
      }
      return ann;
    }));

    if (updatedAnnouncement) {
      SupabaseService.upsertAnnouncement(updatedAnnouncement).catch(e => console.warn(e));
    }

    playSound('task');
    showNotification('success', 'تم تسجيل وتحديث تصويتك في الاستطلاع بنجاح ✓');
  };

  // React to Announcement with Emojis
  const reactToAnnouncement = (announcementId: string, emoji: string, label: string = 'تفاعل') => {
    let updatedAnnouncement: Announcement | null = null;
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId) {
        const reactions = ann.reactions || [];
        const existingIndex = reactions.findIndex(r => r.memberId === currentUser.id && r.emoji === emoji);
        let updatedReactions: AnnouncementReaction[];

        if (existingIndex >= 0) {
          // Toggle off
          updatedReactions = reactions.filter((_, i) => i !== existingIndex);
        } else {
          // Add or replace reaction
          updatedReactions = [
            ...reactions.filter(r => r.memberId !== currentUser.id),
            {
              emoji,
              label,
              memberId: currentUser.id,
              memberName: currentUser.fullName,
              memberVolunteerId: currentUser.volunteerId,
              committeeName: currentUser.currentCommitteeName,
              reactedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }

        updatedAnnouncement = {
          ...ann,
          reactions: updatedReactions
        };
        return updatedAnnouncement;
      }
      return ann;
    }));

    if (updatedAnnouncement) {
      SupabaseService.upsertAnnouncement(updatedAnnouncement).catch(e => console.warn(e));
    }
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    let updatedAnn: Announcement | null = null;
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        updatedAnn = { ...a, ...updates };
        return updatedAnn;
      }
      return a;
    }));
    addAuditLog('تعديل إعلان', `ID: ${id}`, 'تم تحديث نص الإعلان');
    playSound('task');
    if (updatedAnn) {
      SupabaseService.upsertAnnouncement(updatedAnn).catch(e => console.warn(e));
    }
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAuditLog('حذف إعلان', `ID: ${id}`, 'تم حذف الإعلان الرسمي');
    playSound('task');
    SupabaseService.deleteAnnouncement(id).catch(e => console.warn(e));
  };

  const updateCandidateStatus = (candId: string, status: RecruitmentCandidate['status'], score?: number, notes?: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candId) {
        return {
          ...c,
          status,
          interviewScore: score !== undefined ? score : c.interviewScore,
          interviewNotes: notes !== undefined ? notes : c.interviewNotes
        };
      }
      return c;
    }));
  };

  const convertCandidateToMember = (candId: string, committeeId: string) => {
    const cand = candidates.find(c => c.id === candId);
    const comm = committees.find(c => c.id === committeeId);
    if (!cand || !comm) return;

    addMember({
      fullName: cand.fullName,
      universityEmail: cand.email,
      college: cand.college,
      academicYear: cand.academicYear,
      whatsappNumber: cand.whatsapp,
      nationalId: cand.nationalId,
      currentCommitteeId: comm.id,
      currentCommitteeName: comm.name,
      position: 'عضو متطوع'
    });

    setCandidates(prev => prev.filter(c => c.id !== candId));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    SupabaseService.markNotificationAsRead(id).catch(e => console.warn(e));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    SupabaseService.markAllNotificationsAsRead().catch(e => console.warn(e));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    SupabaseService.deleteNotification(id).catch(e => console.warn(e));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    SupabaseService.clearAllNotifications().catch(e => console.warn(e));
  };

  const getAIRecommendationForTask = (requiredSkills: string[], committeeId?: string) => {
    let pool = members.filter(m => m.status === 'Active');
    if (committeeId) {
      pool = pool.filter(m => m.currentCommitteeId === committeeId);
    }

    const scored = pool.map(member => {
      let skillMatchTotal = 0;
      if (requiredSkills.length > 0) {
        requiredSkills.forEach(reqSkill => {
          const foundKey = Object.keys(member.skills).find(k => k.includes(reqSkill) || reqSkill.includes(k));
          if (foundKey) {
            skillMatchTotal += (member.skills[foundKey] / 5);
          } else {
            const matchesAspiration = member.learningAspirations?.some(asp => asp.includes(reqSkill) || reqSkill.includes(asp));
            const matchesHobby = member.hobbies?.some(hob => hob.includes(reqSkill) || reqSkill.includes(hob));
            skillMatchTotal += (matchesAspiration ? 0.7 : matchesHobby ? 0.6 : 0.35);
          }
        });
        skillMatchTotal = skillMatchTotal / requiredSkills.length;
      } else {
        skillMatchTotal = 0.8;
      }

      const workloadScore = member.workloadStatus === 'Underutilized' ? 1.0 : member.workloadStatus === 'Optimal' ? 0.85 : 0.4;
      const perfScore = member.performance.overallScore / 100;

      const finalMatch = Math.round(((skillMatchTotal * 0.5) + (perfScore * 0.3) + (workloadScore * 0.2)) * 100);
      let reason = `تطابق مهارات ممتاز (${Math.round(skillMatchTotal * 100)}%) وأداء (${member.performance.overallScore}%)`;

      return { member, matchScore: Math.min(99, Math.max(60, finalMatch)), reason };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  };

  const getHighRiskMembers = (): Member[] => {
    return members.filter(m => m.engagementRisk === 'High' || m.performance.attendanceRate < 70 || m.performance.overallScore < 70);
  };

  const getSuccessionCandidates = (committeeId?: string) => {
    let pool = members.filter(m => m.role === 'member' && m.status === 'Active');
    if (committeeId) {
      pool = pool.filter(m => m.currentCommitteeId === committeeId);
    }

    return pool
      .map(member => {
        const leadershipScore = Math.round(
          (member.performance.leadership * 0.4) + 
          (member.performance.overallScore * 0.3) + 
          (member.performance.commitment * 0.3)
        );
        const recommendedRole = leadershipScore >= 90 ? 'رئيس لجنة (Head) مرشح' : 'نائب رئيس لجنة (Vice)';
        return { member, leadershipScore, recommendedRole };
      })
      .sort((a, b) => b.leadershipScore - a.leadershipScore)
      .slice(0, 5);
  };

  const pendingMembers = members.filter(m => m.status === 'Pending' || m.status === 'Applicant');

  const loginWithEmail = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if blacklisted / banned in bannedList
    const inBlacklist = bannedList.find(b => b.email?.trim().toLowerCase() === cleanEmail);
    if (inBlacklist) {
      return {
        success: false,
        message: `تم حظر هذا الحساب نهائياً من استخدام منصة المتطوعين. سبب الحظر: ${inBlacklist.reason || 'مخالفة اللائحة التنظيمية وسلوكيات العمل التطوعي'}`,
        status: 'Banned' as MemberStatus
      };
    }

    const found = members.find(m => 
      m.universityEmail?.trim().toLowerCase() === cleanEmail || 
      m.fullName?.trim().toLowerCase() === cleanEmail
    );

    if (!found) {
      return {
        success: false,
        message: 'البريد الإلكتروني غير مسجل بالمنظومة، يرجى إنشاء حساب متطوع جديد'
      };
    }

    if (found.status === 'Banned') {
      return {
        success: false,
        message: `تم حظر هذا الحساب نهائياً من استخدام منصة المتطوعين. سبب الحظر: ${found.banReason || 'مخالفة اللائحة التنظيمية'}`,
        status: 'Banned' as MemberStatus,
        member: found
      };
    }

    if (found.status === 'Pending' || found.status === 'Applicant') {
      return {
        success: false,
        message: 'طلب عضويتك قيد المراجعة والاعتماد من قبل القيادة العليا، سيتم إشعارك فور الاعتماد.',
        status: 'Pending' as MemberStatus,
        member: found
      };
    }

    if (found.status === 'Inactive' || found.status === 'Archived') {
      return {
        success: false,
        message: 'هذا الحساب معطل أو مؤرشف حالياً، يرجى التواصل مع إدارة الاتحاد.',
        status: found.status,
        member: found
      };
    }

    if (password && found.password && found.password !== password) {
      return {
        success: false,
        message: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.'
      };
    }

    setCurrentUserId(found.id);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(true));
    localStorage.setItem(`${STORAGE_KEY}_AUTH_USER_ID`, found.id);
    playSound('normal');

    const todayDate = new Date().toISOString().split('T')[0];
    const lastWelcomeDate = localStorage.getItem(`${STORAGE_KEY}_LAST_WELCOME_DATE`);
    if (lastWelcomeDate !== todayDate) {
      showNotification('success', `مرحباً بعودتك يا ${found.fullName}! ✨`);
      localStorage.setItem(`${STORAGE_KEY}_LAST_WELCOME_DATE`, todayDate);
    }
    
    addAuditLog('تسجيل دخول', found.fullName, 'تسجيل دخول ناجح للمنصة');

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      status: found.status,
      member: found
    };
  };

  const registerVolunteer = (formData: {
    fullName: string;
    email: string;
    password?: string;
    college: string;
    academicYear: string;
    whatsapp: string;
    nationalId: string;
    birthDate: string;
    preferredCommitteeId: string;
    bio?: string;
    skills?: { [k: string]: number };
  }) => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanNatId = formData.nationalId ? formData.nationalId.trim() : '';

    // Check blacklist / banned
    const isBlacklisted = bannedList.some(b => 
      b.email.toLowerCase() === cleanEmail || 
      (cleanNatId && b.nationalId && b.nationalId.trim() === cleanNatId)
    );

    if (isBlacklisted) {
      return {
        success: false,
        message: 'عذراً، هذا البريد الإلكتروني أو الرقم القومي محظور نهائياً من التسجيل أو استخدام المنصة.'
      };
    }

    const existing = members.find(m => 
      m.universityEmail?.trim().toLowerCase() === cleanEmail ||
      (cleanNatId && m.nationalId === cleanNatId)
    );

    if (existing) {
      if (existing.status === 'Banned') {
        return {
          success: false,
          message: 'عذراً، هذا الحساب محظور نهائياً من استخدام المنصة لمخالفة اللائحة التنظيمية.',
          member: existing
        };
      }
      if (existing.status === 'Pending' || existing.status === 'Applicant') {
        return {
          success: false,
          message: 'يوجد طلب تسجيل معلق بالفعل بهذا البريد الإلكتروني أو الرقم القومي، بانتظار اعتماد القيادة العليا.',
          member: existing
        };
      }
      return {
        success: false,
        message: 'البريد الإلكتروني أو الرقم القومي مسجل بالفعل كعضو في الفريق. يرجى تسجيل الدخول مباشرة.',
        member: existing
      };
    }

    const prefComm = committees.find(c => c.id === formData.preferredCommitteeId) || committees[0];

    const birthData = getMemberExactBirthData({
      nationalId: cleanNatId,
      birthDate: formData.birthDate,
      age: 20
    });

    const newMember: Member = {
      id: `user-applicant-${Date.now()}`,
      volunteerId: 'PENDING',
      fullName: formData.fullName.trim(),
      universityEmail: cleanEmail,
      college: formData.college || 'جامعة الإسكندرية',
      academicYear: formData.academicYear || 'الفرقة الأولى',
      whatsappNumber: formData.whatsapp || '',
      birthDate: birthData.birthDate,
      age: birthData.currentAge,
      nationalId: cleanNatId || '30000000000000',
      currentCommitteeId: prefComm ? prefComm.id : 'comm-org',
      currentCommitteeName: prefComm ? prefComm.name : 'لجنة التنظيم',
      preferredCommitteeId: prefComm ? prefComm.id : 'comm-org',
      preferredCommitteeName: prefComm ? prefComm.name : 'لجنة التنظيم',
      position: 'متطوع جديد (قيد الاعتماد)',
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      password: formData.password || '123456',
      registrationDate: new Date().toISOString(),
      performance: {
        overallScore: 0,
        attendanceRate: 100,
        taskCompletionRate: 0,
        taskQuality: 0,
        commitment: 100,
        teamwork: 0,
        leadership: 0,
        evaluationsCount: 0
      },
      skills: formData.skills || { 'العمل الجماعي': 4, 'التواصل': 4 },
      activeWorkload: 0,
      workloadStatus: 'Underutilized',
      engagementRisk: 'Low',
      points: 0,
      level: 1,
      badges: [],
      committeeHistory: [],
      availability: 'Available',
      bio: formData.bio || 'متطوع طموح يسعى للمشاركة الفعالة في أنشطة اتحاد طلاب جامعة الإسكندرية.'
    };

    setMembers(prev => [newMember, ...prev]);
    SupabaseService.upsertMember(newMember).catch(e => console.warn('Supabase save error:', e));

    // Send High Priority Notification to Leadership
    const notif: SystemNotification = {
      id: `notif-reg-${Date.now()}`,
      title: '📝 طلب انضمام متطوع جديد بانتظار المراجعة',
      message: `سجل المتطوع "${formData.fullName}" (${formData.college}) رغبته في الانضمام لـ "${prefComm?.name}". يرجى مراجعة واعتماد الطلب.`,
      type: 'achievement',
      read: false,
      createdAt: 'الآن',
      linkTab: 'members'
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog(
      'طلب تسجيل متطوع جديد',
      `${formData.fullName} (${formData.email})`,
      `تسجيل طلب انضمام جديد للجنة ${prefComm?.name} بحالة Pending`
    );

    playSound('alert');
    showNotification('info', 'تم إرسال طلب انضمامك بنجاح وهو الآن بانتظار اعتماد وموافقة القيادة العليا ومستشار الفريق');

    return {
      success: true,
      message: 'تم إرسال طلب عضويتك بنجاح وبانتظار اعتماد الإدارة العليا',
      member: newMember
    };
  };

  const approveMemberRegistration = (
    memberId: string, 
    assignedCommitteeId: string, 
    customRole: Role = 'member',
    customPosition?: string
  ) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return { success: false, volunteerId: '' };

    const targetComm = committees.find(c => c.id === assignedCommitteeId) || committees[0];
    const newVolunteerId = generateCommitteeVolunteerId(targetComm.id, customRole, members);

    const positionTitle = customPosition?.trim() || getRoleOfficialTitle(customRole, targetComm.name);

    const updatedMemberData: Member = {
      ...targetMember,
      status: 'Active' as MemberStatus,
      volunteerId: newVolunteerId,
      currentCommitteeId: targetComm.id,
      currentCommitteeName: targetComm.name,
      position: positionTitle,
      role: customRole,
      points: 0,
      level: 1,
      performance: {
        attendanceRate: 0,
        taskCompletionRate: 0,
        taskQuality: 0,
        commitment: 0,
        teamwork: 0,
        leadership: 0,
        overallScore: 0,
        evaluationsCount: 0
      },
      badges: targetMember.badges || [],
      joinDate: new Date().toISOString().split('T')[0]
    };

    setMembers(prev => prev.map(m => m.id === memberId ? updatedMemberData : m));
    SupabaseService.upsertMember(updatedMemberData).catch(e => console.warn('Supabase approve save error:', e));

    // Update Committee member count
    setCommittees(prev => prev.map(c => {
      if (c.id === targetComm.id) {
        return { ...c, memberCount: c.memberCount + 1 };
      }
      return c;
    }));

    addAuditLog(
      'اعتماد وقبول طلب انضمام',
      `${targetMember.fullName} (كود: ${newVolunteerId})`,
      `تمت الموافقة الرسمية وتعيين العضو في ${targetComm.name} بدور ${customRole}`
    );

    playSound('announcement');
    triggerGamificationCelebration('🎉 تم تفعيل العضوية الرسمية بنجاح!', 100);
    showNotification('success', `تم قبول واعتماد المتطوع ${targetMember.fullName} ومنحه الكود التطوعي ${newVolunteerId}`);

    return { success: true, volunteerId: newVolunteerId };
  };

  const rejectMemberRegistration = (memberId: string, reason: string = 'عدم استيفاء شروط المرحلة الحالية') => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const updatedMember: Member = {
      ...targetMember,
      status: 'Inactive' as MemberStatus,
      rejectionReason: reason
    };

    setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
    SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase reject save error:', e));

    addAuditLog(
      'رفض طلب انضمام',
      targetMember.fullName,
      `تم رفض الطلب بواسطة رئيس الفريق. السبب: ${reason}`
    );

    showNotification('info', `تم رفض طلب انضمام ${targetMember.fullName}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUserId('');
    localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
    localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    showNotification('info', 'تم تسجيل الخروج بنجاح.');
  };

  const updateMemberSelfProfile = (
    memberId: string,
    profileData: {
      fullName?: string;
      nationalId?: string;
      birthDate?: string;
      age?: number;
      phone?: string;
      whatsappNumber?: string;
      college?: string;
      academicYear?: string;
      bloodType?: string;
      emergencyContact?: string;
      address?: string;
      avatarUrl?: string;
      bio?: string;
      hobbies?: string[];
      learningAspirations?: string[];
      certifiedSkills?: CertifiedSkillItem[];
      facebookUrl?: string;
      tiktokUrl?: string;
      instagramUrl?: string;
      linkedinUrl?: string;
      committeeHistory?: CommitteeHistoryItem[];
      points?: number;
      level?: number;
      badges?: string[];
      position?: string;
      role?: Role;
      currentCommitteeId?: string;
      currentCommitteeName?: string;
      volunteerId?: string;
      performance?: Partial<MemberPerformance>;
    }
  ) => {
    let updatedMember: Member | null = null;
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const rawNatId = profileData.nationalId !== undefined ? profileData.nationalId : m.nationalId;
        const rawBirthDate = profileData.birthDate !== undefined ? profileData.birthDate : m.birthDate;
        const bData = getMemberExactBirthData({
          nationalId: rawNatId,
          birthDate: rawBirthDate,
          age: profileData.age !== undefined ? profileData.age : m.age
        });

        const targetRole = profileData.role !== undefined ? profileData.role : m.role;
        const targetCommId = profileData.currentCommitteeId !== undefined ? profileData.currentCommitteeId : m.currentCommitteeId;
        const isLeadershipOrHead = isHighLeadershipRole(targetRole) || targetRole === 'head' || targetRole === 'vice_head' || targetCommId === 'comm-leadership';
        const finalPoints = isLeadershipOrHead ? 0 : (profileData.points !== undefined ? profileData.points : m.points);
        const finalLevel = isLeadershipOrHead ? 1 : (profileData.level !== undefined ? profileData.level : m.level);

        updatedMember = {
          ...m,
          ...profileData,
          birthDate: bData.birthDate,
          age: bData.currentAge,
          nationalId: rawNatId,
          phone: profileData.phone || m.phone || profileData.whatsappNumber || m.whatsappNumber,
          whatsappNumber: profileData.whatsappNumber || profileData.phone || m.whatsappNumber,
          points: finalPoints,
          level: finalLevel,
          badges: profileData.badges !== undefined ? profileData.badges : m.badges,
          position: profileData.position !== undefined ? profileData.position : m.position,
          role: targetRole,
          currentCommitteeId: targetCommId,
          currentCommitteeName: profileData.currentCommitteeName !== undefined ? profileData.currentCommitteeName : m.currentCommitteeName,
          volunteerId: profileData.volunteerId !== undefined ? profileData.volunteerId : m.volunteerId,
          performance: profileData.performance !== undefined 
            ? { ...m.performance, ...profileData.performance } 
            : m.performance,
          committeeHistory: profileData.committeeHistory !== undefined ? profileData.committeeHistory : m.committeeHistory,
          certifiedSkills: profileData.certifiedSkills !== undefined ? profileData.certifiedSkills : (m.certifiedSkills || [])
        };
        return updatedMember;
      }
      return m;
    }));

    addAuditLog('تحديث الملف الشخصي', `عضو: ${profileData.fullName || memberId}`, 'قام العضو بتحديث بياناته الشخصية ومسيرته التطوعية');
    showNotification('success', 'تم حفظ وتحديث بيانات ملفك الشخصي ومسيرتك التطوعية بنجاح ✓');
    playSound('task');

    if (updatedMember) {
      SupabaseService.upsertMember(updatedMember).catch(e => console.warn('Supabase profile update error:', e));
    }
  };

  const switchSeason = (seasonId: string) => {
    setActiveSeasonId(seasonId);
    addAuditLog('تبديل الموسم التشغيلي', `الموسم: ${seasonId}`, 'تم تغيير الموسم الفعال');
  };

  const switchPersona = (memberId: string) => {
    setCurrentUserId(memberId);
  };

  const isLiveCommandCenterActive = !!liveEvent;
  const canManageAll = isHighLeadership;
  const isHead = currentUser.role === 'head' || currentUser.role === 'vice_head';

  return (
    <AppContext.Provider
      value={{
        seasons,
        activeSeasonId,
        activeSeason,
        committees,
        members,
        currentUser,
        tasks,
        events,
        attendanceRecords,
        attendanceSessions,
        activeAttendanceSession,
        canCreateAttendanceSession,
        sosAlerts,
        evaluationTemplate,
        evaluationRubric,
        memberEvaluations,
        headEvaluations,
        headEvaluationRubric,
        trainings,
        badges,
        announcements,
        auditLogs,
        documents,
        candidates,
        permissions,
        notifications,
        notificationPermission,
        requestNotificationPermission,
        dispatchPushNotification,
        testPushNotification,
        complaints,
        soundSettings,
        branding,
        rolePermissions,
        activeTab,
        isLiveCommandCenterActive,
        liveEvent,
        teamHealthScore,

        isHighLeadership,
        canManageAll,
        isHead,
        isHighLeadershipMember,

        // Authentication & Approvals & Blacklist
        isAuthenticated,
        pendingMembers,
        loginWithEmail,
        registerVolunteer,
        approveMemberRegistration,
        rejectMemberRegistration,
        logout,
        banMember,
        unbanMember,
        filterOutMember,
        bannedList,
        isUserBanned,

        setActiveTab,
        switchSeason,
        switchPersona,
        addMember,
        importMembersBulk,
        updateMember,
        isVolunteerIdAvailable,
        changeVolunteerId,
        deleteMember,
        archiveMember,
        transferMemberCommittee,
        assignCommitteeHead,
        assignCommitteeViceHead,
        removeCommitteeHead,
        removeCommitteeViceHead,
        revealNationalId,
        createCommittee,
        updateCommittee,
        deleteCommittee,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        submitTask,
        setTaskStance,
        evaluateTask,
        calculateCommitteeHealth,
        createEvent,
        updateEvent,
        deleteEvent,
        respondToEventRSVP,
        sendEventDayReminder,
        attendancePointsConfig,
        updateAttendancePointsConfig,
        recordAttendance,
        recordAttendanceWithGPS,
        createAttendanceSession,
        closeAttendanceSession,
        submitDailyAttendanceEvaluation,
        deleteAttendanceRecord,
        manualRecordAttendance,
        createSOSAlert,
        acknowledgeSOS,
        resolveSOS,
        updateEvaluationTemplate,
        updateEvaluationRubric,
        submitMemberEvaluation,
        updateMemberEvaluation,
        deleteMemberEvaluation,
        evaluateHead,
        updateHeadEvaluation,
        deleteHeadEvaluation,
        updateHeadEvaluationRubric,
        addBadge,
        updateBadge,
        deleteBadge,
        grantBadgeToMember,
        revokeBadgeFromMember,
        addDocument,
        updateDocument,
        deleteDocument,
        addTrainingCourse,
        updateTrainingCourse,
        deleteTrainingCourse,
        enrollTraining,
        completeTraining,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        voteOnPoll,
        reactToAnnouncement,
        updateStamp,
        showNotification,
        updateCandidateStatus,
        convertCandidateToMember,
        addAuditLog,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        getAIRecommendationForTask,
        getHighRiskMembers,
        getSuccessionCandidates,
        triggerGamificationCelebration,
        celebrationData,

        updateLogo,
        updateBranding,
        updateTickerMessages,
        updateSoundSettings,
        playSound,
        createComplaint,
        updateComplaintStatus,
        rateComplaintResolution,
        getVisibleComplaintsForUser,
        updateRolePermissions,
        updateMemberSelfProfile,
        toggleTaskSubtask,
        setFontSizeMode,
        hasPermission,
        isSupabaseConnected,
        syncWithCloud,
        saveAllToCloud
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

