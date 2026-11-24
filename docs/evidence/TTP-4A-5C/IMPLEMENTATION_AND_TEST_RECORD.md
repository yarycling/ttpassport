# Citizen Account and First-Time Draft Vertical Slice

**Packages:** TTP-4A–4E and TTP-5A–5C
**Implementation baseline:** owner direction in “DESKTOP EKYC MVP HANDOFF AND NEXT DEVELOPMENT PRIORITY”, 2026-11-24
**Starting commit:** `93c188edd1a3b31f46c782d6efb4e5fe5f2183e5`
**Environment:** Wappler 7.9.9 Development, port 3002; MySQL 8.4.13 Passport Development (`passport_dev`, loopback port 3308); SQLite `db` remains the application’s existing default; IVP remains separate.

## Scope and acceptance criteria

| Acceptance ID | Criterion |
|---|---|
| AC-4A5C-001 | A citizen can register and authenticate through a distinct Wappler Database Security Provider using Argon2id; passwords and account secrets never appear in responses. |
| AC-4A5C-002 | A signed-in citizen can save and reload their own profile; the backend derives account ownership from the Wappler session. |
| AC-4A5C-003 | A signed-in citizen can create, save, resume and review one persistent first-time draft; all reads and writes are scoped to the authenticated owner. |
| AC-4A5C-004 | Eligibility screening is explicitly self-reported. The 16+ first-time scope, 16–17 guardian requirement and prior-document answer are displayed without automated legal rejection or approval. |
| AC-4A5C-005 | Personal, family and citizenship fields follow `docs/requirements/PASSPORT_FORM_MAPPING.md`; unsupported field requiredness and basis exclusivity are not invented. |
| AC-4A5C-006 | Citizen accounts, profiles and passport drafts use the Passport database only; IVP tables and the Wappler SQLite `db` connection remain untouched. |
| AC-4A5C-007 | Identity, citizenship and age-screening results remain `REVIEW_REQUIRED`; no submission, government lookup, payment, identity assertion or issuance is available. |
| AC-4A5C-008 | The 15 accepted routes and port 3002 remain unchanged; the account, dashboard and first-time screens retain the approved government styling and work responsively. |
| AC-4A5C-009 | Email verification and recovery are not presented as active while no approved delivery configuration exists. Development account status and unverified email state remain explicit. |

## Command test plan

| Test ID | Acceptance ID | Test |
|---|---|---|
| CT-4A5C-001 | AC-4A5C-006 | Confirm MySQL server, database and schema principal identity; apply the versioned Passport migration to isolated Development and Test databases only. |
| CT-4A5C-002 | AC-4A5C-001, AC-4A5C-009 | Register a synthetic account, reject password mismatch and duplicate email, sign in/out, and verify account secrets are absent from responses. |
| CT-4A5C-003 | AC-4A5C-001 | Reject unauthenticated access to protected profile and draft actions; reject invalid credentials. |
| CT-4A5C-004 | AC-4A5C-002 | Save, reload and isolate a synthetic profile across two citizen accounts. |
| CT-4A5C-005 | AC-4A5C-003, AC-4A5C-007 | Create one first-time draft, verify opaque key and truthful pending statuses, and ensure repeated creation resumes the existing draft. |
| CT-4A5C-006 | AC-4A5C-003, AC-4A5C-005 | Save mapped personal, family, prior-document and citizenship-basis fields and verify persistence after reload. |
| CT-4A5C-007 | AC-4A5C-002, AC-4A5C-003 | Attempt cross-account profile/draft access and altered draft-key writes; confirm no other owner’s data is returned or changed. |
| CT-4A5C-008 | AC-4A5C-004, AC-4A5C-007 | Exercise self-reported under-16, 16–17, and 18+ paths; preserve guardian requirement and `REVIEW_REQUIRED` statuses. |
| CT-4A5C-009 | AC-4A5C-008 | Run browser flows across 1440, 1024, 768 and 375 px; check overflow, navigation, keyboard access, labels, console and failed resources; retain screenshots. |
| CT-4A5C-010 | AC-4A5C-008 | Run the established route suite and existing eKYC browser regression; confirm all 15 routes still load and eKYC behavior remains unchanged. |
| CT-4A5C-011 | AC-4A5C-006, AC-4A5C-009 | Run configuration and secret-exposure checks; verify only intended local config is ignored and no credentials or synthetic account data are staged. |

## Results

Executed by Codex on 2026-11-24 against the running Wappler 7.9.9 Development app at `127.0.0.1:3002`. Passport Test and Development are isolated MySQL 8.4.13 databases. The project remains based on commit `93c188edd1a3b31f46c782d6efb4e5fe5f2183e5` on `main`; all changes below are uncommitted. Playwright used Chromium. Synthetic accounts and drafts created by the browser test were removed after each run.

