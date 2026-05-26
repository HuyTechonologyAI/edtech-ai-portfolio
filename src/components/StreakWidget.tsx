"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Flame } from "lucide-react";
import Link from "next/link";

export function StreakWidget() {
  const { user, loading } = useAuth();
  const [streakCount, setStreakCount] = useState<number>(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  const fetchStreak = useCallback(async () => {
    if (!user?.email) return;
    setFetching(true);
    try {
      const res = await fetch(`/api/rewards?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.balance) {
        setStreakCount(data.balance.streak_count || 0);

        // Kiểm tra xem hôm nay đã điểm danh chưa
        const lastCheckin = data.balance.last_checkin_date;
        const tzOffset = 7 * 60 * 60 * 1000;
        const todayStr = new Date(new Date().getTime() + tzOffset).toISOString().split("T")[0];
        setHasCheckedInToday(lastCheckin === todayStr);
      }
    } catch (err) {
      console.error("Lỗi khi tải streak count:", err);
    } finally {
      setFetching(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchStreak();

    // Lắng nghe sự kiện điểm danh thành công từ trang Rewards
    const handleCheckinCompleted = () => {
      fetchStreak();
    };

    window.addEventListener("checkin-completed", handleCheckinCompleted);
    return () => {
      window.removeEventListener("checkin-completed", handleCheckinCompleted);
    };
  }, [fetchStreak]);

  if (loading || !user) return null;

  return (
    <Link
      href="/rewards"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 select-none ${
        hasCheckedInToday
          ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-black hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] shadow-[0_0_10px_rgba(249,115,22,0.1)]"
          : "bg-surface border border-white/5 text-foreground/50 hover:text-orange-400 hover:border-orange-500/30"
      }`}
      title={
        hasCheckedInToday
          ? `Daily Streak: Chuỗi ${streakCount} ngày điểm danh! Bạn đã nhận thưởng hôm nay.`
          : `Bạn chưa điểm danh hôm nay! Bấm vào đây để nhận thưởng và giữ chuỗi.`
      }
    >
      <div className="relative flex items-center justify-center">
        {/* Đốm lửa xung quanh phát sáng nếu chưa điểm danh để nhắc nhở */}
        {!hasCheckedInToday && (
          <span className="absolute inline-flex h-3 w-3 rounded-full bg-orange-500/30 animate-ping" />
        )}
        <Flame
          className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
            hasCheckedInToday
              ? "text-orange-400 fill-orange-500/20 animate-pulse"
              : "text-foreground/30 fill-transparent"
          }`}
        />
      </div>
      <span className="font-mono leading-none font-bold">
        {streakCount} {streakCount >= 2 ? "days" : "day"}
      </span>
    </Link>
  );
}
