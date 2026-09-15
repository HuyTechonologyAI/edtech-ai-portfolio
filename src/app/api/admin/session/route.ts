import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const isAuthenticated = session === "authenticated";

  return NextResponse.json({
    authenticated: isAuthenticated,
    role: isAuthenticated ? "superadmin" : null,
  });
}
