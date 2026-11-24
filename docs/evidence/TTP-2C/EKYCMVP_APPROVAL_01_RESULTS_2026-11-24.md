# eKYC MVP Approval 01 — Evaluation Results

- **Date:** 2026-11-24
- **Starting commit:** `0f8018e9cdc61cc0a8d3931fe04c32446aaa7d34`
- **Environment:** Wappler 7.9.9, Node.js v23.6.0, application `http://127.0.0.1:3002`, macOS, synthetic-only OCR fixtures.
- **Disposition:** Approved additive database connectivity and local OCR evaluation passed. Stage 2C remains in progress; no schema or eKYC session work was authorized here.

## Database prerequisite

The approved Wappler-native connection is `ivp` → `127.0.0.1:3308` / `ivp_dev`, using the existing local `ivp_dev_user` credential and `mysql2@3.24.6`. Wappler's Server Connect `Database Single Query` completed a read-only query on this connection. The returned probe was `ivp-boundary-synthetic`; the verified database identity was `ivp_dev` / `ivp_dev_user` on MySQL Server 8.4.13. The existing Development container was running with its host port bound to loopback.

The credential-bearing local connection file, `app/modules/connections/ivp.json`, remains ignored by Git. It is excluded from evidence. The SQLite `db` connection, port 3002, and accepted 15-route map are unchanged. No schemas, migrations, databases, or accounts were created. The temporary query action was discarded without saving; `/api/ivp-connection-check` returns 404 and the API inventory reports no Server Connect endpoint files.

## OCR extension evaluation

Wappler 7.9.9 recognizes the custom Server Connect action **IVP OCR → Extract private image text for review** after reopening the project. The extension follows Wappler's documented project module/HJSON layout. The OCR implementation was evaluated directly and remains isolated under `extensions/server_connect/modules/`; it is not wired to a public endpoint or application screen.

| Test ID | Check | Result |
|---|---|---|
| CT-3E-001 | Real OCR extraction from the clearly marked synthetic sample | PASS — output below; confidence 95; status `REVIEW_REQUIRED`. |
| CT-3E-002 | Human correction control in the OCR review harness | PASS — extracted text was editable and a correction could be entered. This is a test harness, not an integrated citizen screen. |
| CT-3E-003 | Blank/unreadable sample handling | PASS — empty output, `UNREADABLE`, `documentReadable: false`. |
| CT-3E-004 | Invalid non-image rejection | PASS — plain-text file rejected as unsupported image format. |
| CT-3E-005 | Private-root path traversal rejection | PASS — path outside the configured evidence root rejected. |
| CT-3E-006 | Local-only processing and remote fallback guard | PASS — OCR completed with the local model; the test blocked non-loopback HTTP/HTTPS and fetch calls. |
| CT-3E-007 | Verification integrity flags | PASS — `authenticityVerified` and `identityVerified` remained `false`. |

Exact readable-sample text:

```text
SYNTHETIC OCR TEST - NOT AN ID
NAME: SAMPLE PERSON
DOCUMENT NO: TEST 000042
DOB: 2000 01 01

NATIONALITY: SYNTHETIC
```

The result is OCR text for human review only. It is not document authenticity validation, person matching, citizenship determination, or legal identity verification. The local model is `tessdata_fast` English data from pinned commit `87416418657359cb625c412a48b6e1d6d41c29bd` (4,113,088 bytes; SHA-256 `7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2`). `tesseract.js` and `tesseract.js-core` are both version 7.0.0 under Apache-2.0; the English model license is included beside the data file under Apache-2.0. Runtime language loading uses the local model, gzip/cache are disabled, and no runtime CDN or external document transfer is used.

Test command: `node tests/ocr/run-evaluation.mjs`. Output and the editable human-review preview are retained in `docs/evidence/TTP-2C/OCR_HUMAN_REVIEW_PREVIEW.png`.

## Regression and configuration checks

| Test ID | Command / method | Expected and actual | Result |
|---|---|---|---|
| CT-2C-001 | `npm --prefix tests run test:config` | Port 3002, SQLite `db`, and all 15 accepted routes/layouts unchanged. | PASS |
| CT-2C-002 | `npm --prefix tests run test:gui` | 64/64 passed, including all 15 routes at 1440, 1024, 768, and 375 px plus mobile navigation, wizard, and back-office review tabs. | PASS |
| CT-2C-003 | Wappler Server Connect `Database Single Query` via `ivp` | Read-only probe returned `ivp-boundary-synthetic`; identity matched approved Development target. | PASS |
| CT-2C-004 | Remove `ivp` connection and driver rollback | Not run because it would undo the approved Development prerequisite; no destructive rollback was requested. | BLOCKED / NOT EXECUTED |
| CT-2C-005 | `npm --prefix tests run test:api:inventory` | 15 GUI routes, zero Server Connect API files; loopback GET succeeds and non-loopback/authority-override inputs are rejected. | PASS |
| CT-2C-006 | `npm --prefix tests run test:security` | Scanned 12 changed/untracked files and diff against `origin/main`; no configured secret/private-file patterns found. | PASS |
| CT-2C-007 | Wappler 7.9.9 UI after project restart | IVP OCR custom Server Connect action appeared in the action catalog. | PASS |

Visual regression comparison against a new baseline is `N/A` because no TTPASSPORT screen was changed. The screenshot is from the OCR review harness, not an accepted application screen. Stage 2B remains `TESTING`; its original CT-2B-007 failure remains preserved in the Recovery 03 evidence.

## Scope boundary and next increment

No verification-session or consent persistence, private evidence upload workflow, selfie capture, database schema, migration, authentication, application route, public API, or passport/eKYC decision behavior was added. The database prerequisite and OCR action are evaluation foundations only.

The next smallest executable increment requires a separate Stage 3 package baseline/authorization for **verification-session creation and explicit synthetic-test consent using the native `ivp` connection**. Then add private synthetic evidence upload and OCR/review integration, and implement selfie capture as a separate evidence flow. Persistence must use a subsequently approved schema/migration. Keep each check status truthful and never issue `VERIFIED` from OCR or an unreviewed selfie.

Rollback for the additive prerequisite is documented but was not executed: remove only the ignored local `ivp.json` and the dedicated dependency changes if the connection is abandoned, then confirm SQLite `db`, port 3002, and all 15 routes remain unchanged. Preserve this evidence and the original Stage 2B failure record.
