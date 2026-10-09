import { NextResponse } from "next/server";
import voiceRegistry from "@/data/voice_registry.json";

export async function GET() {
  return NextResponse.json(voiceRegistry, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
