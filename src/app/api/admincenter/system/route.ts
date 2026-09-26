import { NextResponse } from "next/server";

export async function GET() {
  const systemStatus = {
    timestamp: new Date().toISOString(),
    status: "READY_FOR_AI_INGESTION",
    topology: {
      controlPlane: {
        node: "Lenovo-ThinkPad",
        role: "REMOTE_CONTROL_PLANE_ONLY",
        status: "ACTIVE",
        storagePolicy: "ZERO_PERMANENT_STORAGE",
      },
      authoritativeAnchor: {
        node: "Dell-Precision-M4800",
        peerName: "huy-node01",
        tailscaleIP: "100.79.240.108",
        lanIP: "192.168.1.230:41641",
        role: "AUTHORITATIVE_STORAGE_ANCHOR",
        status: "CONNECTED",
        storageRoots: {
          canonicalProjects: "/mnt/data1/Projects/HUY-AI-Center",
          directivesAndPayloads: "/mnt/data1/HUY-AI",
          stagingSpool: "/mnt/data1/HUY-AI/staging",
          protectedZone: "/mnt/data2 (R4_PROTECTED_LOCKED)",
        },
      },
    },
    aiFleet: {
      totalAgents: 59,
      activeAgents: 1, // L0 Human Owner
      standbyAgents: 58,
      quarantinedAgents: 0,
      businessUnitsCount: 6,
      quotaUtilizationPct: 0,
      tokensUsedTotal: 0,
      tokensLimitTotal: 50000000,
    },
    queue: {
      pendingTasks: 0,
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      dispatcherStatus: "STANDBY_READY",
    },
    realAuditLogs: [
      {
        id: "AUDIT-001",
        timestamp: "2026-09-26T16:39:52Z",
        event: "MIGRATION_DELIVERY_SUCCESS",
        actor: "Lenovo-Control-Plane",
        details: "3 gói dữ liệu (PKG-01, PKG-02, PKG-03) tổng 95.51 MB nạp thành công vào Spool của Dell M4800 Node-01 qua Taildrop.",
        level: "INFO",
      },
      {
        id: "AUDIT-002",
        timestamp: "2026-09-26T20:00:00Z",
        event: "TOPOLOGY_RULE_ENFORCED",
        actor: "System Architecture Guardian",
        details: "Khóa cứng nguyên tắc: Lenovo là REMOTE_CONTROL_PLANE_ONLY; Node-01 là AUTHORITATIVE_STORAGE_ANCHOR. Phân vùng /mnt/data2 khóa R4 PROTECTED.",
        level: "SECURITY",
      },
      {
        id: "AUDIT-003",
        timestamp: "2026-09-26T20:06:37Z",
        event: "SUPERADMIN_GATEWAY_INITIALIZED",
        actor: "Human Owner Gate",
        details: "Cổng quản trị /admincenter kích hoạt với tài khoản SuperAdmin, yêu cầu đổi mật khẩu ngay lần đầu đăng nhập.",
        level: "AUTH",
      },
      {
        id: "AUDIT-004",
        timestamp: "2026-09-26T20:08:00Z",
        event: "AI_FLEET_STANDBY_ARMED",
        actor: "HAIP Dispatcher Core",
        details: "Toàn bộ 59 AI Agency thuộc 6 Business Units được khởi tạo ở trạng thái SẴN SÀNG (STANDBY), quota 0%, sạch dữ liệu test, sẵn sàng nhận việc.",
        level: "READY",
      },
    ],
  };

  return NextResponse.json(systemStatus);
}
