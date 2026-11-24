import { mkdir, readdir, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const evidenceRoot = path.join(repoRoot, 'docs/evidence');
const privateEvidenceRoot = path.join(repoRoot, 'storage/ivp_dev/evidence');
const widths = [1440, 1024, 768, 375];

async function createSyntheticImages(page) {
  const images = await page.evaluate(() => {
    const render = draw => {
      const canvas = document.createElement('canvas');
      canvas.width = 1440;
      canvas.height = 900;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      draw(context, canvas);
      return canvas.toDataURL('image/png').split(',')[1];
    };
    return {
      document: render(context => {
        context.fillStyle = '#111111';
        context.font = 'bold 46px Arial';
        [
          'SYNTHETIC OCR TEST - NOT AN ID',
          'NAME: SAMPLE PERSON',
          'DOCUMENT NO: TEST 000042',
          'DOB: 2000 01 01',
          'NATIONALITY: SYNTHETIC',
        ].forEach((line, index) => context.fillText(line, 56, 120 + index * 110));
      }),
      blank: render(() => {}),
      selfie: render((context, canvas) => {
        context.fillStyle = '#e8eef3';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#31566f';
        context.beginPath();
        context.ellipse(720, 490, 245, 315, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#f2c7a5';
        context.beginPath();
        context.ellipse(720, 410, 170, 205, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#243747';
        context.beginPath();
        context.ellipse(655, 390, 14, 18, 0, 0, Math.PI * 2);
        context.ellipse(785, 390, 14, 18, 0, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = '#8a493f';
        context.lineWidth = 9;
        context.beginPath();
        context.arc(720, 465, 55, 0.2, Math.PI - 0.2);
        context.stroke();
      }),
    };
  });
  return Object.fromEntries(Object.entries(images).map(([name, data]) => [name, Buffer.from(data, 'base64')]));
}

async function registerAndSignIn(page, baseURL) {
  const email = `codex.${crypto.randomUUID()}@example.test`;
  const password = `${crypto.randomBytes(24).toString('base64url')}Aa9!`;
  await page.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Identity evidence steps' })).toBeVisible();
  await expect(page.locator('#ivpRegisterForm')).toBeVisible();

  await page.locator('#ivpRegisterUsername').fill(email);
  await page.locator('#ivpRegisterPassword').fill(password);
  await page.locator('#ivpRegisterConfirm').fill(password);
  const registrationResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/register');
  await page.getByRole('button', { name: 'Create test account' }).click();
  const registrationResponse = await registrationResponsePromise;
  expect(registrationResponse.status(), 'Wappler test-account registration').toBe(200);
  await expect(page.locator('#ivpRegisterForm [role="status"]')).toContainText('Test account created');

  await page.locator('#ivpLoginUsername').fill(email);
  await page.locator('#ivpLoginPassword').fill(password);
  const loginResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status(), 'Wappler test-account sign-in').toBe(200);
  await expect(page.getByRole('heading', { name: 'Verification session' })).toBeVisible();
  return { email };
}

async function sessionSnapshot(page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/ivp/session_latest');
    return { status: response.status, body: await response.json() };
  });
}

async function submitConsent(page, sessionId) {
  const response = await page.evaluate(async id => {
    const body = new URLSearchParams({ session_id: id, consent_accepted: '1' });
    const result = await fetch('/api/ivp/consent', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    return result.status;
  }, sessionId);
  expect(response).toBe(200);
}

async function checkResponsiveScreens(page, folder, title) {
  await mkdir(folder, { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    const widthCheck = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      offenders: Array.from(document.querySelectorAll('body *')).filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > window.innerWidth + 1 || element.scrollWidth > element.clientWidth + 1);
      }).slice(0, 12).map(element => ({
        tag: element.tagName,
        id: element.id,
        className: typeof element.className === 'string' ? element.className : '',
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        text: (element.innerText || '').trim().slice(0, 70),
      })),
    }));
    expect(Math.max(widthCheck.document, widthCheck.body), `horizontal overflow at ${width}px: ${JSON.stringify(widthCheck.offenders)}`).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: path.join(folder, `${width}.png`), fullPage: true });
  }
}

