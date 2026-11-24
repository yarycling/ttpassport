# TTP-2B-RECOVERY-03 Retest Record

- **Project:** TTPPASSPORT
- **Package:** Stage 2B — Development Environments
- **Owner-authorized recovery:** TTP-2B-RECOVERY-03
- **Starting commit:** `22cbf50` (`main`, matched `origin/main`)
- **Execution date:** 2026-11-24
**Disposition:** TESTING; Stage 2C not authorized; final owner acceptance pending

This record supplements the original failures and Recovery 01/02 evidence. It does not erase or rewrite earlier test results.

## Accepted-project and Wappler observations

- Reopened the accepted `ttpassport` project in Wappler 7.9.9 through Wappler's project picker. The accepted home screen rendered in Design view.
- Read-only Project Settings showed the Development target URL `http://localhost:3002/`, SQLite database type, and `/db/db_dev.sqlite3`.
- Wappler's database connection tree showed only `db` in the accepted project. No MySQL driver, temporary restore connection, or diagnostic Server Connect action was added to that project.
- `npm --prefix tests run test:config` passed: port 3002, SQLite `db`, all 15 accepted routes and layouts unchanged. HTTP smoke requests to `/` and `/account/sign-in` returned 200. The current Wappler Web Server process owns the 3002 listener.
- Wappler Design view compatibility for the accepted project is verified. The Wappler UI was not used to install dependencies. `npm ci --dry-run --ignore-scripts --offline --no-audit --no-fund` completed with `up to date`; the root npm lockfile was recognized without installing or changing dependencies. No root dependency files changed.
- No screenshot file of the Wappler window was persisted. The redacted UI observations above were recorded from the live Wappler accessibility tree and read-only Project Settings. Browser screenshots are retained separately below.

## Compatibility reconciliation

The approved AC-2B-003 asks for a Wappler 7.9.9 native MySQL connection and query path with the driver/dialect identified. Recovery 02 already demonstrated that path in disposable scenario C: Wappler Database Manager/Query Builder and a native Server Connect Database Query read the synthetic MySQL 8.4.13 row using `mysql2` 3.24.6. This retest reopened the accepted project and verified Design view while preserving its SQLite target. The accepted application was not expected to use MySQL in this package and its connection was not changed.

Accordingly, CT-2B-003 is now **PASS WITH LIMITATION** for the approved environment-compatibility criterion. The earlier `track` error's root cause remains unconfirmed, and project-copy comparison scenarios B/D were not run because Wappler had previously reported its project limit. Those are diagnostic limitations, not required acceptance conditions under the approved baseline. This disposition does not claim MySQL integration into the accepted application.

## Restored-data readback

The backup/restore scripts had already restored separate synthetic Passport and IVP fixtures and verified expected row counts and SHA-256 fixture digests. For Recovery 03, a temporary read-only principal restricted to `passport_test_restore` was used only on the isolated MySQL Test service. The direct synthetic smoke read returned the expected row; IVP and sibling Passport reads and UPDATE were denied, and the fixture remained unchanged. See [restore-reader-privilege-smoke.log](restore-reader-privilege-smoke.log).

The owner entered the private password into the Wappler disposable project's connection form, clicked Test and Save. Wappler displayed the connection metadata and restored table/column metadata, but View/Edit Data → Fetch Data failed with `Access denied for user ''@'localhost' (using password: NO)`. The expected restored record was therefore **not** read back through Wappler. The direct MySQL smoke does not substitute for the required Wappler read. The authorized Wappler readback attempt ran and failed; CT-2B-007 is **FAIL** for this subcheck.

After the unsuccessful read, the temporary connection was removed in Wappler; the disposable project was closed through Wappler, and its local server stopped. Final checks found no port-3000 listener and no Recovery 03 connection reference in the disposable project's `.wappler`, `app/config`, `app/modules/connections` or `app/api` files. The temporary Test principal was dropped and its two private credential files were removed. The Test/Development services and unrelated MAMP services were not stopped or changed.

## MAMP read-only status

MAMP PRO displayed its MySQL service as **On**. Process inspection found the MAMP `mysqld` service listening on `127.0.0.1:3306`. No MAMP database was queried and no MAMP service or setting was modified. Recovery 02's final check had recorded no 3306 listener; the status now differs. The cause and transition time are unknown.

