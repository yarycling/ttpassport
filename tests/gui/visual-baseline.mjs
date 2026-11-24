import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { firefox } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const baseURL = process.env.TTP_BASE_URL || 'http://127.0.0.1:3002';
const base = new URL(baseURL);
const loopbackHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
if (!loopbackHosts.has(base.hostname)) throw new Error('Visual baseline target must be loopback-only.');

const cases = [
  { route: '/', slug: 'home' },
  { route: '/design-preview/backoffice/review', slug: 'backoffice-review' }
];
const widths = [1440, 375];
const baselineDir = path.join(repoRoot, 'docs/evidence/TTP-2A/screenshots');
const evidenceDir = path.join(repoRoot, 'docs/evidence/TTP-3E/screenshots/visual-baseline');
await mkdir(evidenceDir, { recursive: true });
const failures = [];
const maxDifferentPixelRatio = 0.01;
const browser = await firefox.launch({ headless: true });

try {
  for (const { route, slug } of cases) {
    for (const width of widths) {
      const name = `${slug}-${width}.png`;
      const baselinePath = path.join(baselineDir, name);
      const screenshotPath = path.join(evidenceDir, name);
      const expected = PNG.sync.read(await readFile(baselinePath));
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      try {
        await page.goto(new URL(route, base).toString(), { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready.then(() => true));
        const heading = page.locator('h1').first();
        if (!(await heading.isVisible()) || !(await heading.innerText()).trim()) {
          throw new Error(`${name}: primary heading is missing or not visible.`);
        }
        await page.screenshot({ path: screenshotPath });
        const actual = PNG.sync.read(await readFile(screenshotPath));
        if (expected.width !== width || actual.width !== width || expected.height !== 900 || actual.height !== 900) {
          throw new Error(`${name}: expected matching ${width}x900 viewport captures; found ${expected.width}x${expected.height} and ${actual.width}x${actual.height}.`);
        }
        const differentPixels = pixelmatch(expected.data, actual.data, null, width, 900, { threshold: 0.1, includeAA: true });
        const totalPixels = width * 900;
        const ratio = differentPixels / totalPixels;
        const result = ratio <= maxDifferentPixelRatio ? 'PASS' : 'FAIL';
        console.log(`${result} ${name}: ${differentPixels}/${totalPixels} differing pixels (${(ratio * 100).toFixed(4)}%, limit ${(maxDifferentPixelRatio * 100).toFixed(2)}% for cross-version font rasterization); primary heading visible; current capture: ${path.relative(repoRoot, screenshotPath)}`);
        if (ratio > maxDifferentPixelRatio) failures.push(name);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (failures.length) throw new Error(`Visual baseline mismatches: ${failures.join(', ')}`);
