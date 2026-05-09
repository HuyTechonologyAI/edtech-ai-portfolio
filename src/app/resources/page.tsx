"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye, FileDown, Loader2 } from "lucide-react";
import { TiltCard } from "@/components/TiltCard";
import { FileViewerModal } from "@/components/FileViewerModal";

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerState, setViewerState] = useState<{isOpen: boolean; url: string; title: string}>({
    isOpen: false,
    url: "",
    title: ""
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/resources");
        const data = await res.json();
        setResources(data.resources || []);
      } catch (error) {
        console.error("Failed to load resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const openViewer = (url: string, title: string) => {
    setViewerState({ isOpen: true, url, title });
  };

  const closeViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <main className="flex-1 py-12">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Thư Viện Tài Liệu
            </h1>
            <p className="text-foreground/70">
              Tổng hợp Ebook, Slide bài giảng và các biểu mẫu ứng dụng AI & Automation.
            </p>
          </div>

          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-foreground/50" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </div>

        {/* Categories Tabs - Placeholder */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button className="px-4 py-2 rounded-full bg-secondary text-black text-sm font-bold whitespace-nowrap shadow-[0_0_15px_rgba(0,255,133,0.2)]">
            Tất cả
          </button>
          <button className="px-4 py-2 rounded-full bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground text-sm font-medium whitespace-nowrap transition-all">
            Slide Bài Giảng (PPT)
          </button>
          <button className="px-4 py-2 rounded-full bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground text-sm font-medium whitespace-nowrap transition-all">
            Ebook (PDF)
          </button>
          <button className="px-4 py-2 rounded-full bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground text-sm font-medium whitespace-nowrap transition-all">
            Templates
          </button>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl">
            Chưa có tài liệu nào. Admin hãy đăng nhập để thêm tài liệu nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => (
              <TiltCard key={item.id}>
                <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col group shadow-lg">
                  <div className={`h-48 flex items-center justify-center relative border-b border-white/5 ${item.type === 'PPTX' ? 'bg-blue-500/5' : 'bg-secondary/5'}`}>
                    {item.type === 'PPTX' ? (
                      <FileDown className="h-16 w-16 text-blue-500/40 group-hover:text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-all duration-500" />
                    ) : (
                      <FileText className="h-16 w-16 text-secondary/40 group-hover:text-secondary drop-shadow-[0_0_10px_rgba(0,255,133,0.2)] group-hover:scale-110 transition-all duration-500" />
                    )}
                    <div className={`absolute top-4 right-4 bg-black/80 border text-xs font-bold px-3 py-1 rounded-full shadow-sm ${item.type === 'PPTX' ? 'border-blue-500/30 text-blue-400' : 'border-secondary/30 text-secondary'}`}>
                      {item.type || 'FILE'}
                    </div>
                    {item.isPremium && (
                      <div className="absolute top-4 left-4 bg-orange-500/20 border border-orange-500/30 text-orange-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        PREMIUM
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground/70 mb-6 flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 mt-auto relative z-10">
                      <button 
                        onClick={() => openViewer(item.link, item.title)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent border border-white/10 hover:border-secondary/50 hover:text-secondary transition-all text-sm font-bold"
                      >
                        <Eye className="h-4 w-4" />
                        Xem trước
                      </button>
                      <a href={item.link} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-bold hover-glow ${item.isPremium ? 'bg-orange-500 text-black hover:bg-orange-600' : 'bg-secondary text-black hover:bg-secondary/90'}`}>
                        <Download className="h-4 w-4" />
                        Tải về
                      </a>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>

      <FileViewerModal 
        isOpen={viewerState.isOpen}
        onClose={closeViewer}
        fileUrl={viewerState.url}
        title={viewerState.title}
      />
    </main>
  );
}
