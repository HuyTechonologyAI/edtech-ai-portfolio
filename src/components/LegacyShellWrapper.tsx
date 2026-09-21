"use client";

import { usePathname } from "next/navigation";
import { EcosystemHeaderBar } from "@/components/EcosystemHeaderBar";
import { EcosystemFooter } from "@/components/EcosystemFooter";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { AIChatbot } from "@/components/AIChatbot";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import Link from "next/link";
import { StreakWidget } from "@/components/StreakWidget";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserMenu } from "@/components/UserMenu";

export function LegacyShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isV2 = pathname?.startsWith("/v2") ?? false;

  // For /v2 preview route: isolate from legacy UI chrome
  if (isV2) {
    return <>{children}</>;
  }

  // For root / (Corporate V2): isolate from legacy UI chrome
  if (pathname === "/") {
    return <>{children}</>;
  }

  // For all legacy routes: render original layout chrome
  return (
    <>
      <EcosystemHeaderBar />

      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight">
            AI & Auto<span className="text-secondary neon-glow-text">Expert</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">
              Trang chủ
            </Link>
            <Link href="/roadmap" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">
              Lộ trình
            </Link>
            <Link href="/resources" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">
              Tài liệu
            </Link>
            <Link href="/videos" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">
              Videos
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_8px_rgba(0,255,133,0.3)]">
              💎 Bảng giá
            </Link>
            <Link href="/rewards" className="text-sm font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 hover:scale-105 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              🎁 Đổi Quà
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-2.5">
            <StreakWidget />
            <LanguageSwitcher />
            <Link href="/contact" className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/50 rounded-full text-sm font-bold hover:bg-secondary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,133,0.4)] transition-all hidden sm:block">
              Liên hệ
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <MobileNavMenu />
      {children}
      <EcosystemFooter />
      <AIChatbot />
      <ZaloFloatingButton />
    </>
  );
}
