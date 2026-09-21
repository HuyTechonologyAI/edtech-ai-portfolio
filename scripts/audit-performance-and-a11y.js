const fs = require('fs');
const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Connect CDP
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  await page.goto('http://localhost:3000/v2', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  // Extract Web Vitals & Accessibility elements
  const metrics = await client.send('Performance.getMetrics');
  const metricsMap = {};
  metrics.metrics.forEach((m) => {
    metricsMap[m.name] = m.value;
  });

  const audit = await page.evaluate(() => {
    // Check images without alt
    const images = Array.from(document.querySelectorAll('img'));
    const missingAlt = images.filter((img) => !img.hasAttribute('alt') || img.getAttribute('alt') === '');

    // Check headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
      tag: h.tagName,
      text: h.innerText.trim().slice(0, 40),
    }));

    // Check buttons / interactive elements without accessible name
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const missingNames = buttons.filter((b) => {
      const text = b.innerText.trim();
      const ariaLabel = b.getAttribute('aria-label');
      const ariaLabelledby = b.getAttribute('aria-labelledby');
      const title = b.getAttribute('title');
      return !text && !ariaLabel && !ariaLabelledby && !title;
    });

    // Check colors / contrast indicators
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;

    // Check performance timing
    const navEntry = performance.getEntriesByType('navigation')[0];
    const domContentLoaded = navEntry ? navEntry.domContentLoadedEventEnd - navEntry.startTime : 0;
    const loadComplete = navEntry ? navEntry.loadEventEnd - navEntry.startTime : 0;

    return {
      imagesTotal: images.length,
      imagesMissingAlt: missingAlt.length,
      buttonsTotal: buttons.length,
      interactiveMissingNames: missingNames.length,
      headingsCount: headings.length,
      h1Count: headings.filter((h) => h.tag === 'H1').length,
      h2Count: headings.filter((h) => h.tag === 'H2').length,
      bodyBg,
      domContentLoaded: Math.round(domContentLoaded),
      loadComplete: Math.round(loadComplete),
    };
  });

  console.log('--- PERFORMANCE & ACCESSIBILITY AUDIT REPORT ---');
  console.log('JSHeapUsedSize (MB):', (metricsMap['JSHeapUsedSize'] / 1024 / 1024).toFixed(2));
  console.log('DOM Nodes:', metricsMap['Nodes']);
  console.log('Layout Count:', metricsMap['LayoutCount']);
  console.log('DOMContentLoaded (ms):', audit.domContentLoaded);
  console.log('Load Complete (ms):', audit.loadComplete);
  console.log('Images Total:', audit.imagesTotal);
  console.log('Images Missing Alt:', audit.imagesMissingAlt);
  console.log('Interactive Elements Total:', audit.buttonsTotal);
  console.log('Interactive Elements Missing Accessible Name:', audit.interactiveMissingNames);
  console.log('Heading Count (H1/H2):', `${audit.h1Count} H1, ${audit.h2Count} H2`);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
