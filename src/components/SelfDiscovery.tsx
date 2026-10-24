import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  TrendingUp,
  Brain,
  Lightbulb,
  Award
} from 'lucide-react';
import { HOLLAND_QUESTIONS } from '../data/mockData';
import { AppTab } from '../types';

interface SelfDiscoveryProps {
  onNavigateTab: (tab: AppTab) => void;
}

export const SelfDiscovery: React.FC<SelfDiscoveryProps> = ({ onNavigateTab }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 4,
    2: 5,
    3: 4,
    4: 4,
    5: 3,
    6: 4,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const options = [
    { value: 1, label: 'Rất không thích / Không giống tôi' },
    { value: 2, label: 'Ít khi thích' },
    { value: 3, label: 'Bình thường / Trung lập' },
    { value: 4, label: 'Khá thích / Khá giống tôi' },
    { value: 5, label: 'Rất đam mê / Rất giống tôi' },
  ];

  const handleSelectOption = (qId: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (currentStep < HOLLAND_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScores = () => {
    const scores = {
      R: (answers[1] || 3) * 20, // Realistic
      I: (answers[2] || 3) * 20, // Investigative
      A: (answers[3] || 3) * 20, // Artistic
      S: (answers[4] || 3) * 20, // Social
      E: (answers[5] || 3) * 20, // Enterprising
      C: (answers[6] || 3) * 20, // Conventional
    };
    return scores;
  };

  const scores = calculateScores();

  const getTopTraits = () => {
    const traitNames: Record<string, { name: string; desc: string; icon: string }> = {
      I: { name: 'Nhóm Nghiên cứu (Investigative)', desc: 'Thích phân tích dữ liệu, giải quyết vấn đề kỹ thuật và tư duy logic.', icon: '🔬' },
      R: { name: 'Nhóm Kỹ thuật & Thực hành (Realistic)', desc: 'Thích tự tay xây dựng hệ thống, thao tác công cụ và sản phẩm cụ thể.', icon: '⚙️' },
      A: { name: 'Nhóm Sáng tạo & Nghệ thuật (Artistic)', desc: 'Thích thiết kế giao diện, sáng tạo nội dung và trực quan hóa ý tưởng.', icon: '🎨' },
      S: { name: 'Nhóm Xã hội (Social)', desc: 'Thích chia sẻ kiến thức, hướng dẫn và hỗ trợ người khác cùng phát triển.', icon: '🤝' },
      E: { name: 'Nhóm Quản lý (Enterprising)', desc: 'Thích lãnh đạo, lập kế hoạch và thúc đẩy mục tiêu của đội nhóm.', icon: '🚀' },
      C: { name: 'Nhóm Nghiệp vụ (Conventional)', desc: 'Thích sự chỉn chu, bài bản, quản lý tài liệu và quy trình chuẩn mực.', icon: '📋' },
    };

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([key, score]) => ({
      key,
      score,
      ...traitNames[key],
    }));
  };

  const topTraits = getTopTraits();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Compass className="w-3.5 h-3.5" />
            <span>Định Hướng Nghề Nghiệp Holland (RIASEC)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Khám Phá Năng Lực & Bản Thân
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Hiểu rõ sở trường và phong cách tư duy của bạn để chọn đúng chuyên ngành, hướng đi thực tập
            và xây dựng bộ kỹ năng đón đầu cơ hội.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCompleted(false);
            setCurrentStep(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm lại trắc nghiệm</span>
        </button>
      </div>

      {/* Interactive Assessment Flow */}
      {!isCompleted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Câu hỏi {currentStep + 1} / {HOLLAND_QUESTIONS.length}</span>
              <span className="text-blue-600">
                {Math.round(((currentStep + 1) / HOLLAND_QUESTIONS.length) * 100)}% Hoàn thành
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / HOLLAND_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Tình huống & Thói quen học tập</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {HOLLAND_QUESTIONS[currentStep].text}
            </h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {options.map((opt) => {
                const isSelected = answers[HOLLAND_QUESTIONS[currentStep].id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectOption(HOLLAND_QUESTIONS[currentStep].id, opt.value)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
            >
              ← Câu trước
            </button>

            <button
              onClick={() => {
                if (currentStep < HOLLAND_QUESTIONS.length - 1) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  setIsCompleted(true);
                }
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{currentStep === HOLLAND_QUESTIONS.length - 1 ? 'Xem kết quả' : 'Tiếp tục'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6 animate-slide-up">
          {/* Top Personality Summary */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
            <div className="max-w-2xl space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Mã Holland Của Bạn: {topTraits.map((t) => t.key).join('')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {topTraits[0].name.split(' (')[0]} & {topTraits[1].name.split(' (')[0]}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed font-sans">
                Bạn sở hữu năng lực phân tích xuất sắc, kết hợp khả năng biến ý tưởng kỹ thuật thành
                sản phẩm thực tế. Bạn phát huy tối đa tiềm năng trong các môi trường đề cao sự chủ động,
                sáng tạo giải pháp và làm việc dựa trên dữ liệu.
              </p>
            </div>
          </div>

          {/* Scores Breakdown & Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: 6 Dimensions Bars */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Phổ điểm 6 nhóm tính cách nghề nghiệp
              </h4>

              <div className="space-y-3">
                {Object.entries(scores).map(([k, score]) => {
                  const labels: Record<string, string> = {
                    R: 'Realistic (Thực tế & Kỹ thuật)',
                    I: 'Investigative (Nghiên cứu & Logic)',
                    A: 'Artistic (Nghệ thuật & Sáng tạo)',
                    S: 'Social (Xã hội & Giao tiếp)',
                    E: 'Enterprising (Quản lý & Thuyết phục)',
                    C: 'Conventional (Nghiệp vụ & Quy củ)',
                  };
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{labels[k]}</span>
                        <span className="text-blue-600">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Suggested Career Tracks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  3 Hướng đi phù hợp nhất với bạn
                </h4>

                <div className="space-y-3">
                  {topTraits.map((t, idx) => (
                    <div
                      key={t.key}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{t.icon}</span>
                          <span>{t.name}</span>
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {t.score}% khớp
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-snug">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Bước tiếp theo:</span>
                <button
                  onClick={() => onNavigateTab('career-explore')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Khám phá chi tiết các ngành nghề</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
