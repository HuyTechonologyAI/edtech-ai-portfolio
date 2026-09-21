"use client";

import Link from "next/link";
import { Tv, BookOpen, Sparkles, ExternalLink, Play, Video } from "lucide-react";

export function MediaEcosystem() {
  const mediaUnits = [
    {
      name: "HUY TECH MEDIA",
      role: "Technology Media Agency",
      status: "BETA / NỘI BỘ",
      focus: "Công nghệ AI, kiến trúc hệ thống, phân tích tự động hóa n8n và chuyển đổi số doanh nghiệp.",
      channels: ["Bản tin AI Architecture", "Video bài giảng lập trình AI", "Tài liệu chuyên khảo kỹ thuật"],
      accent: "#00D2FF",
      icon: Tv,
      url: "/videos",
    },
    {
      name: "GVCNCDSAI MEDIA",
      role: "Education Media Agency",
      status: "ĐANG PHÁT TRIỂN",
      focus: "Phương pháp giảng dạy sư phạm STEM, kỹ năng số cho nhà giáo và truyền cảm hứng học tập cho học sinh.",
      channels: ["Video hướng dẫn Công văn 5512", "Cẩm nang chuyển đổi số giáo dục", "Podcast truyền cảm hứng sư phạm"],
      accent: "#10B981",
      icon: BookOpen,
      url: "https://gvcncdsai.io.vn",
    },
    {
      name: "HUY CREATIVE MEDIA",
      role: "Creative Media",
      status: "KẾ HOẠCH",
      focus: "Nghiên cứu ứng dụng công cụ sáng tạo nội dung, âm thanh và đồ họa AI bản quyền.",
      channels: ["Thử nghiệm âm thanh AI", "Nội dung số dạng ngắn", "Thiết kế đồ họa tự động"],
      accent: "#8B5CF6",
      icon: Sparkles,
      url: "#contact",
    },
  ];

  return (
    <section id="media" className="w-full py-24 bg-[#0A1124] border-t border-white/5 scroll-mt-24 md:scroll-mt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" /> Mạng Lưới Truyền Thông
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Hệ Sinh Thái Truyền Thông Chuyên Biệt
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            Ba thương hiệu truyền thông phục vụ ba đối tượng khán giả độc lập: cộng đồng công nghệ, giới giáo dục sư phạm và người dùng sáng tạo nội dung số.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mediaUnits.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#0F172A] border border-white/10 p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${m.accent}18`, color: m.accent }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: `${m.accent}12`,
                          color: m.accent,
                          borderColor: `${m.accent}30`,
                        }}
                      >
                        {m.role}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {m.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.focus}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Nội dung phát hành:
                    </span>
                    {m.channels.map((ch, ci) => (
                      <div key={ci} className="flex items-center gap-2 text-xs text-slate-200">
                        <Play className="w-3 h-3 text-[#00E5FF] shrink-0" />
                        <span>{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5">
                  <Link
                    href={m.url}
                    target={m.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all hover:scale-102"
                    style={{ backgroundColor: m.accent }}
                  >
                    <span>Khám phá kênh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
