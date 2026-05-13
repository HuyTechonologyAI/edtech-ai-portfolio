import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client dùng service role key (bypass RLS)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to verify admin session
function isAuthenticatedAdmin(req: NextRequest): boolean {
  const session = req.cookies.get("admin_session")?.value;
  return session === "authenticated";
}

// GET: Lấy danh sách users
export async function GET(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access: Admin authentication required" }, { status: 401 });
  }

  try {
    const adminClient = getAdminClient();

    // Lấy danh sách users từ Supabase Auth Admin API
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) throw error;

    // Format lại data trả về
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      phone: user.user_metadata?.phone || null,
      address: user.user_metadata?.address || null,
      occupation: user.user_metadata?.occupation || null,
      interests: user.user_metadata?.interests || null,
      goals: user.user_metadata?.goals || null,
      provider: user.app_metadata?.provider || "email",
      role: user.app_metadata?.role || "user",
      isPremium: user.app_metadata?.is_premium || false,
      isBlocked: user.banned_until ? new Date(user.banned_until) > new Date() : false,
      bannedUntil: user.banned_until || null,
      emailConfirmed: !!user.email_confirmed_at,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at,
    }));

    // Tính thống kê
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: formattedUsers.length,
      today: formattedUsers.filter(u => new Date(u.createdAt) >= today).length,
      thisWeek: formattedUsers.filter(u => new Date(u.createdAt) >= weekAgo).length,
      thisMonth: formattedUsers.filter(u => new Date(u.createdAt) >= monthAgo).length,
      premium: formattedUsers.filter(u => u.isPremium).length,
      blocked: formattedUsers.filter(u => u.isBlocked).length,
      byProvider: {
        google: formattedUsers.filter(u => u.provider === "google").length,
        facebook: formattedUsers.filter(u => u.provider === "facebook").length,
        email: formattedUsers.filter(u => u.provider === "email").length,
      },
    };

    return NextResponse.json({ users: formattedUsers, stats });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    const msg = error instanceof Error ? error.message : "Không thể lấy danh sách người dùng";
    return NextResponse.json(
      { error: msg },
      { status: msg.includes("SERVICE_ROLE_KEY") ? 503 : 500 }
    );
  }
}

// PATCH: Cập nhật user (role, premium status, ban/unban)
export async function PATCH(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access: Admin authentication required" }, { status: 401 });
  }

  try {
    const adminClient = getAdminClient();
    const { userId, action, value } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "setRole":
        // Cập nhật app_metadata.role
        updateData = {
          app_metadata: { role: value },
        };
        break;

      case "setPremium":
        // Cập nhật app_metadata.is_premium
        updateData = {
          app_metadata: { is_premium: value },
        };
        break;

      case "ban":
        // Ban user trong 100 năm (vĩnh viễn)
        updateData = {
          ban_duration: value ? "876000h" : "none", // none = unban
        };
        break;

      case "confirmEmail":
        // Xác nhận email thủ công
        updateData = {
          email_confirm: true,
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (error) throw error;

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    const msg = error instanceof Error ? error.message : "Không thể cập nhật người dùng";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

// DELETE: Xóa user
export async function DELETE(req: NextRequest) {
  if (!isAuthenticatedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized access: Admin authentication required" }, { status: 401 });
  }

  try {
    const adminClient = getAdminClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    const msg = error instanceof Error ? error.message : "Không thể xóa người dùng";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
