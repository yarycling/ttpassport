# Stage 2B Implementation Record

**Project:** TTPASSPORT<br>
**Package:** 2B — Development Environments<br>
**Baseline:** TTP-2B-DEVELOPMENT-ENVIRONMENTS-DRAFT-01<br>
**Owner authorization:** APPROVED FOR CONTROLLED IMPLEMENTATION, 2026-11-23<br>
**Execution date:** 2026-11-23<br>
**Disposition:** IMPLEMENTED WITH OPEN COMPATIBILITY BLOCKERS; owner acceptance pending

## Scope and preserved state

This implementation established package-owned, local-only MySQL 8.4 Test and Development environments, reusable test-only database/browser/API/configuration/security tooling, and execution evidence for CT-2B-001–011. It did not create passport or IVP application schemas, run migrations, add business APIs, implement authentication or passport/eKYC/payment features, or alter the accepted GUI.

The accepted Wappler Development application remains on port 3002, serving all 15 existing routes. Its active `db` connection remains SQLite `/db/db_dev.sqlite3`. The Wappler package manifest and tracked app dependencies match the pre-package commit. No generated runtime, route, view, shared layout, App Connect, Bootstrap, Wappler target or MAMP configuration was changed. MAMP's separate loopback listener on port 3306 remained present.

## Environment delivered

- Added a Docker Compose project using the pinned `mysql:8.4.13` image digest. Test and Development bind only to `127.0.0.1:3307` and `127.0.0.1:3308`; each has a separate bridge network, data volume, root credential and service.
- Each environment contains separate synthetic `passport_*` and `ivp_*` databases. Each logical owner has a distinct DML principal and a distinct schema principal. DML principals have only `SELECT`, `INSERT`, `UPDATE` and `DELETE` on their own database. Schema principals have schema-management grants only on their own database and no application-data read grant. No cross-database foreign keys or application/business tables were created.
- Authenticated server queries identified both servers as MySQL Community Server 8.4.13. The container listens internally on 3306; no service binds host port 3306.
- Environment password files and the generated connection JSON are stored outside the repository under `~/.codex/ttpassport-stage2b-secrets`, with directory mode 0700 and file mode 0600. The Stage 2B containers were stopped after testing; volumes and private synthetic backups were retained for controlled retesting.
- Added a private test-only harness under `tests/`: Playwright route and interaction checks, visual screenshot comparison, API inventory/client, Wappler configuration guard, MySQL boundary/privilege/type/transaction checks, driver compatibility checks, backup/restore and outage recovery commands, and a targeted secret/private-file scan. Test-only dependencies are isolated from the Wappler app manifest.
- Captured 60 browser screenshots for all 15 accepted routes at 1440, 1024, 768 and 375 CSS pixels. Captured four additional matched-viewport comparison screenshots for the routes with accepted Stage 2A baselines.

## Wappler compatibility observation and blocker

The installed project remains the Wappler 7.9.9 web application recorded in the accepted Stage 2A baseline. The Wappler Database Manager accepted a temporary `passport_test` connection to the isolated loopback Test service and its native connection test succeeded. Opening the Wappler Query Builder then raised a Wappler main-process error: `TypeError: Cannot read properties of undefined (reading 'track')`. The temporary test connection and diagnostic Server Connect action could not be removed through the UI while that error dialog was present.

The exact temporary connection/action files were removed, the application manifest was restored byte-for-byte to its pre-package content, and searches confirmed no `passport_test.json` or `stage2b_db_probe` remains in `.wappler/` or `app/`. No Wappler-generated runtime files were edited. The app remained available on port 3002. Because the Query Builder failed, this package has **not** proved a query through Wappler Server Connect, the selected Wappler MySQL driver/dialect, or Wappler Design-view compatibility. CT-2B-002, CT-2B-003, CT-2B-006 and the Wappler readback portion of CT-2B-007 retain blocked dispositions; see [TEST_RECORD.md](TEST_RECORD.md).

## Dependency and security observations

- The host reports Node.js v23.6.0 and npm 10.9.2. The isolated driver smoke test passed with mysql2 3.24.6 on Node 23.6.0, and in pinned Node 24.22.3 and 26.13.1 containers. This is driver-level evidence only; it does not select a supported Wappler Node LTS or prove Wappler runtime compatibility.
- The test-only dependency audit reported zero advisories. The Wappler app's `npm audit --json` and `npm audit --omit=dev --json` both stop with `ENOLOCK` because the project has no lockfile. No lockfile, dependency, or automatic npm remediation was added to the Wappler app.
- The final targeted security scanner reviewed changed and untracked repository files against `origin/main` and found no configured secret/private-file patterns. Private MySQL credentials, SQL backups, test traces and local Wappler config were excluded from Git.
- During temporary Wappler connection setup, the synthetic Test passport password appeared in a local tool accessibility output. It was immediately rotated in both the private secret file and the isolated MySQL Test account; the private connection JSON was updated and authenticated Test checks passed again. No password value is retained in repository evidence. The Test and Development environment secrets remain separate.

## Rollback and service state

Rollback verification removed the temporary Wappler Test connection and diagnostic action, confirmed the original app package manifest, SQLite connection, port and route files are unchanged, and confirmed HTTP 200 on port 3002. Only the two Stage 2B MySQL containers were stopped after execution; their package-owned volumes were retained. The MAMP listener on loopback port 3306 was not stopped or reconfigured. See [rollback-verification.log](rollback-verification.log).

## Changed file groups

- Repository ignore rules: `.gitignore`.
- Stage 2B environment setup and rollback: `infra/stage2b/`.
- Isolated test tooling and its lockfile: `tests/`.
- Project registers: `docs/project/PROJECT_STATUS.md` and `docs/project/MASTER_DEVELOPMENT_REGISTER.md`.
- Package authorization, implementation/test records, command logs, visual comparison evidence and screenshots: `docs/evidence/TTP-2B/`.

No final owner acceptance is recorded. Stage 2B remains in TESTING with unresolved Wappler Query Builder/Server Connect compatibility and the missing Wappler app lockfile for an application dependency audit. Stage 2C remains NOT_STARTED and unauthorized.
