export type Role = 
  | 'super_admin' 
  | 'vice_president' 
  | 'advisor' 
  | 'general_coordinator'
  | 'operations_manager'
  | 'quality_officer'
  | 'head' 
  | 'vice_head' 
  | 'hr_admin' 
  | 'event_manager' 
  | 'member';

export type PermissionScope = 'all' | 'own_committee' | 'assigned_only';

export interface Permission {
  code: string;
  name: string;
  category: 'members' | 'tasks' | 'events' | 'attendance' | 'evaluations' | 'reports' | 'settings' | 'sos' | 'documents';
  scope: PermissionScope;
  enabled: boolean;
}

export type MemberStatus = 'Applicant' | 'Pending' | 'Active' | 'On Leave' | 'Inactive' | 'Alumni' | 'Archived' | 'Banned';

export interface BannedUserRecord {
  id: string;
  email: string;
  fullName: string;
  nationalId?: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}

export interface CommitteeHistoryItem {
  id: string;
  committeeName: string;
  role: string;
  season: string;
  startDate: string;
  endDate: string;
  reason: string;
  changedBy: string;
}

export interface MemberPerformance {
  overallScore: number;
  attendanceRate: number;
  taskCompletionRate: number;
  taskQuality: number;
  commitment: number;
  teamwork: number;
  leadership: number;
  evaluationsCount: number;
}

export interface Member {
  id: string;
  volunteerId: string; // الرقم التطوعي الفريد (e.g. ALX-VOL-1001)
  fullName: string;
  universityEmail: string;
  college: string;
  academicYear: string;
  whatsappNumber: string;
  phone?: string;
  bloodType?: string;
  emergencyContact?: string;
  address?: string;
  birthDate: string;
  age: number;
  nationalId: string;
  currentCommitteeId: string;
  currentCommitteeName: string;
  position: string;
  role: Role;
  joinDate: string;
  seasonId?: string;
  status: MemberStatus;
  avatarUrl: string;
  performance: MemberPerformance;
  skills: { [skillName: string]: number }; // scale 1-5
  activeWorkload: number;
  workloadStatus: 'Underutilized' | 'Optimal' | 'Overloaded';
  engagementRisk: 'Low' | 'Medium' | 'High';
  points: number;
  level: number;
  badges: string[]; // Badge IDs
  committeeHistory: CommitteeHistoryItem[];
  availability: 'Available' | 'Busy' | 'Unavailable';
  bio?: string;
  hobbies?: string[];
  learningAspirations?: string[];
  certifiedSkills?: CertifiedSkillItem[];
  facebookUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  onboardingCompleted?: boolean;
  password?: string;
  registrationDate?: string;
  rejectionReason?: string;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  preferredCommitteeId?: string;
  preferredCommitteeName?: string;
}

export interface CertifiedSkillItem {
  id: string;
  skillName: string; // اسم المهارة
  provider: string; // المكان أو الجهة المانحة للشهادة
  issueDate: string; // تاريخ الحصول عليها (أو العام)
  credentialUrl?: string; // رابط أو كود الشهادة
  notes?: string;
}

export interface Committee {
  id: string;
  name: string;
  code: string;
  description: string;
  responsibilities: string[];
  headId?: string;
  headName?: string;
  headIds?: string[];
  headNames?: string[];
  coHeadIds?: string[];
  coHeadNames?: string[];
  viceId?: string;
  viceName?: string;
  viceIds?: string[];
  viceNames?: string[];
  memberCount: number;
  activeTasksCount: number;
  completedTasksCount: number;
  attendanceRate: number;
  performanceScore: number;
  healthScore: number; // 0-100
  seasonId: string;
  color: string;
  icon: string;
}

