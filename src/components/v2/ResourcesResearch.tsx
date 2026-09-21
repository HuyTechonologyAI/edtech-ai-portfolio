"use client";

import Link from "next/link";
import { FileText, ArrowRight, Download, BookOpen } from "lucide-react";

export function ResourcesResearch() {
  const items = [
    {
      type: "Whitepaper Kỹ Thuật",
      title: "Giao Thức Điều Phối Đa Tác Tử Doanh Nghiệp HAIP/1.0",
      description: "Tài liệu đặc tả kiến trúc phong bì thông điệp, ma trận bảo mật Zero-Trust và phân cấp ủy quyền giữa các tác tử.",
      link: "/resources",
      accent: "#00E5FF",
    },
    {
      type: "Cẩm Nang Ứng Dụng",
      title: "Bộ Ma Trận Đặc Tả Soạn Giáo Án AI Chuẩn Công Văn 5512",
      description: "Hướng dẫn thực chiến dành cho giáo viên trung học và phổ thông tích hợp AI vào quy trình sư phạm theo quy định của Bộ GD&ĐT.",
      link: "/resources",
      accent: "#00FF85",
    },
    {
      type: "Tài Liệu Tự Động Hóa",
      title: "Thư Viện Kịch Bản n8n & Make Tự Động Hóa Vận Hành",
      description: "Tổng hợp các mẫu workflow tự động hóa kết nối CRM, Zalo OA, kế toán và xử lý đơn hàng dành cho SME.",
      link: "/resources",
      accent: "#3B82F6",
    },
  ];

  return (
    <section id="resources" className="w-full py-24 bg-[#0A1124] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Nghiên Cứu & Tài Nguyên
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Tài Liệu & Báo Cáo Nghiên Cứu
            </h2>
            <p className="text-xs sm:text-base text-slate-300 font-normal">
              Các ấn phẩm chuyên môn, cẩm nang ứng dụng và tài liệu hướng dẫn do đội ngũ kiến trúc sư HUY AI phát hành.
            </p>
          </div>

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00E5FF] hover:underline shrink-0"
          >
            <span>Xem tất cả tài liệu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#0F172A] border border-white/10 p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block"
                  style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                >
                  {item.type}
                </span>
                <h3 className="text-base font-extrabold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-white/5">
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#00E5FF] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Tải tài liệu</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
