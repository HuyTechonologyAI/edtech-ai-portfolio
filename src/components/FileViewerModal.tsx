"use client";

import { X, ExternalLink, ChevronLeft, ChevronRight, Lock, Eye, Calendar, CalendarDays, CalendarRange, CalendarClock } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

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

export function FileViewerModal({ 
  isOpen, 
  onClose, 
  fileUrl, 
  title, 
  resourceId,
  maxPreviewPages = 5 
}: FileViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // Record view and fetch stats when modal opens
  useEffect(() => {
    if (isOpen && resourceId && !hasRecordedView) {
      // Record the view
      fetch("/api/resources/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      }).then(() => {
        setHasRecordedView(true);
        // Fetch updated stats after recording
        fetchViewStats();
      }).catch(console.error);
    }

    if (isOpen && resourceId) {
      fetchViewStats();
    }

    if (!isOpen) {
      setHasRecordedView(false);
      setCurrentPage(1);
    }
  }, [isOpen, resourceId]);

  const fetchViewStats = useCallback(async () => {
    if (!resourceId) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch(`/api/resources/views?resourceId=${resourceId}`);
      const data = await res.json();
      setViewStats(data.views || null);
    } catch (error) {
      console.error("Failed to fetch view stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [resourceId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPageLocked = currentPage > maxPreviewPages;

  // Google Docs viewer with page parameter simulation
  // For Google Drive files, we use the preview embed
  const getViewerUrl = () => {
    // Google Docs Viewer for general URLs
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  const viewerUrl = getViewerUrl();

  const formatNumber = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="font-bold text-lg truncate pr-2">{title}</h3>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <Eye className="w-3 h-3" />
              Xem trước {maxPreviewPages} trang
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-secondary/10 text-secondary rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Mở thẻ mới</span>
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Stats Bar */}
        {viewStats && (
          <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-background/50 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-foreground/40 font-medium shrink-0 uppercase tracking-wider mr-1">Lượt xem:</span>
            <div className="flex items-center gap-1.5 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <Calendar className="w-3 h-3" />
              Hôm nay: {formatNumber(viewStats.today)}
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarDays className="w-3 h-3" />
              Tuần: {formatNumber(viewStats.week)}
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarRange className="w-3 h-3" />
              Tháng: {formatNumber(viewStats.month)}
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium shrink-0">
              <CalendarClock className="w-3 h-3" />
              Năm: {formatNumber(viewStats.year)}
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full font-bold shrink-0">
              <Eye className="w-3 h-3" />
              Tổng: {formatNumber(viewStats.total)}
            </div>
          </div>
        )}

        {/* Content - Iframe with page limit overlay */}
        <div className="flex-1 w-full bg-background relative">
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-foreground/50">Đang tải tài liệu...</p>
            </div>
          </div>

          {/* Document Viewer */}
          <iframe 
            src={viewerUrl}
            className="w-full h-full border-none relative z-10"
            title={title}
          />

          {/* Page Limit Overlay — renders on top after scrolling past limit */}
          {/* This is a visual overlay that covers the bottom portion to limit perceived content */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" 
            style={{ 
              height: "40%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(13,13,13,0.7) 30%, rgba(13,13,13,0.95) 70%, rgba(13,13,13,1) 100%)"
            }}
          />

          {/* Locked Content Message */}
          <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center justify-end pb-8 px-4">
            <div className="glass-panel rounded-2xl p-6 max-w-md w-full text-center shadow-[0_0_40px_rgba(0,255,133,0.1)]">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                <Lock className="w-7 h-7 text-secondary" />
              </div>
              <h4 className="text-lg font-bold mb-2">Giới hạn xem trước</h4>
              <p className="text-sm text-foreground/60 mb-4">
                Bạn đang xem trước <span className="text-secondary font-bold">{maxPreviewPages} trang đầu tiên</span> của tài liệu. 
                Để xem toàn bộ nội dung, vui lòng tải tài liệu về.
              </p>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-black rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,133,0.3)] hover-glow"
              >
                <ExternalLink className="w-4 h-4" />
                Tải tài liệu đầy đủ
              </a>
            </div>
          </div>
        </div>

        {/* Footer - Page info */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface/80 backdrop-blur-md">
          <p className="text-xs text-foreground/40">
            Chế độ xem trước — Giới hạn {maxPreviewPages} trang đầu
          </p>
          {viewStats && (
            <p className="text-xs text-foreground/40 flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {formatNumber(viewStats.total)} lượt xem
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
