import { cookies } from "next/headers";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const hasAdminCookie = cookieStore.get("admin_session")?.value === "authenticated";

  return <AdminDashboard initialHasAdminCookie={hasAdminCookie} />;
}
