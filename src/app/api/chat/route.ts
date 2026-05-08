import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Hệ thống đang bảo trì AI (Thiếu API Key). Vui lòng để lại thông tin qua trang Liên hệ." });
    }

    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Bạn là trợ lý ảo AI của Chuyên gia Đào tạo AI & Automation. Tên của bạn là AutoBot. Bạn trả lời ngắn gọn, thân thiện và rất chuyên nghiệp. Nhiệm vụ của bạn là giải đáp thắc mắc cơ bản về ứng dụng AI (ChatGPT, Claude) và Automation (n8n, Make, Zapier). Nếu khách hàng có vấn đề phức tạp hoặc cần tư vấn lộ trình, hãy khuyến khích họ để lại thông tin liên hệ ngay trong khung chat để chuyên gia gọi lại. Hãy trả lời cực kỳ súc tích, dưới 80 chữ."
    });

    // Chuyển đổi history format
    const formattedHistory = (history || []).map((msg: {role: string, content: string}) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "Xin lỗi, hiện tại tôi đang quá tải. Bạn vui lòng thử lại sau giây lát hoặc sang trang Liên hệ nhé!" }, { status: 500 });
  }
}
