import { CVData, CareerTrack, RoadmapMilestone } from '../types';

export const SAMPLE_DEFAULT_CV: CVData = {
  contact: {
    fullName: 'Nguyễn Minh Anh',
    title: 'Sinh viên Kỹ thuật Phần mềm & Phát triển Ứng dụng',
    email: 'minhanh.student@edu.vn',
    phone: '(+84) 938 123 456',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    linkedin: 'linkedin.com/in/minhanh-it',
    github: 'github.com/minhanh-dev',
    portfolio: 'minhanh-portfolio.dev',
  },
  summary:
    'Sinh viên năm cuối ngành Công nghệ Thông tin với điểm rèn luyện xuất sắc và tư duy phân tích logic vững vàng. Thành thạo TypeScript, React và kiến trúc API hiện đại. Đã hoàn thành 3 đồ án thực tiễn, trong đó có hệ thống thương mại điện tử phục vụ hơn 5,000 lượt tương tác/tháng và giải Nhất nghiên cứu khoa học cấp khoa. Đam mê học hỏi công nghệ mới, hướng đến vị trí Thực tập sinh / Fresher Developer sẵn sàng tạo ra giá trị thiết thực.',
  skills: {
    core: ['Cấu trúc dữ liệu & Giải thuật', 'Lập trình hướng đối tượng (OOP)', 'RESTful APIs', 'Tư duy phản biện'],
    technical: ['JavaScript / TypeScript', 'React 19', 'Next.js', 'HTML5 & Tailwind CSS', 'Node.js cơ bản', 'PostgreSQL'],
    tools: ['Git & GitHub', 'VS Code', 'Postman', 'Figma', 'Vite', 'Docker cơ bản'],
    soft: ['Làm việc nhóm Agile/Scrum', 'Giao tiếp kỹ thuật', 'Quản lý thời gian', 'Thích ứng nhanh'],
  },
  languages: ['Tiếng Việt (Bản ngữ)', 'Tiếng Anh (IELTS 6.5 / Đọc hiểu tài liệu chuyên ngành)'],
  certifications: [
    { name: 'Meta Front-End Developer Professional Certificate', issuer: 'Meta / Coursera', year: '2025' },
    { name: 'Google Cloud Computing Foundations', issuer: 'Google Cloud Skills', year: '2024' },
  ],
  education: [
    {
      school: 'Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
      degree: 'Cử nhân Kỹ thuật Phần mềm',
      major: 'Software Engineering',
      year: '2022 - 2026',
      gpa: '3.65 / 4.0 (Top 5% Khóa)',
      coursework: ['Lập trình ứng dụng Web', 'Hệ quản trị Cơ sở dữ liệu', 'Kiểm thử phần mềm', 'Phân tích thiết kế hệ thống'],
    },
  ],
  projects: [
    {
      name: 'EcoMart — Ứng dụng Mua sắm Trực tuyến Tốc độ cao',
      role: 'Trưởng nhóm Frontend & UI/UX',
      period: '09/2025 - 12/2025',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'REST API'],
      objective: 'Xây dựng sàn thương mại điện tử thân thiện với sinh viên, tối ưu tốc độ tải trang và trải nghiệm giỏ hàng thời gian thực.',
      bulletPoints: [
        'Thiết kế kiến trúc hơn 25 component tái sử dụng, tối ưu kích thước bundle giảm 30% bằng kỹ thuật code splitting.',
        'Tích hợp luồng thanh toán và quản lý trạng thái giỏ hàng với Redux, giảm độ trễ phản hồi người dùng xuống dưới 200ms.',
        'Đạt điểm 9.2/10 môn Đồ án Chuyên ngành và thu hút hơn 800 sinh viên tham gia trải nghiệm thử nghiệm trong tuần lễ công nghệ.',
      ],
    },
    {
      name: 'EduQuiz — Nền tảng Ôn tập Trực tuyến cho Học sinh THPT',
      role: 'Full-Stack Developer',
      period: '02/2025 - 06/2025',
      techStack: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
      objective: 'Giải pháp thi thử trắc nghiệm trực tuyến có đồng hồ đếm ngược và phân tích phổ điểm tự động.',
      bulletPoints: [
        'Xây dựng hệ thống cơ sở dữ liệu lưu trữ hơn 2,500 câu hỏi trắc nghiệm kèm lời giải chi tiết theo chuẩn Bộ GD&ĐT.',
        'Thiết kế giao diện responsive tối ưu cho điện thoại thông minh, phục vụ hơn 3,000 lượt làm bài thi thử môn Toán và Lý.',
      ],
    },
  ],
  experience: [
    {
      company: 'Trung tâm Phát triển Phần mềm Sinh viên UIT',
      role: 'Cộng tác viên Lập trình Web',
      period: '06/2025 - 09/2025',
      location: 'TP. Hồ Chí Minh',
      bulletPoints: [
        'Hỗ trợ nâng cấp giao diện cổng thông tin tra cứu lịch học cho hơn 12,000 sinh viên toàn trường.',
        'Viết tài liệu hướng dẫn sử dụng và kiểm thử tính năng (Manual & Unit test), giảm 25% số lỗi hồi quy phát sinh.',
      ],
    },
  ],
  activities: [
    {
      name: 'CLB Tin học Sinh viên S-Club',
      role: 'Phó Chủ nhiệm Phụ trách Chuyên môn',
      period: '2024 - 2025',
      impact: 'Chủ trì tổ chức chuỗi 4 buổi workshop "Hành trang Lập trình Web đầu đời" cho hơn 250 tân sinh viên.',
    },
    {
      name: 'Chiến dịch Tình nguyện Mùa Hè Xanh',
      role: 'Thành viên Đội hình Phổ cập Tin học',
      period: '07/2024',
      impact: 'Dạy kỹ năng tin học văn phòng và an toàn Internet cho 60 học sinh THCS tại Bến Tre.',
    },
  ],
  achievements: [
    'Học bổng Khuyến khích Học tập loại Xuất sắc 4 học kỳ liên tiếp (2023 - 2025)',
    'Giải Nhất Cuộc thi Sinh viên Nghiên cứu Khoa học Cấp Khoa năm 2025',
    'Giải Khuyến khích Hội thi Tin học Trẻ Thành phố năm 2024',
  ],
};

