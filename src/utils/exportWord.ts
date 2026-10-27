import { CVData } from '../types';

/**
 * Generates an editable Microsoft Word document (.docx) with complete structure,
 * portrait photo embed, tables, bullet points, and UTF-8 encoding preserving all Vietnamese accents.
 */
export const exportCvToWord = (
  cvData: CVData,
  templateName: string = 'CareerMaster CV',
  extension: 'docx' | 'doc' = 'docx',
  options?: {
    fontFamily?: string;
    primaryColor?: string;
  }
) => {
  const {
    contact,
    summary,
    skills,
    education,
    projects,
    experience,
    activities,
    achievements,
    certifications,
    languages,
    photo,
  } = cvData;

  const showPhoto = photo?.dataUrl && photo?.visible;
  const photoBorderRadius = photo?.shape === 'circle' ? '50%' : photo?.shape === 'rounded' ? '12px' : '0px';

  let wordFont = "'Calibri', 'Segoe UI', Arial, sans-serif";
  if (options?.fontFamily) {
    if (options.fontFamily.includes('inter')) wordFont = "'Inter', Arial, sans-serif";
    else if (options.fontFamily.includes('arial')) wordFont = "Arial, Helvetica, sans-serif";
    else if (options.fontFamily.includes('roboto')) wordFont = "'Roboto', Arial, sans-serif";
    else if (options.fontFamily.includes('times')) wordFont = "'Times New Roman', Times, serif";
    else if (options.fontFamily.includes('calibri')) wordFont = "Calibri, 'Segoe UI', Arial, sans-serif";
  }

  const primaryColor = options?.primaryColor || '#2563eb';

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${contact.fullName || 'Ung_Vien'} - CV</title>
      <style>
        @page {
          size: A4;
          margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: ${wordFont};
          font-size: 10.5pt;
          line-height: 1.4;
          color: #1e293b;
        }
        h1 {
          font-size: 20pt;
          font-weight: bold;
          color: ${primaryColor};
          margin: 0;
          padding: 0;
          text-transform: uppercase;
        }
        .title {
          font-size: 12.5pt;
          font-weight: bold;
          color: ${primaryColor};
          margin-top: 2pt;
          margin-bottom: 6pt;
          text-transform: uppercase;
        }
        .contact-info {
          font-size: 9.5pt;
          color: #475569;
          line-height: 1.6;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          border-bottom: 2pt solid ${primaryColor};
          padding-bottom: 10pt;
          margin-bottom: 14pt;
        }
        .header-left {
          vertical-align: top;
        }
        .header-photo {
          width: 95px;
          text-align: right;
          vertical-align: top;
        }
        .photo-img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border: 1.5pt solid #cbd5e1;
          border-radius: ${photoBorderRadius};
        }
        h2 {
          font-size: 12pt;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
          border-bottom: 1pt solid #93c5fd;
          padding-bottom: 3pt;
          margin-top: 14pt;
          margin-bottom: 6pt;
        }
        .item-header {
          font-weight: bold;
          font-size: 11pt;
          color: #0f172a;
        }
        .item-sub {
          font-size: 10pt;
          color: #475569;
          font-style: italic;
          margin-bottom: 3pt;
        }
        ul {
          margin-top: 3pt;
          margin-bottom: 8pt;
          padding-left: 18pt;
        }
        li {
          margin-bottom: 2pt;
        }
        p {
          margin: 4pt 0;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td class="header-left">
            <h1>${contact.fullName}</h1>
            <div class="title">${contact.title}</div>
            <div class="contact-info">
              <span>📍 ${contact.location}</span> &nbsp;|&nbsp;
              <span>✉️ ${contact.email}</span> &nbsp;|&nbsp;
              <span>📞 ${contact.phone}</span>
              ${contact.linkedin ? ` &nbsp;|&nbsp; <span>🔗 ${contact.linkedin}</span>` : ''}
              ${contact.github ? ` &nbsp;|&nbsp; <span>💻 ${contact.github}</span>` : ''}
            </div>
          </td>
          ${showPhoto ? `
            <td class="header-photo">
              <img src="${photo.dataUrl}" class="photo-img" alt="${contact.fullName}" />
            </td>
          ` : ''}
        </tr>
      </table>

      ${summary ? `
        <h2>Tóm Tắt Chuyên Môn</h2>
        <p style="text-align: justify; line-height: 1.5;">${summary}</p>
      ` : ''}

      ${skills && (skills.technical.length > 0 || skills.core.length > 0 || skills.tools.length > 0 || skills.soft.length > 0) ? `
        <h2>Kỹ Năng Chuyên Môn</h2>
        ${skills.technical.length > 0 ? `<p><strong>Kỹ năng chuyên môn / Công nghệ:</strong> ${skills.technical.join(', ')}</p>` : ''}
        ${skills.core.length > 0 ? `<p><strong>Nền tảng cốt lõi:</strong> ${skills.core.join(', ')}</p>` : ''}
        ${skills.tools.length > 0 ? `<p><strong>Công cụ & Phần mềm:</strong> ${skills.tools.join(', ')}</p>` : ''}
        ${skills.soft.length > 0 ? `<p><strong>Kỹ năng mềm:</strong> ${skills.soft.join(', ')}</p>` : ''}
      ` : ''}

      ${education && education.length > 0 ? `
        <h2>Học Vấn</h2>
        ${education.map(e => `
          <div style="margin-bottom: 8pt;">
            <div class="item-header">${e.school}</div>
            <div class="item-sub">${e.degree} - ${e.major} (${e.year}) ${e.gpa ? `| GPA: ${e.gpa}` : ''}</div>
            ${e.coursework && e.coursework.length > 0 ? `<p style="font-size: 10pt; margin: 2pt 0; color: #475569;"><em>Môn học tiêu biểu:</em> ${e.coursework.join(', ')}</p>` : ''}
          </div>
        `).join('')}
      ` : ''}

      ${projects && projects.length > 0 ? `
        <h2>Đồ Án & Dự Án Tiêu Biểu</h2>
        ${projects.map(p => `
          <div style="margin-bottom: 10pt;">
            <div class="item-header">${p.name} - ${p.role} (${p.period})</div>
            ${p.techStack && p.techStack.length > 0 ? `<div style="font-size: 10pt; color: #0284c7; margin-bottom: 2pt;"><strong>Công nghệ:</strong> ${p.techStack.join(', ')}</div>` : ''}
            ${p.objective ? `<p style="font-size: 10pt; margin: 2pt 0; color: #475569;"><em>Mục tiêu:</em> ${p.objective}</p>` : ''}
            <ul>
              ${p.bulletPoints.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}

      ${experience && experience.length > 0 ? `
        <h2>Kinh Nghiệm Thực Tế</h2>
        ${experience.map(exp => `
          <div style="margin-bottom: 10pt;">
            <div class="item-header">${exp.company} - ${exp.role}</div>
            <div class="item-sub">${exp.location} | ${exp.period}</div>
            <ul>
              ${exp.bulletPoints.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      ` : ''}

      ${activities && activities.length > 0 ? `
        <h2>Hoạt Động & Ngoại Khóa</h2>
        ${activities.map(a => `
          <p style="margin-bottom: 4pt;">
            <strong>${a.name}</strong> - ${a.role} (${a.period}): ${a.impact}
          </p>
        `).join('')}
      ` : ''}

      ${certifications && certifications.length > 0 ? `
        <h2>Chứng Chỉ Quốc Tế</h2>
        <ul>
          ${certifications.map(c => `<li><strong>${c.name}</strong> - ${c.issuer} (${c.year})</li>`).join('')}
        </ul>
      ` : ''}

      ${achievements && achievements.length > 0 ? `
        <h2>Giải Thưởng & Thành Tích</h2>
        <ul>
          ${achievements.map(ach => `<li>${ach}</li>`).join('')}
        </ul>
      ` : ''}

      ${languages && languages.length > 0 ? `
        <h2>Ngoại Ngữ</h2>
        <p>${languages.join(', ')}</p>
      ` : ''}
    </body>
    </html>
  `;

  // Prepend UTF-8 BOM so Word recognizes all Vietnamese diacritics
  const mimeType = extension === 'docx'
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'
    : 'application/msword;charset=utf-8';

  const blob = new Blob(['\uFEFF' + content], {
    type: mimeType,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${contact.fullName.replace(/\s+/g, '_')}_CV_${templateName.replace(/\s+/g, '_')}.${extension}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
