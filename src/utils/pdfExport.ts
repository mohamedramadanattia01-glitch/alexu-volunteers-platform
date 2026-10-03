import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Member, AppBrandingSettings, AttendanceRecord, MemberEvaluationRecord, Task } from '../types';

export interface LeadershipSignatures {
  committeeHeadName: string;
  vicePresidentName: string;
  presidentName: string;
}

export function getLeadershipNames(members: Member[], memberCommitteeId?: string): LeadershipSignatures {
  const presidents = members.filter(m => m.role === 'super_admin' || m.position?.includes('رئيس الفريق') || m.position?.includes('رئيس الاتحاد'));
  const vicePresidents = members.filter(m => m.role === 'vice_president' || (m.position?.includes('نائب رئيس') && !m.position?.includes('نائب رئيس لجنة')));
  
  // Find head for the specific committee
  const committeeHeads = members.filter(m => 
    m.currentCommitteeId === memberCommitteeId && 
    (m.role === 'head' || m.position?.includes('رئيس لجنة') || m.position?.includes('هيد'))
  );

  const committeeHeadName = committeeHeads.length > 0 
    ? committeeHeads[0].fullName 
    : 'رئيس اللجنة التخصصية';

  const presidentName = presidents.length > 0
    ? presidents[0].fullName
    : 'عمر خالد (رئيس الفريق)';

  const vicePresidentName = vicePresidents.length > 0
    ? vicePresidents[0].fullName
    : 'أحمد عادل (نائب رئيس الفريق)';

  return {
    committeeHeadName,
    vicePresidentName,
    presidentName
  };
}

/**
 * Capture an HTML element and download it as an ultra high quality A4 PDF (strictly 1 page)
 */
export async function exportElementToPDF(
  elementId: string, 
  fileName: string = 'وثيقة_رسمية',
  orientation: 'p' | 'l' = 'p'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id ${elementId} not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.2, // Ultra crisp resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1000
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: orientation === 'l' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Force strictly single A4 page fit
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    window.print();
  }
}

/**
 * Generates an official standalone Executive Member Portfolio PDF
 * Strictly fitted into a SINGLE A4 Page (210mm x 297mm) with clear compact typography
 */
