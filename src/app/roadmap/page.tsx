import { CheckCircle2, Circle } from "lucide-react";

export default function RoadmapPage() {
  const steps = [
    {
      title: "Giai đoạn 1: Tư duy Hệ thống & Nhập môn AI",
      description: "Hiểu rõ nguyên lý hoạt động của AI tạo sinh, cách chúng có thể giúp tiết kiệm 80% thời gian làm việc cơ bản. Xác định các điểm 'nút thắt' trong quy trình hiện tại.",
      status: "completed",
    },
    {
      title: "Giai đoạn 2: Làm chủ ChatGPT & Prompt Engineering",
      description: "Kỹ thuật viết Prompt nâng cao. Xây dựng thư viện Prompt riêng cho công việc hàng ngày (Marketing, Sales, Nhân sự, Lập trình).",
      status: "current",
    },
    {
      title: "Giai đoạn 3: Business Automation Cơ bản (Zapier/Make)",
      description: "Kết nối các ứng dụng phổ biến (Google Sheets, Gmail, Facebook, Slack). Xây dựng kịch bản tự động hóa đầu tiên không cần viết code (No-code).",
      status: "upcoming",
    },
    {
      title: "Giai đoạn 4: Tự động hóa Chuyên sâu với n8n & API",
      description: "Triển khai n8n trên server riêng để tiết kiệm chi phí. Kết nối sâu qua API. Xử lý dữ liệu lớn và các luồng logic phức tạp.",
      status: "upcoming",
    },
    {
      title: "Giai đoạn 5: Xây dựng AI Agents & Trợ lý ảo",
      description: "Kết hợp AI và Automation. Tạo ra các Agent có khả năng tự động đọc hiểu email, ra quyết định và phản hồi khách hàng như một nhân sự thật.",
      status: "upcoming",
    },
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Lộ trình <span className="text-secondary neon-glow-text">Master AI & Automation</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Hành trình từng bước từ người mới bắt đầu đến chuyên gia ứng dụng AI và Tự động hóa vào doanh nghiệp thực chiến.
          </p>
        </div>

        <div className="relative border-l-2 border-border ml-4 md:ml-0 md:left-1/2 md:-translate-x-1/2 space-y-12">
          {steps.map((step, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? "md:flex-row-reverse" : ""} group`}>
              {/* Icon / Marker */}
              <div className="absolute -left-[33px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-background border-4 border-surface shadow-sm z-10">
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-8 h-8 text-secondary drop-shadow-[0_0_8px_rgba(0,255,133,0.5)]" />
                ) : step.status === "current" ? (
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <Circle className="relative inline-flex rounded-full w-6 h-6 text-secondary fill-secondary/20" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-border" />
                )}
              </div>

              {/* Content Box */}
              <div className={`ml-12 md:ml-0 w-full md:w-5/12 p-6 glass-panel rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,255,133,0.1)] ${step.status === 'current' ? 'border-secondary/50 shadow-[0_0_20px_rgba(0,255,133,0.3)]' : ''}`}>
                <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${step.status === 'completed' ? 'text-secondary/70' : step.status === 'current' ? 'text-secondary neon-glow-text' : 'text-foreground/50'}`}>
                  {step.status === 'completed' ? 'Đã hoàn thành' : step.status === 'current' ? 'Đang học' : 'Sắp tới'}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-foreground/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-secondary text-black font-bold hover:bg-secondary/90 hover-glow transition-all">
            Đăng ký học ngay
          </button>
        </div>
      </div>
    </main>
  );
}
