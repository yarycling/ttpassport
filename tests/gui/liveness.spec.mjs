import { mkdir } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const screenshotRoot = path.join(repoRoot, 'docs/evidence/TTP-3H/screenshots');
const widths = [1440, 1024, 768, 375];

async function createAccount(page, baseURL) {
  const email = `codex.liveness.${crypto.randomUUID()}@example.test`;
  const password = `${crypto.randomBytes(24).toString('base64url')}Aa9!`;
  await page.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Identity evidence steps' })).toBeVisible();
  await page.locator('#ivpRegisterUsername').fill(email);
  await page.locator('#ivpRegisterPassword').fill(password);
  await page.locator('#ivpRegisterConfirm').fill(password);
  const registerPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/register');
  await page.getByRole('button', { name: 'Create test account' }).click();
  expect((await registerPromise).status()).toBe(200);
  await page.locator('#ivpLoginUsername').fill(email);
  await page.locator('#ivpLoginPassword').fill(password);
  const loginPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await loginPromise).status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Verification session' })).toBeVisible();
  return { email, password };
}

async function startAndConsent(page) {
  await page.getByRole('button', { name: 'Start a new test session' }).click();
  await expect(page.locator('#ivpConsentForm')).toBeVisible();
  const sessionId = await page.locator('#ivpConsentForm input[name="session_id"]').inputValue();
  await page.locator('#ivpConsentAccepted').check();
  const consentPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/consent');
  await page.getByRole('button', { name: 'Record test consent' }).click();
  expect((await consentPromise).status()).toBe(200);
  await expect(page.locator('#ivp-liveness-heading')).toBeVisible();
  return sessionId;
}

async function readLatest(page) {
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/ivp/session_latest');
    return { status: result.status, body: await result.json() };
  });
  expect(response.status).toBe(200);
  return response.body;
}

async function postResult(page, values) {
  return page.evaluate(async payload => {
    const response = await fetch('/api/ivp/liveness_result', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload)
    });
    return { status: response.status, body: await response.json().catch(() => ({})) };
  }, values);
}

async function checkResponsive(page, folder, heading) {
  await mkdir(folder, { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    const size = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      focusable: Array.from(document.querySelectorAll('button, a, input, video')).every(element => {
        const rect = element.getBoundingClientRect();
        return rect.width === 0 || (rect.left >= -1 && rect.right <= window.innerWidth + 1);
      })
    }));
    expect(size.document, `document overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(size.body, `body overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(size.focusable, `offscreen control at ${width}px`).toBe(true);
    await page.screenshot({ path: path.join(folder, `${width}.png`), fullPage: true });
  }
}

test('CT-3H-003 — pinned candidate initializes from same-origin model and WASM assets', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/assets/ivp/liveness/')) requests.push(request.url());
  });
  await page.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    await import('/assets/ivp/liveness/liveness-runtime.js');
    const factory = window.OpenFaceLivenessCandidate;
    if (!factory || factory.version !== '0.1.0' || factory.commit !== '740b0a885d8a032e1e6c5370bddd8e09d5d0c0fa') {
      throw new Error('Pinned browser candidate was not registered.');
    }
    const client = factory.createOpenFaceLivenessClient({ checks: { face: true, light: false, liveness: true, spoof: true } });
    try {
      const manifest = await client.load({ checks: ['face', 'liveness', 'spoof'] });
      return { modelCount: manifest.models.length, checks: client.getEnabledChecks() };
    } finally {
      await client.dispose();
    }
  });
  expect(result.modelCount).toBeGreaterThanOrEqual(5);
  expect(result.checks).toEqual(expect.arrayContaining(['face', 'liveness', 'spoof']));
  expect(requests.length).toBeGreaterThanOrEqual(10);
  expect(requests.every(url => new URL(url).origin === new URL(baseURL).origin)).toBe(true);
  expect(requests.some(url => url.endsWith('.wasm'))).toBe(true);
  expect(requests.some(url => url.endsWith('.bin'))).toBe(true);
  await expect(page.locator('#ivpLiveness')).toHaveCount(1);
});

