/**
 * SSE LIVE STREAM — HUY AI CENTER
 * Server-Sent Events endpoint that pushes real-time AI workflow events
 * to the /admincenter dashboard.
 *
 * GET /api/admincenter/stream
 * → text/event-stream
 * → pushes: telemetry snapshot, A2A queue status, agent states
 *   every POLL_INTERVAL_MS milliseconds
 */

import { getLiveTelemetryData } from "@/app/api/admincenter/telemetry/route";

const POLL_INTERVAL_MS = 1500; // 1.5s — fast enough for "live" feel
const MAX_STREAM_DURATION_MS = 5 * 60 * 1000; // 5 min max per connection

// ─── A2A Queue ref ────────────────────────────────────────────────────────────
interface A2ATaskSnapshot {
  taskId: string;
  fromAgent: string;
  toAgent: string;
  capability: string;
  priority: string;
  state: string;
  backend: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

const globalForA2A = globalThis as unknown as { __HUY_A2A_QUEUE__?: A2ATaskSnapshot[] };

function getA2ASnapshot() {
  const queue = globalForA2A.__HUY_A2A_QUEUE__ || [];
  return {
    queueDepth: queue.filter((t: A2ATaskSnapshot) => t.state === "QUEUED").length,
    inProgress: queue.filter((t: A2ATaskSnapshot) => t.state === "IN_PROGRESS").length,
    completed: queue.filter((t: A2ATaskSnapshot) => t.state === "COMPLETED").length,
    failed: queue.filter((t: A2ATaskSnapshot) => t.state === "FAILED").length,
    // Show last 10 tasks most recently active
    recentTasks: [...queue]
      .sort((a, b) => {
        const ta = a.startedAt || a.createdAt;
        const tb = b.startedAt || b.createdAt;
        return new Date(tb).getTime() - new Date(ta).getTime();
      })
      .slice(0, 10),
  };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();
  const startedAt = Date.now();

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let closeController: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      closeController = () => {
        try { controller.close(); } catch { /* already closed */ }
      };

      function push(event: string, data: unknown) {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream closed
        }
      }

      // Initial snapshot immediately
      try {
        push("telemetry", getLiveTelemetryData());
        push("a2a_queue", getA2ASnapshot());
        push("connected", {
          message: "HUY AI Center Live Stream CONNECTED",
          node01: "100.79.240.108",
          timestamp: new Date().toISOString(),
        });
      } catch { /* skip */ }

      // Periodic updates
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startedAt;

        if (elapsed > MAX_STREAM_DURATION_MS) {
          push("timeout", { message: "Stream limit reached (5 min). Reconnect to continue.", elapsed });
          if (intervalId) clearInterval(intervalId);
          closeController?.();
          return;
        }

        try {
          push("telemetry", getLiveTelemetryData());
          push("a2a_queue", getA2ASnapshot());
          push("heartbeat", { ts: new Date().toISOString(), uptime: elapsed });
        } catch {
          if (intervalId) clearInterval(intervalId);
        }
      }, POLL_INTERVAL_MS);
    },

    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
