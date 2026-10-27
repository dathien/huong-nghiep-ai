import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Check,
  Eye,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { CVData, CVTemplateCategory, CVTemplateId, CVTemplateMeta, StudentLevel } from '../types';
import { CV_CATEGORIES, CV_TEMPLATES, getRecommendedTemplate } from '../templates/templateRegistry';
import { MiniCVPreview } from '../templates/MiniCVPreview';
import { CVRenderer } from '../templates/CVRenderer';
import { ChiAnCharacter } from './ChiAnMascot';

interface TemplateGalleryProps {
  currentTemplateId: CVTemplateId | string;
  onSelectTemplate: (templateId: CVTemplateId) => void;
  cvData: CVData;
  studentLevel: StudentLevel;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  currentTemplateId,
  onSelectTemplate,
  cvData,
  studentLevel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CVTemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhoto, setFilterPhoto] = useState<'all' | 'photo' | 'no-photo'>('all');
  const [filterAtsOnly, setFilterAtsOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateMeta | null>(null);
  const [previewColor, setPreviewColor] = useState<string>('#2563eb');

  const recommendation = getRecommendedTemplate(studentLevel, cvData.contact.title);

  // Filter templates
  const filteredTemplates = CV_TEMPLATES.filter((t) => {
    // Category match
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchRec = t.recommendedFor.toLowerCase().includes(q);
      const matchCat = t.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchRec && !matchCat) return false;
    }

    // Photo filter
    if (filterPhoto === 'photo' && !t.supportsPhoto) return false;
    if (filterPhoto === 'no-photo' && t.supportsPhoto) return false;

    // ATS filter
    if (filterAtsOnly && t.atsScore < 95) return false;

    return true;
  });

  const colorPalettes = [
    { label: 'Navy Blue', hex: '#1e40af' },
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Sky Blue', hex: '#0284c7' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Teal', hex: '#0f766e' },
    { label: 'Indigo', hex: '#4f46e5' },
    { label: 'Wine', hex: '#831843' },
    { label: 'Slate', hex: '#334155' },
    { label: 'Monochrome', hex: '#18181b' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Smart Recommendation Banner from Chị An */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block flex-shrink-0">
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

        <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setPreviewTemplate(recommendation.template);
              setPreviewColor(recommendation.template.defaultThemeColor);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer"
          >
            Xem trước
          </button>
          <button
            type="button"
            onClick={() => onSelectTemplate(recommendation.template.id)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span>Dùng mẫu này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Category Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Quick Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên mẫu, ngành nghề, từ khóa..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
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
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none"
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
              className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
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
                className="p-3 bg-slate-50/80 cursor-pointer relative group-hover:bg-slate-100/80 transition-colors flex items-center justify-center"
              >
                <div className="w-[85%] max-w-[210px] transform group-hover:scale-[1.02] transition-transform">
                  <MiniCVPreview
                    template={template}
                    candidateName={cvData.contact.fullName || 'NGUYỄN MINH ANH'}
                  />
                </div>

                {/* Floating Preview Overlay Button */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Xem trước mẫu
                  </span>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
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

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-extrabold text-[10px] backdrop-blur-xs">
                    ATS {template.atsScore}%
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
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
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem thử</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(template.id)}
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
                      <span>Dùng mẫu</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Full-screen Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[94vh] animate-scale-in">
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  CV
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Mẫu: {previewTemplate.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                      {previewTemplate.categoryName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      Điểm ATS: {previewTemplate.atsScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{previewTemplate.recommendedFor}</p>
                </div>
              </div>

              {/* Theme Color Swatches */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-300 pr-1">Màu:</span>
                {colorPalettes.slice(0, 6).map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPreviewColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                      previewColor === c.hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Sử dụng mẫu này ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Real Rendered CV */}
            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
              <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                <CVRenderer
                  cvData={cvData}
                  templateId={previewTemplate.id}
                  themeConfig={{
                    primaryColor: previewColor,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
