# Citizen Application Completion — Implementation and Test Record

**Packages:** 4B, 5E–5J (limited development demonstration scope)

**Baseline:** owner request `TTPASSPORT — COMPLETE CITIZEN APPLICATION MVP`

**Starting commit:** `7ad6a85c3d4ac720df189b324b680155969bd00d`

**Environment:** Wappler 7.9.9, Development target at port 3002; Passport and IVP MySQL Development/Test; local MailHog; synthetic records only.
**GUI acceptance:** PENDING owner review. No package is marked `CLOSED_PASS` here.

## Acceptance and command-test mapping

| Acceptance ID | Acceptance criterion | Command test |
|---|---|---|
| AC-4B-001 | Unverified accounts receive a single-use, expiring verification link through local MailHog; sign-in is denied until verified. | CT-4B-001 |
| AC-4B-002 | Password recovery returns an enumeration-safe response and uses a single-use, expiring link to change the password. | CT-4B-002 |
| AC-5E-001 | Recommender contact details save to Passport-owned storage as applicant-supplied and unverified; no recommender declaration is forged. | CT-5E-001 |
| AC-5F-001 | Two mapped personal-reference records save and reload under the authenticated application owner. | CT-5F-001 |
| AC-5G-001 | Supporting documents upload to private Passport storage with type/size checks, ownership checks, and replacement history. | CT-5G-001 |
| AC-5H-001 | Proposed passport photo uses a separate private evidence record from IVP selfie/liveness evidence. | CT-5H-001 |
| AC-5I-001 | Review presents saved application information, evidence metadata, eKYC results, missing mapped fields, and pending checks. | CT-5I-001 |
| AC-5J-001 | Adult-only development submission stores a versioned immutable snapshot and an internal demonstration reference; it is not official submission. | CT-5J-001 |
| AC-5J-002 | A self-reported 16–17 applicant cannot submit while the guardian workflow is unavailable. | CT-5J-002 |
| AC-REG-001 | Existing citizen ownership, IVP separation, OCR, face/liveness results, responsive screens, and keyboard flows continue to work. | CT-REG-001 |

## Implementation baseline

- Use Wappler-native Server Connect, App Connect, Security Provider restrictions, Database actions, File Upload, File Download, Crypto, and Mail actions.
- Passport evidence and snapshots stay in the Passport Development database/storage. IVP records remain in the separate IVP database; the application snapshot stores only the application-scoped IVP reference.
- No government submission, official receipt/passport number, payment, staff processing, production email, or legal identity/citizenship assertion is included.
- Preserve all existing application routes and the SQLite `db` connection; do not modify Wappler runtime files.
- Test and Development schema operations must verify MySQL identity before DDL. Rollback uses only the new Passport migration's down file against an explicitly identified isolated target.

## Results

### Implemented behavior

- Local Development registration now sends a single-use email verification link through MailHog. An unverified account cannot sign in. Password recovery uses an enumeration-safe response and a single-use token; the browser flow changes the password and rejects token reuse.
- Recommender and two personal-reference records save against the authenticated passport application as applicant-provided information. No declaration by the recommender is fabricated.
- Supporting documents and the proposed passport photograph use Passport-owned private storage and metadata. Upload validation, account/application ownership, generated storage keys, retrieval, replacement history and evidence versions are exercised. The proposed passport photograph remains separate from IVP selfie/liveness evidence.
- The review screen presents the saved applicant, citizenship/family, prior-document, recommender/reference, evidence and linked IVP information, with missing and unresolved checks visible. Adult development submission stores an immutable versioned snapshot and internal demo reference; it is not an official submission. The 16–17 path remains blocked from demo submission pending the separate guardian workflow.
- Citizen-to-IVP regression confirms that an authenticated citizen can launch/resume the scoped session, retrieve its results, and cannot access another citizen's application or IVP session. IVP records remain in the IVP database; Passport stores the scoped link only.
- Existing routes and port remain unchanged: 15 approved GUI routes, Development port 3002, SQLite `db`; the Passport MySQL connection and IVP database remain separate. No Wappler-generated runtime files were changed.

