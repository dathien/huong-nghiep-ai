import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  Code2,
  Sparkles,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FolderGit2
} from 'lucide-react';
import { CVData, CVTemplateId, CVThemeConfig } from '../types';
import { getTemplateById } from './templateRegistry';

interface CVRendererProps {
  cvData: CVData;
  templateId: CVTemplateId | string;
  themeConfig?: Partial<CVThemeConfig>;
  isPrintMode?: boolean;
}

export const CVRenderer: React.FC<CVRendererProps> = ({
  cvData,
  templateId,
  themeConfig = {},
  isPrintMode = false,
}) => {
  const templateMeta = getTemplateById(templateId);

  // Fallback defaults for theme config
  const primaryColor = themeConfig.primaryColor || templateMeta.defaultThemeColor;
  const fontFamilyClass = themeConfig.fontFamily || 'font-vietnam';
  const fontSize = themeConfig.fontSize || 'standard';
  const showPhoto = themeConfig.showPhoto ?? (cvData.photo?.visible ?? templateMeta.supportsPhoto);
  const photoShape = themeConfig.photoShape || cvData.photo?.shape || 'circle';

  const visibleSections = {
    summary: themeConfig.visibleSections?.summary ?? true,
    skills: themeConfig.visibleSections?.skills ?? true,
    education: themeConfig.visibleSections?.education ?? true,
    projects: themeConfig.visibleSections?.projects ?? true,
    experience: themeConfig.visibleSections?.experience ?? true,
    activities: themeConfig.visibleSections?.activities ?? true,
    certifications: themeConfig.visibleSections?.certifications ?? true,
    achievements: themeConfig.visibleSections?.achievements ?? true,
    languages: themeConfig.visibleSections?.languages ?? true,
  };

  const { contact, summary, skills, education, projects, experience, activities, achievements, certifications, languages, photo } = cvData;

  // Font sizing scale
  const sizeClasses = {
    compact: {
      name: 'text-xl sm:text-2xl',
      title: 'text-xs sm:text-sm',
      heading: 'text-xs',
      body: 'text-[11px] leading-snug',
      sub: 'text-[10px]',
      padding: 'p-5 sm:p-6',
      gap: 'space-y-3.5',
    },
    standard: {
      name: 'text-2xl sm:text-3xl',
      title: 'text-sm sm:text-base',
      heading: 'text-xs sm:text-sm',
      body: 'text-xs leading-relaxed',
      sub: 'text-[11px]',
      padding: 'p-6 sm:p-8',
      gap: 'space-y-4 sm:space-y-5',
    },
    relaxed: {
      name: 'text-3xl sm:text-4xl',
      title: 'text-base sm:text-lg',
      heading: 'text-sm sm:text-base',
      body: 'text-[13px] leading-relaxed',
      sub: 'text-xs',
      padding: 'p-8 sm:p-10',
      gap: 'space-y-5 sm:space-y-6',
    },
  }[fontSize];

  // Helper: Render Photo
  const renderPhoto = (sizeClass: string = 'w-24 h-24') => {
    if (!showPhoto || !photo?.dataUrl) return null;
    const shapeClass =
      photoShape === 'circle'
        ? 'rounded-full'
        : photoShape === 'square'
        ? 'rounded-none'
        : 'rounded-2xl';

    return (
      <div className="flex-shrink-0">
        <div
          className={`${sizeClass} ${shapeClass} overflow-hidden border-2 bg-slate-100 shadow-xs flex items-center justify-center`}
          style={{ borderColor: primaryColor }}
        >
          <img
            src={photo.dataUrl}
            alt={contact.fullName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  };

  // Helper: Section Title
  const renderSectionTitle = (title: string, icon?: React.ReactNode) => (
    <div className="flex items-center gap-2 border-b pb-1.5 mb-2.5" style={{ borderColor: `${primaryColor}40` }}>
      {icon && <span style={{ color: primaryColor }}>{icon}</span>}
      <h3
        className={`${sizeClasses.heading} font-black uppercase tracking-wider`}
        style={{ color: primaryColor }}
      >
        {title}
      </h3>
    </div>
  );

  // Common Contact Links Row
  const renderContactItems = (layout: 'row' | 'column' = 'row', textColor: string = 'text-slate-600') => (
    <div
      className={`${
        layout === 'row'
          ? 'flex flex-wrap items-center gap-x-4 gap-y-1.5'
          : 'flex flex-col gap-1.5'
      } ${sizeClasses.sub} ${textColor}`}
    >
      {contact.email && (
        <span className="flex items-center gap-1">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
          <span>{contact.email}</span>
        </span>
      )}
      {contact.phone && (
        <span className="flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
          <span>{contact.phone}</span>
        </span>
      )}
      {contact.location && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
          <span>{contact.location}</span>
        </span>
      )}
      {contact.linkedin && (
        <span className="flex items-center gap-1">
          <Linkedin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
          <span className="truncate max-w-[140px]">{contact.linkedin}</span>
        </span>
      )}
      {contact.github && (
        <span className="flex items-center gap-1">
          <Github className="w-3.5 h-3.5 flex-shrink-0 text-slate-800" />
          <span className="truncate max-w-[140px]">{contact.github}</span>
        </span>
      )}
      {contact.portfolio && (
        <span className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
          <span className="truncate max-w-[140px]">{contact.portfolio}</span>
        </span>
      )}
    </div>
  );

  // =========================================================================
  // ARCHETYPE 1: SINGLE-COLUMN (ATS, Starter, Minimalist, Intern Basic)
  // =========================================================================
  const renderSingleColumnLayout = () => {
    const isClassicAts = templateMeta.id === 'ats-classic';
    const isTechnicalAts = templateMeta.id === 'ats-technical';
    const isGraduateAts = templateMeta.id === 'ats-graduate';
    const isMinimalist = templateMeta.id === 'pro-minimalist';

    return (
      <div className={`space-y-4 ${sizeClasses.body}`}>
        {/* Header */}
        <div
          className={`${
            isClassicAts || isMinimalist ? 'text-center border-b pb-4' : 'flex items-center gap-5 border-b pb-4'
          }`}
          style={{ borderColor: isClassicAts ? '#cbd5e1' : `${primaryColor}40` }}
        >
          {showPhoto && !isClassicAts && !isMinimalist && renderPhoto('w-20 h-20 sm:w-24 sm:h-24')}

          <div className={isClassicAts || isMinimalist ? 'space-y-1' : 'flex-1'}>
            <h1
              className={`${sizeClasses.name} font-black tracking-tight`}
              style={{ color: isClassicAts ? '#0f172a' : primaryColor }}
            >
              {contact.fullName}
            </h1>
            <p className={`${sizeClasses.title} font-bold text-slate-600 mb-2`}>
              {contact.title}
            </p>
            <div className={isClassicAts || isMinimalist ? 'flex justify-center' : ''}>
              {renderContactItems('row')}
            </div>
          </div>
        </div>

        {/* Technical ATS: Keyword Index Upfront */}
        {isTechnicalAts && visibleSections.skills && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
              Chỉ mục từ khóa kỹ thuật (Core Competencies & Keywords)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.technical.concat(skills.tools).map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-300 text-slate-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {visibleSections.summary && summary && (
          <div>
            {renderSectionTitle('Tóm Tắt Chuyên Môn')}
            <p className="text-slate-700 leading-relaxed font-normal">{summary}</p>
          </div>
        )}

        {/* Graduate ATS: Education & Coursework prioritized at top */}
        {isGraduateAts && visibleSections.education && education.length > 0 && (
          <div>
            {renderSectionTitle('Học Vấn & Quá Trình Đào Tạo')}
            <div className="space-y-3">
              {education.map((e, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{e.school}</h4>
                    <p className="text-slate-600 text-[11px] italic">
                      {e.degree} - {e.major} {e.gpa && `| GPA: ${e.gpa}`}
                    </p>
                    {e.coursework && e.coursework.length > 0 && (
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        Môn học tiêu biểu: {e.coursework.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {e.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {visibleSections.projects && projects.length > 0 && (
          <div>
            {renderSectionTitle('Đồ Án & Dự Án Tiêu Biểu')}
            <div className="space-y-3.5">
              {projects.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-500">{p.period}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span style={{ color: primaryColor }}>Vai trò: {p.role}</span>
                    {p.techStack.length > 0 && (
                      <span>• Tech: {p.techStack.join(', ')}</span>
                    )}
                  </div>
                  {p.objective && (
                    <p className="text-slate-600 italic text-[11px]">{p.objective}</p>
                  )}
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                    {p.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {visibleSections.experience && experience.length > 0 && (
          <div>
            {renderSectionTitle('Kinh Nghiệm Thực Tế')}
            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900">{exp.company}</h4>
                    <span className="text-[10px] font-semibold text-slate-500">{exp.period}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600" style={{ color: primaryColor }}>
                    {exp.role} {exp.location && `• ${exp.location}`}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                    {exp.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-Graduate Education */}
        {!isGraduateAts && visibleSections.education && education.length > 0 && (
          <div>
            {renderSectionTitle('Học Vấn')}
            <div className="space-y-3">
              {education.map((e, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{e.school}</h4>
                    <p className="text-slate-600 text-[11px]">
                      {e.degree} - {e.major} {e.gpa && `| GPA: ${e.gpa}`}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{e.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {visibleSections.skills && (
          <div>
            {renderSectionTitle('Kỹ Năng')}
            <div className="space-y-1.5 text-[11px]">
              {skills.technical.length > 0 && (
                <p>
                  <strong className="text-slate-900">Kỹ thuật & Công nghệ:</strong>{' '}
                  <span className="text-slate-700">{skills.technical.join(', ')}</span>
                </p>
              )}
              {skills.core.length > 0 && (
                <p>
                  <strong className="text-slate-900">Nền tảng cốt lõi:</strong>{' '}
                  <span className="text-slate-700">{skills.core.join(', ')}</span>
                </p>
              )}
              {skills.tools.length > 0 && (
                <p>
                  <strong className="text-slate-900">Công cụ:</strong>{' '}
                  <span className="text-slate-700">{skills.tools.join(', ')}</span>
                </p>
              )}
              {skills.soft.length > 0 && (
                <p>
                  <strong className="text-slate-900">Kỹ năng mềm:</strong>{' '}
                  <span className="text-slate-700">{skills.soft.join(', ')}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Activities & Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleSections.activities && activities.length > 0 && (
            <div>
              {renderSectionTitle('Hoạt Động')}
              <div className="space-y-1.5">
                {activities.map((a, idx) => (
                  <p key={idx} className="text-[11px]">
                    <strong className="text-slate-900">{a.name}</strong> ({a.role}): {a.impact}
                  </p>
                ))}
              </div>
            </div>
          )}

          {visibleSections.certifications && certifications.length > 0 && (
            <div>
              {renderSectionTitle('Chứng Chỉ')}
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                {certifications.map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.name}</strong> - {c.issuer} ({c.year})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // ARCHETYPE 2: TWO-COLUMN LEFT SIDEBAR (Pro Modern, Tech Developer, Creative Design)
  // =========================================================================
  const renderTwoColumnLeftLayout = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (35% or 4 of 12 cols) */}
        <div
          className="md:col-span-4 bg-slate-50/90 border-r border-slate-200/80 p-4 sm:p-5 rounded-2xl space-y-5"
          style={{ borderTop: `4px solid ${primaryColor}` }}
        >
          {/* Photo */}
          {showPhoto && (
            <div className="flex justify-center pb-1">
              {renderPhoto('w-28 h-28')}
            </div>
          )}

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-black uppercase tracking-wider mb-2"
              style={{ color: primaryColor }}
            >
              Liên Hệ
            </h4>
            {renderContactItems('column')}
          </div>

          {/* Skills */}
          {visibleSections.skills && (
            <div>
              <h4
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: primaryColor }}
              >
                Kỹ Năng
              </h4>
              <div className="space-y-2">
                {skills.technical.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Kỹ thuật
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skills.technical.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Công cụ
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skills.tools.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.soft.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Kỹ năng mềm
                    </span>
                    <p className="text-[11px] text-slate-600 leading-snug">{skills.soft.join(' • ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {visibleSections.languages && languages.length > 0 && (
            <div>
              <h4
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: primaryColor }}
              >
                Ngoại Ngữ
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {visibleSections.certifications && certifications.length > 0 && (
            <div>
              <h4
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: primaryColor }}
              >
                Chứng Chỉ
              </h4>
              <div className="space-y-1.5 text-[10px]">
                {certifications.map((c, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-slate-500">{c.issuer} ({c.year})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Column (65% or 8 of 12 cols) */}
        <div className="md:col-span-8 space-y-5">
          {/* Main Title Banner */}
          <div className="border-b pb-3.5" style={{ borderColor: `${primaryColor}40` }}>
            <h1 className={`${sizeClasses.name} font-black tracking-tight text-slate-900`}>
              {contact.fullName}
            </h1>
            <p className={`${sizeClasses.title} font-bold mt-0.5`} style={{ color: primaryColor }}>
              {contact.title}
            </p>
          </div>

          {/* Summary */}
          {visibleSections.summary && summary && (
            <div>
              {renderSectionTitle('Giới Thiệu Bản Thân')}
              <p className="text-slate-700 leading-relaxed font-normal text-xs">{summary}</p>
            </div>
          )}

          {/* Projects */}
          {visibleSections.projects && projects.length > 0 && (
            <div>
              {renderSectionTitle('Đồ Án Tiêu Biểu')}
              <div className="space-y-3.5">
                {projects.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                      <span className="text-[10px] font-medium text-slate-500">{p.period}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700">
                      <span>{p.role}</span>
                      {p.techStack.length > 0 && <span>• {p.techStack.join(', ')}</span>}
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
                      {p.bulletPoints.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {visibleSections.experience && experience.length > 0 && (
            <div>
              {renderSectionTitle('Kinh Nghiệm Làm Việc')}
              <div className="space-y-3.5">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs text-slate-900">{exp.company}</h4>
                      <span className="text-[10px] font-medium text-slate-500">{exp.period}</span>
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                      {exp.role} {exp.location && `| ${exp.location}`}
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
                      {exp.bulletPoints.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {visibleSections.education && education.length > 0 && (
            <div>
              {renderSectionTitle('Học Vấn')}
              <div className="space-y-2.5">
                {education.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{e.school}</h4>
                      <p className="text-slate-600 text-[11px]">
                        {e.degree} - {e.major} {e.gpa && `| GPA: ${e.gpa}`}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{e.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {visibleSections.activities && activities.length > 0 && (
            <div>
              {renderSectionTitle('Hoạt Động Xã Hội')}
              <div className="space-y-1.5 text-[11px]">
                {activities.map((a, idx) => (
                  <p key={idx}>
                    <strong className="text-slate-900">{a.name}</strong> ({a.role}): {a.impact}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // ARCHETYPE 3: TIMELINE & ACTIVITY LAYOUT (Student Activity, Creative Media)
  // =========================================================================
  const renderTimelineLayout = () => {
    return (
      <div className={`space-y-5 ${sizeClasses.body}`}>
        {/* Header with Top Gradient Banner */}
        <div
          className="rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center gap-5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, #1e1b4b)` }}
        >
          {showPhoto && renderPhoto('w-24 h-24 border-white')}
          <div className="text-center sm:text-left flex-1">
            <h1 className={`${sizeClasses.name} font-black tracking-tight text-white`}>
              {contact.fullName}
            </h1>
            <p className={`${sizeClasses.title} font-bold text-blue-100 mb-2`}>
              {contact.title}
            </p>
            {renderContactItems('row', 'text-white/90')}
          </div>
        </div>

        {/* Summary */}
        {visibleSections.summary && summary && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[11px] font-black uppercase text-slate-400 block mb-1">
              Thông điệp & Triết lý hành động
            </span>
            <p className="text-slate-700 italic text-xs leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Timeline Activities & Experience */}
        {visibleSections.activities && activities.length > 0 && (
          <div>
            {renderSectionTitle('Dấu Ấn Hoạt Động & Kinh Nghiệm', <Calendar className="w-4 h-4" />)}
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {activities.map((a, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div
                    className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-xs text-slate-900">{a.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {a.period}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                    Vai trò: {a.role}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{a.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {visibleSections.projects && projects.length > 0 && (
          <div>
            {renderSectionTitle('Đồ Án & Dự Án Đã Thực Hiện')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {projects.map((p, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                    <span className="text-[10px] text-slate-400">{p.period}</span>
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: primaryColor }}>{p.role}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                    {p.bulletPoints.slice(0, 2).map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Skills Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {visibleSections.education && education.length > 0 && (
            <div>
              {renderSectionTitle('Học Vấn')}
              {education.map((e, idx) => (
                <div key={idx} className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">{e.school}</h4>
                  <p className="text-[11px] text-slate-600">{e.degree} - {e.major} ({e.year})</p>
                  {e.gpa && <p className="text-[10px] font-bold text-emerald-600">GPA: {e.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {visibleSections.skills && (
            <div>
              {renderSectionTitle('Kỹ Năng Cốt Lõi')}
              <div className="flex flex-wrap gap-1.5">
                {skills.core.concat(skills.soft).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // ARCHETYPE 4: PROJECT-FIRST GRID SHOWCASE (Tech Project, Creative Portfolio)
  // =========================================================================
  const renderProjectFirstLayout = () => {
    return (
      <div className={`space-y-5 ${sizeClasses.body}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
          <div className="flex items-center gap-4">
            {showPhoto && renderPhoto('w-20 h-20 sm:w-24 sm:h-24')}
            <div>
              <h1 className={`${sizeClasses.name} font-black text-slate-900 tracking-tight`}>
                {contact.fullName}
              </h1>
              <p className={`${sizeClasses.title} font-bold`} style={{ color: primaryColor }}>
                {contact.title}
              </p>
            </div>
          </div>
          <div>{renderContactItems('column')}</div>
        </div>

        {/* Highlighted Project Showcase Grid */}
        {visibleSections.projects && projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between border-b pb-1.5 mb-3" style={{ borderColor: `${primaryColor}40` }}>
              <h3 className={`${sizeClasses.heading} font-black uppercase tracking-wider`} style={{ color: primaryColor }}>
                Dự Án Nổi Bật (Portfolio & Work Showcase)
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Project-Centric Architecture</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-2 transition-all hover:bg-slate-50"
                  style={{ borderLeft: `4px solid ${primaryColor}` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4" style={{ color: primaryColor }} />
                      <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {p.period}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-bold" style={{ color: primaryColor }}>Vai trò: {p.role}</span>
                    {p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.objective && (
                    <p className="text-[11px] text-slate-600 italic">Mục tiêu: {p.objective}</p>
                  )}

                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] pl-1">
                    {p.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleSections.skills && (
            <div>
              {renderSectionTitle('Kỹ Năng Kỹ Thuật')}
              <div className="space-y-1.5 text-[11px]">
                <p>
                  <strong className="text-slate-900">Chuyên môn:</strong>{' '}
                  <span className="text-slate-700">{skills.technical.join(', ')}</span>
                </p>
                <p>
                  <strong className="text-slate-900">Công cụ:</strong>{' '}
                  <span className="text-slate-700">{skills.tools.join(', ')}</span>
                </p>
              </div>
            </div>
          )}

          {visibleSections.education && education.length > 0 && (
            <div>
              {renderSectionTitle('Học Vấn')}
              {education.map((e, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <h4 className="font-bold text-slate-900">{e.school}</h4>
                  <p className="text-slate-600">{e.degree} - {e.major} ({e.year})</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Master switch based on template layoutType
  const renderLayout = () => {
    switch (templateMeta.layoutType) {
      case 'two-column-left':
      case 'two-column-right':
        return renderTwoColumnLeftLayout();
      case 'timeline':
        return renderTimelineLayout();
      case 'grid':
        return renderProjectFirstLayout();
      case 'single-column':
      case 'compact':
      default:
        return renderSingleColumnLayout();
    }
  };

  return (
    <div
      className={`cv-renderer-root w-full bg-white text-slate-800 ${fontFamilyClass} ${sizeClasses.padding} select-text`}
      style={{
        minHeight: isPrintMode ? '297mm' : 'auto',
      }}
    >
      {renderLayout()}
    </div>
  );
};
