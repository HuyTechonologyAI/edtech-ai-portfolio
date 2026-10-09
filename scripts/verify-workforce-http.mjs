import assert from "node:assert/strict";

const siteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:3005";

console.log("==================================================");
console.log("HTTP & ASSET AUDIT: AI WORKFORCE-63 DIRECTORY");
console.log(`Target: ${siteUrl}`);
console.log("==================================================");

// 1. Fetch homepage
console.log("\n[1/3] Fetching homepage HTML...");
const homeRes = await fetch(`${siteUrl}/`);
assert.equal(homeRes.status, 200, `Homepage returned ${homeRes.status}`);
const html = await homeRes.text();
assert.ok(html.length > 50000, `Homepage HTML size seems too small: ${html.length}`);
console.log(`✔ Homepage loaded successfully (${html.length} bytes, HTTP 200).`);

// 2. Verify section contents in client bundle / prerendered markup
console.log("\n[2/3] Verifying #ai-workforce section in prerender / client scripts...");
// Check for key landmarks
assert.ok(
  html.includes("ai-workforce") || html.includes("ĐỘI NGŨ 63 NHÂN SỰ AI"),
  "Missing ai-workforce or section title in page payload"
);
assert.ok(
  html.includes("AI DIGITAL WORKFORCE") || html.includes("AI Digital Workforce"),
  "Missing AI Digital Workforce badge"
);
console.log("✔ Section markers and titles confirmed in page output.");

// 3. Verify all 63 avatar images on production endpoint
console.log("\n[3/3] Verifying all 63 avatar images (/assets/workforce/emp_XX.jpg)...");
let successCount = 0;
let errors = [];

for (let i = 1; i <= 63; i++) {
  const empId = "emp_" + String(i).padStart(2, "0");
  const avatarPath = `/assets/workforce/${empId}.jpg`;
  try {
    const res = await fetch(`${siteUrl}${avatarPath}`);
    if (res.status !== 200) {
      errors.push(`${empId}: HTTP ${res.status}`);
      continue;
    }
    const contentType = res.headers.get("content-type") || "";
    const contentLength = parseInt(res.headers.get("content-length") || "0", 10);
    if (!contentType.includes("image")) {
      errors.push(`${empId}: Invalid Content-Type ${contentType}`);
      continue;
    }
    if (contentLength < 100000) {
      errors.push(`${empId}: Image too small (${contentLength} bytes)`);
      continue;
    }
    successCount++;
  } catch (err) {
    errors.push(`${empId}: Fetch failed - ${err.message}`);
  }
}

console.log(`✔ Verified ${successCount} / 63 avatar image assets on ${siteUrl}.`);
assert.equal(errors.length, 0, `Asset errors encountered: ${JSON.stringify(errors)}`);
assert.equal(successCount, 63, `Expected 63 successful assets, got ${successCount}`);

console.log("\n==================================================");
console.log("✔ ALL 63/63 WORKFORCE AVATARS & HTTP CHECKS PASSED!");
console.log("==================================================");
