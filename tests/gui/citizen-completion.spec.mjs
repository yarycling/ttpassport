import crypto from 'node:crypto';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { expect, test } from '@playwright/test';
import { completeDevelopmentEmailVerification, waitForDevelopmentMailLink } from './helpers/mailhog.mjs';

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const evidenceRoot = path.join(repoRoot, 'docs/evidence/TTP-4B-5E-5J');
const screenshots = path.join(evidenceRoot, 'screenshots/citizen-completion');
const passportConnection = JSON.parse(await readFile(path.join(repoRoot, 'app/modules/connections/passport.json'), 'utf8'));

function newUser(label) {
  return {
    email: `codex.${label}.${crypto.randomUUID()}@example.test`,
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
    const bodyText = await response.text();
    let body;
    try { body = JSON.parse(bodyText); } catch { body = bodyText; }
    return { status: response.status, body };
  }, { pathname, fields });
}

async function registerVerified(page, user) {
  await page.goto('/account/register', { waitUntil: 'networkidle' });
  await page.locator('#register-email').fill(user.email);
  await page.locator('#register-password').fill(user.password);
  await page.locator('#register-confirm').fill(user.password);
  const registerResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/register');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  expect((await registerResponse).status()).toBe(200);
  const blockedLogin = await postForm(page, '/api/citizen/login', { email: user.email, password: user.password });
  expect(blockedLogin.status).not.toBe(200);
  expect((await completeDevelopmentEmailVerification(page, user.email)).status).toBe(200);
}

async function signIn(page, user) {
  await page.goto('/account/sign-in', { waitUntil: 'networkidle' });
  await page.locator('#signin-email').fill(user.email);
  await page.locator('#signin-password').fill(user.password);
  const loginResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await loginResponse).status()).toBe(200);
}

async function readPassportAccounts(emails) {
  const connection = await mysql.createConnection({ ...passportConnection.options.connection, connectTimeout: 2500 });
  try {
    const marks = emails.map(() => '?').join(',');
    return await connection.execute(`SELECT id, email, email_verified, password_hash FROM citizen_accounts WHERE email IN (${marks})`, emails);
  } finally {
    await connection.end();
  }
}

async function cleanupSyntheticAccounts(emails) {
  const connection = await mysql.createConnection({ ...passportConnection.options.connection, connectTimeout: 2500 });
  const storageDirectory = path.resolve(repoRoot, 'storage/passport_dev/applications');
  try {
    const [accounts] = await connection.execute(
      `SELECT id FROM citizen_accounts WHERE email IN (${emails.map(() => '?').join(',')})`, emails,
    );
    const accountIds = accounts.map(row => row.id);
    if (!accountIds.length) return;
    const marks = accountIds.map(() => '?').join(',');
    const [applications] = await connection.execute(
      `SELECT id FROM passport_applications WHERE account_id IN (${marks})`, accountIds,
    );
    const applicationIds = applications.map(row => row.id);
    if (applicationIds.length) {
      const appMarks = applicationIds.map(() => '?').join(',');
      const [files] = await connection.execute(
        `SELECT storage_key FROM passport_application_evidence WHERE application_id IN (${appMarks})`, applicationIds,
      );
      for (const file of files) {
        if (!file.storage_key || path.basename(file.storage_key) !== file.storage_key) continue;
        const filePath = path.resolve(storageDirectory, file.storage_key);
        if (filePath.startsWith(`${storageDirectory}${path.sep}`)) await unlink(filePath).catch(() => {});
      }
      await connection.execute(`DELETE FROM passport_application_demo_submissions WHERE account_id IN (${marks})`, accountIds);
      await connection.execute(`UPDATE passport_application_evidence SET replaces_evidence_id = NULL WHERE application_id IN (${appMarks})`, applicationIds);
      await connection.execute(`DELETE e FROM passport_application_evidence e JOIN passport_applications a ON a.id = e.application_id WHERE a.account_id IN (${marks})`, accountIds);
      await connection.execute(`DELETE r FROM passport_application_references r JOIN passport_applications a ON a.id = r.application_id WHERE a.account_id IN (${marks})`, accountIds);
      await connection.execute(`DELETE r FROM passport_application_recommenders r JOIN passport_applications a ON a.id = r.application_id WHERE a.account_id IN (${marks})`, accountIds);
    }
    await connection.execute(`DELETE FROM citizen_password_recovery_tokens WHERE account_id IN (${marks})`, accountIds);
    await connection.execute(`DELETE FROM citizen_email_verification_tokens WHERE account_id IN (${marks})`, accountIds);
    await connection.execute(`DELETE FROM passport_applications WHERE account_id IN (${marks})`, accountIds);
    await connection.execute(`DELETE FROM applicant_profiles WHERE account_id IN (${marks})`, accountIds);
    await connection.execute(`DELETE FROM citizen_accounts WHERE id IN (${marks})`, accountIds);
  } finally {
    await connection.end();
  }
}

