import * as XLSX from 'xlsx';
import { 
  AttendanceRecord, Member, Complaint, MemberEvaluationRecord, 
  HeadEvaluationRecord, Task, AnnouncementPoll, EventEntity, EventRSVP, AttendancePointsConfig,
  AttendanceSession, AuditLogItem
} from '../types';
import { getRoleShortLabel, isHighLeadershipRole } from './roleUtils';

/**
 * Universal Excel (.xlsx) & CSV Exporter with SheetJS
 * Every data point is strictly placed into its own individual column cell.
 */
export const downloadExcelWorkbook = (aoaData: any[][], fileName: string, sheetName: string = 'البيانات') => {
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    
    // Set Right-to-Left (RTL) for Arabic display
    if (!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ RTL: true });

    // Auto-fit column widths
    if (aoaData.length > 0) {
      const colWidths = aoaData[0].map((_, colIdx) => {
        let maxLen = 14;
        aoaData.forEach(row => {
          const val = row[colIdx] != null ? String(row[colIdx]) : '';
          if (val.length > maxLen) maxLen = Math.min(val.length + 4, 45);
        });
        return { wch: maxLen };
      });
      ws['!cols'] = colWidths;
    }

    const cleanSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '').substring(0, 30) || 'البيانات';
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

    const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(wb, cleanFileName);
  } catch (err) {
    console.warn('XLSX export fallback to CSV:', err);
    // CSV fallback with UTF-8 BOM
    const csv = aoaData.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadCsvFile(csv, fileName.replace('.xlsx', '.csv'));
  }
};

/**
 * CSV Fallback Helper with UTF-8 BOM
 */
export const downloadCsvFile = (csvContent: string, fileName: string) => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 1. Export Members Master Sheet to Excel (.xlsx)
 * Every field has its own separate cell.
 */
