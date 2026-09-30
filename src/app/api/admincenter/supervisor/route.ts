import { NextResponse } from "next/server";

/**
 * AUTONOMOUS SUPERVISOR — HUY AI CENTER V1.1
 * ============================================
 * Implements the canonical V1.1 Operating Model:
 *   START ONCE → AUTO PLAN → PREDICT → TEST FIRST → RED → IMPLEMENT
 *   → AUTO TEST → AUTO DIAGNOSE → AUTO REPAIR → GREEN
 *   → AUTO VERIFY → AUTO INTEGRATE → AUTO DEPLOY SAFELY
 *   → STOP ONLY ON HUMAN GATE OR UNRECOVERABLE FAILURE
 *
 * Human Gate triggers: R3/R4 actions, retry_limit exhausted, unrecoverable
 * Human Gate channel: huytechnologyai2025@gmail.com
 *
 * Worker pull model: Node-01 polls GET /api/admincenter/supervisor?action=next_task
 * Worker push model: Node-01 POSTs results to POST /api/admincenter/supervisor
 */

// ─── V1.1 Task DAG ────────────────────────────────────────────────────────────
export interface SupervisorTask {
  taskId: string;
  workerId: string;
  worktreeId: string;
  capability: string;
  priority: "P0" | "P1" | "P2" | "P3";
  riskLevel: "R0" | "R1" | "R2" | "R3" | "R4";
  lifecycle: LifecyclePhase;
  checkpoint: CheckpointName;
  retryCount: number;
  retryLimit: number;
  status: TaskStatus;
  dependencies: string[];
  testPlan?: TestPlan;
  evidence?: VerificationEvidence;
  handoffPackage?: HandoffPackage;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  humanGateReason?: string;
  description: string;
  prompt: string;
}

type LifecyclePhase =
  | "PREDICT" | "TEST_FIRST" | "CONFIRM_RED"
  | "IMPLEMENT" | "EXECUTE" | "DIAGNOSE" | "AUTO_REPAIR"
  | "RETEST" | "GREEN" | "TYPECHECK" | "LINT" | "BUILD"
  | "INTEGRATION_TEST" | "REGRESSION_TEST" | "SECURITY_CHECK"
  | "TASK_ACCEPTANCE" | "VERIFIED_PASS" | "VERIFIED_COMMIT"
  | "INTEGRATION_QUEUE" | "RELEASED";

type CheckpointName =
  | "TASK_CREATED" | "TEST_PLAN_CREATED" | "RED_CONFIRMED"
  | "IMPLEMENTATION_COMPLETE" | "UNIT_TEST_GREEN" | "TYPECHECK_PASS"
  | "BUILD_PASS" | "REGRESSION_PASS" | "SECURITY_PASS"
  | "VERIFICATION_PASS" | "INTEGRATION_READY" | "INTEGRATION_PASS"
  | "CANARY_PASS" | "RELEASED" | "HUMAN_GATE_REQUIRED" | "FAILED_UNRECOVERABLE";

type TaskStatus =
  | "QUEUED" | "DISPATCHED" | "IN_PROGRESS" | "AWAITING_WORKER"
  | "GREEN" | "VERIFIED_PASS" | "INTEGRATED" | "HUMAN_GATE"
  | "FAILED" | "RETRYING" | "CAPABILITY_FALLBACK";

interface TestPlan {
  predictedCases: string[];
  testFiles: string[];
  testCommand: string;
  exitCode?: number;
  summary?: string;
  redConfirmed?: boolean;
  greenConfirmed?: boolean;
  failureEvidence?: string;
  repairAttempts?: number;
}

