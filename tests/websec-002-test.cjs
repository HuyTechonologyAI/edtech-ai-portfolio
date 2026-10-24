const assert = require("node:assert/strict");

function isAllowedHost(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "drive.google.com" || h === "docs.google.com") return true;
  if (h.endsWith(".googleusercontent.com")) return true;
  return false;
}

function isPrivateIpOrHost(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const ipv4Match = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, o1, o2, o3, o4] = ipv4Match.map(Number);
    if (o1 === 127 || o1 === 10 || o1 === 0) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 169 && o2 === 254) return true;
    if (o1 >= 224) return true;
  }
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

function validateSafeUrl(urlStr) {
  let parsed;
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

// 1. Allowed Google endpoints
assert.doesNotThrow(() => validateSafeUrl("https://drive.google.com/uc?id=123"));
assert.doesNotThrow(() => validateSafeUrl("https://docs.google.com/document/d/123/export?format=pdf"));
assert.doesNotThrow(() => validateSafeUrl("https://doc-0k-14-docs.googleusercontent.com/download"));

// 2. Insecure HTTP
assert.throws(() => validateSafeUrl("http://drive.google.com/uc?id=123"), /Insecure protocol/);

// 3. Off-list external domains
assert.throws(() => validateSafeUrl("https://evil.com/drive.google.com"), /Only verified Google Drive/);
assert.throws(() => validateSafeUrl("https://attacker.io/"), /Only verified Google Drive/);

// 4. Localhost / loopback IPv4
assert.throws(() => validateSafeUrl("https://localhost:8080/"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://127.0.0.1:19090/"), /Private or metadata address/);

// 5. Private network ranges (RFC 1918)
assert.throws(() => validateSafeUrl("https://10.0.0.1/admin"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://192.168.1.1/"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://172.16.0.1/"), /Private or metadata address/);

// 6. Cloud metadata endpoint (169.254.169.254)
assert.throws(() => validateSafeUrl("https://169.254.169.254/latest/meta-data"), /Private or metadata address/);

// 7. IPv6 loopback and private ranges
assert.throws(() => validateSafeUrl("https://[::1]/secret"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://[fe80::1]/internal"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://[fc00::1]/db"), /Private or metadata address/);

// 8. IPv4-mapped IPv6 addresses
assert.throws(() => validateSafeUrl("https://[::ffff:127.0.0.1]/"), /Private or metadata address/);
assert.throws(() => validateSafeUrl("https://[::ffff:169.254.169.254]/"), /Private or metadata address/);

console.log("PASS: All WEBSEC-002 SSRF validation test fixtures passed successfully!");
