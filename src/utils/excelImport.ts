import { Member, Role } from '../types';
import { generateCommitteeVolunteerId } from './volunteerId';

export interface ParsedMemberRow {
  name: string;
  email: string;
  phone: string;
  faculty: string;
  academicYear: string;
  role: Role;
  committeeId?: string;
  committeeName?: string;
  position?: string;
  volunteerId: string;
}

export interface ParseResult {
  members: ParsedMemberRow[];
  errors: string[];
}

/**
 * Resolve committee ID and Arabic name from free text
 */
export function resolveCommittee(text: string): { id: string; name: string } {
  const clean = (text || '').trim().toLowerCase();
  if (clean.includes('تنظيم') || clean.includes('org')) {
    return { id: 'comm-org', name: 'لجنة التنظيم' };
  }
  if (clean.includes('موارد') || clean.includes('hr') || clean.includes('بشرية')) {
    return { id: 'comm-hr', name: 'لجنة الموارد البشرية' };
  }
  if (clean.includes('فوتو') || clean.includes('تصوير') || clean.includes('photo')) {
    return { id: 'comm-photo', name: 'لجنة التصوير الفوتوغرافي والفيديوغرافي' };
  }
  if (clean.includes('مونتاج') || clean.includes('فيديو') || clean.includes('video') || clean.includes('montage')) {
    return { id: 'comm-montage', name: 'لجنة المونتاج والفيديو' };
  }
  if (clean.includes('محتوى') || clean.includes('كتابة') || clean.includes('content') || clean.includes('صناعة')) {
    return { id: 'comm-content', name: 'لجنة صناعة المحتوى' };
  }
  if (clean.includes('تصميم') || clean.includes('جرافيك') || clean.includes('design') || clean.includes('ديزاين')) {
    return { id: 'comm-design', name: 'لجنة التصميم والجرافيك' };
  }
  if (clean.includes('رئيس') || clean.includes('مستشار') || clean.includes('نائب') || clean.includes('قيادة') || clean.includes('leadership')) {
    return { id: 'comm-leadership', name: 'القيادة العليا للفريق' };
  }
  return { id: 'comm-org', name: 'لجنة التنظيم' };
}

/**
 * Determine role from role column or email address
 */
export function resolveRole(roleStr: string, email: string): Role {
  const cleanRole = (roleStr || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (cleanRole.includes('رئيس فريق') || cleanRole.includes('رئيس الفريق') || cleanRole.includes('super_admin') || cleanEmail.includes('president')) {
    return 'super_admin';
  }
  if (cleanRole.includes('نائب رئيس فريق') || cleanRole.includes('نائب رئيس الفريق') || cleanRole.includes('vp') || cleanRole.includes('vice_president')) {
    return 'vice_president';
  }
  if (cleanRole.includes('مستشار') || cleanRole.includes('advisor') || cleanRole.includes('consultant')) {
    return 'advisor';
  }
  if (cleanRole.includes('منسق عام') || cleanRole.includes('coordinator') || cleanRole.includes('general_coordinator')) {
    return 'general_coordinator';
  }
  if (cleanRole.includes('عمليات') || cleanRole.includes('ميدان') || cleanRole.includes('operations')) {
    return 'operations_manager';
  }
  if (cleanRole.includes('جودة') || cleanRole.includes('تقييم مؤسسي') || cleanRole.includes('quality')) {
    return 'quality_officer';
  }
  if (cleanRole.includes('رئيس لجنة') || cleanRole.includes('head') || cleanEmail.includes('head.')) {
    return 'head';
  }
  if (cleanRole.includes('نائب رئيس لجنة') || cleanRole.includes('vice_head') || cleanEmail.includes('vicehead')) {
    return 'vice_head';
  }
  if (cleanRole.includes('موارد') || cleanRole.includes('hr_admin') || cleanEmail.includes('hr.')) {
    return 'hr_admin';
  }
  if (cleanRole.includes('فعاليات') || cleanRole.includes('مشاريع') || cleanRole.includes('event_manager')) {
    return 'event_manager';
  }
  return 'member';
}

/**
 * Parse an uploaded CSV / Excel file into structured member rows
 */
export async function parseMembersFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const errors: string[] = [];
  const members: ParsedMemberRow[] = [];

  if (lines.length === 0) {
    return { members: [], errors: ['الملف المرفوع فارغ.'] };
  }

  // Detect header line
  const firstLine = lines[0].toLowerCase();
  const isHeader = firstLine.includes('اسم') || firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('بريد');
  const dataLines = isHeader ? lines.slice(1) : lines;

  // Mock array to help generate volunteer IDs
  const existingMock: Member[] = [];

  dataLines.forEach((line, idx) => {
    // Split by comma or semicolon or tab, handling quotes
    const cols = line.split(/[,;\t]/).map(c => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 2 || !cols[0]) return;

    const name = cols[0];
    const faculty = cols[1] || 'جامعة الإسكندرية';
    const academicYear = cols[2] || 'الفرقة الثالثة';
    const phone = cols[3] || '01000000000';
    const email = cols[4] || `vol.${Date.now() + idx}@alexu.edu.eg`;
    const commRaw = cols[5] || 'لجنة التنظيم';
    const position = cols[6] || 'عضو متطوع';
    const roleRaw = cols[7] || 'عضو';

    const { id: committeeId, name: committeeName } = resolveCommittee(commRaw);
    const role = resolveRole(roleRaw, email);

    // Auto-generate committee volunteer ID (AU-001, OG-101, HR-101, etc.)
    const volunteerId = generateCommitteeVolunteerId(committeeId, role, existingMock);
    existingMock.push({
      id: `mock-${idx}`,
      volunteerId,
      fullName: name,
      universityEmail: email,
      college: faculty,
      academicYear,
      whatsappNumber: phone,
      birthDate: '2004-01-01',
      age: 21,
      nationalId: '30400000000000',
      currentCommitteeId: committeeId,
      currentCommitteeName: committeeName,
      position,
      role,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatarUrl: '',
      performance: {
        overallScore: 85,
        attendanceRate: 100,
        taskCompletionRate: 85,
        taskQuality: 4.5,
        commitment: 90,
        teamwork: 90,
        leadership: 80,
        evaluationsCount: 1,
      },
      skills: {},
      activeWorkload: 0,
      workloadStatus: 'Optimal',
      engagementRisk: 'Low',
      points: 100,
      level: 1,
      badges: [],
      committeeHistory: [],
      availability: 'Available'
    });

    members.push({
      name,
      email,
      phone,
      faculty,
      academicYear,
      role,
      committeeId,
      committeeName,
      position,
      volunteerId
    });
  });

  return { members, errors };
}

