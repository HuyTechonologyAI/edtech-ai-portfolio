import { createPublicKey, verify, type KeyObject } from "node:crypto";

export const NODE01_ID = "huy-ai-node-01";
export const NODE01_TELEMETRY_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEABjM8p/4w9yYgGtYrrd9wbrGn69nDflqRVP2sXhrkqOM=
-----END PUBLIC KEY-----
`;

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface Node01TelemetryEnvelope {
  payload: string;
  signature: string;
}

export interface Node01TelemetryPayload {
  version: 1;
  nodeId: string;
  timestamp: string;
  status: "ONLINE" | "DEGRADED";
  metrics: {
    cpu: number;
    ram: number;
    disk: number;
    ramFree: number;
    ramTotal: number;
    active: number;
    queue: number;
  };
  metadata?: Record<string, unknown>;
}

function boundedPercent(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
}

function nonNegative(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

export function validateNode01TelemetryPayload(
  input: unknown,
  now = Date.now()
): input is Node01TelemetryPayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const p = input as Partial<Node01TelemetryPayload>;
  if (p.version !== 1 || p.nodeId !== NODE01_ID) return false;
  if (p.status !== "ONLINE" && p.status !== "DEGRADED") return false;
  const ts = typeof p.timestamp === "string" ? Date.parse(p.timestamp) : NaN;
  if (!Number.isFinite(now) || !Number.isFinite(ts) || Math.abs(now - ts) > MAX_CLOCK_SKEW_MS) return false;

  const m = p.metrics;
  if (!m || !boundedPercent(m.cpu) || !boundedPercent(m.ram) || !boundedPercent(m.disk)) return false;
  if (!nonNegative(m.ramFree) || !nonNegative(m.ramTotal) || m.ramFree > m.ramTotal) return false;
  if (!nonNegative(m.active) || !nonNegative(m.queue)) return false;
  if (p.metadata !== undefined && (!p.metadata || typeof p.metadata !== "object" || Array.isArray(p.metadata))) return false;
  return true;
}

export function verifyNode01TelemetryEnvelope(
  envelope: Node01TelemetryEnvelope,
  publicKey: KeyObject | string = NODE01_TELEMETRY_PUBLIC_KEY_PEM
): boolean {
  if (!envelope || typeof envelope.payload !== "string" || typeof envelope.signature !== "string") return false;
  if (Buffer.byteLength(envelope.payload, "utf8") > 64 * 1024) return false;
  let signature: Buffer;
  try {
    signature = Buffer.from(envelope.signature, "base64");
  } catch {
    return false;
  }
  if (signature.length !== 64) return false;
  try {
    const key = typeof publicKey === "string" ? createPublicKey(publicKey) : publicKey;
    return verify(null, Buffer.from(envelope.payload, "utf8"), key, signature);
  } catch {
    return false;
  }
}
/** Re-verify persisted evidence; never trust a metadata verification flag. */
export function readSignedHeartbeatMetadata(
  row: { node_id?: unknown; created_at?: unknown; metadata?: unknown },
  publicKey: KeyObject | string = NODE01_TELEMETRY_PUBLIC_KEY_PEM,
): Record<string, unknown> | null {
  try {
    const metadata = row.metadata as Record<string, unknown> | null;
    const envelope = metadata?.signedEnvelope as Node01TelemetryEnvelope;
    if (!verifyNode01TelemetryEnvelope(envelope, publicKey)) return null;
    const payload = JSON.parse(envelope.payload);
    if (!validateNode01TelemetryPayload(payload, Date.parse(payload.timestamp))) return null;
    if (row.node_id !== payload.nodeId || typeof row.created_at !== 'string' || Date.parse(row.created_at) !== Date.parse(payload.timestamp)) return null;
    return payload.metadata ?? {};
  } catch {
    return null;
  }
}

[executed on device: huy-ai-node-01 (3d9d4003-83b9-4fae-ab79-1bd43ee9288b)]