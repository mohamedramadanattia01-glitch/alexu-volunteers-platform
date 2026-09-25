import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Member, AppBrandingSettings } from '../types';

export interface LeadershipSignatures {
  advisorName: string;
  presidentName: string;
  vicePresidentName: string;
}

export function getLeadershipNames(members: Member[]): LeadershipSignatures {
  const advisor = members.find(m => m.role === 'advisor' || m.position.includes('مستشار'));
  const president = members.find(m => m.role === 'super_admin' || m.position.includes('رئيس الفريق') || m.position.includes('رئيس الاتحاد'));
  const vicePres = members.find(m => m.role === 'vice_president' || m.position.includes('نائب'));

  return {
    advisorName: advisor?.fullName || 'محمد رمضان',
    presidentName: president?.fullName || 'رئيس فريق المتطوعين',
    vicePresidentName: vicePres?.fullName || 'نائب رئيس الفريق'
  };
}

/**
 * Capture an HTML element and download it as an ultra high quality A4 PDF
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
      scale: 2, // High DPI resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: orientation === 'l' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
  } catch (error) {
    console.error('Error generating PDF with html2canvas:', error);
    // Fallback to print
    window.print();
  }
}

/**
 * Generates an official standalone Executive Member Portfolio PDF
 */
export async function downloadMemberPortfolioPDF(
  member: Member, 
  allMembers: Member[], 
  branding: AppBrandingSettings
): Promise<void> {
  const leadership = getLeadershipNames(allMembers);
  const logo = branding.logoUrl || '/logo.png';
  const stamp = branding.stampUrl || '/stamp.png';

  // Create temporary offscreen container styled strictly for A4 printable standard
  const container = document.createElement('div');
  container.id = 'temp-pdf-export-container';
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '35px 40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Cairo', sans-serif";
  container.style.direction = 'rtl';
  container.style.boxSizing = 'border-box';
  container.style.border = '2px solid #cbd5e1';

  const isLeadership = ['advisor', 'super_admin', 'vice_president', 'general_coordinator'].includes(member.role);

  container.innerHTML = `
    <div style="text-align: right; line-height: 1.5;">
      
      <!-- Official Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
        <div style="text-align: right;">
          <h4 style="margin: 0; font-size: 13px; color: #475569; font-weight: bold;">جمهورية مصر العربية</h4>
          <h4 style="margin: 2px 0; font-size: 13px; color: #475569; font-weight: bold;">جامعة الإسكندرية</h4>
          <h3 style="margin: 0; font-size: 16px; color: #1e3a8a; font-weight: 900;">اتحاد طلاب جامعة الإسكندرية</h3>
          <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">الإدارة العامة لرعاية الشباب • المنظومة الرقمية للمتطوعين</p>
        </div>
        <div style="text-align: center;">
          <img src="${logo}" style="width: 70px; height: 70px; object-contain: fit; border-radius: 12px;" />
        </div>
        <div style="text-align: left;">
          <span style="display: inline-block; padding: 4px 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 11px; font-weight: bold; font-family: monospace;">
            الرقم التطوعي: ${member.volunteerId || member.id}
          </span>
          <p style="margin: 4px 0 0; font-size: 10px; color: #64748b;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      <!-- Title Badge -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #1e3a8a; text-decoration: underline;">
          ${isLeadership ? 'بطاقة السيرة الذاتية والاعتماد القيادي' : 'البورتفوليو الرقمي والسجل الميداني للمتطوع'}
        </h2>
        <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">موسم النشاط الطلابي 2026 / 2027</p>
      </div>

      <!-- Member Identity Box -->
      <div style="display: flex; gap: 20px; background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 20px; align-items: center;">
        <img src="${member.avatarUrl}" style="width: 90px; height: 90px; border-radius: 14px; object-fit: cover; border: 2px solid #1e3a8a;" />
        <div style="flex: 1;">
          <h3 style="margin: 0 0 6px; font-size: 18px; color: #0f172a; font-weight: 800;">${member.fullName}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>المسمى التنظيمي:</strong> ${member.position}</div>
            <div><strong>اللجنة التخصصية:</strong> ${member.currentCommitteeName}</div>
            <div><strong>الكلية / المعهد:</strong> ${member.college}</div>
            <div><strong>الفرقة الدراسية:</strong> ${member.academicYear}</div>
            <div><strong>الرقم القومي:</strong> <span style="font-family: monospace;">${member.nationalId || '—'}</span></div>
            <div><strong>البريد الجامعي:</strong> <span style="font-family: monospace; font-size: 11px;">${member.universityEmail}</span></div>
          </div>
        </div>
      </div>

      <!-- Bio Summary -->
      ${member.bio ? `
      <div style="margin-bottom: 20px; padding: 12px 16px; background: #f1f5f9; border-right: 4px solid #1e3a8a; border-radius: 6px; font-size: 12px; color: #334155;">
        <strong>نبذة تعريفية:</strong> "${member.bio}"
      </div>
      ` : ''}

      <!-- Career History Table -->
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px; font-size: 14px; font-weight: 800; color: #1e3a8a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px;">
          السجل التاريخي والمسيرة داخل الفريق:
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">اللجنة / الإدارة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الدور والمسمى</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الموسم</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الفترة الزمنية</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">البيان / الإنجاز</th>
            </tr>
          </thead>
          <tbody>
            ${member.committeeHistory && member.committeeHistory.length > 0 ? member.committeeHistory.map(h => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${h.committeeName}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${h.role}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${h.season}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${h.startDate} - ${h.endDate}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${h.reason}</td>
              </tr>
            `).join('') : `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${member.currentCommitteeName}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${member.position}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">2026/2027</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">منذ ${member.joinDate}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">عضوية فاعلة ونشطة</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>

      <!-- Skills and Hobbies -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 11px;">
        <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fafafa;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 6px;">الهوايات ومجالات الشغف:</strong>
          <span>${member.hobbies && member.hobbies.length > 0 ? member.hobbies.join(' • ') : 'التطوع والعمل الجماعي'}</span>
        </div>
        <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #fafafa;">
          <strong style="color: #1e3a8a; display: block; margin-bottom: 6px;">تطلعات التعلم والتطوير:</strong>
          <span>${member.learningAspirations && member.learningAspirations.length > 0 ? member.learningAspirations.join(' • ') : 'القيادة وإدارة الفعاليات'}</span>
        </div>
      </div>

      <!-- Official Union Leadership Signatures & Stamp -->
      <div style="margin-top: 40px; padding-top: 15px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; text-align: center;">
        <div>
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">نائب رئيس فريق المتطوعين</p>
          <h5 style="margin: 0 0 25px; font-size: 13px; font-weight: bold; color: #0f172a;">${leadership.vicePresidentName}</h5>
          <span style="font-size: 10px; color: #94a3b8;">التوقيع: .....................</span>
        </div>

        <div style="text-align: center;">
          <img src="${stamp}" style="width: 85px; height: 85px; object-fit: contain; margin-bottom: 4px;" />
          <p style="margin: 0; font-size: 9px; font-weight: bold; color: #1e3a8a;">ختم اعتماد اتحاد الطلاب الرسمي</p>
        </div>

        <div>
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">مستشار فريق المتطوعين</p>
          <h5 style="margin: 0 0 25px; font-size: 13px; font-weight: bold; color: #0f172a;">${leadership.advisorName}</h5>
          <span style="font-size: 10px; color: #94a3b8;">التوقيع: .....................</span>
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
