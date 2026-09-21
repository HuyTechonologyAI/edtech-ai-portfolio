"use client";

import { ShieldCheck, Lock, UserCheck, Eye, Scale, AlertTriangle } from "lucide-react";

export function SecurityGovernance() {
  const principles = [
    {
      title: "Zero-Trust & RLS Matrix",
      description: "Chính sách bảo mật hàng (Row-Level Security) độc lập cho từng tổ chức. Không một tác tử nào có quyền truy cập dữ liệu ngoài phạm vi được chỉ định.",
      icon: Lock,
      accent: "#00E5FF",
    },
    {
      title: "Human-in-the-Loop (HITL)",
      description: "Mọi tác vụ có mức độ rủi ro R3 (Yêu cầu phê duyệt) và R4 (Quan trọng) đều phải có sự xác nhận của con người trước khi thực thi vào hệ thống sản xuất.",
      icon: UserCheck,
      accent: "#F59E0B",
    },
    {
      title: "Quyền Hạn Tối Thiểu (Least Privilege)",
      description: "Tác tử chỉ được cấp đúng những công cụ cần thiết để hoàn thành nhiệm vụ. 6 quyền nhạy cảm (ghi production, truy cập tài chính) bị khóa cấp phát ngầm.",
      icon: ShieldCheck,
      accent: "#10B981",
    },
    {
      title: "Nhật Ký & Vết Kiểm Toán (Auditability)",
      description: "Các bước xử lý nghiệp vụ, lịch sử thao tác và chi phí vận hành được ghi nhận hệ thống, phục vụ việc đối soát và minh bạch thông tin.",
      icon: Eye,
      accent: "#3B82F6",
    },
  ];

  return (
    <section className="w-full py-24 bg-[#0A1124] border-t border-white/5">
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
                  <span>Tuân thủ quy chuẩn</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
