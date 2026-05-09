"use client";

import { useState } from "react";
import { Search, FileText, Download, Eye, FileDown } from "lucide-react";
import { TiltCard } from "@/components/TiltCard";
import { FileViewerModal } from "@/components/FileViewerModal";

export default function ResourcesPage() {
  const [viewerState, setViewerState] = useState<{isOpen: boolean; url: string; title: string}>({
    isOpen: false,
    url: "",
    title: ""
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Item 1 */}
          <TiltCard>
            <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col group shadow-lg">
              <div className="h-48 bg-secondary/5 flex items-center justify-center relative border-b border-white/5">
                <FileText className="h-16 w-16 text-secondary/40 group-hover:text-secondary drop-shadow-[0_0_10px_rgba(0,255,133,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(0,255,133,0.6)] group-hover:scale-110 transition-all duration-500" />
                <div className="absolute top-4 right-4 bg-black/80 border border-secondary/30 text-secondary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  PDF
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                  Cẩm nang ứng dụng ChatGPT cho Marketing
                </h3>
                <p className="text-sm text-foreground/70 mb-6 flex-1">
                  Hướng dẫn chi tiết 50+ prompt hiệu quả nhất để viết content, lập kế hoạch và tối ưu SEO.
                </p>
                <div className="flex items-center gap-3 mt-auto relative z-10">
                  <button 
                    onClick={() => openViewer("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "Tài liệu")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent border border-white/10 hover:border-secondary/50 hover:text-secondary transition-all text-sm font-bold"
                  >
                    <Eye className="h-4 w-4" />
                    Xem trước
                  </button>
                  <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" download className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-black hover:bg-secondary/90 transition-all text-sm font-bold hover-glow">
                    <Download className="h-4 w-4" />
                    Tải về
                  </a>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Item 2 */}
          <TiltCard>
            <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col group shadow-lg">
              <div className="h-48 bg-blue-500/5 flex items-center justify-center relative border-b border-white/5">
                <FileDown className="h-16 w-16 text-blue-500/40 group-hover:text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-all duration-500" />
                <div className="absolute top-4 right-4 bg-black/80 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  PPTX
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                  Slide Khóa học Business Automation Core
                </h3>
                <p className="text-sm text-foreground/70 mb-6 flex-1">
                  Tài liệu bài giảng quy trình xây dựng hệ thống tự động hóa Marketing & Sales.
                </p>
                <div className="flex items-center gap-3 mt-auto relative z-10">
                  <button 
                    onClick={() => openViewer("https://scholar.harvard.edu/files/tshoag/files/sample.pptx", "Slide Khóa học Business Automation Core")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent border border-white/10 hover:border-secondary/50 hover:text-secondary transition-all text-sm font-bold"
                  >
                    <Eye className="h-4 w-4" />
                    Xem trước
                  </button>
                  <a href="https://scholar.harvard.edu/files/tshoag/files/sample.pptx" download className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-black hover:bg-secondary/90 transition-all text-sm font-bold hover-glow">
                    <Download className="h-4 w-4" />
                    Tải về
                  </a>
                </div>
              </div>
            </div>
          </TiltCard>

           {/* Item 3 */}
           <TiltCard>
            <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col group shadow-lg">
              <div className="h-48 bg-secondary/5 flex items-center justify-center relative border-b border-white/5">
                <FileText className="h-16 w-16 text-secondary/40 group-hover:text-secondary drop-shadow-[0_0_10px_rgba(0,255,133,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(0,255,133,0.6)] group-hover:scale-110 transition-all duration-500" />
                <div className="absolute top-4 right-4 bg-black/80 border border-secondary/30 text-secondary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  PDF
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                  100+ AI Tools Stack 2024
                </h3>
                <p className="text-sm text-foreground/70 mb-6 flex-1">
                  Danh sách phân loại các công cụ AI tốt nhất cho từng phòng ban (HR, Sales, MKT, Dev).
                </p>
                <div className="flex items-center gap-3 mt-auto relative z-10">
                  <button 
                    onClick={() => openViewer("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "100+ AI Tools Stack 2024")}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-surface border border-border hover:bg-border/50 transition-colors text-sm font-medium hover-glow"
                  >
                    <Eye className="h-4 w-4" />
                    Xem trước
                  </button>
                  <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" download className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium hover-glow">
                    <Download className="h-4 w-4" />
                    Tải về
                  </a>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
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
