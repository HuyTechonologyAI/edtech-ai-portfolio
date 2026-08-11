"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, CheckCircle2, Circle, ArrowRight, Zap, Trophy, 
  Clock, Award, Layers, Bot, Cpu, GitBranch, ChevronRight, X, Play, RefreshCw, BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";

interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  category: "foundation" | "prompts" | "nocode" | "n8n" | "agents";
  categoryLabel: string;
  description: string;
  outcomes: string[];
  tools: { name: string; bg: string; text: string }[];
  duration: string;
  rewardPoints: number;
  difficulty: "Nhập môn" | "Trung cấp" | "Chuyên sâu" | "Master";
  actionUrl: string;
  actionText: string;
  defaultStatus: "completed" | "current" | "upcoming";
}

const STAGES: RoadmapStage[] = [
  {
    id: "stage-1",
    stageNumber: 1,
    title: "Tư Duy Hệ Thống & Nhập Môn AI",
    subtitle: "Hiểu bản chất LLMs & Phân tích nút thắt quy trình",
    category: "foundation",
    categoryLabel: "Nền Tảng AI",
    description: "Nắm vững nguyên lý hoạt động của Generative AI, cách AI biến đổi quy trình công việc và phương pháp xác định điểm tự động hóa có ROI cao nhất cho cá nhân & doanh nghiệp.",
    outcomes: [
      "Hiểu cấu trúc hoạt động của LLMs (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5)",
      "Phân tích & bản đồ hóa 100% quy trình làm việc hiện tại",
      "Xác định 5 nhiệm vụ lặp lại gây lãng phí 80% thời gian",
      "Thiết lập tư duy Co-Pilot: Coi AI là nhân sự ảo cấp cao"
    ],
    tools: [
      { name: "ChatGPT", bg: "bg-emerald-500/10", text: "text-emerald-400" },
      { name: "Claude 3.5", bg: "bg-amber-500/10", text: "text-amber-400" },
      { name: "Perplexity", bg: "bg-cyan-500/10", text: "text-cyan-400" }
    ],
    duration: "1 Tuần (10h)",
    rewardPoints: 50,
    difficulty: "Nhập môn",
    actionUrl: "/resources",
    actionText: "Khám Phá Tài Liệu Giai Đoạn 1",
    defaultStatus: "completed"
  },
  {
    id: "stage-2",
    stageNumber: 2,
    title: "Làm Chủ Prompt Engineering & Custom GPTs",
    subtitle: "Kỹ thuật giao tiếp chuẩn xác x10 hiệu suất làm việc",
    category: "prompts",
    categoryLabel: "Prompt Engineering",
    description: "Luyện tập kỹ thuật viết Prompt cấu trúc (System Prompt, Few-Shot, Chain-of-Thought). Tự xây dựng trợ lý AI riêng đóng gói quy trình nhân sự, marketing, viết code.",
    outcomes: [
      "Viết Prompt cấu trúc theo khung CLEAR & Persona-Task-Context",
      "Xây dựng thư viện 50+ Super Prompts độc quyền cho doanh nghiệp",
      "Tạo Custom GPTs / Claude Project tích hợp file tri thức riêng",
      "Tự động hóa viết Content, Email Marketing & Phân tích dữ liệu"
    ],
    tools: [
      { name: "Prompting", bg: "bg-purple-500/10", text: "text-purple-400" },
      { name: "Custom GPTs", bg: "bg-emerald-500/10", text: "text-emerald-400" },
      { name: "Midjourney", bg: "bg-blue-500/10", text: "text-blue-400" }
    ],
    duration: "2 Tuần (20h)",
    rewardPoints: 80,
    difficulty: "Trung cấp",
    actionUrl: "/quiz",
    actionText: "Thử Thách Bài Kiểm Tra Prompting",
    defaultStatus: "current"
  },
  {
    id: "stage-3",
    stageNumber: 3,
    title: "Tự Động Hóa Business No-Code (Make & Zapier)",
    subtitle: "Kết nối hệ thống phần mềm không cần viết code",
    category: "nocode",
    categoryLabel: "No-Code Automation",
    description: "Xây dựng các kịch bản tự động hóa luân chuyển dữ liệu tự động giữa Google Sheets, Gmail, Facebook Lead Ads, Zalo OA và Telegram Bot.",
    outcomes: [
      "Làm chủ giao diện & logic trigger/action trên Make.com",
      "Tự động đồng bộ Lead từ Fanpage/Form vào CRM & Zalo",
      "Gửi Email chào mừng & Báo cáo doanh thu hàng ngày tự động",
      "Bẫy lỗi & Xử lý sự cố luồng dữ liệu tự động"
    ],
    tools: [
      { name: "Make.com", bg: "bg-purple-500/10", text: "text-purple-400" },
      { name: "Zapier", bg: "bg-orange-500/10", text: "text-orange-400" },
      { name: "Google API", bg: "bg-blue-500/10", text: "text-blue-400" }
    ],
    duration: "2 Tuần (25h)",
    rewardPoints: 100,
    difficulty: "Trung cấp",
    actionUrl: "/videos",
    actionText: "Xem Video Hướng Dẫn Make.com",
    defaultStatus: "upcoming"
  },
  {
    id: "stage-4",
    stageNumber: 4,
    title: "Tự Động Hóa Chuyên Sâu Với n8n Self-Hosted",
    subtitle: "Làm chủ hạ tầng mã nguồn mở & Tối ưu 90% chi phí",
    category: "n8n",
    categoryLabel: "n8n Self-Hosted",
    description: "Triển khai n8n trên VPS riêng (Docker/Cloud). Xử lý luồng dữ liệu cực lớn, cấu hình Webhook bảo mật và gọi REST APIs tùy biến phức tạp.",
    outcomes: [
      "Deploy n8n Server riêng trên VPS Docker (Tiết kiệm hàng triệu/tháng)",
      "Xây dựng kịch bản Webhook biến đổi dữ liệu JSON phức tạp",
      "Tích hợp Database PostgreSQL/Supabase lưu trữ lịch sử tự động",
      "Cấu hình tự động gửi thông báo Telegram Bot khi có lỗi"
    ],
    tools: [
      { name: "n8n", bg: "bg-red-500/10", text: "text-red-400" },
      { name: "Docker", bg: "bg-blue-500/10", text: "text-blue-400" },
      { name: "REST API", bg: "bg-emerald-500/10", text: "text-emerald-400" }
    ],
    duration: "3 Tuần (30h)",
    rewardPoints: 150,
    difficulty: "Chuyên sâu",
    actionUrl: "/resources",
    actionText: "Tải 50+ Template n8n Mẫu",
    defaultStatus: "upcoming"
  },
  {
    id: "stage-5",
    stageNumber: 5,
    title: "Xây Dựng Autonomous AI Agents & Vector RAG",
    subtitle: "Kết hợp AI & Automation tạo Trợ lý tự vận hành VIP",
    category: "agents",
    categoryLabel: "Autonomous AI Agents",
    description: "Đỉnh cao ứng dụng: Tạo ra các AI Agents có khả năng tự động đọc cơ sở dữ liệu doanh nghiệp (RAG Vector Search), ra quyết định đa bước và tự vận hành CSKH 24/7.",
    outcomes: [
      "Triển khai RAG Knowledge Base với Supabase Vector & Embeddings",
      "Xây dựng AI Agent đọc hiểu Email, tự soạn câu trả lời & gửi",
      "Tạo Bot CSKH thông minh tra cứu tồn kho & tạo đơn tự động",
      "Tích hợp AI Auto-Grader chấm điểm bài tập học viên tự động"
    ],
    tools: [
      { name: "AI Agents", bg: "bg-amber-500/10", text: "text-amber-400" },
      { name: "Vector DB", bg: "bg-cyan-500/10", text: "text-cyan-400" },
      { name: "LangChain", bg: "bg-emerald-500/10", text: "text-emerald-400" }
    ],
    duration: "4 Tuần (40h)",
    rewardPoints: 200,
    difficulty: "Master",
    actionUrl: "/checkout?plan=vip",
    actionText: "Mở Khóa Lộ Trình VIP Mastermind",
    defaultStatus: "upcoming"
  }
];

