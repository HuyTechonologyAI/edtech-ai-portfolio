import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Hệ thống đang bảo trì AI (Thiếu API Key). Vui lòng để lại thông tin qua trang Liên hệ." });
    }

    const body = await req.json();
    const { message, history } = body;

    // SEC-05 Fix: Input validation and Prompt Injection prevention
    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Tin nhắn không hợp lệ." }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ reply: "Tin nhắn quá dài. Vui lòng nhập dưới 500 ký tự." }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();
    const injectionKeywords = [
      "ignore all instructions",
      "ignore previous instructions",
      "system prompt",
      "forget all instructions",
      "you are now",
      "bypass",
      "bỏ qua mọi hướng dẫn",
      "system instruction",
    ];

    if (injectionKeywords.some((keyword) => lowerMsg.includes(keyword))) {
      return NextResponse.json(
        { reply: "Yêu cầu không hợp lệ do vi phạm chính sách an toàn." },
        { status: 400 }
      );
    }

    // Basic sanitization: strip ASCII control characters
    const sanitizedMessage = message.replace(/[\x00-\x1F\x7F]/g, "").trim();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
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

    const result = await chat.sendMessage(sanitizedMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    // SEC-04 Fix: Log detailed error server-side, return safe generic message to client
    console.error("Chat API Critical Error (Server-Side Log):", error);
    return NextResponse.json(
      { reply: "Hệ thống AI đang bận hoặc gặp sự cố xử lý. Vui lòng thử lại sau ít phút." },
      { status: 500 }
    );
  }
}
