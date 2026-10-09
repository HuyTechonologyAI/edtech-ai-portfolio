"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Shield,
  ShieldCheck,
  Radio,
  X,
  ChevronRight,
  Check,
  Copy,
  Sliders,
  Info,
  Network,
  Bot,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import {
  RuntimeEvent,
  createInitialGraphState,
  reduceRuntimeEvent,
  resolveNodeHeartbeatStatus,
  AgentNodeState,
} from "@/lib/agent-tree-runtime";

export interface LocalAIAgentTreeControlPlaneProps {
  nodeVitals?: {
    cpuLoadPct: number;
    ramUsagePct: number;
    ramTotalGb: number;
    ramFreeGb: number;
    hardwareLockupProtection: string;
  };
  nodeStatus?: string;
  nodeIp?: string;
  streamingText?: string;
  isGenerating?: boolean;
  tokensPerSec?: number;
  externalEvents?: RuntimeEvent[];
}

export function LocalAIAgentTreeControlPlane({
  nodeVitals,
  nodeStatus = "ONLINE",
  nodeIp = "192.168.1.43",
  streamingText = "",
  isGenerating = false,
  tokensPerSec = 18.5,
  externalEvents = [],
}: LocalAIAgentTreeControlPlaneProps) {
  // Local interaction events (e.g. human gate approvals)
  const [localEvents, setLocalEvents] = useState<RuntimeEvent[]>([]);

  // UI display modes: 'split' | 'tree' | 'stream' | 'terminal'
  const [viewMode, setViewMode] = useState<"split" | "tree" | "stream" | "terminal">("split");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("L1-SUPERVISOR");
  const [logFilter, setLogFilter] = useState<"ALL" | "TASK" | "A2A" | "VERIFY" | "ERROR">("ALL");
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  // Compute graph state deterministically from initial state and all events
  const graphState = useMemo(() => {
    let state = createInitialGraphState("HUYAI-N01");
    const allEvents = [...externalEvents, ...localEvents];
    for (const evt of allEvents) {
      state = reduceRuntimeEvent(state, evt);
    }

    if (isGenerating) {
      state = {
        ...state,
        supervisor: {
          ...state.supervisor,
          status: "RUNNING",
          currentTask: state.supervisor.currentTask || "Đang xử lý luồng suy luận trực tiếp trên Node-01...",
        },
        agents: {
          ...state.agents,
          "worker-code": {
            ...state.agents["worker-code"],
            status: "RUNNING",
            currentAction: "Đang sinh mã nguồn với mô hình Qwen 2.5 Coder 7B-INT4 trên Node-01...",
          },
        },
      };
    }
    return state;
  }, [externalEvents, localEvents, isGenerating]);

  // Auto-scroll stream and terminal
  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      streamEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamingText, graphState.sessionLog, autoScroll]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2000);
  };

  // Filtered session logs
  const filteredLogs = useMemo(() => {
    return graphState.sessionLog.filter((evt) => {
      if (logFilter === "ALL") return true;
      if (logFilter === "TASK") return evt.type.startsWith("task.");
      if (logFilter === "A2A") return evt.type.startsWith("a2a.");
      if (logFilter === "VERIFY") return evt.type.startsWith("verify.");
      if (logFilter === "ERROR") return evt.status === "failed" || evt.type.includes("failed") || evt.riskLevel === "R4";
      return true;
    });
  }, [graphState.sessionLog, logFilter]);

  // Determine node status display
  const effectiveNodeStatus = resolveNodeHeartbeatStatus(graphState.lastUpdated);

  // Selected node inspection object
  const inspectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    if (selectedNodeId === "L1-SUPERVISOR") return { type: "supervisor", data: graphState.supervisor };
    if (selectedNodeId === "L1-ARCHITECT") return { type: "architect", data: graphState.architect };
    if (selectedNodeId === "ROUTER") return { type: "router", data: graphState.router };
    if (selectedNodeId === "VERIFY") return { type: "verify", data: graphState.verify };
    if (graphState.agents[selectedNodeId]) {
      return { type: "agent", data: graphState.agents[selectedNodeId] };
    }
    return null;
  }, [selectedNodeId, graphState]);

  return (
    <div className="bg-[#050811] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-slate-100">
      {/* 1. CONTROL HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40">
            <Radio className={`w-3.5 h-3.5 ${isGenerating ? "text-emerald-400 animate-pulse" : "text-cyan-400"}`} />
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
              HUY AI LOCAL AGENT TREE & RUNTIME CONTROL PLANE
            </span>
          </div>

          {/* Node-01 Hardware Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                effectiveNodeStatus === "ONLINE"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  : effectiveNodeStatus === "DEGRADED"
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  : "bg-red-500"
              }`}
            />
            <span className="text-slate-300 font-semibold">NODE-01: {nodeStatus}</span>
            <span className="text-slate-500 text-[10px]">({nodeIp}:11434)</span>
          </div>
        </div>

        {/* Real-time counters & Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5 text-[11px]">
            <span className="text-slate-400">A2A:</span>
            <span className="text-cyan-400 font-bold">{graphState.metrics.a2aMessagesPerMin} msg/m</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Tác tử:</span>
            <span className="text-emerald-400 font-bold">{Object.keys(graphState.agents).length} Active</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Tốc độ:</span>
            <span className="text-yellow-400 font-bold">{tokensPerSec} t/s</span>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                viewMode === "split" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Khung đôi: Cây Tác Tử + Luồng Suy Nghĩ"
            >
              Song Song
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                viewMode === "tree" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Chỉ hiển thị Cây Tác Tử"
            >
              Cây Agent
            </button>
            <button
              onClick={() => setViewMode("stream")}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                viewMode === "stream" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Chỉ hiển thị Luồng Token Đang Sinh"
            >
              Stream Token
            </button>
            <button
              onClick={() => setViewMode("terminal")}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                viewMode === "terminal" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Nhật ký A2A Terminal"
            >
              Nhật Ký Sự Kiện
            </button>
          </div>
        </div>
      </div>

      {/* 2. HUMAN GATE ALERT BANNER (If Active) */}
      {graphState.humanGate.isOpen && (
        <div className="bg-amber-950/40 border border-amber-500/60 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold text-amber-300 mr-2">[HUMAN GATE KÍCH HOẠT]:</span>
              <span className="text-amber-200">{graphState.humanGate.reason}</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] text-amber-300 font-mono">
                Cấp {graphState.humanGate.riskLevel || "R3"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const resolveEvt: RuntimeEvent = {
                  eventId: `gate-res-${Date.now()}`,
                  schemaVersion: "1.0",
                  timestamp: new Date().toISOString(),
                  nodeId: "HUYAI-N01",
                  traceId: graphState.humanGate.traceId || "trc-res",
                  type: "human_gate.resolved",
                  status: "running",
                  summary: "Human Owner phê duyệt tiếp tục thực thi tác vụ",
                };
                setLocalEvents((prev) => [...prev, resolveEvt]);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[11px] transition-colors"
            >
              Phê Duyệt
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE (TREE + STREAM / TERMINAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: AGENT TREE VISUAL CANVAS */}
        {(viewMode === "split" || viewMode === "tree") && (
          <div className={viewMode === "split" ? "lg:col-span-7 flex flex-col gap-3" : "lg:col-span-12 flex flex-col gap-3"}>
            <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Network className="w-3.5 h-3.5" />
                  MÔ HÌNH CÂY TÁC TỬ HUY AI (AGENT TREE)
                </span>
                <span className="text-[11px] text-slate-500">Bấm vào từng tác tử để soi chi tiết runtime</span>
              </div>

              {/* GRID CONTAINER: ARCHITECT RAIL + SUPERVISOR TREE */}
              <div className="grid grid-cols-12 gap-3 items-stretch">
                {/* ARCHITECT / REVIEWER (Left Rail: 4 cols) */}
                <div
                  onClick={() => setSelectedNodeId("L1-ARCHITECT")}
                  className={`col-span-12 md:col-span-4 rounded-xl p-3 border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedNodeId === "L1-ARCHITECT"
                      ? "bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                      : "bg-slate-900/60 border-purple-500/30 hover:border-purple-500/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] font-mono font-bold text-purple-300">ARCHITECT / REVIEW</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono">
                        {graphState.architect.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                      Giám sát kiến trúc độc lập, kiểm soát lỗi và chính sách an toàn R0–R4.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-500/20 text-[10px] font-mono flex items-center justify-between text-slate-400">
                    <span>Lỗi phát hiện: {graphState.architect.trackedErrors.length}</span>
                    <span className="text-purple-400">Oversight 24/7</span>
                  </div>
                </div>

                {/* AUTONOMOUS SUPERVISOR (Center Top: 8 cols) */}
                <div
                  onClick={() => setSelectedNodeId("L1-SUPERVISOR")}
                  className={`col-span-12 md:col-span-8 rounded-xl p-3 border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedNodeId === "L1-SUPERVISOR"
                      ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "bg-slate-900/60 border-cyan-500/30 hover:border-cyan-500/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-cyan-200">AUTONOMOUS SUPERVISOR</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400">Qwen 2.5 Coder 7B-INT4</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          isGenerating || graphState.supervisor.status === "RUNNING"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                            : "bg-cyan-500/20 text-cyan-300"
                        }`}
                      >
                        {isGenerating ? "RUNNING" : graphState.supervisor.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-2 border border-white/5 mb-2">
                    <p className="text-[11px] font-mono text-slate-300 truncate">
                      <span className="text-cyan-400">Nhiệm vụ: </span>
                      {graphState.supervisor.currentTask || "Sẵn sàng tiếp nhận chỉ thị từ AdminCenter"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span>Lập kế hoạch • Điều phối • Đưa ra quyết định</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      Chi tiết <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* CONNECTOR: SUPERVISOR -> ROUTER */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-5 bg-gradient-to-b from-cyan-400 to-indigo-500" />
              </div>

              {/* ROUTER / FORK LAYER */}
              <div
                onClick={() => setSelectedNodeId("ROUTER")}
                className={`w-full rounded-xl p-3 border cursor-pointer transition-all flex items-center justify-between ${
                  selectedNodeId === "ROUTER"
                    ? "bg-indigo-950/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                    : "bg-slate-900/60 border-indigo-500/30 hover:border-indigo-500/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-indigo-300">ROUTER / FORK LAYER</span>
                    <span className="text-[10px] text-slate-400 ml-2">route • split • retry • fallback</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-slate-400">Quyết định hiện tại:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {graphState.router.currentDecision || "ROUTE_READY"}
                  </span>
                </div>
              </div>

              {/* CONNECTOR: ROUTER -> SPECIALIZED AGENTS */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-5 bg-gradient-to-b from-indigo-500 to-emerald-500" />
              </div>

              {/* SPECIALIZED WORKER AGENTS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(graphState.agents).map((agent: AgentNodeState) => {
                  const isSelected = selectedNodeId === agent.id;
                  const isAgentRunning = isGenerating || agent.status === "RUNNING";

                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedNodeId(agent.id)}
                      className={`rounded-xl p-3 border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "bg-slate-900/60 border-slate-700/80 hover:border-emerald-500/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-bold text-emerald-300 truncate">
                            {agent.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isAgentRunning
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isAgentRunning ? "RUNNING" : agent.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-mono">
                          {agent.currentAction}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 text-[9px] font-mono flex items-center justify-between text-slate-500">
                        <span>{agent.model}</span>
                        <span className="text-emerald-400 font-semibold">{agent.role.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CONNECTOR: AGENTS -> VERIFY */}
              <div className="flex justify-center -my-2">
                <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-500 to-amber-500" />
              </div>

              {/* REVIEW + VERIFY NODE */}
              <div
                onClick={() => setSelectedNodeId("VERIFY")}
                className={`w-full rounded-xl p-3 border cursor-pointer transition-all flex items-center justify-between ${
                  selectedNodeId === "VERIFY"
                    ? "bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    : "bg-slate-900/60 border-amber-500/30 hover:border-amber-500/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-300">REVIEW + VERIFY</span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      tests • policy • gate (Kiểm duyệt pháp luật & chuẩn sư phạm)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="text-slate-400">
                    Tests:{" "}
                    {graphState.verify.testsRun === 0 ? (
                      <span className="text-slate-400 font-bold">NOT_RUN (0/0)</span>
                    ) : graphState.verify.testsPassed === graphState.verify.testsRun ? (
                      <span className="text-emerald-400 font-bold">
                        {graphState.verify.testsPassed}/{graphState.verify.testsRun} PASS
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">
                        {graphState.verify.testsPassed}/{graphState.verify.testsRun} FAIL
                      </span>
                    )}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      graphState.verify.policyCheck === "PASS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : graphState.verify.policyCheck === "FAIL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {graphState.verify.policyCheck === "PASS"
                      ? "COMPLIANT"
                      : graphState.verify.policyCheck === "FAIL"
                      ? "REJECTED"
                      : "PENDING_AUDIT"}
                  </span>
                </div>
              </div>
            </div>

            {/* NODE INSPECTOR DRAWER */}
            {inspectedNode && (
              <div className="bg-[#0b1120] border border-cyan-500/20 rounded-xl p-3 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    BỘ GIÁM SÁT CHI TIẾT (INSPECTOR): {selectedNodeId}
                  </span>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">TÊN TÁC TỬ</span>
                    <span className="text-slate-200 font-semibold truncate block">
                      {"name" in inspectedNode.data ? inspectedNode.data.name : selectedNodeId}
                    </span>
                  </div>
                  <div className="bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">TRẠNG THÁI HIỆN TẠI</span>
                    <span className="text-emerald-400 font-semibold block">
                      {"status" in inspectedNode.data ? inspectedNode.data.status : "ACTIVE"}
                    </span>
                  </div>
                  <div className="bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">MÔ HÌNH SUY LUẬN</span>
                    <span className="text-cyan-300 block truncate">
                      {"model" in inspectedNode.data ? inspectedNode.data.model : "Qwen 2.5 Coder 7B-INT4"}
                    </span>
                  </div>
                  <div className="bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">THỰC THI TẠI</span>
                    <span className="text-slate-300 block">
                      {nodeVitals ? `${nodeVitals.ramFreeGb} GB RAM Trống / ${nodeVitals.ramTotalGb} GB` : "Node-01 (LAN 192.168.1.43)"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RIGHT / CENTER: LIVE STREAMING OUTPUT & REAL RUNTIME LOGS */}
        {(viewMode === "split" || viewMode === "stream" || viewMode === "terminal") && (
          <div className={viewMode === "split" ? "lg:col-span-5 flex flex-col gap-3" : "lg:col-span-12 flex flex-col gap-3"}>
            {/* STREAMING TOKEN MONITOR */}
            {(viewMode === "split" || viewMode === "stream") && (
              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 flex flex-col flex-1 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-xs font-mono text-cyan-300 font-bold ml-1">
                      LUỒNG SUY NGHĨ & TOKEN THỰC TẾ (NODE-01)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">⚡ {tokensPerSec.toFixed(1)} t/s</span>
                    {streamingText && (
                      <button
                        onClick={() => handleCopy(streamingText, "stream")}
                        className="text-cyan-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        title="Sao chép nội dung sinh"
                      >
                        {copiedState === "stream" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedState === "stream" ? "Đã chép" : "Chép"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Output Window */}
                <div className="flex-1 bg-black/70 rounded-xl p-3 border border-white/5 font-mono text-xs text-slate-200 overflow-y-auto max-h-[360px] min-h-[220px] whitespace-pre-wrap leading-relaxed">
                  {streamingText ? (
                    <div>
                      {streamingText}
                      {isGenerating && (
                        <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
                      )}
                      <div ref={streamEndRef} />
                    </div>
                  ) : (
                    <div className="text-slate-600 h-48 flex flex-col items-center justify-center">
                      <Bot className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                      <p className="text-center text-[11px]">
                        Chưa có luồng dữ liệu suy luận. Bấm một nút mẫu bên trái để kích hoạt tác tử Node-01.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIVE A2A TERMINAL LOGS */}
            {(viewMode === "split" || viewMode === "terminal") && (
              <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 flex flex-col flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-slate-200">A2A LIVE SESSION LOG</span>
                    <span className="text-[10px] text-slate-500">({filteredLogs.length} events)</span>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {(["ALL", "TASK", "A2A", "VERIFY", "ERROR"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setLogFilter(mode)}
                        className={`px-1.5 py-0.5 rounded transition-colors ${
                          logFilter === mode
                            ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                    <button
                      onClick={() => setAutoScroll((v) => !v)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        autoScroll ? "text-emerald-400" : "text-slate-500"
                      }`}
                      title="Bật/Tắt tự cuộn"
                    >
                      {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
                    </button>
                  </div>
                </div>

                {/* Log Terminal Window */}
                <div className="bg-black/80 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[220px] min-h-[140px] flex flex-col gap-1 border border-white/5">
                  {filteredLogs.length === 0 ? (
                    <div className="text-slate-600 text-center py-6">
                      Sẵn sàng ghi nhận sự kiện thực từ Node-01...
                    </div>
                  ) : (
                    filteredLogs.map((evt) => {
                      const isError = evt.status === "failed" || evt.type.includes("failed");
                      const isVerify = evt.type.startsWith("verify.");
                      const isA2A = evt.type.startsWith("a2a.");

                      return (
                        <div
                          key={evt.eventId}
                          className={`py-0.5 border-b border-white/[0.03] flex items-start gap-1.5 leading-snug ${
                            isError ? "text-red-400" : isVerify ? "text-amber-300" : isA2A ? "text-cyan-300" : "text-slate-300"
                          }`}
                        >
                          <span className="text-slate-600 text-[10px] shrink-0">
                            [{evt.timestamp.slice(11, 19)}]
                          </span>
                          <span className="px-1 rounded bg-white/5 text-[9px] font-semibold shrink-0">
                            {evt.sourceAgentId || "SYSTEM"}
                          </span>
                          <span className="px-1 rounded bg-cyan-950/40 text-cyan-400 text-[9px] shrink-0">
                            {evt.type}
                          </span>
                          <span className="text-slate-200 truncate">{evt.summary}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
