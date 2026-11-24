# eKYC MVP implementation and test results

**Date:** 2026-11-24
**Authorization:** Owner-approved `TTPASSPORT — EKYC MVP FUNCTIONAL IMPLEMENTATION` and `EKYC MVP APPROVAL 01`
**Disposition:** Functional synthetic demonstration implemented; automated tests passed; human acceptance remains pending. Stage 2B and Stage 2C are not closed.

## Environment and scope

- Wappler 7.9.9, Node.js v23.6.0, Development app at `http://127.0.0.1:3002`.
- Wappler-native `ivp` connection points to the isolated MySQL Development service (`ivp_dev`, MySQL Server 8.4.13, `mysql2` 3.24.6). The earlier read-only Wappler identity check is recorded in `EKYCMVP_APPROVAL_01_RESULTS_2026-11-24.md`; this retest additionally exercised native Wappler Server Connect reads and writes through that connection.
- The eight-table versioned IVP migration is installed in Development. Its rollback test ran against the isolated disposable Test database only; Development records were not removed.
- The accepted SQLite `db` connection, port 3002, existing Wappler runtime files, dependencies and 15 GUI routes remain unchanged. No MAMP databases or services were accessed.
- All test inputs were generated synthetic images and synthetic account details. Uploaded evidence remains under the private ignored `storage/ivp_dev/evidence/` directory; no public evidence URL is returned.

## Implemented flow

The Wappler pages now support a synthetic demo account, sign-in, verification-session creation, explicit consent, private document upload, local OCR, human correction, separate private selfie evidence, saved-session retrieval and a results screen. Eleven Wappler Server Connect actions implement the flow through the `ivpDemo` Security Provider and native database actions. Tesseract.js 7.0.0 uses the checked-in local English `tessdata_fast` model; no remote OCR provider or runtime CDN is configured.

The synthetic OCR test image produced:

    SYNTHETIC OCR TEST - NOT AN ID
    NAME: SAMPLE PERSON
    DOCUMENT NO: TEST 000042
    DOB: 2000 01 01
    NATIONALITY: SYNTHETIC

The extracted fields were `SAMPLE PERSON`, `TEST 000042`, `2000 01 01`, and `SYNTHETIC`; OCR confidence was 95. Human correction changed the name to `SAMPLE PERSON CORRECTED` while preserving the original OCR text and extracted value. The resulting session is `REVIEW_REQUIRED`.

The saved result reports document capture, OCR extraction, OCR review and selfie capture as `COMPLETED`; document authenticity and authoritative identity as `UNAVAILABLE`; and face comparison and liveness as `NOT_PERFORMED`. No legal identity, citizenship or document-authenticity verification is asserted.

## Automated test record