## Current test dispositions

| Test ID | Acceptance ID | Environment / method | Expected | Actual | Current result | Evidence |
|---|---|---|---|---|---|---|
| CT-2B-001 | AC-2B-001, 009 | Accepted Wappler Development, port 3002; config guard; route smoke | Preserve accepted target and route map | SQLite `db`, port 3002, 15 routes/layouts preserved; `/` and `/account/sign-in` returned HTTP 200 | PASS | [config-check.log](config-check.log), [port-3002-smoke.log](port-3002-smoke.log) |
| CT-2B-002 | AC-2B-002, 003, 010 | MySQL Test 8.4.13 and Wappler 7.9.9 disposable scenario C | Verify server version and native Wappler driver/query | Earlier authenticated server query confirmed MySQL Community Server 8.4.13; native Query Builder and Server Connect returned the fixture with `mysql2` 3.24.6 | PASS for scenario C | [Recovery 02 Server Connect evidence](../recovery02/resumed-wappler-mysql-server-connect.txt), [version/grants evidence](../mysql-version-and-grants.txt) |
| CT-2B-003 | AC-2B-003 | Disposable Wappler/MySQL scenario C; reopen accepted project | Establish Wappler-native compatibility and Design-view maintainability | Native MySQL Query Builder/Server Connect passed in scenario C; accepted project reopened and Design view worked. Accepted target remains SQLite; `track` root cause remains unknown. | PASS WITH LIMITATION | This record; [Recovery 02 comparison matrix](../recovery02/COMPARISON_MATRIX.md) |
| CT-2B-004 | AC-2B-004, 007 | Isolated Test/Development services; restricted restore-reader smoke | Isolate passport/IVP and Test/Development; deny cross-boundary access | Existing boundary suite passed; restore-reader smoke denied IVP and sibling-database reads | PASS | [restore-reader-privilege-smoke.log](restore-reader-privilege-smoke.log), [mysql-boundary-and-privilege-tests.log](../mysql-boundary-and-privilege-tests.log) |
| CT-2B-005 | AC-2B-005 | Runtime/schema grants and restricted restore-reader smoke | Enforce least privilege and deny disallowed write/admin access | Earlier grants suite passed; restore reader could not UPDATE the restored fixture | PASS | [restore-reader-privilege-smoke.log](restore-reader-privilege-smoke.log), [mysql-version-and-grants.txt](../mysql-version-and-grants.txt) |
| CT-2B-006 | AC-2B-003, 005 | Wappler Server Connect during isolated Test outage/recovery | Recover after Test service interruption without unrelated impact | Native Wappler action returned generic HTTP 500 during Test outage and HTTP 200 with fixture after recovery in scenario C | PASS for scenario C | [Recovery 02 recovery evidence](../recovery02/resumed-wappler-native-recovery.txt) |
| CT-2B-007 | AC-2B-004, 007 | Backup/restore plus Wappler restored-data readback | Verify restored data through Wappler | Restore digests and direct restricted SQL read passed; the authorized Wappler Fetch Data attempt ran but failed because it attempted an empty username with no password. No Wappler readback succeeded. | FAIL — Wappler readback | [restore-reader-privilege-smoke.log](restore-reader-privilege-smoke.log); [backup/restore log](../mysql-backup-restore.log); UI failure transcribed above |
| CT-2B-008 | AC-2B-008 | Actual local Wappler app; API inventory | Repeatable browser/API infrastructure and real route inventory | 15 routes; no business Server Connect actions exist, so business API assertions are N/A | PASS; business API assertions N/A | [api-inventory.log](api-inventory.log), [browser-route-responsive.log](browser-route-responsive.log) |
| CT-2B-009 | AC-2B-001, 009 | Chromium/Firefox Playwright against actual local app | All 15 routes at 1440/1024/768/375; accessibility, console, resources, overflow, visual regression | 64/64 cases passed; 60 route screenshots retained; 4/4 approved visual comparisons passed below 1% | PASS | [browser-route-responsive.log](browser-route-responsive.log), [visual-regression.log](visual-regression.log), [screenshots/](screenshots/), [visual-regression/](visual-regression/) |
| CT-2B-010 | AC-2B-006, 010 | npm audits, lockfile dry-run, repository scan | Retain advisories; no secret/private data; no automatic remediation | Six existing moderate app dependency findings remain open; test audit had zero findings; security scan passed; lockfile dry-run passed; no dependency remediation | PASS WITH FINDINGS | [security-scan.log](security-scan.log), [root-lockfile-dry-run.log](root-lockfile-dry-run.log), [dependency audit](../recovery/DEPENDENCY_AUDIT_ASSESSMENT.md) |
| CT-2B-011 | AC-2B-011 | Wappler UI, accepted config/route tests, disposable cleanup, port/service checks | Restore and confirm accepted target; remove disposable artifacts; preserve unrelated services | Accepted project reopened in Design view; settings and connection tree confirmed; temporary restore account/connection/files removed; port 3000 clear; port 3002 returned HTTP 200; MAMP untouched. npm recognized root lockfile in dry-run. | PASS WITH LIMITATION | This record; [cleanup-and-environment.log](cleanup-and-environment.log), [config-check.log](config-check.log), [root-lockfile-dry-run.log](root-lockfile-dry-run.log) |

