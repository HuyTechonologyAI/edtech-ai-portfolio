"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function CorporateFloatingWidgets() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkMenu = () => {
      setIsMenuOpen(document.body.classList.contains("v2-menu-open"));
    };

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      checkMenu();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const observer = new MutationObserver(checkMenu);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Suppress floating widgets completely when mobile navigation drawer is open
  if (isMenuOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Kênh hỗ trợ nhanh"
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 md:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none"
    >
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full bg-[#0F172A]/90 border border-white/15 text-slate-300 hover:text-white hover:border-[#00E5FF] flex items-center justify-center shadow-lg transition-all pointer-events-auto backdrop-blur-md"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Official Zalo Consultation Widget */}
      <a
        href="https://zalo.me/0961364600"
        target="_blank"
        rel="noopener noreferrer"
        className="group pointer-events-auto flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-[#0068FF] text-white shadow-[0_4px_20px_rgba(0,104,255,0.4)] hover:shadow-[0_6px_25px_rgba(0,104,255,0.6)] hover:scale-105 transition-all duration-300"
        aria-label="Tư vấn trực tiếp qua Zalo"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        <span className="text-xs font-bold tracking-wide">Zalo Tư Vấn</span>
      </a>
    </aside>
  );
}
