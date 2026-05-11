import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// Map frontend camelCase → database snake_case columns
// Actual DB columns: id, title, description, duration, youtube_url, is_featured, created_at
function mapToDbFields(body: any) {
  const mapped: any = {};
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.duration !== undefined) mapped.duration = body.duration;
  // Handle youtubeUrl → youtube_url
  if (body.youtubeUrl !== undefined) mapped.youtube_url = body.youtubeUrl;
  if (body.youtube_url !== undefined) mapped.youtube_url = body.youtube_url;
  // Handle isFeatured → is_featured
  if (body.isFeatured !== undefined) mapped.is_featured = body.isFeatured;
  if (body.is_featured !== undefined) mapped.is_featured = body.is_featured;
  return mapped;
}

// Map database snake_case → frontend camelCase
function mapToFrontend(item: any) {
  if (!item) return item;
  return {
    ...item,
    youtubeUrl: item.youtube_url ?? item.youtubeUrl,
    isFeatured: item.is_featured ?? item.isFeatured,
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ videos: (data || []).map(mapToFrontend) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const dbBody = mapToDbFields(body);
    const { data, error } = await supabase.from("videos").insert([dbBody]).select();
    if (error) throw error;
    return NextResponse.json({ success: true, video: mapToFrontend(data[0]) });
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
    const { data, error } = await supabase.from("videos").update(dbBody).eq("id", id).select();
    if (error) throw error;
    return NextResponse.json({ success: true, video: mapToFrontend(data[0]) });
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

    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
