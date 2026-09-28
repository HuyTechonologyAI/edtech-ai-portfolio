import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  type Node01TelemetryEnvelope,
  validateNode01TelemetryPayload,
  verifyNode01TelemetryEnvelope,
} from "@/lib/node01-telemetry-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let envelope: Node01TelemetryEnvelope;
  try {
    envelope = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  if (!verifyNode01TelemetryEnvelope(envelope)) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(envelope.payload);
  } catch {
    return NextResponse.json({ error: "INVALID_PAYLOAD_JSON" }, { status: 400 });
  }
  if (!validateNode01TelemetryPayload(payload)) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }
  return persistTelemetry(payload, envelope);
}

async function persistTelemetry(payload: {
  nodeId: string;
  timestamp: string;
  status: "ONLINE" | "DEGRADED";
  metrics: { cpu: number; ram: number; disk: number; ramFree: number; ramTotal: number; active: number; queue: number };
  metadata?: Record<string, unknown>;
}, envelope: Node01TelemetryEnvelope) {
  const nodeStatus = payload.status === "ONLINE" ? "online" : "error";
  const nodeResult = await supabaseAdmin
    .from("nodes")
    .update({
      status: nodeStatus,
      current_load: Math.max(0, Math.trunc(payload.metrics.active)),
      last_heartbeat_at: payload.timestamp,
      updated_at: payload.timestamp,
    })
    .eq("id", payload.nodeId);
  if (nodeResult.error) {
    console.error("[node01-telemetry] node update failed", nodeResult.error.message);
    return NextResponse.json({ error: "NODE_UPDATE_FAILED" }, { status: 500 });
  }
  const heartbeatResult = await supabaseAdmin.from("node_heartbeats").insert({
    node_id: payload.nodeId,
    cpu_usage_pct: payload.metrics.cpu,
    ram_usage_pct: payload.metrics.ram,
    ram_total_mb: Math.round(payload.metrics.ramTotal),
    ram_free_mb: Math.round(payload.metrics.ramFree),
    gpu_usage_pct: 0,
    disk_usage_pct: payload.metrics.disk,
    queue_depth: Math.max(0, Math.trunc(payload.metrics.queue)),
    active_tasks: Math.max(0, Math.trunc(payload.metrics.active)),
    status: payload.status === "ONLINE" ? "healthy" : "degraded",
    metadata: { ...payload.metadata, signedEnvelope: envelope },
    created_at: payload.timestamp,
  });
  if (heartbeatResult.error) {
    console.error("[node01-telemetry] heartbeat insert failed", heartbeatResult.error.message);
    return NextResponse.json({ error: "HEARTBEAT_INSERT_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nodeId: payload.nodeId, acceptedAt: new Date().toISOString() });
}