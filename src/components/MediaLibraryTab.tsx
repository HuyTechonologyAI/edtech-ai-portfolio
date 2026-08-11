"use client";

import { useState } from "react";
import { UploadCloud, Image as ImageIcon, FileText, FileVideo, Trash2, Search, Filter, Copy, Check, MoreVertical } from "lucide-react";

const MOCK_MEDIA = [
  { id: 1, name: "hero-banner-2026.jpg", type: "image", size: "1.2 MB", date: "11/08/2026", url: "https://zentratech.edu.vn/media/hero.jpg" },
  { id: 2, name: "n8n-workflow-template.json", type: "file", size: "45 KB", date: "10/08/2026", url: "https://zentratech.edu.vn/media/n8n.json" },
  { id: 3, name: "prompt-engineering-guide.pdf", type: "pdf", size: "4.5 MB", date: "09/08/2026", url: "https://zentratech.edu.vn/media/guide.pdf" },
  { id: 4, name: "avatar-default.png", type: "image", size: "150 KB", date: "01/08/2026", url: "https://zentratech.edu.vn/media/avatar.png" },
  { id: 5, name: "intro-video-compressed.mp4", type: "video", size: "24 MB", date: "25/07/2026", url: "https://zentratech.edu.vn/media/intro.mp4" },
  { id: 6, name: "make-com-ecommerce.json", type: "file", size: "32 KB", date: "20/07/2026", url: "https://zentratech.edu.vn/media/make.json" },
];

export default function MediaLibraryTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = MOCK_MEDIA.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Thư Viện Media (Media Library)</h2>
          <p className="text-foreground/50 text-sm mt-1">Quản lý toàn bộ tệp tĩnh, tài liệu và hình ảnh của hệ thống</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)]">
          <UploadCloud className="w-5 h-5" /> Tải Tệp Lên (Upload)
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-secondary/50 focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-all flex-1 md:flex-none">
            <Filter className="w-4 h-4" /> Lọc theo loại
          </button>
          <span className="text-xs text-foreground/40 font-mono hidden md:block">
            {filteredMedia.length} mục
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map(media => (
          <div key={media.id} className="bg-background rounded-xl border border-white/5 overflow-hidden group hover:border-secondary/30 transition-all shadow-lg">
            {/* Thumbnail Area */}
            <div className="h-32 bg-surface/50 flex items-center justify-center relative border-b border-white/5">
              {media.type === 'image' && <ImageIcon className="w-12 h-12 text-blue-400 opacity-50 group-hover:scale-110 transition-transform" />}
              {media.type === 'pdf' && <FileText className="w-12 h-12 text-red-400 opacity-50 group-hover:scale-110 transition-transform" />}
              {media.type === 'video' && <FileVideo className="w-12 h-12 text-purple-400 opacity-50 group-hover:scale-110 transition-transform" />}
              {media.type === 'file' && <FileText className="w-12 h-12 text-amber-400 opacity-50 group-hover:scale-110 transition-transform" />}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                <button 
                  onClick={() => handleCopy(media.id, media.url)}
                  className="p-2 bg-secondary text-black rounded-lg hover:scale-105 transition-transform"
                  title="Copy URL"
                >
                  {copiedId === media.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-transform" title="Xóa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info Area */}
            <div className="p-3">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-bold truncate flex-1" title={media.name}>
                  {media.name}
                </p>
                <button className="text-foreground/40 hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-foreground/50 font-mono">
                <span className="uppercase">{media.type} • {media.size}</span>
                <span>{media.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredMedia.length === 0 && (
        <div className="text-center py-20 text-foreground/40 border border-dashed border-white/10 rounded-xl">
          Không tìm thấy tệp nào phù hợp.
        </div>
      )}
    </div>
  );
}
