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
  if (body.duration !== undefined) mapped.duration = body.duration;
  
  // Ánh xạ toàn diện cho cột URL Youtube để tương thích tuyệt đối với cả bảng dùng "youtubeurl" hoặc "youtube_url"
  const ytUrl = body.youtubeUrl ?? body.youtube_url ?? body.youtubeurl;
  if (ytUrl !== undefined) {
    mapped.youtube_url = ytUrl;
    mapped.youtubeurl = ytUrl;
  }

  // Ánh xạ toàn diện cho cột Nổi bật
  const isFeat = body.isFeatured ?? body.is_featured ?? body.isfeatured;
  if (isFeat !== undefined) {
    mapped.is_featured = isFeat;
    mapped.isfeatured = isFeat;
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
    youtubeUrl: item.youtubeurl ?? item.youtube_url ?? item.youtubeUrl,
    isFeatured: item.isfeatured ?? item.is_featured ?? item.isFeatured,
    folderId: item.folderid ?? item.folder_id ?? item.folderId,
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
