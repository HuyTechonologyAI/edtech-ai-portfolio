import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminAuth } from "@/lib/admin-auth";

// Ánh xạ chính xác tuyệt đối các cột Database đã được xác thực qua Schema Cache
// Bảng "resources": title, description, link, type, is_premium (gạch dưới), folder_id (gạch dưới)
function mapToDbFields(body: any) {
  const mapped: any = {};
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.link !== undefined) mapped.link = body.link;
  if (body.type !== undefined) mapped.type = body.type;
  
  // Cột Premium trong DB thực tế dùng snake_case "is_premium"
  const isPrem = body.isPremium ?? body.is_premium ?? body.ispremium;
  if (isPrem !== undefined) {
    mapped.is_premium = isPrem;
  }

  // Cột Khóa ngoại chuyên mục trong DB thực tế dùng snake_case "folder_id"
  const fId = body.folder_id ?? body.folderId ?? body.folderid;
  if (fId !== undefined) {
    mapped.folder_id = fId;
  }

  return mapped;
}

// Map database → frontend camelCase
function mapToFrontend(item: any) {
  if (!item) return item;
  return {
    ...item,
    isPremium: item.is_premium ?? item.ispremium ?? item.isPremium,
    folderId: item.folder_id ?? item.folderid ?? item.folderId,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ resources: (data || []).map(mapToFrontend) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const dbBody = mapToDbFields(body);
    const { data, error } = await supabaseAdmin.from("resources").insert([dbBody]).select();
    if (error) throw error;
    return NextResponse.json({ success: true, resource: mapToFrontend(data[0]) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const body = await req.json();
    const dbBody = mapToDbFields(body);
    const { data, error } = await supabaseAdmin.from("resources").update(dbBody).eq("id", id).select();
    if (error) throw error;
    return NextResponse.json({ success: true, resource: mapToFrontend(data[0]) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabaseAdmin.from("resources").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
