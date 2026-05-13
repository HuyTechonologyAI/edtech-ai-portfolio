"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye, FileDown, Loader2, TrendingUp, Lock, Folder } from "lucide-react";
import { TiltCard } from "@/components/TiltCard";
import { FileViewerModal } from "@/components/FileViewerModal";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface ViewStats {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

interface FolderItem {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Filter taxonomy state properties
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const [viewerState, setViewerState] = useState<{isOpen: boolean; url: string; title: string; resourceId: number | undefined; isPremium?: boolean}>({
    isOpen: false,
    url: "",
    title: "",
    resourceId: undefined,
    isPremium: false
  });
  const [allViewStats, setAllViewStats] = useState<Record<number, ViewStats>>({});

  // Auto-emit SEARCH_QUERY telemetry metrics
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) return;
    const timeout = setTimeout(() => {
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.email || "anonymous@zentratech.io",
          activityType: "SEARCH_QUERY",
          targetItem: q,
          metadata: { route: "/resources" },
        }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

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

    const fetchPublicFolders = async () => {
      try {
        const res = await fetch("/api/admin/folders?type=RESOURCE");
        const data = await res.json();
        if (data.success) setFolders(data.folders || []);
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };

    fetchResources();
    fetchPublicFolders();
    fetchAllViewStats();
  }, []);

  const fetchAllViewStats = async () => {
    try {
      const res = await fetch("/api/resources/views");
      const data = await res.json();
      setAllViewStats(data.stats || {});
    } catch (error) {
      console.error("Failed to load view stats:", error);
    }
  };

  const openViewer = (url: string, title: string, resourceId: number, isPremium: boolean = false) => {
    setViewerState({ isOpen: true, url, title, resourceId, isPremium });
  };

  const closeViewer = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
    fetchAllViewStats();
  };

  const formatViewCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  // Filter computing logic
  const filteredResources = resources.filter(item => {
    // Search check
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type Category logic mapping
    let matchesCategory = true;
    if (selectedCategory === "PPT") {
      matchesCategory = item.type === "PPTX" || item.type === "PPT";
    } else if (selectedCategory === "PDF") {
      matchesCategory = item.type === "PDF";
    } else if (selectedCategory === "TEMPLATE") {
      const tStr = `${item.title || ''} ${item.description || ''} ${item.type || ''}`.toLowerCase();
      matchesCategory = item.type === "TEMPLATE" || tStr.includes("template") || tStr.includes("workflow");
    }

    // Folder selection mapping
    const matchesFolder = selectedFolderId === null || item.folderId === selectedFolderId || item.folder_id === selectedFolderId;

    return matchesSearch && matchesCategory && matchesFolder;
  });

  return (
    <main className="flex-1 py-12 animate-fade-in">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Thư Viện Tài Liệu
            </h1>
            <p className="text-foreground/70">
              Tổng hợp Ebook, Slide bài giảng và các biểu mẫu ứng dụng AI &amp; Automation.
            </p>
          </div>

          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-foreground/50" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </div>

        {/* Dynamic Folder Hierarchy Tree Strip */}
        {folders.length > 0 && (
          <div className="mb-6 bg-surface/30 border border-white/5 rounded-2xl p-4 animate-fade-in shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              <span>Duyệt theo Chủ đề Thư mục:</span>
              <span className="text-[10px] text-foreground/40 italic font-normal lowercase">(Click để định vị học liệu)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  selectedFolderId === null
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "bg-background/60 hover:bg-surface text-foreground/70"
                }`}
              >
                📁 Tất cả thư mục
              </button>

              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedFolderId === f.id
                      ? "bg-amber-500 text-black font-bold shadow-sm scale-105"
                      : "bg-background/60 hover:bg-surface text-foreground/80 border border-white/5"
                  }`}
                >
                  <span className="text-foreground/40">{f.parent_id ? "↳ " : ""}</span>
                  <span>📁 {f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FIXED: Dynamic Interactive Category Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "ALL" 
                ? "bg-secondary text-black font-bold shadow-[0_0_15px_rgba(0,255,133,0.2)]" 
                : "bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground font-medium"
            }`}
          >
            Tất cả định dạng
          </button>
          
          <button 
            onClick={() => setSelectedCategory("PPT")}
            className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "PPT" 
                ? "bg-secondary text-black font-bold shadow-[0_0_15px_rgba(0,255,133,0.2)]" 
                : "bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground font-medium"
            }`}
          >
            Slide Bài Giảng (PPT)
          </button>

          <button 
            onClick={() => setSelectedCategory("PDF")}
            className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "PDF" 
                ? "bg-secondary text-black font-bold shadow-[0_0_15px_rgba(0,255,133,0.2)]" 
                : "bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground font-medium"
            }`}
          >
            Ebook (PDF)
          </button>

          <button 
            onClick={() => setSelectedCategory("TEMPLATE")}
            className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "TEMPLATE" 
                ? "bg-secondary text-black font-bold shadow-[0_0_15px_rgba(0,255,133,0.2)]" 
                : "bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary text-foreground font-medium"
            }`}
          >
            Templates &amp; Workflows
          </button>
        </div>

        {/* Resources Grid View Layout */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl space-y-2">
            <p className="text-sm">Không tìm thấy tài liệu phù hợp với phân loại được chọn.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedCategory("ALL"); setSelectedFolderId(null); }}
              className="text-xs text-secondary font-bold hover:underline block mx-auto"
            >
              Xóa các bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredResources.map((item) => {
              const stats = allViewStats[item.id];
              const totalViews = stats?.total || 0;
              const todayViews = stats?.today || 0;

              const isUserPremium = user?.app_metadata?.is_premium === true || (user as any)?.user_metadata?.is_premium === true;
              const isUserAdmin = user?.app_metadata?.role === "admin" || (user as any)?.user_metadata?.role === "admin";
              const canDownloadPremium = isUserPremium || isUserAdmin;

              // Tìm mapping thư mục trực quan
              const targetFolder = folders.find(f => f.id === item.folderId || f.id === item.folder_id);

              return (
                <TiltCard key={item.id}>
                  <div className="glass-panel h-full rounded-2xl overflow-hidden flex flex-col group shadow-lg border border-white/5 hover:border-secondary/20 transition-all">
                    <div className={`h-48 flex items-center justify-center relative border-b border-white/5 ${item.type === 'PPTX' || item.type === 'PPT' ? 'bg-blue-500/5' : 'bg-secondary/5'}`}>
                      {item.type === 'PPTX' || item.type === 'PPT' ? (
                        <FileDown className="h-16 w-16 text-blue-500/40 group-hover:text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-all duration-500" />
                      ) : (
                        <FileText className="h-16 w-16 text-secondary/40 group-hover:text-secondary drop-shadow-[0_0_10px_rgba(0,255,133,0.2)] group-hover:scale-110 transition-all duration-500" />
                      )}
                      
                      <div className={`absolute top-4 right-4 bg-black/80 border text-xs font-bold px-3 py-1 rounded-full shadow-sm ${item.type === 'PPTX' || item.type === 'PPT' ? 'border-blue-500/30 text-blue-400' : 'border-secondary/30 text-secondary'}`}>
                        {item.type || 'FILE'}
                      </div>

                      {item.isPremium && (
                        <div className="absolute top-4 left-4 bg-orange-500/20 border border-orange-500/30 text-orange-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          PREMIUM
                        </div>
                      )}
                      
                      {/* View count & Folder tag mapping */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/10 text-foreground/80 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Eye className="w-3 h-3 text-secondary" />
                          <span>{formatViewCount(totalViews)}</span>
                        </div>

                        {todayViews > 0 && (
                          <div className="flex items-center gap-1 bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 text-cyan-400 text-xs font-medium px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            +{todayViews}
                          </div>
                        )}
                      </div>

                      {targetFolder && (
                        <div className="absolute bottom-4 right-4 max-w-[150px] truncate text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          📁 {targetFolder.name}
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold group-hover:text-secondary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-white/5 relative z-10">
                        <button 
                          onClick={() => openViewer(item.link, item.title, item.id, item.isPremium)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface/50 hover:bg-surface border border-white/10 hover:border-secondary/50 hover:text-secondary transition-all text-xs font-bold cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem trước</span>
                        </button>

                        {user ? (
                          item.isPremium && !canDownloadPremium ? (
                            <Link href="/checkout" className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-black transition-all text-[11px] font-bold">
                              <Lock className="h-3.5 w-3.5 shrink-0" />
                              <span>Nâng cấp</span>
                            </Link>
                          ) : (
                            <a href={item.link} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all text-xs font-bold hover-glow ${item.isPremium ? 'bg-orange-500 text-black hover:bg-orange-600' : 'bg-secondary text-black hover:bg-secondary/90'}`}>
                              <Download className="h-3.5 w-3.5" />
                              <span>Tải về</span>
                            </a>
                          )
                        ) : (
                          <Link href="/auth" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground/50 hover:border-secondary/30 hover:text-secondary transition-all text-xs font-bold">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Đăng nhập</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      <FileViewerModal 
        isOpen={viewerState.isOpen}
        onClose={closeViewer}
        fileUrl={viewerState.url}
        title={viewerState.title}
        resourceId={viewerState.resourceId}
        maxPreviewPages={5}
        isPremium={viewerState.isPremium}
      />
    </main>
  );
}
