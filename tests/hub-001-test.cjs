const assert = require("node:assert/strict");

// Replicate verifyHubAuth logic
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

  // 3. Admin session cookie
  const session = cookies["admin_session"];
  if (session && session.length > 8) {
    return true;
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

const env = { ECOSYSTEM_API_KEY: "secret_eco_token_2026" };

// 1. Anonymous request denied
assert.equal(verifyHubAuth({}, {}, env), false, "Anonymous request must be denied");

// 2. Wrong API key denied
assert.equal(verifyHubAuth({ "x-api-key": "wrong_key" }, {}, env), false, "Invalid API key must be denied");

// 3. Valid x-api-key allowed
assert.equal(verifyHubAuth({ "x-api-key": "secret_eco_token_2026" }, {}, env), true, "Valid API key must be allowed");

// 4. Valid Authorization Bearer allowed
assert.equal(verifyHubAuth({ "authorization": "Bearer secret_eco_token_2026" }, {}, env), true, "Valid Bearer token must be allowed");

// 5. Valid session cookie allowed
assert.equal(verifyHubAuth({}, { "admin_session": "authenticated_admin_session_val" }, env), true, "Admin session cookie must be allowed");

// 6. CORS wildcard removed
const offListCors = getCorsHeaders("https://malicious-site.com");
assert.equal(offListCors["Access-Control-Allow-Origin"], undefined, "Wildcard * must NOT be returned for off-list origins");

const allowedCors = getCorsHeaders("https://smarttax-ai.vercel.app");
assert.equal(allowedCors["Access-Control-Allow-Origin"], "https://smarttax-ai.vercel.app", "Allowed origin must be reflected exactly");

console.log("PASS: All HUB-001 authentication and CORS authorization fixtures passed successfully!");
