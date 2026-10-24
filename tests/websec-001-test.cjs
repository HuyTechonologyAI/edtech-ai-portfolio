const assert = require("node:assert/strict");
const crypto = require("node:crypto");

// 1. Signature generation & verification helper (matching get-signed-url and proxy)
function generateSignature(id, expires, secret) {
  if (!secret) throw new Error("Signed URL service is not configured");
  return crypto.createHmac("sha256", secret).update(`${id}:${expires}`).digest("hex");
}

function verifySignature(id, expires, sig, secret) {
  if (!secret) return { status: 503, error: "Signed URL service is not configured" };
  const expNum = parseInt(expires, 10);
  if (Date.now() > expNum) {
    return { status: 403, error: "Link expired" };
  }
  const expectedSig = crypto.createHmac("sha256", secret).update(`${id}:${expires}`).digest("hex");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { status: 403, error: "Invalid cryptographic signature" };
  }
  return { status: 200, valid: true };
}

const SECRET = "secure_production_secret_key_2026";

// Test 1: Fail closed when secret is missing
assert.equal(verifySignature("res-1", Date.now() + 60000, "any_sig", null).status, 503);
assert.equal(verifySignature("res-1", Date.now() + 60000, "any_sig", "").status, 503);

// Test 2: Valid signature passes
const futureTime = Date.now() + 300000;
const validSig = generateSignature("res-1", futureTime, SECRET);
assert.equal(verifySignature("res-1", futureTime, validSig, SECRET).status, 200);

// Test 3: Expired link fails
const pastTime = Date.now() - 1000;
const expiredSig = generateSignature("res-1", pastTime, SECRET);
assert.equal(verifySignature("res-1", pastTime, expiredSig, SECRET).status, 403);

// Test 4: Tampered resource ID fails
assert.equal(verifySignature("res-2", futureTime, validSig, SECRET).status, 403);

// Test 5: Tampered expiry fails
assert.equal(verifySignature("res-1", futureTime + 100, validSig, SECRET).status, 403);

// Test 6: Forged signature fails
assert.equal(verifySignature("res-1", futureTime, "deadbeef12345678", SECRET).status, 403);

console.log("PASS: All WEBSEC-001 signature verification & fail-closed tests passed successfully!");
