import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const SECRET = process.env.SIGNED_URL_SECRET || "zentratech_super_secret_key_2026";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const expiresParam = searchParams.get("expires");
  const sigParam = searchParams.get("sig");
  let url = searchParams.get("url");

  // KỊCH BẢN BẢO MẬT SPRINT 3: XÁC THỰC MẬT MÃ SIGNED TEMPORARY URL NẾU CÓ CHỮ KÝ
  if (id && expiresParam && sigParam) {
    const expires = parseInt(expiresParam, 10);
    
    // Kiểm tra tính hiệu lực theo thời gian thực (TTL)
    if (Date.now() > expires) {
      return NextResponse.json(
        { error: "⏳ Liên kết tải Temporary URL đã hết hạn. Vui lòng quay lại thư viện tài liệu để lấy liên kết mới." },
        { status: 403 }
      );
    }

    // Xác minh toàn vẹn chữ ký HMAC-SHA256 nhằm chặn đứng nguy cơ sửa đổi tham số
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${id}:${expires}`)
      .digest("hex");

    if (sigParam !== expectedSig) {
      return NextResponse.json(
        { error: "🚫 Chữ ký xác thực (Cryptographic Signature) không hợp lệ hoặc đã bị giả mạo." },
        { status: 403 }
      );
    }

    // Truy vấn đường dẫn gốc từ cơ sở dữ liệu Supabase nhằm giấu kín tuyệt đối link tải gốc khỏi trình duyệt
    const { data: resource } = await supabase.from("resources").select("link").eq("id", id).single();
    if (!resource || !resource.link) {
      return NextResponse.json({ error: "Không tìm thấy liên kết gốc của tài nguyên trong hệ thống." }, { status: 404 });
    }
    url = resource.link;
  }

  if (!url) {
    return NextResponse.json({ error: "Missing required download parameters" }, { status: 400 });
  }

  // SEC-01 Fix: Validate URL to prevent SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return NextResponse.json({ error: "Invalid target URL format" }, { status: 400 });
  }

  const allowedHosts = ["drive.google.com", "docs.google.com"];
  if (!allowedHosts.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "SSRF Protection: Only external downloads from verified Google Drive endpoints are permitted." },
      { status: 403 }
    );
  }

  // SEC-10 Fix: Restrict CORS headers
  const origin = req.headers.get("origin");
  const isAllowedOrigin = !origin || origin.startsWith("http://localhost") || origin.includes("vercel.app");
  const corsHeaders: Record<string, string> = {
    "Cache-Control": "public, max-age=3600",
  };
  if (origin && isAllowedOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  try {
    const fileId = extractFileId(url);
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?id=${fileId}&export=download`
      : url;

    const response = await fetch(downloadUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      if (fileId) {
        const altUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
        const altRes = await fetch(altUrl, { redirect: "follow" });
        if (altRes.ok) {
          const buf = await altRes.arrayBuffer();
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="zentratech_document_${id || fileId}.pdf"`,
              ...corsHeaders,
            },
          });
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
        const confirmRes = await fetch(confirmUrl, { redirect: "follow" });
        if (confirmRes.ok) {
          const buf = await confirmRes.arrayBuffer();
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="zentratech_document_${id || fileId}.pdf"`,
              ...corsHeaders,
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
        ...corsHeaders,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal Secure Gateway Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
