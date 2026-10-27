import { CVTemplateCategory, CVTemplateId, CVTemplateMeta, StudentLevel } from '../types';

export const CV_CATEGORIES: {
  id: CVTemplateCategory;
  name: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'student',
    name: 'Học Sinh – Sinh Viên',
    badge: '🎓 Khởi đầu',
    description: 'Tối ưu cho học sinh, sinh viên chưa có nhiều kinh nghiệm; nhấn mạnh học vấn, đồ án và hoạt động',
  },
  {
    id: 'internship',
    name: 'Thực Tập',
    badge: '💼 Thực tập sinh',
    description: 'Thiết kế giúp sinh viên xin việc thực tập ghi điểm với thái độ học hỏi và kỹ năng thực tế',
  },
  {
    id: 'professional',
    name: 'Chuyên Nghiệp',
    badge: '👔 Tiêu chuẩn',
    description: 'Bố cục cân đối, trang trọng, phù hợp ứng tuyển doanh nghiệp trong nước và quốc tế',
  },
  {
    id: 'tech',
    name: 'Công Nghệ – Kỹ Thuật',
    badge: '⚡ Kỹ thuật',
    description: 'Tối ưu cho Lập trình viên, Kỹ sư với khu vực tech stack, đồ án công nghệ và GitHub',
  },
  {
    id: 'creative',
    name: 'Sáng Tạo',
    badge: '🎨 Nổi bật',
    description: 'Bố cục phá cách, thẩm mỹ cao cho Thiết kế, Marketing, Truyền thông và Portfolio',
  },
  {
    id: 'ats',
    name: 'Chuẩn ATS',
    badge: '🤖 Tối ưu máy quét',
    description: 'Định dạng 1 cột tiêu chuẩn, tối đa hóa tỷ lệ đọc trích xuất văn bản của hệ thống ATS',
  },
];

