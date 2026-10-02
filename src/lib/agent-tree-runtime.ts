/**
 * HUY AI CENTER — LOCAL AI AGENT TREE & RUNTIME CONTROL PLANE
 * Single Source of Truth Event Model, Reducer & State Engine
 *
 * Implements deterministic event-driven state reduction for the Agent Tree:
 * - Architect / Reviewer Rail
 * - Autonomous Supervisor
 * - Router / Fork Layer
 * - Dynamic Specialized Agent Cards
 * - A2A Communication Edges
 * - Review + Verify Node
 * - Live Session Log with Secret Redaction
 */

export type RuntimeEventType =
  | "node.heartbeat"
  | "task.accepted"
  | "task.started"
  | "task.progress"
  | "task.completed"
  | "task.failed"
  | "agent.spawned"
  | "agent.started"
  | "agent.heartbeat"
  | "agent.idle"
  | "agent.stopped"
  | "a2a.sent"
  | "a2a.received"
  | "a2a.acked"
  | "a2a.failed"
  | "tool.started"
  | "tool.completed"
  | "tool.failed"
  | "route.selected"
  | "subtask.created"
  | "retry.scheduled"
  | "fallback.selected"
  | "review.requested"
  | "review.completed"
  | "verify.started"
  | "verify.passed"
  | "verify.failed"
  | "checkpoint.saved"
  | "human_gate.opened"
  | "human_gate.resolved"
  | "system.degraded"
  | "system.recovered";

export interface RuntimeEvent {
  eventId: string;
  schemaVersion: "1.0";
  timestamp: string;
  nodeId: string;
  traceId: string;
  runId?: string;
  taskId?: string;
  subtaskId?: string;
  sourceAgentId?: string;
  targetAgentId?: string;
  agentRole?: string;
  provider?: string;
  model?: string;
  type: RuntimeEventType;
  status?: "queued" | "running" | "success" | "failed" | "blocked";
  latencyMs?: number;
  retry?: number;
  riskLevel?: "R0" | "R1" | "R2" | "R3" | "R4";
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface AgentNodeState {
  id: string;
  name: string;
  role: "worker" | "explorer" | "researcher" | "coder" | "tester" | "reviewer" | "planner" | "infra" | "specialist";
  provider: string;
  model: string;
  status:
    | "OFFLINE"
    | "IDLE"
    | "QUEUED"
    | "SPAWNING"
    | "PLANNING"
    | "RUNNING"
    | "WAITING_IO"
    | "WAITING_AGENT"
    | "RETRYING"
    | "REVIEWING"
    | "VERIFYING"
    | "HUMAN_GATE"
    | "DONE"
    | "ERROR"
    | "CANCELLED";
  currentAction: string;
  currentResource?: string;
  currentTaskId?: string;
  lastHeartbeat: string;
  retries: number;
  lastResult?: string;
  tokensCount?: number;
}

export interface A2AEdgeState {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  messageType: string;
  traceId: string;
  status: "idle" | "transmitting" | "acked" | "waiting" | "degraded" | "blocked";
  lastSentAt: string;
  latencyMs?: number;
  payloadSummary?: string;
}

export interface SupervisorState {
  id: string;
  name: string;
  provider: string;
  model: string;
  status: "OFFLINE" | "ONLINE" | "IDLE" | "PLANNING" | "RUNNING" | "BLOCKED" | "ERROR";
  currentTask?: string;
  currentPhase?: string;
  elapsedSec: number;
  heartbeatAgeSec: number;
  retryCount: number;
  tokensUsed: number;
  lastAction: string;
  currentCheckpoint?: string;
  riskLevel?: "R0" | "R1" | "R2" | "R3" | "R4";
}

export interface ArchitectReviewerState {
  id: string;
  name: string;
  role: string;
  status: "IDLE" | "REVIEWING" | "ALERT" | "GATE_OPEN";
  reason?: string;
  currentTraceId?: string;
  lastInvokedAt?: string;
  invocationCount: number;
  trackedErrors: string[];
  activePolicyGate?: string;
  lastVerdict?: "PASS" | "NEEDS_REVISION" | "REJECT";
}

export interface RouterForkState {
  currentDecision?: "ROUTE" | "SPLIT" | "SPAWN" | "RETRY" | "FALLBACK" | "STOP" | "HUMAN_GATE" | "MERGE" | "VERIFY";
  activeRouteSummary?: string;
  targetAgents: string[];
  subtasksCreated: string[];
  confidenceScore?: number;
  lastDecidedAt?: string;
}

export interface VerifyNodeState {
  status: "IDLE" | "TESTING" | "PASSED" | "FAILED" | "ROLLBACK" | "HUMAN_GATE";
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  buildStatus: "IDLE" | "PASS" | "FAIL";
  policyCheck: "IDLE" | "PASS" | "FAIL";
  lastDecision?: "PASS" | "RETRY" | "ROLLBACK" | "HUMAN_GATE";
  committedCheckpoint?: string;
}

export interface HumanGateState {
  isOpen: boolean;
  gateId?: string;
  taskId?: string;
  traceId?: string;
  reason?: string;
  riskLevel?: "R0" | "R1" | "R2" | "R3" | "R4";
  requestedBy?: string;
  requiredAction?: string;
  createdAt?: string;
}

export interface RuntimeMetrics {
  activeAgents: number;
  queueDepth: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  retriesCount: number;
  a2aMessagesPerMin: number;
  humanGatesCount: number;
  lastSeenHeartbeatSec: number;
}

export interface RuntimeGraphState {
  nodeId: string;
  nodeStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
  lastUpdated: string;
  supervisor: SupervisorState;
  architect: ArchitectReviewerState;
  router: RouterForkState;
  agents: Record<string, AgentNodeState>;
  edges: Record<string, A2AEdgeState>;
  verify: VerifyNodeState;
  humanGate: HumanGateState;
  metrics: RuntimeMetrics;
  sessionLog: RuntimeEvent[];
  seenEventIds: Set<string>;
}

// ============================================================================
// REDACTION ENGINE (SECRET LEAK PROTECTION)
// ============================================================================
const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /secret/i,
  /password/i,
  /auth/i,
  /bearer/i,
  /cookie/i,
  /database[_-]?url/i,
  /private[_-]?key/i,
];