/**
 * Generate and download a sample CSV template for bulk members import
 */
export function downloadMembersTemplateCsv() {
  const headers = [
    'الاسم الكامل',
    'الكلية',
    'الفرقة الدراسية',
    'رقم الواتساب',
    'البريد الجامعي',
    'اللجنة (تنظيم / موارد بشرية / تصوير / تصميم / قيادة)',
    'المنصب',
    'الدور (رئيس الفريق / نائب رئيس الفريق / مستشار الفريق / رئيس لجنة / نائب رئيس لجنة / مسؤول موارد بشرية / عضو)'
  ];

  const sampleRows = [
    [
      'أحمد محمود الجوهري',
      'كلية الهندسة',
      'الفرقة الثالثة',
      '01012345678',
      'ahmed.gohary@alexu.edu.eg',
      'لجنة التنظيم',
      'عضو فريق التنظيم الميداني',
      'عضو'
    ],
    [
      'مريم عبد العزيز النجار',
      'كلية التجارة',
      'الفرقة الثانية',
      '01198765432',
      'mariam.naggar@alexu.edu.eg',
      'لجنة الموارد البشرية',
      'مسؤولة تقييم ومتابعة',
      'مسؤول موارد بشرية'
    ],
    [
      'كريم طارق الشناوي',
      'كلية العلوم',
      'الفرقة الرابعة',
      '01234567890',
      'karim.media@alexu.edu.eg',
      'لجنة التصوير والمونتاج',
      'مصور ومحرر فيديو',
      'عضو'
    ],
    [
      'رنا عادل السعيد',
      'كلية الفنون الجميلة',
      'الفرقة الثالثة',
      '01555554433',
      'rana.design@alexu.edu.eg',
      'لجنة التصميم والهوية',
      'مصممة جرافيك وUI',
      'عضو'
    ],
    [
      'ياسين مصطفى عثمان',
      'كلية الحقوق',
      'الفرقة الرابعة',
      '01099887766',
      'yassine.vp@alexu.edu.eg',
      'القيادة العليا للفريق',
      'نائب رئيس الفريق',
      'نائب رئيس الفريق'
    ]
  ];

  const csvRows = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ];

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `نموذج_استيراد_أعضاء_المتطوعين.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
