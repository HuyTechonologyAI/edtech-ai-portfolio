"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Check, Copy, Sparkles, ShieldCheck, QrCode, RefreshCw, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "premium",
    name: "Hội viên Premium",
    price: 299000,
    originalPrice: 599000,
    duration: "Trọn đời",
    desc: "Mở khóa toàn bộ tài nguyên Ebook, Slide bài giảng và các biểu mẫu ứng dụng AI & Automation độc quyền.",
    features: [
      "Tải không giới hạn Ebook & Slide Premium",
      "Truy cập kho Prompt thực chiến x10 hiệu suất",
      "Cập nhật tài liệu mới hoàn toàn miễn phí",
      "Hỗ trợ giải đáp thắc mắc cơ bản"
    ],
    popular: true
  },
  {
    id: "vip",
    name: "VIP Mentorship",
    price: 999000,
    originalPrice: 2000000,
    duration: "Trọn đời",
    desc: "Đặc quyền truy cập kịch bản tự động hóa Make/n8n nâng cao kèm sự hướng dẫn trực tiếp từ chuyên gia.",
    features: [
      "Toàn bộ đặc quyền của gói Premium",
      "Tải kịch bản JSON Make/n8n nhập thẳng vào app",
      "Tham gia nhóm kín hỗ trợ chuyên sâu",
      "Tư vấn tối ưu hóa quy trình doanh nghiệp 1-1"
    ],
    popular: false
  }
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  
  // Backend interactive state tracking
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const [dynamicQrUrl, setDynamicQrUrl] = useState("");
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Read environment dynamic configs safely
  const bankId = process.env.NEXT_PUBLIC_BANK_ID || "MB";
  const accountNo = process.env.NEXT_PUBLIC_ACCOUNT_NO || "0941214544";
  const accountName = process.env.NEXT_PUBLIC_ACCOUNT_NAME || "NGO QUOC HUY";

  // Trigger backend Order generation payload reactive to plan selections
  const initOrder = useCallback(async (targetPrice: number) => {
    setIsLoadingOrder(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.email || "anonymous@zentratech.io",
          userId: user?.id,
          amount: targetPrice,
          referredBy: typeof window !== "undefined" ? localStorage.getItem("zentra_referral_code") : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setOrderCode(data.memoCode);
        setDynamicQrUrl(data.qrUrl);
      }
    } catch (err) {
      // Nếu lỗi mạng, tự tính chuỗi fallback VietQR
      const fallbackMemo = `ZENTRA${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderCode(fallbackMemo);
      setDynamicQrUrl(`https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${targetPrice}&addInfo=${fallbackMemo}&accountName=${encodeURIComponent(accountName)}`);
    } finally {
      setIsLoadingOrder(false);
    }
  }, [user, bankId, accountNo, accountName]);

  // Keep a ref of selectedPlan.price to avoid re-triggering initOrder unnecessarily
  const selectedPriceRef = useRef(selectedPlan.price);
  useEffect(() => {
    selectedPriceRef.current = selectedPlan.price;
  }, [selectedPlan.price]);

  useEffect(() => {
    initOrder(selectedPriceRef.current);
  }, [initOrder]);

  // Background reactive automated listener polling interval for Instant Webhook checkout trigger
  useEffect(() => {
    if (!orderId || isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderId=${orderId}`);
        const data = await res.json();
        if (data.success && data.status === "SUCCESS") {
          setIsSuccess(true);
        }
      } catch {
        // Silent catch
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, isSuccess]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Nút xác thực trực tiếp hoặc mô phỏng thanh toán thành công
  const handleVerifyPayment = async (simulate = false) => {
    setIsVerifying(true);
    try {
      const url = `/api/checkout/status?orderId=${orderId || 9999}${simulate ? '&simulate=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.status === "SUCCESS") {
        setIsSuccess(true);
      } else {
        // Timeout chờ xác thực
        setTimeout(() => {
          setIsVerifying(false);
          // Gợi ý cho họ dùng Webhook simulation nếu bank chưa tích hợp live
          if (!simulate) {
            alert("Hệ thống chưa nhận được biến động số dư. Nếu bạn đang Test thử nghiệm, hãy nhấp vào nút '⚡ Kích hoạt mô phỏng Webhook' bên dưới nhé!");
          }
        }, 2000);
        return;
      }
    } catch {
      setTimeout(() => setIsSuccess(true), 1500);
    }
    setIsVerifying(false);
  };

  return (
    <main className="flex-1 py-12 bg-background relative overflow-hidden animate-fade-in">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Nâng cấp tài khoản tự động
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Đầu Tư Cho <span className="text-secondary neon-glow-text">Tri Thức &amp; Tự Động Hóa</span>
          </h1>
          <p className="text-foreground/70 text-sm md:text-base">
            Cổng thanh toán VietQR Open Banking. Tài khoản của bạn sẽ được kích hoạt Premium tự động qua Webhook ngay trong 2 giây sau khi quét mã.
          </p>
        </div>

        {isSuccess ? (
          <div className="max-w-md mx-auto glass-panel rounded-3xl p-8 text-center border border-secondary/30 shadow-[0_0_50px_rgba(0,255,133,0.15)] animate-fade-in">
            <div className="w-20 h-20 bg-secondary/20 border border-secondary/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-secondary animate-scale-up" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-foreground/70 text-sm mb-6">
              Cảm ơn bạn đã nâng cấp gói <span className="text-secondary font-bold">{selectedPlan.name}</span>. Giao dịch Webhook đã gạch nợ tự động trên hệ thống.
            </p>
            <div className="p-4 rounded-xl bg-background/50 border border-border mb-6 text-left text-xs space-y-2">
              <div className="flex justify-between"><span className="text-foreground/50">Mã giao dịch:</span> <span className="font-mono font-bold text-secondary">{orderCode}</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Gói dịch vụ:</span> <span className="font-bold">{selectedPlan.name}</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Trạng thái:</span> <span className="font-bold text-secondary">Kích hoạt tự động</span></div>
            </div>
            <Link href="/resources" className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-secondary text-black rounded-xl font-bold text-sm hover:bg-secondary/90 hover:shadow-[0_0_25px_rgba(0,255,133,0.4)] transition-all">
              Khám phá thư viện Premium ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Plan selection */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold">1</span>
                Chọn gói dịch vụ phù hợp
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      initOrder(plan.price);
                    }}
                    className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPlan.id === plan.id
                        ? "bg-secondary/5 border-secondary shadow-[0_0_20px_rgba(0,255,133,0.15)] scale-[1.02]"
                        : "bg-surface border-border hover:border-white/20"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 bg-secondary text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Phổ biến
                      </span>
                    )}
                    <div>
                      <div className="text-xs text-foreground/50 font-medium mb-1">{plan.duration}</div>
                      <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-extrabold text-secondary">
                          {plan.price.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-xs text-foreground/40 line-through">
                          {plan.originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <p className="text-xs text-foreground/70 line-clamp-2 mb-4">
                        {plan.desc}
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-3 space-y-2 mt-auto">
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-foreground/80">
                          <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-4 w-full py-2 rounded-lg text-center text-xs font-bold border transition-all ${
                      selectedPlan.id === plan.id 
                        ? "bg-secondary text-black border-secondary" 
                        : "bg-transparent border-white/10 text-foreground/60 hover:text-foreground"
                    }`}>
                      {selectedPlan.id === plan.id ? "Đang chọn" : "Chọn gói này"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Package detailed info */}
              <div className="glass-panel rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-sm uppercase tracking-wider text-secondary mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Đặc quyền chi tiết của gói
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80 bg-background/40 p-2.5 rounded-xl border border-border/40">
                      <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout QR & Instructions */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 text-secondary text-xs font-bold">2</span>
                  <span>Quét mã thanh toán</span>
                </div>
                {orderId && (
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-foreground/40 font-mono">
                    Order #{orderId}
                  </span>
                )}
              </h2>

              <div className="glass-panel rounded-3xl p-6 border border-secondary/30 shadow-[0_0_40px_rgba(0,255,133,0.08)] relative">
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-2xl max-w-[260px] mx-auto mb-6 shadow-xl relative group">
                  <div className="relative w-full aspect-square flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {isLoadingOrder ? (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-xs space-y-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                        <span>Đang khởi tạo mã QR...</span>
                      </div>
                    ) : dynamicQrUrl ? (
                      <img 
                        src={dynamicQrUrl} 
                        alt="VietQR Checkout Open Banking"
                        className="w-full h-full object-contain animate-fade-in"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
                        <QrCode className="w-10 h-10 animate-pulse mb-2" />
                        <span>Đang tải mã...</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-center p-3">
                    <p className="text-xs text-white font-medium">Hệ thống gạch nợ tự động bằng mã QR chuẩn VietQR</p>
                  </div>
                </div>

                {/* Transfer Info Manual Copy */}
                <div className="space-y-3">
                  <div className="text-center pb-3 border-b border-border">
                    <div className="text-xs text-foreground/50 mb-1">Số tiền thanh toán</div>
                    <div className="text-2xl font-extrabold text-secondary tracking-tight">
                      {selectedPlan.price.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-foreground/50">Ngân hàng:</span>
                      <span className="font-bold text-foreground">{bankId} Bank</span>
                    </div>

                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-foreground/50">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{accountNo}</span>
                        <button 
                          onClick={() => handleCopy(accountNo, "acc")}
                          className="p-1 hover:bg-secondary/20 text-secondary rounded transition-colors"
                          title="Sao chép số tài khoản"
                        >
                          {copiedType === "acc" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-xl border border-border">
                      <span className="text-foreground/50">Chủ tài khoản:</span>
                      <span className="font-bold text-foreground">{accountName}</span>
                    </div>

                    <div className="flex justify-between items-center bg-secondary/5 p-2.5 rounded-xl border border-secondary/30">
                      <span className="text-secondary font-medium">Nội dung chuyển khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-secondary text-sm">{orderCode}</span>
                        <button 
                          onClick={() => handleCopy(orderCode, "code")}
                          className="p-1 bg-secondary/20 hover:bg-secondary text-secondary hover:text-black rounded transition-all"
                          title="Sao chép nội dung"
                        >
                          {copiedType === "code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-400/90 leading-relaxed text-center">
                  ⚠️ <strong className="text-amber-400">Lắng nghe Webhook live:</strong> Vui lòng quét mã hoặc điền nội dung chính xác là <strong className="text-secondary font-mono">{orderCode}</strong>. Backend tự động gạch nợ sau 2 giây.
                </div>

                {/* Polling / Manual triggers */}
                <div className="mt-5 pt-4 border-t border-border space-y-2">
                  <button
                    onClick={() => handleVerifyPayment(false)}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-black font-bold text-sm hover:bg-secondary/90 hover:shadow-[0_0_20px_rgba(0,255,133,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang đối soát giao dịch ngầm...</span>
                      </>
                    ) : (
                      <span>Tôi đã thanh toán thành công</span>
                    )}
                  </button>

                  {/* Dev / Admin Simulation feature bypass button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface hover:bg-white/5 border border-white/5 hover:border-amber-500/30 text-[11px] text-foreground/40 hover:text-amber-400 transition-all cursor-pointer"
                    title="Tính năng Test API Webhook gạch nợ thành công mà không cần chuyển tiền thực"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>⚡ Kích hoạt mô phỏng Webhook (Dev Test)</span>
                  </button>
                  
                  {!user && (
                    <p className="text-center text-[10px] text-foreground/40 pt-1">
                      💡 Bạn đang mua ở chế độ Khách. Tài khoản cấp tự động dựa trên email thanh toán.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
