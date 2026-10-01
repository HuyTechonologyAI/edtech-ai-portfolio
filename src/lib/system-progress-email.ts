/**
 * SYSTEM PROGRESS & MULTI-AGENT REPORTING ENGINE — HUY AI CENTER
 *
 * Automatically consolidates:
 * 1. Multi-agent AI work execution history and achievements
 * 2. Real calculated progress percentage (%) of system build
 * 3. Quality gate statuses and token savings
 * 4. Executive-grade email reporting dispatched to Root of Trust (huytechnologyai2025@gmail.com)
 */

export interface SystemProgressSummaryPayload {
  recipientEmail?: string;
  supervisorId: string;
  operatingMode: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  queuedTasks: number;
  progressPercentage: number;
  strictPercentage: number;
  workers: Array<{
    id: string;
    name: string;
    role: string;
    capability: string;
    status: string;
    workCompleted: string;
  }>;
  recentAchievements: string[];
  qualityGatesSummary: {
    unitTests: string;
    typecheck: string;
    lint: string;
    build: string;
  };
  tokensSaved: number;
}

export interface FormattedProgressEmail {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface ProgressDeliveryReceipt {
  success: boolean;
  messageId: string;
  recipient: string;
  timestamp: string;
  transport: "smtp" | "resend" | "mock";
  error?: string;
}

const DEFAULT_RECIPIENT = "huytechnologyai2025@gmail.com";

/**
 * Calculates strict verified percentage and weighted lifecycle progress.
 */
export function calculateSystemProgress(tasks: Array<{ status: string; lifecycle?: string }>): {
  strictPercentage: number;
  weightedPercentage: number;
} {
  if (!tasks || tasks.length === 0) {
    return { strictPercentage: 0, weightedPercentage: 0 };
  }

  const total = tasks.length;
  let completed = 0;
  let weightedPoints = 0;

  for (const t of tasks) {
    if (t.status === "VERIFIED_PASS" || t.lifecycle === "VERIFIED_PASS") {
      completed += 1;
      weightedPoints += 100;
    } else if (t.status === "IN_PROGRESS") {
      if (t.lifecycle === "INTEGRATION_TEST" || t.lifecycle === "BUILD") {
        weightedPoints += 85;
      } else if (t.lifecycle === "IMPLEMENT") {
        weightedPoints += 75;
      } else if (t.lifecycle === "RED" || t.lifecycle === "TEST_FIRST") {
        weightedPoints += 50;
      } else {
        weightedPoints += 40;
      }
    } else if (t.status === "DISPATCHED") {
      weightedPoints += 50;
    } else if (t.status === "RETRYING") {
      weightedPoints += 60;
    } else {
      // QUEUED
      weightedPoints += 10;
    }
  }

  const strictPercentage = Math.round((completed / total) * 1000) / 10;
  const weightedPercentage = Math.round((weightedPoints / (total * 100)) * 1000) / 10;

  return { strictPercentage, weightedPercentage };
}

/**
 * Formats a clean, executive email with high readability in both plaintext and HTML.
 */
export function formatSystemProgressEmail(payload: SystemProgressSummaryPayload): FormattedProgressEmail {
  const recipient = payload.recipientEmail || DEFAULT_RECIPIENT;
  const subject = `[HUY AI CENTER] BÁO CÁO TIẾN ĐỘ XÂY DỰNG HỆ THỐNG & KẾT QUẢ ĐA TÁC TỬ AI (V1.1 - ${payload.progressPercentage}%)`;

  const workerDetails = payload.workers
    .map(
      (w) => `• [${w.id}] ${w.name} (${w.status}):
  - Vai trò & Năng lực: ${w.role} [${w.capability}]
  - Công việc đã hoàn thành: ${w.workCompleted}`
    )
    .join("\n\n");

  const achievementsList = payload.recentAchievements.map((a) => `  ✓ ${a}`).join("\n");

  const bodyText = `================================================================================
HUY AI CENTER — BÁO CÁO TỔNG HỢP TIẾN ĐỘ XÂY DỰNG HỆ THỐNG & ĐA TÁC TỬ AI
================================================================================

Kính gửi: Root of Trust / SuperAdmin (${recipient})
Người gửi: ${payload.supervisorId} (Autonomous Supervisor L0)
Thời gian lập báo cáo: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
Chế độ hoạt động: ${payload.operatingMode}

────────────────────────────────────────────────────────────────────────────────
1. TỔNG QUAN TIẾN ĐỘ XÂY DỰNG HỆ THỐNG
────────────────────────────────────────────────────────────────────────────────
• TIẾN ĐỘ TRỌNG SỐ THỰC THI (Weighted Progress): ${payload.progressPercentage}%
• TIẾN ĐỘ MILESTONE NGHIỆM THU (Strict Verified Pass): ${payload.strictPercentage}%
• Tổng số tác vụ kiến trúc V1.1: ${payload.totalTasks}
• Số tác vụ đã VERIFIED_PASS (100% xanh): ${payload.completedTasks}
• Số tác vụ đang triển khai song song: ${payload.inProgressTasks}
• Số tác vụ trong hàng đợi: ${payload.queuedTasks}
• Token cloud bảo vệ/tiết kiệm lũy kế: ${payload.tokensSaved.toLocaleString()} tokens

────────────────────────────────────────────────────────────────────────────────
2. BÁO CÁO CÔNG VIỆC CỤ THỂ CỦA CÁC AI WORKER
────────────────────────────────────────────────────────────────────────────────
${workerDetails || "Không có worker active."}

────────────────────────────────────────────────────────────────────────────────
3. CÁC THÀNH TỰU ĐÃ ĐẠT ĐƯỢC
────────────────────────────────────────────────────────────────────────────────
${achievementsList}

────────────────────────────────────────────────────────────────────────────────
4. BÁO CÁO CHỈ SỐ CHẤT LƯỢNG (QUALITY GATES)
────────────────────────────────────────────────────────────────────────────────
• Unit Test Suite: ${payload.qualityGatesSummary.unitTests}
• TypeScript Typecheck: ${payload.qualityGatesSummary.typecheck}
• Lint Policy (Ratchet): ${payload.qualityGatesSummary.lint}
• Next.js Production Build: ${payload.qualityGatesSummary.build}

────────────────────────────────────────────────────────────────────────────────
5. LIÊN KẾT ĐIỀU HÀNH & GIÁM SÁT
────────────────────────────────────────────────────────────────────────────────
Bảng điều khiển trực tiếp: https://www.huycncdsai.io.vn/admincenter
Hệ thống tiếp tục vận hành tự động 24/7 theo Canonical Lifecycle V1.1.
`;

  const workerHtml = payload.workers
    .map(
      (w) => `
      <div style="background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #38bdf8; font-family: monospace;">[${w.id}] ${w.name}</strong>
          <span style="background: #065f46; color: #34d399; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${w.status}</span>
        </div>
        <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;"><strong>Vai trò:</strong> ${w.role} | <code>${w.capability}</code></p>
        <p style="margin: 4px 0; color: #f1f5f9; font-size: 13px;"><strong>Công việc thực hiện:</strong> ${w.workCompleted}</p>
      </div>`
    )
    .join("");

  const achievementsHtml = payload.recentAchievements
    .map((a) => `<li style="margin: 6px 0; color: #e2e8f0;">✓ ${a}</li>`)
    .join("");

  const bodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030712; color: #f8fafc; padding: 24px; border-radius: 14px; max-width: 720px; margin: 0 auto; border: 1px solid #0284c7;">
  <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="color: #38bdf8; margin: 0 0 8px 0;">⚡ HUY AI CENTER — BÁO CÁO TIẾN ĐỘ HỆ THỐNG</h2>
    <p style="color: #94a3b8; margin: 0; font-size: 13px;">Chế độ: <strong>${payload.operatingMode}</strong> | Supervisor: <strong>${payload.supervisorId}</strong></p>
  </div>

  <div style="background: #0f172a; border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid #1e293b;">
    <h3 style="margin: 0 0 12px 0; color: #22d3ee; font-size: 16px;">📊 Tiến Trình Xây Dựng Hệ Thống</h3>
    <div style="background: #1e293b; border-radius: 9999px; height: 16px; overflow: hidden; margin-bottom: 12px;">
      <div style="background: linear-gradient(90deg, #0284c7, #10b981); width: ${payload.progressPercentage}%; height: 100%;"></div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
      <p style="margin: 4px 0;"><strong>Tiến độ thực thi:</strong> <span style="color: #34d399; font-weight: bold; font-size: 16px;">${payload.progressPercentage}%</span></p>
      <p style="margin: 4px 0;"><strong>Nghiệm thu hoàn tất:</strong> <span style="color: #38bdf8; font-weight: bold; font-size: 16px;">${payload.strictPercentage}%</span></p>
      <p style="margin: 4px 0;"><strong>Tác vụ hoàn thành:</strong> <span style="color: #a7f3d0;">${payload.completedTasks} / ${payload.totalTasks}</span></p>
      <p style="margin: 4px 0;"><strong>Tokens bảo vệ:</strong> <span style="color: #fde047;">${payload.tokensSaved.toLocaleString()}</span></p>
    </div>
  </div>

  <h3 style="color: #22d3ee; font-size: 16px; margin: 24px 0 12px 0;">🤖 Báo Cáo Công Việc Các AI Worker</h3>
  ${workerHtml}

  <h3 style="color: #22d3ee; font-size: 16px; margin: 24px 0 12px 0;">🏆 Thành Tựu & Hợp Đồng Đã Kiểm Chứng</h3>
  <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
    ${achievementsHtml}
  </ul>

  <div style="background: #0f172a; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 12px; color: #94a3b8;">
    <strong>Trạng thái Quality Gates:</strong> Tests: ${payload.qualityGatesSummary.unitTests} | Build: ${payload.qualityGatesSummary.build} | Lint: ${payload.qualityGatesSummary.lint}
  </div>

  <div style="margin-top: 24px; text-align: center;">
    <a href="https://www.huycncdsai.io.vn/admincenter" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Truy cập Admin Center</a>
  </div>
</div>
`;

  return {
    to: recipient,
    subject,
    bodyText,
    bodyHtml,
  };
}

/**
 * Dispatches the progress summary email via Resend API or Fallback mock receipt.
 */
export async function dispatchSystemProgressEmail(
  payload: SystemProgressSummaryPayload
): Promise<ProgressDeliveryReceipt> {
  const email = formatSystemProgressEmail(payload);
  const now = new Date().toISOString();
  const receiptId = `PROGRESS-REPORT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "HUY AI Supervisor <onboarding@resend.dev>",
          to: [email.to],
          subject: email.subject,
          text: email.bodyText,
          html: email.bodyHtml,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.id || receiptId,
          recipient: email.to,
          timestamp: now,
          transport: "resend",
        };
      }
    } catch (err) {
      console.error("[PROGRESS-EMAIL] Resend transport error, falling back to mock receipt", err);
    }
  }

  // Fallback durable mock receipt
  return {
    success: true,
    messageId: receiptId,
    recipient: email.to,
    timestamp: now,
    transport: "mock",
  };
}
