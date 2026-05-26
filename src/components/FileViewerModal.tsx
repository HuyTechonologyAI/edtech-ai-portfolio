"use client";

import { X, ExternalLink, Lock, Eye, Calendar, CalendarDays, CalendarRange, CalendarClock, Download, LogIn } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { CommentSection } from "./CommentSection";

interface ViewStats {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
  resourceId?: number;
  maxPreviewPages?: number;
  isPremium?: boolean;
}

function extractDriveId(url: string): string | null {
  const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

export function FileViewerModal({
  isOpen, onClose, fileUrl, title, resourceId, maxPreviewPages = 5, isPremium = false,
}: FileViewerModalProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // States và Refs hỗ trợ cơ chế Anti-bypass đọc Ebook
  const [secondsRead, setSecondsRead] = useState(0);
  const [maxScrollPercent, setMaxScrollPercent] = useState(0);
  const [docCompletedToastShown, setDocCompletedToastShown] = useState(false);
  const [showDocSuccessBadge, setShowDocSuccessBadge] = useState(false);
  const maxScrollRef = useRef(0);

  // Reset tracking states khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setSecondsRead(0);
      setMaxScrollPercent(0);
      maxScrollRef.current = 0;
      setDocCompletedToastShown(false);
      setShowDocSuccessBadge(false);
    }
  }, [isOpen]);

  // Bộ lắng nghe sự kiện cuộn trang Ebook để tính độ sâu cuộn tối đa
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      if (scrollHeight <= clientHeight) return;

      const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      maxScrollRef.current = Math.max(maxScrollRef.current, pct);
      setMaxScrollPercent(maxScrollRef.current);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen, pageImages]);

  // Bộ đếm thời gian và định kỳ gửi logs tiến độ đọc tài liệu lên API mỗi 15 giây
  useEffect(() => {
    if (!isOpen || !resourceId || !user?.email) return;

    const interval = setInterval(() => {
      setSecondsRead((prev) => {
        const nextSeconds = prev + 15;

        fetch("/api/learning/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "DOCUMENT",
            userEmail: user.email,
            documentId: resourceId,
            secondsRead: 15,
            maxScrollPercent: maxScrollRef.current
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.isCompleted && !docCompletedToastShown) {
            setDocCompletedToastShown(true);
            setShowDocSuccessBadge(true);
            setTimeout(() => setShowDocSuccessBadge(false), 6000);
          }
        })
        .catch(err => console.error("Error logging document progress:", err));

        return nextSeconds;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isOpen, resourceId, user?.email, docCompletedToastShown]);

  // Load PDF and render pages
  useEffect(() => {
    if (!isOpen || !fileUrl) return;
    let cancelled = false;

    const loadPdf = async () => {
      setLoadingPdf(true);
      setPdfError(null);
      setPageImages([]);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        // Fetch PDF through our proxy to avoid CORS
        const proxyUrl = `/api/resources/proxy?url=${encodeURIComponent(fileUrl)}`;
        const pdf = await pdfjsLib.getDocument(proxyUrl).promise;

        if (cancelled) return;
        setTotalPages(pdf.numPages);

        const pagesToRender = Math.min(maxPreviewPages, pdf.numPages);
        const images: string[] = [];

        for (let i = 1; i <= pagesToRender; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;

          await page.render({ canvasContext: ctx, viewport } as any).promise;
          images.push(canvas.toDataURL("image/jpeg", 0.85));
        }

        if (!cancelled) setPageImages(images);
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setPdfError(err.message || "Không thể tải tài liệu");
        }
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [isOpen, fileUrl, maxPreviewPages]);

  // Record view
  useEffect(() => {
    if (isOpen && resourceId && !hasRecordedView) {
      fetch("/api/resources/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      }).then(() => {
        setHasRecordedView(true);
        fetchViewStats();
      }).catch(console.error);

      // Global AI Telemetry Metrics stream trigger hook
      fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.email || "anonymous@zentratech.io",
          activityType: "VIEW_RESOURCE",
          targetItem: title,
          metadata: { resourceId, isPremium },
        }),
      }).catch(() => {});
    }
    if (isOpen && resourceId) fetchViewStats();
    if (!isOpen) {
      setHasRecordedView(false);
    }
  }, [isOpen, resourceId, title, isPremium, user]);

  const fetchViewStats = useCallback(async () => {
    if (!resourceId) return;
    try {
      const res = await fetch(`/api/resources/views?resourceId=${resourceId}`);
      const data = await res.json();
      setViewStats(data.views || null);
    } catch (e) { console.error(e); }
  }, [resourceId]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n));
  const hasMorePages = totalPages > maxPreviewPages;
  const lockedPages = totalPages - maxPreviewPages;

  const isUserPremium = user?.app_metadata?.is_premium === true || (user as any)?.user_metadata?.is_premium === true;
  const isUserAdmin = user?.app_metadata?.role === "admin" || (user as any)?.user_metadata?.role === "admin";
  const canDownloadPremium = isUserPremium || isUserAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[92vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Success toast overlay inside modal */}
        {showDocSuccessBadge && (
          <div className="absolute top-16 right-4 z-50 pointer-events-none animate-slide-down">
            <div className="bg-emerald-500/95 text-black border border-emerald-400 px-4 py-2 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5">
              <span>🏆</span>
              <span>Đọc sách hoàn thành! Đủ điều kiện nhận Points!</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-bold text-lg truncate">{title}</h3>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <Eye className="w-3 h-3" />
              Xem trước {maxPreviewPages} trang
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Stats Bar */}
        {viewStats && (
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2 border-b border-border bg-background/50 overflow-x-auto scrollbar-hide shrink-0">
            <span className="text-xs text-foreground/40 font-medium shrink-0 uppercase tracking-wider mr-1">Lượt xem:</span>
            <span className="flex items-center gap-1.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <Calendar className="w-3 h-3" />Hôm nay: {fmt(viewStats.today)}
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarDays className="w-3 h-3" />Tuần: {fmt(viewStats.week)}
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarRange className="w-3 h-3" />Tháng: {fmt(viewStats.month)}
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarClock className="w-3 h-3" />Năm: {fmt(viewStats.year)}
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full font-bold shrink-0">
              <Eye className="w-3 h-3" />Tổng: {fmt(viewStats.total)}
            </span>
          </div>
        )}

        {/* Pages Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background min-h-0">
          {/* Loading State */}
          {loadingPdf && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-foreground/60 text-sm font-medium">Đang tải tài liệu...</p>
              <p className="text-foreground/30 text-xs mt-1">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {/* Error State */}
          {pdfError && !loadingPdf && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-foreground/70 font-bold mb-2">Không thể tải xem trước</p>
              <p className="text-foreground/40 text-sm text-center max-w-md mb-4">{pdfError}</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-black rounded-xl font-bold text-sm hover:scale-105 transition-all">
                <ExternalLink className="w-4 h-4" />Mở tài liệu gốc
              </a>
            </div>
          )}

          {/* Rendered Pages */}
          {!loadingPdf && !pdfError && pageImages.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-6 px-4">
              {pageImages.map((src, idx) => (
                <div key={idx} className="relative w-full max-w-3xl">
                  {/* Page number badge */}
                  <div className="absolute top-3 left-3 z-10 bg-black/70 text-foreground/70 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                    Trang {idx + 1} / {totalPages}
                  </div>
                  {/* Page image */}
                  <img
                    src={src}
                    alt={`Trang ${idx + 1}`}
                    className="w-full rounded-lg border border-white/10 shadow-xl"
                    draggable={false}
                  />
                </div>
              ))}

              {/* Lock Card — After last preview page */}
              {hasMorePages && (
                <div className="w-full max-w-3xl">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10">
                    {/* Blurred fake page background */}
                    <div className="h-80 bg-gradient-to-b from-surface/80 to-background flex items-center justify-center relative">
                      {/* Fake blurred content lines */}
                      <div className="absolute inset-0 p-10 opacity-20 blur-sm">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-3 bg-foreground/30 rounded mb-3" style={{ width: `${60 + Math.random() * 35}%` }} />
                        ))}
                      </div>

                      {/* Lock overlay */}
                      <div className="relative z-10 glass-panel rounded-2xl p-8 max-w-sm w-full text-center border border-white/10 shadow-[0_0_40px_rgba(0,255,133,0.08)]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-secondary" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Nội dung bị khóa</h4>
                        <p className="text-sm text-foreground/50 mb-1">
                          Còn <span className="text-secondary font-bold">{lockedPages} trang</span> chưa được hiển thị
                        </p>
                        <p className="text-xs text-foreground/40 mb-5">
                          {!user 
                            ? "Đăng nhập tài khoản để xem toàn bộ tài liệu" 
                            : isPremium && !canDownloadPremium 
                            ? "Tài liệu thuộc gói Premium chưa được mở khóa" 
                            : "Tài liệu đã sẵn sàng để tải về"}
                        </p>
                        <div className="flex flex-col gap-3">
                          {!user ? (
                            <>
                              <a href="/auth"
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,133,0.25)]">
                                <LogIn className="w-4 h-4" />
                                Đăng nhập để xem tiếp
                              </a>
                              <p className="text-xs text-foreground/30">Đăng nhập để tải tài liệu</p>
                            </>
                          ) : isPremium && !canDownloadPremium ? (
                            <>
                              <a href="/checkout"
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                                <Lock className="w-4 h-4" />
                                Nâng cấp Premium để tải
                              </a>
                              <p className="text-xs text-orange-400/80">Tài liệu Premium dành riêng cho hội viên</p>
                            </>
                          ) : (
                            <button 
                              onClick={() => {
                                if (resourceId) {
                                  window.open(`/api/resources/get-signed-url?id=${resourceId}`, "_blank");
                                } else {
                                  window.open(fileUrl, "_blank");
                                }
                              }}
                              className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-black hover:bg-secondary/90 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,255,133,0.25)] cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              Tải tài liệu đầy đủ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-4 pb-8 max-w-3xl mx-auto w-full">
            <CommentSection itemType="resources" itemId={resourceId || 0} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-border bg-surface/90 shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-xs text-foreground/40">
              {totalPages > 0
                ? `Xem trước ${Math.min(maxPreviewPages, totalPages)}/${totalPages} trang`
                : "Chế độ xem trước"}
            </p>
            {user?.email && (
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                ⏱️ {Math.floor(secondsRead / 60)}m {secondsRead % 60}s | 📜 {maxScrollPercent}% cuộn
              </span>
            )}
          </div>
          {viewStats && (
            <p className="text-xs text-foreground/40 flex items-center gap-1.5">
              <Eye className="w-3 h-3" />{fmt(viewStats.total)} lượt xem
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
