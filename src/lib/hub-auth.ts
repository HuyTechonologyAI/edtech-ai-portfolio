import { createHash, timingSafeEqual } from "node:crypto";
import { verifySession } from "./admincenter-session";

/**
 * HUB-001 authentication for /api/ai/hub.
 *
 * Accepts, in order:
 * 1. `x-api-key` header matching ECOSYSTEM_API_KEY / HUB_ADMIN_TOKEN / HUB_AGENT_TOKEN
 * 2. `Authorization: Bearer <token>` matching the same key
 * 3. A cryptographically valid, unexpired signed `admin_session` cookie
 *    (scope "admin"), verified with HMAC via verifySession().
 *
 * Never trusts a cookie by mere presence or length (fixes forged-cookie bypass).
 */

export interface HubAuthInput {
  apiKeyHeader: string | null | undefined;
  authorizationHeader: string | null | undefined;
  adminSessionCookie: string | null | undefined;
}

function getConfiguredKey(): string | null {
  const key = process.env.ECOSYSTEM_API_KEY || process.env.HUB_ADMIN_TOKEN || process.env.HUB_AGENT_TOKEN;
  return key && key.length >= 16 ? key : null;
}

/** Constant-time comparison independent of input length. */
export function safeKeyEqual(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function verifyHubAuthInput(input: HubAuthInput): boolean {
  const validKey = getConfiguredKey();

  if (validKey) {
    const apiKey = input.apiKeyHeader?.trim();
    if (apiKey && safeKeyEqual(apiKey, validKey)) return true;

    const auth = input.authorizationHeader;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.substring(7).trim();
      if (token && safeKeyEqual(token, validKey)) return true;
    }
  }

  const session = input.adminSessionCookie;
  if (session && verifySession(session, "admin")) {
    return true;
  }

  return false;
}