## Regression and evidence inventory

- `npm --prefix tests run test:gui`: 64/64 passed against the Wappler app on port 3002. All 15 routes were checked at 1440, 1024, 768 and 375 px, including keyboard focus/accessibility names, resource loading, browser errors, console, horizontal overflow, public mobile navigation, wizard preview and review tabs.
- `npm --prefix tests run test:visual`: 4/4 comparisons passed. Differences were 0.3952%–0.7425%, below the documented 1% cross-version raster threshold.
- 60 responsive screenshots and 4 comparison screenshots were copied under this Recovery 03 directory; earlier evidence was preserved.
- `npm --prefix tests run test:config`, `npm --prefix tests run test:api:inventory`, `npm ci --dry-run --ignore-scripts --offline --no-audit --no-fund`, the restricted restore-reader smoke, and the final repository security scan passed. `git diff --check` and local Markdown-link checks are retained in the final validation record.
- Six moderate application dependency finding groups remain OPEN. No dependency or application runtime change was made.

## Security disposition and remaining blockers

The local transcript exposure from Recovery 02 remains documented. The owner directed continuation without rotating the existing synthetic credentials and stated development testing need not use production-grade security. This does not authorize use of those values in staging with real data, production, or any non-disposable environment. No credentials, identity data, database dumps, private keys, or Wappler connection files are included in repository evidence. The Recovery 03 one-use read-only restore account and its private files were removed after the failed Wappler read.

### Local transport scope

- Remote TLS negotiation, certificate-authority chain validation and remote hostname verification were **N/A for this Recovery 03 run** because the package-owned MySQL endpoints were loopback-only and no remote endpoint was selected. This is not evidence that a local MySQL connection used TLS.
- Authentication, least-privilege grants, database-boundary denial checks, loopback-only exposure, and exclusion of secrets/private connection files remained applicable and were checked as recorded above.
- Before any remote Test/Development service, staging or production use, TLS must be enabled and certificate trust and hostname verification must be tested. The local transcript-exposure finding and credential-remediation decision remain open separately from this transport scope.

Remote TLS/CA behavior remains an untested future requirement because no remote endpoint was selected; see the local transport scope above. The accepted TTPPASSPORT app still has no MySQL connection or business Server Connect endpoint; its runtime database remains SQLite `db`. The earlier Wappler `track` error is unexplained, but the approved compatibility criterion is met by disposable scenario C; do not claim its root cause is resolved. CT-2B-007 failed because Wappler did not read the restored synthetic row; it remains open until that native read succeeds. Six moderate npm advisory groups remain open without remediation. Final owner acceptance remains pending; Stage 2C remains unauthorized.

## Git and rollback

The run began at `22cbf50` with `main` matching `origin/main`. Accepted app configuration, routes, dependencies, port and GUI were not changed. The only working-tree changes for publication are this Recovery 03 evidence, copied synthetic screenshots, and the Stage 2B records updated to point at this retest. The temporary database principal/credentials and disposable connection are cleaned up; the Test and Development infrastructure remains intact. No force push or history rewrite is authorized.
