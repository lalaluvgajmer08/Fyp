import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const out = process.argv[3] || 'shot.png';
const width = Number(process.argv[4]) || 1650;
const height = Number(process.argv[5]) || 840;
const full = process.argv[6] === 'full';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: full });
await browser.close();

if (errors.length) {
  console.log('CONSOLE ERRORS:');
  errors.forEach((e) => console.log(' -', e));
} else {
  console.log('No console errors');
}
