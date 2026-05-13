import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper to verify admin session
function isAuthenticatedAdmin(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "authenticated";
}

export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const actionType = searchParams.get("actionType");

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (actionType && actionType !== "all") {
      query = query.eq("action_type", actionType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error("GET /api/admin/audit-logs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, userEmail, userName, actionType, targetResource, details } = body;

    if (!userEmail || !actionType || !targetResource) {
      return NextResponse.json({ error: "Missing required audit fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .insert([{
        user_id: userId || null,
        user_email: userEmail,
        user_name: userName || null,
        action_type: actionType,
        target_resource: targetResource,
        details: details || {},
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, log: data?.[0] });
  } catch (error: any) {
    console.error("POST /api/admin/audit-logs error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
