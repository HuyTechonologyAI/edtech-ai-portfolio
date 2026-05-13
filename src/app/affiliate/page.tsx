"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Copy, Check, TrendingUp, Users, DollarSign, Award, Trophy, Sparkles, ExternalLink, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";

interface LeaderboardItem {
  rank: number;
  partnerName: string;
  code: string;
  signups: number;
  earned: number;
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const [customCode, setCustomCode] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);

  // Dynamic Dashboard performance metrics state
  const [clicksCount, setClicksCount] = useState(12);
  const [referralsCount, setReferralsCount] = useState(3);
  const [earnedAmount, setEarnedAmount] = useState(897000); // 30% commission
  const [earnedPoints, setEarnedPoints] = useState(1500);

  // Top earners dummy state list
  const topEarners: LeaderboardItem[] = [
    { rank: 1, partnerName: "Nguyễn Kiến Huy", code: "HUYAI_MASTER", signups: 45, earned: 13455000 },
    { rank: 2, partnerName: "Trần Đăng Khoa", code: "KHOA_AUTO99", signups: 28, earned: 8372000 },
    { rank: 3, partnerName: "Lê Hoàng Long", code: "LONG_TECH", signups: 19, earned: 5681000 },
    { rank: 4, partnerName: "Phạm Thị Mai", code: "MAI_AI", signups: 14, earned: 4186000 },
    { rank: 5, partnerName: "Vũ Đức Trí", code: "TRI_EXPERT", signups: 9, earned: 2691000 }
  ];

  // Initialize distinct partner referral code reactive to auth metadata
  useEffect(() => {
    if (user) {
      const metadataRef = (user as any).user_metadata?.custom_ref_code || user.app_metadata?.custom_ref_code;
      if (metadataRef) {
        setActiveCode(metadataRef);
        setCustomCode(metadataRef);
      } else {
        // Build readable fallbacks
        const emailPrefix = user.email ? user.email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '') : "";
        const defaultRef = emailPrefix ? `${emailPrefix}2026` : `PARTNER${user.id.slice(0, 5).toUpperCase()}`;
        setActiveCode(defaultRef);
        setCustomCode(defaultRef);
      }
    } else {
      setActiveCode("HUYAI_EXPERT");
      setCustomCode("HUYAI_EXPERT");
    }
  }, [user]);

  // Trình tạo đường dẫn Affiliate hoàn chỉnh
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ai-autoexpert.io";
  const referralUrl = `${baseUrl}/?ref=${activeCode}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Cập nhật mã giới thiệu riêng vào siêu dữ liệu (Metadata)
  const handleSaveCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!clean) return;

    setIsUpdatingCode(true);
    setActiveCode(clean);
    
    // Tự động cập nhật user metadata nếu có token
    // Simulate API persistence callback
    setTimeout(() => {
      setIsUpdatingCode(false);
      alert(`🎉 Đã đổi mã Affiliate thành công sang: ${clean}\nĐường dẫn giới thiệu của bạn đã tự động cập nhật.`);
    }, 800);
  };

  // Nút mô phỏng nhấp chuột để tăng số liệu thời gian thực
  const simulateEngagement = () => {
    setClicksCount(prev => prev + Math.floor(Math.random() * 5) + 1);
    // Tỷ lệ ngẫu nhiên ra đơn hàng
    if (Math.random() > 0.6) {
      setReferralsCount(prev => prev + 1);
      setEarnedAmount(prev => prev + 299000 * 0.3);
      setEarnedPoints(prev => prev + 500);
    }
  };

  return (
    <main className="flex-1 py-12 md:py-20 bg-background relative overflow-hidden animate-fade-in">
      {/* Background glow graphics */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-6xl mx-auto relative z-10">
        
        {/* Banner tiêu đề */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Zentra Affiliate Network
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
              Tiếp Thị Liên Kết <span className="text-secondary neon-glow-text">Tự Sinh</span>
            </h1>
            <p className="text-foreground/70 text-sm md:text-base max-w-2xl">
              Chia sẻ tri thức, nhận về giá trị. Hưởng ngay <strong className="text-secondary">30% hoa hồng gạch nợ tự động</strong> hoặc thưởng <strong className="text-amber-400">+500 siêu Point</strong> cho mỗi lượt giới thiệu thành công.
            </p>
          </div>

          {/* User state node info */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-4 shrink-0 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/40 flex items-center justify-center font-bold text-secondary text-lg shadow-inner">
              🤝
            </div>
            <div>
              <div className="text-xs text-foreground/50">Trạng thái đối tác</div>
              <div className="text-sm font-bold text-foreground">
                {user ? (user as any).user_metadata?.full_name || user.email : "Tài khoản Trải nghiệm"}
              </div>
              <div className="text-[10px] text-secondary font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>Cookies Tracking: BẬT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard 2 Cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Cột Trái: Trình Tạo Link & Chỉ số cá nhân */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Box 1: Link Hub */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none" />
              
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>🔗 Link Giới Thiệu Của Bạn</span>
              </h2>

              <div className="space-y-4">
                {/* Textbox hiển thị URL */}
                <div className="p-3 bg-background/80 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-secondary/90 truncate select-all block w-full">
                    {referralUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 bg-secondary text-black rounded-lg hover:bg-secondary/90 transition-all shrink-0 cursor-pointer"
                    title="Sao chép đường dẫn"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                  </button>
                </div>

                {isCopied && (
                  <p className="text-[11px] text-secondary font-bold animate-fade-in text-right">
                    ✓ Đã sao chép vào bộ nhớ tạm! Sẵn sàng chia sẻ.
                  </p>
                )}

                {/* Form đổi mã code riêng */}
                <form onSubmit={handleSaveCustomCode} className="pt-3 border-t border-white/5">
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    Tùy chỉnh hậu tố mã giới thiệu (Viết hoa, không dấu):
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-foreground/40 font-mono pointer-events-none">
                        ?ref=
                      </span>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder="VD: HUYAI2026"
                        className="pl-12 pr-3 py-2 w-full rounded-xl bg-surface border border-white/10 text-xs font-mono font-bold focus:outline-none focus:border-secondary transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingCode || customCode.trim().toUpperCase() === activeCode}
                      className="px-4 py-2 rounded-xl bg-surface hover:bg-white/5 border border-white/10 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {isUpdatingCode ? "Đang lưu..." : "Cập nhật"}
                    </button>
                  </div>
                  <p className="text-[10px] text-foreground/40 mt-1.5">
                    💡 Cookies lưu vết khách truy cập trong 30 ngày kể từ lần nhấp chuột đầu tiên.
                  </p>
                </form>
              </div>
            </div>

            {/* Box 2: Chỉ số hiệu suất Real-time */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">📊 Thống Kê Doanh Thu</h2>
                <button
                  type="button"
                  onClick={simulateEngagement}
                  className="inline-flex items-center gap-1 text-[11px] text-secondary hover:underline cursor-pointer"
                  title="Mô phỏng có người lạ nhấp vào link để kiểm tra logic tính toán"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Mô phỏng thêm Click mới</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Card 1: Clicks */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-foreground/50 text-xs">
                    <span>Lượt truy cập link</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-foreground">{clicksCount}</div>
                    <div className="text-[10px] text-cyan-400/80 mt-0.5">Tỷ lệ chuyển đổi: {((referralsCount/clicksCount)*100).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Card 2: Referrals */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-foreground/50 text-xs">
                    <span>Khách mua Premium</span>
                    <Users className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-secondary">{referralsCount}</div>
                    <div className="text-[10px] text-secondary/80 mt-0.5">Gạch nợ qua Webhook</div>
                  </div>
                </div>

                {/* Card 3: Earned Cash */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-foreground/50 text-xs">
                    <span>Hoa hồng tiền mặt (30%)</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-black text-amber-400 tracking-tight">
                      {earnedAmount.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-0.5">Sẵn sàng rút về MB Bank</div>
                  </div>
                </div>

                {/* Card 4: Earned Points */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-foreground/50 text-xs">
                    <span>Thưởng Point Đổi Quà</span>
                    <Award className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-black text-orange-400 tracking-tight">
                      +{earnedPoints} Point
                    </div>
                    <div className="text-[10px] text-orange-400/80 mt-0.5">Dùng đổi Khóa học Masterclass</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Cột Phải: Bảng Xếp Hạng Top Earners */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Bảng Vàng Đối Tác Tháng</span>
            </h2>

            <div className="glass-panel rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <p className="text-xs text-foreground/50">
                Top 5 nhà sáng tạo chia sẻ nội dung mang lại nhiều lượt nâng cấp tài khoản nhất tháng này.
              </p>

              <div className="space-y-3 pt-2">
                {topEarners.map((item) => (
                  <div
                    key={item.rank}
                    className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                      item.rank === 1
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : item.rank === 2
                        ? "bg-surface/80 border border-white/10 text-foreground"
                        : "bg-surface/40 text-foreground/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-3/5 truncate">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        item.rank === 1 ? 'bg-amber-500 text-black' : item.rank === 2 ? 'bg-gray-300 text-black' : 'bg-surface text-foreground/60'
                      }`}>
                        {item.rank}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{item.partnerName}</div>
                        <div className="text-[10px] font-mono opacity-60 truncate">ref={item.code}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black">{item.earned.toLocaleString("vi-VN")}đ</div>
                      <div className="text-[10px] opacity-60">{item.signups} lượt VIP</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 text-center">
                <Link href="/pricing" className="text-[11px] text-secondary font-bold hover:underline inline-flex items-center gap-1">
                  <span>Khám phá các Gói Thuê bao dễ bán nhất</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Q&A Accordion Mini */}
            <div className="p-4 rounded-2xl bg-surface/30 border border-white/5 space-y-2">
              <div className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                <span>Quy chế thanh toán hoa hồng</span>
              </div>
              <p className="text-[11px] text-foreground/60 leading-relaxed">
                Hệ thống tự động cộng dồn doanh thu vào ngày 15 và 30 hàng tháng. Đối soát tự động hoàn toàn bằng luồng đối chiếu Webhook chuyển khoản ngân hàng.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
