import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { signSession } from "./admincenter-session.js";
import { verifyHubAuthInput, safeKeyEqual } from "./hub-auth.js";

const KEY = "eco-key-0123456789abcdef";

beforeEach(() => {
  process.env.ADMINCENTER_SESSION_SECRET = "unit-test-secret-0123456789abcdef";
  process.env.ECOSYSTEM_API_KEY = KEY;
  delete process.env.HUB_ADMIN_TOKEN;
  delete process.env.HUB_AGENT_TOKEN;
});

const none = { apiKeyHeader: null, authorizationHeader: null, adminSessionCookie: null };

test("denies anonymous requests", () => {
  assert.equal(verifyHubAuthInput(none), false);
});

test("REGRESSION: denies forged admin_session cookie of any length", () => {
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: "AAAAAAAAAAAA" }), false);
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: "authenticated_admin_session_val" }), false);
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: "authenticated" }), false);
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: "x".repeat(200) + ".sig" }), false);
});

test("accepts a valid signed admin session", () => {
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: signSession("admin", 60) }), true);
});

test("denies expired admin session", () => {
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: signSession("admin", -5) }), false);
});

test("denies admincenter-scoped token presented as admin_session", () => {
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: signSession("admincenter", 60) }), false);
});

test("denies tampered admin session signature", () => {
  const [body] = signSession("admin", 60).split(".");
  assert.equal(verifyHubAuthInput({ ...none, adminSessionCookie: body + ".forged" }), false);
});

test("accepts valid x-api-key and Bearer token", () => {
  assert.equal(verifyHubAuthInput({ ...none, apiKeyHeader: KEY }), true);
  assert.equal(verifyHubAuthInput({ ...none, authorizationHeader: "Bearer " + KEY }), true);
});

test("denies wrong x-api-key and Bearer token", () => {
  assert.equal(verifyHubAuthInput({ ...none, apiKeyHeader: "wrong" }), false);
  assert.equal(verifyHubAuthInput({ ...none, authorizationHeader: "Bearer wrong" }), false);
  assert.equal(verifyHubAuthInput({ ...none, authorizationHeader: "Basic " + KEY }), false);
});

test("fails closed when no API key configured (empty header cannot match)", () => {
  delete process.env.ECOSYSTEM_API_KEY;
  assert.equal(verifyHubAuthInput({ ...none, apiKeyHeader: "" }), false);
  assert.equal(verifyHubAuthInput({ ...none, authorizationHeader: "Bearer " }), false);
});

test("rejects configured keys shorter than 16 chars", () => {
  process.env.ECOSYSTEM_API_KEY = "short";
  assert.equal(verifyHubAuthInput({ ...none, apiKeyHeader: "short" }), false);
});

test("safeKeyEqual is correct", () => {
  assert.equal(safeKeyEqual("abc", "abc"), true);
  assert.equal(safeKeyEqual("abc", "abd"), false);
  assert.equal(safeKeyEqual("abc", "abcd"), false);
});
