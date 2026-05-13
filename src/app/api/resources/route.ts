import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// Map frontend camelCase → database snake_case columns
// Actual DB columns: id, title, description, link, type, is_premium, created_at
function mapToDbFields(body: any) {
  const mapped: any = {};
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.link !== undefined) mapped.link = body.link;
  if (body.type !== undefined) mapped.type = body.type;
  // Handle isPremium → is_premium
  if (body.isPremium !== undefined) mapped.is_premium = body.isPremium;
  if (body.is_premium !== undefined) mapped.is_premium = body.is_premium;
  if (body.folder_id !== undefined) mapped.folder_id = body.folder_id;
  return mapped;
}

// Map database snake_case → frontend camelCase
function mapToFrontend(item: any) {
  if (!item) return item;
  return {
    ...item,
    isPremium: item.is_premium ?? item.isPremium,
    folderId: item.folder_id,
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
