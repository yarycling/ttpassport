# TTP-4F — Citizen Account and IVP Integration

**Date:** 2026-11-24
**Status:** TESTING — owner acceptance pending
**Starting commit:** `ae12d891173c84792fe315397bd505816b7fe853`
**Environment:** Wappler 7.9.9 Development app at `http://127.0.0.1:3002`; Node.js v23.6.0; Playwright 1.65.1 / Chromium; Passport Development database and isolated IVP Development MySQL 8.4.13 (`ivp_dev`).

## Implementation

The citizen flow now starts or resumes the existing Wappler IVP session for the authenticated user's current first-time draft. The Passport `application_key` is stored only as a client-scoped IVP reference; Passport applicant and draft data remain in the Passport database, and IVP subjects, sessions, consents, evidence, OCR review references and checks remain in IVP. No Passport table or SQLite `db` configuration was changed.

Existing Wappler Security Providers, Server Connect actions and App Connect screens are reused for consent, document upload, OCR correction, selfie capture, results and ownership checks. The IVP result view now scopes session lookup to the authenticated citizen's current draft. The application review includes saved applicant, family/citizenship and prior-document fields, missing mapped fields, the linked session and its check statuses. Self-reported identity, age and citizenship remain `REVIEW_REQUIRED`; a 16–17 draft displays the guardian requirement and cannot be submitted. The application remains a draft.

Migration `002_client_subject_references` adds nullable client-scoped references and owner-presence constraints to IVP tables only. It introduces no Passport-to-IVP foreign key. The Development schema was already migrated; an identity-checked idempotent recheck confirmed all five reference columns on MySQL 8.4.13. Rollback is provided in `migrations/ivp/002_client_subject_references.down.sql` and requires client-reference rows to be removed or migrated first.

One eKYC regression was fixed: the face-consent lookup compared a nullable client-subject reference for the IVP demo account and skipped the face action. Session ownership is already proven by the preceding owner-scoped lookup, so the redundant nullable-reference predicate was removed. The regression now records the actual `NO_FACE` result for the synthetic blank image; it does not create a match score or identity assertion.

## Acceptance criteria

| ID | Criterion |
|---|---|
| AC-4F-001 | An authenticated citizen can create or resume one IVP session linked to the current owned first-time draft through an opaque client-scoped reference. |
| AC-4F-002 | Existing consent, OCR, correction, selfie, face-comparison and liveness actions remain in IVP and results can be retrieved after refresh. |
| AC-4F-003 | Another citizen or another IVP tenant cannot read, link, replace or update the session. |
| AC-4F-004 | Results show actual completed, pending, failed, unavailable and not-performed states; no incomplete check becomes verified. |
| AC-4F-005 | Application review shows saved applicant and mapped family/citizenship/prior-document fields, missing mapped values, IVP status and 16–17 guardian notice. |
| AC-4F-006 | Account, Passport draft and IVP records remain separate; the Passport application is not submitted and legal identity/citizenship remain `REVIEW_REQUIRED`. |
| AC-4F-007 | Existing Wappler routes, port 3002 and SQLite `db` remain unchanged; the affected UI works at the four required widths with keyboard and accessible-label checks. |
| AC-4F-008 | Email testing uses no permanent bypass; Stage 4B remains blocked until verification and recovery functionality exists. |

## Automated test results

