# eKYC MVP Preimplementation Check

- **Date:** 2026-11-24
- **Starting commit:** `0f8018e9cdc61cc0a8d3931fe04c32446aaa7d34`
- **Disposition:** eKYC implementation not started; Stage 2C and OCR extension approvals pending.
- **Stage 2B:** remains `TESTING`; CT-2B-007 remains failed as recorded in Recovery 03.

## Verified project state

- The accepted Wappler application responds on port 3002. Its active connection remains SQLite `db`; all 15 accepted routes and layouts remain unchanged.
- The two verification routes are static previews. No IVP persistence, business Server Connect actions, or Wappler Security Provider are configured.
- The package-owned MySQL Development container `ttp2b-mysql-development` is stopped (`Exited 255`, last exit about 21 hours before this check) and is mapped to `127.0.0.1:3308`. Test is separately mapped to `127.0.0.1:3307`. Neither service was started. No MAMP database was accessed.
- The external IVP Development application and schema credential files exist. Their contents were not read. The configured application principal is `ivp_dev_user`, restricted by the initialization script to DML on `ivp_dev`.
- Root application dependencies do not include `mysql2`; `mysql2` is present in the test harness. No Tesseract executable or synthetic OCR fixtures are installed in the test harness.

## Stage 2C authorization baseline

Authorize one additive Wappler-native connection named `ivp` to the existing isolated target `127.0.0.1:3308` / `ivp_dev`, using Wappler-managed `mysql2@3.24.6` and the existing external secret for `ivp_dev_user`. Keep SQLite `db`, port 3002, and all accepted routes unchanged. Do not create a database, alter schema, write records, or access MAMP.

The scoped verification is Wappler's connection test and a Wappler-native read of the existing synthetic probe, confirming server/database/user identity. Rollback removes only the added `ivp` connection and its unused driver, and confirms SQLite `db`, port 3002, and the route map remain unchanged. If the service or expected synthetic target is missing, stop without initializing or creating it.

Proposed criteria: **AC-2C-001** additive connection with SQLite preserved; **AC-2C-002** correct target and principal verified through Wappler; **AC-2C-003** safe rollback demonstrated; **AC-2C-004** credentials remain external and are absent from repository evidence. This is an authorization proposal, not completed Stage 2C work.

## Baseline tests executed

| Test ID | AC ID | Environment / method | Expected and actual | Result |
|---|---|---|---|---|
| CT-2C-001 (precheck) | AC-2C-001 | `npm --prefix tests run test:config` | Expected port 3002, SQLite `db`, and 15 accepted routes/layouts; all matched. | PASS |
| CT-2C-002 (precheck) | AC-2C-001 | `npm --prefix tests run test:gui` against `http://127.0.0.1:3002` | Expected all accepted routes at 1440, 1024, 768, and 375 px plus existing navigation, wizard, and review-tab behavior; 64/64 passed. | PASS |
| CT-2C-005 (precheck) | AC-2C-001 | `npm --prefix tests run test:api:inventory` | Expected the accepted route inventory with no undocumented business endpoints; 15 GUI routes and zero Server Connect API files were reported. | PASS |
| CT-2C-006 (precheck) | AC-2C-004 | `npm --prefix tests run test:security` | Expected no configured secret/private-file patterns in the evidence file or current diff; scan passed across one changed/untracked file. | PASS |
| CT-2C-003 | AC-2C-002 | Wappler-native connection and synthetic-probe read | Expected connection to `ivp_dev` using `ivp_dev_user`; not run because the Development service is stopped and the Stage 2C baseline is awaiting authorization. | BLOCKED |
| CT-2C-004 | AC-2C-003 | Additive-connection rollback | Expected removal without affecting SQLite, port, or routes; not run because no connection change was authorized or made. | BLOCKED |

The browser regression covered all 15 current routes at each required width, public mobile navigation, the first-time wizard preview, and back-office review tabs. It did not test eKYC functionality because none is implemented.

## eKYC checks awaiting prerequisites

Proposed implementation criteria are limited to the user's requested MVP: **AC-3B-001** session plus explicit consent; **AC-3C-001** private evidence and server-derived owner isolation; **AC-3D-001** synthetic document validation and a separate selfie capture; **AC-3E-001** actual OCR extraction, field review/correction, and truthful per-check results. The Wappler-native ownership control and private evidence path are essential MVP controls, not a separate hardening project.

| Test ID | AC ID | Required check | Result / blocker |
|---|---|---|---|
| CT-3B-001 | AC-3B-001 | Create session, require consent, persist and reload it in `ivp_dev`. | BLOCKED — no authorized IVP connection or session actions. |
| CT-3C-001 | AC-3C-001 | Verify private evidence storage, session ownership, unauthenticated denial, and cross-owner IDOR denial. | BLOCKED — authentication and private evidence paths are not configured. |
| CT-3D-001 | AC-3D-001 | Exercise upload type/size/decode checks, image-quality handling, separate selfie capture, mobile permission denial/retry, and responsive UI. | BLOCKED — capture screen is static; no authorized upload flow. |
| CT-3E-001 | AC-3E-001 | Run real OCR on clearly synthetic documents; assert extracted sample fields and show extraction separately from authenticity/identity verification. | BLOCKED — OCR extension approval, local engine, and fixtures are pending. |

No application code, dependency, connection, route, or database was changed by this check. The only repository change is this evidence record; HEAD remains at the starting commit. The Playwright summary marker is ignored by Git.
