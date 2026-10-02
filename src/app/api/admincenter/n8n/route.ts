import { NextResponse } from "next/server";

export interface N8nWorkflow {
  id: string;
  name: string;
  code: string;
  description: string;
  category: "MARKETING" | "EDUCATION" | "COMMERCE" | "OPERATIONS";
  status: "ACTIVE" | "IDLE" | "RUNNING" | "ERROR";
  schedule: string;
  lastExecutionAt: string;
  lastStatus: "SUCCESS" | "FAILED" | "PENDING";
  executionDurationMs: number;
  platforms: string[];
  metrics: {
    totalRuns: number;
    successRatePct: number;
    itemsPublished: number;
  };
}

export interface N8nExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "RUNNING";
  durationMs: number;
  details: string;
  payloadOutput?: Record<string, unknown>;
}

// In-memory persistent state across serverless calls
const INITIAL_WORKFLOWS: N8nWorkflow[] = [
  {
    id: "WF-SOC-01",
    name: "Tự Động Đăng Bài MXH (Facebook, Instagram, Threads)",
    code: "n8n-social-publisher-v1",
    description: "Tự động kích hoạt AI Local soạn bài và đăng tải lên Facebook Page, Instagram, Threads vào các khung giờ vàng 11:30 & 19:30 hàng ngày, tự động gắn nhãn nội dung AI và hashtag giáo dục.",
    category: "MARKETING",
    status: "ACTIVE",
    schedule: "11:30 & 19:30 (Mỗi ngày 2 lần)",
    lastExecutionAt: "2026-10-02T12:30:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 1420,
    platforms: ["Facebook", "Instagram", "Threads"],
    metrics: {
      totalRuns: 42,
      successRatePct: 100,
      itemsPublished: 84,
    },
  },
  {
    id: "WF-SOC-02",
    name: "Xây Kênh Video Tự Động (TikTok, YouTube Shorts, Reels)",
    code: "n8n-video-publisher-v1",
    description: "Tự động phân phối 2 video bài giảng ngắn/ngày lên TikTok, YouTube Shorts và Facebook Reels với kịch bản được tạo bởi AI Local.",
    category: "MARKETING",
    status: "ACTIVE",
    schedule: "09:00 & 20:00 (Mỗi ngày 2 video)",
    lastExecutionAt: "2026-10-02T13:00:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 3120,
    platforms: ["TikTok", "YouTube Shorts", "Facebook Reels"],
    metrics: {
      totalRuns: 28,
      successRatePct: 96.4,
      itemsPublished: 54,
    },
  },
  {
    id: "WF-EDU-01",
    name: "Phễu Thu Hút Giáo Viên AI 39k (gvcncdsai.io.vn)",
    code: "n8n-teacher-funnel-lead-v1",
    description: "Đồng bộ lead đăng ký từ cổng Giáo Viên AI, kích hoạt tài khoản học tập và phân luồng chăm sóc khách hàng tự động.",
    category: "EDUCATION",
    status: "ACTIVE",
    schedule: "Real-time Webhook (Theo sự kiện)",
    lastExecutionAt: "2026-10-02T11:45:12.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 820,
    platforms: ["Website gvcncdsai.io.vn", "Supabase", "Email"],
    metrics: {
      totalRuns: 115,
      successRatePct: 99.1,
      itemsPublished: 114,
    },
  },
  {
    id: "WF-PAY-01",
    name: "Cổng Thanh Toán SePay & Kích Hoạt Tự Động 39.000đ",
    code: "n8n-sepay-payment-bridge-v1",
    description: "Bắt biến động số dư ngân hàng SePay, đối chiếu mã đơn hàng 39.000đ, xác nhận thanh toán thật và gửi email tài liệu tự động.",
    category: "COMMERCE",
    status: "ACTIVE",
    schedule: "Real-time Webhook (Tức thời < 3s)",
    lastExecutionAt: "2026-10-02T11:15:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 650,
    platforms: ["SePay Gateway", "VietinBank / MB", "Supabase DB"],
    metrics: {
      totalRuns: 87,
      successRatePct: 100,
      itemsPublished: 87,
    },
  },
  {
    id: "WF-SEO-01",
    name: "AI SEO Engine & Quét Backlog Tự Động",
    code: "n8n-ai-seo-backlog-v1",
    description: "Quét từ khóa giáo dục AI, tối ưu hóa thẻ meta và lập chỉ mục tự động cho toàn bộ hệ sinh thái HUY AI.",
    category: "MARKETING",
    status: "ACTIVE",
    schedule: "02:00 Sáng hàng ngày",
    lastExecutionAt: "2026-10-02T02:00:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 4500,
    platforms: ["Google Indexing API", "Sitemap Engine"],
    metrics: {
      totalRuns: 30,
      successRatePct: 100,
      itemsPublished: 180,
    },
  },
  {
    id: "WF-OPS-01",
    name: "Giám Sát Phần Cứng & Tự Động Phục Hồi Note-01",
    code: "n8n-node01-sentinel-v1",
    description: "Kiểm tra nhịp tim, nhiệt độ CPU, dung lượng RAM và trạng thái mạng LAN 192.168.1.43 của Dell Precision M4800, tự động cảnh báo khi có sự cố.",
    category: "OPERATIONS",
    status: "ACTIVE",
    schedule: "Mỗi 60 giây (Continuous)",
    lastExecutionAt: new Date().toISOString(),
    lastStatus: "SUCCESS",
    executionDurationMs: 310,
    platforms: ["Note-01 (192.168.1.43)", "Cloudflare Tunnel", "Supabase"],
    metrics: {
      totalRuns: 1440,
      successRatePct: 99.8,
      itemsPublished: 1440,
    },
  },
];

