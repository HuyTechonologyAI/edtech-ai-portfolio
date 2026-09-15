"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, Mail, UserCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLogin() {
  const [mode, setMode] = useState<"admin_password" | "assistant_account">("admin_password");
  
  // Super admin password state
  const [password, setPassword] = useState("");
  
  // Assistant account states
  const [email, setEmail] = useState("");
  const [assistantPassword, setAssistantPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  // Handle Global Admin Password Submit
  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data.error || "Đăng nhập mật khẩu thất bại");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Assistant Supabase Account Login
  const handleAssistantAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: authErr } = await signInWithEmail(email, assistantPassword);
      if (authErr) {
        setError("Email hoặc mật khẩu không chính xác: " + authErr);
        setIsLoading(false);
        return;
      }

      // Check user permissions via api or page reload
      window.location.href = "/admin";
    } catch {
      setError("Lỗi đăng nhập tài khoản trợ lý");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-[80vh] relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>
      
      <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md z-10 relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">ZentraTech Admin Portal</h1>
          <p className="text-foreground/50 text-xs mt-1.5">
            Cổng đăng nhập Quản trị viên & Trợ lý Ủy quyền
          </p>
        </div>

        {/* Login Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-background/60 p-1 rounded-xl border border-white/10 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode("admin_password"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === "admin_password" ? "bg-purple-600 text-white shadow-md" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mật Khẩu Master</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("assistant_account"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === "assistant_account" ? "bg-cyan-500 text-black shadow-md" : "text-foreground/60 hover:text-foreground"}`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tài Khoản Trợ Lý</span>
          </button>
        </div>

        {/* Assistant Account Login Form */}
        {mode === "assistant_account" ? (
          <form onSubmit={handleAssistantAccountLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-foreground/70 font-medium">Email Trợ Lý</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-foreground/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="assistant@company.com"
                  className="w-full bg-surface/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-foreground/70 font-medium">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-foreground/40" />
                </div>
                <input
                  type="password"
                  value={assistantPassword}
                  onChange={(e) => setAssistantPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 text-black font-extrabold py-3 rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 mt-2"
            >
              {isLoading ? "Đang truy cập..." : "Đăng nhập Không gian Trợ lý"} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          /* Super Admin Master Password Form */
          <form onSubmit={handleAdminPasswordLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-foreground/70 font-medium">Mật khẩu Master Admin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-foreground/40" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị viên..."
                  className="w-full bg-surface/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white font-extrabold py-3 rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2 text-xs shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 mt-2"
            >
              {isLoading ? "Đang xác thực Master..." : "Đăng nhập Master System"} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* Quick Google Login for SuperAdmin / Assistant */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-foreground/50 mb-3">Hoặc đăng nhập nhanh bằng Google</p>
          <button
            type="button"
            onClick={async () => {
              await signInWithGoogle();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface/80 border border-white/10 text-xs font-semibold text-foreground flex items-center justify-center gap-2 hover:border-secondary/50 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Đăng nhập với Google (Chủ tài khoản / Trợ lý)</span>
          </button>
        </div>
      </div>
    </main>
  );
}