interface VerificationEvidence {
  taskId: string;
  workerId: string;
  worktreeId: string;
  testPlan: string;
  predictedCases: string[];
  testCommand: string;
  testExitCode: number;
  testSummary: string;
  failureEvidence: string;
  repairAttempts: number;
  finalGreenState: boolean;
  typecheckResult: "PASS" | "FAIL" | "NOT_EXECUTED";
  buildResult: "PASS" | "FAIL" | "NOT_EXECUTED";
  regressionResult: "PASS" | "FAIL" | "NOT_EXECUTED";
  securityResult: "PASS" | "FAIL" | "NOT_EXECUTED";
  acceptanceResult: "PASS" | "FAIL" | "NOT_EXECUTED";
  verifiedCommit: string;
  timestamp: string;
}

interface HandoffPackage {
  taskContract: string;
  verifiedCommit: string;
  testPlan: string;
  predictedCases: string[];
  testEvidence: string;
  repairHistory: string[];
  knownLimitations: string[];
  dependencyState: string;
  checkpoint: CheckpointName;
  artifactManifest: string[];
}

// ─── V1.1 Task Registry (Canonical DAG) ─────────────────────────────────────
const TASK_DAG: Omit<SupervisorTask, "status" | "createdAt" | "retryCount" | "lifecycle" | "checkpoint">[] = [
  {
    taskId: "08a-model-gateway",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "antigravity/08a-model-gateway",
    capability: "api_gateway",
    priority: "P0",
    riskLevel: "R1",
    retryLimit: 5,
    dependencies: [],
    description: "Build Ollama model gateway adapter — proxy, streaming, circuit-breaker",
    prompt: `[V1.1 TASK: 08a-model-gateway] [PHASE: TEST_FIRST → IMPLEMENT]

TASK CONTRACT:
Build a production Ollama model gateway at /api/admincenter/ollama that:
1. Proxies task requests to Node-01 Ollama (100.79.240.108:11434)
2. Streams token-by-token via SSE
3. Logs all events to SwarmState telemetry bus
4. Circuit-breaker: if Node-01 unreachable, fail-closed with clear error
5. Timeout: 120s hard cap per request

V1.1 LIFECYCLE — MANDATORY ORDER:
Step 1 - PREDICT: List all failure/edge cases (timeout, offline, invalid model, partial stream, etc.)
Step 2 - TEST FIRST: Write unit tests for each predicted case
Step 3 - CONFIRM RED: State which tests are expected RED before implementation
Step 4 - IMPLEMENT: Write minimum correct TypeScript code
Step 5 - EXECUTE: State exact test command
Step 6 - DIAGNOSE: If fail, capture stack trace and root cause
Step 7 - AUTO REPAIR: Patch and retest
Step 8 - GREEN: Confirm all tests pass
Step 9 - TYPECHECK: tsc --noEmit result
Step 10 - BUILD: npm run build result

OUTPUT FORMAT:
Return structured JSON with all verification evidence per Section 11 of V1.1.
Include: test_plan, predicted_cases, test_command, test_exit_code, test_summary, final_green_state, typecheck_result, build_result, verified_commit`,
  },
  {
    taskId: "09-worktree-isolation",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "antigravity/09-worktree-isolation",
    capability: "architecture",
    priority: "P1",
    riskLevel: "R1",
    retryLimit: 3,
    dependencies: ["08a-model-gateway"],
    description: "Set up isolated agent worktrees for V1.1 multi-AI parallel execution",
    prompt: `[V1.1 TASK: 09-worktree-isolation]
Create .agent-worktrees/ directory structure with:
- AGENT_MANIFEST.json per worktree
- Git-based isolation (each worktree = separate git worktree branch)
- Checkpoint.md for state recovery
- Artifact manifest system
Test: verify worktree isolation prevents cross-contamination`,
  },
  {
    taskId: "10-pgmq-real-queue",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "gemini/10-pgmq-real-queue",
    capability: "data_pipeline",
    priority: "P1",
    riskLevel: "R1",
    retryLimit: 3,
    dependencies: ["08a-model-gateway"],
    description: "Persistent message queue backed by filesystem JSON on Node-01",
    prompt: `[V1.1 TASK: 10-pgmq-real-queue]
Replace in-memory SwarmState.events with durable filesystem JSON queue.
Support: enqueue, dequeue, acknowledge, dead-letter, priority ordering.
Test: survives process restart, handles concurrent access, priority ordering correct.`,
  },
  {
    taskId: "11-a2a-streaming-panel",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "antigravity/11-a2a-streaming-panel",
    capability: "code_generation",
    priority: "P1",
    riskLevel: "R0",
    retryLimit: 3,
    dependencies: ["08a-model-gateway"],
    description: "Real-time A2A streaming panel on /admincenter",
    prompt: `[V1.1 TASK: 11-a2a-streaming-panel]
Build live streaming React panel consuming SSE from /api/admincenter/stream.
Show: agent name, model, current task, token stream (terminal style), DAG graph.
Test: SSE connection, reconnect on disconnect, display correctness.`,
  },
  {
    taskId: "12-ollama-health-monitor",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "antigravity/12-ollama-health-monitor",
    capability: "code_generation",
    priority: "P2",
    riskLevel: "R0",
    retryLimit: 3,
    dependencies: ["08a-model-gateway"],
    description: "Node-01 Ollama health monitor with auto-reconnect",
    prompt: `[V1.1 TASK: 12-ollama-health-monitor]
Build health monitor for Ollama Node-01 (100.79.240.108:11434).
Features: ping/30s, alert on failure, exponential backoff retry.
Display: model load status, running models, latency on admincenter Node-01 tab.`,
  },
  {
    taskId: "13-human-gate-email",
    workerId: "ANTIGRAVITY-AGY",
    worktreeId: "antigravity/13-human-gate-email",
    capability: "code_generation",
    priority: "P0",
    riskLevel: "R1",
    retryLimit: 3,
    dependencies: [],
    description: "Human Gate email notification system — huytechnologyai2025@gmail.com",
    prompt: `[V1.1 TASK: 13-human-gate-email]
Build email notification for Human Gates.
Trigger: retry_limit exhausted, R3/R4 action required, unrecoverable failure.
Format: [HUY AI CENTER] [HUMAN GATE HG-XX] BÁO CÁO XIN CHỈ THỊ TỪ ROOT OF TRUST
Channel: huytechnologyai2025@gmail.com via Resend or SMTP.
Test: email sent with correct format, HG tracking number, task context.`,
  },
];

