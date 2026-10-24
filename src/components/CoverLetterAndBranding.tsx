import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Copy,
  Check,
  Building,
  Target,
  Send,
  Linkedin,
  UserCheck,
  FileText,
  Printer,
  RefreshCw,
  Share2
} from 'lucide-react';
import { CoverLetterResult, PersonalBrandingResult, IndustryType } from '../types';

interface CoverLetterAndBrandingProps {
  selectedIndustry: IndustryType;
}

export const CoverLetterAndBranding: React.FC<CoverLetterAndBrandingProps> = ({
  selectedIndustry,
}) => {
  const [subTab, setSubTab] = useState<'coverletter' | 'branding'>('coverletter');

  // Cover letter state
  const [clCompany, setClCompany] = useState('TechNova Innovations');
  const [clRole, setClRole] = useState('Full-Stack Software Engineer (Fresher / Junior)');
  const [clCandidateInfo, setClCandidateInfo] = useState(
    'Cử nhân CNTT ĐH Quốc Gia TP.HCM (GPA 3.62), có kinh nghiệm xây dựng hệ thống chịu tải với Node.js, PostgreSQL và React 19, từng tối ưu độ trễ API giảm 42% cho đồ án thương mại điện tử.'
  );
  const [clJd, setClJd] = useState(
    'Tìm kiếm kỹ sư phát triển ứng dụng web hiện đại, nắm vững TypeScript, React, RESTful API và có tư duy làm việc Agile, giải quyết vấn đề hiệu năng cao.'
  );
  const [clTone, setClTone] = useState('Chuyên nghiệp, nhiệt huyết & sắc bén');
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);
  const [clResult, setClResult] = useState<CoverLetterResult | null>(null);

  // Personal branding state
  const [pbRole, setPbRole] = useState('Full-Stack Software Engineer');
  const [pbInfo, setPbInfo] = useState(
    'Kỹ sư phần mềm chuyên về React, TypeScript, Node.js và tích hợp AI. Đam mê tối ưu hiệu năng web, Clean Architecture và tạo ra sản phẩm mang lại giá trị thực cho người dùng.'
  );
  const [pbAchievements, setPbAchievements] = useState(
    'Giải Nhì Hackathon Danang Innovation 2024, xây dựng CareerMaster AI Studio, Leader CLB GDSC tổ chức workshop cho 450 sinh viên.'
  );
  const [isGeneratingPb, setIsGeneratingPb] = useState(false);
  const [pbResult, setPbResult] = useState<PersonalBrandingResult | null>({
    linkedinHeadlines: [
      'Full-Stack Software Engineer | React 19, TypeScript, Node.js | Scalable Web Architecture & AI Systems',
      'Software Engineer @ CareerMaster AI Studio | Optimizing Web Performance & Building High-Throughput APIs | Top 5% CS Graduate',
      'Empowering Digital Products through Clean Code & Resilient Systems | React, Node.js, PostgreSQL Enthusiast',
    ],
    linkedinAbout:
      'Là một Kỹ sư phần mềm với tư duy "Metrics-First", tôi tin rằng mã nguồn tốt nhất không chỉ là mã nguồn chạy được, mà là giải pháp giải quyết triệt để bài toán kinh doanh và mang lại trải nghiệm mượt mà cho người dùng.\n\nTrong suốt quá trình học tập và phát triển dự án, tôi đã:\n• Kiến trúc và phát hành hệ thống CareerMaster AI Studio với độ trễ phản hồi <400ms.\n• Tối ưu hóa cơ sở dữ liệu và bộ nhớ đệm Redis, giúp hệ thống chịu tải 1,200 req/s.\n• Dẫn dắt đội ngũ kỹ thuật GDSC lan tỏa kiến thức Cloud & Clean Code tới hơn 450 sinh viên.\n\nTôi luôn tìm kiếm cơ hội hợp tác và cống hiến cho các dự án công nghệ tham vọng. Hãy kết nối với tôi để cùng trao đổi về kiến trúc hệ thống và phát triển phần mềm!',
    elevatorPitch30s:
      'Xin chào! Tôi là một Kỹ sư Full-Stack đam mê tối ưu hóa hiệu năng hệ thống. Tôi chuyên sâu về TypeScript, React và kiến trúc backend Node.js chịu tải. Gần đây, tôi đã phát triển một nền tảng hỗ trợ tuyển dụng thông minh và từng tối ưu hóa ứng dụng e-commerce giảm 42% thời gian phản hồi. Tôi rất hào hứng muốn mang tư duy định lượng và tinh thần cam kết chất lượng này đến đội ngũ kỹ thuật của quý công ty.',
    executiveBio:
      'Kỹ sư Phần mềm Full-Stack tốt nghiệp Top 5% ĐH Quốc Gia TP.HCM, có kinh nghiệm thực chiến về kiến trúc web hiện đại (React, TypeScript, Node.js, PostgreSQL). Nổi bật với tư duy phân tích định lượng, khả năng tối ưu hiệu năng hệ thống và tinh thần lãnh đạo kỹ thuật.',
    uniqueSellingPoints: [
      'Tư duy định lượng (Metrics-Driven): Đo lường mọi cải tiến bằng số liệu cụ thể (ms, throughput, CSAT).',
      'Kiến trúc hiện đại toàn diện từ giao diện người dùng (React 19) tới backend chịu tải và caching phân tán.',
      'Kỹ năng giao tiếp và lãnh đạo đội nhóm đã được chứng minh qua vai trò Tech Lead tại GDSC.',
    ],
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCl(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: clCompany,
          roleName: clRole,
          candidateInfo: clCandidateInfo,
          jdText: clJd,
          tone: clTone,
        }),
      });

      if (!res.ok) throw new Error('Không thể tạo Cover Letter');
      const data = await res.json();
      setClResult(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Không thể kết nối'}`);
    } finally {
      setIsGeneratingCl(false);
    }
  };

  const handleGenerateBranding = async () => {
    setIsGeneratingPb(true);
    try {
      const res = await fetch('/api/personal-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: pbRole,
          industry: selectedIndustry,
          profileInfo: pbInfo,
          keyAchievements: pbAchievements,
        }),
      });

      if (!res.ok) throw new Error('Không thể tạo Personal Branding');
      const data = await res.json();
      setPbResult(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Không thể kết nối'}`);
    } finally {
      setIsGeneratingPb(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto shadow-md">
        <button
          onClick={() => setSubTab('coverletter')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'coverletter'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Cover Letter Engine (6 Phần)</span>
        </button>

        <button
          onClick={() => setSubTab('branding')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'branding'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Linkedin className="w-4 h-4" />
          <span>Personal Branding Suite</span>
        </button>
      </div>

      {/* COVER LETTER SECTION */}
      {subTab === 'coverletter' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Cover Letter Engine
                </span>
                <span className="text-xs text-slate-400">• Không mẫu sáo rỗng • 6 Phần Thuyết Phục</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Viết Thư Ứng Tuyển Đẳng Cấp Thu Hút Recruiter
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Công ty mục tiêu:
                </label>
                <input
                  type="text"
                  value={clCompany}
                  onChange={(e) => setClCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vị trí ứng tuyển:
                </label>
                <input
                  type="text"
                  value={clRole}
                  onChange={(e) => setClRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Thông tin nổi bật của bạn (Kinh nghiệm, thành tích, dự án cốt lõi):
              </label>
              <textarea
                rows={2}
                value={clCandidateInfo}
                onChange={(e) => setClCandidateInfo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Yêu cầu trọng tâm từ JD tuyển dụng:
              </label>
              <textarea
                rows={2}
                value={clJd}
                onChange={(e) => setClJd(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCl || !clCompany.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isGeneratingCl ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo thư ứng tuyển thuyết phục...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Thư Ứng Tuyển Chuẩn 6 Phần</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cover Letter Output Display */}
          {clResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Cover Letter Ứng Tuyển {clCompany}
                  </h3>
                  <span className="text-xs text-emerald-400 font-medium">
                    Cấu trúc 6 phần tâm lý tuyển dụng hoàn hảo
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText('clFull', clResult.fullLetterFormatted)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedKey === 'clFull' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép toàn bộ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 6 Step breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">
                    1. Strong Opening Hook:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{clResult.openingHook}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">
                    2. Why This Company:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{clResult.whyCompany}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">
                    3. Why This Role:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{clResult.whyRole}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[10px]">
                    4. Matching Skills & Projects:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {clResult.matchingSkillsAndProjects}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">
                    5. Value Proposition:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {clResult.valueProposition}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[10px]">
                    6. Interview Invitation (Call-to-Action):
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {clResult.interviewCallToAction}
                  </p>
                </div>
              </div>

              {/* Full Letter Preview */}
              <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 font-sans text-xs leading-relaxed space-y-3 shadow-inner border border-slate-200">
                <div className="whitespace-pre-wrap">{clResult.fullLetterFormatted}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERSONAL BRANDING SECTION */}
      {subTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Personal Branding Engine
                </span>
                <span className="text-xs text-slate-400">• LinkedIn Suite • Elevator Pitch • Executive Bio</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Xây Dựng Thương Hiệu Cá Nhân Hút Săn Đầu Người (Headhunters)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Vị trí / Lĩnh vực chuyên môn:
                </label>
                <input
                  type="text"
                  value={pbRole}
                  onChange={(e) => setPbRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Thành tích & Dự án khác biệt:
                </label>
                <input
                  type="text"
                  value={pbAchievements}
                  onChange={(e) => setPbAchievements(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hồ sơ tóm tắt & Kỹ năng nổi bật:
              </label>
              <textarea
                rows={2}
                value={pbInfo}
                onChange={(e) => setPbInfo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateBranding}
                disabled={isGeneratingPb}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                {isGeneratingPb ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xây dựng chiến lược định vị...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo Trọn Bộ LinkedIn & Elevator Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Personal Branding Result Cards */}
          {pbResult && (
            <div className="space-y-5">
              {/* LinkedIn Headlines */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    3 Tùy Chọn LinkedIn Headline (Tối Ưu SEO & Thu Hút Recruiter)
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {pbResult.linkedinHeadlines.map((hl, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-200"
                    >
                      <span className="font-medium">{hl}</span>
                      <button
                        onClick={() => copyText(`hl-${idx}`, hl)}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex-shrink-0"
                      >
                        {copiedKey === `hl-${idx}` ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* LinkedIn About Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      LinkedIn About Section (Storytelling & Proven Impact)
                    </h3>
                  </div>

                  <button
                    onClick={() => copyText('about', pbResult.linkedinAbout)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedKey === 'about' ? 'Đã sao chép' : 'Sao chép About'}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {pbResult.linkedinAbout}
                </div>
              </div>

              {/* Elevator Pitch & Bio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 30s Elevator Pitch */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        🎤 30-Second Elevator Pitch
                      </span>
                      <button
                        onClick={() => copyText('pitch', pbResult.elevatorPitch30s)}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        {copiedKey === 'pitch' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      "{pbResult.elevatorPitch30s}"
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Dùng cho hội thảo nghề nghiệp, networking sự kiện hoặc câu trả lời mở đầu "Giới thiệu bản thân" trong phỏng vấn.
                  </span>
                </div>

                {/* Unique Selling Points */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                    💎 3 Điểm Khác Biệt Cạnh Tranh (USPs)
                  </span>
                  <ul className="space-y-2 text-xs">
                    {pbResult.uniqueSellingPoints.map((usp, idx) => (
                      <li
                        key={idx}
                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-slate-200 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                        <span>{usp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
