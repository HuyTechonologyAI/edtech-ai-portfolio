import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("premium_contents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ premium: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, category, link } = body;

    if (!title || !link) {
      return NextResponse.json({ error: "Tiêu đề và Link là bắt buộc" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("premium_contents")
      .insert([{ title, description, category: category || "Workflow", link }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, premium: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const body = await req.json();
    const { title, description, category, link } = body;

    const payload: any = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (category !== undefined) payload.category = category;
    if (link !== undefined) payload.link = link;

    const { data, error } = await supabase
      .from("premium_contents")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, premium: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase.from("premium_contents").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
