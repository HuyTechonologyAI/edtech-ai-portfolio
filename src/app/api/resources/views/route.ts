import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// In-memory rate limiter for views to prevent spam/DoS (SEC-06)
const viewAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_VIEWS_PER_MIN = 20;
const VIEW_WINDOW_MS = 60 * 1000; // 1 minute

function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkViewRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = viewAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    viewAttempts.set(ip, { count: 1, resetAt: now + VIEW_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_VIEWS_PER_MIN) {
    return false;
  }
  entry.count += 1;
  return true;
}

// POST — Record a new view for a resource
export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkViewRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before recording more views." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { resourceId } = body;
    if (!resourceId) return NextResponse.json({ error: "Missing resourceId" }, { status: 400 });

    const { error } = await supabase.from("resource_views").insert([{
      resource_id: resourceId,
      viewed_at: new Date().toISOString(),
    }]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Views API POST Error (Server-side):", error);
    return NextResponse.json({ error: "Could not record view" }, { status: 500 });
  }
}

// GET — Get view statistics for a resource (or all resources)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    if (resourceId) {
      // Stats for a single resource
      const [dayRes, weekRes, monthRes, yearRes, totalRes] = await Promise.all([
        supabase.from("resource_views").select("id", { count: "exact", head: true })
          .eq("resource_id", resourceId).gte("viewed_at", startOfDay),
        supabase.from("resource_views").select("id", { count: "exact", head: true })
          .eq("resource_id", resourceId).gte("viewed_at", startOfWeek),
        supabase.from("resource_views").select("id", { count: "exact", head: true })
          .eq("resource_id", resourceId).gte("viewed_at", startOfMonth),
        supabase.from("resource_views").select("id", { count: "exact", head: true })
          .eq("resource_id", resourceId).gte("viewed_at", startOfYear),
        supabase.from("resource_views").select("id", { count: "exact", head: true })
          .eq("resource_id", resourceId),
      ]);

      return NextResponse.json({
        resourceId: Number(resourceId),
        views: {
          today: dayRes.count || 0,
          week: weekRes.count || 0,
          month: monthRes.count || 0,
          year: yearRes.count || 0,
          total: totalRes.count || 0,
        }
      });
    } else {
      // Aggregate stats for all resources — returns array
      const { data: allViews, error } = await supabase
        .from("resource_views")
        .select("resource_id, viewed_at");
      if (error) throw error;

      const statsMap: Record<number, { today: number; week: number; month: number; year: number; total: number }> = {};

      for (const view of allViews || []) {
        const rid = view.resource_id;
        if (!statsMap[rid]) {
          statsMap[rid] = { today: 0, week: 0, month: 0, year: 0, total: 0 };
        }
        const viewDate = view.viewed_at;
        statsMap[rid].total++;
        if (viewDate >= startOfYear) statsMap[rid].year++;
        if (viewDate >= startOfMonth) statsMap[rid].month++;
        if (viewDate >= startOfWeek) statsMap[rid].week++;
        if (viewDate >= startOfDay) statsMap[rid].today++;
      }

      return NextResponse.json({ stats: statsMap });
    }
  } catch (error) {
    console.error("Views API GET Error (Server-side):", error);
    return NextResponse.json({ error: "Could not fetch views statistics" }, { status: 500 });
  }
}
