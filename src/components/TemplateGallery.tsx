import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Check,
  Eye,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CVData, CVTemplateCategory, CVTemplateId, CVTemplateMeta, StudentLevel } from '../types';
import { CV_CATEGORIES, CV_TEMPLATES, getRecommendedTemplate, getTemplateById } from '../templates/templateRegistry';
import { MiniCVPreview } from '../templates/MiniCVPreview';
import { CVRenderer } from '../templates/CVRenderer';
import { ChiAnCharacter } from './ChiAnMascot';

interface TemplateGalleryProps {
  currentTemplateId: CVTemplateId | string;
  onSelectTemplate: (templateId: CVTemplateId) => void;
  cvData: CVData;
  studentLevel: StudentLevel;
}

const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150];

const COLOR_PALETTES = [
  { label: 'Xanh EdTech', hex: '#2563eb' },
  { label: 'Xanh Navy', hex: '#1e40af' },
  { label: 'Xanh Ngọc', hex: '#0284c7' },
  { label: 'Lục Bảo', hex: '#059669' },
  { label: 'Xanh Teal', hex: '#0f766e' },
  { label: 'Chàm Indigo', hex: '#4f46e5' },
  { label: 'Tím Đậm', hex: '#7c3aed' },
  { label: 'Đỏ Mận', hex: '#831843' },
  { label: 'Xám Than', hex: '#334155' },
  { label: 'Đen ATS', hex: '#18181b' },
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  currentTemplateId,
  onSelectTemplate,
  cvData,
  studentLevel,
}) => {
  // Gallery Filtering State
  const [selectedCategory, setSelectedCategory] = useState<CVTemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhoto, setFilterPhoto] = useState<'all' | 'photo' | 'no-photo'>('all');
  const [filterAtsOnly, setFilterAtsOnly] = useState(false);

  // In-Page Full Preview State (NO POPUP / NO MODAL)
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateMeta | null>(null);
  const [previewColor, setPreviewColor] = useState<string>('#2563eb');
  const [zoom, setZoom] = useState<number>(100);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const recommendation = getRecommendedTemplate(studentLevel, cvData.contact.title);

  // Auto-fit zoom based on container width when previewing
  const calculateAutoFitZoom = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth;
      // Base A4 width is 794px. Deduct 32px for safe horizontal padding
      const availableWidth = containerWidth - 32;
      const calculatedZoom = Math.min(100, Math.max(50, Math.floor((availableWidth / 794) * 100)));
      setZoom(calculatedZoom);
    } else if (typeof window !== 'undefined') {
      const winWidth = window.innerWidth;
      if (winWidth < 640) {
        setZoom(50);
      } else if (winWidth < 1024) {
        setZoom(75);
      } else {
        setZoom(100);
      }
    }
  };

  useEffect(() => {
    if (previewTemplate) {
      calculateAutoFitZoom();
      // Scroll to top of preview cleanly
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }, [previewTemplate]);

  // Filter templates list
  const filteredTemplates = CV_TEMPLATES.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchRec = t.recommendedFor.toLowerCase().includes(q);
      const matchCat = t.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchRec && !matchCat) return false;
    }

    if (filterPhoto === 'photo' && !t.supportsPhoto) return false;
    if (filterPhoto === 'no-photo' && t.supportsPhoto) return false;
    if (filterAtsOnly && t.atsScore < 95) return false;

    return true;
  });

  // Switch to next or previous template in preview
  const handleNavigateTemplate = (direction: 'prev' | 'next') => {
    if (!previewTemplate) return;
    const currentIndex = CV_TEMPLATES.findIndex((t) => t.id === previewTemplate.id);
    if (currentIndex === -1) return;

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = CV_TEMPLATES.length - 1;
    if (nextIndex >= CV_TEMPLATES.length) nextIndex = 0;

    const nextTmpl = CV_TEMPLATES[nextIndex];
    setPreviewTemplate(nextTmpl);
    setPreviewColor(nextTmpl.defaultThemeColor);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    const higherPresets = ZOOM_PRESETS.filter((z) => z > zoom);
    if (higherPresets.length > 0) {
      setZoom(higherPresets[0]);
    } else {
      setZoom(150);
    }
  };

  const handleZoomOut = () => {
    const lowerPresets = ZOOM_PRESETS.filter((z) => z < zoom);
    if (lowerPresets.length > 0) {
      setZoom(lowerPresets[lowerPresets.length - 1]);
    } else {
      setZoom(50);
    }
  };

  const handleApplyTemplate = (templateId: CVTemplateId) => {
    onSelectTemplate(templateId);
    setSaveToast(`Đã áp dụng mẫu "${getTemplateById(templateId).name}" thành công!`);
    setTimeout(() => {
      setSaveToast(null);
      setPreviewTemplate(null);
    }, 1200);
  };

  // =========================================================================
  // VIEW MODE A: FULL-PAGE IN-CONTENT PREVIEW (NO POPUP, NO MODAL)
  // =========================================================================
  if (previewTemplate) {
    const isCurrentlySelected = currentTemplateId === previewTemplate.id;

    return (
      <div className="space-y-4 animate-fade-in text-left">
        {/* Floating / Sticky In-Page Control Toolbar */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
          {/* Left: Back button & Template Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewTemplate(null)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại thư viện mẫu</span>
            </button>

            {/* Quick Template Switcher (< and >) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleNavigateTemplate('prev')}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
                title="Mẫu trước đó"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-700 px-2 min-w-[120px] sm:min-w-[150px] text-center truncate">
                {previewTemplate.name}
              </span>
              <button
                type="button"
                onClick={() => handleNavigateTemplate('next')}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
                title="Mẫu kế tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                {previewTemplate.categoryName}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ATS {previewTemplate.atsScore}%</span>
              </span>
            </div>
          </div>

          {/* Center & Right: Theme Colors, Zoom Controls, Apply Button */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
            {/* Color Palette Swatches */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 pl-1.5 pr-0.5 hidden sm:inline">Màu:</span>
              {COLOR_PALETTES.slice(0, 5).map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setPreviewColor(col.hex)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                    previewColor === col.hex ? 'scale-125 ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-110 opacity-90'
                  }`}
                  title={col.label}
                />
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 px-1 py-0.5 focus:outline-none cursor-pointer"
              >
                {ZOOM_PRESETS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}%
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={calculateAutoFitZoom}
                className="px-2 py-1 rounded-lg hover:bg-white text-[11px] font-bold text-blue-700 transition-colors cursor-pointer flex items-center gap-1 ml-0.5"
                title="Tự động thu phóng vừa khung hình"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Vừa khung</span>
              </button>
            </div>

            {/* Action: Use this template */}
            <button
              type="button"
              onClick={() => handleApplyTemplate(previewTemplate.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                isCurrentlySelected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCurrentlySelected ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đang sử dụng mẫu này</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sử dụng mẫu này</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {saveToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Preview Workspace Canvas */}
        <div
          ref={previewContainerRef}
          className="bg-slate-100/90 border border-slate-200 rounded-3xl p-4 sm:p-8 flex flex-col items-center min-h-[85vh] overflow-x-auto relative"
        >
          {/* Top Canvas Information Pill */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-[11px] text-slate-600 font-medium">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Khổ giấy A4 tiêu chuẩn (210 mm × 297 mm)</span>
            <span className="text-slate-300">•</span>
            <span>Mức hiển thị: {zoom}%</span>
            <span className="text-slate-300">•</span>
            <span>Cuộn dọc để xem toàn bộ nội dung</span>
          </div>

          {/* Scaled A4 Document Container */}
          <div
            style={{
              width: '794px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: `${Math.max(0, (zoom / 100 - 1) * 1150)}px`,
            }}
            className="transition-transform duration-150 ease-out shrink-0"
          >
            {/* The A4 Sheet */}
            <div className="bg-white rounded-sm shadow-2xl border border-slate-300/80 min-h-[1123px] text-left transition-all">
              <CVRenderer
                cvData={cvData}
                templateId={previewTemplate.id}
                themeConfig={{
                  primaryColor: previewColor,
                }}
                isPrintMode={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: TEMPLATE GALLERY GRID
  // =========================================================================
  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 1. Smart Recommendation Banner from Chị An */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block shrink-0">
            <ChiAnCharacter height={105} state="guiding" interactive={false} />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi Ý Mẫu Thông Minh Từ Chị An</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Đề xuất cho bạn: <span className="text-blue-600">{recommendation.template.name}</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setPreviewTemplate(recommendation.template);
              setPreviewColor(recommendation.template.defaultThemeColor);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Xem trước toàn trang</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyTemplate(recommendation.template.id)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span>Dùng mẫu này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Category Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả mẫu ({CV_TEMPLATES.length})
          </button>

          {CV_CATEGORIES.map((cat) => {
            const count = CV_TEMPLATES.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/25 text-white font-bold' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Quick Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên mẫu, ngành nghề, từ khóa..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Photo filter */}
            <select
              value={filterPhoto}
              onChange={(e) => setFilterPhoto(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
            >
              <option value="all">Mọi loại mẫu (Có/Không ảnh)</option>
              <option value="photo">Chỉ mẫu có ảnh chân dung</option>
              <option value="no-photo">Mẫu thuần chữ (Không ảnh)</option>
            </select>

            {/* ATS Score Toggle */}
            <button
              type="button"
              onClick={() => setFilterAtsOnly(!filterAtsOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border ${
                filterAtsOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Điểm ATS ≥ 95%</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Templates Grid (24 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((template) => {
          const isSelected = currentTemplateId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Thumbnail Area with Live Miniature Render */}
              <div
                onClick={() => {
                  setPreviewTemplate(template);
                  setPreviewColor(template.defaultThemeColor);
                }}
                className="p-3.5 bg-slate-50/80 cursor-pointer relative group-hover:bg-slate-100/80 transition-colors flex items-center justify-center border-b border-slate-100"
              >
                <div className="w-[85%] max-w-[210px] transform group-hover:scale-[1.02] transition-transform">
                  <MiniCVPreview
                    template={template}
                    candidateName={cvData.contact.fullName || 'NGUYỄN MINH ANH'}
                  />
                </div>

                {/* Floating Preview Overlay Button */}
                <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                  <span className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Xem trước toàn trang
                  </span>
                </div>

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  {template.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-xs">
                      {template.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đang dùng
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-extrabold text-[10px] backdrop-blur-xs">
                    ATS {template.atsScore}%
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {template.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {template.categoryName}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {template.description}
                  </p>

                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                      🎯 {template.recommendedFor}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTemplate(template);
                      setPreviewColor(template.defaultThemeColor);
                    }}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xem trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(template.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chọn</span>
                      </>
                    ) : (
                      <span>Sử dụng</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
