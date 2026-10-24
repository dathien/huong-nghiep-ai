import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mic,
  Briefcase,
  GraduationCap,
  Code2,
  Palette,
  TrendingUp,
  Cpu,
  LineChart,
  Award,
  Layers,
  Compass,
  FileText
} from 'lucide-react';
import { AppTab } from '../types';

interface HeroSliderProps {
  onNavigateTab: (tab: AppTab) => void;
  userProgress?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onNavigateTab,
  userProgress = 75,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = 5;

  // 6000ms auto-slide with progress indicator and tab visibility listener
  useEffect(() => {
    let intervalId: any = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!isPaused) {
      const intervalTime = 6000;
      const stepTime = 60;
      const stepIncrement = (stepTime / intervalTime) * 100;

      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentSlide((curr) => (curr + 1) % totalSlides);
            return 0;
          }
          return prev + stepIncrement;
        });
      }, stepTime);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentSlide(idx);
    setProgress(0);
  };

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      className="relative w-full h-[320px] sm:h-[300px] rounded-[20px] overflow-hidden shadow-md border border-slate-200/90 transition-all select-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      {/* Dynamic Slide Canvas (keyed by currentSlide for pristine fresh animation re-trigger) */}
      <div key={currentSlide} className="relative w-full h-full">
        {/* SLIDE 1: KHÁM PHÁ BẢN THÂN */}
        {currentSlide === 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-100/60 p-6 sm:px-10 py-6 flex items-center justify-between text-slate-800">
            {/* Background subtle elements */}
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-10 -top-10 w-60 h-60 bg-teal-100/40 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-lg space-y-3.5 anim-slide-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-[11px] font-bold tracking-wider uppercase border border-blue-200">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>BƯỚC 1: ĐỊNH HƯỚNG BẢN THÂN</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                KHÁM PHÁ BẢN THÂN
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                Hiểu điểm mạnh, nhận diện sở thích và khám phá năng lực của chính mình.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('self-discovery')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right SVG Illustration */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 lg:w-88 h-full relative">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Connecting SVG Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 240">
                  {/* Line to Top Left: Sở thích */}
                  <line x1="120" y1="120" x2="45" y2="45" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" className="anim-line-draw" />
                  {/* Line to Top Right: Kỹ năng */}
                  <line x1="120" y1="120" x2="195" y2="45" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" className="anim-line-draw" style={{ animationDelay: '150ms' }} />
                  {/* Line to Bottom Left: Điểm mạnh */}
                  <line x1="120" y1="120" x2="45" y2="195" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" className="anim-line-draw" style={{ animationDelay: '300ms' }} />
                  {/* Line to Bottom Right: Mục tiêu */}
                  <line x1="120" y1="120" x2="195" y2="195" stroke="#93C5FD" strokeWidth="2" strokeDasharray="4 4" className="anim-line-draw" style={{ animationDelay: '450ms' }} />
                </svg>

                {/* Center Student Character */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-white border-4 border-blue-500 shadow-md flex items-center justify-center anim-fade-soft">
                  <svg viewBox="0 0 80 80" className="w-16 h-16">
                    {/* Student Head & Hair */}
                    <circle cx="40" cy="36" r="18" fill="#FDE68A" />
                    <path d="M 24 32 C 24 20, 56 20, 56 32 C 54 22, 48 20, 40 20 C 32 20, 26 22, 24 32 Z" fill="#1E293B" />
                    {/* Glasses */}
                    <circle cx="34" cy="35" r="5" fill="none" stroke="#2563EB" strokeWidth="2" />
                    <circle cx="46" cy="35" r="5" fill="none" stroke="#2563EB" strokeWidth="2" />
                    <line x1="39" y1="35" x2="41" y2="35" stroke="#2563EB" strokeWidth="2" />
                    {/* Smile */}
                    <path d="M 36 43 Q 40 48 44 43" stroke="#B45309" strokeWidth="2" fill="none" strokeLinecap="round" />
                    {/* Shoulders */}
                    <path d="M 22 68 C 22 54, 58 54, 58 68 Z" fill="#2563EB" />
                    <polygon points="36,54 44,54 40,62" fill="#FFFFFF" />
                  </svg>
                </div>

                {/* Card 1: Sở thích (Top Left) */}
                <div
                  className="absolute top-2 left-0 bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1.5 anim-card-reveal"
                  style={{ animationDelay: '100ms' }}
                >
                  <span className="anim-float-gentle text-sm">🎨</span>
                  <span>Sở thích</span>
                </div>

                {/* Card 2: Kỹ năng (Top Right) */}
                <div
                  className="absolute top-2 right-0 bg-white border border-teal-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1.5 anim-card-reveal"
                  style={{ animationDelay: '200ms' }}
                >
                  <span className="anim-float-gentle text-sm" style={{ animationDelay: '500ms' }}>💻</span>
                  <span>Kỹ năng</span>
                </div>

                {/* Card 3: Điểm mạnh (Bottom Left) */}
                <div
                  className="absolute bottom-2 left-0 bg-white border border-amber-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1.5 anim-card-reveal"
                  style={{ animationDelay: '300ms' }}
                >
                  <span className="anim-float-gentle text-sm" style={{ animationDelay: '1000ms' }}>💪</span>
                  <span>Điểm mạnh</span>
                </div>

                {/* Card 4: Mục tiêu (Bottom Right) */}
                <div
                  className="absolute bottom-2 right-0 bg-white border border-indigo-200 rounded-xl px-2.5 py-1.5 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1.5 anim-card-reveal"
                  style={{ animationDelay: '400ms' }}
                >
                  <span className="anim-float-gentle text-sm" style={{ animationDelay: '1500ms' }}>🎯</span>
                  <span>Mục tiêu</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: KHÁM PHÁ NGHỀ NGHIỆP */}
        {currentSlide === 1 && (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-emerald-50/70 to-teal-100/60 p-6 sm:px-10 py-6 flex items-center justify-between text-slate-800">
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-teal-200/30 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-lg space-y-3.5 anim-slide-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/10 text-teal-700 text-[11px] font-bold tracking-wider uppercase border border-teal-200">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                <span>BƯỚC 2: KHÁM PHÁ NGHỀ NGHIỆP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                KHÁM PHÁ NGHỀ NGHIỆP
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                Tìm hiểu các ngành nghề và lựa chọn hướng phát triển phù hợp.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('career-explore')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Tìm hiểu nghề nghiệp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Career Cards with subtle elevations */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 lg:w-92 h-full relative">
              <div className="relative w-72 h-64 flex flex-col justify-center items-center gap-2">
                {/* Row 1: 2 Cards */}
                <div className="flex gap-2.5 w-full justify-center">
                  <div
                    className="bg-white border border-blue-200 rounded-xl px-3 py-2 shadow-xs text-xs font-bold text-slate-800 flex items-center gap-2 anim-card-reveal hover:border-blue-400 transition-all"
                    style={{ animationDelay: '100ms' }}
                  >
                    <span className="anim-float-gentle text-blue-600"><Code2 className="w-4 h-4" /></span>
                    <span>CNTT</span>
                  </div>

                  <div
                    className="bg-white border border-teal-200 rounded-xl px-3 py-2 shadow-xs text-xs font-bold text-slate-800 flex items-center gap-2 anim-card-reveal hover:border-teal-400 transition-all"
                    style={{ animationDelay: '200ms' }}
                  >
                    <span className="anim-float-gentle text-teal-600" style={{ animationDelay: '400ms' }}><Palette className="w-4 h-4" /></span>
                    <span>Thiết kế đồ họa</span>
                  </div>
                </div>

                {/* Center Row: Elevated Center Card (Marketing) */}
                <div
                  className="bg-white border-2 border-emerald-500 rounded-2xl px-5 py-3 shadow-md text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2.5 anim-card-reveal -translate-y-1 scale-105 z-10"
                  style={{ animationDelay: '300ms' }}
                >
                  <span className="anim-float-gentle text-emerald-600"><TrendingUp className="w-5 h-5" /></span>
                  <span>Marketing & Truyền thông</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
                </div>

                {/* Row 3: 2 Cards */}
                <div className="flex gap-2.5 w-full justify-center">
                  <div
                    className="bg-white border border-amber-200 rounded-xl px-3 py-2 shadow-xs text-xs font-bold text-slate-800 flex items-center gap-2 anim-card-reveal hover:border-amber-400 transition-all"
                    style={{ animationDelay: '400ms' }}
                  >
                    <span className="anim-float-gentle text-amber-600" style={{ animationDelay: '800ms' }}><Cpu className="w-4 h-4" /></span>
                    <span>Kỹ thuật</span>
                  </div>

                  <div
                    className="bg-white border border-indigo-200 rounded-xl px-3 py-2 shadow-xs text-xs font-bold text-slate-800 flex items-center gap-2 anim-card-reveal hover:border-indigo-400 transition-all"
                    style={{ animationDelay: '500ms' }}
                  >
                    <span className="anim-float-gentle text-indigo-600" style={{ animationDelay: '1200ms' }}><LineChart className="w-4 h-4" /></span>
                    <span>Kinh doanh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: THIẾT KẾ CV */}
        {currentSlide === 2 && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-100/60 p-6 sm:px-10 py-6 flex items-center justify-between text-slate-800">
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-lg space-y-3.5 anim-slide-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-[11px] font-bold tracking-wider uppercase border border-blue-200">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>BƯỚC 3: HỒ SƠ ỨNG TUYỂN</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                THIẾT KẾ CV ĐẦU TIÊN
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                Biến kiến thức, kỹ năng và dự án học tập thành hồ sơ chuyên nghiệp.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('cv-builder')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Tạo CV ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: SVG/CSS CV Preview Sheet */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 lg:w-88 h-full relative">
              <div className="relative w-52 h-64 bg-white border-2 border-slate-200 rounded-2xl shadow-md p-4 flex flex-col justify-between anim-fade-soft">
                {/* Header: Thông tin cá nhân */}
                <div className="border-b border-slate-100 pb-2 space-y-1.5 anim-card-reveal" style={{ animationDelay: '150ms' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                      NA
                    </div>
                    <div className="space-y-0.5">
                      <div className="w-20 h-2 bg-slate-800 rounded" />
                      <div className="w-14 h-1.5 bg-blue-600 rounded" />
                    </div>
                  </div>
                </div>

                {/* Section: Học vấn */}
                <div className="space-y-1 anim-card-reveal" style={{ animationDelay: '300ms' }}>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Học vấn</div>
                  <div className="w-full h-1.5 bg-slate-200 rounded" />
                  <div className="w-28 h-1.5 bg-slate-100 rounded" />
                </div>

                {/* Section: Kỹ năng with progressFill */}
                <div className="space-y-1.5 anim-card-reveal" style={{ animationDelay: '450ms' }}>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                    <span>Kỹ năng</span>
                    <span className="text-blue-600">90%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[90%] origin-left" style={{ animation: 'progressFill 800ms ease-out forwards' }} />
                  </div>
                </div>

                {/* Section: Dự án */}
                <div className="space-y-1 anim-card-reveal" style={{ animationDelay: '600ms' }}>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Đồ án thực tiễn</div>
                  <div className="w-32 h-1.5 bg-teal-500 rounded" />
                  <div className="w-24 h-1.5 bg-slate-100 rounded" />
                </div>

                {/* Complete Badge Pop */}
                <div
                  className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md flex items-center gap-1 anim-iconPop"
                  style={{ animationDelay: '750ms' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: LUYỆN PHỎNG VẤN AI */}
        {currentSlide === 3 && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-100/60 p-6 sm:px-10 py-6 flex items-center justify-between text-slate-800">
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-lg space-y-3.5 anim-slide-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 text-purple-700 text-[11px] font-bold tracking-wider uppercase border border-purple-200">
                <Mic className="w-3.5 h-3.5 text-purple-600" />
                <span>BƯỚC 4: LUYỆN TẬP PHỎNG VẤN</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                TỰ TIN PHỎNG VẤN
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                Luyện trả lời, nhận góp ý và cải thiện kỹ năng giao tiếp.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('interview-practice')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Bắt đầu luyện tập</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Interview Dialog with 2 Characters & Speech Bubble */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 lg:w-92 h-full relative">
              <div className="relative w-72 h-64 flex flex-col justify-center items-center">
                {/* Speech Bubble */}
                <div
                  className="bg-white border-2 border-purple-300 rounded-2xl p-3 shadow-md text-xs font-bold text-slate-800 relative mb-3 anim-card-reveal"
                  style={{ animationDelay: '300ms' }}
                >
                  <span>"Bạn hãy giới thiệu về bản thân."</span>
                  {/* Chat Dots */}
                  <span className="inline-flex gap-1 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" style={{ animation: 'chatDot 1.2s infinite' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" style={{ animation: 'chatDot 1.2s infinite 0.2s' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" style={{ animation: 'chatDot 1.2s infinite 0.4s' }} />
                  </span>
                  {/* Bubble pointer */}
                  <div className="absolute -bottom-2 left-8 w-3 h-3 bg-white border-r-2 border-b-2 border-purple-300 transform rotate-45" />
                </div>

                {/* 2 Characters Row: Recruiter (Left) & Student (Right) */}
                <div className="flex items-center justify-between w-full px-4 anim-fade-soft" style={{ animationDelay: '150ms' }}>
                  {/* Recruiter */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-purple-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      👔
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">Nhà tuyển dụng</span>
                  </div>

                  {/* Micro Pulse in the middle */}
                  <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center anim-float-gentle text-purple-700">
                    <Mic className="w-5 h-5" />
                  </div>

                  {/* Student */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-14 h-14 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      🎓
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">Học sinh / SV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: XÂY DỰNG TƯƠNG LAI */}
        {currentSlide === 4 && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-100/60 p-6 sm:px-10 py-6 flex items-center justify-between text-slate-800">
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-lg space-y-3.5 anim-slide-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/10 text-amber-700 text-[11px] font-bold tracking-wider uppercase border border-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>BƯỚC 5: HÀNH TRANG NGHỀ NGHIỆP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                XÂY DỰNG TƯƠNG LAI
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug">
                Từng bước phát triển kỹ năng và chuẩn bị hành trang nghề nghiệp.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('career-roadmap')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Xem lộ trình</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: 5 Milestones Timeline (Khám phá -> Học tập -> Thực hành -> Trải nghiệm -> Sẵn sàng) */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center w-72 lg:w-92 h-full relative">
              <div className="w-full space-y-4 px-2">
                {/* Horizontal Progress Bar connecting nodes */}
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-3 right-3 h-1.5 bg-slate-200 rounded-full -z-0" />
                  <div
                    className="absolute left-3 h-1.5 bg-amber-500 rounded-full -z-0 origin-left"
                    style={{
                      width: `${userProgress}%`,
                      animation: 'progressFill 900ms ease-out forwards',
                    }}
                  />

                  {/* 5 Milestone Nodes */}
                  {[
                    { label: 'Khám phá', step: '1', delay: '100ms', active: true },
                    { label: 'Học tập', step: '2', delay: '250ms', active: true },
                    { label: 'Thực hành', step: '3', delay: '400ms', active: true },
                    { label: 'Trải nghiệm', step: '4', delay: '550ms', active: userProgress >= 70 },
                    { label: 'Sẵn sàng', step: '★', delay: '700ms', active: userProgress >= 90 },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 z-10 anim-card-reveal"
                      style={{ animationDelay: m.delay }}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-colors ${
                          m.active
                            ? 'bg-amber-500 text-white ring-2 ring-white'
                            : 'bg-white border-2 border-slate-300 text-slate-500'
                        }`}
                      >
                        {m.step}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Real User Progress Card */}
                <div
                  className="bg-white border border-amber-200 rounded-xl p-3 shadow-xs flex items-center justify-between text-xs anim-fade-soft"
                  style={{ animationDelay: '500ms' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">Tiến độ cá nhân thực tế:</span>
                  </div>
                  <span className="font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    {userProgress}% Hoàn tất
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls: Previous / Next Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-all cursor-pointer z-30"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-all cursor-pointer z-30"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSlide(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-7 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Đi tới slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Auto-Slide Smooth Progress Indicator Bar (at the very bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/60 z-30">
        <div
          className="h-full bg-blue-600 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
