import React from 'react';
import { HeroSlider } from './HeroSlider';
import { ChiAnCard } from './ChiAnMascot';
import {
  Compass,
  FileText,
  Mic,
  Route,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { AppTab, CVData, StudentLevel } from '../types';

interface DashboardProps {
  studentLevel: StudentLevel;
  cvData: CVData;
  onNavigateTab: (tab: AppTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  studentLevel,
  cvData,
  onNavigateTab,
}) => {
  // Calculate real profile completion rate
  const calculateProfileScore = () => {
    let score = 20; // Base info
    if (cvData.summary && cvData.summary.length > 50) score += 15;
    if (cvData.skills.technical.length >= 3) score += 15;
    if (cvData.skills.core.length >= 2) score += 10;
    if (cvData.projects.length >= 1) score += 20;
    if (cvData.education.length >= 1) score += 10;
    if (cvData.certifications.length >= 1) score += 10;
    return Math.min(100, score);
  };

  const profileScore = calculateProfileScore();

  const mainCards = [
    {
      id: 'self-discovery' as AppTab,
      title: 'Khám phá năng lực',
      subtitle: 'Định vị sở trường & đam mê',
      desc: 'Làm bài trắc nghiệm Holland Code (RIASEC) để biết bạn thuộc nhóm tính cách và ngành nghề nào.',
      icon: Compass,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      badge: 'Bắt đầu ngay',
      badgeColor: 'bg-blue-100 text-blue-700',
      borderHover: 'hover:border-blue-300',
    },
    {
      id: 'cv-builder' as AppTab,
      title: 'Tạo CV đầu tiên',
      subtitle: 'Chuẩn ATS, 2 cột chuyên nghiệp',
      desc: 'Công nghệ AI biến đồ án trường học thành kinh nghiệm thực chiến thuyết phục trong mắt nhà tuyển dụng.',
      icon: FileText,
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      badge: 'Khuyên dùng',
      badgeColor: 'bg-teal-100 text-teal-700',
      borderHover: 'hover:border-teal-300',
    },
    {
      id: 'interview-practice' as AppTab,
      title: 'Luyện phỏng vấn',
      subtitle: 'Mô phỏng 1-1 với AI Recruiter',
      desc: 'Rèn luyện phản xạ với các câu hỏi thực tế, nhận điểm đánh giá cấu trúc STAR và câu trả lời mẫu xuất sắc.',
      icon: Mic,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      badge: 'Thực chiến',
      badgeColor: 'bg-purple-100 text-purple-700',
      borderHover: 'hover:border-purple-300',
    },
    {
      id: 'career-roadmap' as AppTab,
      title: 'Xây dựng lộ trình',
      subtitle: 'Hành trang 4 năm vững bước',
      desc: 'Theo dõi từng mốc phát triển theo năm học: tích lũy kiến thức, làm dự án, săn học bổng và thực tập.',
      icon: Route,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      badge: 'Dài hạn',
      badgeColor: 'bg-amber-100 text-amber-700',
      borderHover: 'hover:border-amber-300',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chào bạn! 👋
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              {studentLevel}
            </span>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-600">
            Hôm nay bạn muốn chuẩn bị gì cho tương lai?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Mức độ sẵn sàng nghề nghiệp
            </span>
            <span className="text-lg font-extrabold text-blue-600">
              {profileScore}% Sẵn sàng
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-blue-600/20 border-t-blue-600 flex items-center justify-center font-bold text-xs text-blue-600 bg-blue-50">
            {profileScore}%
          </div>
        </div>
      </div>

      {/* 2. Hero Slider (5 Chuyên đề Đột phá) */}
      <section aria-label="Hero Slider">
        <HeroSlider onNavigateTab={onNavigateTab} userProgress={profileScore} />
      </section>

      {/* 3. Dedicated Card: CHỊ AN – NGƯỜI BẠN ĐỒNG HÀNH */}
      <section aria-label="Chị An – Người bạn đồng hành">
        <ChiAnCard onNavigateTab={onNavigateTab} />
      </section>

      {/* 4. 4 Large Action Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Các Trọng Tâm Phát Triển
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn một phân hệ để bắt đầu nâng cấp năng lực bản thân
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mainCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs card-hover flex flex-col justify-between ${card.borderHover}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shadow-xs`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 tracking-tight">
                      {card.title}
                    </h4>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      {card.subtitle}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateTab(card.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                  >
                    <span>Bắt đầu</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Real Metrics & Student Progress Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 of 12): Profile Progress & Skills Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Progress Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Tiến độ hoàn thiện hồ sơ năng lực
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu được trích xuất trực tiếp từ hồ sơ thực của bạn
                </p>
              </div>
              <span className="text-sm font-extrabold text-blue-600">{profileScore}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${profileScore}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Thông tin cá nhân & Liên hệ</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Học vấn ({cvData.education[0]?.degree || 'Đã cập nhật'})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Kỹ năng chuyên môn ({cvData.skills.technical.length} công nghệ)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Dự án thực tiễn ({cvData.projects.length} đồ án)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('competency-profile')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem và chỉnh sửa toàn bộ hồ sơ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Updated Skills Tags Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Kỹ năng đã cập nhật
              </h4>
              <span className="text-xs text-slate-400">
                {cvData.skills.technical.length + cvData.skills.tools.length} kỹ năng
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Kỹ thuật & Công nghệ:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cvData.skills.technical.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {cvData.skills.tools.map((tool, idx) => (
                    <span
                      key={`tool-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Kỹ năng cốt lõi & Mềm:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cvData.skills.core.map((core, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 text-xs font-medium"
                    >
                      {core}
                    </span>
                  ))}
                  {cvData.skills.soft.map((soft, idx) => (
                    <span
                      key={`soft-${idx}`}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 text-xs font-medium"
                    >
                      {soft}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 of 12): Recent CV Preview & Next Activities */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent CV Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Bản thảo CV gần đây
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                Chuẩn ATS
              </span>
            </div>

            {/* Mini preview card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    {cvData.contact.fullName}
                  </h5>
                  <p className="text-xs text-blue-600 font-medium">
                    {cvData.contact.title}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">1 Trang A4</span>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {cvData.summary}
              </p>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {cvData.projects.length} đồ án • {cvData.education[0]?.school}
                </span>
                <button
                  onClick={() => onNavigateTab('cv-builder')}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Chỉnh sửa CV</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Next Activities / Recommendations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Hoạt động tiếp theo khuyến nghị
            </h4>

            <div className="space-y-3">
              <div
                onClick={() => onNavigateTab('internship-jobs')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Quét độ khớp CV với tin tuyển dụng (JD)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kiểm tra điểm 6 giây skim và tìm các từ khóa ATS còn thiếu.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('interview-practice')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Luyện tập 1 buổi Mock Interview 1-1
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tập trả lời câu hỏi dự án kỹ thuật bằng giọng nói hoặc văn bản.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onNavigateTab('career-roadmap')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all cursor-pointer flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Cập nhật mốc lộ trình học tập kỳ này
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đánh dấu các chứng chỉ online hoặc mục tiêu GPA vừa hoàn thành.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
