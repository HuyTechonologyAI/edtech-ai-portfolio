import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// Khóa bí mật dùng để băm chữ ký (Nên đồng bộ cấu hình biến môi trường trên Vercel)
const SECRET = process.env.SIGNED_URL_SECRET || "zentratech_super_secret_key_2026";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing resource ID parameter" }, { status: 400 });

    // Truy vấn thông tin tài liệu từ cơ sở dữ liệu Supabase
    const { data: resource, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resource) {
      return NextResponse.json({ error: "Không tìm thấy tài nguyên được yêu cầu." }, { status: 404 });
    }

    // Cấu hình thời gian sống (TTL) của đường dẫn tải tạm thời là 5 phút (300,000 ms)
    const expires = Date.now() + 5 * 60 * 1000;

    // Khởi tạo mã băm mật mã học HMAC-SHA256 nhằm ngăn chặn giả mạo hoặc chia sẻ trái phép
    const signature = crypto
      .createHmac("sha256", SECRET)
      .update(`${id}:${expires}`)
      .digest("hex");

    // Sinh đường dẫn tải an toàn đi qua cổng Proxy nhằm giấu hoàn toàn URL lưu trữ gốc
    const signedUrl = `/api/resources/proxy?id=${id}&expires=${expires}&sig=${signature}`;

    return NextResponse.json({
      success: true,
      signedUrl,
      expires,
      resourceTitle: resource.title
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
