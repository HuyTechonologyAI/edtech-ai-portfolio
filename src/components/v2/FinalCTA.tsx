"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export function FinalCTA() {
  const [intent, setIntent] = useState("automation");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="contact" className="w-full py-24 bg-[#070B14] border-t border-white/5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        <div className="rounded-3xl bg-[#0F172A] border border-white/10 p-8 md:p-12 lg:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Khởi Đầu Chuyển Đổi Số
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Sẵn Sàng Nâng Tầm Vận Hành Cùng AI?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Để lại thông tin về nhu cầu của bạn. Đội ngũ chuyên gia và kiến trúc sư HUY AI sẽ phân tích và phản hồi phương án tự động hóa phù hợp nhất trong vòng 24h làm việc.
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Hotline / Zalo:</span>
                    <a href="https://zalo.me/0961364600" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-[#00E5FF]">
                      096.136.4600
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Email Doanh Nghiệp:</span>
                    <span className="font-bold text-white">huytechnologyai2025@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Văn Phòng:</span>
                    <span className="text-slate-300">Tam Hiệp, TP. Biên Hòa, Đồng Nai</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Hỗ trợ thỏa thuận bảo mật (NDA) theo yêu cầu dự án</span>
              </div>
            </div>

            {/* Right Interactive Multi-Intent Form */}
            <div className="lg:col-span-7 bg-[#070B14]/80 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    Gửi Yêu Cầu Thành Công!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Cảm ơn bạn đã liên hệ với HUY TECHNOLOGY AI GROUP. Chuyên viên phụ trách đúng lĩnh vực sẽ liên hệ tư vấn trực tiếp trong 24 giờ.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Intent Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                      Bạn đang quan tâm đến lĩnh vực nào?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: "automation", label: "Tự Động Hóa Doanh Nghiệp" },
                        { id: "education", label: "Đào Tạo / AI School" },
                        { id: "tax", label: "Kê Khai Thuế / SmartTax" },
                        { id: "media", label: "Hợp Tác Truyền Thông" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setIntent(item.id)}
                          className={`py-2 px-3 rounded-xl border text-left font-semibold transition-all ${
                            intent === item.id
                              ? "bg-[#00E5FF]/15 border-[#00E5FF] text-white"
                              : "bg-surface/50 border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Org */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">
                        Đơn vị / Doanh nghiệp
                      </label>
                      <input
                        type="text"
                        placeholder="Tên công ty hoặc trường học"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">
                        Số điện thoại / Zalo *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        placeholder="email@doanhnghiep.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">
                      Mô tả bài toán hoặc nhu cầu cần tối ưu
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả quy trình bạn muốn ứng dụng AI hoặc tự động hóa..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#00E5FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? "Đang xử lý..." : "Gửi yêu cầu tư vấn giải pháp"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
