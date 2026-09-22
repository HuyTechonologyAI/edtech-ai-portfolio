"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, Menu, X, ArrowRight } from "lucide-react";

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Check preview environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.includes("vercel.app") || host === "localhost" || host.includes("preview")) {
        const timer = setTimeout(() => setIsPreview(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Prevent background scroll and signal menu-open state to floating widgets
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("v2-menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("v2-menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("v2-menu-open");
    };
  }, [mobileMenuOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070B14]/90 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between max-w-7xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#0070F3] p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] transition-all">
              <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center text-[#00E5FF]">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black tracking-tight text-white group-hover:text-[#00E5FF] transition-colors">
                HUY TECHNOLOGY
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#00E5FF] uppercase -mt-0.5">
                AI GROUP
              </span>
            </div>
          </Link>

          {isPreview && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Bản xem trước
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <Link href="#hero" className="hover:text-[#00E5FF] transition-colors">
            Trang chủ
          </Link>
          <Link href="#ecosystem" className="hover:text-[#00E5FF] transition-colors">
            Hệ sinh thái
          </Link>
          <Link href="#ai-agency" className="hover:text-[#00E5FF] transition-colors">
            AI Agency
          </Link>
          <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
            Giải pháp
          </Link>
          <Link href="#products" className="hover:text-[#00E5FF] transition-colors">
            Sản phẩm
          </Link>
          <Link href="#technology" className="hover:text-[#00E5FF] transition-colors">
            Công nghệ HAIP
          </Link>
          <Link href="#leadership" className="hover:text-[#00E5FF] transition-colors">
            Lãnh đạo
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Primary CTA */}
          <Link
            href="#contact"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-[#00E5FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:scale-102 transition-all"
          >
            <span>Tư vấn AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <Link
            href="#contact"
            className="px-3 py-1.5 rounded-full text-[11px] font-bold text-black bg-[#00E5FF]"
          >
            Tư vấn
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface/50 border border-white/10 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full border-b border-white/10 bg-[#070B14]/95 backdrop-blur-2xl px-6 py-5 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            <Link
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Trang chủ
            </Link>
            <Link
              href="#ecosystem"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Hệ sinh thái (6 BUs)
            </Link>
            <Link
              href="#ai-agency"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Mô hình AI Agency
            </Link>
            <Link
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Giải pháp Doanh nghiệp
            </Link>
            <Link
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Sản phẩm & Nền tảng
            </Link>
            <Link
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Hạ tầng & Giao thức HAIP
            </Link>
            <Link
              href="#leadership"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#00E5FF] transition-colors py-1"
            >
              Sáng lập & Lãnh đạo
            </Link>
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-black bg-[#00E5FF]"
            >
              <span>Đăng ký tư vấn AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
