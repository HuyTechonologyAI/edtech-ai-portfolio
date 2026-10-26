import crypto from "crypto";

export function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "drive.google.com" || h === "docs.google.com") return true;
  if (h.endsWith(".googleusercontent.com")) return true;
  return false;
}

export function isPrivateIpOrHost(hostname: string): boolean {
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

/**
 * Strict Origin Validation for CORS:
 * Prevents *.vercel.app broad matching vulnerability.
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (origin === "https://www.huycncdsai.io.vn" || origin === "https://huycncdsai.io.vn") return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  if (/^https:\/\/edtech-ai-portfolio(-[a-zA-Z0-9-]+)?-huytechnologys-projects\.vercel\.app$/.test(origin)) return true;
  return false;
}

export function verifySignedUrlSignature(id: string, expires: number, signature: string, secret: string): boolean {
  if (!id || !expires || !signature || !secret) return false;
  if (isNaN(expires) || Date.now() > expires) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${id}:${expires}`)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export function generateSignedUrl(id: string, secret: string, ttlMs: number = 300000): { signedUrl: string; expires: number; signature: string } {
  const expires = Date.now() + ttlMs;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${id}:${expires}`)
    .digest("hex");
  const signedUrl = `/api/resources/proxy?id=${encodeURIComponent(id)}&expires=${expires}&sig=${signature}`;
  return { signedUrl, expires, signature };
}
