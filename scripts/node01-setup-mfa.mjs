import { authenticator } from "otplib";
import QRCode from "qrcode";
import * as readline from "readline";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

// Load .env.local for Supabase credentials
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.error("â Œ LÃ¡Â»â€¢i: KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y file .env.local trong thÃ†Â° mÃ¡Â»Â¥c gÃ¡Â»â€˜c.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("â Œ LÃ¡Â»â€¢i: ThiÃ¡ÂºÂ¿u biÃ¡ÂºÂ¿n mÃƒÂ´i trÃ†Â°Ã¡Â»Âng NEXT_PUBLIC_SUPABASE_URL hoÃ¡ÂºÂ·c SUPABASE_SERVICE_ROLE_KEY trong .env.local.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const KEY = "_secret.admincenter_credentials";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function setupMfa() {
  console.log("=========================================================");
  console.log("   CÃƒâ‚¬I Ã„ÂÃ¡ÂºÂ¶T XÃƒÂC THÃ¡Â»Â°C 2 BÃ†Â¯Ã¡Â»Å¡C (MFA TOTP) CHO NODE-01");
  console.log("=========================================================\n");

  // 1. TÃ¡ÂºÂ£i dÃ¡Â»Â¯ liÃ¡Â»â€¡u credentials tÃ¡Â»Â« Supabase
  const { data, error } = await supabaseAdmin.from("cms_settings").select("setting_value").eq("key_name", KEY).maybeSingle();
  
  if (error || !data) {
    console.error("â Œ KhÃƒÂ´ng thÃ¡Â»Æ’ tÃƒÂ¬m thÃ¡ÂºÂ¥y tÃƒÂ i khoÃ¡ÂºÂ£n AdminCenter trong Supabase. Vui lÃƒÂ²ng Ã„â€˜Ã„Æ’ng nhÃ¡ÂºÂ­p vÃƒÂ  Ã„â€˜Ã¡Â»â€¢i mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u Ã„â€˜Ã¡Â»Æ’ khÃ¡Â»Å¸i tÃ¡ÂºÂ¡o database lÃ¡ÂºÂ§n Ã„â€˜Ã¡ÂºÂ§u.");
    process.exit(1);
  }

  const stored = data.setting_value;
  
  // 2. TÃ¡ÂºÂ¡o mÃƒÂ£ Secret mÃ¡Â»â€ºi
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri("SuperAdmin", "AdminCenter Node-01", secret);

  // 3. HiÃ¡Â»Æ’n thÃ¡Â»â€¹ mÃƒÂ£ QR lÃƒÂªn Terminal
  console.log("â„¹ MÃ¡Â»Å¸ Ã¡Â»Â©ng dÃ¡Â»Â¥ng Google Authenticator / Authy trÃƒÂªn Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i vÃƒÂ  quÃƒÂ©t mÃƒÂ£ bÃƒÂªn dÃ†Â°Ã¡Â»â€ºi:");
  
  QRCode.toString(otpauthUrl, { type: 'terminal', small: true }, function (err, url) {
    console.log(url);
    console.log(`\n(NÃ¡ÂºÂ¿u khÃƒÂ´ng quÃƒÂ©t Ã„â€˜Ã†Â°Ã¡Â»Â£c mÃƒÂ£ QR, bÃ¡ÂºÂ¡n cÃƒÂ³ thÃ¡Â»Æ’ nhÃ¡ÂºÂ­p thÃ¡Â»Â§ cÃƒÂ´ng mÃƒÂ£ bÃƒÂ­ mÃ¡ÂºÂ­t nÃƒÂ y: \x1b[33m${secret}\x1b[0m)\n`);
    
    // 4. YÃƒÂªu cÃ¡ÂºÂ§u ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng nhÃ¡ÂºÂ­p mÃƒÂ£ xÃƒÂ¡c nhÃ¡ÂºÂ­n Ã„â€˜Ã¡Â»Æ’ lÃ†Â°u
    rl.question("ðŸ”‘ HÃƒÂ£y nhÃ¡ÂºÂ­p mÃƒÂ£ 6 sÃ¡Â»â€˜ hiÃ¡Â»â€¡n trÃƒÂªn Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i Ä‘á»ƒ XÃC NHáº¬N: ", async (token) => {
      const isValid = authenticator.verify({ token: token.trim(), secret });
      
      if (!isValid) {
        console.error("â Œ LÃ¡Â»â€¢i: MÃƒÂ£ xÃƒÂ¡c nháº­n khÃƒÂ´ng chÃƒÂ­nh xÃƒÂ¡c. QuÃƒÂ¡ trÃƒÂ¬nh cÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t bÃ¡Â»â€¹ hÃ¡Â»Â§y!");
        process.exit(1);
      }

      // 5. LÃ†Â°u vÃƒÂ o Supabase
      const { error: saveError } = await supabaseAdmin.from("cms_settings").upsert({
        key_name: KEY,
        setting_value: {
          ...stored,
          mfaSecret: secret,
          mfaEnabled: true,
          updatedAt: new Date().toISOString()
        }
      });

      if (saveError) {
        console.error("â Œ LÃ¡Â»â€¢i khi lÃ†Â°u vÃƒÂ o Supabase:", saveError.message);
      } else {
        console.log("âœ” XÃƒÂC THÃ¡Â»Â°C 2 BÃ†Â¯Ã¡Â»Å¡C (MFA) Ã„ÂÃƒÆ’ Ã„ÂÃ†Â¯Ã¡Â»Â¢C BÃ¡ÂºÂ¬T THÃƒâ‚¬NH CÃƒâ€ NG!");
        console.log("Tá»« nay, form Ä‘Äƒng nháº­p sáº½ yÃªu cáº§u báº¡n nháº­p mÃ£ 6 sá»‘ tá»« Ä‘iá»‡n thoáº¡i.");
      }
      
      process.exit(0);
    });
  });
}

setupMfa();
