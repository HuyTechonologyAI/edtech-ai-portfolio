import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Kiểm tra quyền admin thông qua cookie phiên đăng nhập
 */
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ----------------------------------------------------------------------------
// GET /api/leads
// Trả về danh sách leads đã đăng ký (Dành riêng cho Admin CMS)
// ----------------------------------------------------------------------------
export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, leads: data || [] });
  } catch (error: any) {
    console.error("GET leads error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ----------------------------------------------------------------------------
// POST /api/leads
// Ghi nhận lead mới (Họ tên, SĐT, Email, Nguồn thu thập)
// ----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, phoneNumber, source, targetItemTitle, metadata = {} } = body;

    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc để đăng ký nhận tài liệu!" }, { status: 400 });
    }

    // Lấy IP client và User-Agent để lưu vết thiết bị làm dữ liệu phân tích sâu
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown_ip";
    const userAgent = req.headers.get("user-agent") || "unknown_ua";

    const enrichedMetadata = {
      ...metadata,
      clientIp,
      userAgent,
      loggedAt: new Date().toISOString()
    };

    // Ghi nhận lead vào Supabase (Sử dụng client admin bỏ qua RLS)
    const { data: newLead, error } = await supabaseAdmin
      .from("leads")
      .insert([{
        email: email.trim().toLowerCase(),
        full_name: fullName?.trim() || null,
        phone_number: phoneNumber?.trim() || null,
        source: source || "UNKNOWN",
        target_item_title: targetItemTitle || null,
        metadata: enrichedMetadata
      }])
      .select()
      .maybeSingle();

    if (error) throw error;

    // TODO tương lai: Có thể gửi Webhook bắn thông báo Telegram/Discord tại đây để Admin chăm sóc tức thì

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error("POST lead error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
