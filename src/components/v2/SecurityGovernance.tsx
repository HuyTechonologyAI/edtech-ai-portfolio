"use client";

import { ShieldCheck, Lock, UserCheck, Eye, Scale } from "lucide-react";

export function SecurityGovernance() {
  const principles = [
    {
      title: "Phân Quyền Theo Phạm Vi Dữ Liệu",
      description: "Quyền truy cập được giới hạn theo vai trò, ngữ cảnh và phạm vi dữ liệu được cho phép.",
      icon: Lock,
      accent: "#00E5FF",
    },
    {
      title: "Giám Sát Của Con Người (Human-in-the-Loop)",
      description: "Những tác vụ có mức độ rủi ro cao yêu cầu con người xem xét và phê duyệt trước khi thực hiện.",
      icon: UserCheck,
      accent: "#F59E0B",
    },
    {
      title: "Quyền Hạn Tối Thiểu (Least Privilege)",
      description: "Tác tử chỉ được cấp đúng những công cụ và tài nguyên cần thiết để hoàn thành nhiệm vụ được giao.",
      icon: ShieldCheck,
      accent: "#10B981",
    },
    {
      title: "Nhật Ký & Khả Năng Truy Vết (Auditability)",
      description: "Các hoạt động quan trọng được ghi nhận để hỗ trợ kiểm tra, đối soát và cải tiến quy trình.",
      icon: Eye,
      accent: "#3B82F6",
    },
  ];

  return (
    <section id="security" className="w-full py-24 bg-[#0A1124] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Quản Trị & Đạo Đức AI
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            An Ninh & Trách Nhiệm Với Dữ Liệu
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Chúng tôi áp dụng các chuẩn mực bảo vệ dữ liệu và nguyên tắc an ninh theo từng cấp độ dự án, đặt sự an toàn thông tin lên hàng đầu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0F172A] border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${p.accent}15`, color: p.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Nguyên tắc thiết kế</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