### Automated results

Environment: Wappler 7.9.9 Development target at `http://127.0.0.1:3002` (HTTP 200); Node `v23.6.0`; Playwright `1.65.1`; Chromium; MySQL Community Server 8.4.13; local MailHog; Passport/IVP Development databases; synthetic accounts and files only.

| Test ID | Acceptance ID | Method and expected result | Actual result | Status | Evidence |
|---|---|---|---|---|---|
| CT-4B-001/002 | AC-4B-001/002 | `npm --prefix tests run test:gui -- gui/citizen-completion.spec.mjs gui/citizen-ivp.spec.mjs gui/citizen-mvp.spec.mjs`; verify unverified-login denial, MailHog verification, single-use recovery, enumeration-safe response and password change. | Browser workflow completed; verification and recovery links worked, unverified sign-in and token reuse were denied, and password changed successfully. | PASS | Playwright run below; [registration screenshots](screenshots/citizen-completion/account-register-1440.png), [verification screenshot](screenshots/citizen-completion/verify-email-375.png), [recovery screenshot](screenshots/citizen-completion/reset-password-1440.png) |
| CT-5E-001 / CT-5F-001 | AC-5E-001 / AC-5F-001 | Save and reload applicant-supplied recommender and two reference records under the application owner. | Values persisted and appeared in review; no external declaration was submitted. | PASS | Playwright completion run; [review at 1440px](screenshots/citizen-completion/application-review-1440.png) |
| CT-5G-001 / CT-5H-001 | AC-5G-001 / AC-5H-001 | Reject invalid and oversized files; accept synthetic image; verify private ownership, replacement/version history, and separate passport-photo evidence. | Invalid text and oversized upload were rejected; the synthetic image uploaded. Evidence list showed the expected category/status/version and the review rendered stored metadata without relying on the original client filename. Cross-account access was denied. | PASS | Playwright completion run; [review at 375px](screenshots/citizen-completion/application-review-375.png) |
| CT-5I-001 | AC-5I-001 | Review saved application, evidence and actual IVP results; verify missing/unresolved information and four viewport widths. | Review content and check states matched saved records. Completion and IVP browser cases checked 1440, 1024, 768 and 375px; no horizontal overflow or failed page resources. Keyboard focus and accessible control labels were checked. | PASS | Playwright completion/IVP runs; screenshots under `screenshots/citizen-completion/` and `screenshots/ivp-regression/` |
| CT-5J-001/002 | AC-5J-001/002 | Adult-only demo submission persists an immutable snapshot/reference; self-reported 16–17 application cannot submit. | Adult demo submission reloaded with its saved snapshot and internal reference. Minor path remained a draft and could not submit. No government endpoint, official passport number or receipt was created. | PASS | Playwright completion run; [submitted view at 1440px](screenshots/citizen-completion/application-submitted-1440.png), [submitted view at 375px](screenshots/citizen-completion/application-submitted-375.png) |
| CT-4F-001–010 / CT-REG-001 | AC-4F-001 / AC-REG-001 | Citizen-to-IVP session association, resume/results, ownership denial and existing eKYC regression. | IVP browser case passed; application-to-session scope and ownership checks passed. Existing OCR/capture/results flow remained functional in regression coverage. | PASS | Playwright IVP run; [IVP results at 375px](screenshots/ivp-regression/verification-results-375.png) |
| CT-4A5C-002–010 | AC-REG-001 | Existing citizen registration/profile/draft and application ownership regression, responsive layout and keyboard checks. | Browser case passed; synthetic application remained a draft, account isolation held and age/guardian notices remained visible. | PASS | Playwright citizen regression run; screenshots under `screenshots/citizen-regression/` |
| CT-2C-001 (configuration guard) | AC-REG-001 | `npm --prefix tests run test:config`; preserve port, SQLite connection, and accepted route map. | Port 3002, SQLite `db`, and all 15 accepted routes/layouts unchanged. | PASS | [command results](TEST_COMMAND_RESULTS_2026-11-24.md) |
| CT-2C-005 (API inventory) | AC-REG-001 | `npm --prefix tests run test:api:inventory`; inventory actual Wappler actions and route helper safety. | 15 approved GUI routes; citizen and IVP Server Connect actions inventoried; loopback request returned HTTP 200 and non-loopback/authority override attempts were rejected. | PASS | [command results](TEST_COMMAND_RESULTS_2026-11-24.md) |
| CT-2C-006 (security scan) | AC-REG-001 | `npm --prefix tests run test:security`; scan current diff and changed/untracked files. | 123 files scanned; no configured secret/private-file patterns found. Manual archive inspection found synthetic passwords and one-time links in eight old Playwright traces. The eight archives were moved outside the project into the user's private local evidence directory; screenshots and text failure contexts remain. The root `test-results/` directory was preserved untouched. | PASS WITH FINDING | [command results](TEST_COMMAND_RESULTS_2026-11-24.md); private traces remain outside the project at `~/.codex/ttpassport-stage4-evidence/2026-11-24/` |
| CT-REG-002 | AC-REG-001 | `git diff --check`; application smoke request. | No whitespace errors; `http://127.0.0.1:3002/` returned HTTP 200. | PASS | Command output recorded in this run |

