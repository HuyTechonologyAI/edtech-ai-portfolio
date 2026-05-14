import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// Map frontend camelCase → database snake_case/flat columns
function mapToDbFields(body: any) {
  const mapped: any = {};
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.link !== undefined) mapped.link = body.link;
  if (body.type !== undefined) mapped.type = body.type;
  
  // Ánh xạ toàn diện cho cột Premium
  const isPrem = body.isPremium ?? body.is_premium ?? body.ispremium;
  if (isPrem !== undefined) {
    mapped.is_premium = isPrem;
    mapped.ispremium = isPrem;
  }

  // Ánh xạ toàn diện cho ID chuyên mục
  const fId = body.folder_id ?? body.folderId ?? body.folderid;
  if (fId !== undefined) {
    mapped.folder_id = fId;
    mapped.folderid = fId;
  }

  return mapped;
}

// Map database snake_case/flat → frontend camelCase
function mapToFrontend(item: any) {
  if (!item) return item;
  return {
    ...item,
    isPremium: item.ispremium ?? item.is_premium ?? item.isPremium,
    folderId: item.folderid ?? item.folder_id ?? item.folderId,
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

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const dbBody = mapToDbFields(body);
    const { data, error } = await supabase.from("resources").insert([dbBody]).select();
    if (error) throw error;
    return NextResponse.json({ success: true, resource: mapToFrontend(data[0]) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const body = await req.json();
    const dbBody = mapToDbFields(body);
    const { data, error } = await supabase.from("resources").update(dbBody).eq("id", id).select();
    if (error) throw error;
    return NextResponse.json({ success: true, resource: mapToFrontend(data[0]) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
