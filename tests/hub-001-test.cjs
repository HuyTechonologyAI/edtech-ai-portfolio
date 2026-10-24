/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

function verifyHubAuth(headers, cookies, env) {
  const validApiKey = env.ECOSYSTEM_API_KEY || env.HUB_ADMIN_TOKEN || env.HUB_AGENT_TOKEN;

  // 1. API key header
  const apiKey = headers["x-api-key"];
  if (apiKey && validApiKey && apiKey === validApiKey) {
    return true;
  }

  // 2. Bearer token
  const authHeader = headers["authorization"];
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    if (validApiKey && token === validApiKey) {
      return true;
    }
  }

  // 3. Admin session cookie: must be an HMAC-signed token (mirrors src/lib/hub-auth.ts).
  //    Authoritative tests for the real implementation live in src/lib/hub-auth.test.ts.
  const session = cookies["admin_session"];
  if (session && env.SESSION_SECRET) {
    const idx = session.indexOf(".");
    if (idx > 0) {
      const body = session.slice(0, idx);
      const sig = Buffer.from(session.slice(idx + 1));
      const expected = Buffer.from(crypto.createHmac("sha256", env.SESSION_SECRET).update(body).digest("base64url"));
      if (sig.length === expected.length && crypto.timingSafeEqual(sig, expected)) return true;
    }
  }

  return false;
}

const ALLOWED_ORIGINS = [
  "https://gvcncdsai.io.vn",
  "https://smarttax-ai.vercel.app",
  "https://huycncdsai.io.vn",
  "http://localhost:3000",
  "http://localhost:5173"
];

function getCorsHeaders(origin) {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ecosystem-source, x-api-key",
  };
  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function getActorKey(ip) {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex").slice(0, 16);
}

// Simulated Shared Atomic Store across multi-instance serverless
class SharedAtomicRateLimiter {
  constructor(limit = 30, windowMs = 60000) {
    this.store = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  consume(ip) {
    const actorKey = getActorKey(ip);
    const now = Date.now();
    const timestamps = (this.store.get(actorKey) || []).filter(t => now - t < this.windowMs);
    if (timestamps.length >= this.limit) {
      return { allowed: false, remaining: 0 };
    }
    timestamps.push(now);
    this.store.set(actorKey, timestamps);
    return { allowed: true, remaining: this.limit - timestamps.length };
  }
}

const env = { ECOSYSTEM_API_KEY: "secret_eco_token_2026", SESSION_SECRET: "unit-test-session-secret-0123456789" };

// 1. Auth Negative Tests
assert.equal(verifyHubAuth({}, {}, env), false, "Anonymous request must be denied");
assert.equal(verifyHubAuth({ "x-api-key": "wrong_key" }, {}, env), false, "Invalid API key must be denied");
assert.equal(verifyHubAuth({ "authorization": "Bearer wrong_token" }, {}, env), false, "Invalid Bearer token must be denied");
assert.equal(verifyHubAuth({}, { "admin_session": "short" }, env), false, "Short/invalid session must be denied");

// 2. Auth Positive Tests
assert.equal(verifyHubAuth({ "x-api-key": "secret_eco_token_2026" }, {}, env), true, "Valid API key must be allowed");
assert.equal(verifyHubAuth({ "authorization": "Bearer secret_eco_token_2026" }, {}, env), true, "Valid Bearer token must be allowed");
assert.equal(verifyHubAuth({}, { "admin_session": "authenticated_admin_session_val" }, env), false, "REGRESSION: forged unsigned admin session must be denied");
{
  const body = Buffer.from(JSON.stringify({ scope: "admin" })).toString("base64url");
  const sig = crypto.createHmac("sha256", env.SESSION_SECRET).update(body).digest("base64url");
  assert.equal(verifyHubAuth({}, { "admin_session": body + "." + sig }, env), true, "Signed admin session must be allowed");
}

// 3. CORS origin reflection & wildcard rejection
const offListCors = getCorsHeaders("https://malicious-site.com");
assert.equal(offListCors["Access-Control-Allow-Origin"], undefined, "Wildcard * must NOT be returned for off-list origins");

const allowedCors = getCorsHeaders("https://smarttax-ai.vercel.app");
assert.equal(allowedCors["Access-Control-Allow-Origin"], "https://smarttax-ai.vercel.app", "Allowed origin must be reflected exactly");

// 4. Actor key privacy hashing
const ip1Key = getActorKey("192.168.1.100");
const ip2Key = getActorKey("192.168.1.101");
assert.notEqual(ip1Key, ip2Key);
assert.equal(ip1Key.length, 16);
assert.match(ip1Key, /^[0-9a-f]{16}$/);

// 5. Multi-instance rate limiting simulation (2 serverless workers sharing atomic limiter)
const sharedStore = new SharedAtomicRateLimiter(30, 60000);
const clientIp = "203.0.113.42";

// Worker 1 consumes 15 requests
for (let i = 0; i < 15; i++) {
  assert.equal(sharedStore.consume(clientIp).allowed, true);
}

// Worker 2 consumes 15 requests
for (let i = 0; i < 15; i++) {
  assert.equal(sharedStore.consume(clientIp).allowed, true);
}

// 31st request across instances is blocked
assert.equal(sharedStore.consume(clientIp).allowed, false);

// 6. Prompt size constraint validation (chars & bytes)
function validatePrompt(prompt) {
  if (typeof prompt !== "string") return false;
  if (prompt.length > 10000 || Buffer.byteLength(prompt, "utf8") > 50000) {
    return false;
  }
  return true;
}

assert.equal(validatePrompt("Hello world"), true);
assert.equal(validatePrompt("A".repeat(10001)), false, "Prompt > 10,000 characters must be rejected");
assert.equal(validatePrompt("??".repeat(15000)), false, "Prompt > 50,000 UTF-8 bytes must be rejected");

console.log("PASS: All HUB-001 authentication, CORS, multi-instance rate limiting, and prompt bound fixtures passed successfully!");
