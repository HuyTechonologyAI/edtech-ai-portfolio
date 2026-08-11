"use client";

import { useState } from "react";
import { Globe, Save, CheckCircle2, Image as ImageIcon, Search, Layout, FileCode2 } from "lucide-react";

export default function SeoManagerTab() {
  const [seoData, setSeoData] = useState({
    title: "ZentraTech Academy - Master AI & Automation",
    description: "Nền tảng học tập AI và Tự động hóa hàng đầu Việt Nam. Cung cấp khóa học Prompt Engineering, Make.com, n8n và AI Agents.",
    keywords: "AI, Automation, n8n, Make.com, Prompt Engineering, Khóa học AI",
    ogImage: "https://zentratech.edu.vn/og-image.jpg",
    indexing: "index, follow"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Giả lập gọi API lưu cấu hình SEO
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản Lý SEO Toàn Cầu</h2>
          <p className="text-foreground/50 text-sm mt-1">Cấu hình thẻ Meta, Open Graph và Robots cho toàn bộ hệ thống</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-secondary text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : <><Save className="w-4 h-4" /> Lưu Cấu Hình</>}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Cập nhật thiết lập SEO thành công!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Form Cấu Hình */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl p-6 border border-white/5 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
              <Globe className="w-5 h-5 text-secondary" /> Meta Tags Toàn Cầu
            </h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Thẻ Tiêu Đề (Meta Title)</label>
              <input
                type="text"
                value={seoData.title}
                onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
              />
              <p className={`text-xs mt-2 ${seoData.title.length > 60 ? "text-amber-500" : "text-foreground/50"}`}>
                {seoData.title.length}/60 ký tự (Khuyến nghị dưới 60)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Thẻ Mô Tả (Meta Description)</label>
              <textarea
                value={seoData.description}
                onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                rows={3}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none resize-none"
              />
              <p className={`text-xs mt-2 ${seoData.description.length > 160 ? "text-amber-500" : "text-foreground/50"}`}>
                {seoData.description.length}/160 ký tự (Khuyến nghị 150-160)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Từ Khóa (Meta Keywords)</label>
              <input
                type="text"
                value={seoData.keywords}
                onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
                placeholder="Ngăn cách bằng dấu phẩy"
              />
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 border border-white/5 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
              <FileCode2 className="w-5 h-5 text-purple-400" /> Kỹ Thuật (Robots & Indexing)
            </h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Quy tắc Index (Robots Meta)</label>
              <select
                value={seoData.indexing}
                onChange={(e) => setSeoData({...seoData, indexing: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
              >
                <option value="index, follow">Cho phép tìm kiếm (index, follow)</option>
                <option value="noindex, nofollow">Ẩn khỏi tìm kiếm (noindex, nofollow)</option>
                <option value="index, nofollow">Index nhưng không follow link</option>
              </select>
              <p className="text-xs text-foreground/50 mt-2">Xác định cách Google Bot quét trang web của bạn.</p>
            </div>
          </div>
        </div>

        {/* Cấu Hình Hình Ảnh & Preview */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl p-6 border border-white/5 space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
              <ImageIcon className="w-5 h-5 text-amber-400" /> Open Graph Image (Ảnh chia sẻ mạng xã hội)
            </h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">URL Ảnh Thumbnail (1200x630px)</label>
              <input
                type="text"
                value={seoData.ogImage}
                onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-background rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-secondary" /> Xem Trước Kết Quả Tìm Kiếm (Google)
            </h3>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left font-sans">
              <div className="text-[14px] text-gray-800 flex items-center gap-2 mb-1">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">ZT</span>
                <span>
                  <span className="block text-sm leading-tight">ZentraTech Academy</span>
                  <span className="block text-xs text-gray-500 leading-tight">https://zentratech.edu.vn</span>
                </span>
              </div>
              <h4 className="text-[20px] text-[#1a0dab] font-medium leading-tight mb-1 hover:underline cursor-pointer">
                {seoData.title || "Tiêu đề trang web"}
              </h4>
              <p className="text-[14px] text-[#4d5156] leading-snug">
                {seoData.description || "Mô tả ngắn gọn về trang web sẽ hiển thị ở đây..."}
              </p>
            </div>
          </div>

          {/* Preview Facebook */}
          <div className="bg-background rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-500" /> Xem Trước Chia Sẻ Facebook/Zalo
            </h3>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-left font-sans overflow-hidden">
              <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {/* Giả lập ảnh */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {seoData.title.split(' ')[0]} {seoData.title.split(' ')[1]}
                </div>
              </div>
              <div className="p-3 bg-gray-100/50 border-t border-gray-200">
                <p className="text-[12px] text-gray-500 uppercase tracking-wide">ZENTRATECH.EDU.VN</p>
                <h4 className="text-[16px] text-black font-semibold leading-tight my-1 truncate">
                  {seoData.title}
                </h4>
                <p className="text-[14px] text-gray-600 leading-snug line-clamp-1">
                  {seoData.description}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
