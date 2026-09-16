"use client";

import Link from "next/link";
import { Sparkles, Play } from "lucide-react";

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=alpha&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=beta&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=gamma&backgroundColor=d1d4f9",
];

const INTEGRATIONS = [
  { name: "Zapier", emoji: "⚡" },
  { name: "Make", emoji: "🔗" },
  { name: "n8n", emoji: "🔀" },
  { name: "UiPath", emoji: "🤖" },
  { name: "Tray.io", emoji: "🔧" },
  { name: "Workato", emoji: "⚙️" },
];

const MARQUEE_ITEMS = [...INTEGRATIONS, ...INTEGRATIONS];

export function QuimicaHeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://cdn.sceneai.art/Hero Section Video/247f75dd-335a-4aaa-ba65-47df2f7b24b9.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Minimal overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center text-center px-4 pt-24 sm:pt-28 md:pt-32">

        {/* Social Proof */}
        <div className="qumica-fade-1 flex items-center gap-3 mb-7">
          <div className="flex -space-x-2.5">
            {AVATARS.map((src, i) => (
              <div
                key={i}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/60 overflow-hidden bg-white/10 shrink-0"
                style={{ zIndex: AVATARS.length - i }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`User ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 fill-orange-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white/80 text-xs sm:text-[13px] font-medium leading-tight mt-0.5">
              Trusted by <strong className="text-white">500+</strong> teams
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="qumica-fade-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl">
          Ready to{" "}
          <em className="not-italic font-black" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
            elevate
          </em>{" "}
          your<br className="hidden sm:block" />
          digital infrastructure?
        </h1>

        {/* Subheadline */}
        <p className="qumica-fade-3 mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-white/70 max-w-xl md:max-w-2xl leading-relaxed">
          We build high-performance solutions to modernize operations<br className="hidden md:block" />
          and drive growth across your entire organization.
        </p>

        {/* CTA Buttons */}
        <div className="qumica-fade-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          <Link
            href="/contact"
            className="animate-light-sweep relative overflow-hidden flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm sm:text-base shadow-[0_8px_30px_rgba(234,88,12,0.45)] bg-gradient-to-r from-orange-500 via-purple-600 to-orange-500 animate-gradient-shift hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm sm:text-base bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            View Platform
          </Link>
        </div>
      </div>

      {/* Integration Marquee */}
      <div className="qumica-fade-5 relative z-10 mt-auto pb-8 sm:pb-12 pt-10">
        <p className="text-center text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] mb-4">
          Integrating with leading automation
        </p>
        <div className="overflow-hidden relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black/30 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black/30 to-transparent z-10" />
          <div className="animate-marquee">
            {MARQUEE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mx-6 sm:mx-10 shrink-0">
                <span className="text-xl sm:text-2xl drop-shadow-lg">{item.emoji}</span>
                <span
                  className="text-white/90 font-semibold text-sm sm:text-base tracking-wide"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