test('CT-3H-004 / CT-3H-005 / CT-3H-006 / CT-3H-007 — owned-session persistence, rejection, denial, retry and responsive UI', async ({ browser, page, baseURL }) => {
  test.setTimeout(180_000);
  const pageErrors = [];
  const failedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    if (!request.url().includes('/assets/ivp/liveness/')) failedRequests.push(`${request.method()} ${request.url()}`);
  });
  await createAccount(page, baseURL);
  const sessionId = await startAndConsent(page);
  const fresh = await readLatest(page);
  expect(fresh.session.session_id).toBe(sessionId);
  expect(fresh.liveness_consent.consent_version).toBe('TTP-DEV-CONSENT-1.2-LIVENESS');
  expect(fresh.checks.find(check => check.check_code === 'LIVENESS').status).toBe('NOT_PERFORMED');

  const incomplete = await postResult(page, {
    session_id: sessionId,
    result_status: 'COMPLETED',
    result_json: JSON.stringify({ experimental: true, client_reported: true, server_attested: false }),
    completed_challenge_count: '1',
    total_challenge_count: '2',
    passive_sample_count: '1'
  });
  expect(incomplete.status).toBe(400);
  expect((await readLatest(page)).checks.find(check => check.check_code === 'LIVENESS').status).toBe('NOT_PERFORMED');

  // This test validates the Wappler persistence contract only. It is synthetic,
  // never emitted as evidence that camera movement or passive liveness ran.
  const simulatedCandidateContract = {
    experimental: true,
    provider: 'open-face-liveness',
    provider_version: '0.1.0@740b0a8',
    provider_commit: '740b0a885d8a032e1e6c5370bddd8e09d5d0c0fa',
    client_reported: true,
    server_attested: false,
    outcome: 'COMPLETED',
    identity_assertion: false,
    citizenship_assertion: false,
    movement_challenges: { sequence: ['head_pan_left'], completed: ['head_pan_left'], completed_count: 1 },
    passive_spoof: { sample_count: 1, average_real_score: 0.42, average_paper_score: 0.31, average_screen_score: 0.27 },
    result_note: 'Synthetic persistence test; no camera or model result.'
  };
  const saved = await postResult(page, {
    session_id: sessionId,
    result_status: 'COMPLETED',
    result_json: JSON.stringify(simulatedCandidateContract),
    completed_challenge_count: '1',
    total_challenge_count: '1',
    passive_sample_count: '1'
  });
  expect(saved.status).toBe(200);
  const persisted = await readLatest(page);
  const liveness = persisted.checks.find(check => check.check_code === 'LIVENESS');
  expect(liveness).toMatchObject({
    status: 'COMPLETED',
    provider_name: 'open-face-liveness',
    model_version: '0.1.0@740b0a8'
  });
  const details = typeof liveness.details_json === 'string' ? JSON.parse(liveness.details_json) : liveness.details_json;
  expect(details.server_attested).toBe(false);
  expect(details.result_note).toContain('Synthetic persistence test');
  expect(persisted.session.status).toBe(fresh.session.status);

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await createAccount(otherPage, baseURL);
  const foreign = await postResult(otherPage, {
    session_id: sessionId,
    result_status: 'NOT_PERFORMED',
    result_json: JSON.stringify({ experimental: true, client_reported: true, server_attested: false, outcome: 'NOT_PERFORMED' }),
    completed_challenge_count: '0', total_challenge_count: '0', passive_sample_count: '0'
  });
  expect(foreign.status).toBe(404);
  const unconsentedSession = await otherPage.getByRole('button', { name: 'Start a new test session' }).click().then(async () => {
    await expect(otherPage.locator('#ivpConsentForm')).toBeVisible();
    return otherPage.locator('#ivpConsentForm input[name="session_id"]').inputValue();
  });
  const noConsent = await postResult(otherPage, {
    session_id: unconsentedSession,
    result_status: 'NOT_PERFORMED',
    result_json: JSON.stringify({ experimental: true, client_reported: true, server_attested: false, outcome: 'NOT_PERFORMED' }),
    completed_challenge_count: '0', total_challenge_count: '0', passive_sample_count: '0'
  });
  expect(noConsent.status).toBe(404);
  await otherContext.close();

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  const guest = await postResult(guestPage, {
    session_id: sessionId,
    result_status: 'NOT_PERFORMED',
    result_json: JSON.stringify({ experimental: true, client_reported: true, server_attested: false, outcome: 'NOT_PERFORMED' }),
    completed_challenge_count: '0', total_challenge_count: '0', passive_sample_count: '0'
  });
  expect(guest.status).toBe(401);
  await guestContext.close();

  await checkResponsive(page, path.join(screenshotRoot, 'capture'), 'Experimental desktop camera check');
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => ({
    visible: Boolean(document.activeElement?.getClientRects().length),
    name: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim() || document.activeElement?.labels?.[0]?.textContent?.trim()
  }));
  expect(focus.visible).toBe(true);
  expect(focus.name).toBeTruthy();
  await page.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
  const livenessRow = page.locator('li[data-check-code="LIVENESS"]');
  await expect(livenessRow).toContainText('COMPLETED');
  await expect(livenessRow).toContainText('1 movement prompts; 1 passive model samples');
  await checkResponsive(page, path.join(screenshotRoot, 'results'), 'Completed and pending checks');
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('CT-3H-006 — camera denial and local model failure remain non-completed and retryable', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  await createAccount(page, baseURL);
  const sessionId = await startAndConsent(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => { throw new DOMException('Denied by automated browser test', 'NotAllowedError'); } }
    });
  });
  const denialSaveResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/liveness_result');
  await page.getByRole('button', { name: 'Start or retry camera check' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Camera access was denied' })).toBeVisible({ timeout: 30_000 });
  expect((await denialSaveResponse).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Start or retry camera check' })).toBeEnabled();
  await expect(page.getByRole('status').filter({ hasText: 'Experimental result saved to this session' })).toBeVisible();
  let latest = await readLatest(page);
  let check = latest.checks.find(item => item.check_code === 'LIVENESS');
  expect(check.status).toBe('NOT_PERFORMED');
  let details = typeof check.details_json === 'string' ? JSON.parse(check.details_json) : check.details_json;
  expect(details.reason_code).toBe('CAMERA_DENIED');

  await page.route('**/assets/ivp/liveness/assets/model-*.json', route => route.fulfill({ status: 503, body: 'Synthetic local model failure test.' }));
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext('2d');
          context.fillStyle = '#111';
          context.fillRect(0, 0, canvas.width, canvas.height);
          return canvas.captureStream(10);
        }
      }
    });
  });
  await page.getByRole('button', { name: 'Start or retry camera check' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'local liveness models could not be loaded' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Start or retry camera check' })).toBeEnabled();
  latest = await readLatest(page);
  check = latest.checks.find(item => item.check_code === 'LIVENESS');
  expect(check.status).toBe('UNAVAILABLE');
  details = typeof check.details_json === 'string' ? JSON.parse(check.details_json) : check.details_json;
  expect(details.reason_code).toBe('MODEL_LOAD_FAILED');
  expect(latest.session.session_id).toBe(sessionId);
});