export const exportMembersToExcel = (members: Member[], customTitle?: string, roleFilter?: string) => {
  let filtered = members;
  if (roleFilter === 'members_only') {
    filtered = members.filter(m => m.role === 'member');
  } else if (roleFilter === 'heads_only') {
    filtered = members.filter(m => m.role === 'head' || m.role === 'vice_head' || m.position?.includes('رئيس') || m.position?.includes('هيد') || m.position?.includes('نائب'));
  }

  const headers = [
    'الرقم التطوعي الفريد',
    'الاسم الكامل',
    'الرقم القومي',
    'البريد الجامعي المعتمد',
    'رقم الهاتف الأساسي',
    'رقم الواتساب',
    'الكلية / المعهد',
    'الفرقة الدراسية',
    'اللجنة التخصصية',
    'المسمى التنظيمي',
    'الدور الإداري',
    'حالة الحساب',
    'تاريخ الانضمام',
    'فصيلة الدم',
    'هاتف الطوارئ',
    'محل الإقامة / العنوان',
    'نقاط التطوع (XP)',
    'المستوى (Level)',
    'التقييم الشامل (%)',
    'نسبة الحضور (%)',
    'معدل إنجاز المهام (%)',
    'الهوايات والمواهب',
    'تطلعات التعلم والتطوير'
  ];

  const rows = filtered.map(m => {
    const isLeadershipOrHead = isHighLeadershipRole(m.role) || m.currentCommitteeId === 'comm-leadership' || m.role === 'head' || m.role === 'vice_head';
    const cleanPoints = isLeadershipOrHead ? '—' : (m.points || 0);
    const cleanLevel = isLeadershipOrHead ? '—' : (m.level || 1);
    const cleanOverall = isLeadershipOrHead ? '—' : (m.performance?.evaluationsCount && m.performance.evaluationsCount > 0 ? `${m.performance.overallScore}%` : '0%');

    return [
      m.volunteerId || m.id,
      m.fullName,
      m.nationalId || '—',
      m.universityEmail,
      m.phone || m.whatsappNumber || '—',
      m.whatsappNumber || m.phone || '—',
      m.college,
      m.academicYear,
      m.currentCommitteeName,
      m.position,
      getRoleShortLabel(m.role, m.currentCommitteeName),
      m.status === 'Active' ? 'نشط ومفعل' : m.status === 'Pending' ? 'قيد المراجعة' : m.status === 'Banned' ? 'محظور ⛔' : m.status,
      m.joinDate,
      m.bloodType || '—',
      m.emergencyContact || '—',
      m.address || '—',
      cleanPoints,
      cleanLevel,
      cleanOverall,
      `${m.performance?.attendanceRate || 0}%`,
      `${m.performance?.taskCompletionRate || 0}%`,
      m.hobbies && m.hobbies.length > 0 ? m.hobbies.join(' • ') : '—',
      m.learningAspirations && m.learningAspirations.length > 0 ? m.learningAspirations.join(' • ') : '—'
    ];
  });

  const aoaData = [headers, ...rows];
  const title = customTitle || (roleFilter === 'heads_only' ? 'سجل_قادة_ورؤساء_اللجان' : 'شيت_قاعدة_بيانات_أعضاء_الفريق_الشامل');
  const fileName = `${title}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'سجل الأعضاء');
};

/**
 * 1.1 Master Full Volunteer Profile with Linked Evaluations & History Excel Export
 * يجمع كل بيانات المتطوع الشخصية والأكاديمية والرقم القومي مع سجل كل التقييمات عبر الفعاليات والمهام
 */
export const exportComprehensiveVolunteersMasterExcel = (
  members: Member[],
  memberEvaluations: MemberEvaluationRecord[] = [],
  headEvaluations: HeadEvaluationRecord[] = [],
  attendanceRecords: AttendanceRecord[] = [],
  tasks: Task[] = []
) => {
  const headers = [
    'الرقم التطوعي الفريد',
    'الاسم الكامل',
    'الرقم القومي (14 رقم)',
    'البريد الإلكتروني المعتمد',
    'رقم الواتساب',
    'رقم الهاتف البديل',
    'الكلية / المعهد',
    'الفرقة الدراسية',
    'اللجنة التخصصية الحالية',
    'المسمى التنظيمي',
    'المستوى والدور الإداري',
    'حالة العضوية',
    'تاريخ الانضمام',
    'تاريخ الميلاد',
    'العمر',
    'فصيلة الدم',
    'هاتف الطوارئ',
    'محل الإقامة',
    'نقاط التطوع (XP)',
    'المستوى (Level)',
    'التقييم الشامل (%)',
    'نسبة الحضور (%)',
    'نسبة إنجاز المهام (%)',
    'جودة المهام (/5)',
    'الالتزام والانضباط (%)',
    'العمل الجماعي (%)',
    'المهارات القيادية (%)',
    'إجمالي عدد التقييمات المسجلة',
    'تفاصيل وسجل التقييمات عبر الفعاليات (تواريخ ودرجات)',
    'ملاحظات وتوجيهات المقيمين',
    'إجمالي الفعاليات الميدانية المحضورة',
    'إجمالي الساعات الميدانية الفعلية',
    'المهام المسندة الإجمالية',
    'المهام المعتمدة والمكتملة',
    'الأوسمة والبادجات الحاصل عليها',
    'المهارات المعتمدة',
    'الهوايات والاهتمامات',
    'تطلعات التعلم والتطوير',
    'رابط فيسبوك',
    'رابط لينكد إن',
    'رابط إنستغرام',
    'رابط تيك توك'
  ];

  const rows = members.map(m => {
    // 1. Gather all member evaluations
    const userMemberEvals = memberEvaluations.filter(e => e.memberId === m.id || (e.memberVolunteerId && e.memberVolunteerId === m.volunteerId));
    const userHeadEvals = headEvaluations.filter(e => e.headId === m.id || (e.headVolunteerId && e.headVolunteerId === m.volunteerId));
    
    const evalsSummary = [...userMemberEvals.map(e => `[${e.evaluationDate || e.evaluatedAt?.slice(0, 10) || 'تاريخ'}] ${e.percentage}% (${e.evaluatorName || 'المقيم'})`),
      ...userHeadEvals.map(h => `[${h.evaluationDate || h.evaluatedAt?.slice(0, 10) || 'قيادي'}] ${h.percentage}% (${h.evaluatorName || 'إدارة'})`)
    ].join(' | ') || 'لا توجد تقييمات مسجلة بعد';

    const feedbacks = [...userMemberEvals.map(e => e.feedback).filter(Boolean), ...userHeadEvals.map(h => h.feedback).filter(Boolean)].join(' • ') || '—';

    // 2. Gather attendance history
    const userAttendance = attendanceRecords.filter(a => a.memberId === m.id || (a.memberVolunteerId && a.memberVolunteerId === m.volunteerId));
    const presentAtts = userAttendance.filter(a => a.status === 'Present' || a.status === 'Late');
    const totalFieldHours = (presentAtts.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / 60).toFixed(1);

    // 3. Gather tasks history
    const userTasks = tasks.filter(t => t.assignedToMemberIds?.includes(m.id));
    const approvedTasks = userTasks.filter(t => t.status === 'Approved');

    // 4. Badges & skills
    const badgesText = m.badges && m.badges.length > 0 ? m.badges.join(', ') : '—';
    const skillsText = m.skills ? Object.entries(m.skills).map(([k, v]) => `${k} (${v}/5)`).join(' • ') : '—';

    const isLeadershipOrHead = isHighLeadershipRole(m.role) || m.currentCommitteeId === 'comm-leadership' || m.role === 'head' || m.role === 'vice_head';
    const cleanPoints = isLeadershipOrHead ? '—' : (m.points || 0);
    const cleanLevel = isLeadershipOrHead ? '—' : (m.level || 1);
    const cleanOverall = isLeadershipOrHead ? '—' : (m.performance?.evaluationsCount && m.performance.evaluationsCount > 0 ? `${m.performance.overallScore}%` : '0%');

    return [
      m.volunteerId || m.id,
      m.fullName,
      m.nationalId || '—',
      m.universityEmail,
      m.whatsappNumber || m.phone || '—',
      m.phone || m.whatsappNumber || '—',
      m.college,
      m.academicYear,
      m.currentCommitteeName,
      m.position,
      getRoleShortLabel(m.role, m.currentCommitteeName),
      m.status === 'Active' ? 'نشط ومفعل' : m.status === 'Pending' ? 'قيد المراجعة' : m.status === 'Banned' ? 'محظور ⛔' : m.status,
      m.joinDate,
      m.birthDate || '—',
      m.age || '—',
      m.bloodType || '—',
      m.emergencyContact || '—',
      m.address || '—',
      cleanPoints,
      cleanLevel,
      cleanOverall,
      `${m.performance?.attendanceRate || 0}%`,
      `${m.performance?.taskCompletionRate || 0}%`,
      m.performance?.taskQuality ? `${m.performance.taskQuality}/5` : '—',
      `${m.performance?.commitment || 0}%`,
      `${m.performance?.teamwork || 0}%`,
      `${m.performance?.leadership || 0}%`,
      userMemberEvals.length + userHeadEvals.length,
      evalsSummary,
      feedbacks,
      presentAtts.length,
      `${totalFieldHours} ساعة`,
      userTasks.length,
      approvedTasks.length,
      badgesText,
      skillsText,
      m.hobbies && m.hobbies.length > 0 ? m.hobbies.join(' • ') : '—',
      m.learningAspirations && m.learningAspirations.length > 0 ? m.learningAspirations.join(' • ') : '—',
      m.facebookUrl || '—',
      m.linkedinUrl || '—',
      m.instagramUrl || '—',
      m.tiktokUrl || '—'
    ];
  });

  const aoaData = [
    ['قاعدة البيانات المركزية الشاملة للمتطوعين وسجل التقييمات والأداء الميداني'],
    [`اتحاد طلاب جامعة الإسكندرية • تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`],
    [`إجمالي المتطوعين المسجلين: ${members.length} متطوع | إجمالي التقييمات المربوطة: ${memberEvaluations.length + headEvaluations.length} تقييم`],
    [],
    headers,
    ...rows
  ];

  const fileName = `سجل_المتطوعين_والتقييمات_الشامل_${new Date().toISOString().slice(0, 10)}`;
  downloadExcelWorkbook(aoaData, fileName, 'السجل الشامل للمتطوعين والتقييمات');
};

/**
 * 2. Export Attendance & Check-in / Check-out Records to Excel (.xlsx) with 4-Criteria Rubric
 */
export const exportAttendanceToExcel = (records: AttendanceRecord[], customTitle?: string, members: Member[] = []) => {
  const headers = [
    'الرقم القومي (14 رقم)',
    'الرقم التطوعي للمتطوع',
    'اسم المتطوع',
    'الكلية والفرقة',
    'رقم الواتساب',
    'اللجنة التابع لها',
    'المسمى والدور التنظيمي',
    'اسم الفعالية / جلسة الحضور',
    'التاريخ',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'إجمالي الساعات الميدانية',
    'حالة الحضور',
    'الموقع الجغرافي الحقيقي (GPS)',
    'دقة الموقع (متر)',
    'الالتزام والحضور (25)',
    'جودة الأداء وإتقان المهام (35)',
    'العمل الجماعي والتواصل (25)',
    'المبادرة والشغف (15)',
    'الدرجة الإجمالية اليومية (100)',
    'النسبة المئوية (%)',
    'التقدير العام (Grade)',
    'نقاط التميز (Bonus XP)',
    'ملاحظات المقيّم',
    'اسم المقيّم',
    'تاريخ الاعتماد'
  ];

  const rows = records.map(record => {
    const mem = members.find(m => m.id === record.memberId || (m.volunteerId && m.volunteerId === record.memberVolunteerId));
    const gps = record.gpsLocation;
    const ev = record.dailyEvaluation;
    const c1 = ev?.attendanceCommitment ?? ev?.attendanceScore ?? '—';
    const c2 = ev?.taskQuality ?? ev?.participationScore ?? '—';
    const c3 = ev?.teamworkCommunication ?? ev?.commitmentScore ?? '—';
    const c4 = ev?.initiativePassion ?? ev?.taskExecutionScore ?? '—';
    const total = ev?.totalDailyScore ?? (typeof c1 === 'number' && typeof c2 === 'number' && typeof c3 === 'number' && typeof c4 === 'number' ? c1 + c2 + c3 + c4 : '—');
    const pct = ev?.percentage !== undefined ? `${ev.percentage}%` : (typeof total === 'number' ? `${total}%` : '—');
    const grade = ev?.overallGrade || (typeof total === 'number' ? (total >= 95 ? 'A+' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D') : '—');

    return [
      mem?.nationalId || '—',
      record.memberVolunteerId || (record as any).volunteerId || mem?.volunteerId || record.memberId,
      record.memberName || mem?.fullName || 'متطوع',
      mem ? `${mem.college} - ${mem.academicYear}` : '—',
      mem?.whatsappNumber || mem?.phone || '—',
      record.committeeName || mem?.currentCommitteeName || '—',
      mem?.position || 'عضو متطوع',
      record.eventName,
      record.date,
      record.checkInTime || '—',
      record.checkOutTime || '—',
      record.durationFormatted || (record.durationMinutes ? `${(record.durationMinutes / 60).toFixed(1)} ساعة` : '—'),
      record.status === 'Present' ? 'حاضر ✓' : record.status === 'Late' ? 'متأخر' : record.status === 'Excused' ? 'معتذر' : 'غائب',
      gps?.address || 'ميداني موثق',
      gps?.accuracy ? `±${Math.round(gps.accuracy)}م` : '—',
      c1,
      c2,
      c3,
      c4,
      total,
      pct,
      grade,
      ev?.bonusXP ?? ev?.bonusPoints ?? 0,
      ev?.notes || '—',
      ev?.evaluatorName || ev?.evaluatedBy || '—',
      ev?.evaluatedAt || '—'
    ];
  });

  const aoaData = [
    ['كشف الحضور والتقييمات الميدانية الرسمية — اتحاد طلاب جامعة الإسكندرية'],
    [`تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`],
    [`إجمالي السجلات: ${records.length} سجل`],
    [],
    headers,
    ...rows
  ];

  const fileName = `سجل_الحضور_والتقييم_${customTitle || 'المعتمد'}_${new Date().toISOString().slice(0, 10)}`;
  downloadExcelWorkbook(aoaData, fileName, 'سجل الحضور والتقييم');
};

/**
 * 2.1 Master Full Team Evaluation Sheet (Separate for Members & Heads)
 */
export const exportAttendanceAndEvaluationMasterExcel = (
  records: AttendanceRecord[],
  members: Member[],
  targetGroup: 'all' | 'members' | 'heads' = 'all',
  customTitle?: string
) => {
  let filteredMembers = members;
  if (targetGroup === 'members') {
    filteredMembers = members.filter(m => m.role === 'member');
  } else if (targetGroup === 'heads') {
    filteredMembers = members.filter(m => m.role === 'head' || m.role === 'vice_head' || m.position?.includes('رئيس') || m.position?.includes('هيد') || m.position?.includes('نائب'));
  }
  const memberIdSet = new Set(filteredMembers.map(m => m.id));
  const filteredRecords = records.filter(r => memberIdSet.has(r.memberId) || !r.memberId);

  const groupLabel = targetGroup === 'heads' ? 'رؤساء ونواب اللجان (الهيدات)' : targetGroup === 'members' ? 'أعضاء الفريق المتطوعين' : 'كافة الأعضاء والهيدات';

  const headers = [
    'م',
    'الرقم القومي (14 رقم)',
    'الرقم التطوعي',
    'اسم المتطوع / القائد',
    'الفئة التنظيمية',
    'اللجنة التخصصية',
    'المسمى التنظيمي',
    'الكلية والفرقة الدراسية',
    'رقم الواتساب',
    'اسم الفعالية / الحدث',
    'تاريخ الفعالية',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'ساعات العمل الميداني',
    'حالة الحضور',
    'الموقع الجغرافي GPS',
    'دقة الموقع (GPS Accuracy)',
    'رابط خرائط جوجل (Google Maps)',
    'الالتزام والحضور (25)',
    'جودة الأداء وإتقان المهام (35)',
    'العمل الجماعي والتواصل (25)',
    'المبادرة والشغف (15)',
    'درجات البونص الإضافية',
    'سبب البونص',
    'درجة اليوم الإجمالية (100 + بونص)',
    'النسبة المئوية (%)',
    'التقدير العام (Grade)',
    'نقاط الـ XP الممنوحة',
    'ملاحظات وتوجيهات المقيم',
    'اسم المقيم',
    'تاريخ ووقت الاعتماد'
  ];

  const rows = filteredRecords.map((r, idx) => {
    const mem = members.find(m => m.id === r.memberId || (m.volunteerId && m.volunteerId === r.memberVolunteerId));
    const isHead = mem && (mem.role === 'head' || mem.role === 'vice_head');
    const ev = r.dailyEvaluation;
    const gps = r.gpsLocation;
    const c1 = ev?.attendanceCommitment ?? ev?.attendanceScore ?? '—';
    const c2 = ev?.taskQuality ?? ev?.participationScore ?? '—';
    const c3 = ev?.teamworkCommunication ?? ev?.commitmentScore ?? '—';
    const c4 = ev?.initiativePassion ?? ev?.taskExecutionScore ?? '—';
    const bonusPts = ev?.bonusPoints ?? 0;
    const bonusReason = ev?.bonusReason || '—';
    const total = ev?.totalDailyScore ?? (typeof c1 === 'number' && typeof c2 === 'number' && typeof c3 === 'number' && typeof c4 === 'number' ? c1 + c2 + c3 + c4 + bonusPts : '—');
    const pct = ev?.percentage !== undefined ? `${ev.percentage}%` : (typeof total === 'number' ? `${Math.min(100, total)}%` : '—');
    const grade = ev?.overallGrade || (typeof total === 'number' ? (total >= 95 ? 'A+' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D') : '—');

    const gpsCoordsText = gps ? (gps.lat && gps.lng ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : gps.address || 'ميداني') : 'ميداني موثق';
    const gpsAccText = gps?.accuracy ? `±${gps.accuracy} متر` : 'دقة عادية';
    const mapsLink = gps?.mapsUrl || (gps?.lat && gps?.lng ? `https://www.google.com/maps?q=${gps.lat},${gps.lng}` : '—');

    return [
      idx + 1,
      mem?.nationalId || '—',
      r.memberVolunteerId || mem?.volunteerId || r.memberId,
      r.memberName || mem?.fullName || 'متطوع',
      isHead ? 'قائد لجنة (Head)' : 'عضو متطوع (Member)',
      r.committeeName || mem?.currentCommitteeName || '—',
      mem?.position || 'عضو متطوع',
      mem ? `${mem.college} - ${mem.academicYear}` : '—',
      mem?.whatsappNumber || mem?.phone || '—',
      r.eventName,
      r.date,
      r.checkInTime || '—',
      r.checkOutTime || '—',
      r.durationFormatted || (r.durationMinutes ? `${(r.durationMinutes / 60).toFixed(1)} ساعة` : '—'),
      r.status === 'Present' ? 'حاضر ✓' : r.status === 'Late' ? 'متأخر' : r.status === 'Excused' ? 'معتذر' : 'غائب',
      gpsCoordsText,
      gpsAccText,
      mapsLink,
      c1,
      c2,
      c3,
      c4,
      bonusPts,
      bonusReason,
      total,
      pct,
      grade,
      ev?.bonusXP || 0,
      ev?.notes || '—',
      ev?.evaluatorName || ev?.evaluatedBy || '—',
      ev?.evaluatedAt || '—'
    ];
  });

  const aoaData = [
    [`شيت التقييم والحضور العام — ${groupLabel}`],
    [`اتحاد طلاب جامعة الإسكندرية • تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`],
    [`إجمالي السجلات: ${filteredRecords.length} سجل | إجمالي الحاضرين المقيّمين: ${filteredRecords.filter(r => Boolean(r.dailyEvaluation)).length}`],
    [],
    headers,
    ...rows
  ];

  const titlePrefix = targetGroup === 'heads' ? 'شيت_تقييم_الهيدات_العام' : targetGroup === 'members' ? 'شيت_تقييم_الأعضاء_العام' : 'شيت_التقييم_العام_المجمع';
  const fileName = `${titlePrefix}_${customTitle ? customTitle + '_' : ''}${new Date().toISOString().slice(0, 10)}`;
  downloadExcelWorkbook(aoaData, fileName, groupLabel);
};

