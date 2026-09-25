import * as XLSX from 'xlsx';
import { AttendanceRecord, Member, Complaint, MemberEvaluationRecord, HeadEvaluationRecord, Task, AnnouncementPoll } from '../types';

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
    filtered = members.filter(m => m.role === 'head' || m.role === 'vice_head');
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

  const rows = filtered.map(m => [
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
    m.role,
    m.status === 'Active' ? 'نشط ومفعل' : m.status === 'Pending' ? 'قيد المراجعة' : m.status === 'Banned' ? 'محظور ⛔' : m.status,
    m.joinDate,
    m.bloodType || '—',
    m.emergencyContact || '—',
    m.address || '—',
    m.points || 0,
    m.level || 1,
    `${m.performance?.overallScore || 0}%`,
    `${m.performance?.attendanceRate || 0}%`,
    `${m.performance?.taskCompletionRate || 0}%`,
    m.hobbies && m.hobbies.length > 0 ? m.hobbies.join(' • ') : '—',
    m.learningAspirations && m.learningAspirations.length > 0 ? m.learningAspirations.join(' • ') : '—'
  ]);

  const aoaData = [headers, ...rows];
  const title = customTitle || (roleFilter === 'heads_only' ? 'سجل_قادة_ورؤساء_اللجان' : 'شيت_قاعدة_بيانات_أعضاء_الفريق_الشامل');
  const fileName = `${title}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'سجل الأعضاء');
};

/**
 * 2. Export Attendance & Check-in / Check-out Records to Excel (.xlsx)
 */
export const exportAttendanceToExcel = (records: AttendanceRecord[], customTitle?: string) => {
  const headers = [
    'الرقم التطوعي للمتطوع',
    'اسم المتطوع',
    'اللجنة التابع لها',
    'اسم الفعالية / جلسة الحضور',
    'التاريخ',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'إجمالي الساعات الميدانية',
    'حالة الحضور',
    'الموقع الجغرافي الحقيقي (GPS)',
    'إحداثيات خط العرض (Lat)',
    'إحداثيات خط الطول (Lng)',
    'دقة الموقع (متر)',
    'تقييم الالتزام والانضباط (/10)',
    'تقييم التفاعل والمشاركة (/10)',
    'تقييم إنجاز المهام (/10)',
    'الدرجة الإجمالية اليومية (/10)',
    'نقاط التميز (Bonus XP)',
    'ملاحظات المقيّم',
    'اسم المقيّم'
  ];

  const rows = records.map(record => {
    const gps = record.gpsLocation;
    const lat = gps ? (gps.lat ?? gps.latitude ?? 0) : 0;
    const lng = gps ? (gps.lng ?? gps.longitude ?? 0) : 0;
    const ev = record.dailyEvaluation;

    return [
      (record as any).volunteerId || record.memberId,
      record.memberName,
      record.committeeName,
      record.eventName,
      record.date,
      record.checkInTime || '—',
      record.checkOutTime || '—',
      record.durationFormatted || `${(record.durationMinutes / 60).toFixed(1)} ساعة`,
      record.status === 'Present' ? 'حاضر' : record.status === 'Late' ? 'متأخر' : record.status === 'Excused' ? 'معتذر' : 'غائب',
      gps?.address || 'تم الالتقاط',
      lat ? lat.toFixed(6) : '—',
      lng ? lng.toFixed(6) : '—',
      gps?.accuracy ? `±${Math.round(gps.accuracy)}م` : '—',
      ev?.disciplineScore ?? ev?.commitmentScore ?? '—',
      ev?.participationScore ?? '—',
      ev?.taskExecutionScore ?? '—',
      ev?.totalDailyScore ?? ev?.overallDailyScore ?? '—',
      ev?.bonusXP ?? ev?.bonusPoints ?? 0,
      ev?.notes || '—',
      ev?.evaluatedBy || ev?.evaluatorName || '—'
    ];
  });

  const aoaData = [headers, ...rows];
  const fileName = `سجل_الحضور_والتقييم_${customTitle || 'المعتمد'}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'سجل الحضور');
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
export const exportEvaluationsToExcel = (evaluations: MemberEvaluationRecord[], customTitle?: string) => {
  const headers = [
    'كود التقييم',
    'الرقم التطوعي',
    'اسم المتطوع المقيّم',
    'اللجنة',
    'الدرجة المحرزة',
    'الدرجة القصوى',
    'النسبة المئوية (%)',
    'اسم المقيّم',
    'الدور الإداري للمقيّم',
    'تاريخ الاعتماد',
    'التوجيه والملاحظات'
  ];

  const rows = evaluations.map(ev => [
    ev.id,
    ev.memberVolunteerId || ev.memberId,
    ev.memberName,
    ev.committeeName,
    ev.totalScore,
    ev.maxTotalScore,
    `${ev.percentage}%`,
    ev.evaluatorName,
    ev.evaluatorRole,
    ev.evaluatedAt,
    ev.feedback || '—'
  ]);

  const aoaData = [headers, ...rows];
  const fileName = `سجل_تقييمات_المتطوعين_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}`;

  downloadExcelWorkbook(aoaData, fileName, 'التقييمات');
};

/**
 * 5. Export Head Evaluations to Excel (.xlsx)
 */
export const exportHeadEvaluationsToExcel = (headEvaluations: HeadEvaluationRecord[], customTitle?: string) => {
  const headers = [
    'كود التقييم القيادي',
    'الرقم التطوعي للقائد',
    'اسم القائد',
    'المسمى القيادي',
    'اللجنة',
    'الدرجة القيادية',
    'الدرجة القصوى',
    'النسبة المئوية (%)',
    'تقييم النجوم (/5)',
    'اسم مقيّم الإدارة العليا',
    'صفة المقيّم',
    'تاريخ الاعتماد',
    'التوجيه القيادي'
  ];

  const rows = headEvaluations.map(ev => [
    ev.id,
    ev.headVolunteerId || ev.headId,
    ev.headName,
    ev.headPosition,
    ev.committeeName,
    ev.totalScore,
    ev.maxTotalScore,
    `${ev.percentage}%`,
    ev.leadershipRating ? `${ev.leadershipRating}/5` : '5/5',
    ev.evaluatorName,
    ev.evaluatorRole,
    ev.evaluatedAt,
    ev.feedback || '—'
  ]);

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
