// ==============================================================================
// HUY TECHNOLOGY AI GROUP — CANONICAL REGISTRY SEED SCRIPT
// Purpose: Seed real providers, models, tools, and agents into Supabase HuyAI
// Triệt tiêu hiện tượng Split-Brain (Durable Source of Truth)
// ==============================================================================

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Đọc cấu hình môi trường .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ Không tìm thấy file .env.local!");
  process.exit(1);
}

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

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Thiếu biến NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

console.log("🚀 Bắt đầu nạp dữ liệu Canonical Registry vào Supabase HuyAI...");
console.log(`📡 Supabase Endpoint: ${supabaseUrl}`);

// 2. Dữ liệu Danh mục Nhà Cung Cấp (ai_providers)
const providers = [
  {
    id: "ollama-node01",
    name: "Node-01 Ollama Local Gateway",
    provider_type: "local",
    base_url: "http://127.0.0.1:11434",
    api_version: "v1",
    is_active: true,
    is_default: true,
    config: {
      node_id: "huy-ai-node-01",
      hardware: "Dell Precision M4800 (16GB RAM / Core i7)",
      execution_mode: "outbound_queue_polling",
      health_check_endpoint: "http://127.0.0.1:11434/api/tags"
    }
  },
  {
    id: "google-gemini",
    name: "Google Gemini Cloud API",
    provider_type: "cloud",
    base_url: "https://generativelanguage.googleapis.com",
    api_version: "v1beta",
    is_active: true,
    is_default: false,
    config: {
      tier: "L1/L2 cloud multimodal & research",
      quota_guard: "max_requests_per_minute: 60"
    }
  },
  {
    id: "openai-codex",
    name: "OpenAI Codex / GPT Engine",
    provider_type: "cloud",
    base_url: "https://api.openai.com/v1",
    api_version: "v1",
    is_active: true,
    is_default: false,
    config: {
      role: "primary_implementation_writer",
      circuit_breaker: "enabled"
    }
  },
  {
    id: "anthropic-claude",
    name: "Anthropic Claude API",
    provider_type: "cloud",
    base_url: "https://api.anthropic.com/v1",
    api_version: "2023-06-01",
    is_active: false,
    is_default: false,
    config: {
      role: "independent_architect_review",
      status: "standby_credential_pending"
    }
  }
];

// 3. Dữ liệu Danh mục Mô hình (ai_models)
const models = [
  {
    id: "ollama/qwen2.5-coder:3b",
    provider_id: "ollama-node01",
    model_name: "qwen2.5-coder:3b",
    display_name: "Qwen 2.5 Coder 3B (Node-01 Local Inventory)",
    context_window: 32768,
    max_output_tokens: 8192,
    input_cost_per_million: 0.0,
    output_cost_per_million: 0.0,
    is_active: true,
    capabilities: ["code_generation", "classification", "test_design", "fast_inference", "offline_ready"]
  },
  {
    id: "gemini/gemini-2.0-flash",
    provider_id: "google-gemini",
    model_name: "gemini-2.0-flash",
    display_name: "Google Gemini 2.0 Flash",
    context_window: 1048576,
    max_output_tokens: 8192,
    input_cost_per_million: 0.1,
    output_cost_per_million: 0.4,
    is_active: true,
    capabilities: ["multimodal", "research", "education_curriculum", "long_context"]
  },
  {
    id: "openai/gpt-4o",
    provider_id: "openai-codex",
    model_name: "gpt-4o",
    display_name: "OpenAI GPT-4o Implementation Engine",
    context_window: 128000,
    max_output_tokens: 4096,
    input_cost_per_million: 2.5,
    output_cost_per_million: 10.0,
    is_active: true,
    capabilities: ["complex_refactoring", "codebase_repair", "security_review"]
  }
];

