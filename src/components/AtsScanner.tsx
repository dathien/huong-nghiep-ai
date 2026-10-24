import React, { useState } from 'react';
import {
  FileCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Zap,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Search,
  Target,
  ArrowRight
} from 'lucide-react';
import { ATSMatchReport, IndustryType } from '../types';
import { SAMPLE_DEFAULT_CV, SAMPLE_JD } from '../data/mockData';

interface AtsScannerProps {
  selectedIndustry: IndustryType;
  onApplyOptimizedSummary?: (summary: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AtsScanner: React.FC<AtsScannerProps> = ({
  selectedIndustry,
  onApplyOptimizedSummary,
  onNavigateTab,
}) => {
  const [cvInput, setCvInput] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack / Frontend Developer');
  const [report, setReport] = useState<ATSMatchReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const loadSampleData = () => {
    // Generate text representation of sample CV
    const cvLines = [
      `HỌ TÊN: ${SAMPLE_DEFAULT_CV.contact.fullName}`,
      `VỊ TRÍ: ${SAMPLE_DEFAULT_CV.contact.title}`,
      `EMAIL: ${SAMPLE_DEFAULT_CV.contact.email} | SĐT: ${SAMPLE_DEFAULT_CV.contact.phone}`,
      `LINKEDIN: ${SAMPLE_DEFAULT_CV.contact.linkedin} | GITHUB: ${SAMPLE_DEFAULT_CV.contact.github}`,
      '',
      `TÓM TẮT CHUYÊN MÔN:`,
      SAMPLE_DEFAULT_CV.summary,
      '',
      `KỸ NĂNG CHUYÊN MÔN:`,
      `Core: ${SAMPLE_DEFAULT_CV.skills.core.join(', ')}`,
      `Kỹ thuật: ${SAMPLE_DEFAULT_CV.skills.technical.join(', ')}`,
      `Công cụ: ${SAMPLE_DEFAULT_CV.skills.tools.join(', ')}`,
      `Kỹ năng mềm: ${SAMPLE_DEFAULT_CV.skills.soft.join(', ')}`,
      '',
      `HỌC VẤN:`,
      ...SAMPLE_DEFAULT_CV.education.map(
        (e) => `${e.school} - ${e.degree} (${e.major}) | GPA: ${e.gpa}`
      ),
      '',
      `DỰ ÁN TIÊU BIỂU:`,
      ...SAMPLE_DEFAULT_CV.projects.flatMap((p) => [
        `• ${p.name} (${p.role}) - Công nghệ: ${p.techStack.join(', ')}`,
        `  Mục tiêu: ${p.objective}`,
        ...p.bulletPoints.map((b) => `  - ${b}`),
      ]),
      '',
      `KINH NGHIỆM LÀM VIỆC:`,
      ...SAMPLE_DEFAULT_CV.experience.flatMap((exp) => [
        `• ${exp.company} - ${exp.role} (${exp.period})`,
        ...exp.bulletPoints.map((b) => `  - ${b}`),
      ]),
    ];

    setCvInput(cvLines.join('\n'));
    setJdInput(SAMPLE_JD);
    setTargetRole('Full-Stack / Frontend Developer Intern');
  };

  const handleScan = async () => {
    if (!cvInput.trim() || !jdInput.trim()) {
      setError('Vui lòng nhập cả nội dung CV và bản mô tả công việc (JD).');
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      const res = await fetch('/api/ats-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: cvInput,
          jdText: jdInput,
          industry: selectedIndustry,
          role: targetRole,
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể hoàn tất phân tích ATS.');
      }

      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra trong quá trình quét hồ sơ.');
    } finally {
      setIsScanning(false);
    }
  };

  const copySummary = () => {
    if (report?.optimizedSummaryProposal) {
      navigator.clipboard.writeText(report.optimizedSummaryProposal);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ATS Optimization Engine
              </span>
              <span className="text-xs text-slate-400">• 6-Second Recruiter Impression Scanner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Phân Tích ATS Match & Tâm Lý Nhà Tuyển Dụng
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Hệ thống quét tự động trích xuất từ khóa JD, đo lường tỷ lệ tương thích ATS, phát hiện
              lỗ hổng kỹ năng và đưa ra giải pháp sửa đổi ưu tiên trước khi nộp đơn.
            </p>
          </div>

          <button
            onClick={loadSampleData}
            className="text-xs px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer font-medium"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Nạp Dữ Liệu Mẫu (Demo)</span>
          </button>
        </div>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: CV Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              1. Nội dung CV hiện tại
            </label>
            <span className="text-[11px] text-slate-500">
              {cvInput.length} ký tự
            </span>
          </div>

          <textarea
            rows={12}
            value={cvInput}
            onChange={(e) => setCvInput(e.target.value)}
            placeholder="Dán toàn bộ văn bản CV của bạn vào đây (Kinh nghiệm, Kỹ năng, Học vấn, Dự án)..."
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Right: Job Description (JD) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              2. Bản mô tả công việc (JD Tuyển dụng)
            </label>
            <span className="text-[11px] text-slate-500">
              {jdInput.length} ký tự
            </span>
          </div>

          <textarea
            rows={12}
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            placeholder="Dán toàn bộ JD tuyển dụng từ LinkedIn, TopCV, VietnamWorks, hay website công ty vào đây..."
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Target role & Run button */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-xs text-slate-400 font-medium">Vị trí mục tiêu:</span>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ví dụ: Backend Developer Intern / Data Analyst..."
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none flex-1 max-w-sm"
          />
        </div>

        {error && <span className="text-xs text-rose-400">{error}</span>}

        <button
          onClick={handleScan}
          disabled={isScanning || !cvInput.trim() || !jdInput.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang giải mã thuật toán ATS & Tâm lý Recruiter...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Quét & Đánh Giá ATS Match Report</span>
            </>
          )}
        </button>
      </div>

      {/* REPORT RESULT DISPLAY */}
      {report && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* Header Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ATS Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ATS Match Score
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-black ${
                    report.atsScore >= 80
                      ? 'text-emerald-400'
                      : report.atsScore >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {report.atsScore}%
                </span>
                <span className="text-xs text-slate-500">vượt bộ lọc máy tính</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    report.atsScore >= 80
                      ? 'bg-emerald-400'
                      : report.atsScore >= 60
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${report.atsScore}%` }}
                />
              </div>
            </div>

            {/* Recruiter Impression Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recruiter Score (6s)
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-black ${
                    report.recruiterScore >= 80
                      ? 'text-emerald-400'
                      : report.recruiterScore >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {report.recruiterScore}/100
                </span>
                <span className="text-xs text-slate-500">ấn tượng đọc lướt</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    report.recruiterScore >= 80
                      ? 'bg-emerald-400'
                      : report.recruiterScore >= 60
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${report.recruiterScore}%` }}
                />
              </div>
            </div>

            {/* Hiring Risk */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Rủi ro tuyển dụng
                </span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                <span
                  className={`px-2.5 py-1 rounded-lg text-sm font-semibold inline-block ${
                    report.hiringRisk === 'Thấp'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : report.hiringRisk === 'Trung bình'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Rủi ro: {report.hiringRisk}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Độ an toàn khi đưa hồ sơ lên Hiring Manager
              </p>
            </div>

            {/* Hiring Confidence */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tự tin phỏng vấn
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Brain className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                <span className="px-2.5 py-1 rounded-lg text-sm font-semibold inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {report.hiringConfidence}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Khả năng nhận được lời mời Interview
              </p>
            </div>
          </div>

          {/* Deep Insight Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Matches vs Missing Keywords */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Điểm mạnh trùng khớp xuất sắc (Strong Matches)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.strongMatches.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Từ khóa còn thiếu trong CV (Missing ATS Keywords)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.missingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/25 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  💡 Mẹo: Bổ sung các từ khóa trên vào mục Kỹ năng hoặc các Bullet Points của dự án
                  để vượt qua bộ lọc tự động.
                </p>
              </div>

              {/* Experience Gap */}
              {report.experienceGap && (
                <div className="pt-4 border-t border-slate-800 bg-slate-950/40 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Đánh giá khoảng cách kinh nghiệm (Gap Analysis):
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.experienceGap}
                  </p>
                </div>
              )}
            </div>

            {/* Recruiter Psychology & Priority Fixes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Góc nhìn tâm lý Recruiter (Recruiter Psychology)
                </h3>
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-200 leading-relaxed">
                  {report.recruiterPsychologyInsight}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Ưu tiên khắc phục ngay lập tức (Priority Fixes)
                </h3>
                <ul className="space-y-2">
                  {report.priorityFixes.map((fix, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Gợi ý nâng cấp:
                </span>
                <div className="space-y-1.5">
                  {report.suggestedImprovements.slice(0, 3).map((sug, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optimized Summary Proposal */}
          {report.optimizedSummaryProposal && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    Đề xuất Tóm Tắt Chuyên Môn Tối Ưu Cho JD Này (Professional Summary)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copySummary}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép đoạn tóm tắt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onApplyOptimizedSummary && report.optimizedSummaryProposal) {
                        onApplyOptimizedSummary(report.optimizedSummaryProposal);
                      }
                      onNavigateTab('resume');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Áp dụng vào Resume Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                "{report.optimizedSummaryProposal}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
