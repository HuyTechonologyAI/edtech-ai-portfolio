"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
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
        setError(data.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-[80vh] relative overflow-hidden">
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>
      
      <div className="glass-panel p-10 rounded-3xl w-full max-w-md z-10 relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/30 shadow-[0_0_15px_rgba(0,255,133,0.2)]">
            <ShieldCheck className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-foreground/50 text-sm mt-2">Vui lòng nhập mật khẩu quản trị viên</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-foreground/40" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-surface/50 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary text-black font-bold py-3 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 hover-glow disabled:opacity-50"
          >
            {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"} 
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </main>
  );
}