| Test ID | Acceptance | Environment / command | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
| CT-4F-001 | AC-4F-001–006 | Wappler Development; `cd tests && npx playwright test gui/citizen-ivp.spec.mjs --config playwright.config.mjs` | Register/sign in two synthetic citizens; save and resume a draft; link and persist a session; exercise consent, OCR, correction, selfie and results; deny cross-citizen/tenant access; show pending and final statuses. | 1/1 passed. Same session/application reference persisted; OCR originals and correction reloaded; the synthetic no-face result was `FAILED`; liveness stayed `NOT_PERFORMED`; overall status stayed `REVIEW_REQUIRED`. Cross-citizen and cross-tenant reads/writes returned 404. | PASS | `screenshots/` at 1440, 1024, 768 and 375 px |
| CT-4F-002 | AC-4F-005–007 | Wappler Development; `cd tests && npx playwright test gui/citizen-mvp.spec.mjs --config playwright.config.mjs` | Existing registration, login, draft save/resume/review and ownership regression remains functional. | 1/1 passed. | PASS | `docs/evidence/TTP-4A-5C/IMPLEMENTATION_AND_TEST_RECORD.md` |
| CT-4F-003 | AC-4F-002,004,006 | Wappler Development; `cd tests && npx playwright test gui/ekyc.spec.mjs --config playwright.config.mjs` | Existing IVP consent, OCR, correction, upload validation, no-face error handling, persistence and ownership continue to work. | 1 test passed; existing real-score test was skipped because its private fixture paths were unset. No-face detail persisted after the fix. | PASS with separate blocked score retest | `tests/gui/ekyc.spec.mjs` |
| CT-4F-004 | AC-4F-002 | Wappler Development; `cd tests && npx playwright test gui/ekyc.spec.mjs --config playwright.config.mjs` with `IVP_FACE_TEST_DOCUMENT_PATH` and `IVP_FACE_TEST_SELFIE_PATH` unset | Run the same-person/nonmatch score regression using approved local fixtures. | The test reported skipped; no fixture paths were available in this environment. Prior actual YuNet/SFace results remain recorded in the Stage 3G POC record. | BLOCKED | `docs/evidence/TTP-3G-3H-BIOMETRIC-POC-01/OPEN_SOURCE_BIOMETRIC_POC_RESULTS_2026-11-24.md` |
| CT-4F-005 | AC-4F-002,004 | Wappler Development; `cd tests && npx playwright test gui/liveness.spec.mjs --config playwright.config.mjs --grep 'camera denial and local model failure'` | Camera denial/model failure must remain non-completed and retryable. | 1/1 passed. This was a focused regression; no new camera or replay test was run. | PASS | `tests/gui/liveness.spec.mjs`; prior live-camera and replay dispositions remain in `docs/evidence/TTP-3H/RETEST_2026-11-24.md` |
| CT-4F-006 | AC-4F-007 | Wappler Development; `cd tests && npx playwright test gui/routes.spec.mjs --config playwright.config.mjs` | All accepted routes render at 1440, 1024, 768 and 375 px with no overflow, broken resources, console errors or unlabeled controls; keyboard navigation works. | 64/64 passed, covering the 15-route inventory, four widths, navigation, protected draft view and back-office preview tabs. | PASS | `tests/gui/routes.spec.mjs`; current affected-screen captures are in `screenshots/` |
| CT-4F-007 | AC-4F-007 | `node tests/scripts/config-check.mjs`; `curl` to `/verification/preview` | Port 3002, SQLite `db` and accepted route inventory remain unchanged; app responds. | Configuration check passed; local route returned HTTP 200. | PASS | `tests/scripts/config-check.mjs` |
| CT-4F-008 | AC-4F-003,006 | `node tests/database/ivp-client-subject-references.mjs --target=ivp-development --direction=up` | Confirm the intended Development schema identity and migration state without rerunning DDL. | MySQL 8.4.13 identity matched; all client-subject reference columns already existed. No DDL ran. | PASS | `tests/database/ivp-client-subject-references.mjs`; migration files under `migrations/ivp/` |
| CT-4F-009 | AC-4F-006,007 | `node tests/scripts/security-scan.mjs` | No credentials, private evidence, or sensitive test material in changes intended for publication. | Scanner reported no configured secret/private-file patterns in its changed-file scan. The private camera/image directories are ignored and are not staged. | PASS | `tests/scripts/security-scan.mjs` |
| CT-4F-010 | AC-4F-007 | Review of Stage 4F screenshots against approved visual baseline | Compare affected screens with a suitable approved baseline. | Screenshots were captured and visually inspected at the required sizes; no approved baseline exists for the newly integrated citizen/IVP state, so a pixel comparison cannot be claimed. | BLOCKED | `screenshots/`; prior citizen-screen captures are not an approved Stage 4F baseline |
| CT-4F-011 | AC-4F-008 | Read-only loopback check of MailHog UI and SMTP listener | Identify an available local Development email-testing route without sending mail or bypassing verification. | UI returned HTTP 200 at `127.0.0.1:8025`; SMTP listener reachable at `127.0.0.1:1025`. No message was sent and no verification flow exists. | PASS for availability only | Stage 4B remains `BLOCKED`; local MailHog is available when a verification flow is implemented |

## UI and evidence

The browser test captured the dashboard, saved application review, verification capture and results at 1440, 1024, 768 and 375 px. The responsive checks found no horizontal overflow. Automated checks covered keyboard focus, visible labels, console errors, failed resources, draft persistence and the guardian warning. Captures contain synthetic test values only. The images were visually reviewed; formal visual-regression comparison is `BLOCKED` because no approved Stage 4F baseline exists.

## Limitations and outstanding items

- The current same-person/nonmatch score test needs the two expressly authorized local fixture paths to be supplied to the test environment. The prior Stage 3G actual comparison evidence is preserved; this Stage 4F run did not repeat those comparisons.
- No camera session or screen-replay test was repeated. The prior liveness finding and replay disposition are preserved unchanged.
- Local MailHog is available, but citizen email verification and recovery are not implemented; Stage 4B remains `BLOCKED`.
- Stage 4F remains `TESTING`. The owner can review the desktop journey, but the missing Stage 4F visual baseline and real-score fixture prevent a complete automated acceptance recommendation. GUI acceptance remains pending.
- Mobile camera, guardian consent, government submission, authoritative identity/citizenship checks and production email are not part of this increment.

## Rollback

Revert the Stage 4F Wappler action and view changes. Apply `migrations/ivp/002_client_subject_references.down.sql` only after all client-reference rows in IVP have been removed or migrated; the rollback intentionally restores non-null demo-user ownership and will fail if external-client rows remain. No Passport schema, SQLite connection, Wappler-generated runtime or port configuration was changed.