export const SAMPLE_JD = `Vị trí: Thực tập sinh / Fresher Frontend Developer
Công ty: FPT Software / VinAI / VNG Corporation
Địa điểm: TP. Hồ Chí Minh / Hà Nội / Hybrid
Đối tượng: Sinh viên năm 3, 4 các trường Đại học, Cao đẳng, Trung cấp

MÔ TẢ CÔNG VIỆC:
- Tham gia phát triển giao diện các ứng dụng Web công nghệ mới (ReactJS, TypeScript, Tailwind CSS).
- Phối hợp cùng các Senior Developer và Product Owner trong quy trình Agile/Scrum.
- Tìm hiểu và ứng dụng các kỹ thuật tối ưu hóa hiệu năng, trải nghiệm người dùng trên thiết bị di động.
- Viết mã nguồn sạch, tham gia code review và viết tài liệu kỹ thuật.

YÊU CẦU:
- Sinh viên chuyên ngành CNTT, Khoa học Máy tính, Kỹ thuật Phần mềm hoặc các ngành liên quan.
- Nắm vững kiến thức nền tảng: HTML5, CSS3, JavaScript (ES6+).
- Đã từng làm quen hoặc có đồ án sử dụng ReactJS / Next.js.
- Biết sử dụng Git cơ bản (commit, push, pull request, branch).
- Tinh thần chủ động, ham học hỏi, có trách nhiệm và khả năng làm việc nhóm tốt.
- Đọc hiểu tài liệu tiếng Anh cơ bản.

QUYỀN LỢI:
- Phụ cấp thực tập hỗ trợ hàng tháng từ 5,000,000đ – 9,000,000đ.
- Được Senior Mentor 1-1 chỉ dẫn trong suốt quá trình thực tập.
- Cơ hội ký hợp đồng nhân viên chính thức ngay sau khi kết thúc thực tập.
- Tham gia các hoạt động ngoại khóa, câu lạc bộ công nghệ trẻ.`;

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'frontend-dev',
    title: 'Lập trình viên Frontend (Web/Mobile)',
    category: 'Công nghệ Thông tin',
    tag: 'Rất chuộng sinh viên',
    salaryRange: '7 – 15 triệu (Fresher) | 18 – 35 triệu (Mid/Senior)',
    suitableLevels: ['Cao đẳng', 'Đại học', 'Trung cấp'],
    description: 'Chuyên xây dựng giao diện tương tác, biến thiết kế thành sản phẩm sống động trên trình duyệt và điện thoại.',
    keySkills: ['HTML5/CSS3', 'JavaScript / TypeScript', 'React / Vue', 'Responsive Design', 'Git'],
    suggestedMajors: ['Kỹ thuật Phần mềm', 'Khoa học Máy tính', 'Thiết kế Đa phương tiện'],
    growthTrend: 'Rất cao',
  },
  {
    id: 'backend-dev',
    title: 'Kỹ sư Backend & Cơ sở Dữ liệu',
    category: 'Công nghệ Thông tin',
    tag: 'Nhu cầu tuyển lớn',
    salaryRange: '8 – 16 triệu (Fresher) | 20 – 40 triệu (Mid/Senior)',
    suitableLevels: ['Đại học', 'Cao đẳng'],
    description: 'Xây dựng động cơ xử lý logic, API, cơ sở dữ liệu và bảo mật cho toàn bộ hệ thống phía sau ứng dụng.',
    keySkills: ['Node.js', 'Java Spring Boot', 'Python', 'SQL / PostgreSQL', 'RESTful API', 'Docker'],
    suggestedMajors: ['Công nghệ Thông tin', 'Hệ thống Thông tin', 'Mạng máy tính'],
    growthTrend: 'Rất cao',
  },
  {
    id: 'data-ai-analyst',
    title: 'Chuyên viên Phân tích Dữ liệu (Data Analyst)',
    category: 'Dữ liệu & Trí tuệ Nhân tạo',
    tag: 'Xu hướng tương lai',
    salaryRange: '9 – 17 triệu (Fresher) | 22 – 45 triệu (Mid/Senior)',
    suitableLevels: ['Đại học', 'Cao đẳng'],
    description: 'Khai thác kho dữ liệu để tìm ra xu hướng kinh doanh, trực quan hóa biểu đồ và hỗ trợ ra quyết định.',
    keySkills: ['SQL', 'Python / Pandas', 'Power BI / Tableau', 'Excel nâng cao', 'Thống kê ứng dụng'],
    suggestedMajors: ['Khoa học Dữ liệu', 'Kinh tế Số', 'Thống kê Tin học'],
    growthTrend: 'Rất cao',
  },
  {
    id: 'ui-ux-designer',
    title: 'Thiết kế Giao diện & Trải nghiệm (UI/UX)',
    category: 'Thiết kế & Sáng tạo',
    tag: 'Năng động & Thẩm mỹ',
    salaryRange: '7 – 14 triệu (Fresher) | 16 – 32 triệu (Mid/Senior)',
    suitableLevels: ['Trung cấp', 'Cao đẳng', 'Đại học', 'Học sinh THPT'],
    description: 'Nghiên cứu hành vi người dùng, phác thảo wireframe và thiết kế giao diện ứng dụng đẹp mắt, dễ thao tác.',
    keySkills: ['Figma', 'Wireframing', 'User Research', 'Design System', 'Prototyping'],
    suggestedMajors: ['Thiết kế Đồ họa', 'Mỹ thuật Ứng dụng', 'Tương tác Người - Máy'],
    growthTrend: 'Cao',
  },
  {
    id: 'digital-marketing',
    title: 'Chuyên viên Tiếp thị Kỹ thuật số (Digital Marketing)',
    category: 'Kinh doanh & Truyền thông',
    tag: 'Dễ tiếp cận',
    salaryRange: '6 – 12 triệu (Fresher) | 15 – 30 triệu (Mid/Senior)',
    suitableLevels: ['Trung cấp', 'Cao đẳng', 'Đại học'],
    description: 'Lên chiến lược nội dung, quản lý kênh mạng xã hội, tối ưu chiến dịch quảng cáo và phát triển thương hiệu.',
    keySkills: ['Content Writing', 'SEO/SEM', 'Social Media Management', 'Google Analytics', 'Canva/Photoshop cơ bản'],
    suggestedMajors: ['Marketing', 'Thương mại Điện tử', 'Quan hệ Công chúng (PR)'],
    growthTrend: 'Cao',
  },
  {
    id: 'business-analyst',
    title: 'Chuyên viên Phân tích Nghiệp vụ (BA)',
    category: 'Kinh doanh & Công nghệ',
    tag: 'Cầu nối chiến lược',
    salaryRange: '8 – 16 triệu (Fresher) | 20 – 38 triệu (Mid/Senior)',
    suitableLevels: ['Đại học', 'Cao đẳng'],
    description: 'Làm việc với khách hàng để thu thập yêu cầu bài toán kinh doanh, viết tài liệu đặc tả chức năng cho đội phát triển.',
    keySkills: ['Requirement Elicitation', 'BPMN / UML', 'User Stories', 'Agile Mindset', 'Giao tiếp thuyết trình'],
    suggestedMajors: ['Hệ thống Thông tin Quản lý (MIS)', 'Quản trị Kinh doanh', 'Kỹ thuật Phần mềm'],
    growthTrend: 'Cao',
  },
];

