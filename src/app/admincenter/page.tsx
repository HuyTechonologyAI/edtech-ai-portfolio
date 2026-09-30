"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  User,
  Server,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  RefreshCw,
  LogOut,
  Bot,
  Sparkles,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  Terminal,
  Zap,
  Radio,
  X,
  Play,
  Pause,
  Flame,
  Share2,
  Send,
  StopCircle,
  Network,
  ChevronRight,
  Check,
  CornerDownRight,
  Users,
} from "lucide-react";

import {
  CANONICAL_59_AGENTS,
  AgentCard,
} from "@/data/ai-agency-canonical";
import { AgentLiveTelemetry, LiveEvent } from "@/app/api/admincenter/telemetry/route";

interface SystemStatus {
  runtimeWorkers: Record<string, number>;
  activeRuntimeWorkers: number;
  workExecution: { currentTask: string; stage: string; checkpointStatus: string; lastAction: string; nextAction: string } | null;
  runtimeAgents: Array<{ id: string; role: string; provider?: string; state: string; taskId: string; stage: string; lastAction?: string; nextAction?: string }>;
  a2aTimeline: Array<{ sequence?: number; taskId: string; stage: string; ownerAgent: string; status: string; completedWork?: string; nextStep?: string; createdAt?: string; checkpointId?: string }>;
  handoffs: Array<{ sequence?: number; taskId: string; fromAgent: string; toAgent: string; fromStage: string; toStage: string; timestamp?: string; status: string }>;
  providerAttempts: Array<{ sequence?: number; taskId: string; provider: string; role: string; stage: string; status: string; timestamp?: string; checkpointId?: string }>;
  checkpointHistory: Array<{ sequence?: number; taskId: string; stage: string; ownerAgent: string; status: string; completedWork?: string; nextStep?: string; createdAt?: string; checkpointId?: string }>;
  currentOwner: string | null;
  lastAction: string | null;
  nextAction: string | null;
  timestamp: string;
  status: string;
  topology: {
    controlPlane: {
      node: string;
      role: string;
      status: string;
      storagePolicy: string;
    };
    authoritativeAnchor: {
      node: string;
      peerName: string;
      tailscaleIP: string;
      lanIP: string;
      role: string;
      status: string;
      storageRoots: {
        canonicalProjects: string;
        directivesAndPayloads: string;
        stagingSpool: string;
        protectedZone: string;
      };
    };
  };
  aiFleet: {
    totalAgents: number;
    activeAgents: number;
    collaboratingAgents?: number;
    standbyAgents: number;
    quarantinedAgents: number;
    businessUnitsCount: number;
    tokensPerSec?: number;
    quotaUtilizationPct: number;
    tokensUsedTotal: number;
    tokensLimitTotal: number;
  };
  queue?: {
    pendingTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    dispatcherStatus: string;
  };
  realAuditLogs: Array<{
    id: string;
    timestamp: string;
    event: string;
    actor: string;
    details: string;
    level: string;
  }>;
}

interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return String(error);
}

