import React, { useState } from 'react';
import {
  UserCheck,
  GraduationCap,
  Layers,
  Award,
  FolderGit2,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { CVData, StudentLevel, AppTab } from '../types';

interface CompetencyProfileProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  studentLevel: StudentLevel;
  onNavigateTab: (tab: AppTab) => void;
}

export const CompetencyProfile: React.FC<CompetencyProfileProps> = ({
  cvData,
  setCvData,
  studentLevel,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<'education' | 'skills' | 'projects' | 'certs'>('education');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // New item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'technical' | 'core' | 'soft'>('technical');

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setCvData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [newSkillCategory]: [...prev.skills[newSkillCategory], newSkill.trim()],
      },
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (category: 'technical' | 'core' | 'soft', index: number) => {
    setCvData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, idx) => idx !== index),
      },
    }));
  };

  const handleSyncToCv = () => {
    setShowSyncSuccess(true);
    setTimeout(() => {
      setShowSyncSuccess(false);
      onNavigateTab('cv-builder');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Hồ Sơ Năng Lực Học Sinh / Sinh Viên</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Hành Trang & Điểm Mạnh
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Lưu trữ tập trung kết quả học tập, kỹ năng công nghệ, đồ án môn học và chứng chỉ quốc tế.
            Toàn bộ thông tin được đồng bộ tức thì sang bản CV chuẩn ATS.
          </p>
        </div>

        <button
          onClick={handleSyncToCv}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          {showSyncSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Đã đồng bộ sang CV!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Đồng bộ sang Thiết kế CV</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs max-w-xl">
        <button
          onClick={() => setActiveSection('education')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'education'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Học vấn ({cvData.education.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('skills')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'skills'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kỹ năng</span>
        </button>

        <button
          onClick={() => setActiveSection('projects')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'projects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Đồ án ({cvData.projects.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('certs')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSection === 'certs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Chứng chỉ ({cvData.certifications.length})</span>
        </button>
      </div>

      {/* SECTION: EDUCATION */}
      {activeSection === 'education' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thông tin Trường & Quá trình Đào tạo
              </h3>
              <p className="text-xs text-slate-500">Trình độ hiện tại: {studentLevel}</p>
            </div>
          </div>

          <div className="space-y-4">
            {cvData.education.map((edu, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{edu.school}</h4>
                    <p className="text-xs font-semibold text-blue-600">
                      {edu.degree} — Chuyên ngành: {edu.major}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">
                      {edu.year}
                    </span>
                    {edu.gpa && (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
                        GPA: {edu.gpa}
                      </span>
                    )}
                  </div>
                </div>

                {edu.coursework && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Môn học & Chuyên đề nổi bật:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {edu.coursework.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SKILLS */}
      {activeSection === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ma Trận Kỹ Năng & Công Cụ Làm Việc
              </h3>
              <p className="text-xs text-slate-500">
                Thêm kỹ năng mới để nâng cao tỷ lệ vượt qua bộ lọc ATS
              </p>
            </div>

            {/* Quick add skill */}
            <div className="flex items-center gap-2">
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium"
              >
                <option value="technical">Kỹ thuật (Tech)</option>
                <option value="core">Cốt lõi (Core)</option>
                <option value="soft">Kỹ năng mềm (Soft)</option>
              </select>

              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Nhập kỹ năng mới..."
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleAddSkill}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                title="Thêm kỹ năng"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Technical */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                💻 Kỹ thuật & Công nghệ ({cvData.skills.technical.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cvData.skills.technical.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-medium text-slate-800"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('technical', idx)}
                      className="text-slate-400 hover:text-rose-500 text-xs ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Core */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                ⚙️ Nền tảng cốt lõi ({cvData.skills.core.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cvData.skills.core.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-medium text-slate-800"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('core', idx)}
                      className="text-slate-400 hover:text-rose-500 text-xs ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Soft */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                🤝 Kỹ năng mềm ({cvData.skills.soft.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cvData.skills.soft.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-medium text-slate-800"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => handleRemoveSkill('soft', idx)}
                      className="text-slate-400 hover:text-rose-500 text-xs ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PROJECTS */}
      {activeSection === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Đồ Án Môn Học & Dự Án Thực Tiễn
              </h3>
              <p className="text-xs text-slate-500">
                Kinh nghiệm thực hành có giá trị nhất đối với học sinh, sinh viên
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cvData.projects.map((proj, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{proj.name}</h4>
                    <p className="text-xs font-semibold text-blue-600">
                      Vai trò: {proj.role} • {proj.period}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">Mục tiêu: {proj.objective}</p>

                <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                  {proj.bulletPoints.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: CERTS */}
      {activeSection === 'certs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chứng Chỉ Online & Thành Tích Học Tập
              </h3>
              <p className="text-xs text-slate-500">
                Chứng minh tinh thần tự học và năng lực chuẩn quốc tế
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cvData.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{cert.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đơn vị cấp: {cert.issuer} • Năm {cert.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
