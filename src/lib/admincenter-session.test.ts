import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  signSession,
  verifySession,
  verifyWorkerToken,
  checkLoginThrottle,
  recordLoginFailure,
  resetLoginThrottle,
  hashPassword,
  verifyPassword,
} from "./admincenter-session.js";

beforeEach(() => {
  process.env.ADMINCENTER_SESSION_SECRET = "unit-test-secret-0123456789abcdef";
  process.env.NODE01_WORKER_TOKEN = "worker-token-0123456789abcdef";
  resetLoginThrottle("1.2.3.4");
});

test("accepts a freshly signed token", () => {
  assert.equal(verifySession(signSession("admincenter", 60), "admincenter"), true);
});

test("rejects the legacy static cookie value", () => {
  assert.equal(verifySession("authenticated", "admincenter"), false);
  assert.equal(verifySession(undefined, "admincenter"), false);
});

test("rejects tampered payload or signature", () => {
  const [p, s] = signSession("admincenter", 60).split(".");
  const forged = Buffer.from(JSON.stringify({ scope: "admincenter", exp: 9999999999, iat: 1 })).toString("base64url");
  assert.equal(verifySession(`${forged}.${s}`, "admincenter"), false);
  assert.equal(verifySession(`${p}.${s}x`, "admincenter"), false);
});

test("rejects expired tokens and wrong scope", () => {
  assert.equal(verifySession(signSession("admincenter", -5), "admincenter"), false);
  assert.equal(verifySession(signSession("admin", 60), "admincenter"), false);
});

test("fails closed when no secret is configured", () => {
  const t = signSession("admincenter", 60);
  const saved = { ...process.env };
  delete process.env.ADMINCENTER_SESSION_SECRET;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal(verifySession(t, "admincenter"), false);
  assert.throws(() => signSession("admincenter", 60));
  Object.assign(process.env, saved);
});

test("worker token: exact match only, disabled when unset", () => {
  assert.equal(verifyWorkerToken("worker-token-0123456789abcdef"), true);
  assert.equal(verifyWorkerToken("wrong"), false);
  assert.equal(verifyWorkerToken(null), false);
  delete process.env.NODE01_WORKER_TOKEN;
  assert.equal(verifyWorkerToken("anything"), false);
});

test("login throttle locks after 5 failures and unlocks on reset", () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(checkLoginThrottle("1.2.3.4").allowed, true);
    recordLoginFailure("1.2.3.4");
  }
  assert.equal(checkLoginThrottle("1.2.3.4").allowed, false);
  resetLoginThrottle("1.2.3.4");
  assert.equal(checkLoginThrottle("1.2.3.4").allowed, true);
});

test("scrypt password hashing", () => {
  const rec = hashPassword("S3cret-Pass!");
  assert.equal(rec.algo, "scrypt");
  assert.equal(verifyPassword("S3cret-Pass!", rec), true);
  assert.equal(verifyPassword("other", rec), false);
});