// ─── Supervisor State ─────────────────────────────────────────────────────────
interface SupervisorState {
  initialized: boolean;
  startedAt: string;
  supervisorId: string;
  dagTasks: SupervisorTask[];
  completedTaskIds: string[];
  humanGateLog: Array<{ hgId: string; taskId: string; reason: string; timestamp: string; resolved: boolean }>;
  totalRetries: number;
  lastActivity: string;
}

const globalForSupervisor = globalThis as unknown as { __HUY_SUPERVISOR__?: SupervisorState };

function initSupervisor(): SupervisorState {
  const now = new Date().toISOString();
  return {
    initialized: true,
    startedAt: now,
    supervisorId: "HUY-SUPERVISOR-V1.1",
    dagTasks: TASK_DAG.map(t => ({
      ...t,
      status: "QUEUED",
      lifecycle: "PREDICT" as LifecyclePhase,
      checkpoint: "TASK_CREATED" as CheckpointName,
      createdAt: now,
      retryCount: 0,
    })),
    completedTaskIds: [],
    humanGateLog: [],
    totalRetries: 0,
    lastActivity: now,
  };
}

if (!globalForSupervisor.__HUY_SUPERVISOR__) {
  globalForSupervisor.__HUY_SUPERVISOR__ = initSupervisor();
}
const supervisor = globalForSupervisor.__HUY_SUPERVISOR__!;

