import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatbot } from "@/components/AIChatbot";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { AuthProvider } from "@/components/AuthProvider";
import { UserMenu } from "@/components/UserMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ReferralTracker } from "@/components/ReferralTracker";
import { MobileNavMenu } from "@/components/MobileNavMenu";

import { GoogleTagManager } from "@next/third-parties/google";
import Link from "next/link";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-inter", // Keep variable name to avoid breaking css
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-geist-mono", // Repurpose mono for headers if needed
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI & Automation Expert | Chuyên gia chuyển đổi số",
  description: "Trang web cá nhân của chuyên gia đào tạo AI và Automation. Cung cấp các giải pháp tối ưu hóa quy trình, x10 hiệu suất làm việc bằng Make, n8n và ChatGPT.",
  keywords: ["AI", "Automation", "Tự động hóa", "Chuyển đổi số", "Khóa học AI", "n8n", "Make.com"],
  authors: [{ name: "AI Expert" }],
  openGraph: {
    title: "AI & Automation Expert | Chuyên gia chuyển đổi số",
    description: "Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.",
    url: "https://ten-ban.vercel.app",
    siteName: "AI & AutoExpert",
    images: [
      {
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop", // Placeholder đẹp, chuẩn kích thước
        width: 1200,
        height: 630,
        alt: "AI & Automation Cover",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${space.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-secondary selection:text-black cursor-auto md:cursor-none">
        <div className="hidden md:block">
          <CustomCursor />
        </div>
        <FloatingOrbs />
        <GoogleTagManager gtmId="GTM-5355K5SN" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-2xl tracking-tight">AI & Auto<span className="text-secondary neon-glow-text">Expert</span></div>
                <nav className="hidden md:flex gap-8 items-center">
                  <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">Trang chủ</Link>
                  <Link href="/roadmap" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">Lộ trình</Link>
                  <Link href="/resources" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">Tài liệu</Link>
                  <Link href="/videos" className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors">Videos</Link>
                  <Link href="/pricing" className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors drop-shadow-[0_0_8px_rgba(0,255,133,0.3)]">💎 Bảng giá</Link>
                  <Link href="/rewards" className="text-sm font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 hover:scale-105 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]">🎁 Đổi Quà</Link>
                </nav>
                <div className="flex items-center gap-2 md:gap-2.5">
                  <LanguageSwitcher />
                  <Link href="/contact" className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/50 rounded-full text-sm font-bold hover:bg-secondary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,133,0.4)] transition-all hidden sm:block">
                    Liên hệ
                  </Link>
                  <UserMenu />
                  <MobileNavMenu />
                </div>
              </div>
            </header>

            {children}

            <footer className="border-t border-border/40 bg-background py-8 mt-auto">
              <div className="container mx-auto px-4 text-center text-foreground/40 text-sm">
                &copy; {new Date().getFullYear()} AI & Automation Expert. All rights reserved.
              </div>
            </footer>
          
            <AIChatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
