import { mkdir, readFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { expect, test } from '@playwright/test';
import { completeDevelopmentEmailVerification } from './helpers/mailhog.mjs';

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const screenshotRoot = path.join(repoRoot, 'docs/evidence/TTP-4B-5E-5J/screenshots/ivp-regression');
const secretsDirectory = process.env.TTP2B_SECRETS_DIR || path.join(os.homedir(), '.codex', 'ttpassport-stage2b-secrets');

function makeTestUser() {
  return {
    email: `codex.4f.${crypto.randomUUID()}@example.test`,
    password: `${crypto.randomBytes(24).toString('base64url')}Aa9!`,
  };
}

async function postForm(page, pathname, fields) {
  return page.evaluate(async ({ pathname, fields }) => {
    const response = await fetch(pathname, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields),
      credentials: 'same-origin',
    });
    let body;
    try { body = await response.json(); } catch { body = null; }
    return { status: response.status, body };
  }, { pathname, fields });
}

async function registerAndSignIn(page, baseURL, user) {
  await page.goto(new URL('/account/register', baseURL).toString(), { waitUntil: 'networkidle' });
  await page.locator('#register-email').fill(user.email);
  await page.locator('#register-password').fill(user.password);
  await page.locator('#register-confirm').fill(user.password);
  const registerPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/register');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  expect((await registerPromise).status()).toBe(200);

  const unverifiedLogin = await postForm(page, '/api/citizen/login', { email: user.email, password: user.password });
  expect(unverifiedLogin.status).not.toBe(200);
  expect((await completeDevelopmentEmailVerification(page, user.email)).status).toBe(200);

  await page.goto(new URL('/account/sign-in', baseURL).toString(), { waitUntil: 'networkidle' });
  await page.locator('#signin-email').fill(user.email);
  await page.locator('#signin-password').fill(user.password);
  const loginPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await loginPromise).status()).toBe(200);
}

