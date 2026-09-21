"use client";

import { Award, TrendingUp, CheckCircle, Clock } from "lucide-react";

export function CaseStudiesSection() {
  const cases = [
    {
      client: "Khối Giáo Viên Phổ Thông & Nghề",
      domain: "Giáo Dục & Sư Phạm Số",
      title: "Hỗ Trợ Biên Soạn Giáo Án Chuẩn CV 5512",
      status: "LIVE APPLICATION",
      metric: "CV 5512 / TT 22",
      metricLabel: "Chuẩn hóa định dạng sư phạm",
      solution: "Ứng dụng Smart Teacher Schedule AI hỗ trợ thầy cô cấu trúc kế hoạch bài dạy theo khung Công văn 5512 và hỗ trợ tính toán sổ điểm theo Thông tư 22.",
      accent: "#00FF85",
    },
    {
      client: "Doanh Nghiệp Kế Toán & SME",
      domain: "Tài Chính & Kê Khai Thuế",
      title: "Bóc Tách Dữ Liệu Hóa Đơn Bằng OCR",
      status: "BETA TESTING",
      metric: "OCR + Tra Cứu",
      metricLabel: "Bóc tách & đối soát thông tin",
      solution: "Thử nghiệm mô hình SmartTax AI hỗ trợ trích xuất trường dữ liệu từ hóa đơn điện tử, phục vụ tham khảo và kiểm tra chéo trước khi kê khai chính thức.",
      accent: "#3B82F6",
    },
    {
      client: "Đơn Vị Dịch Vụ & Đào Tạo",
      domain: "Automation Đa Kênh",
      title: "Quy Trình Tự Động Hóa Thông Báo n8n",
      status: "PILOT / WORKFLOW",
      metric: "Workflow n8n",
      metricLabel: "Tự động hóa luồng tiếp nhận",
      solution: "Thiết lập kịch bản kết nối tiếp nhận form đăng ký, gửi thông báo xác nhận và đồng bộ danh sách học viên nội bộ một cách liền mạch.",
      accent: "#00E5FF",
    },
  ];

  return (
    <section id="case-studies" className="w-full py-24 bg-[#070B14] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            Ứng Dụng Thực Tiễn
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Dự Án Ứng Dụng & Thử Nghiệm Thực Tế
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Minh họa các giải pháp và thử nghiệm thực tế do HUY TECHNOLOGY AI GROUP nghiên cứu, phát triển và thử nghiệm cùng đối tác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#0F172A] border border-white/10 p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
                    {c.domain}
                  </span>
                  <span
                    className="text-2xl font-black tracking-tight"
                    style={{ color: c.accent }}
                  >
                    {c.metric}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {c.client}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {c.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {c.solution}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">{c.metricLabel}</span>
                <span className="font-bold flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-white/10" style={{ color: c.accent }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
