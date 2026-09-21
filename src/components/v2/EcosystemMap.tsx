"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, GraduationCap, Calculator, Tv, BookOpen, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PUBLIC_ECOSYSTEM, PublicOrganization } from "@/lib/public-ecosystem";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  GraduationCap,
  Calculator,
  Tv,
  BookOpen,
  Sparkles,
};

export function EcosystemMap() {
  const [activeOrgId, setActiveOrgId] = useState<string>("org-01-huytech");
  const activeOrg = PUBLIC_ECOSYSTEM.find((o) => o.id === activeOrgId) || PUBLIC_ECOSYSTEM[0];

  // Radial positions for satellite nodes (angle in degrees relative to center)
  const SATELLITE_NODES = [
    { id: "org-02-aischool", angle: -90, x: 260, y: 50 },   // Top
    { id: "org-03-smarttax", angle: -160, x: 60, y: 150 },  // Top-Left
    { id: "org-04-media-tech", angle: -20, x: 460, y: 150 }, // Top-Right
    { id: "org-05-media-edu", angle: 140, x: 100, y: 340 },  // Bottom-Left
    { id: "org-06-media-creative", angle: 40, x: 420, y: 340 }, // Bottom-Right
  ];

  return (
    <div className="w-full max-w-5xl mx-auto" role="region" aria-label="Sơ đồ tương tác hệ sinh thái 6 doanh nghiệp HUY AI">
      {/* Desktop Radial Constellation View (>= 1024px) */}
      <div className="hidden lg:block relative w-full h-[460px] bg-surface/30 rounded-3xl border border-white/10 p-6 overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Background decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* SVG Live Connection Rays */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0070F3" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {SATELLITE_NODES.map((node) => {
            const isSelected = activeOrgId === node.id;
            return (
              <line
                key={`line-${node.id}`}
                x1={260} // Center node x
                y1={210} // Center node y
                x2={node.x}
                y2={node.y}
                stroke={isSelected ? "#00E5FF" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={isSelected ? "2.5" : "1.5"}
                strokeDasharray={isSelected ? "6 3" : "none"}
                className={isSelected ? "animate-pulse" : ""}
              />
            );
          })}
        </svg>

        {/* Central Node: HUY TECHNOLOGY AI GROUP */}
        <button
          type="button"
          onClick={() => setActiveOrgId("org-01-huytech")}
          className={`absolute left-[260px] top-[210px] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 transition-all duration-300 ${
            activeOrgId === "org-01-huytech"
              ? "border-[#00E5FF] bg-[#070B14] shadow-[0_0_35px_rgba(0,229,255,0.6)] scale-105"
              : "border-white/20 bg-[#070B14]/80 hover:border-[#00E5FF]/60 hover:scale-102"
          }`}
          aria-pressed={activeOrgId === "org-01-huytech"}
          aria-label="HUY TECHNOLOGY AI GROUP (Tập đoàn công nghệ lõi)"
        >
          <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] mb-1">
            <Cpu className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-extrabold text-white text-center leading-tight px-2">
            HUY TECHNOLOGY
          </span>
          <span className="text-[9px] text-[#00E5FF] font-semibold tracking-wider uppercase mt-0.5">
            Core Holding
          </span>
        </button>

        {/* Orbiting Satellite Nodes (5 BUs) */}
        {SATELLITE_NODES.map((node) => {
          const org = PUBLIC_ECOSYSTEM.find((o) => o.id === node.id)!;
          const Icon = ICON_MAP[org.icon_name] || Cpu;
          const isSelected = activeOrgId === org.id;

          return (
            <button
              key={org.id}
              type="button"
              onClick={() => setActiveOrgId(org.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all duration-300 group ${
                isSelected
                  ? "bg-[#0F172A] scale-110 shadow-xl"
                  : "bg-[#0F172A]/70 hover:scale-105"
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                borderColor: isSelected ? org.accent_color : "rgba(255, 255, 255, 0.12)",
                boxShadow: isSelected ? `0 0 25px ${org.accent_color}55` : undefined,
              }}
              aria-pressed={isSelected}
              aria-label={`${org.display_name} (${org.brand_role})`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: org.badge_bg, color: org.badge_text }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white text-center px-1 leading-tight line-clamp-1">
                {org.display_name.replace("HUY ", "").replace("GVCNCDSAI ", "")}
              </span>
            </button>
          );
        })}

        {/* Desktop Active Organization Floating Detail Drawer */}
        <div className="absolute right-6 top-6 bottom-6 w-80 bg-[#0F172A]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-2xl z-30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: activeOrg.badge_bg,
                  color: activeOrg.badge_text,
                  borderColor: `${activeOrg.accent_color}40`,
                }}
              >
                {activeOrg.brand_role}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeOrg.public_status}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white mb-1.5 leading-snug">
              {activeOrg.display_name}
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {activeOrg.short_description}
            </p>

            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Năng lực nổi bật:
              </span>
              {activeOrg.public_capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link
              href={activeOrg.public_website_target}
              target={activeOrg.public_website_target.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all hover:scale-102"
              style={{ backgroundColor: activeOrg.accent_color }}
            >
              <span>Truy cập đơn vị</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Fallback View (< 1024px) */}
      <div className="lg:hidden w-full space-y-4">
        {/* Horizontal Swipeable Organization Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {PUBLIC_ECOSYSTEM.map((org) => {
            const Icon = ICON_MAP[org.icon_name] || Cpu;
            const isSelected = activeOrgId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => setActiveOrgId(org.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-[#0F172A] text-white border-brand-primary shadow-lg"
                    : "bg-surface/50 text-slate-400 border-white/5 hover:text-white"
                }`}
                style={{
                  borderColor: isSelected ? org.accent_color : undefined,
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: org.accent_color }} />
                <span>{org.display_name.replace("HUY ", "").replace("GVCNCDSAI ", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Active Organization Card for Mobile */}
        <div
          className="rounded-2xl bg-[#0F172A] border p-5 shadow-xl space-y-4"
          style={{ borderColor: `${activeOrg.accent_color}50` }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: activeOrg.badge_bg, color: activeOrg.badge_text }}
            >
              {activeOrg.brand_role}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeOrg.public_status}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-1">
              {activeOrg.display_name}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeOrg.short_description}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Năng lực vận hành chính:
            </span>
            {activeOrg.public_capabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brand-primary" />
                <span>{cap}</span>
              </div>
            ))}
          </div>

          <Link
            href={activeOrg.public_website_target}
            target={activeOrg.public_website_target.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-black transition-all"
            style={{ backgroundColor: activeOrg.accent_color }}
          >
            <span>Khám phá {activeOrg.display_name}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
