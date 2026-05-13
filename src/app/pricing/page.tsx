"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, ShieldCheck, Zap, HelpCircle, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function PricingPage() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(true);
  const [customTiersList, setCustomTiersList] = useState<any[] | null>(null);

  useEffect(() => {
    // Nạp cấu hình ghi đè từ CSDL Admin Settings hoặc LocalStorage
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.saas_tiers) {
          setCustomTiersList(data.settings.saas_tiers);
        }
      })
      .catch(() => {
        const cached = localStorage.getItem("custom_saas_tiers");
        if (cached) setCustomTiersList(JSON.parse(cached));
      });
  }, []);

  const baseTiers = [
    {
      id: "free",
      name: "Free Member",
      target: "Dành cho người mới bắt đầu tìm hiểu",
      priceMonthly: 0,
      priceYearly: 0,
      popular: false,
      featured: false,
      desc: "Trải nghiệm giao diện và làm quen với lộ trình học tập ứng dụng AI.",
      cta: "Bắt đầu học ngay",
      href: "/resources",
      features: [
        "Xem trước 5 trang đầu Ebook & Slide",
        "Làm nhiệm vụ hàng ngày tích lũy Point",
        "Tham gia cộng đồng ZentraTech chung",
        "Tốc độ tích lũy thưởng tiêu chuẩn (x1)"
      ]
    },
    {
      id: "pro",
      name: "Pro Creator",
      target: "Khuyên dùng cho người làm nghề thực chiến",
      priceMonthly: 299000,
      priceYearly: 2490000, // Tiết kiệm ~2 tháng
      originalYearly: 3588000,
      popular: true,
      featured: true,
      desc: "Tải toàn bộ tài nguyên Premium và truy cập kho dữ liệu tự động hóa độc quyền.",
      cta: "Nâng cấp Pro ngay",
      href: "/checkout?plan=premium",
      features: [
        "Tải không giới hạn Ebook & Slide Premium",
        "Truy cập kho Prompt thực chiến x10 hiệu suất",
        "Xem trước tài liệu không giới hạn số trang",
        "Tốc độ đào Point nhanh gấp đôi (x2)",
        "Hỗ trợ giải đáp ưu tiên qua kênh riêng"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Team",
      target: "Dành cho Doanh nghiệp & Chuyên gia tối ưu hóa",
      priceMonthly: 999000,
      priceYearly: 8990000, // Tiết kiệm ~3 triệu
      originalYearly: 11988000,
      popular: false,
      featured: false,
      desc: "Làm chủ hoàn toàn kịch bản tự động hóa cấp cao kèm sự cố vấn trực tiếp 1-1.",
      cta: "Mở khóa gói VIP",
      href: "/checkout?plan=vip",
      features: [
        "Toàn bộ đặc quyền của gói Pro Creator",
        "Tải mã nguồn JSON Make/n8n nhập thẳng app",
        "Tốc độ đào Point siêu tốc x5 lần",
        "Tham gia nhóm Mastermind hỗ trợ chuyên sâu",
        "Tư vấn quy trình tự động hóa doanh nghiệp 1-1"
      ]
    }
  ];

  const matrixFeatures = [
    { name: "Xem trước Tài liệu", free: "5 trang đầu", pro: "Không giới hạn", enterprise: "Không giới hạn" },
    { name: "Tải tài nguyên Ebook/Slide Premium", free: false, pro: true, enterprise: true },
    { name: "Truy cập Kho Prompt chuyên sâu", free: false, pro: true, enterprise: true },
    { name: "Tải kịch bản JSON Make.com / n8n", free: false, pro: false, enterprise: true },
    { name: "Tốc độ Tích lũy Point Gamification", free: "Tiêu chuẩn (x1)", pro: "Nhanh (x2)", enterprise: "Siêu tốc (x5)" },
    { name: "Cập nhật bài giảng mới định kỳ", free: "Hạn chế", pro: "Miễn phí liên tục", enterprise: "Miễn phí liên tục" },
    { name: "Hỗ trợ Kỹ thuật & Cố vấn", free: "Cộng đồng", pro: "Kênh riêng", enterprise: "Trực tiếp 1-1" }
  ];

  return (
    <main className="flex-1 py-12 md:py-20 bg-background relative overflow-hidden animate-fade-in">
      {/* Nền Gradient ánh sáng Neon */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
        
        {/* Header Strip */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Bảng giá Gói Dịch Vụ SaaS
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Đầu Tư Một Lần, <span className="text-secondary neon-glow-text">Tự Động Hóa Mãi Mãi</span>
          </h1>

          <p className="text-foreground/70 text-sm md:text-base max-w-2xl mx-auto">
            Lựa chọn lộ trình phù hợp để mở khóa sức mạnh trí tuệ nhân tạo. Bảng giá minh bạch, gạch nợ tự động ngay sau khi thanh toán.
          </p>

          {/* Công tắc Toggle Chu kỳ Thanh toán */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground font-bold' : 'text-foreground/50'}`}>
              Thanh toán Hàng tháng
            </span>

            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-surface/80 ring-1 ring-white/10 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-secondary shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground font-bold' : 'text-foreground/50'}`}>
                Thanh toán Hàng năm
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                🎁 Tiết kiệm 20%
              </span>
            </div>
          </div>
        </div>

        {/* Tiers Grid view */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {(customTiersList || baseTiers).map((tier: any) => {
            const currentPrice = isYearly ? tier.priceYearly : tier.priceMonthly;
            const originalPrice = isYearly ? tier.originalYearly : null;
            const isFeatured = tier.featured ?? (tier.id === "pro");
            const isPopular = tier.popular ?? (tier.id === "pro");
            const currentHref = tier.href || (tier.id === "pro" ? "/checkout?plan=premium" : tier.id === "enterprise" ? "/checkout?plan=vip" : "/resources");
            const currentCta = tier.cta || (tier.id === "free" ? "Bắt đầu học ngay" : "Nâng cấp Pro ngay");

            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? "bg-gradient-to-b from-secondary/10 via-surface/80 to-surface border-2 border-secondary shadow-[0_0_35px_rgba(0,255,133,0.15)] scale-105 z-10"
                    : "bg-surface/60 hover:bg-surface border border-white/5 hover:border-white/10"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    🔥 Phổ Biến Nhất
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tên & Tag */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                    <p className="text-[11px] text-foreground/50 mt-0.5 min-h-[16px]">{tier.target}</p>
                  </div>

                  {/* Giá tiền */}
                  <div className="pt-2 pb-1 border-b border-white/5">
                    {currentPrice === 0 ? (
                      <div className="text-3xl font-black text-foreground tracking-tight">Miễn phí</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-secondary tracking-tight">
                            {currentPrice.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-xs text-foreground/40 font-normal">
                            /{isYearly ? 'năm' : 'tháng'}
                          </span>
                        </div>
                        {originalPrice && isYearly && (
                          <div className="text-xs text-foreground/40 line-through">
                            Gốc: {originalPrice.toLocaleString("vi-VN")}đ
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mô tả ngắn */}
                  <p className="text-xs text-foreground/70 leading-relaxed min-h-[36px]">
                    {tier.desc}
                  </p>

                  {/* Danh sách checkmark */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/40">Đặc quyền bao gồm:</div>
                    {tier.features?.map((feat: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isFeatured ? 'text-secondary' : 'text-secondary/60'}`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button Link */}
                <div className="pt-6 mt-auto">
                  <Link
                    href={currentHref}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                      isFeatured
                        ? "bg-secondary text-black hover:bg-secondary/90 hover:shadow-[0_0_20px_rgba(0,255,133,0.4)]"
                        : "bg-surface border border-white/10 hover:border-secondary/40 hover:text-secondary text-foreground"
                    }`}
                  >
                    <span>{currentCta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-[10px] text-center text-foreground/40 mt-2">
                    {tier.priceMonthly === 0 ? "Không cần thẻ tín dụng" : "Kích hoạt tự động qua mã VietQR"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Section */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
              <Layers className="w-5 h-5 text-secondary" />
              So Sánh Đặc Quyền Chi Tiết
            </h2>
            <p className="text-xs text-foreground/50">Bảng đối chiếu minh bạch các giới hạn hệ thống giữa các hạng thành viên</p>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-surface/50">
                  <th className="p-4 text-xs font-bold text-foreground/60 w-2/5">TÍNH NĂNG / HẠNG MỤC</th>
                  <th className="p-4 text-xs font-bold text-center text-foreground/80 w-1/5">Free Member</th>
                  <th className="p-4 text-xs font-bold text-center text-secondary w-1/5">Pro Creator</th>
                  <th className="p-4 text-xs font-bold text-center text-amber-400 w-1/5">Enterprise Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {matrixFeatures.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-foreground/80">{row.name}</td>
                    
                    {/* Free column */}
                    <td className="p-4 text-center text-foreground/60">
                      {typeof row.free === "boolean" ? (
                        row.free ? <Check className="w-4 h-4 text-secondary mx-auto" /> : <span className="text-foreground/20">-</span>
                      ) : (
                        row.free
                      )}
                    </td>

                    {/* Pro column */}
                    <td className="p-4 text-center font-bold text-secondary/90 bg-secondary/5">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="w-4 h-4 text-secondary mx-auto" /> : <span className="text-foreground/20">-</span>
                      ) : (
                        row.pro
                      )}
                    </td>

                    {/* Enterprise column */}
                    <td className="p-4 text-center font-bold text-amber-400/90">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> : <span className="text-foreground/20">-</span>
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Accordion snippet / Contact CTA */}
        <div className="mt-16 text-center border-t border-white/5 pt-10">
          <p className="text-xs text-foreground/60">
            Bạn cần tư vấn lộ trình triển khai hàng ngàn tài liệu riêng cho doanh nghiệp?
          </p>
          <Link href="/checkout?plan=vip" className="text-xs text-secondary font-bold hover:underline inline-flex items-center gap-1 mt-1">
            <HelpCircle className="w-3 h-3" /> Liên hệ nhận tư vấn kiến trúc hệ thống trực tiếp
          </Link>
        </div>

      </div>
    </main>
  );
}