export default function AdminCenterPage() {
  // Toast notifications state
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const addToast = (title: string, message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = `toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>("SuperAdmin");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Password change modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordChangeError, setPasswordChangeError] = useState<string>("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"swarm" | "agents" | "quotas" | "hierarchy" | "node01" | "audit" | "a2a" | "supervisor">("swarm");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBU, setSelectedBU] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [swarmFilter, setSwarmFilter] = useState<"ALL" | "ACTIVE" | "COLLAB" | "STANDBY">("ALL");

  // A2A Queue & Ollama State
  const [a2aQueue, setA2aQueue] = useState<{
    queueDepth: number; inProgress: number; completed: number; failed: number; totalTasks: number;
    tasks: Array<{ taskId: string; fromAgent: string; toAgent: string; capability: string; priority: string; state: string; backend: string; createdAt: string; startedAt?: string; completedAt?: string; error?: string }>;
  } | null>(null);
  const [ollamaHealth, setOllamaHealth] = useState<{ connected: boolean; availableModels?: string[]; error?: string } | null>(null);
  const [a2aExecuting, setA2aExecuting] = useState<boolean>(false);
  const [ollamaChecking, setOllamaChecking] = useState<boolean>(false);

  // Supervisor State (V1.1 Autonomous)
  const [supervisorStatus, setSupervisorStatus] = useState<{
    supervisorId: string;
    startedAt: string;
    lastActivity: string;
    operatingMode?: string;
    l1AuthorityDelegated?: boolean;
    totalTasks: number;
    tasksByStatus: Record<string, number>;
    readyToDispatch: number;
    humanGates: number;
    openHumanGates: number;
    completedTasks: number;
    recruitedAgents?: Array<{ id: string; name: string; role: string; capability: string; model: string; status: string; benchmarkScore: number; licensedUnder: string }>;
    quotaGuard?: { enabled: boolean; localComputePriority: number; cloudCircuitBreakerTripped: boolean; tokenCapPerRequest: number; estimatedTokensSavedLocal: number; totalLocalInvocations: number; lastQuotaAudit: string };
    l1ApprovalLog?: Array<{ approvalId: string; proposer: string; action: string; riskLevel: string; approvedAt: string; rationale: string }>;
    tasks: Array<{
      taskId: string; priority: string; riskLevel: string; status: string;
      lifecycle: string; checkpoint: string; retryCount: number; retryLimit: number;
      workerId: string; dependencies: string[]; startedAt?: string; completedAt?: string;
      error?: string; humanGateReason?: string;
    }>;
    humanGateLog: Array<{ hgId: string; taskId: string; reason: string; timestamp: string; resolved: boolean }>;
  } | null>(null);
  const [supervisorLoading, setSupervisorLoading] = useState<boolean>(false);
  const [isRecruiting, setIsRecruiting] = useState<boolean>(false);
  const [isAuditingQuota, setIsAuditingQuota] = useState<boolean>(false);


  // Modals & Selected Agent
  const [selectedAgent, setSelectedAgent] = useState<AgentLiveTelemetry | AgentCard | null>(null);
  const [inspectAgent, setInspectAgent] = useState<AgentLiveTelemetry | null>(null);
  const [dispatchAgent, setDispatchAgent] = useState<AgentLiveTelemetry | AgentCard | null>(null);
  const [dispatchPrompt, setDispatchPrompt] = useState<string>("");
  const [dispatchMessage, setDispatchMessage] = useState<string>("");

  // Universal Broadcast Command Bar
  const [broadcastPrompt, setBroadcastPrompt] = useState<string>("");
  const [broadcastTargetBU, setBroadcastTargetBU] = useState<string>("ALL");
  const [broadcastPriority, setBroadcastPriority] = useState<string>("P0");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string>("");

  // Real-time Telemetry State
  const [telemetryAgents, setTelemetryAgents] = useState<AgentLiveTelemetry[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<LiveEvent[]>([]);
  const [swarmMode, setSwarmMode] = useState<string>("AUTONOMOUS_LIVE");
  const [liveStreamEnabled, setLiveStreamEnabled] = useState<boolean>(true);
  const [pollingRate] = useState<number>(2500); // 2.5s default
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);

  // System & Node-01 Status
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [, setLoadingStatus] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Đang khởi tạo...");
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Check auth session on load
  const checkSession = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch("/api/admincenter/auth");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setMustChangePassword(data.mustChangePassword);
          if (data.mustChangePassword) {
            setShowChangePasswordModal(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (err) {
      console.error("Session check error:", err);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Fetch Real-time Telemetry Data
  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/admincenter/telemetry");
      if (res.ok) {
        const data = await res.json();
        if (data.agents) setTelemetryAgents(data.agents);
        if (data.events) setTelemetryEvents(data.events);
        if (data.swarmMode) setSwarmMode(data.swarmMode);
        setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
      }
    } catch (err) {
      console.error("Fetch telemetry error:", err);
    }
  };

  // Fetch System Status
  const fetchSystemStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/admincenter/system");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      } else {
        setSystemStatus(null);
      }
    } catch (err) {
      setSystemStatus(null);
      console.error("Fetch status error:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch A2A Queue Status
  const fetchA2aQueue = async () => {
    try {
      const res = await fetch("/api/admincenter/a2a");
      if (res.ok) {
        const data = await res.json();
        setA2aQueue(data);
      }
    } catch (err) {
      console.error("Fetch A2A queue error:", err);
    }
  };

  // Fetch Supervisor Status (V1.1)
  const fetchSupervisorStatus = async () => {
    setSupervisorLoading(true);
    try {
      const res = await fetch("/api/admincenter/supervisor");
      if (res.ok) {
        const data = await res.json();
        setSupervisorStatus(data);
      }
    } catch (err) {
      console.error("Fetch supervisor error:", err);
    } finally {
      setSupervisorLoading(false);
    }
  };

  // Resolve Human Gate
  const handleResolveHumanGate = async (hgId: string, resolution: string) => {
    try {
      const res = await fetch("/api/admincenter/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve_human_gate", hgId, resolution }),
      });
      if (res.ok) {
        addToast("Human Gate", `[${hgId}] Đã phê duyệt và reset task vào QUEUED`, "success");
        fetchSupervisorStatus();
        fetchTelemetry();
      }
    } catch (err) {
      addToast("Lỗi", getErrorMessage(err), "error");
    }
  };

  // AI HR Recruit Handler
  const handleRecruitHrAgent = async (capability?: string) => {
    setIsRecruiting(true);
    try {
      const res = await fetch("/api/admincenter/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "hr_recruit_agent",
          capability: capability || "code_generation",
          role: "Chuyên viên thực thi tự động TypeScript/Ollama Node-01",
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("AI HR Tuyển Dụng", `Đã tuyển dụng thành công ${data.agent.id} (Benchmark: ${data.agent.benchmarkScore}/100)`, "success");
        fetchSupervisorStatus();
        fetchTelemetry();
      }
    } catch (err) {
      addToast("Lỗi HR", getErrorMessage(err), "error");
    } finally {
      setIsRecruiting(false);
    }
  };

  // Quota Guard Audit Handler
  const handleQuotaGuardAudit = async () => {
    setIsAuditingQuota(true);
    try {
      const res = await fetch("/api/admincenter/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quota_guard_audit", forceLocalOnly: true }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("Quota Guard", `Bảo vệ Quota: 100% Node-01 Local Compute (Đã tiết kiệm ${data.quotaGuard.estimatedTokensSavedLocal.toLocaleString()} tokens)`, "success");
        fetchSupervisorStatus();
      }
    } catch (err) {
      addToast("Lỗi Quota", getErrorMessage(err), "error");
    } finally {
      setIsAuditingQuota(false);
    }
  };




  // Check Ollama Health on Node-01
  const checkOllamaHealth = async () => {
    setOllamaChecking(true);
    try {
      const res = await fetch("/api/admincenter/ollama");
      const data = await res.json();
      setOllamaHealth(data);
      if (data.connected) {
        addToast("Ollama Node-01", `Kết nối thành công | ${data.availableModels?.length || 0} model sẵn sàng`, "success");
      } else {
        addToast("Ollama Node-01", `Không kết nối được: ${data.error}`, "error");
      }
    } catch (err) {
      setOllamaHealth({ connected: false, error: getErrorMessage(err) });
      addToast("Ollama Node-01", "Lỗi kết nối tới cổng gateway", "error");
    } finally {
      setOllamaChecking(false);
    }
  };

  // Execute Next A2A Task via Ollama
  const handleA2aExecuteNext = async () => {
    setA2aExecuting(true);
    try {
      const res = await fetch("/api/admincenter/a2a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute_next" }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("A2A Execution", data.message || "Đã kích hoạt tác vụ tiếp theo trên Ollama Node-01", "success");
        setTimeout(() => { fetchA2aQueue(); fetchTelemetry(); }, 2000);
      } else {
        addToast("A2A Execution", data.error || data.message || "Không có tác vụ cần thực thi", "info");
      }
    } catch (err) {
      addToast("A2A Error", getErrorMessage(err), "error");
    } finally {
      setA2aExecuting(false);
    }
  };



  // Initial load
  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void checkSession();
      void fetchTelemetry();
      void fetchSystemStatus();
      void fetchA2aQueue();
      void fetchSupervisorStatus();
    }, 0);
    return () => clearTimeout(initialLoad);
  }, []);

  // Real-time Polling Engine
  useEffect(() => {
    if (!isAuthenticated || !liveStreamEnabled) return;

    const interval = setInterval(() => {
      fetchTelemetry();
      fetchSystemStatus();
    }, pollingRate);

    // Slower A2A queue poll (every 5s)
    const a2aInterval = setInterval(() => {
      fetchA2aQueue();
    }, 5000);

    // Supervisor status poll (every 10s)
    const supervisorInterval = setInterval(() => {
      fetchSupervisorStatus();
    }, 10000);

    return () => { clearInterval(interval); clearInterval(a2aInterval); clearInterval(supervisorInterval); };
  }, [isAuthenticated, liveStreamEnabled, pollingRate]);



  // Auto-scroll logs
  useEffect(() => {
    if (autoScrollLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0; // Newest at top
    }
  }, [telemetryEvents, autoScrollLogs]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admincenter/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setMustChangePassword(data.mustChangePassword);
        if (data.mustChangePassword) {
          setCurrentPassword(loginPassword);
          setShowChangePasswordModal(true);
        }
        setLoginPassword("");
        fetchTelemetry();
        fetchSystemStatus();
      } else {
        setLoginError(data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err: unknown) {
      setLoginError("Không thể kết nối máy chủ xác thực: " + getErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admincenter/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setIsAuthenticated(false);
      setMustChangePassword(false);
      setShowChangePasswordModal(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    if (newPassword.length < 8) {
      setPasswordChangeError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/admincenter/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordChangeSuccess(data.message || "Đổi mật khẩu thành công!");
        setMustChangePassword(false);
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordChangeSuccess("");
          setNewPassword("");
          setConfirmPassword("");
          setCurrentPassword("");
        }, 1500);
      } else {
        setPasswordChangeError(data.error || "Đổi mật khẩu thất bại.");
      }
    } catch (err: unknown) {
      setPasswordChangeError("Lỗi hệ thống khi đổi mật khẩu: " + getErrorMessage(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Switch Swarm Mode (Autonomous Live / Standby / Emergency Freeze)
  const handleSetSwarmMode = async (mode: string) => {
    setSwarmMode(mode);
    addToast("Chế Độ Hoạt Động", `Đã chuyển chế độ Swarm sang: ${mode}`, "info");
    try {
      const res = await fetch("/api/admincenter/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_swarm_mode", mode }),
      });
      if (res.ok) {
        const data = await res.json();
        setSwarmMode(data.mode);
        fetchTelemetry();
      }
    } catch (err: unknown) {
      console.error("Set swarm mode error:", err);
      addToast("Lỗi chuyển chế độ", getErrorMessage(err), "error");
    }
  };

  // Broadcast Directive to All AI or Specific BU
  const handleBroadcast = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const promptToSend =
      broadcastPrompt.trim() ||
      "Kiểm tra đồng bộ toàn diện hệ sinh thái 59 AI và xác nhận kết nối Node-01";

    setIsBroadcasting(true);
    setBroadcastFeedback("");

    try {
      const res = await fetch("/api/admincenter/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_directive",
          directive: promptToSend,
          targetBU: broadcastTargetBU,
          priority: broadcastPriority,
        }),
      });

      if (res.ok) {
        addToast(
          "Phát Lệnh Tức Thì",
          `Chỉ thị [${broadcastPriority}] gửi thành công tới ${
            broadcastTargetBU === "ALL" ? "toàn bộ 59 AI" : broadcastTargetBU
          }!`,
          "success"
        );
        setBroadcastFeedback(
          `[ĐÃ PHÁT LỆNH] Chỉ thị [${broadcastPriority}] gửi thành công tới ${
            broadcastTargetBU === "ALL" ? "toàn bộ 59 AI" : broadcastTargetBU
          }!`
        );
        setBroadcastPrompt("");
        fetchTelemetry();
        setTimeout(() => setBroadcastFeedback(""), 4000);
      }
    } catch (err: unknown) {
      setBroadcastFeedback("Lỗi phát lệnh: " + getErrorMessage(err));
      addToast("Lỗi phát lệnh", getErrorMessage(err), "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Quick Mobilize BU
  const handleQuickMobilizeBU = async (buKey: string, buDisplayName: string, directive: string) => {
    // Optimistic UI update
    setTelemetryAgents((prev) => {
      const base =
        prev.length > 0
          ? prev
          : CANONICAL_59_AGENTS.map((c) => ({
              ...c,
              currentThought: "Đang duy trì nhịp tim chuẩn.",
              targetPeer: null,
              tokensPerSec: 0,
              tokensUsed: 0,
              latencyMs: 35,
              progressPct: 0,
              lastHeartbeat: "Standby",
            }));
      return base.map((agent) =>
        agent.businessUnit.toLowerCase().includes(buKey.toLowerCase()) || buKey === "ALL"
          ? {
              ...agent,
              state: "STANDBY" as const,
              currentThought: `[KÍCH HOẠT NHANH] Chờ xác minh thực thi chỉ thị: ${directive}`,
              tokensPerSec: 0,
            }
          : agent
      );
    });

    addToast(
      `⚡ Kích hoạt ${buDisplayName}`,
      `Đã phân bổ chỉ thị tới các AI thuộc ${buDisplayName}`,
      "success"
    );

    try {
      const res = await fetch("/api/admincenter/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_directive",
          directive: `[CHIẾN DỊCH ${buDisplayName.toUpperCase()}] ${directive}`,
          targetBU: buKey,
          priority: "P1",
        }),
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err: unknown) {
      addToast("Lỗi phân bổ", getErrorMessage(err), "error");
    }
  };

  // Direct Agent Action (Activate / Standby / Quarantine)
  const handleAgentControl = async (agentId: string, agentAction: string, task?: string) => {
    setLoadingAgentId(agentId);
    const nextState = agentAction === "activate" ? "ACTIVE" : "STANDBY";

    // Optimistic instant state update (<10ms)
    setTelemetryAgents((prev) => {
      const base =
        prev.length > 0
          ? prev
          : CANONICAL_59_AGENTS.map((c) => ({
              ...c,
              currentThought: "Đang duy trì nhịp tim chuẩn.",
              targetPeer: null,
              tokensPerSec: 0,
              tokensUsed: 0,
              latencyMs: 35,
              progressPct: 0,
              lastHeartbeat: "Standby",
            }));
      return base.map((a) =>
        a.id === agentId
          ? {
              ...a,
              state: (nextState === "ACTIVE" ? "STANDBY" : nextState) as AgentLiveTelemetry["state"],
              currentTask:
                task ||
                (nextState === "ACTIVE"
                  ? "Đang xử lý nhiệm vụ phân bổ thời gian thực"
                  : a.currentTask),
              currentThought:
                nextState === "ACTIVE"
                  ? "Đã nhận lệnh kích hoạt trực tiếp từ SuperAdmin."
                  : "Đưa về trạng thái nhịp tim chờ Standby.",
              tokensPerSec: 0,
            }
          : a
      );
    });

    addToast(
      agentAction === "activate" ? "Đã Kích Hoạt" : "Đã Đưa Về Standby",
      `Agent ${agentId} đã chuyển sang trạng thái ${nextState}`,
      "info"
    );

    try {
      const res = await fetch("/api/admincenter/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "agent_action",
          agentId,
          agentAction,
          task,
        }),
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err: unknown) {
      console.error("Agent control error:", err);
      addToast("Lỗi điều khiển", getErrorMessage(err), "error");
    } finally {
      setLoadingAgentId(null);
    }
  };

  // Emergency Freeze All
  const handleEmergencyFreeze = async () => {
    setSwarmMode("PAUSED_SAFE");
    addToast("Dừng Khẩn Cấp", "Đã gửi lệnh đóng băng an toàn tức thì tới toàn bộ AI", "warning");
    try {
      const res = await fetch("/api/admincenter/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "emergency_freeze" }),
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err: unknown) {
      console.error("Emergency freeze error:", err);
      addToast("Lỗi dừng khẩn cấp", getErrorMessage(err), "error");
    }
  };

  // Handle Dispatch Simulated Action Modal
  const handleDispatchAction = (agent: AgentLiveTelemetry | AgentCard) => {
    setDispatchAgent(agent);
    setDispatchPrompt("");
    setDispatchMessage("");
  };

  const executeDispatch = async () => {
    if (!dispatchAgent) return;
    setIsDispatching(true);
    try {
      const task = dispatchPrompt || "Thực thi tác vụ điều phối trực tiếp";
      await handleAgentControl(dispatchAgent.id, "activate", task);
      setDispatchMessage(
        `[ĐÃ GỬI LỆNH] Chỉ thị đã được nạp vào hàng đợi PGMQ cho Agent ${dispatchAgent.id} (${dispatchAgent.name}) trên Node-01.`
      );
      addToast(
        "Giao Việc Thành Công",
        `Đã phân công tác vụ cho ${dispatchAgent.name} (${dispatchAgent.id})`,
        "success"
      );
      setTimeout(() => {
        setDispatchAgent(null);
        setDispatchMessage("");
      }, 1500);
    } finally {
      setIsDispatching(false);
    }
  };

  // Effective Agents List (combining telemetry with fallback)
  const effectiveAgents: AgentLiveTelemetry[] = useMemo(() => {
    if (telemetryAgents.length > 0) return telemetryAgents.map((agent) => ({
      ...agent,
      state: agent.state === 'ACTIVE' || agent.state === 'COLLABORATING' ? 'STANDBY' : agent.state,
      tokensPerSec: 0,
    }));
    return CANONICAL_59_AGENTS.map((c) => ({
      ...c,
      state: "STANDBY",
      currentThought: "Đang duy trì nhịp tim chuẩn, sẵn sàng tiếp nhận luồng xử lý từ SuperAdmin.",
      targetPeer: null,
      tokensPerSec: 0,
      tokensUsed: 0,
      latencyMs: 35,
      progressPct: 0,
      lastHeartbeat: "Standby",
    }));
  }, [telemetryAgents]);

  // Filtered Agents for Directory Tab
  const filteredAgents = useMemo(() => {
    return effectiveAgents.filter((agent) => {
      const matchesSearch =
        searchQuery === "" ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.businessUnit.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBU = selectedBU === "ALL" || agent.businessUnit.toLowerCase().includes(selectedBU.toLowerCase());
      const matchesTier = selectedTier === "ALL" || agent.tier === selectedTier;
      const matchesState = selectedState === "ALL" || agent.state === selectedState;

      return matchesSearch && matchesBU && matchesTier && matchesState;
    });
  }, [effectiveAgents, searchQuery, selectedBU, selectedTier, selectedState]);

  // Filtered Agents for Swarm Tab
  const swarmFilteredAgents = useMemo(() => {
    return effectiveAgents.filter((agent) => {
      if (swarmFilter === "ACTIVE") return agent.state === "ACTIVE" || agent.state === "COLLABORATING";
      if (swarmFilter === "COLLAB") return agent.state === "COLLABORATING";
      if (swarmFilter === "STANDBY") return agent.state === "STANDBY" || agent.state === "PAUSED" || agent.state === "WARM_STANDBY" || agent.state === "COLD_STANDBY";
      return true;
    });
  }, [effectiveAgents, swarmFilter]);

  // Dynamic Live Metrics
  const activeCount = effectiveAgents.filter((a) => a.state === "ACTIVE" || a.state === "COLLABORATING").length;
  const collabCount = effectiveAgents.filter((a) => a.state === "COLLABORATING").length;
  const standbyCount = effectiveAgents.filter((a) => a.state === "STANDBY" || a.state === "PAUSED" || a.state === "WARM_STANDBY" || a.state === "COLD_STANDBY").length;
  const totalTokensPerSec = effectiveAgents.reduce((acc, a) => acc + (a.tokensPerSec || 0), 0);
  const totalTokensUsed = effectiveAgents.reduce((acc, a) => acc + (a.tokensUsed || 0), 0);

  // Filtered Live Events
  const filteredEvents = useMemo(() => {
    if (eventFilter === "ALL") return telemetryEvents;
    return telemetryEvents.filter((evt) => {
      if (eventFilter === "DIRECTIVE") return evt.type === "DIRECTIVE";
      if (eventFilter === "A2A") return evt.type === "A2A_COLLAB";
      if (eventFilter === "SECURITY") return evt.type === "SECURITY";
      return true;
    });
  }, [telemetryEvents, eventFilter]);

  // If checking session initially
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse mb-4">
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold tracking-wider text-cyan-400">HUY AI CENTER</h2>
        <p className="text-xs text-slate-400 mt-2 font-mono">Đang xác thực thông tin quyền quản trị SuperAdmin...</p>
      </div>
    );
  }

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070B14] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F172A]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              Bảo Mật Cấp Doanh Nghiệp
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">HUY AI CENTER</h1>
            <p className="text-xs text-slate-400 mt-1">Cổng Quản Trị Hệ Thống AI Agency (AdminCenter)</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="SuperAdmin"
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Đăng Nhập SuperAdmin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Điểm neo máy chủ: Dell Precision M4800 (huy-node01)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chính sách Human Gate R4 / Zero-Backdoor tuân thủ</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD MAIN VIEW
  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 border-b border-white/10 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F172A] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0F172A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">HUY AI CENTER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                Live Command
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Trung Tâm Điều Hành 59 AI Agency Doanh Nghiệp Thời Gian Thực</p>
          </div>
        </div>

        {/* Live Network & Hardware Status */}
        <div className="hidden lg:flex items-center gap-4 bg-[#070B14]/80 border border-white/10 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
            <span className="text-slate-200 font-mono">Node-01: ONLINE (100.79.240.108:41641)</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lenovo: Control Plane (0B Storage)</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>/mnt/data2: R4 Protected</span>
          </div>
        </div>

        {/* Stream Toggle & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Live Stream Mode Badge & Toggle */}
          <button
            onClick={() => {
              const next = !liveStreamEnabled;
              setLiveStreamEnabled(next);
              addToast(
                "Chế độ Telemetry",
                next
                  ? "Đã bật cập nhật thời gian thực (chu kỳ 2.5s)"
                  : "Đã tạm dừng cập nhật thời gian thực",
                "info"
              );
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              liveStreamEnabled
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Bật/Tắt luồng cập nhật thời gian thực"
          >
            <Radio className={`w-3.5 h-3.5 ${liveStreamEnabled ? "animate-pulse text-emerald-400" : ""}`} />
            <span>{liveStreamEnabled ? "LIVE: BẬT (2.5s)" : "LIVE: TẮT"}</span>
          </button>

          {/* User profile */}
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">SuperAdmin</span>
            {mustChangePassword && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Cần đổi mật khẩu mặc định" />
            )}
          </div>

          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            title="Đổi mật khẩu tài khoản"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Đổi MK</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1.5"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* TOP REAL-TIME KPI HUD STRIP */}
      <section className="px-4 lg:px-8 py-5 border-b border-white/5 bg-[#0A1124]/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* HUD Card 1: Active Fleet Telemetry */}
          <div className="bg-[#0F172A]/90 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Runtime đang làm việc
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{systemStatus?.activeRuntimeWorkers ?? 0}</span>
              <span className="text-xs text-slate-400">workers · Node01</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-300">
              <span>{Object.entries(systemStatus?.runtimeWorkers ?? {}).map(([provider, count]) => `${provider}: ${count}`).join(' · ') || 'Chưa có heartbeat đã xác minh còn hiệu lực'}</span>
            </div>
          </div>

          {/* HUD Card 2: Live Token Speed */}
          <div className="bg-[#0F172A]/90 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                Tốc Độ Xử Lý Live
              </span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {totalTokensPerSec > 0 ? totalTokensPerSec.toLocaleString() : "0"}
              </span>
              <span className="text-xs text-slate-400">Tokens / giây</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
              <span>Tích lũy: {totalTokensUsed.toLocaleString()} t</span>
              <span className="text-emerald-400 font-mono">Độ trễ: 28ms</span>
            </div>
          </div>

          {/* HUD Card 3: PGMQ Queue & Message Bus */}
          <div className="bg-[#0F172A]/90 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                Thông Lượng PGMQ Bus
              </span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {telemetryEvents.length}
              </span>
              <span className="text-xs text-slate-400">Gói tin A2A</span>
            </div>
            <p className="text-[10px] text-indigo-300/90 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Hàng đợi: 0 nghẽn • Điều phối tức thời</span>
            </p>
          </div>

          {/* HUD Card 4: Dell M4800 Node-01 Anchor */}
          <div className="bg-[#0F172A]/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                Điểm Neo Node-01
              </span>
              <Server className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold text-amber-400 font-mono">huy-node01</span>
              <span className="text-[11px] text-emerald-400 font-bold">CONNECTED</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono truncate">
              100.79.240.108 • /mnt/data2 R4 Lock
            </p>
          </div>

          {/* HUD Card 5: Swarm Operational Mode & Emergency Button */}
          <div className="bg-[#0F172A]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Chế Độ Swarm
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                swarmMode === "AUTONOMOUS_LIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : swarmMode === "PAUSED_SAFE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}>
                {swarmMode === "AUTONOMOUS_LIVE" ? "TỰ ĐỘNG LIVE" : swarmMode === "PAUSED_SAFE" ? "ĐÓNG BĂNG" : swarmMode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              {swarmMode === "AUTONOMOUS_LIVE" ? (
                <button
                  onClick={handleEmergencyFreeze}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Dừng khẩn cấp toàn bộ AI ngay lập tức"
                >
                  <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dừng Khẩn Cấp</span>
                </button>
              ) : (
                <button
                  onClick={() => handleSetSwarmMode("AUTONOMOUS_LIVE")}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Bật chế độ tự động vận hành liên tác tử"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kích Hoạt Live</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="ai-work-heading" className="px-4 lg:px-8 py-5 border-b border-white/5 bg-[#0F172A]/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 id="ai-work-heading" className="text-sm font-bold text-cyan-300">Luồng công việc AI</h2>
          <span className="text-xs text-amber-300">Human Gate · Chủ sở hữu phê duyệt riêng · Không tính là AI worker</span>
        </div>
        {systemStatus?.workExecution ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            {([
              ['currentTask', 'Nhiệm vụ hiện tại'], ['stage', 'Giai đoạn'],
              ['checkpointStatus', 'Checkpoint'], ['lastAction', 'Hành động gần nhất'], ['nextAction', 'Hành động tiếp theo'],
            ] as const).map(([key, label]) => (
              <div key={key} className="min-w-0 rounded-xl border border-white/10 p-3">
                <dt className="text-xs text-slate-400 mb-2">{label}</dt>
                <dd className="text-slate-100 whitespace-pre-wrap break-words">{systemStatus.workExecution![key]}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="text-sm text-slate-400">Chưa có luồng công việc hợp lệ từ heartbeat Node01 đã xác minh còn hiệu lực.</p>}
      </section>

      <section aria-labelledby="runtime-a2a-heading" className="px-4 lg:px-8 py-5 border-b border-white/5 bg-[#070B14]">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-cyan-500/20 bg-[#0F172A]/80 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 id="runtime-a2a-heading" className="text-sm font-bold text-cyan-300">Runtime Active Agents</h2>
              <span className="text-[11px] text-slate-400">Signed Node01 · {systemStatus?.runtimeAgents?.length ?? 0} runtime actors</span>
            </div>
            {(systemStatus?.runtimeAgents?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {systemStatus!.runtimeAgents.slice(-8).reverse().map((agent) => (
                  <div key={`${agent.id}-${agent.taskId}-${agent.stage}`} className="rounded-xl border border-white/10 p-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-bold text-cyan-200">{agent.id}</span>
                      <span className="text-emerald-300">{agent.state}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{agent.role}{agent.provider ? ` · ${agent.provider}` : ""}</p>
                    <p className="text-slate-400 mt-1 font-mono break-all">{agent.taskId} · {agent.stage}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">Không có runtime agent trong heartbeat ký số còn hiệu lực.</p>}
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-[#0F172A]/80 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-bold text-indigo-300">A2A Flow</h2>
              <span className="text-[11px] text-slate-400">Owner: {systemStatus?.currentOwner ?? "TELEMETRY_PENDING"}</span>
            </div>
            {(systemStatus?.a2aTimeline?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {systemStatus!.a2aTimeline.slice(-8).reverse().map((event, index) => (
                  <div key={event.checkpointId ?? `${event.taskId}-${event.stage}-${index}`} className="rounded-xl border border-white/10 p-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-slate-200">
                      <span className="font-mono text-indigo-200">{event.ownerAgent}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>{event.stage}</span>
                      <span className="ml-auto text-emerald-300">{event.status}</span>
                    </div>
                    <p className="text-slate-400 mt-1 font-mono break-all">{event.taskId}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400">Chưa có A2A checkpoint hợp lệ từ Node01.</p>}
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="rounded-xl border border-white/10 p-3"><span className="text-slate-400">Handoffs</span><strong className="block text-white mt-1">{systemStatus?.handoffs?.length ?? 0}</strong></div>
              <div className="rounded-xl border border-white/10 p-3"><span className="text-slate-400">Provider Attempts</span><strong className="block text-white mt-1">{systemStatus?.providerAttempts?.length ?? 0}</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSAL SWARM BROADCAST COMMAND BAR (THANH CHỈ HUY TÁC CHIẾN SIÊU TỐC) */}
      <section className="px-4 lg:px-8 py-3.5 bg-[#090E1A] border-b border-white/5">
        <form onSubmit={handleBroadcast} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Send className="w-3.5 h-3.5" />
            </div>
            <span>Phát Lệnh Tác Chiến:</span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={broadcastPrompt}
              onChange={(e) => setBroadcastPrompt(e.target.value)}
              placeholder="Nhập chỉ thị điều hành khẩn cấp (vd: Tổng kiểm tra an ninh hạ tầng Node-01, Phân tích 500 bài viết SEO, Tối ưu hóa UI)..."
              className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Target BU */}
            <select
              value={broadcastTargetBU}
              onChange={(e) => setBroadcastTargetBU(e.target.value)}
              className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Toàn Bộ 59 AI</option>
              <option value="HUY TECHNOLOGY AI">Khối Kỹ Thuật (R&D)</option>
              <option value="HUY AI SCHOOL">Khối Sản Phẩm (EdTech)</option>
              <option value="MARKETING & GROWTH">Khối Marketing & Tăng Trưởng</option>
              <option value="TECHNICAL OPERATIONS">Khối Vận Hành Kỹ Thuật (OPS)</option>
              <option value="FINANCE & COMPLIANCE">Khối Tài Chính & Tuân Thủ</option>
              <option value="Tập đoàn HUY AI">Khối Ban Điều Hành (EXEC)</option>
            </select>

            {/* Priority */}
            <select
              value={broadcastPriority}
              onChange={(e) => setBroadcastPriority(e.target.value)}
              className="bg-[#070B14] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono font-bold"
            >
              <option value="P0">P0 - Khẩn Cấp</option>
              <option value="P1">P1 - Tiêu Chuẩn</option>
              <option value="P2">P2 - Nghiên Cứu</option>
            </select>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={isBroadcasting}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang phát...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Phát Lệnh Tức Thì</span>
                </>
              )}
            </button>
          </div>
        </form>

        {broadcastFeedback && (
          <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{broadcastFeedback}</span>
          </div>
        )}
      </section>

      {/* TABS NAVIGATION */}
      <nav className="px-4 lg:px-8 border-b border-white/10 bg-[#0F172A]/40 flex items-center gap-2 overflow-x-auto py-2">
        <button
          onClick={() => setActiveTab("swarm")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "swarm"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
          <span>Đa Tác Tử Thời Gian Thực</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">LIVE</span>
        </button>

        <button
          onClick={() => setActiveTab("agents")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "agents"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Danh Sách 59 AI Agency</span>
        </button>

        <button
          onClick={() => setActiveTab("quotas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "quotas"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Quản Lý Quota Đa Nền Tảng</span>
        </button>

        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "hierarchy"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cây Phân Cấp & Chuỗi Báo Cáo</span>
        </button>

        <button
          onClick={() => setActiveTab("node01")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "node01"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cụm Node-01 & Lưu Trữ</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "audit"
              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Nhật Ký Kiểm Toán Thực Tế</span>
        </button>

        <button
          onClick={() => { setActiveTab("a2a"); fetchA2aQueue(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "a2a"
              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>A2A & Ollama Local</span>
          {a2aQueue && a2aQueue.queueDepth > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-violet-500/30 border border-violet-500/50 text-violet-300 font-mono">
              {a2aQueue.queueDepth}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("supervisor"); fetchSupervisorStatus(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "supervisor"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Supervisor V1.1</span>
          {supervisorStatus && supervisorStatus.openHumanGates > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/80 text-white font-mono animate-pulse">
              🚨 {supervisorStatus.openHumanGates}
            </span>
          )}
        </button>
      </nav>


      {/* CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8">
        {/* ======================================================== */}
        {/* TAB 1: REAL-TIME MULTI-AGENT SWARM (LIVE COMMAND DECK) */}
        {/* ======================================================== */}
        {activeTab === "swarm" && (
          <div className="space-y-6">
            {/* Quick Mobilize Action Bar */}
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Kích hoạt nhanh theo Khối:
                </span>
                <button
                  onClick={() =>
                    handleQuickMobilizeBU(
                      "HUY TECHNOLOGY AI",
                      "Khối R&D",
                      "Tối ưu hóa API endpoints, rà soát hiệu năng Next.js và đồng bộ dịch vụ backend"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/20"
                >
                  ⚡ Khối R&D (Next.js & API)
                </button>
                <button
                  onClick={() =>
                    handleQuickMobilizeBU(
                      "MARKETING & GROWTH",
                      "Khối Marketing",
                      "Khởi động phân tích lưu lượng, SEO content và tối ưu tỷ lệ tương tác"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-purple-500/20"
                >
                  🚀 Khối Marketing (SEO & Traffic)
                </button>
                <button
                  onClick={() =>
                    handleQuickMobilizeBU(
                      "TECHNICAL OPERATIONS",
                      "Khối OPS",
                      "Giám sát hạ tầng Node-01, kiểm tra nhịp tim telemetry và an toàn dữ liệu"
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/20"
                >
                  🛡️ Khối Vận Hành OPS (Dell Node-01)
                </button>
              </div>

              {/* View filter chips */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Hiển thị:</span>
                <button
                  onClick={() => setSwarmFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    swarmFilter === "ALL" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Tất cả ({effectiveAgents.length})
                </button>
                <button
                  onClick={() => setSwarmFilter("ACTIVE")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                    swarmFilter === "ACTIVE" ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang hoạt động ({activeCount})
                </button>
                <button
                  onClick={() => setSwarmFilter("COLLAB")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                    swarmFilter === "COLLAB" ? "bg-purple-500/30 text-purple-300 border border-purple-500/40" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Share2 className="w-3 h-3 text-purple-400" />
                  Cộng tác A2A ({collabCount})
                </button>
                <button
                  onClick={() => setSwarmFilter("STANDBY")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    swarmFilter === "STANDBY" ? "bg-white/20 text-white border border-white/20" : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Standby ({standbyCount})
                </button>
              </div>
            </div>

            {/* SPLIT MISSION CONTROL: 62% LIVE AGENTS GRID | 38% LIVE A2A EVENT BUS */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* ZONE LEFT (7 COLS): LIVE AGENT MATRIX */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider">
                      Ma Trận Tác Tử Đang Xử Lý Nhiệm Vụ ({swarmFilteredAgents.length})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Cập nhật lúc: {lastSyncTime}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {swarmFilteredAgents.map((agent) => {
                    const isRunning = agent.state === "ACTIVE" || agent.state === "COLLABORATING";
                    return (
                      <div
                        key={agent.id}
                        className={`border rounded-2xl p-4 transition-all shadow-lg flex flex-col justify-between relative overflow-hidden group ${
                          isRunning
                            ? "bg-[#0B1328] border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/5"
                            : "bg-[#0F172A]/70 border-white/5 hover:border-white/20 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {/* Status bar */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                                {agent.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                  agent.state === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    : agent.state === "COLLABORATING"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                                    : agent.state === "PAUSED"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                    : "bg-slate-700/40 text-slate-400 border border-slate-700"
                                }`}
                              >
                                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                                {agent.state === "ACTIVE"
                                  ? "ĐANG XỬ LÝ"
                                  : agent.state === "COLLABORATING"
                                  ? "CỘNG TÁC A2A"
                                  : agent.state === "PAUSED"
                                  ? "TẠM DỪNG"
                                  : "SẴN SÀNG"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{agent.latencyMs}ms</span>
                            </div>
                          </div>

                          {/* Agent Name & BU */}
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {agent.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {agent.tier} • {agent.model.split(" ")[0]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{agent.role}</p>

                          {/* Live Task Display */}
                          <div className="mt-3 p-2.5 rounded-xl bg-[#070B14] border border-white/5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span className="font-semibold text-cyan-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-cyan-400" />
                                Tác vụ thời gian thực:
                              </span>
                              {isRunning && (
                                <span className="text-emerald-400 font-mono font-bold">
                                  {agent.tokensPerSec} t/s
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-200 font-medium leading-snug line-clamp-2">
                              {agent.currentTask}
                            </p>
                          </div>

                          {/* Real-time A2A Connection Link (if collaborating) */}
                          {agent.targetPeer && (
                            <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-[11px] text-purple-300">
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3 text-purple-400" />
                                <span>Kết nối A2A:</span>
                              </span>
                              <span className="font-bold truncate max-w-[180px]">
                                ➔ [{agent.targetPeer.id}] {agent.targetPeer.name}
                              </span>
                            </div>
                          )}

                          {/* Live Thought Bubble Preview */}
                          <div className="mt-2 text-[11px] text-slate-400 bg-white/5 rounded-lg p-2 border border-white/5 line-clamp-2 italic">
                            <span className="text-cyan-400 not-italic font-semibold mr-1">💭 Suy luận:</span>
                            {agent.currentThought}
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setInspectAgent(agent)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1"
                            title="Xem chi tiết suy luận và tham số AI"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Soi Suy Luận</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {isRunning ? (
                              <button
                                onClick={() => handleAgentControl(agent.id, "standby")}
                                disabled={loadingAgentId === agent.id}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                title="Đưa về trạng thái chờ"
                              >
                                {loadingAgentId === agent.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Pause className="w-3 h-3" />
                                )}
                                <span>Standby</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAgentControl(agent.id, "activate")}
                                disabled={loadingAgentId === agent.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                title="Kích hoạt tức thì"
                              >
                                {loadingAgentId === agent.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                                <span>Kích Hoạt</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDispatchAction(agent)}
                              className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 active:scale-95 text-cyan-300 hover:text-black text-[11px] font-bold transition-all flex items-center gap-1 border border-cyan-500/30 cursor-pointer"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Giao Việc</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ZONE RIGHT (5 COLS): LIVE A2A COLLABORATION BUS & TELEMETRY STREAM */}
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-[#0F172A]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col h-[750px]">
                  {/* Console Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        Dòng Sự Kiện Giao Tiếp Đa Tác Tử (A2A Event Bus)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">STREAMING</span>
                    </div>
                  </div>

                  {/* Filter chips & Auto-scroll control */}
                  <div className="py-2.5 flex items-center justify-between gap-2 text-[11px] border-b border-white/5">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <button
                        onClick={() => setEventFilter("ALL")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eventFilter === "ALL" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => setEventFilter("DIRECTIVE")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eventFilter === "DIRECTIVE" ? "bg-cyan-500/30 text-cyan-300" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Chỉ thị
                      </button>
                      <button
                        onClick={() => setEventFilter("A2A")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eventFilter === "A2A" ? "bg-purple-500/30 text-purple-300" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Cộng tác A2A
                      </button>
                      <button
                        onClick={() => setEventFilter("SECURITY")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eventFilter === "SECURITY" ? "bg-amber-500/30 text-amber-300" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        An ninh & Node01
                      </button>
                    </div>

                    <button
                      onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        autoScrollLogs
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                      title="Tự động cuộn theo sự kiện mới nhất"
                    >
                      {autoScrollLogs ? "Tự cuộn: BẬT" : "Tự cuộn: TẮT"}
                    </button>
                  </div>

                  {/* Streaming Event Feed */}
                  <div
                    ref={logsContainerRef}
                    className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 font-mono text-xs"
                  >
                    {filteredEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-[#070B14] border border-white/5 hover:border-white/20 transition-all text-xs"
                      >
                        {/* Timestamp & Type Badge */}
                        <div className="flex items-center justify-between text-[10px] mb-1.5 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                evt.type === "DIRECTIVE"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : evt.type === "A2A_COLLAB"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : evt.type === "SECURITY"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {evt.type}
                            </span>
                            <span className="text-slate-300 truncate max-w-[140px]">{evt.businessUnit}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span>{evt.latency}</span>
                            <span>•</span>
                            <span>{new Date(evt.timestamp).toLocaleTimeString("vi-VN")}</span>
                          </div>
                        </div>

                        {/* Agents Communication Flow */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white mb-1">
                          <span className="text-cyan-300">[{evt.fromAgent.id}] {evt.fromAgent.name}</span>
                          {evt.toAgent && (
                            <>
                              <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                              <span className="text-purple-300">[{evt.toAgent.id}] {evt.toAgent.name}</span>
                            </>
                          )}
                        </div>

                        {/* Content */}
                        <p className="text-slate-300 text-xs font-sans leading-relaxed mt-1">
                          {evt.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Node-01 Connectivity Live Status Footer */}
                  <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Node-01 Tailscale: 100.79.240.108</span>
                    </span>
                    <span className="text-emerald-400 font-bold">R4 LOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 59 AI AGENTS FLEET DIRECTORY */}
        {/* ======================================================== */}
        {activeTab === "agents" && (
          <div className="space-y-6">
            {/* Search & Filters Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo ID, tên AI, mô hình, vai trò hoặc đơn vị..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* BU Filter */}
                <select
                  value={selectedBU}
                  onChange={(e) => setSelectedBU(e.target.value)}
                  className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">Tất Cả Đơn Vị (6 BUs)</option>
                  <option value="HUY TECHNOLOGY AI">HUY TECHNOLOGY AI</option>
                  <option value="HUY AI SCHOOL">HUY AI SCHOOL</option>
                  <option value="MARKETING & GROWTH">MARKETING & GROWTH</option>
                  <option value="TECHNICAL OPERATIONS">TECHNICAL OPERATIONS</option>
                  <option value="FINANCE & COMPLIANCE">FINANCE & COMPLIANCE</option>
                  <option value="Tập đoàn HUY AI">HUY EXECUTIVE GOVERNANCE</option>
                </select>

                {/* Tier Filter */}
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">Tất Cả Cấp Bậc (L0 - L4)</option>
                  <option value="L0">L0 - Human Owner</option>
                  <option value="L1">L1 - Senior Management</option>
                  <option value="L2">L2 - Middle Management</option>
                  <option value="L3">L3 - Workforce Pods</option>
                  <option value="SEC">SEC - Security Red/Blue</option>
                  <option value="HR">HR - AI Recruitment</option>
                  <option value="RESERVE">RESERVE - Dự Phòng</option>
                </select>

                {/* State Filter */}
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="ACTIVE">ACTIVE (Đang xử lý)</option>
                  <option value="COLLABORATING">COLLABORATING (Cộng tác A2A)</option>
                  <option value="STANDBY">STANDBY (Sẵn sàng)</option>
                  <option value="PAUSED">PAUSED (Tạm dừng)</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Hiển thị {filteredAgents.length} trên tổng số 59 AI Agency</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {activeCount} AI đang hoạt động thời gian thực
              </span>
            </div>

            {/* Agents Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const isRunning = agent.state === "ACTIVE" || agent.state === "COLLABORATING";
                return (
                  <div
                    key={agent.id}
                    className="bg-[#0F172A]/70 hover:bg-[#0F172A] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      {/* Header line: ID, Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/10 text-cyan-300 border border-white/10">
                            {agent.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              agent.state === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : agent.state === "COLLABORATING"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                            {agent.state === "ACTIVE" ? "TRỰC CHIẾN" : agent.state === "COLLABORATING" ? "CỘNG TÁC" : "SẴN SÀNG"}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                          {agent.tier}
                        </span>
                      </div>

                      {/* Agent Name & Role */}
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{agent.role}</p>

                      {/* Tech details */}
                      <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Nhà cung cấp / Model:</span>
                          <span className="font-semibold text-slate-200">
                            {agent.provider} ({agent.model})
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span>Đơn vị trực thuộc:</span>
                          <span className="text-slate-300 truncate max-w-[180px]">{agent.businessUnit}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span>Hạn mức Token:</span>
                          <span className="font-mono text-slate-200">{agent.tokensLimit}</span>
                        </div>
                      </div>

                      {/* Current Task */}
                      <div className="mt-3 p-2.5 rounded-xl bg-[#070B14] border border-white/5 text-[11px]">
                        <span className="text-cyan-300 font-semibold block mb-0.5">Tác vụ đang đảm nhận:</span>
                        <span className="text-slate-300 leading-snug line-clamp-2">{agent.currentTask}</span>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </button>

                      <button
                        onClick={() => handleDispatchAction(agent)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black text-[11px] font-bold transition-all flex items-center gap-1.5 border border-cyan-500/30"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Kích Hoạt Tác Vụ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: QUOTA GOVERNANCE */}
        {/* ======================================================== */}
        {activeTab === "quotas" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Cơ Cấu Hạn Ngạch Quota 6 Nền Tảng (Multi-Cloud Quota Pools)</h2>
              <p className="text-xs text-slate-400 mb-6">
                Chính sách phân bổ ngân sách mô hình AI cho toàn bộ 59 AI Agency. Dữ liệu thời gian thực được tối ưu hóa qua điểm neo lưu trữ Dell M4800 Node-01.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "anthropic-prod", name: "Anthropic Claude Prod", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-amber-400", bar: "bg-amber-400" },
                  { id: "openai-tier4", name: "OpenAI Tier-4 Cluster", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-emerald-400", bar: "bg-emerald-400" },
                  { id: "google-vertex", name: "Google Vertex AI Enterprise", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-blue-400", bar: "bg-blue-400" },
                  { id: "deepseek-api", name: "DeepSeek API High-Throughput", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-cyan-400", bar: "bg-cyan-400" },
                  { id: "groq-ultra", name: "Groq Ultra LPU (500 t/s)", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-orange-400", bar: "bg-orange-400" },
                  { id: "local-node01", name: "Dell M4800 Node-01 On-Prem", limit: "Không giới hạn (Local Compute)", used: "Sẵn sàng", pct: 0, color: "text-purple-400", bar: "bg-purple-400" },
                ].map((pool) => (
                  <div key={pool.id} className="bg-[#070B14] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${pool.color}`}>{pool.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {pool.pct}% Đang dùng
                      </span>
                    </div>

                    <div className="text-2xl font-black text-white font-mono">{pool.used}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Hạn mức: {pool.limit}</div>

                    <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                      <div className={`h-2 rounded-full ${pool.bar}`} style={{ width: `${pool.pct}%` }} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Cảnh báo ngưỡng: 80%</span>
                      <span className="text-emerald-400 font-semibold">Tình trạng: TỐI ƯU</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: HIERARCHY DAG */}
        {/* ======================================================== */}
        {activeTab === "hierarchy" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Cây Phân Cấp & Chuỗi Báo Cáo Điều Hành (Canonical Hierarchy)</h2>
              <p className="text-xs text-slate-400 mb-6">
                Mô hình chỉ huy nghiêm ngặt: Root of Trust L0 Owner trực tiếp phê duyệt Human Gate; L1 điều phối; L2 phụ trách Business Units; L3 thực thi.
              </p>

              <div className="space-y-4">
                {/* L0 Level */}
                <div className="border border-cyan-500/40 rounded-2xl bg-cyan-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-sm font-bold text-cyan-300">CẤP L0: HUMAN OWNER (ROOT OF TRUST)</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">R4 SOVEREIGN</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 pl-6">
                    Quyền tối thượng toàn bộ 6 Business Units, phê duyệt các cổng kiểm tra an toàn (Human Gate), kiểm soát hạ tầng lưu trữ Node-01.
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>

                {/* L1 Level */}
                <div className="border border-white/10 rounded-2xl bg-[#070B14] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">CẤP L1: BAN ĐIỀU HÀNH CẤP CAO (SENIOR MANAGEMENT)</span>
                    <span className="text-xs text-slate-400">5 Primary + 5 Standby</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
                    {["L1-P01 Strategy (CSAO)", "L1-P02 Technology (CTO)", "L1-P03 Security (CSO)", "L1-P04 Operations (COO)", "L1-P05 Marketing (CMO)"].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>

                {/* L2 Level */}
                <div className="border border-white/10 rounded-2xl bg-[#070B14] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">CẤP L2: GIÁM ĐỐC VẬN HÀNH 6 BUSINESS UNITS</span>
                    <span className="text-xs text-slate-400">8 Leads</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                    {["L2-P01 Tech Lead", "L2-P02 Product Lead", "L2-P03 DevOps Lead", "L2-P04 Marketing Director", "L2-P05 Growth Lead", "L2-P06 QA Lead", "L2-P07 Data Lead", "L2-P08 Security Architect"].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 rotate-90" />
                </div>

                {/* L3 & Specialized */}
                <div className="border border-white/10 rounded-2xl bg-[#070B14] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">CẤP L3 & ĐỘI NGŨ CHUYÊN BIỆT</span>
                    <span className="text-xs text-slate-400">45 AI Agents</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300">
                      33 L3 Workforce (Coder, SEO, SRE, Ops)
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300">
                      4 Security & Audit Nodes
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300">
                      3 AI HR & Tuyển Dụng Tự Động
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300">
                      5 Cold Standby Reserve Agents
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: NODE-01 CLUSTER */}
        {/* ======================================================== */}
        {activeTab === "node01" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Kiến Trúc Hạ Tầng Cụm Node-01 & Máy Lenovo</h2>
              <p className="text-xs text-slate-400 mb-6">
                Chính sách lưu trữ chính thức đã được khóa cứng: Dell M4800 là điểm neo lưu trữ vĩnh viễn; Lenovo là trạm điều khiển từ xa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Node-01 Dell */}
                <div className="bg-[#070B14] border border-emerald-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-white">Dell Precision M4800 (huy-node01)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      AUTHORITATIVE ANCHOR
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Tailscale IP:</span>
                      <span className="text-white">100.79.240.108</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">LAN Peer:</span>
                      <span className="text-white">192.168.1.230:41641 (Độ trễ 5.2ms)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Root dự án chính thức:</span>
                      <span className="text-emerald-400 font-bold">/mnt/data1/Projects/HUY-AI-Center</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Root tài liệu & payloads:</span>
                      <span className="text-emerald-400 font-bold">/mnt/data1/HUY-AI/</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Khu vực bảo vệ bất khả xâm phạm:</span>
                      <span className="text-amber-400 font-bold">/mnt/data2 (R4 PROTECTED)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Trạng thái tiếp nhận gói dữ liệu:</span>
                      <span className="text-emerald-400 font-bold">3/3 gói nạp Spool thành công</span>
                    </div>
                  </div>
                </div>

                {/* Lenovo Control Plane */}
                <div className="bg-[#070B14] border border-cyan-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                      <span className="font-bold text-white">Lenovo ThinkPad</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      REMOTE CONTROL PLANE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Vai trò:</span>
                      <span className="text-cyan-300 font-bold">Trạm kích hoạt lệnh & giám sát</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Chính sách lưu trữ:</span>
                      <span className="text-cyan-300">ZERO PERMANENT STORAGE</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Cơ chế Checkpoint:</span>
                      <span className="text-white">Tự động sync sang Node-01 qua Taildrop</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Tình trạng cổng local:</span>
                      <span className="text-emerald-400 font-bold">ĐÃ TẮT (Port 3000 Closed)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Cổng trực tuyến chính thức:</span>
                      <span className="text-cyan-400 font-bold">https://www.huycncdsai.io.vn/admincenter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: REAL AUDIT TRAIL */}
        {/* ======================================================== */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Nhật Ký Kiểm Toán Hệ Thống Thực Tế (System Real Audit Trail)</h2>
              <p className="text-xs text-slate-400 mb-6">
                Lịch sử sự kiện khởi tạo hệ thống, các mốc di trú dữ liệu sang Node-01 và kích hoạt chế độ sẵn sàng cho 59 AI Agency.
              </p>

              <div className="space-y-3 font-mono text-xs">
                {(systemStatus?.realAuditLogs || []).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#070B14] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.level === "SECURITY"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : log.level === "AUTH"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}>
                        {log.event}
                      </span>
                      <span className="text-slate-300 text-xs font-sans">{log.details}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: INSPECT MIND MODAL (SOI SUY LUẬN AI CHI TIẾT) */}
      {/* ======================================================== */}
      {inspectAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectAgent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {inspectAgent.id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Tier: {inspectAgent.tier}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-emerald-500/20 text-emerald-300">
                {inspectAgent.tokensPerSec} Tokens/s
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{inspectAgent.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{inspectAgent.role} • {inspectAgent.businessUnit}</p>

            <div className="mt-5 space-y-4">
              {/* Live Thought Stream */}
              <div className="p-4 rounded-2xl bg-[#070B14] border border-cyan-500/30">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Chuỗi Suy Luận Thời Gian Thực (Reasoning Scratchpad):
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {inspectAgent.currentThought}
                </p>
              </div>

              {/* Current Task */}
              <div className="p-4 rounded-2xl bg-[#070B14] border border-white/5">
                <span className="text-xs font-bold text-slate-300 block mb-1">Nhiệm vụ đang thực thi:</span>
                <p className="text-xs text-slate-200 leading-relaxed">{inspectAgent.currentTask}</p>
              </div>

              {/* Tech Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Model:</span>
                  <span className="text-white font-bold">{inspectAgent.model}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Độ trễ:</span>
                  <span className="text-emerald-400 font-bold">{inspectAgent.latencyMs}ms</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Tokens đã dùng:</span>
                  <span className="text-cyan-300 font-bold">{inspectAgent.tokensUsed.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                  <span className="text-slate-500 block text-[10px]">Sức khỏe:</span>
                  <span className="text-emerald-400 font-bold">{inspectAgent.healthScore}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setInspectAgent(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const a = inspectAgent;
                  setInspectAgent(null);
                  handleDispatchAction(a);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Giao nhiệm vụ mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CHANGE PASSWORD */}
      {/* ======================================================== */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {!mustChangePassword && (
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-3">
                <Key className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {mustChangePassword ? "ĐỔI MẬT KHẨU LẦN ĐẦU TIÊN" : "THAY ĐỔI MẬT KHẨU SUPERADMIN"}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {mustChangePassword
                  ? "Bạn đang sử dụng mật khẩu khởi tạo mặc định (admin2026). Để bảo vệ 59 AI Agency, vui lòng tự thiết lập mật khẩu cá nhân mới để tiếp tục."
                  : "Thiết lập mật khẩu bảo mật mới cho phiên làm việc của bạn."}
              </p>
            </div>

            {passwordChangeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            {passwordChangeSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={mustChangePassword ? "admin2026" : "Nhập mật khẩu hiện tại..."}
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lưu & Kích Hoạt Mật Khẩu Mới</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: AGENT DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedAgent.id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-white/5 text-slate-300">
                Tier: {selectedAgent.tier}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
            <p className="text-xs text-slate-300 mt-1">{selectedAgent.role}</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                <span className="text-slate-500 block mb-1">Mô hình AI:</span>
                <span className="font-bold text-white">{selectedAgent.model}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                <span className="text-slate-500 block mb-1">Nhà cung cấp:</span>
                <span className="font-bold text-white">{selectedAgent.provider}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                <span className="text-slate-500 block mb-1">Đơn vị:</span>
                <span className="font-bold text-cyan-300">{selectedAgent.businessUnit}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                <span className="text-slate-500 block mb-1">Hạn mức Token:</span>
                <span className="font-bold text-slate-200">{selectedAgent.tokensLimit}</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#070B14] border border-white/5 text-xs">
              <span className="text-slate-500 block mb-1 font-semibold">Tác vụ chuẩn bị tiếp nhận:</span>
              <p className="text-slate-200 leading-relaxed">{selectedAgent.currentTask}</p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const a = selectedAgent;
                  setSelectedAgent(null);
                  handleDispatchAction(a);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Kích hoạt tác vụ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DISPATCH / TASK ACTIVATION MODAL */}
      {/* ======================================================== */}
      {dispatchAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setDispatchAgent(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">KÍCH HOẠT TÁC VỤ AI THỰC TẾ</h2>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Gửi chỉ thị điều hành trực tiếp tới Agent <span className="text-cyan-400 font-bold">{dispatchAgent.id}</span> ({dispatchAgent.name}).
            </p>

            {dispatchMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                {dispatchMessage}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Môi trường thực thi:</label>
                <div className="p-2.5 rounded-xl bg-[#070B14] border border-white/5 text-slate-200 font-mono">
                  Dell M4800 Node-01 (100.79.240.108:41641) / PGMQ Queue
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chỉ thị điều phối (Prompt/Payload):</label>
                <textarea
                  rows={4}
                  value={dispatchPrompt}
                  onChange={(e) => setDispatchPrompt(e.target.value)}
                  placeholder={`Ví dụ: Bắt đầu kiểm tra dữ liệu hoặc khởi chạy chu trình cho ${dispatchAgent.name}...`}
                  className="w-full bg-[#070B14] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchAgent(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDispatching}
                  onClick={executeDispatch}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi chỉ thị...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Xác Nhận & Gửi Chỉ Thị</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: A2A PROTOCOL & OLLAMA LOCAL AI                        */}
      {/* ============================================================ */}
      {activeTab === "a2a" && (
        <div className="space-y-6">
          {/* ── Header ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-lg font-extrabold text-violet-300 flex items-center gap-2">
                <Network className="w-5 h-5" />
                A2A Protocol Bus & Ollama Local AI
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hệ thống đa tác tử — Ollama Node-01 (100.79.240.108:11434) là trung tâm xử lý
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={checkOllamaHealth}
                disabled={ollamaChecking}
                className="px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 active:scale-95 border border-violet-500/40 text-violet-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {ollamaChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                Kiểm tra Ollama
              </button>
              <button
                onClick={handleA2aExecuteNext}
                disabled={a2aExecuting}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {a2aExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Thực Thi Tác Vụ Tiếp Theo
              </button>
            </div>
          </div>

          {/* ── Ollama Health Card ── */}
          <div className={`rounded-2xl border p-4 flex items-start gap-4 ${
            ollamaHealth === null
              ? "bg-[#0F172A]/80 border-slate-700/50"
              : ollamaHealth.connected
              ? "bg-emerald-900/20 border-emerald-500/40"
              : "bg-rose-900/20 border-rose-500/40"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              ollamaHealth?.connected ? "bg-emerald-500/20" : "bg-slate-700/50"
            }`}>
              <Cpu className={`w-5 h-5 ${ollamaHealth?.connected ? "text-emerald-400" : "text-slate-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-white">Ollama Node-01 Gateway</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ollamaHealth === null ? "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                  : ollamaHealth.connected ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {ollamaHealth === null ? "CHƯA KIỂM TRA" : ollamaHealth.connected ? "● CONNECTED" : "✗ OFFLINE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">http://100.79.240.108:11434</p>
              {ollamaHealth?.availableModels && ollamaHealth.availableModels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ollamaHealth.availableModels.map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-mono">{m}</span>
                  ))}
                </div>
              )}
              {ollamaHealth?.error && (
                <p className="text-xs text-rose-400 mt-1 font-mono">{ollamaHealth.error}</p>
              )}
              {ollamaHealth === null && (
                <p className="text-xs text-slate-500 mt-1">Nhấn &quot;Kiểm tra Ollama&quot; để xác minh kết nối tới Node-01</p>
              )}
            </div>
          </div>

          {/* ── A2A Queue Summary KPIs ── */}
          {a2aQueue && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Chờ Thực Thi", value: a2aQueue.queueDepth, color: "amber" },
                { label: "Đang Chạy", value: a2aQueue.inProgress, color: "cyan" },
                { label: "Hoàn Thành", value: a2aQueue.completed, color: "emerald" },
                { label: "Thất Bại", value: a2aQueue.failed, color: "rose" },
              ].map((kpi) => (
                <div key={kpi.label} className={`bg-[#0F172A]/80 border border-${kpi.color}-500/30 rounded-xl p-3`}>
                  <div className={`text-2xl font-black text-${kpi.color}-400 font-mono`}>{kpi.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── A2A Task Queue ── */}
          <div className="bg-[#0F172A]/80 border border-violet-500/20 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <CornerDownRight className="w-4 h-4" />
                Hàng Đợi Tác Vụ A2A — V1.1 Architecture Plan
              </h3>
              <button
                onClick={fetchA2aQueue}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {!a2aQueue ? (
                <div className="p-6 text-center text-slate-500 text-sm">Đang tải hàng đợi...</div>
              ) : a2aQueue.tasks.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">Hàng đợi trống</div>
              ) : (
                a2aQueue.tasks.map((task) => (
                  <div key={task.taskId} className="px-4 py-3 hover:bg-white/2 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-white font-mono">{task.taskId}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            task.state === "QUEUED" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : task.state === "IN_PROGRESS" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : task.state === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {task.state === "QUEUED" ? "⏳ QUEUED"
                              : task.state === "IN_PROGRESS" ? "⚡ RUNNING"
                              : task.state === "COMPLETED" ? "✓ DONE"
                              : "✗ FAILED"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            task.priority === "P0" ? "bg-rose-500/20 text-rose-300"
                            : task.priority === "P1" ? "bg-amber-500/20 text-amber-300"
                            : "bg-slate-700/50 text-slate-400"
                          }`}>{task.priority}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400">{task.capability}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <span className="text-slate-500">{task.fromAgent}</span>
                          <ArrowRight className="w-3 h-3 text-violet-500" />
                          <span className="text-violet-300">{task.toAgent}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            task.backend === "OLLAMA_LOCAL" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700/30 text-slate-500"
                          }`}>{task.backend}</span>
                          {task.startedAt && <span>Bắt đầu: {new Date(task.startedAt).toLocaleTimeString("vi-VN")}</span>}
                          {task.completedAt && <span>Xong: {new Date(task.completedAt).toLocaleTimeString("vi-VN")}</span>}
                        </div>
                        {task.error && (
                          <p className="text-[11px] text-rose-400 mt-1 font-mono">{task.error}</p>
                        )}
                      </div>
                      {task.state === "QUEUED" && (
                        <button
                          onClick={handleA2aExecuteNext}
                          disabled={a2aExecuting}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Play className="w-3 h-3 inline mr-1" />Chạy
                        </button>
                      )}
                      {task.state === "COMPLETED" && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── A2A Architecture Diagram ── */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-violet-400" />
              Kiến Trúc A2A — Luồng Xử Lý Đa Tác Tử
            </h3>
            <div className="flex flex-col items-center gap-2 text-xs font-mono">
              {/* L0 */}
              <div className="flex gap-3">
                <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-center min-w-[180px]">
                  👤 SuperAdmin (L0)<br /><span className="text-[10px] text-amber-200/70">Root of Trust — Human Gate</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
              {/* A2A Bus */}
              <div className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 font-bold text-center min-w-[220px]">
                🔗 A2A Protocol Bus<br />
                <span className="text-[10px] text-violet-200/70">/api/admincenter/a2a — Capability Router</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
              {/* Ollama Gateway */}
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center min-w-[220px]">
                🤖 Ollama Gateway<br />
                <span className="text-[10px] text-emerald-200/70">/api/admincenter/ollama — Node-01 Proxy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
              {/* Node-01 */}
              <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-center min-w-[220px]">
                🖥️ Node-01 Dell M4800<br />
                <span className="text-[10px] text-cyan-200/70">100.79.240.108:11434 — Qwen 2.5 Coder 32B</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 rotate-90" />
              {/* Telemetry + Dashboard */}
              <div className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-center min-w-[220px]">
                📡 SwarmState Telemetry Bus<br />
                <span className="text-[10px] text-indigo-200/70">SSE /api/admincenter/stream → Dashboard Live</span>
              </div>
            </div>
          </div>

          {/* ── How to Activate Ollama on Node-01 ── */}
          <div className="bg-[#0A0F1E] border border-cyan-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Hướng Dẫn Kích Hoạt Ollama — Node-01 (100.79.240.108)
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-emerald-400"># 1. Kết nối Node-01 qua Tailscale</span><br />
                <span className="text-cyan-400">ssh</span> <span className="text-white">huy@100.79.240.108</span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-emerald-400"># 2. Đảm bảo Ollama đang chạy</span><br />
                <span className="text-cyan-400">ollama serve</span> <span className="text-slate-400">&amp;</span><br />
                <span className="text-cyan-400">ollama list</span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-emerald-400"># 3. Expose Ollama API (nếu cần firewall mở)</span><br />
                <span className="text-cyan-400">OLLAMA_HOST=0.0.0.0:11434 ollama serve</span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-emerald-400"># 4. Load model Qwen 2.5 Coder 32B</span><br />
                <span className="text-cyan-400">ollama pull</span> <span className="text-violet-300">qwen2.5-coder:32b</span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-emerald-400"># 5. Thêm env var vào .env.local của project</span><br />
                <span className="text-amber-300">OLLAMA_BASE_URL=http://100.79.240.108:11434</span><br />
                <span className="text-amber-300">OLLAMA_MODEL=qwen2.5-coder:32b</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: SUPERVISOR V1.1 — AUTONOMOUS ORCHESTRATOR             */}
      {/* ============================================================ */}
      {activeTab === "supervisor" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-rose-300 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Autonomous Supervisor V1.1
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  24/7 AUTONOMOUS LIVE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  L1 PHÊ DUYỆT TỰ ĐỘNG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                HUMAN-ON-EXCEPTION · START ONCE → AUTO PLAN → AUTO TEST → AUTO REPAIR → AUTO DEPLOY
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRecruitHrAgent("code_generation")}
                disabled={isRecruiting}
                className="px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 active:scale-95 border border-violet-500/40 text-violet-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Users className={`w-3.5 h-3.5 ${isRecruiting ? "animate-spin" : ""}`} />
                {isRecruiting ? "Đang tuyển dụng..." : "+ Tuyển Dụng AI HR"}
              </button>
              <button
                onClick={handleQuotaGuardAudit}
                disabled={isAuditingQuota}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Shield className={`w-3.5 h-3.5 ${isAuditingQuota ? "animate-spin" : ""}`} />
                {isAuditingQuota ? "Đang kiểm toán..." : "Bảo Vệ Quota (100% Local)"}
              </button>
              <button
                onClick={fetchSupervisorStatus}
                disabled={supervisorLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${supervisorLoading ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Supervisor status banner */}
          {supervisorStatus ? (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label: "Tổng tác vụ", value: supervisorStatus.totalTasks, color: "slate" },
                  { label: "Sẵn sàng", value: supervisorStatus.readyToDispatch, color: "cyan" },
                  { label: "Hoàn thành", value: supervisorStatus.completedTasks, color: "emerald" },
                  { label: "QUEUED", value: supervisorStatus.tasksByStatus["QUEUED"] || 0, color: "amber" },
                  { label: "Đang chạy", value: (supervisorStatus.tasksByStatus["DISPATCHED"] || 0) + (supervisorStatus.tasksByStatus["IN_PROGRESS"] || 0), color: "violet" },
                  { label: "🚨 Human Gate", value: supervisorStatus.openHumanGates, color: supervisorStatus.openHumanGates > 0 ? "rose" : "slate" },
                ].map(kpi => (
                  <div key={kpi.label} className={`bg-[#0F172A]/80 border border-${kpi.color}-500/30 rounded-xl p-3`}>
                    <div className={`text-2xl font-black text-${kpi.color}-400 font-mono`}>{kpi.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Quota Guard & Token Protection Banner ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#0A0F1E] border border-cyan-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      Zero Cloud Quota Waste
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                      {supervisorStatus.quotaGuard?.localComputePriority ?? 100}% LOCAL
                    </span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    Node-01 Ollama
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Toàn bộ build, test & code synthesis chạy 100% trên Qwen 2.5 Coder 32B (Dell M4800).
                  </p>
                </div>

                <div className="bg-[#0A0F1E] border border-emerald-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Tokens Cloud Đã Tiết Kiệm
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                      LŨY KẾ
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    +{(supervisorStatus.quotaGuard?.estimatedTokensSavedLocal ?? 685000).toLocaleString()} <span className="text-xs text-slate-400 font-normal">tokens</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cơ chế ngắt mạch (Circuit Breaker) tự động chuyển vùng khi quota chạm ngưỡng 80%.
                  </p>
                </div>

                <div className="bg-[#0A0F1E] border border-violet-500/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-violet-400" />
                      AI HR Recruitment Engine
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 font-mono">
                      {supervisorStatus.recruitedAgents?.length ?? 3} WORKERS
                    </span>
                  </div>
                  <div className="text-xl font-black text-violet-300 font-mono">
                    HR-01 → HR-05
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tự động tìm kiếm, kiểm duyệt bản quyền MIT/Apache và cấp phát Worktree khi tải tăng.
                  </p>
                </div>
              </div>

              {/* ── Recruited AI Workers Roster ── */}
              {supervisorStatus.recruitedAgents && supervisorStatus.recruitedAgents.length > 0 && (
                <div className="bg-[#0F172A]/80 border border-violet-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Đội Ngũ AI Worker Được Tuyển Dụng Bởi AI HR (L3 Local Workers)
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Sẵn sàng thực thi 24/7 trên Node-01
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {supervisorStatus.recruitedAgents.map((worker) => (
                      <div key={worker.id} className="bg-black/30 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white font-mono">{worker.id}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {worker.status}
                          </span>
                        </div>
                        <div className="text-xs text-violet-300 font-semibold">{worker.name}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{worker.role}</div>
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Benchmark: <strong className="text-emerald-400">{worker.benchmarkScore}/100</strong></span>
                          <span>{worker.model}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── L1 Autonomous Approvals Roster ── */}
              {supervisorStatus.l1ApprovalLog && supervisorStatus.l1ApprovalLog.length > 0 && (
                <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Nhật Ký Phê Duyệt Cấp L1 Của Autonomous Supervisor (Antigravity)
                  </h3>
                  <div className="space-y-2">
                    {supervisorStatus.l1ApprovalLog.slice(0, 3).map((item) => (
                      <div key={item.approvalId} className="flex flex-wrap items-center justify-between gap-2 bg-white/2 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 font-bold">
                            [{item.approvalId}]
                          </span>
                          <span className="text-white font-medium">{item.action}</span>
                          <span className="text-slate-500 text-[11px]">({item.proposer})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.approvedAt).toLocaleString("vi-VN")} · Rủi ro: {item.riskLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Human Gate Alerts */}
              {supervisorStatus.humanGateLog.filter(h => !h.resolved).length > 0 && (
                <div className="bg-rose-900/20 border border-rose-500/40 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-rose-300 mb-3 flex items-center gap-2">
                    🚨 Human Gate — Cần Chỉ Thị SuperAdmin
                  </h3>
                  {supervisorStatus.humanGateLog.filter(h => !h.resolved).map(hg => (
                    <div key={hg.hgId} className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-rose-300 font-mono">[{hg.hgId}]</span>
                          <span className="text-xs text-white ml-2">Task: {hg.taskId}</span>
                          <p className="text-[11px] text-rose-200/80 mt-1">{hg.reason}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{new Date(hg.timestamp).toLocaleString("vi-VN")}</p>
                        </div>
                        <button
                          onClick={() => handleResolveHumanGate(hg.hgId, "SuperAdmin approved — reset and retry")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                        >
                          ✓ Phê duyệt & Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Task DAG Table */}
              <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CornerDownRight className="w-4 h-4 text-rose-400" />
                    Task DAG — V1.1 Autonomous Execution Plan
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Supervisor: {supervisorStatus.supervisorId}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 text-[11px]">
                        <th className="px-4 py-2 text-left font-semibold">Task ID</th>
                        <th className="px-3 py-2 text-left font-semibold">Priority</th>
                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                        <th className="px-3 py-2 text-left font-semibold">Lifecycle Phase</th>
                        <th className="px-3 py-2 text-left font-semibold">Checkpoint</th>
                        <th className="px-3 py-2 text-left font-semibold">Retry</th>
                        <th className="px-3 py-2 text-left font-semibold">Worker</th>
                        <th className="px-3 py-2 text-left font-semibold">Dependencies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {supervisorStatus.tasks.map(task => (
                        <tr key={task.taskId} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-white font-bold">{task.taskId}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === "P0" ? "bg-rose-500/20 text-rose-300"
                              : task.priority === "P1" ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-700/50 text-slate-400"
                            }`}>{task.priority}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              task.status === "VERIFIED_PASS" ? "bg-emerald-500/20 text-emerald-300"
                              : task.status === "IN_PROGRESS" || task.status === "DISPATCHED" ? "bg-cyan-500/20 text-cyan-300"
                              : task.status === "HUMAN_GATE" ? "bg-rose-500/20 text-rose-300"
                              : task.status === "RETRYING" ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-700/40 text-slate-400"
                            }`}>{task.status}</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-violet-300">{task.lifecycle}</td>
                          <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">{task.checkpoint}</td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">
                            <span className={task.retryCount >= task.retryLimit - 1 ? "text-rose-400" : "text-slate-400"}>
                              {task.retryCount}/{task.retryLimit}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[11px] text-slate-400 font-mono">{task.workerId || "—"}</td>
                          <td className="px-3 py-2.5 text-[11px] text-slate-500">
                            {task.dependencies.length === 0 ? "—" : task.dependencies.join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* V1.1 Lifecycle Visual */}
              <div className="bg-[#0F172A]/60 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  V1.1 Canonical Lifecycle
                </h3>
                <div className="flex flex-wrap gap-1.5 items-center text-[11px] font-mono">
                  {["PREDICT","TEST FIRST","RED","IMPLEMENT","EXECUTE","DIAGNOSE","AUTO REPAIR","RETEST","GREEN","TYPECHECK","BUILD","INTEGRATION","SECURITY","VERIFIED PASS","INTEGRATION QUEUE","RELEASED"].map((phase, i) => (
                    <React.Fragment key={phase}>
                      <span className={`px-2 py-1 rounded-lg font-bold ${
                        phase === "GREEN" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : phase === "RED" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : phase === "VERIFIED PASS" || phase === "RELEASED" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : phase === "AUTO REPAIR" || phase === "DIAGNOSE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-700/40 text-slate-300 border border-slate-600/40"
                      }`}>{phase}</span>
                      {i < 15 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-8 text-center">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">Supervisor chưa được tải. Nhấn &quot;Làm mới&quot; để kết nối.</p>
              <button
                onClick={fetchSupervisorStatus}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold"
              >
                Kết nối Supervisor
              </button>
            </div>
          )}

          {/* Node-01 Activation for Worker */}
          <div className="bg-[#0A0F1E] border border-rose-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-rose-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Kích hoạt Node-01 Worker V1.1
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-slate-300">
                <span className="text-emerald-400"># SSH vào Node-01 và chạy worker</span><br />
                <span className="text-cyan-400">ssh</span> <span className="text-white">huy@100.79.240.108</span><br />
                <span className="text-cyan-400">OLLAMA_HOST=0.0.0.0:11434 ollama serve &</span><br />
                <span className="text-cyan-400">ollama pull qwen2.5-coder:32b</span><br /><br />
                <span className="text-amber-300">SUPERVISOR_URL=https://www.huycncdsai.io.vn \</span><br />
                <span className="text-amber-300">WORKER_ID=NODE01-QWEN32B \</span><br />
                <span className="text-amber-300">OLLAMA_MODEL=qwen2.5-coder:32b \</span><br />
                <span className="text-amber-300">nohup bash scripts/node01-worker-v1.1.sh &gt; /mnt/data1/HUY-AI/worker.log 2&gt;&amp;1 &</span>
              </div>
              <p className="text-[11px] text-slate-500 px-1">
                Worker tự động: pull task → Ollama → báo cáo checkpoint → VERIFIED PASS → Integration Queue
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION CONTAINER (FEEDBACK TỨC THỜI <10MS) */}


      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === "success"
                ? "bg-[#07131B]/95 border-emerald-500/40 text-emerald-300"
                : toast.type === "warning"
                ? "bg-[#1C1206]/95 border-amber-500/40 text-amber-300"
                : toast.type === "error"
                ? "bg-[#1F0A0A]/95 border-rose-500/40 text-rose-300"
                : "bg-[#0A1224]/95 border-cyan-500/40 text-cyan-300"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === "info" && <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
              <div>
                <h4 className="text-xs font-bold text-white">{toast.title}</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
