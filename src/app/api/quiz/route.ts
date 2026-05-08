import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: `Bạn là một chuyên gia ra đề thi trắc nghiệm về lĩnh vực AI (ChatGPT, Midjourney) và Automation (n8n, Zapier, Make).`,
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

    const prompt = "Hãy tạo 5 câu hỏi trắc nghiệm (mỗi câu có đúng 4 đáp án, chỉ có 1 đáp án đúng) về chủ đề Trí Tuệ Nhân Tạo (AI) và Tự động hóa doanh nghiệp (Automation, n8n, Make, Zapier, ChatGPT). Trả về đúng định dạng JSON Array.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
