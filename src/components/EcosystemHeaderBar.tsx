"use client";

import Link from "next/link";
import { Sparkles, ExternalLink, GraduationCap, Calculator, Cpu } from "lucide-react";

export function EcosystemHeaderBar() {
  const platforms = [
    {
      name: "Smart Teacher AI (EduViet)",
      tagline: "Trợ lý Sư Phạm & Lịch Dạy",
      href: "https://gvcncdsai.io.vn",
      icon: GraduationCap,
      color: "text-amber-400 hover:text-amber-300",
      badge: "EdTech AI",
      active: false,
    },
    {
      name: "SmartTax AI",
      tagline: "Kê Khai Thuế & Tài Chính DN",
      href: "https://smarttax-ai.vercel.app",
      icon: Calculator,
      color: "text-cyan-400 hover:text-cyan-300",
      badge: "FinTech AI",
      active: false,
    },
    {
      name: "AI & AutoExpert",
      tagline: "Đào Tạo n8n & MMO Automation",
      href: "https://huycncdsai.io.vn",
      icon: Cpu,
      color: "text-secondary hover:text-secondary/80",
      badge: "Hub Đang Xem",
      active: true,
    },
  ];

  return (
    <div className="w-full bg-surface/90 backdrop-blur-md border-b border-white/5 py-1.5 px-4 text-xs z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-extrabold uppercase tracking-wider text-[10px] text-foreground/50">
            <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
            <span>Hệ Sinh Thái Huy Technology AI:</span>
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2 md:gap-4 text-[11px]">
          {platforms.map((p) => {
            const Icon = p.icon;
            if (p.active) {
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold"
                  title={`${p.name} - ${p.tagline}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                  <span className="text-[9px] bg-secondary text-black font-mono font-extrabold px-1 rounded">
                    {p.badge}
                  </span>
                </div>
              );
            }

            return (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-white/5 transition-all font-medium ${p.color}`}
                title={`${p.name} - ${p.tagline} (Mở tab mới)`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden">{p.name.split(" ")[0]}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
