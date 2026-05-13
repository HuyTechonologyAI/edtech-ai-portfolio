"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Copy, RefreshCw, Loader2, Search, FileText, Video, CheckCircle2, ChevronRight, BarChart3, Clock } from "lucide-react";

interface TelemetryMetric {
  id: number;
  user_email: string;
  activity_type: string;
  target_item: string;
  created_at: string;
}

interface TrendItem {
  keyword: string;
  volume: string;
  reason: string;
}

interface GapItem {
  query: string;
  gapAnalysis: string;
}

interface RecommendationItem {
  title: string;
  format: string;
  outline: string[];
  predictedRetentionImpact: string;
}

interface AiInsightsPayload {
  hotTrends: TrendItem[];
  contentGaps: GapItem[];
  recommendations: RecommendationItem[];
}

export default function AiTrendsAnalyticsTab() {
  const [metrics, setMetrics] = useState<TelemetryMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  // AI Insights states
  const [insights, setInsights] = useState<AiInsightsPayload | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data.metrics || []);
      }
    } catch {
      // ignore silently
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Handle Trigger AI Analysis Request
  const handleAnalyzeTrends = async () => {
    setAnalyzing(true);
    setError(null);
    setIsFallbackUsed(false);

    try {
      const res = await fetch("/api/admin/ai-insights", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Lỗi giao tiếp Gemini AI");

      setInsights(data.insights);
      if (data.isFallback) {
        setIsFallbackUsed(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper copy to clipboard alert
  const copyScriptToClipboard = (rec: RecommendationItem) => {
    const text = `TIÊU ĐỀ: ${rec.title}\nĐỊNH DẠNG: ${rec.format}\nDÀN Ý CHI TIẾT:\n` + rec.outline.map(o => `- ${o}`).join("\n");
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép kịch bản "${rec.title}" vào bộ nhớ tạm!\nBạn có thể dán vào mục Đăng tải mới.`);
  };

  // Separate recent searches from views
  const recentSearches = metrics.filter(m => m.activity_type === "SEARCH_QUERY").slice(0, 10);
  const recentViews = metrics.filter(m => m.activity_type !== "SEARCH_QUERY").slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Main Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-surface to-cyan-900/20 p-6 border border-white/10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Cố vấn Nội dung AI
            </div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Phân Tích Xu Hướng & Đề Xuất Kịch Bản
            </h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Hệ thống liên tục thu thập ngầm các từ khóa tìm kiếm và tài liệu được học viên mở xem, từ đó Gemini AI sẽ chỉ ra chính xác các <strong className="text-amber-400 font-medium">Khoảng trống nội dung (Content Gaps)</strong> để bạn làm bài giảng mới nhằm giữ chân người dùng lâu nhất.
            </p>
          </div>

          <button
            onClick={handleAnalyzeTrends}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-extrabold text-xs shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Đang Phân Tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 Kích hoạt AI Phân Tích Nhu Cầu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raw Telemetry Feeds Preview Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stream 1: Real-time search terms input from user base */}
        <div className="bg-surface/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
            <span className="font-bold text-secondary flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Từ khóa Tìm kiếm Gần đây
            </span>
            <button onClick={fetchMetrics} className="text-foreground/40 hover:text-foreground"><RefreshCw className="w-3 h-3" /></button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {loadingMetrics ? (
              <span className="text-[11px] text-foreground/40 italic">Đang nạp dữ liệu đo lường...</span>
            ) : recentSearches.length === 0 ? (
              <span className="text-[11px] text-foreground/40 italic">Chưa có lượt tìm kiếm mới nào được ghi nhận.</span>
            ) : (
              recentSearches.map((m, idx) => (
                <span key={idx} className="bg-surface border border-border px-2 py-1 rounded text-[11px] text-foreground/80 flex items-center gap-1">
                  <span>{m.target_item}</span>
                  <span className="text-[9px] text-foreground/30 font-mono">({m.user_email.split("@")[0]})</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Stream 2: Resource view engagements */}
        <div className="bg-surface/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Học liệu Được quan tâm
            </span>
            <span className="text-[10px] text-foreground/40">Real-time Hook</span>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {loadingMetrics ? (
              <span className="text-[11px] text-foreground/40 italic">Đang nạp dữ liệu đo lường...</span>
            ) : recentViews.length === 0 ? (
              <span className="text-[11px] text-foreground/40 italic">Chưa có tương tác xem tài liệu nào được ghi nhận.</span>
            ) : (
              recentViews.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] bg-surface/50 p-1.5 rounded border border-white/5 truncate">
                  <span className="truncate text-foreground/80 flex items-center gap-1">
                    <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded">{m.activity_type.split("_")[0]}</span>
                    <span className="truncate">{m.target_item}</span>
                  </span>
                  <span className="text-[9px] text-foreground/40 font-mono shrink-0 ml-2">{new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fallback Notice Warning */}
      {isFallbackUsed && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Hệ thống chưa có đủ lượt Click thực tế hoặc chưa điền API Key. Dưới đây là <strong>Báo cáo Xu hướng Mẫu từ AI</strong> được tối ưu sẵn cho nền tảng EdTech của bạn:</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold text-center">
          Lỗi: {error}
        </div>
      )}

      {/* Generated AI Output Insights Presentation Panel */}
      {insights ? (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1: Hot trends maps */}
          <div className="bg-surface/50 rounded-2xl border border-white/5 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <TrendingUp className="w-4 h-4" /> 1. Bản đồ Xu hướng Tìm kiếm (Hot Trends)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.hotTrends.map((t, i) => (
                <div key={i} className="bg-background/50 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-foreground/90">{t.keyword}</span>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                      🔥 {t.volume}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/60 leading-normal">{t.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Critical Content Gaps Alerts */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
              <AlertTriangle className="w-4 h-4" /> 2. Khoảng trống Nội dung Cấp bách (Content Gaps)
            </h3>

            <div className="space-y-2.5">
              {insights.contentGaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface/50 p-3 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-foreground">Học viên tìm kiếm: &quot;{gap.query}&quot;</div>
                    <div className="text-foreground/70 text-[11px] leading-relaxed">{gap.gapAnalysis}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: AI Curated Recommendations Strategy */}
          <div className="bg-surface/50 rounded-2xl border border-white/5 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Lightbulb className="w-4 h-4" /> 3. Đề xuất Sản xuất Kịch bản Tối ưu Giữ chân (Curated Action Plan)
            </h3>

            <div className="space-y-4">
              {insights.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-background/80 rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3 relative group">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase">
                        {rec.format}
                      </span>
                      <h4 className="text-sm font-bold text-foreground pt-1">{rec.title}</h4>
                    </div>

                    <button
                      onClick={() => copyScriptToClipboard(rec)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-surface hover:bg-white/10 text-foreground/80 rounded-lg text-xs font-medium border border-white/5 transition-all shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Sao chép Dàn ý</span>
                    </button>
                  </div>

                  {/* Bullet points outline checklist */}
                  <div className="space-y-1.5 pl-1">
                    <span className="text-[10px] text-foreground/40 block uppercase font-medium">Dàn ý gợi ý thực hiện:</span>
                    {rec.outline.map((item, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Predicted Retention Impact label */}
                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                    <span><strong>Dự kiến hiệu quả:</strong> {rec.predictedRetentionImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty default screen greeting */
        <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl text-foreground/40 text-xs space-y-2">
          <Lightbulb className="w-8 h-8 text-foreground/20 mx-auto" />
          <p>Hãy bấm nút <strong className="text-purple-400">🚀 Kích hoạt AI Phân Tích Nhu Cầu</strong> ở phía trên để Gemini AI bắt đầu tổng hợp dữ liệu đo lường.</p>
        </div>
      )}
    </div>
  );
}
