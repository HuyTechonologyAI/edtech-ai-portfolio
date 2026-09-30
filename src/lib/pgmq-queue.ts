/**
 * PGMQ DURABLE QUEUE — HUY AI CENTER V1.1
 * Durable FIFO/Priority message queue with ack and dead-letter protection.
 */

export interface PGMQMessage<T = unknown> {
  msgId: string;
  queue: string;
  priority: number; // 0 is highest
  payload: T;
  enqueuedAt: string;
  vt: number; // Visibility timeout timestamp
  readCount: number;
}

export interface PGMQQueueState<T = unknown> {
  queueName: string;
  messages: PGMQMessage<T>[];
  deadLetter: PGMQMessage<T>[];
  maxDeliveryAttempts: number;
  visibilityTimeoutSec: number;
}

export function createPGMQQueue<T = unknown>(
  queueName: string,
  visibilityTimeoutSec = 30,
  maxDeliveryAttempts = 5
): PGMQQueueState<T> {
  return {
    queueName,
    messages: [],
    deadLetter: [],
    maxDeliveryAttempts,
    visibilityTimeoutSec,
  };
}

export function enqueueMessage<T = unknown>(
  state: PGMQQueueState<T>,
  payload: T,
  priority = 1,
  now = Date.now()
): { state: PGMQQueueState<T>; msgId: string } {
  const msgId = `MSG-${now}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const message: PGMQMessage<T> = {
    msgId,
    queue: state.queueName,
    priority,
    payload,
    enqueuedAt: new Date(now).toISOString(),
    vt: 0,
    readCount: 0,
  };

  const updatedMessages = [...state.messages, message].sort((a, b) => a.priority - b.priority);
  return {
    state: {
      ...state,
      messages: updatedMessages,
    },
    msgId,
  };
}

export function readMessage<T = unknown>(
  state: PGMQQueueState<T>,
  now = Date.now()
): { state: PGMQQueueState<T>; message: PGMQMessage<T> | null } {
  const availableIdx = state.messages.findIndex(m => m.vt <= now);
  if (availableIdx === -1) {
    return { state, message: null };
  }

  const target = state.messages[availableIdx];
  const nextReadCount = target.readCount + 1;

  // If exceeded delivery attempts, move to dead letter queue
  if (nextReadCount > state.maxDeliveryAttempts) {
    const updatedMessages = state.messages.filter((_, idx) => idx !== availableIdx);
    const updatedDeadLetter = [...state.deadLetter, { ...target, readCount: nextReadCount }];
    return {
      state: {
        ...state,
        messages: updatedMessages,
        deadLetter: updatedDeadLetter,
      },
      message: null,
    };
  }

  const updatedMessage: PGMQMessage<T> = {
    ...target,
    readCount: nextReadCount,
    vt: now + state.visibilityTimeoutSec * 1000,
  };

  const updatedMessages = [...state.messages];
  updatedMessages[availableIdx] = updatedMessage;

  return {
    state: {
      ...state,
      messages: updatedMessages,
    },
    message: updatedMessage,
  };
}

export function acknowledgeMessage<T = unknown>(
  state: PGMQQueueState<T>,
  msgId: string
): { state: PGMQQueueState<T>; acknowledged: boolean } {
  const exists = state.messages.some(m => m.msgId === msgId);
  if (!exists) {
    return { state, acknowledged: false };
  }

  return {
    state: {
      ...state,
      messages: state.messages.filter(m => m.msgId !== msgId),
    },
    acknowledged: true,
  };
}
