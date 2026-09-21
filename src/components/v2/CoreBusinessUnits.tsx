"use client";

import Link from "next/link";
import { Cpu, GraduationCap, Calculator, Tv, BookOpen, Sparkles, ExternalLink, CheckCircle } from "lucide-react";
import { PUBLIC_ECOSYSTEM } from "@/lib/public-ecosystem";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  GraduationCap,
  Calculator,
  Tv,
  BookOpen,
  Sparkles,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LIVE: { label: "HOẠT ĐỘNG (LIVE)", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
  BETA: { label: "THỬ NGHIỆM (BETA)", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
  DEVELOPMENT: { label: "ĐANG XÂY DỰNG (DEV)", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  PLANNED: { label: "KẾ HOẠCH (PLANNED)", color: "#94A3B8", bg: "rgba(148, 163, 184, 0.15)" },
};

export function CoreBusinessUnits() {
  return (
    <section id="ecosystem" className="w-full py-24 bg-[#0A1124] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 6 Đơn Vị Trong Hệ Sinh Thái
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Các Đơn Vị Chuyên Môn Trong Hệ Sinh Thái
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Khám phá 6 đơn vị chuyên môn được liên kết đồng bộ thông qua giao thức đa tác tử HAIP, từ hạ tầng công nghệ hạt nhân, đào tạo giáo dục số, trợ lý thông tin thuế đến truyền thông chuyên biệt.
          </p>
        </div>

        {/* 6 Organizations Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PUBLIC_ECOSYSTEM.map((org) => {
            const Icon = ICON_MAP[org.icon_name] || Cpu;
            const statusStyle = STATUS_CONFIG[org.public_status] || STATUS_CONFIG.DEVELOPMENT;

            return (
              <div
                key={org.id}
                className="rounded-3xl bg-[#0F172A] border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group relative overflow-hidden"
                style={{
                  borderColor: `${org.accent_color}30`,
                }}
              >
                {/* Top decorative gradient ambient spot */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: org.accent_color }}
                />

                <div className="space-y-4 relative z-10">
                  {/* Top Header: Icon + Status */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg"
                      style={{ backgroundColor: org.badge_bg, color: org.badge_text }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        borderColor: `${statusStyle.color}40`,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Brand Role Badge */}
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1"
                      style={{
                        backgroundColor: org.badge_bg,
                        color: org.badge_text,
                      }}
                    >
                      {org.brand_role}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-[#00E5FF] transition-colors">
                      {org.display_name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                    {org.short_description}
                  </p>

                  {/* Public Capabilities (Top 3) */}
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Năng lực chuyên môn:
                    </span>
                    {org.public_capabilities.slice(0, 3).map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-200">
                        <CheckCircle
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: org.accent_color }}
                        />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {/* Product Groups (Cleaned for mobile) */}
                  <div className="space-y-1 pt-2 hidden sm:block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sản phẩm & Ứng dụng:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {org.public_product_groups.map((prod, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-6 border-t border-white/5 mt-6 relative z-10">
                  <Link
                    href={org.public_website_target}
                    target={org.public_website_target.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all hover:scale-102"
                    style={{ backgroundColor: org.accent_color }}
                  >
                    <span>Khám phá nền tảng</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
