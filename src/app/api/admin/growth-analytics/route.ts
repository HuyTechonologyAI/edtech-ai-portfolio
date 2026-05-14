import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to verify admin session
function isAuthenticatedAdmin(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Generate dynamic, visually rich sample data for Daily and Monthly Growth Metrics
  // To allow full dashboard demonstration without requiring actual real-time payment gateway hookups
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const dailyTraffic = [1250, 1420, 1850, 1600, 2100, 2450, 1980];
  const dailyRevenue = [4500000, 5200000, 7800000, 6100000, 9500000, 12500000, 8900000]; // VNĐ

  const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];
  const monthlyTraffic = [28500, 32000, 45200, 51000, 64500, 72000];
  const monthlyRevenue = [125000000, 145000000, 210000000, 245000000, 315000000, 380000000]; // VNĐ

  // Funnel drop-off statistics
  const funnelStages = [
    { stage: "1. Truy cập Trang đích (Landing Views)", count: 72000, dropoff: "0%", color: "from-blue-500/20 to-cyan-500/20", text: "text-cyan-400" },
    { stage: "2. Tương tác Xem Thử (Resources/Videos)", count: 45000, dropoff: "-37.5%", color: "from-cyan-500/20 to-emerald-500/20", text: "text-emerald-400" },
    { stage: "3. Bấm Đăng ký / Nút Mua Premium", count: 12500, dropoff: "-72.2%", color: "from-amber-500/20 to-orange-500/20", text: "text-amber-400" },
    { stage: "4. Thanh toán Thành công (Converted)", count: 3800, dropoff: "-69.6%", color: "from-rose-500/20 to-purple-500/20", text: "text-rose-400" },
  ];

  return NextResponse.json({
    success: true,
    metrics: {
      daily: { labels: days, traffic: dailyTraffic, revenue: dailyRevenue },
      monthly: { labels: months, traffic: monthlyTraffic, revenue: monthlyRevenue },
      funnel: funnelStages,
      summary: {
        totalTrafficMonth: 72000,
        totalRevenueMonth: 380000000,
        conversionRate: 5.28, // %
        growthRate: "+18.5%",
      }
    }
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY chưa được cấu hình trong hệ thống");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Bạn là Cố vấn Tăng trưởng (Growth Hacker) kiêm Chuyên gia Phân tích Dữ liệu Kinh doanh cao cấp cho nền tảng ZentraTech EdTech & MMO SaaS.
Dưới đây là bộ số liệu đo lường phễu bán hàng và lưu lượng truy cập thực tế trong tháng qua:
- Lưu lượng truy cập tháng: 72,000 lượt (tăng 18.5%)
- Tỷ lệ rớt phễu: Từ Lượt xem thử (45,000) xuống Bấm Nút Mua/Đăng ký (12,500) rớt 72.2%.
- Tổng doanh thu tháng: 380,000,000 VNĐ (Chuyển đổi thành công: 3,800 đơn hàng/đăng ký).
- Xu hướng lan truyền (Viral share): Chứng chỉ động Landscape được chia sẻ 450 lần trên LinkedIn/Facebook.

Hãy phân tích chuyên sâu các điểm nghẽn kinh doanh và đề xuất chiến lược tối ưu hóa doanh thu sát với nhu cầu thực tế của người dùng.
Xuất ra kết quả dưới dạng chuỗi JSON thuần túy (không bọc trong \`\`\`json, không chứa markdown thừa) theo cấu trúc chính xác sau:
{
  "bottlenecks": [
    { "title": "Tên điểm nghẽn", "severity": "Nghiêm trọng / Cần lưu ý", "analysis": "Mô tả nguyên nhân khiến học viên rớt phễu ở khâu này" }
  ],
  "strategies": [
    { "title": "Tên chiến lược", "impact": "Tăng trưởng Doanh thu Khả thi (+15% - 30%)", "details": "Các bước thực thi chi tiết (Ví dụ: Thêm đếm ngược Flash Sale, tự động hóa gửi email nhắc nhở, tạo bundle combo)" }
  ],
  "actionItems": [
    "Hành động cụ thể 1",
    "Hành động cụ thể 2",
    "Hành động cụ thể 3"
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const strategyReport = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, strategy: strategyReport });
  } catch (error: any) {
    console.error("Growth Analytics AI fallback triggered:", error);
    
    // Trả về dữ liệu chiến lược mẫu cao cấp nếu chưa cấu hình API Key
    const fallbackStrategy = {
      bottlenecks: [
        {
          title: "Tỷ lệ thoát cao ở khâu Cân nhắc Mua Gói Premium (Drop-off 72.2%)",
          severity: "Nghiêm trọng",
          analysis: "Học viên xem tài liệu và video dùng thử rất tích cực (45,000 lượt) nhưng thiếu cú hích (Urgency/Scarcity) để đưa ra quyết định bấm nút thanh toán ngay lập tức."
        },
        {
          title: "Chưa tận dụng hết tệp User chia sẻ Chứng chỉ MXH",
          severity: "Cần lưu ý",
          analysis: "Có 450 lượt chia sẻ văn bằng xác thực lên LinkedIn/Facebook mang lại hàng ngàn lượt click tự nhiên, nhưng landing page chưa có cơ chế chào mừng riêng (Personalized Greeting) cho luồng truy cập giới thiệu này."
        }
      ],
      strategies: [
        {
          title: "Tự động hóa chuỗi Email Upsell & Khóa học Gợi ý theo AI",
          impact: "Dự kiến Tăng +22% Doanh thu",
          details: "Kích hoạt kịch bản theo dõi ngầm: Nếu user xem hết 100% tiến độ video mà chưa mua tài liệu đính kèm, gửi email tặng mã giảm giá tự động 20% có thời hạn 24 giờ thông qua n8n webhook."
        },
        {
          title: "Chiến dịch 'Viral loop Premium Unlock'",
          impact: "Dự kiến Tăng +35% Traffic & Chuyển đổi",
          details: "Tích hợp tính năng: Học viên chia sẻ thành công chứng chỉ lên MXH kèm hashtag quy định sẽ tự động được mở khóa 1 Workflow Premium độc quyền trị giá $49, kích thích lan tỏa theo cấp số nhân."
        },
        {
          title: "Bổ sung gói Combo Thanh toán Trọn đời (Lifetime Deal - LTD)",
          impact: "Dự kiến Tăng +15% Giá trị trung bình đơn (AOV)",
          details: "Tạo thêm tùy chọn thanh toán trọn đời cho toàn bộ kho tài nguyên Make/n8n/Prompt thay vì chỉ trả phí lẻ từng file, đánh trúng tâm lý thích sở hữu vĩnh viễn của tệp khách hàng MMO."
        }
      ],
      actionItems: [
        "Thiết lập bộ đếm ngược Flash Sale ngẫu nhiên trên trang Bảng giá (/pricing) cho các lượt truy cập lần thứ 3 trở lên.",
        "Tạo popup chào mừng riêng tặng Ebook Miễn phí cho luồng Traffic đến từ các liên kết chia sẻ LinkedIn của cựu học viên.",
        "Tối ưu hóa tốc độ tải trang đích bán hàng trên giao diện Mobile để giảm thêm 5% tỷ lệ thoát trang sớm."
      ]
    };

    return NextResponse.json({
      success: true,
      strategy: fallbackStrategy,
      isFallback: true,
      errorMsg: error.message
    });
  }
}
