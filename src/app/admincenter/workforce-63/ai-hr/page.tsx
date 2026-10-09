/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  ALL_LIFECYCLE_STATUSES,
  AI_HR_OFFICERS,
  HARD_RULES_CATALOG,
  DEFAULT_KPI_WEIGHTS,
  calculateWeightedKPIScore,
  classifyKPIBand,
  generateInitialLifecycleRecords,
  AgentLifecycleRecord,
  AILifecycleStatus,
} from "@/data/ai-hr-lifecycle";
import { ADMINCENTER_DEPARTMENTS } from "@/data/ai-workforce-63";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Users,
  Award,
  AlertTriangle,
  FolderArchive,
  Settings,
  UserCheck,
  Search,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function AIHRControlCenterPage() {
  const [activeTab, setActiveTab] = useState<
    "DASHBOARD" | "IDENTITY" | "RECRUITMENT" | "PERFORMANCE" | "SECURITY" | "OFFBOARDING" | "SETTINGS"
  >("DASHBOARD");

  const [records, setRecords] = useState<AgentLifecycleRecord[]>(() => generateInitialLifecycleRecords());
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<AILifecycleStatus | "ALL">("ALL");

  // KPI Calculator state
  const [calcQuality, setCalcQuality] = useState(90);
  const [calcCompletion, setCalcCompletion] = useState(85);
  const [calcCompliance, setCalcCompliance] = useState(95);
  const [calcResource, setCalcResource] = useState(80);
  const [calcSpeed, setCalcSpeed] = useState(85);

  // New recruitment request state
  const [reqRole, setReqRole] = useState("");
  const [reqDept, setReqDept] = useState(ADMINCENTER_DEPARTMENTS[0]);
  const [reqReason, setReqReason] = useState("");
  const [recruitmentRequests, setRecruitmentRequests] = useState([
    {
      id: "REQ-2026-001",
      role: "Trợ lý Phân tích Dữ liệu Điểm học sinh (EdTech Analyst)",
      dept: "Khối Giáo dục & EdTech AI (HUY AI School)",
      requester: "emp_60 (Mai Hoa)",
      status: "SCREENING",
      createdAt: "2026-10-08",
    },
    {
      id: "REQ-2026-002",
      role: "Kỹ sư Tối ưu Hóa Prompt & Context Cache",
      dept: "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)",
      requester: "emp_60 (Mai Hoa)",
      status: "SANDBOX_TESTING",
      createdAt: "2026-10-09",
    },
  ]);

  // Security Incident Mock State
  const [incidents, setIncidents] = useState([
    {
      id: "INC-0891",
      agentId: "emp_44",
      agentName: "Quang Hải",
      ruleId: "HR-RULE-12",
      severity: "MEDIUM",
      action: "IMPROVEMENT_PLAN",
      description: "Báo cáo hoàn thành tác vụ crawl dữ liệu n8n nhưng hash commit rỗng.",
      status: "RESOLVED",
      reportedBy: "emp_61 (Hữu Phúc)",
      date: "2026-10-07",
    },
  ]);

  // Offboarding state
  const [offboardingList] = useState<AgentLifecycleRecord[]>([]);

  // Computed summary
  const total = records.length;
  const activeCount = records.filter((r) => r.status === "active").length;

  const currentKPIScore = calculateWeightedKPIScore(
    {
      qualityScore: calcQuality,
      completionScore: calcCompletion,
      complianceScore: calcCompliance,
      resourceScore: calcResource,
      speedScore: calcSpeed,
    },
    DEFAULT_KPI_WEIGHTS
  );
  const currentKPIBand = classifyKPIBand(currentKPIScore);

  // Filtered agent records
  const filteredRecords = records.filter((r) => {
    if (deptFilter !== "ALL" && r.department !== deptFilter) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.agentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddRecruitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqRole.trim()) return;
    const newReq = {
      id: `REQ-${String(recruitmentRequests.length + 1).padStart(3, "0")}`,
      role: reqRole,
      dept: reqDept,
      requester: "emp_60 (Mai Hoa)",
      status: "SCREENING",
      createdAt: "2026-10-09",
    };
    setRecruitmentRequests([newReq, ...recruitmentRequests]);
    setReqRole("");
    setReqReason("");
    alert("Đã gửi đề xuất tuyển dụng cho Trưởng ban Mai Hoa (emp_60) thẩm định!");
  };

  const handleEmergencyQuarantine = (agentId: string) => {
    const reason = prompt("Nhập lý do cách ly khẩn cấp (CISO Thiên Ân phụ trách):");
    if (!reason) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.agentId === agentId
          ? { ...r, status: "quarantined", activeIncidents: r.activeIncidents + 1 }
          : r
      )
    );
    const newInc = {
      id: `INC-${String(incidents.length + 1).padStart(4, "0")}`,
      agentId,
      agentName: records.find((r) => r.agentId === agentId)?.name || agentId,
      ruleId: "HR-RULE-01",
      severity: "CRITICAL",
      action: "QUARANTINE",
      description: `Cách ly khẩn cấp bởi CISO: ${reason}`,
      status: "OPEN",
      reportedBy: "emp_57 (Thiên Ân)",
      date: "2026-10-09",
    };
    setIncidents([newInc, ...incidents]);
    alert(`Đã cách ly khẩn cấp nhân sự ${agentId}. Quyền truy cập bị thu hồi ngay lập tức!`);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 p-6 md:p-10 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Link href="/admincenter/workforce-63" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Bảng 63 AI Workforce
            </Link>
            <span>/</span>
            <span className="text-white font-medium">Trung Tâm Quản Trị AI HR & Vòng Đời Nhân Sự</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admincenter/workforce-63/avatar-audit"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Kiểm toán Avatar (63/63)
            </Link>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
              Master Prompt V2.0 Engine
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              AI HR & Workforce Lifecycle Management
            </h1>
            <p className="text-slate-400 max-w-3xl text-sm mt-2">
              Hệ thống quản trị vòng đời 11 trạng thái, thực thi 14 Hard Rules, đo lường KPI có trọng số và điều phối 5 nhân sự AI HR nòng cốt cho toàn bộ 63 Agents thuộc HUY TECHNOLOGY AI GROUP.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center min-w-[90px]">
              <div className="text-[11px] text-slate-400">Quy mô</div>
              <div className="text-xl font-bold text-white">{total}</div>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 text-center min-w-[90px]">
              <div className="text-[11px] text-emerald-400">Hoạt động</div>
              <div className="text-xl font-bold text-emerald-400">{activeCount}</div>
            </div>
            <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/40 text-center min-w-[90px]">
              <div className="text-[11px] text-indigo-400">Cán bộ HR</div>
              <div className="text-xl font-bold text-indigo-400">5</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("DASHBOARD")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "DASHBOARD"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <Users className="w-4 h-4" /> Dashboard Vòng Đời
          </button>
          <button
            onClick={() => setActiveTab("IDENTITY")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "IDENTITY"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Danh Tánh & Avatar (63)
          </button>
          <button
            onClick={() => setActiveTab("RECRUITMENT")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "RECRUITMENT"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4" /> Tuyển Dụng (Mai Hoa)
          </button>
          <button
            onClick={() => setActiveTab("PERFORMANCE")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "PERFORMANCE"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <Award className="w-4 h-4" /> Đánh Giá KPI (Hữu Phúc)
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "SECURITY"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> 14 Hard Rules & An Ninh
          </button>
          <button
            onClick={() => setActiveTab("OFFBOARDING")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "OFFBOARDING"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <FolderArchive className="w-4 h-4" /> Lưu Trữ Offboarding
          </button>
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "SETTINGS"
                ? "bg-slate-900/80 text-emerald-400 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
          >
            <Settings className="w-4 h-4" /> Cấu Hình HR
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* ================================================================= */}
        {/* TAB 1: DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === "DASHBOARD" && (
          <div className="space-y-8">
            {/* 11 States Lifecycle Matrix */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ma Trận Phân Bổ 11 Trạng Thái Vòng Đời AI
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ALL_LIFECYCLE_STATUSES.map((st) => {
                  const count = records.filter((r) => r.status === st.code).length;
                  return (
                    <div
                      key={st.code}
                      className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{st.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${st.badgeColor}`}>
                          {st.code}
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-white mt-1.5">{count}</div>
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{st.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5 Core AI HR Officers */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> 5 Cán Bộ AI HR Nòng Cốt Chịu Trách Nhiệm Vận Hành
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.values(AI_HR_OFFICERS).map((officer) => {
                  const emp = records.find((r) => r.agentId === officer.agentId);
                  return (
                    <div
                      key={officer.agentId}
                      className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={emp?.avatarPath || `/assets/workforce/${officer.agentId}.jpg`}
                            alt={officer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{officer.name}</div>
                            <div className="text-[10px] font-mono text-indigo-400 font-semibold">{officer.code}</div>
                            <div className="text-[10px] text-slate-400">{officer.gender}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-200 mb-1">{officer.title}</div>
                        <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
                          {officer.responsibilities.slice(0, 3).map((resp, i) => (
                            <li key={i} className="line-clamp-2">{resp}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đang trực chiến
                        </span>
                        <span className="text-slate-500 font-mono">{officer.agentId}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Phân Bổ Nhân Sự Theo 8 Khối Nghiệp Vụ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ADMINCENTER_DEPARTMENTS.map((dept) => {
                  const inDept = records.filter((r) => r.department === dept);
                  const maleCount = inDept.filter((r) => r.gender === "Nam").length;
                  const femaleCount = inDept.filter((r) => r.gender === "Nữ").length;
                  return (
                    <div key={dept} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-xs text-white truncate" title={dept}>
                        {dept.split(" (")[0]}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xl font-extrabold text-indigo-400">{inDept.length} nhân sự</span>
                        <div className="text-[11px] text-slate-400 font-mono">
                          <span className="text-blue-400">{maleCount} Nam</span> • <span className="text-pink-400">{femaleCount} Nữ</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: IDENTITY & AVATAR AUDIT (63/63) */}
        {/* ================================================================= */}
        {activeTab === "IDENTITY" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" /> Bảng Kiểm Toán Danh Tánh & Avatar (Master V2.0)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Xác nhận 63/63 nhân sự có hồ sơ hình tượng chuẩn (33 Nam, 30 Nữ), 0 avatar trùng lặp, đồng bộ giữa AdminCenter và Website công khai.
                </p>
              </div>
              <Link
                href="/admincenter/workforce-63/avatar-audit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shrink-0"
              >
                Mở Bảng Đối Soát Trực Quan Toàn Màn Hình <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, ID, mã chức danh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Tất cả phòng ban</option>
                  {ADMINCENTER_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d.split(" (")[0]}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AILifecycleStatus | "ALL")}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái ({records.length})</option>
                  {ALL_LIFECYCLE_STATUSES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Roster Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">STT</th>
                      <th className="py-3 px-3">Agent</th>
                      <th className="py-3 px-3 text-center">Giới tính</th>
                      <th className="py-3 px-3">Phòng ban</th>
                      <th className="py-3 px-3 text-center">Trạng thái</th>
                      <th className="py-3 px-3 text-center">KPI</th>
                      <th className="py-3 px-3 text-center">Xác minh</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((r, idx) => (
                      <tr key={r.agentId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={r.avatarPath}
                              alt={r.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white">{r.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {r.agentId} • {r.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.gender === "Nam"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                            }`}
                          >
                            {r.gender}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-300 truncate max-w-[200px]" title={r.department}>
                            {r.department.split(" (")[0]}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{r.role}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                              r.status === "active"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : r.status === "quarantined"
                                ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="font-bold text-emerald-400">{r.kpiScore}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% OK
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleEmergencyQuarantine(r.agentId)}
                            title="Cách ly khẩn cấp (CISO)"
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 text-[10px] transition-colors"
                          >
                            Cách ly
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: RECRUITMENT ENGINE (Mai Hoa - emp_60) */}
        {/* ================================================================= */}
        {activeTab === "RECRUITMENT" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Create Request */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Đề Xuất Tuyển Dụng Nhân Sự AI Mới
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Theo quy trình Master V2.0, đề xuất được gửi qua Trưởng ban Tuyển dụng Mai Hoa (emp_60) trước khi thẩm định kỹ thuật và giấy phép.
              </p>

              <form onSubmit={handleAddRecruitment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tên vị trí chuyên môn</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chuyên viên Tối ưu RAG & Vector Search"
                    value={reqRole}
                    onChange={(e) => setReqRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Khối phòng ban tiếp nhận</label>
                  <select
                    value={reqDept}
                    onChange={(e) => setReqDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  >
                    {ADMINCENTER_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lý do & Căn cứ tuyển dụng</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả sự thiếu hụt chuyên môn hoặc khối lượng công việc tăng cao..."
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" /> Gửi Yêu Cầu Cho Mai Hoa Thẩm Định
                </button>
              </form>
            </div>

            {/* Recruitment Pipeline Table */}
            <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Pipeline Tuyển Dụng & Thử Việc Hiện Tại
                </span>
                <span className="text-xs text-slate-500 font-mono">Quy trình 10 Bước Chuẩn</span>
              </h3>

              {/* 10 Step Progress Diagram */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 my-4 text-[10px] text-slate-400 grid grid-cols-2 md:grid-cols-5 gap-2 font-mono">
                <div>1. Tiếp nhận (Mai Hoa)</div>
                <div>2. Thiết kế ứng viên</div>
                <div>3. Đo năng lực (Hữu Phúc)</div>
                <div>4. Giấy phép (Kiều Oanh)</div>
                <div>5. An ninh (Thiên Ân)</div>
                <div>6. Human Approval</div>
                <div>7. Onboarding & Node-01</div>
                <div>8. Thử việc (Probation)</div>
                <div>9. Kích hoạt chính thức</div>
                <div>10. Xuất bản Website</div>
              </div>

              <div className="space-y-3 mt-4">
                {recruitmentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{req.role}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                          {req.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{req.dept}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Đề xuất bởi: {req.requester} • Ngày: {req.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {req.status}
                      </span>
                      <button
                        onClick={() => alert(`Xem chi tiết hồ sơ thẩm định của ứng viên ${req.id}`)}
                        className="text-xs text-indigo-400 hover:text-white px-2 py-1"
                      >
                        Chi tiết <ChevronRight className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PERFORMANCE EVALUATION (Hữu Phúc - emp_61) */}
        {/* ================================================================= */}
        {activeTab === "PERFORMANCE" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KPI Simulator */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Bộ Đo Lường KPI Trọng Số (Hữu Phúc)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Công thức chuẩn: Chất lượng 35% + Hoàn thành 20% + Tuân thủ 20% + Tài nguyên 15% + Tốc độ 10%.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Chất lượng đầu ra (35%)</span>
                    <span className="font-bold text-indigo-400">{calcQuality}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcQuality}
                    onChange={(e) => setCalcQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Hoàn thành nhiệm vụ (20%)</span>
                    <span className="font-bold text-indigo-400">{calcCompletion}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcCompletion}
                    onChange={(e) => setCalcCompletion(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Tuân thủ quy tắc cứng (20%)</span>
                    <span className="font-bold text-indigo-400">{calcCompliance}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcCompliance}
                    onChange={(e) => setCalcCompliance(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Sử dụng tài nguyên GPU/Tokens (15%)</span>
                    <span className="font-bold text-indigo-400">{calcResource}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcResource}
                    onChange={(e) => setCalcResource(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Tốc độ xử lý / Latency (10%)</span>
                    <span className="font-bold text-indigo-400">{calcSpeed}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcSpeed}
                    onChange={(e) => setCalcSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Score Result Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center mt-5">
                  <div className="text-xs text-slate-400">Điểm Tổng Hợp Trọng Số</div>
                  <div className="text-3xl font-extrabold text-emerald-400 my-1">{currentKPIScore} / 100</div>
                  <div className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${currentKPIBand.color}`}>
                    {currentKPIBand.label}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{currentKPIBand.actionRecommendation}</p>
                </div>
              </div>
            </div>

            {/* Performance Ranking Table */}
            <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
                <span>Bảng Xếp Hạng Năng Lực 63 Nhân Sự (Đo lường định kỳ)</span>
                <span className="text-xs text-slate-400 font-normal">Chu kỳ: Tháng 10/2026</span>
              </h3>
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Agent</th>
                      <th className="py-2.5 px-3">Phòng ban</th>
                      <th className="py-2.5 px-3 text-center">Điểm KPI</th>
                      <th className="py-2.5 px-3 text-center">Xếp hạng</th>
                      <th className="py-2.5 px-3">Đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {records.slice(0, 15).map((rec) => (
                      <tr key={rec.agentId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                          <img src={rec.avatarPath} alt={rec.name} className="w-6 h-6 rounded-full object-cover" />
                          <span>{rec.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({rec.agentId})</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{rec.department.split(" (")[0]}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-400">{rec.kpiScore}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            {rec.kpiBand}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">Duy trì hoạt động ổn định</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: 14 HARD RULES & AN NINH (Thiên Ân & Kiều Oanh) */}
        {/* ================================================================= */}
        {activeTab === "SECURITY" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" /> Danh Mục 14 Hard Rules Bắt Buộc (Thực thi cấp Backend)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Các quy tắc cứng được giám sát tự động bởi Giám đốc An ninh Thiên Ân (emp_57) và Kiểm toán Giấy phép Kiều Oanh (emp_62).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HARD_RULES_CATALOG.map((rule) => (
                  <div
                    key={rule.ruleId}
                    className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">{rule.ruleId}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            rule.severity === "CRITICAL"
                              ? "bg-rose-950 text-rose-400 border border-rose-800"
                              : rule.severity === "HIGH"
                              ? "bg-orange-950 text-orange-400 border border-orange-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{rule.title}</div>
                      <p className="text-[11px] text-slate-400 mt-1">{rule.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {rule.defaultAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incidents Log */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Nhật Ký Vi Phạm & Sự Cố An Ninh
              </h3>
              <div className="space-y-3 mt-4">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400">{inc.id}</span>
                        <span className="font-semibold text-white">
                          {inc.agentName} ({inc.agentId})
                        </span>
                        <span className="font-mono text-indigo-400">vi phạm {inc.ruleId}</span>
                      </div>
                      <p className="text-slate-400 mt-1 text-[11px]">{inc.description}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Báo cáo bởi: {inc.reportedBy} • Ngày: {inc.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        {inc.action}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {inc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: OFFBOARDING & ARCHIVE (Gia Linh - emp_63) */}
        {/* ================================================================= */}
        {activeTab === "OFFBOARDING" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-indigo-400" /> Quy Trình 11 Bước Ngừng Hoạt Động An Toàn (Offboarding)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Nguyên tắc bất biến: Tuyệt đối không xóa cứng (hard delete) nhân sự hoặc workspace. Toàn bộ hồ sơ được lưu trữ bất biến (Immutable Archive) dưới sự kiểm toán của Gia Linh (emp_63).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  "1. AI HR tạo đề xuất ngừng hoạt động",
                  "2. Hữu Phúc cung cấp đánh giá năng lực",
                  "3. Trưởng phòng ban xem xét & xác nhận",
                  "4. Thiên Ân đánh giá tác động an toàn",
                  "5. Quản trị viên con người (Human Gate) quyết định",
                  "6. Hệ thống ngừng tiếp nhận nhiệm vụ mới",
                  "7. Chuyển giao nhiệm vụ đang xử lý cho Agent khác",
                  "8. Thu hồi toàn bộ quyền truy cập và token",
                  "9. Tạo snapshot lưu trữ bất biến hồ sơ và workspace",
                  "10. Cập nhật trạng thái 'retired' trong hệ thống",
                  "11. Đồng bộ website công khai theo chính sách xuất bản",
                ].map((step, i) => (
                  <div key={i} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-slate-300">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Retired Archive List */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">Kho Lưu Trữ Nhân Sự Đã Ngừng Hoạt Động (Retired)</h3>
              {offboardingList.length === 0 ? (
                <div className="bg-slate-950/40 p-8 rounded-xl border border-slate-800/60 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Chưa có nhân sự nào bị ngừng hoạt động</p>
                  <p className="text-xs text-slate-500 mt-1">Toàn bộ 63 nhân sự AI đang vận hành chính thức và đạt chuẩn kiểm toán.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: HR SETTINGS */}
        {/* ================================================================= */}
        {activeTab === "SETTINGS" && (
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Cấu Hình Chính Sách & Ngưỡng Đánh Giá AI HR
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Chu Kỳ Đánh Giá Năng Lực</h4>
                <div className="space-y-2 text-slate-400">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span>Hằng ngày (Daily):</span>
                    <span className="text-white font-mono">Quét nhật ký, phát hiện vi phạm Hard Rules</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span>Hằng tuần (Weekly):</span>
                    <span className="text-white font-mono">Tổng hợp KPI, báo cáo tỷ lệ hoàn thành</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hằng tháng (Monthly):</span>
                    <span className="text-white font-mono">Đánh giá toàn diện, đề xuất tuyển dụng/thay thế</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Ngưỡng Phân Loại Xếp Hạng</h4>
                <div className="space-y-2 text-slate-400 font-mono">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span>Hạng A (Xuất sắc):</span>
                    <span className="text-emerald-400 font-bold">≥ 90.0 điểm</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span>Hạng B (Tốt):</span>
                    <span className="text-blue-400 font-bold">75.0 – 89.9 điểm</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                    <span>Hạng C (Trung bình):</span>
                    <span className="text-amber-400 font-bold">60.0 – 74.9 điểm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hạng D (Cần cải thiện):</span>
                    <span className="text-rose-400 font-bold">&lt; 60.0 điểm (Improvement Plan)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Hệ thống áp dụng chính sách quản trị phân tầng Google Antigravity & Node-01.</span>
              <button
                onClick={() => alert("Chính sách AI HR đang được khóa bảo vệ bởi Governance Admin.")}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                Lưu Thay Đổi Cấu Hình
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
