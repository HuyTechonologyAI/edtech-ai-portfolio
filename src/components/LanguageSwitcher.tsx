"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  useEffect(() => {
    const savedLang = (localStorage.getItem("app_lang") as "vi" | "en") || "vi";
    setLang(savedLang);
    applyLanguage(savedLang);
  }, []);

  const applyLanguage = (targetLang: "vi" | "en") => {
    document.documentElement.setAttribute("data-lang", targetLang);
    
    // Quick real-time client-side localization translation mapping for navigation items
    const navLinks = document.querySelectorAll("header nav a");
    const contactBtn = document.querySelector("header a[href='/contact']");
    
    if (targetLang === "en") {
      if (navLinks[0]) navLinks[0].textContent = "Home";
      if (navLinks[1]) navLinks[1].textContent = "Roadmap";
      if (navLinks[2]) navLinks[2].textContent = "Resources";
      if (navLinks[3]) navLinks[3].textContent = "Videos";
      if (contactBtn) contactBtn.textContent = "Contact";
    } else {
      if (navLinks[0]) navLinks[0].textContent = "Trang chủ";
      if (navLinks[1]) navLinks[1].textContent = "Lộ trình";
      if (navLinks[2]) navLinks[2].textContent = "Tài liệu";
      if (navLinks[3]) navLinks[3].textContent = "Videos";
      if (contactBtn) contactBtn.textContent = "Liên hệ";
    }
  };

  const toggleLanguage = () => {
    const nextLang = lang === "vi" ? "en" : "vi";
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
    applyLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-white/10 hover:border-secondary/40 transition-all text-xs font-bold text-foreground/80 hover:text-secondary group"
      title={lang === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Globe className="w-3.5 h-3.5 text-secondary group-hover:rotate-45 transition-transform duration-300" />
      <span className="uppercase font-mono tracking-wider">{lang}</span>
    </button>
  );
}
