"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, Mail, UserCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLogin() {
  const [mode, setMode] = useState<"admin_password" | "assistant_account">("assistant_account");
  
  // Super admin password state
  const [password, setPassword] = useState("");
  
  // Assistant account states
  const [email, setEmail] = useState("");
  const [assistantPassword, setAssistantPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { signInWithEmail } = useAuth();

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
        router.push("/admin");
        router.refresh();
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
      router.push("/admin");
      router.refresh();
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
            onClick={() => { setMode("assistant_account"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === "assistant_account" ? "bg-cyan-500 text-black shadow-md" : "text-foreground/60 hover:text-foreground"}`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tài Khoản Trợ Lý</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("admin_password"); setError(""); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === "admin_password" ? "bg-purple-600 text-white shadow-md" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mật Khẩu Master</span>
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
      </div>
    </main>
  );
}
