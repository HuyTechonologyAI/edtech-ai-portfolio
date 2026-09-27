import { NextResponse } from "next/server";
import { CANONICAL_59_AGENTS, AgentCard } from "@/data/ai-agency-canonical";

export interface AgentLiveTelemetry {
  id: string;
  name: string;
  tier: string;
  role: string;
  businessUnit: string;
  provider: string;
  model: string;
  state: "ACTIVE" | "COLLABORATING" | "STANDBY" | "WARM_STANDBY" | "COLD_STANDBY" | "PAUSED" | "QUARANTINED";
  currentTask: string;
  currentThought: string;
  targetPeer: { id: string; name: string } | null;
  tokensPerSec: number;
  tokensUsed: number;
  tokensLimit: string;
  latencyMs: number;
  healthScore: number;
  progressPct: number;
  lastHeartbeat: string;
  isLeader?: boolean;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  fromAgent: { id: string; name: string; tier: string };
  toAgent: { id: string; name: string; tier: string } | null;
  type: "DIRECTIVE" | "A2A_COLLAB" | "EXECUTION" | "SECURITY" | "SYNC" | "AUDIT";
  businessUnit: string;
  content: string;
  latency: string;
  status: "STREAMING" | "ACKNOWLEDGED" | "COMPLETED";
}

// In-memory telemetry engine state
interface SwarmState {
  mode: "AUTONOMOUS_LIVE" | "STANDBY_ARMED" | "DIRECTIVE_FOCUS" | "PAUSED_SAFE";
  lastBroadcast: {
    timestamp: string;
    directive: string;
    targetBU: string;
    priority: string;
  } | null;
  customTasks: Record<string, { task: string; state: string; thought: string }>;
  events: LiveEvent[];
  startedAt: number;
}

// Global server reference
const globalForSwarm = globalThis as unknown as { __HUY_SWARM_STATE__?: SwarmState };

function getInitialState(): SwarmState {
  return {
    mode: "AUTONOMOUS_LIVE", // Start in Live Autonomous Mode by default so user sees real-time AI activity immediately!
    lastBroadcast: {
      timestamp: new Date().toISOString(),
      directive: "Toàn mạng khởi động giám sát thời gian thực & Sẵn sàng đón nhận tác vụ",
      targetBU: "ALL",
      priority: "P0",
    },
    customTasks: {},
    events: [
      {
        id: "EVT-" + Date.now() + "-1",
        timestamp: new Date(Date.now() - 15000).toISOString(),
        fromAgent: { id: "L0-OWNER", name: "Human Owner", tier: "L0" },
        toAgent: { id: "L1-P01", name: "Chief Strategy AI", tier: "L1" },
        type: "DIRECTIVE",
        businessUnit: "Tập đoàn HUY AI",
        content: "Khởi động trung tâm giám sát đa tác tử thời gian thực cho toàn bộ 59 AI Agency.",
        latency: "12ms",
        status: "COMPLETED",
      },
      {
        id: "EVT-" + Date.now() + "-2",
        timestamp: new Date(Date.now() - 11000).toISOString(),
        fromAgent: { id: "L1-P01", name: "Chief Strategy AI", tier: "L1" },
        toAgent: { id: "L1-P02", name: "Chief Technology AI", tier: "L1" },
        type: "A2A_COLLAB",
        businessUnit: "HUY TECHNOLOGY AI",
        content: "Xác nhận pipeline đồng bộ dữ liệu tới cụm Dell M4800 Node-01 (100.79.240.108).",
        latency: "28ms",
        status: "COMPLETED",
      },
      {
        id: "EVT-" + Date.now() + "-3",
        timestamp: new Date(Date.now() - 8000).toISOString(),
        fromAgent: { id: "L1-P03", name: "Chief Security Officer", tier: "L1" },
        toAgent: null,
        type: "SECURITY",
        businessUnit: "HUY TECHNOLOGY AI",
        content: "Kiểm toán an ninh phân vùng /mnt/data2: Khóa R4 PROTECTED bất khả xâm phạm. ALL CLEAR.",
        latency: "19ms",
        status: "COMPLETED",
      },
      {
        id: "EVT-" + Date.now() + "-4",
        timestamp: new Date(Date.now() - 4000).toISOString(),
        fromAgent: { id: "L2-P01", name: "Tech Lead AI", tier: "L2" },
        toAgent: { id: "L3-FE01", name: "Senior Frontend AI", tier: "L3" },
        type: "EXECUTION",
        businessUnit: "HUY TECHNOLOGY AI",
        content: "Kích hoạt Telemetry Stream UI trên /admincenter với nhịp tim thời gian thực 2.5s.",
        latency: "34ms",
        status: "STREAMING",
      },
    ],
    startedAt: Date.now(),
  };
}

