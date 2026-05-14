"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { User, Mail, Shield, Sparkles, Save, Loader2, CheckCircle2, AlertCircle, Crown, Image as ImageIcon, Phone, MapPin, Briefcase, Heart, Target, Award, Download } from "lucide-react";
import Link from "next/link";
import { WorkflowAutoGrader } from "@/components/WorkflowAutoGrader";

const PRESET_AVATARS = [
  { id: "ai_core", name: "AI Core Robot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=AICore" },
  { id: "cyber_auto", name: "Cyber Automation", url: "https://api.dicebear.com/7.x/bottts/svg?seed=AutomationPro" },
  { id: "neon_guru", name: "Neon Guru", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=NeonGuru" },
  { id: "cyber_mentor", name: "Pro Mentor", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=CyberMentor" },
  { id: "matrix_n8n", name: "Matrix Node", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=MatrixN8N" },
  { id: "abstract_sphere", name: "Premium VIP", url: "https://api.dicebear.com/7.x/shapes/svg?seed=PremiumCrown" },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  
  // Core Identity States
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Extended Profile States for AI & Hyper-Personalization
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [interests, setInterests] = useState("");
  const [goals, setGoals] = useState("");

  // Feedback UI States
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata || {};
      setFullName(meta.full_name || user.email?.split("@")[0] || "");
      setAvatarUrl(meta.avatar_url || "");
      setPhone(meta.phone || "");
      setAddress(meta.address || "");
      setOccupation(meta.occupation || "");
      setInterests(meta.interests || "");
      setGoals(meta.goals || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim(),
          phone: phone.trim(),
          address: address.trim(),
          occupation: occupation.trim(),
          interests: interests.trim(),
          goals: goals.trim(),
        },
      });

      if (error) throw error;

      setSuccessMsg("🎉 Cập nhật hồ sơ thành công! Dữ liệu của bạn đã được tối ưu cho Trợ lý AI.");
      
      // Tự động xóa thông báo sau 6 giây
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">Chưa đăng nhập</h2>
          <p className="text-xs text-foreground/60 leading-relaxed">
            Vui lòng đăng nhập tài khoản học viên để truy cập và quản lý hồ sơ cá nhân của bạn.
          </p>
          <Link href="/auth" className="block w-full py-3 bg-secondary text-black font-bold rounded-xl text-xs hover:opacity-90 transition-opacity">
            Đăng nhập / Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = user?.app_metadata?.is_premium || (user as any)?.user_metadata?.is_premium;
  const isAdmin = user?.app_metadata?.role === "admin" || (user as any)?.user_metadata?.role === "admin";

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 flex-wrap">
          <span>Hồ Sơ Học Viên & AI Context</span>
          <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
        </h1>
        <p className="text-sm text-foreground/50 mt-1">
          Cập nhật thông tin chi tiết để Trợ lý ảo AI hiểu rõ chuyên môn, từ đó đưa ra gợi ý khóa học và hỗ trợ tự động hóa sát nhất với bài toán của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Identity Dashboard Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all" />

            <div className="relative z-10">
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-secondary to-purple-500 animate-spin blur-sm opacity-40" />
                <div className="absolute inset-0 rounded-full bg-surface border-2 border-secondary/40 flex items-center justify-center overflow-hidden z-10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-secondary">
                      {fullName[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-base text-foreground truncate px-2">
                {fullName || user.email?.split("@")[0]}
              </h3>
              <p className="text-xs text-foreground/40 mt-0.5 truncate">{user.email}</p>

              {occupation && (
                <p className="text-xs text-secondary font-medium mt-2 bg-secondary/5 border border-secondary/10 py-1 px-2 rounded-lg inline-block max-w-full truncate">
                  💼 {occupation}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 items-center">
                {isPremium ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
                    <Crown className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Hội Viên Premium</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-white/10 rounded-full text-xs font-medium text-foreground/60">
                    <span>Học viên Tiêu chuẩn</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    <span>Quản trị viên</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isPremium && (
            <div className="glass-panel p-5 rounded-2xl border border-secondary/20 bg-gradient-to-b from-secondary/5 to-transparent text-center space-y-3">
              <Crown className="w-6 h-6 text-secondary mx-auto animate-bounce" />
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wide">Mở Khóa Toàn Bộ Gói Dữ Liệu</h4>
              <p className="text-[11px] text-foreground/60 leading-relaxed">
                Nâng cấp Premium trọn đời để truy cập không giới hạn kho tải Ebooks, kịch bản tự động hóa và các hướng dẫn chuyên sâu.
              </p>
              <Link href="/checkout" className="inline-block px-4 py-2 bg-secondary text-black font-bold rounded-xl text-xs hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,255,133,0.3)]">
                Nâng cấp ngay
              </Link>
            </div>
          )}

          {/* Academic Achievements & Dynamic PDF Certificates pane */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Award className="w-4 h-4 text-secondary" />
              <span>🎓 Chứng chỉ Tốt nghiệp</span>
            </h4>

            <div className="space-y-3">
              {/* Khóa 1: Master AI */}
              <div className="p-3 bg-surface/50 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate max-w-[150px]">Master AI &amp; Auto</span>
                  <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">100%</span>
                </div>
                <p className="text-[10px] text-foreground/40">Hoàn thành chuyên đề thực chiến</p>
                <Link
                  href={`/certificate?course=masterclass&name=${encodeURIComponent(fullName || user.email?.split("@")[0] || "Học Viên")}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-secondary text-black font-extrabold rounded-lg text-[11px] hover:bg-secondary/90 transition-all shadow-[0_0_10px_rgba(0,255,133,0.2)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cấp Chứng Chỉ PDF</span>
                </Link>
              </div>

              {/* Khóa 2: Prompt Engineering */}
              <div className="p-3 bg-surface/30 border border-white/5 rounded-xl space-y-2 opacity-60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate max-w-[150px]">Prompt Engineering</span>
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">80%</span>
                </div>
                <div className="w-full bg-surface h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[80%]" />
                </div>
                <p className="text-[9px] text-foreground/40 italic">Cày nốt 1 video để nhận chứng chỉ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Comprehensive Configuration Update Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Section 1: Basic Identity & Avatar */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-5">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider border-b border-white/5 pb-3">
                1. Thông tin Định danh Cơ bản
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-secondary" />
                    <span>Địa chỉ Email</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.email || ""}
                    className="w-full bg-surface/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-foreground/40 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-secondary" />
                    <span>Họ và Tên</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Avatar Preset selections */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-secondary" />
                  <span>Chọn nhanh Avatar Phong cách Neon</span>
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = avatarUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className={`group relative p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          isSelected 
                            ? "bg-secondary/15 border-secondary shadow-[0_0_15px_rgba(0,255,133,0.2)]" 
                            : "bg-surface/40 border-white/5 hover:border-white/20 hover:bg-surface"
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-10 h-10 rounded-full bg-surface border border-white/5 group-hover:scale-105 transition-transform" 
                        />
                        <span className={`text-[9px] font-medium truncate w-full ${isSelected ? "text-secondary font-bold" : "text-foreground/60"}`}>
                          {preset.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5">
                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh tùy chỉnh: https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-foreground/80 focus:border-secondary/40 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-5">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider border-b border-white/5 pb-3">
                2. Thông tin Liên lạc
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    <span>Số điện thoại / Zalo</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>Khu vực / Tỉnh thành</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: AI Context Guidance Data */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-5">
              <h2 className="text-sm font-bold text-secondary uppercase tracking-wider border-b border-white/5 pb-3">
                3. Ngữ cảnh Tối ưu AI (AI Context Optimization)
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-secondary" />
                  <span>Nghề nghiệp / Lĩnh vực hoạt động</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Quản lý Vận hành, Chuyên viên Digital Marketing, Lập trình viên..."
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-secondary" />
                  <span>Sở thích / Công nghệ quan tâm</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Make.com, n8n, ChatGPT API, Tự động hóa bán hàng..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70 block flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-secondary" />
                  <span>Mong muốn & Mục tiêu ứng dụng AI</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Chia sẻ chi tiết bài toán doanh nghiệp hoặc quy trình bạn muốn tự động hóa để Trợ lý AI có thể tư vấn và hỗ trợ tài liệu sát nhất..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl p-3 text-xs text-foreground focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all resize-y custom-scrollbar leading-relaxed"
                />
              </div>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-xs text-secondary bg-secondary/10 border border-secondary/20 p-4 rounded-xl animate-fade-in font-medium border-l-4 border-l-secondary">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Submissions Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-secondary text-black rounded-xl text-xs font-extrabold hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(0,255,133,0.35)]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật tri thức AI...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu Dữ Liệu Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Auto-Grader Scanner Studio */}
      <WorkflowAutoGrader />
    </div>
  );
}

