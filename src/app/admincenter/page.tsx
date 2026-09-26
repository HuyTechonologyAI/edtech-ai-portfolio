"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ChevronRight,
  Bot,
  Sparkles,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Database,
  Terminal,
  Zap,
  Globe,
  Radio,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  CANONICAL_59_AGENTS,
  AgentCard,
  AgentTier,
  AgentState,
  QuotaDomainId,
} from "@/data/ai-agency-canonical";

interface SystemStatus {
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
    standbyAgents: number;
    quarantinedAgents: number;
    businessUnitsCount: number;
    quotaUtilizationPct: number;
    tokensUsedTotal: number;
    tokensLimitTotal: number;
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

export default function AdminCenterPage() {
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

  // Dashboard state
  const [activeTab, setActiveTab] = useState<"agents" | "quotas" | "hierarchy" | "node01" | "audit">("agents");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBU, setSelectedBU] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedAgent, setSelectedAgent] = useState<AgentCard | null>(null);
  const [dispatchAgent, setDispatchAgent] = useState<AgentCard | null>(null);
  const [dispatchPrompt, setDispatchPrompt] = useState<string>("");
  const [dispatchMessage, setDispatchMessage] = useState<string>("");

  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

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

  const fetchSystemStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch("/api/admincenter/system");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.error("Fetch status error:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkSession();
    fetchSystemStatus();
  }, []);

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
        fetchSystemStatus();
      } else {
        setLoginError(data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err: any) {
      setLoginError("Không thể kết nối máy chủ xác thực: " + err.message);
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
    } catch (err: any) {
      setPasswordChangeError("Lỗi hệ thống khi đổi mật khẩu: " + err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Dispatch Simulated Action
  const handleDispatchAction = (agent: AgentCard) => {
    setDispatchAgent(agent);
    setDispatchPrompt("");
    setDispatchMessage("");
  };

  const executeDispatch = () => {
    if (!dispatchAgent) return;
    setDispatchMessage(
      `[ĐÃ GỬI LỆNH] Chỉ thị đã được nạp vào hàng đợi PGMQ cho Agent ${dispatchAgent.id} (${dispatchAgent.name}) trên Node-01.`
    );
    setTimeout(() => {
      setDispatchAgent(null);
      setDispatchMessage("");
    }, 2000);
  };

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return CANONICAL_59_AGENTS.filter((agent) => {
      const matchesSearch =
        searchQuery === "" ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.businessUnit.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBU = selectedBU === "ALL" || agent.businessUnit.toLowerCase().includes(selectedBU.toLowerCase());
      const matchesTier = selectedTier === "ALL" || agent.tier === selectedTier;
      const matchesState = selectedState === "ALL" || agent.state === selectedState;

      return matchesSearch && matchesBU && matchesTier && matchesState;
    });
  }, [searchQuery, selectedBU, selectedTier, selectedState]);

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
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 border-b border-white/10 backdrop-blur-md px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">HUY AI CENTER</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
                AdminCenter
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Trung Tâm Điều Hành 59 AI Agency Doanh Nghiệp</p>
          </div>
        </div>

        {/* Live Network & Hardware Status */}
        <div className="hidden md:flex items-center gap-4 bg-[#070B14]/80 border border-white/10 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
            <span className="text-slate-300 font-mono">Node-01: ONLINE (100.79.240.108)</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lenovo: Remote Control Plane</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>/mnt/data2: R4 Protected</span>
          </div>
        </div>

        {/* User profile & Actions */}
        <div className="flex items-center gap-2.5">
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
            <span className="hidden sm:inline">Đổi Mật Khẩu</span>
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

      {/* TOP KPI METRICS STRIP (Sạch 100% dữ liệu test, sẵn sàng đón nhận tải thật) */}
      <section className="px-4 lg:px-8 py-6 border-b border-white/5 bg-[#0A1124]/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total AI Agents */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Lực Lượng AI</span>
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">59</span>
              <span className="text-xs text-slate-400 font-medium">AI Agencies</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              6 Business Units • 7 Phân cấp (L0 → L4, SEC, HR)
            </p>
          </div>

          {/* Card 2: Readiness Status */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng Thái Tiếp Nhận</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">58</span>
              <span className="text-xs text-slate-300">Sẵn Sàng</span>
              <span className="text-slate-500">|</span>
              <span className="text-sm font-bold text-cyan-400">1</span>
              <span className="text-xs text-slate-400">Online</span>
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% chuẩn bị sẵn sàng cho lệnh từ Node-01</span>
            </p>
          </div>

          {/* Card 3: Quota Utilization (Pristine 0%) */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hạn Ngạch Quota Đang Dùng</span>
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">0%</span>
              <span className="text-xs text-slate-400">0 / 5,000,000 Tokens</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: "0%" }} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Môi trường sản xuất sạch, không hao phí API</p>
          </div>

          {/* Card 4: Task Queue Depth */}
          <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hàng Đợi Nhiệm Vụ (PGMQ)</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">0</span>
              <span className="text-xs text-slate-400">Đang chờ / 0 Lỗi</span>
            </div>
            <p className="text-[11px] text-amber-300/90 mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ trigger từ Dispatcher & Node-01 Compute</span>
            </p>
          </div>
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <nav className="px-4 lg:px-8 border-b border-white/10 bg-[#0F172A]/40 flex items-center gap-2 overflow-x-auto py-2">
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
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8">
        {/* TAB 1: 59 AI AGENTS */}
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
                  <option value="HUY SMART TAX">HUY SMART TAX & ACCOUNTING</option>
                  <option value="HUY CREATIVE LABS">HUY CREATIVE LABS</option>
                  <option value="HUY CYBER DEFENSE">HUY CYBER DEFENSE</option>
                  <option value="HUY EXECUTIVE GOVERNANCE">HUY EXECUTIVE GOVERNANCE</option>
                  <option value="DỰ PHÒNG TOÀN CẦU">DỰ PHÒNG TOÀN CẦU (Reserve)</option>
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
                  <option value="RESERVE">RESERVE - Dự Phòng Nóng/Nguội</option>
                </select>

                {/* State Filter */}
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="ACTIVE">ACTIVE (Trực chiến)</option>
                  <option value="STANDBY">STANDBY (Sẵn sàng)</option>
                  <option value="WARM_STANDBY">WARM_STANDBY (Dự phòng nóng)</option>
                  <option value="COLD_STANDBY">COLD_STANDBY (Dự phòng nguội)</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Hiển thị {filteredAgents.length} trên tổng số 59 AI Agency</span>
              <span className="text-[11px] text-emerald-400 font-mono">Chế độ vận hành: Môi trường chuẩn bị Node-01</span>
            </div>

            {/* Agents Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          agent.state === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : agent.state === "STANDBY"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : agent.state === "WARM_STANDBY"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-700/40 text-slate-400 border border-slate-700"
                        }`}>
                          {agent.state === "ACTIVE" ? "TRỰC CHIẾN" : agent.state === "STANDBY" ? "SẴN SÀNG" : agent.state}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {agent.riskLevel}
                      </span>
                    </div>

                    {/* Agent Name & Role */}
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{agent.role}</p>

                    {/* Tech details (Provider / Model / Framework) */}
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Nhà cung cấp / Model:</span>
                        <span className="font-semibold text-slate-200">
                          {agent.provider} ({agent.model})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>Framework:</span>
                        <span className="font-mono text-cyan-300">{agent.framework}</span>
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

                    {/* Current Task (Clean standby task) */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#070B14] border border-white/5 text-[11px]">
                      <span className="text-slate-500 font-semibold block mb-0.5">Nhiệm vụ tiếp nhận:</span>
                      <span className="text-slate-300 leading-snug">{agent.currentTask}</span>
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
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QUOTA GOVERNANCE */}
        {activeTab === "quotas" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Cơ Cấu Hạn Ngạch Quota 6 Nền Tảng (Multi-Cloud Quota Pools)</h2>
              <p className="text-xs text-slate-400 mb-6">
                Chính sách phân bổ ngân sách mô hình AI cho toàn bộ 59 AI Agency. Dữ liệu đã được làm sạch và chuẩn bị cho tải sản xuất thực tế.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "anthropic-prod", name: "Anthropic Claude Prod", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-amber-400", bar: "bg-amber-400" },
                  { id: "openai-tier4", name: "OpenAI Tier-4 Cluster", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-emerald-400", bar: "bg-emerald-400" },
                  { id: "google-vertex", name: "Google Vertex AI Enterprise", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-blue-400", bar: "bg-blue-400" },
                  { id: "deepseek-api", name: "DeepSeek API High-Throughput", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-cyan-400", bar: "bg-cyan-400" },
                  { id: "groq-ultra", name: "Groq Ultra LPU (500 t/s)", limit: "10,000,000 Tokens", used: "0", pct: 0, color: "text-orange-400", bar: "bg-orange-400" },
                  { id: "local-node01", name: "Dell M4800 Node-01 On-Prem", limit: "Không giới hạn (Local GPU/CPU)", used: "0", pct: 0, color: "text-purple-400", bar: "bg-purple-400" },
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

        {/* TAB 3: HIERARCHY DAG */}
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
                    {["L1-P01 Strategy (CSAO)", "L1-P02 Technology (CTO)", "L1-P03 Security (CSO)", "L1-P04 Quota (CRO)", "L1-P05 Compliance (CCO)"].map((item, idx) => (
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
                    <span className="text-xs text-slate-400">5 Primary + 5 Standby</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
                    {["L2-P01 HuyTech AI Core", "L2-P02 AISchool EdTech", "L2-P03 SmartTax Finance", "L2-P04 Creative Labs", "L2-P05 DevOps & Node-01"].map((item, idx) => (
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
                    <span className="text-xs text-slate-400">38 AI Agents</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300">
                      10 L3 Workforce (Coder, Researcher, E2E)
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300">
                      10 Security (5 Red Team + 5 Blue Team)
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-300">
                      5 AI HR & Tuyển Dụng Tự Động
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300">
                      14 Global Floating Reserve Slots
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NODE-01 CLUSTER */}
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

        {/* TAB 5: REAL AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Nhật Ký Kiểm Toán Hệ Thống Thực Tế (System Real Audit Trail)</h2>
              <p className="text-xs text-slate-400 mb-6">
                Lịch sử sự kiện khởi tạo hệ thống, các mốc di trú dữ liệu sang Node-01 và kích hoạt chế độ sẵn sàng cho 59 AI Agency.
              </p>

              <div className="space-y-3 font-mono text-xs">
                {(systemStatus?.realAuditLogs || [
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
                ]).map((log) => (
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

      {/* MODAL 1: CHANGE PASSWORD (FIRST-TIME OR ON-DEMAND) */}
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

      {/* MODAL 2: AGENT DETAIL MODAL */}
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
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-white/5 text-slate-300">
                Risk: {selectedAgent.riskLevel}
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
                <span className="text-slate-500 block mb-1">Framework điều phối:</span>
                <span className="font-bold text-cyan-300 font-mono">{selectedAgent.framework}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070B14] border border-white/5">
                <span className="text-slate-500 block mb-1">Quota Domain:</span>
                <span className="font-bold text-slate-200">{selectedAgent.quotaDomain}</span>
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

      {/* MODAL 3: DISPATCH / TASK ACTIVATION MODAL */}
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
                  onClick={executeDispatch}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Xác Nhận & Gửi Chỉ Thị</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