export const CV_TEMPLATES: CVTemplateMeta[] = [
  // ================= A. HỌC SINH – SINH VIÊN =================
  {
    id: 'student-starter',
    name: 'CV Khởi đầu',
    category: 'student',
    categoryName: 'Học Sinh – Sinh Viên',
    description: 'Thiết kế tối ưu cho học sinh THPT và sinh viên năm nhất chưa có kinh nghiệm. Nổi bật năng lực cá nhân và tiềm năng học hỏi.',
    recommendedFor: 'Học sinh THPT, sinh viên năm 1-2 cần làm CV đầu tiên',
    targetUserLevels: ['Học sinh THPT', 'Học viên trung cấp', 'Sinh viên cao đẳng', 'Sinh viên đại học'],
    layoutType: 'single-column',
    defaultThemeColor: '#2563eb', // Blue
    supportsPhoto: true,
    atsScore: 95,
    badge: 'Dễ dùng nhất',
    features: ['Học vấn & Thành tích ở đầu', 'Khu vực sở trường & kỹ năng mềm', 'Dễ điền không lo thiếu kinh nghiệm'],
  },
  {
    id: 'student-academic',
    name: 'CV Học thuật',
    category: 'student',
    categoryName: 'Học Sinh – Sinh Viên',
    description: 'Bố cục học thuật chuyên sâu làm nổi bật điểm số GPA, đề tài nghiên cứu khoa học, học bổng và môn học chuyên ngành.',
    recommendedFor: 'Sinh viên nộp hồ sơ học bổng, ứng tuyển trợ giảng (TA/RA), nghiên cứu hoặc du học',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#1e40af', // Deep Blue
    supportsPhoto: true,
    atsScore: 96,
    badge: 'Học bổng & TA',
    features: ['Điểm GPA & Bảng xếp hạng', 'Đề tài nghiên cứu khoa học', 'Chứng chỉ học thuật'],
  },
  {
    id: 'student-activity',
    name: 'CV Hoạt động nổi bật',
    category: 'student',
    categoryName: 'Học Sinh – Sinh Viên',
    description: 'Tập trung vào kinh nghiệm hoạt động Đoàn - Hội, Câu lạc bộ, dự án thiện nguyện và vai trò thủ lĩnh tổ chức sự kiện.',
    recommendedFor: 'Sinh viên năng nổ phong trào, ứng tuyển Quản trị viên tập sự (Management Trainee)',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'timeline',
    defaultThemeColor: '#059669', // Emerald
    supportsPhoto: true,
    atsScore: 92,
    badge: 'Hoạt động & CLB',
    features: ['Timeline vai trò & đóng góp', 'Kỹ năng lãnh đạo & làm việc nhóm', 'Dấu ấn tạo tác động'],
  },
  {
    id: 'student-modern',
    name: 'CV Sinh viên hiện đại',
    category: 'student',
    categoryName: 'Học Sinh – Sinh Viên',
    description: 'Giao diện tươi trẻ kết hợp đồ án thực hành môn học với kỹ năng số, phù hợp cho sinh viên tự tin bước vào thị trường lao động.',
    recommendedFor: 'Sinh viên cao đẳng, đại học nộp đơn thực tập hoặc part-time chuyên ngành',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-right',
    defaultThemeColor: '#4f46e5', // Indigo
    supportsPhoto: true,
    atsScore: 94,
    badge: 'Hiện đại',
    features: ['Bố cục 2 cột năng động', 'Ảnh đại diện tròn trẻ trung', 'Thẻ kỹ năng số'],
  },

  // ================= B. THỰC TẬP =================
  {
    id: 'intern-basic',
    name: 'CV Thực tập cơ bản',
    category: 'internship',
    categoryName: 'Thực Tập',
    description: 'Bố cục tiêu chuẩn rõ ràng, súc tích, thể hiện trọn vẹn sự sẵn sàng tiếp thu và thái độ chuyên nghiệp trong mắt nhà tuyển dụng.',
    recommendedFor: 'Ứng viên tìm kiếm vị trí thực tập sinh (Intern) lần đầu tiên',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'single-column',
    defaultThemeColor: '#0284c7', // Sky Blue
    supportsPhoto: true,
    atsScore: 98,
    badge: 'Chuẩn Intern',
    features: ['Mục tiêu học hỏi rõ ràng', 'Cấu trúc cô đọng 1 trang', 'Điểm mạnh thái độ & cam kết'],
  },
  {
    id: 'intern-tech',
    name: 'CV Thực tập kỹ thuật',
    category: 'internship',
    categoryName: 'Thực Tập',
    description: 'Tập trung trình bày tech stack, các bài tập lớn/đồ án cá nhân và kỹ năng thao tác công cụ kỹ thuật thực tế.',
    recommendedFor: 'Thực tập sinh Lập trình, Mạng máy tính, Điện tử viễn thông, Cơ điện tử',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#0f766e', // Teal
    supportsPhoto: true,
    atsScore: 96,
    badge: 'Tech Intern',
    features: ['Bảng kỹ thuật & Frameworks', 'Phân tích đồ án môn học', 'Công cụ lập trình thành thạo'],
  },
  {
    id: 'intern-business',
    name: 'CV Thực tập kinh doanh',
    category: 'internship',
    categoryName: 'Thực Tập',
    description: 'Nhấn mạnh kỹ năng giao tiếp, phân tích số liệu, bán hàng và các giải thưởng cuộc thi kinh tế, marketing.',
    recommendedFor: 'Thực tập sinh Sales, Marketing, Business Development, Nghiên cứu thị trường',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-right',
    defaultThemeColor: '#d97706', // Amber
    supportsPhoto: true,
    atsScore: 93,
    badge: 'Business',
    features: ['Thành tích thi học thuật', 'Kỹ năng đàm phán & thuyết phục', 'Ngoại ngữ giao tiếp'],
  },
  {
    id: 'intern-creative',
    name: 'CV Thực tập sáng tạo',
    category: 'internship',
    categoryName: 'Thực Tập',
    description: 'Phong cách năng động với điểm nhấn dải màu sắc, thể hiện tư duy thẩm mỹ và sự nhạy bén với xu hướng truyền thông.',
    recommendedFor: 'Thực tập sinh Content, Thiết kế đồ họa, Truyền thông mạng xã hội, Tổ chức sự kiện',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'grid',
    defaultThemeColor: '#7c3aed', // Purple
    supportsPhoto: true,
    atsScore: 89,
    badge: 'Creative',
    features: ['Khung ảnh phong cách', 'Thẻ dự án sáng tạo', 'Kỹ năng công cụ Adobe/Canva'],
  },

  // ================= C. CHUYÊN NGHIỆP =================
  {
    id: 'pro-elegant',
    name: 'CV Thanh lịch',
    category: 'professional',
    categoryName: 'Chuyên Nghiệp',
    description: 'Phong cách chuẩn mực, font chữ thanh thoát, khoảng cách thở hài hòa tạo cảm giác chỉn chu và đáng tin cậy.',
    recommendedFor: 'Ứng viên khối Tài chính, Ngân hàng, Kiểm toán, Luật, Nhân sự, Hành chính',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#334155', // Slate
    supportsPhoto: true,
    atsScore: 95,
    badge: 'Thanh lịch',
    features: ['Đường viền ngăn cách trang nhã', 'Khu vực chứng chỉ uy tín', 'Ngôn từ chuẩn mực'],
  },
  {
    id: 'pro-modern',
    name: 'CV Hiện đại',
    category: 'professional',
    categoryName: 'Chuyên Nghiệp',
    description: 'Bố cục hai cột phân định rành mạch giữa kỹ năng cốt lõi và lịch sử trải nghiệm thực chiến.',
    recommendedFor: 'Chuyên viên, nhân viên đã có từ 1-3 năm kinh nghiệm làm việc',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#2563eb', // Royal Blue
    supportsPhoto: true,
    atsScore: 94,
    badge: 'Phổ biến',
    features: ['Phân tách 2 cột cân xứng', 'Huy hiệu kỹ năng chuyên môn', 'Khu vực kinh nghiệm chi tiết'],
  },
  {
    id: 'pro-minimalist',
    name: 'CV Tối giản',
    category: 'professional',
    categoryName: 'Chuyên Nghiệp',
    description: 'Loại bỏ hoàn toàn các chi tiết rườm rà, tập trung 100% vào giá trị nội dung và thành tích đo lường được.',
    recommendedFor: 'Ứng viên yêu thích sự tinh tế, tập trung cao độ vào hiệu suất công việc',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'single-column',
    defaultThemeColor: '#18181b', // Monochrome Zinc
    supportsPhoto: false,
    atsScore: 99,
    badge: 'Minimalist',
    features: ['Đơn sắc thanh lịch', 'Tối đa diện tích văn bản', 'Dễ quét bằng mắt và máy'],
  },
  {
    id: 'pro-executive',
    name: 'CV Quản lý',
    category: 'professional',
    categoryName: 'Chuyên Nghiệp',
    description: 'Bố cục chuyên sâu nhấn mạnh năng lực điều phối đội ngũ, quản lý tiến độ và tầm nhìn chiến lược.',
    recommendedFor: 'Trưởng nhóm (Team Lead), Trợ lý quản lý, Điều phối viên dự án',
    targetUserLevels: ['Sinh viên đại học'],
    layoutType: 'compact',
    defaultThemeColor: '#831843', // Wine / Burgundy
    supportsPhoto: true,
    atsScore: 94,
    badge: 'Executive',
    features: ['Tóm tắt năng lực quản lý', 'Cột mốc dự án quan trọng', 'Kỹ năng giải quyết bài toán lớn'],
  },

  // ================= D. CÔNG NGHỆ – KỸ THUẬT =================
  {
    id: 'tech-developer',
    name: 'CV Lập trình viên',
    category: 'tech',
    categoryName: 'Công Nghệ – Kỹ Thuật',
    description: 'Thiết kế tối ưu cho Software Engineer với phân khu ngôn ngữ lập trình, framework, cơ sở dữ liệu và link GitHub.',
    recommendedFor: 'Frontend, Backend, Fullstack, Mobile Developer, DevOps',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#0284c7', // Sky Blue / Cyan
    supportsPhoto: true,
    atsScore: 97,
    badge: 'Dev Choice',
    features: ['Thẻ phân loại Tech Stack', 'Khung đồ án & link GitHub', 'Cấu trúc STAR cho tính năng'],
  },
  {
    id: 'tech-technician',
    name: 'CV Kỹ thuật viên',
    category: 'tech',
    categoryName: 'Công Nghệ – Kỹ Thuật',
    description: 'Tập trung vào kỹ năng vận hành, bảo trì thiết bị phần cứng, xử lý sự cố mạng và an toàn kỹ thuật.',
    recommendedFor: 'Kỹ thuật viên IT Support/Helpdesk, Kỹ thuật viên bảo trì phần cứng, Mạng máy tính',
    targetUserLevels: ['Học viên trung cấp', 'Sinh viên cao đẳng'],
    layoutType: 'single-column',
    defaultThemeColor: '#475569', // Slate
    supportsPhoto: true,
    atsScore: 96,
    badge: 'Thực hành',
    features: ['Quy trình & checklist thiết bị', 'Kỹ năng giải quyết sự cố tức thì', 'Chứng chỉ nghề nghiệp'],
  },
  {
    id: 'tech-engineer',
    name: 'CV Kỹ sư',
    category: 'tech',
    categoryName: 'Công Nghệ – Kỹ Thuật',
    description: 'Bố cục quy chuẩn kỹ thuật, làm nổi bật tiêu chuẩn thiết kế, phần mềm mô phỏng và chứng chỉ chuyên ngành.',
    recommendedFor: 'Kỹ sư Cơ khí, Điện - Điện tử, Xây dựng, Hóa học, Tự động hóa',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-right',
    defaultThemeColor: '#0369a1', // Deep Blue
    supportsPhoto: true,
    atsScore: 95,
    badge: 'Kỹ sư',
    features: ['Phần mềm chuyên ngành (AutoCAD/Matlab)', 'Báo cáo kỹ thuật & quy chuẩn', 'Đồ án tốt nghiệp'],
  },
  {
    id: 'tech-project',
    name: 'CV Dự án công nghệ',
    category: 'tech',
    categoryName: 'Công Nghệ – Kỹ Thuật',
    description: 'Cấu trúc lấy đồ án làm trung tâm (Project-Centric), chi tiết từng bài toán kỹ thuật, vai trò và công nghệ sử dụng.',
    recommendedFor: 'Sinh viên CNTT có từ 2-4 đồ án chất lượng cao, bài tập lớn xuất sắc',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'grid',
    defaultThemeColor: '#1d4ed8', // Blue
    supportsPhoto: true,
    atsScore: 96,
    badge: 'Project-First',
    features: ['Khung đồ án độc lập rộng rãi', 'Liệt kê tech stack theo từng mục', 'Nổi bật vai trò đóng góp'],
  },

  // ================= E. SÁNG TẠO =================
  {
    id: 'creative-design',
    name: 'CV Thiết kế',
    category: 'creative',
    categoryName: 'Sáng Tạo',
    description: 'Bố cục sáng tạo với điểm nhấn thị giác, lưới căn chỉnh khoa học làm nổi bật tư duy thẩm mỹ và phong cách cá nhân.',
    recommendedFor: 'UI/UX Designer, Graphic Designer, Họa sĩ minh họa 2D/3D',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng', 'Học viên trung cấp'],
    layoutType: 'two-column-left',
    defaultThemeColor: '#6366f1', // Indigo / Purple
    supportsPhoto: true,
    atsScore: 87,
    badge: 'UI/UX',
    features: ['Bố cục thẩm mỹ cao', 'Khung liên kết Behance/Dribbble', 'Thang đo công cụ sáng tạo'],
  },
  {
    id: 'creative-marketing',
    name: 'CV Marketing',
    category: 'creative',
    categoryName: 'Sáng Tạo',
    description: 'Tối ưu cho việc trình bày số liệu tăng trưởng, chiến dịch truyền thông đa kênh và kết quả chuyển đổi thực tế.',
    recommendedFor: 'Digital Marketing, Content Creator, Performance Marketer, Brand Specialist',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'two-column-right',
    defaultThemeColor: '#ea580c', // Orange
    supportsPhoto: true,
    atsScore: 91,
    badge: 'Growth & ROI',
    features: ['Chỉ số KPI & Tăng trưởng', 'Chiến dịch truyền thông', 'Kỹ năng công cụ phân tích'],
  },
  {
    id: 'creative-media',
    name: 'CV Truyền thông',
    category: 'creative',
    categoryName: 'Sáng Tạo',
    description: 'Phong cách năng động dành cho người làm nội dung, báo chí, PR và quản lý mạng xã hội.',
    recommendedFor: 'Chuyên viên PR, Báo chí, Quản trị Fanpage/TikTok, Copywriter',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'timeline',
    defaultThemeColor: '#db2777', // Pink / Rose
    supportsPhoto: true,
    atsScore: 90,
    badge: 'PR & Media',
    features: ['Kênh truyền thông đã quản lý', 'Kỹ năng viết & tương tác công chúng', 'Thành tích bài viết viral'],
  },
  {
    id: 'creative-portfolio',
    name: 'CV Portfolio',
    category: 'creative',
    categoryName: 'Sáng Tạo',
    description: 'Tích hợp phần giới thiệu dự án trực quan cùng đường dẫn liên kết sản phẩm, website cá nhân và tác phẩm tiêu biểu.',
    recommendedFor: 'Nhiếp ảnh gia, Nhà làm phim, Nhà thiết kế thời trang, Nghệ sĩ',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'grid',
    defaultThemeColor: '#4338ca', // Deep Indigo
    supportsPhoto: true,
    atsScore: 86,
    badge: 'Showcase',
    features: ['Phần giới thiệu tác phẩm', 'Đường dẫn portfolio nổi bật', 'Triết lý sáng tạo'],
  },

  // ================= F. ATS =================
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    category: 'ats',
    categoryName: 'Chuẩn ATS',
    description: 'Mẫu đơn cột chuẩn mực tối đa cho hệ thống lọc hồ sơ tự động (Workday, Taleo, Greenhouse). Tỷ lệ vượt qua bộ lọc 99%.',
    recommendedFor: 'Ứng tuyển tập đoàn đa quốc gia, ngân hàng lớn, các công ty dùng hệ thống ATS',
    targetUserLevels: ['Học sinh THPT', 'Học viên trung cấp', 'Sinh viên cao đẳng', 'Sinh viên đại học'],
    layoutType: 'single-column',
    defaultThemeColor: '#0f172a', // Deep Slate
    supportsPhoto: false, // Standard ATS avoids photos
    atsScore: 99,
    badge: 'Chuẩn ATS 99%',
    features: ['Đơn cột 100% thân thiện máy quét', 'Không bảng phức tạp gây lỗi trích xuất', 'Từ khóa chuẩn quốc tế'],
  },
  {
    id: 'ats-modern',
    name: 'ATS Modern',
    category: 'ats',
    categoryName: 'Chuẩn ATS',
    description: 'Sự kết hợp hoàn hảo giữa độ thân thiện với máy quét ATS và tính thẩm mỹ dễ đọc đối với chuyên viên tuyển dụng.',
    recommendedFor: 'Ứng viên muốn tối ưu cả máy quét lẫn mắt nhà tuyển dụng',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'single-column',
    defaultThemeColor: '#1e3a8a', // Dark Blue
    supportsPhoto: true,
    atsScore: 98,
    badge: 'ATS & HR',
    features: ['Đường phân cách hiện đại', 'Cấu trúc tiêu đề chuẩn ATS', 'Tùy chọn ảnh gọn gàng'],
  },
  {
    id: 'ats-technical',
    name: 'ATS Technical',
    category: 'ats',
    categoryName: 'Chuẩn ATS',
    description: 'Tối ưu hóa mật độ từ khóa kỹ thuật (Keyword Density) giúp CV vượt qua bộ lọc từ khóa chuyên ngành một cách dễ dàng.',
    recommendedFor: 'Kỹ sư phần mềm, Chuyên viên dữ liệu ứng tuyển các tập đoàn công nghệ lớn',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'single-column',
    defaultThemeColor: '#0369a1', // Cyan / Deep Blue
    supportsPhoto: false,
    atsScore: 99,
    badge: 'Mật độ từ khóa',
    features: ['Phân mục từ khóa kỹ thuật đầu trang', 'Cấu trúc Action + Impact', 'Chuẩn lọc của Big Tech'],
  },
  {
    id: 'ats-graduate',
    name: 'ATS Graduate',
    category: 'ats',
    categoryName: 'Chuẩn ATS',
    description: 'Thiết kế riêng cho sinh viên mới ra trường ứng tuyển vào các chương trình Management Trainee qua hệ thống ATS.',
    recommendedFor: 'Sinh viên mới tốt nghiệp hoặc chuẩn bị tốt nghiệp ứng tuyển doanh nghiệp lớn',
    targetUserLevels: ['Sinh viên đại học', 'Sinh viên cao đẳng'],
    layoutType: 'single-column',
    defaultThemeColor: '#1e293b', // Slate
    supportsPhoto: true,
    atsScore: 98,
    badge: 'Graduate Trainee',
    features: ['Ưu tiên học vấn & đồ án trường học', 'Dễ dàng quét GPA & giải thưởng', 'Không bị lỗi font'],
  },
];

