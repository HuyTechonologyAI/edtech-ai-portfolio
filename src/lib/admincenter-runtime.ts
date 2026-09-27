/**
 * AdminCenter Runtime Pure Helpers
 *
 * Strict, server-safe runtime telemetry, catalog derivation, and dispatch eligibility helpers.
 * Source of truth: NODE01_SUPABASE.
 * Logical catalog is planning metadata only.
 */

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | string;

export interface AgentMetadata {
  verification_status?: VerificationStatus;
  [key: string]: unknown;
}

export interface AgentConfiguration {
  runtime_dispatch_enabled?: boolean;
  [key: string]: unknown;
}

export interface AgentRecord {
  id?: string;
  name?: string;
  enabled?: boolean;
  health_status?: string;
  state?: string;
  metadata?: AgentMetadata;
  configuration?: AgentConfiguration;
  [key: string]: unknown;
}

export interface ProviderRecord {
  id?: string;
  name?: string;
  status?: string;
  [key: string]: unknown;
}

export interface HeartbeatRecord {
  agent_id?: string;
  node_id?: string;
  timestamp?: string | number | Date;
  created_at?: string | number | Date;
  updated_at?: string | number | Date;
  status?: string;
  cpu?: number;
  ram?: number;
  disk?: number;
  queue?: number;
  metrics?: { cpu?: number; ram?: number; disk?: number; queue?: number };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TaskRecord {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface QueueCounts {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

export interface HeartbeatResolveOptions {
  now?: number | Date | string;
  staleThresholdMs?: number;
}

export type HeartbeatStatus = 'ONLINE' | 'STALE' | 'OFFLINE';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
    ? value as Record<string, unknown>
    : null;
}

export interface BuildRuntimeSnapshotParams {
  logicalCatalogSize?: number;
  agents?: AgentRecord[] | null;
  providers?: ProviderRecord[] | null;
  heartbeats?: HeartbeatRecord[] | null;
  tasks?: TaskRecord[] | null;
  runtimeDispatchEnabled?: boolean;
  snapshotStatus?: string;
  now?: number | Date | string;
  staleThresholdMs?: number;
}

export interface RuntimeSnapshot {
  sourceOfTruth: 'NODE01_SUPABASE';
  snapshotStatus: string;
  logicalAgents: number;
  verifiedAgents: number;
  activeAgents: number;
  unverifiedAgents: number;
  runtimeDispatchEnabled: boolean;
  queue: QueueCounts;
  agents: AgentRecord[];
  providers: ProviderRecord[];
  heartbeats: HeartbeatRecord[];
  tasks: TaskRecord[];
  timestamp: string;
}

/**
 * Checks whether an agent target is dispatchable.
 * Fails closed: Requires enabled === true, health_status === 'healthy',
 * metadata.verification_status === 'VERIFIED', and configuration.runtime_dispatch_enabled === true.
 */
export function isAgentDispatchable(agent: AgentRecord | null | undefined): boolean {
  if (!agent || typeof agent !== 'object') {
    return false;
  }
  if (agent.enabled !== true) {
    return false;
  }
  if (agent.health_status !== 'healthy') {
    return false;
  }
  if (!agent.metadata || agent.metadata.verification_status !== 'VERIFIED') {
    return false;
  }
  if (!agent.configuration || agent.configuration.runtime_dispatch_enabled !== true) {
    return false;
  }
  return true;
}

/**
 * Resolves heartbeat freshness.
 * Stale or ancient heartbeats never report ONLINE.
 * Supports live Supabase node heartbeat records via created_at as well as timestamp/updated_at.
 */
export function resolveHeartbeatStatus(
  heartbeat: HeartbeatRecord | null | undefined,
  options?: HeartbeatResolveOptions
): HeartbeatStatus {
  if (!heartbeat || typeof heartbeat !== 'object') {
    return 'OFFLINE';
  }

  const rawTimestamp = heartbeat.timestamp ?? heartbeat.created_at ?? heartbeat.updated_at;
  if (rawTimestamp === null || rawTimestamp === undefined || rawTimestamp === '') {
    return 'OFFLINE';
  }

  const parsedTime =
    typeof rawTimestamp === 'number'
      ? rawTimestamp
      : new Date(rawTimestamp).getTime();

  if (Number.isNaN(parsedTime)) {
    return 'OFFLINE';
  }

  let currentNow: number;
  if (options?.now !== undefined) {
    if (typeof options.now === 'number') {
      currentNow = options.now;
    } else if (options.now instanceof Date) {
      currentNow = options.now.getTime();
    } else {
      currentNow = new Date(options.now).getTime();
    }
  } else {
    currentNow = Date.now();
  }

  if (Number.isNaN(currentNow)) {
    return 'OFFLINE';
  }

  const thresholdMs =
    typeof options?.staleThresholdMs === 'number' && options.staleThresholdMs > 0
      ? options.staleThresholdMs
      : 60_000;

  const ageMs = currentNow - parsedTime;

  // Stale or ancient heartbeat past threshold
  if (ageMs > thresholdMs) {
    return 'STALE';
  }

  // Future heartbeat beyond clock skew threshold
  if (ageMs < -thresholdMs) {
    return 'STALE';
  }

  return 'ONLINE';
}

/**
 * Derives queue counts only from supplied task records.
 */
export function deriveQueueCounts(tasks?: TaskRecord[] | null): QueueCounts {
  const counts: QueueCounts = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    total: 0,
  };

  if (!Array.isArray(tasks)) {
    return counts;
  }

  for (const task of tasks) {
    if (!task || typeof task !== 'object') {
      continue;
    }
    counts.total += 1;
    const status = typeof task.status === 'string' ? task.status.toLowerCase().trim() : '';
    if (status === 'pending') {
      counts.pending += 1;
    } else if (status === 'running') {
      counts.running += 1;
    } else if (status === 'completed') {
      counts.completed += 1;
    } else if (status === 'failed') {
      counts.failed += 1;
    }
  }

  return counts;
}

/**
 * Builds the runtime snapshot combining live telemetry with logical catalog planning metadata.
 * Fails closed, uses NODE01_SUPABASE source of truth.
 */
export function buildRuntimeSnapshot(params: BuildRuntimeSnapshotParams): RuntimeSnapshot {
  const safeAgents = Array.isArray(params?.agents) ? params.agents : [];
  const safeProviders = Array.isArray(params?.providers) ? params.providers : [];
  const safeHeartbeats = Array.isArray(params?.heartbeats) ? params.heartbeats : [];
  const safeTasks = Array.isArray(params?.tasks) ? params.tasks : [];

  const logicalCatalogSize =
    typeof params?.logicalCatalogSize === 'number' && params.logicalCatalogSize >= 0
      ? params.logicalCatalogSize
      : 0;

  let verifiedAgents = 0;
  let activeAgents = 0;

  for (const agent of safeAgents) {
    if (agent?.metadata?.verification_status === 'VERIFIED') {
      verifiedAgents += 1;
    }
    if (isAgentDispatchable(agent)) {
      activeAgents += 1;
    }
  }

  const unverifiedAgents = Math.max(0, logicalCatalogSize - verifiedAgents);

  const runtimeDispatchEnabled =
    params?.runtimeDispatchEnabled !== undefined
      ? Boolean(params.runtimeDispatchEnabled)
      : activeAgents > 0;

  const queue = deriveQueueCounts(safeTasks);

  let snapshotStatus: string;
  if (params?.snapshotStatus) {
    snapshotStatus = params.snapshotStatus;
  } else if (safeHeartbeats.length === 0) {
    snapshotStatus = 'TELEMETRY_PENDING';
  } else {
    const hasOnlineHeartbeat = safeHeartbeats.some(
      (hb) =>
        resolveHeartbeatStatus(hb, {
          now: params?.now,
          staleThresholdMs: params?.staleThresholdMs,
        }) === 'ONLINE'
    );
    snapshotStatus = hasOnlineHeartbeat ? 'OPERATIONAL' : 'DEGRADED';
  }

  return {
    sourceOfTruth: 'NODE01_SUPABASE',
    snapshotStatus,
    logicalAgents: logicalCatalogSize,
    verifiedAgents,
    activeAgents,
    unverifiedAgents,
    runtimeDispatchEnabled,
    queue,
    agents: safeAgents,
    providers: safeProviders,
    heartbeats: safeHeartbeats,
    tasks: safeTasks,
    timestamp: new Date().toISOString(),
  };
}

export interface NodeRecord {
  id?: string;
  name?: string;
  status?: string;
  role?: string;
  storage?: boolean | string;
  is_storage?: boolean;
  control_plane_only?: boolean;
  metadata?: Record<string, unknown>;
  metrics?: {
    cpu?: number;
    ram?: number;
    disk?: number;
    queue?: number;
    [key: string]: unknown;
  };
  cpu?: number;
  ram?: number;
  disk?: number;
  queue?: number;
  [key: string]: unknown;
}

export interface AuditLogRecord {
  id?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action_type?: string;
  actionType?: string;
  target_resource?: string;
  targetResource?: string;
  details?: Record<string, unknown>;
  created_at?: string | number | Date;
  timestamp?: string | number | Date;
  [key: string]: unknown;
}

export interface BuildAdminCenterSystemStatusParams {
  logicalCatalogSize?: number;
  nodes?: NodeRecord[] | null;
  agents?: AgentRecord[] | null;
  providers?: ProviderRecord[] | null;
  heartbeats?: HeartbeatRecord[] | null;
  tasks?: TaskRecord[] | null;
  auditLogs?: AuditLogRecord[] | null;
  now?: number | Date | string;
  staleThresholdMs?: number;
  snapshotStatus?: string;
  [key: string]: unknown;
}

export interface AdminCenterSystemStatus extends RuntimeSnapshot {
  status: 'TELEMETRY_PENDING' | 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  node: NodeRecord | null;
  nodes: NodeRecord[];
  realAuditLogs: AuditLogRecord[];
  metrics?: {
    cpu?: number;
    ram?: number;
    disk?: number;
    queue?: number;
    [key: string]: unknown;
  } | null;
  supervisorState: string | null;
  supervisor: { state?: string; [key: string]: unknown } | null;
  providerHealth: Record<string, unknown> | null;
  provider_health: Record<string, unknown> | null;
  backlogTaskStatuses: Record<string, unknown> | null;
  backlog: Record<string, unknown> | null;
  latestBottleneck: string | null;
  bottleneck: string | null;
  telemetry?: Record<string, unknown> | null;
  events?: unknown[];
}

function extractHeartbeatTimestamp(hb: HeartbeatRecord | null | undefined): number {
  if (!hb || typeof hb !== 'object') {
    return 0;
  }
  const raw = hb.timestamp ?? hb.created_at ?? hb.updated_at;
  if (raw === null || raw === undefined || raw === '') {
    return 0;
  }
  const t = typeof raw === 'number' ? raw : new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Builds the comprehensive AdminCenter system status combining nodes, runtime snapshot,
 * heartbeat telemetry metadata, and real audit logs.
 * Fail-closed, zero invented telemetry, pure calculation.
 */
export function buildAdminCenterSystemStatus(
  params?: BuildAdminCenterSystemStatusParams | null
): AdminCenterSystemStatus {
  const safeNodes = Array.isArray(params?.nodes) ? params.nodes : [];
  const safeAgents = Array.isArray(params?.agents) ? params.agents : [];
  const safeProviders = Array.isArray(params?.providers) ? params.providers : [];
  const safeHeartbeats = Array.isArray(params?.heartbeats) ? params.heartbeats : [];
  const safeTasks = Array.isArray(params?.tasks) ? params.tasks : [];
  const safeAuditLogs = Array.isArray(params?.auditLogs) ? params.auditLogs : [];

  // Sort heartbeats descending by timestamp to find latest heartbeat
  const sortedHeartbeats = [...safeHeartbeats].sort(
    (a, b) => extractHeartbeatTimestamp(b) - extractHeartbeatTimestamp(a)
  );
  const latestHeartbeat = sortedHeartbeats.length > 0 ? sortedHeartbeats[0] : null;

  // Determine overall status truthfully
  let overallStatus: 'TELEMETRY_PENDING' | 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  if (safeHeartbeats.length === 0 && safeNodes.length === 0) {
    overallStatus = 'TELEMETRY_PENDING';
  } else if (safeHeartbeats.length === 0) {
    const hasOfflineNode = safeNodes.some(
      (n) => n?.status && n.status.toUpperCase() === 'OFFLINE'
    );
    overallStatus = hasOfflineNode ? 'DEGRADED' : 'TELEMETRY_PENDING';
  } else {
    const hasOnlineHeartbeat = safeHeartbeats.some(
      (hb) =>
        resolveHeartbeatStatus(hb, {
          now: params?.now,
          staleThresholdMs: params?.staleThresholdMs,
        }) === 'ONLINE'
    );
    overallStatus = hasOnlineHeartbeat ? 'OPERATIONAL' : 'DEGRADED';
  }

  // Build base runtime snapshot
  const snapshot = buildRuntimeSnapshot({
    logicalCatalogSize: params?.logicalCatalogSize,
    agents: safeAgents,
    providers: safeProviders,
    heartbeats: safeHeartbeats,
    tasks: safeTasks,
    now: params?.now,
    staleThresholdMs: params?.staleThresholdMs,
    snapshotStatus: overallStatus,
  });

  // Map nodes with authoritative Node01 anchor and Lenovo remote control plane rules
  const mappedNodes: NodeRecord[] = safeNodes.map((n) => {
    const isAnchor =
      (typeof n.name === 'string' && /node01/i.test(n.name)) ||
      (typeof n.id === 'string' && /node-?01/i.test(n.id));
    const isLenovo =
      (typeof n.name === 'string' && /lenovo/i.test(n.name)) ||
      (typeof n.id === 'string' && /lenovo/i.test(n.id));

    const nodeHeartbeat =
      safeHeartbeats.find(
        (hb) =>
          (n.id && hb.node_id === n.id) ||
          (n.name && hb.node_id === n.name) ||
          (isAnchor && typeof hb.node_id === 'string' && /node-?01/i.test(hb.node_id))
      ) ?? (isAnchor ? latestHeartbeat : null);

    let nodeStatus: string;
    if (nodeHeartbeat) {
      nodeStatus = resolveHeartbeatStatus(nodeHeartbeat, {
        now: params?.now,
        staleThresholdMs: params?.staleThresholdMs,
      });
    } else if (n.status) {
      nodeStatus = n.status.toUpperCase();
    } else {
      nodeStatus = 'OFFLINE';
    }

    const nodeMetrics = nodeHeartbeat
      ? {
          cpu:
            typeof nodeHeartbeat.cpu === 'number'
              ? nodeHeartbeat.cpu
              : nodeHeartbeat.metrics?.cpu,
          ram:
            typeof nodeHeartbeat.ram === 'number'
              ? nodeHeartbeat.ram
              : nodeHeartbeat.metrics?.ram,
          disk:
            typeof nodeHeartbeat.disk === 'number'
              ? nodeHeartbeat.disk
              : nodeHeartbeat.metrics?.disk,
          queue:
            typeof nodeHeartbeat.queue === 'number'
              ? nodeHeartbeat.queue
              : nodeHeartbeat.metrics?.queue,
        }
      : (n.metrics ?? undefined);

    let role = n.role;
    let storage: boolean | string | undefined = n.storage;
    let is_storage: boolean | undefined = n.is_storage;
    let control_plane_only: boolean | undefined = n.control_plane_only;

    if (isAnchor) {
      role = role ?? 'AUTHORITATIVE_ANCHOR';
      storage = storage ?? 'NODE01_SUPABASE';
      is_storage = true;
      control_plane_only = false;
    } else if (isLenovo) {
      role = 'REMOTE_CONTROL_PLANE_ONLY';
      storage = false;
      is_storage = false;
      control_plane_only = true;
    }

    return {
      ...n,
      status: nodeStatus,
      role,
      storage,
      is_storage,
      control_plane_only,
      ...(nodeMetrics
        ? {
            metrics: nodeMetrics,
            cpu: nodeMetrics.cpu,
            ram: nodeMetrics.ram,
            disk: nodeMetrics.disk,
            queue: nodeMetrics.queue,
          }
        : {}),
    };
  });

  const primaryNode =
    mappedNodes.find(
      (n) =>
        (typeof n.name === 'string' && /node01/i.test(n.name)) ||
        (typeof n.id === 'string' && /node-?01/i.test(n.id))
    ) ??
    mappedNodes[0] ??
    null;

  // Extract metrics from latest heartbeat or primary node
  const latestMetrics = latestHeartbeat
    ? {
        cpu:
          typeof latestHeartbeat.cpu === 'number'
            ? latestHeartbeat.cpu
            : latestHeartbeat.metrics?.cpu,
        ram:
          typeof latestHeartbeat.ram === 'number'
            ? latestHeartbeat.ram
            : latestHeartbeat.metrics?.ram,
        disk:
          typeof latestHeartbeat.disk === 'number'
            ? latestHeartbeat.disk
            : latestHeartbeat.metrics?.disk,
        queue:
          typeof latestHeartbeat.queue === 'number'
            ? latestHeartbeat.queue
            : latestHeartbeat.metrics?.queue,
      }
    : (primaryNode?.metrics ?? null);

  // Extract allowlisted metadata fields from the latest heartbeat.
  const meta = latestHeartbeat?.metadata ?? null;
  const supervisorRecord = asRecord(meta?.supervisor);
  const supervisorState =
    (typeof meta?.supervisorState === 'string' ? meta.supervisorState : null) ??
    (typeof meta?.supervisor_state === 'string' ? meta.supervisor_state : null) ??
    (typeof meta?.supervisor === 'string' ? meta.supervisor : null) ??
    (typeof supervisorRecord?.state === 'string' ? supervisorRecord.state : null);
  const supervisor = supervisorRecord ?? (supervisorState ? { state: supervisorState } : null);

  const providerHealth = asRecord(meta?.providerHealth) ?? asRecord(meta?.provider_health);
  const provider_health = asRecord(meta?.provider_health) ?? asRecord(meta?.providerHealth);
  const backlogTaskStatuses =
    asRecord(meta?.backlogTaskStatuses) ?? asRecord(meta?.backlog_task_statuses) ?? asRecord(meta?.backlog);
  const backlog =
    asRecord(meta?.backlog) ?? asRecord(meta?.backlogTaskStatuses) ?? asRecord(meta?.backlog_task_statuses);

  const latestBottleneck =
    (typeof meta?.latestBottleneck === 'string' ? meta.latestBottleneck : null) ??
    (typeof meta?.latest_bottleneck === 'string' ? meta.latest_bottleneck : null) ??
    (typeof meta?.bottleneck === 'string' ? meta.bottleneck : null);
  const bottleneck =
    (typeof meta?.bottleneck === 'string' ? meta.bottleneck : null) ??
    (typeof meta?.latestBottleneck === 'string' ? meta.latestBottleneck : null) ??
    (typeof meta?.latest_bottleneck === 'string' ? meta.latest_bottleneck : null);

  const telemetry = latestHeartbeat
    ? {
        supervisorState,
        supervisor,
        providerHealth,
        provider_health,
        backlogTaskStatuses,
        backlog,
        bottleneck,
        latestBottleneck,
      }
    : null;

  // Map audit logs to realAuditLogs
  const realAuditLogs: AuditLogRecord[] = safeAuditLogs.map((log) => ({
    id: log.id ?? '',
    user_id: log.user_id,
    user_email: log.user_email,
    user_name: log.user_name,
    action_type: log.action_type ?? log.actionType,
    actionType: log.actionType ?? log.action_type,
    target_resource: log.target_resource ?? log.targetResource,
    targetResource: log.targetResource ?? log.target_resource,
    details: log.details ?? {},
    created_at: log.created_at ?? log.timestamp,
    timestamp: log.timestamp ?? log.created_at,
    ...log,
  }));

  return {
    ...snapshot,
    status: overallStatus,
    node: primaryNode,
    nodes: mappedNodes,
    metrics: latestMetrics,
    supervisorState,
    supervisor,
    providerHealth,
    provider_health,
    backlogTaskStatuses,
    backlog,
    latestBottleneck,
    bottleneck,
    telemetry,
    realAuditLogs,
    events: [],
  };
}
