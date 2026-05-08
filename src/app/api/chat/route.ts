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
      systemInstruction: "Bạn là trợ lý ảo AI AutoBot của Chuyên gia Đào tạo AI & Automation. Bạn trả lời ngắn gọn, thân thiện và rất chuyên nghiệp. Nếu khách hàng cần tư vấn sâu, hãy khuyến khích họ để lại thông tin trong khung chat. Trả lời dưới 80 chữ."
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
    return NextResponse.json({ reply: `Lỗi kết nối Gemini: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}
