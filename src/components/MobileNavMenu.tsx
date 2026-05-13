"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Map, FileText, Video, Layers, Gift, PhoneCall } from "lucide-react";

export function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tự động đóng menu khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Vô hiệu hóa cuộn trang nền khi mở menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/roadmap", label: "Lộ trình", icon: Map },
    { href: "/resources", label: "Tài liệu", icon: FileText },
    { href: "/videos", label: "Videos", icon: Video },
    { href: "/pricing", label: "Bảng giá SaaS", icon: Layers, isSpecial: true },
    { href: "/rewards", label: "Đổi Quà Gamification", icon: Gift, isReward: true },
    { href: "/contact", label: "Liên hệ tư vấn", icon: PhoneCall },
  ];

  return (
    <div className="block md:hidden">
      {/* Nút Hamburger Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-surface/80 border border-white/10 rounded-xl text-foreground hover:text-secondary focus:outline-none transition-colors"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
      >
        {isOpen ? <X className="w-5 h-5 text-secondary" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Lớp mờ nền & Khung danh mục */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 bg-background/95 backdrop-blur-2xl z-50 border-t border-white/5 flex flex-col justify-between animate-fade-in">
          <div className="p-6 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest px-3 mb-2">
              Danh mục điều hướng
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    link.isSpecial
                      ? "bg-secondary/10 border border-secondary/30 text-secondary shadow-[0_0_15px_rgba(0,255,133,0.15)]"
                      : link.isReward
                      ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                      : isActive
                      ? "bg-surface text-secondary border border-white/10"
                      : "text-foreground/80 hover:bg-surface/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${link.isSpecial ? "text-secondary" : link.isReward ? "text-orange-400" : isActive ? "text-secondary" : "text-foreground/60"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Dải chân menu di động */}
          <div className="p-6 border-t border-white/5 bg-surface/30 mt-auto">
            <div className="glass-panel p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <span className="text-foreground/60">Trạng thái hệ thống</span>
              <span className="text-secondary font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