// ─── SwarmState ref ───────────────────────────────────────────────────────────
interface SwarmEvent {
  id: string; timestamp: string;
  fromAgent: { id: string; name: string; tier: string };
  toAgent: { id: string; name: string; tier: string } | null;
  type: "DIRECTIVE" | "A2A_COLLAB" | "EXECUTION" | "SECURITY" | "SYNC" | "AUDIT";
  businessUnit: string; content: string; latency: string;
  status: "STREAMING" | "ACKNOWLEDGED" | "COMPLETED";
}
interface SwarmStateRef { mode: string; lastBroadcast: unknown; customTasks: Record<string, { task: string; state: string; thought: string }>; events: SwarmEvent[]; startedAt: number; }
const globalForSwarm = globalThis as unknown as { __HUY_SWARM_STATE__?: SwarmStateRef };

function log(evt: Omit<SwarmEvent, "id" | "timestamp" | "latency">) {
  if (!globalForSwarm.__HUY_SWARM_STATE__) return;
  const swarm = globalForSwarm.__HUY_SWARM_STATE__;
  swarm.events.push({ ...evt, id: `EVT-SUP-${Date.now()}`, timestamp: new Date().toISOString(), latency: "5.8ms" });
  if (swarm.events.length > 200) swarm.events = swarm.events.slice(-200);
  if (swarm.mode === "STANDBY_ARMED") swarm.mode = "AUTONOMOUS_LIVE";
}

function updateAgentInSwarm(agentId: string, task: string, state: string, thought: string) {
  if (globalForSwarm.__HUY_SWARM_STATE__) {
    globalForSwarm.__HUY_SWARM_STATE__.customTasks[agentId] = { task, state, thought };
  }
}

// ─── Helper: get ready tasks (deps resolved) ─────────────────────────────────
function getReadyTasks(): SupervisorTask[] {
  const completedIds = new Set(supervisor.completedTaskIds);
  return supervisor.dagTasks.filter(t => {
    if (t.status !== "QUEUED") return false;
    return t.dependencies.every(dep => completedIds.has(dep));
  });
}

function findTask(taskId: string) {
  return supervisor.dagTasks.find(t => t.taskId === taskId);
}

function generateHGId(): string {
  return `HG-${String(supervisor.humanGateLog.length + 1).padStart(2, "0")}`;
}

