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
import { StreakWidget } from "@/components/StreakWidget";
import { ReferralTracker } from "@/components/ReferralTracker";
import { LegacyShellWrapper } from "@/components/LegacyShellWrapper";
import { GoogleTagManager } from "@next/third-parties/google";
import ScrollProgressBar from "@/components/ScrollProgressBar";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-inter", // Keep variable name to avoid breaking css
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-geist-mono", // Repurpose mono for headers if needed
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://huycncdsai.io.vn"),
  title: {
    default: "AI & Automation Expert | Chuyên gia Chuyển Đổi Số - Huy Technology AI Hub",
    template: "%s | Huy Technology AI Hub",
  },
  description: "Hệ sinh thái đào tạo thực chiến & giải pháp Trí tuệ Nhân tạo, AI Agent, n8n, Make.com sáng lập bởi Chuyên gia AI Ngô Quốc Huy (Huy Technology AI Hub kết nối EduViet AI và SmartTax AI).",
  keywords: [
    "AI", 
    "Automation", 
    "Tự động hóa", 
    "Chuyển đổi số", 
    "Khóa học AI", 
    "n8n", 
    "Make.com", 
    "Huy Technology AI Hub", 
    "Ngô Quốc Huy", 
    "EduViet AI", 
    "SmartTax AI"
  ],
  authors: [{ name: "Ngô Quốc Huy (Chuyên gia AI)", url: "https://huycncdsai.io.vn" }],
  creator: "Ngô Quốc Huy",
  publisher: "Huy Technology AI Hub",
  openGraph: {
    title: "AI & Automation Expert | Huy Technology AI Hub",
    description: "Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.",
    url: "https://huycncdsai.io.vn",
    siteName: "AI & AutoExpert Hub",
    images: [
      {
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "AI & Automation Hub - Huy Technology AI",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://huycncdsai.io.vn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Huy Technology AI Hub",
    "alternateName": "Vạn Hỏa Long Tech",
    "url": "https://huycncdsai.io.vn",
    "founder": {
      "@type": "Person",
      "name": "Ngô Quốc Huy",
      "jobTitle": "Chuyên gia AI & Automation, Giảng viên Chuyển đổi số"
    },
    "sameAs": [
      "https://gvcncdsai.io.vn",
      "https://smarttax-ai.vercel.app"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-961-364-600",
      "contactType": "customer service",
      "email": "huytechnologyai2025@gmail.com",
      "areaServed": "VN"
    }
  };

  return (
    <html
      lang="vi"
      className={`${jakarta.variable} ${space.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00ff85" />
        <link rel="apple-touch-icon" href="/globe.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA ServiceWorker registered with scope:', registration.scope);
                  }).catch(function(err) {
                    console.error('ServiceWorker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
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
            <ScrollProgressBar />
            
            <LegacyShellWrapper>
              {children}
            </LegacyShellWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
