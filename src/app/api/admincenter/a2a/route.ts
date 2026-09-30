import { NextResponse } from "next/server";

/**
 * A2A PROTOCOL BUS — HUY AI CENTER
 * Agent-to-Agent communication hub.
 * Implements:
 *   - Task DAG routing (agent → agent delegation)
 *   - Capability matching (which agent can handle which task)
 *   - Ollama-backed local execution (Node-01 compute)
 *   - Result relay back to telemetry SwarmState
 *
 * Protocol:
 *   POST /api/admincenter/a2a
 *   {
 *     "action": "dispatch" | "relay" | "status" | "capability_query"
 *     ...payload
 *   }
 *
 *   GET /api/admincenter/a2a
 *   Returns current A2A task queue status
 */

// ─── A2A Types ────────────────────────────────────────────────────────────────
export interface A2ATask {
  taskId: string;
  parentTaskId?: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  capability: string;
  prompt: string;
  priority: "P0" | "P1" | "P2" | "P3";
  state: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "DELEGATED";
  result?: string;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionBackend: "OLLAMA_LOCAL" | "ANTIGRAVITY" | "CODEX" | "HUMAN_GATE";
  worktreeRef?: string;
}

// ─── Agent Capability Registry ────────────────────────────────────────────────
const CAPABILITY_REGISTRY: Record<string, { agentId: string; agentName: string; tier: string; backend: A2ATask["executionBackend"] }[]> = {
  "code_generation":    [{ agentId: "L2-NODE01-CODER", agentName: "Qwen Coder 32B (Node-01)", tier: "L2", backend: "OLLAMA_LOCAL" }],
  "code_review":        [{ agentId: "L2-NODE01-REVIEWER", agentName: "Qwen Reviewer (Node-01)", tier: "L2", backend: "OLLAMA_LOCAL" }],
  "test_design":        [{ agentId: "L2-NODE01-TDD", agentName: "TDD Agent (Node-01)", tier: "L2", backend: "OLLAMA_LOCAL" }],
  "api_gateway":        [{ agentId: "L2-NODE01-CODER", agentName: "Qwen Coder 32B (Node-01)", tier: "L2", backend: "OLLAMA_LOCAL" }],
  "architecture":       [{ agentId: "L1-P01", agentName: "HAIP Dispatcher Core", tier: "L1", backend: "OLLAMA_LOCAL" }],
  "security_audit":     [{ agentId: "L1-S01", agentName: "Security Sentinel Prime", tier: "L1", backend: "OLLAMA_LOCAL" }],
  "data_pipeline":      [{ agentId: "L3-DP01", agentName: "Data Pipeline Specialist", tier: "L3", backend: "OLLAMA_LOCAL" }],
  "documentation":      [{ agentId: "L3-DOC01", agentName: "Documentation Writer", tier: "L3", backend: "OLLAMA_LOCAL" }],
  "human_approval":     [{ agentId: "L0-OWNER", agentName: "Human Owner (Root of Trust)", tier: "L0", backend: "HUMAN_GATE" }],
};

