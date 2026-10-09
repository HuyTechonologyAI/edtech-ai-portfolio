/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Volume2,
  PlusCircle,
  Search,
  ArrowLeft,
  Briefcase
} from "lucide-react";

interface Agent {
  agent_id: string;
  display_name: string;
  job_title: string;
  department: string;
  department_key: string;
  voice_id: string;
  region: string;
  style: string;
  gender: string;
  sample_path: string;
}

interface Message {
  id: string;
  sender_type: "human_gate" | "ai_agent" | "system";
  sender_name: string;
  agent_id?: string;
  content: string;
  timestamp: string;
  task_id?: string;
  audio_url?: string;
}

interface TaskItem {
  task_id: string;
  assigned_to: string;
  agent_name: string;
  title: string;
  scope: string;
  deadline: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  status: "queued" | "running" | "completed";
  receipt_hash?: string;
}

const DEPARTMENTS = [
  { key: "all", name: "🏢 Toàn Công Ty (#all-workforce)" },
  { key: "dept_01", name: "🏛️ Ban Quản trị & Điều phối (#dept-01)" },
  { key: "dept_02", name: "💻 Khối Công nghệ AI (#dept-02)" },
  { key: "dept_03", name: "🎓 Khối Giáo dục & EdTech (#dept-03)" },
  { key: "dept_04", name: "💰 Khối Tài chính & Thuế (#dept-04)" },
  { key: "dept_05", name: "🎨 Khối Sáng tạo & n8n (#dept-05)" },
  { key: "dept_06", name: "📈 Khối Tiếp thị & CRM (#dept-06)" },
  { key: "dept_07", name: "⚙️ Khối Hạ tầng & SRE (#dept-07)" },
  { key: "dept_08", name: "🛡️ Khối An toàn & AI HR (#dept-08)" }
];

