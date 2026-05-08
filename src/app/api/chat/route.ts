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
    try {
      // Tự động dò tìm các model được hỗ trợ nếu model hiện tại bị lỗi
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
      const modelsData = await modelsRes.json();
      const availableModels = modelsData.models?.map((m: any) => m.name.replace('models/', '')).join(", ") || "Không có model nào";
      return NextResponse.json({ reply: `API Key của bạn chỉ hỗ trợ các Model sau: ${availableModels}. Vui lòng báo cho lập trình viên để cập nhật lại tên Model. Lỗi gốc: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    } catch (fetchError) {
      return NextResponse.json({ reply: `Lỗi kết nối Gemini: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
  }
}