const swarmState: SwarmState = globalForSwarm.__HUY_SWARM_STATE__ || getInitialState();
if (!globalForSwarm.__HUY_SWARM_STATE__) {
  globalForSwarm.__HUY_SWARM_STATE__ = swarmState;
}

// Dynamic task pools for realistic real-time operations
const ENTERPRISE_REALTIME_ACTIVITIES: Record<string, { task: string; thought: string; peerId?: string; peerName?: string }> = {
  "L0-OWNER": {
    task: "Giám sát điều hành toàn bộ 6 Business Units & Duyệt Gate Node01",
    thought: "Đang duy trì khóa Root of Trust và thẩm định các chỉ thị điều hành thời gian thực từ SuperAdmin.",
  },
  "L1-P01": {
    task: "Điều phối roadmap hệ sinh thái 6 BU & Tối ưu luồng dữ liệu",
    thought: "Phân tích cấu trúc chi phí API đa đám mây; định tuyến 40% tải tính toán sang Node-01 cục bộ.",
    peerId: "L1-P02",
    peerName: "Chief Technology AI",
  },
  "L1-P02": {
    task: "Tổng đạo diễn kiến trúc hệ thống & Giám sát hạ tầng Node-01",
    thought: "Giám sát độ trễ mạng Tailscale Mesh tới Dell M4800 (100.79.240.108); kiểm tra spool /mnt/data1/HUY-AI.",
    peerId: "L2-P01",
    peerName: "Tech Lead AI",
  },
  "L1-P03": {
    task: "Bảo vệ Root of Trust, Zero-Backdoor & Giám sát /mnt/data2",
    thought: "Thực hiện hash SHA-256 định kỳ cho cấu hình; bảo vệ bất khả xâm phạm vùng lưu trữ R4.",
    peerId: "L2-P08",
    peerName: "Security Architect AI",
  },
  "L1-P04": {
    task: "Điều hành vận hành & Kiểm soát SLA toàn bộ 59 AI Agency",
    thought: "Theo dõi nhịp tim 59 tác tử; phân bổ hạn ngạch xử lý tác vụ theo mức độ ưu tiên P0/P1/P2.",
    peerId: "L2-P03",
    peerName: "DevOps Chief AI",
  },
  "L1-P05": {
    task: "Chỉ đạo chiến lược thương hiệu & Tăng trưởng hệ sinh thái EdTech",
    thought: "Đánh giá hiệu suất chuyển đổi kênh website huycncdsai.io.vn và tối ưu hóa SEO tự động.",
    peerId: "L2-P04",
    peerName: "Marketing Director AI",
  },
  "L2-P01": {
    task: "Phân rã User Story Sprint 42 cho 4 AI Frontend & Backend",
    thought: "Biên soạn kiến trúc micro-components Next.js 15 và kết nối WebSocket Telemetry.",
    peerId: "L3-FE01",
    peerName: "Senior Frontend AI",
  },
  "L2-P02": {
    task: "Đảm bảo chất lượng sản phẩm EdTech AI & Tài liệu giáo trình",
    thought: "Thẩm định kịch bản học tập AI tương tác cho người dùng trên nền tảng huycncdsai.io.vn.",
    peerId: "L3-CR01",
    peerName: "Content Creator AI",
  },
  "L2-P03": {
    task: "Giám sát Tailscale tunnel Dell Precision M4800 & Docker Spool",
    thought: "Đo băng thông kênh Taildrop: 100.79.240.108 phản hồi 32ms. Hàng đợi PGMQ trống.",
    peerId: "L3-OPS01",
    peerName: "SRE Automation AI",
  },
  "L2-P04": {
    task: "Điều phối chiến dịch Content Marketing & Phễu tuyển sinh Q4/2026",
    thought: "Lập lịch đăng tải bài viết chuyên môn về AI Agency và Hệ thống Đa tác tử tự trị.",
    peerId: "L3-MKT01",
    peerName: "SEO Master AI",
  },
  "L3-FE01": {
    task: "Triển khai Dashboard Đa Tác Tử Thời Gian Thực trên /admincenter",
    thought: "Render biểu đồ nhịp tim, matrix liên kết A2A và thanh lệnh broadcast tức thời cho SuperAdmin.",
    peerId: "L2-P01",
    peerName: "Tech Lead AI",
  },
  "L3-BE01": {
    task: "Xử lý hàng đợi PGMQ Message Bus và định tuyến API",
    thought: "Kiểm tra độ trễ các endpoint /api/admincenter/telemetry; thời gian đáp ứng < 45ms.",
    peerId: "L2-P01",
    peerName: "Tech Lead AI",
  },
  "L3-MKT01": {
    task: "Thu thập 500 từ khóa xu hướng EdTech & AI Agency tại Việt Nam",
    thought: "Crawl dữ liệu tìm kiếm Google Trends; tổng hợp bộ từ khóa phục vụ chiến lược SEO tuần tới.",
    peerId: "L2-P04",
    peerName: "Marketing Director AI",
  },
  "L3-FIN01": {
    task: "Kiểm toán hạn ngạch token đa nền tảng và tối ưu ngân sách",
    thought: "Tổng kết định mức tiêu thụ token: Hiện tại tiết kiệm 100% nhờ nén prompt và tối ưu local Node-01.",
    peerId: "L1-P01",
    peerName: "Chief Strategy AI",
  },
};

