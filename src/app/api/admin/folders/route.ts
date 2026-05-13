import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper check admin auth session
function isAuthenticatedAdmin(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "authenticated";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderType = searchParams.get("type"); // 'VIDEO' or 'RESOURCE'

    let query = supabase.from("cms_folders").select("*").order("created_at", { ascending: true });
    
    if (folderType) {
      query = query.eq("type", folderType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, folders: data || [] });
  } catch (error: any) {
    // Trả về dữ liệu cây thư mục mẫu cao cấp nếu bảng chưa được khởi tạo SQL
    const fallbackFolders = [
      { id: 1, name: "🚀 Khởi Đầu Trí Tuệ Nhân Tạo", type: "RESOURCE", parent_id: null },
      { id: 2, name: "⚡ Kỹ thuật Prompt Nâng Cao", type: "RESOURCE", parent_id: 1 },
      { id: 3, name: "🤖 Tự Động Hóa Thực Chiến", type: "VIDEO", parent_id: null },
      { id: 4, name: "🔗 n8n Workflow Enterprise", type: "VIDEO", parent_id: 3 },
      { id: 5, name: "📦 Make.com Templates", type: "RESOURCE", parent_id: null }
    ];
    return NextResponse.json({ success: true, folders: fallbackFolders, isFallback: true });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, parent_id } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Thiếu thông tin Tên hoặc Loại thư mục" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("cms_folders")
      .insert([{
        name: name.trim(),
        type,
        parent_id: parent_id || null
      }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, folder: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing Folder ID parameter" }, { status: 400 });

    const { error } = await supabase
      .from("cms_folders")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
