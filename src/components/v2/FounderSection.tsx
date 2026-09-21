"use client";

import { Award, Compass, Sparkles, CheckCircle2 } from "lucide-react";

export function FounderSection() {
  return (
    <section id="leadership" className="w-full py-24 bg-[#070B14] border-t border-white/5 relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Founder Portrait Frame */}
          <div className="w-full lg:w-5/12 max-w-md">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.jpg"
                alt="Ngô Quốc Huy - Nhà sáng lập & Giám đốc HUY TECHNOLOGY AI GROUP"
                loading="lazy"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/30 to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-[11px] font-extrabold uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Nhà Sáng Lập & Giám Đốc
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Ngô Quốc Huy
                </h3>
                <p className="text-xs text-[#00E5FF] font-semibold mt-0.5">
                  Kiến trúc sư hệ thống & Nhà sáng lập
                </p>
              </div>
            </div>
          </div>

          {/* Right: Leadership Credibility Details */}
          <div className="w-full lg:w-7/12 space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Compass className="w-3.5 h-3.5 text-[#00E5FF]" /> Lãnh Đạo & Sứ Mệnh
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Kiến Tạo Giải Pháp Từ Kỷ Luật Kỹ Thuật
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Xuất thân là Kỹ sư Cơ khí Chế tạo (ĐH Sư Phạm Kỹ Thuật TP.HCM) và nhà giáo dục công nghệ, tôi chuyển hóa tư duy cơ điện tử chính xác và kỷ luật kỹ thuật vào kiến trúc phần mềm đa tác tử. Mục tiêu của HUY TECHNOLOGY AI GROUP là giải phóng con người khỏi những công việc thủ công đơn điệu, trao quyền cho doanh nghiệp và nhà giáo làm chủ kỷ nguyên số.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Award className="w-5 h-5" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Thành Tựu Tiêu Biểu
                  </h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Danh hiệu <strong>"Người thợ trẻ giỏi toàn quốc" (2020)</strong> do Trung ương Đoàn TNCS Hồ Chí Minh trao tặng.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Giải Nhất <strong>"Khởi nghiệp Đổi mới Sáng tạo OCOP"</strong> tỉnh Đồng Nai (2020).</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#00E5FF]">
                  <Compass className="w-5 h-5" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Triết Lý Vận Hành
                  </h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <span>Công nghệ phải giải quyết bài toán thực tế và mang lại giá trị đo đếm được.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <span>Trí tuệ nhân tạo luôn đồng hành và dưới sự giám sát đạo đức của con người.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
