import test from "node:test";
import assert from "node:assert/strict";
import {
  formatHumanGateEmail,
  validateHumanGatePayload,
  dispatchHumanGateNotification,
  type HumanGateNotificationPayload,
} from "./human-gate-notifier";

test("Human Gate Notifier: formatHumanGateEmail builds correct subject and body", () => {
  const payload: HumanGateNotificationPayload = {
    hgId: "HG-01",
    taskId: "13-human-gate-email",
    riskLevel: "R3",
    triggerReason: "RETRY_LIMIT_EXHAUSTED",
    repairAttempts: 5,
    lastError: "Ollama timeout after 5 attempts",
    contextSummary: "Worker WORKER-L3-DEV-01 exceeded retry budget on Node-01",
  };

  const email = formatHumanGateEmail(payload);

  assert.equal(
    email.subject,
    "[HUY AI CENTER] [HUMAN GATE HG-01] BÁO CÁO XIN CHỈ THỊ TỪ ROOT OF TRUST"
  );
  assert.equal(email.to, "huytechnologyai2025@gmail.com");
  assert.ok(email.bodyText.includes("HG-01"));
  assert.ok(email.bodyText.includes("13-human-gate-email"));
  assert.ok(email.bodyText.includes("RETRY_LIMIT_EXHAUSTED"));
  assert.ok(email.bodyText.includes("R3"));
});

test("Human Gate Notifier: validateHumanGatePayload validates required fields", () => {
  assert.equal(
    validateHumanGatePayload({
      hgId: "HG-02",
      taskId: "core-task",
      riskLevel: "R4",
      triggerReason: "SECURITY_BREACH_ATTEMPT",
      repairAttempts: 1,
    }),
    true
  );

  assert.equal(
    validateHumanGatePayload({
      hgId: "",
      taskId: "core-task",
      riskLevel: "R4",
      triggerReason: "SECURITY_BREACH_ATTEMPT",
      repairAttempts: 1,
    }),
    false
  );

  assert.equal(
    validateHumanGatePayload(null as unknown as HumanGateNotificationPayload),
    false
  );
});

test("Human Gate Notifier: dispatchHumanGateNotification dispatches and returns delivery receipt", async () => {
  const payload: HumanGateNotificationPayload = {
    hgId: "HG-03",
    taskId: "09-worktree-isolation",
    riskLevel: "R2",
    triggerReason: "MANUAL_ESCALATION",
    repairAttempts: 0,
    contextSummary: "Escalation requested by Autonomous Supervisor",
  };

  const receipt = await dispatchHumanGateNotification(payload);
  assert.equal(receipt.success, true);
  assert.ok(receipt.messageId.startsWith("HG-RECEIPT-"));
  assert.equal(receipt.recipient, "huytechnologyai2025@gmail.com");
});
