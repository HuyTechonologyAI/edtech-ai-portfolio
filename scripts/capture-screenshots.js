const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000/v2';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'screenshots-v2');

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

    // 1. 01-home-desktop-1440.png
    console.log('Capturing 01-home-desktop-1440.png...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000)); // wait for animations & fonts
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-home-desktop-1440.png'),
      fullPage: true,
    });

    // 2. 02-home-laptop-1280.png
    console.log('Capturing 02-home-laptop-1280.png...');
    await page.setViewport({ width: 1280, height: 800 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-home-laptop-1280.png'),
      fullPage: true,
    });

    // 3. 03-home-tablet-768.png
    console.log('Capturing 03-home-tablet-768.png...');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-home-tablet-768.png'),
      fullPage: true,
    });

    // 4. 04-home-mobile-390.png
    console.log('Capturing 04-home-mobile-390.png...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04-home-mobile-390.png'),
      fullPage: true,
    });

    // Back to Desktop for section screenshots
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 1000));

    // 5. 05-hero-desktop.png
    console.log('Capturing 05-hero-desktop.png...');
    const heroEl = await page.$('#hero');
    if (heroEl) {
      await heroEl.screenshot({ path: path.join(OUTPUT_DIR, '05-hero-desktop.png') });
    } else {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05-hero-desktop.png') });
    }

    // 6. 06-ecosystem-desktop.png
    console.log('Capturing 06-ecosystem-desktop.png...');
    const ecoEl = await page.$('#ecosystem');
    if (ecoEl) {
      await ecoEl.screenshot({ path: path.join(OUTPUT_DIR, '06-ecosystem-desktop.png') });
    }

    // 7. 07-ecosystem-mobile.png
    console.log('Capturing 07-ecosystem-mobile.png...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 1000));
    const ecoMobileEl = await page.$('#ecosystem');
    if (ecoMobileEl) {
      await ecoMobileEl.screenshot({ path: path.join(OUTPUT_DIR, '07-ecosystem-mobile.png') });
    }

    // Back to 1440 for rest of sections
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 1000));

    // 8. 08-ai-agency-section.png
    console.log('Capturing 08-ai-agency-section.png...');
    const agencyEl = await page.$('#ai-agency');
    if (agencyEl) {
      await agencyEl.screenshot({ path: path.join(OUTPUT_DIR, '08-ai-agency-section.png') });
    }

    // 9. 09-business-units.png
    console.log('Capturing 09-business-units.png...');
    // Ecosystem map or business units cards inside #ecosystem
    if (ecoEl) {
      await page.evaluate(() => {
        const el = document.getElementById('ecosystem');
        if (el) el.scrollIntoView();
      });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '09-business-units.png') });
    }

    // 10. 10-solutions-products.png
    console.log('Capturing 10-solutions-products.png...');
    const solEl = await page.$('#solutions');
    if (solEl) {
      await solEl.screenshot({ path: path.join(OUTPUT_DIR, '10-solutions-products.png') });
    }

    // 11. 11-security-section.png
    console.log('Capturing 11-security-section.png...');
    const secEl = await page.evaluateHandle(() => {
      const headings = Array.from(document.querySelectorAll('h2'));
      const secH2 = headings.find(h => h.textContent.includes('An Ninh & Trách Nhiệm'));
      return secH2 ? secH2.closest('section') : null;
    });
    if (secEl && secEl.asElement()) {
      await secEl.asElement().screenshot({ path: path.join(OUTPUT_DIR, '11-security-section.png') });
    }

    // 12. 12-founder-section.png
    console.log('Capturing 12-founder-section.png...');
    const founderEl = await page.$('#leadership');
    if (founderEl) {
      await founderEl.screenshot({ path: path.join(OUTPUT_DIR, '12-founder-section.png') });
    }

    // 13. 13-footer-desktop.png
    console.log('Capturing 13-footer-desktop.png...');
    const footerEl = await page.$('footer');
    if (footerEl) {
      await footerEl.screenshot({ path: path.join(OUTPUT_DIR, '13-footer-desktop.png') });
    }

    // 14. 14-mobile-navigation-open.png
    console.log('Capturing 14-mobile-navigation-open.png...');
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 500));
    const toggleBtn = await page.$('button[aria-label="Toggle navigation menu"]');
    if (toggleBtn) {
      await toggleBtn.click();
      await new Promise((r) => setTimeout(r, 800)); // wait for drawer animation
      await page.screenshot({ path: path.join(OUTPUT_DIR, '14-mobile-navigation-open.png') });
    }

    console.log('All 14 screenshots captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