async function createDraft(page, baseURL, { ageGroup = '18_PLUS', name = 'SYNTHETIC', surname = 'APPLICANT' } = {}) {
  await page.goto(new URL('/citizen/apply/first-time', baseURL).toString(), { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Begin a first-time draft' })).toBeVisible();
  const createPromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_create');
  await page.getByRole('button', { name: 'Start draft' }).click();
  expect((await createPromise).status()).toBe(200);
  await expect(page.getByRole('heading', { name: '1. Eligibility screening' })).toBeVisible();

  await page.locator('#ageGroupSelfReported').selectOption(ageGroup);
  const ageMessage = ageGroup === '16_17'
    ? 'Guardian consent is required under the project’s approved design. The separate guardian workflow is not part of this increment, so these drafts cannot be submitted.'
    : 'This is a self-report only. Age and eligibility remain subject to official review.';
  await expect(page.getByText(ageMessage, { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page.getByRole('heading', { name: '2. Personal information' })).toBeVisible();

  await page.locator('#app-first_name').fill(name);
  await page.locator('#app-middle_names').fill('TEST');
  await page.locator('#app-surname').fill(surname);
  await page.locator('#app-date_of_birth').fill(ageGroup === '16_17' ? '2009-03-15' : '1990-03-15');
  await page.locator('#app-sex_as_on_form').selectOption('Female');
  await page.locator('#app-place_of_birth_town').fill('Sample Town');
  await page.locator('#app-place_of_birth_country').fill('Testland');
  await page.locator('#app-home_street').fill('1 Synthetic Street');
  await page.locator('#app-home_city').fill('Sample City');
  await page.locator('#app-home_country').fill('Testland');
  const submittedPersonalName = await page.locator('#citizenDraftForm').evaluate(form => new FormData(form).get('first_name'));
  expect(submittedPersonalName).toBe(name);
  const personalSave = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  expect((await personalSave).status()).toBe(200);
  await expect(page.getByRole('heading', { name: '3. Citizenship and family information' })).toBeVisible();
  const afterPersonalSave = await page.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
  expect(afterPersonalSave.applications[0].first_name).toBe(name);

  await page.locator('#app-basis_birth').check();
  await page.locator('#app-birth_certificate_pin').fill('SYNTHETIC-PIN');
  await page.locator('#app-birth_certificate_number').fill('SYNTHETIC-CERT');
  await page.locator('#app-mother_maiden_surname').fill('SYNTHETIC FAMILY');
  await page.locator('#app-father_first_name').fill('SYNTHETIC FATHER');
  await page.locator('#app-father_surname').fill('SAMPLE');
  const submittedReviewName = await page.locator('#citizenDraftForm').evaluate(form => new FormData(form).get('first_name'));
  expect(submittedReviewName).toBe(name);
  const citizenshipSave = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  expect((await citizenshipSave).status()).toBe(200);
  await expect(page.getByRole('heading', { name: '4. Proposed recommender and personal references' })).toBeVisible();

  await page.locator('#recommender-first-name').fill('SYNTHETIC RECOMMENDER');
  await page.locator('#recommender-surname').fill('SAMPLE');
  await page.locator('#recommender-occupation').fill('Test Occupation');
  await page.locator('#recommender-city').fill('Sample City');
  await page.locator('#recommender-country').fill('Testland');
  await page.locator('#recommender-years').fill('5');
  await page.locator('#reference1-first-name').fill('SYNTHETIC REFERENCE ONE');
  await page.locator('#reference1-surname').fill('SAMPLE');
  await page.locator('#reference1-city').fill('Sample City');
  await page.locator('#reference1-country').fill('Testland');
  await page.locator('#reference1-years').fill('3');
  await page.locator('#reference1-relative').selectOption('YES');
  await page.locator('#reference2-first-name').fill('SYNTHETIC REFERENCE TWO');
  await page.locator('#reference2-surname').fill('SAMPLE');
  await page.locator('#reference2-city').fill('Sample City');
  await page.locator('#reference2-country').fill('Testland');
  await page.locator('#reference2-years').fill('2');
  const peopleSave = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_people_save');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  expect((await peopleSave).status()).toBe(200);
  await expect(page.getByRole('heading', { name: '5. Supporting documents' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to passport photo' }).click();
  await expect(page.getByRole('heading', { name: '6. Proposed passport photograph' })).toBeVisible();
  await page.getByRole('button', { name: 'Review application' }).click();
  await expect(page.getByRole('heading', { name: '8. Review application' })).toBeVisible();
  const afterReviewSave = await page.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
  expect(afterReviewSave.applications[0].first_name).toBe(name);

  const current = await page.evaluate(async () => {
    const response = await fetch('/api/citizen/application_current');
    return { status: response.status, body: await response.json() };
  });
  expect(current.status).toBe(200);
  expect(current.body.applications).toHaveLength(1);
  expect(current.body.applications[0]).toMatchObject({
    status: 'DRAFT',
    first_name: name,
    surname,
    age_group_self_reported: ageGroup,
    age_screening_status: 'REVIEW_REQUIRED',
    identity_status: 'REVIEW_REQUIRED',
    citizenship_status: 'REVIEW_REQUIRED',
  });
  return current.body.applications[0];
}

async function syntheticDocument(page) {
  const encoded = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#111111';
    context.font = 'bold 46px Arial';
    [
      'SYNTHETIC OCR TEST - NOT AN ID',
      'NAME: SAMPLE PERSON',
      'DOCUMENT NO: TEST 000042',
      'DOB: 2000 01 01',
      'NATIONALITY: SYNTHETIC',
    ].forEach((line, index) => context.fillText(line, 56, 120 + index * 110));
    return canvas.toDataURL('image/png').split(',')[1];
  });
  return Buffer.from(encoded, 'base64');
}

async function ivpDatabase() {
  const privateConfig = JSON.parse(await readFile(path.join(secretsDirectory, 'db-connections.json'), 'utf8'));
  const config = privateConfig.development?.ivp;
  if (!config || config.host !== '127.0.0.1' || Number(config.port) !== 3308 || config.database !== 'ivp_dev') {
    throw new Error('TTP-4F test only permits the configured loopback IVP Development database.');
  }
  const connection = await mysql.createConnection({
    host: config.host,
    port: Number(config.port),
    user: config.user,
    password: config.password,
    database: config.database,
    connectTimeout: 2500,
  });
  const [[identity]] = await connection.query('SELECT VERSION() AS serverVersion, @@version_comment AS serverComment, DATABASE() AS databaseName, @@port AS serverPort, CURRENT_USER() AS principal');
  if (!/^8\.4\./.test(identity.serverVersion) || !/mysql/i.test(identity.serverComment) || /mariadb/i.test(identity.serverComment) || identity.databaseName !== 'ivp_dev' || Number(identity.serverPort) !== 3306 || identity.principal !== `${config.user}@%`) {
    await connection.end();
    throw new Error('TTP-4F database identity check failed; no test queries were executed.');
  }
  return { connection, config };
}

async function savedClientLink(applicationKey, sessionId) {
  const { connection } = await ivpDatabase();
  try {
    const [[row]] = await connection.execute(
      `SELECT c.client_key AS clientKey, s.client_id AS clientId, s.created_by_client_subject_ref AS sessionApplicationRef,
              s.created_by_user_id AS demoUserId, sub.client_subject_ref AS subjectApplicationRef, sub.owner_user_id AS demoOwnerId
       FROM ivp_sessions s
       JOIN ivp_subjects sub ON sub.client_id = s.client_id AND sub.subject_id = s.subject_id
       JOIN ivp_clients c ON c.client_id = s.client_id
       WHERE s.session_id = ? AND c.client_key = ?`,
      [sessionId, 'ttpassport-dev'],
    );
    expect(row).toMatchObject({ clientKey: 'ttpassport-dev', sessionApplicationRef: applicationKey, subjectApplicationRef: applicationKey });
    expect(row.demoUserId).toBeNull();
    expect(row.demoOwnerId).toBeNull();

    const [consents] = await connection.execute(
      'SELECT actor_client_subject_ref AS actorApplicationRef, accepted FROM ivp_consents WHERE session_id = ?',
      [sessionId],
    );
    if (consents.length) expect(consents.every(item => item.actorApplicationRef === applicationKey && Number(item.accepted) === 1)).toBeTruthy();

    const [evidence] = await connection.execute(
      'SELECT owner_client_subject_ref AS ownerApplicationRef FROM ivp_evidence WHERE session_id = ?',
      [sessionId],
    );
    expect(evidence.every(item => item.ownerApplicationRef === applicationKey)).toBeTruthy();

    const [ocr] = await connection.execute(
      'SELECT reviewed_by_client_subject_ref AS reviewerApplicationRef FROM ivp_ocr_results WHERE session_id = ? AND reviewed_at IS NOT NULL',
      [sessionId],
    );
    if (ocr.length) expect(ocr.every(item => item.reviewerApplicationRef === applicationKey)).toBeTruthy();
    return { clientId: row.clientId };
  } finally {
    await connection.end();
  }
}

async function createOtherTenantSession() {
  const { connection } = await ivpDatabase();
  const clientKey = `synthetic-tenant-${crypto.randomUUID()}`;
  const subjectId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const ref = `synthetic-${crypto.randomUUID()}`;
  try {
    await connection.beginTransaction();
    const [client] = await connection.execute(
      "INSERT INTO ivp_clients (client_key, display_name, status) VALUES (?, 'Synthetic TTP-4F tenant fixture', 'ACTIVE')",
      [clientKey],
    );
    await connection.execute(
      'INSERT INTO ivp_subjects (subject_id, client_id, owner_user_id, client_subject_ref) VALUES (?, ?, NULL, ?)',
      [subjectId, client.insertId, ref],
    );
    await connection.execute(
      "INSERT INTO ivp_sessions (session_id, client_id, subject_id, created_by_user_id, created_by_client_subject_ref, status) VALUES (?, ?, ?, NULL, ?, 'CONSENT_REQUIRED')",
      [sessionId, client.insertId, subjectId, ref],
    );
    await connection.commit();
    return {
      sessionId,
      async cleanup() {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM ivp_sessions WHERE session_id = ?', [sessionId]);
        await connection.execute('DELETE FROM ivp_subjects WHERE subject_id = ?', [subjectId]);
        await connection.execute('DELETE FROM ivp_clients WHERE client_id = ?', [client.insertId]);
        await connection.commit();
        await connection.end();
      },
    };
  } catch (error) {
    await connection.rollback();
    await connection.end();
    throw error;
  }
}

async function captureResponsiveScreens(page, name, heading) {
  await mkdir(screenshotRoot, { recursive: true });
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    const actualWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    expect(actualWidth, `${name} horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: path.join(screenshotRoot, `${heading}-${width}.png`), fullPage: true });
  }
}

async function visibleFormLabels(page) {
  const missing = await page.locator('input:not([type="hidden"]), select, textarea').evaluateAll(elements => elements
    .filter(element => element.getClientRects().length)
    .filter(element => !element.labels?.length && !element.closest('fieldset')?.querySelector('legend'))
    .map(element => element.id || element.name || element.tagName));
  expect(missing, 'visible form controls should have labels or legends').toEqual([]);
}

test('CT-4F-001 through CT-4F-010 — citizen draft linked to reusable IVP with ownership and UI regression', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const citizenA = makeTestUser();
  const citizenB = makeTestUser();
  const contextA = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const pageA = await contextA.newPage();
  pageA.setDefaultTimeout(15_000);
  pageA.setDefaultNavigationTimeout(30_000);
  const consoleErrors = [];
  const uncaughtErrors = [];
  const failedPageResources = [];
  pageA.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) consoleErrors.push(message.text());
  });
  pageA.on('pageerror', error => uncaughtErrors.push(error.message));
  pageA.on('response', response => {
    const url = new URL(response.url());
    if (response.status() >= 400 && !url.pathname.startsWith('/api/')) failedPageResources.push(`${response.status()} ${url.pathname}`);
  });
  let tenantFixture;

  try {
    await registerAndSignIn(pageA, baseURL, citizenA);
    const applicationA = await createDraft(pageA, baseURL);
    await expect(pageA.locator('section[aria-labelledby="application-ivp-heading"]')).toBeVisible();
    await expect(pageA.getByRole('heading', { name: 'Identity verification' })).toBeVisible();
    await expect(pageA.locator('section[aria-labelledby="application-ivp-heading"]').getByText('Identity and citizenship remain REVIEW_REQUIRED', { exact: false })).toBeVisible();

    await pageA.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('link', { name: 'Resume and review' })).toBeVisible();
    await captureResponsiveScreens(pageA, 'Your passport dashboard', 'dashboard');

    await pageA.goto(new URL('/citizen/apply/first-time', baseURL).toString(), { waitUntil: 'networkidle' });
    await pageA.getByRole('button', { name: 'Review saved draft' }).click();
    await expect(pageA.getByRole('heading', { name: '8. Review application' })).toBeVisible();
    await expect(pageA.getByText('SYNTHETIC', { exact: true })).toBeVisible();
    await expect(pageA.getByText('SYNTHETIC FAMILY', { exact: true })).toBeVisible();
    await visibleFormLabels(pageA);
    await captureResponsiveScreens(pageA, '8. Review application', 'application-review');
    await pageA.keyboard.press('Tab');
    expect(await pageA.evaluate(() => Boolean(document.activeElement?.getClientRects().length))).toBeTruthy();

    await pageA.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Verification session' })).toBeVisible();
    await expect(pageA.getByText('Session access is limited to the signed-in citizen’s current first-time draft.')).toBeVisible();
    await expect(pageA.getByRole('button', { name: 'Start or resume identity checks' })).toBeVisible();
    await visibleFormLabels(pageA);

    const createResponsePromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/session_create');
    await pageA.getByRole('button', { name: 'Start or resume identity checks' }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(200);
    const afterCreate = await pageA.evaluate(async () => {
      const response = await fetch('/api/ivp/session_latest');
      const body = await response.json();
      return {
        status: response.status,
        sessionId: body.session?.session_id,
        sessionStatus: body.session?.status,
        checkCount: body.checks?.length,
        checkStatuses: Object.fromEntries((body.checks || []).map(check => [check.check_code, check.status])),
      };
    });
    expect(afterCreate, 'citizen session should be retrievable from its owned draft').toMatchObject({ status: 200, sessionStatus: 'CONSENT_REQUIRED' });
    expect(afterCreate.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(afterCreate.checkStatuses).toMatchObject({
      DOCUMENT_CAPTURE: 'PENDING',
      OCR_EXTRACTION: 'PENDING',
      OCR_REVIEW: 'PENDING',
      DOCUMENT_AUTHENTICITY: 'UNAVAILABLE',
      SELFIE_CAPTURE: 'PENDING',
      FACE_COMPARISON: 'NOT_PERFORMED',
      LIVENESS: 'NOT_PERFORMED',
      AUTHORITATIVE_IDENTITY: 'UNAVAILABLE',
    });
    await pageA.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.locator('li[data-check-code="OCR_EXTRACTION"]')).toContainText('PENDING');
    await expect(pageA.locator('li[data-check-code="DOCUMENT_AUTHENTICITY"]')).toContainText('UNAVAILABLE');
    await expect(pageA.locator('li[data-check-code="FACE_COMPARISON"]')).toContainText('NOT_PERFORMED');
    await expect(pageA.locator('li[data-check-code="LIVENESS"]')).toContainText('NOT_PERFORMED');
    await expect(pageA.locator('body')).toContainText('CONSENT_REQUIRED');
    await pageA.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.locator('#ivpConsentForm')).toBeVisible();
    const sessionId = await pageA.locator('#ivpConsentForm input[name="session_id"]').inputValue();
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    const ownedLink = await savedClientLink(applicationA.application_key, sessionId);
    const idempotentCreate = await pageA.evaluate(async () => {
      const response = await fetch('/api/ivp/session_create');
      return { status: response.status, body: await response.json() };
    });
    expect(idempotentCreate.status).toBe(200);
    const sameSession = await pageA.evaluate(async () => {
      const response = await fetch('/api/ivp/session_latest');
      return { status: response.status, body: await response.json() };
    });
    expect(sameSession.status).toBe(200);
    expect(sameSession.body.session.session_id).toBe(sessionId);

    tenantFixture = await createOtherTenantSession();
    const otherTenantRead = await pageA.evaluate(async id => (await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`)).status, tenantFixture.sessionId);
    expect(otherTenantRead).toBe(404);
    await tenantFixture.cleanup();
    tenantFixture = undefined;

    const contextB = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const pageB = await contextB.newPage();
    pageB.setDefaultTimeout(15_000);
    pageB.setDefaultNavigationTimeout(30_000);
    try {
      await registerAndSignIn(pageB, baseURL, citizenB);
      const applicationB = await createDraft(pageB, baseURL, { ageGroup: '16_17', name: 'SYNTHETIC', surname: 'GUARDIAN-TEST' });
      await expect(pageB.getByText('Guardian consent is still required', { exact: false })).toBeVisible();
      await expect(pageB.getByText('This saved draft cannot be submitted.', { exact: false })).toBeVisible();
      await expect(pageB.getByRole('button', { name: 'Submit to local demonstration' })).toBeHidden();

      const latestB = await pageB.evaluate(async () => {
        const response = await fetch('/api/ivp/session_latest');
        return { status: response.status, body: await response.json() };
      });
      expect(latestB.status).toBe(200);
      expect(latestB.body.session?.session_id).toBeFalsy();

      const foreignRead = await pageB.evaluate(async id => (await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`)).status, sessionId);
      expect(foreignRead).toBe(404);
      const foreignConsent = await postForm(pageB, '/api/ivp/consent', { session_id: sessionId, consent_accepted: '1' });
      expect(foreignConsent.status).toBe(404);
      const foreignReview = await postForm(pageB, '/api/ivp/review', {
        session_id: sessionId,
        name: 'SYNTHETIC',
        document_number: 'TEST-000042',
        date_of_birth: '2000 01 01',
        nationality: 'SYNTHETIC',
      });
      expect(foreignReview.status).toBe(404);
      const foreignDocument = await pageB.evaluate(async id => {
        const form = new FormData();
        form.set('session_id', id);
        form.set('document_file', new File(['synthetic'], 'synthetic.png', { type: 'image/png' }));
        return (await fetch('/api/ivp/document_upload', { method: 'POST', body: form })).status;
      }, sessionId);
      expect(foreignDocument).toBe(404);

      const createOwnB = await pageB.evaluate(async () => (await fetch('/api/ivp/session_create')).status);
      expect(createOwnB).toBe(200);
      const ownSessionB = await pageB.evaluate(async () => (await fetch('/api/ivp/session_latest')).json());
      expect(ownSessionB.session.session_id).not.toBe(sessionId);
      const linkedB = await savedClientLink(applicationB.application_key, ownSessionB.session.session_id);
      expect(linkedB.clientId).toBe(ownedLink.clientId);
      expect(ownSessionB.session.session_id).not.toBe(sessionId);
    } finally {
      await contextB.close();
    }

    await pageA.locator('#ivpConsentAccepted').check();
    const consentPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/consent');
    await pageA.getByRole('button', { name: 'Record test consent' }).click();
    expect((await consentPromise).status()).toBe(200);
    await expect(pageA.locator('#ivpDocumentUploadForm')).toBeVisible();
    const afterConsent = await pageA.evaluate(async () => (await fetch('/api/ivp/session_latest')).json());
    expect(afterConsent.session.session_id).toBe(sessionId);
    expect(afterConsent.session.status).toBe('IN_PROGRESS');
    await savedClientLink(applicationA.application_key, sessionId);

    const document = await syntheticDocument(pageA);
    await pageA.locator('#ivpDocumentFile').setInputFiles({ name: 'synthetic-citizen-document.png', mimeType: 'image/png', buffer: document });
    const uploadPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/document_upload');
    await pageA.getByRole('button', { name: 'Upload and run local OCR' }).click();
    expect((await uploadPromise).status()).toBe(200);
    await expect(pageA.locator('#ivpReviewForm')).toBeVisible({ timeout: 60_000 });
    await expect(pageA.locator('#ivpReviewName')).toHaveValue('SAMPLE PERSON');
    await pageA.locator('#ivpReviewName').fill('SAMPLE PERSON CORRECTED');
    const reviewPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/review');
    await pageA.getByRole('button', { name: 'Save reviewed fields' }).click();
    expect((await reviewPromise).status()).toBe(200);
    await expect(pageA.locator('#ivpSelfieUploadForm')).toBeVisible();
    await savedClientLink(applicationA.application_key, sessionId);

    const selfie = await pageA.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      return canvas.toDataURL('image/png').split(',')[1];
    });
    await pageA.locator('#ivpSelfieFile').setInputFiles({ name: 'synthetic-selfie.png', mimeType: 'image/png', buffer: Buffer.from(selfie, 'base64') });
    const selfiePromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/selfie_upload');
    await pageA.getByRole('button', { name: 'Save synthetic selfie evidence' }).click();
    expect((await selfiePromise).status()).toBe(200);

    const latestA = await pageA.evaluate(async () => {
      const response = await fetch('/api/ivp/session_latest');
      return { status: response.status, body: await response.json() };
    });
    expect(latestA.status).toBe(200);
    expect(latestA.body.session).toMatchObject({ session_id: sessionId, status: 'REVIEW_REQUIRED' });
    expect(latestA.body.ocr_results[0].extracted_fields.name).toBe('SAMPLE PERSON');
    expect(latestA.body.ocr_results[0].corrected_fields.name).toBe('SAMPLE PERSON CORRECTED');
    const checks = Object.fromEntries(latestA.body.checks.map(check => [check.check_code, check.status]));
    expect(checks).toMatchObject({
      DOCUMENT_CAPTURE: 'COMPLETED',
      OCR_EXTRACTION: 'COMPLETED',
      OCR_REVIEW: 'COMPLETED',
      SELFIE_CAPTURE: 'COMPLETED',
      DOCUMENT_AUTHENTICITY: 'UNAVAILABLE',
      AUTHORITATIVE_IDENTITY: 'UNAVAILABLE',
      LIVENESS: 'NOT_PERFORMED',
    });
    expect(checks.FACE_COMPARISON).toBe('FAILED');
    const faceCheck = latestA.body.checks.find(check => check.check_code === 'FACE_COMPARISON');
    const faceDetails = typeof faceCheck.details_json === 'string' ? JSON.parse(faceCheck.details_json) : faceCheck.details_json;
    expect(faceDetails.error_code).toBe('NO_FACE');
    await savedClientLink(applicationA.application_key, sessionId);

    const loaded = await pageA.evaluate(async id => {
      const response = await fetch(`/api/ivp/session_load?session_id=${encodeURIComponent(id)}`);
      return { status: response.status, body: await response.json() };
    }, sessionId);
    expect(loaded.status).toBe(200);
    expect(loaded.body.session.session_id).toBe(sessionId);
    expect(loaded.body.ocr_results[0].corrected_fields.name).toBe('SAMPLE PERSON CORRECTED');

    await pageA.goto(new URL('/verification/preview', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.locator('#ivpReviewForm')).toBeVisible();
    await captureResponsiveScreens(pageA, 'Verification session', 'verification-capture');
    await pageA.keyboard.press('Tab');
    expect(await pageA.evaluate(() => Boolean(document.activeElement?.getClientRects().length))).toBeTruthy();

    await pageA.goto(new URL('/verification/preview/review', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Completed and pending checks' })).toBeVisible();
    await expect(pageA.locator('li[data-check-code="OCR_EXTRACTION"]')).toContainText('COMPLETED');
    await expect(pageA.locator('li[data-check-code="LIVENESS"]')).toContainText('NOT_PERFORMED');
    await expect(pageA.locator('body')).toContainText('Identity and citizenship remain REVIEW_REQUIRED');
    await expect(pageA.locator('body')).toContainText('SAMPLE PERSON CORRECTED');
    await captureResponsiveScreens(pageA, 'Completed and pending checks', 'verification-results');

    await pageA.goto(new URL('/citizen/apply/first-time', baseURL).toString(), { waitUntil: 'networkidle' });
    await pageA.getByRole('button', { name: 'Review saved draft' }).click();
    const applicationIvpPanel = pageA.locator('section[aria-labelledby="application-ivp-heading"]');
    await expect(applicationIvpPanel).toBeVisible();
    await expect(applicationIvpPanel.getByText('Session status:', { exact: false })).toContainText('REVIEW_REQUIRED');
    await expect(applicationIvpPanel).toContainText('FACE_COMPARISON');
    await expect(applicationIvpPanel).toContainText('FAILED');
    await expect(applicationIvpPanel).toContainText('LIVENESS');
    await expect(applicationIvpPanel).toContainText('NOT_PERFORMED');
    await expect(applicationIvpPanel).toContainText('AUTHORITATIVE_IDENTITY');
    await expect(applicationIvpPanel).toContainText('UNAVAILABLE');
    await expect(applicationIvpPanel.getByText('Identity and citizenship remain REVIEW_REQUIRED', { exact: false })).toBeVisible();
    await captureResponsiveScreens(pageA, '8. Review application', 'application-review');
    const passportCurrent = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
    expect(passportCurrent.applications[0]).toMatchObject({
      application_key: applicationA.application_key,
      status: 'DRAFT',
      identity_status: 'REVIEW_REQUIRED',
      citizenship_status: 'REVIEW_REQUIRED',
    });

    const assetErrors = await pageA.evaluate(async () => {
      const urls = [...document.querySelectorAll('img[src], link[rel="stylesheet"][href], script[src]')].map(el => el.src || el.href).filter(url => url && new URL(url).origin === location.origin && !new URL(url).pathname.startsWith('/api/'));
      return Promise.all(urls.map(async url => ({ url: new URL(url).pathname, status: (await fetch(url, { method: 'HEAD' })).status })));
    });
    expect(assetErrors.filter(item => item.status >= 400)).toEqual([]);
    expect(failedPageResources).toEqual([]);
    expect(uncaughtErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    if (tenantFixture) await tenantFixture.cleanup();
    await contextA.close();
  }
});
