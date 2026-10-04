import { getErrorMessage } from "@/lib/error-message";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import {
  signSession,
  verifySession,
  checkLoginThrottle,
  recordLoginFailure,
  resetLoginThrottle,
  hashPassword,
  verifyPassword,
  clientIp,
} from "@/lib/admincenter-session";
import { loadCredentials, saveCredentials } from "@/lib/admincenter-credentials";

const DEFAULT_USERNAME = "SuperAdmin";
const SESSION_TTL_SEC = 60 * 60 * 12; // 12h (was 7 days with a forgeable static cookie)
const GLOBAL_THROTTLE_KEY = "account:" + DEFAULT_USERNAME.toLowerCase();

function initialPassword(): string {
  return process.env.ADMINCENTER_INITIAL_PASSWORD || "admin2026";
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function setSessionCookies(res: NextResponse, mustChange: boolean) {
  const base = {
    path: "/",
    maxAge: SESSION_TTL_SEC,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
  res.cookies.set("admincenter_session", signSession("admincenter", SESSION_TTL_SEC), base);
  // UI hint only; authorization never depends on this cookie.
  res.cookies.set("admincenter_must_change", mustChange ? "true" : "false", base);
}

function clearSessionCookies(res: NextResponse) {
  for (const name of ["admincenter_session", "admincenter_must_change"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "strict" });
  }
}

// GET /api/admincenter/auth - Check current session
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admincenter_session")?.value;

  if (verifySession(token, "admincenter")) {
    const stored = await loadCredentials();
    return NextResponse.json({
      authenticated: true,
      user: DEFAULT_USERNAME,
      mustChangePassword: !stored || stored.isInitialDefault,
    });
  }
  return NextResponse.json({ authenticated: false, user: null, mustChangePassword: false });
}

// POST /api/admincenter/auth - Login / Change Password / Logout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "login";
    const ip = clientIp(req);

    if (action === "logout") {
      const res = NextResponse.json({ success: true, message: "Đăng xuất thành công" });
      clearSessionCookies(res);
      return res;
    }

    // Brute-force protection: per-IP and per-account lockout
    for (const key of [ip, GLOBAL_THROTTLE_KEY]) {
      const t = checkLoginThrottle(key);
      if (!t.allowed) {
        return NextResponse.json(
          { error: `Quá nhiều lần thử sai. Vui lòng thử lại sau ${Math.ceil(t.retryAfterSec / 60)} phút.` },
          { status: 429, headers: { "Retry-After": String(t.retryAfterSec) } },
        );
      }
    }

    const stored = await loadCredentials();
    const usingInitial = !stored || stored.isInitialDefault;

    // Persistent lockout check
    if (stored?.lockedUntil && Date.now() < stored.lockedUntil) {
      return NextResponse.json(
        { error: `Tài khoản đã bị khóa tạm thời để bảo vệ. Vui lòng thử lại sau ${Math.ceil((stored.lockedUntil - Date.now()) / 60000)} phút.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil((stored.lockedUntil - Date.now()) / 1000)) } },
      );
    }

    const passwordOk = (pw: unknown): boolean => {
      if (typeof pw !== "string" || !pw) return false;
      return usingInitial ? safeEqual(pw, initialPassword()) : verifyPassword(pw, stored!.record);
    };

    if (action === "change_password") {
      const cookieStore = await cookies();
      if (!verifySession(cookieStore.get("admincenter_session")?.value, "admincenter")) {
        return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ" }, { status: 401 });
      }
      const { currentPassword, newPassword } = body;
      if (typeof newPassword !== "string" || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return NextResponse.json({ error: "Mật khẩu mới phải có tối thiểu 8 ký tự bao gồm chữ và số" }, { status: 400 });
      }
      if (!passwordOk(currentPassword)) {
        recordLoginFailure(ip);
        recordLoginFailure(GLOBAL_THROTTLE_KEY);
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác" }, { status: 400 });
      }
      if (safeEqual(newPassword, initialPassword())) {
        return NextResponse.json({ error: "Không được dùng lại mật khẩu mặc định" }, { status: 400 });
      }
      try {
        const storage = await saveCredentials({
          username: DEFAULT_USERNAME,
          record: hashPassword(newPassword),
          isInitialDefault: false,
          updatedAt: new Date().toISOString(),
        });
        const res = NextResponse.json({
          success: true,
          message: `Đã đổi mật khẩu và lưu bền vững (${storage}).`,
          mustChangePassword: false,
        });
        setSessionCookies(res, false);
        return res;
      } catch (e) {
        console.error("change_password persist failed:", e);
        // Honest failure: never claim success when the credential was not stored.
        return NextResponse.json(
          { error: "KHÔNG lưu được mật khẩu mới (lỗi kho lưu trữ). Mật khẩu cũ vẫn còn hiệu lực. Chi tiết: " + getErrorMessage(e) },
          { status: 503 },
        );
      }
    }

    if (action === "login") {
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json({ error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" }, { status: 400 });
      }
      const userOk = typeof username === "string" && safeEqual(username.trim().toLowerCase(), DEFAULT_USERNAME.toLowerCase());
      const pwOk = passwordOk(password);
      if (!userOk || !pwOk) {
        const lockedIp = recordLoginFailure(ip);
        const lockedGlobal = recordLoginFailure(GLOBAL_THROTTLE_KEY);
        
        if ((lockedIp || lockedGlobal) && stored) {
           // Save persistent lockout for 30 minutes
           try {
             await saveCredentials({
               ...stored,
               lockedUntil: Date.now() + 30 * 60 * 1000,
               updatedAt: new Date().toISOString()
             });
           } catch (e) {
             console.error("Failed to persist lockout", e);
           }
        }
        
        // Same message for bad user / bad password (no account enumeration)
        return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác" }, { status: 401 });
      }
      resetLoginThrottle(ip);
      resetLoginThrottle(GLOBAL_THROTTLE_KEY);
      
      // Clear persistent lockout if any
      if (stored?.lockedUntil) {
         try {
           const { lockedUntil, ...rest } = stored;
           await saveCredentials({ ...rest, updatedAt: new Date().toISOString() } as any);
         } catch(e) {
           console.error("Failed to clear persistent lockout", e);
         }
      }

      // Transparent upgrade of legacy sha256 hash to scrypt
      if (!usingInitial && stored!.record.algo === "sha256-legacy") {
        try {
          await saveCredentials({ ...stored!, record: hashPassword(password), updatedAt: new Date().toISOString() });
        } catch {
          /* non-fatal */
        }
      }

      const res = NextResponse.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: DEFAULT_USERNAME,
        mustChangePassword: usingInitial,
      });
      setSessionCookies(res, usingInitial);
      return res;
    }

    return NextResponse.json({ error: "Thao tác không được hỗ trợ" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Auth endpoint error:", err);
    return NextResponse.json({ error: "Lỗi xử lý xác thực: " + (getErrorMessage(err) || "Unknown") }, { status: 500 });
  }
}
