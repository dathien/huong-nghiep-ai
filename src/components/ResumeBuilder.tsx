import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
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
  LayoutTemplate,
  Cloud,
  FolderOpen,
  Save,
  Clock,
  Palette,
  Type,
  Maximize2,
  Sliders,
  FileDown
} from 'lucide-react';
import { CVData, CVPhoto, IndustryType, StudentLevel, CVTemplateId, CVThemeConfig } from '../types';
import { SAMPLE_DEFAULT_CV } from '../data/mockData';
import { CVPhotoUploader } from './CVPhotoUploader';
import { loadPhotoFromStorage, savePhotoToStorage } from '../utils/photoStorage';
import { useAuth } from '../context/AuthContext';
import { CVDoc, subscribeUserCVs, saveCV, createCV } from '../services/cvService';
import { MyCVManagerModal } from './MyCVManagerModal';
import { CVRenderer } from '../templates/CVRenderer';
import { TemplateGallery } from './TemplateGallery';
import { getTemplateById } from '../templates/templateRegistry';
import { exportCvToWord } from '../utils/exportWord';

interface ResumeBuilderProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  studentLevel: StudentLevel;
}

const PRESET_COLORS = [
  { label: 'Xanh dương EdTech', color: '#2563eb' },
  { label: 'Xanh lá ngọc', color: '#0d9488' },
  { label: 'Xanh lục bảo', color: '#16a34a' },
  { label: 'Tím sang trọng', color: '#7c3aed' },
  { label: 'Đỏ mận thanh lịch', color: '#be123c' },
  { label: 'Cam năng động', color: '#ea580c' },
  { label: 'Chàm hiện đại', color: '#4f46e5' },
  { label: 'Xám than doanh nghiệp', color: '#334155' },
  { label: 'Đen tối giản ATS', color: '#0f172a' },
];

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  cvData,
  setCvData,
  studentLevel,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const [mainTab, setMainTab] = useState<'editor' | 'gallery'>('editor');
  const [editorTab, setEditorTab] = useState<'info' | 'skills' | 'projects' | 'education' | 'design'>('info');
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateId>('student-starter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPromptModalOpen, setAiPromptModalOpen] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState(
    'Ứng tuyển Thực tập sinh Frontend Developer, sinh viên năm 3-4 CNTT, biết React, TypeScript, HTML/CSS và có đồ án e-commerce.'
  );

  const currentTemplateMeta = getTemplateById(selectedTemplate);

  // Theme configuration state
  const [themeConfig, setThemeConfig] = useState<CVThemeConfig>({
    primaryColor: currentTemplateMeta.defaultThemeColor || '#2563eb',
    fontFamily: 'font-vietnam',
    fontSize: 'standard',
    showPhoto: cvData.photo?.visible ?? true,
    photoShape: cvData.photo?.shape || 'circle',
    visibleSections: {
      summary: true,
      skills: true,
      education: true,
      projects: true,
      experience: true,
      activities: true,
      certifications: true,
      achievements: true,
      languages: true,
    },
  });

  // Multi-CV Cloud state
  const [cvList, setCvList] = useState<CVDoc[]>([]);
  const [activeCvId, setActiveCvId] = useState<string | null>(null);
  const [activeCvName, setActiveCvName] = useState<string>('CV Tiêu Chuẩn');
  const [isMyCvsModalOpen, setIsMyCvsModalOpen] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Inline Bullet enhancer state
  const [selectedBulletInfo, setSelectedBulletInfo] = useState<{
    section: 'projects' | 'experience';
    itemIndex: number;
    bulletIndex: number;
    text: string;
  } | null>(null);
  const [isEnhancingBullet, setIsEnhancingBullet] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<any>(null);

  // Sync with Firestore CV documents when logged in
  useEffect(() => {
    if (!currentUser) {
      setCvList([]);
      setActiveCvId(null);
      return;
    }

    const unsubscribe = subscribeUserCVs(
      currentUser.uid,
      async (list) => {
        setCvList(list);
        if (list.length === 0) {
          try {
            const firstCV = await createCV(
              currentUser.uid,
              cvData.contact.title ? `CV ${cvData.contact.title}` : 'CV Tiêu Chuẩn',
              selectedTemplate,
              cvData,
              true
            );
            setActiveCvId(firstCV.id);
            setActiveCvName(firstCV.cvName);
          } catch (e) {
            console.error('Failed to create initial CV in cloud', e);
          }
        } else if (!activeCvId) {
          const defaultCV = list.find((c) => c.isDefault) || list[0];
          setActiveCvId(defaultCV.id);
          setActiveCvName(defaultCV.cvName);
          if (defaultCV.templateId) {
            setSelectedTemplate(defaultCV.templateId as CVTemplateId);
            const meta = getTemplateById(defaultCV.templateId);
            if (defaultCV.themeConfig) {
              setThemeConfig((prev) => ({ ...prev, ...defaultCV.themeConfig }));
            } else {
              setThemeConfig((prev) => ({
                ...prev,
                primaryColor: meta.defaultThemeColor || prev.primaryColor,
              }));
            }
          }
          if (defaultCV.cvData) {
            setCvData(defaultCV.cvData);
          }
        } else {
          const current = list.find((c) => c.id === activeCvId);
          if (current) {
            setActiveCvName(current.cvName);
          }
        }
      },
      (err) => console.error('CV subscription error', err)
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Restore photo from IndexedDB on initial mount if not already present
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
            setThemeConfig((prev) => ({
              ...prev,
              showPhoto: stored.visible ?? true,
              photoShape: stored.shape || 'circle',
            }));
          }
        } catch (err) {
          console.warn('Could not restore photo from storage', err);
        }
      }
    }
    restorePhoto();
  }, []);

  const handleSelectTemplate = (id: CVTemplateId) => {
    setSelectedTemplate(id);
    const meta = getTemplateById(id);
    setThemeConfig((prev) => ({
      ...prev,
      primaryColor: meta.defaultThemeColor,
    }));
    setMainTab('editor');
  };

  const handleSelectCVFromModal = (cv: CVDoc) => {
    setActiveCvId(cv.id);
    setActiveCvName(cv.cvName);
    const tmplId = (cv.templateId || 'student-starter') as CVTemplateId;
    setSelectedTemplate(tmplId);
    if (cv.themeConfig) {
      setThemeConfig((prev) => ({ ...prev, ...cv.themeConfig }));
    } else {
      const meta = getTemplateById(tmplId);
      setThemeConfig((prev) => ({
        ...prev,
        primaryColor: meta.defaultThemeColor || prev.primaryColor,
      }));
    }
    if (cv.cvData) {
      setCvData(cv.cvData);
    }
  };

  const handleSaveToCloud = async () => {
    if (!currentUser) {
      openAuthModal('login', 'Đăng nhập để lưu nhiều bản CV và tự động đồng bộ trên đám mây.');
      return;
    }

    try {
      setIsSavingCloud(true);
      const targetId = activeCvId || `cv_${Date.now()}`;
      await saveCV(currentUser.uid, {
        id: targetId,
        uid: currentUser.uid,
        cvName: activeCvName || 'CV Của Tôi',
        templateId: selectedTemplate,
        targetRole: cvData.contact.title || 'Thực tập sinh',
        cvData,
        themeConfig,
        showPhoto: themeConfig.showPhoto ?? (cvData.photo?.visible ?? true),
        photoShape: themeConfig.photoShape || cvData.photo?.shape || 'circle',
        isDefault: cvList.length <= 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActiveCvId(targetId);
      const now = new Date();
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      );
    } catch (err: any) {
      alert(`Lỗi khi lưu CV lên đám mây: ${err.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handlePhotoChange = (photo: CVPhoto | undefined) => {
    setCvData((prev) => ({
      ...prev,
      photo,
    }));
    if (photo) {
      setThemeConfig((prev) => ({
        ...prev,
        showPhoto: photo.visible ?? true,
        photoShape: photo.shape || 'circle',
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    try {
      exportCvToWord(cvData, currentTemplateMeta.name, 'docx');
    } catch (err: any) {
      alert(`Lỗi khi xuất Word: ${err?.message || 'Có lỗi xảy ra'}`);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-fade-in">
      {/* Top Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 no-print">
        <button
          type="button"
          onClick={() => setMainTab('gallery')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
            mainTab === 'gallery'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Thư Viện Mẫu CV</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">
            24 Mẫu
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('editor')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
            mainTab === 'editor'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>CV Của Tôi (Soạn Thảo & Tùy Chỉnh)</span>
          {currentUser && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              {activeCvName}
            </span>
          )}
        </button>
      </div>

      {/* Top Toolbar in Editor Mode */}
      {mainTab === 'editor' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs no-print">
          {/* Left: Active CV badge & Cloud controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200/80 rounded-xl px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    openAuthModal('login', 'Đăng nhập để xem và quản lý danh sách các bản CV của bạn.');
                  } else {
                    setIsMyCvsModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900 cursor-pointer"
                title="Nhấn để xem và chuyển đổi các bản CV đã lưu"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">{activeCvName}</span>
                {currentUser && cvList.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {cvList.length}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login', 'Đăng nhập để quản lý các bản CV.');
                } else {
                  setIsMyCvsModalOpen(true);
                }
              }}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Quản lý CV
            </button>

            {/* Cloud Save Button */}
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isSavingCloud}
              className="text-xs px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSavingCloud ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{currentUser ? 'Lưu lên Cloud' : 'Lưu vào tài khoản'}</span>
            </button>

            {lastSavedTime && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 hidden sm:inline-flex">
                <Check className="w-3 h-3 text-emerald-500" />
                Đã lưu lúc {lastSavedTime}
              </span>
            )}
          </div>

          {/* Right: Gallery switch, AI, Export buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMainTab('gallery')}
              className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 text-blue-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
              <span>Đổi mẫu ({currentTemplateMeta.name})</span>
            </button>

            <button
              onClick={() => setAiPromptModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Tạo CV bằng AI</span>
              <span className="sm:hidden">AI</span>
            </button>

            <button
              onClick={() => setCvData(SAMPLE_DEFAULT_CV)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer hidden lg:flex"
              title="Nạp lại CV mẫu Nguyễn Minh Anh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mẫu</span>
            </button>

            {/* Export Action Group: Word (.docx) & PDF (.pdf) */}
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 sm:border-l border-slate-200">
              <button
                type="button"
                onClick={handleExportWord}
                className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Xuất file Microsoft Word (.docx) giữ nguyên hình ảnh và tiếng Việt"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Xuất Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="In hoặc lưu thành tệp PDF chuẩn A4"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>In / Xuất PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: TEMPLATE GALLERY */}
      {mainTab === 'gallery' && (
        <TemplateGallery
          currentTemplateId={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          cvData={cvData}
          studentLevel={studentLevel}
        />
      )}

      {/* VIEW 2: SPLIT SCREEN EDITOR & LIVE PREVIEW */}
      {mainTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Form Editor (5 of 12) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 no-print">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chỉnh Sửa & Tùy Biến
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">Tự động cập nhật trực tiếp</span>
            </div>

            {/* Form Tabs: Info, Skills, Projects, Education, Design */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditorTab('info')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                  editorTab === 'info' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Cá nhân
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('skills')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                  editorTab === 'skills' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Kỹ năng
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('projects')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                  editorTab === 'projects' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Đồ án
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('education')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                  editorTab === 'education' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Học vấn
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('design')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer ${
                  editorTab === 'design' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Palette className="w-3 h-3 text-indigo-500" />
                <span>Giao diện</span>
              </button>
            </div>

            {/* TAB 1: PERSONAL INFO */}
            {editorTab === 'info' && (
              <div className="space-y-4 text-xs">
                {/* Photo Uploader */}
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
                  <label className="font-semibold text-slate-700 block mb-1">Địa chỉ / Tỉnh thành:</label>
                  <input
                    type="text"
                    value={cvData.contact.location}
                    onChange={(e) =>
                      setCvData({ ...cvData, contact: { ...cvData.contact, location: e.target.value } })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">LinkedIn:</label>
                    <input
                      type="text"
                      value={cvData.contact.linkedin || ''}
                      onChange={(e) =>
                        setCvData({ ...cvData, contact: { ...cvData.contact, linkedin: e.target.value } })
                      }
                      placeholder="linkedin.com/in/username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GitHub / Portfolio:</label>
                    <input
                      type="text"
                      value={cvData.contact.github || ''}
                      onChange={(e) =>
                        setCvData({ ...cvData, contact: { ...cvData.contact, github: e.target.value } })
                      }
                      placeholder="github.com/username"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tóm tắt chuyên môn (Professional Summary):
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

            {/* TAB 2: SKILLS */}
            {editorTab === 'skills' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kỹ thuật & Công nghệ (Technical & Frameworks):
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
                    placeholder="React, TypeScript, Node.js, Tailwind CSS..."
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
                    placeholder="Cấu trúc dữ liệu, Thuật toán, OOP, RESTful API..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Công cụ & Nền tảng (Tools & Platforms):
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
                    placeholder="Git, GitHub, VS Code, Figma, Postman..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kỹ năng mềm (Soft Skills):
                  </label>
                  <input
                    type="text"
                    value={cvData.skills.soft.join(', ')}
                    onChange={(e) =>
                      setCvData({
                        ...cvData,
                        skills: {
                          ...cvData.skills,
                          soft: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    placeholder="Làm việc nhóm, Giải quyết vấn đề, Quản lý thời gian..."
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
                    placeholder="Tiếng Anh (IELTS 7.0), Tiếng Nhật (N3)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PROJECTS */}
            {editorTab === 'projects' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Danh sách Đồ án ({cvData.projects.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCvData((prev) => ({
                        ...prev,
                        projects: [
                          ...prev.projects,
                          {
                            name: 'Dự án mới',
                            role: 'Thành viên phát triển',
                            period: '2024',
                            techStack: ['React', 'TypeScript'],
                            objective: 'Mô tả mục tiêu dự án...',
                            bulletPoints: ['Phát triển tính năng cốt lõi đáp ứng yêu cầu người dùng.'],
                          },
                        ],
                      }));
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm đồ án</span>
                  </button>
                </div>

                {cvData.projects.map((proj, pIdx) => (
                  <div key={pIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Đồ án #{pIdx + 1}</span>
                      {cvData.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cvData.projects.filter((_, idx) => idx !== pIdx);
                            setCvData({ ...cvData, projects: updated });
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...cvData.projects];
                          updated[pIdx].name = e.target.value;
                          setCvData({ ...cvData, projects: updated });
                        }}
                        placeholder="Tên đồ án..."
                        className="bg-white border border-slate-200 rounded-lg p-2 font-bold"
                      />
                      <input
                        type="text"
                        value={proj.period}
                        onChange={(e) => {
                          const updated = [...cvData.projects];
                          updated[pIdx].period = e.target.value;
                          setCvData({ ...cvData, projects: updated });
                        }}
                        placeholder="Thời gian (VD: 09/2024 - 12/2024)"
                        className="bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proj.role}
                        onChange={(e) => {
                          const updated = [...cvData.projects];
                          updated[pIdx].role = e.target.value;
                          setCvData({ ...cvData, projects: updated });
                        }}
                        placeholder="Vai trò..."
                        className="bg-white border border-slate-200 rounded-lg p-2"
                      />
                      <input
                        type="text"
                        value={proj.techStack.join(', ')}
                        onChange={(e) => {
                          const updated = [...cvData.projects];
                          updated[pIdx].techStack = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setCvData({ ...cvData, projects: updated });
                        }}
                        placeholder="Công nghệ (React, Node...)"
                        className="bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>

                    <input
                      type="text"
                      value={proj.objective}
                      onChange={(e) => {
                        const updated = [...cvData.projects];
                        updated[pIdx].objective = e.target.value;
                        setCvData({ ...cvData, projects: updated });
                      }}
                      placeholder="Mục tiêu của dự án..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 italic"
                    />

                    {/* Bullet points with quick XYZ optimizer */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 block">Các điểm nổi bật & Kết quả:</span>
                      {proj.bulletPoints.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const updated = [...cvData.projects];
                              const newBullets = [...updated[pIdx].bulletPoints];
                              newBullets[bIdx] = e.target.value;
                              updated[pIdx].bulletPoints = newBullets;
                              setCvData({ ...cvData, projects: updated });
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleEnhanceBullet('projects', pIdx, bIdx, b)}
                            className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                            title="Tối ưu bằng công thức Google XYZ"
                          >
                            <Zap className="w-2.5 h-2.5 text-amber-600" />
                            <span>Tối ưu</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: EDUCATION */}
            {editorTab === 'education' && (
              <div className="space-y-3 text-xs">
                {cvData.education.map((edu, eIdx) => (
                  <div key={eIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <label className="font-semibold text-slate-700 block">Tên trường đào tạo:</label>
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
                        <label className="font-semibold text-slate-700 block">Điểm GPA:</label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const updated = [...cvData.education];
                            updated[eIdx].gpa = e.target.value;
                            setCvData({ ...cvData, education: updated });
                          }}
                          placeholder="3.6 / 4.0"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block">Hệ đào tạo:</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...cvData.education];
                            updated[eIdx].degree = e.target.value;
                            setCvData({ ...cvData, education: updated });
                          }}
                          placeholder="Cử nhân / Kỹ sư..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block">Thời gian:</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...cvData.education];
                            updated[eIdx].year = e.target.value;
                            setCvData({ ...cvData, education: updated });
                          }}
                          placeholder="2021 - 2025"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: DESIGN CUSTOMIZER */}
            {editorTab === 'design' && (
              <div className="space-y-4 text-xs">
                {/* 1. Primary Color */}
                <div>
                  <label className="font-bold text-slate-800 block mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      Màu sắc chủ đạo:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">{themeConfig.primaryColor}</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            primaryColor: item.color,
                          }))
                        }
                        className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          themeConfig.primaryColor === item.color
                            ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-xs'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      >
                        {themeConfig.primaryColor === item.color && (
                          <Check className="w-4 h-4 text-white drop-shadow-xs" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Typography Font Family */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    Phông chữ hiển thị:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'font-vietnam', label: 'Be Vietnam Pro', sub: 'Chuẩn tiếng Việt' },
                      { id: 'font-sans', label: 'Inter / Sans', sub: 'Hiện đại, sắc nét' },
                      { id: 'font-serif', label: 'Merriweather', sub: 'Serif trang trọng' },
                      { id: 'font-mono', label: 'Monospace', sub: 'Kỹ thuật IT' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            fontFamily: f.id as any,
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          themeConfig.fontFamily === f.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="block text-xs">{f.label}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{f.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Font Scaling / Density */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Mật độ & Cỡ chữ trang CV:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact', label: 'Gọn gàng', desc: '1 trang gọn' },
                      { id: 'standard', label: 'Tiêu chuẩn', desc: 'Cân bằng nhất' },
                      { id: 'relaxed', label: 'Thoáng đãng', desc: 'Dễ đọc' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            fontSize: sz.id as any,
                          }))
                        }
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          themeConfig.fontSize === sz.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="block text-xs">{sz.label}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{sz.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Photo Shape & Visibility */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Khung ảnh chân dung:</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { id: 'circle', label: 'Hình tròn' },
                      { id: 'rounded', label: 'Bo góc mềm' },
                      { id: 'square', label: 'Vuông sắc nét' },
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() =>
                          setThemeConfig((prev) => ({
                            ...prev,
                            photoShape: sh.id as any,
                          }))
                        }
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          themeConfig.photoShape === sh.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={themeConfig.showPhoto ?? true}
                      onChange={(e) =>
                        setThemeConfig((prev) => ({
                          ...prev,
                          showPhoto: e.target.checked,
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 font-medium">Hiển thị ảnh chân dung trên bản CV này</span>
                  </label>
                </div>

                {/* 5. Section Visibility Toggles */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Ẩn / Hiện các phần trên CV:</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    {[
                      { key: 'summary', label: 'Tóm tắt bản thân' },
                      { key: 'skills', label: 'Kỹ năng chuyên môn' },
                      { key: 'education', label: 'Học vấn & Bằng cấp' },
                      { key: 'projects', label: 'Đồ án tiêu biểu' },
                      { key: 'activities', label: 'Hoạt động ngoại khóa' },
                      { key: 'certifications', label: 'Chứng chỉ quốc tế' },
                      { key: 'achievements', label: 'Giải thưởng' },
                      { key: 'languages', label: 'Ngoại ngữ' },
                    ].map((sec) => (
                      <label key={sec.key} className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={themeConfig.visibleSections?.[sec.key as keyof typeof themeConfig.visibleSections] ?? true}
                          onChange={(e) => {
                            setThemeConfig((prev) => ({
                              ...prev,
                              visibleSections: {
                                ...prev.visibleSections,
                                [sec.key]: e.target.checked,
                              },
                            }));
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{sec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Real-Time Live Rendered CV Sheet (7 of 12) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Template & ATS Status Bar */}
            <div className="w-full max-w-[800px] mb-3 flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs shadow-xs no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
                  {currentTemplateMeta.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {currentTemplateMeta.category}
                </span>
                {currentTemplateMeta.atsScore && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    ATS {currentTemplateMeta.atsScore}/100
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMainTab('gallery')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Chọn trong 24 mẫu</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* A4 Document Container */}
            <div
              id="ats-resume-sheet"
              className="cv-sheet bg-white text-slate-900 rounded-2xl shadow-md w-full max-w-[800px] min-h-[1050px] p-0 font-sans border border-slate-200/90 text-left transition-all overflow-hidden"
            >
              <CVRenderer
                cvData={cvData}
                templateId={selectedTemplate}
                themeConfig={themeConfig}
                isPrintMode={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-CV Manager Modal */}
      {currentUser && (
        <MyCVManagerModal
          isOpen={isMyCvsModalOpen}
          onClose={() => setIsMyCvsModalOpen(false)}
          cvList={cvList}
          activeCvId={activeCvId}
          onSelectCV={handleSelectCVFromModal}
          uid={currentUser.uid}
          currentCvData={cvData}
        />
      )}

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
              xây dựng CV hoàn chỉnh với các số liệu định lượng chuẩn mực.
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
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
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

      {/* Inline Bullet Point Enhancer Modal (Google XYZ Formula) */}
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
