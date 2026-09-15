import { NextRequest, NextResponse } from "next/server";
import { dispatchAiCompletion, AI_PROVIDERS, GatewayResult } from "@/lib/ai-gateway";
import { OPEN_SOURCE_AI_TOOLS } from "@/lib/ai-tools-registry";

// CORS configuration for cross-ecosystem calls from gvcncdsai.io.vn and smarttax-ai.vercel.app
const ALLOWED_ORIGINS = [
  "https://gvcncdsai.io.vn",
  "https://smarttax-ai.vercel.app",
  "https://huycncdsai.io.vn",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ecosystem-source, x-api-key",
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");

  // Health check & status of all AI providers and tool cluster
  return NextResponse.json({
    status: "online",
    hubName: "Huy Technology Central AI Hub",
    ecosystemReady: true,
    providers: AI_PROVIDERS.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      model: p.model,
      priority: p.priority,
      enabled: p.enabled,
      status: p.status,
      latencyMs: p.latencyMs,
      totalRequests: p.totalRequests,
      failedRequests: p.failedRequests,
    })),
    toolsCount: OPEN_SOURCE_AI_TOOLS.length,
    toolsSummary: {
      slideTools: OPEN_SOURCE_AI_TOOLS.filter(t => t.category === "slide").map(t => t.name),
      imageTools: OPEN_SOURCE_AI_TOOLS.filter(t => t.category === "image").map(t => t.name),
      videoTools: OPEN_SOURCE_AI_TOOLS.filter(t => t.category === "video").map(t => t.name),
      voiceTools: OPEN_SOURCE_AI_TOOLS.filter(t => t.category === "voice").map(t => t.name),
    },
    quotaPolicy: "Intelligent Cascading Failover (Gemini -> Ollama Local -> Groq/OpenAI -> Heuristic Engine)"
  }, {
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();
    const { action = "completion", prompt, systemPrompt, subject, duration, targetAudience, lessonTopic } = body;

    // --- Action 1: Generic Completion with Quota Failover ---
    if (action === "completion") {
      if (!prompt) {
        return NextResponse.json({ error: "Missing 'prompt' in request body" }, { status: 400, headers: getCorsHeaders(origin) });
      }

      const result: GatewayResult = await dispatchAiCompletion(prompt, {
        systemPrompt: systemPrompt || "Bạn là AI Hub trung tâm của hệ sinh thái Huy Technology AI (Vạn Hỏa Long Tech). Trả lời chuyên nghiệp, đầy đủ, tiếng Việt chuẩn.",
      });

      return NextResponse.json({
        success: true,
        text: result.text,
        meta: {
          providerUsed: result.providerUsed,
          providerName: result.providerName,
          latencyMs: result.latencyMs,
          failoversOccurred: result.failoversOccurred,
        }
      }, { headers: getCorsHeaders(origin) });
    }

    // --- Action 2: Studio Pipeline 1-Chạm (All-in-One Studio Package) ---
    if (action === "generate_studio_package") {
      const topic = lessonTopic || prompt || "Nguyên lý hoạt động của Động cơ Đốt trong 4 kỳ";
      const dur = duration || "45 phút";
      const audience = targetAudience || "Học sinh / Người học thực chiến";
      const subj = subject || "Công nghệ - Kỹ thuật";

      const studioSystemPrompt = `Bạn là Trưởng nhóm Điều phối AI Studio của Huy Technology AI Hub (sáng lập bởi Chuyên gia AI Ngô Quốc Huy).
Nhiệm vụ của bạn là nhận chủ đề bài học và xuất ra một cấu trúc JSON hợp lệ CHÍNH XÁC bao gồm:
1. "lessonPlan": Tóm tắt kế hoạch bài dạy chuẩn CV 5512 (4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
2. "marpSlideCode": Mã nguồn Markdown chuẩn Marp để xuất PowerPoint .pptx đẹp mắt (gồm 4-6 slide, chia trang bằng "---", có style dark gaia, màu neon #00ff85).
3. "comfyUiPrompts": Mảng 4 prompt tiếng Anh chi tiết cao cho ComfyUI/InvokeAI để sinh hình minh họa từng phần (VD: nạp, nén, nổ, xả hoặc sơ đồ khối kỹ thuật).
4. "vietTtsScript": Đoạn kịch bản lời thoại đọc mẫu truyền cảm, chia từng câu rõ ràng để đưa vào VietTTS / Piper.
5. "moneyPrinterTurboStoryboard": Mảng các phân cảnh cho MoneyPrinterTurbo gồm { scene: number, durationSec: number, script: string, visualKeyword: string } để tìm footage và render video MP4 tự động.
6. "sadTalkerTeacherScript": Đoạn lời chào mở đầu 30 giây cho Avatar thầy giáo AI ảo giảng bài.

LƯU Ý: Phản hồi thuần chuỗi JSON không có văn bản giải thích thừa bên ngoài. Bắt đầu bằng { và kết thúc bằng }.`;

      const studioUserPrompt = `Hãy tạo trọn bộ học liệu số cho bài học:
- Tên bài: "${topic}"
- Môn / Lĩnh vực: ${subj}
- Thời lượng: ${dur}
- Đối tượng: ${audience}

Tạo trọn bộ: Slide Marp PPTX + Giáo án CV 5512 + 4 Prompt ảnh ComfyUI + Kịch bản VietTTS + Storyboard MoneyPrinterTurbo + Script Avatar SadTalker.`;

      const result = await dispatchAiCompletion(studioUserPrompt, {
        systemPrompt: studioSystemPrompt,
      });

      // Parse JSON response safely
      let parsedPackage: any = null;
      try {
        let cleanJson = result.text.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
        }
        parsedPackage = JSON.parse(cleanJson);
      } catch (e) {
        // Fallback structured package nếu AI sinh chuỗi Markdown
        parsedPackage = {
          topic,
          marpSlideCode: result.text.includes("marp: true") ? result.text : `---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0f172a
color: #f8fafc
---

# ${topic.toUpperCase()}
## Hệ sinh thái Huy Technology AI Hub
Chuyên gia AI: Ngô Quốc Huy

---

## 1. MỤC TIÊU BÀI HỌC
- Nắm vững kiến thức trọng tâm về ${topic}
- Ứng dụng quy trình tự động hóa giải quyết vấn đề

---

## 2. NỘI DUNG CHI TIẾT
- Khái niệm và cấu tạo
- Nguyên lý vận hành và ứng dụng thực tiễn`,
          lessonPlan: `Kế hoạch bài dạy chuẩn CV 5512 cho bài: ${topic}. Thời lượng: ${dur}.`,
          comfyUiPrompts: [
            `Technical mechanical diagram of ${topic}, engineering blueprint, 8k resolution, photorealistic, octane render`,
            `Close-up high-tech components of ${topic}, volumetric studio lighting, clear details, 3d rendering`,
            `Cross section view explaining internal mechanism of ${topic}, informative illustration, crisp vector lines`,
            `Real world industrial application of ${topic} in smart automation factory, cinematic wide shot`
          ],
          vietTtsScript: `Chào các bạn học viên, hôm nay Chuyên gia AI Ngô Quốc Huy và Huy Technology AI Hub sẽ cùng các bạn khám phá bài học: ${topic}. Chúng ta sẽ đi từ nguyên lý cơ bản đến các giải pháp ứng dụng thực tế.`,
          moneyPrinterTurboStoryboard: [
            { scene: 1, durationSec: 5, script: `Giới thiệu bài học ${topic}`, visualKeyword: "engineering technology" },
            { scene: 2, durationSec: 15, script: `Phân tích cấu tạo và nguyên lý chính`, visualKeyword: "robotics machine blueprint" },
            { scene: 3, durationSec: 10, script: `Ứng dụng thực tiễn trong cuộc cách mạng số`, visualKeyword: "artificial intelligence factory" }
          ],
          sadTalkerTeacherScript: `Xin chào quý thầy cô và các bạn. Tôi là trợ lý AI đại diện cho Huy Technology AI Hub. Hôm nay chúng ta sẽ cùng tìm hiểu về ${topic}.`
        };
      }

      return NextResponse.json({
        success: true,
        topic,
        package: parsedPackage,
        meta: {
          providerUsed: result.providerUsed,
          providerName: result.providerName,
          latencyMs: result.latencyMs,
          failoversOccurred: result.failoversOccurred,
        }
      }, { headers: getCorsHeaders(origin) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: getCorsHeaders(origin) });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error in AI Hub" }, { status: 500, headers: getCorsHeaders(origin) });
  }
}
