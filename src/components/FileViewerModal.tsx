"use client";

import { X, ExternalLink, Lock, Eye, Calendar, CalendarDays, CalendarRange, CalendarClock, Download } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";

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

/**
 * Convert various Google Drive URL formats to an embeddable preview URL.
 * 
 * Supported inputs:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=...
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://docs.google.com/document/d/FILE_ID/...
 *   - https://docs.google.com/spreadsheets/d/FILE_ID/...
 *   - https://docs.google.com/presentation/d/FILE_ID/...
 *   - Any other URL → fallback to Google Docs Viewer
 */
function getEmbedUrl(url: string): string {
  if (!url) return "";

  // Google Drive file: /file/d/FILE_ID/...
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // Google Drive open: /open?id=FILE_ID
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch) {
    return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;
  }

  // Google Docs/Sheets/Slides: /d/FILE_ID/...
  const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch) {
    const type = docsMatch[1];
    const id = docsMatch[2];
    return `https://docs.google.com/${type}/d/${id}/preview`;
  }

  // Fallback: Google Docs Viewer for other URLs (e.g. direct PDF links)
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export function FileViewerModal({ 
  isOpen, 
  onClose, 
  fileUrl, 
  title, 
  resourceId,
  maxPreviewPages = 5 
}: FileViewerModalProps) {
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Record view and fetch stats when modal opens
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

    if (isOpen && resourceId) {
      fetchViewStats();
    }

    if (!isOpen) {
      setHasRecordedView(false);
      setIframeLoaded(false);
    }
  }, [isOpen, resourceId]);

  const fetchViewStats = useCallback(async () => {
    if (!resourceId) return;
    try {
      const res = await fetch(`/api/resources/views?resourceId=${resourceId}`);
      const data = await res.json();
      setViewStats(data.views || null);
    } catch (error) {
      console.error("Failed to fetch view stats:", error);
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

  const embedUrl = getEmbedUrl(fileUrl);

  const formatNumber = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl h-[92vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface/90 backdrop-blur-md shrink-0">
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
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2 border-b border-border bg-background/50 overflow-x-auto scrollbar-hide shrink-0">
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

        {/* Document Content Area */}
        <div className="flex-1 w-full bg-background relative min-h-0">
          {/* Loading spinner (shows behind iframe until loaded) */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-foreground/50 text-sm">Đang tải tài liệu từ Google Drive...</p>
              </div>
            </div>
          )}

          {/* Document Viewer Iframe */}
          <iframe 
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full border-none relative z-10"
            title={title}
            allow="autoplay"
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />

          {/* Gradient fade overlay at the bottom — only covers bottom 25% */}
          <div 
            className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none" 
            style={{ 
              height: "28%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(13,13,13,0.5) 35%, rgba(13,13,13,0.85) 65%, rgba(13,13,13,0.98) 100%)"
            }}
          />

          {/* Lock Card — shows at the very bottom */}
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center px-4">
            <div className="glass-panel rounded-2xl px-6 py-5 max-w-lg w-full text-center shadow-[0_0_40px_rgba(0,255,133,0.08)] border border-white/10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold">Giới hạn xem trước {maxPreviewPages} trang</h4>
                  <p className="text-xs text-foreground/50">Tải tài liệu để xem toàn bộ nội dung</p>
                </div>
              </div>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,133,0.25)]"
              >
                <Download className="w-4 h-4" />
                Tải tài liệu đầy đủ
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-border bg-surface/90 backdrop-blur-md shrink-0">
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
