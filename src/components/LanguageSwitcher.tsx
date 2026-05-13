"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", name: "Vietnamese" },
  { code: "en", label: "English", flag: "🇬🇧", name: "English" },
  { code: "zh-CN", label: "中文 (简体)", flag: "🇨🇳", name: "Chinese" },
  { code: "ja", label: "日本語", flag: "🇯🇵", name: "Japanese" },
  { code: "ko", label: "한국어", flag: "🇰🇷", name: "Korean" },
  { code: "fr", label: "Français", flag: "🇫🇷", name: "French" },
  { code: "es", label: "Español", flag: "🇪🇸", name: "Spanish" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", name: "German" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", name: "Hindi" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("vi");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Phân tích ngôn ngữ hiện tại từ Google Translate Cookie
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = match[1].split("/");
      const langCode = parts[parts.length - 1];
      if (langCode) setCurrentLang(langCode);
    }

    // 2. Nhúng Script Google Translate tự động ngầm
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "vi",
              autoDisplay: false,
              includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      // Ẩn hoàn toàn các thanh công cụ và banner rác của Google Translate
      const style = document.createElement("style");
      style.innerHTML = `
        #google_translate_element { display: none !important; }
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        #goog-gt-tt { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Đóng popup khi bấm ra ngoài
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (code: string) => {
    setCurrentLang(code);
    setIsOpen(false);

    // Cấu hình cookie dịch tự động toàn diện của Google
    const val = `/vi/${code}`;
    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; domain=.${window.location.hostname}; path=/;`;
    
    // Tải lại trang để Google DOM Parser áp dụng dịch thuật triệt để lên 100% nội dung
    window.location.reload();
  };

  const activeObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      {/* Vùng ẩn chứa node khởi tạo của Google Translate */}
      <div id="google_translate_element" className="hidden"></div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-white/10 hover:border-secondary/40 transition-all text-xs font-bold text-foreground/80 hover:text-secondary group shadow-[0_0_15px_rgba(0,0,0,0.2)]"
        title="Chọn ngôn ngữ hiển thị (Select Language)"
      >
        <Globe className="w-3.5 h-3.5 text-secondary animate-pulse group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-base leading-none">{activeObj.flag}</span>
        <span className="uppercase font-mono tracking-wider text-[11px] hidden sm:inline">
          {activeObj.label.split(" ")[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-foreground/40 group-hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/80 p-2 z-50 animate-fade-in backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-white/5 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/80">
              🌐 Đa ngôn ngữ (Auto-Translate)
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {LANGUAGES.map((item) => {
              const isActive = item.code === currentLang;
              return (
                <button
                  key={item.code}
                  onClick={() => selectLanguage(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-secondary/15 text-secondary font-bold border border-secondary/30"
                      : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-[9px] text-foreground/40">{item.name}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-secondary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
