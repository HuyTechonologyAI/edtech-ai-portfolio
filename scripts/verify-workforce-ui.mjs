import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";

const executablePath =
  process.env.PUBLIC_BROWSER_EXECUTABLE ||
  "/home/huyadmin/.cache/puppeteer/chrome-headless-shell/linux-154.0.8037.57/chrome-headless-shell-linux64/chrome-headless-shell";

const siteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:3005";

console.log("==================================================");
console.log("PUPPETEER E2E TEST: AI WORKFORCE-63 DIRECTORY UI");
console.log(`Target: ${siteUrl}`);
console.log("==================================================");

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("\n[1/5] Navigating to homepage...");
  await page.goto(`${siteUrl}/`, { waitUntil: "networkidle2" });

  console.log("[2/5] Verifying #ai-workforce section presence & title...");
  const sectionTitle = await page.$eval(
    "#ai-workforce h2",
    (el) => el.textContent?.trim()
  );
  assert.equal(sectionTitle, "ĐỘI NGŨ 63 NHÂN SỰ AI");
  console.log(`✔ Found section with title: "${sectionTitle}"`);

  console.log("[3/5] Verifying 63 AI Employee Cards & Avatars...");
  const cardsData = await page.$$eval(
    '#ai-workforce img[src*="/assets/workforce/emp_"]',
    (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute("src"),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }))
  );
  assert.equal(cardsData.length, 63, `Expected 63 cards, got ${cardsData.length}`);
  const brokenImages = cardsData.filter((img) => img.naturalWidth === 0);
  assert.equal(
    brokenImages.length,
    0,
    `Found ${brokenImages.length} broken images: ${JSON.stringify(brokenImages)}`
  );
  console.log(`✔ All 63 employee cards rendered with valid images (0 broken).`);

  console.log("[4/5] Testing Search functionality (searching 'Công Thành')...");
  const searchInput = await page.$('#ai-workforce input[type="text"]');
  await searchInput.type("Công Thành");
  await new Promise((r) => setTimeout(r, 300));

  const filteredCount = await page.$$eval(
    '#ai-workforce img[src*="/assets/workforce/emp_"]',
    (imgs) => imgs.length
  );
  assert.equal(filteredCount, 1, `Expected 1 card for 'Công Thành', got ${filteredCount}`);
  const congThanhCard = await page.$eval(
    '#ai-workforce img[src*="/assets/workforce/emp_"]',
    (img) => img.getAttribute("src")
  );
  assert.equal(congThanhCard, "/assets/workforce/emp_28.jpg");
  console.log(`✔ Search for 'Công Thành' correctly isolated emp_28.jpg.`);

  console.log("[5/5] Testing Agent Profile Modal Drawer...");
  await page.click('#ai-workforce img[src*="/assets/workforce/emp_28.jpg"]');
  await new Promise((r) => setTimeout(r, 400));

  const modalTitle = await page.$eval(
    '#modal-agent-name',
    (el) => el.textContent?.trim()
  );
  assert.equal(modalTitle, "Công Thành");
  console.log(`✔ Modal successfully opened for: "${modalTitle}"`);

  // Press Escape to close modal
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));
  const modalOpen = await page.$('#modal-agent-name');
  assert.equal(modalOpen, null, "Modal should be closed after Escape");
  console.log(`✔ Modal successfully closed on Escape key.`);

  console.log("\n==================================================");
  console.log("✔ ALL 5 PUPPETEER E2E WORKFORCE TESTS PASSED!");
  console.log("==================================================");
} finally {
  await browser.close();
}