export default function RoadmapPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [userStatuses, setUserStatuses] = useState<Record<string, "completed" | "current" | "upcoming">>({});
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null);

  // Nạp tiến độ học tập từ LocalStorage
  useEffect(() => {
    const cached = localStorage.getItem("custom_roadmap_progress");
    if (cached) {
      try {
        setUserStatuses(JSON.parse(cached));
      } catch {}
    } else {
      const initial: Record<string, "completed" | "current" | "upcoming"> = {};
      STAGES.forEach(s => { initial[s.id] = s.defaultStatus; });
      setUserStatuses(initial);
    }
  }, []);

  // Cập nhật trạng thái tiến độ
  const updateStageStatus = (stageId: string, status: "completed" | "current" | "upcoming") => {
    const updated = { ...userStatuses, [stageId]: status };
    setUserStatuses(updated);
    localStorage.setItem("custom_roadmap_progress", JSON.stringify(updated));
    if (selectedStage && selectedStage.id === stageId) {
      setSelectedStage({ ...selectedStage, defaultStatus: status });
    }
  };

  // Tính toán chỉ số tổng quan
  const completedCount = STAGES.filter(s => (userStatuses[s.id] || s.defaultStatus) === "completed").length;
  const currentCount = STAGES.filter(s => (userStatuses[s.id] || s.defaultStatus) === "current").length;
  const progressPercent = Math.round((completedCount / STAGES.length) * 100);
  const totalEarnedPoints = STAGES
    .filter(s => (userStatuses[s.id] || s.defaultStatus) === "completed")
    .reduce((acc, s) => acc + s.rewardPoints, 0);

  const filteredStages = activeTab === "all" 
    ? STAGES 
    : STAGES.filter(s => s.category === activeTab);

  return (
    <main className="flex-1 py-12 md:py-20 bg-background relative overflow-hidden animate-fade-in">
      {/* Dynamic Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-secondary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-6xl mx-auto space-y-12 relative z-10">

        {/* ─── 1. Header Section ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,133,0.15)]">
            <Cpu className="w-4 h-4 animate-pulse" /> Sơ Đồ Biểu Đồ Kỹ Thuật Số Interactive Roadmap
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Lộ Trình <span className="text-secondary neon-glow-text">Master AI &amp; Automation</span>
          </h1>

          <p className="text-foreground/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Hành trình 5 giai đoạn được thiết kế dạng <strong className="text-foreground">Sơ đồ năng lực đa chiều</strong>. Làm chủ từng nút mốc kỹ năng để tự tay xây dựng hệ thống tự động hóa doanh nghiệp thực chiến.
          </p>
        </div>

        {/* ─── 2. Dashboard Tracker Bar ─── */}
        <div className="rounded-3xl bg-surface/70 backdrop-blur-xl border border-white/10 p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            
            {/* Tiến độ tổng quan */}
            <div className="space-y-2 col-span-2 md:col-span-1 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4">
              <div className="flex justify-between text-xs font-bold text-foreground/60">
                <span>Tiến độ hoàn thành</span>
                <span className="text-secondary font-mono font-black">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-secondary to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,133,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-foreground/40 font-mono">
                {completedCount}/{STAGES.length} giai đoạn đã mở khóa
              </p>
            </div>

            {/* Điểm tích lũy */}
            <div className="flex items-center gap-3 border-r border-white/5 pr-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-wider block">Point Đã Nhận</span>
                <span className="text-xl font-black text-amber-400 font-mono">+{totalEarnedPoints} Pts</span>
              </div>
            </div>

            {/* Thời lượng dự kiến */}
            <div className="flex items-center gap-3 border-r border-white/5 pr-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-wider block">Thời Gian Lộ Trình</span>
                <span className="text-xl font-black text-cyan-300 font-mono">12 Tuần</span>
              </div>
            </div>

            {/* Đang học */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-wider block">Trạng Thái Hiện Tại</span>
                <span className="text-sm font-bold text-purple-300">
                  {currentCount > 0 ? `Đang học chặng ${STAGES.find(s => (userStatuses[s.id] || s.defaultStatus) === 'current')?.stageNumber || 2}` : "Đã hoàn thành xuất sắc!"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ─── 3. Filter Category Pills ─── */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {[
            { id: "all", label: "Tất Cả 5 Giai Đoạn", icon: GitBranch },
            { id: "foundation", label: "Nền Tảng AI", icon: Cpu },
            { id: "prompts", label: "Prompting", icon: Sparkles },
            { id: "nocode", label: "Make / No-Code", icon: Layers },
            { id: "n8n", label: "n8n Pro", icon: BarChart2 },
            { id: "agents", label: "AI Agents VIP", icon: Bot },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-secondary text-black shadow-[0_0_20px_rgba(0,255,133,0.4)] scale-105"
                    : "bg-surface/60 hover:bg-surface text-foreground/60 hover:text-foreground border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── 4. Cyber Interactive Flowchart Node Graph ─── */}
        <div className="relative space-y-8 py-4">

          {/* SVG Central Glowing Connecting Cable (Line) */}
          <div className="absolute left-6 md:left-1/2 top-10 bottom-10 -translate-x-1/2 w-1 pointer-events-none hidden md:block">
            <div className="h-full w-full bg-gradient-to-b from-emerald-500 via-secondary to-cyan-500 opacity-20 rounded-full" />
            <div className="absolute top-0 left-0 w-full h-full bg-secondary shadow-[0_0_15px_rgba(0,255,133,0.8)] animate-pulse rounded-full opacity-40" />
          </div>

          {filteredStages.map((stage, index) => {
            const status = userStatuses[stage.id] || stage.defaultStatus;
            const isCompleted = status === "completed";
            const isCurrent = status === "current";
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                } gap-6 md:gap-12 group`}
              >
                {/* Central Node Circle Connector */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl ${
                      isCompleted
                        ? "bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.6)] border-2 border-emerald-300"
                        : isCurrent
                        ? "bg-secondary text-black shadow-[0_0_30px_rgba(0,255,133,0.8)] border-2 border-white animate-bounce"
                        : "bg-surface border-2 border-white/10 text-foreground/40 hover:border-secondary/50"
                    }`}
                    title="Bấm để xem chi tiết chặng này"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : isCurrent ? (
                      <span className="font-black text-lg font-mono">0{stage.stageNumber}</span>
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  {/* Energy Pulse Ring for Current Active Node */}
                  {isCurrent && (
                    <span className="absolute inline-flex h-20 w-20 rounded-2xl bg-secondary/30 animate-ping pointer-events-none -z-10" />
                  )}
                </div>

                {/* Node Main Content Card */}
                <div className="w-full md:w-[calc(50%-3rem)] pl-16 md:pl-0">
                  <TiltCard>
                    <div 
                      onClick={() => setSelectedStage(stage)}
                      className={`glass-panel gradient-border-card p-6 md:p-8 rounded-3xl transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-2xl ${
                        isCurrent
                          ? "border-secondary/60 bg-gradient-to-br from-secondary/10 via-surface/90 to-surface shadow-[0_0_40px_rgba(0,255,133,0.15)]"
                          : isCompleted
                          ? "border-emerald-500/30 bg-surface/80"
                          : "border-white/5 bg-surface/50 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-wider font-mono ${
                            isCompleted ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            isCurrent ? "bg-secondary/20 text-secondary border-secondary/40 animate-pulse" :
                            "bg-white/5 text-foreground/40 border-white/10"
                          }`}>
                            Giai Đoạn {stage.stageNumber}
                          </span>

                          <span className="text-[10px] font-bold text-foreground/50 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
                            {stage.difficulty}
                          </span>
                        </div>

                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0 font-mono">
                          +{stage.rewardPoints} Pts
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-xl md:text-2xl font-black text-foreground group-hover:text-secondary transition-colors mb-1">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-foreground/50 font-medium mb-4">
                        {stage.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-xs md:text-sm text-foreground/70 leading-relaxed mb-5 line-clamp-2">
                        {stage.description}
                      </p>

                      {/* Tools Tag List */}
                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {stage.tools.map((t, tIdx) => (
                            <span key={tIdx} className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${t.bg} ${t.text} font-mono`}>
                              {t.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-secondary font-bold group-hover:translate-x-1 transition-transform">
                          <span>Chi Tiết</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>

                {/* Empty Balancing Spacer for Alternating Flowchart */}
                <div className="hidden md:block w-[calc(50%-3rem)]" />
              </motion.div>
            );
          })}

        </div>

        {/* ─── 5. Stage Detail Drawer Modal ─── */}
        <AnimatePresence>
          {selectedStage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStage(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 bg-secondary text-black rounded-full font-mono">
                        CHẶNG {selectedStage.stageNumber}
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                        +{selectedStage.rewardPoints} Points Thưởng
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground">
                      {selectedStage.title}
                    </h2>
                    <p className="text-xs text-foreground/50">
                      {selectedStage.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedStage(null)}
                    className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/80 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
                  {selectedStage.description}
                </p>

                {/* Key Outcomes Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-secondary" /> Kỹ Năng &amp; Kết Quả Đầu Ra Thực Chiến
                  </h4>

                  <div className="space-y-2">
                    {selectedStage.outcomes.map((out, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-2.5 text-xs text-foreground/90 p-2.5 rounded-xl bg-surface/50 border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{out}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change Status Selector */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider block">
                    Đánh Dấu Tiến Độ Học Tập Của Bạn:
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateStageStatus(selectedStage.id, "upcoming")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        (userStatuses[selectedStage.id] || selectedStage.defaultStatus) === "upcoming"
                          ? "bg-white/10 text-white border-white/30"
                          : "bg-surface/40 text-foreground/40 border-white/5 hover:text-foreground"
                      }`}
                    >
                      Chưa Học
                    </button>
                    <button
                      onClick={() => updateStageStatus(selectedStage.id, "current")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        (userStatuses[selectedStage.id] || selectedStage.defaultStatus) === "current"
                          ? "bg-secondary text-black border-secondary shadow-[0_0_15px_rgba(0,255,133,0.4)]"
                          : "bg-surface/40 text-foreground/40 border-white/5 hover:text-foreground"
                      }`}
                    >
                      🔥 Đang Học
                    </button>
                    <button
                      onClick={() => updateStageStatus(selectedStage.id, "completed")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        (userStatuses[selectedStage.id] || selectedStage.defaultStatus) === "completed"
                          ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "bg-surface/40 text-foreground/40 border-white/5 hover:text-foreground"
                      }`}
                    >
                      ✅ Đã Xong
                    </button>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-foreground/50 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Thời lượng: {selectedStage.duration}</span>
                  </div>

                  <Link
                    href={selectedStage.actionUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-black font-extrabold hover:bg-secondary/90 shadow-[0_0_20px_rgba(0,255,133,0.4)] transition-all hover:scale-105"
                  >
                    <span>{selectedStage.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── 6. Bottom CTA Section ─── */}
        <div className="rounded-3xl bg-gradient-to-r from-secondary/10 via-surface to-emerald-500/10 p-8 border border-secondary/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black text-foreground">
            Sẵn Sàng Bứt Phá Trở Thành <span className="text-secondary neon-glow-text">AI &amp; Automation Master</span>?
          </h2>
          <p className="text-xs md:text-sm text-foreground/70 max-w-xl mx-auto">
            Bắt đầu hành trình từ Giai đoạn 1 ngay hôm nay. Tích lũy Points đổi các Khóa học Premium hoàn toàn miễn phí.
          </p>
          <div className="pt-2 flex justify-center gap-4 flex-wrap">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-secondary text-black font-extrabold hover:bg-secondary/90 shadow-[0_0_25px_rgba(0,255,133,0.4)] transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Học Ngay</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-secondary/40 text-secondary font-extrabold hover:bg-secondary/10 transition-all"
            >
              <span>Xem Gói Dịch Vụ Pro</span>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
