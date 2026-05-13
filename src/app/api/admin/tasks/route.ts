import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper authentication verification
function isAuthenticatedAdminOrStaff(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "authenticated";
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ tasks: data || [] });
  } catch (error: any) {
    // Return sample active list if table is newly added / not run SQL yet
    const fallbackTasks = [
      { id: 1, title: "Đọc Ebook Tối ưu hóa Workflow chuyên sâu trong 10 phút", reward_points: 10, target_type: "READ_EBOOK", is_active: true, created_by: "admin@zentratech.io" },
      { id: 2, title: "Xem hết Video Hướng dẫn n8n & Telegram Bot", reward_points: 10, target_type: "WATCH_VIDEO", is_active: true, created_by: "staff@zentratech.io" },
      { id: 3, title: "Điểm danh truy cập hệ thống học tập hôm nay", reward_points: 2, target_type: "DAILY_CHECKIN", is_active: true, created_by: "admin@zentratech.io" }
    ];
    return NextResponse.json({ tasks: fallbackTasks, isFallback: true });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdminOrStaff(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, reward_points, target_type, target_id, created_by } = body;

    if (!title || !target_type) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert([{
        title,
        reward_points: Number(reward_points) || 10,
        target_type,
        target_id: target_id || null,
        is_active: true,
        created_by: created_by || "admin@zentratech.io"
      }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, task: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAuthenticatedAdminOrStaff(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing Task ID" }, { status: 400 });

    const { error } = await supabase
      .from("daily_tasks")
      .update(body)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdminOrStaff(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing Task ID" }, { status: 400 });

    const { error } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