Focused browser command result: **3 passed (1.0m)** for `citizen-completion.spec.mjs`, `citizen-ivp.spec.mjs`, and `citizen-mvp.spec.mjs`. Earlier failed attempts remain represented by their error-context files/screenshots and this record. The completion assertion was corrected to validate generated private-storage metadata/version history rather than the original upload filename. The demo-submission panel was moved into the review card after screenshot review showed a footer collision; the final run passed.

### Database migration and rollback

The completion migration was applied, rolled back, reapplied and checked for idempotency on the isolated Passport Test schema only, after confirming the six target tables had no application rows. The six completion tables were recreated. No Development-schema DDL or unrelated MAMP database operation was performed. The Test principal could not read application rows; the authorized read-only Test application principal confirmed the empty pre-rollback state. No database was created and no active application connection was changed. The migration verification was completed in the preceding implementation run; it was not repeated during this final browser retest.

### Visual comparison, limitations and status

- Responsive, keyboard and basic accessible-name checks passed for the affected browser flows at 1440, 1024, 768 and 375 CSS pixels. Captures are retained under `screenshots/`.
- A formal pixel comparison for the new completed-application/review state is **BLOCKED**: the approved baseline contains the earlier static application screen, not this newly saved/review/submitted state. The new screenshots are evidence, not a substitute comparison. Functional screenshots showed the prior footer collision fixed.
- Production email delivery, guardian consent, official government submission, legal identity/citizenship verification and official passport-photo compliance remain outside this increment. Unresolved identity/citizenship/IVP checks remain pending/review-required.
- GUI and business acceptance remain **PENDING OWNER REVIEW**. The working local adult demonstration is functionally ready, but formal visual-baseline comparison remains a technical acceptance blocker.
- Git remains on `main` at `7ad6a85c3d4ac720df189b324b680155969bd00d`, matching `origin/main`; implementation and evidence changes are uncommitted and unpushed. No publish/commit was requested. Preserve the root untracked `test-results/` directory.

### Historical failure and retest preservation

The earlier failed browser attempts, screenshots, and text error contexts remain in their original evidence folders. Their trace archives contained generated test password/token values and were moved out of the project to prevent accidental publication; no trace content was copied into repository documentation. The successful final browser run above supersedes those failures for the exercised behavior without deleting the historical failure records.
