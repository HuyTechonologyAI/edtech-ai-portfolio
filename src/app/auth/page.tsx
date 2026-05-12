"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

// Inline SVG icons for Google and Facebook (lucide-react doesn't include brand icons)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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
            <span className="group-hover:scale-110 transition-transform"><GoogleIcon /></span>
            Tiếp tục với Google
          </button>
          <button
            onClick={signInWithFacebook}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 hover:border-blue-600/30 transition-all text-sm font-medium text-blue-400 group"
          >
            <span className="group-hover:scale-110 transition-transform"><FacebookIcon /></span>
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
