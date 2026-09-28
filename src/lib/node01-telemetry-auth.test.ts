import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import {
  verifyNode01TelemetryEnvelope,
  validateNode01TelemetryPayload,
} from "./node01-telemetry-auth.js";

const basePayload = {
  version: 1,
  nodeId: "huy-ai-node-01",
  timestamp: "2026-09-28T10:00:00.000Z",
  status: "ONLINE",
  metrics: { cpu: 10, ram: 20, disk: 30, ramFree: 24000, ramTotal: 32000, active: 1, queue: 2 },
  metadata: {
    supervisorState: "RUNNING",
    providerHealth: { codex: { available: true, authenticated: true, circuit: "CLOSED" } },
    backlogTaskStatuses: { "06k-c-readiness": { status: "RUNNING" } },
    runtimeWorkers: { codex: 1 },
  },
};

test("signed Node01 telemetry accepts exact payload and rejects tampering", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const payload = JSON.stringify(basePayload);
  const signature = sign(null, Buffer.from(payload), privateKey).toString("base64");
  assert.equal(verifyNode01TelemetryEnvelope({ payload, signature }, publicKey), true);
  assert.equal(verifyNode01TelemetryEnvelope({ payload: payload.replace("RUNNING", "STOPPED"), signature }, publicKey), false);
});

test("telemetry payload validates bounds, node identity and freshness", () => {
  const now = Date.parse("2026-09-28T10:01:00.000Z");
  assert.equal(validateNode01TelemetryPayload(basePayload, now), true);
  assert.equal(validateNode01TelemetryPayload({ ...basePayload, nodeId: "other" }, now), false);
  assert.equal(validateNode01TelemetryPayload({ ...basePayload, metrics: { ...basePayload.metrics, cpu: 101 } }, now), false);
  assert.equal(validateNode01TelemetryPayload({ ...basePayload, timestamp: "2026-09-28T09:50:00.000Z" }, now), false);
});