export default function CompanyChatPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_init",
      sender_type: "system",
      sender_name: "Autonomous Control Plane (NODE-01)",
      content: "Chào mừng Mr. Huy Technology AI đến với Hệ thống Chat Doanh nghiệp & Điều phối 63 AI. Toàn bộ 8 phòng ban và 63 AI Agent đã sẵn sàng tiếp nhận chỉ thị.",
      timestamp: "18:00:00"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Task creation form state
  const [taskForm, setTaskForm] = useState({
    assigned_to: "emp_01",
    title: "",
    scope: "",
    deadline: "2026-10-15T18:00",
    priority: "HIGH" as "CRITICAL" | "HIGH" | "NORMAL"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load voice registry & agent roster
  useEffect(() => {
    fetch("/src/data/voice_registry.json")
      .then((res) => {
        if (!res.ok) throw new Error("Fallback fetch");
        return res.json();
      })
      .catch(() => {
        return fetch("/api/voice/registry").then((r) => r.json());
      })
      .then((data) => {
        if (data?.voices) {
          const list = Object.values(data.voices) as Agent[];
          setAgents(list);
          if (list.length > 0) {
            setSelectedAgent(list[0]);
          }
        }
      })
      .catch((err) => console.error("Error loading agent voices:", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Play audio voice
  const handlePlayVoice = (text: string, agent_id?: string, msgId?: string) => {
    if (playingAudioId === msgId) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    const aid = agent_id || selectedAgent?.agent_id || "emp_01";
    // First try static sample if matches intro, else dynamic synthesize
    const dynamicUrl = `/api/voice/synthesize`;
    
    fetch(dynamicUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, agent_id: aid })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Synthesis failed");
        return res.blob();
      })
      .then((blob) => {
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setPlayingAudioId(msgId || "play");
          audioRef.current.onended = () => setPlayingAudioId(null);
        }
      })
      .catch((err) => {
        console.warn("Dynamic voice fallback to sample:", err);
        const sampleUrl = `/voices/samples/${aid}_intro.mp3`;
        if (audioRef.current) {
          audioRef.current.src = sampleUrl;
          audioRef.current.play();
          setPlayingAudioId(msgId || "play");
          audioRef.current.onended = () => setPlayingAudioId(null);
        }
      });
  };

  // Send human message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender_type: "human_gate",
      sender_name: "Mr. Huy Technology AI (Human Gate)",
      content: inputText,
      timestamp: new Date().toLocaleTimeString("vi-VN")
    };

    setMessages((prev) => [...prev, newMsg]);
    const promptText = inputText;
    setInputText("");

    // AI Reply Simulation / Ollama connection
    setTimeout(() => {
      const targetAgent = selectedAgent || agents[0];
      const replyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        sender_type: "ai_agent",
        sender_name: targetAgent ? `${targetAgent.display_name} (${targetAgent.job_title})` : "Mai Anh (Tổng điều phối)",
        agent_id: targetAgent?.agent_id || "emp_01",
        content: `Dạ báo cáo Mr. Huy, em đã tiếp nhận chỉ thị: "${promptText}". Hệ thống đang triển khai theo đúng ranh giới capability và bảo toàn trạng thái an toàn.`,
        timestamp: new Date().toLocaleTimeString("vi-VN")
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 800);
  };

  // Create & Dispatch Task
  const handleDispatchTask = () => {
    if (!taskForm.title) return;

    const assignedAgent = agents.find((a) => a.agent_id === taskForm.assigned_to) || agents[0];
    const taskId = `TASK-20261009-${taskForm.assigned_to.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTask: TaskItem = {
      task_id: taskId,
      assigned_to: taskForm.assigned_to,
      agent_name: assignedAgent?.display_name || "Mai Anh",
      title: taskForm.title,
      scope: taskForm.scope || `Worktree: /mnt/data1/HUY-AI/workspaces/${taskForm.assigned_to}`,
      deadline: taskForm.deadline,
      priority: taskForm.priority,
      status: "running"
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsTaskModalOpen(false);

    // Add receipt message into chat thread
    const taskMsg: Message = {
      id: `msg_task_${Date.now()}`,
      sender_type: "system",
      sender_name: "Task Broker v2.0 (NODE-01)",
      content: `🎯 **ĐÃ GIAO NHIỆM VỤ THÀNH CÔNG:** Mã nhiệm vụ \`${taskId}\`\n- **Người phụ trách:** **${assignedAgent?.display_name}** (\`${taskForm.assigned_to}\`)\n- **Tiêu đề:** ${taskForm.title}\n- **Phạm vi:** ${newTask.scope}\n- **Hạn chót:** ${taskForm.deadline}\n- **Mức ưu tiên:** \`${taskForm.priority}\`\n- **Trạng thái:** \`RUNNING (Đang thực thi)\``,
      timestamp: new Date().toLocaleTimeString("vi-VN"),
      task_id: taskId
    };

    setMessages((prev) => [...prev, taskMsg]);

    // Simulate task completion after 4 seconds
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.task_id === taskId ? { ...t, status: "completed" } : t))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_done_${Date.now()}`,
          sender_type: "ai_agent",
          sender_name: `${assignedAgent?.display_name} (${assignedAgent?.job_title})`,
          agent_id: taskForm.assigned_to,
          content: `✅ Báo cáo Mr. Huy, nhiệm vụ \`${taskId}\` đã hoàn thành 100% GREEN. Dữ liệu kiểm thử đã dọn dẹp sạch sẽ (residual=0) và báo cáo đã lưu tại thư mục chính phòng ban.`,
          timestamp: new Date().toLocaleTimeString("vi-VN")
        }
      ]);
    }, 4500);

    setTaskForm({
      assigned_to: "emp_01",
      title: "",
      scope: "",
      deadline: "2026-10-15T18:00",
      priority: "HIGH"
    });
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <audio ref={audioRef} className="hidden" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/admincenter"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về AdminCenter
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Chat Doanh Nghiệp & Điều Phối 63 AI
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  NODE-01 Live
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Thẩm quyền điều khiển tối cao: <strong>Mr. Huy Technology AI (Human Gate)</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Giao Nhiệm Vụ Mới
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Channels & Agent Roster */}
        <aside className="w-80 border-r border-white/10 bg-slate-900/50 flex flex-col">
          {/* Channels Section */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Kênh Trao Đổi
            </h2>
            <div className="space-y-1">
              {DEPARTMENTS.slice(0, 3).map((dept) => (
                <button
                  key={dept.key}
                  onClick={() => {
                    setSelectedChannel(dept.key);
                    setSelectedAgent(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                    selectedChannel === dept.key && !selectedAgent
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{dept.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 63 AI Agent Direct Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                63 Nhân Sự AI ({agents.length})
              </span>
            </div>

            <div className="p-2 border-b border-white/10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân sự, chức danh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredAgents.map((agent) => (
                <button
                  key={agent.agent_id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setSelectedChannel(agent.agent_id);
                  }}
                  className={`w-full p-2 rounded-lg text-left flex items-center gap-2.5 transition-all ${
                    selectedAgent?.agent_id === agent.agent_id
                      ? "bg-emerald-500/20 border border-emerald-500/40 shadow-sm"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/20 bg-slate-800">
                    <img
                      src={`/assets/workforce/${agent.agent_id}.jpg`}
                      alt={agent.display_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">{agent.display_name}</p>
                      <span className="text-[9px] text-slate-400 font-mono">{agent.agent_id}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{agent.job_title}</p>
                    <p className="text-[9px] text-emerald-400/80 truncate">🎙️ {agent.region}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Middle: Chat Workspace */}
        <main className="flex-1 flex flex-col bg-slate-950">
          {/* Thread Header */}
          <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-slate-900/30">
            <div className="flex items-center gap-3">
              {selectedAgent ? (
                <>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40">
                    <img
                      src={`/assets/workforce/${selectedAgent.agent_id}.jpg`}
                      alt={selectedAgent.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-2">
                      {selectedAgent.display_name}
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {selectedAgent.agent_id}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {selectedAgent.job_title} • {selectedAgent.department} • 🎙️ {selectedAgent.region} ({selectedAgent.style})
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="text-xs font-bold text-white">Kênh Toàn Công Ty (#all-workforce)</h2>
                  <p className="text-[11px] text-slate-400">Toàn bộ 63 nhân sự AI đang lắng nghe chỉ thị</p>
                </div>
              )}
            </div>

            {selectedAgent && (
              <button
                onClick={() => handlePlayVoice(selectedAgent.style, selectedAgent.agent_id, "header_voice")}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Nghe Demo Giọng
              </button>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender_type === "human_gate" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                    msg.sender_type === "human_gate"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30"
                      : msg.sender_type === "system"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-slate-800 border border-white/20 text-slate-200"
                  }`}
                >
                  {msg.sender_type === "human_gate" ? "H" : msg.sender_type === "system" ? "⚙️" : "AI"}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 leading-relaxed ${
                    msg.sender_type === "human_gate"
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-tr-none"
                      : msg.sender_type === "system"
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 w-full"
                      : "bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-300">{msg.sender_name}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.sender_type === "ai_agent" && (
                    <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                      <button
                        onClick={() => handlePlayVoice(msg.content, msg.agent_id, msg.id)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        {playingAudioId === msg.id ? "Đang phát..." : "Phát giọng nói"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-white/10 bg-slate-900/40">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <input
                type="text"
                placeholder={
                  selectedAgent
                    ? `Chỉ đạo cho ${selectedAgent.display_name}... (Ví dụ: @${selectedAgent.agent_id} hãy kiểm tra hệ thống...)`
                    : "Gõ yêu cầu gửi tới toàn công ty..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Active Task Queue */}
        <aside className="w-80 border-l border-white/10 bg-slate-900/50 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Nhiệm Vụ Đang Chạy ({tasks.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {tasks.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl">
                <Briefcase className="w-6 h-6 text-slate-500 mb-2" />
                <p className="text-xs text-slate-400 font-medium">Chưa có nhiệm vụ nào được giao</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Bấm &quot;Giao Nhiệm Vụ Mới&quot; để phân bổ việc cho 63 AI
                </p>
              </div>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.task_id}
                  className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      {t.task_id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        t.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-white">{t.title}</p>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <p>👤 Người phụ trách: <strong>{t.agent_name}</strong></p>
                    <p>🎯 Hạn chót: {t.deadline}</p>
                    <p>⚡ Ưu tiên: <span className="text-amber-400 font-bold">{t.priority}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Giao Nhiệm Vụ Mới Cho Nhân Sự AI
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chọn Nhân Sự Chịu Trách Nhiệm</label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {agents.map((a) => (
                    <option key={a.agent_id} value={a.agent_id}>
                      {a.display_name} ({a.agent_id}) — {a.job_title} [{a.department}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tiêu Đề / Mục Tiêu Nhiệm Vụ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kiểm toán bảo mật hệ thống, Viết bài blog SEO..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phạm Vi / Thư Mục Làm Việc (Worktree Scope)</label>
                <input
                  type="text"
                  placeholder="Mặc định: /mnt/data1/HUY-AI/workspaces/{agent_id}"
                  value={taskForm.scope}
                  onChange={(e) => setTaskForm({ ...taskForm, scope: e.target.value })}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mức Độ Ưu Tiên</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setTaskForm({ ...taskForm, priority: e.target.value as "CRITICAL" | "HIGH" | "NORMAL" })
                    }
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Khẩn cấp)</option>
                    <option value="HIGH">🟡 HIGH (Cao)</option>
                    <option value="NORMAL">🟢 NORMAL (Bình thường)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hạn Chót Hoàn Thành</label>
                  <input
                    type="datetime-local"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                  </input>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDispatchTask}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                Xác Nhận & Giao Việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
