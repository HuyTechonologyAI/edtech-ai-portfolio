import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const { topic } = await req.json();
    const userTopic = topic && topic.trim() !== "" ? topic : "Trí Tuệ Nhân Tạo (AI) và Tự động hóa doanh nghiệp";

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
    console.error("Quiz API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
}
