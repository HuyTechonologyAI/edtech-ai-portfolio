import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { generateKeyPairSync, sign } from 'node:crypto';
import ts from 'typescript';
import { validateNode01TelemetryPayload, verifyNode01TelemetryEnvelope } from './node01-telemetry-auth.js';

// Exercise the actual route with an isolated database and test signing key.
function harness(failure?: string) {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const writes: { table: string; value: unknown }[] = [];
  const exports: { POST?: (req: Request) => Promise<Response> } = {};
  const source = readFileSync('src/app/api/node01/telemetry/route.ts', 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, console: { error() {} }, Buffer,
    require(name: string) {
      if (name === 'next/server') return { NextResponse: Response };
      if (name === '@/lib/node01-telemetry-auth') return {
        validateNode01TelemetryPayload,
        verifyNode01TelemetryEnvelope: (envelope: Parameters<typeof verifyNode01TelemetryEnvelope>[0]) => verifyNode01TelemetryEnvelope(envelope, publicKey),
      };
      if (name === '@/lib/supabase-admin') return { supabaseAdmin: { from(table: string) {
        return {
          update(value: unknown) { writes.push({ table, value }); return { eq: async () => ({ error: failure === table ? { message: 'failed' } : null }) }; },
          async insert(value: unknown) { writes.push({ table, value }); return { error: failure === table ? { message: 'failed' } : null }; },
        };
      } } };
      throw new Error(name);
    },
  });
  const payload = { version: 1, nodeId: 'huy-ai-node-01', timestamp: new Date().toISOString(), status: 'ONLINE', metrics: { cpu: 1, ram: 2, disk: 3, ramFree: 4, ramTotal: 5, active: 1, queue: 0 }, metadata: { runtimeWorkers: { codex: 1 } } };
  function envelope(value: unknown = payload) {
    const payload = JSON.stringify(value);
    return { payload, signature: sign(null, Buffer.from(payload), privateKey).toString('base64') };
  }
  return { writes, payload, envelope, post: (body: string) => exports.POST!(new Request('http://localhost/api/node01/telemetry', { method: 'POST', body })) };
}

test('signed ingest persists evidence and metadata only after validation', async () => {
  const h = harness();
  const envelope = h.envelope();
  assert.equal((await h.post(JSON.stringify(envelope))).status, 200);
  assert.equal(h.writes.length, 2);
  const row = h.writes[1].value as { metadata: { signedEnvelope: unknown } };
  assert.deepEqual(JSON.parse(JSON.stringify(row.metadata.signedEnvelope)), envelope);
});
test('invalid JSON, signature and signed payload never write to the database', async () => {
  const h = harness();
  assert.equal((await h.post('{')).status, 400);
  assert.equal((await h.post(JSON.stringify({ ...h.envelope(), signature: 'bad' }))).status, 401);
  assert.equal((await h.post(JSON.stringify(h.envelope({ ...h.payload, nodeId: 'foreign' })))).status, 400);
  assert.equal(h.writes.length, 0);
});
test('database failures return errors rather than accepted telemetry', async () => {
  for (const table of ['nodes', 'node_heartbeats']) {
    const h = harness(table);
    assert.equal((await h.post(JSON.stringify(h.envelope()))).status, 500);
    assert.equal(h.writes.length, table === 'nodes' ? 1 : 2);
  }
});

test('catalog commands remain available but never claim verified runtime activity', async () => {
  const exports: { POST?: (req: Request) => Promise<Response>; getLiveTelemetryData?: () => { agents: { state: string; currentTask: string }[] } } = {};
  const source = readFileSync('src/app/api/admincenter/telemetry/route.ts', 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require(name: string) {
      if (name === 'next/server') return { NextResponse: Response };
      if (name === '@/data/ai-agency-canonical') return { CANONICAL_59_AGENTS: [{ id: 'L1-test', name: 'Test', businessUnit: 'Test', state: 'ACTIVE' }] };
      throw new Error(name);
    },
  });
  for (const body of [
    { action: 'agent_action', agentId: 'L1-test', agentAction: 'activate', task: 'Review' },
    { action: 'broadcast_directive', targetBU: 'ALL', directive: 'Review', priority: 'P0' },
  ]) {
    const response = await exports.POST!(new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) }));
    assert.equal(response.status, 200);
    const agent = exports.getLiveTelemetryData!().agents[0];
    assert.equal(agent.state, 'STANDBY');
    assert.match(agent.currentTask, /Review/);
  }
});

[executed on device: huy-ai-node-01 (3d9d4003-83b9-4fae-ab79-1bd43ee9288b)]