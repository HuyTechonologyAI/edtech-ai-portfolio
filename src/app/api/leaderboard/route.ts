import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 10), 50);
    const currentUserEmail = searchParams.get("email") || null;

    // Lấy top N học viên theo số điểm giảm dần
    const { data, error } = await supabaseAdmin
      .from("student_points_balance")
      .select("user_email, points, streak_count, last_checkin_date, last_updated")
      .order("points", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Gắn rank và badge cho từng học viên
    const ranked = (data || []).map((row, index) => {
      const rank = index + 1;
      const streak = row.streak_count || 0;

      // Tạo display name từ email (ẩn danh hóa: "nguyen.van.a@..." → "Nguyen V.A")
      const emailParts = row.user_email?.split("@")[0] || "learner";
      const nameParts = emailParts.split(/[._-]/);
      const displayName =
        nameParts.length >= 2
          ? `${capitalize(nameParts[0])} ${nameParts
              .slice(1)
              .map((p: string) => capitalize(p.slice(0, 1)) + ".")
              .join("")}`
          : capitalize(emailParts);

      // Avatar chữ cái
      const avatarLetter = displayName.charAt(0).toUpperCase();

      // Badge dựa trên streak
      const streakBadge =
        streak >= 30
          ? { label: "⚡ Huyền Thoại", color: "amber" }
          : streak >= 7
          ? { label: "🔥 Tuần Streak", color: "orange" }
          : streak >= 3
          ? { label: "✨ Bắt Đà", color: "green" }
          : null;

      // Huy hiệu thứ hạng
      const rankBadge =
        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

      const isCurrentUser =
        currentUserEmail && row.user_email === currentUserEmail;

      return {
        rank,
        displayName,
        avatarLetter,
        points: row.points || 0,
        streak_count: streak,
        streakBadge,
        rankBadge,
        isCurrentUser,
        // Không trả về email thật để bảo vệ privacy
      };
    });

    // Nếu có currentUserEmail và user không nằm trong top-N, tìm vị trí của họ
    let currentUserRank = null;
    if (currentUserEmail) {
      const inTop = ranked.find((r) => r.isCurrentUser);
      if (!inTop) {
        const { count } = await supabaseAdmin
          .from("student_points_balance")
          .select("*", { count: "exact", head: true })
          .gt(
            "points",
            (
              await supabaseAdmin
                .from("student_points_balance")
                .select("points")
                .eq("user_email", currentUserEmail)
                .maybeSingle()
            ).data?.points || 0
          );
        currentUserRank = (count || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: ranked,
      currentUserRank,
      total: ranked.length,
    });
  } catch (error: any) {
    // Fallback demo data khi DB chưa có dữ liệu
    const fallback = [
      { rank: 1, displayName: "Minh T.", avatarLetter: "M", points: 248, streak_count: 14, streakBadge: { label: "🔥 Tuần Streak", color: "orange" }, rankBadge: "🥇", isCurrentUser: false },
      { rank: 2, displayName: "Lan P.", avatarLetter: "L", points: 195, streak_count: 7, streakBadge: { label: "🔥 Tuần Streak", color: "orange" }, rankBadge: "🥈", isCurrentUser: false },
      { rank: 3, displayName: "Hùng N.", avatarLetter: "H", points: 152, streak_count: 5, streakBadge: { label: "✨ Bắt Đà", color: "green" }, rankBadge: "🥉", isCurrentUser: false },
      { rank: 4, displayName: "Thu H.", avatarLetter: "T", points: 130, streak_count: 3, streakBadge: { label: "✨ Bắt Đà", color: "green" }, rankBadge: null, isCurrentUser: false },
      { rank: 5, displayName: "Khoa D.", avatarLetter: "K", points: 98, streak_count: 1, streakBadge: null, rankBadge: null, isCurrentUser: false },
    ];
    return NextResponse.json({ success: true, leaderboard: fallback, currentUserRank: null, total: 5, isFallback: true });
  }
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
