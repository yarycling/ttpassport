import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../..');
const routesPath = path.join(repoRoot, 'app/config/routes.json');
const routeConfig = JSON.parse(await readFile(routesPath, 'utf8'));
const routes = routeConfig.routes;
const acceptedRoutes = JSON.parse(await readFile(path.join(testDir, '../fixtures/accepted-route-map.json'), 'utf8'));
const widths = [1440, 1024, 768, 375];
const evidenceDir = path.join(repoRoot, 'docs/evidence/TTP-3D/screenshots');

function routeSlug(route) {
  return route.path === '/' ? 'home' : route.path.replace(/^\//, '').replaceAll('/', '__');
}

test('approved Wappler route inventory remains 15 routes', () => {
  expect(routes).toHaveLength(15);
  expect(routes).toEqual(acceptedRoutes);
  for (const route of routes) {
    expect(route.routeType).toBe('page');
    expect(route.page).toBeTruthy();
    expect(route.layout).toMatch(/^(main|backoffice)$/);
  }
});

for (const route of routes) {
  for (const width of widths) {
    test(`${route.path} renders at ${width}px`, async ({ browser, baseURL }) => {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      const badResponses = [];

      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', error => pageErrors.push(error.message));
      page.on('requestfailed', request => {
        if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
          failedRequests.push(`${request.method()} ${request.url()}`);
        }
      });
      page.on('response', response => {
        const pathname = new URL(response.url()).pathname;
        const expectedAnonymousSessionDenial = response.status() === 401
          && pathname === '/api/ivp/session_latest'
          && route.path.startsWith('/verification/');
        if (response.status() >= 400 && !expectedAnonymousSessionDenial) badResponses.push(`${response.status()} ${response.url()}`);
      });

      const response = await page.goto(new URL(route.path, baseURL).toString(), { waitUntil: 'networkidle' });
      expect(response?.status(), `HTTP status for ${route.path}`).toBeGreaterThanOrEqual(200);
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();

      const folder = path.join(evidenceDir, String(width));
      await mkdir(folder, { recursive: true });
      await page.screenshot({ path: path.join(folder, `${routeSlug(route)}.png`), fullPage: true });

      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
      }));
      expect(Math.max(dimensions.document, dimensions.body), `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);

      const a11y = await page.evaluate(() => {
        const controls = [...document.querySelectorAll('button, input:not([type="hidden"]), select, textarea')];
        const referencedText = element => (element.getAttribute('aria-labelledby') || '')
          .split(/\s+/)
          .filter(Boolean)
          .map(id => document.getElementById(id)?.textContent?.trim() || '')
          .filter(Boolean)
          .join(' ');
        const accessibleName = element => [
          element.getAttribute('aria-label'),
          referencedText(element),
          element.labels?.length ? [...element.labels].map(label => label.textContent?.trim()).filter(Boolean).join(' ') : '',
          element.getAttribute('title'),
          element.innerText?.trim(),
          element.value?.trim?.(),
          element.querySelector('img[alt]')?.getAttribute('alt'),
          element.querySelector('svg title')?.textContent?.trim()
        ].find(value => value?.trim());
        const unlabeledControls = controls.filter(element => {
          return !accessibleName(element);
        }).map(element => `${element.tagName.toLowerCase()}#${element.id || '(no-id)'}`);
        const unnamedLinks = [...document.querySelectorAll('a')].filter(element => {
          const name = element.getAttribute('aria-label') || element.innerText || element.querySelector('img[alt]')?.getAttribute('alt');
          return !name?.trim();
        }).map(element => element.getAttribute('href') || '(no-href)');
        const imagesWithoutAlt = [...document.querySelectorAll('img:not([alt])')].map(element => element.getAttribute('src') || '(no-src)');
        return { unlabeledControls, unnamedLinks, imagesWithoutAlt };
      });
      expect(a11y.unlabeledControls, 'unlabeled form controls').toEqual([]);
      expect(a11y.unnamedLinks, 'unnamed links').toEqual([]);
      expect(a11y.imagesWithoutAlt, 'images missing alt text').toEqual([]);

      if (width === 1440) {
        await page.keyboard.press('Tab');
        const active = await page.evaluate(() => ({
          isBody: document.activeElement === document.body,
          visible: !!document.activeElement && !!(document.activeElement.getClientRects().length)
        }));
        expect(active.isBody, 'Tab should move focus to an interactive element').toBe(false);
        expect(active.visible, 'keyboard focus should be visible in layout').toBe(true);
      }

      expect(failedRequests, 'failed browser resource requests').toEqual([]);
      expect(badResponses, 'HTTP resource failures').toEqual([]);
      expect(consoleErrors, 'browser console errors').toEqual([]);
      expect(pageErrors, 'uncaught browser exceptions').toEqual([]);
      await page.close();
    });
  }
}

test('public navigation toggles at mobile width and routes to sign-in', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(new URL('/', baseURL).toString(), { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: 'Toggle main navigation' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#publicNavigation')).toHaveClass(/show/);
  await page.locator('nav[aria-label="Main navigation"] a[href="/account/sign-in"]').click();
  await expect(page).toHaveURL(/\/account\/sign-in$/);
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

test('first-time application screen protects draft data behind citizen sign-in', async ({ page, baseURL }) => {
  await page.goto(new URL('/citizen/apply/first-time', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Sign in to start or resume a draft' })).toBeVisible();
  await expect(page.locator('#citizenDraftForm')).toBeHidden();
  const protectedRead = await page.evaluate(async () => (await fetch('/api/citizen/application_current')).status);
  expect(protectedRead).toBe(401);
});

test('back-office review tabs select each preview section', async ({ page, baseURL }) => {
  await page.goto(new URL('/design-preview/backoffice/review', baseURL).toString(), { waitUntil: 'networkidle' });
  for (const label of ['Overview', 'Citizenship', 'Evidence', 'Identity status', 'History']) {
    const tab = page.getByRole('button', { name: label, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-pressed', 'true');
  }
});
