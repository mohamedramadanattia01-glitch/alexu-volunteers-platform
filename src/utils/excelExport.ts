import { AttendanceRecord, Member, Complaint, MemberEvaluationRecord, HeadEvaluationRecord, Task, Committee } from '../types';

/**
 * Helper to download CSV file with UTF-8 BOM for full Arabic character support in MS Excel
 */
export const downloadCsvFile = (csvContent: string, fileName: string) => {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Arabic correctly
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
 * Clean cell content to avoid CSV injection and delimiter issues
 */
const escapeCsvCell = (cellValue: any): string => {
  if (cellValue === null || cellValue === undefined) return '""';
  const str = String(cellValue).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * 1. Export Attendance & Check-in / Check-out Records to Excel
 */
export const exportAttendanceToExcel = (records: AttendanceRecord[], customTitle?: string) => {
  const headers = [
    'الرقم التطوعي الفريد',
    'اسم المتطوع',
    'اللجنة التابع لها',
    'اسم الفعالية / الاجتماع',
    'التاريخ',
    'وقت تسجيل الحضور (Check-in)',
    'وقت تسجيل الانصراف (Check-out)',
    'إجمالي الساعات الميدانية',
    'حالة الحضور',
    'الموقع الجغرافي الحقيقي (GPS)',
    'إحداثيات الـ GPS (خط العرض / الطول)',
    'تقييم الالتزام والانضباط (/10)',
    'تقييم التفاعل والمشاركة (/10)',
    'تقييم إنجاز مهام اليوم (/10)',
    'التقييم اليومي الإجمالي (/10)',
    'نقاط تميز إضافية (Bonus XP)',
    'ملاحظات مقيّم اليوم',
    'اسم المقيّم',
    'رمز التحقق الرقمي (Hash)'
  ];

  const rows = records.map(record => {
    const gps = record.gpsLocation;
    const gpsAddress = gps ? gps.address || 'تم الالتقاط بنجاح' : 'غير متوفر';
    const lat = gps ? (gps.lat ?? gps.latitude ?? 0) : 0;
    const lng = gps ? (gps.lng ?? gps.longitude ?? 0) : 0;
    const gpsCoords = gps ? `${lat.toFixed(6)}, ${lng.toFixed(6)} (دقة ${Math.round(gps.accuracy || 0)}م)` : '—';
    const ev = record.dailyEvaluation;

    return [
      escapeCsvCell((record as any).volunteerId || record.memberId),
      escapeCsvCell(record.memberName),
      escapeCsvCell(record.committeeName),
      escapeCsvCell(record.eventName),
      escapeCsvCell(record.date),
      escapeCsvCell(record.checkInTime || '—'),
      escapeCsvCell(record.checkOutTime || '—'),
      escapeCsvCell(record.durationFormatted || `${(record.durationMinutes / 60).toFixed(1)} ساعة`),
      escapeCsvCell(
        record.status === 'Present' ? 'حاضر' :
        record.status === 'Late' ? 'متأخر' :
        record.status === 'Excused' ? 'معتذر بعذر' : 'غائب'
      ),
      escapeCsvCell(gpsAddress),
      escapeCsvCell(gpsCoords),
      escapeCsvCell(ev ? (ev.disciplineScore ?? ev.commitmentScore ?? '—') : '—'),
      escapeCsvCell(ev ? (ev.participationScore ?? '—') : '—'),
      escapeCsvCell(ev ? (ev.taskExecutionScore ?? '—') : '—'),
      escapeCsvCell(ev ? (ev.totalDailyScore ?? ev.overallDailyScore ?? '—') : '—'),
      escapeCsvCell(ev ? `+${ev.bonusXP ?? ev.bonusPoints ?? 0} XP` : '0 XP'),
      escapeCsvCell(ev?.notes || '—'),
      escapeCsvCell(ev?.evaluatedBy || ev?.evaluatorName || '—'),
      escapeCsvCell(record.qrHashToken || '—')
    ];
  });

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const fileName = customTitle 
    ? `سجل_الحضور_والتقييم_اليومي_${customTitle}_${new Date().toISOString().slice(0, 10)}.csv`
    : `سجل_الحضور_والتقييم_اليومي_المعتمد_${new Date().toISOString().slice(0, 10)}.csv`;

  downloadCsvFile(csvContent, fileName);
};

/**
 * 2. Export Members (Committee or Full Team) to Excel
 */
export const exportMembersToExcel = (members: Member[], committeeName?: string, roleFilter?: string) => {
  let filtered = members;
  if (roleFilter === 'members_only') {
    filtered = members.filter(m => m.role === 'member');
  } else if (roleFilter === 'heads_only') {
    filtered = members.filter(m => m.role === 'head' || m.role === 'vice_head');
  }

  const headers = [
    'الرقم التطوعي الفريد',
    'الاسم الكامل',
    'اللجنة التخصصية',
    'المسمى التطوعي',
    'الدور الإداري',
    'الرقم القومي',
    'رقم الواتساب',
    'البريد الجامعي',
    'الكلية / المعهد',
    'الفرقة الدراسية',
    'تاريخ الانضمام',
    'التقييم الشامل (%)',
    'نسبة الحضور (%)',
    'معدل إنجاز المهام (%)',
    'نقاط التميز (XP)',
    'المستوى (Level)',
    'الحالة',
    'الهوايات والاهتمامات',
    'تطلعات التعلم والتطوير'
  ];

  const rows = filtered.map(m => [
    escapeCsvCell(m.volunteerId || m.id),
    escapeCsvCell(m.fullName),
    escapeCsvCell(m.currentCommitteeName),
    escapeCsvCell(m.position),
    escapeCsvCell(m.role),
    escapeCsvCell(m.nationalId || '—'),
    escapeCsvCell(m.whatsappNumber),
    escapeCsvCell(m.universityEmail),
    escapeCsvCell(m.college),
    escapeCsvCell(m.academicYear),
    escapeCsvCell(m.joinDate),
    escapeCsvCell(`${m.performance?.overallScore || 0}%`),
    escapeCsvCell(`${m.performance?.attendanceRate || 0}%`),
    escapeCsvCell(`${m.performance?.taskCompletionRate || 0}%`),
    escapeCsvCell(m.points || 0),
    escapeCsvCell(m.level || 1),
    escapeCsvCell(m.status),
    escapeCsvCell(m.hobbies ? m.hobbies.join(' • ') : '—'),
    escapeCsvCell(m.learningAspirations ? m.learningAspirations.join(' • ') : '—')
  ]);

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const titlePrefix = committeeName && committeeName !== 'all' && committeeName !== 'جميع اللجان'
    ? `بيانات_${committeeName.replace(/[^a-zA-Z0-9\u0621-\u064A]/g, '_')}`
    : roleFilter === 'heads_only'
    ? 'سجل_رؤساء_ونواب_اللجان_القيادية'
    : 'بيانات_فريق_متطوعي_جامعة_الإسكندرية';

  const fileName = `${titlePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(csvContent, fileName);
};

/**
 * 3. Export Member Evaluations (360 Degree) to Excel
 */
export const exportEvaluationsToExcel = (evaluations: MemberEvaluationRecord[], customTitle?: string) => {
  const headers = [
    'كود التقييم',
    'الرقم التطوعي للمتطوع',
    'اسم المتطوع المقيّم',
    'اللجنة التابع لها',
    'الدرجة الإجمالية المحرزة',
    'الدرجة القصوى للاستمارة',
    'النسبة المئوية (%)',
    'اسم المقيّم',
    'الدور الإداري للمقيّم',
    'تاريخ ووقت اعتماد التقييم',
    'ملاحظات وتوجيهات التقييم'
  ];

  const rows = evaluations.map(ev => [
    escapeCsvCell(ev.id),
    escapeCsvCell(ev.memberVolunteerId || ev.memberId),
    escapeCsvCell(ev.memberName),
    escapeCsvCell(ev.committeeName),
    escapeCsvCell(ev.totalScore),
    escapeCsvCell(ev.maxTotalScore),
    escapeCsvCell(`${ev.percentage}%`),
    escapeCsvCell(ev.evaluatorName),
    escapeCsvCell(ev.evaluatorRole),
    escapeCsvCell(ev.evaluatedAt),
    escapeCsvCell(ev.feedback || '—')
  ]);

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const fileName = `سجل_تقييمات_أعضاء_المتطوعين_المعتمد_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(csvContent, fileName);
};

/**
 * 4. Export Head Evaluations (High Leadership 360) to Excel
 */
export const exportHeadEvaluationsToExcel = (headEvaluations: HeadEvaluationRecord[], customTitle?: string) => {
  const headers = [
    'كود التقييم القيادي',
    'الرقم التطوعي لرئيس/نائب اللجنة',
    'اسم القائد',
    'المسمى القيادي',
    'اللجنة التخصصية',
    'الدرجة القيادية المحرزة',
    'الدرجة القصوى',
    'النسبة المئوية (%)',
    'تقييم النجوم (/5)',
    'اسم مقيّم الإدارة العليا',
    'صفة المقيّم',
    'تاريخ الاعتماد',
    'التوجيه القيادي والملاحظات'
  ];

  const rows = headEvaluations.map(ev => [
    escapeCsvCell(ev.id),
    escapeCsvCell(ev.headVolunteerId || ev.headId),
    escapeCsvCell(ev.headName),
    escapeCsvCell(ev.headPosition),
    escapeCsvCell(ev.committeeName),
    escapeCsvCell(ev.totalScore),
    escapeCsvCell(ev.maxTotalScore),
    escapeCsvCell(`${ev.percentage}%`),
    escapeCsvCell(ev.leadershipRating ? `${ev.leadershipRating}/5` : '5/5'),
    escapeCsvCell(ev.evaluatorName),
    escapeCsvCell(ev.evaluatorRole),
    escapeCsvCell(ev.evaluatedAt),
    escapeCsvCell(ev.feedback || '—')
  ]);

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const fileName = `سجل_تقييمات_رؤساء_اللجان_الإدارة_العليا_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(csvContent, fileName);
};

/**
 * 5. Export Tasks to Excel
 */
export const exportTasksToExcel = (tasks: Task[], customTitle?: string) => {
  const headers = [
    'كود المهمة',
    'عنوان المهمة',
    'اللجنة المكلفة',
    'المتطوع المسند إليه',
    'مستوى الأولوية',
    'حالة المهمة',
    'نقاط التميز (XP)',
    'تاريخ الاستحقاق (Deadline)',
    'عدد المهام الفرعية',
    'نسبة إنجاز المهام الفرعية (%)',
    'موقف المتطوع (Stance)',
    'ملاحظات تسليم المخرجات',
    'تاريخ الإنشاء'
  ];

  const rows = tasks.map(t => {
    const totalSubs = t.subtasks?.length || 0;
    const completedSubs = t.subtasks?.filter(s => s.completed).length || 0;
    const subPct = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : (t.status === 'Approved' ? 100 : 0);

    const assigneeDisplay = t.assignedToMemberNames && t.assignedToMemberNames.length > 0 
      ? t.assignedToMemberNames.join(' • ') 
      : 'تكليف جماعي للجنة';

    return [
      escapeCsvCell(t.id),
      escapeCsvCell(t.title),
      escapeCsvCell(t.committeeName),
      escapeCsvCell(assigneeDisplay),
      escapeCsvCell(t.priority),
      escapeCsvCell(
        t.status === 'Approved' ? 'معتمدة ومكتملة' :
        t.status === 'Submitted' ? 'بانتظار المراجعة والاعتماد' :
        t.status === 'In Progress' ? 'قيد التنفيذ' :
        t.status === 'Assigned' ? 'مسندة' : 'ملغاة'
      ),
      escapeCsvCell(`+${t.xpReward} XP`),
      escapeCsvCell(t.deadline || '—'),
      escapeCsvCell(totalSubs),
      escapeCsvCell(`${subPct}%`),
      escapeCsvCell(t.stance || 'قيد المتابعة'),
      escapeCsvCell(t.submission?.notes || '—'),
      escapeCsvCell(t.createdAt || '—')
    ];
  });

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const fileName = `سجل_المهام_والتكليفات_الميدانية_${customTitle || ''}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(csvContent, fileName);
};

/**
 * 6. Export Complaints to Excel
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
    escapeCsvCell(c.id),
    escapeCsvCell(c.title),
    escapeCsvCell(c.category),
    escapeCsvCell(c.isAnonymous ? 'هوية سرية محفوظة' : c.senderName),
    escapeCsvCell(c.senderCommitteeName),
    escapeCsvCell(c.isAnonymous ? 'نعم' : 'لا'),
    escapeCsvCell(c.status),
    escapeCsvCell(c.createdAt),
    escapeCsvCell(c.responseNotes || '—'),
    escapeCsvCell(c.respondedAt || '—')
  ]);

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  downloadCsvFile(csvContent, `سجل_الشكاوى_والمقترحات_${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * 7. Export Poll / Voting Results to Excel
 */
export const exportPollResultsToExcel = (poll: {
  question: string;
  options: { id: string; text: string; voteCount: number }[];
  votes: {
    memberId: string;
    memberName: string;
    memberVolunteerId?: string;
    committeeName: string;
    optionId: string;
    votedAt: string;
  }[];
}, customTitle?: string) => {
  const optionMap = new Map(poll.options.map(o => [o.id, o.text]));

  const headers = [
    'الرقم التطوعي الفريد',
    'اسم العضو المصوت',
    'اللجنة التابع لها',
    'الخيار الذي تم التصويت عليه',
    'توقيت التصويت',
    'سؤال الاستطلاع'
  ];

  const rows = (poll.votes || []).map(v => [
    escapeCsvCell(v.memberVolunteerId || v.memberId),
    escapeCsvCell(v.memberName),
    escapeCsvCell(v.committeeName),
    escapeCsvCell(optionMap.get(v.optionId) || v.optionId),
    escapeCsvCell(v.votedAt),
    escapeCsvCell(poll.question)
  ]);

  const csvContent = [
    headers.map(h => escapeCsvCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const cleanTitle = (customTitle || poll.question).replace(/[^a-zA-Z0-9\u0621-\u064A]/g, '_').substring(0, 30);
  const fileName = `نتائج_استطلاع_الرأي_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsvFile(csvContent, fileName);
};
