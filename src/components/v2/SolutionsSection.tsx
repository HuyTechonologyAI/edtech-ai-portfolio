"use client";

import Link from "next/link";
import { Workflow, Server, BookOpen, Calculator, ArrowRight, Check } from "lucide-react";

export function SolutionsSection() {
  const solutions = [
    {
      title: "Tự Động Hóa Quy Trình (AI Automation)",
      category: "Doanh Nghiệp & Vận Hành",
      status: "ĐANG TRIỂN KHAI",
      description: "Xây dựng các luồng làm việc tự động hóa với công cụ mã nguồn mở và tác tử AI. Xử lý lead bán hàng, hỗ trợ đồng bộ dữ liệu và chuẩn bị báo cáo định kỳ.",
      benefits: [
        "Chuẩn hóa và tự động hóa các tác vụ thủ công lặp lại",
        "Tích hợp linh hoạt hệ thống thông tin và kênh liên lạc",
        "Hỗ trợ phân tích dữ liệu quy trình thời gian thực",
      ],
      icon: Workflow,
      accent: "#00E5FF",
    },
    {
      title: "Hạ Tầng AI Nội Bộ (Private AI Hosting)",
      category: "Bảo Mật & Tự Chủ Dữ Liệu",
      status: "THỬ NGHIỆM KỸ THUẬT",
      description: "Hỗ trợ triển khai mô hình AI cục bộ và giải pháp trích xuất tri thức (RAG) trên hạ tầng máy chủ của doanh nghiệp. Dữ liệu nghiệp vụ được xử lý tại chỗ.",
      benefits: [
        "Kiểm soát dữ liệu nội bộ theo chính sách phân quyền",
        "Tối ưu chi phí vận hành dài hạn cho doanh nghiệp",
        "Linh hoạt tích hợp phần cứng sẵn có",
      ],
      icon: Server,
      accent: "#0070F3",
    },
    {
      title: "Giáo Dục Số & Sư Phạm Thông Minh",
      category: "Trường Học & Giảng Viên",
      status: "SẢN PHẨM HOẠT ĐỘNG",
      description: "Hệ thống công cụ hỗ trợ giáo viên thiết kế kế hoạch bài dạy theo ma trận đặc tả chuẩn Công văn 5512 và hỗ trợ theo dõi nền tảng học tập số.",
      benefits: [
        "Hỗ trợ cấu trúc bài giảng theo ma trận định hướng CV 5512",
        "Hỗ trợ quản lý dữ liệu điểm danh và học vụ",
        "Công cụ báo thức lịch dạy kép chống quên ca",
      ],
      icon: BookOpen,
      accent: "#00FF85",
    },
    {
      title: "Trợ Lý Kê Khai Thuế & Pháp Lý Doanh Nghiệp",
      category: "Kế Toán & Doanh Nghiệp",
      status: "PHIÊN BẢN BETA",
      description: "Trợ lý hỗ trợ trích xuất thông tin hóa đơn chứng từ, tra cứu quy chuẩn luật thuế có dẫn nguồn điều khoản và hỗ trợ chuyên gia kế toán đối chiếu số liệu.",
      benefits: [
        "Hỗ trợ đọc dữ liệu chứng từ số phục vụ kiểm tra",
        "Tra cứu điều khoản thông tư pháp lý rõ ràng",
        "Cổng kết nối chuyên gia kế toán đối soát chuyên môn",
      ],
      icon: Calculator,
      accent: "#3B82F6",
    },
  ];

  return (
    <section id="solutions" className="w-full py-24 bg-[#070B14] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            Giải Pháp Chuyên Sâu
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Giải Pháp AI & Tự Động Hóa Thực Tiễn
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Chúng tôi thiết kế các giải pháp ứng dụng AI phù hợp với từng nghiệp vụ then chốt, chú trọng tính chính xác, bảo mật dữ liệu và sự kiểm soát của con người.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {solutions.map((item, idx) => {
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#00E5FF] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {item.benefits.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2 text-xs text-slate-200">
                        <Check className="w-4 h-4 text-[#00E5FF] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <Link
                    href="#contact"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#00E5FF] hover:underline"
                  >
                    <span>Trao đổi về giải pháp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
