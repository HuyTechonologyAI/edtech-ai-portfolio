import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// Ánh xạ chính xác tuyệt đối các cột Database đã được xác thực qua Schema Cache
// Bảng "videos": title, description, duration, youtubeurl (viết liền), is_featured (gạch dưới), folder_id (gạch dưới)
function mapToDbFields(body: any) {
  const mapped: any = {};
  if (body.title !== undefined) mapped.title = body.title;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.duration !== undefined) mapped.duration = body.duration;
  
  // Cột link Youtube trong DB thực tế viết liền "youtubeurl"
  const ytUrl = body.youtubeUrl ?? body.youtube_url ?? body.youtubeurl;
  if (ytUrl !== undefined) {
    mapped.youtubeurl = ytUrl;
  }

  // Cột Nổi bật trong DB thực tế dùng snake_case "is_featured"
  const isFeat = body.isFeatured ?? body.is_featured ?? body.isfeatured;
  if (isFeat !== undefined) {
    mapped.is_featured = isFeat;
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
    youtubeUrl: item.youtubeurl ?? item.youtube_url ?? item.youtubeUrl,
    isFeatured: item.is_featured ?? item.isfeatured ?? item.isFeatured,
    folderId: item.folder_id ?? item.folderid ?? item.folderId,
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
