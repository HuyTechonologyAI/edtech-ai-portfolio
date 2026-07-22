"use client";

import { useState } from "react";
import { MessageCircle, Users, X, Phone } from "lucide-react";

// Icon Zalo SVG thuần — không cần thư viện ngoài
function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="#0068FF" />
      <path
        d="M24 10C16.268 10 10 16.268 10 24C10 26.95 10.88 29.69 12.39 31.98L10.5 38L16.74 36.16C18.96 37.57 21.38 38.35 24 38.35C31.732 38.35 38 32.082 38 24.35C38 16.618 31.732 10 24 10Z"
        fill="white"
        fillOpacity="0.15"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="-0.5"
      >
        Zalo
      </text>
    </svg>
  );
}

// Icon Facebook SVG thuần
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface SocialLink {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: React.ReactNode;
  colorClass: string;
  hoverClass: string;
  borderClass: string;
}

export default function ZaloFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  // ⚠️ TODO: Thay các link placeholder bằng link thật của bạn
  const socialLinks: SocialLink[] = [
    {
      id: "zalo-oa",
      label: "Zalo Official",
      sublabel: "Nhắn tin tư vấn ngay",
      href: "https://zalo.me/0000000000", // TODO: Thay link Zalo OA thật
      icon: <ZaloIcon className="w-5 h-5" />,
      colorClass: "text-white",
      hoverClass: "hover:bg-blue-600",
      borderClass: "border-blue-500/30",
    },
    {
      id: "zalo-group",
      label: "Nhóm Zalo",
      sublabel: "Cộng đồng học viên",
      href: "https://zalo.me/g/xxxxxx", // TODO: Thay link nhóm Zalo thật
      icon: <Users className="w-5 h-5 text-blue-400" />,
      colorClass: "text-blue-400",
      hoverClass: "hover:bg-blue-500/10",
      borderClass: "border-blue-500/20",
    },
    {
      id: "facebook",
      label: "Facebook Group",
      sublabel: "ZentraTech Community",
      href: "https://facebook.com/groups/zentratech", // TODO: Thay link FB Group thật
      icon: <FacebookIcon className="w-5 h-5 text-blue-500" />,
      colorClass: "text-blue-500",
      hoverClass: "hover:bg-blue-500/10",
      borderClass: "border-blue-500/20",
    },
    {
      id: "phone",
      label: "Hotline",
      sublabel: "Hỗ trợ 8:00 – 22:00",
      href: "tel:+84000000000", // TODO: Thay số điện thoại thật
      icon: <Phone className="w-5 h-5 text-secondary" />,
      colorClass: "text-secondary",
      hoverClass: "hover:bg-secondary/10",
      borderClass: "border-secondary/20",
    },
  ];

  return (
    <>
      {/* Backdrop mờ khi menu mở */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container fixed góc phải */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Social Menu — hiện khi isOpen */}
        <div
          className={`flex flex-col gap-2 transition-all duration-300 origin-bottom-right ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-90 translate-y-4 pointer-events-none"
          }`}
        >
          {socialLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-xl border ${link.borderClass} ${link.hoverClass} shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all hover:scale-105 group`}
            >
              <div className="flex-shrink-0">{link.icon}</div>
              <div className="text-left min-w-[120px]">
                <p className={`text-xs font-bold ${link.colorClass}`}>
                  {link.label}
                </p>
                <p className="text-[10px] text-foreground/40">{link.sublabel}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Mở menu hỗ trợ"
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,104,255,0.4)] transition-all duration-300 ${
            isOpen
              ? "bg-surface border border-white/10 rotate-0"
              : "bg-[#0068FF] hover:bg-[#0057d9] hover:scale-110"
          }`}
        >
          {/* Pulse ring animation khi đóng */}
          {!isOpen && (
            <>
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500/30 animate-ping" />
              <span className="absolute inline-flex h-[110%] w-[110%] rounded-full bg-blue-500/10 animate-pulse" />
            </>
          )}

          {isOpen ? (
            <X className="w-5 h-5 text-foreground/70" />
          ) : (
            <ZaloIcon className="w-8 h-8" />
          )}
        </button>
      </div>
    </>
  );
}