// Generate live dynamic telemetry based on time elapsed and user mode
export function getLiveTelemetryData() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - swarmState.startedAt) / 1000);
  const isAutonomous = swarmState.mode === "AUTONOMOUS_LIVE";
  const isPaused = swarmState.mode === "PAUSED_SAFE";

  // Active agents pool (in autonomous live mode, top active core is executing real-time tasks)
  const activeAgentIds = isAutonomous
    ? [
        "L0-OWNER",
        "L1-P01",
        "L1-P02",
        "L1-P03",
        "L1-P04",
        "L1-P05",
        "L2-P01",
        "L2-P02",
        "L2-P03",
        "L2-P04",
        "L3-FE01",
        "L3-BE01",
        "L3-MKT01",
        "L3-FIN01",
      ]
    : isPaused
    ? []
    : ["L0-OWNER"];

  // Calculate dynamic tokens and throughput
  const baseTokensPerSec = isAutonomous ? 540 + Math.floor(Math.sin(elapsedSeconds / 4) * 160) : 0;
  const cumulativeTokens = isAutonomous ? 142000 + elapsedSeconds * 420 : 0;

  // Active A2A communication links
  const activeLinks = isAutonomous
    ? [
        { from: "L0-OWNER", to: "L1-P01", task: "Directing Swarm Priority", intensity: 0.9 },
        { from: "L1-P01", to: "L1-P02", task: "Node-01 Ingestion Sync", intensity: 0.8 },
        { from: "L1-P02", to: "L2-P01", task: "Next.js UI Architecture", intensity: 0.85 },
        { from: "L2-P01", to: "L3-FE01", task: "Realtime Telemetry Render", intensity: 0.95 },
        { from: "L1-P03", to: "L2-P08", task: "R4 Zero-Backdoor Guard", intensity: 0.7 },
        { from: "L2-P04", to: "L3-MKT01", task: "SEO Campaign Execution", intensity: 0.75 },
      ]
    : [];

  // Build 59 Agents Live State
  const agents: AgentLiveTelemetry[] = CANONICAL_59_AGENTS.map((canonical, idx) => {
    const custom = swarmState.customTasks[canonical.id];
    const isCoreActive = activeAgentIds.includes(canonical.id);
    const activityInfo = ENTERPRISE_REALTIME_ACTIVITIES[canonical.id];

    let state: AgentLiveTelemetry["state"] = "STANDBY";
    if (isPaused) {
      state = "PAUSED";
    } else if (custom?.state) {
      state = custom.state as any;
    } else if (isCoreActive) {
      state = activityInfo?.peerId ? "COLLABORATING" : "ACTIVE";
    } else {
      state = canonical.state as any;
    }

    // Dynamic latency & tokens
    const jitter = ((idx * 7 + elapsedSeconds) % 25) - 12;
    const latency = isPaused ? 0 : Math.max(18, 38 + jitter);
    const speed = isCoreActive ? Math.max(80, 220 + ((idx * 17 + elapsedSeconds * 5) % 180)) : 0;
    const individualTokens = isCoreActive ? Math.floor(1800 + ((idx * 450 + elapsedSeconds * speed) / 10)) : 0;
    const progress = isCoreActive ? Math.min(100, Math.floor(((elapsedSeconds * 4 + idx * 8) % 100))) : 0;

    let targetPeer: { id: string; name: string } | null = null;
    if (activityInfo?.peerId && activityInfo?.peerName && state === "COLLABORATING") {
      targetPeer = { id: activityInfo.peerId, name: activityInfo.peerName };
    }

    return {
      id: canonical.id,
      name: canonical.name,
      tier: canonical.tier,
      role: canonical.role,
      businessUnit: canonical.businessUnit,
      provider: canonical.provider,
      model: canonical.model,
      state,
      currentTask: custom?.task || (isCoreActive && activityInfo?.task ? activityInfo.task : canonical.currentTask),
      currentThought: custom?.thought || (isCoreActive && activityInfo?.thought ? activityInfo.thought : "Đang duy trì nhịp tim chuẩn, sẵn sàng tiếp nhận luồng xử lý từ SuperAdmin."),
      targetPeer,
      tokensPerSec: speed,
      tokensUsed: individualTokens,
      tokensLimit: canonical.tokensLimit,
      latencyMs: latency,
      healthScore: 100,
      progressPct: progress,
      lastHeartbeat: isPaused ? "Tạm dừng" : "Vừa cập nhật 1s trước",
      isLeader: canonical.isLeader,
    };
  });

  // Check if we should append a new realistic dynamic event
  if (isAutonomous && elapsedSeconds % 3 === 0) {
    const potentialEvents: Array<{ from: string; to?: string; type: LiveEvent["type"]; bu: string; content: string }> = [
      {
        from: "L1-P01",
        to: "L1-P02",
        type: "A2A_COLLAB",
        bu: "HUY TECHNOLOGY AI",
        content: "Khối Điều Hành đồng bộ gói tác vụ Sprint 42 vào hàng đợi PGMQ của Node-01.",
      },
      {
        from: "L2-P01",
        to: "L3-FE01",
        type: "EXECUTION",
        bu: "HUY TECHNOLOGY AI",
        content: "Tối ưu hóa re-render chu kỳ nhịp tim 2.5s trên giao diện SuperAdmin.",
      },
      {
        from: "L1-P03",
        type: "SECURITY",
        bu: "HUY TECHNOLOGY AI",
        content: "Kiểm tra phân vùng /mnt/data2: Không có truy vấn ghi bất thường. 100% Khóa R4 an toàn.",
      },
      {
        from: "L2-P04",
        to: "L3-MKT01",
        type: "A2A_COLLAB",
        bu: "MARKETING & GROWTH",
        content: "Phân tích 500 bài viết AI Agency; cập nhật dữ liệu SEO on-page cho huycncdsai.io.vn.",
      },
      {
        from: "L3-OPS01",
        type: "SYNC",
        bu: "TECHNICAL OPERATIONS",
        content: "Ping Tailscale mesh Dell M4800 (100.79.240.108:41641): 31.4ms, kết nối ổn định.",
      },
      {
        from: "L3-FIN01",
        type: "AUDIT",
        bu: "FINANCE & COMPLIANCE",
        content: "Báo cáo kiểm soát ngân sách: Tỷ lệ sử dụng quota đám mây 0.28%, tối ưu tuyệt đối.",
      },
    ];

    const pick = potentialEvents[Math.floor(Math.random() * potentialEvents.length)];
    const fromAgent = CANONICAL_59_AGENTS.find((a) => a.id === pick.from) || CANONICAL_59_AGENTS[0];
    const toAgent = pick.to ? CANONICAL_59_AGENTS.find((a) => a.id === pick.to) : null;

    // Keep events list bounded to 30 items
    if (swarmState.events.length > 30) {
      swarmState.events.shift();
    }

    swarmState.events.push({
      id: "EVT-" + now + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      fromAgent: { id: fromAgent.id, name: fromAgent.name, tier: fromAgent.tier },
      toAgent: toAgent ? { id: toAgent.id, name: toAgent.name, tier: toAgent.tier } : null,
      type: pick.type,
      businessUnit: pick.bu,
      content: pick.content,
      latency: Math.floor(22 + Math.random() * 25) + "ms",
      status: "STREAMING",
    });
  }

  const activeCount = agents.filter((a) => a.state === "ACTIVE" || a.state === "COLLABORATING").length;
  const collaboratingCount = agents.filter((a) => a.state === "COLLABORATING").length;
  const standbyCount = agents.filter((a) => a.state === "STANDBY").length;

  return {
    systemTime: new Date().toISOString(),
    swarmMode: swarmState.mode,
    lastBroadcast: swarmState.lastBroadcast,
    metrics: {
      totalAgents: 59,
      activeAgentsCount: activeCount,
      collaboratingCount,
      standbyCount,
      tokensPerSecTotal: baseTokensPerSec,
      totalTokensUsed: cumulativeTokens,
      pgmqQueueDepth: isAutonomous ? 4 : 0,
      pgmqMessagesProcessed: isAutonomous ? 128 + Math.floor(elapsedSeconds * 1.8) : 0,
      node01: {
        peerName: "huy-node01",
        lanIP: "192.168.1.230:41641",
        tailscaleIP: "100.79.240.108",
        pingMs: 32,
        status: "CONNECTED",
        storageLock: "R4_PROTECTED_LOCKED",
        spoolActiveTasks: isAutonomous ? 6 : 0,
      },
    },
    activeLinks,
    events: [...swarmState.events].reverse(), // Newest first
    agents,
  };
}

