import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const parts = trimmed.split("=");
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
}

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function fixTasks() {
  const { data: tasks, error } = await supabase
    .from("ai_tasks")
    .select("id, status")
    .eq("status", "CLAIMED");

  if (error) {
    console.error("Error fetching tasks:", error);
    return;
  }

  console.log("Found stuck tasks:", tasks);

  for (const task of tasks) {
    console.log(`Fixing task ${task.id}...`);
    const { error: runErr } = await supabase
      .from("ai_tasks")
      .update({ status: "RUNNING" })
      .eq("id", task.id);
    
    if (runErr) {
      console.error(`Error transitioning ${task.id} to RUNNING:`, runErr);
      continue;
    }
    console.log(`Task ${task.id} transitioned to RUNNING.`);

    const { error: compErr } = await supabase
      .from("ai_tasks")
      .update({ status: "FAILED", output: { status: "FAILED", summary: "Fixed manually from stuck CLAIMED state" } })
      .eq("id", task.id);
      
    if (compErr) {
      console.error(`Error transitioning ${task.id} to FAILED:`, compErr);
    } else {
      console.log(`Task ${task.id} successfully fixed to FAILED.`);
    }
  }
}

fixTasks();
