"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client for user authentication
// Uses a singleton to prevent "Multiple GoTrueClient instances" warnings (F07)
let browserSupabaseInstance: SupabaseClient | undefined;

export function createBrowserSupabase() {
  if (!browserSupabaseInstance) {
    browserSupabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserSupabaseInstance;
}
