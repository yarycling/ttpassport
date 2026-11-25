# MVP Release Candidate 01 — Test and Readiness Record

**Scope:** Stable non-production desktop demonstration of the adult first-time citizen application and existing IVP workflow.

**Starting commit:** `7ad6a85c3d4ac720df189b324b680155969bd00d`

**Implementation commit:** `1de48fc29c7704fb8bd80866ccd3844b89de2446` — adult citizen MVP and desktop release-candidate tests.

**Environment:** Wappler 7.9.9 Development at `http://127.0.0.1:3002`; Node v23.6.0; Playwright 1.65.1 / Chromium; MySQL Community Server 8.4.13 Development; local MailHog at `http://127.0.0.1:8025`; synthetic records only.
**GUI acceptance:** PENDING owner review. No Stage 4 or Stage 5 package is closed.

## Focused automated results

| Test | Acceptance | Method | Actual result | Status | Evidence |
|---|---|---|---|---|---|
| CT-4B-001/002, CT-5E-001–CT-5J-002 | Email verification/recovery, private evidence, review, demo submission and ownership boundaries | `npm --prefix tests run test:gui -- gui/citizen-completion.spec.mjs gui/citizen-ivp.spec.mjs gui/citizen-mvp.spec.mjs` | 3/3 browser specs passed. MailHog verification and recovery worked; unverified login and token reuse were denied; adult demo snapshot/reference persisted; another account could not access or replace the application/evidence; a self-reported 16–17 application remained blocked from demo submission. Responsive checks covered 1440, 1024, 768 and 375 px; keyboard focus and browser-console assertions passed; no page-level horizontal overflow was reported. | PASS | [full implementation record](../TTP-4B-5E-5J/IMPLEMENTATION_AND_TEST_RECORD_2026-11-24.md); [responsive screenshots](../TTP-4B-5E-5J/screenshots/) |
| CT-3H-003–007 regression | Local liveness assets, session ownership, denial, retry, cancellation and unusable-video outcomes | `npm --prefix tests run test:gui -- gui/liveness.spec.mjs` | 4/4 browser cases passed. Negative paths did not produce a completed result. This automated rerun did not repeat a live-camera session. | PASS | Prior fresh, consented desktop execution and limitations: [Stage 3H retest](../TTP-3H/RETEST_2026-11-24.md) |
| CT-4F / CT-REG citizen-to-IVP regression | Linked session, ownership, persistence and existing citizen/eKYC behavior | Included in the 3-spec browser command above | 2/2 named regression specs passed; session remained IVP-owned and application-scoped. Current linked-session test did not run a new face pair. | PASS for tested scope | [IVP regression screenshots](../TTP-4B-5E-5J/screenshots/ivp-regression/) |
| CT-3H-009 face-comparison regression | Same-person and different-person specimen pairs yield actual persisted descriptive scores, without an approved match threshold | Previously executed with the explicitly consented local test set | Same-person and nonmatching Wappler runs passed (2/2); the same-person score was higher, numeric results and provider/model were persisted, and the session remained `REVIEW_REQUIRED`. Exact score files remain private and were not copied into this release. | PASS (prior authorized run) | [Stage 3H retest](../TTP-3H/RETEST_2026-11-24.md) |
| CT-2C-001 configuration guard | Preserve port, SQLite connection and accepted routes | `npm --prefix tests run test:config` | Port 3002, SQLite `db`, and all 15 accepted GUI routes/layouts unchanged. | PASS | [prior command record](../TTP-4B-5E-5J/TEST_COMMAND_RESULTS_2026-11-24.md) |
| CT-2C-005 route/action inventory | Confirm Server Connect inventory and local route helper behavior | `npm --prefix tests run test:api:inventory` | 15 GUI routes inventoried; loopback root returned HTTP 200; non-loopback and authority-override inputs rejected. | PASS | [prior command record](../TTP-4B-5E-5J/TEST_COMMAND_RESULTS_2026-11-24.md) |
| CT-2C-006 publication scan | Scan changed files for configured secret/private-file patterns | `npm --prefix tests run test:security` plus manual review | Final scan passed across 101 changed/untracked files and the current diff; no configured secret/private-file patterns were found. Environment credentials are referenced from ignored `.env`, and private biometric output captures and generated failure bundles remain outside the publication set. | PASS WITH FINDINGS RECORDED | This record; private artifacts excluded from Git |
| CT-REG-002 diff and service smoke | Whitespace and Development availability | `git diff --check`; HTTP GET `http://127.0.0.1:3002/` | No whitespace errors; Development root returned HTTP 200. | PASS | Command results in this run |

The first release-candidate attempt after removing the SMTP auth options failed all three citizen browser specs with HTTP 500 during registration. Wappler's installed Mailer runtime always constructs SMTP auth, so the test exposed the missing configuration requirement. The options now resolve through the existing private `.env` values without changing Wappler runtime files; the single completion spec and the full 3-spec citizen suite then passed. No test assertions were weakened. The generated failure bundle remains in the private local archive.

The package test scripts do not run from the application root; all test commands use the approved `tests/` harness. Playwright writes local artifacts under the existing root `test-results/`; it remains untracked and excluded from publication. The existing directory was preserved, though the release-candidate test runs added their local results there.

## Review boundaries and open items

- Stage 4B Development email verification and recovery are implemented and passed end-to-end through local MailHog. Stage 4B remains `BLOCKED` for broader package requirements and production email transport; no production mail provider is configured.
- Stage 4F and the limited 5E–5J work remain `TESTING`. Existing `UAT_PENDING` package statuses remain unchanged. No Stage 4/5 package is marked `CLOSED_PASS`.
- The new citizen-screen captures are responsive evidence at 1440, 1024, 768 and 375 px. There is no owner-approved pixel baseline yet: visual baseline status is **PENDING OWNER APPROVAL**; no visual-regression pass is claimed.
- The existing desktop liveness result is experimental and client-reported, not certified anti-spoof evidence. Screen-replay resistance remains inconclusive. Physical mobile testing remains deferred for this desktop MVP.
- Passport application state `DEMO_SUBMITTED` is an internal Development snapshot only. No data is sent to Immigration. Identity and citizenship stay `REVIEW_REQUIRED`; recommender details are applicant-supplied only.

## Publication review

The changed files were manually reviewed. No passwords, verification/recovery tokens, private identity documents, biometric images, raw camera recordings, database exports, or private exact biometric score files are included. Synthetic GUI screenshots are explicitly marked as Development/test data. Intermediate Playwright failure bundles and modified biometric-result captures are preserved in a private local archive outside the repository. The Wappler Mailer configuration reads its existing local values through `TTP_MAILHOG_USERNAME` and `TTP_MAILHOG_PASSWORD` from the ignored, owner-local `.env`; the repository contains environment references only, not SMTP credential values. The MailHog host remains loopback-only and production mail settings are not present.
