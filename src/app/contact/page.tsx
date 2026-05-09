"use client";

import { Mail, Phone, MapPin, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { submitContact } from "@/actions/contact";

export default function ContactPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);

    if (result.success) {
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMsg(result.error || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
    
    setIsPending(false);
  };

  return (
    <main className="flex-1 py-12 md:py-20 relative overflow-hidden min-h-screen">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Sẵn sàng chuyển đổi số cùng <span className="text-secondary">AI & Automation?</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Để lại thông tin về vấn đề hoặc quy trình bạn muốn tối ưu. Chúng tôi sẽ phân tích và phản hồi giải pháp tự động hóa phù hợp nhất trong 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Contact Info */}
          <div className="flex flex-col space-y-8">
            <div className="glass-panel p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Email chuyên gia</div>
                    <a href="mailto:huytechnologyai2025@gmail.com" className="text-foreground/70 hover:text-secondary transition-colors">huytechnologyai2025@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Hotline tư vấn</div>
                    <a href="tel:0961364600" className="text-foreground/70 hover:text-secondary transition-colors">096.136.4600</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold mb-1">Văn phòng</div>
                    <div className="text-foreground/70">K6A, Tổ 15D, Khu phố 30, Phường Tam Hiệp, Thành phố Đồng Nai</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-secondary/20 bg-gradient-to-br from-surface to-secondary/5">
              <div className="w-12 h-12 bg-secondary text-surface rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Đặt lịch 1-1 ngay</h3>
              <p className="text-foreground/70 mb-6">Bạn muốn trao đổi trực tiếp qua Google Meet? Hãy chọn thời gian rảnh của bạn trên lịch của tôi.</p>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-transparent border border-secondary text-secondary font-bold hover:bg-secondary hover:text-black hover:shadow-[0_0_15px_rgba(0,255,133,0.3)] transition-all">
                Mở lịch Calendly
              </button>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border-t border-l border-white/10 relative">
            {isSuccess ? (
              <div className="absolute inset-0 z-10 bg-surface/95 backdrop-blur flex flex-col items-center justify-center rounded-3xl text-center p-8">
                <CheckCircle2 className="w-20 h-20 text-secondary mb-6" />
                <h3 className="text-3xl font-bold mb-2">Gửi thành công!</h3>
                <p className="text-foreground/70 mb-8">
                  Cảm ơn bạn đã liên hệ. Hệ thống đã ghi nhận thông tin và chuyên gia sẽ liên lạc với bạn sớm nhất.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2 bg-secondary text-black font-bold rounded-full hover-glow transition-all"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : null}

            <h2 className="text-2xl font-bold mb-8">Gửi yêu cầu giải pháp</h2>
            
            {errorMsg && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground/80">Họ và Tên *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/80">Email doanh nghiệp *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                    placeholder="nguyenvana@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium text-foreground/80">Tên doanh nghiệp / Đơn vị công tác</label>
                <input 
                  type="text" 
                  id="company" 
                  name="company"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                  placeholder="Công ty CP Công nghệ..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground/80">Mô tả vấn đề/Quy trình cần tự động hóa *</label>
                <textarea 
                  id="message" 
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow resize-none"
                  placeholder="Ví dụ: Hiện tại phòng kinh doanh đang phải nhập dữ liệu thủ công từ Facebook về Google Sheets, mất 2 tiếng mỗi ngày..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-secondary text-black font-bold text-lg hover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isPending ? 'Đang gửi...' : 'Gửi yêu cầu phân tích'}
                {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <p className="text-xs text-center text-foreground/50 mt-4">
                Bằng việc gửi form này, bạn đồng ý với chính sách bảo mật thông tin của chúng tôi.
              </p>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
