import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPGMQQueue,
  enqueueMessage,
  readMessage,
  acknowledgeMessage,
} from './pgmq-queue.js';

test('PGMQ Queue: enqueues messages with priority ordering', () => {
  let q = createPGMQQueue('a2a_bus');
  const res1 = enqueueMessage(q, { task: 'Low Priority' }, 2, 1000);
  q = res1.state;
  const res2 = enqueueMessage(q, { task: 'High Priority P0' }, 0, 1001);
  q = res2.state;

  // First message read must be the P0 message
  const read1 = readMessage(q, 1002);
  q = read1.state;
  assert.equal(read1.message?.msgId, res2.msgId);
  assert.equal((read1.message?.payload as { task: string }).task, 'High Priority P0');
});

test('PGMQ Queue: respects visibility timeout and prevents duplicate read before timeout', () => {
  let q = createPGMQQueue('a2a_bus', 10); // 10 seconds = 10,000 ms
  const enq = enqueueMessage(q, { data: 'test' }, 1, 1000);
  q = enq.state;

  // Read message at 1000ms -> vt becomes 11,000ms
  const read1 = readMessage(q, 1000);
  q = read1.state;
  assert.notEqual(read1.message, null);

  // Attempt second read at 5000ms (within 10s visibility timeout) -> must return null
  const read2 = readMessage(q, 5000);
  q = read2.state;
  assert.equal(read2.message, null);

  // Read at 11,001ms (timeout expired, worker didn't ack) -> redelivered
  const read3 = readMessage(q, 11001);
  q = read3.state;
  assert.notEqual(read3.message, null);
  assert.equal(read3.message?.readCount, 2);
});

test('PGMQ Queue: acknowledge removes message permanently', () => {
  let q = createPGMQQueue('a2a_bus');
  const enq = enqueueMessage(q, { data: 'ack_me' }, 1, 1000);
  q = enq.state;

  const read = readMessage(q, 1000);
  q = read.state;
  assert.notEqual(read.message, null);

  // Acknowledge message
  const ack = acknowledgeMessage(q, read.message!.msgId);
  q = ack.state;
  assert.equal(ack.acknowledged, true);
  assert.equal(q.messages.length, 0);
});

test('PGMQ Queue: moves to dead letter queue after exceeding max delivery attempts', () => {
  let q = createPGMQQueue('a2a_bus', 5, 2); // 5s = 5000ms, max 2 attempts
  const enq = enqueueMessage(q, { bug: 'fails always' }, 1, 1000);
  q = enq.state;

  // Attempt 1 at 1000ms -> vt becomes 6000ms
  q = readMessage(q, 1000).state;
  // Attempt 2 at 6001ms -> vt becomes 11001ms
  q = readMessage(q, 6001).state;
  // Attempt 3 at 11002ms -> exceeds 2 attempts -> moved to dead letter
  const res = readMessage(q, 11002);
  q = res.state;

  assert.equal(res.message, null);
  assert.equal(q.deadLetter.length, 1);
  assert.equal(q.messages.length, 0);
});