// ─── V1.1 Pending Tasks from Architecture Plan ────────────────────────────────
const PLANNED_TASKS: { taskId: string; capability: string; prompt: string; priority: A2ATask["priority"]; description: string }[] = [
  {
    taskId: "08a-model-gateway",
    capability: "api_gateway",
    priority: "P0",
    description: "IMPLEMENTATION phase — build Ollama model gateway adapter",
    prompt: `You are implementing task 08a-model-gateway for HUY AI Center.
Phase: IMPLEMENTATION (tests are RED, make them GREEN)
Task: Build a production-ready Ollama model gateway that:
1. Accepts structured prompts from the A2A bus
2. Routes to the correct Ollama model on Node-01 (100.79.240.108:11434)
3. Streams token-by-token completions via SSE
4. Reports completion events back to SwarmState telemetry
5. Handles circuit-breaker for Node-01 connectivity loss
Follow: PREDICT → TEST FIRST → CONFIRM RED → IMPLEMENT → EXECUTE → DIAGNOSE → AUTO REPAIR → RETEST → GREEN
Output: Production TypeScript code with full error handling.`,
  },
  {
    taskId: "09-worktree-isolation",
    capability: "architecture",
    priority: "P1",
    description: "Set up isolated worktrees for multi-AI parallel execution",
    prompt: `Task: Set up .agent-worktrees/ directory structure for HUY AI Center V1.1.
Create isolated git worktrees for: antigravity, codex, claude, gemini, integration/current
Each worktree must have: AGENT_MANIFEST.json, test/, src/, CHECKPOINT.md
Follow V1.1 architecture: each agent works in isolation, results merge via Integration Queue.`,
  },
  {
    taskId: "10-pgmq-real-queue",
    capability: "data_pipeline",
    priority: "P1",
    description: "Implement real PGMQ-style persistent message queue",
    prompt: `Task: Implement a real persistent message queue for HUY AI Center.
Replace the in-memory SwarmState.events with a durable queue backed by filesystem JSON on Node-01.
Queue should support: enqueue, dequeue, acknowledge, dead-letter, priority ordering.
API: POST /api/admincenter/queue with action: enqueue|dequeue|ack|status`,
  },
  {
    taskId: "11-a2a-streaming-panel",
    capability: "code_generation",
    priority: "P1",
    description: "Build real-time A2A streaming panel on admincenter",
    prompt: `Task: Build a live streaming panel component for /admincenter showing A2A agent work in real-time.
Panel should show:
- Agent currently working (name, model, task)
- Token stream output (scrolling terminal style)
- Task DAG graph (parent → child agent delegation)
- Latency metrics per hop
Use SSE from /api/admincenter/stream endpoint.`,
  },
  {
    taskId: "12-ollama-health-monitor",
    capability: "code_generation",
    priority: "P2",
    description: "Node-01 Ollama health monitor with auto-reconnect",
    prompt: `Task: Build a health monitor for Ollama on Node-01 (100.79.240.108:11434).
Features: ping every 30s, alert on failure, auto-retry with exponential backoff,
display model load status, VRAM usage, running models count.
Show on /admincenter Node-01 tab.`,
  },
];

// ─── In-memory A2A Task Queue ─────────────────────────────────────────────────
const globalForA2A = globalThis as unknown as { __HUY_A2A_QUEUE__?: A2ATask[] };
if (!globalForA2A.__HUY_A2A_QUEUE__) {
  // Pre-populate with planned tasks from V1.1 architecture
  globalForA2A.__HUY_A2A_QUEUE__ = PLANNED_TASKS.map((pt) => ({
    taskId: pt.taskId,
    fromAgentId: "L0-OWNER",
    fromAgentName: "SuperAdmin / Architecture Plan V1.1",
    toAgentId: CAPABILITY_REGISTRY[pt.capability]?.[0]?.agentId || "L2-NODE01-CODER",
    toAgentName: CAPABILITY_REGISTRY[pt.capability]?.[0]?.agentName || "Qwen Coder 32B (Node-01)",
    capability: pt.capability,
    prompt: pt.prompt,
    priority: pt.priority,
    state: "QUEUED" as const,
    createdAt: new Date().toISOString(),
    executionBackend: CAPABILITY_REGISTRY[pt.capability]?.[0]?.backend || "OLLAMA_LOCAL",
    worktreeRef: `.agent-worktrees/${pt.taskId}`,
  }));
}

const a2aQueue = globalForA2A.__HUY_A2A_QUEUE__!;

// ─── SwarmState ref ───────────────────────────────────────────────────────────
interface SwarmEventAppend {
  id: string; timestamp: string;
  fromAgent: { id: string; name: string; tier: string };
  toAgent: { id: string; name: string; tier: string } | null;
  type: "DIRECTIVE" | "A2A_COLLAB" | "EXECUTION" | "SECURITY" | "SYNC" | "AUDIT";
  businessUnit: string; content: string; latency: string;
  status: "STREAMING" | "ACKNOWLEDGED" | "COMPLETED";
}
interface SwarmStateGlobal {
  mode: string; lastBroadcast: unknown;
  customTasks: Record<string, { task: string; state: string; thought: string }>;
  events: SwarmEventAppend[]; startedAt: number;
}
const globalForSwarm = globalThis as unknown as { __HUY_SWARM_STATE__?: SwarmStateGlobal };

