import test from "node:test";
import assert from "node:assert/strict";
import {
  validateSafeUrl,
  isAllowedHost,
  isPrivateIpOrHost,
  isAllowedOrigin,
  verifySignedUrlSignature,
  generateSignedUrl,
} from "./resources-security.js";

const SECRET = "test-secret-key-0123456789abcdef";

test("SSRF Guard: accepts valid Google Drive / Docs HTTPS endpoints", () => {
  const u1 = validateSafeUrl("https://drive.google.com/file/d/1a2b3c/view");
  assert.equal(u1.hostname, "drive.google.com");

  const u2 = validateSafeUrl("https://docs.google.com/document/d/1a2b3c/export");
  assert.equal(u2.hostname, "docs.google.com");

  assert.equal(isAllowedHost("drive.google.com"), true);
  assert.equal(isAllowedHost("docs.google.com"), true);
  assert.equal(isAllowedHost("lh3.googleusercontent.com"), true);
});

test("SSRF Guard: rejects non-HTTPS protocols", () => {
  assert.throws(() => validateSafeUrl("http://drive.google.com/file/d/123"), /Insecure protocol/);
  assert.throws(() => validateSafeUrl("ftp://drive.google.com/file/d/123"), /Insecure protocol/);
});

test("SSRF Guard: rejects private IPs, localhost, and cloud metadata (169.254.169.254)", () => {
  assert.equal(isPrivateIpOrHost("localhost"), true);
  assert.equal(isPrivateIpOrHost("127.0.0.1"), true);
  assert.equal(isPrivateIpOrHost("10.0.0.1"), true);
  assert.equal(isPrivateIpOrHost("192.168.1.1"), true);
  assert.equal(isPrivateIpOrHost("169.254.169.254"), true);
  assert.equal(isPrivateIpOrHost("::1"), true);

  assert.throws(() => validateSafeUrl("https://localhost/secret"), /Private or metadata address rejected/);
  assert.throws(() => validateSafeUrl("https://127.0.0.1/admin"), /Private or metadata address rejected/);
  assert.throws(() => validateSafeUrl("https://10.0.0.1/data"), /Private or metadata address rejected/);
  assert.throws(() => validateSafeUrl("https://192.168.1.1/router"), /Private or metadata address rejected/);
  assert.throws(() => validateSafeUrl("https://169.254.169.254/latest/meta-data"), /Private or metadata address rejected/);
  assert.throws(() => validateSafeUrl("https://[::1]/secret"), /Private or metadata address rejected/);
});

test("SSRF Guard: rejects unapproved third-party or attacker hostnames", () => {
  assert.throws(() => validateSafeUrl("https://evil-attacker.com/malware.pdf"), /SSRF Protection/);
  assert.throws(() => validateSafeUrl("https://attacker.vercel.app/leak"), /SSRF Protection/);
});

test("CORS Guard: accepts official production, localhost, and repo preview domains", () => {
  assert.equal(isAllowedOrigin(null), true);
  assert.equal(isAllowedOrigin("https://www.huycncdsai.io.vn"), true);
  assert.equal(isAllowedOrigin("https://huycncdsai.io.vn"), true);
  assert.equal(isAllowedOrigin("http://localhost:3000"), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:3000"), true);
  assert.equal(isAllowedOrigin("https://edtech-ai-portfolio-git-main-huytechnologys-projects.vercel.app"), true);
});

test("CORS Guard: denies foreign or attacker domains even if they include vercel.app", () => {
  assert.equal(isAllowedOrigin("https://evil-attacker.vercel.app"), false);
  assert.equal(isAllowedOrigin("https://not-our-project.vercel.app"), false);
  assert.equal(isAllowedOrigin("https://phishing-huycncdsai.com"), false);
});

test("Signed URL: generates and verifies cryptographic signature accurately", () => {
  const { signedUrl, expires, signature } = generateSignedUrl("res_123", SECRET, 300000);
  assert.ok(signedUrl.includes("/api/resources/proxy?id=res_123"));
  assert.equal(verifySignedUrlSignature("res_123", expires, signature, SECRET), true);

  // Rejects wrong ID
  assert.equal(verifySignedUrlSignature("res_999", expires, signature, SECRET), false);

  // Rejects wrong secret
  assert.equal(verifySignedUrlSignature("res_123", expires, signature, "wrong-secret"), false);

  // Rejects tampered signature
  assert.equal(verifySignedUrlSignature("res_123", expires, signature + "tamper", SECRET), false);

  // Rejects expired timestamp
  const expiredTime = Date.now() - 1000;
  const expiredSig = generateSignedUrl("res_123", SECRET, -1000).signature;
  assert.equal(verifySignedUrlSignature("res_123", expiredTime, expiredSig, SECRET), false);
});
