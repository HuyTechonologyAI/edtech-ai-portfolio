import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRuntimeSnapshot,
  isAgentDispatchable,
  resolveHeartbeatStatus,
  deriveQueueCounts,
  buildAdminCenterSystemStatus,
} from './admincenter-runtime.js';

describe('AdminCenter Runtime Pure Helpers', () => {
  describe('buildRuntimeSnapshot', () => {
    it('yields correct defaults with empty live agents/providers/heartbeats and logicalCatalogSize=59', () => {
      const snapshot = buildRuntimeSnapshot({
        logicalCatalogSize: 59,
        agents: [],
        providers: [],
        heartbeats: [],
      });

      assert.equal(snapshot.sourceOfTruth, 'NODE01_SUPABASE');
      assert.equal(snapshot.snapshotStatus, 'TELEMETRY_PENDING');
      assert.equal(snapshot.logicalAgents, 59);
      assert.equal(snapshot.verifiedAgents, 0);
      assert.equal(snapshot.activeAgents, 0);
      assert.equal(snapshot.unverifiedAgents, 59);
      assert.equal(snapshot.runtimeDispatchEnabled, false);
    });

    it('derives verifiedAgents, activeAgents, and unverifiedAgents from live agents list', () => {
      const liveAgents = [
        {
          id: 'agent-1',
          enabled: true,
          health_status: 'healthy',
          metadata: { verification_status: 'VERIFIED' },
          configuration: { runtime_dispatch_enabled: true },
          state: 'ACTIVE',
        },
        {
          id: 'agent-2',
          enabled: true,
          health_status: 'healthy',
          metadata: { verification_status: 'VERIFIED' },
          configuration: { runtime_dispatch_enabled: false },
          state: 'STANDBY',
        },
        {
          id: 'agent-3',
          enabled: false,
          health_status: 'healthy',
          metadata: { verification_status: 'UNVERIFIED' },
          configuration: { runtime_dispatch_enabled: false },
          state: 'STANDBY',
        },
      ];

      const snapshot = buildRuntimeSnapshot({
        logicalCatalogSize: 59,
        agents: liveAgents,
        providers: [],
        heartbeats: [],
      });

      assert.equal(snapshot.logicalAgents, 59);
      assert.equal(snapshot.verifiedAgents, 2);
      assert.equal(snapshot.activeAgents, 1);
      assert.equal(snapshot.unverifiedAgents, 57);
    });
  });

  describe('isAgentDispatchable', () => {
    const fullyQualifiedAgent = {
      id: 'L1-P01',
      enabled: true,
      health_status: 'healthy',
      metadata: {
        verification_status: 'VERIFIED',
      },
      configuration: {
        runtime_dispatch_enabled: true,
      },
    };

    it('returns true only when enabled=true, health_status=healthy, metadata.verification_status=VERIFIED and configuration.runtime_dispatch_enabled=true', () => {
      assert.equal(isAgentDispatchable(fullyQualifiedAgent), true);
    });

    it('unverified agents are never dispatchable', () => {
      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          metadata: { verification_status: 'UNVERIFIED' },
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          metadata: { verification_status: 'PENDING' },
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          metadata: {},
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          metadata: undefined,
        }),
        false
      );
    });

    it('disabled agents are never dispatchable', () => {
      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          enabled: false,
        }),
        false
      );
    });

    it('unverified AND disabled agents are never dispatchable', () => {
      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          enabled: false,
          metadata: { verification_status: 'UNVERIFIED' },
        }),
        false
      );
    });

    it('unhealthy agents are never dispatchable', () => {
      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          health_status: 'degraded',
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          health_status: 'offline',
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          health_status: 'unhealthy',
        }),
        false
      );
    });

    it('agents with runtime_dispatch_enabled=false are never dispatchable', () => {
      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          configuration: { runtime_dispatch_enabled: false },
        }),
        false
      );

      assert.equal(
        isAgentDispatchable({
          ...fullyQualifiedAgent,
          configuration: undefined,
        }),
        false
      );
    });

    it('null or malformed agent targets fail closed', () => {
      assert.equal(isAgentDispatchable(null), false);
      assert.equal(isAgentDispatchable(undefined), false);
      assert.equal(isAgentDispatchable({}), false);
    });
  });

  describe('resolveHeartbeatStatus', () => {
    const fixedNow = new Date('2026-09-27T10:00:00.000Z').getTime();
    const thresholdMs = 60_000; // 60 seconds

    it('reports ONLINE for fresh heartbeat within threshold', () => {
      const freshHeartbeat = {
        agent_id: 'L1-P01',
        timestamp: new Date(fixedNow - 10_000).toISOString(), // 10s ago
      };

      const status = resolveHeartbeatStatus(freshHeartbeat, {
        now: fixedNow,
        staleThresholdMs: thresholdMs,
      });

      assert.equal(status, 'ONLINE');
    });

    it('stale heartbeat never reports ONLINE', () => {
      const staleHeartbeat = {
        agent_id: 'L1-P01',
        timestamp: new Date(fixedNow - 120_000).toISOString(), // 2 minutes ago (> 60s)
      };

      const status = resolveHeartbeatStatus(staleHeartbeat, {
        now: fixedNow,
        staleThresholdMs: thresholdMs,
      });

      assert.notEqual(status, 'ONLINE');
      assert.equal(status === 'STALE' || status === 'OFFLINE', true);
    });

    it('ancient heartbeat never reports ONLINE', () => {
      const ancientHeartbeat = {
        agent_id: 'L1-P01',
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const status = resolveHeartbeatStatus(ancientHeartbeat, {
        now: fixedNow,
        staleThresholdMs: thresholdMs,
      });

      assert.notEqual(status, 'ONLINE');
    });

    it('missing, invalid or empty timestamp never reports ONLINE', () => {
      assert.notEqual(
        resolveHeartbeatStatus({ agent_id: 'L1-P01', timestamp: '' }, { now: fixedNow }),
        'ONLINE'
      );
      assert.notEqual(
        resolveHeartbeatStatus({ agent_id: 'L1-P01', timestamp: 'invalid-date' }, { now: fixedNow }),
        'ONLINE'
      );
      assert.notEqual(
        resolveHeartbeatStatus(null, { now: fixedNow }),
        'ONLINE'
      );
    });
  });

  describe('deriveQueueCounts', () => {
    it('returns zero counts for empty task list', () => {
      const counts = deriveQueueCounts([]);

      assert.equal(counts.pending, 0);
      assert.equal(counts.running, 0);
      assert.equal(counts.completed, 0);
      assert.equal(counts.failed, 0);
      assert.equal(counts.total, 0);
    });

    it('derives queue counts from live ai_tasks status accurately', () => {
      const liveTasks = [
        { id: 't-1', status: 'pending' },
        { id: 't-2', status: 'pending' },
        { id: 't-3', status: 'running' },
        { id: 't-4', status: 'completed' },
        { id: 't-5', status: 'completed' },
        { id: 't-6', status: 'completed' },
        { id: 't-7', status: 'failed' },
      ];

      const counts = deriveQueueCounts(liveTasks);

      assert.equal(counts.pending, 2);
      assert.equal(counts.running, 1);
      assert.equal(counts.completed, 3);
      assert.equal(counts.failed, 1);
      assert.equal(counts.total, 7);
    });

    it('integrates queue counts into runtime snapshot when tasks are provided', () => {
      const liveTasks = [
        { id: 't-1', status: 'pending' },
        { id: 't-2', status: 'running' },
      ];

      const snapshot = buildRuntimeSnapshot({
        logicalCatalogSize: 59,
        agents: [],
        providers: [],
        heartbeats: [],
        tasks: liveTasks,
      });

      assert.equal(snapshot.queue.pending, 1);
      assert.equal(snapshot.queue.running, 1);
      assert.equal(snapshot.queue.completed, 0);
      assert.equal(snapshot.queue.failed, 0);
      assert.equal(snapshot.queue.total, 2);
    });
  });

  describe('buildAdminCenterSystemStatus', () => {
    const fixedNow = new Date('2026-09-27T10:00:00.000Z').getTime();

    it('(1) with one Node01 row marked offline and no heartbeat, status is DEGRADED/OFFLINE and 59 logical agents remain unverified, activeAgents=0, queue derived from tasks, runtimeDispatchEnabled=false', () => {
      const nodes = [{ id: 'node-01', name: 'Node01', status: 'offline' }];
      const tasks = [
        { id: 't-1', status: 'pending' },
        { id: 't-2', status: 'running' },
        { id: 't-3', status: 'completed' },
      ];

      const status = buildAdminCenterSystemStatus({
        logicalCatalogSize: 59,
        nodes,
        agents: [],
        providers: [],
        heartbeats: [],
        tasks,
        auditLogs: [],
      });

      assert.equal(status.status === 'DEGRADED' || status.status === 'OFFLINE', true);
      assert.equal(status.node?.status === 'OFFLINE' || status.nodes?.[0]?.status === 'offline' || status.nodes?.[0]?.status === 'OFFLINE', true);
      assert.equal(status.logicalAgents, 59);
      assert.equal(status.unverifiedAgents, 59);
      assert.equal(status.activeAgents, 0);
      assert.equal(status.runtimeDispatchEnabled, false);
      assert.equal(status.queue.pending, 1);
      assert.equal(status.queue.running, 1);
      assert.equal(status.queue.completed, 1);
      assert.equal(status.queue.total, 3);
    });

    it('(2) a fresh Node01 heartbeat makes node ONLINE and exposes cpu/ram/disk/queue metrics', () => {
      const nodes = [{ id: 'node-01', name: 'Node01', status: 'offline' }];
      const freshHeartbeat = {
        node_id: 'Node01',
        timestamp: new Date(fixedNow - 5_000).toISOString(),
        cpu: 18.5,
        ram: 42.0,
        disk: 35.2,
        queue: 4,
        metrics: {
          cpu: 18.5,
          ram: 42.0,
          disk: 35.2,
          queue: 4,
        },
      };

      const status = buildAdminCenterSystemStatus({
        logicalCatalogSize: 59,
        nodes,
        agents: [],
        providers: [],
        heartbeats: [freshHeartbeat],
        tasks: [],
        auditLogs: [],
        now: fixedNow,
      });

      const node = status.node ?? status.nodes?.[0];
      assert.equal(node?.status, 'ONLINE');
      const metrics = node?.metrics ?? status.metrics ?? node;
      assert.equal(metrics?.cpu, 18.5);
      assert.equal(metrics?.ram, 42.0);
      assert.equal(metrics?.disk, 35.2);
      assert.equal(metrics?.queue, 4);
    });

    it('(3) latest heartbeat metadata exposes supervisor state, provider health, backlog task statuses and latest bottleneck without inventing values', () => {
      const olderHeartbeat = {
        node_id: 'Node01',
        timestamp: new Date(fixedNow - 300_000).toISOString(),
        metadata: {
          supervisor_state: 'STARTING',
          supervisorState: 'STARTING',
          providerHealth: { gemini: 'UNKNOWN' },
          backlogTaskStatuses: { pending: 1 },
          bottleneck: 'INITIALIZING',
        },
      };
      const latestHeartbeat = {
        node_id: 'Node01',
        timestamp: new Date(fixedNow - 10_000).toISOString(),
        metadata: {
          supervisor_state: 'RUNNING',
          supervisorState: 'RUNNING',
          supervisor: { state: 'RUNNING', pid: 1042 },
          provider_health: { gemini: 'HEALTHY', groq: 'HEALTHY', ollama: 'STANDBY' },
          providerHealth: { gemini: 'HEALTHY', groq: 'HEALTHY', ollama: 'STANDBY' },
          backlog_task_statuses: { pending: 8, running: 2, failed: 0 },
          backlogTaskStatuses: { pending: 8, running: 2, failed: 0 },
          bottleneck: 'DATABASE_POOL_SATURATION',
          latest_bottleneck: 'DATABASE_POOL_SATURATION',
          latestBottleneck: 'DATABASE_POOL_SATURATION',
        },
      };

      const status = buildAdminCenterSystemStatus({
        logicalCatalogSize: 59,
        nodes: [{ id: 'node-01', name: 'Node01', status: 'offline' }],
        agents: [],
        providers: [],
        heartbeats: [olderHeartbeat, latestHeartbeat],
        tasks: [],
        auditLogs: [],
        now: fixedNow,
      });

      const supervisorState = status.supervisorState ?? status.supervisor?.state ?? status.supervisor;
      assert.equal(supervisorState, 'RUNNING');

      const providerHealth = status.providerHealth ?? status.provider_health ?? status.telemetry?.providerHealth;
      assert.deepEqual(providerHealth, {
        gemini: 'HEALTHY',
        groq: 'HEALTHY',
        ollama: 'STANDBY',
      });

      const backlogStatuses = status.backlogTaskStatuses ?? status.backlog ?? status.telemetry?.backlogTaskStatuses;
      assert.deepEqual(backlogStatuses, {
        pending: 8,
        running: 2,
        failed: 0,
      });

      const bottleneck = status.latestBottleneck ?? status.bottleneck ?? status.telemetry?.bottleneck;
      assert.equal(bottleneck, 'DATABASE_POOL_SATURATION');
    });

    it('(4) audit_logs rows are mapped into realAuditLogs', () => {
      const rawAuditLogs = [
        {
          id: 'audit-001',
          user_id: 'user-001',
          user_email: 'admin@huytech.vn',
          user_name: 'Huy Admin',
          action_type: 'DISPATCH_BATCH',
          target_resource: 'AgentPool',
          details: { batchSize: 5 },
          created_at: '2026-09-27T08:00:00.000Z',
        },
        {
          id: 'audit-002',
          user_id: 'user-002',
          user_email: 'assistant@huytech.vn',
          user_name: 'Assistant User',
          action_type: 'UPDATE_RESOURCE',
          target_resource: 'Resource#101',
          details: {},
          created_at: '2026-09-27T08:30:00.000Z',
        },
      ];

      const status = buildAdminCenterSystemStatus({
        logicalCatalogSize: 59,
        nodes: [],
        agents: [],
        providers: [],
        heartbeats: [],
        tasks: [],
        auditLogs: rawAuditLogs,
      });

      assert.equal(Array.isArray(status.realAuditLogs), true);
      assert.equal(status.realAuditLogs.length, 2);
      assert.equal(status.realAuditLogs[0].id, 'audit-001');
      assert.equal(status.realAuditLogs[0].user_email, 'admin@huytech.vn');
      assert.equal(status.realAuditLogs[0].action_type ?? status.realAuditLogs[0].actionType, 'DISPATCH_BATCH');
      assert.equal(status.realAuditLogs[1].id, 'audit-002');
      assert.equal(status.realAuditLogs[1].user_name, 'Assistant User');
    });

    it('(5) no heartbeat/audit data produces empty arrays and TELEMETRY_PENDING rather than hard-coded fake events', () => {
      const status = buildAdminCenterSystemStatus({
        logicalCatalogSize: 59,
        nodes: [],
        agents: [],
        providers: [],
        heartbeats: [],
        tasks: [],
        auditLogs: [],
      });

      assert.equal(status.status === 'TELEMETRY_PENDING' || status.snapshotStatus === 'TELEMETRY_PENDING', true);
      assert.deepEqual(status.realAuditLogs, []);
      assert.deepEqual(status.heartbeats ?? [], []);
      const events = status.events;
      if (events !== undefined) {
        assert.deepEqual(events, []);
      }
      assert.equal(status.latestBottleneck ?? status.bottleneck ?? null, null);
      assert.equal(status.supervisorState ?? status.supervisor ?? null, null);
    });
  });
});

describe('runtime workers telemetry', () => {
  it('exposes only nonnegative finite runtime worker counts from signed heartbeat metadata', () => {
    const status = buildAdminCenterSystemStatus({
      logicalCatalogSize: 59,
      nodes: [{ id: 'huy-ai-node-01', name: 'Node01', status: 'online' }],
      heartbeats: [{
        node_id: 'huy-ai-node-01',
        created_at: '2026-09-28T10:00:00.000Z',
        metadata: { runtimeWorkers: { codex: 2, antigravity: 0, bad: -1, malformed: 'x' } },
      }],
      now: '2026-09-28T10:01:00.000Z',
    });
    assert.deepEqual(status.runtimeWorkers, { codex: 2, antigravity: 0 });
    assert.equal(status.activeRuntimeWorkers, 2);
    assert.equal(status.activeAgents, 0, 'canonical unverified agents must remain inactive');
  });
});