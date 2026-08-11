"use client";

import { useState, useEffect } from "react";
import { LayoutTemplate, Save, CheckCircle2, Loader2, Type, Hash, Info, Link as LinkIcon, Phone } from "lucide-react";

export interface HomePageContent {
  heroTitlePrefix: string;
  heroTypewriter: string[];
  heroTitleSuffix: string;
  heroDescription: string;
  stats: {
    target: number;
    suffix: string;
    label: string;
    sublabel: string;
    displayValue: string | null;
  }[];
  aboutName: string;
  aboutTitle: string;
  aboutDescription: string;
  contactZalo: string;
  contactFacebook: string;
  contactPhone: string;
}

const DEFAULT_CONTENT: HomePageContent = {
  heroTitlePrefix: "Làm Chủ",
  heroTypewriter: ["Trí Tuệ Nhân Tạo", "Tự Động Hóa n8n", "Quy Trình Doanh Nghiệp", "Trợ Lý AI Agent"],
  heroTitleSuffix: "& Tự Động Hóa",
  heroDescription: "Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.",
  stats: [
    { target: 1200, suffix: "+", label: "Học viên", sublabel: "Đang học tập", displayValue: null },
    { target: 150, suffix: "+", label: "Tài liệu Premium", sublabel: "Ebook & Slide", displayValue: null },
    { target: 0, suffix: "", label: "Đánh giá trung bình", sublabel: "Từ học viên", displayValue: "4.9★" },
    { target: 50, suffix: "+", label: "Kịch bản n8n / Make", sublabel: "Tự động hóa thực chiến", displayValue: null },
  ],
  aboutName: "Ngô Quốc Huy",
  aboutTitle: "CEO Vạn Hoả Long Technology",
  aboutDescription: "Là Kỹ sư Cơ khí Chế tạo (ĐH Sư Phạm Kỹ Thuật TP.HCM) và nhà giáo dục, tôi kết hợp giữa chuyên môn kỹ thuật sâu rộng và niềm đam mê truyền đạt kiến thức. Chuyển mình từ giảng viên sang vai trò người sáng lập kiêm CEO của Công ty TNHH Giải Pháp Công Nghệ Vạn Hoả Long, tôi luôn khát khao nâng tầm ngành công nghiệp Việt Nam bằng những giải pháp công nghệ và tự động hóa tiên tiến nhất.",
  contactZalo: "https://zalo.me/0941214544",
  contactFacebook: "https://facebook.com/NgoQuocHuy",
  contactPhone: "0941214544"
};

