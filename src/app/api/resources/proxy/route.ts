import { NextResponse } from "next/server";

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
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url param" }, { status: 400 });

  // SEC-01 Fix: Validate URL to prevent SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const allowedHosts = ["drive.google.com", "docs.google.com"];
  if (!allowedHosts.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "SSRF Protection: Only URLs from drive.google.com and docs.google.com are permitted." },
      { status: 403 }
    );
  }

  // SEC-10 Fix: Restrict CORS to specific allowed origins/same-origin
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
    // For Google Drive files, use the direct download URL
    const downloadUrl = fileId
      ? `https://drive.google.com/uc?id=${fileId}&export=download`
      : url;

    const response = await fetch(downloadUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      // Try alternate export URL for Google Docs/Slides
      if (fileId) {
        const altUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
        const altRes = await fetch(altUrl, { redirect: "follow" });
        if (altRes.ok) {
          const buf = await altRes.arrayBuffer();
          return new NextResponse(buf, {
            headers: {
              "Content-Type": "application/pdf",
              ...corsHeaders,
            },
          });
        }
      }
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    // If Google returns HTML (virus scan page), try to extract confirm link
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
              ...corsHeaders,
            },
          });
        }
      }
      throw new Error("Cannot download file - may require Google sign-in");
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType.includes("pdf") ? "application/pdf" : contentType,
        ...corsHeaders,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
