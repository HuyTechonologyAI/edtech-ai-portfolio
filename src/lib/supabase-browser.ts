"use client";

import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client for user authentication
// This is separate from the server-side client in supabase.ts
export function createBrowserSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
