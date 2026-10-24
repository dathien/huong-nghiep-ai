import React, { useState } from 'react';
import {
  Building2,
  FileCheck,
  FileText,
  Zap,
  Award,
  Sparkles,
  ArrowRight,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Copy,
  Check,
  TrendingUp,
  RefreshCw,
  Globe,
  Linkedin
} from 'lucide-react';
import { ATSMatchReport, BulletRewriteResult, CoverLetterResult, PersonalBrandingResult, CVData, AppTab } from '../types';
import { SAMPLE_DEFAULT_CV, SAMPLE_JD } from '../data/mockData';

interface InternshipJobsProps {
  cvData: CVData;
  onNavigateTab: (tab: AppTab) => void;
  onApplyOptimizedSummary?: (summary: string) => void;
}

export const InternshipJobs: React.FC<InternshipJobsProps> = ({
  cvData,
  onNavigateTab,
  onApplyOptimizedSummary,
}) => {
  const [activeTool, setActiveTool] = useState<'ats' | 'coverletter' | 'bullet' | 'branding'>('ats');

  // 1. ATS State
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [targetRole, setTargetRole] = useState('Thực tập sinh / Fresher Frontend Developer');
  const [atsReport, setAtsReport] = useState<ATSMatchReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // 2. Cover Letter State
  const [clCompany, setClCompany] = useState('FPT Software / VNG');
  const [clRole, setClRole] = useState('Thực tập sinh Frontend Developer');
  const [clCandidateInfo, setClCandidateInfo] = useState(
    'Sinh viên năm 3-4 chuyên ngành CNTT (GPA 3.65), có 2 đồ án web với React 19 và TypeScript, thành thạo Git và có tinh thần tự học cao.'
  );
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);
  const [clResult, setClResult] = useState<CoverLetterResult | null>(null);

  // 3. Bullet Rewriter State
  const [bulletInput, setBulletInput] = useState('Tham gia làm website bán hàng bằng React');
  const [isRewritingBullet, setIsRewritingBullet] = useState(false);
  const [bulletResult, setBulletResult] = useState<BulletRewriteResult | null>({
    original: 'Tham gia làm website bán hàng bằng React',
    improved:
      'Chủ trì thiết kế và phát triển 25+ thành phần giao diện với React 19 và Tailwind CSS, tích hợp giỏ hàng thời gian thực giúp giảm 35% thời gian phản hồi trang và phục vụ hơn 5,000 lượt truy cập.',
    recruiterSignal: 'Chứng minh tư duy hướng đến hiệu năng, năng lực lập trình sạch và khả năng định lượng giá trị đóng góp.',
    formulaUsed: 'Google XYZ Formula: Đạt được X [giảm 35% độ trễ], đo bằng Y [5,000 lượt truy cập], bằng cách Z [phát triển 25+ component React 19].',
    variations: [
      'Tối ưu hóa kiến trúc tải trang (LCP < 1.2s), cải thiện điểm số Google PageSpeed từ 65 lên 94/100.',
      'Thiết kế giao diện responsive thân thiện với di động, gia tăng 22% tỷ lệ hoàn tất đơn hàng trong đợt thử nghiệm.',
    ],
    englishVersion:
      'Developed 25+ responsive UI components using React 19 and Tailwind CSS, reducing page latency by 35% and supporting over 5,000 active visits.',
  });

  // 4. Personal Branding State
  const [isGeneratingBranding, setIsGeneratingBranding] = useState(false);
  const [brandingResult, setBrandingResult] = useState<PersonalBrandingResult | null>({
    linkedinHeadlines: [
      'Frontend Developer Intern | React 19, TypeScript, Clean Code | Top 5% CS Honor Student',
      'Software Engineering Student @ UIT | Building High-Performance Web Products | E-Commerce Enthusiast',
      'Passionate Web Developer | Transforming Creative Ideas into Responsive Digital Solutions',
    ],
    linkedinAbout:
      'Chào bạn! Mình là một lập trình viên trẻ đam mê xây dựng các sản phẩm số mượt mà, thân thiện và có ích cho cộng đồng.\n\nTrong suốt quá trình học tập tại trường đại học, mình đã:\n• Xây dựng 2 đồ án web thực tiễn với React 19 và TypeScript.\n• Tham gia nghiên cứu khoa học sinh viên và đạt học bổng xuất sắc.\n• Đảm nhận vai trò phó chủ nhiệm CLB Tin học hướng dẫn cho hơn 200 bạn sinh viên khóa dưới.\n\nMục tiêu của mình là trở thành một Kỹ sư phần mềm vững vàng về chuyên môn và chuyên nghiệp trong phong cách làm việc. Rất vui được kết nối với quý doanh nghiệp và các anh chị mentor!',
    elevatorPitch30s:
      'Xin chào anh/chị! Em là Minh Anh, sinh viên năm 4 ngành Kỹ thuật Phần mềm. Thế mạnh của em là lập trình frontend với React và TypeScript. Gần đây em vừa hoàn thiện đồ án sàn thương mại điện tử giúp tối ưu 35% tốc độ tải trang. Em rất mong muốn mang nhiệt huyết học hỏi và tinh thần trách nhiệm này để cống hiến cho vị trí Thực tập sinh tại công ty.',
    executiveBio:
      'Sinh viên chuyên ngành Kỹ thuật Phần mềm tốt nghiệp Top 5%, có nền tảng vững vàng về TypeScript, React và tư duy giải quyết vấn đề bằng số liệu thực tiễn.',
    uniqueSellingPoints: [
      'Tư duy hướng đến hiệu năng và trải nghiệm người dùng thực tế.',
      'Tinh thần kỷ luật cao và khả năng tự học công nghệ mới nhanh chóng.',
      'Kinh nghiệm làm việc nhóm và giao tiếp kỹ thuật thông qua các hoạt động CLB.',
    ],
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadStudentCvIntoAts = () => {
    const lines = [
      `HỌ TÊN: ${cvData.contact.fullName}`,
      `VỊ TRÍ: ${cvData.contact.title}`,
      `EMAIL: ${cvData.contact.email} | SĐT: ${cvData.contact.phone}`,
      `TÓM TẮT: ${cvData.summary}`,
      `KỸ NĂNG: ${cvData.skills.technical.join(', ')} | ${cvData.skills.core.join(', ')} | ${cvData.skills.tools.join(', ')}`,
      `HỌC VẤN: ${cvData.education.map((e) => `${e.school} - ${e.major} (GPA: ${e.gpa})`).join('; ')}`,
      `ĐỒ ÁN: ${cvData.projects.map((p) => `${p.name}: ${p.bulletPoints.join(' - ')}`).join('\n')}`,
    ];
    setCvText(lines.join('\n'));
  };

  const handleScanAts = async () => {
    const textToScan = cvText || `${cvData.contact.fullName}\n${cvData.summary}\n${cvData.skills.technical.join(', ')}`;
    if (!textToScan || !jdText) {
      alert('Vui lòng cung cấp cả nội dung CV và bản mô tả công việc (JD).');
      return;
    }

    setIsScanning(true);
    try {
      const res = await fetch('/api/ats-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: textToScan,
          jdText,
          industry: 'IT / Engineering',
          role: targetRole,
        }),
      });

      if (!res.ok) throw new Error('Không thể phân tích');
      const data = await res.json();
      setAtsReport(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsScanning(false);
    }
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
          jdText,
        }),
      });

      if (!res.ok) throw new Error('Lỗi');
      const data = await res.json();
      setClResult(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Không thể tạo thư ứng tuyển'}`);
    } finally {
      setIsGeneratingCl(false);
    }
  };

  const handleRewriteBullet = async () => {
    if (!bulletInput.trim()) return;
    setIsRewritingBullet(true);
    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: bulletInput,
          role: targetRole,
          industry: 'IT / Engineering',
        }),
      });

      if (!res.ok) throw new Error('Lỗi');
      const data = await res.json();
      setBulletResult(data);
    } catch (err: any) {
      alert(`Lỗi: ${err?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setIsRewritingBullet(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>Bộ Công Cụ Ứng Tuyển & Tuyển Dụng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thực Tập & Hành Trang Ứng Tuyển
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Kiểm tra tỷ lệ vượt qua máy quét ATS theo từng tin tuyển dụng, tạo thư xin việc cá nhân hóa,
            tối ưu hóa câu mô tả thành tích và xây dựng thương hiệu cá nhân LinkedIn.
          </p>
        </div>
      </div>

      {/* Sub-tools Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs max-w-2xl">
        <button
          onClick={() => setActiveTool('ats')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTool === 'ats' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Máy quét ATS (6s)</span>
        </button>

        <button
          onClick={() => setActiveTool('coverletter')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTool === 'coverletter' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Thư ứng tuyển (6 Phần)</span>
        </button>

        <button
          onClick={() => setActiveTool('bullet')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTool === 'bullet' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Nâng cấp câu mô tả</span>
        </button>

        <button
          onClick={() => setActiveTool('branding')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTool === 'branding' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn Branding</span>
        </button>
      </div>

      {/* TOOL 1: ATS SCANNER */}
      {activeTool === 'ats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: CV Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  1. Nội dung CV của bạn
                </span>
                <button
                  onClick={loadStudentCvIntoAts}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nạp từ Hồ sơ của tôi</span>
                </button>
              </div>

              <textarea
                rows={9}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Dán nội dung CV hoặc nhấn 'Nạp từ Hồ sơ của tôi' ở trên..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>

            {/* Right: Job Description */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  2. Bản mô tả công việc (JD)
                </span>
                <span className="text-[11px] text-slate-400">JD Doanh nghiệp</span>
              </div>

              <textarea
                rows={9}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Dán toàn bộ tin tuyển dụng / JD thực tập vào đây..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleScanAts}
              disabled={isScanning}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-40"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang quét từ khóa và phân tích tâm lý recruiter...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Phân tích Độ Phù Hợp ATS (6 Giây)</span>
                </>
              )}
            </button>
          </div>

          {/* Report Display */}
          {atsReport && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-slide-up">
              {/* Score header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Điểm vượt máy quét ATS
                  </span>
                  <div className="text-3xl font-black text-blue-600">{atsReport.atsScore}%</div>
                  <p className="text-[11px] text-slate-500">Khả năng lọt qua bộ lọc tự động</p>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                    Ấn tượng 6 giây (Recruiter)
                  </span>
                  <div className="text-3xl font-black text-teal-600">
                    {atsReport.recruiterScore}/100
                  </div>
                  <p className="text-[11px] text-slate-500">Mức độ thu hút khi đọc lướt</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Mức độ tự tin phỏng vấn
                  </span>
                  <div className="text-2xl font-black text-emerald-600">
                    {atsReport.hiringConfidence}
                  </div>
                  <p className="text-[11px] text-slate-500">Độ an toàn khi nộp hồ sơ</p>
                </div>
              </div>

              {/* Matched vs Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Từ khóa trùng khớp xuất sắc ({atsReport.strongMatches.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.strongMatches.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Từ khóa còn thiếu cần bổ sung ({atsReport.missingKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.missingKeywords.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-semibold"
                      >
                        + {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recruiter psychology & Priority fixes */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Góc nhìn từ Chị An (Senior Recruiter):
                </span>
                <p className="text-xs text-indigo-950 leading-relaxed font-sans">
                  {atsReport.recruiterPsychologyInsight}
                </p>
              </div>

              {/* Priority Fixes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  3 việc cần sửa đổi ngay trước khi nộp đơn:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {atsReport.priorityFixes.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optimized Summary Proposal */}
              {atsReport.optimizedSummaryProposal && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-900">
                      Đoạn Tóm Tắt Chuyên Môn Đề Xuất Tối Ưu Cho JD Này:
                    </span>
                    <button
                      onClick={() => {
                        if (onApplyOptimizedSummary && atsReport.optimizedSummaryProposal) {
                          onApplyOptimizedSummary(atsReport.optimizedSummaryProposal);
                        }
                        onNavigateTab('cv-builder');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Áp dụng vào CV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-blue-100 font-sans">
                    "{atsReport.optimizedSummaryProposal}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: COVER LETTER GENERATOR */}
      {activeTool === 'coverletter' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Viết Thư Ứng Tuyển Thuyết Phục (Cover Letter 6 Phần)
            </h3>
            <p className="text-xs text-slate-500">
              Không dùng mẫu sáo rỗng, tập trung vào giá trị sinh viên mang lại cho doanh nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Công ty mục tiêu:</label>
              <input
                type="text"
                value={clCompany}
                onChange={(e) => setClCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Vị trí ứng tuyển:</label>
              <input
                type="text"
                value={clRole}
                onChange={(e) => setClRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Thế mạnh cốt lõi của bạn (Đồ án, điểm số, kỹ năng):
            </label>
            <textarea
              rows={3}
              value={clCandidateInfo}
              onChange={(e) => setClCandidateInfo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGeneratingCl}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40"
            >
              {isGeneratingCl ? 'Đang tạo thư...' : 'Tạo Thư Ứng Tuyển Hoàn Chỉnh'}
            </button>
          </div>

          {clResult && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bản Thư Đề Xuất (Xem trước):
                </span>
                <button
                  onClick={() => copyText('cl', clResult.fullLetterFormatted)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'cl' ? 'Đã sao chép!' : 'Sao chép thư'}
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {clResult.fullLetterFormatted}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: HIGH-IMPACT BULLET REWRITER */}
      {activeTool === 'bullet' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Nâng Cấp Câu Mô Tả Bằng Công Thức Google XYZ
            </h3>
            <p className="text-xs text-slate-500">
              Chuyển đổi câu thụ động thành câu hành động có số liệu đo lường định lượng
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Câu mô tả hiện tại (Ví dụ: "Tham gia làm web bán hàng", "Viết API cho dự án"):
            </label>
            <input
              type="text"
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRewriteBullet}
              disabled={isRewritingBullet || !bulletInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isRewritingBullet ? 'Đang nâng cấp...' : 'Tối Ưu Ngay'}</span>
            </button>
          </div>

          {bulletResult && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Phiên bản đề xuất (High-Impact):
                </span>
                <button
                  onClick={() => copyText('blt', bulletResult.improved)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  {copiedKey === 'blt' ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 leading-relaxed font-sans">
                "{bulletResult.improved}"
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                💡 Tín hiệu Recruiter: {bulletResult.recruiterSignal}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: LINKEDIN BRANDING */}
      {activeTool === 'branding' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-sky-600" />
              Xây Dựng Thương Hiệu Cá Nhân LinkedIn & Giới Thiệu 30 Giây
            </h3>
            <p className="text-xs text-slate-500">
              Thu hút nhà tuyển dụng và tạo ấn tượng ban đầu sắc nét
            </p>
          </div>

          {brandingResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  3 Tùy Chọn LinkedIn Headline Tối Ưu Tìm Kiếm:
                </span>
                {brandingResult.linkedinHeadlines.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-800"
                  >
                    <span className="font-semibold">{hl}</span>
                    <button
                      onClick={() => copyText(`hl-${idx}`, hl)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex-shrink-0"
                    >
                      {copiedKey === `hl-${idx}` ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Đoạn About LinkedIn (Kể chuyện & Minh chứng năng lực):
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {brandingResult.linkedinAbout}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  🎤 Bài Nói Giới Thiệu Bản Thân 30 Giây (Elevator Pitch):
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  "{brandingResult.elevatorPitch30s}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
