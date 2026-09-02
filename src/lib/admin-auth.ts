import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Robustly verifies admin or delegated sub-admin access for API routes.
 * Supports:
 * 1. `admin_session` cookie ("authenticated")
 * 2. Supabase Auth Bearer Token (in Authorization header) for users with admin or assistant privileges
 */
export async function verifyAdminAuth(req?: NextRequest): Promise<boolean> {
  // 1. Check admin_session cookie from request object
  let sessionCookie: string | undefined;
  if (req) {
    sessionCookie = req.cookies.get("admin_session")?.value;
  }

  // 2. Fallback: Check cookieStore from next/headers
  if (!sessionCookie) {
    try {
      const cookieStore = await cookies();
      sessionCookie = cookieStore.get("admin_session")?.value;
    } catch {
      // Ignore if called outside server context
    }
  }

  if (sessionCookie === "authenticated") {
    return true;
  }

  // 3. Fallback: Check Authorization header with Supabase Access Token
  if (req) {
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (token) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          const isSuperAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";
          const isSubAdmin = user.user_metadata?.can_manage_content ||
                             user.user_metadata?.can_moderate_comments ||
                             user.user_metadata?.can_grant_premium;
          if (isSuperAdmin || isSubAdmin) {
            return true;
          }
        }
      } catch (err) {
        console.error("verifyAdminAuth token check error:", err);
      }
    }
  }

  return false;
}
