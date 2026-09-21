"use client";

import { UserCheck, Crown, Building, Layers, Cpu, Wrench, ShieldAlert } from "lucide-react";

export function AgentHierarchyDiagram() {
  const levels = [
    {
      level: "Cấp 4",
      title: "Chỉ Đạo Con Người (Human Direction)",
      role: "Hội Đồng Quản Trị & Ban Lãnh Đạo",
      description: "Xác lập mục tiêu chiến lược, kiểm soát chính sách và giữ quyền phê duyệt tối cao cho các tác vụ quan trọng.",
      icon: UserCheck,
      color: "#00E5FF",
    },
    {
      level: "Cấp 4 AI",
      title: "Tác Tử Điều Phối Tập Đoàn (Group AI)",
      role: "Điều Phối Kiến Trúc Hệ Sinh Thái",
      description: "Tiếp nhận mục tiêu chiến lược, phân rã chỉ tiêu và điều phối có kiểm soát sang từng đơn vị chuyên môn.",
      icon: Crown,
      color: "#33EBFF",
    },
    {
      level: "Cấp 3",
      title: "Tác Tử Đơn Vị Chuyên Môn (Company AI)",
      role: "Điều Phối Theo Từng Trụ Cột Nghiệp Vụ",
      description: "Quản trị kết quả vận hành độc lập theo từng lĩnh vực: Công nghệ lõi, Giáo dục số, Trợ lý thuế và Truyền thông.",
      icon: Building,
      color: "#0070F3",
    },
    {
      level: "Cấp 2",
      title: "Tác Tử Nghiệp Vụ Bộ Phận (Department AI)",
      role: "Quản Trị Quy Trình Chuyên Biệt",
      description: "Lập kế hoạch và kiểm soát luồng công việc nội bộ theo từng chuyên môn: kỹ thuật, học vụ, đối soát dữ liệu.",
      icon: Layers,
      color: "#00FF85",
    },
    {
      level: "Cấp 1",
      title: "Tác Tử Chuyên Viên (Specialist AI)",
      role: "Thực Thi Tác Vụ Cụ Thể",
      description: "Hỗ trợ soạn thảo giáo án định hướng sư phạm, chuẩn bị dữ liệu văn bản đối chiếu, viết mã nguồn theo kịch bản.",
      icon: Cpu,
      color: "#F59E0B",
    },
    {
      level: "Cấp 0",
      title: "Công Cụ & Bộ Chuyển Đổi (AI Tools & Adapters)",
      role: "Kết Nối Hệ Thống Phân Tán",
      description: "Hàng đợi xử lý tác vụ bền vững, cơ chế tính toán bảo vệ dữ liệu, vector search và giao diện tích hợp API an toàn.",
      icon: Wrench,
      color: "#8B5CF6",
    },
  ];

  return (
    <section id="ai-agency" className="w-full py-20 bg-[#070B14]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Mô Hình Vận Hành An Toàn
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Kiến Trúc AI Agency Phân Cấp & Giám Sát
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Không tự trị mất kiểm soát. Mỗi tác vụ trong hệ sinh thái HUY AI đều được phân cấp rõ ràng, tuân thủ nguyên tắc ủy nhiệm có giám sát và bảo vệ dữ liệu theo chuẩn giao thức HAIP.
          </p>
        </div>

        {/* 6-Step Vertical Flow with Connecting Lines */}
        <div className="max-w-4xl mx-auto space-y-4 relative">
          {levels.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl bg-[#0F172A] border border-white/10 p-5 md:p-6 transition-all hover:border-white/20 hover:scale-[1.01] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{
                  borderLeftColor: item.color,
                  borderLeftWidth: "4px",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        {item.level}
                      </span>
                      <h3 className="text-sm md:text-base font-extrabold text-white">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden md:block">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {item.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Governance Commitment Footer */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-2xl mx-auto">
          <p>
            🔒 <strong className="text-white">Nguyên tắc bảo vệ dữ liệu:</strong> Toàn bộ dữ liệu của đối tác và khách hàng được phân vùng cách ly logic, chỉ xử lý trong phạm vi được chỉ định và luôn dưới sự giám sát của con người đối với các tác vụ rủi ro cao.
          </p>
        </div>
      </div>
    </section>
  );
}
