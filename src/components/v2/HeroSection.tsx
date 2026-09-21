"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Cpu, ChevronDown } from "lucide-react";
import { EcosystemMap } from "@/components/v2/EcosystemMap";

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full min-h-[90vh] flex flex-col justify-center pt-8 pb-16 overflow-hidden bg-[#070B14] scroll-mt-24 md:scroll-mt-28">
      {/* Ambient background light gradients */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#0070F3]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (55% on desktop -> 7 cols) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
            {/* Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-extrabold tracking-wide uppercase shadow-[0_0_15px_rgba(0,229,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>HUY TECHNOLOGY AI GROUP</span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Kiến tạo hệ sinh thái{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#33EBFF] to-[#0070F3] drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                vận hành bằng AI
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              Hệ sinh thái công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông chuyên biệt trên nền tảng điều phối đa tác tử an toàn theo chuẩn <strong className="text-white font-semibold">HAIP/1.0</strong>.
            </p>

            {/* Dual CTAs with Clear Hierarchy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {/* Primary Business CTA */}
              <Link
                href="#contact"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#00E5FF] to-[#0070F3] shadow-[0_0_25px_rgba(0,229,255,0.45)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] hover:scale-102 transition-all"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Tư vấn AI Automation</span>
              </Link>

              {/* Secondary Exploratory CTA */}
              <Link
                href="#ecosystem"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0F172A] border border-white/15 hover:border-[#00E5FF]/60 hover:bg-[#1E293B] transition-all"
              >
                <span>Khám phá hệ sinh thái</span>
                <ChevronDown className="w-4 h-4 text-[#00E5FF]" />
              </Link>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex flex-wrap items-center gap-3 pt-4 text-slate-400 text-xs border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#00E5FF]" />
                <span>Phân quyền bảo mật</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Local + Cloud linh hoạt</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>Giám sát cho tác vụ rủi ro cao</span>
            </div>
          </div>

          {/* Right Column (45% on desktop -> 6 cols): Interactive Ecosystem Map */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
            <EcosystemMap />
          </div>
        </div>
      </div>
    </section>
  );
}
