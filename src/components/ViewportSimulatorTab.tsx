"use client";

import { useState } from "react";
import { Laptop, Smartphone, Tablet, RefreshCw, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";

export function ViewportSimulatorTab() {
  const [device, setDevice] = useState<"desktop" | "mobile" | "tablet">("mobile");
  const [targetRoute, setTargetRoute] = useState<string>("/");
  const [key, setKey] = useState<number>(0);

  const routes = [
    { path: "/", label: "🏠 Trang chủ" },
    { path: "/pricing", label: "💎 Bảng giá SaaS" },
    { path: "/resources", label: "📄 Kho Tài liệu" },
    { path: "/videos", label: "🎥 Thư viện Videos" },
    { path: "/roadmap", label: "🗺️ Lộ trình học" },
    { path: "/rewards", label: "🎁 Đổi quà Gamification" },
  ];

  // Kích thước giả lập
  const getDeviceStyles = () => {
    switch (device) {
      case "mobile":
        return {
          wrapper: "w-[375px] h-[720px] rounded-[45px] border-[12px] border-black ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden mx-auto bg-background transition-all duration-500",
          iframe: "w-full h-full border-0",
          hasNotch: true,
        };
      case "tablet":
        return {
          wrapper: "w-[768px] h-[850px] rounded-[30px] border-[16px] border-black ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden mx-auto bg-background transition-all duration-500 max-w-full",
          iframe: "w-full h-full border-0",
          hasNotch: false,
        };
      case "desktop":
      default:
        return {
          wrapper: "w-full h-[750px] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden bg-background transition-all duration-500",
          iframe: "w-full h-full border-0",
          hasNotch: false,
        };
    }
  };

  const currentStyles = getDeviceStyles();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Thanh Điều Khiển Trên Cùng */}
      <div className="bg-background/40 border border-white/5 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
        
        {/* Chọn Trang Đích */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider mr-1">URL:</span>
          {routes.map((r) => (
            <button
              key={r.path}
              onClick={() => { setTargetRoute(r.path); setKey((prev) => prev + 1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                targetRoute === r.path
                  ? "bg-secondary text-black shadow-[0_0_15px_rgba(0,255,133,0.3)] scale-105"
                  : "bg-surface hover:bg-surface/80 text-foreground/80 border border-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Nút Chuyển Đổi Chế Độ Thiết Bị */}
        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              device === "desktop" ? "bg-secondary/20 text-secondary border border-secondary/30" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Máy tính</span>
          </button>

          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              device === "tablet" ? "bg-secondary/20 text-secondary border border-secondary/30" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Máy tính bảng</span>
          </button>

          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              device === "mobile" ? "bg-secondary/20 text-secondary border border-secondary/30" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Điện thoại</span>
          </button>
        </div>

        {/* Nút Tiện Ích Khác */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKey((prev) => prev + 1)}
            title="Tải lại trang giả lập"
            className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-foreground/70 hover:text-secondary border border-white/5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={targetRoute}
            target="_blank"
            rel="noopener noreferrer"
            title="Mở tab thực tế"
            className="p-2 bg-surface hover:bg-surface/80 rounded-lg text-foreground/70 hover:text-secondary border border-white/5 transition-colors inline-block"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Thông báo hướng dẫn test Responsive */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          <strong>Chế độ Kiểm thử Vận hành (Live Previewer):</strong> Cho phép mô phỏng tức thời giao diện người dùng thực tế trên các kích thước màn hình mà không cần thoát khỏi bảng điều khiển Admin CMS.
        </span>
      </div>

      {/* Khung Hiển Thị Giả Lập */}
      <div className="p-4 md:p-8 bg-surface/30 border border-white/5 rounded-3xl flex justify-center items-center overflow-x-auto min-h-[500px]">
        <div className={currentStyles.wrapper}>
          
          {/* Camera Notch giả lập trên Mobile */}
          {currentStyles.hasNotch && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-surface/20 border border-white/10" />
            </div>
          )}

          {/* Render Iframe trực tiếp */}
          <iframe
            key={key}
            src={targetRoute}
            title={`Preview ${device}`}
            className={currentStyles.iframe}
          />

        </div>
      </div>

      {/* Footer Mẹo */}
      <div className="text-center">
        <p className="text-[11px] text-foreground/40 italic">
          Mẹo: Nếu phát hiện lỗi tràn nút bấm hay thanh cuộn ẩn trên điện thoại, bạn có thể chỉnh sửa mã nguồn và tải lại ngay tại khung này để theo dõi.
        </p>
      </div>

    </div>
  );
}