function appendSwarmEvent(evt: SwarmEventAppend) {
  if (globalForSwarm.__HUY_SWARM_STATE__) {
    globalForSwarm.__HUY_SWARM_STATE__.events.push(evt);
    if (globalForSwarm.__HUY_SWARM_STATE__.events.length > 200) {
      globalForSwarm.__HUY_SWARM_STATE__.events =
        globalForSwarm.__HUY_SWARM_STATE__.events.slice(-200);
    }
  }
}

// ─── GET — Queue Status ───────────────────────────────────────────────────────
export async function GET() {
  const queued = a2aQueue.filter(t => t.state === "QUEUED").length;
  const inProgress = a2aQueue.filter(t => t.state === "IN_PROGRESS").length;
  const completed = a2aQueue.filter(t => t.state === "COMPLETED").length;
  const failed = a2aQueue.filter(t => t.state === "FAILED").length;

  return NextResponse.json({
    queueDepth: queued,
    inProgress,
    completed,
    failed,
    totalTasks: a2aQueue.length,
    tasks: a2aQueue.map(t => ({
      taskId: t.taskId,
      fromAgent: t.fromAgentName,
      toAgent: t.toAgentName,
      capability: t.capability,
      priority: t.priority,
      state: t.state,
      backend: t.executionBackend,
      worktreeRef: t.worktreeRef,
      createdAt: t.createdAt,
      startedAt: t.startedAt,
      completedAt: t.completedAt,
      error: t.error,
    })),
    capabilityRegistry: CAPABILITY_REGISTRY,
    plannedTaskCount: PLANNED_TASKS.length,
    timestamp: new Date().toISOString(),
  });
}

