import { authenticator } from "otplib";
import QRCode from "qrcode";
import * as readline from "readline";
import { createClient } from "@supabase/supabase-js";
import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

// Load .env.local for Supabase credentials manually
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^['"](.*)['"]$/, '$1');
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const KEY = "_secret.admincenter_credentials";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function setupMfa() {
  console.log("=========================================================");
  console.log("   CÀI ĐẶT XÁC THỰC 2 BƯỚC (MFA TOTP) CHO NODE-01");
  console.log("=========================================================\n");

  let stored = null;

  // 1. Try Supabase
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("cms_settings").select("setting_value").eq("key_name", KEY).maybeSingle();
    if (!error && data?.setting_value) {
      stored = data.setting_value;
    }
  }

  // 2. Fallback to Local file
  const FILE = resolve(process.cwd(), "src/data/admincenter-auth.json");
  if (!stored && existsSync(FILE)) {
    try {
      const j = JSON.parse(readFileSync(FILE, "utf8"));
      if (!j.isInitialDefault && j.record) {
        stored = { 
          username: j.username, record: j.record, isInitialDefault: false, updatedAt: j.updatedAt,
          mfaSecret: j.mfaSecret, mfaEnabled: j.mfaEnabled, lockedUntil: j.lockedUntil
        };
      }
    } catch(e) {}
  }

  if (!stored) {
    console.error("❌ Không thể tìm thấy tài khoản trong Supabase HOẶC File cục bộ. Đăng nhập Web và Đổi mật khẩu trước!");
    process.exit(1);
  }
  
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri("SuperAdmin", "AdminCenter Node-01", secret);

  console.log("ℹ Mở ứng dụng Google Authenticator / Authy trên điện thoại và quét mã bên dưới:");
  
  QRCode.toString(otpauthUrl, { type: 'terminal', small: true }, function (err, url) {
    console.log(url);
    console.log(`\n(Nếu không quét được mã QR, hãy nhập thủ công mã bí mật này: \x1b[33m${secret}\x1b[0m)\n`);
    
    rl.question("🔑 Hãy nhập mã 6 số hiện trên điện thoại để XÁC NHẬN: ", async (token) => {
      const isValid = authenticator.verify({ token: token.trim(), secret });
      
      if (!isValid) {
        console.error("❌ Lỗi: Mã xác nhận không chính xác. Quá trình cài đặt bị hủy!");
        process.exit(1);
      }

      stored.mfaSecret = secret;
      stored.mfaEnabled = true;
      stored.updatedAt = new Date().toISOString();

      let saved = false;

      // Try Save to Supabase
      if (supabaseAdmin) {
        const { error: saveError } = await supabaseAdmin.from("cms_settings").upsert({
          key_name: KEY, setting_value: stored, updated_at: new Date().toISOString()
        });
        if (!saveError) saved = true;
      }

      // Fallback save to File
      try {
        writeFileSync(FILE, JSON.stringify(stored, null, 2));
        saved = true;
      } catch(e){}

      if (!saved) {
        console.error("❌ Lỗi khi lưu MFA vào hệ thống!");
      } else {
        console.log("✔ XÁC THỰC 2 BƯỚC (MFA) ĐÃ ĐƯỢC BẬT THÀNH CÔNG!");
      }
      
      process.exit(0);
    });
  });
}

setupMfa();
