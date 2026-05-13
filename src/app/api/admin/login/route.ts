import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ── In-memory rate limiter ──────────────────────────────────────────────────
// SEC-02: Brute force protection — max 5 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remainingMs: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remainingMs: 0 };
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // SEC-02: Rate limit check
  const { allowed, remainingMs } = checkRateLimit(ip);
  if (!allowed) {
    const mins = Math.ceil(remainingMs / 60000);
    return NextResponse.json(
      { error: `Quá nhiều lần thử. Vui lòng thử lại sau ${mins} phút.` },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(remainingMs / 1000)) },
      }
    );
  }

  try {
    const body = await req.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Fail-safe: không cho đăng nhập nếu chưa set env var
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD env var is not set");
      return NextResponse.json({ error: "Lỗi cấu hình hệ thống" }, { status: 500 });
    }

    if (password === adminPassword) {
      // Đăng nhập thành công → xoá rate limit
      clearRateLimit(ip);

      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        // SEC-08: Rút ngắn xuống 4 giờ thay vì 7 ngày
        maxAge: 60 * 60 * 4,
      });

      return NextResponse.json({ success: true });
    }

    // Sai mật khẩu — không tiết lộ thông tin cụ thể
    return NextResponse.json(
      { error: "Mật khẩu không chính xác" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
