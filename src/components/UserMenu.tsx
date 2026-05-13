"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { LogIn, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />;

  if (!user) {
    return (
      <Link href="/auth"
        className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/50 rounded-full text-sm font-bold hover:bg-secondary hover:text-black transition-all">
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Đăng nhập</span>
      </Link>
    );
  }

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div ref={menuRef} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-white/10 hover:border-secondary/30 transition-all">
        {avatar ? (
          <img src={avatar} alt={name} className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-xs font-bold">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-foreground/80 max-w-[100px] truncate hidden sm:block">{name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-foreground/40" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 p-2 z-50">
          <div className="px-3 py-2 border-b border-white/5 mb-2">
            <p className="text-sm font-bold truncate flex items-center gap-1.5">
              <span>{name}</span>
              {(user?.app_metadata?.is_premium || (user as any)?.user_metadata?.is_premium) && (
                <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1 py-0.2 rounded font-extrabold uppercase">VIP</span>
              )}
            </p>
            <p className="text-xs text-foreground/40 truncate">{user.email}</p>
          </div>

          {(user?.app_metadata?.role === "admin" || (user as any)?.user_metadata?.role === "admin") && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors font-bold">
              ⚙️ Quản trị Admin
            </Link>
          )}

          <Link href="/checkout" onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:bg-secondary/10 rounded-lg transition-colors font-bold">
            👑 Nâng cấp Premium
          </Link>

          <button onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
