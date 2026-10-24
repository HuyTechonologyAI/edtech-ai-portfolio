import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

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

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "drive.google.com" || h === "docs.google.com") return true;
  if (h.endsWith(".googleusercontent.com")) return true;
  return false;
}

function isPrivateIpOrHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  // check ipv4
  const ipv4Match = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, o1, o2] = ipv4Match.map(Number);
    if (o1 === 127 || o1 === 10 || o1 === 0) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 169 && o2 === 254) return true; // link-local metadata (169.254.169.254)
    if (o1 >= 224) return true; // multicast / reserved
  }
  // check ipv6 and IPv4-mapped IPv6
  if (
    h === "::1" ||
    h === "0:0:0:0:0:0:0:1" ||
    h.startsWith("fe80:") ||
    h.startsWith("fc00:") ||
    h.startsWith("fd00:") ||
    h.startsWith("::ffff:")
  ) {
    return true;
  }
  return false;
}

export function validateSafeUrl(urlStr: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid target URL format");
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`Insecure protocol: ${parsed.protocol}. Only HTTPS permitted.`);
  }
  if (isPrivateIpOrHost(parsed.hostname)) {
    throw new Error(`SSRF Protection: Private or metadata address rejected: ${parsed.hostname}`);
  }
  if (!isAllowedHost(parsed.hostname)) {
    throw new Error(`SSRF Protection: Only verified Google Drive/Docs endpoints are permitted (${parsed.hostname}).`);
  }
  return parsed;
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
  let url = searchParams.get("url");

  // K?CH B?N B?O M?T SPRINT 3: X?C TH?C M?T M? SIGNED TEMPORARY URL N?U C? CH? K?
  if (id && expiresParam && sigParam) {
    if (!SECRET) {
      return NextResponse.json({ error: "Signed URL service is not configured" }, { status: 503 });
    }

    const expires = parseInt(expiresParam, 10);
    
    // Ki?m tra t?nh hi?u l?c theo th?i gian th?c (TTL)
    if (Date.now() > expires) {
      return NextResponse.json(
        { error: "? Li?n k?t t?i Temporary URL ?? h?t h?n. Vui l?ng quay l?i th? vi?n t?i li?u ?? l?y li?n k?t m?i." },
        { status: 403 }
      );
    }

    // X?c minh to?n v?n ch? k? HMAC-SHA256 nh?m ch?n ??ng nguy c? s?a ??i tham s?
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${id}:${expires}`)
      .digest("hex");

    const sigBuf = Buffer.from(sigParam, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return NextResponse.json(
        { error: "?? Ch? k? x?c th?c (Cryptographic Signature) kh?ng h?p l? ho?c ?? b? gi? m?o." },
        { status: 403 }
      );
    }

    // Truy v?n ???ng d?n g?c t? c? s? d? li?u Supabase nh?m gi?u k?n tuy?t ??i link t?i g?c kh?i tr?nh duy?t
    const { data: resource } = await supabase.from("resources").select("link").eq("id", id).single();
    if (!resource || !resource.link) {
      return NextResponse.json({ error: "Kh?ng t?m th?y li?n k?t g?c c?a t?i nguy?n trong h? th?ng." }, { status: 404 });
    }
    url = resource.link;
  }

  if (!url) {
    return NextResponse.json({ error: "Missing required download parameters" }, { status: 400 });
  }

  // Pre-validate initial URL
  try {
    validateSafeUrl(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid target URL format";
    return NextResponse.json({ error: msg }, { status: 403 });
  }

  // Restrict CORS headers
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
                ...corsHeaders,
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
              ...corsHeaders,
            },
          });
        }
      }
      throw new Error("T?p l?u tr? v??t qu? gi?i h?n qu?t c?ng khai ho?c y?u c?u ph?n quy?n t?i kho?n Google.");
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