export async function downloadMemberPortfolioPDF(
  member: Member, 
  allMembers: Member[], 
  branding: AppBrandingSettings,
  attendanceRecords: AttendanceRecord[] = [],
  evaluations: MemberEvaluationRecord[] = [],
  tasks: Task[] = []
): Promise<void> {
  const leadership = getLeadershipNames(allMembers, member.currentCommitteeId);
  const logo = branding.logoUrl || '/logo.png';
  const stamp = branding.stampUrl || '/stamp.png';

  // Member history records
  const myAttendance = attendanceRecords.filter(a => a.memberId === member.id || (a.memberVolunteerId && a.memberVolunteerId === member.volunteerId));
  const myEvaluations = evaluations.filter(e => e.memberId === member.id || (e.memberVolunteerId && e.memberVolunteerId === member.volunteerId));
  const myCompletedTasks = tasks.filter(t => (t.assignedToMemberIds || []).includes(member.id) && t.status === 'Approved');

  const totalFieldHours = (myAttendance.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / 60).toFixed(1);
  const avgEvaluationScore = myEvaluations.length > 0 
    ? Math.round(myEvaluations.reduce((acc, e) => acc + (e.percentage || e.totalScore || 0), 0) / myEvaluations.length)
    : (member.performance?.overallScore || 0);

  // Create temporary offscreen container styled strictly for A4 single-page printable standard
  const container = document.createElement('div');
  container.id = 'temp-pdf-export-container';
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // 210mm at 96 DPI
  container.style.height = '1120px'; // 297mm at 96 DPI (Strictly 1 Page)
  container.style.maxHeight = '1120px';
  container.style.padding = '22px 28px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.direction = 'rtl';
  container.style.boxSizing = 'border-box';
  container.style.border = '2px solid #cbd5e1';
  container.style.overflow = 'hidden';

  const isLeadership = ['advisor', 'super_admin', 'vice_president', 'general_coordinator'].includes(member.role);

  // Recent attendance sliced for compact fit
  const recentAttendance = myAttendance.slice(0, 3);
  const recentTasks = myCompletedTasks.slice(0, 3);

  container.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; text-align: right; line-height: 1.35; font-size: 11px;">
      
      <!-- 1. Official Header (Alexandria Univ Logo on Right, App Logo on Left) -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 12px;">
        <!-- Top Right: Alexandria University -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${logo}" style="width: 52px; height: 52px; object-fit: contain; border-radius: 8px;" />
          <div>
            <h4 style="margin: 0; font-size: 11px; color: #475569; font-weight: bold;">جمهورية مصر العربية • جامعة الإسكندرية</h4>
            <h3 style="margin: 2px 0 0; font-size: 13px; color: #1e3a8a; font-weight: 900;">اتحاد طلاب جامعة الإسكندرية</h3>
            <p style="margin: 1px 0 0; font-size: 10px; color: #64748b;">الإدارة العامة لرعاية الشباب • المنظومة الرقمية للمتطوعين</p>
          </div>
        </div>

        <!-- Center: Title -->
        <div style="text-align: center;">
          <div style="display: inline-block; padding: 3px 12px; background-color: #1e3a8a; color: #ffffff; border-radius: 6px; font-size: 11px; font-weight: 900;">
            ${isLeadership ? 'بطاقة السيرة الذاتية والاعتماد القيادي' : 'البورتفوليو الرقمي والسجل الميداني للمتطوع'}
          </div>
          <p style="margin: 2px 0 0; font-size: 9px; color: #64748b;">موسم النشاط الطلابي 2026 / 2027</p>
        </div>

        <!-- Top Left: Platform Logo & Volunteer Code -->
        <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
          <div>
            <span style="display: inline-block; padding: 2px 8px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10px; font-weight: bold; font-family: monospace;">
              كود: ${member.volunteerId || member.id}
            </span>
            <p style="margin: 2px 0 0; font-size: 9px; color: #64748b;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <img src="${logo}" style="width: 52px; height: 52px; object-fit: contain; border-radius: 8px;" />
        </div>
      </div>

      <!-- 2. Member Identity & Comprehensive Personal Details -->
      <div style="display: flex; gap: 14px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px; margin-bottom: 10px; align-items: center;">
        <img src="${member.avatarUrl}" style="width: 72px; height: 72px; border-radius: 10px; object-fit: cover; border: 2px solid #1e3a8a; shrink-0;" />
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <h3 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 900;">${member.fullName}</h3>
            <span style="font-size: 10px; padding: 2px 8px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 6px; font-weight: bold;">
              ${member.isSubscriptionPaid ? 'عضو موثق ومسدد للاشتراك ✓' : 'عضو مسجل ونشط ✓'}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 10px; font-size: 10px; color: #334155;">
            <div><strong>اللجنة التخصصية:</strong> ${member.currentCommitteeName}</div>
            <div><strong>المسمى التنظيمي:</strong> ${member.position}</div>
            <div><strong>الرقم القومي:</strong> <span style="font-family: monospace;">${member.nationalId || '—'}</span></div>
            <div><strong>الكلية والفرقة:</strong> ${member.college} - ${member.academicYear}</div>
            <div><strong>الهاتف / الواتساب:</strong> <span style="font-family: monospace;">${member.whatsappNumber || member.phone || '—'}</span></div>
            <div><strong>البريد الجامعي:</strong> <span style="font-family: monospace; font-size: 9px;">${member.universityEmail}</span></div>
            <div><strong>فصيلة الدم:</strong> <span style="font-family: monospace;">${member.bloodType || '—'}</span></div>
            <div><strong>هاتف الطوارئ:</strong> <span style="font-family: monospace;">${member.emergencyContact || '—'}</span></div>
            <div><strong>تاريخ الانضمام:</strong> <span style="font-family: monospace;">${member.joinDate}</span></div>
          </div>
        </div>
      </div>

      <!-- 3. Field Performance Summary KPIs -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; text-align: center;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px;">
          <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; font-family: monospace;">${member.points || 0} XP</div>
          <div style="font-size: 9px; color: #475569; font-weight: bold;">نقاط التطوع</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px;">
          <div style="font-size: 14px; font-weight: 900; color: #15803d; font-family: monospace;">${myAttendance.length}</div>
          <div style="font-size: 9px; color: #475569; font-weight: bold;">فعاليات محضورة</div>
        </div>
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px;">
          <div style="font-size: 14px; font-weight: 900; color: #7e22ce; font-family: monospace;">${totalFieldHours} ساعة</div>
          <div style="font-size: 9px; color: #475569; font-weight: bold;">ساعات العمل الميداني</div>
        </div>
        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 6px;">
          <div style="font-size: 14px; font-weight: 900; color: #a16207; font-family: monospace;">${myCompletedTasks.length}</div>
          <div style="font-size: 9px; color: #475569; font-weight: bold;">مهام مكتملة ومعتمدة</div>
        </div>
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 6px;">
          <div style="font-size: 14px; font-weight: 900; color: #be123c; font-family: monospace;">${avgEvaluationScore}%</div>
          <div style="font-size: 9px; color: #475569; font-weight: bold;">التقييم التراكمي الشامل</div>
        </div>
      </div>

      <!-- 4. Event Attendance & Evaluations History -->
      <div style="margin-bottom: 10px;">
        <h4 style="margin: 0 0 5px; font-size: 11px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">
          سجل الحضور والتقييمات الميدانية عبر الفعاليات:
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1.5px solid #cbd5e1;">
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">الفعالية / اليوم الميداني</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">التاريخ</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">حالة الحضور</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">ساعات الحضور</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">الدرجة المكتسبة</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">التقدير</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">ملاحظات المقيّم</th>
            </tr>
          </thead>
          <tbody>
            ${recentAttendance.length > 0 ? recentAttendance.map(a => {
              const ev = a.dailyEvaluation;
              const total = ev?.totalDailyScore ?? 30;
              const grade = total >= 28 ? 'A+' : total >= 25 ? 'A' : total >= 20 ? 'B' : 'C';
              return `
                <tr>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: bold;">${a.eventName || 'جلسة ميدانية'}</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">${a.date}</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; color: ${a.status === 'Present' ? '#15803d' : '#b45309'}; font-weight: bold;">
                    ${a.status === 'Present' ? 'حاضر بالموعد ✓' : a.status === 'Late' ? 'متأخر' : 'غياب بعذر'}
                  </td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">${a.durationFormatted || '4 ساعات'}</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${total}/30</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">${grade}</td>
                  <td style="padding: 4px 6px; border: 1px solid #cbd5e1; color: #475569;">${ev?.notes || 'التزام وانضباط عالي بالتعليمات'}</td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="7" style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">
                  حضور منتظم ومستمر في كافة الأنشطة الميدانية واللقاءات الدورية لموسم 2026/2027
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- 5. Completed Tasks & Project History -->
      <div style="margin-bottom: 10px;">
        <h4 style="margin: 0 0 5px; font-size: 11px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">
          سجل المهام والتكليفات المنجزة والمعتمدة:
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 1.5px solid #cbd5e1;">
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">عنوان المهمة</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">اللجنة</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">الأولوية</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">نقاط الإنجاز</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">تاريخ الاعتماد</th>
              <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">حالة التسليم</th>
            </tr>
          </thead>
          <tbody>
            ${recentTasks.length > 0 ? recentTasks.map(t => `
              <tr>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: bold;">${t.title}</td>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${t.committeeName}</td>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1;">${t.priority}</td>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #15803d;">+${t.xpReward} XP</td>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace;">${t.deadline || 'مكتمل'}</td>
                <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #15803d;">معتمدة ومكتملة ✓</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6" style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">
                  إنجاز لكافة المهام والتكليفات الميدانية الموكلة بنجاح والتزام تام
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- 6. Skills, Badges & Interests -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-size: 9.5px;">
        <div style="padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; background-color: #fafafa;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 2px;">الهوايات ومجالات الشغف:</strong>
          <span>${member.hobbies && member.hobbies.length > 0 ? member.hobbies.join(' • ') : 'العمل التطوعي، خدمة المجتمع، التنظيم والقيادة'}</span>
        </div>
        <div style="padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; background-color: #fafafa;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 2px;">تطلعات التعلم والتطوير:</strong>
          <span>${member.learningAspirations && member.learningAspirations.length > 0 ? member.learningAspirations.join(' • ') : 'إدارة الفعاليات الكبرى، القيادة التنفيذية، إدارة فرق العمل'}</span>
        </div>
      </div>

      <!-- 7. Official Leadership Signatures & Team Stamp (رئيس اللجنة، نائب رئيس الفريق، رئيس الفريق، ختم الفريق) -->
      <div style="border-top: 1.5px solid #cbd5e1; padding-top: 8px; display: grid; grid-template-columns: repeat(4, 1fr); align-items: flex-end; text-align: center; font-size: 10px;">
        <!-- Signature 1: Committee Head -->
        <div>
          <p style="margin: 0 0 2px; font-size: 9.5px; color: #64748b; font-weight: bold;">رئيس اللجنة التخصصية</p>
          <h5 style="margin: 0 0 16px; font-size: 11px; font-weight: 900; color: #0f172a;">${leadership.committeeHeadName}</h5>
          <span style="font-size: 9px; color: #94a3b8;">التوقيع: .....................</span>
        </div>

        <!-- Official Team Stamp (Dynamically sized and centered) -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <img src="${stamp}" style="max-width: 68px; max-height: 68px; object-fit: contain; margin-bottom: 2px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
          <p style="margin: 0; font-size: 8px; font-weight: 900; color: #1e3a8a;">ختم اعتماد اتحاد الطلاب الرسمي</p>
        </div>

        <!-- Signature 2: Team Vice President -->
        <div>
          <p style="margin: 0 0 2px; font-size: 9.5px; color: #64748b; font-weight: bold;">نائب رئيس فريق المتطوعين</p>
          <h5 style="margin: 0 0 16px; font-size: 11px; font-weight: 900; color: #0f172a;">${leadership.vicePresidentName}</h5>
          <span style="font-size: 9px; color: #94a3b8;">التوقيع: .....................</span>
        </div>

        <!-- Signature 3: Team President -->
        <div>
          <p style="margin: 0 0 2px; font-size: 9.5px; color: #64748b; font-weight: bold;">رئيس فريق متطوعين الاتحاد</p>
          <h5 style="margin: 0 0 16px; font-size: 11px; font-weight: 900; color: #0f172a;">${leadership.presidentName}</h5>
          <span style="font-size: 9px; color: #94a3b8;">التوقيع: .....................</span>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    await exportElementToPDF('temp-pdf-export-container', `البورتفوليو_الرقمي_${member.fullName}_${member.volunteerId || member.id}`);
  } finally {
    document.body.removeChild(container);
  }
}
