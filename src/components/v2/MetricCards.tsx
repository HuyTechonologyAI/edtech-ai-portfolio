"use client";

import { Building2, Workflow, ShieldCheck, Server } from "lucide-react";

export function MetricCards() {
  const metrics = [
    {
      value: "06",
      label: "Đơn Vị Chuyên Biệt",
      sublabel: "Hệ sinh thái liên kết đa ngành",
      icon: Building2,
      accent: "#00E5FF",
    },
    {
      value: "AI + Auto",
      label: "Nền Tảng Vận Hành",
      sublabel: "Tự động hóa quy trình nghiệp vụ",
      icon: Workflow,
      accent: "#3B82F6",
    },
    {
      value: "Phê Duyệt",
      label: "Kiểm Soát Rủi Ro Cao",
      sublabel: "Giám sát con người (Human-in-the-Loop)",
      icon: ShieldCheck,
      accent: "#00FF85",
    },
    {
      value: "Linh Hoạt",
      label: "Local + Cloud",
      sublabel: "Kiến trúc xử lý bảo vệ dữ liệu",
      icon: Server,
      accent: "#8B5CF6",
    },
  ];

  return (
    <section className="w-full py-12 bg-[#0A1124] border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-[#0F172A]/80 border border-white/10 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: m.accent }}
                  >
                    {m.value}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                    style={{ backgroundColor: `${m.accent}18`, color: m.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-white mb-0.5">
                  {m.label}
                </h3>
                <p className="text-[11px] text-slate-400 font-normal">
                  {m.sublabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
