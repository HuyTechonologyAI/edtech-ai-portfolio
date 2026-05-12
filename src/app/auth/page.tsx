"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Chrome, Facebook, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (mode === "login") {
      const { error } = await signInWithEmail(email, password);
      if (error) { setError(error); }
      else { router.push("/resources"); }
    } else {
      if (!fullName.trim()) { setError("Vui lòng nhập họ tên"); setIsLoading(false); return; }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) { setError(error); }
      else { setSuccess("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản."); }
    }
    setIsLoading(false);
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-[80vh] relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-secondary/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md z-10 relative border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-secondary/30 shadow-[0_0_15px_rgba(0,255,133,0.15)]">
            <User className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
          <p className="text-foreground/50 text-sm mt-2">
            {mode === "login" ? "Đăng nhập để tải tài liệu và xem nội dung đầy đủ" : "Tạo tài khoản miễn phí để truy cập toàn bộ tài liệu"}
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium group"
          >
            <Chrome className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            Tiếp tục với Google
          </button>
          <button
            onClick={signInWithFacebook}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 hover:border-blue-600/30 transition-all text-sm font-medium text-blue-400 group"
          >
            <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Tiếp tục với Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-foreground/30 uppercase tracking-wider font-medium">hoặc</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-foreground/40" />
              </div>
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all text-sm"
              />
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-foreground/40" />
            </div>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-foreground/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu" required minLength={6}
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/30 hover:text-foreground/60 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-400 text-xs font-medium bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">{success}</p>}

          <button type="submit" disabled={isLoading}
            className="w-full bg-secondary text-black font-bold py-3 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,133,0.2)] disabled:opacity-50">
            {isLoading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-foreground/40 mt-6">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
            className="text-secondary font-bold ml-1.5 hover:underline">
            {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </main>
  );
}
