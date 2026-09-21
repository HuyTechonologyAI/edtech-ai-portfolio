"use client";

import { Cpu, Server, Network, Database, Shield, FileCode } from "lucide-react";

export function TechnologyArchitecture() {
  const pillars = [
    {
      title: "Giao Thức Điều Phối HAIP",
      description: "Huy AI Inter-Agent Protocol: Khung điều phối nội bộ kiểm soát ủy quyền tác tử, chuẩn hóa cấu trúc dữ liệu và phân tách trách nhiệm nghiệp vụ.",
      icon: FileCode,
      accent: "#00E5FF",
    },
    {
      title: "Xử Lý Tác Vụ Bền Vững (Durable Processing)",
      description: "Cơ chế hàng đợi phân tán đảm bảo mọi yêu cầu được tiếp nhận, xử lý theo thứ tự ưu tiên và kiểm soát lỗi tự động mà không làm mất mát dữ liệu.",
      icon: Database,
      accent: "#0070F3",
    },
    {
      title: "Kiến Trúc AI Linh Hoạt (Local + Cloud)",
      description: "Kết hợp linh hoạt giữa đám mây và môi trường tính toán tại chỗ (On-Premises). Dữ liệu bảo mật của doanh nghiệp được xử lý cục bộ an toàn.",
      icon: Server,
      accent: "#00FF85",
    },
    {
      title: "Hệ Tri Thức Phân Vùng Nghiệp Vụ",
      description: "Không gian truy xuất tri thức được phân vùng nghiêm ngặt theo từng đơn vị, đảm bảo dữ liệu chuyên môn được bảo vệ và cách ly logic hoàn toàn.",
      icon: Network,
      accent: "#8B5CF6",
    },
  ];

  return (
    <section id="technology" className="w-full py-24 bg-[#070B14] border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            Nền Tảng Kỹ Thuật
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Kiến Trúc Công Nghệ & Năng Lực Vận Hành
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Hạ tầng công nghệ tự chủ, kết hợp linh hoạt giữa điện toán đám mây và tính toán cục bộ, mang lại sự tin cậy và an toàn tối đa cho đối tác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0F172A] border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${item.accent}15`, color: item.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 text-[11px] font-bold text-slate-400">
                  <span style={{ color: item.accent }}>Đặc tính: </span>
                  <span>Bảo mật theo thiết kế</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