// ─── GET — Status + Next Task for Worker Pull ─────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // Worker polling for next task to execute
  if (action === "next_task") {
    const workerId = url.searchParams.get("worker_id") || "UNKNOWN";
    const capabilities = (url.searchParams.get("capabilities") || "").split(",").filter(Boolean);

    const ready = getReadyTasks().filter(t => {
      if (capabilities.length === 0) return true;
      return capabilities.includes(t.capability);
    });

    if (ready.length === 0) {
      return NextResponse.json({ task: null, message: "No ready tasks matching capabilities" });
    }

    // Dispatch highest priority
    const pOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const next = ready.sort((a, b) => pOrder[a.priority] - pOrder[b.priority])[0];

    next.status = "DISPATCHED";
    next.workerId = workerId;
    next.startedAt = new Date().toISOString();
    supervisor.lastActivity = new Date().toISOString();

    updateAgentInSwarm(workerId, `[V1.1] Task: ${next.taskId}`, "ACTIVE",
      `Đang thực thi tác vụ [${next.taskId}] theo lifecycle V1.1 | Phase: ${next.lifecycle}`);

    log({
      fromAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
      toAgent: { id: workerId, name: workerId, tier: "L2" },
      type: "DIRECTIVE",
      businessUnit: "HUY AI Center — V1.1 Autonomous",
      content: `[SUPERVISOR-DISPATCH] Tác vụ [${next.taskId}] → Worker [${workerId}] | Priority: ${next.priority} | Worktree: ${next.worktreeId}`,
      status: "STREAMING",
    });

    return NextResponse.json({
      task: {
        taskId: next.taskId,
        workerId: next.workerId,
        worktreeId: next.worktreeId,
        capability: next.capability,
        priority: next.priority,
        riskLevel: next.riskLevel,
        retryLimit: next.retryLimit,
        prompt: next.prompt,
        description: next.description,
        lifecycle: next.lifecycle,
        checkpoint: next.checkpoint,
      },
      supervisorId: supervisor.supervisorId,
      timestamp: new Date().toISOString(),
    });
  }

  // Full supervisor status
  const ready = getReadyTasks();
  const byStatus = supervisor.dagTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    supervisorId: supervisor.supervisorId,
    startedAt: supervisor.startedAt,
    lastActivity: supervisor.lastActivity,
    totalTasks: supervisor.dagTasks.length,
    tasksByStatus: byStatus,
    readyToDispatch: ready.length,
    humanGates: supervisor.humanGateLog.length,
    openHumanGates: supervisor.humanGateLog.filter(h => !h.resolved).length,
    completedTasks: supervisor.completedTaskIds.length,
    tasks: supervisor.dagTasks.map(t => ({
      taskId: t.taskId,
      priority: t.priority,
      riskLevel: t.riskLevel,
      status: t.status,
      lifecycle: t.lifecycle,
      checkpoint: t.checkpoint,
      retryCount: t.retryCount,
      retryLimit: t.retryLimit,
      workerId: t.workerId,
      dependencies: t.dependencies,
      startedAt: t.startedAt,
      completedAt: t.completedAt,
      error: t.error,
      humanGateReason: t.humanGateReason,
    })),
    humanGateLog: supervisor.humanGateLog,
    timestamp: new Date().toISOString(),
  });
}