// Helper to get template by ID (supporting legacy aliases)
export const getTemplateById = (id: string): CVTemplateMeta => {
  // Legacy aliases
  if (id === 'ats') id = 'ats-classic';
  if (id === 'modern') id = 'student-modern';
  if (id === 'professional') id = 'pro-elegant';
  if (id === 'creative') id = 'creative-design';

  const found = CV_TEMPLATES.find((t) => t.id === id);
  return found || CV_TEMPLATES[0];
};

// Smart template recommendation based on student level & target role
export const getRecommendedTemplate = (
  level: StudentLevel,
  targetRole?: string
): { template: CVTemplateMeta; reason: string } => {
  const roleLower = (targetRole || '').toLowerCase();

  // 1. Tech roles
  if (
    roleLower.includes('developer') ||
    roleLower.includes('lập trình') ||
    roleLower.includes('frontend') ||
    roleLower.includes('backend') ||
    roleLower.includes('software') ||
    roleLower.includes('cntt') ||
    roleLower.includes('it')
  ) {
    const t = getTemplateById('tech-developer');
    return {
      template: t,
      reason: 'Phù hợp nhất với mục tiêu ngành Công nghệ thông tin nhờ khu vực Tech Stack nổi bật và cấu trúc đồ án chuẩn GitHub.',
    };
  }

  // 2. Creative / Design / Marketing
  if (
    roleLower.includes('thiết kế') ||
    roleLower.includes('design') ||
    roleLower.includes('marketing') ||
    roleLower.includes('content') ||
    roleLower.includes('truyền thông')
  ) {
    const t = getTemplateById('creative-design');
    return {
      template: t,
      reason: 'Bố cục sáng tạo với liên kết portfolio giúp bạn thể hiện tư duy thẩm mỹ và phong cách thị giác ấn tượng.',
    };
  }

  // 3. High School student
  if (level === 'Học sinh THPT') {
    const t = getTemplateById('student-starter');
    return {
      template: t,
      reason: 'Dành riêng cho học sinh THPT: nhấn mạnh học vấn, sở trường và hoạt động mà không yêu cầu kinh nghiệm làm việc.',
    };
  }

  // 4. Vocational
  if (level === 'Học viên trung cấp') {
    const t = getTemplateById('tech-technician');
    return {
      template: t,
      reason: 'Tập trung vào tay nghề thực hành, kỹ năng thao tác thiết bị và chứng chỉ kỹ thuật chuyên môn.',
    };
  }

  // 5. College / Intern
  if (level === 'Sinh viên cao đẳng' || roleLower.includes('thực tập') || roleLower.includes('intern')) {
    const t = getTemplateById('intern-basic');
    return {
      template: t,
      reason: 'Mẫu thực tập chuẩn mực, nhấn mạnh thái độ học hỏi, đồ án môn học và các kỹ năng nghề nghiệp cốt lõi.',
    };
  }

  // 6. Default University / General
  const t = getTemplateById('ats-modern');
  return {
    template: t,
    reason: 'Mẫu chuẩn kép: vừa tối ưu cho hệ thống lọc tự động ATS, vừa mang giao diện hiện đại, dễ đọc đối với nhà tuyển dụng.',
  };
};
