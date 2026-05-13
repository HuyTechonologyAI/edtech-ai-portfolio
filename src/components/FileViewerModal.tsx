"use client";

import { X, ExternalLink, Lock, Eye, Calendar, CalendarDays, CalendarRange, CalendarClock, Download, LogIn } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";

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
}

function extractDriveId(url: string): string | null {
  const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

export function FileViewerModal({
  isOpen, onClose, fileUrl, title, resourceId, maxPreviewPages = 5,
}: FileViewerModalProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

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
    }
    if (isOpen && resourceId) fetchViewStats();
    if (!isOpen) {
      setHasRecordedView(false);
    }
  }, [isOpen, resourceId]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[92vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
                          Đăng nhập tài khoản để xem toàn bộ tài liệu
                        </p>
                        <div className="flex flex-col gap-3">
                          <a href="/auth"
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,133,0.25)]">
                            <LogIn className="w-4 h-4" />
                            Đăng nhập để xem tiếp
                          </a>
                          {user ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border border-white/10 hover:border-secondary/50 text-foreground/70 hover:text-secondary rounded-xl font-bold text-sm transition-all">
                              <Download className="w-4 h-4" />
                              Tải tài liệu đầy đủ
                            </a>
                          ) : (
                            <p className="text-xs text-foreground/30">Đăng nhập để tải tài liệu</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-border bg-surface/90 shrink-0">
          <p className="text-xs text-foreground/40">
            {totalPages > 0
              ? `Xem trước ${Math.min(maxPreviewPages, totalPages)}/${totalPages} trang`
              : "Chế độ xem trước"}
          </p>
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
