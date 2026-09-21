const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000/v2';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'screenshots-v2-final');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    // 1. 01-home-desktop-1440-final.png
    console.log('Capturing 01-home-desktop-1440-final.png...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-home-desktop-1440-final.png'),
      fullPage: true,
    });

    // 2. 02-home-laptop-1280-final.png
    console.log('Capturing 02-home-laptop-1280-final.png...');
    await page.setViewport({ width: 1280, height: 800 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-home-laptop-1280-final.png'),
      fullPage: true,
    });

    // 3. 03-home-tablet-768-final.png
    console.log('Capturing 03-home-tablet-768-final.png...');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-home-tablet-768-final.png'),
      fullPage: true,
    });

    // 4. 04-home-mobile-390-final.png
    console.log('Capturing 04-home-mobile-390-final.png...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04-home-mobile-390-final.png'),
      fullPage: true,
    });

    // Back to Desktop 1440 for section screenshots
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 1000));

    // 5. 05-hero-desktop-final.png
    console.log('Capturing 05-hero-desktop-final.png...');
    const heroEl = await page.$('#hero');
    if (heroEl) {
      await heroEl.screenshot({ path: path.join(OUTPUT_DIR, '05-hero-desktop-final.png') });
    }

    // 6. 06-ecosystem-desktop-final.png
    console.log('Capturing 06-ecosystem-desktop-final.png...');
    const ecoEl = await page.$('#ecosystem');
    if (ecoEl) {
      await page.evaluate(() => {
        const el = document.getElementById('ecosystem');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await ecoEl.screenshot({ path: path.join(OUTPUT_DIR, '06-ecosystem-desktop-final.png') });
    }

    // 7. 07-ecosystem-mobile-final.png
    console.log('Capturing 07-ecosystem-mobile-final.png...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 1000));
    const ecoMobileEl = await page.$('#ecosystem');
    if (ecoMobileEl) {
      await page.evaluate(() => {
        const el = document.getElementById('ecosystem');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await ecoMobileEl.screenshot({ path: path.join(OUTPUT_DIR, '07-ecosystem-mobile-final.png') });
    }

    // Back to 1440 for desktop sections
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 1000));

    // 8. 08-ai-agency-final.png
    console.log('Capturing 08-ai-agency-final.png...');
    const agencyEl = await page.$('#ai-agency');
    if (agencyEl) {
      await page.evaluate(() => {
        const el = document.getElementById('ai-agency');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await agencyEl.screenshot({ path: path.join(OUTPUT_DIR, '08-ai-agency-final.png') });
    }

    // 9. 09-business-units-final.png
    console.log('Capturing 09-business-units-final.png...');
    if (ecoEl) {
      await page.evaluate(() => {
        const el = document.getElementById('ecosystem');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '09-business-units-final.png') });
    }

    // 10. 10-solutions-final.png
    console.log('Capturing 10-solutions-final.png...');
    const solEl = await page.$('#solutions');
    if (solEl) {
      await page.evaluate(() => {
        const el = document.getElementById('solutions');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await solEl.screenshot({ path: path.join(OUTPUT_DIR, '10-solutions-final.png') });
    }

    // 11. 11-security-final.png
    console.log('Capturing 11-security-final.png...');
    const secEl = await page.$('#security');
    if (secEl) {
      await page.evaluate(() => {
        const el = document.getElementById('security');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await secEl.screenshot({ path: path.join(OUTPUT_DIR, '11-security-final.png') });
    }

    // 12. 12-founder-final.png
    console.log('Capturing 12-founder-final.png...');
    const founderEl = await page.$('#leadership');
    if (founderEl) {
      await page.evaluate(() => {
        const el = document.getElementById('leadership');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await founderEl.screenshot({ path: path.join(OUTPUT_DIR, '12-founder-final.png') });
    }

    // 13. 13-footer-final.png
    console.log('Capturing 13-footer-final.png...');
    const footerEl = await page.$('footer');
    if (footerEl) {
      await page.evaluate(() => {
        const el = document.querySelector('footer');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await footerEl.screenshot({ path: path.join(OUTPUT_DIR, '13-footer-final.png') });
    }

    // 14. 14-mobile-menu-final.png
    console.log('Capturing 14-mobile-menu-final.png...');
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 600));
    const toggleBtn = await page.$('button[aria-label="Toggle navigation menu"]');
    if (toggleBtn) {
      await toggleBtn.click();
      await new Promise((r) => setTimeout(r, 800)); // wait for drawer animation
      await page.screenshot({ path: path.join(OUTPUT_DIR, '14-mobile-menu-final.png') });
      // Close drawer again
      await toggleBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    // 15. 15-mobile-bottom-area-final.png (demonstrating absence of legacy bottom dock)
    console.log('Capturing 15-mobile-bottom-area-final.png...');
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight - 900);
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-mobile-bottom-area-final.png') });

    // 16. 16-mobile-founder-final.png
    console.log('Capturing 16-mobile-founder-final.png...');
    await page.setViewport({ width: 390, height: 844 });
    const mobileFounderEl = await page.$('#leadership');
    if (mobileFounderEl) {
      await page.evaluate(() => {
        const el = document.getElementById('leadership');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 600));
      await mobileFounderEl.screenshot({ path: path.join(OUTPUT_DIR, '16-mobile-founder-final.png') });
    }

    console.log('All 16 final polish screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Final screenshot capture failed:', err);
  process.exit(1);
});