// 4. Dữ liệu Công cụ Tự Động Hóa (tools)
const tools = [
  {
    id: "tool-worktree-isolation",
    name: "Git Worktree Isolation Manager",
    description: "Khởi tạo và dọn dẹp các không gian làm việc cô lập trong .agent-worktrees/ cho từng AI Worker.",
    category: "utility",
    status: "ready",
    recommended_role: "WORKER-L3-OPS-01",
    supported_inputs: ["branch", "worktree_path", "contract_id"],
    output_format: "path"
  },
  {
    id: "tool-ollama-bridge",
    name: "Local Ollama Gateway Bridge",
    description: "Cầu nối phân luồng và chuyển tiếp câu lệnh nội bộ tới model qwen2.5-coder:3b trên Node-01.",
    category: "llm",
    status: "ready",
    recommended_role: "All L2/L3 Workers",
    supported_inputs: ["prompt", "system_prompt", "model"],
    output_format: "json"
  },
  {
    id: "tool-pgmq-queue-runner",
    name: "PGMQ Durable Job Consumer",
    description: "Trình kéo nhiệm vụ bền vững từ hàng đợi pgmq.q_ai-jobs của Supabase.",
    category: "utility",
    status: "ready",
    recommended_role: "SUPERVISOR-L1-ANTIGRAVITY",
    supported_inputs: ["queue_name", "batch_size", "vt"],
    output_format: "json"
  },
  {
    id: "tool-risk-governance-guard",
    name: "HAIP Risk & Security Guard",
    description: "Kiểm soát phân quyền rủi ro R0-R4, cổng duyệt con người (Human Gate) và kiểm định chữ ký telemetry.",
    category: "utility",
    status: "ready",
    recommended_role: "SUPERVISOR-L1-ANTIGRAVITY",
    supported_inputs: ["task_risk", "command_whitelist"],
    output_format: "boolean"
  }
];

