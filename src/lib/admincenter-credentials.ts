import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PasswordRecord } from "@/lib/admincenter-session";

/**
 * Persistent AdminCenter credential store.
 *
 * Root cause of "password changed but not updated": on Vercel the filesystem is read-only/ephemeral,
 * so writeFileSync to src/data silently failed while the API still reported success.
 * Credentials now live in Supabase `cms_settings` (key prefix `_secret.` is never exposed by the public
 * settings API). Local file is used only as a dev fallback when NOT running on Vercel.
 */

const KEY = "_secret.admincenter_credentials";
const FILE = join(process.cwd(), "src", "data", "admincenter-auth.json");

export interface StoredCredentials {
  username: string;
  record: PasswordRecord;
  isInitialDefault: boolean;
  updatedAt: string;
  lockedUntil?: number;
  mfaSecret?: string;
  mfaEnabled?: boolean;
}

function fromLegacyFile(): StoredCredentials | null {
  try {
    if (!existsSync(FILE)) return null;
    const j = JSON.parse(readFileSync(FILE, "utf8"));
    if (j.isInitialDefault) return null;
    if (j.record) return { username: j.username, record: j.record, isInitialDefault: false, updatedAt: j.updatedAt };
    if (j.salt && j.hash) {
      return {
        username: j.username,
        record: { algo: "sha256-legacy", salt: j.salt, hash: j.hash },
        isInitialDefault: false,
        updatedAt: j.updatedAt,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function loadCredentials(): Promise<StoredCredentials | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("cms_settings")
      .select("setting_value")
      .eq("key_name", KEY)
      .maybeSingle();
    if (!error && data?.setting_value) return data.setting_value as StoredCredentials;
    if (error) console.error("[admincenter-credentials] load failed:", error.message);
  } catch (e) {
    console.error("[admincenter-credentials] load exception:", e);
  }
  return process.env.VERCEL ? null : fromLegacyFile();
}

/** Throws when the credential could not be durably persisted. Never reports false success. */
export async function saveCredentials(c: StoredCredentials): Promise<"supabase" | "file"> {
  let dbError: string | null = null;
  try {
    const { error } = await supabaseAdmin
      .from("cms_settings")
      .upsert({ key_name: KEY, setting_value: c, updated_at: new Date().toISOString() });
    if (!error) {
      const check = await loadCredentials();
      if (check && check.updatedAt === c.updatedAt) return "supabase";
      dbError = "read-back verification failed";
    } else {
      dbError = error.message;
    }
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }
  if (!process.env.VERCEL) {
    mkdirSync(join(process.cwd(), "src", "data"), { recursive: true });
    writeFileSync(FILE, JSON.stringify({ username: c.username, record: c.record, isInitialDefault: false, updatedAt: c.updatedAt }, null, 2));
    return "file";
  }
  throw new Error("CREDENTIAL_PERSIST_FAILED: " + dbError);
}
