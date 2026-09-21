const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000/v2';
const NOT_FOUND_URL = 'http://localhost:3000/non-existent-page-staging-test';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'screenshots-v2-staging');
const MONOREPO_DOCS_DIR = path.resolve('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\huy-ai-center\\docs\\ui-ux\\screenshots-v2-staging');
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

async function run() {
  console.log('--- Starting Staging Validation & Screenshot Capture ---');
  console.log('Browser:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const consoleErrors = [];
  const networkFailures = [];

  try {
    const page = await browser.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', (req) => {
      networkFailures.push({
        url: req.url(),
        failure: req.failure() ? req.failure().errorText : 'Unknown',
      });
    });

    // 1. 01-staging-home-1440.png
    console.log('Capturing 01-staging-home-1440.png...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-staging-home-1440.png'),
      fullPage: true,
    });
    copyToAll('01-staging-home-1440.png');

    // 2. 02-staging-home-1280.png
    console.log('Capturing 02-staging-home-1280.png...');
    await page.setViewport({ width: 1280, height: 800 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-staging-home-1280.png'),
      fullPage: true,
    });
    copyToAll('02-staging-home-1280.png');

    // 3. 03-staging-tablet-768.png
    console.log('Capturing 03-staging-tablet-768.png...');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-staging-tablet-768.png'),
      fullPage: true,
    });
    copyToAll('03-staging-tablet-768.png');

    // 4. 04-staging-mobile-390.png
    console.log('Capturing 04-staging-mobile-390.png...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04-staging-mobile-390.png'),
      fullPage: true,
    });
    copyToAll('04-staging-mobile-390.png');

    // 5. 05-staging-hero.png
    console.log('Capturing 05-staging-hero.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const heroElem = await page.$('#hero');
    if (heroElem) {
      await heroElem.screenshot({
        path: path.join(OUTPUT_DIR, '05-staging-hero.png'),
      });
      copyToAll('05-staging-hero.png');
    }

    // 6. 06-staging-ecosystem-desktop.png
    console.log('Capturing 06-staging-ecosystem-desktop.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const ecoElem = await page.$('#ecosystem');
    if (ecoElem) {
      await ecoElem.screenshot({
        path: path.join(OUTPUT_DIR, '06-staging-ecosystem-desktop.png'),
      });
      copyToAll('06-staging-ecosystem-desktop.png');
    }

    // 7. 07-staging-ecosystem-mobile.png
    console.log('Capturing 07-staging-ecosystem-mobile.png...');
    await page.setViewport({ width: 390, height: 844 });
    const ecoMobileElem = await page.$('#ecosystem');
    if (ecoMobileElem) {
      await ecoMobileElem.screenshot({
        path: path.join(OUTPUT_DIR, '07-staging-ecosystem-mobile.png'),
      });
      copyToAll('07-staging-ecosystem-mobile.png');
    }

    // 8. 08-staging-ai-agency.png
    console.log('Capturing 08-staging-ai-agency.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const agencyElem = await page.$('#ai-agency');
    if (agencyElem) {
      await agencyElem.screenshot({
        path: path.join(OUTPUT_DIR, '08-staging-ai-agency.png'),
      });
      copyToAll('08-staging-ai-agency.png');
    }

    // 9. 09-staging-security.png
    console.log('Capturing 09-staging-security.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const secElem = await page.$('#security');
    if (secElem) {
      await secElem.screenshot({
        path: path.join(OUTPUT_DIR, '09-staging-security.png'),
      });
      copyToAll('09-staging-security.png');
    }

    // 10. 10-staging-founder.png
    console.log('Capturing 10-staging-founder.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const founderElem = await page.$('#leadership');
    if (founderElem) {
      await founderElem.screenshot({
        path: path.join(OUTPUT_DIR, '10-staging-founder.png'),
      });
      copyToAll('10-staging-founder.png');
    }

    // 11. 11-staging-footer.png
    console.log('Capturing 11-staging-footer.png...');
    await page.setViewport({ width: 1440, height: 900 });
    const footerElem = await page.$('footer');
    if (footerElem) {
      await footerElem.screenshot({
        path: path.join(OUTPUT_DIR, '11-staging-footer.png'),
      });
      copyToAll('11-staging-footer.png');
    }

    // 12. 12-staging-mobile-menu.png
    console.log('Capturing 12-staging-mobile-menu.png...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    const hamburgerBtn = await page.$('button[aria-label="Toggle navigation menu"]');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '12-staging-mobile-menu.png'),
      });
      copyToAll('12-staging-mobile-menu.png');
    }

    // 13. 13-staging-contact.png
    console.log('Capturing 13-staging-contact.png...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    const contactElem = await page.$('#contact');
    if (contactElem) {
      await contactElem.screenshot({
        path: path.join(OUTPUT_DIR, '13-staging-contact.png'),
      });
      copyToAll('13-staging-contact.png');
    }

    // 14. 14-staging-404.png
    console.log('Capturing 14-staging-404.png...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(NOT_FOUND_URL, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '14-staging-404.png'),
    });
    copyToAll('14-staging-404.png');

    // Link validation audit
    console.log('--- Auditing Links on /v2 ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map((a) => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href'),
      }));
    });

    console.log(`Found ${links.length} total links on /v2.`);
    const internalAnchors = links.filter((l) => l.href && l.href.startsWith('#'));
    const externalLinks = links.filter((l) => l.href && (l.href.startsWith('http') || l.href.startsWith('https')));
    const internalRoutes = links.filter((l) => l.href && l.href.startsWith('/') && !l.href.startsWith('//'));

    console.log(`- Internal Anchors: ${internalAnchors.length}`);
    console.log(`- External Links: ${externalLinks.length}`);
    console.log(`- Internal Routes: ${internalRoutes.length}`);

    // Check Viewport Overflow Matrix
    console.log('--- Testing Responsive Matrix ---');
    const viewports = [
      { w: 390, h: 844, name: '390x844 (Mobile)' },
      { w: 430, h: 932, name: '430x932 (Mobile Large)' },
      { w: 768, h: 1024, name: '768x1024 (Tablet)' },
      { w: 1024, h: 768, name: '1024x768 (Tablet Landscape)' },
      { w: 1280, h: 800, name: '1280x800 (Laptop)' },
      { w: 1366, h: 768, name: '1366x768 (Desktop Standard)' },
      { w: 1440, h: 900, name: '1440x900 (Desktop Large)' },
      { w: 1920, h: 1080, name: '1920x1080 (Full HD)' },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await new Promise((r) => setTimeout(r, 400));
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      console.log(`Viewport ${vp.name}: Horizontal Overflow = ${hasHorizontalScroll}`);
    }

    console.log('Console Errors:', consoleErrors.length);
    console.log('Network Failures:', networkFailures.length);
    console.log('--- Staging Validation Run Complete ---');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error during execution:', err);
  process.exit(1);
});
