import { cookies } from "next/headers";
import AdminDashboard from "@/components/AdminDashboard";
import { verifySession } from "@/lib/admincenter-session";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const hasAdminCookie = verifySession(cookieStore.get("admin_session")?.value, "admin");

  return <AdminDashboard initialHasAdminCookie={hasAdminCookie} />;
}
