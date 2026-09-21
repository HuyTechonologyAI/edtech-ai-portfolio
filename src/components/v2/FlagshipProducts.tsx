"use client";

import Link from "next/link";
import { GraduationCap, Calculator, Cpu, ExternalLink, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function FlagshipProducts() {
  const products = [
    {
      name: "Smart Teacher Schedule AI (EduViet)",
      category: "EdTech & Sư Phạm Chuẩn CV 5512",
      statusBadge: "LIVE / ĐANG HOẠT ĐỘNG",
      statusColor: "#10B981",
      description: "Hệ thống hỗ trợ công việc toàn diện cho giáo viên: Báo thức lịch dạy kép chống quên ca, hỗ trợ quản lý học sinh và trợ lý AI cấu trúc giáo án theo ma trận Công văn 5512.",
      highlights: [
        "Hỗ trợ cấu trúc giáo án theo định hướng CV 5512",
        "Hỗ trợ ghi nhận điểm danh và theo dõi học vụ",
        "Báo thức ca dạy kép hỗ trợ quản lý thời gian",
        "Ứng dụng đa nền tảng Web, Android và Windows",
      ],
      link: "https://gvcncdsai.io.vn",
      accent: "#00FF85",
      btnText: "Khám phá tại gvcncdsai.io.vn",
      icon: GraduationCap,
    },
    {
      name: "SmartTax AI Platform",
      category: "FinTech & Trợ Lý Thông Tin Thuế",
      statusBadge: "BETA / THỬ NGHIỆM",
      statusColor: "#3B82F6",
      description: "Giải pháp hỗ trợ thông tin thuế và kiểm tra chứng từ số cho kế toán và hộ kinh doanh: Hỗ trợ trích xuất hóa đơn, tra cứu văn bản thuế định danh và kết nối chuyên gia đối soát.",
      highlights: [
        "Tra cứu quy chuẩn luật & thông tư thuế có dẫn nguồn",
        "Hỗ trợ trích xuất thông tin hóa đơn phục vụ đối chiếu",
        "Cổng kết nối chuyên gia kế toán đối soát chuyên môn",
        "Công cụ hỗ trợ thông tin, không thay thế đại diện pháp lý",
      ],
      link: "https://smarttax-ai.vercel.app",
      accent: "#3B82F6",
      btnText: "Khám phá tại smarttax-ai.vercel.app",
      icon: Calculator,
    },
    {
      name: "AI Agency as a Service (AaaS Platform)",
      category: "Nền Tảng Điều Phối Tác Tử Doanh Nghiệp",
      statusBadge: "DEVELOPMENT / ĐANG PHÁT TRIỂN",
      statusColor: "#F59E0B",
      description: "Khung kiến trúc điều phối tác tử tự trị trung tâm cho doanh nghiệp. Quản trị hàng đợi xử lý tác vụ bền vững, phân cấp ủy quyền theo chính sách và kiểm soát rủi ro đa tầng.",
      highlights: [
        "Kiến trúc điều phối đa tác tử phân cấp theo năng lực",
        "Hàng đợi nhiệm vụ bền vững với cơ chế kiểm soát lỗi",
        "Hỗ trợ môi trường xử lý tại chỗ bảo vệ dữ liệu",
        "Vết kiểm toán và giải trình minh bạch luồng thực thi",
      ],
      link: "#contact",
      accent: "#00E5FF",
      btnText: "Tìm hiểu kiến trúc điều phối",
      icon: Cpu,
    },
  ];

  return (
    <section id="products" className="w-full py-24 bg-[#0A1124] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Nền Tảng & Ứng Dụng
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Sản Phẩm & Nền Tảng Chuyên Biệt
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Các sản phẩm phần mềm và nền tảng điều phối được thiết kế để giải quyết những thách thức thực tế trong giáo dục, tài chính thuế và vận hành doanh nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((prod, idx) => {
            const Icon = prod.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#0F172A] border p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group"
                style={{ borderColor: `${prod.accent}30` }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${prod.accent}18`, color: prod.accent }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${prod.statusColor}15`,
                        color: prod.statusColor,
                        borderColor: `${prod.statusColor}40`,
                      }}
                    >
                      {prod.statusBadge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-[#00E5FF] transition-colors">
                      {prod.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tính năng tiêu biểu:
                    </span>
                    {prod.highlights.map((h, hi) => (
                      <div key={hi} className="flex items-start gap-2 text-xs text-slate-200">
                        <ShieldCheck
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: prod.accent }}
                        />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <Link
                    href={prod.link}
                    target={prod.link.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-black transition-all hover:scale-102 shadow-lg"
                    style={{ backgroundColor: prod.accent }}
                  >
                    <span>{prod.btnText}</span>
                    {prod.link.startsWith("http") ? (
                      <ExternalLink className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
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