// ─── POST — A2A Actions ───────────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  // ── dispatch: add a new task to queue ────────────────────────────────────
  if (action === "dispatch") {
    const { taskId, fromAgentId, fromAgentName, capability, prompt, priority, context } = body as {
      taskId: string; fromAgentId: string; fromAgentName: string;
      capability: string; prompt: string; priority?: string; context?: string;
    };

    if (!taskId || !fromAgentId || !capability || !prompt) {
      return NextResponse.json({ error: "taskId, fromAgentId, capability, prompt required" }, { status: 400 });
    }

    const handlers = CAPABILITY_REGISTRY[capability];
    if (!handlers || handlers.length === 0) {
      return NextResponse.json({ error: `No agent registered for capability: ${capability}` }, { status: 404 });
    }

    const handler = handlers[0];
    const task: A2ATask = {
      taskId,
      fromAgentId,
      fromAgentName: String(fromAgentName || fromAgentId),
      toAgentId: handler.agentId,
      toAgentName: handler.agentName,
      capability,
      prompt: context ? `CONTEXT:\n${context}\n\nTASK:\n${prompt}` : String(prompt),
      priority: (priority as A2ATask["priority"]) || "P1",
      state: "QUEUED",
      createdAt: new Date().toISOString(),
      executionBackend: handler.backend,
      worktreeRef: `.agent-worktrees/${taskId}`,
    };

    // Replace if already exists
    const existingIdx = a2aQueue.findIndex(t => t.taskId === taskId);
    if (existingIdx >= 0) {
      a2aQueue[existingIdx] = task;
    } else {
      a2aQueue.push(task);
    }

    appendSwarmEvent({
      id: `EVT-A2A-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAgent: { id: fromAgentId, name: String(fromAgentName || fromAgentId), tier: "L0" },
      toAgent: { id: handler.agentId, name: handler.agentName, tier: handler.tier },
      type: "A2A_COLLAB",
      businessUnit: "HUY AI Center — A2A Bus",
      content: `[A2A-DISPATCH] Tác vụ [${taskId}] | Capability: ${capability} | → ${handler.agentName} | Backend: ${handler.backend}`,
      latency: "5.8ms",
      status: "ACKNOWLEDGED",
    });

    return NextResponse.json({ success: true, task });
  }

  // ── execute: run next QUEUED task against Ollama ─────────────────────────
  if (action === "execute_next") {
    const nextTask = a2aQueue
      .filter(t => t.state === "QUEUED" && t.executionBackend === "OLLAMA_LOCAL")
      .sort((a, b) => {
        const pOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      })[0];

    if (!nextTask) {
      return NextResponse.json({ success: true, message: "No QUEUED tasks with OLLAMA_LOCAL backend", queued: 0 });
    }

    nextTask.state = "IN_PROGRESS";
    nextTask.startedAt = new Date().toISOString();

    appendSwarmEvent({
      id: `EVT-A2A-EXEC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAgent: { id: "L0-A2A-BUS", name: "A2A Orchestrator", tier: "L0" },
      toAgent: { id: nextTask.toAgentId, name: nextTask.toAgentName, tier: "L2" },
      type: "EXECUTION",
      businessUnit: "HUY AI Center — Ollama Execution",
      content: `[EXECUTE] Bắt đầu thực thi [${nextTask.taskId}] | Worktree: ${nextTask.worktreeRef} | Ollama: ${process.env.OLLAMA_BASE_URL || "http://100.79.240.108:11434"}`,
      latency: "5.8ms",
      status: "STREAMING",
    });

    // Fire off to Ollama gateway (non-blocking via fetch to self)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/admincenter/ollama`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: nextTask.taskId,
        agentId: nextTask.toAgentId,
        agentName: nextTask.toAgentName,
        prompt: nextTask.prompt,
        stream: false,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        const idx = a2aQueue.findIndex(t => t.taskId === nextTask.taskId);
        if (idx >= 0) {
          if (data.success) {
            a2aQueue[idx].state = "COMPLETED";
            a2aQueue[idx].result = data.response;
            a2aQueue[idx].completedAt = new Date().toISOString();
          } else {
            a2aQueue[idx].state = "FAILED";
            a2aQueue[idx].error = data.error;
            a2aQueue[idx].completedAt = new Date().toISOString();
          }
        }
      })
      .catch((err) => {
        const idx = a2aQueue.findIndex(t => t.taskId === nextTask.taskId);
        if (idx >= 0) {
          a2aQueue[idx].state = "FAILED";
          a2aQueue[idx].error = err.message;
          a2aQueue[idx].completedAt = new Date().toISOString();
        }
      });

    return NextResponse.json({
      success: true,
      message: `Task ${nextTask.taskId} dispatched to Ollama`,
      task: { taskId: nextTask.taskId, toAgent: nextTask.toAgentName, backend: nextTask.executionBackend },
    });
  }

  // ── capability_query: which agents handle a capability ───────────────────
  if (action === "capability_query") {
    const { capability } = body as { capability: string };
    const handlers = capability ? CAPABILITY_REGISTRY[capability] : CAPABILITY_REGISTRY;
    return NextResponse.json({ capability, handlers: handlers || [] });
  }

  // ── task_result: agent pushes result back ─────────────────────────────────
  if (action === "task_result") {
    const { taskId, result, error } = body as { taskId: string; result?: string; error?: string };
    const idx = a2aQueue.findIndex(t => t.taskId === taskId);
    if (idx < 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    a2aQueue[idx].state = error ? "FAILED" : "COMPLETED";
    a2aQueue[idx].result = result;
    a2aQueue[idx].error = error;
    a2aQueue[idx].completedAt = new Date().toISOString();

    appendSwarmEvent({
      id: `EVT-A2A-RESULT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromAgent: { id: a2aQueue[idx].toAgentId, name: a2aQueue[idx].toAgentName, tier: "L2" },
      toAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
      type: "EXECUTION",
      businessUnit: "HUY AI Center — A2A Bus",
      content: error
        ? `[A2A-FAIL] Tác vụ [${taskId}] THẤT BẠI: ${error}`
        : `[A2A-PASS] Tác vụ [${taskId}] HOÀN THÀNH. Kết quả sẵn sàng để tích hợp.`,
      latency: "5.8ms",
      status: "COMPLETED",
    });

    return NextResponse.json({ success: true, taskId, state: a2aQueue[idx].state });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
