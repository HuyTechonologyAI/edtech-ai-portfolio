// Script: seed default home page content into Supabase site_content table
// Run: node scripts/seed-content.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  env[key] = val;
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const defaultContent = {
  heroTitlePrefix: "Làm Chủ",
  heroTypewriter: [
    "Trí Tuệ Nhân Tạo",
    "Tự Động Hóa n8n",
    "Quy Trình Doanh Nghiệp",
    "Trợ Lý AI Agent",
  ],
  heroTitleSuffix: "& Tự Động Hóa",
  heroDescription:
    "Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.",
  stats: [
    { target: 1200, suffix: "+", label: "Học viên", sublabel: "Đang học tập", displayValue: null },
    { target: 150, suffix: "+", label: "Tài liệu Premium", sublabel: "Ebook & Slide", displayValue: null },
    { target: 0, suffix: "", label: "Đánh giá trung bình", sublabel: "Từ học viên", displayValue: "4.9★" },
    { target: 50, suffix: "+", label: "Kịch bản n8n / Make", sublabel: "Tự động hóa thực chiến", displayValue: null },
  ],
  aboutName: "Ngô Quốc Huy",
  aboutTitle: "CEO Vạn Hoả Long Technology",
  aboutDescription:
    "Là Kỹ sư Cơ khí Chế tạo (ĐH Sư Phạm Kỹ Thuật TP.HCM) và nhà giáo dục, tôi kết hợp giữa chuyên môn kỹ thuật sâu rộng và niềm đam mê truyền đạt kiến thức. Chuyển mình từ giảng viên sang vai trò người sáng lập kiêm CEO của Công ty TNHH Giải Pháp Công Nghệ Vạn Hoả Long, tôi luôn khát khao nâng tầm ngành công nghiệp Việt Nam bằng những giải pháp công nghệ và tự động hóa tiên tiến nhất.",
  contactZalo: "https://zalo.me/0941214544",
  contactFacebook: "https://facebook.com/NgoQuocHuy",
  contactPhone: "0941214544",
};

async function seed() {
  console.log("🌱 Seeding default home page content...");
  console.log("   Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.from("site_content").upsert(
    {
      id: "home_page",
      content: defaultContent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  ).select();

  if (error) {
    console.error("❌ Error seeding content:", error.message);
    process.exit(1);
  }

  console.log("✅ Default content seeded successfully!");
  console.log("   Row ID:", data?.[0]?.id);
}

seed();
