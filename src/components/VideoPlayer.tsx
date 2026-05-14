"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Play, Clock, RotateCcw, X } from "lucide-react";

// Use dynamic import to prevent server-side rendering issues with ReactPlayer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export function VideoPlayer({ url, playing = false, controls = true }: { url: string, playing?: boolean, controls?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null);

  // States theo dõi Resume Playback
  const [hasResumed, setHasResumed] = useState(false);
  const [savedTime, setSavedTime] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);

  const storageKey = typeof window !== "undefined" ? `video_resume_${encodeURIComponent(url)}` : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReady = () => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved && !hasResumed) {
      const sec = parseFloat(saved);
      // Chỉ tự động seek nếu người dùng đã xem quá 5 giây (tránh tua nhầm lúc vừa bắt đầu)
      if (sec > 5) {
        playerRef.current?.seekTo(sec, "seconds");
        setSavedTime(sec);
        setHasResumed(true);
        setShowToast(true);

        // Tự động ẩn thông báo sau 7 giây
        setTimeout(() => {
          setShowToast(false);
        }, 7000);
      }
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (!storageKey) return;
    // Liên tục lưu trữ mốc thời gian đang xem vào LocalStorage
    if (state.playedSeconds > 3) {
      localStorage.setItem(storageKey, state.playedSeconds.toString());
    }
  };

  const handleRestart = () => {
    playerRef.current?.seekTo(0);
    if (storageKey) {
      localStorage.setItem(storageKey, "0");
    }
    setShowToast(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface flex flex-col items-center justify-center animate-pulse min-h-[200px]">
        <Play className="h-12 w-12 text-primary/50 mb-4" />
        <div className="text-foreground/50 font-medium text-xs">Đang tải bộ phát video...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        controls={controls}
        light={true} // Bấm vào ảnh bìa mới load iframe giúp website tải cực nhanh
        onReady={handleReady}
        onProgress={handleProgress}
        config={{
          youtube: {
            playerVars: { origin: typeof window !== "undefined" ? window.location.origin : "" }
          }
        }}
      />

      {/* Thông Báo Trực Quan: Đã Tiếp Tục Xem Từ Mốc Dở Dang */}
      {showToast && (
        <div className="absolute top-3 left-3 right-3 z-50 pointer-events-auto animate-slide-down">
          <div className="bg-background/95 border border-secondary/40 p-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                <Clock className="w-4 h-4 text-secondary animate-pulse" />
              </div>
              <div className="text-left truncate">
                <div className="text-xs font-bold text-foreground">Tiếp tục bài phát liền mạch</div>
                <div className="text-[11px] text-foreground/70 truncate">
                  Tự động khôi phục từ mốc <strong className="text-secondary font-mono">{formatDuration(savedTime)}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-surface hover:bg-white/10 border border-white/5 text-foreground rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                title="Xem lại từ đầu"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Tua lại từ đầu</span>
              </button>
              <button
                onClick={() => setShowToast(false)}
                className="p-1.5 text-foreground/40 hover:text-foreground rounded-lg transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