test('CT-3H-006 — cancellation and unusable video remain non-completed', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  await createAccount(page, baseURL);
  const sessionId = await startAndConsent(page);
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d');
    context.fillStyle = '#555';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const stream = canvas.captureStream(10);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => stream }
    });
  });

  const cancelSave = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/liveness_result');
  await page.getByRole('button', { name: 'Start or retry camera check' }).click();
  await expect.poll(() => page.locator('[data-liveness-video]').evaluate(video => video.videoWidth), { timeout: 60_000 }).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Cancel check' }).click();
  expect((await cancelSave).status()).toBe(200);
  await expect(page.getByRole('status').filter({ hasText: 'Experimental result saved to this session' })).toBeVisible();

  let latest = await readLatest(page);
  let check = latest.checks.find(item => item.check_code === 'LIVENESS');
  expect(check.status).toBe('NOT_PERFORMED');
  let details = typeof check.details_json === 'string' ? JSON.parse(check.details_json) : check.details_json;
  expect(details.reason_code).toBe('CANCELLED');

  await page.evaluate(() => {
    const video = document.querySelector('[data-liveness-video]');
    Object.defineProperty(video, 'videoWidth', { configurable: true, get: () => 0 });
    Object.defineProperty(video, 'videoHeight', { configurable: true, get: () => 0 });
    video.play = async () => {};
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => new MediaStream() }
    });
  });
  const unusableSave = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/liveness_result');
  await page.getByRole('button', { name: 'Start or retry camera check' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'did not provide usable video' })).toBeVisible({ timeout: 60_000 });
  expect((await unusableSave).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Start or retry camera check' })).toBeEnabled();

  latest = await readLatest(page);
  check = latest.checks.find(item => item.check_code === 'LIVENESS');
  expect(check.status).toBe('FAILED');
  details = typeof check.details_json === 'string' ? JSON.parse(check.details_json) : check.details_json;
  expect(details.reason_code).toBe('VIDEO_UNUSABLE');
  expect(latest.session.session_id).toBe(sessionId);
});
