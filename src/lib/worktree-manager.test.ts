import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorktreeManifest,
  formatCheckpointMarkdown,
  validateWorktreeIsolation,
} from './worktree-manager.js';

test('Worktree Manager: generates valid AGENT_MANIFEST.json contract', () => {
  const manifest = createWorktreeManifest({
    worktreeId: 'antigravity/09-worktree-isolation',
    taskId: '09-worktree-isolation',
    workerId: 'WORKER-L3-DEV-01',
    capability: 'architecture',
    description: 'Set up isolated agent worktrees',
  });

  assert.equal(manifest.worktree_id, 'antigravity/09-worktree-isolation');
  assert.equal(manifest.task_id, '09-worktree-isolation');
  assert.equal(manifest.checkpoint, 'TASK_CREATED');
  assert.equal(manifest.lifecycle_phase, 'PREDICT');
  assert.equal(manifest.status, 'QUEUED');
});

test('Worktree Manager: checkpoint markdown table formats correctly', () => {
  const md = formatCheckpointMarkdown([
    { checkpoint: 'TASK_CREATED', lifecycle: 'PREDICT', timestamp: '2026-09-30T12:00:00Z', notes: 'Task initialized' },
    { checkpoint: 'UNIT_TEST_GREEN', lifecycle: 'GREEN', timestamp: '2026-09-30T12:05:00Z', notes: '40 tests pass' },
  ]);

  assert.match(md, /# V1.1 WORKTREE CHECKPOINT LOG/);
  assert.match(md, /TASK_CREATED/);
  assert.match(md, /UNIT_TEST_GREEN/);
});

test('Worktree Manager: validates workspace isolation prevents contamination', () => {
  // Completely separate workspaces
  assert.equal(validateWorktreeIsolation('.agent-worktrees/antigravity/task-01', '.agent-worktrees/codex/task-02'), true);

  // Exact duplicate collision
  assert.equal(validateWorktreeIsolation('.agent-worktrees/antigravity/task-01', '.agent-worktrees/antigravity/task-01'), false);

  // Nested child collision (contamination)
  assert.equal(validateWorktreeIsolation('.agent-worktrees/antigravity', '.agent-worktrees/antigravity/task-01'), false);
  assert.equal(validateWorktreeIsolation('.agent-worktrees/antigravity/task-01', '.agent-worktrees/antigravity'), false);
});
