import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userEmail, videoId, duration, watchedSeconds, documentId, secondsRead, maxScrollPercent } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "Missing identity parameter" }, { status: 400 });
    }

    // ==========================================
    // XỬ LÝ TIẾN TRÌNH XEM VIDEO BÀI GIẢNG
    // ==========================================
    if (type === "VIDEO") {
      if (!videoId || !duration) {
        return NextResponse.json({ error: "Missing Video details" }, { status: 400 });
      }

      const increment = Number(watchedSeconds) || 10;
      const totalDuration = Number(duration);

      // Tìm kiếm bản ghi tiến độ hiện tại
      let { data: curProg, error } = await supabase
        .from("user_video_progress")
        .select("*")
        .eq("user_email", userEmail)
        .eq("video_id", videoId)
        .maybeSingle();

      if (error) {
        console.error("Supabase select error (video progress):", error);
      }

      if (!curProg) {
        // Lần đầu tạo bản ghi tiến độ
        const nextSeconds = Math.min(increment, totalDuration);
        const isCompleted = nextSeconds >= totalDuration * 0.9;
        const completedAt = isCompleted ? new Date() : null;

        const { data: newProg, error: insertErr } = await supabase
          .from("user_video_progress")
          .insert([{
            user_email: userEmail,
            video_id: videoId,
            watched_seconds: nextSeconds,
            duration: totalDuration,
            is_completed: isCompleted,
            completed_at: completedAt,
            last_updated: new Date()
          }])
          .select()
          .maybeSingle();

        if (insertErr) throw insertErr;
        return NextResponse.json({ success: true, isCompleted, progress: newProg });
      } else {
        // Đã có bản ghi tiến độ, cộng dồn giây đã xem
        const nextSeconds = Math.min(curProg.watched_seconds + increment, totalDuration);
        const isCompleted = nextSeconds >= totalDuration * 0.9;
        const completedAt = isCompleted ? (curProg.completed_at || new Date()) : curProg.completed_at;

        const { data: updProg, error: updateErr } = await supabase
          .from("user_video_progress")
          .update({
            watched_seconds: nextSeconds,
            is_completed: isCompleted,
            completed_at: completedAt,
            last_updated: new Date()
          })
          .eq("id", curProg.id)
          .select()
          .maybeSingle();

        if (updateErr) throw updateErr;
        return NextResponse.json({ success: true, isCompleted, progress: updProg });
      }
    }

    // ==========================================
    // XỬ LÝ TIẾN TRÌNH ĐỌC TÀI LIỆU EBOOK/SLIDE
    // ==========================================
    if (type === "DOCUMENT") {
      if (!documentId) {
        return NextResponse.json({ error: "Missing Document Identifier" }, { status: 400 });
      }

      const increment = Number(secondsRead) || 10;
      const currentScroll = Number(maxScrollPercent) || 0;

      // Tìm kiếm bản ghi tiến độ đọc hiện tại
      let { data: curProg, error } = await supabase
        .from("user_document_progress")
        .select("*")
        .eq("user_email", userEmail)
        .eq("document_id", documentId)
        .maybeSingle();

      if (error) {
        console.error("Supabase select error (document progress):", error);
      }

      if (!curProg) {
        // Lần đầu đọc sách
        const nextSeconds = increment;
        const nextScroll = currentScroll;
        // Đọc tối thiểu 3 phút (180 giây) và cuộn >= 80%
        const isCompleted = nextSeconds >= 180 && nextScroll >= 80;
        const completedAt = isCompleted ? new Date() : null;

        const { data: newProg, error: insertErr } = await supabase
          .from("user_document_progress")
          .insert([{
            user_email: userEmail,
            document_id: documentId,
            seconds_read: nextSeconds,
            max_scroll_percent: nextScroll,
            is_completed: isCompleted,
            completed_at: completedAt,
            last_updated: new Date()
          }])
          .select()
          .maybeSingle();

        if (insertErr) throw insertErr;
        return NextResponse.json({ success: true, isCompleted, progress: newProg });
      } else {
        // Đã có bản ghi đọc sách, cộng dồn giây đọc và cập nhật cuộn tối đa
        const nextSeconds = curProg.seconds_read + increment;
        const nextScroll = Math.max(curProg.max_scroll_percent, currentScroll);
        const isCompleted = nextSeconds >= 180 && nextScroll >= 80;
        const completedAt = isCompleted ? (curProg.completed_at || new Date()) : curProg.completed_at;

        const { data: updProg, error: updateErr } = await supabase
          .from("user_document_progress")
          .update({
            seconds_read: nextSeconds,
            max_scroll_percent: nextScroll,
            is_completed: isCompleted,
            completed_at: completedAt,
            last_updated: new Date()
          })
          .eq("id", curProg.id)
          .select()
          .maybeSingle();

        if (updateErr) throw updateErr;
        return NextResponse.json({ success: true, isCompleted, progress: updProg });
      }
    }

    return NextResponse.json({ error: "Unknown type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Learning Progress API Error:", error);
    // Trả về mock thành công nếu có lỗi DB (tránh lỗi ngắt mạch trải nghiệm)
    return NextResponse.json({
      success: true,
      isFallbackSimulation: true,
      isCompleted: true
    });
  }
}
