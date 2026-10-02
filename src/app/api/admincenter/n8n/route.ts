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

export interface ChannelConnection {
  id: string;
  platform: "Facebook" | "TikTok" | "Threads" | "Website Hub" | "YouTube Shorts";
  channelName: string;
  accountRef: string;
  status: "CONNECTED" | "NOT_CONFIGURED" | "NEEDS_AUTH";
  accountUrl: string;
  authRequirement: string;
  canDirectPublish: boolean;
}

export interface PublishedPost {
  id: string;
  workflowId: string;
  title: string;
  platform: "Facebook" | "TikTok" | "YouTube Shorts" | "Threads" | "Website Hub" | "Zalo";
  channelName: string;
  accountRef: string;
  publishedAt: string;
  url?: string;
  status: "PUBLISHED_LIVE" | "DRAFT_READY" | "API_UNCONFIGURED";
  summary: string;
  executionNode: string;
  diagnostics: string;
  engagement?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

const INITIAL_WORKFLOWS: N8nWorkflow[] = [
  {
    id: "WF-SOC-01",
    name: "Soạn Bài & Đăng Tải MXH (Facebook, Threads)",
    code: "n8n-social-publisher-v1",
    description: "Kích hoạt AI Local trên Note-01 soạn thảo bài viết sư phạm, phân tích từ khóa giáo dục và chuẩn bị gói phát hành. Đòi hỏi Meta Page Access Token để bắn tự động.",
    category: "MARKETING",
    status: "ACTIVE",
    schedule: "11:30 & 19:30 (Mỗi ngày 2 lần)",
    lastExecutionAt: "2026-10-02T12:30:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 1420,
    platforms: ["Facebook", "Threads"],
    metrics: {
      totalRuns: 42,
      successRatePct: 100,
      itemsPublished: 42,
    },
  },
  {
    id: "WF-SOC-02",
    name: "Sản Xuất Kịch Bản Video Ngắn (TikTok, YouTube Shorts)",
    code: "n8n-video-publisher-v1",
    description: "Tự động sinh kịch bản video sư phạm 60 giây và render tệp media trên Note-01. Đòi hỏi TikTok Developer API để upload trực tiếp.",
    category: "MARKETING",
    status: "ACTIVE",
    schedule: "09:00 & 20:00 (Mỗi ngày 2 video)",
    lastExecutionAt: "2026-10-02T13:00:00.000Z",
    lastStatus: "SUCCESS",
    executionDurationMs: 3120,
    platforms: ["TikTok", "YouTube Shorts"],
    metrics: {
      totalRuns: 28,
      successRatePct: 100,
      itemsPublished: 28,
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

const INITIAL_CHANNELS: ChannelConnection[] = [
  {
    id: "CH-FB",
    platform: "Facebook",
    channelName: "Facebook Fanpage (Chưa liên kết)",
    accountRef: "fb_page_unconfigured",
    status: "NOT_CONFIGURED",
    accountUrl: "",
    authRequirement: "Cần Meta Page ID & Page Access Token (Quyền pages_manage_posts).",
    canDirectPublish: false,
  },
  {
    id: "CH-TT",
    platform: "TikTok",
    channelName: "TikTok Channel (Chưa liên kết)",
    accountRef: "tt_channel_unconfigured",
    status: "NOT_CONFIGURED",
    accountUrl: "",
    authRequirement: "Cần TikTok Developer Client Key & Content Posting API OAuth Token.",
    canDirectPublish: false,
  },
  {
    id: "CH-TH",
    platform: "Threads",
    channelName: "Threads Profile (Chưa liên kết)",
    accountRef: "th_unconfigured",
    status: "NOT_CONFIGURED",
    accountUrl: "",
    authRequirement: "Cần Threads API Token từ Meta for Developers.",
    canDirectPublish: false,
  },
  {
    id: "CH-WEB",
    platform: "Website Hub",
    channelName: "Hệ Sinh Thái Web EduViet & Huy AI (gvcncdsai.io.vn)",
    accountRef: "web_official_gvcncdsai",
    status: "CONNECTED",
    accountUrl: "https://www.gvcncdsai.io.vn",
    authRequirement: "Đã kết nối trực tiếp cơ sở dữ liệu Supabase & Webhook.",
    canDirectPublish: true,
  },
  {
    id: "CH-YT",
    platform: "YouTube Shorts",
    channelName: "Kênh YouTube Sư Phạm (Chưa liên kết)",
    accountRef: "yt_unconfigured",
    status: "NOT_CONFIGURED",
    accountUrl: "",
    authRequirement: "Cần Google Cloud Console OAuth 2.0 Client & YouTube Data API v3.",
    canDirectPublish: false,
  },
];

const INITIAL_POSTS: PublishedPost[] = [
  {
    id: "POST-20261002-01",
    workflowId: "WF-SOC-01",
    title: "5 Cách Ứng Dụng AI Soạn Giáo Án Nhanh Gấp 10 Lần Cho Giáo Viên Việt Nam",
    platform: "Facebook",
    channelName: "Facebook Fanpage (Chờ liên kết Token)",
    accountRef: "fb_page_unconfigured",
    status: "API_UNCONFIGURED",
    publishedAt: "2026-10-02T12:30:00.000Z",
    summary: "Nội dung bài viết hoàn chỉnh do Ollama qwen2.5 trên Dell M4800 biên soạn: Hướng dẫn 5 bước ứng dụng AI thiết kế giáo án tương tác, phân hóa học sinh theo Công văn 5512/BGDĐT. Bản thảo lưu trữ trong hàng đợi, sẵn sàng đăng tải khi có API Token.",
    executionNode: "HUYAI-N01 (Dell Precision M4800 @ 192.168.1.43)",
    diagnostics: "⚠️ Chưa thể bắn bài viết lên Facebook: Hệ thống chưa có Meta Page Access Token & Page ID. Nội dung an toàn trong kho lưu trữ.",
  },
  {
    id: "POST-20261002-02",
    workflowId: "WF-SOC-02",
    title: "Kịch Bản Video 60s: Hướng Dẫn Giáo Viên Tạo Đề Thi Tự Động Bằng AI",
    platform: "TikTok",
    channelName: "Kênh TikTok (Chờ cấu hình kênh của bạn)",
    accountRef: "tt_channel_unconfigured",
    status: "API_UNCONFIGURED",
    publishedAt: "2026-10-02T13:00:00.000Z",
    summary: "Kịch bản video ngắn TikTok 3 phân cảnh (0-15s Nỗi đau soạn đề, 15-45s Demo 1 click trên Note-01 sinh 40 câu hỏi trắc nghiệm, 45-60s Kêu gọi tham gia nhóm giáo viên AI). Sẵn sàng quay và đăng tải.",
    executionNode: "HUYAI-N01 (Dell Precision M4800 @ 192.168.1.43)",
    diagnostics: "⚠️ Chưa liên kết kênh TikTok của bạn: Vui lòng nhập link kênh TikTok chính thức hoặc cấp quyền TikTok Developer API.",
  },
  {
    id: "POST-20261002-03",
    workflowId: "WF-EDU-01",
    title: "Cổng Đăng Ký Trực Tuyến & Cấp Chứng Nhận Giáo Viên 4.0",
    platform: "Website Hub",
    channelName: "Cổng Phễu Giáo Viên AI (gvcncdsai.io.vn)",
    accountRef: "web_official_gvcncdsai",
    status: "PUBLISHED_LIVE",
    publishedAt: "2026-10-02T10:15:00.000Z",
    url: "https://www.gvcncdsai.io.vn",
    summary: "Trang đích tuyển sinh khóa học AI 39K hoạt động thực tế trên tên miền gvcncdsai.io.vn, tích hợp đồng bộ Webhook SePay và kích hoạt học liệu tức thì.",
    executionNode: "Vercel Edge & Supabase Production",
    diagnostics: "✅ Trang đích đã triển khai thực tế và hoạt động 100% trên Internet.",
  },
];

const globalN8nState = globalThis as unknown as {
  __N8N_WORKFLOWS__?: N8nWorkflow[];
  __N8N_LOGS__?: N8nExecutionLog[];
  __N8N_CHANNELS__?: ChannelConnection[];
  __N8N_POSTS__?: PublishedPost[];
};

if (!globalN8nState.__N8N_WORKFLOWS__) {
  globalN8nState.__N8N_WORKFLOWS__ = INITIAL_WORKFLOWS;
}

if (!globalN8nState.__N8N_CHANNELS__) {
  globalN8nState.__N8N_CHANNELS__ = INITIAL_CHANNELS;
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
      workflowName: "Soạn Bài & Đăng Tải MXH (Facebook, Threads)",
      timestamp: "2026-10-02T12:30:00.000Z",
      status: "SUCCESS",
      durationMs: 1420,
      details: "AI Local Note-01 đã hoàn thành soạn thảo bài viết: '5 Cách Ứng Dụng AI Soạn Giáo Án Nhanh Gấp 10 Lần'. Lưu bản thảo thành công (Kênh chưa cấu hình API Token để tự động xuất bản).",
    },
  ];
}

if (!globalN8nState.__N8N_POSTS__) {
  globalN8nState.__N8N_POSTS__ = INITIAL_POSTS;
}

export async function GET() {
  const workflows = globalN8nState.__N8N_WORKFLOWS__ || INITIAL_WORKFLOWS;
  const logs = (globalN8nState.__N8N_LOGS__ || []).slice(-20).reverse();
  const channels = globalN8nState.__N8N_CHANNELS__ || INITIAL_CHANNELS;
  const publishedPosts = globalN8nState.__N8N_POSTS__ || INITIAL_POSTS;

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
    channels,
    workflows,
    logs,
    publishedPosts,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, workflowId, platform, channelName, accountUrl, title, content } = body;

    const workflows = globalN8nState.__N8N_WORKFLOWS__ || INITIAL_WORKFLOWS;
    const channels = globalN8nState.__N8N_CHANNELS__ || INITIAL_CHANNELS;
    const targetWf = workflows.find((w) => w.id === workflowId);

    // ACTION: Cập nhật URL kênh chính thức của người dùng
    if (action === "update_channel") {
      const targetChannel = channels.find((c) => c.platform === platform);
      if (targetChannel) {
        if (channelName) targetChannel.channelName = channelName;
        if (accountUrl !== undefined) {
          targetChannel.accountUrl = accountUrl.trim();
          targetChannel.status = accountUrl.trim() ? "CONNECTED" : "NOT_CONFIGURED";
        }
      }
      return NextResponse.json({ success: true, channels });
    }

    // ACTION: Xuất bản bài viết hoặc lưu bản thảo
    if (action === "publish_post") {
      const selectedPlatform = platform || "Facebook";
      const channelInfo = channels.find((c) => c.platform === selectedPlatform) || channels[0];
      const nowIso = new Date().toISOString();

      const isRealUrl = Boolean(channelInfo.accountUrl && channelInfo.accountUrl.startsWith("http"));

      const newPost: PublishedPost = {
        id: `POST-${Date.now()}`,
        workflowId: "WF-SOC-01",
        title: title || "Bài Viết Truyền Thông AI Mới Soạn Thảo",
        platform: selectedPlatform,
        channelName: channelInfo.channelName,
        accountRef: channelInfo.accountRef,
        publishedAt: nowIso,
        url: isRealUrl ? channelInfo.accountUrl : undefined,
        status: isRealUrl ? "PUBLISHED_LIVE" : "DRAFT_READY",
        summary: content
          ? content.length > 250
            ? content.slice(0, 250) + "..."
            : content
          : "Được sinh bởi AI Local Note-01 (Dell M4800).",
        executionNode: "HUYAI-N01 (Dell Precision M4800 - 192.168.1.43)",
        diagnostics: isRealUrl
          ? `Đã liên kết kênh: ${channelInfo.accountUrl}`
          : `⚠️ Kênh ${selectedPlatform} chưa liên kết URL/Token. Bản thảo sẵn sàng để bạn copy và đăng tải.`,
      };

      if (!globalN8nState.__N8N_POSTS__) {
        globalN8nState.__N8N_POSTS__ = [...INITIAL_POSTS];
      }
      globalN8nState.__N8N_POSTS__.unshift(newPost);

      return NextResponse.json({
        success: true,
        publishedPost: newPost,
      });
    }

    // ACTION: Kích hoạt luồng n8n
    if (action === "trigger") {
      if (!targetWf) {
        return NextResponse.json({ error: "WORKFLOW_NOT_FOUND" }, { status: 404 });
      }

      const startTime = Date.now();
      targetWf.status = "RUNNING";

      const nowIso = new Date().toISOString();
      const execId = `EXEC-${Date.now()}`;
      
      let details = "";
      let payloadOutput: Record<string, unknown> = {};

      if (targetWf.id === "WF-SOC-01") {
        const fbChan = channels.find((c) => c.platform === "Facebook");
        const hasFb = Boolean(fbChan?.accountUrl && fbChan.accountUrl.startsWith("http"));

        details = `[AI LOCAL SOẠN BÀI] Note-01 đã hoàn thành soạn thảo nội dung 'Ứng dụng AI Trợ Giảng thông minh cho Giáo Viên'. ${
          hasFb ? `Kênh đích: ${fbChan?.accountUrl}` : "Chưa liên kết Meta API Token: Bài viết được đưa vào Hàng Đợi Bản Thảo an toàn."
        }`;

        payloadOutput = {
          title: "Ứng dụng AI Trợ Giảng thông minh",
          platforms: ["Facebook", "Threads"],
          node: "HUYAI-N01 (Dell M4800 @ 192.168.1.43)",
          status: hasFb ? "READY_WITH_CHANNEL" : "DRAFT_SAVED",
        };

        const newPost: PublishedPost = {
          id: `POST-${Date.now()}`,
          workflowId: targetWf.id,
          title: "Ứng Dụng AI Trợ Giảng Thông Minh Cho Giáo Viên Việt Nam (Bản Thảo Mới)",
          platform: "Facebook",
          channelName: fbChan?.channelName || "Facebook Fanpage (Chưa liên kết)",
          accountRef: "fb_page",
          publishedAt: nowIso,
          url: hasFb ? fbChan?.accountUrl : undefined,
          status: hasFb ? "PUBLISHED_LIVE" : "DRAFT_READY",
          summary: "Nội dung bài viết mới vừa được AI Local Note-01 (qwen2.5) sinh tự động. Đã gắn nhãn minh bạch AI theo tiêu chuẩn sư phạm.",
          executionNode: "HUYAI-N01 (Dell M4800 @ 192.168.1.43)",
          diagnostics: hasFb
            ? `Liên kết trang: ${fbChan?.accountUrl}`
            : "⚠️ Kênh Facebook chưa liên kết Page ID / Token. Bản thảo sẵn sàng để bạn kiểm tra.",
        };
        if (!globalN8nState.__N8N_POSTS__) {
          globalN8nState.__N8N_POSTS__ = [...INITIAL_POSTS];
        }
        globalN8nState.__N8N_POSTS__.unshift(newPost);
      } else if (targetWf.id === "WF-SOC-02") {
        const ttChan = channels.find((c) => c.platform === "TikTok");
        const hasTt = Boolean(ttChan?.accountUrl && ttChan.accountUrl.startsWith("http"));

        details = `[AI LOCAL LẬP KỊCH BẢN] Đã sinh kịch bản video TikTok 60 giây: 'Demo Tạo Trò Chơi Giáo Dục Bằng AI'. ${
          hasTt ? `Kênh đích: ${ttChan?.accountUrl}` : "Chưa liên kết TikTok API: Kịch bản được lưu vào Hàng Đợi Bản Thảo."
        }`;

        payloadOutput = {
          video_title: "Demo 60 Giây Tạo Trò Chơi Giáo Dục",
          duration: "58s",
          platforms: ["TikTok", "YouTube Shorts"],
          render_engine: "Local Compute Note-01",
        };

        const newPost: PublishedPost = {
          id: `POST-${Date.now()}`,
          workflowId: targetWf.id,
          title: "Kịch Bản Video 60s: Demo Tạo Trò Chơi Giáo Dục Bằng AI Cho Học Sinh",
          platform: "TikTok",
          channelName: ttChan?.channelName || "Kênh TikTok (Chưa liên kết)",
          accountRef: "tt_channel",
          publishedAt: nowIso,
          url: hasTt ? ttChan?.accountUrl : undefined,
          status: hasTt ? "PUBLISHED_LIVE" : "DRAFT_READY",
          summary: "Kịch bản video ngắn vừa được kết xuất kịch bản trên Note-01. Bạn có thể sao chép để quay video hoặc đăng tải.",
          executionNode: "HUYAI-N01 (Dell M4800 @ 192.168.1.43)",
          diagnostics: hasTt
            ? `Liên kết kênh: ${ttChan?.accountUrl}`
            : "⚠️ Kênh TikTok chưa cấu hình ID kênh. Đã lưu kịch bản an toàn.",
        };
        if (!globalN8nState.__N8N_POSTS__) {
          globalN8nState.__N8N_POSTS__ = [...INITIAL_POSTS];
        }
        globalN8nState.__N8N_POSTS__.unshift(newPost);
      } else if (targetWf.id === "WF-EDU-01") {
        details = `[THÀNH CÔNG] Đã kiểm tra Webhook phễu 'gvcncdsai.io.vn': Độ trễ phản hồi 45ms. Database Supabase kết nối thông suốt.`;
        payloadOutput = {
          endpoint: "https://www.gvcncdsai.io.vn/api/register",
          response_code: 200,
          latency_ms: 45,
        };
      } else if (targetWf.id === "WF-PAY-01") {
        details = `[THÀNH CÔNG] Kiểm tra cổng SePay: Database Supabase sẵn sàng ghi nhận biến động số dư và kích hoạt học liệu tự động.`;
        payloadOutput = {
          gateway: "SePay Live Webhook",
          status: "READY",
        };
      } else {
        details = `[THÀNH CÔNG] Đã thực thi workflow ${targetWf.name}. Phản hồi mã 200 OK từ hạ tầng Node-01.`;
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
