import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const body = await req.json();
    const { topic } = body;

    // SEC-05 Fix: Validate topic input to prevent prompt injection
    if (topic && typeof topic === "string") {
      if (topic.length > 200) {
        return NextResponse.json({ error: "Chủ đề quá dài. Vui lòng nhập dưới 200 ký tự." }, { status: 400 });
      }

      const lowerTopic = topic.toLowerCase();
      const injectionKeywords = [
        "ignore",
        "bypass",
        "system prompt",
        "instruction",
        "bỏ qua",
        "forget",
        "override",
      ];

      if (injectionKeywords.some((kw) => lowerTopic.includes(kw))) {
        return NextResponse.json({ error: "Chủ đề chứa nội dung không hợp lệ." }, { status: 400 });
      }
    }

    const userTopic = topic && typeof topic === "string" && topic.trim() !== "" 
      ? topic.replace(/[\x00-\x1F\x7F]/g, "").trim() 
      : "Trí Tuệ Nhân Tạo (AI) và Tự động hóa doanh nghiệp";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Bạn là một chuyên gia đào tạo AI & Automation xuất sắc. Dựa vào các kiến thức chuyên môn về công nghệ, bạn sẽ ra đề thi trắc nghiệm để kiểm tra kiến thức của học viên.`,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.NUMBER },
              question: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING }
              },
              correctAnswer: { type: SchemaType.NUMBER, description: "Index of the correct option (0-3)" },
            },
            required: ["id", "question", "options", "correctAnswer"]
          }
        }
      }
    });

    const prompt = `Hãy tạo 5 câu hỏi trắc nghiệm (mỗi câu có đúng 4 đáp án, chỉ có 1 đáp án đúng) về chủ đề: "${userTopic}". Trả về đúng định dạng JSON Array. Đảm bảo các câu hỏi mang tính thực tế, ứng dụng cao và phù hợp với người học công nghệ.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(cleanText);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Quiz API Error (Server-side log):", error);
    return NextResponse.json({ error: "Hệ thống không thể tạo câu hỏi lúc này. Vui lòng thử lại sau." }, { status: 500 });
  }
}
