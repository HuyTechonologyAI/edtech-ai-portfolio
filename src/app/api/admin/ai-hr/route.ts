import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { getErrorMessage } from "@/lib/error-message";
import {
  AI_HR_OFFICERS,
  HARD_RULES_CATALOG,
  generateInitialLifecycleRecords,
  validateLifecycleTransition,
  calculateWeightedKPIScore,
  classifyKPIBand,
  DEFAULT_KPI_WEIGHTS,
  AgentLifecycleRecord,
} from "@/data/ai-hr-lifecycle";

// In-memory runtime storage fallback for demonstration & state sync
const cachedRecords: AgentLifecycleRecord[] = generateInitialLifecycleRecords();
const auditLogsStore: Array<{
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  evidenceHash: string;
}> = [
  {
    id: "log_001",
    timestamp: new Date().toISOString(),
    actor: "emp_63 (Gia Linh)",
    action: "LIFECYCLE_INITIALIZED",
    details: "Khởi tạo hệ thống vòng đời AI HR cho 63 nhân sự. 100% đạt chuẩn danh tính và avatar.",
    evidenceHash: "sha256-8f3e1a0b5c9d4e2f",
  },
];

export async function GET(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const total = cachedRecords.length;
    const active = cachedRecords.filter((r) => r.status === "active").length;
    const probation = cachedRecords.filter((r) => r.status === "probation").length;
    const pendingApproval = cachedRecords.filter((r) => r.status === "pending_approval").length;
    const suspended = cachedRecords.filter((r) => r.status === "suspended").length;
    const quarantined = cachedRecords.filter((r) => r.status === "quarantined").length;
    const retired = cachedRecords.filter((r) => r.status === "retired").length;
    const improvementPlan = cachedRecords.filter((r) => r.status === "improvement_plan").length;

    return NextResponse.json({
      summary: {
        total,
        active,
        probation,
        pendingApproval,
        suspended,
        quarantined,
        retired,
        improvementPlan,
      },
      officers: AI_HR_OFFICERS,
      hardRules: HARD_RULES_CATALOG,
      records: cachedRecords,
      auditLogs: auditLogsStore.slice(0, 50),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "TRANSITION_STATE") {
      const { agentId, toStatus, requestedBy, reason, humanApproved } = body;
      const agentIndex = cachedRecords.findIndex((r) => r.agentId === agentId);
      if (agentIndex === -1) {
        return NextResponse.json({ error: `Agent not found: ${agentId}` }, { status: 404 });
      }

      const currentRecord = cachedRecords[agentIndex];
      const validation = validateLifecycleTransition({
        agentId,
        fromStatus: currentRecord.status,
        toStatus,
        requestedBy: requestedBy || "admin",
        reason: reason || "Cập nhật trạng thái vòng đời",
        humanApproved: !!humanApproved,
      });

      if (!validation.allowed) {
        return NextResponse.json(
          { error: validation.error, requiresHumanGate: validation.requiresHumanGate },
          { status: 400 }
        );
      }

      const prevStatus = currentRecord.status;
      cachedRecords[agentIndex] = {
        ...currentRecord,
        status: toStatus,
        lastEvaluatedAt: new Date().toISOString(),
      };

      const logEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: requestedBy || "admin",
        action: "STATE_TRANSITION",
        details: `Chuyển trạng thái [${agentId} - ${currentRecord.name}]: ${prevStatus} ➔ ${toStatus}. Lý do: ${reason}`,
        evidenceHash: `sha256-${Math.random().toString(16).substring(2, 10)}`,
      };
      auditLogsStore.unshift(logEntry);

      return NextResponse.json({
        success: true,
        record: cachedRecords[agentIndex],
        log: logEntry,
      });
    }

    if (action === "TRIGGER_INCIDENT") {
      const { agentId, ruleId, reportedBy, description } = body;
      const rule = HARD_RULES_CATALOG.find((r) => r.ruleId === ruleId);
      if (!rule) {
        return NextResponse.json({ error: `Invalid rule: ${ruleId}` }, { status: 400 });
      }

      const agentIndex = cachedRecords.findIndex((r) => r.agentId === agentId);
      if (agentIndex === -1) {
        return NextResponse.json({ error: `Agent not found: ${agentId}` }, { status: 404 });
      }

      const currentRecord = cachedRecords[agentIndex];
      let newStatus = currentRecord.status;

      if (rule.defaultAction === "QUARANTINE") {
        newStatus = "quarantined";
      } else if (rule.defaultAction === "REVOKE_PERMISSIONS") {
        newStatus = "suspended";
      } else if (rule.defaultAction === "IMPROVEMENT_PLAN") {
        newStatus = "improvement_plan";
      }

      cachedRecords[agentIndex] = {
        ...currentRecord,
        status: newStatus,
        activeIncidents: currentRecord.activeIncidents + 1,
        lastEvaluatedAt: new Date().toISOString(),
      };

      const logEntry = {
        id: `inc_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: reportedBy || "emp_57 (Thiên Ân)",
        action: `HARD_RULE_VIOLATION: ${rule.ruleId}`,
        details: `Phát hiện vi phạm quy tắc [${rule.title}] mức [${rule.severity}]. Áp dụng: ${rule.defaultAction}. Mô tả: ${description}`,
        evidenceHash: `sha256-${Math.random().toString(16).substring(2, 10)}`,
      };
      auditLogsStore.unshift(logEntry);

      return NextResponse.json({
        success: true,
        appliedAction: rule.defaultAction,
        newStatus,
        log: logEntry,
      });
    }

    if (action === "EVALUATE_KPI") {
      const { agentId, qualityScore, completionScore, complianceScore, resourceScore, speedScore } = body;
      const agentIndex = cachedRecords.findIndex((r) => r.agentId === agentId);
      if (agentIndex === -1) {
        return NextResponse.json({ error: `Agent not found: ${agentId}` }, { status: 404 });
      }

      const score = calculateWeightedKPIScore(
        {
          qualityScore: Number(qualityScore) || 85,
          completionScore: Number(completionScore) || 85,
          complianceScore: Number(complianceScore) || 90,
          resourceScore: Number(resourceScore) || 80,
          speedScore: Number(speedScore) || 85,
        },
        DEFAULT_KPI_WEIGHTS
      );

      const classification = classifyKPIBand(score);

      cachedRecords[agentIndex] = {
        ...cachedRecords[agentIndex],
        kpiScore: score,
        kpiBand: classification.band,
        lastEvaluatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        score,
        classification,
        record: cachedRecords[agentIndex],
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
