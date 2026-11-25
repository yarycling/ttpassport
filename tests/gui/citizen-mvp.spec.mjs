import { mkdir, readFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { expect, test } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const screenshots = path.join(repoRoot, 'docs/evidence/TTP-4A-5C/screenshots');
const passportConnection = JSON.parse(await readFile(path.join(repoRoot, 'app/modules/connections/passport.json'), 'utf8'));

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

async function cleanSyntheticAccounts(emails) {
  const connection = await mysql.createConnection({ ...passportConnection.options.connection, connectTimeout: 2500 });
  try {
    const [accounts] = await connection.execute(
      `SELECT id FROM citizen_accounts WHERE email IN (${emails.map(() => '?').join(',')})`,
      emails,
    );
    const ids = accounts.map(row => row.id);
    if (!ids.length) return;
    const marks = ids.map(() => '?').join(',');
    await connection.execute(`DELETE FROM passport_applications WHERE account_id IN (${marks})`, ids);
    await connection.execute(`DELETE FROM applicant_profiles WHERE account_id IN (${marks})`, ids);
    await connection.execute(`DELETE FROM citizen_accounts WHERE id IN (${marks})`, ids);
  } finally {
    await connection.end();
  }
}

async function citizenAccountState(email) {
  const connection = await mysql.createConnection({ ...passportConnection.options.connection, connectTimeout: 2500 });
  try {
    const [rows] = await connection.execute(
      'SELECT status, email_verified, password_hash FROM citizen_accounts WHERE email = ?',
      [email],
    );
    return rows[0];
  } finally {
    await connection.end();
  }
}

async function checkResponsive(page, routeName, heading) {
  const widths = [1440, 1024, 768, 375];
  await mkdir(screenshots, { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    const size = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(Math.max(size.document, size.body), `${routeName} horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    if (routeName === 'application-first-time') {
      const layout = await page.evaluate(() => {
        const panel = document.querySelector('.application-backdrop aside > .info-panel--gold');
        const footer = document.querySelector('.government-footer');
        return {
          panelBottom: panel.getBoundingClientRect().bottom + window.scrollY,
          footerTop: footer.getBoundingClientRect().top + window.scrollY,
        };
      });
      expect(layout.panelBottom, `application content overlaps the footer at ${width}px`).toBeLessThanOrEqual(layout.footerTop + 1);
    }
    await page.screenshot({ path: path.join(screenshots, `${routeName}-${width}.png`), fullPage: true });
  }
}

test('CT-4A5C-002 through CT-4A5C-010 — citizen account, profile, first-time draft, ownership, responsive GUI and eKYC separation', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const emailA = `codex.4a5c.${crypto.randomUUID()}@example.test`;
  const emailB = `codex.4a5c.${crypto.randomUUID()}@example.test`;
  const passwordA = `${crypto.randomBytes(24).toString('base64url')}Aa9!`;
  const passwordB = `${crypto.randomBytes(24).toString('base64url')}Bb8!`;
  const contextA = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const pageA = await contextA.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedLocalResources = [];
  pageA.on('console', message => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) consoleErrors.push(message.text());
  });
  pageA.on('pageerror', error => pageErrors.push(error.message));
  pageA.on('response', response => {
    const url = new URL(response.url());
    if (response.status() >= 400 && !url.pathname.startsWith('/api/')) failedLocalResources.push(`${response.status()} ${url.pathname}`);
  });

  try {
    await pageA.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
    const anonymousRead = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).status);
    expect(anonymousRead).toBe(401);

    await pageA.goto(new URL('/account/register', baseURL).toString(), { waitUntil: 'networkidle' });
    await checkResponsive(pageA, 'account-register', 'Create an account');
    await pageA.setViewportSize({ width: 1440, height: 960 });
    await pageA.locator('#register-email').focus();
    await pageA.keyboard.press('Tab');
    expect(await pageA.evaluate(() => document.activeElement.id)).toBe('register-password');
    await pageA.keyboard.press('Tab');
    expect(await pageA.evaluate(() => document.activeElement.id)).toBe('register-confirm');

    await pageA.locator('#register-email').fill(emailA);
    await pageA.locator('#register-password').fill(passwordA);
    await pageA.locator('#register-confirm').fill(passwordA);
    const registrationResponsePromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/register');
    await pageA.getByRole('button', { name: 'Create account' }).click();
    const registrationResponse = await registrationResponsePromise;
    expect(registrationResponse.status()).toBe(200);
    const registrationBody = await registrationResponse.text();
    expect(registrationBody).not.toContain(passwordA);
    expect(registrationBody).not.toMatch(/password_hash|passwordHash/i);
    const registeredAccount = await citizenAccountState(emailA);
    expect(registeredAccount.status).toBe('ACTIVE');
    expect(Number(registeredAccount.email_verified)).toBe(0);
    expect(registeredAccount.password_hash).toMatch(/^\$argon2id\$/);
    expect(registeredAccount.password_hash).not.toBe(passwordA);
    await expect(pageA.getByRole('status').filter({ hasText: 'Email remains unverified' })).toBeVisible();

    const mismatch = await postForm(pageA, '/api/citizen/register', {
      email: `mismatch.${crypto.randomUUID()}@example.test`, password: passwordA, password_confirm: `${passwordA}x`,
    });
    expect(mismatch.status).toBe(400);
    const duplicate = await postForm(pageA, '/api/citizen/register', { email: emailA, password: passwordA, password_confirm: passwordA });
    expect(duplicate.status).toBe(409);

    await pageA.goto(new URL('/account/sign-in', baseURL).toString(), { waitUntil: 'networkidle' });
    await checkResponsive(pageA, 'account-sign-in', 'Sign in');
    await pageA.setViewportSize({ width: 1440, height: 960 });
    await pageA.locator('#signin-email').fill(emailA);
    await pageA.locator('#signin-password').fill(`${passwordA}wrong`);
    const invalidLoginPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/login');
    await pageA.getByRole('button', { name: 'Sign in', exact: true }).click();
    const invalidLogin = await invalidLoginPromise;
    expect(invalidLogin.status()).not.toBe(200);
    await pageA.locator('#signin-password').fill(passwordA);
    const loginPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/login');
    await pageA.getByRole('button', { name: 'Sign in', exact: true }).click();
    const loginResponse = await loginPromise;
    expect(loginResponse.status()).toBe(200);
    await expect(pageA.getByRole('link', { name: 'Continue to your dashboard' })).toBeVisible();

    await pageA.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Applicant profile' })).toBeVisible();
    await pageA.locator('#profile-first-name').fill('SYNTHETIC');
    await pageA.locator('#profile-surname').fill('SAMPLE');
    await pageA.locator('#profile-mobile').fill('+1 555 0100');
    await pageA.locator('#profile-residence').fill('Testland');
    const profileSavePromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/profile_save');
    await pageA.getByRole('button', { name: 'Save profile' }).click();
    expect((await profileSavePromise).status()).toBe(200);
    await pageA.reload({ waitUntil: 'networkidle' });
    await expect(pageA.locator('#profile-first-name')).toHaveValue('SYNTHETIC');
    await expect(pageA.locator('#profile-residence')).toHaveValue('Testland');
    const profileState = await pageA.evaluate(async () => {
      const response = await fetch('/api/citizen/profile_load');
      return { status: response.status, body: await response.json() };
    });
    expect(profileState.status).toBe(200);
    expect(profileState.body.profiles[0]).toMatchObject({ first_name: 'SYNTHETIC', surname: 'SAMPLE', country_of_residence: 'Testland' });

    const createDraftPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_create');
    await pageA.getByRole('button', { name: 'Start a first-time draft' }).click();
    expect((await createDraftPromise).status()).toBe(200);
    await expect(pageA.getByRole('link', { name: 'Resume and review' })).toBeVisible();
    await pageA.getByRole('link', { name: 'Resume and review' }).click();
    await expect(pageA.getByRole('heading', { name: '1. Eligibility screening' })).toBeVisible();
    await expect(pageA.getByRole('button', { name: 'Save and continue' })).toBeVisible();
    const currentBefore = await pageA.evaluate(async () => {
      const response = await fetch('/api/citizen/application_current');
      return { status: response.status, body: await response.json() };
    });
    expect(currentBefore.status).toBe(200);
    expect(currentBefore.body.applications).toHaveLength(1);
    const draft = currentBefore.body.applications[0];
    expect(draft).toMatchObject({ status: 'DRAFT', age_screening_status: 'REVIEW_REQUIRED', identity_status: 'REVIEW_REQUIRED', citizenship_status: 'REVIEW_REQUIRED' });
    expect(draft.application_key).toMatch(/^[0-9a-f-]{36}$/i);
    expect(draft).not.toHaveProperty('account_id');
    expect(draft).not.toHaveProperty('password_hash');
    const createAgain = await postForm(pageA, '/api/citizen/application_create', {});
    expect(createAgain.status).toBe(200);
    const currentAfterRepeatedCreate = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
    expect(currentAfterRepeatedCreate.applications).toHaveLength(1);

    await pageA.locator('#ageGroupSelfReported').selectOption('UNDER_16');
    await expect(pageA.getByText('You may keep a development draft, but this screen does not make an eligibility decision or allow submission.')).toBeVisible();
    await pageA.locator('#ageGroupSelfReported').selectOption('16_17');
    await expect(pageA.getByText('Guardian consent is required under the project’s approved design. The separate guardian workflow is not part of this increment, so these drafts cannot be submitted.')).toBeVisible();
    await pageA.locator('#ageGroupSelfReported').selectOption('18_PLUS');
    await expect(pageA.getByText('This is a self-report only. Age and eligibility remain subject to official review.')).toBeVisible();
    await pageA.locator('#ageGroupSelfReported').selectOption('16_17');
    await pageA.locator('#app-previous_tt_document-1').check();
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    await expect(pageA.getByRole('heading', { name: '2. Personal information' })).toBeVisible();

    await pageA.locator('#app-first_name').fill('SYNTHETIC');
    await pageA.locator('#app-middle_names').fill('TEST');
    await pageA.locator('#app-surname').fill('APPLICANT');
    await pageA.locator('#app-date_of_birth').fill('2009-03-15');
    await pageA.locator('#app-sex_as_on_form').selectOption('Female');
    await pageA.locator('#app-place_of_birth_town').fill('Sample Town');
    await pageA.locator('#app-place_of_birth_country').fill('Testland');
    await pageA.locator('#app-home_street').fill('1 Synthetic Street');
    await pageA.locator('#app-home_city').fill('Sample City');
    await pageA.locator('#app-home_country').fill('Testland');
    await pageA.locator('#app-contact_email').fill(emailA);
    await pageA.getByRole('button', { name: 'Save and continue' }).click();
    await expect(pageA.getByRole('heading', { name: '3. Citizenship and family information' })).toBeVisible();

    await pageA.locator('#app-basis_birth').check();
    await pageA.locator('#app-basis_descent').check();
    await pageA.locator('#app-birth_certificate_pin').fill('SYNTHETIC-PIN-01');
    await pageA.locator('#app-birth_certificate_number').fill('SYNTHETIC-CERT-01');
    await pageA.locator('#app-mother_maiden_surname').fill('SYNTHETIC FAMILY');
    await pageA.locator('#app-father_first_name').fill('SYNTHETIC FATHER');
    await pageA.locator('#app-other_citizenship-1').check();
    await pageA.locator('#app-other_citizenship_country').fill('Testland');
    await pageA.locator('#app-prior_document_number').fill('SYNTHETIC-DOC-01');
    await pageA.locator('#app-prior_document_place').fill('Sample Office');
    const saveDraftPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/application_save');
    await pageA.getByRole('button', { name: 'Save and review' }).click();
    expect((await saveDraftPromise).status()).toBe(200);
    await expect(pageA.getByRole('heading', { name: '8. Review saved draft' })).toBeVisible();
    const reviewPanel = pageA.locator('section[aria-labelledby="stage-eight-heading"]');
    await expect(reviewPanel.locator('.col-md-6').filter({ hasText: 'Identity status' })).toContainText('REVIEW_REQUIRED');
    await expect(reviewPanel.locator('.col-md-6').filter({ hasText: 'Citizenship status' })).toContainText('REVIEW_REQUIRED');
    await expect(reviewPanel.locator('.col-md-6').filter({ hasText: 'Age screening status' })).toContainText('REVIEW_REQUIRED');

    const saved = await pageA.evaluate(async () => {
      const response = await fetch('/api/citizen/application_current');
      return { status: response.status, body: await response.json() };
    });
    expect(saved.status).toBe(200);
    expect(saved.body.applications).toHaveLength(1);
    const savedDraft = saved.body.applications[0];
    expect(savedDraft).toMatchObject({
      application_key: draft.application_key,
      status: 'DRAFT',
      age_group_self_reported: '16_17',
      first_name: 'SYNTHETIC',
      surname: 'APPLICANT',
      date_of_birth: expect.stringContaining('2009-03-15'),
      home_country: 'Testland',
      basis_birth: 1,
      basis_descent: 1,
      previous_tt_document: 1,
      prior_document_number: 'SYNTHETIC-DOC-01',
      age_screening_status: 'REVIEW_REQUIRED',
      identity_status: 'REVIEW_REQUIRED',
      citizenship_status: 'REVIEW_REQUIRED',
    });
    await pageA.reload({ waitUntil: 'networkidle' });
    await expect(pageA.locator('#app-first_name')).toHaveValue('SYNTHETIC');
    await expect(pageA.locator('#app-basis_descent')).toBeChecked();
    await pageA.getByRole('button', { name: 'Review saved draft' }).click();
    await expect(pageA.getByRole('heading', { name: '8. Review saved draft' })).toBeVisible();

    const formLabels = await pageA.locator('#citizenDraftForm input:not([type="hidden"]), #citizenDraftForm select, #citizenDraftForm textarea').evaluateAll(elements => elements.map(el => ({ id: el.id, labelled: el.id && Boolean(document.querySelector(`label[for="${CSS.escape(el.id)}"]`) || el.closest('fieldset')?.querySelector('legend')) })));
    expect(formLabels.filter(item => item.id).every(item => item.labelled)).toBeTruthy();

    await pageA.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: 'Your passport dashboard' })).toBeVisible();
    await expect(pageA.getByRole('link', { name: 'Resume and review' })).toBeVisible();
    await checkResponsive(pageA, 'citizen-dashboard', 'Your passport dashboard');
    await pageA.goto(new URL('/citizen/apply/first-time', baseURL).toString(), { waitUntil: 'networkidle' });
    await expect(pageA.getByRole('heading', { name: '1. Eligibility screening' })).toBeVisible();
    await checkResponsive(pageA, 'application-first-time', 'Application information');

    await pageA.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
    const logoutPromise = pageA.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/logout');
    await pageA.getByRole('button', { name: 'Sign out' }).click();
    expect((await logoutPromise).status()).toBe(200);
    const signedOutRead = await pageA.evaluate(async () => (await fetch('/api/citizen/application_current')).status);
    expect(signedOutRead).toBe(401);

    const contextB = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const pageB = await contextB.newPage();
    try {
      await pageB.goto(new URL('/account/register', baseURL).toString(), { waitUntil: 'networkidle' });
      await pageB.locator('#register-email').fill(emailB);
      await pageB.locator('#register-password').fill(passwordB);
      await pageB.locator('#register-confirm').fill(passwordB);
      const registerBPromise = pageB.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/register');
      await pageB.getByRole('button', { name: 'Create account' }).click();
      expect((await registerBPromise).status()).toBe(200);
      await pageB.goto(new URL('/account/sign-in', baseURL).toString(), { waitUntil: 'networkidle' });
      await pageB.locator('#signin-email').fill(emailB);
      await pageB.locator('#signin-password').fill(passwordB);
      const loginBPromise = pageB.waitForResponse(response => new URL(response.url()).pathname === '/api/citizen/login');
      await pageB.getByRole('button', { name: 'Sign in', exact: true }).click();
      expect((await loginBPromise).status()).toBe(200);
      await pageB.goto(new URL('/citizen/dashboard', baseURL).toString(), { waitUntil: 'networkidle' });
      const profileB = await pageB.evaluate(async () => (await fetch('/api/citizen/profile_load')).json());
      expect(profileB.profiles[0]).not.toMatchObject({ first_name: 'SYNTHETIC', surname: 'SAMPLE' });
      const currentB = await pageB.evaluate(async () => (await fetch('/api/citizen/application_current')).json());
      expect(currentB.applications).toHaveLength(0);
      const alteredKey = await postForm(pageB, '/api/citizen/application_save', { application_key: draft.application_key, current_step: '3' });
      expect(alteredKey.status).toBe(404);
    } finally {
      await contextB.close();
    }

    const widths = [1440, 1024, 768, 375];
    for (const width of widths) {
      await pageA.setViewportSize({ width, height: 960 });
      await pageA.goto(new URL('/account/sign-in', baseURL).toString(), { waitUntil: 'networkidle' });
      const size = await pageA.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      expect(size, `sign-in horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
      await pageA.screenshot({ path: path.join(screenshots, `account-sign-in-${width}.png`), fullPage: true });
    }
    expect(pageErrors).toEqual([]);
    expect(failedLocalResources).toEqual([]);
    expect(consoleErrors).toEqual([]);
  } finally {
    await Promise.allSettled([contextA.close()]);
    await cleanSyntheticAccounts([emailA, emailB]);
  }
});
