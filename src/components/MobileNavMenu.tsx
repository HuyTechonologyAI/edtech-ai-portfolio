"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Map, FileText, Video, Layers, Gift, PhoneCall, Sparkles, User, ShieldCheck, LogOut, DollarSign } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function MobileNavMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tự động đóng menu trượt khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Khóa cuộn trang khi mở overlay toàn màn hình
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

  const fullLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/roadmap", label: "Lộ trình học tập", icon: Map },
    { href: "/resources", label: "Kho Tài liệu AI", icon: FileText },
    { href: "/videos", label: "Thư viện Videos", icon: Video },
    { href: "/pricing", label: "Bảng giá SaaS", icon: Layers, isSpecial: true },
    { href: "/rewards", label: "Đổi Quà Gamification", icon: Gift, isReward: true },
    { href: "/contact", label: "Liên hệ tư vấn", icon: PhoneCall },
  ];

  return (
    <>
      {/* Dải Thanh Dock Điều Hướng Nổi Dưới Đáy Màn Hình (Mobile Bottom Dock) */}
      <div className="fixed bottom-4 inset-x-4 z-50 block md:hidden animate-fade-in pointer-events-auto">
        <div className="bg-background/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          
          {/* Nút 1: Trang chủ */}
          <Link 
            href="/" 
            className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${pathname === "/" ? "text-secondary font-bold" : "text-foreground/60 hover:text-foreground"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px]">Trang chủ</span>
          </Link>

          {/* Nút 2: Tài liệu */}
          <Link 
            href="/resources" 
            className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${pathname === "/resources" ? "text-secondary font-bold" : "text-foreground/60 hover:text-foreground"}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px]">Tài liệu</span>
          </Link>

          {/* Nút 3: Bảng giá SaaS (Nổi bật giữa) */}
          <Link 
            href="/pricing" 
            className="flex flex-col items-center gap-0.5 -mt-5 bg-gradient-to-b from-secondary to-secondary/80 text-black p-3 rounded-full shadow-[0_0_20px_rgba(0,255,133,0.5)] hover:scale-105 transition-all"
          >
            <Layers className="w-5 h-5 text-black" />
            <span className="text-[9px] font-black tracking-tighter">SaaS</span>
          </Link>

          {/* Nút 4: Đổi Quà */}
          <Link 
            href="/rewards" 
            className={`flex flex-col items-center gap-0.5 p-1.5 transition-colors ${pathname === "/rewards" ? "text-orange-400 font-bold" : "text-foreground/60 hover:text-orange-400/80"}`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-[9px]">Đổi quà</span>
          </Link>

          {/* Nút 5: Mở rộng Menu trượt toàn phần */}
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center gap-0.5 p-1.5 focus:outline-none transition-colors cursor-pointer ${isOpen ? "text-secondary font-bold" : "text-foreground/60"}`}
          >
            {isOpen ? <X className="w-5 h-5 text-secondary" /> : <Menu className="w-5 h-5" />}
            <span className="text-[9px]">{isOpen ? "Đóng" : "Menu"}</span>
          </button>

        </div>
      </div>

      {/* Lớp Overlay Trượt Toàn Màn Hình Khi Bấm Nút Menu Nổi */}
      {isOpen && (
        <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-[100] flex flex-col justify-between animate-fade-in p-6 pt-16 block md:hidden pointer-events-auto border-t border-white/5">
          
          {/* Header trong Overlay */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="font-bold text-lg tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Menu Hệ Thống</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 rounded-full text-foreground hover:text-secondary focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Khu vực danh mục trượt tổng hợp */}
          <div className="space-y-6 my-auto py-4 overflow-y-auto max-h-[65vh]">
            
            {/* NHÓM 1: KHÁM PHÁ & THƯ VIỆN */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest px-1">
                📌 Khám phá &amp; Thư viện
              </div>
              <div className="space-y-2.5 pt-1">
                {fullLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        link.isSpecial
                          ? "bg-secondary/10 border border-secondary/30 text-secondary shadow-[0_0_15px_rgba(0,255,133,0.15)]"
                          : link.isReward
                          ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                          : isActive
                          ? "bg-surface text-secondary border border-white/10"
                          : "text-foreground/80 hover:bg-surface/50 border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${link.isSpecial ? "text-secondary" : link.isReward ? "text-orange-400" : isActive ? "text-secondary" : "text-foreground/50"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* NHÓM 2: TÀI KHOẢN & QUẢN TRỊ (Hiển thị khi đã đăng nhập) */}
            {user && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-[10px] font-bold text-secondary/80 uppercase tracking-widest px-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>🔑 Tài khoản của tôi</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Link Admin (nếu có quyền) */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Bảng Điều Khiển Admin CMS</span>
                    </Link>
                  )}

                  {/* Link Hồ sơ cá nhân */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold bg-surface border border-white/5 text-foreground hover:border-white/10"
                  >
                    <User className="w-4 h-4 shrink-0 text-foreground/60" />
                    <span>Thông Tin Tài Khoản</span>
                  </Link>

                  {/* Link Affiliate MMO */}
                  <Link
                    href="/affiliate"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold bg-surface border border-white/5 text-secondary hover:border-secondary/30"
                  >
                    <DollarSign className="w-4 h-4 shrink-0 text-secondary" />
                    <span>Bảng Điều Khiển Kiếm Tiền MMO</span>
                  </Link>

                  {/* Nút Đăng xuất */}
                  <button
                    type="button"
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Đăng xuất khỏi thiết bị</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer thông tin đệm */}
          <div className="mt-auto pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-foreground/40">
              {user ? `Đăng nhập với tư cách: ${user.email}` : "Hệ thống hỗ trợ thao tác mượt mà trên di động."}
            </p>
          </div>

        </div>
      )}
    </>
  );
}
