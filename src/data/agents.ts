export type AgentState = "idle" | "running" | "success" | "waiting" | "error";

export interface AIAgent {
  id: string;
  name: string; // Tên người Việt 2 chữ (Mai Anh, Quang Huy,...)
  title: string; // Chức danh chuyên môn (AI Tổng điều phối,...)
  role: string;
  gender: "Nam" | "Nữ";
  age: number;
  category: "Quản trị và chiến lược" | "Sản xuất nội dung và Marketing" | "Kinh doanh và khách hàng" | "Phân tích và vận hành tự động";
  color: string;
  avatarPath: string;
  description: string;
}

export const AGENT_CATEGORIES = [
  "Quản trị và chiến lược",
  "Sản xuất nội dung và Marketing",
  "Kinh doanh và khách hàng",
  "Phân tích và vận hành tự động",
];

export const AI_AGENTS: AIAgent[] = [
  // Nhóm A — Quản trị và chiến lược
  {
    id: "01_supervisor",
    name: "Mai Anh",
    title: "AI Tổng điều phối",
    role: "supervisor",
    gender: "Nữ",
    age: 35,
    category: "Quản trị và chiến lược",
    color: "#4F46E5",
    avatarPath: "/assets/agents/01_supervisor.jpg",
    description: "Nhà quản lý, vest xanh thanh lịch, biểu tượng mạng kết nối. Phân công, giám sát và phối hợp các Agent."
  },
  {
    id: "02_research",
    name: "Quang Huy",
    title: "AI Nghiên cứu",
    role: "research",
    gender: "Nam",
    age: 28,
    category: "Quản trị và chiến lược",
    color: "#2563EB",
    avatarPath: "/assets/agents/02_research.jpg",
    description: "Chuyên viên đeo kính tròn, kính lúp, áo len. Nghiên cứu thị trường, đối thủ, xu hướng và dữ liệu."
  },
  {
    id: "03_planning",
    name: "Như Hoa",
    title: "AI Lập kế hoạch",
    role: "planning",
    gender: "Nữ",
    age: 32,
    category: "Quản trị và chiến lược",
    color: "#7C3AED",
    avatarPath: "/assets/agents/03_planning.jpg",
    description: "Chuyên gia chiến lược với bảng kế hoạch, smart casual. Xây dựng chiến lược, lịch trình, kế hoạch chiến dịch."
  },
  {
    id: "04_knowledge",
    name: "Hữu Hùng",
    title: "AI Quản lý tri thức",
    role: "knowledge",
    gender: "Nam",
    age: 40,
    category: "Quản trị và chiến lược",
    color: "#0F766E",
    avatarPath: "/assets/agents/04_knowledge.jpg",
    description: "Chuyên viên nghiên cứu với sách/tài liệu số, business casual. Truy xuất tài liệu, RAG, kho kiến thức."
  },
  {
    id: "05_approval",
    name: "Thanh Trúc",
    title: "AI Kiểm duyệt",
    role: "approval",
    gender: "Nữ",
    age: 30,
    category: "Quản trị và chiến lược",
    color: "#64748B",
    avatarPath: "/assets/agents/05_approval.jpg",
    description: "Chuyên viên kiểm soát, vest công sở, huy hiệu kiểm duyệt. Kiểm tra chất lượng, tuân thủ quy tắc."
  },

  // Nhóm B — Sản xuất nội dung và Marketing
  {
    id: "06_outline",
    name: "Minh Triết",
    title: "AI Xây dựng dàn ý",
    role: "outline",
    gender: "Nam",
    age: 24,
    category: "Sản xuất nội dung và Marketing",
    color: "#9333EA",
    avatarPath: "/assets/agents/06_outline.jpg",
    description: "Biên kịch với sổ tay, áo sơ mi sọc trẻ trung. Xây dựng cấu trúc bài viết, video và lịch nội dung."
  },
  {
    id: "07_content",
    name: "Bảo Ngọc",
    title: "AI Viết nội dung",
    role: "content",
    gender: "Nữ",
    age: 26,
    category: "Sản xuất nội dung và Marketing",
    color: "#DB2777",
    avatarPath: "/assets/agents/07_content.jpg",
    description: "Người viết sáng tạo, khăn quàng nghệ thuật, bút và tài liệu. Viết bài social, quảng cáo, email."
  },
  {
    id: "08_design",
    name: "Đức Anh",
    title: "AI Thiết kế đồ họa",
    role: "design",
    gender: "Nam",
    age: 23,
    category: "Sản xuất nội dung và Marketing",
    color: "#EA580C",
    avatarPath: "/assets/agents/08_design.svg",
    description: "Nhà thiết kế sáng tạo với bảng màu pha sắc. Thiết kế banner, infographic, nhận diện thương hiệu."
  },
  {
    id: "09_image",
    name: "Khánh Linh",
    title: "AI Tạo hình ảnh",
    role: "image",
    gender: "Nữ",
    age: 25,
    category: "Sản xuất nội dung và Marketing",
    color: "#F59E0B",
    avatarPath: "/assets/agents/09_image.svg",
    description: "Họa sĩ số với khung ảnh nghệ thuật. Tạo hình minh họa, sản phẩm, hình marketing bằng AI."
  },
  {
    id: "10_video",
    name: "Tuấn Kiệt",
    title: "AI Sản xuất video",
    role: "video",
    gender: "Nam",
    age: 30,
    category: "Sản xuất nội dung và Marketing",
    color: "#DC2626",
    avatarPath: "/assets/agents/10_video.svg",
    description: "Nhà sản xuất năng động với máy quay phim. Viết kịch bản hình ảnh, hỗ trợ tạo và biên tập video."
  },
  {
    id: "11_publishing",
    name: "Hải Yến",
    title: "AI Đăng bài đa kênh",
    role: "publishing",
    gender: "Nữ",
    age: 28,
    category: "Sản xuất nội dung và Marketing",
    color: "#0284C7",
    avatarPath: "/assets/agents/11_publishing.svg",
    description: "Chuyên viên truyền thông với biểu tượng phát sóng. Lên lịch và đăng nội dung tự động qua các nền tảng."
  },
  {
    id: "12_marketing",
    name: "Hoàng Nam",
    title: "AI Marketing",
    role: "marketing",
    gender: "Nam",
    age: 34,
    category: "Sản xuất nội dung và Marketing",
    color: "#C026D3",
    avatarPath: "/assets/agents/12_marketing.svg",
    description: "Chuyên gia Marketing với biểu tượng loa phóng thanh. Quản lý chiến dịch, tối ưu quảng cáo, SEO."
  },

  // Nhóm C — Kinh doanh và khách hàng
  {
    id: "13_leadgen",
    name: "Phương Thảo",
    title: "AI Tìm kiếm khách hàng",
    role: "leadgen",
    gender: "Nữ",
    age: 29,
    category: "Kinh doanh và khách hàng",
    color: "#CA8A04",
    avatarPath: "/assets/agents/13_leadgen.svg",
    description: "Chuyên viên phát triển kinh doanh với mục tiêu tâm ngắm. Tìm kiếm, phân loại và đánh giá khách hàng tiềm năng."
  },
  {
    id: "14_sales",
    name: "Quốc Bảo",
    title: "AI Tư vấn bán hàng",
    role: "sales",
    gender: "Nam",
    age: 33,
    category: "Kinh doanh và khách hàng",
    color: "#16A34A",
    avatarPath: "/assets/agents/14_sales.svg",
    description: "Nhân viên kinh doanh lịch lãm, cà vạt công sở. Tư vấn sản phẩm, gợi ý báo giá, hỗ trợ chốt giao dịch."
  },
  {
    id: "15_crm",
    name: "Thùy Dung",
    title: "AI Quản lý khách hàng",
    role: "crm",
    gender: "Nữ",
    age: 27,
    category: "Kinh doanh và khách hàng",
    color: "#0D9488",
    avatarPath: "/assets/agents/15_crm.svg",
    description: "Chuyên viên quan hệ khách hàng với danh bạ kết nối. Quản lý dữ liệu khách hàng và lịch sử tương tác."
  },
  {
    id: "16_support",
    name: "Trọng Nghĩa",
    title: "AI Chăm sóc khách hàng",
    role: "support",
    gender: "Nam",
    age: 25,
    category: "Kinh doanh và khách hàng",
    color: "#0891B2",
    avatarPath: "/assets/agents/16_support.svg",
    description: "Nhân viên hỗ trợ thân thiện đeo tai nghe headset. Tiếp nhận yêu cầu, soạn phản hồi và chuyển tiếp sự cố."
  },

  // Nhóm D — Phân tích và vận hành tự động
  {
    id: "17_analytics",
    name: "Ngọc Ánh",
    title: "AI Phân tích dữ liệu",
    role: "analytics",
    gender: "Nữ",
    age: 31,
    category: "Phân tích và vận hành tự động",
    color: "#1D4ED8",
    avatarPath: "/assets/agents/17_analytics.svg",
    description: "Chuyên gia dữ liệu đeo kính trí thức với biểu đồ tăng trưởng. Phân tích KPI, dữ liệu chiến dịch, doanh thu."
  },
  {
    id: "18_reporting",
    name: "Gia Huy",
    title: "AI Báo cáo",
    role: "reporting",
    gender: "Nam",
    age: 29,
    category: "Phân tích và vận hành tự động",
    color: "#475569",
    avatarPath: "/assets/agents/18_reporting.svg",
    description: "Chuyên viên báo cáo với tập hồ sơ dữ liệu số. Tổng hợp báo cáo ngày, tuần, tháng và dashboard tổng quan."
  },
  {
    id: "19_finance",
    name: "Kim Ngân",
    title: "AI Tài chính",
    role: "finance",
    gender: "Nữ",
    age: 38,
    category: "Phân tích và vận hành tự động",
    color: "#15803D",
    avatarPath: "/assets/agents/19_finance.svg",
    description: "Chuyên gia tài chính với máy tính bảng tài chính. Theo dõi doanh thu, chi phí, lợi nhuận và cảnh báo rủi ro."
  },
  {
    id: "20_automation",
    name: "Thành Đạt",
    title: "AI Tự động hóa",
    role: "automation",
    gender: "Nam",
    age: 28,
    category: "Phân tích và vận hành tự động",
    color: "#0369A1",
    avatarPath: "/assets/agents/20_automation.svg",
    description: "Kỹ sư hệ thống với biểu tượng bánh răng truyền động. Điều phối workflow, API, webhook và tự động hóa tác vụ."
  }
];