export const HOLLAND_QUESTIONS = [
  {
    id: 1,
    type: 'R', // Realistic (Thực tế)
    text: 'Bạn thích tự tay lắp ráp thiết bị, sửa chữa máy móc hoặc thao tác cụ thể với công cụ hơn là ngồi đọc sách lý thuyết?',
  },
  {
    id: 2,
    type: 'I', // Investigative (Nghiên cứu)
    text: 'Bạn hào hứng với việc tìm hiểu nguyên lý sâu xa, giải bài toán hóc búa hoặc phân tích số liệu khoa học?',
  },
  {
    id: 3,
    type: 'A', // Artistic (Nghệ thuật)
    text: 'Bạn thích sáng tạo hình ảnh, phối màu, viết lách, thiết kế giao diện hoặc tự do thể hiện phong cách cá nhân?',
  },
  {
    id: 4,
    type: 'S', // Social (Xã hội)
    text: 'Bạn thích hướng dẫn, chia sẻ kiến thức, lắng nghe tâm sự và giúp đỡ bạn bè giải quyết khó khăn trong học tập?',
  },
  {
    id: 5,
    type: 'E', // Enterprising (Quản lý)
    text: 'Bạn thích làm nhóm trưởng, thuyết phục người khác đồng thuận với ý tưởng và lập kế hoạch tổ chức sự kiện?',
  },
  {
    id: 6,
    type: 'C', // Conventional (Nghiệp vụ)
    text: 'Bạn làm việc rất ngăn nắp, thích sắp xếp dữ liệu theo trật tự rõ ràng và tuân thủ các quy tắc bài bản?',
  },
];