/**
 * 2.2 Export Single Volunteer Evaluation History directly from profile
 */
export const exportSingleMemberEvaluationHistoryToExcel = (
  member: Member,
  records: AttendanceRecord[] = [],
  memberEvaluations: MemberEvaluationRecord[] = []
) => {
  const userRecords = records.filter(r => r.memberId === member.id || (r.memberVolunteerId && r.memberVolunteerId === member.volunteerId));
  const userEvaluations = memberEvaluations.filter(e => e.memberId === member.id || (e.memberVolunteerId && e.memberVolunteerId === member.volunteerId));

  const headers = [
    'م',
    'الرقم القومي',
    'الرقم التطوعي',
    'اسم المتطوع',
    'اللجنة التخصصية',
    'اسم الفعالية / اليوم الميداني',
    'تاريخ الحضور',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'ساعات العمل الميداني',
    'الموقع الجغرافي GPS',
    'رابط خرائط جوجل',
    'حالة الحضور',
    'الالتزام والحضور (25)',
    'جودة الأداء وإتقان المهام (35)',
    'العمل الجماعي والتواصل (25)',
    'المبادرة والشغف (15)',
    'درجات البونص',
    'سبب البونص',
    'إجمالي نتيجة اليوم (100 + بونص)',
    'النسبة المئوية (%)',
    'التقدير العام (Grade)',
    'نقاط التميز (Bonus XP)',
    'الملاحظات والتوجيهات',
    'اسم المقيّم',
    'تاريخ ووقت التقييم'
  ];

  const rows = userRecords.map((r, idx) => {
    const ev = r.dailyEvaluation;
    const gps = r.gpsLocation;
    const c1 = ev?.attendanceCommitment ?? ev?.attendanceScore ?? '—';
    const c2 = ev?.taskQuality ?? ev?.participationScore ?? '—';
    const c3 = ev?.teamworkCommunication ?? ev?.commitmentScore ?? '—';
    const c4 = ev?.initiativePassion ?? ev?.taskExecutionScore ?? '—';
    const bonusPts = ev?.bonusPoints ?? 0;
    const bonusReason = ev?.bonusReason || '—';
    const total = ev?.totalDailyScore ?? (typeof c1 === 'number' && typeof c2 === 'number' && typeof c3 === 'number' && typeof c4 === 'number' ? c1 + c2 + c3 + c4 + bonusPts : '—');
    const pct = ev?.percentage !== undefined ? `${ev.percentage}%` : (typeof total === 'number' ? `${Math.min(100, total)}%` : '—');
    const grade = ev?.overallGrade || (typeof total === 'number' ? (total >= 95 ? 'A+' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D') : '—');

    const gpsCoordsText = gps ? (gps.lat && gps.lng ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : gps.address || 'ميداني') : 'ميداني موثق';
    const mapsLink = gps?.mapsUrl || (gps?.lat && gps?.lng ? `https://www.google.com/maps?q=${gps.lat},${gps.lng}` : '—');

    return [
      idx + 1,
      member.nationalId || '—',
      member.volunteerId || member.id,
      member.fullName,
      member.currentCommitteeName,
      r.eventName || 'جلسة ميدانية',
      r.date,
      r.checkInTime || '—',
      r.checkOutTime || '—',
      r.durationFormatted || (r.durationMinutes ? `${(r.durationMinutes / 60).toFixed(1)} ساعة` : '—'),
      gpsCoordsText,
      mapsLink,
      r.status === 'Present' ? 'حاضر ✓' : r.status === 'Late' ? 'متأخر' : r.status === 'Excused' ? 'معتذر' : 'غائب',
      c1,
      c2,
      c3,
      c4,
      bonusPts,
      bonusReason,
      total,
      pct,
      grade,
      ev?.bonusXP || 0,
      ev?.notes || '—',
      ev?.evaluatorName || ev?.evaluatedBy || '—',
      ev?.evaluatedAt || '—'
    ];
  });

  const totalEvaluated = userRecords.filter(r => Boolean(r.dailyEvaluation)).length;
  const totalHours = userRecords.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / 60;
  const overallAvg = member.performance?.overallScore || 0;

  const aoaData = [
    [`السجل الفردي الكامل للحضور والتقييمات الميدانية — ${member.fullName}`],
    [`الرقم القومي: ${member.nationalId || '—'} | الكود التطوعي: ${member.volunteerId} | اللجنة: ${member.currentCommitteeName}`],
    [`الكلية: ${member.college} - الفرقة: ${member.academicYear} | الهاتف/واتساب: ${member.whatsappNumber || member.phone || '—'}`],
    [`المعدل التراكمي العام: ${overallAvg}% | إجمالي الفعاليات المحضورة: ${userRecords.length} | إجمالي الساعات: ${totalHours.toFixed(1)} ساعة | التقييمات المسجلة: ${totalEvaluated}`],
    [`تاريخ استخراج التقرير: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`],
    [],
    headers,
    ...rows
  ];

  const cleanName = member.fullName.replace(/[\s\/:*?"<>|]+/g, '_');
  const fileName = `سجل_تقييمات_${cleanName}_${new Date().toISOString().slice(0, 10)}`;
  downloadExcelWorkbook(aoaData, fileName, 'سجل التقييمات الفردي');
};

/**
 * 3. Export Tasks to Excel (.xlsx)
 */
export const exportTasksToExcel = (tasks: Task[], customTitle?: string) => {
  const headers = [
    'كود المهمة',
    'عنوان المهمة',
    'اللجنة المكلفة',
    'المتطوعون المسند إليهم',
    'مستوى الأولوية',
    'حالة المهمة',
    'نقاط المكافأة (XP)',
    'تاريخ الاستحقاق (Deadline)',
    'عدد المهام الفرعية',
    'نسبة الإنجاز (%)',
    'موقف المتابعة (Stance)',
    'ملاحظات التسليم',
    'تاريخ التكليف'
  ];

  const rows = tasks.map(t => {
    const totalSubs = t.subtasks?.length || 0;
    const completedSubs = t.subtasks?.filter(s => s.completed).length || 0;
    const subPct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : (t.status === 'Approved' ? 100 : 0);
    const assigneeDisplay = t.assignedToMemberNames && t.assignedToMemberNames.length > 0 ? t.assignedToMemberNames.join(' • ') : 'تكليف جماعي';

    return [
      t.id,
      t.title,
      t.committeeName,
      assigneeDisplay,
      t.priority,
      t.status === 'Approved' ? 'معتمدة ومكتملة' : t.status === 'Submitted' ? 'بانتظار المراجعة' : t.status === 'In Progress' ? 'قيد التنفيذ' : 'مسندة',
      `+${t.xpReward} XP`,
      t.deadline || '—',
      totalSubs,
      `${subPct}%`,
      t.stance || 'قيد المتابعة',
      t.submission?.notes || '—',
      t.createdAt || '—'
    ];
  });

  const aoaData = [headers, ...rows];
  const fileName = `سجل_المهام_والتكليفات_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'سجل المهام');
};

/**
 * 4. Export Evaluations (360 Degree) to Excel (.xlsx)
 */
export const exportEvaluationsToExcel = (evaluations: MemberEvaluationRecord[], customTitle?: string, members: Member[] = []) => {
  const headers = [
    'كود التقييم',
    'الرقم القومي',
    'الرقم التطوعي',
    'اسم المتطوع المقيّم',
    'اللجنة',
    'الالتزام والحضور (25)',
    'جودة الأداء وإتقان المهام (35)',
    'العمل الجماعي والتواصل (25)',
    'المبادرة والشغف (15)',
    'الدرجة المحرزة الإجمالية (100)',
    'الدرجة القصوى',
    'النسبة المئوية (%)',
    'التقدير العام (Grade)',
    'اسم المقيّم',
    'الدور الإداري للمقيّم',
    'تاريخ الاعتماد',
    'التوجيه والملاحظات'
  ];

  const rows = evaluations.map(ev => {
    const mem = members.find(m => m.id === ev.memberId || (m.volunteerId && m.volunteerId === ev.memberVolunteerId));
    const scores = ev.scores || {};
    const c1 = scores['الالتزام والحضور (25)'] ?? scores['الحضور والانضباط'] ?? scores['الالتزام والحضور'] ?? '—';
    const c2 = scores['جودة الأداء وإتقان المهام (35)'] ?? scores['جودة الأداء'] ?? scores['التفاعل والمبادرة'] ?? '—';
    const c3 = scores['العمل الجماعي والتواصل (25)'] ?? scores['العمل الجماعي'] ?? scores['جودة الأداء الميداني'] ?? '—';
    const c4 = scores['المبادرة والشغف (15)'] ?? scores['المبادرة والشغف'] ?? '—';
    const total = ev.totalScore;
    const grade = total >= 95 ? 'A+' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D';

    return [
      ev.id,
      mem?.nationalId || '—',
      ev.memberVolunteerId || mem?.volunteerId || ev.memberId,
      ev.memberName || mem?.fullName || 'متطوع',
      ev.committeeName || mem?.currentCommitteeName || '—',
      c1,
      c2,
      c3,
      c4,
      ev.totalScore,
      ev.maxTotalScore || 100,
      `${ev.percentage}%`,
      grade,
      ev.evaluatorName,
      ev.evaluatorRole,
      ev.evaluatedAt,
      ev.feedback || '—'
    ];
  });

  const aoaData = [headers, ...rows];
  const fileName = `سجل_تقييمات_المتطوعين_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'التقييمات');
};

/**
 * 5. Export Head Evaluations to Excel (.xlsx)
 */
export const exportHeadEvaluationsToExcel = (headEvaluations: HeadEvaluationRecord[], customTitle?: string, members: Member[] = []) => {
  const headers = [
    'كود التقييم القيادي',
    'الرقم القومي',
    'الرقم التطوعي للقائد',
    'اسم القائد',
    'المسمى القيادي',
    'اللجنة',
    'الالتزام والحضور (25)',
    'جودة الأداء وإتقان المهام (35)',
    'العمل الجماعي والتواصل (25)',
    'المبادرة والشغف (15)',
    'الدرجة القيادية (100)',
    'الدرجة القصوى',
    'النسبة المئوية (%)',
    'التقدير العام (Grade)',
    'تقييم النجوم (/5)',
    'اسم مقيّم الإدارة العليا',
    'صفة المقيّم',
    'تاريخ الاعتماد',
    'التوجيه القيادي والملاحظات'
  ];

  const rows = headEvaluations.map(ev => {
    const mem = members.find(m => m.id === ev.headId || (m.volunteerId && m.volunteerId === ev.headVolunteerId));
    const scores = ev.scores || {};
    const c1 = scores['الالتزام والحضور (25)'] ?? scores['الحضور والانضباط القيادي'] ?? scores['الالتزام والحضور'] ?? '—';
    const c2 = scores['جودة الأداء وإتقان المهام (35)'] ?? scores['إدارة وتفاعل الفريق'] ?? scores['جودة الأداء'] ?? '—';
    const c3 = scores['العمل الجماعي والتواصل (25)'] ?? scores['تنفيذ المهام الميدانية'] ?? scores['العمل الجماعي'] ?? '—';
    const c4 = scores['المبادرة والشغف (15)'] ?? scores['المبادرة والشغف'] ?? '—';
    const total = ev.totalScore;
    const grade = total >= 95 ? 'A+' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D';

    return [
      ev.id,
      mem?.nationalId || '—',
      ev.headVolunteerId || mem?.volunteerId || ev.headId,
      ev.headName || mem?.fullName || 'قائد',
      ev.headPosition || mem?.position || 'رئيس لجنة',
      ev.committeeName || mem?.currentCommitteeName || '—',
      c1,
      c2,
      c3,
      c4,
      ev.totalScore,
      ev.maxTotalScore || 100,
      `${ev.percentage}%`,
      grade,
      ev.leadershipRating ? `${ev.leadershipRating}/5` : '5/5',
      ev.evaluatorName,
      ev.evaluatorRole,
      ev.evaluatedAt,
      ev.feedback || '—'
    ];
  });

  const aoaData = [headers, ...rows];
  const fileName = `سجل_تقييمات_قادة_اللجان_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'تقييمات القيادات');
};

/**
 * 6. Export Complaints to Excel (.xlsx)
 */
export const exportComplaintsToExcel = (complaints: Complaint[]) => {
  const headers = [
    'كود التذكرة',
    'عنوان الشكوى / المقترح',
    'التصنيف',
    'اسم المرسل',
    'اللجنة',
    'هل الهوية سرية؟',
    'الحالة',
    'تاريخ الإرسال',
    'الرد الإداري',
    'تاريخ الرد'
  ];

  const rows = complaints.map(c => [
    c.id,
    c.title,
    c.category,
    c.isAnonymous ? 'هوية سرية محفوظة' : c.senderName,
    c.senderCommitteeName,
    c.isAnonymous ? 'نعم' : 'لا',
    c.status,
    c.createdAt,
    c.responseNotes || '—',
    c.respondedAt || '—'
  ]);

  const aoaData = [headers, ...rows];
  const fileName = `سجل_الشكاوى_والمقترحات_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'الشكاوى والمقترحات');
};

/**
 * 7. Export Announcement Poll Results to Excel (.xlsx)
 */
export const exportPollResultsToExcel = (poll: AnnouncementPoll, announcementTitle: string = 'استطلاع') => {
  const summaryHeaders = ['خيار الاستطلاع', 'عدد الأصوات', 'النسبة المئوية (%)'];
  const summaryRows = poll.options.map(opt => {
    const votesCount = opt.voteCount || 0;
    const total = poll.totalVotes || 1;
    const pct = Math.round((votesCount / total) * 100);
    return [opt.text, votesCount, `${pct}%`];
  });

  const votesHeaders = ['اسم العضو المصوت', 'اللجنة', 'الخيار المختار', 'تاريخ ووقت التصويت'];
  const votesRows = (poll.votes || []).map(v => {
    const optText = poll.options.find(o => o.id === v.optionId)?.text || 'خيار';
    return [v.memberName, v.committeeName || 'عام', optText, v.votedAt || '—'];
  });

  const aoaData = [
    ['تقرير نتائج استطلاع الرأي والتصويت الإلكتروني'],
    [`عنوان الإعلان: ${announcementTitle}`],
    [`السؤال: ${poll.question}`],
    [`إجمالي الأصوات: ${poll.totalVotes || 0}`],
    [],
    ['ملخص النتائج حسب الخيارات:'],
    summaryHeaders,
    ...summaryRows,
    [],
    ['سجل تفاصيل أصوات الأعضاء:'],
    votesHeaders,
    ...votesRows
  ];

  const cleanTitle = announcementTitle.replace(/[\s\/:*?"<>|]+/g, '_');
  const fileName = `نتائج_استطلاع_${cleanTitle}_${new Date().toISOString().slice(0, 10)}`;
  downloadExcelWorkbook(aoaData, fileName, 'نتائج الاستطلاع');
};

/**
 * 8. Export Event Roster & RSVPs to Excel (.xlsx)
 */
export const exportEventRosterToExcel = (event: EventEntity, rsvps: EventRSVP[]) => {
  const confirmedAttendees = rsvps.filter(r => r.status === 'Attending');
  const apologies = rsvps.filter(r => r.status === 'Apologized');

  const headers = [
    'الرقم التطوعي',
    'الاسم الكامل',
    'اللجنة التخصصية',
    'الدور / الصفة',
    'حالة الحضور',
    'وقت الحضور المتوقع',
    'سبب الاعتذار (إن وجد)',
    'تاريخ وتوقيت التسجيل'
  ];

  const rows = rsvps.map(r => [
    r.memberVolunteerId || r.memberId,
    r.memberName,
    r.committeeName,
    r.role,
    r.status === 'Attending' ? 'مؤكد الحضور ✓' : 'اعتذار عن الحضور ⚠️',
    r.expectedArrivalTime || event.startTime,
    r.apologyReason || '—',
    r.registeredAt
  ]);

  const aoaData = [
    ['كشف وإحصائية حضور وتأكيدات فعالية اتحاد طلاب جامعة الإسكندرية'],
    [`اسم الفعالية: ${event.name}`],
    [`تاريخ الفعالية: ${event.date} (${event.startTime} - ${event.endTime})`],
    [`الموقع الميداني: ${event.location}`],
    [`المستهدف الكلي: ${event.expectedMembersCount} متطوع`],
    [`إجمالي المؤكدين للحضور: ${confirmedAttendees.length} | إجمالي المعتذرين: ${apologies.length}`],
    [],
    headers,
    ...rows
  ];

  const cleanEventName = event.name.replace(/[\s\/:*?"<>|]+/g, '_');
  const fileName = `كشف_حضور_فعالية_${cleanEventName}_${event.date}`;
  downloadExcelWorkbook(aoaData, fileName, 'كشف الحضور والاعتذارات');
};

/**
 * 9. Export Daily Post-Event Attendance & Evaluations Report to Excel (.xlsx)
 */
export const exportPostEventDailyReportToExcel = (
  event: EventEntity,
  attendance: AttendanceRecord[],
  absentMembers: Member[],
  pointsConfig: AttendancePointsConfig
) => {
  const attendeesHeaders = [
    'الرقم التطوعي',
    'اسم المتطوع',
    'اللجنة',
    'حالة الحضور',
    'وقت الدخول الفعلي',
    'وقت الانصراف',
    'إجمالي الساعات الميدانية',
    'نقاط الحضور والانضباط المكتسبة',
    'التقييم اليومي الشامل (%)',
    'ملاحظات الهيد والتقييم'
  ];

  const attendeesRows = attendance.map(a => {
    let pts = pointsConfig.onTimePoints;
    if (a.status === 'Late') pts = pointsConfig.minorDelayPoints;
    else if (a.status === 'Excused') pts = pointsConfig.excusedAbsencePoints;
    else if (a.status === 'Absent') pts = pointsConfig.unexcusedAbsencePenalty;

    return [
      a.memberVolunteerId || a.memberId,
      a.memberName,
      a.committeeName,
      a.status === 'Present' ? 'حاضر بالموعد' : a.status === 'Late' ? 'متأخر' : a.status === 'Excused' ? 'غياب بعذر' : 'غائب',
      a.checkInTime || '—',
      a.checkOutTime || '—',
      a.durationFormatted || '—',
      `${pts} نقطة`,
      a.dailyEvaluation?.totalDailyScore ? `${a.dailyEvaluation.totalDailyScore}/30` : '—',
      a.dailyEvaluation?.notes || '—'
    ];
  });

  const absentHeaders = [
    'الرقم التطوعي',
    'اسم العضو الغائب',
    'اللجنة التخصصية',
    'حالة الغياب والجزاء',
    'خصم النقاط المقدر'
  ];

  const absentRows = absentMembers.map(m => [
    m.volunteerId || m.id,
    m.fullName,
    m.currentCommitteeName,
    'غائب عن الفعالية بدون تسجيل',
    `${pointsConfig.unexcusedAbsencePenalty} نقطة`
  ]);

  const aoaData = [
    ['التقرير الختامي اليومي وإحصائية الحضور وتقييمات الفعالية الميدانية'],
    [`اسم الفعالية: ${event.name}`],
    [`التاريخ: ${event.date}`],
    [`الموقع: ${event.location}`],
    [`إجمالي الحاضرين: ${attendance.length} | إجمالي المتغيبين: ${absentMembers.length}`],
    [],
    ['=== سجل تفاصيل الحاضرين والتقييمات اليومية ==='],
    attendeesHeaders,
    ...attendeesRows,
    [],
    ['=== سجل الأعضاء المتغيبين عن الفعالية ==='],
    absentHeaders,
    ...absentRows
  ];

  const cleanEventName = event.name.replace(/[\s\/:*?"<>|]+/g, '_');
  const fileName = `التقرير_اليومي_الختامي_${cleanEventName}_${event.date}`;
  downloadExcelWorkbook(aoaData, fileName, 'التقرير اليومي الختامي');
};

/**
 * 10. Export Daily Event / Session Dedicated Attendance Sheet to Excel (.xlsx)
 * Links attendees directly with their full member details (National ID, College, Committee, Role, GPS, Time).
 */
export const exportDailySessionAttendanceToExcel = (
  session: AttendanceSession | null,
  event: EventEntity | null,
  records: AttendanceRecord[],
  members: Member[],
  dateStr: string = new Date().toISOString().slice(0, 10)
) => {
  const headers = [
    'الرقم التطوعي',
    'الاسم الكامل',
    'الرقم القومي',
    'الكلية / المعهد',
    'الفرقة الدراسية',
    'رقم الواتساب / الهاتف',
    'اللجنة التخصصية',
    'المسمى التنظيمي / الدور',
    'حالة الحضور',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'المدة الميدانية',
    'الموقع الجغرافي (GPS)',
    'إحداثيات الموقع (Lat, Lng)',
    'دقة الموقع (متر)',
    'الفعالية المرتبطة',
    'عنوان الجلسة',
    'تاريخ التسجيل',
    'التقييم اليومي (/30)',
    'ملاحظات المقيّم'
  ];

  const rows = records.map(r => {
    const mem = members.find(m => m.id === r.memberId);
    const gps = r.gpsLocation;
    const lat = gps ? (gps.lat ?? gps.latitude ?? 0) : 0;
    const lng = gps ? (gps.lng ?? gps.longitude ?? 0) : 0;

    return [
      r.memberVolunteerId || mem?.volunteerId || r.memberId,
      r.memberName || mem?.fullName || 'متطوع',
      mem?.nationalId || '—',
      mem?.college || 'جامعة الإسكندرية',
      mem?.academicYear || '—',
      mem?.whatsappNumber || mem?.phone || '—',
      r.committeeName || mem?.currentCommitteeName || '—',
      mem?.position || mem?.role || 'عضو متطوع',
      r.status === 'Present' ? 'حاضر بالموعد ✓' : r.status === 'Late' ? 'متأخر' : r.status === 'Excused' ? 'غياب بعذر' : 'غائب',
      r.checkInTime || '—',
      r.checkOutTime || '—',
      r.durationFormatted || (r.durationMinutes ? `${(r.durationMinutes / 60).toFixed(1)} ساعة` : '—'),
      gps?.address || 'جامعة الإسكندرية (ميداني)',
      lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '—',
      gps?.accuracy ? `±${Math.round(gps.accuracy)}م` : '—',
      r.eventName || event?.name || session?.eventName || 'جلسة مباشرة',
      r.sessionTitle || session?.title || 'حضور الميدان',
      r.date || dateStr,
      r.dailyEvaluation?.totalDailyScore ? `${r.dailyEvaluation.totalDailyScore}/30` : '—',
      r.dailyEvaluation?.notes || '—'
    ];
  });

  const eventTitle = event?.name || session?.eventName || session?.title || 'الميدان';
  const cleanTitle = eventTitle.replace(/[\s\/:*?"<>|]+/g, '_');
  const fileName = `شيت_حضور_اليوم_${cleanTitle}_${dateStr}`;

  const aoaData = [
    ['كشف الحضور الرسمي الميداني واليومي — اتحاد طلاب جامعة الإسكندرية'],
    [`الفعالية / المناسبة: ${eventTitle}`],
    [`تاريخ اليوم: ${dateStr}`],
    [`اللجنة / الفئة: ${session?.committeeName || 'جميع اللجان'}`],
    [`إجمالي المسجلين الحاضرين في هذا الشيت: ${records.length} متطوع`],
    [],
    headers,
    ...rows
  ];

  downloadExcelWorkbook(aoaData, fileName, 'شيت الحضور اليومي');
};

/**
 * 11. Export Audit Logs to Excel (.xlsx)
 */
export const exportAuditLogsToExcel = (logs: AuditLogItem[]) => {
  const headers = [
    'معرف السجل',
    'التوقيت والتاريخ',
    'اسم القائم بالإجراء',
    'المسمى والدور الإداري',
    'نوع الإجراء',
    'العنصر أو الجهة المستهدفة',
    'تفاصيل الإجراء',
    'القيمة السابقة',
    'القيمة الجديدة'
  ];

  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.userName,
    log.userRole || 'عضو بالمنظومة',
    log.action,
    log.targetEntity,
    log.details,
    log.previousValue || '—',
    log.newValue || '—'
  ]);

  const aoaData = [
    ['سجل التدقيق والحوكمة والعمليات — اتحاد طلاب جامعة الإسكندرية'],
    [`تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}`],
    [`إجمالي السجلات والعمليات: ${logs.length} عملية موثقة`],
    [],
    headers,
    ...rows
  ];

  downloadExcelWorkbook(aoaData, `سجل_التدقيق_والحوكمة_${new Date().toISOString().split('T')[0]}`, 'سجل التدقيق');
};