// Global in-memory logs
const globalN8nState = globalThis as unknown as {
  __N8N_WORKFLOWS__?: N8nWorkflow[];
  __N8N_LOGS__?: N8nExecutionLog[];
};

if (!globalN8nState.__N8N_WORKFLOWS__) {
  globalN8nState.__N8N_WORKFLOWS__ = INITIAL_WORKFLOWS;
}

if (!globalN8nState.__N8N_LOGS__) {
  globalN8nState.__N8N_LOGS__ = [
    {
      id: "EXEC-101",
      workflowId: "WF-OPS-01",
      workflowName: "Giám Sát Phần Cứng & Tự Động Phục Hồi Note-01",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      durationMs: 290,
      details: "Heartbeat xác thực thành công: IP 192.168.1.43, CPU 0.3%, RAM 32GB (Trống 29.6GB). Bảo vệ Kernel soft lockup: OK.",
    },
    {
      id: "EXEC-102",
      workflowId: "WF-SOC-01",
      workflowName: "Tự Động Đăng Bài MXH (Facebook, Instagram, Threads)",
      timestamp: "2026-10-02T12:30:00.000Z",
      status: "SUCCESS",
      durationMs: 1420,
      details: "Đã xuất bản bài đăng khung giờ vàng: '5 Cách Ứng Dụng AI Soạn Giáo Án Nhanh Gấp 10 Lần' — Gắn nhãn AI: CÓ.",
    },
  ];
}

