import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRuntimeEvent,
  redactRuntimePayload,
  resolveNodeHeartbeatStatus,
  createInitialGraphState,
  reduceRuntimeEvent,
  formatTerminalLogLine,
  buildA2AMessage,
  RuntimeEvent,
} from './agent-tree-runtime.js';

describe('Local AI Agent Tree & Runtime Control Plane Pure Engine', () => {
  describe('validateRuntimeEvent', () => {
    it('accepts a strictly conformant RuntimeEvent v1.0', () => {
      const validEvent: RuntimeEvent = {
        eventId: 'evt-1001',
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-abc-123',
        type: 'task.accepted',
        status: 'running',
        summary: 'Supervisor accepted task for execution',
      };
      assert.equal(validateRuntimeEvent(validEvent), true);
    });

    it('rejects events missing required fields or invalid schemaVersion', () => {
      const invalidEvent1 = {
        eventId: '',
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-1',
        type: 'task.accepted',
        summary: 'Missing eventId',
      };
      assert.equal(validateRuntimeEvent(invalidEvent1), false);

      const invalidEvent2 = {
        eventId: 'evt-2',
        schemaVersion: '2.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-1',
        type: 'task.accepted',
        summary: 'Wrong schemaVersion',
      };
      assert.equal(validateRuntimeEvent(invalidEvent2), false);

      const invalidEvent3 = {
        eventId: 'evt-3',
        schemaVersion: '1.0',
        timestamp: 'invalid-date-string',
        nodeId: 'HUYAI-N01',
        traceId: 'trc-1',
        type: 'task.accepted',
        summary: 'Invalid timestamp',
      };
      assert.equal(validateRuntimeEvent(invalidEvent3), false);
    });
  });

  describe('redactRuntimePayload', () => {
    it('redacts sensitive fields (passwords, tokens, bearer, secret, api_key)', () => {
      const input = {
        taskName: 'generate-lesson',
        api_key: 'sk-secret-1234567890',
        accessToken: 'ghp_abcdef123456',
        bearer: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        password: 'mySuperSecretPassword123',
        nested: {
          privateKey: 'BEGIN PRIVATE KEY',
          safeContent: 'public prompt text',
        },
      };

      const redacted = redactRuntimePayload(input);
      assert.equal(redacted.api_key, '[REDACTED_SECRET]');
      assert.equal(redacted.accessToken, '[REDACTED_SECRET]');
      assert.equal(redacted.bearer, '[REDACTED_SECRET]');
      assert.equal(redacted.password, '[REDACTED_SECRET]');
      const nested = redacted.nested as Record<string, unknown>;
      assert.equal(nested.privateKey, '[REDACTED_SECRET]');
      assert.equal(nested.safeContent, 'public prompt text');
    });

    it('redacts inline token patterns inside strings', () => {
      const input = {
        log1: 'ghp_1234567890abcdef',
        log2: 'Bearer someTokenValue',
      };
      const redacted = redactRuntimePayload(input);
      assert.equal(redacted.log1, '[REDACTED_TOKEN]');
      assert.equal(redacted.log2, '[REDACTED_TOKEN]');
    });
  });

  describe('resolveNodeHeartbeatStatus', () => {
    it('returns ONLINE when heartbeat is under 15 seconds old', () => {
      const fresh = new Date(Date.now() - 5000).toISOString();
      assert.equal(resolveNodeHeartbeatStatus(fresh), 'ONLINE');
    });

    it('returns DEGRADED when heartbeat is between 15 and 45 seconds old', () => {
      const degradedTime = new Date(Date.now() - 25000).toISOString();
      assert.equal(resolveNodeHeartbeatStatus(degradedTime), 'DEGRADED');
    });

    it('returns OFFLINE when heartbeat is over 45 seconds old or missing', () => {
      const staleTime = new Date(Date.now() - 60000).toISOString();
      assert.equal(resolveNodeHeartbeatStatus(staleTime), 'OFFLINE');
      assert.equal(resolveNodeHeartbeatStatus(''), 'OFFLINE');
      assert.equal(resolveNodeHeartbeatStatus('invalid-time'), 'OFFLINE');
    });
  });

  describe('reduceRuntimeEvent & createInitialGraphState', () => {
    it('creates initial graph state with supervisor, architect, router, and seed agents', () => {
      const state = createInitialGraphState('HUYAI-N01');
      assert.equal(state.nodeId, 'HUYAI-N01');
      assert.equal(state.nodeStatus, 'ONLINE');
      assert.equal(state.supervisor.id, 'L1-SUPERVISOR');
      assert.equal(state.supervisor.status, 'ONLINE');
      assert.equal(state.architect.id, 'L1-ARCHITECT');
      assert.ok(state.agents['worker-code']);
      assert.ok(state.agents['worker-research']);
      assert.ok(state.agents['worker-test']);
      assert.equal(Object.keys(state.edges).length, 0);
      assert.equal(state.sessionLog.length, 0);
      assert.equal(state.metrics.runningTasks, 0);
    });

    it('deduplicates events with identical eventId (idempotency)', () => {
      let state = createInitialGraphState('HUYAI-N01');
      const event: RuntimeEvent = {
        eventId: 'evt-dup-1',
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-1',
        type: 'task.accepted',
        status: 'running',
        summary: 'First submission',
      };

      state = reduceRuntimeEvent(state, event);
      assert.equal(state.sessionLog.length, 1);
      assert.equal(state.metrics.runningTasks, 1);

      // Re-apply same event
      const state2 = reduceRuntimeEvent(state, event);
      assert.equal(state2.sessionLog.length, 1);
      assert.equal(state2.metrics.runningTasks, 1);
    });

    it('handles full lifecycle: task.accepted -> route.selected -> agent.started -> a2a.sent -> verify.passed -> task.completed', () => {
      let state = createInitialGraphState('HUYAI-N01');
      const now = new Date();

      // 1. Task accepted by Supervisor
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-1',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 100).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        taskId: 'task-test-01',
        type: 'task.accepted',
        status: 'running',
        summary: 'Supervisor queued autonomous task',
      });
      assert.equal(state.supervisor.status, 'PLANNING');
      assert.equal(state.supervisor.currentTask, 'Supervisor queued autonomous task');

      // 2. Router selects worker
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-2',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 200).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        taskId: 'task-test-01',
        targetAgentId: 'worker-code',
        type: 'route.selected',
        status: 'running',
        summary: 'Router assigned task to worker-code',
      });
      assert.equal(state.router.currentDecision, 'ROUTE');
      assert.equal(state.agents['worker-code'].status, 'QUEUED');

      // 3. Agent started
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-3',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 300).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        sourceAgentId: 'worker-code',
        type: 'agent.started',
        status: 'running',
        summary: 'Local Coder executing module',
      });
      assert.equal(state.agents['worker-code'].status, 'RUNNING');
      assert.equal(state.metrics.activeAgents, 1);

      // 4. A2A communication sent from Supervisor to Worker
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-4',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 400).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        sourceAgentId: 'L1-SUPERVISOR',
        targetAgentId: 'worker-code',
        type: 'a2a.sent',
        status: 'running',
        summary: 'Supervisor dispatched task specification to worker-code',
      });
      const edgeKey = 'L1-SUPERVISOR->worker-code';
      assert.ok(state.edges[edgeKey]);
      assert.equal(state.edges[edgeKey].status, 'transmitting');
      assert.equal(state.metrics.a2aMessagesPerMin, 1);

      // 5. Verification started and passed
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-5',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 500).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        type: 'verify.started',
        status: 'running',
        summary: 'Review & Verify node evaluating output against policies',
      });
      assert.equal(state.verify.status, 'TESTING');
      assert.equal(state.verify.testsRun, 1);

      state = reduceRuntimeEvent(state, {
        eventId: 'evt-6',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 600).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        type: 'verify.passed',
        status: 'success',
        summary: 'All verification checks passed (tests=PASS, policy=COMPLIANT)',
      });
      assert.equal(state.verify.status, 'PASSED');
      assert.equal(state.verify.policyCheck, 'PASS');

      // 6. Task completed
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-7',
        schemaVersion: '1.0',
        timestamp: new Date(now.getTime() + 700).toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-flow',
        taskId: 'task-test-01',
        type: 'task.completed',
        status: 'success',
        summary: 'Task test-01 successfully completed by Local AI',
      });
      assert.equal(state.supervisor.status, 'IDLE');
      assert.equal(state.metrics.runningTasks, 0);
      assert.equal(state.metrics.completedTasks, 1);
      assert.equal(state.agents['worker-code'].status, 'DONE');
      assert.equal(state.sessionLog.length, 7);
    });

    it('activates Human Gate on high-risk R3/R4 operations or human_gate.opened', () => {
      let state = createInitialGraphState('HUYAI-N01');
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-gate-1',
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-gate',
        sourceAgentId: 'worker-code',
        type: 'human_gate.opened',
        status: 'blocked',
        riskLevel: 'R3',
        summary: 'Action requires Human Owner approval: Production Mutation',
      });
      assert.equal(state.humanGate.isOpen, true);
      assert.equal(state.humanGate.riskLevel, 'R3');
      assert.equal(state.agents['worker-code'].status, 'HUMAN_GATE');

      // Resolving Human Gate
      state = reduceRuntimeEvent(state, {
        eventId: 'evt-gate-2',
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        nodeId: 'HUYAI-N01',
        traceId: 'trc-gate',
        type: 'human_gate.resolved',
        status: 'running',
        summary: 'Human Owner approved execution',
      });
      assert.equal(state.humanGate.isOpen, false);
    });
  });

  describe('formatTerminalLogLine and buildA2AMessage', () => {
    it('formats a terminal log entry with timestamp and event details', () => {
      const line = formatTerminalLogLine({
        eventId: 'evt-log-1',
        schemaVersion: '1.0',
        timestamp: '2026-10-02T15:00:00.000Z',
        nodeId: 'HUYAI-N01',
        traceId: 'trc-log',
        sourceAgentId: 'SUPERVISOR',
        type: 'task.accepted',
        status: 'running',
        summary: 'Dispatched autonomous plan',
      });
      assert.ok(line.includes('[15:00:00]'));
      assert.ok(line.includes('[task.accepted]'));
      assert.ok(line.includes('Dispatched autonomous plan'));
    });

    it('builds a valid A2A message payload', () => {
      const msg = buildA2AMessage({
        sourceAgentId: 'L1-SUPERVISOR',
        targetAgentId: 'worker-code',
        intent: 'INSTRUCT',
        payload: { command: 'generate_summary', model: 'qwen2.5:7b' },
      });
      assert.equal(msg.sourceAgentId, 'L1-SUPERVISOR');
      assert.equal(msg.targetAgentId, 'worker-code');
      assert.equal(msg.intent, 'INSTRUCT');
      assert.ok(msg.messageId.startsWith('a2a-'));
    });
  });
});