async function checkWidths(page, heading, filename) {
  await mkdir(screenshots, { recursive: true });
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(Math.max(dimensions.document, dimensions.body), `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: path.join(screenshots, `${filename}-${width}.png`), fullPage: true });
  }
}

test('CT-4B-001/002 and CT-5E-001 through CT-5J-002 — citizen email, evidence, review, IVP link and demo submission', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const citizen = newUser('completion-a');
  const otherCitizen = newUser('completion-b');
  const contextA = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const pageA = await contextA.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedPageResources = [];
  const failedApiResponses = [];
  pageA.on('console', message => {
    if (message.type() === 'error' && !/^Failed to load resource: the server responded with a status of \d{3} /.test(message.text())) {
      consoleErrors.push(message.text());
    }
  });
  pageA.on('pageerror', error => pageErrors.push(error.message));
  pageA.on('response', response => {
    const url = new URL(response.url());
    if (response.status() >= 500 && url.pathname.startsWith('/api/')) failedApiResponses.push(`${response.status()} ${url.pathname}`);
    if (response.status() >= 400 && !url.pathname.startsWith('/api/')) failedPageResources.push(`${response.status()} ${url.pathname}`);
  });
  let contextB;
  let verificationSessionId;
  let applicationKey;
  let evidenceKey;

  try {
    await pageA.goto(baseURL, { waitUntil: 'networkidle' });
    const anonymous = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).status);
    expect(anonymous).toBe(401);

    await pageA.goto('/account/register', { waitUntil: 'networkidle' });
    await checkWidths(pageA, 'Create an account', 'account-register');
    await pageA.setViewportSize({ width: 1440, height: 960 });
    await pageA.locator('#register-email').focus();
    await pageA.keyboard.press('Tab');
    expect(await pageA.evaluate(() => document.activeElement.id)).toBe('register-password');

    await registerVerified(pageA, citizen);
    const accountState = await readPassportAccounts([citizen.email]);
    expect(accountState[0]).toHaveLength(1);
    expect(Number(accountState[0][0].email_verified)).toBe(1);

    await pageA.goto('/account/forgot-password', { waitUntil: 'networkidle' });
    const unknownRecovery = await postForm(pageA, '/api/citizen/password_recovery_request', { email: `missing.${crypto.randomUUID()}@example.test` });
    expect(unknownRecovery.status).toBe(200);
    await pageA.locator('#forgot-email').fill(citizen.email);
    const recoveryResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/password_recovery_request');
    await pageA.getByRole('button', { name: 'Send recovery email' }).click();
    expect((await recoveryResponse).status()).toBe(200);
    const recoveryLink = await waitForDevelopmentMailLink(citizen.email, '/account/reset-password');
    const recoveryToken = new URL(recoveryLink).searchParams.get('token');
    const replacementPassword = `${crypto.randomBytes(24).toString('base64url')}Cc7!`;
    await pageA.goto(recoveryLink, { waitUntil: 'networkidle' });
    await pageA.locator('#reset-password').fill(replacementPassword);
    await pageA.locator('#reset-confirm').fill(replacementPassword);
    const resetResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/password_recovery_complete');
    await pageA.getByRole('button', { name: 'Update password' }).click();
    expect((await resetResponse).status()).toBe(200);
    const reusedRecovery = await postForm(pageA, '/api/citizen/password_recovery_complete', {
      token: recoveryToken, password: replacementPassword, password_confirm: replacementPassword,
    });
    expect([409, 410]).toContain(reusedRecovery.status);
    expect((await readPassportAccounts([citizen.email]))[0][0].password_hash).toMatch(/^\$argon2id\$/);
    const oldPasswordLogin = await postForm(pageA, '/api/citizen/login', { email: citizen.email, password: citizen.password });
    expect(oldPasswordLogin.status).not.toBe(200);
    await signIn(pageA, { ...citizen, password: replacementPassword });

    await pageA.goto('/citizen/apply/first-time', { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Begin a first-time draft' })).toBeVisible();
    const createResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_create');
    await pageA.getByRole('button', { name: 'Start draft' }).click();
    expect((await createResponse).status()).toBe(200);
    await pageA.locator('#ageGroupSelfReported').selectOption('18_PLUS');
    await pageA.locator('#app-previous_tt_document-0').check();
    let saveResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    expect((await saveResponse).status()).toBe(200);
    await expect(pageA.getByRole('heading', { name: '2. Personal information' })).toBeVisible();

    await pageA.locator('#app-first_name').fill('SYNTHETIC');
    await pageA.locator('#app-middle_names').fill('CITIZEN');
    await pageA.locator('#app-surname').fill('DEMONSTRATION');
    await pageA.locator('#app-date_of_birth').fill('1990-02-15');
    await pageA.locator('#app-sex_as_on_form').selectOption('Female');
    await pageA.locator('#app-place_of_birth_town').fill('Sample Town');
    await pageA.locator('#app-place_of_birth_country').fill('Testland');
    await pageA.locator('#app-home_street').fill('1 Synthetic Street');
    await pageA.locator('#app-home_city').fill('Sample City');
    await pageA.locator('#app-home_country').fill('Testland');
    await pageA.locator('#app-contact_email').fill(citizen.email);
    saveResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    expect((await saveResponse).status()).toBe(200);
    await expect(pageA.getByRole('heading', { name: '3. Citizenship and family information' })).toBeVisible();

    await pageA.locator('#app-basis_birth').check();
    await pageA.locator('#app-birth_certificate_pin').fill('SYNTHETIC-PIN');
    await pageA.locator('#app-birth_certificate_number').fill('SYNTHETIC-CERT');
    await pageA.locator('#app-mother_maiden_surname').fill('SYNTHETIC FAMILY');
    await pageA.locator('#app-father_first_name').fill('SYNTHETIC PARENT');
    await pageA.locator('#app-father_surname').fill('SAMPLE');
    await pageA.locator('#app-other_citizenship-0').check();
    saveResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    expect((await saveResponse).status()).toBe(200);
    await expect(pageA.getByRole('heading', { name: '4. Proposed recommender and personal references' })).toBeVisible();

    await pageA.locator('#recommender-first-name').fill('SYNTHETIC RECOMMENDER');
    await pageA.locator('#recommender-surname').fill('SAMPLE');
    await pageA.locator('#recommender-occupation').fill('Test Occupation');
    await pageA.locator('#recommender-city').fill('Sample City');
    await pageA.locator('#recommender-country').fill('Testland');
    await pageA.locator('#recommender-years').fill('5');
    await pageA.locator('#reference1-first-name').fill('SYNTHETIC REFERENCE ONE');
    await pageA.locator('#reference1-surname').fill('SAMPLE');
    await pageA.locator('#reference1-city').fill('Sample City');
    await pageA.locator('#reference1-country').fill('Testland');
    await pageA.locator('#reference1-years').fill('3');
    await pageA.locator('#reference1-relative').selectOption('YES');
    await pageA.locator('#reference2-first-name').fill('SYNTHETIC REFERENCE TWO');
    await pageA.locator('#reference2-surname').fill('SAMPLE');
    await pageA.locator('#reference2-city').fill('Sample City');
    await pageA.locator('#reference2-country').fill('Testland');
    await pageA.locator('#reference2-years').fill('2');
    const peopleResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_people_save');
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    expect((await peopleResponse).status()).toBe(200);
    await expect(pageA.getByRole('heading', { name: '5. Supporting documents' })).toBeVisible();

    const invalidFileResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_supporting_evidence');
    await pageA.locator('#supporting-document-file').setInputFiles({
      name: 'synthetic-invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC INVALID TEST FILE'),
    });
    await pageA.getByRole('button', { name: 'Upload supporting document' }).click();
    expect([400, 413]).toContain((await invalidFileResponse).status());

    const oversizedFileResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_supporting_evidence');
    await pageA.locator('#supporting-document-file').setInputFiles({
      name: 'synthetic-oversized.png', mimeType: 'image/png', buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    });
    await pageA.getByRole('button', { name: 'Upload supporting document' }).click();
    expect([400, 413]).toContain((await oversizedFileResponse).status());

    const syntheticPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p0sAAAAASUVORK5CYII=', 'base64');
    const uploadResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_supporting_evidence');
    await pageA.locator('#supporting-document-file').setInputFiles({ name: 'synthetic-supporting-proof.png', mimeType: 'image/png', buffer: syntheticPng });
    await pageA.getByRole('button', { name: 'Upload supporting document' }).click();
    expect((await uploadResponse).status()).toBe(200);
    const applicationState = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
    applicationKey = applicationState.applications[0].application_key;
    const evidenceState = await pageA.evaluate(async key => {
      const response = await fetch(`/api/citizen/application_evidence_list?application_key=${encodeURIComponent(key)}`);
      return { status: response.status, body: await response.json() };
    }, applicationKey);
    expect(evidenceState.status).toBe(200);
    const uploadedEvidence = evidenceState.body.evidence.find(item => item.evidence_kind === 'SUPPORTING_DOCUMENT');
    expect(uploadedEvidence).toMatchObject({ document_category: 'IDENTITY', evidence_status: 'ACTIVE', version_number: 1 });
    evidenceKey = uploadedEvidence.evidence_key;
    const evidenceDownload = await pageA.evaluate(async key => (await fetch(`/api/citizen/application_evidence_download?evidence_key=${encodeURIComponent(key)}`)).status, evidenceKey);
    expect(evidenceDownload).toBe(200);

    const replacementResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_supporting_evidence');
    await pageA.locator('#supporting-document-file').setInputFiles({ name: 'synthetic-supporting-proof-v2.png', mimeType: 'image/png', buffer: syntheticPng });
    await pageA.getByRole('button', { name: 'Upload supporting document' }).click();
    expect((await replacementResponse).status()).toBe(200);
    const replacementState = await pageA.evaluate(async key => {
      const response = await fetch(`/api/citizen/application_evidence_list?application_key=${encodeURIComponent(key)}`);
      return { status: response.status, body: await response.json() };
    }, applicationKey);
    expect(replacementState.status).toBe(200);
    const supportingVersions = replacementState.body.evidence.filter(item => item.evidence_kind === 'SUPPORTING_DOCUMENT');
    expect(supportingVersions).toHaveLength(2);
    expect(supportingVersions.map(item => [item.version_number, item.evidence_status]).sort((a, b) => a[0] - b[0])).toEqual([
      [1, 'REPLACED'], [2, 'ACTIVE'],
    ]);
    evidenceKey = supportingVersions.find(item => item.evidence_status === 'ACTIVE').evidence_key;

    await pageA.getByRole('button', { name: 'Continue to passport photo' }).click();
    await expect(pageA.getByRole('heading', { name: '6. Proposed passport photograph' })).toBeVisible();
    const photoResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_passport_photo');
    await pageA.locator('#passport-photo-file').setInputFiles({ name: 'synthetic-passport-photo.png', mimeType: 'image/png', buffer: syntheticPng });
    await pageA.getByRole('button', { name: 'Save proposed photo' }).click();
    expect((await photoResponse).status()).toBe(200);
    await expect(pageA.getByRole('region', { name: 'Proposed passport photograph' }).getByAltText('Applicant-provided proposed passport photograph')).toBeVisible();
    const photoState = await pageA.evaluate(async key => {
      const response = await fetch(`/api/citizen/application_passport_photo_current?application_key=${encodeURIComponent(key)}`);
      return { status: response.status, body: await response.json() };
    }, applicationKey);
    expect(photoState.status).toBe(200);
    expect(photoState.body.photo[0]).toMatchObject({ evidence_status: 'ACTIVE', version_number: 1, mime_type: 'image/png' });

    await pageA.goto('/verification/preview', { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('button', { name: 'Start or resume identity checks' })).toBeVisible();
    const sessionCreate = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/session_create');
    await pageA.getByRole('button', { name: 'Start or resume identity checks' }).click();
    expect((await sessionCreate).status()).toBe(200);
    await expect(pageA.locator('#ivpConsentForm')).toBeVisible();
    verificationSessionId = await pageA.locator('#ivpConsentForm input[name="session_id"]').inputValue();
    expect(verificationSessionId).toMatch(/^[0-9a-f-]{36}$/i);
    await pageA.locator('#ivpConsentAccepted').check();
    const consentResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/ivp/consent');
    await pageA.getByRole('button', { name: 'Record test consent' }).click();
    expect((await consentResponse).status()).toBe(200);

    await pageA.goto('/citizen/apply/first-time', { waitUntil: 'networkidle' });
    await pageA.getByRole('button', { name: 'Review saved draft' }).click();
    const ivpPanel = pageA.locator('section[aria-labelledby="application-ivp-heading"]');
    await expect(ivpPanel).toContainText('IN_PROGRESS');
    const reviewPanel = pageA.locator('section[aria-labelledby="stage-eight-heading"]');
    await expect(reviewPanel).toContainText('SYNTHETIC RECOMMENDER');
    await expect(reviewPanel).toContainText('SYNTHETIC REFERENCE ONE');
    await expect(reviewPanel).toContainText('SYNTHETIC REFERENCE TWO');
    await expect(reviewPanel).toContainText('SYNTHETIC-CERT');
    const reviewEvidence = pageA.locator('section[aria-labelledby="review-evidence-heading"]');
    await expect(reviewEvidence).toContainText('IDENTITY');
    await expect(reviewEvidence).toContainText('Proposed passport photo');
    await expect(reviewEvidence).toContainText('REPLACED');
    await expect(reviewEvidence).toContainText('ACTIVE');
    await expect(reviewEvidence).toContainText('v2');
    await expect(reviewEvidence.getByText('No Passport application evidence is recorded.')).toBeHidden();
    await expect(reviewPanel).toContainText('REVIEW_REQUIRED');
    await expect(reviewPanel).toContainText('NOT_RECEIVED');
    await expect(reviewPanel.getByRole('heading', { name: 'Blank mapped fields to review' })).toBeVisible();
    await expect(reviewPanel.getByAltText('Applicant-provided proposed passport photograph')).toHaveCount(1);
    await expect(reviewPanel.getByAltText('Applicant-provided proposed passport photograph')).toBeVisible();
    const peopleState = await pageA.evaluate(async key => {
      const response = await fetch(`/api/citizen/application_people_current?application_key=${encodeURIComponent(key)}`);
      return { status: response.status, body: await response.json() };
    }, applicationKey);
    expect(peopleState.status).toBe(200);
    expect(peopleState.body.recommender[0]).toMatchObject({ data_source: 'APPLICANT_PROVIDED', declaration_status: 'NOT_RECEIVED', first_name: 'SYNTHETIC RECOMMENDER' });
    expect(peopleState.body.reference1[0].first_name).toBe('SYNTHETIC REFERENCE ONE');
    expect(peopleState.body.reference2[0].first_name).toBe('SYNTHETIC REFERENCE TWO');

    await mkdir(screenshots, { recursive: true });
    for (const width of [1440, 1024, 768, 375]) {
      await pageA.setViewportSize({ width, height: 960 });
      const documentWidth = await pageA.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      expect(documentWidth, `application review horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
      await pageA.screenshot({ path: path.join(screenshots, `application-review-${width}.png`), fullPage: true });
    }
    await pageA.setViewportSize({ width: 1440, height: 960 });
    const unlabeledControls = await pageA.locator('input:not([type="hidden"]), select, textarea').evaluateAll(elements => elements
      .filter(element => element.getClientRects().length)
      .filter(element => !element.labels?.length && !element.closest('fieldset')?.querySelector('legend'))
      .map(element => element.id || element.name || element.tagName));
    expect(unlabeledControls).toEqual([]);

    contextB = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const pageB = await contextB.newPage();
    await registerVerified(pageB, otherCitizen);
    await signIn(pageB, otherCitizen);
    const foreignApplicationRead = await pageB.evaluate(async key => (await fetch(`/api/citizen/application_people_current?application_key=${encodeURIComponent(key)}`)).status, applicationKey);
    const foreignEvidenceList = await pageB.evaluate(async key => (await fetch(`/api/citizen/application_evidence_list?application_key=${encodeURIComponent(key)}`)).status, applicationKey);
    const foreignPhoto = await pageB.evaluate(async key => (await fetch(`/api/citizen/application_passport_photo_current?application_key=${encodeURIComponent(key)}`)).status, applicationKey);
    const foreignSubmission = await pageB.evaluate(async key => (await fetch(`/api/citizen/application_submission_current?application_key=${encodeURIComponent(key)}`)).status, applicationKey);
    const foreignEvidenceDownload = await pageB.evaluate(async key => (await fetch(`/api/citizen/application_evidence_download?evidence_key=${encodeURIComponent(key)}`)).status, evidenceKey);
    expect([foreignApplicationRead, foreignEvidenceList, foreignPhoto, foreignSubmission, foreignEvidenceDownload]).toEqual([404, 404, 404, 404, 404]);

    const bDraftCreate = pageB.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_create');
    await pageB.goto('/citizen/apply/first-time', { waitUntil: 'networkidle' });
    await pageB.getByRole('button', { name: 'Start draft' }).click();
    expect((await bDraftCreate).status()).toBe(200);
    await pageB.locator('#ageGroupSelfReported').selectOption('16_17');
    let bSave = pageB.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageB.getByRole('button', { name: 'Save and continue' }).click();
    expect((await bSave).status()).toBe(200);
    await pageB.locator('#app-date_of_birth').fill('2009-03-15');
    bSave = pageB.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageB.getByRole('button', { name: 'Save and continue' }).click();
    expect((await bSave).status()).toBe(200);
    const bApplication = await pageB.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
    const teenSubmission = await postForm(pageB, '/api/citizen/application_demo_submit', { application_key: bApplication.applications[0].application_key });
    expect(teenSubmission.status).not.toBe(200);
    const alteredApplication = await postForm(pageB, '/api/citizen/application_save', { application_key: applicationKey, current_step: '1', first_name: 'FOREIGN CHANGE' });
    expect(alteredApplication.status).toBe(404);

    const demoSubmitResponse = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_demo_submit');
    await pageA.getByRole('button', { name: 'Submit to local demonstration' }).click();
    const demoSubmit = await demoSubmitResponse;
    const demoSubmitBody = await demoSubmit.json();
    expect(demoSubmit.status(), JSON.stringify(demoSubmitBody)).toBe(200);
    await expect(pageA.locator('body')).toContainText('DEMO_SUBMITTED — local Development only.');
    await expect(pageA.locator('body')).toContainText('This review shows the IVP session linked to the saved demonstration snapshot.');
    await expect(pageA.getByRole('button', { name: 'Submit to local demonstration' })).toBeHidden();
    const submitted = await pageA.evaluate(async key => {
      const [applicationResponse, submissionResponse, sessionResponse] = await Promise.all([
        fetch('/api/citizen/application_current'),
        fetch(`/api/citizen/application_submission_current?application_key=${encodeURIComponent(key)}`),
        fetch('/api/ivp/session_latest'),
      ]);
      return {
        application: (await applicationResponse.json()).applications[0],
        submission: await submissionResponse.json(),
        session: await sessionResponse.json(),
      };
    }, applicationKey);
    expect(submitted.application).toMatchObject({ status: 'DEMO_SUBMITTED', identity_status: 'REVIEW_REQUIRED', citizenship_status: 'REVIEW_REQUIRED' });
    expect(submitted.submission.submission[0]).toMatchObject({ submission_status: 'DEMO_SUBMITTED', ivp_application_ref: applicationKey, snapshot_version: 1 });
    expect(submitted.submission.submission[0].internal_demo_reference).toMatch(/^DEMO-[0-9a-f-]{36}$/i);
    expect(submitted.session.session.session_id).toBe(verificationSessionId);
    const frozenDraft = await postForm(pageA, '/api/citizen/application_save', { application_key: applicationKey, current_step: '1', first_name: 'EDIT AFTER SNAPSHOT' });
    const frozenPeople = await postForm(pageA, '/api/citizen/application_people_save', {
      application_key: applicationKey,
      first_name: 'EDIT AFTER SNAPSHOT',
      surname: 'SAMPLE',
      occupation: 'Test Occupation',
      firm_name: '',
      address_street: '1 Synthetic Street',
      address_city: 'Sample City',
      address_postal_code: '00000',
      address_country: 'Testland',
      office_telephone: '',
      home_telephone: '',
      years_known: '5',
      reference1_first_name: 'SYNTHETIC REFERENCE ONE',
      reference1_surname: 'SAMPLE',
      reference1_address_street: '2 Synthetic Street',
      reference1_address_city: 'Sample City',
      reference1_address_postal_code: '00000',
      reference1_address_country: 'Testland',
      reference1_telephone: '',
      reference1_years_known: '3',
      reference1_not_relative: '0',
      reference2_first_name: 'SYNTHETIC REFERENCE TWO',
      reference2_surname: 'SAMPLE',
      reference2_address_street: '3 Synthetic Street',
      reference2_address_city: 'Sample City',
      reference2_address_postal_code: '00000',
      reference2_address_country: 'Testland',
      reference2_telephone: '',
      reference2_years_known: '2',
      reference2_not_relative: '0',
    });
    expect(frozenDraft.status).toBe(404);
    expect(frozenPeople.status).toBe(404);

    const browserRoutes = [
      ['/account/verify-email', 'Email verification', 'verify-email'],
      ['/account/forgot-password', 'Forgot your password?', 'forgot-password'],
      ['/account/reset-password', 'Set a new password', 'reset-password'],
      ['/citizen/apply/first-time', 'Application information', 'application-submitted'],
    ];
    for (const [route, heading, filename] of browserRoutes) {
      await pageA.goto(route, { waitUntil: 'networkidle' });
      await expect(pageA.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await checkWidths(pageA, heading, filename);
      await pageA.setViewportSize({ width: 1440, height: 960 });
      const unlabeledControls = await pageA.locator('main input:not([type="hidden"]), main select, main textarea').evaluateAll(elements => elements
        .filter(element => element.getClientRects().length)
        .filter(element => !element.labels?.length && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby'))
        .map(element => element.id || element.name || element.tagName));
      expect(unlabeledControls, `unlabeled form controls on ${route}`).toEqual([]);
      const firstKeyboardControl = pageA.locator('main input:not([type="hidden"]), main select, main textarea, main button:not(:disabled), main a[href]').first();
      if (await firstKeyboardControl.count()) {
        await firstKeyboardControl.focus();
        await pageA.keyboard.press('Tab');
        expect(await pageA.evaluate(() => Boolean(document.activeElement?.getClientRects().length)), `keyboard focus lost on ${route}`).toBeTruthy();
      }
      const resourceFailures = await pageA.evaluate(async () => {
        const resources = [...document.querySelectorAll('img[src], link[rel="stylesheet"][href], script[src]')]
          .map(element => element.src || element.href)
          .filter(resource => resource && new URL(resource).origin === location.origin && !new URL(resource).pathname.startsWith('/api/'));
        const responses = await Promise.all(resources.map(async resource => ({
          path: new URL(resource).pathname,
          status: (await fetch(resource, { method: 'HEAD' })).status,
        })));
        return responses.filter(resource => resource.status >= 400);
      });
      expect(resourceFailures).toEqual([]);
    }
    await pageA.goto('/citizen/apply/first-time', { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Application information', exact: true })).toBeVisible();
    await expect(pageA.locator('body')).toContainText('DEMO_SUBMITTED — local Development only.');
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedApiResponses).toEqual([]);
    expect(failedPageResources).toEqual([]);
  } finally {
    await Promise.allSettled([contextA.close(), contextB?.close()]);
    await cleanupSyntheticAccounts([citizen.email, otherCitizen.email]);
  }
});
