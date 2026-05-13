import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, activityType, targetItem, metadata } = body;

    if (!activityType || !targetItem) {
      return NextResponse.json({ error: "Missing required telemetry values" }, { status: 400 });
    }

    // Fire and forget insertion non-blocking
    const { error } = await supabase
      .from("user_activity_metrics")
      .insert([{
        user_email: userEmail || "anonymous@zentratech.io",
        activity_type: activityType,
        target_item: targetItem,
        metadata: metadata || {},
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Trả về status 200 kèm cờ lỗi để client không báo lỗi đỏ lòm khi chưa tạo bảng
    return NextResponse.json({ success: false, telemetryIgnored: true });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("user_activity_metrics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ metrics: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
