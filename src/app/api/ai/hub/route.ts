import crypto from "crypto";
import { getErrorMessage } from "@/lib/error-message";
import { NextRequest, NextResponse } from "next/server";
import { dispatchAiCompletion, AI_PROVIDERS, GatewayResult } from "@/lib/ai-gateway";
import { OPEN_SOURCE_AI_TOOLS } from "@/lib/ai-tools-registry";

// CORS configuration for cross-ecosystem calls
const ALLOWED_ORIGINS = [
  "https://gvcncdsai.io.vn",
  "https://smarttax-ai.vercel.app",
  "https://huycncdsai.io.vn",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ecosystem-source, x-api-key",
  };
  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

// Rate limiting with hashed actor keys (SHA-256 hashed IP prefix) and TTL pruning
const requestTimestamps = new Map<string, number[]>();

export function getActorKey(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").slice(0, 16);
}

export function checkRateLimit(ip: string, limit = 30, windowMs = 60000): boolean {
  const actorKey = getActorKey(ip);
  const now = Date.now();
  const list = (requestTimestamps.get(actorKey) || []).filter(t => now - t < windowMs);
  if (list.length >= limit) {
    return false;
  }
  list.push(now);
  requestTimestamps.set(actorKey, list);
  return true;
}

// Server-side authentication check for AI Hub requests
export function verifyHubAuth(req: NextRequest): boolean {
  const validApiKey = process.env.ECOSYSTEM_API_KEY || process.env.HUB_ADMIN_TOKEN || process.env.HUB_AGENT_TOKEN;

  // 1. Check API Key header
  const apiKey = req.headers.get("x-api-key");
  if (apiKey && validApiKey && apiKey === validApiKey) {
    return true;
  }

  // 2. Check Bearer token in Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (validApiKey && token === validApiKey) {
      return true;
    }
  }

  // 3. Check admin session cookie for first-party dashboard calls
  const session = req.cookies.get("admin_session")?.value;
  if (session && session.length > 8) {
    return true;
  }

  return false;
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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

  // Rate limit protection: 30 requests per minute
  if (!checkRateLimit(ip, 30, 60000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 30 requests per minute." },
      { status: 429, headers: getCorsHeaders(origin) }
    );
  }

  // HUB-001: Authentication gate
  if (!verifyHubAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized: A valid API key (x-api-key) or authenticated session is required." },
      { status: 401, headers: getCorsHeaders(origin) }
    );
  }

  try {
    const body = await req.json();
    const { action = "completion", prompt, systemPrompt, subject, duration, targetAudience, lessonTopic } = body;

    // Request size constraint (character length <= 10,000 AND byte size <= 50,000)
    if (prompt && typeof prompt === "string") {
      if (prompt.length > 10000 || Buffer.byteLength(prompt, "utf8") > 50000) {
        return NextResponse.json(
          { error: "Prompt exceeds maximum allowed length of 10,000 characters or 50,000 bytes." },
          { status: 400, headers: getCorsHeaders(origin) }
        );
      }
    }

    // --- Action 1: Generic Completion with Quota Failover ---
    if (action === "completion") {
      if (!prompt) {
        return NextResponse.json({ error: "Missing 'prompt' in request body" }, { status: 400, headers: getCorsHeaders(origin) });
      }

      const result: GatewayResult = await dispatchAiCompletion(prompt, {
        systemPrompt: systemPrompt || "B?n l? AI Hub trung t?m c?a h? sinh th?i Huy Technology AI (V?n H?a Long Tech). Tr? l?i chuy?n nghi?p, ??y ??, ti?ng Vi?t chu?n.",
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

    // --- Action 2: Studio Pipeline 1-Ch?m (All-in-One Studio Package) ---
    if (action === "generate_studio_package") {
      const topic = lessonTopic || prompt || "Nguy?n l? ho?t ??ng c?a ??ng c? ??t trong 4 k?";
      const dur = duration || "45 ph?t";
      const audience = targetAudience || "H?c sinh / Ng??i h?c th?c chi?n";
      const subj = subject || "C?ng ngh? - K? thu?t";

      const studioSystemPrompt = `B?n l? Tr??ng nh?m ?i?u ph?i AI Studio c?a Huy Technology AI Hub (s?ng l?p b?i Chuy?n gia AI Ng? Qu?c Huy).
Nhi?m v? c?a b?n l? nh?n ch? ?? b?i h?c v? xu?t ra m?t c?u tr?c JSON h?p l? CH?NH X?C bao g?m:
1. "lessonPlan": T?m t?t k? ho?ch b?i d?y chu?n CV 5512 (4 ho?t ??ng: Kh?i ??ng, H?nh th?nh ki?n th?c, Luy?n t?p, V?n d?ng).
2. "marpSlideCode": M? ngu?n Markdown chu?n Marp ?? xu?t PowerPoint .pptx ??p m?t (g?m 4-6 slide, chia trang b?ng "---", c? style dark gaia, m?u neon #00ff85).
3. "comfyUiPrompts": M?ng 4 prompt ti?ng Anh chi ti?t cao cho ComfyUI/InvokeAI ?? sinh h?nh minh h?a t?ng ph?n (VD: n?p, n?n, n?, x? ho?c s? ?? kh?i k? thu?t).
4. "vietTtsScript": ?o?n k?ch b?n l?i tho?i ??c m?u truy?n c?m, chia t?ng c?u r? r?ng ?? ??a v?o VietTTS / Piper.
5. "moneyPrinterTurboStoryboard": M?ng c?c ph?n c?nh cho MoneyPrinterTurbo g?m { scene: number, durationSec: number, script: string, visualKeyword: string } ?? t?m footage v? render video MP4 t? ??ng.
6. "sadTalkerTeacherScript": ?o?n l?i ch?o m? ??u 30 gi?y cho Avatar th?y gi?o AI ?o gi?ng b?i.

L?U ?: Ph?n h?i thu?n chu?i JSON kh?ng c? v?n b?n gi?i th?ch th?a b?n ngo?i. B?t ??u b?ng { v? k?t th?c b?ng }.`;

      const studioUserPrompt = `H?y t?o tr?n b? h?c li?u s? cho b?i h?c:
- T?n b?i: "${topic}"
- M?n / L?nh v?c: ${subj}
- Th?i l??ng: ${dur}
- ??i t??ng: ${audience}

T?o tr?n b?: Slide Marp PPTX + Gi?o ?n CV 5512 + 4 Prompt ?nh ComfyUI + K?ch b?n VietTTS + Storyboard MoneyPrinterTurbo + Script Avatar SadTalker.`;

      const result = await dispatchAiCompletion(studioUserPrompt, {
        systemPrompt: studioSystemPrompt,
      });

      // Parse JSON response safely
      let parsedPackage: unknown = null;
      try {
        let cleanJson = result.text.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
        }
        parsedPackage = JSON.parse(cleanJson);
      } catch {
        // Fallback structured package n?u AI sinh chu?i Markdown
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
## H? sinh th?i Huy Technology AI Hub
Chuy?n gia AI: Ng? Qu?c Huy

---

## 1. M?C TI?U B?I H?C
- N?m v?ng ki?n th?c tr?ng t?m v? ${topic}
- ?ng d?ng quy tr?nh t? ??ng h?a gi?i quy?t v?n ??

---

## 2. N?I DUNG CHI TI?T
- Kh?i ni?m v? c?u t?o
- Nguy?n l? v?n h?nh v? ?ng d?ng th?c ti?n`,
          lessonPlan: `K? ho?ch b?i d?y chu?n CV 5512 cho b?i: ${topic}. Th?i l??ng: ${dur}.`,
          comfyUiPrompts: [
            `Technical mechanical diagram of ${topic}, engineering blueprint, 8k resolution, photorealistic, octane render`,
            `Close-up high-tech components of ${topic}, volumetric studio lighting, clear details, 3d rendering`,
            `Cross section view explaining internal mechanism of ${topic}, informative illustration, crisp vector lines`,
            `Real world industrial application of ${topic} in smart automation factory, cinematic wide shot`
          ],
          vietTtsScript: `Ch?o c?c b?n h?c vi?n, h?m nay Chuy?n gia AI Ng? Qu?c Huy v? Huy Technology AI Hub s? c?ng c?c b?n kh?m ph? b?i h?c: ${topic}. Ch?ng ta s? ?i t? nguy?n l? c? b?n ??n c?c gi?i ph?p ?ng d?ng th?c t?.`,
          moneyPrinterTurboStoryboard: [
            { scene: 1, durationSec: 5, script: `Gi?i thi?u b?i h?c ${topic}`, visualKeyword: "engineering technology" },
            { scene: 2, durationSec: 15, script: `Ph?n t?ch c?u t?o v? nguy?n l? ch?nh`, visualKeyword: "robotics machine blueprint" },
            { scene: 3, durationSec: 10, script: `?ng d?ng th?c ti?n trong cu?c c?ch m?ng s?`, visualKeyword: "artificial intelligence factory" }
          ],
          sadTalkerTeacherScript: `Xin ch?o qu? th?y c? v? c?c b?n. T?i l? tr? l? AI ??i di?n cho Huy Technology AI Hub. H?m nay ch?ng ta s? c?ng t?m hi?u v? ${topic}.`
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
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) || "Internal server error in AI Hub" }, { status: 500, headers: getCorsHeaders(origin) });
  }
}
