import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  TrendingUp,
  Brain,
  Globe,
  RefreshCw
} from 'lucide-react';
import { BulletRewriteResult, IndustryType } from '../types';

interface BulletRewriterProps {
  selectedIndustry: IndustryType;
}

export const BulletRewriter: React.FC<BulletRewriterProps> = ({ selectedIndustry }) => {
  const [bulletInput, setBulletInput] = useState('Worked on a mobile app');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [metricGoal, setMetricGoal] = useState('Tối ưu hóa hiệu năng & thời gian xử lý');
  const [result, setResult] = useState<BulletRewriteResult | null>({
    original: 'Worked on a mobile app',
    improved:
      'Collaborated with a 4-member cross-functional team to architect and deploy a responsive mobile application with React Native, improving daily task management efficiency by 30% for 5,000+ active users.',
    recruiterSignal:
      'Thể hiện tinh thần làm việc nhóm (4 thành viên), năng lực kỹ thuật rõ ràng (React Native), quy mô sản phẩm (5,000+ users) và giá trị kinh doanh đo lường được (30% efficiency).',
    formulaUsed: 'Google XYZ Formula: Đạt được X [30% efficiency], đo lường bằng Y [5,000 users], bằng cách làm Z [phát triển app React Native cùng team 4 người].',
    variations: [
      'Engineered core modules of a high-performance cross-platform mobile application, decreasing API latency by 45% and elevating Crash-Free rate to 99.8%.',
      'Spearheaded end-to-end development of mobile client features, conducting rigorous code reviews and cutting user onboarding drop-off by 22%.',
    ],
    englishVersion:
      'Collaborated with a 4-member team to develop a mobile application that improved task management efficiency by 30%.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const presets = [
    {
      title: 'Mobile App',
      text: 'Worked on a mobile app',
      role: 'Mobile Developer',
      metric: 'Hiệu suất và sự hài lòng người dùng',
    },
    {
      title: 'Web Bán hàng React',
      text: 'Tham gia xây dựng website bán hàng trực tuyến bằng React và Node.js',
      role: 'Frontend Developer',
      metric: 'Tốc độ tải trang và tỷ lệ chuyển đổi đơn hàng',
    },
    {
      title: 'Viết API Backend',
      text: 'Viết API cho hệ thống đăng ký và quản lý đơn hàng',
      role: 'Backend Engineer',
      metric: 'Tải hệ thống RPS và giảm độ trễ truy vấn',
    },
    {
      title: 'Phân tích dữ liệu',
      text: 'Lấy dữ liệu và làm báo cáo dashboard hàng tuần cho ban quản trị',
      role: 'Data Analyst',
      metric: 'Tự động hóa báo cáo và giảm thời gian ra quyết định',
    },
    {
      title: 'Chăm sóc khách hàng',
      text: 'Hỗ trợ khách hàng qua email và giải đáp thắc mắc dịch vụ',
      role: 'Customer Success / Operations',
      metric: 'Tỷ lệ CSAT và thời gian giải quyết yêu cầu',
    },
  ];

  const handleRewrite = async () => {
    if (!bulletInput.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: bulletInput,
          role: targetRole,
          industry: selectedIndustry,
          metricGoal,
        }),
      });

      if (!res.ok) throw new Error('Không thể tối ưu bullet point');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Không thể kết nối máy chủ'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                High-Impact Writing Engine
              </span>
              <span className="text-xs text-slate-400">• Google XYZ Formula • Quantified Metrics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Nâng Cấp Thành Tích Với Số Liệu Đo Lường (Metrics)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Biến các mô tả công việc yếu, thụ động ("Worked on...", "Tham gia...") thành các câu hành động
              mạnh mẽ, mang đậm tín hiệu tuyển dụng và kết quả kinh doanh định lượng.
            </p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Chọn câu mẫu để thử nghiệm nhanh:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBulletInput(p.text);
                setTargetRole(p.role);
                setMetricGoal(p.metric);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              ⚡ {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Vị trí công việc:
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mục tiêu đo lường (Metric Focus):
            </label>
            <input
              type="text"
              value={metricGoal}
              onChange={(e) => setMetricGoal(e.target.value)}
              placeholder="Hiệu năng, tỷ lệ chuyển đổi, tiết kiệm thời gian..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
            <span>Bullet point gốc cần nâng cấp:</span>
            <span className="text-slate-500 text-[11px] font-normal">
              Ví dụ: "Worked on a mobile app" hoặc "Làm trang quản trị viên"
            </span>
          </label>
          <textarea
            rows={3}
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:border-indigo-500 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRewrite}
            disabled={!bulletInput.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang áp dụng công thức High-Impact...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Nâng Cấp Thành Tích Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Main Upgraded Card */}
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Phiên bản tối ưu số 1 (High-Impact Master)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  {result.formulaUsed}
                </span>

                <button
                  onClick={() => copyText('main', result.improved)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'main' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              "{result.improved}"
            </p>

            {/* Recruiter psychology signal */}
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Tín hiệu Recruiter nhận được:</span>
                <span>{result.recruiterSignal}</span>
              </div>
            </div>
          </div>

          {/* Variations & English */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Variations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Các phương án biến thể (Focus Variations)
              </span>

              <div className="space-y-2.5">
                {result.variations.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-200 space-y-2"
                  >
                    <p className="leading-relaxed">"{v}"</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => copyText(`v-${idx}`, v)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        {copiedKey === `v-${idx}` ? 'Đã sao chép' : 'Sao chép câu này'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* English Version */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Phiên bản tiếng Anh cho CV Quốc tế
              </span>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed space-y-3">
                <p>"{result.englishVersion}"</p>
                <div className="flex justify-end pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => copyText('en', result.englishVersion)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    {copiedKey === 'en' ? 'Đã sao chép' : 'Sao chép tiếng Anh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
