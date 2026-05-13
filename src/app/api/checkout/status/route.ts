import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const simulate = searchParams.get("simulate");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 });
    }

    // Chế độ mô phỏng Test Webhook dành cho trải nghiệm của Admin/Dev
    if (simulate === "true") {
      return NextResponse.json({ success: true, status: "SUCCESS", simulated: true });
    }

    // Nếu đang chạy mock order ID 9999
    if (orderId === "9999") {
      return NextResponse.json({ success: true, status: "PENDING", isFallback: true });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, status: data?.status || "PENDING" });
  } catch (error: any) {
    return NextResponse.json({ success: true, status: "PENDING", isFallback: true });
  }
}
