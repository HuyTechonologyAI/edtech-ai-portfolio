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

const supabase = createClient(
  envVars["NEXT_PUBLIC_SUPABASE_URL"],
  envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
);

async function testTask() {
  const taskId = crypto.randomUUID();
  const { error } = await supabase.from("ai_tasks").insert({
    id: taskId,
    intent: "BENCHMARK_NODE01",
    input: "Benchmark task",
    priority: "P0",
    status: "QUEUED"
  });
  
  if (error) {
    console.error("Insert error:", error);
    return;
  }
  
  console.log(`Task ${taskId} inserted. Waiting...`);
  
  for (let i = 0; i < 30; i++) {
    const { data: task } = await supabase.from("ai_tasks").select("*").eq("id", taskId).single();
    if (task && task.status === "COMPLETED") {
      console.log("Task completed:", task.output);
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("Timeout");
}

testTask();
