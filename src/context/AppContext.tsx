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
  BannedUserRecord
} from '../types';
import { 
  initialSeasons, initialCommittees, initialMembers, initialTasks, 
  initialEvents, initialAttendanceRecords, initialSOSAlerts, 
  initialEvaluationTemplate, initialTrainings, initialBadges, 
  initialAnnouncements, initialAuditLogs, initialDocuments, 
  initialCandidates, initialPermissions, initialNotifications,
  initialComplaints, initialSoundSettings, initialBrandingSettings,
  initialRolePermissionsMap, initialEvaluationRubric,
  initialHeadEvaluationRubric, initialHeadEvaluations
} from '../data/initialData';
import { playAppTone } from '../utils/soundEngine';
import { generateCommitteeVolunteerId } from '../utils/volunteerId';
import { isHighLeadershipRole, getRoleOfficialTitle } from '../utils/roleUtils';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

export const isHighLeadershipMember = (member?: Member | null): boolean => {
  if (!member) return false;
  return isHighLeadershipRole(member.role);
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
  deleteMember: (id: string, alsoBanEmail?: boolean, banReason?: string) => void;
  banMember: (id: string, reason: string) => void;
  unbanMember: (id: string) => void;
  filterOutMember: (id: string, reason?: string) => void;
  bannedList: BannedUserRecord[];
  isUserBanned: (emailOrNationalId: string) => boolean;
  archiveMember: (id: string, reason: string) => void;
  transferMemberCommittee: (memberId: string, newCommitteeId: string, reason: string) => void;
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
  recordAttendance: (memberId: string, eventId: string, actionType: 'check-in' | 'check-out') => { success: boolean; message: string };
  recordAttendanceWithGPS: (params: { 
    memberId: string; 
    eventId?: string; 
    sessionId?: string; 
    actionType: 'check-in' | 'check-out'; 
    gpsLocation?: GPSLocation;
    qrToken?: string;
  }) => { success: boolean; message: string; record?: AttendanceRecord };
  createAttendanceSession: (sessionData: Partial<AttendanceSession>) => AttendanceSession;
  closeAttendanceSession: (sessionId: string) => void;
  submitDailyAttendanceEvaluation: (recordId: string, evalData: {
    attendanceScore: number;
    participationScore: number;
    commitmentScore: number;
    bonusXP?: number;
    notes?: string;
  }) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  manualRecordAttendance: (recordData: Partial<AttendanceRecord>) => void;
  createSOSAlert: (alertData: Partial<SOSAlert>) => void;
  acknowledgeSOS: (alertId: string) => void;
  resolveSOS: (alertId: string) => void;
  updateEvaluationTemplate: (criteria: KPICriterion[]) => void;
  updateEvaluationRubric: (rubric: EvaluationRubric) => void;
  submitMemberEvaluation: (evalRecord: Omit<MemberEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'>) => void;
  evaluateHead: (evalRecord: Omit<HeadEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'>) => void;
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
    facebookUrl?: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
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
  approveMemberRegistration: (memberId: string, assignedCommitteeId: string, customRole?: Role) => { success: boolean; volunteerId: string };
  rejectMemberRegistration: (memberId: string, reason?: string) => void;
  logout: () => void;
  setFontSizeMode: (mode: 'compact' | 'normal' | 'large') => void;
  hasPermission: (permCode: string) => boolean;
  isSupabaseConnected: boolean;
  syncWithCloud: () => Promise<void>;
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
    return saved ? JSON.parse(saved) : initialCommittees;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MEMBERS`);
    return saved ? JSON.parse(saved) : initialMembers;
  });

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

  const syncWithCloud = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const cloudData = await SupabaseService.loadAllData();
      if (cloudData) {
        if (cloudData.members && cloudData.members.length > 0) setMembers(cloudData.members);
        if (cloudData.committees && cloudData.committees.length > 0) setCommittees(cloudData.committees);
        if (cloudData.seasons && cloudData.seasons.length > 0) setSeasons(cloudData.seasons);
        if (cloudData.tasks) setTasks(cloudData.tasks);
        if (cloudData.events) setEvents(cloudData.events);
        if (cloudData.attendanceRecords) setAttendanceRecords(cloudData.attendanceRecords);
        if (cloudData.attendanceSessions) setAttendanceSessions(cloudData.attendanceSessions);
        if (cloudData.memberEvaluations) setMemberEvaluations(cloudData.memberEvaluations);
        if (cloudData.headEvaluations) setHeadEvaluations(cloudData.headEvaluations);
        if (cloudData.complaints) setComplaints(cloudData.complaints);
        if (cloudData.documents) setDocuments(cloudData.documents);
        if (cloudData.announcements) setAnnouncements(cloudData.announcements);
        if (cloudData.auditLogs) setAuditLogs(cloudData.auditLogs);
        if (cloudData.notifications) setNotifications(cloudData.notifications);
        if (cloudData.bannedUsers && cloudData.bannedUsers.length > 0) setBannedList(cloudData.bannedUsers);
        setIsSupabaseConnected(true);
      }
    } catch (e) {
      console.warn('Supabase sync note:', e);
    }
  };

  useEffect(() => {
    syncWithCloud();
  }, []);

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

  // Dynamic Mathematical Health Score Computation (100% Real & Dynamic)
  const calculateCommitteeHealth = (commId: string): number => {
    const comm = committees.find(c => c.id === commId);
    if (!comm) return 0;

    const commMembers = members.filter(m => m.currentCommitteeId === commId && m.status === 'Active');
    const commTasks = tasks.filter(t => t.committeeId === commId);
    const commComplaints = complaints.filter(c => c.senderCommitteeId === commId);

    const totalCommMembers = commMembers.length;
    const totalCommTasks = commTasks.length;
    const completedCommTasks = commTasks.filter(t => t.status === 'Approved').length;

    // If there are no members and no tasks in this committee, health is 0
    if (totalCommMembers === 0 && totalCommTasks === 0) {
      return 0;
    }

    const attendance = totalCommMembers > 0
      ? Math.round(commMembers.reduce((acc, m) => acc + (m.performance?.attendanceRate || 0), 0) / totalCommMembers)
      : 0;

    const tasksRate = totalCommTasks > 0
      ? Math.round((completedCommTasks / totalCommTasks) * 100)
      : (totalCommMembers > 0 ? 0 : 0);

    const performance = totalCommMembers > 0
      ? Math.round(commMembers.reduce((acc, m) => acc + (m.performance?.overallScore || 0), 0) / totalCommMembers)
      : 0;

    const resolvedComplaints = commComplaints.filter(c => c.status === 'Resolved').length;
    const totalComplaints = commComplaints.length;
    const satisfaction = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

    // Weighted dynamic composite score
    const healthScore = Math.min(100, Math.max(0, Math.round(
      0.35 * attendance + 0.35 * tasksRate + 0.15 * performance + 0.15 * satisfaction
    )));

    return healthScore;
  };

  // Team Health Score: Average of active committees with members/tasks, or 0 if empty
  const activeCommitteesWithData = committees.filter(c => 
    members.some(m => m.currentCommitteeId === c.id && m.status === 'Active') || 
    tasks.some(t => t.committeeId === c.id)
  );

  const teamHealthScore = activeCommitteesWithData.length > 0
    ? Math.round(activeCommitteesWithData.reduce((acc, c) => acc + calculateCommitteeHealth(c.id), 0) / activeCommitteesWithData.length)
    : 0;

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

    // Native Browser / Mobile Web Notification API
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: message,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: newNotif.id
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch {
      // Ignore background notification restrictions
    }
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
    playSound('alert');
    addAuditLog('رفع شكوى / مقترح جديد', newComp.title, `التصنيف: ${newComp.category} - الأهمية: ${newComp.urgency}`);
  };

  const updateComplaintStatus = (complaintId: string, newStatus: ComplaintStatus, notes?: string, internalNotes?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: newStatus,
          responseNotes: notes || c.responseNotes,
          internalNotes: internalNotes || c.internalNotes,
          respondedBy: currentUser.fullName,
          respondedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          resolvedAt: newStatus === 'Resolved' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.resolvedAt
        };
      }
      return c;
    }));

    addAuditLog('تحديث حالة شكوى', `ID: ${complaintId}`, `تم تغيير الحالة إلى [${newStatus}] بواسطة ${currentUser.fullName}`);
    playSound('task');
  };

  const rateComplaintResolution = (complaintId: string, rating: number) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          satisfactionRating: rating
        };
      }
      return c;
    }));
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

    const newMember: Member = {
      id: newId,
      volunteerId,
      fullName: memberData.fullName || 'متطوع جديد',
      universityEmail: memberData.universityEmail || `vol.${Date.now()}@alexu.edu.eg`,
      college: memberData.college || 'جامعة الإسكندرية',
      academicYear: memberData.academicYear || 'الفرقة الأولى',
      whatsappNumber: memberData.whatsappNumber || '+201000000000',
      birthDate: memberData.birthDate || '2005-01-01',
      age: memberData.age || 21,
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
        overallScore: 85,
        attendanceRate: 100,
        taskCompletionRate: 85,
        taskQuality: 4.5,
        commitment: 90,
        teamwork: 90,
        leadership: 80,
        evaluationsCount: 1
      },
      skills: memberData.skills || { 'العمل الجماعي': 4, 'التواصل': 4 },
      hobbies: memberData.hobbies || ['القراءة', 'التطوع'],
      learningAspirations: memberData.learningAspirations || ['إدارة الفرق'],
      activeWorkload: 0,
      workloadStatus: 'Underutilized',
      engagementRisk: 'Low',
      points: 100,
      level: 1,
      badges: ['badge-reliable'],
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
    setCommittees(prev => prev.map(c => c.id === newMember.currentCommitteeId ? { ...c, memberCount: c.memberCount + 1 } : c));
    addAuditLog('إضافة متطوع جديد', `العضو: ${newMember.fullName} (${newMember.volunteerId})`, `تمت إضافة المتطوع وإسناده إلى ${newMember.currentCommitteeName}`);
  };

  // Bulk Import Members
  const importMembersBulk = (newMembers: Partial<Member>[]) => {
    if (newMembers.length === 0) return;

    const fullMembers: Member[] = newMembers.map((m, idx) => {
      const commId = m.currentCommitteeId || 'comm-org';
      const role = m.role || 'member';
      const volId = m.volunteerId || generateCommitteeVolunteerId(commId, role, members);

      return {
        id: m.id || `user-imp-${Date.now()}-${idx}`,
        volunteerId: volId,
        fullName: m.fullName || (m as any).name || 'متطوع جديد',
        universityEmail: m.universityEmail || (m as any).email || `vol.${Date.now() + idx}@alexu.edu.eg`,
        college: m.college || (m as any).faculty || 'جامعة الإسكندرية',
        academicYear: m.academicYear || 'الفرقة الثالثة',
        whatsappNumber: m.whatsappNumber || (m as any).phone || '+201000000000',
        birthDate: '2004-01-01',
        age: 21,
        nationalId: '30400000000000',
        currentCommitteeId: commId,
        currentCommitteeName: m.currentCommitteeName || 'لجنة التنظيم',
        position: m.position || 'عضو متطوع',
        role,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        avatarUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        performance: {
          overallScore: 85,
          attendanceRate: 100,
          taskCompletionRate: 85,
          taskQuality: 4.5,
          commitment: 90,
          teamwork: 90,
          leadership: 80,
          evaluationsCount: 1
        },
        skills: { 'التنظيم': 4, 'العمل الجماعي': 4 },
        hobbies: ['العمل الجماعي'],
        learningAspirations: ['إدارة الفعاليات'],
        activeWorkload: 0,
        workloadStatus: 'Optimal',
        engagementRisk: 'Low',
        points: 100,
        level: 1,
        badges: ['badge-reliable'],
        committeeHistory: [],
        availability: 'Available',
        bio: 'عضو بفريق متطوعي اتحاد طلاب جامعة الإسكندرية'
      };
    });

    setMembers(prev => [...fullMembers, ...prev]);

    // Update committee member counts
    setCommittees(prev => prev.map(c => {
      const addedCount = fullMembers.filter(m => m.currentCommitteeId === c.id).length;
      return { ...c, memberCount: c.memberCount + addedCount };
    }));

    addAuditLog('استيراد أعضاء جماعي (Excel)', `عدد: ${fullMembers.length}`, `تمت إضافة الأعضاء وتوليد الأكواد التطوعية`);
    playSound('announcement');
    triggerGamificationCelebration(`📥 تم استيراد ${fullMembers.length} عضو بنجاح!`, 100);
  };

  // Update Member
  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    addAuditLog('تعديل بيانات عضو', `ID: ${id}`, 'تم تحديث ملف العضو');
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

  // Delete Member (with automatic permanent ban & access revocation)
  const deleteMember = (id: string, alsoBanEmail: boolean = true, banReason: string = '') => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    const reason = banReason.trim() || 'تم حذف واستبعاد العضو نهائياً مع حظر الدخول';
    const bannedRecord: BannedUserRecord = {
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
      return [bannedRecord, ...filtered];
    });

    setMembers(prev => prev.filter(m => m.id !== id));
    setCommittees(prev => prev.map(c => c.id === target.currentCommitteeId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c));

    if (currentUserId === id) {
      setIsAuthenticated(false);
      setCurrentUserId('');
      localStorage.setItem(`${STORAGE_KEY}_AUTH_STATUS`, JSON.stringify(false));
      localStorage.removeItem(`${STORAGE_KEY}_AUTH_USER_ID`);
    }

    addAuditLog('حذف واستبعاد عضو من الفريق', target.fullName, `تم حذف العضو وحظره من الدخول بواسطة ${currentUser.fullName}. السبب: ${reason}`);
    playSound('task');
    SupabaseService.deleteMember(id).catch(e => console.warn('Supabase delete member error:', e));
    SupabaseService.upsertBannedUser(bannedRecord).catch(e => console.warn('Supabase ban record error:', e));
  };

  // Self Profile update for regular members & leadership
  const updateMemberSelfProfile = (memberId: string, profileData: { 
    fullName?: string;
    nationalId?: string;
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
    facebookUrl?: string;
    tiktokUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
  }) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated = { ...m, ...profileData };
        SupabaseService.upsertMember(updated).catch(e => console.warn('Supabase profile sync error:', e));
        return updated;
      }
      return m;
    }));
    addAuditLog('تعديل الملف الشخصي', `عضو ID: ${memberId}`, 'قام العضو بتحديث وتوثيق بياناته الشخصية المعتمدة');
    showNotification('success', 'تم حفظ وتحديث بياناتك الشخصية بنجاح وتحديث السجل العام للفريق ✓');
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

  // Transfer Member Committee
  const transferMemberCommittee = (memberId: string, newCommitteeId: string, reason: string) => {
    const targetComm = committees.find(c => c.id === newCommitteeId);
    if (!targetComm) return;

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const oldCommName = m.currentCommitteeName;
        const newVolId = generateCommitteeVolunteerId(newCommitteeId, m.role, prev);
        return {
          ...m,
          currentCommitteeId: newCommitteeId,
          currentCommitteeName: targetComm.name,
          volunteerId: newVolId,
          committeeHistory: [
            ...m.committeeHistory,
            {
              id: `hist-trans-${Date.now()}`,
              committeeName: oldCommName,
              role: m.position,
              season: activeSeason.name,
              startDate: m.joinDate,
              endDate: new Date().toISOString().split('T')[0],
              reason: `نقل إلى ${targetComm.name}: ${reason}`,
              changedBy: currentUser.fullName
            }
          ]
        };
      }
      return m;
    }));

    addAuditLog('نقل عضو بين اللجان', `عضو ID: ${memberId}`, `تم النقل إلى ${targetComm.name} - السبب: ${reason}`);
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
  };

  const updateCommittee = (id: string, updates: Partial<Committee>) => {
    setCommittees(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addAuditLog('تعديل بيانات لجنة', `ID: ${id}`, `تم تحديث الأهداف أو القيادة`);
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

    newTask.assignedToMemberIds.forEach(mId => {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}-${mId}`,
        title: '📋 تم إسناد مهمة جديدة إليك',
        message: `${newTask.title} (الموعد النهائي: ${newTask.deadline})`,
        type: 'task',
        read: false,
        createdAt: 'الآن',
        linkTab: 'tasks'
      };
      setNotifications(prev => [notif, ...prev]);
    });

    playSound('task');
    addAuditLog('إنشاء وإسناد مهمة جديدة', newTask.title, `تم إسنادها إلى: ${newTask.assignedToMemberNames.join('، ')}`);
  };

  // Update Task (Full Edit)
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    addAuditLog('تعديل مهمة', `ID: ${taskId}`, `تم تعديل بيانات المهمة بواسطة ${currentUser.fullName}`);
    playSound('task');
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog('حذف مهمة', task?.title || taskId, `تم حذف المهمة بواسطة ${currentUser.fullName}`);
    playSound('task');
  };

  // Update Task Status
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completionPercentage: newStatus === 'Approved' ? 100 : newStatus === 'Submitted' ? 90 : t.completionPercentage
        };
      }
      return t;
    }));
    addAuditLog('تحديث حالة مهمة', `ID: ${taskId}`, `تم تغيير الحالة إلى [${newStatus}]`);
  };

  // Submit Task (Report + Attachments)
  const submitTask = (taskId: string, notes: string, attachments?: TaskAttachment[], fileUrls?: string[]) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
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
      }
      return t;
    }));

    playSound('task');
    addAuditLog('تسليم مخرجات مهمة', task.title, `قام ${currentUser.fullName} برفع ملفات ومخرجات التسليم`);
  };

  // Set Task Stance (Commitment or Excusal with Reason)
  const setTaskStance = (taskId: string, stance: 'Committed' | 'Excused', excuseReason?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const timeStr = new Date().toISOString().substring(0, 10);
        const updatedStatus: TaskStatus = stance === 'Excused' ? 'Cancelled' : (t.status === 'Assigned' ? 'In Progress' : t.status);
        return {
          ...t,
          status: updatedStatus,
          stance,
          excuseReason: stance === 'Excused' ? (excuseReason || 'اعتذار عن أداء المهمة') : undefined,
          excusedAt: stance === 'Excused' ? timeStr : undefined,
          excusedByMemberId: currentUser.id,
          excusedByMemberName: currentUser.fullName
        };
      }
      return t;
    }));

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
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        const completedCount = updatedSubtasks.filter(s => s.completed).length;
        const total = updatedSubtasks.length;
        const calcPercent = total > 0 ? Math.round((completedCount / total) * 100) : t.completionPercentage;
        return {
          ...t,
          subtasks: updatedSubtasks,
          completionPercentage: t.status === 'Approved' ? 100 : calcPercent
        };
      }
      return t;
    }));
    playSound('task');
  };

  // Evaluate Task (With custom awardedPoints and maxPoints)
  const evaluateTask = (taskId: string, evalData: TaskEvaluation, awardedPoints?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const pointsAwarded = (awardedPoints !== undefined && awardedPoints !== null) 
      ? Number(awardedPoints) 
      : (task.maxPoints || task.xpReward || 25);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
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
      }
      return t;
    }));

    setMembers(prev => prev.map(m => {
      if (task.assignedToMemberIds.includes(m.id)) {
        const newPoints = m.points + pointsAwarded;
        return {
          ...m,
          points: newPoints,
          level: Math.floor(newPoints / 150) + 1,
          performance: {
            ...m.performance,
            taskQuality: Number(((m.performance.taskQuality * m.performance.evaluationsCount + evalData.qualityScore) / (m.performance.evaluationsCount + 1)).toFixed(1)),
            evaluationsCount: m.performance.evaluationsCount + 1
          }
        };
      }
      return m;
    }));

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
      committeeQuotas: eventData.committeeQuotas || {},
      status: eventData.status || 'Planned',
      expectedMembersCount: eventData.expectedMembersCount || 20,
      actualAttendanceCount: 0,
      tasksCount: 0,
      sosAlertsCount: 0,
      seasonId: activeSeasonId,
      liveDashboardActive: false
    };

    setEvents(prev => [newEvent, ...prev]);
    addAuditLog('إنشاء فعالية جديدة', newEvent.name, `الموقع: ${newEvent.location} - الموعد: ${newEvent.date}`);
    playSound('task');
  };

  // Update Event
  const updateEvent = (id: string, updates: Partial<EventEntity>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog('تعديل فعالية', `ID: ${id}`, `تم تحديث بيانات الفعالية أو حالتها`);
  };

  // Delete Event
  const deleteEvent = (id: string) => {
    const evt = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('حذف فعالية', evt?.name || id, `تم حذف الفعالية بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم حذف الفعالية "${evt?.name || ''}" بنجاح`);
  };

  // Delete Committee
  const deleteCommittee = (id: string) => {
    const comm = committees.find(c => c.id === id);
    setCommittees(prev => prev.filter(c => c.id !== id));
    addAuditLog('حذف لجنة', comm?.name || id, `تم حذف اللجنة بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم حذف اللجنة ${comm?.name || ''} بنجاح`);
  };

  // Create Attendance Session (Head / VP / Super Admin / Advisor)
  const createAttendanceSession = (sessionData: Partial<AttendanceSession>): AttendanceSession => {
    const targetComm = sessionData.committeeId === 'all' 
      ? { name: 'جميع اللجان' } 
      : committees.find(c => c.id === sessionData.committeeId);

    const newSession: AttendanceSession = {
      id: `session-${Date.now()}`,
      title: sessionData.title || 'جلسة حضور ميدانية جديدة',
      committeeId: sessionData.committeeId || 'all',
      committeeName: sessionData.committeeName || (targetComm?.name || 'جميع اللجان'),
      createdByMemberId: currentUser.id,
      createdByMemberName: currentUser.fullName,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString().substring(0, 10),
      requireGPS: sessionData.requireGPS !== false,
      sessionType: sessionData.sessionType || 'members',
      qrToken: `ALEXU_QR_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now()}`,
      isActive: true,
      notes: sessionData.notes || ''
    };

    setAttendanceSessions(prev => [newSession, ...prev.map(s => ({ ...s, isActive: false }))]);
    playSound('task');
    addAuditLog('إنشاء جلسة حضور QR', newSession.title, `اللجنة: ${newSession.committeeName} [${newSession.sessionType === 'heads' ? 'رؤساء اللجان' : 'المتطوعين'}] - بواسطة ${currentUser.fullName}`);
    showNotification('success', `تم إنشاء جلسة الحضور بنجاح: "${newSession.title}"`);
    return newSession;
  };

  // Close Attendance Session
  const closeAttendanceSession = (sessionId: string) => {
    setAttendanceSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false } : s));
    addAuditLog('إغلاق جلسة حضور QR', `ID: ${sessionId}`, 'تم إنهاء الجلسة وإيقاف استقبال المسح');
    showNotification('info', 'تم إغلاق جلسة الحضور');
  };

  // Record Attendance with Real GPS Location
  const recordAttendanceWithGPS = (params: { 
    memberId: string; 
    eventId?: string; 
    sessionId?: string; 
    actionType: 'check-in' | 'check-out'; 
    gpsLocation?: GPSLocation;
    qrToken?: string;
  }) => {
    const targetMember = members.find(m => m.id === params.memberId);
    if (!targetMember) return { success: false, message: 'بيانات المتطوع غير موجودة' };

    const targetEvent = events.find(e => e.id === params.eventId) || events[0];
    const session = attendanceSessions.find(s => s.id === params.sessionId) || activeAttendanceSession;

    const existing = attendanceRecords.find(a => 
      a.memberId === params.memberId && 
      (params.sessionId ? a.sessionId === params.sessionId : a.eventId === targetEvent?.id)
    );

    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (params.actionType === 'check-in') {
      if (existing) {
        return { success: false, message: `عفواً يا ${targetMember.fullName.split(' ')[0]}، لقد قمت بتسجيل الحضور مسبقاً في هذه الجلسة!` };
      }

      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        memberId: targetMember.id,
        memberName: targetMember.fullName,
        memberAvatar: targetMember.avatarUrl,
        memberVolunteerId: targetMember.volunteerId,
        committeeId: targetMember.currentCommitteeId,
        committeeName: targetMember.currentCommitteeName,
        eventId: targetEvent?.id || 'event-live',
        eventName: session?.title || targetEvent?.name || 'جلسة عمل ميدانية',
        sessionId: session?.id,
        sessionTitle: session?.title,
        date: new Date().toISOString().split('T')[0],
        checkInTime: timeStr,
        durationMinutes: 300,
        durationFormatted: '5 ساعات',
        status: 'Present',
        qrHashToken: params.qrToken || `ALEXU_QR_${Date.now()}`,
        gpsLocation: params.gpsLocation
      };

      setAttendanceRecords(prev => [newRec, ...prev]);

      // Award XP to member (+25 XP for presence)
      setMembers(prev => prev.map(m => {
        if (m.id === targetMember.id) {
          const updatedXP = m.points + 25;
          return {
            ...m,
            points: updatedXP,
            level: Math.floor(updatedXP / 150) + 1,
            performance: {
              ...m.performance,
              attendanceRate: Math.min(100, m.performance.attendanceRate + 1)
            }
          };
        }
        return m;
      }));

      playSound('task');
      triggerGamificationCelebration('📍 تم تسجيل الحضور وتأكيد موقع الـ GPS!', 25);
      addAuditLog('تسجيل حضور QR مع GPS', targetMember.fullName, `الجلسة: ${session?.title || targetEvent?.name} - الإحداثيات: ${params.gpsLocation ? `${params.gpsLocation.lat.toFixed(4)}, ${params.gpsLocation.lng.toFixed(4)}` : 'تم تحديد الموقع'}`);

      return {
        success: true,
        message: `تم تسجيل حضورك بنجاح يا ${targetMember.fullName.split(' ')[0]}! (${timeStr})`,
        record: newRec
      };
    } else {
      if (!existing) {
        return { success: false, message: 'لم يتم العثور على تسجيل حضور سابق لتسجيل الانصراف' };
      }

      setAttendanceRecords(prev => prev.map(a => a.id === existing.id ? {
        ...a,
        checkOutTime: timeStr,
        gpsLocation: params.gpsLocation || a.gpsLocation
      } : a));

      playSound('task');
      addAuditLog('تسجيل انصراف QR مع GPS', targetMember.fullName, `الجلسة: ${session?.title || targetEvent?.name}`);
      return {
        success: true,
        message: `شكراً لعطائك المتميز يا ${targetMember.fullName.split(' ')[0]}! تم تسجيل الانصراف.`
      };
    }
  };

  // Submit Daily Session Evaluation (Head / Leadership)
  const submitDailyAttendanceEvaluation = (recordId: string, evalData: {
    attendanceScore: number;
    participationScore: number;
    commitmentScore: number;
    bonusXP?: number;
    notes?: string;
  }) => {
    const totalDaily = (Number(evalData.attendanceScore) || 0) + (Number(evalData.participationScore) || 0) + (Number(evalData.commitmentScore) || 0);
    const awardedXP = (Number(evalData.bonusXP) || 0) + (totalDaily >= 25 ? 30 : totalDaily >= 20 ? 20 : 10);

    let targetMemberId = '';

    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        targetMemberId = rec.memberId;
        return {
          ...rec,
          dailyEvaluation: {
            attendanceScore: evalData.attendanceScore,
            participationScore: evalData.participationScore,
            commitmentScore: evalData.commitmentScore,
            totalDailyScore: totalDaily,
            bonusXP: awardedXP,
            notes: evalData.notes || '',
            evaluatedBy: currentUser.fullName,
            evaluatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        };
      }
      return rec;
    }));

    if (targetMemberId) {
      setMembers(prev => prev.map(m => {
        if (m.id === targetMemberId) {
          const newXP = m.points + awardedXP;
          return {
            ...m,
            points: newXP,
            level: Math.floor(newXP / 150) + 1,
            performance: {
              ...m.performance,
              overallScore: Math.min(100, Math.round((m.performance.overallScore + totalDaily * 3.3) / 2))
            }
          };
        }
        return m;
      }));
    }

    playSound('task');
    addAuditLog('تسجيل تقييم اليوم الميداني', `Record ID: ${recordId}`, `الدرجة: ${totalDaily}/30 - XP: +${awardedXP}`);
    showNotification('success', `تم حفظ تقييم اليوم للمتطوع وإضافة +${awardedXP} XP بنجاح!`);
  };

  // Delete Attendance Record
  const deleteAttendanceRecord = (recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    addAuditLog('حذف سجل حضور', `ID: ${recordId}`, `تم الحذف بواسطة ${currentUser.fullName}`);
    showNotification('info', 'تم حذف سجل الحضور بنجاح');
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

    setSosAlerts(prev => [newAlert, ...prev]);

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
    playSound('alert');
    addAuditLog('إطلاق بلاغ طوارئ SOS', newAlert.alertType, newAlert.location);
  };

  const acknowledgeSOS = (alertId: string) => {
    setSosAlerts(prev => prev.map(s => s.id === alertId ? {
      ...s,
      status: 'Acknowledged',
      acknowledgedBy: currentUser.fullName,
      acknowledgedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    } : s));
    addAuditLog('تأكيد بلاغ طوارئ', `ID: ${alertId}`, `بواسطة ${currentUser.fullName}`);
  };

  const resolveSOS = (alertId: string) => {
    setSosAlerts(prev => prev.map(s => s.id === alertId ? {
      ...s,
      status: 'Resolved',
      resolvedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    } : s));
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

  const submitMemberEvaluation = (evalData: Omit<MemberEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'>) => {
    const totalScore = Object.values(evalData.scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / evalData.maxTotalScore) * 100);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const record: MemberEvaluationRecord = {
      ...evalData,
      id: `eval-rec-${Date.now()}`,
      totalScore,
      percentage,
      evaluatedAt: now
    };

    setMemberEvaluations(prev => [record, ...prev]);

    setMembers(prev => prev.map(m => {
      if (m.id === evalData.memberId) {
        const prevCount = m.performance.evaluationsCount || 1;
        const newOverall = Math.round(((m.performance.overallScore * prevCount) + percentage) / (prevCount + 1));
        return {
          ...m,
          performance: {
            ...m.performance,
            overallScore: newOverall,
            evaluationsCount: prevCount + 1
          }
        };
      }
      return m;
    }));

    const notif: SystemNotification = {
      id: `notif-eval-${Date.now()}`,
      title: '🎯 تقييم أداء جديد',
      message: `تم اعتماد تقييمك بنتيجة ${totalScore}/${evalData.maxTotalScore} (${percentage}%)`,
      type: 'eval',
      read: false,
      createdAt: 'الآن',
      linkTab: 'evaluations'
    };
    setNotifications(prev => [notif, ...prev]);

    playSound('task');
    addAuditLog('تقييم متطوع شامل', evalData.memberName, `النتيجة: ${percentage}%`);
  };

  // Evaluate Head (High Leadership evaluation for Committee Heads and Vice Heads)
  const evaluateHead = (evalData: Omit<HeadEvaluationRecord, 'id' | 'evaluatedAt' | 'percentage' | 'totalScore'>) => {
    const totalScore = Object.values(evalData.scores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / evalData.maxTotalScore) * 100);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const record: HeadEvaluationRecord = {
      ...evalData,
      id: `head-eval-${Date.now()}`,
      totalScore,
      percentage,
      evaluatedAt: now
    };

    setHeadEvaluations(prev => [record, ...prev]);

    // Update Head's leadership performance metrics
    setMembers(prev => prev.map(m => {
      if (m.id === evalData.headId) {
        const prevCount = m.performance.evaluationsCount || 1;
        const newOverall = Math.round(((m.performance.overallScore * prevCount) + percentage) / (prevCount + 1));
        const newLeadership = Math.round(((m.performance.leadership * prevCount) + percentage) / (prevCount + 1));
        return {
          ...m,
          performance: {
            ...m.performance,
            overallScore: newOverall,
            leadership: newLeadership,
            evaluationsCount: prevCount + 1
          }
        };
      }
      return m;
    }));

    const notif: SystemNotification = {
      id: `notif-head-eval-${Date.now()}`,
      title: '👑 تقييم أداء قيادي جديد من الإدارة العليا',
      message: `تم اعتماد تقييمك القيادي لـ (${evalData.committeeName}) بنتيجة ${totalScore}/${evalData.maxTotalScore} (${percentage}%)`,
      type: 'eval',
      read: false,
      createdAt: 'الآن',
      linkTab: 'evaluations'
    };
    setNotifications(prev => [notif, ...prev]);

    playSound('task');
    addAuditLog('تقييم أداء رئيس/نائب لجنة', evalData.headName, `النتيجة: ${percentage}% - المقيم: ${currentUser.fullName}`);
    showNotification('success', `تم حفظ واعتماد تقييم الأداء القيادي لـ "${evalData.headName}" بنجاح (${percentage}%)`);
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
    addAuditLog('حذف شارة وسام', badgeName, 'تم حذف الشارة من الكتالوج');
    showNotification('info', `تم حذف الوسام "${badgeName}"`);
    playSound('task');
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
          read: false,
          createdAt: 'الآن',
          linkTab: 'announcements'
        };
        setNotifications(prev => [notif, ...prev]);
      }
    });

    playSound('announcement');
    addAuditLog('نشر إعلان رسمي', newAnn.title, newAnn.targetType);
  };

  // Vote on Poll in Announcement
  const voteOnPoll = (announcementId: string, optionId: string) => {
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

        return {
          ...ann,
          poll: {
            ...ann.poll,
            options: updatedOptions,
            votes: updatedVotes,
            totalVotes: updatedVotes.length
          }
        };
      }
      return ann;
    }));

    playSound('task');
    showNotification('success', 'تم تسجيل وتحديث تصويتك في الاستطلاع بنجاح ✓');
  };

  // React to Announcement with Emojis
  const reactToAnnouncement = (announcementId: string, emoji: string, label: string = 'تفاعل') => {
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

        return {
          ...ann,
          reactions: updatedReactions
        };
      }
      return ann;
    }));
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addAuditLog('تعديل إعلان', `ID: ${id}`, 'تم تحديث نص الإعلان');
    playSound('task');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAuditLog('حذف إعلان', `ID: ${id}`, 'تم حذف الإعلان الرسمي');
    playSound('task');
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
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
    showNotification('success', `مرحباً بعودتك يا ${found.fullName}!`);
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

    const newMember: Member = {
      id: `user-applicant-${Date.now()}`,
      volunteerId: 'PENDING',
      fullName: formData.fullName.trim(),
      universityEmail: cleanEmail,
      college: formData.college || 'جامعة الإسكندرية',
      academicYear: formData.academicYear || 'الفرقة الأولى',
      whatsappNumber: formData.whatsapp || '',
      birthDate: formData.birthDate || '2005-01-01',
      age: 20,
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
        overallScore: 80,
        attendanceRate: 100,
        taskCompletionRate: 80,
        taskQuality: 4.0,
        commitment: 85,
        teamwork: 85,
        leadership: 75,
        evaluationsCount: 0
      },
      skills: formData.skills || { 'العمل الجماعي': 4, 'التواصل': 4 },
      activeWorkload: 0,
      workloadStatus: 'Underutilized',
      engagementRisk: 'Low',
      points: 50,
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

  const approveMemberRegistration = (memberId: string, assignedCommitteeId: string, customRole: Role = 'member') => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return { success: false, volunteerId: '' };

    const targetComm = committees.find(c => c.id === assignedCommitteeId) || committees[0];
    const newVolunteerId = generateCommitteeVolunteerId(targetComm.id, customRole, members);

    const positionTitle = getRoleOfficialTitle(customRole, targetComm.name);

    const updatedMemberData: Member = {
      ...targetMember,
      status: 'Active' as MemberStatus,
      volunteerId: newVolunteerId,
      currentCommitteeId: targetComm.id,
      currentCommitteeName: targetComm.name,
      position: positionTitle,
      role: customRole,
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

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'Inactive' as MemberStatus,
          rejectionReason: reason
        };
      }
      return m;
    }));

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
        deleteMember,
        archiveMember,
        transferMemberCommittee,
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
        evaluateHead,
        updateHeadEvaluationRubric,
        addBadge,
        updateBadge,
        deleteBadge,
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
        syncWithCloud
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

