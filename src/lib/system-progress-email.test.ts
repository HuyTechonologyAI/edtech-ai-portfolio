import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSystemProgress,
  formatSystemProgressEmail,
  dispatchSystemProgressEmail,
  type SystemProgressSummaryPayload,
} from "./system-progress-email";

test("System Progress Email: calculateSystemProgress computes accurate percentages", () => {
  const tasks = [
    { status: "VERIFIED_PASS", lifecycle: "VERIFIED_PASS" },
    { status: "VERIFIED_PASS", lifecycle: "VERIFIED_PASS" },
    { status: "VERIFIED_PASS", lifecycle: "VERIFIED_PASS" },
    { status: "VERIFIED_PASS", lifecycle: "VERIFIED_PASS" },
    { status: "IN_PROGRESS", lifecycle: "IMPLEMENT" },
    { status: "DISPATCHED", lifecycle: "TEST_FIRST" },
  ];

  const { strictPercentage, weightedPercentage } = calculateSystemProgress(tasks);

  // 4 completed out of 6 = 66.7%
  assert.equal(strictPercentage, 66.7);
  // 4*100 + 75 + 50 = 525 / 600 = 87.5%
  assert.equal(weightedPercentage, 87.5);
});

test("System Progress Email: formatSystemProgressEmail constructs executive report", () => {
  const payload: SystemProgressSummaryPayload = {
    supervisorId: "HUY-SUPERVISOR-V1.1",
    operatingMode: "AUTONOMOUS_24_7",
    totalTasks: 6,
    completedTasks: 4,
    inProgressTasks: 2,
    queuedTasks: 0,
    progressPercentage: 87.5,
    strictPercentage: 66.7,
    workers: [
      {
        id: "WORKER-L3-DEV-01",
        name: "Fullstack Coder AI",
        role: "Code generation & Gateway",
        capability: "code_generation",
        status: "ACTIVE",
        workCompleted: "Xây dựng 08a-model-gateway và tích hợp SSE streaming panel",
      },
      {
        id: "WORKER-L3-OPS-01",
        name: "Infrastructure & Queue AI",
        role: "Worktree & PGMQ queue isolation",
        capability: "architecture",
        status: "ACTIVE",
        workCompleted: "Thiết lập .agent-worktrees, PGMQ Queue & Human Gate notifier",
      },
    ],
    recentAchievements: [
      "Task 08a-model-gateway: 100% verified with unit tests",
      "Task 09-worktree-isolation: 100% verified with manifest validation",
      "Task 10-pgmq-real-queue: 100% verified with DLQ and priority",
      "Task 13-human-gate-email: 100% verified with escalation channel",
    ],
    qualityGatesSummary: {
      unitTests: "53/53 PASS (100%)",
      typecheck: "PASS (0 errors)",
      lint: "PASS (Ratchet policy)",
      build: "PASS (30.0s, 64 routes)",
    },
    tokensSaved: 685000,
  };

  const email = formatSystemProgressEmail(payload);

  assert.equal(email.to, "huytechnologyai2025@gmail.com");
  assert.ok(email.subject.includes("[HUY AI CENTER] BÁO CÁO TIẾN ĐỘ XÂY DỰNG HỆ THỐNG"));
  assert.ok(email.subject.includes("87.5%"));
  assert.ok(email.bodyText.includes("WORKER-L3-DEV-01"));
  assert.ok(email.bodyText.includes("WORKER-L3-OPS-01"));
  assert.ok(email.bodyText.includes("685,000"));
  assert.ok(email.bodyText.includes("53/53 PASS"));
  assert.ok(email.bodyHtml.includes("87.5%"));
});

test("System Progress Email: dispatchSystemProgressEmail delivers receipt", async () => {
  const payload: SystemProgressSummaryPayload = {
    supervisorId: "HUY-SUPERVISOR-V1.1",
    operatingMode: "AUTONOMOUS_24_7",
    totalTasks: 6,
    completedTasks: 4,
    inProgressTasks: 2,
    queuedTasks: 0,
    progressPercentage: 87.5,
    strictPercentage: 66.7,
    workers: [],
    recentAchievements: ["Milestone reached"],
    qualityGatesSummary: {
      unitTests: "53/53 PASS",
      typecheck: "PASS",
      lint: "PASS",
      build: "PASS",
    },
    tokensSaved: 685000,
  };

  const receipt = await dispatchSystemProgressEmail(payload);
  assert.equal(receipt.success, true);
  assert.equal(receipt.recipient, "huytechnologyai2025@gmail.com");
  assert.ok(receipt.messageId.startsWith("PROGRESS-REPORT-"));
});
