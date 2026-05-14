"use client";

import { useState } from "react";
import { Sparkles, Upload, FileJson, CheckCircle2, AlertTriangle, Zap, Loader2, Award, ChevronRight } from "lucide-react";

interface BottleneckItem {
  node: string;
  issue: string;
}

interface GradingResult {
  score: number;
  status: string;
  bottlenecks: BottleneckItem[];
  optimizations: string[];
  feedbackSummary: string;
}

export function WorkflowAutoGrader() {
  const [platform, setPlatform] = useState<"n8n" | "make">("n8n");
  const [jsonContent, setJsonContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedXp, setClaimedXp] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setJsonContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!jsonContent.trim()) {
      setError("Vui lòng dán mã JSON kịch bản hoặc tải lên tệp workflow của bạn.");
      return;
    }

    // Kiểm tra định dạng JSON hợp lệ ở client trước
    try {
      JSON.parse(jsonContent);
    } catch {
      setError("Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại mã xuất từ nền tảng.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setIsFallback(false);
    setClaimedXp(false);

    try {
      const res = await fetch("/api/auto-grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowContent: jsonContent, platformType: platform }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể phân tích kịch bản. Vui lòng thử lại.");

      setResult(data.result);
      if (data.isFallback) {
        setIsFallback(true);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi đường truyền kết nối AI Grader.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClaimReward = () => {
    setClaimedXp(true);
    // Lưu điểm vào LocalStorage làm Streak XP
    const currentXp = parseInt(localStorage.getItem("user_xp_score") || "0", 10);
    localStorage.setItem("user_xp_score", (currentXp + 50).toString());
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden mt-8 animate-fade-in">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-cyan-400" /> Tự Động Hóa Thực Chiến
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Trợ Lý AI Chấm Điểm Kịch Bản Workflow
          </h2>
          <p className="text-xs text-foreground/60 mt-0.5 max-w-xl">
            Tải lên kịch bản JSON xuất từ Make.com hoặc n8n. Bộ não AI sẽ phân tích cây cú pháp (AST), chỉ ra các bước dư thừa gây tốn Task/Credit và chấm điểm logic chuẩn kỹ sư.
          </p>
        </div>

        {/* Platform Switcher */}
        <div className="flex bg-surface/80 p-1 rounded-xl border border-white/5 shrink-0">
          <button
            type="button"
            onClick={() => setPlatform("n8n")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platform === "n8n" ? "bg-secondary text-black shadow-md" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            n8n.io
          </button>
          <button
            type="button"
            onClick={() => setPlatform("make")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              platform === "make" ? "bg-purple-600 text-white shadow-md" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            Make.com
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="relative z-10 space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground/70 block mb-2 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-secondary" />
              <span>Dán mã cấu hình JSON hoặc kéo thả file:</span>
            </span>
            {jsonContent && (
              <button
                type="button"
                onClick={() => setJsonContent("")}
                className="text-[10px] text-red-400 hover:underline cursor-pointer font-normal"
              >
                Xóa nội dung
              </button>
            )}
          </label>

          <div className="relative">
            <textarea
              rows={6}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`{\n  "nodes": [\n    { "parameters": {}, "name": "Webhook Trigger", "type": "n8n-nodes-base.webhook" }\n  ],\n  "connections": {}\n}`}
              className="w-full bg-background/80 border border-white/10 rounded-2xl p-4 text-xs font-mono text-foreground/80 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20 transition-all resize-y custom-scrollbar leading-relaxed"
            />

            {/* Quick Upload Action trigger */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface/80 border border-white/5 rounded-xl text-[11px] font-bold text-foreground/80 cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5 text-secondary" />
                <span>Tải File .json</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Action Activation Button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !jsonContent}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-secondary hover:from-cyan-600 hover:to-secondary/90 text-black font-extrabold rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>AI Đang Rà Soát Cấu Trúc AST...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>🤖 AI Phân Tích &amp; Chấm Điểm Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Presentation */}
      {result && (
        <div className="relative z-10 space-y-6 pt-6 border-t border-white/5 animate-slide-up">
          {isFallback && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Hệ thống hiển thị <strong>Kết quả Rà soát Mô hình Mẫu</strong> được huấn luyện cho MMO Automation (Do máy chủ thiếu API Key thực tế).</span>
            </div>
          )}

          {/* Top Result Strip: Score Gauge & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/40 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Radial Gauge Visualized */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/5"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={result.score >= 90 ? "text-secondary" : result.score >= 70 ? "text-amber-400" : "text-rose-400"}
                    strokeDasharray={`${result.score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black font-mono leading-none">{result.score}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Đánh giá độ tối ưu</div>
                <div className={`text-base font-black ${result.score >= 90 ? "text-secondary" : "text-amber-400"}`}>
                  {result.status}
                </div>
              </div>
            </div>

            {/* Gamification claim rewards if scored above 80 */}
            {result.score >= 80 && (
              <div className="shrink-0 w-full sm:w-auto text-center sm:text-right">
                {claimedXp ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" /> Đã nhận +50 XP Hoàn thành
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaimReward}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 text-black font-extrabold rounded-xl text-xs hover:scale-105 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer animate-bounce"
                  >
                    <Award className="w-4 h-4" /> Nhận +50 XP Thực chiến
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-secondary">
              💡 Lời khuyên tối ưu tổng quan
            </h4>
            <p className="text-xs text-foreground/80 leading-relaxed bg-background/50 p-4 rounded-xl border border-white/5 italic">
              &ldquo;{result.feedbackSummary}&rdquo;
            </p>
          </div>

          {/* Bottlenecks detected breakdown list */}
          {result.bottlenecks && result.bottlenecks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Nút thắt / Rủi ro trễ kịch bản (Bottlenecks)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.bottlenecks.map((btn, i) => (
                  <div key={i} className="bg-surface/30 p-3 rounded-xl border border-red-500/20 space-y-1">
                    <div className="text-xs font-bold text-foreground/90 font-mono text-cyan-400">
                      ⚡ Node: {btn.node}
                    </div>
                    <p className="text-[11px] text-foreground/70 leading-relaxed">{btn.issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimization guidelines items */}
          {result.optimizations && result.optimizations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Giải pháp tiết kiệm Task &amp; Tăng tốc độ
              </h4>
              <div className="space-y-2">
                {result.optimizations.map((opt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 bg-surface/50 p-2.5 rounded-xl border border-white/5">
                    <ChevronRight className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
