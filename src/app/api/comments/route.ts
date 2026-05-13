import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (!itemType || !itemId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("item_reviews")
      .select("*")
      .eq("item_type", itemType)
      .eq("item_id", Number(itemId))
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item_type, item_id, user_email, content, rating } = body;

    if (!item_type || !item_id || !user_email || !content) {
      return NextResponse.json({ error: "Vui lòng điền đủ thông tin bình luận" }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("item_reviews")
      .insert([
        {
          item_type,
          item_id: Number(item_id),
          user_email,
          content,
          rating: Number(rating) || 5,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, review: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