| Test ID | Acceptance ID | Environment and method | Expected and actual result | Disposition and evidence |
|---|---|---|---|---|
| CT-2C-006 | AC-2C-005 | Isolated disposable MySQL Test database; migration up and down | Initial attempt failed because the DDL-only test principal was used for an insert check. The setup was corrected; retest created the eight expected IVP tables and rollback left zero IVP tables. No Development data was rolled back. | PASS on retest; initial failure preserved in local ignored `CT-2C-MIGRATION-ROLLBACK-2026-11-24.log`; retest output summarized here from `CT-2C-MIGRATION-ROLLBACK-RETEST-2026-11-24.log`. |
| CT-2C-007 | AC-2C-002 | Wappler Development Server Connect actions through the configured `ivp` connection | Native session, consent, evidence and OCR actions persisted and read back records from the approved IVP Development target. | PASS; `tests/gui/ekyc.spec.mjs`; screenshots under `docs/evidence/TTP-3D/` and `docs/evidence/TTP-3E/`. |
| CT-2C-008 | AC-2C-001, AC-2C-004 | `npm --prefix tests run test:config`; `npm --prefix tests run test:api:inventory`; `npm --prefix tests run test:security`; `git diff --cached --check` | Port 3002, SQLite `db`, all 15 routes and the 11 Wappler Server Connect actions are preserved; the staged-file scan reports no configured secret/private-file findings. | PASS; final scan examined all 101 changed/untracked files and the diff from `origin/main`; staged whitespace check is clean. |
| CT-3B-001 | AC-3B-001 | Playwright against Wappler Development; create sessions, reject/accept consent, reload saved data | A new session begins `CONSENT_REQUIRED`; declined consent does not advance it; explicit acceptance advances it to `IN_PROGRESS`; records persist after reload. | PASS; `docs/evidence/TTP-3D/screenshots/capture/` and `docs/evidence/TTP-3E/screenshots/results/`. |
| CT-3C-001 | AC-3C-001 | Playwright plus Server Connect ownership and evidence checks | Document/selfie metadata and private files belong to the signed-in synthetic user; another user receives 404 for a foreign session; anonymous session access receives 401. | PASS; `tests/gui/ekyc.spec.mjs`; result screenshots list evidence metadata without public file links. |
| CT-3D-001 | AC-3D-001 | Playwright uploads generated synthetic document and selfie images | Valid images upload privately; malformed image content and oversized uploads are rejected without leaving new evidence files. | PASS; `tests/gui/ekyc.spec.mjs`; capture screenshots under `docs/evidence/TTP-3D/screenshots/capture/`. |
| CT-3E-001 | AC-3E-001 | `node tests/ocr/run-evaluation.mjs` and live Wappler Server Connect OCR | Local English model extracts the expected synthetic text and supported fields; unreadable input returns no OCR text. | PASS; exact output above and `docs/evidence/TTP-3E/screenshots/ocr-human-review-2026-11-24.png`. |
| CT-3E-002 | AC-3E-001 | Playwright saves a corrected field and reloads the session | Corrected values persist separately from original OCR output and the OCR review check records completion. | PASS; `tests/gui/ekyc.spec.mjs`; OCR review and results screenshots under `docs/evidence/TTP-3E/screenshots/`. |
| CT-3E-008 | AC-3E-001 | Wappler 7.9.9 Server Connect action using the local OCR adapter and model | OCR executes in the running Wappler target using local resources. The OCR harness blocks remote fetch/HTTP fallback; no external OCR provider was used. | PASS on retest; the earlier BLOCKED disposition remains recorded in `EKYCMVP_APPROVAL_01_RESULTS_2026-11-24.md`. |
| CT-3F-001 | AC-3F-001 | OCR image inspection action and Playwright boundary cases | Supported JPEG/PNG image data within size and dimension limits is accepted; unreadable OCR is reported as failed/review-required, not identity verification. | PASS; `tests/ocr/run-evaluation.mjs`, `tests/gui/ekyc.spec.mjs`. |
| CT-3G-001 | AC-3G-001 | Playwright separate selfie upload and saved-results check | Selfie input exposes the front-camera capture hint and accepts JPEG/PNG; synthetic selfie evidence is stored separately; face comparison and liveness remain `NOT_PERFORMED`. | PASS for synthetic upload and capture-hint scope; `tests/gui/ekyc.spec.mjs` and `docs/evidence/TTP-3E/screenshots/results/`. |
| CT-3G-002 | AC-3G-002 | Physical mobile browser and camera-permission flow | Exercise camera prompt, permission denial, cancel and retry using a device camera. | BLOCKED; headless Playwright has no physical camera or native camera permission UI. The `capture="user"` hint is present, but device behavior remains unverified. |
| CT-3D-002 | AC-3D-001 | `npm --prefix tests run test:gui` on Chromium | All 15 routes and the eKYC journey pass at 1440, 1024, 768 and 375 px; no horizontal overflow, broken resources, uncaught JavaScript errors or unexpected failed requests. Keyboard focus/basic accessible names and the existing wizard, navigation and review tabs pass. | PASS, 65/65; screenshots under `docs/evidence/TTP-3D/screenshots/`, with affected-screen captures under `capture/` and `docs/evidence/TTP-3E/screenshots/results/`. |
| CT-3D-003 | AC-3D-001 | `npm --prefix tests run test:visual` on Firefox against accepted Stage 2A screenshots | Home and back-office review comparisons pass at 1440×900 and 375×900 within the 1% rasterization tolerance. | PASS, 4/4; current captures under `docs/evidence/TTP-3E/screenshots/visual-baseline/`; accepted Stage 2B images remain unchanged. |

## Dispositions and remaining limits

- The earlier Stage 2B CT-2B-007 Wappler restored-data readback failure remains failed and unchanged. This eKYC flow uses the separately approved `ivp` Development connection; it does not clear CT-2B-007.
- Stage 2C is still open. Its earlier CT-2C-004 additive-connection rollback was not run because that would remove the approved active `ivp` connection. This migration rollback is a separate test and was performed only on disposable Test.
- The configured TTPASSPORT Development client is seeded for this demo; no client-administration UI is included. The identity subject model remains minimal.
- Physical-device front-camera capture, camera permission denial/cancel and retry were not executable in the approved headless browser environment. The tested file-upload path remains available.
- Document authenticity, authoritative identity checks, face comparison, liveness, legal identity assertions, government integrations, passport processing, payments and staff workflows are not implemented.
- Human owner review and GUI acceptance remain pending. These results do not close Stage 2B, Stage 2C or the full Stage 3 packages and do not authorize real identity material or production use.

## Screenshots

- Capture flow at 375 px: `docs/evidence/TTP-3D/screenshots/capture/375.png`
- Results flow at 375 px: `docs/evidence/TTP-3E/screenshots/results/375.png`
- OCR correction preview: `docs/evidence/TTP-3E/screenshots/ocr-human-review-2026-11-24.png`
- Visual comparison captures: `docs/evidence/TTP-3E/screenshots/visual-baseline/`
