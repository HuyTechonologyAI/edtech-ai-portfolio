import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  validateSafeUrl,
  isAllowedOrigin,
  verifySignedUrlSignature,
} from "@/lib/resources-security";

const SECRET = process.env.SIGNED_URL_SECRET;

// Extract Google Drive file ID from various URL formats
function extractFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function safeFetchWithRedirects(initialUrl: string, maxRedirects = 5, timeoutMs = 15000): Promise<Response> {
  let currentUrl = initialUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    validateSafeUrl(currentUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(currentUrl, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        redirect: "manual",
        signal: controller.signal,
      });

      // Handle redirects manually to re-validate destination at each hop
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) {
          throw new Error("Redirect status received without Location header");
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error(`Too many redirects (exceeded ${maxRedirects} hops)`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const expiresParam = searchParams.get("expires");
  const sigParam = searchParams.get("sig");

  // YÊU CẦU BẮT BUỘC CHỮ KÝ XÁC THỰC MẬT MÃ (SIGNED TEMPORARY URL)
  if (!id || !expiresParam || !sigParam) {
    return NextResponse.json(
      { error: "Missing required cryptographic signature parameters (id, expires, sig)." },
      { status: 403 }
    );
  }

  if (!SECRET) {
    return NextResponse.json({ error: "Signed URL service is not configured" }, { status: 503 });
  }

  const expires = parseInt(expiresParam, 10);
  
  // Xác minh toàn vẹn chữ ký HMAC-SHA256 & thời hạn TTL (5 phút)
  const isSigValid = verifySignedUrlSignature(id, expires, sigParam, SECRET);
  if (!isSigValid) {
    return NextResponse.json(
      { error: "Chữ ký xác thực (Cryptographic Signature) không hợp lệ, đã bị sửa đổi hoặc đã hết hạn." },
      { status: 403 }
    );
  }

  // Truy vấn đường dẫn gốc từ cơ sở dữ liệu Supabase
  const { data: resource, error: dbErr } = await supabase
    .from("resources")
    .select("link, is_premium, is_private")
    .eq("id", id)
    .single();

  if (dbErr || !resource || !resource.link) {
    return NextResponse.json({ error: "Không tìm thấy liên kết gốc của tài nguyên trong hệ thống." }, { status: 404 });
  }

  const url = resource.link;

  // Pre-validate initial URL against SSRF
  try {
    validateSafeUrl(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid target URL format";
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  // Strict CORS and Cache-Control Headers
  const origin = req.headers.get("origin");
  const corsAllowed = isAllowedOrigin(origin);
  
  // Ngăn chặn hoàn toàn việc public cache kéo dài quá thời hạn chữ ký 5 phút
  const responseHeaders: Record<string, string> = {
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
  if (origin && corsAllowed) {
    responseHeaders["Access-Control-Allow-Origin"] = origin;
    responseHeaders["Vary"] = "Origin";
  }

  try {
    const fileId = extractFileId(url);
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?id=${fileId}&export=download`
      : url;

    const response = await safeFetchWithRedirects(downloadUrl);

    if (!response.ok) {
      if (fileId) {
        const altUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
        try {
          const altRes = await safeFetchWithRedirects(altUrl);
          if (altRes.ok) {
            const buf = await altRes.arrayBuffer();
            return new NextResponse(buf, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="zentratech_document_${id || fileId}.pdf"`,
                ...responseHeaders,
              },
            });
          }
        } catch {
          // Fall through to error below
        }
      }
      throw new Error(`Upstream fetch failure: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    // Bypass Google Drive large file warning scan pages dynamically
    if (contentType.includes("text/html") && fileId) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([a-zA-Z0-9_-]+)/);
      if (confirmMatch) {
        const confirmUrl = `https://drive.google.com/uc?id=${fileId}&export=download&confirm=${confirmMatch[1]}`;
        const confirmRes = await safeFetchWithRedirects(confirmUrl);
        if (confirmRes.ok) {
          const buf = await confirmRes.arrayBuffer();
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="zentratech_document_${id || fileId}.pdf"`,
              ...responseHeaders,
            },
          });
        }
      }
      throw new Error("Tệp lưu trữ vượt quá giới hạn quét công khai hoặc yêu cầu phân quyền tài khoản Google.");
    }

    const buffer = await response.arrayBuffer();
    const isPdf = contentType.includes("pdf");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": isPdf ? "application/pdf" : contentType,
        "Content-Disposition": `attachment; filename="zentratech_document_${id || fileId || 'download'}.${isPdf ? 'pdf' : 'bin'}"`,
        ...responseHeaders,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal Secure Gateway Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
