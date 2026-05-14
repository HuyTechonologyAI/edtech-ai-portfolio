"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, DollarSign, Users, Sparkles, Loader2, BarChart3, AlertTriangle, Zap, CheckCircle2, Target, ArrowUpRight, Layers, ArrowDownRight } from "lucide-react";

interface DailyMonthlyData {
  labels: string[];
  traffic: number[];
  revenue: number[];
}

interface FunnelStage {
  stage: string;
  count: number;
  dropoff: string;
  color: string;
  text: string;
}

interface MetricsPayload {
  daily: DailyMonthlyData;
  monthly: DailyMonthlyData;
  funnel: FunnelStage[];
  summary: {
    totalTrafficMonth: number;
    totalRevenueMonth: number;
    conversionRate: number;
    growthRate: string;
  };
}

interface Bottleneck {
  title: string;
  severity: string;
  analysis: string;
}

interface StrategyItem {
  title: string;
  impact: string;
  details: string;
}

interface StrategyReport {
  bottlenecks: Bottleneck[];
  strategies: StrategyItem[];
  actionItems: string[];
}

export function GrowthAnalyticsTab() {
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("daily");

  // AI strategy states
  const [strategy, setStrategy] = useState<StrategyReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);

  // Active tooltip index for customized rich interactive bars
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch("/api/admin/growth-analytics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Lỗi nạp dữ liệu thống kê tăng trưởng", err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleTriggerAIStrategy = async () => {
    setAnalyzing(true);
    setError(null);
    setIsFallbackUsed(false);

    try {
      const res = await fetch("/api/admin/growth-analytics", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Lỗi giao tiếp API Phân tích Tăng trưởng");

      setStrategy(data.strategy);
      if (data.isFallback) {
        setIsFallbackUsed(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingMetrics || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        <p className="text-xs text-foreground/60">Đang tổng hợp dữ liệu phễu bán hàng và lưu lượng truy cập...</p>
      </div>
    );
  }

  const currentData = timeRange === "daily" ? metrics.daily : metrics.monthly;
  const maxTraffic = Math.max(...currentData.traffic, 1);
  const maxRevenue = Math.max(...currentData.revenue, 1);

  // Format currency helper
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Executive Summaries */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-background to-surface border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Bảng Điều Khiển Tăng Trưởng Doanh Thu
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Phân Tích Lưu Lượng & Tối Ưu Phễu AI
            </h2>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
              Theo dõi biến động dòng tiền, dung lượng người dùng truy cập theo mốc thời gian thực tế và ứng dụng <strong className="text-amber-400 font-semibold">Trợ lý ảo Agentic AI</strong> để tự động rà soát điểm rớt phễu nhằm đề xuất chiến lược tối ưu lợi nhuận.
            </p>
          </div>

          {/* Quick Metrics Toggle Bar */}
          <div className="flex items-center gap-2 bg-background/80 p-1.5 rounded-xl border border-white/10 shrink-0 w-full md:w-auto justify-center">
            <button
              onClick={() => setTimeRange("daily")}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                timeRange === "daily"
                  ? "bg-secondary text-black shadow-lg shadow-secondary/20"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Theo Ngày (7 ngày qua)
            </button>
            <button
              onClick={() => setTimeRange("monthly")}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                timeRange === "monthly"
                  ? "bg-secondary text-black shadow-lg shadow-secondary/20"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Theo Tháng (6 tháng)
            </button>
          </div>
        </div>

        {/* Global Key Performance Indicators Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
          <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[11px] text-foreground/50 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Tổng Lượt Truy Cập
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground font-mono">
              {metrics.summary.totalTrafficMonth.toLocaleString()}
            </div>
            <div className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {metrics.summary.growthRate} so với kỳ trước
            </div>
          </div>

          <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[11px] text-foreground/50 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Tổng Doanh Thu Tháng
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-400 font-mono truncate" title={formatVND(metrics.summary.totalRevenueMonth)}>
              {formatVND(metrics.summary.totalRevenueMonth)}
            </div>
            <div className="text-[10px] text-foreground/40 italic">Đã trừ chi phí cổng thanh toán</div>
          </div>

          <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[11px] text-foreground/50 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-secondary" /> Tỷ Lệ Chuyển Đổi Cuối
            </div>
            <div className="text-xl sm:text-2xl font-bold text-secondary font-mono">
              {metrics.summary.conversionRate}%
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Khách truy cập → Thanh toán</div>
          </div>

          <div className="bg-surface/50 p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="text-[11px] text-foreground/50 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Hệ Số Viral MXH
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">
              450+
            </div>
            <div className="text-[10px] text-foreground/40">Lượt share Chứng chỉ Động</div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION: Side-by-Side Visual Data Presentations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: TRAFFIC / PAGE VIEWS BAR CHART */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Biểu Đồ Lưu Lượng Truy Cập ({timeRange === "daily" ? "Ngày" : "Tháng"})</span>
              </h3>
              <p className="text-[11px] text-foreground/50 mt-0.5">Phân bổ nguồn truy cập tự nhiên và giới thiệu</p>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-lg">
              Đỉnh: {maxTraffic.toLocaleString()} views
            </span>
          </div>

          {/* Interactive CSS Bars Rendering */}
          <div className="h-64 flex items-end justify-between gap-2 pt-8 relative">
            {/* Background grid guide lines */}
            <div className="absolute inset-x-0 top-0 border-b border-white/5" />
            <div className="absolute inset-x-0 top-1/2 border-b border-white/5" />
            <div className="absolute inset-x-0 bottom-0 border-b border-white/10" />

            {currentData.traffic.map((val, idx) => {
              const heightPercent = Math.max((val / maxTraffic) * 100, 8);
              const isHovered = hoveredIndex === idx;

              return (
                <div 
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer select-none"
                >
                  {/* Tooltip Overlay */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-background/95 border border-border px-3 py-1.5 rounded-xl shadow-xl text-center backdrop-blur-md animate-fade-in pointer-events-none min-w-[100px]">
                      <div className="text-[10px] text-foreground/40 font-bold uppercase">{currentData.labels[idx]}</div>
                      <div className="text-xs font-bold text-cyan-400 font-mono">{val.toLocaleString()} views</div>
                    </div>
                  )}

                  {/* Render Visual Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                      isHovered 
                        ? "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                        : "bg-gradient-to-t from-cyan-950 via-cyan-800/60 to-cyan-600/80 hover:from-cyan-800"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Glossy inner top highlight */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                  </div>

                  {/* Label Bottom */}
                  <span className={`text-[11px] font-medium mt-2 shrink-0 transition-colors ${isHovered ? "text-cyan-400 font-bold" : "text-foreground/60"}`}>
                    {currentData.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sub legend info */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-foreground/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"/> Lượt truy cập Organic</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"/> Nguồn Viral MXH</span>
          </div>
        </div>

        {/* CHART 2: REVENUE TRACKING BAR CHART */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Biểu Đồ Doanh Thu Lợi Nhuận ({timeRange === "daily" ? "Ngày" : "Tháng"})</span>
              </h3>
              <p className="text-[11px] text-foreground/50 mt-0.5">Dòng tiền từ bán Khóa học &amp; Tài nguyên Premium</p>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg truncate max-w-[150px]" title={formatVND(maxRevenue)}>
              Đỉnh: {formatVND(maxRevenue)}
            </span>
          </div>

          {/* Interactive Revenue Bars Rendering */}
          <div className="h-64 flex items-end justify-between gap-2 pt-8 relative">
            {/* Background grid guide lines */}
            <div className="absolute inset-x-0 top-0 border-b border-white/5" />
            <div className="absolute inset-x-0 top-1/2 border-b border-white/5" />
            <div className="absolute inset-x-0 bottom-0 border-b border-white/10" />

            {currentData.revenue.map((val, idx) => {
              const heightPercent = Math.max((val / maxRevenue) * 100, 8);
              const isHovered = hoveredIndex === idx;

              return (
                <div 
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer select-none"
                >
                  {/* Tooltip Overlay */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-background/95 border border-border px-3 py-1.5 rounded-xl shadow-xl text-center backdrop-blur-md animate-fade-in pointer-events-none min-w-[130px]">
                      <div className="text-[10px] text-foreground/40 font-bold uppercase">{currentData.labels[idx]}</div>
                      <div className="text-xs font-bold text-amber-400 font-mono">{formatVND(val)}</div>
                    </div>
                  )}

                  {/* Render Visual Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                      isHovered 
                        ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                        : "bg-gradient-to-t from-amber-950 via-amber-800/60 to-amber-600/80 hover:from-amber-800"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Glossy inner top highlight */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                  </div>

                  {/* Label Bottom */}
                  <span className={`text-[11px] font-medium mt-2 shrink-0 transition-colors ${isHovered ? "text-amber-400 font-bold" : "text-foreground/60"}`}>
                    {currentData.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sub legend info */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-foreground/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> Doanh thu Premium Gated</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"/> Doanh thu Khóa học Thực chiến</span>
          </div>
        </div>

      </div>

      {/* FUNNEL CONVERSION SECTION: Mapping users progress drop-offs */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-secondary" />
              <span>Phễu Bán Hàng &amp; Điểm Rớt Chuyển Đổi (Sales Funnel Tracking)</span>
            </h3>
            <p className="text-xs text-foreground/50 mt-0.5">Giám sát các bước chuyển đổi từ truy cập đầu tiên đến khi chi trả</p>
          </div>
          <span className="text-xs text-foreground/40 italic">Cập nhật tự động theo Cookie học viên</span>
        </div>

        {/* Funnel Stacked Rows Visual Representation */}
        <div className="space-y-3 pt-2">
          {metrics.funnel.map((item, idx) => {
            // Tính toán độ rộng của thanh nền minh họa dung lượng từng tầng
            const maxFunnelCount = metrics.funnel[0].count;
            const widthPercent = Math.max((item.count / maxFunnelCount) * 100, 15);

            return (
              <div key={idx} className="relative rounded-2xl overflow-hidden bg-surface/40 border border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-surface/80">
                {/* Thanh dung lượng ngầm định phía sau */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${item.color} opacity-30 pointer-events-none transition-all duration-1000`}
                  style={{ width: `${widthPercent}%` }}
                />

                {/* Left Info: Tên Bước */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-background/80 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-foreground">{item.stage}</div>
                    <div className="text-[11px] text-foreground/50">Dung lượng phễu ở bước này</div>
                  </div>
                </div>

                {/* Right Info: Numbers & Drop-offs Warning */}
                <div className="relative z-10 flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <div className={`text-base sm:text-lg font-bold font-mono ${item.text}`}>
                      {item.count.toLocaleString()} <span className="text-xs font-normal text-foreground/40">user</span>
                    </div>
                  </div>

                  {/* Cảnh báo tỷ lệ rớt phễu so với bước liền trước */}
                  <div className="w-24 text-right shrink-0">
                    {idx === 0 ? (
                      <span className="text-[11px] text-foreground/40 font-medium block">Tầng gốc (100%)</span>
                    ) : (
                      <div className="inline-flex items-center gap-0.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-400 font-bold text-[11px]">
                        <ArrowDownRight className="w-3 h-3 shrink-0" />
                        <span>{item.dropoff}</span>
                      </div>
                    )}
                    {idx > 0 && <span className="text-[9px] text-foreground/40 block mt-0.5">rớt phễu</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI CONSULTANT BLOCK: Scanning Bottlenecks & Crafting Dynamic Strategies */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-surface to-amber-950/20 border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-amber-400" /> Tích Hợp AI Rà Soát Phễu Bán Hàng
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Tư Vấn &amp; Hoạch Định Chiến Lược Doanh Thu Tự Động
            </h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Trí tuệ nhân tạo Gemini 2.5 sẽ tổng hợp luồng dữ liệu truy cập, phân tích tâm lý do dự ở bước thanh toán và đưa ra bản đề xuất hành động cụ thể để tối ưu hóa doanh thu ngay trong tháng.
            </p>
          </div>

          <button
            onClick={handleTriggerAIStrategy}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold rounded-xl text-xs shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>AI Đang Quét Phễu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>🤖 Kích Hoạt AI Rà Soát &amp; Lên Chiến Lược</span>
              </>
            )}
          </button>
        </div>

        {/* Cảnh báo sử dụng dữ liệu mẫu nếu API bị gián đoạn */}
        {isFallbackUsed && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Hệ thống áp dụng <strong>Báo cáo Tư vấn Mẫu từ AI</strong> được huấn luyện chuyên biệt cho tệp khách hàng MMO &amp; EdTech của bạn (Do thiếu API Key thực tế):</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold text-center">
            Lỗi khi phân tích AI: {error}
          </div>
        )}

        {/* AI Returned Output Panels */}
        {strategy ? (
          <div className="space-y-6 animate-fade-in pt-2">
            
            {/* Mục 1: Các Điểm Nghẽn Tới Hạn (Bottlenecks Detected) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> 1. Nhận Diện Điểm Nghẽn Phễu Trực Tiếp (Critical Bottlenecks)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.bottlenecks.map((btn, i) => (
                  <div key={i} className="bg-background/60 p-4 rounded-2xl border border-red-500/20 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-xs text-foreground">{btn.title}</span>
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                        {btn.severity}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{btn.analysis}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mục 2: Chiến lược Tối ưu Doanh thu (Proposed Strategies) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> 2. Hoạch Định Chiến Lược Đột Phá Lợi Nhuận (Proposed Strategies)
              </h4>
              <div className="space-y-3">
                {strategy.strategies.map((strat, i) => (
                  <div key={i} className="bg-surface/80 p-4 rounded-2xl border border-white/5 space-y-2 hover:border-amber-500/30 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div className="text-sm font-bold text-foreground">{strat.title}</div>
                      <span className="text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded shrink-0">
                        🎯 {strat.impact}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed pl-2 border-l-2 border-amber-500/40">
                      {strat.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mục 3: Kế hoạch Hành động Ngay (Immediate Action Items Checklist) */}
            <div className="bg-background/80 p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> 3. Danh Sách Hành Động Đề Xuất Thực Thi (Actionable Checklist)
              </h4>
              <div className="space-y-2.5 pt-1">
                {strategy.actionItems.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-foreground/40 text-xs">
            Bấm nút kích hoạt màu cam phía trên để đưa dữ liệu phễu vào bộ não phân tích AI.
          </div>
        )}
      </div>

    </div>
  );
}
