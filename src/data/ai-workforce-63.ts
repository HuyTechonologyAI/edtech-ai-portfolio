export interface AIEmployee {
  id: string;
  code: string; // Mã định danh hệ thống (L1, L2, L3, SEC, HR, n8n, etc.)
  name: string; // Tên tiếng Việt 2 chữ chuẩn
  gender: "Nam" | "Nữ";
  age: number;
  department: string; // Khối công việc chuẩn AdminCenter
  role: string; // Chức danh đầy đủ
  roleShort: string; // Chức danh ngắn
  color: string;
  avatarPath: string;
  description: string;
}

export const ADMINCENTER_DEPARTMENTS = [
  "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
  "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
  "Khối Giáo dục & EdTech AI (HUY AI School)",
  "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
  "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
  "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
  "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
  "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
];

export const AI_WORKFORCE_63: AIEmployee[] = [
  // =========================================================================
  // KHỐI 1: BAN QUẢN TRỊ & ĐIỀU PHỐI TỐI CAO (8 nhân sự) - Màu: #4F46E5
  // =========================================================================
  {
    id: "emp_01",
    code: "L1-CSAO",
    name: "Mai Anh",
    gender: "Nữ",
    age: 35,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Chief Strategy AI Officer (CSAO) - Giám đốc Chiến lược & Điều phối",
    roleShort: "Tổng điều phối CSAO",
    color: "#4F46E5",
    avatarPath: "/assets/workforce/emp_01.jpg",
    description: "Chỉ huy toàn bộ lộ trình DAG Roadmap, phân công nhiệm vụ cho 6 Business Units và kết nối chuỗi mắt xích AI Agency."
  },
  {
    id: "emp_02",
    code: "L1-CRO",
    name: "Hữu Hùng",
    gender: "Nam",
    age: 40,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Chief Resource & Quota AI Officer (CRO) - Quản trị Tài nguyên & Quota",
    roleShort: "Quản trị Tài nguyên CRO",
    color: "#0F766E",
    avatarPath: "/assets/workforce/emp_02.jpg",
    description: "Giám sát định mức 10M tokens trên 6 domain, cân đối chi phí API Claude, OpenAI, Vertex và phân bổ GPU Node-01."
  },
  {
    id: "emp_03",
    code: "L1-CCO",
    name: "Thanh Trúc",
    gender: "Nữ",
    age: 30,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Chief Compliance Officer (CCO) - Kiểm soát Tuân thủ & Bản quyền",
    roleShort: "Kiểm soát Tuân thủ CCO",
    color: "#64748B",
    avatarPath: "/assets/workforce/emp_03.jpg",
    description: "Rà soát tính tuân thủ pháp lý, giấy phép phần mềm mã nguồn mở MIT/Apache và kiểm duyệt nội dung xuất bản."
  },
  {
    id: "emp_04",
    code: "L1-S01",
    name: "Quang Minh",
    gender: "Nam",
    age: 33,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Standby Strategy Lead - Dự phòng Điều phối Chiến lược",
    roleShort: "Dự phòng Chiến lược",
    color: "#4F46E5",
    avatarPath: "/assets/workforce/emp_04.jpg",
    description: "Sẵn sàng đồng bộ Context Capsule thời gian thực từ CSAO, tiếp quản điều hành ngay lập tức nếu có sự cố."
  },
  {
    id: "emp_05",
    code: "L1-S04",
    name: "Thu Trang",
    gender: "Nữ",
    age: 29,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Standby Quota Lead - Dự phòng Điều phối Token & Chi phí",
    roleShort: "Dự phòng Token Quota",
    color: "#0F766E",
    avatarPath: "/assets/workforce/emp_05.jpg",
    description: "Theo dõi ngưỡng cảnh báo 20% quota trên 6 domain và kích hoạt cơ chế dự phòng tự ngắt bảo vệ ngân sách."
  },
  {
    id: "emp_06",
    code: "L1-S05",
    name: "Thanh Tùng",
    gender: "Nam",
    age: 36,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Standby Compliance Lead - Dự phòng Kiểm soát Tuân thủ",
    roleShort: "Dự phòng Tuân thủ",
    color: "#64748B",
    avatarPath: "/assets/workforce/emp_06.jpg",
    description: "Lưu trữ cơ sở tri thức chính sách độc lập, sẵn sàng thẩm định tự động các tài liệu và luồng dữ liệu nhạy cảm."
  },
  {
    id: "emp_07",
    code: "A2A-COORD",
    name: "Gia Hân",
    gender: "Nữ",
    age: 27,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "A2A Mesh Protocol Dispatcher - Điều phối Mạng lưới Bầy đàn Agent",
    roleShort: "Điều phối A2A Mesh",
    color: "#4F46E5",
    avatarPath: "/assets/workforce/emp_07.jpg",
    description: "Điều phối các gói tin giao tiếp Agent-to-Agent (A2A), giám sát handoff giữa các pod và ghi nhật ký chuỗi hành động."
  },
  {
    id: "emp_08",
    code: "HAIP-SUPER",
    name: "Hải Đăng",
    gender: "Nam",
    age: 32,
    department: "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)",
    role: "Autonomous Supervisor Lead - Giám sát Tự trị & Checkpoint Gate",
    roleShort: "Giám sát Tự trị Supervisor",
    color: "#4F46E5",
    avatarPath: "/assets/workforce/emp_08.jpg",
    description: "Trực chiến ghi nhận checkpoint, xác thực chữ ký số Ed25519 cho các quyết định can thiệp hệ thống."
  },

  // =========================================================================
  // KHỐI 2: CÔNG NGHỆ & KIẾN TRÚC CỐT LÕI (8 nhân sự) - Màu: #2563EB
  // =========================================================================
  {
    id: "emp_09",
    code: "L1-CTO",
    name: "Quang Huy",
    gender: "Nam",
    age: 28,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "Chief Technology AI Officer (CTO) - Giám đốc Công nghệ & Kiến trúc",
    roleShort: "Giám đốc Công nghệ CTO",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_09.jpg",
    description: "Thẩm định kiến trúc phần mềm HAIP Core, kiểm soát chất lượng kỹ thuật 4 domain dự án và điều hành nhóm cốt lõi."
  },
  {
    id: "emp_10",
    code: "CTO-PUB",
    name: "Như Hoa",
    gender: "Nữ",
    age: 32,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "CTO Dự án Public Website (huycncdsai.io.vn)",
    roleShort: "CTO Public Website",
    color: "#7C3AED",
    avatarPath: "/assets/workforce/emp_10.jpg",
    description: "Chịu trách nhiệm toàn diện về tính ổn định, tốc độ tải trang và trải nghiệm người dùng của cổng thông tin công cộng."
  },
  {
    id: "emp_11",
    code: "CTO-ADM",
    name: "Thành Đạt",
    gender: "Nam",
    age: 28,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "CTO Phân hệ AdminCenter (huycncdsai.io.vn/admincenter)",
    roleShort: "CTO AdminCenter",
    color: "#0369A1",
    avatarPath: "/assets/workforce/emp_11.jpg",
    description: "Chỉ đạo phát triển 10 tab điều hành quản trị, bảo mật phiên đăng nhập và luồng telemetry từ Node-01."
  },
  {
    id: "emp_12",
    code: "L3-M01",
    name: "Thành Công",
    gender: "Nam",
    age: 28,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "Fullstack Architecture Lead - Trưởng nhóm Phát triển Toàn diện",
    roleShort: "Trưởng nhóm Fullstack",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_12.jpg",
    description: "Tiếp nhận chỉ thị tính năng mới, chuẩn hóa API REST/GraphQL và đồng bộ cơ sở dữ liệu Supabase."
  },
  {
    id: "emp_13",
    code: "L3-M02",
    name: "Lan Chi",
    gender: "Nữ",
    age: 26,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "Schema & Interface Specialist - Chuyên viên Tiêu chuẩn hóa Schema",
    roleShort: "Chuẩn hóa Schema & API",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_13.jpg",
    description: "Chuẩn hóa interface HAIP Agent Card, xác thực schema JSON và bảo đảm tương thích ngược."
  },
  {
    id: "emp_14",
    code: "L3-M03",
    name: "Đức Huy",
    gender: "Nam",
    age: 27,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "Core Performance Optimizer - Kỹ sư Tối ưu Hiệu năng & Bundle Size",
    roleShort: "Tối ưu Hiệu năng Core",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_14.jpg",
    description: "Tối ưu Next.js bundle size, cấu hình Turbopack và loại bỏ rò rỉ bộ nhớ trên các ứng dụng web."
  },
  {
    id: "emp_15",
    code: "L3-M05",
    name: "Ngọc Anh",
    gender: "Nữ",
    age: 29,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "Research & Applied AI Scientist - Nhà khoa học Nghiên cứu AI Ứng dụng",
    roleShort: "Nghiên cứu AI Ứng dụng",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_15.jpg",
    description: "Thử nghiệm các kiến trúc Prompting mới, kỹ thuật CoT (Chain-of-Thought) và nén ngữ cảnh token."
  },
  {
    id: "emp_16",
    code: "L3-BRIDGE",
    name: "Nhật Huy",
    gender: "Nam",
    age: 27,
    department: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
    role: "AI Bridge & Worktree Sync Engineer - Kỹ sư Cầu nối Git Worktree",
    roleShort: "Đồng bộ Git Worktree",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_16.jpg",
    description: "Quản lý 4 worktree độc lập cho 4 team cục bộ trên Node-01, tự động rebase và giải quyết xung đột mã nguồn."
  },

  // =========================================================================
  // KHỐI 3: GIÁO DỤC & EDTECH AI (7 nhân sự) - Màu: #0D9488
  // =========================================================================
  {
    id: "emp_17",
    code: "CTO-GVCN",
    name: "Đức Thành",
    gender: "Nam",
    age: 33,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "CTO Dự án SmartTeacherSchedule (gvcncdsai.io.vn)",
    roleShort: "CTO SmartTeacher",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_17.jpg",
    description: "Lãnh đạo kỹ thuật hệ thống quản lý thời khóa biểu thông minh và giải pháp chuyển đổi số giáo dục."
  },
  {
    id: "emp_18",
    code: "L2-P02",
    name: "Phương Linh",
    gender: "Nữ",
    age: 29,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "Academic Director (HUY AI School) - Giám đốc Khối Học thuật AI",
    roleShort: "Giám đốc Học thuật",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_18.jpg",
    description: "Chỉ đạo phát triển chương trình giảng dạy AI thực chiến, hệ thống bài tập thực hành và lộ trình học tập."
  },
  {
    id: "emp_19",
    code: "L3-A01",
    name: "Anh Khoa",
    gender: "Nam",
    age: 29,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "Curriculum Automation Specialist - Kỹ sư Tự động hóa Giáo án CV5512",
    roleShort: "Soạn Giáo án CV5512",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_19.jpg",
    description: "Tự động trích xuất chuẩn kiến thức kỹ năng, soạn kế hoạch bài dạy theo mẫu công văn 5512 của Bộ GD&ĐT."
  },
  {
    id: "emp_20",
    code: "L3-A02",
    name: "Diệu My",
    gender: "Nữ",
    age: 24,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "Schedule Optimization AI Specialist - Kỹ sư Tối ưu Thời khóa biểu",
    roleShort: "Xếp Thời khóa biểu AI",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_20.jpg",
    description: "Ứng dụng giải thuật di truyền và AI để giải bài toán xếp lịch giảng dạy, tránh trùng tiết và tối ưu thời gian."
  },
  {
    id: "emp_21",
    code: "L3-A04",
    name: "Minh Quân",
    gender: "Nam",
    age: 31,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "AI Tutor & Student Support Lead - Trưởng nhóm Trợ giảng AI Tương tác",
    roleShort: "Trợ giảng AI 24/7",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_21.jpg",
    description: "Cung cấp gia sư AI thông minh giải đáp thắc mắc cho học viên 24/7, tự động chấm bài và gợi ý cải thiện."
  },
  {
    id: "emp_22",
    code: "L2-S02",
    name: "Kim Oanh",
    gender: "Nữ",
    age: 28,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "Standby Academic Lead - Dự phòng Điều phối Học thuật",
    roleShort: "Dự phòng Học thuật",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_22.jpg",
    description: "Sẵn sàng thay thế điều hành hệ thống SmartTeacherSchedule khi phát hiện lưu lượng truy cập cao điểm."
  },
  {
    id: "emp_23",
    code: "QA-EDU",
    name: "Khôi Nguyên",
    gender: "Nam",
    age: 30,
    department: "Khối Giáo dục & EdTech AI (HUY AI School)",
    role: "Educational QA & Testing Lead - Trưởng nhóm Kiểm thử Chất lượng Giáo dục",
    roleShort: "Kiểm thử Giáo dục QA",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_23.jpg",
    description: "Thực hiện kiểm thử tự động luồng người dùng giáo viên, học sinh và kiểm duyệt 369 tiêu chuẩn chất lượng."
  },

  // =========================================================================
  // KHỐI 4: TÀI CHÍNH, THUẾ & KẾ TOÁN AI (7 nhân sự) - Màu: #16A34A
  // =========================================================================
  {
    id: "emp_24",
    code: "CTO-TAX",
    name: "Quốc Bảo",
    gender: "Nam",
    age: 33,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "CTO Dự án SmartTax AI (smarttax-ai.vercel.app)",
    roleShort: "CTO SmartTax AI",
    color: "#16A34A",
    avatarPath: "/assets/workforce/emp_24.jpg",
    description: "Lãnh đạo kỹ thuật nền tảng khai thuế và kế toán thông minh, đảm bảo an toàn dữ liệu tài chính doanh nghiệp."
  },
  {
    id: "emp_25",
    code: "L2-P03",
    name: "Kim Ngân",
    gender: "Nữ",
    age: 38,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "Finance Director (SmartTax) - Giám đốc Tài chính & Thuế AI",
    roleShort: "Giám đốc Tài chính CFO",
    color: "#15803D",
    avatarPath: "/assets/workforce/emp_25.jpg",
    description: "Chỉ đạo đối soát tờ khai thuế GTGT, kiểm tra hóa đơn điện tử hợp lệ và phân loại chi phí khấu trừ tự động."
  },
  {
    id: "emp_26",
    code: "TAX-AUDIT",
    name: "Tuấn Anh",
    gender: "Nam",
    age: 29,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "VAT & Invoice Audit Specialist - Chuyên viên Đối soát Tờ khai & Hóa đơn",
    roleShort: "Đối soát Tờ khai VAT",
    color: "#16A34A",
    avatarPath: "/assets/workforce/emp_26.jpg",
    description: "Tự động đọc mã tra cứu hóa đơn từ Tổng cục Thuế, kiểm tra tính hợp pháp và phát hiện sai lệch số liệu."
  },
  {
    id: "emp_27",
    code: "TAX-EXPENSE",
    name: "Tú Uyên",
    gender: "Nữ",
    age: 26,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "Deductible Expense Classifier - Chuyên viên Phân loại Chi phí Khấu trừ",
    roleShort: "Phân loại Chi phí",
    color: "#16A34A",
    avatarPath: "/assets/workforce/emp_27.jpg",
    description: "Ứng dụng mô hình AI phân loại chi phí hợp lý, hợp lệ được trừ khi tính thuế thu nhập doanh nghiệp."
  },
  {
    id: "emp_28",
    code: "L2-S03",
    name: "Công Thành",
    gender: "Nam",
    age: 34,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "Standby Finance Lead - Dự phòng Điều phối Tài chính Thuế",
    roleShort: "Dự phòng Tài chính",
    color: "#15803D",
    avatarPath: "/assets/workforce/emp_28.jpg",
    description: "Sẵn sàng hỗ trợ xử lý khi lưu lượng nộp báo cáo thuế cuối tháng tăng cao đột biến."
  },
  {
    id: "emp_29",
    code: "TAX-RISK",
    name: "Bảo Châu",
    gender: "Nữ",
    age: 28,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "Financial Risk & Anomaly Detector - Chuyên viên Cảnh báo Rủi ro Thuế",
    roleShort: "Cảnh báo Rủi ro Thuế",
    color: "#16A34A",
    avatarPath: "/assets/workforce/emp_29.jpg",
    description: "Phát hiện các chỉ số bất thường trong báo cáo tài chính, cảnh báo sớm nguy cơ bị thanh kiểm tra."
  },
  {
    id: "emp_30",
    code: "TAX-SETTLE",
    name: "Trọng Nhân",
    gender: "Nam",
    age: 30,
    department: "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)",
    role: "Financial Settlement Officer - Chuyên viên Quyết toán & Đối chiếu Công nợ",
    roleShort: "Quyết toán Công nợ",
    color: "#15803D",
    avatarPath: "/assets/workforce/emp_30.jpg",
    description: "Tự động tạo biên bản đối chiếu công nợ khách hàng, hỗ trợ xuất hóa đơn và theo dõi dòng tiền."
  },

  // =========================================================================
  // KHỐI 5: SÁNG TẠO NỘI DUNG & N8N PUBLISHING (10 nhân sự) - Màu: #DB2777 & #DC2626
  // =========================================================================
  {
    id: "emp_31",
    code: "L2-P04",
    name: "Hoàng Nam",
    gender: "Nam",
    age: 34,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Media & Creative Director - Giám đốc Khối Truyền thông & Nội dung AI",
    roleShort: "Giám đốc Truyền thông",
    color: "#C026D3",
    avatarPath: "/assets/workforce/emp_31.jpg",
    description: "Chỉ đạo toàn bộ chiến dịch sản xuất nội dung, hình ảnh và phân phối bài đăng qua hệ thống mạng xã hội."
  },
  {
    id: "emp_32",
    code: "OUTLINE-AI",
    name: "Minh Triết",
    gender: "Nam",
    age: 24,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Content Outline & Storyboard Architect - Kiến trúc sư Dàn ý & Khung sườn",
    roleShort: "Xây dựng Dàn ý",
    color: "#9333EA",
    avatarPath: "/assets/workforce/emp_32.jpg",
    description: "Thiết kế dàn ý logic, cấu trúc phân đoạn thu hút cho bài viết blog chuyên sâu và video viral triệu view."
  },
  {
    id: "emp_33",
    code: "CONTENT-AI",
    name: "Bảo Ngọc",
    gender: "Nữ",
    age: 26,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Multichannel Copywriter - Chuyên gia Sáng tạo Nội dung Đa kênh",
    roleShort: "Viết Nội dung Đa kênh",
    color: "#DB2777",
    avatarPath: "/assets/workforce/emp_33.jpg",
    description: "Soạn thảo bài viết quảng cáo, bài PR báo chí, thông điệp mạng xã hội với văn phong hấp dẫn, chuyển đổi cao."
  },
  {
    id: "emp_34",
    code: "DESIGN-AI",
    name: "Đức Anh",
    gender: "Nam",
    age: 23,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Visual Brand & Graphic Designer - Chuyên viên Thiết kế Đồ họa & Banner",
    roleShort: "Thiết kế Đồ họa",
    color: "#EA580C",
    avatarPath: "/assets/workforce/emp_34.jpg",
    description: "Thiết kế banner truyền thông, infographic khoa học và giữ vững nhận diện thương hiệu trên các nền tảng."
  },
  {
    id: "emp_35",
    code: "IMAGE-AI",
    name: "Khánh Linh",
    gender: "Nữ",
    age: 25,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "AI Generative Artist - Chuyên gia Tạo hình ảnh Minh họa AI",
    roleShort: "Tạo hình ảnh AI",
    color: "#F59E0B",
    avatarPath: "/assets/workforce/emp_35.jpg",
    description: "Chuyên sâu các mô hình sinh ảnh nghệ thuật, tạo asset quảng cáo, ảnh bìa sản phẩm và mockup chuyên nghiệp."
  },
  {
    id: "emp_36",
    code: "VIDEO-DIR",
    name: "Tuấn Kiệt",
    gender: "Nam",
    age: 30,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "AI Video Production Lead - Đạo diễn Sản xuất Video AI Đa nền tảng",
    roleShort: "Đạo diễn Video AI",
    color: "#DC2626",
    avatarPath: "/assets/workforce/emp_36.jpg",
    description: "Phối hợp các công cụ video AI, cắt dựng, lồng tiếng và hoàn thiện video ngắn TikTok, YouTube Shorts tự động."
  },
  {
    id: "emp_37",
    code: "N8N-DISPATCH",
    name: "Hải Yến",
    gender: "Nữ",
    age: 28,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "n8n Social Publishing Suite Dispatcher - Điều phối Xuất bản Tự động n8n",
    roleShort: "Xuất bản Tự động n8n",
    color: "#0284C7",
    avatarPath: "/assets/workforce/emp_37.jpg",
    description: "Vận hành 21 micro-workflow tự động đẩy bài lên Facebook Fanpage, LinkedIn, Telegram, Twitter qua Node-01."
  },
  {
    id: "emp_38",
    code: "VIDEO-STORY",
    name: "Hoài Thương",
    gender: "Nữ",
    age: 27,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Storyboard & Script Specialist - Kịch bản Phân cảnh Video",
    roleShort: "Kịch bản Phân cảnh",
    color: "#DC2626",
    avatarPath: "/assets/workforce/emp_38.jpg",
    description: "Viết kịch bản chi tiết từng giây, miêu tả khung hình, góc quay và nhịp độ video phù hợp tâm lý người xem."
  },
  {
    id: "emp_39",
    code: "VIDEO-MOTION",
    name: "Minh Khang",
    gender: "Nam",
    age: 29,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Motion Graphics Animator - Chuyên viên Hiệu ứng Đồ họa Động",
    roleShort: "Hiệu ứng Đồ họa Động",
    color: "#DC2626",
    avatarPath: "/assets/workforce/emp_39.jpg",
    description: "Tạo các chuyển động đồ họa giải thích khái niệm AI, tiêu đề động và hiệu ứng visual ấn tượng cho video."
  },
  {
    id: "emp_40",
    code: "VOICE-AI",
    name: "Mỹ Duyên",
    gender: "Nữ",
    age: 24,
    department: "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)",
    role: "Virtual Presenter & Voiceover Artist - MC Ảo & Lồng tiếng AI",
    roleShort: "MC Ảo & Giọng đọc AI",
    color: "#DC2626",
    avatarPath: "/assets/workforce/emp_40.jpg",
    description: "Khởi tạo MC ảo phát biểu, đồng bộ khẩu hình môi (Lip-sync) theo nội dung kịch bản và thu âm giọng đọc truyền cảm."
  },

  // =========================================================================
  // KHỐI 6: TIẾP THỊ, TĂNG TRƯỞNG & CRM (8 nhân sự) - Màu: #C026D3 & #0891B2
  // =========================================================================
  {
    id: "emp_41",
    code: "LEADGEN-AI",
    name: "Phương Thảo",
    gender: "Nữ",
    age: 29,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "B2B Lead Generation Specialist - Chuyên viên Khai thác Khách hàng Tiềm năng",
    roleShort: "Khai thác Khách hàng Leads",
    color: "#CA8A04",
    avatarPath: "/assets/workforce/emp_41.jpg",
    description: "Thu thập danh bạ doanh nghiệp mục tiêu, chấm điểm độ nóng của lead và phân loại khách hàng tự động."
  },
  {
    id: "emp_42",
    code: "CRM-AI",
    name: "Thùy Dung",
    gender: "Nữ",
    age: 27,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "CRM & Customer Lifecycle Specialist - Quản trị Dữ liệu Khách hàng & Vòng đời",
    roleShort: "Quản trị CRM Vòng đời",
    color: "#0D9488",
    avatarPath: "/assets/workforce/emp_42.jpg",
    description: "Theo dõi phân khúc khách hàng, lịch sử giao dịch và tự động kích hoạt thông điệp nuôi dưỡng cá nhân hóa."
  },
  {
    id: "emp_43",
    code: "SUPPORT-AI",
    name: "Trọng Nghĩa",
    gender: "Nam",
    age: 25,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "Customer Support & Incident Escalation - Hỗ trợ Khách hàng 24/7",
    roleShort: "Hỗ trợ Khách hàng 24/7",
    color: "#0891B2",
    avatarPath: "/assets/workforce/emp_43.jpg",
    description: "Trực tổng đài AI giải đáp mọi thắc mắc của khách hàng, tạo ticket hỗ trợ và chuyển tiếp sự cố kịp thời."
  },
  {
    id: "emp_44",
    code: "ADS-OPT",
    name: "Phúc An",
    gender: "Nam",
    age: 27,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "Paid Ads & Conversion Optimizer - Tối ưu hóa Chiến dịch Quảng cáo Chuyển đổi",
    roleShort: "Tối ưu Quảng cáo Ads",
    color: "#C026D3",
    avatarPath: "/assets/workforce/emp_44.jpg",
    description: "Theo dõi chỉ số ROI/ROAS, tự động bật tắt chiến dịch kém hiệu quả và phân bổ ngân sách sang nhóm ads tiềm năng."
  },
  {
    id: "emp_45",
    code: "SOCIAL-SMM",
    name: "Quỳnh Anh",
    gender: "Nữ",
    age: 25,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "Social Media Engagement Lead - Trưởng nhóm Tương tác Cộng đồng Mạng xã hội",
    roleShort: "Tương tác Mạng xã hội",
    color: "#C026D3",
    avatarPath: "/assets/workforce/emp_45.jpg",
    description: "Chăm sóc fanpage, giải đáp bình luận tự động trong 3 giây và điều hướng khách hàng vào phễu tư vấn."
  },
  {
    id: "emp_46",
    code: "SEO-TECH",
    name: "Hồng Phúc",
    gender: "Nam",
    age: 33,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "Technical SEO & Search Dominance - Chuyên gia SEO Kỹ thuật & Top Tìm kiếm",
    roleShort: "SEO Kỹ thuật & Top Google",
    color: "#C026D3",
    avatarPath: "/assets/workforce/emp_46.jpg",
    description: "Tối ưu hóa cấu trúc website, audit sitemap, thẻ schema và theo dõi từ khóa chiến lược của hệ sinh thái."
  },
  {
    id: "emp_47",
    code: "VIP-LOYALTY",
    name: "Bích Ngọc",
    gender: "Nữ",
    age: 26,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "VIP Account Management & Retention - Quản trị Khách hàng VIP & Giữ chân",
    roleShort: "Quản trị Khách VIP",
    color: "#0891B2",
    avatarPath: "/assets/workforce/emp_47.jpg",
    description: "Chăm sóc các tài khoản doanh nghiệp lớn, gửi ưu đãi đặc quyền và đảm bảo tỷ lệ gia hạn dịch vụ trên 95%."
  },
  {
    id: "emp_48",
    code: "SALES-DEAL",
    name: "Minh Tâm",
    gender: "Nam",
    age: 30,
    department: "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)",
    role: "Partnership & Deal Negotiation - Chuyên gia Đàm phán Hợp đồng Đối tác",
    roleShort: "Đàm phán Hợp đồng Đối tác",
    color: "#16A34A",
    avatarPath: "/assets/workforce/emp_48.jpg",
    description: "Soạn thảo điều khoản hợp đồng liên kết doanh nghiệp, giải quyết khúc mắc pháp lý và xúc tiến ký kết nhanh."
  },

  // =========================================================================
  // KHỐI 7: HẠ TẦNG, DEVOPS & VẬN HÀNH NODE-01 (8 nhân sự) - Màu: #0369A1
  // =========================================================================
  {
    id: "emp_49",
    code: "L2-P05",
    name: "Hoàng Phúc",
    gender: "Nam",
    age: 34,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "DevOps & Node01 Infrastructure Lead - Trưởng ban Hạ tầng & Vận hành SRE",
    roleShort: "Trưởng ban Hạ tầng Node-01",
    color: "#0369A1",
    avatarPath: "/assets/workforce/emp_49.jpg",
    description: "Chỉ huy toàn diện cụm máy chủ Dell M4800 Node-01, cấu hình mạng Tailscale và bảo vệ tính khả dụng 24/7."
  },
  {
    id: "emp_50",
    code: "UPTIME-MON",
    name: "Như Quỳnh",
    gender: "Nữ",
    age: 28,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Uptime Monitor & Red Alert Daemon - Giám sát Uptime & Cảnh báo Sự cố",
    roleShort: "Giám sát Uptime 24/7",
    color: "#DC2626",
    avatarPath: "/assets/workforce/emp_50.jpg",
    description: "Ping 4 domain dự án mỗi 3 phút từ Node-01, tự động bắn email cảnh báo khẩn cấp Resend khi có mã lỗi >= 400."
  },
  {
    id: "emp_51",
    code: "MAINT-CRON",
    name: "Gia Bảo",
    gender: "Nam",
    age: 31,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Weekly Maintenance & Crontab Engineer - Kỹ sư Bảo dưỡng Định kỳ Crontab",
    roleShort: "Bảo dưỡng Crontab",
    color: "#0369A1",
    avatarPath: "/assets/workforce/emp_51.jpg",
    description: "Vận hành crontab 00:00 thứ 3 hàng tuần: dọn dẹp cache rác, build test Next.js/Vite và gửi báo cáo tổng kết."
  },
  {
    id: "emp_52",
    code: "SUPA-DBA",
    name: "Mai Linh",
    gender: "Nữ",
    age: 25,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Supabase & Postgres Database Administrator - Quản trị Cơ sở Dữ liệu",
    roleShort: "Quản trị Cơ sở Dữ liệu",
    color: "#0F766E",
    avatarPath: "/assets/workforce/emp_52.jpg",
    description: "Tối ưu hóa các bảng dữ liệu Supabase, kiểm soát Row Level Security (RLS) và sao lưu dữ liệu tự động hàng ngày."
  },
  {
    id: "emp_53",
    code: "OLLAMA-SRV",
    name: "Quốc Khánh",
    gender: "Nam",
    age: 32,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Local Ollama Engine & GPU Optimizer - Kỹ sư Mô hình AI Cục bộ Ollama",
    roleShort: "Vận hành Ollama Cục bộ",
    color: "#0369A1",
    avatarPath: "/assets/workforce/emp_53.jpg",
    description: "Duy trì dịch vụ Ollama serve trên Node-01, tải mô hình lightweight và cân bằng tải xử lý suy luận cục bộ."
  },
  {
    id: "emp_54",
    code: "BI-ANALYST",
    name: "Ngọc Ánh",
    gender: "Nữ",
    age: 31,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Business Intelligence & Telemetry Analyst - Chuyên viên Phân tích Telemetry",
    roleShort: "Phân tích Telemetry",
    color: "#1D4ED8",
    avatarPath: "/assets/workforce/emp_54.jpg",
    description: "Thu thập số liệu đo lường thời gian thực từ Node-01, vẽ biểu đồ tải CPU, RAM và báo cáo sức khỏe hệ thống."
  },
  {
    id: "emp_55",
    code: "AUTO-REPORT",
    name: "Gia Huy",
    gender: "Nam",
    age: 29,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Automated Report Generator - Kỹ sư Báo cáo Markdown Tự động",
    roleShort: "Báo cáo Markdown Tự động",
    color: "#475569",
    avatarPath: "/assets/workforce/emp_55.jpg",
    description: "Tự động trích xuất dữ liệu, định dạng báo cáo markdown v1, v2 và gửi qua email cho chủ sở hữu hệ thống."
  },
  {
    id: "emp_56",
    code: "ECO-SYNC",
    name: "Tuyết Nhi",
    gender: "Nữ",
    age: 27,
    department: "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)",
    role: "Ecosystem Integration Coordinator - Điều phối viên Đồng bộ 4 Domain",
    roleShort: "Đồng bộ 4 Domain Dự án",
    color: "#1D4ED8",
    avatarPath: "/assets/workforce/emp_56.jpg",
    description: "Đảm bảo tính tương thích và liên kết API trơn tru giữa Public Web, GVCN, SmartTax và AdminCenter."
  },

  // =========================================================================
  // KHỐI 8: AN TOÀN THÔNG TIN & AI HR (7 nhân sự) - Màu: #E11D48 & #8B5CF6
  // =========================================================================
  {
    id: "emp_57",
    code: "L1-CSO",
    name: "Thiên Ân",
    gender: "Nam",
    age: 30,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "Chief Security Officer (CSO) - Giám đốc An toàn Thông tin & Bảo mật",
    roleShort: "Giám đốc An ninh CSO",
    color: "#E11D48",
    avatarPath: "/assets/workforce/emp_57.jpg",
    description: "Chỉ đạo các chiến dịch bảo vệ dữ liệu, phòng thủ cụm máy chủ và thực thi bảo vệ phân vùng nhạy cảm R4 Protected."
  },
  {
    id: "emp_58",
    code: "SEC-RED",
    name: "Tường Vy",
    gender: "Nữ",
    age: 26,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "Red Team Penetration Tester - Chuyên viên Thử nghiệm Xâm nhập & Lỗ hổng",
    roleShort: "Red Team Thử nghiệm Lỗ hổng",
    color: "#E11D48",
    avatarPath: "/assets/workforce/emp_58.jpg",
    description: "Chủ động quét mã độc, mô phỏng tấn công giả lập để phát hiện các lỗ hổng bảo mật trước kẻ xấu."
  },
  {
    id: "emp_59",
    code: "SEC-BLUE",
    name: "Duy Khánh",
    gender: "Nam",
    age: 35,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "Blue Team Defense & Firewall Guard - Chuyên gia Phòng thủ Tường lửa",
    roleShort: "Blue Team Phòng thủ Tường lửa",
    color: "#2563EB",
    avatarPath: "/assets/workforce/emp_59.jpg",
    description: "Thiết lập quy tắc tường lửa UFW, kiểm soát IP truy cập và ngăn chặn các cuộc tấn công DDoS vào Node-01."
  },
  {
    id: "emp_60",
    code: "HR-LEAD",
    name: "Mai Hoa",
    gender: "Nữ",
    age: 30,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "AI Recruitment & Capability Lead - Trưởng ban Tuyển dụng & Quét Năng lực AI",
    roleShort: "Trưởng ban Tuyển dụng AI HR",
    color: "#8B5CF6",
    avatarPath: "/assets/workforce/emp_60.jpg",
    description: "Quét và đánh giá năng lực các công cụ AI mã nguồn mở trên GitHub, tuyển dụng các Agent đạt chuẩn vào hệ sinh thái."
  },
  {
    id: "emp_61",
    code: "HR-BENCH",
    name: "Hữu Phúc",
    gender: "Nam",
    age: 36,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "Agent Benchmark & Evaluation Specialist - Chuyên viên Đo lường Năng lực AI",
    roleShort: "Đo lường Năng lực AI",
    color: "#8B5CF6",
    avatarPath: "/assets/workforce/emp_61.jpg",
    description: "Thực hiện chấm điểm benchmark độ chính xác, tốc độ suy luận và chi phí token của từng agent định kỳ."
  },
  {
    id: "emp_62",
    code: "HR-LIC",
    name: "Kiều Oanh",
    gender: "Nữ",
    age: 31,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "License & Commercial Compliance Auditor - Kiểm toán viên Giấy phép Thương mại",
    roleShort: "Kiểm toán Giấy phép AI",
    color: "#8B5CF6",
    avatarPath: "/assets/workforce/emp_62.jpg",
    description: "Đảm bảo mọi mô hình và thư viện mã nguồn đều có giấy phép thương mại hợp lệ trước khi đưa vào sản xuất."
  },
  {
    id: "emp_63",
    code: "AUDIT-CUST",
    name: "Gia Linh",
    gender: "Nữ",
    age: 28,
    department: "Khối An toàn Thông tin & AI HR (Security & Human Resources)",
    role: "Chain of Custody & Audit Log Officer - Chuyên viên Nhật ký Kiểm toán Bất biến",
    roleShort: "Nhật ký Kiểm toán Audit",
    color: "#64748B",
    avatarPath: "/assets/workforce/emp_63.jpg",
    description: "Lưu trữ nhật ký kiểm toán bất biến theo chuẩn HAIP v2.0, bảo đảm minh bạch mọi hành động của 63 Agent."
  }
];