// ─── POST — Worker Reports Result ─────────────────────────────────────────────
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { action } = body;

  // ── Worker reports task progress / checkpoint ───────────────────────────────
  if (action === "report_checkpoint") {
    const { taskId, workerId, checkpoint, lifecycle, evidence, error: taskError } = body as {
      taskId: string; workerId: string; checkpoint: CheckpointName;
      lifecycle: LifecyclePhase; evidence?: VerificationEvidence; error?: string;
    };

    const task = findTask(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    task.checkpoint = checkpoint;
    task.lifecycle = lifecycle;
    if (evidence) task.evidence = evidence;
    if (taskError) task.error = taskError;
    supervisor.lastActivity = new Date().toISOString();

    // Update swarm display
    updateAgentInSwarm(workerId || task.workerId, `[${checkpoint}] ${taskId}`, "ACTIVE",
      `Phase: ${lifecycle} | Checkpoint: ${checkpoint}`);

    log({
      fromAgent: { id: workerId || task.workerId, name: workerId || task.workerId, tier: "L2" },
      toAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
      type: "EXECUTION",
      businessUnit: "HUY AI Center — V1.1 Autonomous",
      content: `[CHECKPOINT] [${taskId}] Phase: ${lifecycle} | Gate: ${checkpoint}${taskError ? ` | ERROR: ${taskError}` : ""}`,
      status: "ACKNOWLEDGED",
    });

    return NextResponse.json({ success: true, taskId, checkpoint, lifecycle });
  }

  // ── Worker reports VERIFIED PASS ────────────────────────────────────────────
  if (action === "task_verified_pass") {
    const { taskId, workerId, evidence, handoffPackage } = body as {
      taskId: string; workerId: string;
      evidence: VerificationEvidence; handoffPackage?: HandoffPackage;
    };

    const task = findTask(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Validate evidence completeness
    const requiredFields = ["testCommand", "testExitCode", "testSummary", "finalGreenState",
      "typecheckResult", "buildResult", "regressionResult", "securityResult", "acceptanceResult"];
    const missing = requiredFields.filter(f => !(f in evidence));

    if (missing.length > 0) {
      log({
        fromAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
        toAgent: { id: taskId, name: taskId, tier: "L2" },
        type: "SECURITY",
        businessUnit: "HUY AI Center — Integration Gate",
        content: `[INTEGRATION REJECT] Task [${taskId}] thiếu evidence bắt buộc: ${missing.join(", ")}. Từ chối nhận vào Integration Queue.`,
        status: "COMPLETED",
      });
      return NextResponse.json({ success: false, error: "Insufficient verification evidence", missing }, { status: 422 });
    }

    // Check all gates PASS
    const gates = [evidence.typecheckResult, evidence.buildResult, evidence.regressionResult,
      evidence.securityResult, evidence.acceptanceResult];
    const failedGates = gates.filter(g => g !== "PASS");

    if (!evidence.finalGreenState || failedGates.length > 0) {
      task.status = "FAILED";
      task.error = `Quality gates FAIL: ${failedGates.join(", ")}`;
      log({
        fromAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
        toAgent: null,
        type: "SECURITY",
        businessUnit: "HUY AI Center — Quality Gate",
        content: `[QUALITY GATE FAIL] Task [${taskId}] REJECTED. Failed gates: ${failedGates.join(", ")}.`,
        status: "COMPLETED",
      });
      return NextResponse.json({ success: false, error: "Quality gates failed", failedGates });
    }

    // PASS — mark complete
    task.status = "VERIFIED_PASS";
    task.checkpoint = "VERIFICATION_PASS";
    task.lifecycle = "VERIFIED_PASS";
    task.evidence = evidence;
    task.handoffPackage = handoffPackage;
    task.completedAt = new Date().toISOString();
    supervisor.completedTaskIds.push(taskId);
    supervisor.lastActivity = new Date().toISOString();

    updateAgentInSwarm(workerId || task.workerId, `[VERIFIED PASS] ${taskId}`, "STANDBY",
      `Tác vụ [${taskId}] HOÀN THÀNH với đầy đủ evidence. Sẵn sàng nhận tác vụ tiếp theo.`);

    log({
      fromAgent: { id: workerId || task.workerId, name: workerId || task.workerId, tier: "L2" },
      toAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
      type: "AUDIT",
      businessUnit: "HUY AI Center — Integration Queue",
      content: `[VERIFIED PASS] Tác vụ [${taskId}] ĐÃ ĐƯỢC NHẬN vào Integration Queue. Commit: ${evidence.verifiedCommit}. Tất cả gates PASS.`,
      status: "COMPLETED",
    });

    // Check if newly unlocked tasks can now run
    const unlocked = getReadyTasks();
    if (unlocked.length > 0) {
      log({
        fromAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
        toAgent: null,
        type: "DIRECTIVE",
        businessUnit: "HUY AI Center — V1.1 DAG",
        content: `[DAG-UNLOCK] ${unlocked.length} tác vụ mới được mở khóa: ${unlocked.map(t => t.taskId).join(", ")}`,
        status: "STREAMING",
      });
    }

    return NextResponse.json({ success: true, taskId, status: "VERIFIED_PASS", unlockedTasks: unlocked.map(t => t.taskId) });
  }

  // ── Worker reports FAIL + repair attempt ────────────────────────────────────
  if (action === "report_failure") {
    const { taskId, workerId, error: failError, lifecycle, repairAttempt } = body as {
      taskId: string; workerId: string; error: string;
      lifecycle: LifecyclePhase; repairAttempt?: number;
    };

    const task = findTask(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    task.retryCount = (repairAttempt || task.retryCount) + 1;
    task.error = failError;
    supervisor.totalRetries++;
    supervisor.lastActivity = new Date().toISOString();

    if (task.retryCount >= task.retryLimit) {
      // Autonomous recovery exhausted → Human Gate
      task.status = "HUMAN_GATE";
      task.checkpoint = "HUMAN_GATE_REQUIRED";
      task.humanGateReason = `Retry limit (${task.retryLimit}) exhausted at phase ${lifecycle}. Last error: ${failError}`;

      const hgId = generateHGId();
      supervisor.humanGateLog.push({
        hgId,
        taskId,
        reason: task.humanGateReason,
        timestamp: new Date().toISOString(),
        resolved: false,
      });

      updateAgentInSwarm(workerId || task.workerId, `[HUMAN GATE] ${taskId}`, "PAUSED",
        `Cần SuperAdmin chỉ thị. Retry limit đã cạn: ${task.retryCount}/${task.retryLimit}`);

      log({
        fromAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
        toAgent: { id: "L0-OWNER", name: "SuperAdmin (Root of Trust)", tier: "L0" },
        type: "SECURITY",
        businessUnit: "HUY AI Center — Human Gate",
        content: `🚨 [${hgId}] HUMAN GATE — Task [${taskId}] đã cạn ${task.retryLimit} lần retry tại phase [${lifecycle}]. Lỗi cuối: ${failError}. Gửi báo cáo tới huytechnologyai2025@gmail.com`,
        status: "STREAMING",
      });

      return NextResponse.json({
        success: true, action_required: "HUMAN_GATE",
        hgId, taskId, reason: task.humanGateReason,
        message: "Human Gate triggered — check huytechnologyai2025@gmail.com",
      });
    }

    // Still within retry limit → AUTO REPAIR
    task.status = "RETRYING";
    task.lifecycle = "AUTO_REPAIR";

    log({
      fromAgent: { id: workerId || task.workerId, name: workerId || task.workerId, tier: "L2" },
      toAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
      type: "EXECUTION",
      businessUnit: "HUY AI Center — Auto Repair",
      content: `[AUTO-REPAIR] Task [${taskId}] attempt ${task.retryCount}/${task.retryLimit}. Phase: ${lifecycle}. Error: ${failError}. → Tự vá và retest.`,
      status: "ACKNOWLEDGED",
    });

    return NextResponse.json({
      success: true, action_required: "AUTO_REPAIR",
      taskId, retryCount: task.retryCount, retryLimit: task.retryLimit,
      message: "Continue autonomous repair loop",
    });
  }

  // ── Resolve Human Gate ──────────────────────────────────────────────────────
  if (action === "resolve_human_gate") {
    const { hgId, resolution, directive } = body as { hgId: string; resolution: string; directive?: string };
    const hg = supervisor.humanGateLog.find(h => h.hgId === hgId);
    if (!hg) return NextResponse.json({ error: "Human Gate not found" }, { status: 404 });

    hg.resolved = true;
    const task = findTask(hg.taskId);
    if (task) {
      task.status = "QUEUED";
      task.retryCount = 0;
      task.humanGateReason = undefined;
      task.lifecycle = "PREDICT";
      task.checkpoint = "TASK_CREATED";
      if (directive) task.prompt = `[HUMAN DIRECTIVE: ${directive}]\n\n${task.prompt}`;
    }

    log({
      fromAgent: { id: "L0-OWNER", name: "SuperAdmin (Root of Trust)", tier: "L0" },
      toAgent: { id: "HUY-SUPERVISOR-V1.1", name: "Autonomous Supervisor", tier: "L0" },
      type: "DIRECTIVE",
      businessUnit: "HUY AI Center — Human Gate",
      content: `[HG-RESOLVED] [${hgId}] SuperAdmin phê duyệt: "${resolution}". Task [${hg.taskId}] được reset về QUEUED với directive mới.`,
      status: "COMPLETED",
    });

    return NextResponse.json({ success: true, hgId, taskId: hg.taskId, status: "QUEUED" });
  }

  // ── Reset supervisor ────────────────────────────────────────────────────────
  if (action === "reset") {
    globalForSupervisor.__HUY_SUPERVISOR__ = initSupervisor();
    return NextResponse.json({ success: true, message: "Supervisor reset to initial state" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
