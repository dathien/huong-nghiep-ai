import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Check,
  Copy,
  Zap,
  RotateCcw,
  Layers,
  ArrowRight,
  BookOpen,
  Award,
  GraduationCap,
  Briefcase,
  LayoutTemplate
} from 'lucide-react';
import { CVData, CVPhoto, IndustryType, StudentLevel } from '../types';
import { SAMPLE_DEFAULT_CV } from '../data/mockData';
import { CVPhotoUploader } from './CVPhotoUploader';
import { loadPhotoFromStorage, savePhotoToStorage } from '../utils/photoStorage';

interface ResumeBuilderProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  studentLevel: StudentLevel;
}

export type CVTemplateType = 'ats' | 'modern' | 'professional' | 'creative';

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  cvData,
  setCvData,
  studentLevel,
}) => {
  const [editorTab, setEditorTab] = useState<'info' | 'skills' | 'projects' | 'education'>('info');
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>('ats');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState(
    'Ứng tuyển Thực tập sinh Frontend Developer, sinh viên năm 3-4 CNTT, biết React, TypeScript, HTML/CSS và có đồ án e-commerce.'
  );

  // Restore photo from persistent IndexedDB if not already loaded in cvData
  useEffect(() => {
    async function restorePhoto() {
      if (!cvData.photo) {
        try {
          const stored = await loadPhotoFromStorage();
          if (stored && stored.dataUrl) {
            setCvData((prev) => ({
              ...prev,
              photo: {
                dataUrl: stored.dataUrl,
                originalUrl: stored.originalUrl,
                shape: stored.shape || 'circle',
                visible: stored.visible ?? true,
                zoom: stored.zoom,
                cropX: stored.cropX,
                cropY: stored.cropY,
              },
            }));
          }
        } catch (err) {
          console.warn('Could not restore photo from storage', err);
        }
      }
    }
    restorePhoto();
  }, []);

  const handlePhotoChange = (photo: CVPhoto | undefined) => {
    setCvData((prev) => ({
      ...prev,
      photo,
    }));
  };

  // Inline Bullet enhancer state
  const [selectedBulletInfo, setSelectedBulletInfo] = useState<{
    section: 'projects' | 'experience';
    itemIndex: number;
    bulletIndex: number;
    text: string;
  } | null>(null);
  const [isEnhancingBullet, setIsEnhancingBullet] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const md = `# ${cvData.contact.fullName}
**${cvData.contact.title}**
Email: ${cvData.contact.email} | SĐT: ${cvData.contact.phone} | Địa chỉ: ${cvData.contact.location}
LinkedIn: ${cvData.contact.linkedin || ''} | GitHub: ${cvData.contact.github || ''}

## Tóm tắt chuyên môn (Professional Summary)
${cvData.summary}

## Kỹ năng chuyên môn
- Kỹ thuật & Frameworks: ${cvData.skills.technical.join(', ')}
- Nền tảng cốt lõi: ${cvData.skills.core.join(', ')}
- Công cụ: ${cvData.skills.tools.join(', ')}
- Kỹ năng mềm: ${cvData.skills.soft.join(', ')}
- Ngoại ngữ: ${cvData.languages.join(', ')}

## Học vấn
${cvData.education
  .map(
    (e) => `### ${e.school}
${e.degree} - ${e.major} (${e.year}) | GPA: ${e.gpa || 'N/A'}
Môn học: ${(e.coursework || []).join(', ')}`
  )
  .join('\n\n')}

## Đồ án tiêu biểu (Kinh nghiệm thực tiễn)
${cvData.projects
  .map(
    (p) => `### ${p.name} — ${p.role} (${p.period})
**Công nghệ:** ${p.techStack.join(', ')}
*Mục tiêu:* ${p.objective}
${p.bulletPoints.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Hoạt động & Thành tích
${cvData.activities.map((a) => `- **${a.name}** (${a.role}, ${a.period}): ${a.impact}`).join('\n')}
${cvData.achievements.map((ach) => `- ${ach}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cvData.contact.fullName.replace(/\s+/g, '_')}_CV_ATS.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateCvWithAi = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInfo: aiGenPrompt,
          targetRole: cvData.contact.title || 'Frontend Developer Intern',
          level: studentLevel,
          industry: 'IT / Engineering',
        }),
      });

      if (!res.ok) throw new Error('Không thể tạo CV');
      const data: CVData = await res.json();
      setCvData(data);
      setAiPromptModalOpen(false);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra khi tạo CV'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceBullet = async (
    section: 'projects' | 'experience',
    itemIndex: number,
    bulletIndex: number,
    bulletText: string
  ) => {
    setSelectedBulletInfo({ section, itemIndex, bulletIndex, text: bulletText });
    setIsEnhancingBullet(true);
    setEnhancedResult(null);

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText,
          role: cvData.contact.title,
          industry: 'IT / Engineering',
        }),
      });
      if (!res.ok) throw new Error('Lỗi tối ưu hóa');
      const data = await res.json();
      setEnhancedResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingBullet(false);
    }
  };

  const applyEnhancedBullet = (improvedText: string) => {
    if (!selectedBulletInfo) return;
    const { section, itemIndex, bulletIndex } = selectedBulletInfo;

    setCvData((prev) => {
      const clone = { ...prev };
      if (section === 'projects') {
        const pList = [...clone.projects];
        const targetProj = { ...pList[itemIndex] };
        targetProj.bulletPoints = [...targetProj.bulletPoints];
        targetProj.bulletPoints[bulletIndex] = improvedText;
        pList[itemIndex] = targetProj;
        clone.projects = pList;
      }
      return clone;
    });

    setSelectedBulletInfo(null);
    setEnhancedResult(null);
  };

  const sectionBorderClass =
    selectedTemplate === 'modern'
      ? 'border-blue-600'
      : selectedTemplate === 'creative'
      ? 'border-indigo-600'
      : selectedTemplate === 'professional'
      ? 'border-slate-800'
      : 'border-slate-900';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs no-print">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Thiết Kế CV
            </span>
          </div>

          {/* Template Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setSelectedTemplate('ats')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === 'ats'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Mẫu chuẩn hệ thống ATS lọc tự động"
            >
              Chuẩn ATS
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('modern')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === 'modern'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Mẫu hiện đại với điểm nhấn ảnh tròn và màu xanh chủ đạo"
            >
              Hiện đại
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('professional')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === 'professional'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Mẫu chuyên nghiệp, trang trọng với ảnh vuông bo góc"
            >
              Chuyên nghiệp
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('creative')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === 'creative'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
              title="Mẫu sáng tạo với dải màu sắc phong cách"
            >
              Sáng tạo
            </button>
          </div>

          <button
            onClick={() => setCvData(SAMPLE_DEFAULT_CV)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Nạp lại CV mẫu của Nguyễn Minh Anh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nạp CV mẫu</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAiPromptModalOpen(true)}
            className="text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tạo CV bằng AI</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải .MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="text-xs px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / Xuất PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen: Form on Left (5 cols) & Live ATS Preview on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Form Editor (5 of 12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 no-print">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chỉnh Sửa Nội Dung
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">Tự động cập nhật xem trước</span>
          </div>

          {/* Form Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setEditorTab('info')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                editorTab === 'info' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Cá nhân
            </button>
            <button
              onClick={() => setEditorTab('skills')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                editorTab === 'skills' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Kỹ năng
            </button>
            <button
              onClick={() => setEditorTab('projects')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                editorTab === 'projects' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Đồ án
            </button>
            <button
              onClick={() => setEditorTab('education')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                editorTab === 'education' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Học vấn
            </button>
          </div>

          {/* Tab 1: Personal Info */}
          {editorTab === 'info' && (
            <div className="space-y-4 text-xs">
              {/* Photo Uploader Section */}
              <CVPhotoUploader
                photo={cvData.photo}
                onPhotoChange={handlePhotoChange}
              />

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên:</label>
                <input
                  type="text"
                  value={cvData.contact.fullName}
                  onChange={(e) =>
                    setCvData({ ...cvData, contact: { ...cvData.contact, fullName: e.target.value } })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vị trí mục tiêu:</label>
                <input
                  type="text"
                  value={cvData.contact.title}
                  onChange={(e) =>
                    setCvData({ ...cvData, contact: { ...cvData.contact, title: e.target.value } })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="text"
                    value={cvData.contact.email}
                    onChange={(e) =>
                      setCvData({ ...cvData, contact: { ...cvData.contact, email: e.target.value } })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={cvData.contact.phone}
                    onChange={(e) =>
                      setCvData({ ...cvData, contact: { ...cvData.contact, phone: e.target.value } })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ:</label>
                <input
                  type="text"
                  value={cvData.contact.location}
                  onChange={(e) =>
                    setCvData({ ...cvData, contact: { ...cvData.contact, location: e.target.value } })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tóm tắt chuyên môn (Summary):
                </label>
                <textarea
                  rows={4}
                  value={cvData.summary}
                  onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Skills */}
          {editorTab === 'skills' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kỹ thuật & Công nghệ (phân tách bằng dấu phẩy):
                </label>
                <textarea
                  rows={3}
                  value={cvData.skills.technical.join(', ')}
                  onChange={(e) =>
                    setCvData({
                      ...cvData,
                      skills: {
                        ...cvData.skills,
                        technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nền tảng cốt lõi (Core Foundations):
                </label>
                <textarea
                  rows={2}
                  value={cvData.skills.core.join(', ')}
                  onChange={(e) =>
                    setCvData({
                      ...cvData,
                      skills: {
                        ...cvData.skills,
                        core: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Công cụ & Nền tảng (Tools):
                </label>
                <input
                  type="text"
                  value={cvData.skills.tools.join(', ')}
                  onChange={(e) =>
                    setCvData({
                      ...cvData,
                      skills: {
                        ...cvData.skills,
                        tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngoại ngữ:</label>
                <input
                  type="text"
                  value={cvData.languages.join(', ')}
                  onChange={(e) =>
                    setCvData({
                      ...cvData,
                      languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Projects */}
          {editorTab === 'projects' && (
            <div className="space-y-4 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Danh sách Đồ án ({cvData.projects.length})
              </span>

              {cvData.projects.map((proj, pIdx) => (
                <div key={pIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Đồ án #{pIdx + 1}</span>
                  </div>

                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => {
                      const updated = [...cvData.projects];
                      updated[pIdx].name = e.target.value;
                      setCvData({ ...cvData, projects: updated });
                    }}
                    placeholder="Tên đồ án..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                  />

                  <input
                    type="text"
                    value={proj.techStack.join(', ')}
                    onChange={(e) => {
                      const updated = [...cvData.projects];
                      updated[pIdx].techStack = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setCvData({ ...cvData, projects: updated });
                    }}
                    placeholder="Công nghệ (React, Node, SQL...)"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Education */}
          {editorTab === 'education' && (
            <div className="space-y-3 text-xs">
              {cvData.education.map((edu, eIdx) => (
                <div key={eIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <label className="font-semibold text-slate-700 block">Tên trường:</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => {
                      const updated = [...cvData.education];
                      updated[eIdx].school = e.target.value;
                      setCvData({ ...cvData, education: updated });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block">Chuyên ngành:</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => {
                          const updated = [...cvData.education];
                          updated[eIdx].major = e.target.value;
                          setCvData({ ...cvData, education: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block">GPA:</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const updated = [...cvData.education];
                          updated[eIdx].gpa = e.target.value;
                          setCvData({ ...cvData, education: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time A4 ATS Sheet (7 of 12) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="ats-resume-sheet"
            className="cv-sheet bg-white text-slate-900 rounded-2xl shadow-md w-full max-w-[800px] min-h-[1050px] p-8 sm:p-10 font-sans border border-slate-200/90 text-left transition-all"
          >
            {/* Header Banner - Template Adaptive */}
            {selectedTemplate === 'modern' ? (
              <div className="border-b-2 border-blue-600 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-blue-50/60 via-slate-50/30 to-transparent p-4 sm:p-5 rounded-2xl border border-blue-100/70">
                <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  {cvData.photo?.dataUrl && cvData.photo?.visible && (
                    <div className="shrink-0">
                      <img
                        src={cvData.photo.dataUrl}
                        alt={cvData.contact.fullName}
                        className={`w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-blue-600 shadow-sm transition-all ${
                          cvData.photo.shape === 'rounded' ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                      {cvData.contact.fullName}
                    </h1>
                    <p className="text-sm font-bold text-blue-600 tracking-wide mt-0.5 uppercase">
                      {cvData.contact.title}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                      <span>📍 {cvData.contact.location}</span>
                      <span>✉️ {cvData.contact.email}</span>
                      <span>📞 {cvData.contact.phone}</span>
                      {cvData.contact.linkedin && <span>🔗 {cvData.contact.linkedin}</span>}
                      {cvData.contact.github && <span>💻 {cvData.contact.github}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedTemplate === 'professional' ? (
              <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] tracking-widest text-slate-500 uppercase font-black block mb-0.5">
                    CURRICULUM VITAE
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                    {cvData.contact.fullName}
                  </h1>
                  <p className="text-sm font-bold text-slate-700 tracking-wide mt-0.5 uppercase">
                    {cvData.contact.title}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                    <span>📍 {cvData.contact.location}</span>
                    <span>✉️ {cvData.contact.email}</span>
                    <span>📞 {cvData.contact.phone}</span>
                    {cvData.contact.linkedin && <span>🔗 {cvData.contact.linkedin}</span>}
                    {cvData.contact.github && <span>💻 {cvData.contact.github}</span>}
                  </div>
                </div>
                {cvData.photo?.dataUrl && cvData.photo?.visible && (
                  <div className="shrink-0">
                    <img
                      src={cvData.photo.dataUrl}
                      alt={cvData.contact.fullName}
                      className={`w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-slate-900 shadow-xs transition-all ${
                        cvData.photo.shape === 'circle' ? 'rounded-full' : 'rounded-xl'
                      }`}
                    />
                  </div>
                )}
              </div>
            ) : selectedTemplate === 'creative' ? (
              <div className="border-b-2 border-indigo-600 pb-5 mb-6 flex items-center justify-between gap-5 bg-gradient-to-r from-indigo-50/70 via-indigo-50/20 to-transparent p-4 sm:p-5 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  {cvData.photo?.dataUrl && cvData.photo?.visible && (
                    <div className="shrink-0">
                      <img
                        src={cvData.photo.dataUrl}
                        alt={cvData.contact.fullName}
                        className={`w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-indigo-600 shadow-md transition-all ${
                          cvData.photo.shape === 'rounded' ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                      Ứng viên Sáng tạo
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                      {cvData.contact.fullName}
                    </h1>
                    <p className="text-sm font-bold text-indigo-700 tracking-wide mt-0.5 uppercase">
                      {cvData.contact.title}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                      <span>📍 {cvData.contact.location}</span>
                      <span>✉️ {cvData.contact.email}</span>
                      <span>📞 {cvData.contact.phone}</span>
                      {cvData.contact.linkedin && <span>🔗 {cvData.contact.linkedin}</span>}
                      {cvData.contact.github && <span>💻 {cvData.contact.github}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ATS Standard Template */
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                    {cvData.contact.fullName}
                  </h1>
                  <p className="text-sm font-bold text-blue-700 tracking-wide mt-0.5 uppercase">
                    {cvData.contact.title}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                    <span>📍 {cvData.contact.location}</span>
                    <span>✉️ {cvData.contact.email}</span>
                    <span>📞 {cvData.contact.phone}</span>
                    {cvData.contact.linkedin && <span>🔗 {cvData.contact.linkedin}</span>}
                    {cvData.contact.github && <span>💻 {cvData.contact.github}</span>}
                  </div>
                </div>
                {cvData.photo?.dataUrl && cvData.photo?.visible && (
                  <div className="shrink-0">
                    <img
                      src={cvData.photo.dataUrl}
                      alt={cvData.contact.fullName}
                      className={`w-20 h-20 sm:w-22 sm:h-22 object-cover border border-slate-300 shadow-xs transition-all ${
                        cvData.photo.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2-COLUMN ATS GRID */}
            <div className="grid grid-cols-12 gap-6">
              {/* LEFT COLUMN (35% - 4 of 12 cols): Contact, Skills, Certs, Languages */}
              <div className="col-span-12 md:col-span-4 space-y-5 border-r-0 md:border-r border-slate-200 pr-0 md:pr-4">
                {/* CORE SKILLS */}
                <div>
                  <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2.5`}>
                    Kỹ năng chuyên môn
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] uppercase">
                        Technical & Frameworks:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {cvData.skills.technical.join(' • ')}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] uppercase">
                        Core Foundations:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {cvData.skills.core.join(' • ')}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] uppercase">
                        Tools & Platforms:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {cvData.skills.tools.join(' • ')}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block text-[11px] uppercase">
                        Soft Skills:
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {cvData.skills.soft.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CERTIFICATIONS */}
                {cvData.certifications && cvData.certifications.length > 0 && (
                  <div>
                    <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2`}>
                      Chứng chỉ Quốc tế
                    </h2>
                    <div className="space-y-2 text-xs">
                      {cvData.certifications.map((cert, idx) => (
                        <div key={idx} className="leading-snug">
                          <span className="font-bold text-slate-900 block">{cert.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {cert.issuer} ({cert.year})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LANGUAGES */}
                {cvData.languages && cvData.languages.length > 0 && (
                  <div>
                    <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2`}>
                      Ngoại ngữ
                    </h2>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {cvData.languages.map((lang, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-900" />
                          <span>{lang}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (65% - 8 of 12 cols): Summary, Education, Projects, Activities */}
              <div className="col-span-12 md:col-span-8 space-y-5">
                {/* PROFESSIONAL SUMMARY */}
                <div>
                  <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2`}>
                    Tóm tắt chuyên môn (Professional Summary)
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {cvData.summary}
                  </p>
                </div>

                {/* EDUCATION */}
                <div>
                  <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2`}>
                    Học vấn
                  </h2>
                  <div className="space-y-2">
                    {cvData.education.map((edu, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{edu.school}</span>
                          <span className="text-slate-500 text-[11px] font-normal">{edu.year}</span>
                        </div>
                        <div className="text-slate-700 font-medium">
                          {edu.degree} — {edu.major}
                          {edu.gpa && (
                            <span className="ml-2 px-1.5 py-0.2 bg-slate-100 rounded text-slate-800 font-bold text-[11px]">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                        {edu.coursework && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Môn học nổi bật: {edu.coursework.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROJECTS (PRACTICAL EXPERIENCE) */}
                <div>
                  <div className={`flex items-center justify-between border-b ${sectionBorderClass} pb-1 mb-2`}>
                    <h2 className="text-xs font-black tracking-wider uppercase text-slate-900">
                      Đồ án tiêu biểu (Kinh nghiệm thực tiễn)
                    </h2>
                    <span className="text-[10px] text-blue-600 font-semibold no-print">
                      💡 Click ⚡ Nâng cấp để bổ sung số liệu
                    </span>
                  </div>

                  <div className="space-y-4">
                    {cvData.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="text-xs space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 text-sm">{proj.name}</span>
                          <span className="text-[11px] text-slate-500">{proj.period}</span>
                        </div>

                        <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1.5 flex-wrap">
                          <span>Vai trò: {proj.role}</span>
                          <span>•</span>
                          <span>Công nghệ: {proj.techStack.join(', ')}</span>
                        </div>

                        <p className="text-slate-600 text-[11px] italic">
                          Mục tiêu: {proj.objective}
                        </p>

                        <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 leading-relaxed mt-1">
                          {proj.bulletPoints.map((bullet, bIdx) => (
                            <li key={bIdx} className="group relative">
                              <span>{bullet}</span>
                              <button
                                onClick={() => handleEnhanceBullet('projects', pIdx, bIdx, bullet)}
                                className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity no-print cursor-pointer"
                                title="Tự động nâng cấp câu bằng công thức Google XYZ"
                              >
                                <Zap className="w-2.5 h-2.5 text-amber-600" />
                                <span>⚡ Nâng cấp</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIVITIES & ACHIEVEMENTS */}
                {cvData.activities && cvData.activities.length > 0 && (
                  <div>
                    <h2 className={`text-xs font-black tracking-wider uppercase text-slate-900 border-b ${sectionBorderClass} pb-1 mb-2`}>
                      Hoạt động & Thành tích
                    </h2>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {cvData.activities.map((act, idx) => (
                        <div key={idx} className="leading-snug">
                          <span className="font-bold text-slate-900">{act.name}</span>
                          <span className="text-slate-500 text-[11px] ml-1.5">
                            ({act.role}, {act.period})
                          </span>
                          : <span className="text-slate-700">{act.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-sans">
              <span>CareerMaster AI — Chuẩn ATS & Recruiter Psychology</span>
              <span>Ứng viên: {cvData.contact.fullName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generate CV Modal */}
      {aiPromptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Tạo Dàn Ý CV Chuẩn ATS Cho Sinh Viên
              </h3>
              <button
                onClick={() => setAiPromptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập thông tin chuyên ngành, kỹ năng và các đồ án bạn đã từng làm. CareerMaster sẽ tự động
              xây dựng CV 2 cột hoàn chỉnh với các số liệu định lượng chuẩn mực.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Thông tin dự án / kinh nghiệm của bạn:
              </label>
              <textarea
                rows={4}
                value={aiGenPrompt}
                onChange={(e) => setAiGenPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAiPromptModalOpen(false)}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleGenerateCvWithAi}
                disabled={isGenerating || !aiGenPrompt.trim()}
                className="text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-40 shadow-xs cursor-pointer"
              >
                {isGenerating ? 'Đang tạo CV...' : 'Tạo CV chuẩn ATS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Bullet Point Enhancer Modal */}
      {selectedBulletInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-slide-up text-left">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">
                  Nâng Cấp Câu Mô Tả Bằng Số Liệu Đo Lường
                </h4>
              </div>
              <button
                onClick={() => setSelectedBulletInfo(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Câu ban đầu:
              </span>
              "{selectedBulletInfo.text}"
            </div>

            {isEnhancingBullet ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
                <span>Đang áp dụng công thức Google XYZ và định lượng hóa số liệu...</span>
              </div>
            ) : enhancedResult ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-blue-700">
                      Phiên bản đề xuất (High-Impact):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Google XYZ Formula
                    </span>
                  </div>
                  <p className="text-xs text-slate-900 font-bold leading-relaxed">
                    "{enhancedResult.improved}"
                  </p>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    💡 Gợi ý từ Chị An: {enhancedResult.recruiterSignal}
                  </p>
                  <button
                    onClick={() => applyEnhancedBullet(enhancedResult.improved)}
                    className="mt-2 text-xs px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Áp dụng vào CV ngay</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
