// ==============================================================================
// HUY AI CENTER × EDUVIET — DATABASE MIGRATION SCRIPT
// Phase EDU-A: Thin Schema for EduViet Canonical Bridge
// ==============================================================================

import { Client } from "pg";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const parts = trimmed.split("=");
  if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
}

const pass = encodeURIComponent(envVars["ADMIN_PASSWORD"] || "Hoalong@80119");
const connectionString = `postgres://postgres:${pass}@db.bdeluacbzbdflxubhpha.supabase.co:5432/postgres`;

const sql = `
-- 1. edu_generation_requests
CREATE TABLE IF NOT EXISTS public.edu_generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_task_id uuid UNIQUE REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  user_id uuid,
  actor_role text DEFAULT 'TEACHER',
  request_type text NOT NULL,
  requested_outputs text[] DEFAULT '{}',
  lesson_title text NOT NULL,
  subject text NOT NULL,
  education_level text,
  standard text DEFAULT '5512',
  duration_minutes integer DEFAULT 45,
  source_app text DEFAULT 'eduviet',
  source_request_id text,
  input_snapshot jsonb DEFAULT '{}'::jsonb,
  context_snapshot_ref text,
  consent_store_history boolean DEFAULT true,
  consent_learning_use boolean DEFAULT false,
  status text DEFAULT 'QUEUED',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. edu_generation_artifacts
CREATE TABLE IF NOT EXISTS public.edu_generation_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.edu_generation_requests(id) ON DELETE CASCADE,
  ai_output_id uuid REFERENCES public.ai_outputs(id) ON DELETE SET NULL,
  artifact_type text NOT NULL,
  mime_type text NOT NULL,
  storage_ref text,
  preview_ref text,
  version integer DEFAULT 1,
  quality_status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

-- 3. edu_generation_feedback
CREATE TABLE IF NOT EXISTS public.edu_generation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.edu_generation_requests(id) ON DELETE CASCADE,
  artifact_id uuid REFERENCES public.edu_generation_artifacts(id) ON DELETE SET NULL,
  user_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  accepted boolean DEFAULT true,
  edited boolean DEFAULT false,
  feedback_text text,
  created_at timestamptz DEFAULT now()
);

-- 4. edu_learning_candidates
CREATE TABLE IF NOT EXISTS public.edu_learning_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.edu_generation_requests(id) ON DELETE CASCADE,
  artifact_id uuid REFERENCES public.edu_generation_artifacts(id) ON DELETE SET NULL,
  candidate_type text NOT NULL,
  deidentification_status text DEFAULT 'RAW',
  consent_status text DEFAULT 'PENDING',
  quality_score numeric DEFAULT 0,
  source_quality_score numeric DEFAULT 0,
  human_feedback_score numeric DEFAULT 0,
  policy_status text DEFAULT 'PENDING_REVIEW',
  dataset_version text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edu_requests_user ON public.edu_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_edu_requests_status ON public.edu_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_edu_requests_ai_task ON public.edu_generation_requests(ai_task_id);
CREATE INDEX IF NOT EXISTS idx_edu_artifacts_req ON public.edu_generation_artifacts(request_id);
CREATE INDEX IF NOT EXISTS idx_edu_feedback_req ON public.edu_generation_feedback(request_id);
CREATE INDEX IF NOT EXISTS idx_edu_learning_req ON public.edu_learning_candidates(request_id);

-- Grants & RLS
ALTER TABLE public.edu_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_generation_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_generation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_learning_candidates ENABLE ROW LEVEL SECURITY;

-- Allow service_role full bypass
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_edu_requests') THEN
    CREATE POLICY service_role_all_edu_requests ON public.edu_generation_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_edu_requests') THEN
    CREATE POLICY anon_read_edu_requests ON public.edu_generation_requests FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_insert_edu_requests') THEN
    CREATE POLICY anon_insert_edu_requests ON public.edu_generation_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_edu_artifacts') THEN
    CREATE POLICY service_role_all_edu_artifacts ON public.edu_generation_artifacts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_edu_artifacts') THEN
    CREATE POLICY anon_read_edu_artifacts ON public.edu_generation_artifacts FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_edu_feedback') THEN
    CREATE POLICY service_role_all_edu_feedback ON public.edu_generation_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_all_edu_feedback') THEN
    CREATE POLICY anon_all_edu_feedback ON public.edu_generation_feedback FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_edu_learning') THEN
    CREATE POLICY service_role_all_edu_learning ON public.edu_learning_candidates FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function run() {
  console.log("⚡ Đang kết nối PostgreSQL Supabase HuyAI...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✔ Đã kết nối thành công. Đang thực thi migration Phase EDU-A...");
    await client.query(sql);
    console.log("✅ Hoàn tất tạo các bảng:");
    console.log("  - edu_generation_requests");
    console.log("  - edu_generation_artifacts");
    console.log("  - edu_generation_feedback");
    console.log("  - edu_learning_candidates");
  } catch (err) {
    console.error("❌ Lỗi migration:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
