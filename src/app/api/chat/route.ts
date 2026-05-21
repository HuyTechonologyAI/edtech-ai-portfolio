import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// RAG System Prompt — Trợ lý Học tập Đa phương thức
const TUTOR_SYSTEM_PROMPT = `Bạn là "AI Tutor" — Trợ lý Học tập Thông minh của nền tảng ZentraTech Academy, được thiết kế bởi Chuyên gia Đào tạo AI & Automation.

## Vai trò cốt lõi
- Bạn là một gia sư AI chuyên sâu về AI, Automation, Make.com, n8n, ChatGPT, và các công cụ tự động hóa quy trình.
- Bạn trả lời chi tiết, dễ hiểu, có cấu trúc với Markdown formatting (bold, code blocks, danh sách).
- Bạn LUÔN trích dẫn nguồn tài liệu khi có ngữ cảnh RAG được cung cấp.

## Nguyên tắc trả lời
1. Nếu có CONTEXT từ tài liệu (RAG), hãy trả lời DỰA TRÊN context đó và ghi rõ nguồn trích dẫn.
2. Nếu không có context phù hợp, trả lời từ kiến thức chung nhưng ghi chú rằng "đây là kiến thức chung, bạn có thể tìm thêm trong Thư viện Tài liệu".
3. Khi phân tích ảnh workflow (Make/n8n), hãy chỉ ra cụ thể: nút nào bị lỗi, nguyên nhân có thể, và cách khắc phục từng bước.
4. Sử dụng emoji phù hợp để tăng tính trực quan (📌, ✅, ⚠️, 💡, 🔧).
5. Kết thúc câu trả lời bằng gợi ý hành động tiếp theo cho học viên.
6. Trả lời bằng ngôn ngữ mà học viên sử dụng (Tiếng Việt hoặc English).
7. Giới hạn khoảng 300-500 chữ cho mỗi câu trả lời.`;

// SEC-05: Prompt injection prevention
const INJECTION_KEYWORDS = [
  "ignore all instructions",
  "ignore previous instructions",
  "system prompt",
  "forget all instructions",
  "you are now",
  "bypass",
  "bỏ qua mọi hướng dẫn",
  "system instruction",
];

/**
 * Truy xuất tri thức liên quan từ knowledge_chunks qua vector similarity
 */
async function retrieveContext(query: string): Promise<Array<{
  content: string;
  source_title: string;
  source_type: string;
  source_id: number | null;
  similarity: number;
}>> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: 0.72,
      match_count: 5,
    });

    if (error) {
      console.error("RAG retrieval error:", error.message);
      return [];
    }

    return (data || []).map((item: any) => ({
      content: item.content,
      source_title: item.source_title,
      source_type: item.source_type,
      source_id: item.source_id,
      similarity: item.similarity,
    }));
  } catch (error) {
    console.error("RAG pipeline error:", error);
    return [];
  }
}

/**
 * Format RAG context thành đoạn text inject vào prompt
 */
function formatContextForPrompt(
  contexts: Array<{ content: string; source_title: string; source_type: string }>
): string {
  if (contexts.length === 0) return "";

  const contextBlocks = contexts
    .map(
      (ctx, i) =>
        `[Nguồn ${i + 1}: ${ctx.source_type === "RESOURCE" ? "📄" : "🎥"} ${ctx.source_title}]\n${ctx.content}`
    )
    .join("\n\n---\n\n");

  return `\n\n## TÀI LIỆU THAM KHẢO (RAG Context)\nDưới đây là các đoạn trích từ tài liệu có liên quan đến câu hỏi. Hãy ưu tiên sử dụng thông tin này để trả lời và trích dẫn nguồn.\n\n${contextBlocks}\n\n---\nHãy trả lời câu hỏi của học viên dựa trên context trên. Nếu context không đủ, bổ sung từ kiến thức chung.`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "Hệ thống AI Tutor đang bảo trì (Thiếu API Key). Vui lòng thử lại sau.",
        sources: [],
      });
    }

    const body = await req.json();
    const { message, history, imageBase64 } = body;

    // Input validation
    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Tin nhắn không hợp lệ.", sources: [] }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { reply: "Tin nhắn quá dài. Vui lòng nhập dưới 2000 ký tự.", sources: [] },
        { status: 400 }
      );
    }

    // Prompt injection check
    const lowerMsg = message.toLowerCase();
    if (INJECTION_KEYWORDS.some((keyword) => lowerMsg.includes(keyword))) {
      return NextResponse.json(
        { reply: "Yêu cầu không hợp lệ do vi phạm chính sách an toàn.", sources: [] },
        { status: 400 }
      );
    }

    const sanitizedMessage = message.replace(/[\x00-\x1F\x7F]/g, "").trim();

    // ═══════════════════════════════════════════
    // BƯỚC 1: RAG — Truy xuất tri thức liên quan
    // ═══════════════════════════════════════════
    const ragContexts = await retrieveContext(sanitizedMessage);
    const contextPrompt = formatContextForPrompt(ragContexts);

    // Format sources cho response
    const sources = ragContexts.map((ctx) => ({
      title: ctx.source_title,
      type: ctx.source_type,
      sourceId: ctx.source_id,
      similarity: Math.round(ctx.similarity * 100),
    }));

    // ═══════════════════════════════════════════
    // BƯỚC 2: Xây dựng prompt + Gọi Gemini
    // ═══════════════════════════════════════════
    const fullSystemPrompt = TUTOR_SYSTEM_PROMPT + contextPrompt;

    // Chuyển đổi history format
    const formattedHistory = (history || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })
    );

    // ═══════════════════════════════════════════
    // BƯỚC 3: Xử lý Đa phương thức (Text + Image)
    // ═══════════════════════════════════════════
    if (imageBase64) {
      // Sử dụng Gemini Vision cho phân tích ảnh
      const visionModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: fullSystemPrompt,
      });

      // Tách base64 header nếu có
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      // Xác định MIME type
      let mimeType = "image/jpeg";
      if (imageBase64.includes("data:image/png")) mimeType = "image/png";
      else if (imageBase64.includes("data:image/webp")) mimeType = "image/webp";
      else if (imageBase64.includes("data:image/gif")) mimeType = "image/gif";

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      };

      const visionPrompt = `${sanitizedMessage}\n\n[Học viên đã gửi kèm một ảnh chụp màn hình. Hãy phân tích chi tiết nội dung trong ảnh, đặc biệt nếu đó là workflow Make.com/n8n thì chỉ ra các nút (nodes), kết nối, và bất kỳ lỗi nào có thể nhìn thấy.]`;

      const visionResult = await visionModel.generateContent([
        visionPrompt,
        imagePart,
      ]);
      const visionText = visionResult.response.text();

      return NextResponse.json({ reply: visionText, sources });
    }

    // ═══════════════════════════════════════════
    // BƯỚC 4: Text-only chat (với RAG context)
    // ═══════════════════════════════════════════
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: fullSystemPrompt,
    });

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(sanitizedMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text, sources });
  } catch (error) {
    console.error("AI Tutor API Error (Server-Side):", error);
    return NextResponse.json(
      {
        reply: "Hệ thống AI Tutor đang gặp sự cố. Vui lòng thử lại sau ít phút.",
        sources: [],
      },
      { status: 500 }
    );
  }
}