test('CT-3B-001 / CT-3C-001 / CT-3D-001 / CT-3E-001 / CT-3E-002 / CT-3E-008 / CT-3F-001 / CT-3G-001 — eKYC synthetic session, OCR review, selfie and ownership', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const uncaughtErrors = [];
  const failedRequests = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => uncaughtErrors.push(error.message));
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') failedRequests.push(`${request.method()} ${request.url()}`);
  });

  const images = await createSyntheticImages(page);
  const { email } = await registerAndSignIn(page, baseURL);
  await expect(page.getByRole('button', { name: 'Start a new test session' })).toBeVisible();

  await page.getByRole('button', { name: 'Start a new test session' }).click();
  await expect(page.locator('#ivpConsentForm')).toBeVisible();
  let sessionId = await page.locator('#ivpConsentForm input[name="session_id"]').inputValue();
  expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);

  const deniedConsent = await page.evaluate(async id => {
    const response = await fetch('/api/ivp/consent', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ session_id: id, consent_accepted: '0' }),
    });
    return response.status;
  }, sessionId);
  expect(deniedConsent).toBe(400);
  const pendingSession = await sessionSnapshot(page);
  expect(pendingSession.status).toBe(200);
  expect(pendingSession.body.session.status).toBe('CONSENT_REQUIRED');

  await page.locator('#ivpConsentAccepted').check();
  await page.getByRole('button', { name: 'Record test consent' }).click();
  await expect(page.locator('#ivpDocumentUploadForm')).toBeVisible();
  const consented = await sessionSnapshot(page);
  expect(consented.body.session.status).toBe('IN_PROGRESS');

  const unreadableSessionId = sessionId;
  await page.locator('#ivpDocumentFile').setInputFiles({ name: 'synthetic-unreadable.png', mimeType: 'image/png', buffer: images.blank });
  const unreadableUploadPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/document_upload');
  await page.getByRole('button', { name: 'Upload and run local OCR' }).click();
  const unreadableUpload = await unreadableUploadPromise;
  expect(unreadableUpload.status()).toBe(200);
  expect(await unreadableUpload.json()).toMatchObject({ upload_result: { accepted: true, ocr_status: 'UNREADABLE', documentReadable: false } });
  await expect(page.getByRole('alert').filter({ hasText: 'OCR could not read the document.' })).toBeVisible();
  await expect(page.locator('#ivpReviewForm')).toBeHidden();
  await expect(page.locator('#ivpSelfieUploadForm')).toBeHidden();
  const unreadable = await sessionSnapshot(page);
  const unreadableChecks = Object.fromEntries(unreadable.body.checks.map(check => [check.check_code, check.status]));
  expect(unreadableChecks.OCR_EXTRACTION).toBe('FAILED');
  expect(unreadableChecks.OCR_REVIEW).toBe('PENDING');
  expect(unreadable.body.ocr_results[0].original_text).toBe('');
  expect(unreadable.body.ocr_results[0].corrected_fields).toBeNull();

  const unreadableReviewStatus = await page.evaluate(async id => {
    const body = new URLSearchParams({
      session_id: id,
      name: 'SAMPLE PERSON',
      document_number: 'TEST 000042',
      date_of_birth: '2000 01 01',
      nationality: 'SYNTHETIC',
    });
    return (await fetch('/api/ivp/review', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })).status;
  }, unreadableSessionId);
  expect(unreadableReviewStatus).toBe(400);

  await page.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('alert').filter({ hasText: 'OCR could not read the document image.' })).toBeVisible();
  await expect(page.locator('li').filter({ hasText: 'OCR_EXTRACTION' })).toContainText('FAILED');

  await page.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start a new test session' }).click();
  await expect(page.locator('#ivpConsentForm')).toBeVisible();
  sessionId = await page.locator('#ivpConsentForm input[name="session_id"]').inputValue();
  expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);
  expect(sessionId).not.toBe(unreadableSessionId);

  const newSession = await sessionSnapshot(page);
  expect(newSession.body.session.status).toBe('CONSENT_REQUIRED');
  await page.locator('#ivpConsentAccepted').check();
  await page.getByRole('button', { name: 'Record test consent' }).click();
  await expect(page.locator('#ivpDocumentUploadForm')).toBeVisible();

  await mkdir(privateEvidenceRoot, { recursive: true });
  const fileCountBeforeRejectedUploads = (await readdir(privateEvidenceRoot)).length;
  const invalidImageStatus = await page.evaluate(async id => {
    const form = new FormData();
    form.set('session_id', id);
    form.set('document_file', new File(['not an image'], 'synthetic-invalid.png', { type: 'image/png' }));
    return (await fetch('/api/ivp/document_upload', { method: 'POST', body: form })).status;
  }, sessionId);
  expect(invalidImageStatus).toBe(400);

  const oversizedStatus = await page.evaluate(async id => {
    const form = new FormData();
    form.set('session_id', id);
    form.set('document_file', new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'synthetic-oversize.png', { type: 'image/png' }));
    return (await fetch('/api/ivp/document_upload', { method: 'POST', body: form })).status;
  }, sessionId);
  expect([400, 413]).toContain(oversizedStatus);
  expect((await readdir(privateEvidenceRoot)).length).toBe(fileCountBeforeRejectedUploads);

  await page.locator('#ivpDocumentFile').setInputFiles({ name: 'synthetic-readable.png', mimeType: 'image/png', buffer: images.document });
  await page.getByRole('button', { name: 'Upload and run local OCR' }).click();
  await expect(page.locator('#ivpReviewForm')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#ivpReviewName')).toHaveValue('SAMPLE PERSON');
  await expect(page.locator('#ivpReviewDocumentNumber')).toHaveValue('TEST 000042');
  await expect(page.locator('#ivpReviewDateOfBirth')).toHaveValue('2000 01 01');
  await expect(page.locator('#ivpReviewNationality')).toHaveValue('SYNTHETIC');
  await expect(page.locator('pre').first()).toContainText('SYNTHETIC OCR TEST - NOT AN ID');

  await page.locator('#ivpReviewName').fill('SAMPLE PERSON CORRECTED');
  const reviewResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/review');
  await page.getByRole('button', { name: 'Save reviewed fields' }).click();
  const reviewResponse = await reviewResponsePromise;
  expect(reviewResponse.status(), 'Wappler OCR correction save').toBe(200);
  await expect(page.locator('#ivpReviewForm [role="status"]')).toContainText('Your corrected fields are saved');
  const reviewed = await sessionSnapshot(page);
  const originalOcr = reviewed.body.ocr_results[0];
  expect(originalOcr.extracted_fields.name).toBe('SAMPLE PERSON');
  expect(originalOcr.corrected_fields.name).toBe('SAMPLE PERSON CORRECTED');
  expect(originalOcr.original_text).toContain('NAME: SAMPLE PERSON');
  expect(originalOcr.reviewed_at).toBeTruthy();
  const reviewCheck = reviewed.body.checks.find(check => check.check_code === 'OCR_REVIEW');
  expect(reviewCheck.status).toBe('COMPLETED');

  await expect(page.locator('#ivpSelfieUploadForm')).toBeVisible();
  await expect(page.locator('#ivpSelfieFile')).toHaveAttribute('capture', 'user');
  await expect(page.locator('#ivpSelfieFile')).toHaveAttribute('accept', 'image/png,image/jpeg');
  await page.locator('#ivpSelfieFile').setInputFiles({ name: 'synthetic-selfie.png', mimeType: 'image/png', buffer: images.blank });
  await page.getByRole('button', { name: 'Save synthetic selfie evidence' }).click();
  await expect(page.locator('[role="status"]').filter({ hasText: 'Session status:' })).toContainText('REVIEW_REQUIRED');
  const saved = await sessionSnapshot(page);
  expect(saved.body.session.status).toBe('REVIEW_REQUIRED');
  expect(saved.body.evidence.map(item => item.evidence_type).sort()).toEqual(['DOCUMENT', 'SELFIE']);
  const checks = Object.fromEntries(saved.body.checks.map(check => [check.check_code, check.status]));
  expect(checks.DOCUMENT_CAPTURE).toBe('COMPLETED');
  expect(checks.OCR_EXTRACTION).toBe('COMPLETED');
  expect(checks.OCR_REVIEW).toBe('COMPLETED');
  expect(checks.SELFIE_CAPTURE).toBe('COMPLETED');
  const faceComparisonCheck = saved.body.checks.find(check => check.check_code === 'FACE_COMPARISON');
  const faceComparisonDetails = typeof faceComparisonCheck.details_json === 'string' ? JSON.parse(faceComparisonCheck.details_json) : faceComparisonCheck.details_json;
  expect(faceComparisonDetails.error_code).toBe('NO_FACE');
  expect(checks.DOCUMENT_AUTHENTICITY).toBe('UNAVAILABLE');
  expect(checks.AUTHORITATIVE_IDENTITY).toBe('UNAVAILABLE');
  expect(checks.FACE_COMPARISON).toBe('FAILED');
  expect(checks.LIVENESS).toBe('NOT_PERFORMED');

  await page.getByRole('link', { name: 'View saved verification results' }).click();
  await expect(page.getByRole('heading', { name: 'Completed and pending checks' })).toBeVisible();
  await expect(page.locator('li[data-check-code="FACE_COMPARISON"]')).toContainText('FAILED');
  await expect(page.locator('li[data-check-code="LIVENESS"]')).toContainText('NOT_PERFORMED');
  await expect(page.locator('li[data-check-code="DOCUMENT_AUTHENTICITY"]')).toContainText('UNAVAILABLE');
  await expect(page.getByRole('heading', { name: 'Human-corrected fields' })).toBeVisible();
  await expect(page.locator('pre').first()).toContainText('NAME: SAMPLE PERSON');
  await expect(page.locator('dl').last()).toContainText('SAMPLE PERSON CORRECTED');
  await expect(page.getByRole('heading', { name: 'Private evidence saved' })).toBeVisible();
  await expect(page.locator('body')).toContainText('REVIEW_REQUIRED');

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Completed and pending checks' })).toBeVisible();
  await expect(page.locator('body')).toContainText('SAMPLE PERSON CORRECTED');

  const sessionLoadStatus = await page.evaluate(async id => {
    const response = await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`);
    return response.status;
  }, sessionId);
  expect(sessionLoadStatus).toBe(200);
  const failedSessionSnapshot = await page.evaluate(async id => {
    const response = await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`);
    return { status: response.status, body: await response.json() };
  }, unreadableSessionId);
  expect(failedSessionSnapshot.status).toBe(200);
  expect(failedSessionSnapshot.body.checks.find(check => check.check_code === 'OCR_EXTRACTION').status).toBe('FAILED');
  expect(failedSessionSnapshot.body.checks.find(check => check.check_code === 'OCR_REVIEW').status).toBe('PENDING');

  await page.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Verification session' })).toBeVisible();
  await checkResponsiveScreens(page, path.join(evidenceRoot, 'TTP-3D/screenshots/capture'), 'Verification session');
  await page.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Completed and pending checks' })).toBeVisible();
  await checkResponsiveScreens(page, path.join(evidenceRoot, 'TTP-3E/screenshots/results'), 'Verification results');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({
    visible: !!document.activeElement?.getClientRects().length,
    name: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim() || document.activeElement?.labels?.[0]?.textContent?.trim(),
  }));
  expect(focused.visible).toBe(true);
  expect(focused.name).toBeTruthy();

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await registerAndSignIn(otherPage, baseURL);
  const foreignLoadStatus = await otherPage.evaluate(async id => {
    const response = await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`);
    return response.status;
  }, sessionId);
  expect(foreignLoadStatus).toBe(404);
  const otherLatest = await sessionSnapshot(otherPage);
  expect(otherLatest.status).toBe(200);
  expect(otherLatest.body.session?.session_id).toBeFalsy();

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
  const unauthenticatedStatus = await guestPage.evaluate(async () => (await fetch('/api/ivp/session_latest')).status);
  expect(unauthenticatedStatus).toBe(401);

  const expectedValidationConsoleError = 'Failed to load resource: the server responded with a status of 400 (Bad Request)';
  expect(consoleErrors.filter(message => message === expectedValidationConsoleError)).toHaveLength(4);
  expect(consoleErrors.filter(message => message !== expectedValidationConsoleError)).toEqual([]);
  expect(uncaughtErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(email).toMatch(/@example\.test$/);
  await guestContext.close();
  await otherContext.close();
  await context.close();
});

test('CT-3G-003 / CT-3G-004 — Wappler persists a local YuNet/SFace score without an identity assertion', async ({ browser, baseURL }) => {
  const documentPath = process.env.IVP_FACE_TEST_DOCUMENT_PATH;
  const selfiePath = process.env.IVP_FACE_TEST_SELFIE_PATH;
  test.skip(!documentPath || !selfiePath, 'Requires the owner-approved local specimen and consented selfie paths.');
  test.setTimeout(120_000);

  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await registerAndSignIn(page, baseURL);
  await page.getByRole('button', { name: 'Start a new test session' }).click();
  await expect(page.locator('#ivpConsentForm')).toBeVisible();
  const sessionId = await page.locator('#ivpConsentForm input[name="session_id"]').inputValue();
  await page.locator('#ivpConsentAccepted').check();
  await page.getByRole('button', { name: 'Record test consent' }).click();
  await expect(page.locator('#ivpDocumentUploadForm')).toBeVisible();

  await page.locator('#ivpDocumentFile').setInputFiles(documentPath);
  const documentResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/document_upload');
  await page.getByRole('button', { name: 'Upload and run local OCR' }).click();
  expect((await documentResponsePromise).status()).toBe(200);
  await expect(page.locator('#ivpReviewForm')).toBeVisible({ timeout: 60_000 });
  await page.locator('#ivpReviewName').fill('SAMPLE PERSON A');
  await page.locator('#ivpReviewDocumentNumber').fill('SAMPLE-0001');
  await page.locator('#ivpReviewDateOfBirth').fill('2000 01 01');
  await page.locator('#ivpReviewNationality').fill('SYNTHETIC');
  const reviewResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/review');
  await page.getByRole('button', { name: 'Save reviewed fields' }).click();
  expect((await reviewResponsePromise).status()).toBe(200);
  await expect(page.locator('#ivpSelfieUploadForm')).toBeVisible();

  await page.locator('#ivpSelfieFile').setInputFiles(selfiePath);
  const selfieResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/selfie_upload');
  await page.getByRole('button', { name: 'Save synthetic selfie evidence' }).click();
  expect((await selfieResponsePromise).status()).toBe(200);
  const saved = await sessionSnapshot(page);
  expect(saved.body.session.session_id).toBe(sessionId);
  expect(saved.body.session.status).toBe('REVIEW_REQUIRED');
  const faceCheck = saved.body.checks.find(check => check.check_code === 'FACE_COMPARISON');
  const faceDetails = typeof faceCheck.details_json === 'string' ? JSON.parse(faceCheck.details_json) : faceCheck.details_json;
  const evidence = Object.fromEntries(saved.body.evidence.map(item => [item.evidence_type, item.evidence_id]));
  expect(faceCheck.status).toBe('COMPLETED');
  expect(typeof faceDetails.similarity_score).toBe('number');
  expect(faceDetails.score_type).toBe('cosine_similarity');
  expect(faceDetails.decision).toBe('NO_THRESHOLD_CONFIGURED');
  expect(faceDetails.match_classification).toBeNull();
  expect(faceDetails.identity_assertion).toBe(false);
  expect(faceDetails.citizenship_assertion).toBe(false);
  expect(faceDetails.reference_evidence_id).toBe(evidence.DOCUMENT);
  expect(faceDetails.selfie_evidence_id).toBe(evidence.SELFIE);
  expect(saved.body.checks.find(check => check.check_code === 'LIVENESS').status).toBe('NOT_PERFORMED');

  const privateResultDirectory = path.join(evidenceRoot, 'TTP-3G-3H-BIOMETRIC-POC-01/private');
  await mkdir(privateResultDirectory, { recursive: true });
  await writeFile(path.join(privateResultDirectory, 'wappler-integration-result.json'), JSON.stringify({
    recorded_at: new Date().toISOString(),
    environment: 'local Wappler Development / IVP Development',
    status: faceCheck.status,
    provider: faceCheck.provider_name,
    model_version: faceCheck.model_version,
    score_type: faceDetails.score_type,
    similarity_score: faceDetails.similarity_score,
    match_classification: faceDetails.match_classification,
    decision: faceDetails.decision,
    identity_assertion: faceDetails.identity_assertion,
    citizenship_assertion: faceDetails.citizenship_assertion,
    liveness_status: saved.body.checks.find(check => check.check_code === 'LIVENESS').status,
    session_status: saved.body.session.status,
    evidence_references_persisted: Boolean(faceDetails.reference_evidence_id && faceDetails.selfie_evidence_id),
  }, null, 2) + '\n');

  await page.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Completed and pending checks' })).toBeVisible();
  await expect(page.locator('li[data-check-code="FACE_COMPARISON"]')).toContainText('COMPLETED');
  await expect(page.locator('body')).toContainText('Cosine similarity (descriptive only)');
  await expect(page.locator('body')).toContainText('Identity and citizenship remain REVIEW_REQUIRED');
  await checkResponsiveScreens(page, path.join(evidenceRoot, 'TTP-3G-3H-BIOMETRIC-POC-01/private/screenshots/face-results'), 'Completed and pending checks');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({ visible: Boolean(document.activeElement?.getClientRects().length), tag: document.activeElement?.tagName }));
  expect(focused.visible).toBe(true);
  expect(pageErrors).toEqual([]);
  await context.close();
});