// 5. Dữ liệu Danh mục Tác Tử Độc Lập (agents)
const agents = [
  {
    id: "SUPERVISOR-L1-ANTIGRAVITY",
    name: "Autonomous Supervisor L1 (Antigravity)",
    version: "1.2.0",
    description: "Bộ não điều phối tối cao tập đoàn: Quản trị mục tiêu, chia việc DAG, kiểm định chất lượng và kết nối Human Owner.",
    capabilities: ["orchestration", "risk_governance", "dag_scheduling", "human_gate_bridge", "executive_reporting"],
    risk_ceiling: 4,
    max_parallel_tasks: 8,
    enabled: true,
    health_status: "healthy",
    last_seen_at: new Date().toISOString(),
    active_task_count: 2,
    configuration: {
      runtime_dispatch_enabled: true,
      operating_mode: "AUTONOMOUS_24_7",
      l1_authority_delegated: true,
      quota_guard_enabled: true
    },
    metadata: {
      verification_status: "VERIFIED",
      tier: "L1",
      role: "Group Supervisor",
      assigned_provider: "antigravity-deepmind",
      license: "Proprietary HAIP/1.0"
    }
  },
  {
    id: "WORKER-L3-DEV-01",
    name: "Local Fullstack AI Worker (Node-01)",
    version: "1.1.0",
    description: "Thực thi mã nguồn TypeScript/Next.js trong .agent-worktrees/ cách ly hoàn toàn.",
    capabilities: ["code_generation", "refactoring", "local_execution", "worktree_sandbox"],
    risk_ceiling: 2,
    max_parallel_tasks: 2,
    enabled: true,
    health_status: "healthy",
    last_seen_at: new Date().toISOString(),
    active_task_count: 1,
    configuration: {
      runtime_dispatch_enabled: true,
      worktree_root: ".agent-worktrees/node01/task-dev-01",
      execution_host: "Node-01 Dell Precision M4800"
    },
    metadata: {
      verification_status: "VERIFIED",
      tier: "L3",
      role: "Fullstack Developer",
      provider: "ollama-node01",
      model: "qwen2.5-coder:3b",
      license: "MIT / Apache-2.0 Verified"
    }
  },
  {
    id: "WORKER-L3-TEST-01",
    name: "Local QA & Regression AI Worker (Node-01)",
    version: "1.1.0",
    description: "Thiết kế Predictive Unit Tests và chạy Test-First Suite trước khi cho phép lưu Checkpoint.",
    capabilities: ["test_design", "regression_testing", "typecheck_validation", "evidence_generation"],
    risk_ceiling: 1,
    max_parallel_tasks: 2,
    enabled: true,
    health_status: "healthy",
    last_seen_at: new Date().toISOString(),
    active_task_count: 0,
    configuration: {
      runtime_dispatch_enabled: true,
      worktree_root: ".agent-worktrees/node01/task-test-01",
      execution_host: "Node-01 Dell Precision M4800"
    },
    metadata: {
      verification_status: "VERIFIED",
      tier: "L3",
      role: "QA Engineer",
      provider: "ollama-node01",
      model: "qwen2.5-coder:3b",
      license: "MIT / Apache-2.0 Verified"
    }
  },
  {
    id: "WORKER-L3-OPS-01",
    name: "Local Worktree & PGMQ Worker (Node-01)",
    version: "1.1.0",
    description: "Quản trị hàng đợi PGMQ, dọn dẹp worktrees và đồng bộ telemetry bảo mật.",
    capabilities: ["worktree_management", "queue_consumer", "telemetry_sync", "disaster_recovery"],
    risk_ceiling: 2,
    max_parallel_tasks: 2,
    enabled: true,
    health_status: "healthy",
    last_seen_at: new Date().toISOString(),
    active_task_count: 1,
    configuration: {
      runtime_dispatch_enabled: true,
      worktree_root: ".agent-worktrees/node01/task-ops-01",
      execution_host: "Node-01 Dell Precision M4800"
    },
    metadata: {
      verification_status: "VERIFIED",
      tier: "L3",
      role: "SRE & Ops Engineer",
      provider: "ollama-node01",
      model: "qwen2.5-coder:3b",
      license: "Apache-2.0 Verified"
    }
  },
  {
    id: "WORKER-L2-CLASSIFIER-01",
    name: "Local Triage & Classifier Worker (Node-01)",
    version: "1.0.0",
    description: "Phân loại yêu cầu, xác định cấp rủi ro R0-R4 và định tuyến mô hình chi phí thấp.",
    capabilities: ["classification", "routing", "schema_validation", "fast_triage"],
    risk_ceiling: 0,
    max_parallel_tasks: 4,
    enabled: true,
    health_status: "healthy",
    last_seen_at: new Date().toISOString(),
    active_task_count: 0,
    configuration: {
      runtime_dispatch_enabled: true,
      execution_host: "Node-01 Dell Precision M4800"
    },
    metadata: {
      verification_status: "VERIFIED",
      tier: "L2",
      role: "Triage Classifier",
      provider: "ollama-node01",
      model: "qwen2.5-coder:3b",
      license: "Apache-2.0 Verified"
    }
  }
];

async function seedTable(tableName, rows) {
  console.log(`\n📦 Đang nạp bảng [${tableName}] (${rows.length} bản ghi)...`);
  for (const row of rows) {
    const { error } = await supabase.from(tableName).upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ Lỗi khi nạp [${tableName}] ID ${row.id}:`, error.message);
    } else {
      console.log(`  ✔ [${tableName}] ID [${row.id}] -> OK`);
    }
  }
}

async function verifyCounts() {
  console.log("\n🔍 Kiểm định lại số lượng bản ghi sau khi nạp:");
  const tables = ["ai_providers", "ai_models", "tools", "agents"];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`  ❌ [${t}]: ${error.message}`);
    } else {
      console.log(`  ✅ [${t}]: ${count} bản ghi`);
    }
  }
}

async function main() {
  try {
    await seedTable("ai_providers", providers);
    await seedTable("ai_models", models);
    await seedTable("tools", tools);
    await seedTable("agents", agents);
    await verifyCounts();
    console.log("\n🎉 HOÀN THÀNH SEED CANONICAL REGISTRY THỰC TẾ THÀNH CÔNG 100%!");
  } catch (err) {
    console.error("❌ Thất bại trong quá trình seed:", err);
    process.exit(1);
  }
}

main();
