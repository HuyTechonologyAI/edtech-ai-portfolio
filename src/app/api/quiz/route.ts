import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro"
    });

    const prompt = "Bạn là một chuyên gia ra đề thi trắc nghiệm về AI và Automation. Hãy tạo 5 câu hỏi trắc nghiệm (mỗi câu có đúng 4 đáp án, chỉ có 1 đáp án đúng) về chủ đề Trí Tuệ Nhân Tạo (AI) và Tự động hóa doanh nghiệp (n8n, Make, Zapier, ChatGPT). \nYÊU CẦU BẮT BUỘC: Trả về ĐÚNG 1 mảng JSON hợp lệ, KHÔNG chứa markdown block (như ```json), KHÔNG chứa bất kỳ văn bản nào khác. Định dạng mẫu: [{\"id\": 1, \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": 0}]";

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean markdown if AI still outputs it
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz API Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
