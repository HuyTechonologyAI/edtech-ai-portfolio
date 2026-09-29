import { NextResponse } from "next/server";

/**
 * OLLAMA GATEWAY — HUY AI CENTER
 * Proxies task requests to Node-01 Ollama instance (100.79.240.108:11434)
 * All task completions are logged to the SwarmState event bus for real-time
 * display on the /admincenter dashboard.
 *
 * ENVIRONMENT:
 *   OLLAMA_BASE_URL  — defaults to http://100.79.240.108:11434
 *   OLLAMA_MODEL     — defaults to qwen2.5-coder:32b
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://100.79.240.108:11434";
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:32b";
const OLLAMA_TIMEOUT_MS = 120_000; // 2 min hard cap

export interface OllamaTaskRequest {
  taskId: string;           // e.g. "08a-model-gateway"
  agentId: string;          // e.g. "L2-NODE01-CODER"
  agentName: string;
  model?: string;
  prompt: string;
  stream?: boolean;
  context?: string;         // Optional extra context
}

export interface OllamaTaskResult {
  taskId: string;
  agentId: string;
  model: string;
  response: string;
  totalDurationMs: number;
  tokensEvaluated: number;
  tokensPrompt: number;
  done: boolean;
  error?: string;
}

// ─── Shared SwarmState ref (same singleton as telemetry route) ──────────────
interface SwarmEventAppend {
  id: string;
  timestamp: string;
  fromAgent: { id: string; name: string; tier: string };
  toAgent: { id: string; name: string; tier: string } | null;
  type: "DIRECTIVE" | "A2A_COLLAB" | "EXECUTION" | "SECURITY" | "SYNC" | "AUDIT";
  businessUnit: string;
  content: string;
  latency: string;
  status: "STREAMING" | "ACKNOWLEDGED" | "COMPLETED";
}

interface SwarmStateGlobal {
  mode: string;
  lastBroadcast: unknown;
  customTasks: Record<string, { task: string; state: string; thought: string }>;
  events: SwarmEventAppend[];
  startedAt: number;
}

const globalForSwarm = globalThis as unknown as { __HUY_SWARM_STATE__?: SwarmStateGlobal };

function appendEvent(evt: SwarmEventAppend) {
  if (globalForSwarm.__HUY_SWARM_STATE__) {
    globalForSwarm.__HUY_SWARM_STATE__.events.push(evt);
    // Keep last 200 events in memory
    if (globalForSwarm.__HUY_SWARM_STATE__.events.length > 200) {
      globalForSwarm.__HUY_SWARM_STATE__.events =
        globalForSwarm.__HUY_SWARM_STATE__.events.slice(-200);
    }
  }
}

function updateAgentTask(agentId: string, task: string, state: string, thought: string) {
  if (globalForSwarm.__HUY_SWARM_STATE__) {
    globalForSwarm.__HUY_SWARM_STATE__.customTasks[agentId] = { task, state, thought };
    // Activate swarm mode
    if (globalForSwarm.__HUY_SWARM_STATE__.mode === "STANDBY_ARMED") {
      globalForSwarm.__HUY_SWARM_STATE__.mode = "AUTONOMOUS_LIVE";
    }
  }
}

// ─── Health Check (GET /api/admincenter/ollama) ──────────────────────────────
export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return NextResponse.json(
        { connected: false, error: `HTTP ${res.status}`, baseUrl: OLLAMA_BASE_URL },
        { status: 503 }
      );
    }

    const data = await res.json();
    const models: string[] = (data.models || []).map((m: { name: string }) => m.name);

    return NextResponse.json({
      connected: true,
      baseUrl: OLLAMA_BASE_URL,
      defaultModel: OLLAMA_DEFAULT_MODEL,
      availableModels: models,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { connected: false, error: message, baseUrl: OLLAMA_BASE_URL },
      { status: 503 }
    );
  }
}

// ─── Task Dispatch (POST /api/admincenter/ollama) ────────────────────────────
export async function POST(req: Request) {
  let body: OllamaTaskRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    taskId,
    agentId,
    agentName,
    model = OLLAMA_DEFAULT_MODEL,
    prompt,
    stream = false,
    context = "",
  } = body;

  if (!taskId || !agentId || !prompt) {
    return NextResponse.json(
      { error: "taskId, agentId and prompt are required" },
      { status: 400 }
    );
  }

  const tier = agentId.startsWith("L1") ? "L1" :
               agentId.startsWith("L2") ? "L2" :
               agentId.startsWith("L3") ? "L3" : "LOCAL";

  // ── Mark agent as ACTIVE in swarm ──────────────────────────────────────────
  updateAgentTask(
    agentId,
    `[OLLAMA] Task: ${taskId}`,
    "ACTIVE",
    `Đang xử lý tác vụ [${taskId}] qua Ollama Node-01 | Model: ${model}`
  );

  appendEvent({
    id: `EVT-OLLAMA-${Date.now()}`,
    timestamp: new Date().toISOString(),
    fromAgent: { id: "L0-OWNER", name: "SuperAdmin / A2A Dispatcher", tier: "L0" },
    toAgent: { id: agentId, name: agentName || agentId, tier },
    type: "EXECUTION",
    businessUnit: "HUY AI Center — Ollama Local Compute",
    content: `[OLLAMA-DISPATCH] Giao tác vụ [${taskId}] cho ${agentName || agentId} | Model: ${model} | Node-01: ${OLLAMA_BASE_URL}`,
    latency: "5.8ms",
    status: "STREAMING",
  });

  const fullPrompt = context
    ? `CONTEXT:\n${context}\n\n---\n\nTASK:\n${prompt}`
    : prompt;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        stream,
        options: {
          temperature: 0.2,
          num_predict: 4096,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      throw new Error(`Ollama HTTP ${ollamaRes.status}: ${errText}`);
    }

    if (stream) {
      // Stream SSE back to caller
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        const reader = ollamaRes.body?.getReader();
        if (!reader) { await writer.close(); return; }

        let fullResponse = "";
        let totalTokens = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                fullResponse += parsed.response;
                totalTokens += 1;
              }
              await writer.write(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));

              if (parsed.done) {
                // Final: mark agent completed
                updateAgentTask(
                  agentId,
                  `[DONE] ${taskId}`,
                  "STANDBY",
                  `Hoàn thành tác vụ [${taskId}] | ${totalTokens} tokens | Model: ${model}`
                );
                appendEvent({
                  id: `EVT-OLLAMA-DONE-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  fromAgent: { id: agentId, name: agentName || agentId, tier },
                  toAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
                  type: "EXECUTION",
                  businessUnit: "HUY AI Center — Ollama Local Compute",
                  content: `[OLLAMA-COMPLETE] Tác vụ [${taskId}] HOÀN THÀNH | ${totalTokens} tokens | ${parsed.total_duration ? Math.round(parsed.total_duration / 1e6) + 'ms' : 'N/A'}`,
                  latency: "5.8ms",
                  status: "COMPLETED",
                });
              }
            } catch { /* skip malformed JSON */ }
          }
        }
        await writer.close();
      })();

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Task-Id": taskId,
          "X-Agent-Id": agentId,
        },
      });
    }

    // Non-stream: wait for full response
    const result: OllamaTaskResult = await ollamaRes.json();

    updateAgentTask(
      agentId,
      `[DONE] ${taskId}`,
      "STANDBY",
      `Hoàn thành tác vụ [${taskId}] | ${result.tokensEvaluated || 0} tokens`
    );

    appendEvent({
      id: `EVT-OLLAMA-DONE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAgent: { id: agentId, name: agentName || agentId, tier },
      toAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
      type: "EXECUTION",
      businessUnit: "HUY AI Center — Ollama Local Compute",
      content: `[OLLAMA-COMPLETE] Tác vụ [${taskId}] HOÀN THÀNH | ${result.tokensEvaluated || 0} eval-tokens | ${result.totalDurationMs || 0}ms`,
      latency: "5.8ms",
      status: "COMPLETED",
    });

    return NextResponse.json({
      success: true,
      taskId,
      agentId,
      model,
      response: result.response,
      tokensEvaluated: result.tokensEvaluated,
      totalDurationMs: result.totalDurationMs,
    });
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);

    updateAgentTask(agentId, `[ERROR] ${taskId}`, "STANDBY", `Lỗi tác vụ: ${message}`);
    appendEvent({
      id: `EVT-OLLAMA-ERR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAgent: { id: agentId, name: agentName || agentId, tier },
      toAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
      type: "SECURITY",
      businessUnit: "HUY AI Center — Ollama Local Compute",
      content: `[OLLAMA-ERROR] Tác vụ [${taskId}] THẤT BẠI: ${message}`,
      latency: "0ms",
      status: "COMPLETED",
    });

    return NextResponse.json(
      { success: false, error: message, taskId, agentId },
      { status: 500 }
    );
  }
}
