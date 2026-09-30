import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateOllamaRequest,
  buildOllamaPrompt,
  createCircuitBreaker,
  recordCircuitFailure,
  recordCircuitSuccess,
  isCircuitOpen,
} from './ollama-gateway.js';

test('Ollama Gateway: validates payload requirements', () => {
  // Empty or invalid types
  assert.equal(validateOllamaRequest(null).valid, false);
  assert.equal(validateOllamaRequest(undefined).valid, false);
  assert.equal(validateOllamaRequest('string').valid, false);

  // Missing fields
  assert.equal(validateOllamaRequest({ agentId: 'A1', prompt: 'test' }).valid, false);
  assert.equal(validateOllamaRequest({ taskId: 'T1', prompt: 'test' }).valid, false);
  assert.equal(validateOllamaRequest({ taskId: 'T1', agentId: 'A1' }).valid, false);
  assert.equal(validateOllamaRequest({ taskId: '', agentId: 'A1', prompt: 'test' }).valid, false);

  // Happy path
  const valid = validateOllamaRequest({
    taskId: '08a-model-gateway',
    agentId: 'WORKER-L3-DEV-01',
    prompt: 'Implement Ollama adapter',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.error, undefined);
});

test('Ollama Gateway: prompt builder combines context and prompt cleanly', () => {
  const standalone = buildOllamaPrompt('Generate unit test');
  assert.equal(standalone, 'Generate unit test');

  const withContext = buildOllamaPrompt('Generate unit test', 'System Architecture V1.1');
  assert.match(withContext, /CONTEXT:\nSystem Architecture V1.1/);
  assert.match(withContext, /TASK:\nGenerate unit test/);
});

test('Ollama Gateway: circuit breaker fails closed after threshold and cools down', () => {
  let cb = createCircuitBreaker(5000);
  assert.equal(isCircuitOpen(cb, 1000), false);

  // 1 failure
  cb = recordCircuitFailure(cb, 3, 1000);
  assert.equal(isCircuitOpen(cb, 1000), false);

  // 2 failures
  cb = recordCircuitFailure(cb, 3, 1500);
  assert.equal(isCircuitOpen(cb, 1500), false);

  // 3 failures -> Tripped OPEN
  cb = recordCircuitFailure(cb, 3, 2000);
  assert.equal(isCircuitOpen(cb, 2000), true);
  assert.equal(isCircuitOpen(cb, 4000), true);

  // Cooldown passes (at 7001ms > 2000 + 5000)
  assert.equal(isCircuitOpen(cb, 7001), false);

  // Successful call resets circuit breaker
  cb = recordCircuitSuccess(cb);
  assert.equal(cb.failureCount, 0);
  assert.equal(cb.isOpen, false);
});
