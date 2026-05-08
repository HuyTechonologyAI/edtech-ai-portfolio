import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatbot } from "@/components/AIChatbot";

import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Meta Pixel Code Placeholder */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1234567890'); /* THAY ID PIXEL CỦA BẠN VÀO ĐÂY */
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Google Analytics component */}
        <GoogleAnalytics gaId="G-XYZ123456" /> {/* THAY ID GOOGLE ANALYTICS VÀO ĐÂY */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl tracking-tight">AI & Auto<span className="text-secondary">Expert</span></div>
              <nav className="hidden md:flex gap-6 items-center">
                <a href="/" className="text-sm font-medium hover:text-secondary transition-colors">Trang chủ</a>
                <a href="/roadmap" className="text-sm font-medium hover:text-secondary transition-colors">Lộ trình</a>
                <a href="/resources" className="text-sm font-medium hover:text-secondary transition-colors">Tài liệu</a>
                <a href="/videos" className="text-sm font-medium hover:text-secondary transition-colors">Videos</a>
              </nav>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <a href="/contact" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors hidden sm:block">
                  Liên hệ
                </a>
              </div>
            </div>
          </header>

          {children}

          <footer className="border-t border-border bg-surface py-8 mt-auto">
            <div className="container mx-auto px-4 text-center text-foreground/60 text-sm">
              &copy; {new Date().getFullYear()} AI & Automation Expert. All rights reserved.
            </div>
          </footer>
          
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
