import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/admincenter-session";

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = verifySession(cookieStore.get("admin_session")?.value, "admin");

  return NextResponse.json({
    authenticated: isAuthenticated,
    role: isAuthenticated ? "superadmin" : null,
  });
}
