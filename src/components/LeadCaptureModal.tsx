"use client";

import { useState } from "react";
import { X, Mail, Phone, User, Sparkles, Loader2, ShieldCheck } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fullName: string, email: string, phone: string) => void;
  targetItemTitle: string;
  source: string;
}

export function LeadCaptureModal({ isOpen, onClose, onSuccess, targetItemTitle, source }: LeadCaptureModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate Form dữ liệu phía Client
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng điền Họ tên của bạn!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Định dạng Email không hợp lệ!");
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setErrorMsg("Số điện thoại không hợp lệ (Phải là SĐT Việt Nam hợp chuẩn)!");
      return;
    }

    setLoading(true);

    try {
      // 2. Gửi logs Lead lên API Backend Supabase
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          source: source,
          targetItemTitle: targetItemTitle
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi thông tin thất bại");

      // 3. Ghi nhớ trạng thái vào localStorage để người học không bị hỏi lại lần sau
      localStorage.setItem("zentra_lead_registered", "true");
      localStorage.setItem(
        "zentra_lead_info",
        JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim()
        })
      );

      // Kích hoạt callback thành công
      onSuccess(fullName.trim(), email.trim(), phoneNumber.trim());
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-surface/95 border border-secondary/30 rounded-3xl shadow-2xl shadow-black/80 p-6 sm:p-8 animate-scale-up overflow-hidden z-10">
        {/* Glow ambient effects */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-secondary" /> Quà Tặng Đặc Quyền
            </div>
            <h3 className="text-xl font-black text-foreground pt-1">Nhận File Đầy Đủ &amp; Kịch Bản</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-foreground/40 hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
          <p className="text-xs text-foreground/75 leading-relaxed bg-background/50 border border-border p-3.5 rounded-xl">
            Để tải vĩnh viễn tài liệu <strong className="text-secondary">"{targetItemTitle}"</strong> và nhận kịch bản tự động hóa (JSON Make/n8n) gửi thẳng qua Zalo/Email, vui lòng cung cấp thông tin liên hệ của bạn bên dưới.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-xl leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Input Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">Họ và tên của bạn</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-background border border-border focus:border-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-foreground/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: nva@gmail.com"
                className="w-full bg-background border border-border focus:border-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-foreground/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Input Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">Số điện thoại (Nhận kịch bản Zalo)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ví dụ: 0941214544"
                className="w-full bg-background border border-border focus:border-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-foreground/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-secondary hover:bg-secondary/90 text-black font-black text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_25px_rgba(0,255,133,0.5)] hover:scale-[1.02] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Đang xử lý thông tin...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black animate-pulse" />
                  <span>Xác Nhận &amp; Tải Tài Liệu Ngay</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-foreground/30 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Thông tin được bảo mật &amp; cam kết không spam.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