export default function PageBuilderTab() {
  const [content, setContent] = useState<HomePageContent>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/content?id=home_page");
      const json = await res.json();
      if (json.data) {
        // Merge with default to ensure no missing keys
        setContent({ ...DEFAULT_CONTENT, ...json.data });
      }
    } catch (error) {
      console.error("Lỗi khi tải nội dung trang chủ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "home_page", content })
      });
      if (res.ok) {
        // Gọi revalidate cache
        await fetch("/api/admin/system/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/" })
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Có lỗi xảy ra khi lưu nội dung.");
      }
    } catch (error) {
      alert("Không thể kết nối đến server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatChange = (index: number, field: keyof HomePageContent['stats'][0], value: any) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent({ ...content, stats: newStats });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-secondary" /></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="text-secondary" /> Page Builder (Trang Chủ)</h2>
          <p className="text-foreground/50 text-sm mt-1">Chỉnh sửa trực tiếp nội dung văn bản hiển thị trên trang chủ</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-secondary text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu Cập Nhật
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Đã lưu và cập nhật trang chủ thành công!
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-5">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 text-secondary">
          <Type className="w-5 h-5" /> 1. Hero Section (Tiêu đề chính)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Tiền tố (Prefix)</label>
            <input
              type="text"
              value={content.heroTitlePrefix}
              onChange={(e) => setContent({...content, heroTitlePrefix: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Hậu tố (Suffix)</label>
            <input
              type="text"
              value={content.heroTitleSuffix}
              onChange={(e) => setContent({...content, heroTitleSuffix: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Từ khóa chuyển động (Cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            value={content.heroTypewriter.join(", ")}
            onChange={(e) => setContent({...content, heroTypewriter: e.target.value.split(",").map(s => s.trim())})}
            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Mô tả ngắn</label>
          <textarea
            value={content.heroDescription}
            onChange={(e) => setContent({...content, heroDescription: e.target.value})}
            rows={3}
            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Thông tin liên hệ */}
      <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-5">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 text-blue-400">
          <LinkIcon className="w-5 h-5" /> 2. Cấu hình Liên hệ & Mạng xã hội
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">Zalo (URL chat)</label>
            <input
              type="text"
              value={content.contactZalo}
              onChange={(e) => setContent({...content, contactZalo: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
              placeholder="VD: https://zalo.me/0941214544"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Facebook (URL Trang/Cá nhân)</label>
            <input
              type="text"
              value={content.contactFacebook}
              onChange={(e) => setContent({...content, contactFacebook: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
              placeholder="VD: https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Số điện thoại Hotline</label>
            <input
              type="text"
              value={content.contactPhone}
              onChange={(e) => setContent({...content, contactPhone: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
              placeholder="VD: 0941214544"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-5">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 text-amber-400">
          <Hash className="w-5 h-5" /> 3. Các con số biết nói (Stats)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats.map((stat, idx) => (
            <div key={idx} className="bg-background p-4 rounded-xl border border-white/10 space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground/70 mb-1">Tiêu đề chính (Label)</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-md p-2 text-sm focus:border-secondary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/70 mb-1">Mô tả phụ (Sublabel)</label>
                <input
                  type="text"
                  value={stat.sublabel}
                  onChange={(e) => handleStatChange(idx, "sublabel", e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-md p-2 text-sm focus:border-secondary/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-foreground/70 mb-1">Số đếm</label>
                  <input
                    type="number"
                    value={stat.target}
                    onChange={(e) => handleStatChange(idx, "target", parseInt(e.target.value) || 0)}
                    disabled={!!stat.displayValue}
                    className="w-full bg-surface border border-white/10 rounded-md p-2 text-sm focus:border-secondary/50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div className="w-16">
                  <label className="block text-xs font-bold text-foreground/70 mb-1">Hậu tố</label>
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={(e) => handleStatChange(idx, "suffix", e.target.value)}
                    disabled={!!stat.displayValue}
                    className="w-full bg-surface border border-white/10 rounded-md p-2 text-sm focus:border-secondary/50 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs font-bold text-amber-400 mb-1">Hoặc dùng Text Tĩnh</label>
                <input
                  type="text"
                  value={stat.displayValue || ""}
                  placeholder="VD: 4.9★"
                  onChange={(e) => {
                    const val = e.target.value;
                    handleStatChange(idx, "displayValue", val === "" ? null : val);
                  }}
                  className="w-full bg-surface border border-amber-500/30 rounded-md p-2 text-sm focus:border-amber-500/50 focus:outline-none text-amber-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-surface rounded-xl p-6 border border-white/5 space-y-5">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 text-purple-400">
          <Info className="w-5 h-5" /> 4. Về Chuyên Gia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Tên</label>
            <input
              type="text"
              value={content.aboutName}
              onChange={(e) => setContent({...content, aboutName: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Chức danh</label>
            <input
              type="text"
              value={content.aboutTitle}
              onChange={(e) => setContent({...content, aboutTitle: e.target.value})}
              className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Đoạn giới thiệu (Biography)</label>
          <textarea
            value={content.aboutDescription}
            onChange={(e) => setContent({...content, aboutDescription: e.target.value})}
            rows={5}
            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:border-secondary/50 focus:outline-none resize-none"
          />
        </div>
      </div>

    </div>
  );
}
