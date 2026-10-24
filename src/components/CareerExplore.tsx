import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { CAREER_TRACKS } from '../data/mockData';
import { AppTab, StudentLevel } from '../types';

interface CareerExploreProps {
  studentLevel: StudentLevel;
  onNavigateTab: (tab: AppTab) => void;
  onSelectCareerForCv?: (title: string, skills: string[]) => void;
}

export const CareerExplore: React.FC<CareerExploreProps> = ({
  studentLevel,
  onNavigateTab,
  onSelectCareerForCv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Công nghệ Thông tin',
    'Dữ liệu & Trí tuệ Nhân tạo',
    'Thiết kế & Sáng tạo',
    'Kinh doanh & Truyền thông',
  ];

  const filteredTracks = CAREER_TRACKS.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.keySkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || track.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleApplyToCv = (track: typeof CAREER_TRACKS[0]) => {
    if (onSelectCareerForCv) {
      onSelectCareerForCv(track.title, track.keySkills);
    }
    onNavigateTab('cv-builder');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Thị Trường Lao Động 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Khám Phá Xu Hướng Nghề Nghiệp
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Tra cứu các vị trí tuyển dụng có nhu cầu cao, dải thu nhập thực tế tại thị trường Việt Nam
            và bộ kỹ năng cốt lõi học sinh, sinh viên cần tích lũy.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Phù hợp với: {studentLevel}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Dữ liệu tổng hợp từ các tập đoàn công nghệ & doanh nghiệp hàng đầu.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm nghề nghiệp, kỹ năng (React, Figma, SQL)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {cat === 'All' ? 'Tất cả ngành' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Career Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs card-hover flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {track.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  {track.growthTrend} nhu cầu
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5 line-clamp-2">
                  {track.description}
                </p>
              </div>

              {/* Salary & Level */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{track.salaryRange}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-slate-400" />
                  <span>Phù hợp: {track.suitableLevels.join(', ')}</span>
                </div>
              </div>

              {/* Key Skills Tags */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Kỹ năng cốt lõi:
                </span>
                <div className="flex flex-wrap gap-1">
                  {track.keySkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleApplyToCv(track)}
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Tạo CV cho vị trí này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
