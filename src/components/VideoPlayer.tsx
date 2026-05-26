"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Play, Clock, RotateCcw, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

// Use dynamic import for general media fallbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

// Hàm trích xuất ID YouTube chuẩn xác từ mọi chuỗi URL
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = clean.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Hàm trích xuất tham số thời gian t= (nếu có)
function getStartTime(url: string): number {
  if (!url) return 0;
  const tMatch = url.match(/[?&]t=(\d+)s?/);
  return tMatch ? parseInt(tMatch[1], 10) : 0;
}

export function VideoPlayer({ url, playing = false, controls = true }: { url: string; playing?: boolean; controls?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // States hỗ trợ cơ chế Anti-bypass
  const [duration, setDuration] = useState(0);
  const [lastLoggedProgress, setLastLoggedProgress] = useState(0);
  const [completedToastShown, setCompletedToastShown] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  const cleanUrl = (url || "").trim();
  const ytId = getYouTubeId(cleanUrl);
  const urlStartTime = getStartTime(cleanUrl);

  const storageKey = typeof window !== "undefined" ? `video_resume_${encodeURIComponent(cleanUrl)}` : "";

  const { user } = useAuth();
  const isUserPremium = user?.app_metadata?.is_premium === true || (user as any)?.user_metadata?.is_premium === true;
  const isUserAdmin = user?.app_metadata?.role === "admin" || (user as any)?.user_metadata?.role === "admin";
  const hasUnlimitedAccess = isUserPremium || isUserAdmin;

  const [unlockedQuota, setUnlockedQuota] = useState(hasUnlimitedAccess);

  useEffect(() => {
    if (hasUnlimitedAccess) {
      setUnlockedQuota(true);
    }
  }, [hasUnlimitedAccess]);

  const handleAttemptPlay = async () => {
    if (hasUnlimitedAccess) {
      setUnlockedQuota(true);
      return;
    }

    if (!ytId) {
      setUnlockedQuota(true);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const storageKeyTrk = "zentratech_freemium_usage_tracker";
    let tracker: { 
      date: string; 
      readDocs: string[]; 
      downloadedDocs: string[]; 
      watchedVideos: string[];
      guestIpVideos?: Record<string, string[]>;
    } = {
      date: todayStr,
      readDocs: [],
      downloadedDocs: [],
      watchedVideos: [],
      guestIpVideos: {}
    };

    try {
      const saved = localStorage.getItem(storageKeyTrk);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) {
          tracker = { ...tracker, ...parsed };
          if (!tracker.guestIpVideos) tracker.guestIpVideos = {};
        }
      }
    } catch { /* ignore */ }

    // Luồng xử lý cho tài khoản đã đăng nhập (Freemember)
    if (user) {
      if (tracker.watchedVideos.includes(ytId)) {
        setUnlockedQuota(true);
        return;
      }

      if (tracker.watchedVideos.length >= 2) {
        alert("🔒 QUYỀN LỢI TÀI KHOẢN MIỄN PHÍ: Bạn đã đạt giới hạn xem online 2 video bài giảng/ngày. Hãy nâng cấp tài khoản Premium để mở khóa không giới hạn toàn bộ video chuyên sâu và các Case Study thực chiến!");
        return;
      }

      tracker.watchedVideos.push(ytId);
      try {
        localStorage.setItem(storageKeyTrk, JSON.stringify(tracker));
      } catch { /* ignore */ }

      setUnlockedQuota(true);
      return;
    }

    // Luồng kiểm soát độc lập cho Khách vãng lai (Chưa đăng nhập / !user)
    let clientIp = "unknown_guest_ip";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      if (ipData && ipData.ip) {
        clientIp = ipData.ip;
      }
    } catch {
      clientIp = "local_guest_fallback_ip";
    }

    const ipWatchedList = tracker.guestIpVideos![clientIp] || [];

    if (ipWatchedList.includes(ytId)) {
      setUnlockedQuota(true);
      return;
    }

    if (ipWatchedList.length >= 1) {
      alert(`🔒 TRẠNG THÁI KHÁCH VÃNG LAI (IP: ${clientIp}): Bạn đã đạt giới hạn xem thử 1 video/ngày. Vui lòng đăng nhập hoặc tạo tài khoản miễn phí để nhận thêm lượt xem bài giảng mỗi ngày!`);
      return;
    }

    ipWatchedList.push(ytId);
    tracker.guestIpVideos![clientIp] = ipWatchedList;

    try {
      localStorage.setItem(storageKeyTrk, JSON.stringify(tracker));
    } catch { /* ignore */ }

    setUnlockedQuota(true);
  };

  useEffect(() => {
    setMounted(true);
    if (!storageKey) return;

    // Kiểm tra bộ nhớ đệm để đề xuất tiếp tục phát
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const sec = parseFloat(saved);
      if (sec > 5) {
        setSavedTime(sec);
        setShowToast(true);
        setHasResumed(true);

        const timer = setTimeout(() => {
          setShowToast(false);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [storageKey]);

  // Bộ lắng nghe tiến trình xem video (Anti-bypass & Auto resume)
  const handleProgress = (state: { playedSeconds: number; played: number }) => {
    const currentSeconds = Math.floor(state.playedSeconds);
    if (currentSeconds <= 0 || duration <= 0) return;

    // 1. Lưu thời gian phát hiện tại vào localStorage
    if (storageKey && currentSeconds % 3 === 0) {
      localStorage.setItem(storageKey, currentSeconds.toString());
    }

    // 2. Gửi API ghi nhận định kỳ mỗi 15 giây xem thực tế
    const elapsedSinceLastLog = currentSeconds - lastLoggedProgress;
    if (elapsedSinceLastLog >= 15 && user?.email) {
      setLastLoggedProgress(currentSeconds);

      fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "VIDEO",
          userEmail: user.email,
          videoId: ytId || cleanUrl,
          duration: duration,
          watchedSeconds: elapsedSinceLastLog
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.isCompleted && !completedToastShown) {
          setCompletedToastShown(true);
          setShowSuccessBadge(true);
          setTimeout(() => setShowSuccessBadge(false), 6000);
        }
      })
      .catch(err => console.error("Error logging video progress:", err));
    }

    // 3. Gửi log cuối cùng nếu xem đạt trên 90%
    if (state.played >= 0.9 && !completedToastShown && user?.email) {
      const finalElapsed = currentSeconds - lastLoggedProgress;
      if (finalElapsed > 0) {
        setCompletedToastShown(true); // set trước để tránh lặp gọi API song song
        fetch("/api/learning/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "VIDEO",
            userEmail: user.email,
            videoId: ytId || cleanUrl,
            duration: duration,
            watchedSeconds: finalElapsed
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShowSuccessBadge(true);
            setTimeout(() => setShowSuccessBadge(false), 6000);
          } else {
            setCompletedToastShown(false); // rollback nếu lỗi
          }
        })
        .catch(() => setCompletedToastShown(false));
      }
    }
  };

  const handleRestart = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "0");
    }
    setShowToast(false);
    setHasResumed(false);
    setSavedTime(0);
    setIframeKey((prev) => prev + 1); // Reset trình phát
    setLastLoggedProgress(0);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface flex flex-col items-center justify-center animate-pulse min-h-[200px] rounded-xl border border-white/5">
        <Play className="h-10 w-10 text-secondary/40 mb-3" />
        <div className="text-foreground/40 font-medium text-xs">Đang nạp trình phát video...</div>
      </div>
    );
  }

  const targetStartSeconds = hasResumed && savedTime > 5 ? Math.floor(savedTime) : urlStartTime;

  return (
    <div className="w-full h-full relative group rounded-xl overflow-hidden bg-black">
      {!unlockedQuota ? (
        <div 
          onClick={handleAttemptPlay}
          className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center z-10 overflow-hidden bg-surface"
        >
          {ytId && (
            <img 
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt="Video Thumbnail Preview"
              className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            />
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] group-hover:bg-black/20 transition-all" />
          
          <div className="absolute w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:bg-red-500 group-hover:scale-110 transition-all">
             <Play className="w-6 h-6 text-white fill-white" />
          </div>

          <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400">
            🔒 Nhấp để xem video ({!user ? "Khách: 1 video/ngày" : "Miễn phí: 2 video/ngày"})
          </div>
        </div>
      ) : (
        /* ReactPlayer xử lý đa năng cho cả YouTube và tệp MP4, giúp theo dõi logs JS chuẩn chỉnh */
        <ReactPlayer
          key={iframeKey}
          url={cleanUrl}
          width="100%"
          height="100%"
          playing={true}
          controls={controls}
          className="absolute inset-0"
          config={{
            youtube: {
              playerVars: { start: targetStartSeconds, autoplay: 1, rel: 0, modestbranding: 1 }
            }
          }}
          onProgress={handleProgress}
          onDuration={(d: number) => setDuration(d)}
        />
      )}

      {/* Giao diện Success Toast nhỏ chúc mừng ở góc trình phát */}
      {showSuccessBadge && (
        <div className="absolute bottom-3 right-3 z-50 pointer-events-none animate-slide-up">
          <div className="bg-emerald-500/95 text-black border border-emerald-400 px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
            <span className="animate-bounce">🏆</span>
            <span>Đã xem &gt;90%! Đủ điều kiện nhận Points!</span>
          </div>
        </div>
      )}

      {/* Giao diện Overlay thông báo Ghi nhớ Mốc thời gian */}
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