export type TaskStatus = 
  | 'Draft' 
  | 'Assigned' 
  | 'Accepted' 
  | 'In Progress' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'Overdue' 
  | 'Cancelled';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface TaskAttachment {
  id?: string;
  name: string;
  url: string;
  type: string;
  size?: string;
  extension?: string;
  uploadedAt?: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskDeliverableLink {
  title: string;
  url: string;
}

export interface TaskEvaluation {
  qualityScore: number; // 1-5
  accuracyScore: number; // 1-5
  commitmentScore: number; // 1-5
  notes: string;
  feedback?: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface TaskSubmission {
  submittedAt: string;
  notes: string;
  fileUrls?: string[];
  attachments?: TaskAttachment[];
  links?: TaskDeliverableLink[];
  feedbackNotes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  committeeId: string;
  committeeName: string;
  assignedToMemberIds: string[];
  assignedToMemberNames: string[];
  createdByMemberId: string;
  createdByMemberName: string;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  attachments: TaskAttachment[];
  subtasks?: TaskSubtask[];
  deliverableLinks?: TaskDeliverableLink[];
  voiceNoteUrl?: string;
  voiceDuration?: number;
  submission?: TaskSubmission;
  evaluation?: TaskEvaluation;
  requiredSkills: string[];
  eventId?: string;
  eventName?: string;
  completionPercentage: number;
  xpReward: number;
  maxPoints?: number;
  awardedPoints?: number;
  gradedBy?: string;
  gradedByName?: string;
  gradedAt?: string;
  feedback?: string;
  createdAt: string;
  stance?: 'Committed' | 'Excused' | 'Pending';
  excuseReason?: string;
  excusedAt?: string;
  excusedByMemberId?: string;
  excusedByMemberName?: string;
}

export type EventStatus = 
  | 'Draft' 
  | 'Planned' 
  | 'Upcoming' 
  | 'Live' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Archived';

export interface EventRSVP {
  memberId: string;
  memberName: string;
  memberVolunteerId?: string;
  committeeId: string;
  committeeName: string;
  role: Role;
  status: 'Attending' | 'Apologized';
  apologyReason?: string;
  expectedArrivalTime?: string;
  registeredAt: string;
}

export interface EventCommitteeQuota {
  committeeId: string;
  committeeName: string;
  required: number;
  assigned?: number;
  present?: number;
  mode?: 'all' | 'custom' | 'excluded';
}

export interface AttendancePointsConfig {
  onTimePoints: number; // e.g. 30 (حضور في الموعد)
  minorDelayThresholdMinutes: number; // e.g. 15 (حد التأخير الخفيف)
  minorDelayPoints: number; // e.g. 20 (تأخير حتى ربع ساعة)
  majorDelayPoints: number; // e.g. 10 (تأخير كبير بدون عذر)
  excusedAbsencePoints: number; // e.g. 0 (غياب بعذر مقبول)
  unexcusedAbsencePenalty: number; // e.g. -15 (خصم غياب بدون عذر)
}

export interface EventEntity {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  eventManagerId: string;
  eventManagerName: string;
  targetAudience?: 'all' | 'heads_leadership' | 'members_only';
  selectedCommitteeIds?: string[];
  committeeQuotas: { [committeeId: string]: EventCommitteeQuota };
  rsvps?: { [memberId: string]: EventRSVP };
  status: EventStatus;
  expectedMembersCount: number;
  actualAttendanceCount: number;
  tasksCount: number;
  sosAlertsCount: number;
  seasonId: string;
  liveDashboardActive: boolean;
}

export interface GPSLocation {
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  accuracy?: number;
}

export interface DailySessionEvaluation {
  attendanceScore?: number; // 1-10
  disciplineScore?: number; // 1-10
  participationScore: number; // 1-10
  commitmentScore?: number; // 1-10
  taskExecutionScore?: number; // 1-10
  totalDailyScore?: number; // sum
  overallDailyScore?: number; // 1-10 or total
  bonusXP?: number;
  bonusPoints?: number;
  notes?: string;
  evaluatedBy?: string;
  evaluatorName?: string;
  evaluatedAt: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  committeeId: string; // 'all' or specific committee id
  committeeName: string;
  createdByMemberId: string;
  createdByMemberName: string;
  createdByRole: Role;
  createdAt: string;
  expiresAt?: string;
  requireGPS: boolean;
  qrToken: string;
  isActive: boolean;
  notes?: string;
  sessionType?: 'members' | 'heads';
  eventId?: string;
  eventName?: string;
  eventDate?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberVolunteerId?: string;
  committeeId: string;
  committeeName: string;
  eventId: string;
  eventName: string;
  sessionId?: string;
  sessionTitle?: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes: number;
  durationFormatted: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  qrHashToken: string;
  gpsLocation?: GPSLocation;
  dailyEvaluation?: DailySessionEvaluation;
}

export type SOSType = 'Crowd Emergency' | 'Technical' | 'Guest' | 'Medical' | 'Security';
export type SOSStatus = 'Open' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Closed';

export interface SOSAlert {
  id: string;
  eventId: string;
  eventName: string;
  alertType: SOSType;
  location: string;
  reporterId: string;
  reporterName: string;
  reportedAt: string;
  description: string;
  status: SOSStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface KPICriterion {
  key: string;
  label: string;
  weight: number; // e.g. 25 (%)
  description: string;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  seasonId: string;
  criteria: KPICriterion[];
  isDefault: boolean;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'Communication' | 'Leadership' | 'Technical' | 'Event Management' | 'Media';
  instructor: string;
  date: string;
  duration: string;
  description: string;
  enrolledMemberIds: string[];
  completedMemberIds: string[];
  materialsUrl?: string;
  icon: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  category: string;
  criteria: string;
  xpReward: number;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollVote {
  memberId: string;
  memberName: string;
  memberVolunteerId?: string;
  committeeName: string;
  optionId: string;
  votedAt: string;
}

export interface AnnouncementPoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  votes: PollVote[];
  expiresAt?: string;
  isActive: boolean;
}

export interface AnnouncementReaction {
  emoji: string;
  label: string;
  memberId: string;
  memberName: string;
  memberVolunteerId?: string;
  committeeName: string;
  reactedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  targetType: 'all' | 'committee' | 'members';
  targetCommitteeId?: string;
  targetCommitteeName?: string;
  isPinned: boolean;
  voiceNoteUrl?: string;
  voiceDuration?: number;
  createdAt: string;
  poll?: AnnouncementPoll;
  reactions?: AnnouncementReaction[];
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  targetEntity: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  maxPoints: number; // e.g. 25
  description: string;
}

export interface EvaluationRubric {
  id: string;
  title: string;
  description: string;
  criteria: EvaluationCriterion[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface MemberEvaluationRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberVolunteerId: string;
  committeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: Role;
  evaluationDate?: string; // تاريخ ويوم التقييم المحدد (YYYY-MM-DD)
  scores: { [criterionId: string]: number }; // points earned per criterion
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  feedback: string;
  evaluatedAt: string;
}

export interface HeadEvaluationRecord {
  id: string;
  headId: string;
  headName: string;
  headVolunteerId: string;
  headPosition?: string;
  committeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: Role;
  evaluationDate?: string; // تاريخ ويوم التقييم المحدد (YYYY-MM-DD)
  scores: { [criterionId: string]: number };
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  leadershipRating?: number; // 1-5 stars
  feedback: string;
  actionItems?: string;
  evaluatedAt: string;
}

export interface HeadEvaluationRubric {
  id: string;
  title: string;
  description: string;
  criteria: EvaluationCriterion[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  committeeId: string;
  committeeName: string;
  category: 'Rules' | 'Event Plans' | 'Templates' | 'Training' | 'Reports';
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  fileType: string;
  fileName?: string;
  fileUrl?: string;
  pdfBase64?: string;
  description?: string;
}

export interface RecruitmentCandidate {
  id: string;
  fullName: string;
  email: string;
  college: string;
  academicYear: string;
  whatsapp: string;
  nationalId: string;
  preferredCommittees: string[];
  appliedDate: string;
  status: 'Application' | 'Screening' | 'Interview' | 'Accepted' | 'Rejected' | 'Onboarding';
  interviewScore?: number;
  interviewNotes?: string;
  onboardingProgress: number; // 0-100%
}

export interface Season {
  id: string;
  name: string; // e.g. "الموسم الحالي"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  totalMembers: number;
  totalEvents: number;
  totalTasks: number;
  archived: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'sos' | 'achievement' | 'eval' | 'announcement' | 'complaint';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export type ComplaintCategory = 
  | 'administrative' // شكوى إدارية
  | 'workload'       // ضغط وتوزيع المهام
  | 'interpersonal'  // خلافات وسلوك داخل اللجنة
  | 'suggestion'     // اقتراح تطوير
  | 'evaluation'     // تظلم من تقييم
  | 'confidential';  // شكوى سرية خاصة

export type ComplaintStatus = 'New' | 'Under Review' | 'In Investigation' | 'Resolved' | 'Rejected';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency?: 'Low' | 'Medium' | 'High' | 'Emergency';
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCommitteeId: string;
  senderCommitteeName: string;
  senderRole: Role;
  isAnonymous: boolean;
  status: ComplaintStatus;
  targetRecipients: ('head' | 'hr' | 'super_admin')[];
  responseNotes?: string;
  internalNotes?: string;
  respondedBy?: string;
  respondedAt?: string;
  satisfactionRating?: number; // 1-5
  createdAt: string;
  resolvedAt?: string;
}

export interface AppSoundSettings {
  taskSound: string;
  alertSound: string;
  announcementSound?: string;
  customNormalSound?: string;
  customTaskSound?: string;
  customAlertSound?: string;
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

export interface AppBrandingSettings {
  logoUrl: string;
  stampUrl?: string;
  appTitle: string;
  subtitle: string;
  tickerMessages: string[];
  tickerActive: boolean;
  tickerSpeed: number; // in seconds
  fontSizeMode: 'compact' | 'normal' | 'large';
}

export type RolePermissionsMap = {
  [role in Role]?: { [permCode: string]: boolean };
};

