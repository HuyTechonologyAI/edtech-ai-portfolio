import { getErrorMessage } from "@/lib/error-message";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { generateSignedUrl } from "@/lib/resources-security";

const SECRET = process.env.SIGNED_URL_SECRET;

/**
 * Access Control Helper:
 * Checks whether the requester is Admin or an Authenticated Premium user.
 */
async function verifyUserOrAdminAuth(req: NextRequest): Promise<{ isAuthed: boolean; isPremium: boolean }> {
  if (await verifyAdminAuth(req)) {
    return { isAuthed: true, isPremium: true };
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    try {
      const token = authHeader.substring(7).trim();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        const isPremium = user.user_metadata?.is_premium === true || 
                          user.app_metadata?.is_premium === true || 
                          user.user_metadata?.role === "admin";
        return { isAuthed: true, isPremium };
      }
    } catch {
      // Fall through to unauthenticated
    }
  }
  return { isAuthed: false, isPremium: false };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const shouldRedirect = searchParams.get("redirect") === "true" || searchParams.get("download") === "true";

    if (!id) return NextResponse.json({ error: "Missing resource ID parameter" }, { status: 400 });
    if (!SECRET) {
      return NextResponse.json({ error: "Signed URL service is not configured" }, { status: 503 });
    }

    // Truy vấn thông tin tài liệu từ cơ sở dữ liệu Supabase
    const { data: resource, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resource) {
      return NextResponse.json({ error: "Không tìm thấy tài nguyên được yêu cầu." }, { status: 404 });
    }

    // Phân loại tài nguyên & Kiểm soát quyền truy cập:
    // Nếu tài nguyên là Premium hoặc Riêng tư, bắt buộc người dùng phải xác thực quyền tương ứng
    const isRestricted = resource.is_premium === true || resource.access_level === "private" || resource.is_private === true;
    if (isRestricted) {
      const auth = await verifyUserOrAdminAuth(req);
      if (!auth.isAuthed || !auth.isPremium) {
        return NextResponse.json(
          { 
            error: "Tài liệu này được phân loại riêng biệt (Premium/Private). Yêu cầu đăng nhập tài khoản có quyền truy cập.",
            code: "FORBIDDEN_RESTRICTED_RESOURCE" 
          }, 
          { status: 403 }
        );
      }
    }

    // Cấu hình thời gian sống (TTL) của đường dẫn tải tạm thời là 5 phút (300,000 ms)
    const { signedUrl, expires } = generateSignedUrl(id, SECRET, 5 * 60 * 1000);

    if (shouldRedirect) {
      return NextResponse.redirect(new URL(signedUrl, req.url));
    }

    return NextResponse.json({
      success: true,
      signedUrl,
      expires,
      resourceTitle: resource.title,
      isRestricted
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