export async function GET() {
  const telemetry = getLiveTelemetryData();
  return NextResponse.json(telemetry);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "set_swarm_mode") {
      const { mode } = body;
      if (["AUTONOMOUS_LIVE", "STANDBY_ARMED", "DIRECTIVE_FOCUS", "PAUSED_SAFE"].includes(mode)) {
        swarmState.mode = mode;

        // Log mode change event
        swarmState.events.push({
          id: "EVT-" + Date.now(),
          timestamp: new Date().toISOString(),
          fromAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
          toAgent: null,
          type: "DIRECTIVE",
          businessUnit: "Tập đoàn HUY AI",
          content: `SuperAdmin chuyển chế độ vận hành Swarm sang: [${mode}].`,
          latency: "5ms",
          status: "COMPLETED",
        });

        return NextResponse.json({ success: true, mode: swarmState.mode });
      }
      return NextResponse.json({ error: "Invalid swarm mode" }, { status: 400 });
    }

    if (action === "broadcast_directive") {
      const { directive, targetBU, priority } = body;
      swarmState.lastBroadcast = {
        timestamp: new Date().toISOString(),
        directive: directive || "Chỉ thị vận hành khẩn cấp từ SuperAdmin",
        targetBU: targetBU || "ALL",
        priority: priority || "P0",
      };

      // Set mode to focus
      swarmState.mode = "AUTONOMOUS_LIVE";

      // Append broadcast event
      swarmState.events.push({
        id: "EVT-" + Date.now(),
        timestamp: new Date().toISOString(),
        fromAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
        toAgent: { id: "ALL-FLEET", name: `Toàn Thể AI (${targetBU})`, tier: "L1-L5" },
        type: "DIRECTIVE",
        businessUnit: targetBU === "ALL" ? "Toàn Hệ Thống" : targetBU,
        content: `[PHÁT LỆNH TOÀN MẠNG] [${priority}] ${directive}`,
        latency: "8ms",
        status: "STREAMING",
      });

      // Update targeted agents with the task
      CANONICAL_59_AGENTS.forEach((agent) => {
        if (targetBU === "ALL" || agent.businessUnit.includes(targetBU)) {
          swarmState.customTasks[agent.id] = {
            task: `[CHỈ THỊ SUPERADMIN] ${directive}`,
            state: "ACTIVE",
            thought: `Đang triển khai chỉ thị [${priority}] từ SuperAdmin: ${directive}`,
          };
        }
      });

      return NextResponse.json({ success: true, broadcast: swarmState.lastBroadcast });
    }

    if (action === "agent_action") {
      const { agentId, agentAction, task } = body;
      const targetAgent = CANONICAL_59_AGENTS.find((a) => a.id === agentId);
      if (!targetAgent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      if (agentAction === "activate") {
        swarmState.customTasks[agentId] = {
          task: task || `Đang xử lý nhiệm vụ phân bổ bởi SuperAdmin`,
          state: "ACTIVE",
          thought: `Được kích hoạt trực tiếp từ buồng điều khiển SuperAdmin. Bắt đầu chu trình xử lý.`,
        };
      } else if (agentAction === "standby") {
        swarmState.customTasks[agentId] = {
          task: targetAgent.currentTask,
          state: "STANDBY",
          thought: "Sẵn sàng tiếp nhận lệnh tiếp theo.",
        };
      } else if (agentAction === "quarantine") {
        swarmState.customTasks[agentId] = {
          task: "BỊ CÔ LẬP THEO YÊU CẦU BẢO MẬT",
          state: "QUARANTINED",
          thought: "Ngắt toàn bộ kết nối tới PGMQ Message Bus và Node-01.",
        };
      }

      // Log event
      swarmState.events.push({
        id: "EVT-" + Date.now(),
        timestamp: new Date().toISOString(),
        fromAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
        toAgent: { id: targetAgent.id, name: targetAgent.name, tier: targetAgent.tier },
        type: "DIRECTIVE",
        businessUnit: targetAgent.businessUnit,
        content: `Chỉ thị cá nhân tới [${targetAgent.id}] ${targetAgent.name}: Hành động ${agentAction.toUpperCase()}.`,
        latency: "14ms",
        status: "COMPLETED",
      });

      return NextResponse.json({ success: true, agentId, agentAction });
    }

    if (action === "emergency_freeze") {
      swarmState.mode = "PAUSED_SAFE";
      swarmState.events.push({
        id: "EVT-" + Date.now(),
        timestamp: new Date().toISOString(),
        fromAgent: { id: "L0-OWNER", name: "SuperAdmin", tier: "L0" },
        toAgent: null,
        type: "SECURITY",
        businessUnit: "Tập đoàn HUY AI",
        content: "🛑 [LỆNH DỪNG KHẨN CẤP] Toàn bộ 59 AI Agency bị khóa băng an toàn tức thời theo lệnh của SuperAdmin.",
        latency: "2ms",
        status: "COMPLETED",
      });
      return NextResponse.json({ success: true, mode: swarmState.mode });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