| Test ID | Environment / command | Actual result | Status |
|---|---|---|---|
| CT-4A5C-001 | `TTP2B_SECRETS_DIR=… node tests/database/apply-citizen-mvp-migration.mjs`; isolated Passport Test/Development MySQL | Passport Test and Development each report the complete three-table migration present on MySQL 8.4.13. The implementation run applied the migration in both isolated databases; its Test-only rollback removed the three Passport tables, preserved the existing synthetic probe, and the migration was reapplied. Final verification was read-only. | PASS |
| CT-4A5C-002 | `npm run test:gui -- --grep CT-4A5C`; Wappler Server Connect registration | Synthetic registration succeeded with Argon2id hash storage. Password mismatch returned 400, duplicate email returned 409, and response bodies did not contain the password or hash. Account email remains unverified and is labelled as such. | PASS |
| CT-4A5C-003 | Same citizen browser test; anonymous API requests and invalid login | Anonymous profile/draft access was denied (401); invalid credentials did not authenticate. | PASS |
| CT-4A5C-004 | Same citizen browser test; two synthetic accounts | Profile save and reload succeeded for the owner. The second account saw no first-account profile data. | PASS |
| CT-4A5C-005 | Same citizen browser test; repeated draft creation | One owner-scoped first-time draft was created with an opaque UUID key. Repeating create returned the existing draft. Age, identity and citizenship statuses remained `REVIEW_REQUIRED`. | PASS |
| CT-4A5C-006 | Same citizen browser test; mapped fields | Personal, family, prior-document and citizenship-basis fields saved and reloaded. No unapproved requiredness or citizenship-basis exclusivity was added. | PASS |
| CT-4A5C-007 | Same citizen browser test; altered key and cross-account requests | A second account received no draft; an altered/foreign draft key write returned 404 and did not change another account’s data. | PASS |
| CT-4A5C-008 | Same citizen browser test; self-reported age paths | Under-16, 16–17 and 18+ guidance displayed correctly. The 16–17 guardian requirement was explained; no path produced an eligibility decision, submission or verified status. | PASS |
| CT-4A5C-009 | `npm run test:gui -- --grep CT-4A5C`; 1440, 1024, 768 and 375 px | Registration, sign-in, dashboard and first-time draft screens passed overflow, keyboard, labels, browser console and resource checks. A 375 px footer overlap was found, corrected in `ttpassport-theme.css`, and guarded by a Playwright assertion; the citizen test passed again across all four widths. Screenshots are in `screenshots/`. | PASS |
| CT-4A5C-010 | `npm run test:gui`; route, citizen, OCR/session and liveness regression | First full run: 69 passed, one skipped, one CT-3H-006 failure. All 64 route/browser checks passed across 15 routes and four widths. Citizen flow and synthetic OCR/session/ownership regression passed. The CT-3H-006 local-model-failure case failed on an immediate result read, then its isolated rerun passed 1/1. The YuNet/SFace comparison test was skipped because private same-person/nonmatch fixture paths were unavailable; no eKYC comparison code changed in this package. | PASS after targeted retest; first-run failure preserved |
| CT-4A5C-011 | `node tests/scripts/config-check.mjs`; `node tests/scripts/security-scan.mjs`; Wappler action JSON parse | Port 3002, SQLite `db`, and the accepted 15 route/layout entries were unchanged. All nine citizen Server Connect JSON files parsed. The final security scan checked 45 changed/untracked files and the current diff against `origin/main`; it found no configured secret/private-file patterns. The local `passport` connection and `citizen` Security Provider files are ignored and were not staged. | PASS |

### Visual comparison and evidence

- `npm run test:visual` passed all four unchanged home/back-office baseline comparisons: 0.40–0.74% differing pixels (1.00% tolerance for font rasterization). Captures are in `screenshots/visual-baseline/`.
- Account, dashboard and first-time screens were pixel-compared against committed Stage 3 static-preview captures using the top 900 px (full-page heights differ) and visually reviewed. Differences were: dashboard 7.19% desktop / 15.33% mobile; registration 1.67% / 11.75%; sign-in 2.77% / 10.71%; first-time application 7.89% / 15.63%. These reflect replaced preview text, interactive forms and mobile wrapping; the government header, colours, card treatment and navigation remain consistent. The 375 px first-time screen now places the footer after the final guidance panel with no overlap.
- Citizen screenshots: `screenshots/account-register-{1440,1024,768,375}.png`, `account-sign-in-*`, `citizen-dashboard-*`, and `application-first-time-*`.
- The original TTP-3D, TTP-3E and TTP-3H screenshot records overwritten during browser testing were restored from the starting commit; the new evidence is kept under this package.

### Wappler, data separation and rollback

- Registration, authentication, profile and draft behavior use Wappler Server Connect actions, the Wappler `citizen` Security Provider, Wappler Database actions, App Connect forms/events and Bootstrap 5. No custom application framework or generated Wappler runtime file was added or modified.
- Citizen accounts, applicant profiles and drafts use the separate Passport `passport` connection. The existing SQLite `db` and IVP `ivpDemo` data/connection remain separate. No eKYC records, tables or code are duplicated or linked in this increment.
- `migrations/passport/001_citizen_mvp.down.sql` is the table-scoped rollback. Test-only rollback was exercised; Development rollback was not run because the demo tables and synthetic evidence are in use. No production database is configured or touched.
- Shared local Wappler connection/provider configuration is ignored and required on a separately configured developer machine. Email verification, account recovery and delivery are not active.
- Physical mobile-device testing remains deferred. The 375 px screenshots are responsive browser checks, not device-camera acceptance.

Human GUI/business acceptance remains `PENDING`. No package is `CLOSED_PASS`.

## Known policy and service boundaries

- The source form’s field-level requiredness, values, limits, and electronic equivalents remain subject to Immigration/legal approval.
- The form instructions require scheduled in-person appearance. The online draft is not a complete passport application.
- Email delivery, address verification and account recovery are unavailable until an approved Development mailer configuration is supplied.
- The 16–17 guardian workflow is Stage 5D and is not implemented here.
- eKYC remains a separate IVP. Stage 4F integration is not part of this increment; no passport record points directly into IVP tables.
- Human GUI/business acceptance is pending; no Stage 4 or Stage 5 package is `CLOSED_PASS`.
