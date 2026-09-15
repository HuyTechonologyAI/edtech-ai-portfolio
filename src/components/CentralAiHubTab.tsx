"use client";

import { useState } from "react";
import { 
  Cpu, 
  Sparkles, 
  Presentation, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Server, 
  Code2, 
  Download, 
  Play, 
  AlertTriangle, 
  Globe2, 
  CheckCircle2, 
  Terminal, 
  Bot,
  Flame,
  ArrowRight
} from "lucide-react";
import { OPEN_SOURCE_AI_TOOLS, OpenSourceAITool } from "@/lib/ai-tools-registry";

export default function CentralAiHubTab() {
  const [activeSubTab, setActiveSubTab] = useState<"studio" | "tools" | "quota" | "ecosystem">("studio");

  // Studio Form State
  const [topic, setTopic] = useState("Công nghệ 10 - Bài 1: Khoa học, kỹ thuật và công nghệ");
  const [subject, setSubject] = useState("Công nghệ - Kỹ thuật");
  const [duration, setDuration] = useState("45 phút");
  const [targetAudience, setTargetAudience] = useState("Học sinh THPT & Giáo viên");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [studioResult, setStudioResult] = useState<any | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"slide" | "lesson" | "image" | "voice" | "video" | "avatar">("slide");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quota & Gateway Test State
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [testLog, setTestLog] = useState<any | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGenerateStudio = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_studio_package",
          lessonTopic: topic,
          subject,
          duration,
          targetAudience
        })
      });
      const data = await res.json();
      if (data.success && data.package) {
        setStudioResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestQuotaFailover = async () => {
    setIsTestingGateway(true);
    setTestLog(null);
    try {
      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completion",
          prompt: "Kiểm tra tính sẵn sàng của hệ sinh thái AI Hub Huy Technology AI. Hãy phản hồi ngắn gọn 1 câu chào mừng.",
          systemPrompt: "Hệ thống kiểm định chịu tải Gateway trung tâm."
        })
      });
      const data = await res.json();
      setTestLog(data);
    } catch (e: any) {
      setTestLog({ error: e?.message });
    } finally {
      setIsTestingGateway(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-secondary/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-[0_0_50px_rgba(0,255,133,0.06)]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Huy Technology AI Orchestrator
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Trung Tâm Điều Phối AI Đa Nền Tảng <span className="text-secondary neon-glow-text">(AI Central Hub)</span>
            </h2>
            <p className="text-foreground/70 text-sm max-w-3xl">
              Hệ thống kết nối liên thông <strong>14 công cụ AI mã nguồn mở</strong> chuyên sâu (Slide, Hình ảnh, Video, Giọng nói) cùng 
              cơ chế <strong>Chống Hết Quota Tự Động (Auto-Failover Multi-Provider)</strong> phục vụ đồng bộ cho cả 3 nền tảng: 
              <span className="text-cyan-400"> EduViet</span>, <span className="text-amber-400">SmartTax AI</span> và <span className="text-secondary">AI & AutoExpert</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Gateway Sẵn Sàng 100%</span>
            </div>
            <button
              onClick={handleTestQuotaFailover}
              disabled={isTestingGateway}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-black text-xs font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingGateway ? "animate-spin" : ""}`} />
              Kiểm Tra Tải & Quota
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-border/40 pt-4">
          <button
            onClick={() => setActiveSubTab("studio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "studio"
                ? "bg-secondary text-black shadow-[0_0_15px_rgba(0,255,133,0.3)]"
                : "bg-surface/50 text-foreground/70 hover:text-foreground hover:bg-surface"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Studio Điều Phối 1-Chạm</span>
          </button>
          <button
            onClick={() => setActiveSubTab("tools")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "tools"
                ? "bg-secondary text-black shadow-[0_0_15px_rgba(0,255,133,0.3)]"
                : "bg-surface/50 text-foreground/70 hover:text-foreground hover:bg-surface"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cụm 14 Công Cụ Mở ({OPEN_SOURCE_AI_TOOLS.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("quota")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "quota"
                ? "bg-secondary text-black shadow-[0_0_15px_rgba(0,255,133,0.3)]"
                : "bg-surface/50 text-foreground/70 hover:text-foreground hover:bg-surface"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Chống Hết Quota & Cân Bằng Tải</span>
          </button>
          <button
            onClick={() => setActiveSubTab("ecosystem")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "ecosystem"
                ? "bg-secondary text-black shadow-[0_0_15px_rgba(0,255,133,0.3)]"
                : "bg-surface/50 text-foreground/70 hover:text-foreground hover:bg-surface"
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Cổng Kết Nối Hệ Sinh Thái (API)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STUDIO ĐIỀU PHỐI 1-CHẠM */}
      {activeSubTab === "studio" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Config Left Panel */}
            <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-border/60 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Bot className="w-4 h-4 text-secondary" /> Cấu hình đề bài học liệu
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-foreground/60 font-semibold mb-1">Chủ đề bài học / Nội dung:</label>
                  <textarea
                    rows={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-background/60 border border-border rounded-xl p-2.5 text-foreground focus:border-secondary focus:outline-none"
                    placeholder="VD: Nguyên lý Động cơ 4 kỳ (Nạp - Nén - Nổ - Xả)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-foreground/60 font-semibold mb-1">Môn / Lĩnh vực:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-background/60 border border-border rounded-xl p-2 text-foreground focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground/60 font-semibold mb-1">Thời lượng:</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-background/60 border border-border rounded-xl p-2 text-foreground focus:border-secondary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground/60 font-semibold mb-1">Đối tượng người học:</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-background/60 border border-border rounded-xl p-2 text-foreground focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              {/* Sample Quick Pick Buttons */}
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Mẫu bài học gợi ý nhanh:</div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setTopic("Công nghệ 10 - Bài 1: Khoa học, kỹ thuật và công nghệ");
                      setSubject("Công nghệ 10");
                    }}
                    className="text-left text-xs p-2 rounded-lg bg-surface/50 hover:bg-surface border border-white/5 text-foreground/70 hover:text-foreground transition-all truncate"
                  >
                    📘 Công nghệ 10: Khoa học & Công nghệ
                  </button>
                  <button
                    onClick={() => {
                      setTopic("Nguyên lý Động cơ 4 kỳ: Chu trình Nạp - Nén - Nổ - Xả");
                      setSubject("Kỹ thuật Cơ khí - Động cơ");
                    }}
                    className="text-left text-xs p-2 rounded-lg bg-surface/50 hover:bg-surface border border-white/5 text-foreground/70 hover:text-foreground transition-all truncate"
                  >
                    ⚙️ Động cơ 4 kỳ: Nạp - Nén - Nổ - Xả
                  </button>
                  <button
                    onClick={() => {
                      setTopic("Tự động hóa n8n: Quy trình bóc tách hóa đơn thuế & gửi Zalo");
                      setSubject("AI & Automation");
                    }}
                    className="text-left text-xs p-2 rounded-lg bg-surface/50 hover:bg-surface border border-white/5 text-foreground/70 hover:text-foreground transition-all truncate"
                  >
                    🤖 n8n: Tự động hóa hóa đơn & Zalo
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateStudio}
                disabled={isGenerating}
                className="w-full mt-4 py-3 bg-secondary hover:bg-secondary/90 text-black font-extrabold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang điều phối tạo học liệu...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Khởi Tạo Studio 1-Chạm</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Display Right Panel */}
            <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-border/60 flex flex-col">
              {studioResult ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Results Top Sub-bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/40">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setActiveResultTab("slide")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "slide"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <Presentation className="w-3.5 h-3.5" /> Slide Marp / PPTX
                      </button>
                      <button
                        onClick={() => setActiveResultTab("lesson")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "lesson"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" /> Giáo án CV 5512
                      </button>
                      <button
                        onClick={() => setActiveResultTab("image")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "image"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Prompt ComfyUI (x4)
                      </button>
                      <button
                        onClick={() => setActiveResultTab("voice")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "voice"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" /> Lời thoại VietTTS
                      </button>
                      <button
                        onClick={() => setActiveResultTab("video")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "video"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <VideoIcon className="w-3.5 h-3.5" /> Video Storyboard
                      </button>
                      <button
                        onClick={() => setActiveResultTab("avatar")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeResultTab === "avatar"
                            ? "bg-secondary text-black"
                            : "bg-surface text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5" /> Avatar SadTalker
                      </button>
                    </div>

                    <div className="text-[11px] text-foreground/50 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Provider: <strong className="text-foreground/80">{studioResult.meta?.providerName}</strong></span>
                      <span>({studioResult.meta?.latencyMs}ms)</span>
                    </div>
                  </div>

                  {/* Tab Result 1: Slide Marp / PPTX */}
                  {activeResultTab === "slide" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60 font-medium">
                          Mã nguồn Markdown chuẩn <strong>Marp / Presenton</strong>: Sẵn sàng xuất PPTX hoặc xem trực tiếp
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(studioResult.package?.marpSlideCode || "", "marp")}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface/80 text-xs font-semibold text-foreground/80 transition-colors"
                          >
                            {copiedKey === "marp" ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === "marp" ? "Đã sao chép" : "Sao chép mã"}</span>
                          </button>
                          <button
                            onClick={() => handleDownload(studioResult.package?.marpSlideCode || "", `${topic.replace(/[^a-zA-Z0-9]/g, "_")}_slide.marp.md`)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-secondary/15 hover:bg-secondary/25 text-secondary text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải file .marp.md</span>
                          </button>
                        </div>
                      </div>

                      <pre className="flex-1 bg-black/50 p-4 rounded-2xl border border-white/5 font-mono text-xs text-foreground/90 overflow-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
                        {studioResult.package?.marpSlideCode}
                      </pre>
                    </div>
                  )}

                  {/* Tab Result 2: Giáo Án CV 5512 */}
                  {activeResultTab === "lesson" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60 font-medium">Kế hoạch bài dạy chi tiết chuẩn Công văn 5512</span>
                        <button
                          onClick={() => handleCopy(studioResult.package?.lessonPlan || "", "lesson")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface/80 text-xs font-semibold text-foreground/80 transition-colors"
                        >
                          {copiedKey === "lesson" ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Sao chép giáo án</span>
                        </button>
                      </div>
                      <div className="flex-1 bg-black/50 p-4 rounded-2xl border border-white/5 text-xs text-foreground/90 overflow-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
                        {studioResult.package?.lessonPlan}
                      </div>
                    </div>
                  )}

                  {/* Tab Result 3: ComfyUI Prompts */}
                  {activeResultTab === "image" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="text-xs text-foreground/60 font-medium">
                        Bộ 4 Prompts chuyên sâu nạp vào <strong>ComfyUI / InvokeAI</strong> để tự động sinh 4 hình minh họa kỹ thuật
                      </div>
                      <div className="space-y-2.5 overflow-auto max-h-[380px]">
                        {studioResult.package?.comfyUiPrompts?.map((pr: string, idx: number) => (
                          <div key={idx} className="bg-black/50 p-3.5 rounded-xl border border-white/5 text-xs space-y-1.5 group">
                            <div className="flex items-center justify-between text-[11px] text-foreground/40 font-bold">
                              <span>Hình {idx + 1}: Phân cảnh minh họa kỹ thuật</span>
                              <button
                                onClick={() => handleCopy(pr, `img_${idx}`)}
                                className="flex items-center gap-1 text-secondary hover:underline"
                              >
                                {copiedKey === `img_${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>Copy</span>
                              </button>
                            </div>
                            <p className="font-mono text-cyan-300 text-xs leading-relaxed">{pr}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab Result 4: VietTTS Script */}
                  {activeResultTab === "voice" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60 font-medium">
                          Lời thoại chuẩn ngữ điệu Việt cho <strong>VietTTS / Piper / F5-TTS</strong>
                        </span>
                        <button
                          onClick={() => handleCopy(studioResult.package?.vietTtsScript || "", "tts")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface/80 text-xs font-semibold text-foreground/80 transition-colors"
                        >
                          {copiedKey === "tts" ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Sao chép lời thoại</span>
                        </button>
                      </div>
                      <div className="flex-1 bg-black/50 p-4 rounded-2xl border border-white/5 text-xs text-foreground/90 overflow-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
                        {studioResult.package?.vietTtsScript}
                      </div>
                    </div>
                  )}

                  {/* Tab Result 5: Video Storyboard MoneyPrinterTurbo */}
                  {activeResultTab === "video" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="text-xs text-foreground/60 font-medium">
                        Cấu trúc JSON Storyboard cho <strong>MoneyPrinterTurbo</strong> tự động render video HD
                      </div>
                      <div className="space-y-2 overflow-auto max-h-[380px]">
                        {studioResult.package?.moneyPrinterTurboStoryboard?.map((scene: any, idx: number) => (
                          <div key={idx} className="bg-black/50 p-3 rounded-xl border border-white/5 text-xs flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold">Scene {scene.scene || idx + 1}</span>
                                <span className="text-[11px] text-foreground/40">Thời lượng: {scene.durationSec || 5}s</span>
                                <span className="text-[11px] text-cyan-400">Từ khóa video: "{scene.visualKeyword}"</span>
                              </div>
                              <p className="text-foreground/90">{scene.script}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab Result 6: Avatar SadTalker */}
                  {activeResultTab === "avatar" && (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60 font-medium">
                          Lời chào 30 giây đầu bài học cho <strong>SadTalker (Avatar Giảng Viên AI)</strong>
                        </span>
                        <button
                          onClick={() => handleCopy(studioResult.package?.sadTalkerTeacherScript || "", "avatar")}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface hover:bg-surface/80 text-xs font-semibold text-foreground/80 transition-colors"
                        >
                          {copiedKey === "avatar" ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Sao chép</span>
                        </button>
                      </div>
                      <div className="flex-1 bg-black/50 p-4 rounded-2xl border border-white/5 text-xs text-foreground/90 overflow-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
                        {studioResult.package?.sadTalkerTeacherScript}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                    <Flame className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Chưa có dữ liệu học liệu số</h4>
                    <p className="text-xs text-foreground/50 max-w-sm mt-1">
                      Nhập đề bài hoặc chọn bài học mẫu bên trái rồi bấm nút <strong>"Khởi Tạo Studio 1-Chạm"</strong> để AI tự động xuất Slide, Giáo án, Ảnh và Video cùng lúc.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CỤM 14 CÔNG CỤ MÃ NGUỒN MỞ */}
      {activeSubTab === "tools" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OPEN_SOURCE_AI_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="glass-panel rounded-2xl p-5 border border-border/60 hover:border-secondary/40 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`p-2 rounded-xl text-xs ${
                        tool.category === "slide" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" :
                        tool.category === "image" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" :
                        tool.category === "video" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {tool.category === "slide" && <Presentation className="w-4 h-4" />}
                        {tool.category === "image" && <ImageIcon className="w-4 h-4" />}
                        {tool.category === "video" && <VideoIcon className="w-4 h-4" />}
                        {tool.category === "voice" && <Mic className="w-4 h-4" />}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span>{tool.name}</span>
                          <span className="text-[10px] text-foreground/40 font-mono">({tool.license})</span>
                        </h4>
                        <div className="text-[11px] text-secondary font-medium">{tool.categoryLabel}</div>
                      </div>
                    </div>

                    <a
                      href={tool.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface/80 hover:bg-surface text-foreground/50 hover:text-foreground transition-colors"
                      title="Xem mã nguồn GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>

                  <div className="pt-2 border-t border-border/30 space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-foreground/40">Vai trò đề xuất: </span>
                      <span className="text-foreground/80 font-semibold">{tool.recommendedRole}</span>
                    </div>
                    {tool.workflowSample && (
                      <div className="text-cyan-300 font-mono text-[10px] bg-cyan-950/30 p-1.5 rounded border border-cyan-800/30">
                        {tool.workflowSample}
                      </div>
                    )}
                  </div>
                </div>

                {tool.dockerCommand && (
                  <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between text-[10px] font-mono text-foreground/50">
                    <span className="truncate max-w-[200px]">{tool.dockerCommand}</span>
                    <button
                      onClick={() => handleCopy(tool.dockerCommand || "", `docker_${tool.id}`)}
                      className="text-secondary hover:underline shrink-0"
                    >
                      {copiedKey === `docker_${tool.id}` ? "Đã copy" : "Copy lệnh"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ĐIỀU PHỐI QUOTA & CHỐNG GIÁN ĐOẠN */}
      {activeSubTab === "quota" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Provider 1: Gemini */}
            <div className="glass-panel p-5 rounded-2xl border border-secondary/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  Ưu tiên 1 (Chính)
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Google Gemini 2.0 Flash</h4>
              <p className="text-xs text-foreground/60 mt-1">Tốc độ cực nhanh, trí tuệ cao, phù hợp 90% tác vụ thời gian thực.</p>
              <div className="mt-4 pt-3 border-t border-border/30 text-xs text-foreground/70 flex justify-between">
                <span>Trạng thái:</span>
                <span className="text-emerald-400 font-bold">Khỏe mạnh (Healthy)</span>
              </div>
            </div>

            {/* Provider 2: Ollama Local */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Server className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                  Ưu tiên 2 (Offline)
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Ollama Local (Qwen 2.5)</h4>
              <p className="text-xs text-foreground/60 mt-1">Không bao giờ hết quota, chạy local trên máy trạm/server, 0 chi phí token.</p>
              <div className="mt-4 pt-3 border-t border-border/30 text-xs text-foreground/70 flex justify-between">
                <span>Quota:</span>
                <span className="text-cyan-400 font-bold">Vô hạn (Không giới hạn)</span>
              </div>
            </div>

            {/* Provider 3: Groq / OpenAI Bridge */}
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-bold">
                  Ưu tiên 3 (Dự phòng)
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Groq / OpenAI Secondary</h4>
              <p className="text-xs text-foreground/60 mt-1">Dự phòng tốc độ cao 500 tokens/s khi Gemini chạm ngưỡng Rate Limit.</p>
              <div className="mt-4 pt-3 border-t border-border/30 text-xs text-foreground/70 flex justify-between">
                <span>Chế độ:</span>
                <span className="text-purple-400 font-bold">Hot Standby</span>
              </div>
            </div>

            {/* Provider 4: Heuristic Studio Engine */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  Ưu tiên 4 (Cứu sinh)
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground">Huy Technology Heuristic</h4>
              <p className="text-xs text-foreground/60 mt-1">Thuật toán nội tại tự sinh học liệu chuẩn mực cả khi đứt mạng toàn cầu.</p>
              <div className="mt-4 pt-3 border-t border-border/30 text-xs text-foreground/70 flex justify-between">
                <span>Độ sẵn sàng:</span>
                <span className="text-amber-400 font-bold">100% Tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Failover Test Result Log */}
          {testLog && (
            <div className="bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-secondary font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Kết quả kiểm tra Gateway:
                </span>
                <span>Latency: {testLog.meta?.latencyMs || 0}ms</span>
              </div>
              <div className="text-foreground/80 font-mono">{testLog.text || JSON.stringify(testLog)}</div>
              <div className="text-[11px] text-foreground/40">
                Provider được kích hoạt: <strong>{testLog.meta?.providerName}</strong> | Failovers xảy ra: {testLog.meta?.failoversOccurred?.length || 0}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: CỔNG KẾT NỐI HỆ SINH THÁI (API GATEWAY) */}
      {activeSubTab === "ecosystem" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-border/60 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-secondary" /> Hướng dẫn kết nối chéo từ EduViet & SmartTax AI
              </h3>
              <p className="text-xs text-foreground/60 mt-1">
                Để cả 2 website <strong className="text-cyan-400">gvcncdsai.io.vn</strong> và <strong className="text-amber-400">smarttax-ai.vercel.app</strong> không bao giờ bị hết quota, 
                hãy trỏ các request AI về API Gateway trung tâm tại <code className="text-secondary bg-secondary/10 px-2 py-0.5 rounded">https://huycncdsai.io.vn/api/ai/hub</code>.
              </p>
            </div>

            {/* Code Snippet for External Apps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/70">
                <span>Code mẫu fetch cho EduViet (Next.js) & SmartTax (React Vite):</span>
                <button
                  onClick={() => handleCopy(`// Gọi Central AI Hub với Auto-Failover chống hết Quota
const res = await fetch("https://huycncdsai.io.vn/api/ai/hub", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-ecosystem-source": "eduviet" // hoặc "smarttax"
  },
  body: JSON.stringify({
    action: "completion", // hoặc "generate_studio_package"
    prompt: "Soạn bài giảng về..."
  })
});
const { text, meta } = await res.json();
console.log("Trả lời từ:", meta.providerName);`, "snippet")}
                  className="flex items-center gap-1 text-secondary hover:underline"
                >
                  {copiedKey === "snippet" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Sao chép mã nguồn</span>
                </button>
              </div>

              <pre className="bg-black/80 p-4 rounded-2xl border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
{`// Gọi Central AI Hub với Auto-Failover chống hết Quota
const res = await fetch("https://huycncdsai.io.vn/api/ai/hub", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-ecosystem-source": "eduviet" // hoặc "smarttax"
  },
  body: JSON.stringify({
    action: "completion", // hoặc "generate_studio_package"
    prompt: "Soạn bài giảng hoặc phân tích hóa đơn thuế..."
  })
});
const { text, meta } = await res.json();
console.log("Trả lời thành công từ:", meta.providerName, "Độ trễ:", meta.latencyMs + "ms");`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-2">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" /> Ứng dụng cho EduViet (gvcncdsai.io.vn):
                </div>
                <p className="text-foreground/70 leading-relaxed">
                  Tự động gọi Studio Package để xuất ngay giáo án CV 5512, xuất file Marp PPTX cho giáo viên tải về, và gọi VietTTS để đọc bài mẫu không sợ giới hạn quota ngày.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" /> Ứng dụng cho SmartTax AI (smarttax-ai.vercel.app):
                </div>
                <p className="text-foreground/70 leading-relaxed">
                  Gửi dữ liệu OCR hóa đơn và bảng kê thuế về Hub. Nếu Gemini bận hoặc quá tải quota, hệ thống tự động đẩy sang Ollama Qwen 2.5 hoặc Groq để tiếp tục đối soát mà không gián đoạn kế toán viên.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
