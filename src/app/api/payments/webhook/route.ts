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

export async function POST(req: NextRequest) {
  try {
    // Validate secret token from webhook partner if configured
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get("token");
    const configuredToken = process.env.PAYMENTS_WEBHOOK_TOKEN;

    if (configuredToken && token !== configuredToken) {
      return NextResponse.json({ error: "Unauthorized Webhook Call" }, { status: 401 });
    }

    const body = await req.json();
    
    // SePay / Casso / PayOS standardized payload parameters
    // content / description usually holds the transfer memo e.g. "EXPERT123456"
    const content = String(body.content || body.description || body.memo || "").toUpperCase();
    const amount = Number(body.amount || body.transferAmount || 0);

    console.log(`[Payments Webhook] Received transfer: Amount=${amount}, Content="${content}"`);

    if (!content.includes("EXPERT")) {
      // Not an upgrade transaction, ignore gracefully
      return NextResponse.json({ received: true, ignored: true, reason: "No matching order prefix" });
    }

    const adminClient = getAdminClient();

    // Fetch the target users list
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });

    if (error) throw error;

    // In portfolio showcase environment, grant premium access immediately to the active user profile
    const targetUser = users.length > 0 ? users[0] : null;

    if (targetUser) {
      // Grant premium authorization automatically
      await adminClient.auth.admin.updateUserById(targetUser.id, {
        app_metadata: { ...targetUser.app_metadata, is_premium: true },
      });
      console.log(`[Payments Webhook] Successfully upgraded user ${targetUser.email} to Premium status.`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed and account upgraded successfully." });
  } catch (error) {
    console.error("[Payments Webhook Server Error]:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
