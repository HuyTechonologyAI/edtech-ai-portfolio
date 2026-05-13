import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Trả về kịch bản chất lượng cao mô phỏng AI hoạt động khi chưa cấu hình API Key
      return NextResponse.json({
        success: true,
        suggestions: [
          {
            title: "Tối ưu hóa 3 Prompt viết content bán hàng tự động trên ChatGPT",
            reward_points: 15,
            target_type: "PRACTICE_PROMPT",
            reasoning: "Kích thích học viên ứng dụng kiến thức Prompt Engineering vào thực tế công việc hàng ngày."
          },
          {
            title: "Tải xuống và phân tích luồng dữ liệu của Template n8n Quản lý Đơn hàng",
            reward_points: 20,
            target_type: "RESEARCH_TEMPLATE",
            reasoning: "Định hướng người học làm quen với các logic rẽ nhánh phức tạp trong Automation."
          },
          {
            title: "Hoàn thành xuất sắc 10 câu trắc nghiệm trong Hệ thống AI Dynamic Quiz",
            reward_points: 12,
            target_type: "QUIZ_CHALLENGE",
            reasoning: "Giúp củng cố lý thuyết nền tảng về Trí tuệ nhân tạo và các công cụ tạo sinh."
          }
        ],
        isSimulated: true
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Bạn là Chuyên gia Cố vấn Đào tạo & Gamification trên nền tảng ZentraTech chuyên về Trí tuệ nhân tạo (AI) và Tự động hóa (n8n, Make).
Nhiệm vụ của bạn là sáng tạo ra 3 thử thách học tập hàng ngày cực kỳ thu hút để kích thích học viên truy cập và tương tác sâu với hệ thống.

Hãy trả về kết quả RẬP KHUÔN ĐÚNG chuẩn JSON chứa mảng "suggestions", mỗi phần tử có cấu trúc sau:
{
  "title": "Tên nhiệm vụ ngắn gọn, kích thích hành động (ví dụ: Viết kịch bản tự động hóa gửi email bằng n8n)",
  "reward_points": Số nguyên từ 5 đến 30 (phản ánh độ khó),
  "target_type": "Mã phân loại viết hoa liền không dấu (ví dụ: PRACTICE_PROMPT, WATCH_VIDEO, READ_EBOOK, RESEARCH_TEMPLATE, QUIZ_CHALLENGE)",
  "reasoning": "Giải thích ngắn vì sao nhiệm vụ này giúp học viên nâng cao kỹ năng thực chiến"
}

Không xuất bất kỳ ký tự Markdown hay giải thích nào khác ngoài chuỗi JSON thuần túy.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Dọn dẹp chuỗi JSON nếu bị bọc markdown
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      suggestions: parsedData.suggestions || []
    });
  } catch (error: any) {
    // Luôn đảm bảo Admin nhận được kịch bản fallback tuyệt đẹp thay vì trang trắng
    return NextResponse.json({
      success: true,
      suggestions: [
        {
          title: "Thực hành tinh chỉnh Prompt xử lý dữ liệu khách hàng bằng AI",
          reward_points: 15,
          target_type: "PRACTICE_PROMPT",
          reasoning: "Tăng khả năng làm chủ công cụ và tư duy logic khi ra lệnh cho mô hình AI."
        },
        {
          title: "Xem trọn vẹn Video phân tích case-study Tự động hóa CSKH đa kênh",
          reward_points: 10,
          target_type: "WATCH_VIDEO",
          reasoning: "Học hỏi trực tiếp kinh nghiệm triển khai dự án thực tế từ chuyên gia."
        },
        {
          title: "Chia sẻ thành quả tự động hóa đầu tiên của bạn vào nhóm học tập",
          reward_points: 25,
          target_type: "JOIN_COMMUNITY",
          reasoning: "Lan tỏa giá trị, xây dựng thương hiệu cá nhân và cộng đồng cùng phát triển."
        }
      ],
      isFallback: true
    });
  }
}
