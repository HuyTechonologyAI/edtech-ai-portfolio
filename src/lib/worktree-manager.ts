/**
 * WORKTREE MANAGER — HUY AI CENTER V1.1
 * Isolated workspace creation, manifest verification, and checkpoint tracking.
 */

export interface WorktreeManifest {
  worktree_id: string;
  task_id: string;
  worker_id: string;
  capability: string;
  execution_backend: string;
  model: string;
  node: string;
  checkpoint: string;
  lifecycle_phase: string;
  retry_count: number;
  retry_limit: number;
  created_at: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'VERIFIED_PASS' | 'FAILED' | 'HUMAN_GATE';
  description: string;
}

export interface CheckpointRecord {
  checkpoint: string;
  lifecycle: string;
  timestamp: string;
  notes?: string;
  evidenceRef?: string;
}

export function createWorktreeManifest(params: {
  worktreeId: string;
  taskId: string;
  workerId: string;
  capability: string;
  model?: string;
  description: string;
  retryLimit?: number;
}): WorktreeManifest {
  return {
    worktree_id: params.worktreeId,
    task_id: params.taskId,
    worker_id: params.workerId,
    capability: params.capability,
    execution_backend: 'OLLAMA_LOCAL',
    model: params.model || 'qwen2.5-coder:32b',
    node: 'huy-node01 @ 100.79.240.108',
    checkpoint: 'TASK_CREATED',
    lifecycle_phase: 'PREDICT',
    retry_count: 0,
    retry_limit: params.retryLimit || 3,
    created_at: new Date().toISOString(),
    status: 'QUEUED',
    description: params.description,
  };
}

export function formatCheckpointMarkdown(records: CheckpointRecord[]): string {
  let md = '# V1.1 WORKTREE CHECKPOINT LOG\n\n| Checkpoint | Lifecycle | Timestamp | Notes |\n|---|---|---|---|\n';
  for (const r of records) {
    md += `| ${r.checkpoint} | ${r.lifecycle} | ${r.timestamp} | ${r.notes || '-'} |\n`;
  }
  return md;
}

export function validateWorktreeIsolation(worktreeA: string, worktreeB: string): boolean {
  if (!worktreeA || !worktreeB) return false;
  const cleanA = worktreeA.replace(/[/\\]+/g, '/').trim().toLowerCase();
  const cleanB = worktreeB.replace(/[/\\]+/g, '/').trim().toLowerCase();
  return cleanA !== cleanB && !cleanA.startsWith(cleanB + '/') && !cleanB.startsWith(cleanA + '/');
}
