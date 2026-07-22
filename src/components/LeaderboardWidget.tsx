"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Flame, Zap, Sparkles, RefreshCw, Crown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarLetter: string;
  points: number;
  streak_count: number;
  streakBadge: { label: string; color: string } | null;
  rankBadge: string | null;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  total: number;
  isFallback?: boolean;
}

export default function LeaderboardWidget() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const emailParam = user?.email
        ? `&email=${encodeURIComponent(user.email)}`
        : "";
      const res = await fetch(`/api/leaderboard?limit=10${emailParam}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch {
      // silently fail, fallback data comes from API
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getAvatarGradient = (rank: number) => {
    if (rank === 1) return "from-amber-400 to-yellow-600";
    if (rank === 2) return "from-slate-300 to-slate-500";
    if (rank === 3) return "from-orange-400 to-amber-700";
    return "from-secondary/60 to-secondary/30";
  };

  const getRowStyle = (entry: LeaderboardEntry) => {
    if (entry.isCurrentUser)
      return "border border-secondary/40 bg-secondary/5 shadow-[0_0_20px_rgba(0,255,133,0.08)]";
    if (entry.rank === 1)
      return "border border-amber-500/30 bg-amber-500/5";
    if (entry.rank <= 3)
      return "border border-white/8 bg-surface/60";
    return "border border-white/5 bg-surface/30";
  };

  const getStreakBadgeStyle = (color: string) => {
    if (color === "amber") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    if (color === "orange") return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    return "bg-secondary/10 text-secondary border-secondary/20";
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-surface/40 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold">
              Top học viên tuần này
            </p>
            {data.isFallback && (
              <p className="text-[10px] text-foreground/30">Dữ liệu demo</p>
            )}
          </div>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="p-2 rounded-xl text-foreground/40 hover:text-secondary hover:bg-secondary/10 transition-all"
          title="Làm mới"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 mb-6 px-1">
        {[data.leaderboard[1], data.leaderboard[0], data.leaderboard[2]].map(
          (entry, pIdx) => {
            if (!entry) return <div key={pIdx} />;
            const podiumRank = [2, 1, 3][pIdx];
            const heights = ["h-20", "h-28", "h-16"];
            const heightClass = heights[pIdx];
            return (
              <div key={entry.rank} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(
                    podiumRank
                  )} flex items-center justify-center text-black font-black text-sm shadow-lg`}
                >
                  {entry.avatarLetter}
                </div>
                <p className="text-[11px] font-semibold text-foreground/80 truncate max-w-[72px] text-center">
                  {entry.displayName}
                </p>
                <div
                  className={`w-full ${heightClass} rounded-t-xl flex flex-col items-center justify-end pb-2 gap-1 relative overflow-hidden
                    ${podiumRank === 1 ? "bg-gradient-to-t from-amber-500/20 to-amber-500/5 border border-amber-500/20" :
                      podiumRank === 2 ? "bg-gradient-to-t from-slate-500/20 to-slate-500/5 border border-slate-500/20" :
                      "bg-gradient-to-t from-orange-700/20 to-orange-700/5 border border-orange-700/20"}`}
                >
                  <span className="text-lg">{entry.rankBadge}</span>
                  <span className="text-[11px] font-black text-foreground/90">
                    {entry.points.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-[9px] text-foreground/40 uppercase tracking-wider">pts</span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Full Ranking List (rank 4+) */}
      <div className="space-y-2">
        {data.leaderboard.slice(3).map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${getRowStyle(entry)}`}
          >
            {/* Rank Number */}
            <div className="w-6 text-center">
              <span className="text-xs font-black text-foreground/40">
                #{entry.rank}
              </span>
            </div>

            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
                entry.rank
              )} flex items-center justify-center text-black font-black text-xs flex-shrink-0`}
            >
              {entry.avatarLetter}
            </div>

            {/* Name + Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-sm font-bold truncate ${
                    entry.isCurrentUser ? "text-secondary" : "text-foreground/90"
                  }`}
                >
                  {entry.displayName}
                  {entry.isCurrentUser && (
                    <span className="ml-1.5 text-[10px] font-normal text-secondary/70">
                      (bạn)
                    </span>
                  )}
                </span>
                {entry.streakBadge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getStreakBadgeStyle(
                      entry.streakBadge.color
                    )}`}
                  >
                    {entry.streakBadge.label}
                  </span>
                )}
              </div>
              {entry.streak_count > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />
                  <span className="text-[10px] text-foreground/40">
                    {entry.streak_count} ngày liên tiếp
                  </span>
                </div>
              )}
            </div>

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3 text-secondary" />
                <span className="text-sm font-black text-foreground/90">
                  {entry.points.toLocaleString("vi-VN")}
                </span>
              </div>
              <span className="text-[9px] text-foreground/30 uppercase tracking-wider">
                điểm
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Not In Top — hiển thị vị trí của họ */}
      {data.currentUserRank && !data.leaderboard.find((e) => e.isCurrentUser) && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-secondary/30 bg-secondary/5">
            <div className="w-6 text-center">
              <span className="text-xs font-black text-secondary">
                #{data.currentUserRank}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black text-xs">
              {user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-secondary">Bạn</span>
              <p className="text-[10px] text-foreground/40">
                Học thêm để leo bảng xếp hạng! 🚀
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-secondary/60" />
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.leaderboard.length === 0 && (
        <div className="text-center py-8 text-foreground/40">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Chưa có dữ liệu. Hãy là người đầu tiên!</p>
        </div>
      )}
    </div>
  );
}