export const DEFAULT_ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'phase-1',
    phase: 'Giai đoạn 1',
    timeframe: 'Năm 1 - 2 (Xây nền móng)',
    title: 'Khám phá Bản thân & Nắm chắc Nền tảng',
    description: 'Giai đoạn quan trọng để định vị sở trường, xây dựng thái độ học tập và tích lũy kiến thức cơ sở.',
    tasks: [
      { id: 'p1-1', text: 'Thực hiện bài test Holland trên CareerMaster để hiểu nhóm sở thích nghề nghiệp', completed: true },
      { id: 'p1-2', text: 'Đạt điểm GPA môn chuyên ngành trên 3.2 để đủ điều kiện học bổng', completed: true },
      { id: 'p1-3', text: 'Học chắc ngoại ngữ (Tiếng Anh giao tiếp hoặc chứng chỉ IELTS/TOEIC)', completed: false },
      { id: 'p1-4', text: 'Tham gia ít nhất 1 câu lạc bộ học thuật hoặc đội tình nguyện sinh viên', completed: true },
    ],
  },
  {
    id: 'phase-2',
    phase: 'Giai đoạn 2',
    timeframe: 'Năm 2 - 3 (Rèn luyện kỹ năng)',
    title: 'Tích lũy Kỹ năng Thực tế & Đồ án',
    description: 'Chuyển đổi kiến thức sách vở thành các dự án cụ thể có thể ghi vào hồ sơ năng lực.',
    tasks: [
      { id: 'p2-1', text: 'Hoàn thành ít nhất 2 đồ án cá nhân hoặc nhóm có thể demo được', completed: true },
      { id: 'p2-2', text: 'Lập tài khoản GitHub / Behance / LinkedIn chuẩn chỉnh và cập nhật sản phẩm', completed: true },
      { id: 'p2-3', text: 'Tham gia 1 cuộc thi học thuật, Hackathon hoặc NCKH cấp trường', completed: false },
      { id: 'p2-4', text: 'Sở hữu ít nhất 1 chứng chỉ online quốc tế (Coursera, Google, Meta)', completed: true },
    ],
  },
  {
    id: 'phase-3',
    phase: 'Giai đoạn 3',
    timeframe: 'Năm 3 - 4 (Thực tập & Trải nghiệm)',
    title: 'Thực tập Doanh nghiệp & Hoàn thiện CV ATS',
    description: 'Bước vào môi trường làm việc thực thụ, cọ xát với áp lực dự án và xây dựng mạng lưới quan hệ.',
    tasks: [
      { id: 'p3-1', text: 'Sử dụng CareerMaster ATS Scanner để quét CV với các JD thực tập sinh', completed: false },
      { id: 'p3-2', text: 'Tạo CV 2 cột chuẩn ATS và viết Cover Letter cá nhân hóa cho 3 công ty mục tiêu', completed: true },
      { id: 'p3-3', text: 'Luyện tập phỏng vấn ít nhất 3 lượt với AI Mock Interviewer (chuẩn STAR)', completed: false },
      { id: 'p3-4', text: 'Chinh phục kỳ thực tập doanh nghiệp kéo dài từ 2 – 4 tháng', completed: false },
    ],
  },
  {
    id: 'phase-4',
    phase: 'Giai đoạn 4',
    timeframe: 'Tốt nghiệp (Bứt phá việc làm)',
    title: 'Nhận Offer Chính thức & Bắt đầu Sự nghiệp',
    description: 'Chuyển tiếp thành công từ thực tập sinh thành nhân viên chính thức với mức lương mong đợi.',
    tasks: [
      { id: 'p4-1', text: 'Hoàn thành Khóa luận tốt nghiệp hoặc Đồ án tốt nghiệp đạt loại Giỏi', completed: false },
      { id: 'p4-2', text: 'Chuẩn bị hồ sơ năng lực Portfolio số và thư giới thiệu từ Mentor doanh nghiệp', completed: false },
      { id: 'p4-3', text: 'Thương lượng mức lương khởi điểm phù hợp với năng lực thị trường', completed: false },
    ],
  },
];
