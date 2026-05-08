"use client";

import { X, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export function FileViewerModal({ isOpen, onClose, fileUrl, title }: FileViewerModalProps) {
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

  // Use Google Docs Viewer for PDFs/PPTs. Note: fileUrl must be publicly accessible on the internet.
  // We use a sample public PDF for demo purposes.
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <h3 className="font-bold text-lg truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
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

        {/* Content - Iframe */}
        <div className="flex-1 w-full bg-background relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-foreground/50">Đang tải tài liệu từ Google Drive...</p>
            </div>
          </div>
          <iframe 
            src={viewerUrl}
            className="w-full h-full border-none relative z-10"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
