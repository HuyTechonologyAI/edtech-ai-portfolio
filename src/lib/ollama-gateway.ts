/**
 * OLLAMA GATEWAY ENGINE — HUY AI CENTER V1.1
 * Core adapter, circuit-breaker, contract validation, and streaming proxy.
 */

export interface OllamaGatewayConfig {
  baseUrl: string;
  defaultModel: string;
  timeoutMs: number;
}

export interface OllamaValidateResult {
  valid: boolean;
  error?: string;
}

export interface OllamaGeneratePayload {
  taskId: string;
  agentId: string;
  agentName?: string;
  model?: string;
  prompt: string;
  stream?: boolean;
  context?: string;
}

export function validateOllamaRequest(payload: unknown): OllamaValidateResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload must be a non-null object' };
  }
  const p = payload as Record<string, unknown>;
  if (!p.taskId || typeof p.taskId !== 'string' || p.taskId.trim() === '') {
    return { valid: false, error: 'taskId is required and must be a non-empty string' };
  }
  if (!p.agentId || typeof p.agentId !== 'string' || p.agentId.trim() === '') {
    return { valid: false, error: 'agentId is required and must be a non-empty string' };
  }
  if (!p.prompt || typeof p.prompt !== 'string' || p.prompt.trim() === '') {
    return { valid: false, error: 'prompt is required and must be a non-empty string' };
  }
  return { valid: true };
}

export function buildOllamaPrompt(prompt: string, context?: string): string {
  if (context && context.trim().length > 0) {
    return `CONTEXT:\n${context.trim()}\n\n---\n\nTASK:\n${prompt.trim()}`;
  }
  return prompt.trim();
}

export interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
  coolDownMs: number;
}

export function createCircuitBreaker(coolDownMs = 30000): CircuitBreakerState {
  return {
    failureCount: 0,
    lastFailureTime: 0,
    isOpen: false,
    coolDownMs,
  };
}

export function recordCircuitFailure(state: CircuitBreakerState, threshold = 3, now = Date.now()): CircuitBreakerState {
  const failureCount = state.failureCount + 1;
  const isOpen = failureCount >= threshold;
  return {
    ...state,
    failureCount,
    lastFailureTime: now,
    isOpen,
  };
}

export function recordCircuitSuccess(state: CircuitBreakerState): CircuitBreakerState {
  return {
    ...state,
    failureCount: 0,
    lastFailureTime: 0,
    isOpen: false,
  };
}

export function isCircuitOpen(state: CircuitBreakerState, now = Date.now()): boolean {
  if (!state.isOpen) return false;
  // If cooldown passed, allow half-open test
  if (now - state.lastFailureTime > state.coolDownMs) {
    return false;
  }
  return true;
}
