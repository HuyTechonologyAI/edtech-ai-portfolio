const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'https://www.huycncdsai.io.vn';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'screenshots-v2-production');
const MONOREPO_DOCS_DIR = path.resolve('C:\\Users\\Admin\\.gemini\antigravity\\scratch\\huy-ai-center\\docs\\ui-ux\\screenshots-v2-production');
const ARTIFACT_DIR = path.resolve('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\27164b1a-1ff4-4706-8e16-3b728bfdc6bf');

[OUTPUT_DIR, MONOREPO_DOCS_DIR, ARTIFACT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function copyToAll(filename) {
  const src = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(MONOREPO_DOCS_DIR, filename));
    fs.copyFileSync(src, path.join(ARTIFACT_DIR, filename));
  }
}

async function runProductionSmoke() {
  console.log('--- Phase 06J-UX-D: Production Smoke & Visual Verification ---');
  console.log('Target URL:', BASE_URL);
  console.log('Browser:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const consoleErrors = [];

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Desktop 1440
    console.log('1. Capturing Desktop (1440x900)...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    const res1 = await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    console.log(`   Root response status: ${res1.status()}`);
    const f1 = '01-prod-home-1440.png';
    await page.screenshot({ path: path.join(OUTPUT_DIR, f1), fullPage: true });
    copyToAll(f1);

    // 2. Laptop 1280
    console.log('2. Capturing Laptop (1280x800)...');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    const f2 = '02-prod-home-1280.png';
    await page.screenshot({ path: path.join(OUTPUT_DIR, f2), fullPage: true });
    copyToAll(f2);

    // 3. Tablet 768
    console.log('3. Capturing Tablet (768x1024)...');
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    const f3 = '03-prod-tablet-768.png';
    await page.screenshot({ path: path.join(OUTPUT_DIR, f3), fullPage: true });
    copyToAll(f3);

    // 4. Mobile 390
    console.log('4. Capturing Mobile (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    const f4 = '04-prod-mobile-390.png';
    await page.screenshot({ path: path.join(OUTPUT_DIR, f4), fullPage: true });
    copyToAll(f4);

    // 5. Hero Desktop
    console.log('5. Capturing Hero Section...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
    const hero = await page.$('section');
    if (hero) {
      const f5 = '05-prod-hero.png';
      await hero.screenshot({ path: path.join(OUTPUT_DIR, f5) });
      copyToAll(f5);
    }

    // 6. Ecosystem Map
    console.log('6. Capturing Ecosystem Map...');
    const ecosystemEl = await page.$('#ecosystem');
    if (ecosystemEl) {
      await ecosystemEl.scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      const f6 = '06-prod-ecosystem-desktop.png';
      await ecosystemEl.screenshot({ path: path.join(OUTPUT_DIR, f6) });
      copyToAll(f6);
    }

    // 7. Security Section
    console.log('7. Capturing Security Section...');
    const secEl = await page.$('#security');
    if (secEl) {
      await secEl.scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      const f7 = '07-prod-security.png';
      await secEl.screenshot({ path: path.join(OUTPUT_DIR, f7) });
      copyToAll(f7);
    }

    // 8. Founder Section
    console.log('8. Capturing Founder Section...');
    const founderEl = await page.$('#leadership');
    if (founderEl) {
      await founderEl.scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      const f8 = '08-prod-founder.png';
      await founderEl.screenshot({ path: path.join(OUTPUT_DIR, f8) });
      copyToAll(f8);
    }

    // 9. Footer Section
    console.log('9. Capturing Footer Section...');
    const footerEl = await page.$('footer');
    if (footerEl) {
      await footerEl.scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      const fFooter = '10-prod-footer.png';
      await footerEl.screenshot({ path: path.join(OUTPUT_DIR, fFooter) });
      copyToAll(fFooter);
    }

    // 10. Legacy Archive Home V1
    console.log('10. Checking Archive /archive/home-v1...');
    const archiveRes = await page.goto(`${BASE_URL}/archive/home-v1`, { waitUntil: 'networkidle2', timeout: 45000 });
    console.log(`   Archive status: ${archiveRes.status()}`);
    const f9 = '09-prod-archive-v1.png';
    await page.screenshot({ path: path.join(OUTPUT_DIR, f9), fullPage: true });
    copyToAll(f9);

    // 11. Check /v2 redirect
    console.log('11. Checking /v2 redirect...');
    const v2Res = await page.goto(`${BASE_URL}/v2`, { waitUntil: 'networkidle2', timeout: 45000 });
    console.log(`   Final URL after accessing /v2: ${page.url()}`);
    console.log(`   /v2 status: ${v2Res.status()}`);

    console.log('--- Production Verification Complete ---');
    console.log(`Console Errors encountered: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  } finally {
    await browser.close();
  }
}

runProductionSmoke().catch((err) => {
  console.error('Production smoke error:', err);
  process.exit(1);
});