export function redactRuntimePayload(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitive) {
      result[key] = "[REDACTED_SECRET]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = redactRuntimePayload(value as Record<string, unknown>);
    } else if (typeof value === "string") {
      // Check for raw token / password strings inside strings
      if (value.startsWith("ghp_") || value.startsWith("EAAB") || value.startsWith("bot") || value.includes("Bearer ")) {
        result[key] = "[REDACTED_TOKEN]";
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ============================================================================
// EVENT VALIDATION
// ============================================================================
export function validateRuntimeEvent(event: unknown): event is RuntimeEvent {
  if (!event || typeof event !== "object") return false;
  const e = event as Partial<RuntimeEvent>;

  if (typeof e.eventId !== "string" || !e.eventId.trim()) return false;
  if (e.schemaVersion !== "1.0") return false;
  if (typeof e.timestamp !== "string" || isNaN(Date.parse(e.timestamp))) return false;
  if (typeof e.nodeId !== "string" || !e.nodeId.trim()) return false;
  if (typeof e.traceId !== "string" || !e.traceId.trim()) return false;
  if (typeof e.type !== "string" || !e.type.trim()) return false;
  if (typeof e.summary !== "string") return false;

  return true;
}

// ============================================================================
// HEARTBEAT STATUS EVALUATION
// ============================================================================
export function resolveNodeHeartbeatStatus(
  lastSeenIso: string,
  nowIso?: string
): "ONLINE" | "DEGRADED" | "OFFLINE" {
  const lastTime = Date.parse(lastSeenIso);
  if (isNaN(lastTime)) return "OFFLINE";

  const nowTime = nowIso ? Date.parse(nowIso) : Date.now();
  const ageSec = Math.max(0, (nowTime - lastTime) / 1000);

  if (ageSec <= 15) return "ONLINE";
  if (ageSec <= 45) return "DEGRADED";
  return "OFFLINE";
}

// ============================================================================
// INITIAL GRAPH STATE BUILDER
// ============================================================================
export function createInitialGraphState(nodeId: string = "HUYAI-N01"): RuntimeGraphState {
  const now = new Date().toISOString();

  return {
    nodeId,
    nodeStatus: "ONLINE",
    lastUpdated: now,
    supervisor: {
      id: "L1-SUPERVISOR",
      name: "Autonomous Supervisor (HAIP Core)",
      provider: "Ollama Local",
      model: "Qwen 2.5 Coder 32B",
      status: "ONLINE",
      elapsedSec: 0,
      heartbeatAgeSec: 0,
      retryCount: 0,
      tokensUsed: 0,
      lastAction: "Supervisor armed, ready for real task intake.",
    },
    architect: {
      id: "L1-ARCHITECT",
      name: "Architect & Safety Sentinel",
      role: "Architecture, Safety & Policy Oversight",
      status: "IDLE",
      invocationCount: 0,
      trackedErrors: [],
    },
    router: {
      currentDecision: undefined,
      targetAgents: [],
      subtasksCreated: [],
    },
    agents: {
      "worker-code": {
        id: "worker-code",
        name: "Local Coder Agent",
        role: "coder",
        provider: "Ollama Local (Node-01)",
        model: "qwen2.5-coder:32b",
        status: "IDLE",
        currentAction: "Chờ chỉ thị từ Router Layer",
        lastHeartbeat: now,
        retries: 0,
      },
      "worker-research": {
        id: "worker-research",
        name: "Curriculum Research Agent",
        role: "researcher",
        provider: "Ollama Local (Node-01)",
        model: "qwen2.5-coder:32b",
        status: "IDLE",
        currentAction: "Chờ chỉ thị từ Router Layer",
        lastHeartbeat: now,
        retries: 0,
      },
      "worker-test": {
        id: "worker-test",
        name: "Verification & TDD Agent",
        role: "tester",
        provider: "Ollama Local (Node-01)",
        model: "qwen2.5-coder:32b",
        status: "IDLE",
        currentAction: "Chờ gói kiểm định phần mềm / giáo án",
        lastHeartbeat: now,
        retries: 0,
      },
    },
    edges: {},
    verify: {
      status: "IDLE",
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      buildStatus: "IDLE",
      policyCheck: "IDLE",
    },
    humanGate: {
      isOpen: false,
    },
    metrics: {
      activeAgents: 0,
      queueDepth: 0,
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      retriesCount: 0,
      a2aMessagesPerMin: 0,
      humanGatesCount: 0,
      lastSeenHeartbeatSec: 0,
    },
    sessionLog: [],
    seenEventIds: new Set<string>(),
  };
}

// ============================================================================
// DETERMINISTIC STATE REDUCER
// ============================================================================
export function reduceRuntimeEvent(
  state: RuntimeGraphState,
  event: RuntimeEvent
): RuntimeGraphState {
  if (!validateRuntimeEvent(event)) {
    return state;
  }

  // Idempotency: Ignore already processed events
  if (state.seenEventIds.has(event.eventId)) {
    return state;
  }

  // Clone shallow state
  const nextSeenEventIds = new Set(state.seenEventIds);
  nextSeenEventIds.add(event.eventId);

  const nextAgents = { ...state.agents };
  const nextEdges = { ...state.edges };
  const nextSupervisor = { ...state.supervisor };
  const nextArchitect = { ...state.architect };
  const nextRouter = { ...state.router };
  const nextVerify = { ...state.verify };
  const nextHumanGate = { ...state.humanGate };
  const nextMetrics = { ...state.metrics };

  const sanitizedEvent: RuntimeEvent = {
    ...event,
    metadata: event.metadata ? redactRuntimePayload(event.metadata) : undefined,
  };

  // Add to session log (keep max 100 entries to prevent client memory bloat)
  const nextSessionLog = [sanitizedEvent, ...state.sessionLog].slice(0, 100);

  // Update timestamps
  const lastUpdated = event.timestamp;

  switch (event.type) {
    case "node.heartbeat": {
      nextSupervisor.heartbeatAgeSec = 0;
      nextMetrics.lastSeenHeartbeatSec = 0;
      break;
    }

    case "task.accepted": {
      nextSupervisor.status = "PLANNING";
      nextSupervisor.currentTask = event.summary;
      nextSupervisor.riskLevel = event.riskLevel || "R1";
      nextMetrics.runningTasks += 1;
      nextMetrics.queueDepth = Math.max(0, nextMetrics.queueDepth - 1);
      break;
    }

    case "task.started": {
      nextSupervisor.status = "RUNNING";
      nextSupervisor.lastAction = event.summary;
      break;
    }

    case "route.selected": {
      nextRouter.currentDecision = "ROUTE";
      nextRouter.activeRouteSummary = event.summary;
      nextRouter.lastDecidedAt = event.timestamp;
      if (event.targetAgentId) {
        nextRouter.targetAgents = [event.targetAgentId];
        if (nextAgents[event.targetAgentId]) {
          nextAgents[event.targetAgentId] = {
            ...nextAgents[event.targetAgentId],
            status: "QUEUED",
            currentAction: "Được Router phân luồng nhiệm vụ",
            currentTaskId: event.taskId,
          };
        }
      }
      break;
    }

    case "agent.spawned":
    case "agent.started": {
      const agentId = event.sourceAgentId || event.targetAgentId || "worker-dynamic";
      const existing = nextAgents[agentId] || {
        id: agentId,
        name: event.agentRole ? `${event.agentRole.toUpperCase()} (Node-01)` : "Local Worker Agent",
        role: (event.agentRole as AgentNodeState["role"]) || "worker",
        provider: event.provider || "Ollama Local (Node-01)",
        model: event.model || "qwen2.5-coder:32b",
        retries: 0,
      };

      nextAgents[agentId] = {
        ...existing,
        status: "RUNNING",
        currentAction: event.summary,
        lastHeartbeat: event.timestamp,
        currentTaskId: event.taskId,
      };
      nextMetrics.activeAgents = Object.values(nextAgents).filter((a) => a.status === "RUNNING").length;
      break;
    }

    case "a2a.sent":
    case "a2a.received": {
      const src = event.sourceAgentId || "supervisor";
      const dst = event.targetAgentId || "worker";
      const edgeKey = `${src}->${dst}`;

      nextEdges[edgeKey] = {
        id: edgeKey,
        sourceAgentId: src,
        targetAgentId: dst,
        messageType: event.type === "a2a.sent" ? "DIRECTIVE" : "RESPONSE",
        traceId: event.traceId,
        status: event.type === "a2a.sent" ? "transmitting" : "acked",
        lastSentAt: event.timestamp,
        latencyMs: event.latencyMs,
        payloadSummary: event.summary,
      };
      nextMetrics.a2aMessagesPerMin += 1;
      break;
    }

    case "a2a.acked": {
      const src = event.sourceAgentId || "supervisor";
      const dst = event.targetAgentId || "worker";
      const edgeKey = `${src}->${dst}`;
      if (nextEdges[edgeKey]) {
        nextEdges[edgeKey] = {
          ...nextEdges[edgeKey],
          status: "acked",
          latencyMs: event.latencyMs || nextEdges[edgeKey].latencyMs,
        };
      }
      break;
    }

    case "tool.started":
    case "tool.completed": {
      if (event.sourceAgentId && nextAgents[event.sourceAgentId]) {
        nextAgents[event.sourceAgentId] = {
          ...nextAgents[event.sourceAgentId],
          status: event.type === "tool.started" ? "RUNNING" : "RUNNING",
          currentAction: event.summary,
          currentResource: event.metadata?.toolName as string,
        };
      }
      break;
    }

    case "retry.scheduled": {
      nextMetrics.retriesCount += 1;
      if (event.sourceAgentId && nextAgents[event.sourceAgentId]) {
        nextAgents[event.sourceAgentId] = {
          ...nextAgents[event.sourceAgentId],
          status: "RETRYING",
          currentAction: `Đang thử lại: ${event.summary}`,
          retries: nextAgents[event.sourceAgentId].retries + 1,
        };
      }
      nextArchitect.status = "ALERT";
      nextArchitect.trackedErrors.push(event.summary);
      break;
    }

    case "verify.started": {
      nextVerify.status = "TESTING";
      nextVerify.testsRun += 1;
      break;
    }

    case "verify.passed": {
      nextVerify.status = "PASSED";
      nextVerify.testsPassed += 1;
      nextVerify.policyCheck = "PASS";
      nextVerify.lastDecision = "PASS";
      break;
    }

    case "verify.failed": {
      nextVerify.status = "FAILED";
      nextVerify.testsFailed += 1;
      nextVerify.policyCheck = "FAIL";
      nextVerify.lastDecision = "RETRY";
      break;
    }

    case "checkpoint.saved": {
      nextSupervisor.currentCheckpoint = event.summary;
      nextVerify.committedCheckpoint = event.summary;
      break;
    }

    case "human_gate.opened": {
      nextHumanGate.isOpen = true;
      nextHumanGate.gateId = event.eventId;
      nextHumanGate.taskId = event.taskId;
      nextHumanGate.traceId = event.traceId;
      nextHumanGate.reason = event.summary;
      nextHumanGate.riskLevel = event.riskLevel || "R3";
      nextHumanGate.requiredAction = "Cần phê duyệt từ Human Owner";
      nextHumanGate.createdAt = event.timestamp;
      nextMetrics.humanGatesCount += 1;

      // Put dependent agents to HUMAN_GATE
      if (event.sourceAgentId && nextAgents[event.sourceAgentId]) {
        nextAgents[event.sourceAgentId] = {
          ...nextAgents[event.sourceAgentId],
          status: "HUMAN_GATE",
          currentAction: `Tạm dừng: Chờ phê duyệt Human Gate`,
        };
      }
      break;
    }

    case "human_gate.resolved": {
      nextHumanGate.isOpen = false;
      break;
    }

    case "task.completed": {
      nextSupervisor.status = "IDLE";
      nextSupervisor.lastAction = `Hoàn thành tác vụ: ${event.summary}`;
      nextMetrics.completedTasks += 1;
      nextMetrics.runningTasks = Math.max(0, nextMetrics.runningTasks - 1);

      // Reset worker states to idle
      for (const id of Object.keys(nextAgents)) {
        if (nextAgents[id].status === "RUNNING" || nextAgents[id].status === "VERIFYING") {
          nextAgents[id] = {
            ...nextAgents[id],
            status: "DONE",
            currentAction: "Hoàn tất nhiệm vụ được giao.",
          };
        }
      }
      break;
    }

    case "task.failed": {
      nextSupervisor.status = "ERROR";
      nextSupervisor.lastAction = `Thất bại: ${event.summary}`;
      nextMetrics.failedTasks += 1;
      nextMetrics.runningTasks = Math.max(0, nextMetrics.runningTasks - 1);
      break;
    }

    default:
      break;
  }

  return {
    ...state,
    lastUpdated,
    supervisor: nextSupervisor,
    architect: nextArchitect,
    router: nextRouter,
    agents: nextAgents,
    edges: nextEdges,
    verify: nextVerify,
    humanGate: nextHumanGate,
    metrics: nextMetrics,
    sessionLog: nextSessionLog,
    seenEventIds: nextSeenEventIds,
  };
}

// ============================================================================
// FORMATTING & A2A UTILS
// ============================================================================
export function formatTerminalLogLine(event: RuntimeEvent): string {
  const time = event.timestamp.includes("T")
    ? event.timestamp.split("T")[1].slice(0, 8)
    : event.timestamp;
  const agent = event.sourceAgentId || "SYSTEM";
  const type = event.type;
  const status = event.status ? `[${event.status.toUpperCase()}]` : "";
  return `[${time}] [${agent}] [${type}] ${status} ${event.summary}`;
}

export interface BuildA2AMessageParams {
  sourceAgentId: string;
  targetAgentId: string;
  intent: "INSTRUCT" | "QUERY" | "REPORT" | "DELEGATE" | "VERIFY";
  payload: Record<string, unknown>;
  traceId?: string;
}

export interface A2APacket {
  messageId: string;
  sourceAgentId: string;
  targetAgentId: string;
  intent: string;
  timestamp: string;
  traceId: string;
  payload: Record<string, unknown>;
}

export function buildA2AMessage(params: BuildA2AMessageParams): A2APacket {
  return {
    messageId: `a2a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceAgentId: params.sourceAgentId,
    targetAgentId: params.targetAgentId,
    intent: params.intent,
    timestamp: new Date().toISOString(),
    traceId: params.traceId || `trc-${Date.now()}`,
    payload: redactRuntimePayload(params.payload),
  };
}

