import { createHmac, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Signed, expiring session tokens for AdminCenter / Admin, machine token for Node-01,
 * login throttling and scrypt password hashing.
 * Replaces the legacy forgeable static cookie value "authenticated".
 */

export type SessionScope = "admincenter" | "admin";

interface SessionPayload {
  scope: SessionScope;
  iat: number;
  exp: number;
  nonce: string;
}

function getSecret(): Buffer | null {
  const dedicated = process.env.ADMINCENTER_SESSION_SECRET;
  if (dedicated && dedicated.length >= 16) return Buffer.from(dedicated, "utf8");
  // Zero-config fallback: derive from secrets that already exist server-side.
  const parts = [process.env.ADMIN_PASSWORD, process.env.SUPABASE_SERVICE_ROLE_KEY].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return createHash("sha256").update("huy-ai-session-v1|" + parts.join("|")).digest();
}

function hmac(data: string, secret: Buffer): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signSession(scope: SessionScope, ttlSeconds: number): string {
  const secret = getSecret();
  if (!secret) throw new Error("SESSION_SECRET_NOT_CONFIGURED");
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { scope, iat: now, exp: now + ttlSeconds, nonce: randomBytes(8).toString("hex") };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body, secret)}`;
}

export function verifySession(token: string | undefined | null, scope: SessionScope): boolean {
  if (!token || typeof token !== "string") return false;
  const secret = getSecret();
  if (!secret) return false;
  const idx = token.indexOf(".");
  if (idx <= 0) return false;
  const body = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = hmac(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (p.scope !== scope) return false;
    if (typeof p.exp !== "number" || p.exp <= Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Machine-to-machine token for Node-01 workers (header x-node01-worker-token). Disabled when unset. */
export function verifyWorkerToken(candidate: string | null | undefined): boolean {
  const expected = process.env.NODE01_WORKER_TOKEN;
  if (!expected || expected.length < 16 || !candidate) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// ── Login throttle (in-memory; per server instance) ──────────────────────────
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

export function checkLoginThrottle(key: string): { allowed: boolean; retryAfterSec: number } {
  const e = failures.get(key);
  const now = Date.now();
  if (!e || now > e.resetAt) return { allowed: true, retryAfterSec: 0 };
  if (e.count >= MAX_FAILURES) return { allowed: false, retryAfterSec: Math.ceil((e.resetAt - now) / 1000) };
  return { allowed: true, retryAfterSec: 0 };
}

export function recordLoginFailure(key: string): boolean {
  const now = Date.now();
  const e = failures.get(key);
  if (!e || now > e.resetAt) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else e.count += 1;
  
  return failures.get(key)!.count >= MAX_FAILURES;
}

export function resetLoginThrottle(key: string): void {
  failures.delete(key);
}

// ── Password hashing ─────────────────────────────────────────────────────────
export interface PasswordRecord {
  algo: "scrypt" | "sha256-legacy";
  salt: string;
  hash: string;
}

export function hashPassword(password: string): PasswordRecord {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return { algo: "scrypt", salt, hash };
}

export function verifyPassword(password: string, rec: PasswordRecord): boolean {
  try {
    let computed: Buffer;
    if (rec.algo === "scrypt") {
      computed = scryptSync(password, rec.salt, 64, { N: 16384, r: 8, p: 1 });
    } else {
      computed = Buffer.from(
        createHash("sha256").update(password + rec.salt + "huy-ai-center-salt-2026").digest("hex"),
        "hex",
      );
    }
    const stored = Buffer.from(rec.hash, "hex");
    return computed.length === stored.length && timingSafeEqual(computed, stored);
  } catch {
    return false;
  }
}

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
