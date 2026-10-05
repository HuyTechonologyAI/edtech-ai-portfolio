import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, verifyWorkerToken } from "@/lib/admincenter-session";

/**
 * Central fail-closed guard for AdminCenter / Admin APIs.
 *  - /api/admincenter/auth is the only unauthenticated AdminCenter endpoint (login handles its own throttle).
 *  - Node-01 workers may call /supervisor and /telemetry with header `x-node01-worker-token`.
 *  - State-changing requests with a foreign Origin are rejected (CSRF defence in depth; cookies are SameSite=Strict).
 */

const WORKER_ALLOWED = ["/api/admincenter/supervisor", "/api/admincenter/telemetry"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function deny(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF: foreign Origin on state-changing calls
  if (!SAFE_METHODS.has(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        return deny(403, "FORBIDDEN_ORIGIN");
      }
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      if (originHost !== host) return deny(403, "FORBIDDEN_ORIGIN");
    }
  }

  if (pathname.startsWith("/api/admincenter/")) {
    if (pathname === "/api/admincenter/auth") return NextResponse.next();

    if (verifySession(req.cookies.get("admincenter_session")?.value, "admincenter")) {
      return NextResponse.next();
    }
    if (
      WORKER_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/")) &&
      verifyWorkerToken(req.headers.get("x-node01-worker-token"))
    ) {
      return NextResponse.next();
    }
    return deny(401, "UNAUTHORIZED");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admincenter/:path*", "/api/admin/:path*"],
};