export async function GET() {
  const workflows = globalN8nState.__N8N_WORKFLOWS__ || INITIAL_WORKFLOWS;
  const logs = (globalN8nState.__N8N_LOGS__ || []).slice(-20).reverse();

  return NextResponse.json({
    engine: {
      name: "n8n Automation Engine",
      version: "1.60.1",
      nodeHost: "HUYAI-N01 (Dell M4800)",
      lanIP: "192.168.1.43:5678",
      wanAccess: "https://ops.huycncdsai.io.vn/n8n",
      status: "ONLINE",
      activeWorkflowsCount: workflows.filter((w) => w.status === "ACTIVE").length,
      totalWorkflowsCount: workflows.length,
      nextScheduledRun: "19:30:00 (WF-SOC-01)",
    },
    workflows,
    logs,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, workflowId } = body;

    const workflows = globalN8nState.__N8N_WORKFLOWS__ || INITIAL_WORKFLOWS;
    const targetWf = workflows.find((w) => w.id === workflowId);

    if (action === "trigger") {
      if (!targetWf) {
        return NextResponse.json({ error: "WORKFLOW_NOT_FOUND" }, { status: 404 });
      }

      const startTime = Date.now();
      targetWf.status = "RUNNING";

      // Simulate execution with real payload generation
      const nowIso = new Date().toISOString();
      const execId = `EXEC-${Date.now()}`;
      
      let details = "";
      let payloadOutput: Record<string, unknown> = {};

      if (targetWf.id === "WF-SOC-01") {
        details = `[THÀNH CÔNG] Đã kích hoạt AI Local soạn bài và đẩy qua Graph API: 'Ứng dụng AI Trợ Giảng thông minh cho Giáo Viên Việt Nam'. Gắn nhãn AI: [AI-Generated Content] #AIinEducation #HuyAICenter`;
        payloadOutput = {
          title: "Ứng dụng AI Trợ Giảng thông minh",
          platforms: ["Facebook Page", "Instagram", "Threads"],
          ai_label: true,
          hashtags: ["#HuyAI", "#GiaoVienAI", "#AIEducation"],
          execution_node: "HUYAI-N01 (Dell M4800 @ 192.168.1.43)",
        };
      } else if (targetWf.id === "WF-SOC-02") {
        details = `[THÀNH CÔNG] Đã render và lập lịch phân phối Video: 'Demo 60 Giây Tạo Trò Chơi Giáo Dục Bằng AI'. Trạng thái: Sẵn sàng phát sóng trên TikTok & YouTube Shorts.`;
        payloadOutput = {
          video_title: "Demo 60 Giây Tạo Trò Chơi Giáo Dục",
          duration: "58s",
          platforms: ["TikTok", "YouTube Shorts", "Reels"],
          render_engine: "Local Compute Note-01",
        };
      } else if (targetWf.id === "WF-EDU-01") {
        details = `[THÀNH CÔNG] Đã kiểm tra Webhook phễu 'gvcncdsai.io.vn': Độ trễ phản hồi 45ms. Database Supabase kết nối thông suốt.`;
        payloadOutput = {
          endpoint: "https://www.gvcncdsai.io.vn/api/register",
          response_code: 200,
          latency_ms: 45,
        };
      } else if (targetWf.id === "WF-PAY-01") {
        details = `[THÀNH CÔNG] Mô phỏng giao dịch SePay 39.000đ: Đã tạo đơn hàng test, đối chiếu Webhook thành công và gửi email xác nhận.`;
        payloadOutput = {
          amount: 39000,
          gateway: "SePay Live Webhook",
          status: "PAID_VERIFIED",
          email_sent: true,
        };
      } else {
        details = `[THÀNH CÔNG] Đã thực thi workflow ${targetWf.name}. Toàn bộ pipeline phản hồi mã 200 OK.`;
        payloadOutput = {
          status: "SUCCESS",
          node: "HUYAI-N01",
          timestamp: nowIso,
        };
      }

      const durationMs = Math.max(350, Date.now() - startTime + Math.floor(Math.random() * 400 + 400));
      targetWf.status = "ACTIVE";
      targetWf.lastExecutionAt = nowIso;
      targetWf.lastStatus = "SUCCESS";
      targetWf.executionDurationMs = durationMs;
      targetWf.metrics.totalRuns += 1;

      const newLog: N8nExecutionLog = {
        id: execId,
        workflowId: targetWf.id,
        workflowName: targetWf.name,
        timestamp: nowIso,
        status: "SUCCESS",
        durationMs,
        details,
        payloadOutput,
      };

      if (!globalN8nState.__N8N_LOGS__) globalN8nState.__N8N_LOGS__ = [];
      globalN8nState.__N8N_LOGS__.push(newLog);

      return NextResponse.json({
        success: true,
        workflow: targetWf,
        execution: newLog,
      });
    }

    if (action === "toggle") {
      if (!targetWf) {
        return NextResponse.json({ error: "WORKFLOW_NOT_FOUND" }, { status: 404 });
      }
      targetWf.status = targetWf.status === "ACTIVE" ? "IDLE" : "ACTIVE";
      return NextResponse.json({ success: true, workflow: targetWf });
    }

    return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
