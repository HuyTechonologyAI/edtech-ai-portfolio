"use client";

import { GraduationCap, Calculator, Cpu, ArrowRight, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { TiltCard } from "@/components/TiltCard";

export function EcosystemSection() {
  const pillars = [
    {
      id: "eduviet",
      title: "Smart Teacher Schedule AI (EduViet)",
      category: "EdTech & Sư Phạm Thông Minh",
      domain: "gvcncdsai.io.vn",
      url: "https://gvcncdsai.io.vn",
      icon: GraduationCap,
      color: "from-amber-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-amber-500/30 hover:border-amber-400",
      textColor: "text-amber-400",
      btnBg: "bg-amber-500 hover:bg-amber-400 text-black",
      badge: "V2.0.0 Đa Nền Tảng",
      description: "Hệ sinh thái công nghệ toàn diện cho giáo viên và nhà trường: Báo thức ca dạy kép chống tắt ngầm, Sổ điểm & Học bạ điện tử chuẩn Thông tư 22, Trợ lý AI Soạn giáo án Công văn 5512 và Voice AI Tutor.",
      highlights: [
        "Soạn bài & Đề thi Ma trận đặc tả chuẩn CV 5512",
        "Sổ điểm & Điểm danh 1 chạm Thông tư 22",
        "Báo thức ca dạy kép 60m & 15m đa tầng",
        "Đa nền tảng Android, Windows Desktop, Web & iOS"
      ],
      ctaText: "Truy Cập EduViet AI"
    },
    {
      id: "smarttax",
      title: "SmartTax AI",
      category: "FinTech & Kê Khai Thuế Doanh Nghiệp",
      domain: "smarttax-ai.vercel.app",
      url: "https://smarttax-ai.vercel.app",
      icon: Calculator,
      color: "from-cyan-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-cyan-500/30 hover:border-cyan-400",
      textColor: "text-cyan-400",
      btnBg: "bg-cyan-500 hover:bg-cyan-400 text-black",
      badge: "Kê Khai Tự Động",
      description: "Giải pháp chuyển đổi số tài chính thuế thông minh cho Doanh nghiệp, Kế toán và Hộ kinh doanh: Bóc tách hóa đơn điện tử tự động bằng OCR AI, kiểm tra tính hợp lệ thuế và tối ưu chi phí.",
      highlights: [
        "Phân tích & Quản lý Hóa đơn điện tử thông minh",
        "Tự động lập tờ khai thuế GTGT, TNDN chuẩn quy định",
        "Cảnh báo rủi ro hóa đơn và đối soát sai lệch",
        "Tối ưu hóa thời gian kế toán và chi phí vận hành"
      ],
      ctaText: "Khám Phá SmartTax AI"
    },
    {
      id: "autoexpert",
      title: "AI & AutoExpert (ZentraTech)",
      category: "Automation & Đào Tạo Chuyển Đổi Số",
      domain: "huycncdsai.io.vn",
      url: "https://huycncdsai.io.vn",
      icon: Cpu,
      color: "from-secondary/20 via-emerald-500/10 to-transparent",
      borderColor: "border-secondary/30 hover:border-secondary",
      textColor: "text-secondary",
      btnBg: "bg-secondary hover:bg-secondary/90 text-black",
      badge: "Hub Đào Tạo Thực Chiến",
      description: "Trung tâm đào tạo kỹ năng thực chiến và chuyển giao công nghệ tự động hóa: Làm chủ n8n, Make.com, AI Agent, Kịch bản MMO tự động và Kho tài nguyên biểu mẫu cao cấp cho cá nhân và doanh nghiệp.",
      highlights: [
        "Lộ trình học n8n, Make & AI từ cơ bản đến nâng cao",
        "Kho tài liệu Ebook, Slide & Kịch bản tự động hóa thực chiến",
        "Hệ thống cấp Chứng chỉ Tốt nghiệp xác thực điện tử",
        "Tư vấn và chuyển giao giải pháp AI 1-1"
      ],
      ctaText: "Đang Học Tại Hub Này",
      isCurrent: true
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-surface/30 border-y border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Hệ Sinh Thái Đồng Bộ Chéo
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Huy Technology <span className="text-secondary neon-glow-text">AI Hub</span>
          </h2>
          <p className="text-foreground/70 text-sm md:text-base leading-relaxed">
            Hệ sinh thái chuyển đổi số đa ngành do Kỹ sư <strong>Ngô Quốc Huy</strong> sáng lập, kết nối mật thiết giữa <strong>Giáo dục Sư phạm (EduViet)</strong>, <strong>Tài chính Thuế (SmartTax AI)</strong> và <strong>Tự động hóa Quy trình (AI &amp; AutoExpert)</strong> để mang lại giá trị gia tăng tối đa cho người học và đối tác.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`glass-panel rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${p.borderColor} relative group hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} border border-white/10 flex items-center justify-center ${p.textColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 ${p.textColor} bg-white/5`}>
                      {p.badge}
                    </span>
                  </div>

                  <div className="text-[11px] uppercase tracking-wider text-foreground/50 font-bold mb-1">
                    {p.category}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-white transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-foreground/70 leading-relaxed mb-6 line-clamp-4">
                    {p.description}
                  </p>

                  <div className="space-y-2 border-t border-white/5 pt-4 mb-6">
                    {p.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${p.textColor} shrink-0 mt-0.5`} />
                        <span className="leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[11px] text-foreground/40 font-mono mb-3 truncate">
                    🔗 {p.domain}
                  </div>
                  {p.isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{p.ctaText}</span>
                    </div>
                  ) : (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2.5 rounded-xl ${p.btnBg} text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg`}
                    >
                      <span>{p.ctaText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-Platform Ecosystem Synergy Banner */}
        <div className="mt-12 bg-gradient-to-r from-cyan-950/40 via-surface to-amber-950/30 rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Đồng Bộ Tài Khoản &amp; Ưu Đãi Chéo
            </div>
            <h4 className="text-lg md:text-xl font-bold text-foreground">
              Sở hữu 1 Tài khoản — Trải nghiệm trọn vẹn cả 3 giải pháp
            </h4>
            <p className="text-xs text-foreground/70 max-w-2xl leading-relaxed">
              Học viên tại <strong>AI &amp; AutoExpert</strong> được cấp quyền ưu tiên trải nghiệm Trợ lý Sư phạm <strong>EduViet</strong> và phân hệ kế toán thuế tự động <strong>SmartTax AI</strong> với chính sách chiết khấu và hỗ trợ kỹ thuật độc quyền.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3 bg-secondary text-black font-extrabold rounded-2xl text-xs hover:bg-secondary/90 transition-all flex items-center gap-2 shrink-0 shadow-[0_0_20px_rgba(0,255,133,0.3)]"
          >
            <span>Tư Vấn Hợp Tác Hệ Sinh Thái</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
