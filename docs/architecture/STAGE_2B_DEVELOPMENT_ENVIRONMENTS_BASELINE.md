# Stage 2B — Development Environments Baseline

**Project:** Trinidad & Tobago Online Passport Management System (TTPASSPORT)<br>
**Package:** 2B — Development Environments<br>
**Baseline ID:** TTP-2B-DEVELOPMENT-ENVIRONMENTS-DRAFT-01<br>
**Version:** 0.1 — draft for owner review<br>
**Prepared:** 2026-11-23<br>
**Status:** DRAFT — implementation is NOT_STARTED and requires separate owner approval<br>
**Depends on:** Stage 2A CLOSED_PASS; approved Wappler-first rules in root AGENTS.md

## 1. Purpose and decision summary

This document proposes a reviewable implementation baseline for isolated Development and Test environments, a Wappler-native MySQL path, and reusable automated regression tests. It is a design record only. It does not create a database, change a connection or Wappler target, install or replace a database server, run a migration, change a dependency, or alter application behavior.

| Decision area | Baseline direction | Status |
|---|---|---|
| Relational database | MySQL 8.4 LTS, conditional on successful compatibility tests with the actual Wappler 7.9.9 Node.js project | Direction selected; compatibility not established |
| Alternative database | MariaDB is not selected | Closed for this baseline |
| Application | Preserve the existing Wappler 7.9.9 web project, Bootstrap 5, all 15 accepted GUI routes, and Development port 3002 | Preserve |
| Development database | Move toward a dedicated MySQL 8.4 development environment only after approval and successful tests; do not use or modify unrelated MAMP databases | Proposed |
| Test database | Use a separately isolated, disposable MySQL 8.4 test service and synthetic fixtures, independent from Development | Proposed |
| Passport / IVP data | Separate databases and application credentials for passport and IVP in each environment; no cross-database foreign keys | Required boundary |
| Node.js | Select a Wappler-compatible supported LTS release after a compatibility matrix; the currently observed Node.js v23.6.0 is EOL | Decision pending |
| Automated GUI/API | Add a repeatable test-only harness after package approval; no business or persistent test endpoint is included. A temporary diagnostic action is narrowly conditioned in §§5 and 12. | Proposed |
| Dependency advisories | Reproduce the audit against a reviewed, Wappler-compatible lockfile before fixes; do not apply automatic npm remediation | Open |

MySQL 8.4 is an LTS server series, and MySQL documents within-series 8.4 upgrades. Those product facts do not prove that this project’s Wappler database manager, Server Connect runtime, Node driver, connection options, or SQL behavior are compatible. The MySQL 8.4 acceptance gate is a successful test against an identified 8.4 server through a connection created and maintained in Wappler 7.9.9. See [MySQL releases: Innovation and LTS](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html) and the [MySQL 8.4 FAQ](https://dev.mysql.com/doc/refman/8.4/en/faqs-general.html).

## 2. Observed project and environment baseline

The following facts come from the checked-in Wappler configuration, Stage 2A evidence, the package manifest, and read-only local environment inspection:

| Item | Observed state |
|---|---|
| Wappler | Version 7.9.9, as recorded from the installed Wappler UI in accepted GUI and Stage 2A evidence |
| Project model | Wappler web project; Node.js server model and Node routing handler; Bootstrap 5; local App Connect and Wappler-generated Node/Express runtime |
| Application port | app/config/config.json sets port 3002; active Development URL is http://localhost:3002/ |
| GUI | The approved baseline contains 15 routes. Keep all route, view and shared-layout mappings unchanged. See [GUI_BASELINE_01.md](../GUI_BASELINE_01.md) and the [Stage 2A closure record](../evidence/TTP-2A/OWNER_CLOSURE_ACCEPTANCE.md). |
| Current database target | Development uses SQLite at /db/db_dev.sqlite3. The matching Wappler connection uses client sqlite3; the ignored db/ directory has no tracked database/schema. |
| MySQL driver | No MySQL connection is configured, and neither mysql nor mysql2 is declared in the project manifest. The checked-in Wappler server runtime has branches for mysql and mysql2; this is not evidence that a driver is installed or that a connection works. |
| Query builder | Installed Knex is 3.3.0 and its upstream documentation supports MySQL dialects. The required MySQL driver is separate; Knex alone does not establish a working connection. |
| Node and npm | Prior Stage 2A evidence records Node.js v23.6.0 and npm 10.9.2. The current local Node still reports v23.6.0. Node.js 23 reached EOL on 2025-05-14; do not select it as the long-term environment. Compare supported LTS releases only after checking Wappler 7.9.9 and native-module compatibility. See [Node.js release status](https://nodejs.org/en/about/previous-releases). |
| MAMP MySQL | A MAMP mysqld process listens on loopback port 3306; the running executable reports MySQL Community Server 5.7.39. An unauthenticated read-only SELECT VERSION() returned access denied. The SQL-reported server version remains unverified. A separate mysql --version result is client information, not proof of the server version. No MAMP database was inspected or changed. |
| Dependency audit | There is no tracked npm lockfile or test script. The Stage 1 precheck found six moderate advisory groups in the installed dependency snapshot, with zero high/critical findings. The exact advisory paths and caveats are summarized in §10 and detailed in [TECHNICAL_REVIEW_PRECHECK.md](../evidence/TTP-01A-01H/TECHNICAL_REVIEW_PRECHECK.md). |
| Wappler runtime metadata | runtime: capacitor remains in .wappler/project.json; its meaning was not exposed by the installed Wappler settings and it is outside this package. Do not change it here. |

Wappler documentation describes visual Database Connections, target-specific settings, and Server Connect use for MySQL among other database engines. Knex’s current installation guide requires a separate database driver, listing mysql and mysql2. These sources support a native Wappler approach in principle; they do not substitute for a successful MySQL 8.4 connection test in this exact project. See [Wappler database connections](https://docs.wappler.io/guided/database-connection/), [Wappler Server Connect database operations](https://docs.wappler.io/guided/database-operations-quick-overview/), and [Knex installation and dialect configuration](https://github.com/knex/knex/blob/master/docs/src/guide/index.md).

## 3. Scope and exclusions

### Proposed Stage 2B implementation scope after approval

- Establish or document isolated non-production Development and Test environments.
- Evaluate MySQL 8.4 LTS through the installed Wappler GUI and native Server Connect/database components.
- Configure Wappler-managed connections per target and per passport/IVP boundary, without committing credentials.
- Establish least-privilege access, secret handling, failure/recovery procedures, and a tested backup/restore method.
- Add repeatable test-only browser/API/database checks and retain their actual results.
- Assess the existing dependency advisories and agree a separately reviewed remediation path.

### Explicit exclusions

- This draft performs no Stage 2B implementation. It does not provision a server or database, alter the current SQLite configuration, change Wappler settings, move or edit generated files, install a driver or test package, modify the manifest, or run migrations.
- This draft creates no passport or IVP schema, tables, business API, application endpoint, authentication, passport processing, eKYC, payment, approval or production integration. During a later owner-authorized compatibility test, a temporary, explicitly documented Wappler diagnostic action may be used only on an isolated loopback Test target if Wappler cannot exercise Server Connect database access through a non-routed test facility; it must not be deployed, and it must be removed and verified absent before acceptance.
- Do not access, upgrade, stop, reconfigure, create schemas in, or use the existing MAMP MySQL instance for project testing. Preserve its services and unrelated databases.
- Do not expose any database publicly. No production target or public deployment is in scope.
- Do not automatically fix, override, replace, reclassify, or upgrade Wappler-managed dependencies.

## 4. Proposed environment topology

The names below are logical labels for review, not created databases, Wappler target names, hostnames, ports, credentials or approved infrastructure selections.

| Environment | Application target | Database topology | Data rule |
|---|---|---|---|
| Existing local Development | Keep Wappler Development on http://localhost:3002/; current SQLite connection remains untouched during preparation | Existing SQLite remains the active configuration until an approved implementation switches to an approved MySQL target | No real identity/payment data; keep the accepted GUI |
| Proposed MySQL Development | A Wappler-managed local Development target, preserving application port 3002 | Dedicated MySQL 8.4 LTS service isolated from MAMP; logically separate passport and IVP databases, separate database accounts | Synthetic fixtures only; never share Test or MAMP data |
| Proposed automated Test | Wappler-managed test target/configuration verified in Wappler 7.9.9; use a non-conflicting loopback app port or approved isolated runner arrangement without changing the developer’s 3002 listener | Separate disposable MySQL 8.4 test service with distinct passport-test and IVP-test databases/accounts | Synthetic data only; destroy/rebuild only the package-owned disposable environment |
| Production | Not configured or authorized | No target, host, database or secrets are selected here | Requires separate government, legal, security and deployment approvals |

Before setup, inspect how Wappler 7.9.9 represents target-specific URLs, database definitions and environment values. Use Wappler Project Settings/Database Manager to create and save supported target and connection configuration; do not hand-author undocumented JSON shapes. Preserve a Git diff and verify port 3002 and every accepted route after any owner-approved change. Wappler’s database manager supports per-target connection options; its documentation also distinguishes the Server Connect connection from a direct Database Manager connection. Keep those credentials and privileges separate.

Candidate database labels such as passport_dev, ivp_dev, passport_test, and ivp_test are placeholders only. The owner/security reviewer must approve actual names, host isolation, port allocation, storage, and whether the two data boundaries need separate MySQL instances in addition to separate databases and credentials. Stage 2B may validate database connectivity with disposable test fixtures; application schema design and migrations belong to later approved work.

## 5. MySQL 8.4 LTS compatibility evaluation

The compatibility evaluation must cover the full stack, not just a successful command-line client connection:

1. Identify the exact MySQL Server release from the server itself using an authenticated, read-only query such as SELECT VERSION(), @@version_comment, @@port. Confirm it is Oracle MySQL 8.4.x and not a MySQL client version, MariaDB server, or unverified process-binary version.
2. Use an isolated, disposable MySQL 8.4 LTS service. Do not use the existing MAMP listener or upgrade/downgrade it.
3. Through Wappler 7.9.9, add a native Database Connection for the selected Development/Test target. Record what driver/dialect and driver version Wappler actually selects. Verify saved configuration and test connection from Wappler.
4. Verify a harmless synthetic query through a documented, Wappler-native connection-testing facility. Use the Database Manager's native connection test and query preview where these cover the actual Server Connect driver. If runtime testing requires a Server Connect action, the later approved Stage 2B work may create a temporary, named diagnostic action on the isolated loopback Test target only; do not add it to the normal Development target or expose it publicly. Remove it before acceptance and prove it is absent. If Wappler cannot isolate the action safely, do not create an endpoint and record the runtime-specific check as BLOCKED.
5. Verify TLS/CA handling where required by the chosen host, the configured authentication method, character set/collation, SQL mode, time zone and date/time serialization, decimal handling, JSON values, boolean/null behavior, constraints, unique keys, transactions, rollback, locks and reconnect/error paths. Use disposable fixtures only.
6. Repeat the tests with the actual supported Node LTS selected for the Wappler project. Do not infer Node compatibility from the package’s broad engines lower bound.
7. Capture Wappler version, Node/npm, MySQL server version, driver/dialect/version, host isolation (without secrets), test commands, Wappler GUI observations, outputs and failures under docs/evidence/TTP-2B/.

Knex documents both MySQL and MySQL2 dialects and requires a compatible driver package. The Wappler runtime source in this repository handles both client names, but neither is installed/configured for this project. Upstream MySQL2 CI includes MySQL 8.4/Node 22 coverage; that is useful component evidence, not an integration result for Wappler 7.9.9. The exact driver and Node LTS choice remains blocked pending the actual GUI-managed compatibility test.

## 6. Wappler-native connection and data boundary design

Use Wappler Database Manager and Server Connect Globals to define reusable connections and select them in native database actions. Do not add custom Express database routes, ORM, alternate query framework, runtime SQL shortcut or a shadow connection abstraction. Database credentials must remain server-side. Use the Wappler target-specific settings mechanism that is actually available in 7.9.9; record the generated files and verify their Design/Database Manager editability before accepting.

| Logical owner | Development connection | Test connection | Required boundary |
|---|---|---|---|
| Passport system | Dedicated MySQL 8.4 Development database and passport-specific principal | Distinct disposable Test database and principal | Own passport/account/case/payment/issuance/fulfilment data only |
| IVP | Separate MySQL 8.4 Development database and IVP-specific principal | Distinct disposable Test database and principal | Own IVP subjects, sessions, evidence references, checks and assertions only |

The initial application does not yet have these schemas or Server Connect actions. No schema is defined here. Keep the IVP independently extractable: no passport-owned table, passport case-state meaning or direct cross-database foreign key in IVP. Any future exchange is through an authenticated, versioned client/tenant API with scoped opaque references and per-operation tenant checks. Do not centralize cross-tenant identity lookup.

Use separate credentials by environment, logical database owner and operational purpose. If Wappler requires a separate direct Database Manager connection for schema-management actions, give it distinct, short-lived or operator-controlled credentials; never reuse a broad schema-owner account as the application runtime identity. The application runtime principal receives only the minimum DML privileges required by its eventual Wappler actions. It must not have global grants, user administration, arbitrary schema creation/drop, FILE, replication, or access to the other logical database. Migration/schema-change privileges, if later approved, belong to a separate migration operator/account and are not granted to runtime. Test automation uses only its disposable test principal.

## 7. Credentials, environment configuration and secret management

- Keep connection values on the server, scoped by environment/target. Browser code and static assets must never receive database credentials.
- Use Wappler 7.9.9’s supported target-specific Database Connection and environment-variable binding workflow after verifying it in the UI. Current documentation mentions per-target connection settings and $_ENV in Server Connect, but exact syntax and storage for this installed version must be proven before use.
- For local development, keep untracked secrets in an owner-approved local secret mechanism (for example OS keychain or ignored environment file); do not create or commit .env values in this baseline. In CI, use the approved secret store, scoped and masked per environment.
- Never reuse a Development credential in Test, production, the Wappler direct connection, or another logical database. Rotate credentials through the approved secret mechanism.
- Require TLS and certificate validation for any remote MySQL service; loopback-only isolated local service may use the approved local transport policy. Do not disable certificate verification to make a test pass.
- Do not place credentials in Wappler screenshots, test output, connection exports, exception messages, npm configuration, browser traces or Git history. Evidence stores only variable names, redacted host classifications and test outcomes.
- Public repository security review must scan current changed files and the entire push range for secrets, local database files, dumps, personal/identity evidence and internal infrastructure data.

## 8. Isolation, access control, backup and restoration

### Isolation and grants

- Keep Test independent from Development at both the database and data-volume/service level. The test account cannot connect to or enumerate Development or MAMP data.
- Keep passport and IVP databases separate and use distinct principals. Negative checks must prove passport credentials cannot read IVP tables and IVP credentials cannot read passport tables.
- Bind test databases/services to loopback or an isolated private network. No public database port, shared developer password, copied identity data or connection from production is permitted.
- Store only synthetic fixtures. Tests that create/drop schema or users run only against the explicitly identified disposable compatibility service after checking server identity and target names.

### Backup and restore

- Back up each logical database separately. Use encryption in transit and at rest, access controls, retention approved by the owner, checksums, and documented restore steps.
- Do not treat a backup as a test until restored to a fresh, isolated database and verified using a schema/fixture checksum and a test query.
- Test that runtime credentials cannot read backup storage or change backup policy. Keep backup keys separate from database passwords.
- Do not commit backups or database dumps. Keep only redacted commands, elapsed status, checksum/metadata, and restore evidence under docs/evidence/TTP-2B/.
- No production backup/retention policy or real-data recovery is approved by this baseline.

## 9. Reusable browser, API and regression test infrastructure

The existing project has no test script or tracked npm lockfile. The proposed test harness should be test-only and Wappler-independent: a browser runner for the actual Wappler Development/Test target, API request helpers for existing Wappler Server Connect actions, and database checks that use only an explicitly approved isolated test target. Do not add business app endpoints, custom server startup middleware, hidden routes, or a parallel business layer to support tests. The only possible temporary endpoint is the documented, loopback-only compatibility action constrained by §5 and removed before acceptance.

Proposed files, subject to owner approval and Wappler GUI validation:

| Proposed file/path | Responsibility |
|---|---|
| tests/README.md | Supported test commands, safe target selection, required environment variables, synthetic-data rule, evidence/cleanup instructions |
| playwright.config.js | Browser projects, target base URL supplied from environment, viewport matrix, screenshot/video-on-failure policy and artifact paths |
| tests/gui/ | Existing 15-route smoke, responsive, keyboard/accessibility, console/resource, navigation and screenshot checks |
| tests/api/ | Reusable API request setup and tests for actual Server Connect endpoints as later packages add them; no fictitious routes or mock-as-live claims |
| tests/database/ | Wappler-managed connection/version, privilege, failure/recovery, transaction and backup/restore checks against isolated synthetic fixtures only |
| tests/fixtures/ | Synthetic non-identity fixtures and controlled disposable DB setup; no personal data |
| tests/config/targets.example.json | Non-secret target aliases and required environment-variable names only |
| .gitignore additions if needed | Ignore browser traces, test artifacts, temporary database data and generated reports while retaining approved evidence |
| package.json / tracked lockfile | Only if approved: a dedicated test command and test-only browser dependency, resolved through Wappler-supported dependency management; no application runtime dependency |
| docs/evidence/TTP-2B/ | Actual version/config observations, commands, outputs, screenshots, connection and privilege tests, backup/restore evidence and review |

Playwright is proposed because root AGENTS.md prefers Playwright or another approved browser automation method and the suite needs repeatable screenshots and viewport checks. The actual version, browser binaries, CI availability and dependency impact must be decided before installation. For API checks, use the same test runner’s request facilities or built-in Node functionality; exercise only existing endpoints. No business API exists in the current scaffold, so API business-function tests are not applicable until an authorized later package creates actions. A redacted GET route smoke is not proof that future authorization or business APIs work.

Tests must run through the approved Wappler Development/Test configuration, use the real browser, retain accessible evidence, and avoid screenshots/traces containing secrets or personal information. GUI/business acceptance remains the owner’s responsibility even after automated tests pass.

## 10. Existing npm advisories and remediation strategy

The Stage 1 technical precheck recorded six moderate advisory groups, zero high/critical findings, and no tracked package lock. npm audit --json in the repository was blocked with ENOLOCK. A temporary copy of the installed dependency snapshot was audited with and without --omit=dev; both reported the same set because this manifest has no devDependencies group and nodemon is placed in dependencies. The temporary audit is not a reproducible committed dependency baseline.

| Package(s) reported | Direct/transitive path and current exposure | Fix/review strategy |
|---|---|---|
| archiver@7.0.1 | Direct runtime dependency; Wappler lib/modules/zip.js imports it. No current application Server Connect action establishes an externally reachable ZIP operation. | npm aggregate remediation points to Archiver 8.0.0, a major version. Validate Wappler ZIP API/runtime compatibility and regressions before any change. |
| archiver-utils@5.0.2, zip-stream@6.0.1 | Transitive under archiver (including archiver → zip-stream → archiver-utils); runtime ZIP module dependency. | The recorded npm remediation path includes the Archiver major update. No isolated Wappler-compatible patch was proven; do not force an override. |
| glob@10.5.0 | Transitive archiver → archiver-utils → glob; affected version range was 9.0.0–14.0.1, fixed in 14.0.2. Parent range ^10.0.0 excludes the fixed major. | Requires compatible parent dependency changes and Wappler ZIP regression checks; no direct override. |
| minimatch@9.0.9 | Transitive archiver → archiver-utils → glob → minimatch; recorded fix is 11.0.1, outside current parent ranges. | Reassess after a reproducible lockfile and upstream Wappler-supported dependency update; verify ZIP behavior. |
| minimatch@10.2.6, nodemon@3.1.14 | minimatch is transitive from direct nodemon; nodemon is development-oriented but is declared in runtime dependencies, so npm audit --omit=dev still includes it. npm start runs node ./index.js; no deployed nodemon call path is established. | Recorded fix for minimatch is 11.0.1, outside nodemon’s current range. npm reports a nodemon fix path, but exact patched resolution and Wappler behavior were not validated. Reclassify nodemon only after confirming Wappler’s Development workflow. |

The source review documents [GHSA-3g3m-2fjr-6pw4 for glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) and [GHSA-g3hv-75wg-m249 for minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249). See the [complete Stage 1 advisory evidence](../evidence/TTP-01A-01H/TECHNICAL_REVIEW_PRECHECK.md) for exact affected paths, ranges and original audit details.

Proposed remediation sequence:

1. In a separately approved dependency work item, establish a reproducible lockfile through Wappler-supported package management; first compare it with the currently installed package tree and accepted runtime.
2. Re-run npm audit --json and npm audit --omit=dev --json; retain full redacted outputs and record exact package paths and advisory IDs.
3. Ask Wappler support/release notes whether the bundled ZIP module and the selected Archiver version are supported. Evaluate fixed dependency trees in a disposable branch/project copy; do not apply npm audit fix, --force, manual overrides, or a driver/dependency replacement to the working project.
4. For each proposed change, run Wappler Design view, Development start, the 15-route/browser regression, ZIP module tests if applicable, and dependency/security checks. Classify runtime versus development exposure based on actual reachability, not package presence alone.
5. If no compatible fix is available, document compensating controls, exploit preconditions, owner risk acceptance and a review date. Keep the advisory open; do not hide it by suppressing audit output or moving packages without evidence.

This baseline makes no dependency change. Dependency remediation may be a separate authorized package if Wappler compatibility or scope requires it.

## 11. Acceptance criteria

| Acceptance ID | Acceptance criterion |
|---|---|
| AC-2B-001 | The environment map distinguishes observed Development from proposed isolated Test/Development services and records actual hosts/versions only after evidence; port 3002 and all 15 accepted GUI routes remain unchanged. |
| AC-2B-002 | MySQL Server is verified by authenticated server-side version query as an identified MySQL 8.4.x release; MariaDB and client-only version output are rejected as proof. |
| AC-2B-003 | A MySQL connection is created, saved, selected and connectivity-tested using Wappler 7.9.9 Database Manager/Server Connect with the actual driver/dialect/version recorded. |
| AC-2B-004 | Development and disposable Test are isolated; passport and IVP each have distinct databases and principals; tests prove there is no cross-environment or cross-boundary data access. |
| AC-2B-005 | Runtime, test and schema-management credentials have distinct, least-privilege grants; prohibited cross-database/DDL/admin access fails as expected. |
| AC-2B-006 | Secrets are target-scoped and server-side, excluded from Git/browser/artifacts, and TLS/certificate validation behaves as approved for the selected host. |
| AC-2B-007 | Controlled synthetic backup and restore for each test database succeeds into a clean isolated destination with integrity verified; no backup data is committed. |
| AC-2B-008 | A documented, repeatable GUI/API test harness runs against the actual Wappler target without persistent test endpoints; any temporary diagnostic action is isolated, documented and removed; API business behavior not yet present is explicitly reported N/A. |
| AC-2B-009 | Automated regression covers all 15 accepted GUI routes at 1440, 1024, 768 and 375 CSS px, with applicable keyboard/accessibility, console/resource and visual-baseline checks; port 3002 remains available for Development. |
| AC-2B-010 | A reproducible dependency audit and secret/private-data scan are retained; advisory dispositions and any Wappler-compatible mitigation are evidenced without automatic remediation. |
| AC-2B-011 | Rollback is documented and verified: the prior Wappler target/config and accepted GUI can be restored without touching MAMP, production or unrelated data/services. |

## 12. Planned automated tests

These are planned Stage 2B tests, not executed results. Execution occurs only after the owner approves this baseline and a safe isolated environment is provisioned. For all tests retain Test ID, Acceptance ID, environment, command/method, expected, actual, result, and evidence under docs/evidence/TTP-2B/. Missing infrastructure or access is BLOCKED, never PASS.

| Test ID | Acceptance ID | Planned command/method | Expected result/evidence |
|---|---|---|---|
| CT-2B-001 | AC-2B-001, 009 | Parse Wappler settings/routes and inspect Wappler UI; compare protected config paths and route map with accepted Stage 2A baseline; HTTP-check every route | Development remains on 3002; all 15 route/view/layout mappings remain intact; test target is separate and no MAMP configuration changed |
| CT-2B-002 | AC-2B-002, 003, 010 | Authenticated read-only SQL version query on identified isolated test service; Wappler connection test; record driver, Knex, Node, npm and Wappler versions | Server query confirms MySQL 8.4.x and not MariaDB; exact Wappler-managed connection and driver successfully execute a minimal synthetic query; incompatibility is recorded as FAIL/BLOCKED |
| CT-2B-003 | AC-2B-003 | Create/open the connection in Wappler Database Manager and run its connection/query test; if that does not exercise the Server Connect driver, use the narrowly scoped temporary diagnostic action allowed by §5 on loopback Test only; inspect Design view and prove the action is removed | Native Wappler configuration remains GUI-editable and operational; no hand-written application data layer or persistent endpoint; evidence captures output and redacted UI/config state; inability to safely isolate the action is BLOCKED |
| CT-2B-004 | AC-2B-004 | Connect separately as passport and IVP test principals; assert expected database identity, then attempt reads against sibling and Development databases | Allowed own-boundary reads succeed; cross-boundary and cross-environment reads fail; credentials/objects are not confused |
| CT-2B-005 | AC-2B-005 | Inspect grants using authorized DBA test account, then attempt disallowed DDL, privilege changes, file access and sibling-database reads with runtime/test users | Least privilege is demonstrated by allowed minimal operations and denied prohibited operations; test output contains no secret |
| CT-2B-006 | AC-2B-003, 005 | Stop only the package-owned disposable test service or deny its connection; call the Wappler connection; restore service and retry | Failure is bounded and non-sensitive; reconnect works after recovery; no data is duplicated or partially written; unrelated MAMP service remains untouched |
| CT-2B-007 | AC-2B-004, 007 | Back up synthetic passport and IVP test fixtures separately; restore each to a clean isolated destination; compare table/fixture checksums and read via Wappler | Both restores are complete and isolated; checksums and evidence match; backups and credentials remain out of Git |
| CT-2B-008 | AC-2B-008 | Run the documented browser and API test commands against Wappler’s actual target; exercise existing page routes and actual Server Connect endpoints only | Harness works reproducibly; existing route GET checks pass; API tests only cover configured endpoints. Current absence of business endpoints is reported N/A for business API assertions, not as a fabricated pass |
| CT-2B-009 | AC-2B-001, 009 | Real-browser suite over 15 routes × 1440/1024/768/375; screenshots; overflow, broken resources, console, keyboard/accessibility checks; compare available approved screenshots | No horizontal overflow or unapproved visual/runtime regression; screenshots and browser versions retained. Comparisons are PASS only where a real approved baseline is available |
| CT-2B-010 | AC-2B-006, 010 | npm audit --json and npm audit --omit=dev --json with a reviewed tracked lockfile; targeted secret/private-file scanner and push-range review | Exact advisory paths/status retained; no secret, identity, database dump or unintended private configuration in diffs/artifacts; no automatic fixes |
| CT-2B-011 | AC-2B-011 | Revert the Stage 2B change set in an isolated review branch or restore captured Wappler target settings; re-run CT-2B-001 route/config smoke and confirm services/processes | Previous accepted Wappler configuration and GUI are restored; port 3002 remains available; only package-owned disposable resources are removed; no MAMP or production change |

## 13. Proposed files and ownership

No files in this section are created by this draft other than this baseline document and the corresponding status-register references.

| Proposed file/group | Owner/purpose |
|---|---|
| Wappler-managed .wappler/ target and database connection metadata, created/saved only in Wappler 7.9.9 UI | Environment and connection configuration; inspect actual generated paths and keep credentials outside tracked values |
| tests/README.md, playwright.config.js, tests/gui/, tests/api/, tests/database/, tests/fixtures/ | Test-only harness and synthetic data; no application business modules/endpoints |
| package.json test script and a reviewed package lock | Reproducible test/dependency installation only after owner approval; no test-only dependency in production/runtime install |
| .gitignore entries if evidenced necessary | Ignore temporary profiles, browser traces, generated reports and test DB/dumps while preserving approved evidence |
| docs/evidence/TTP-2B/ | Actual version/config observations, commands, outputs, screenshots, connection and privilege tests, backup/restore evidence and review |
| docs/project/PROJECT_STATUS.md and docs/project/MASTER_DEVELOPMENT_REGISTER.md | Track Stage 2B as NOT_STARTED until its baseline receives owner implementation approval and work actually begins |

Do not directly edit Wappler-generated runtime code, App Connect/Bootstrap bundles, the current route configuration or page/layout files as part of environment setup.

## 14. Security, rollback and release gates

- Threat model cross-environment leakage, credential reuse, broad grants, direct Database Manager credentials accidentally reused by runtime, public MySQL exposure, insecure TLS, backup theft, test data copied from Development, test-target misselection and secrets in browser traces.
- Before any database command that can write, the test must verify the expected isolated server identity and database names using a non-secret label; abort when identity is unexpected. No cleanup command may target MAMP or another non-package service.
- Test fixtures are synthetic only. Store no real identity, biometric, passport, payment or courier data in test DBs, screenshots or test traces.
- Database users and grants are least-privilege; application secrets stay server-side. Keep IVP and passport isolation enforceable through database-level principals, not merely folder names or UI separation.
- The accepted 15-screen GUI, layouts, branding, Wappler app structure and port 3002 are regression invariants. Back-office preview routes remain static previews and are not public-production safe.
- No service starts at boot or becomes publicly reachable under this draft. Any infrastructure provider, Docker/container image, CI secret store, backup location, network rule or dependency addition requires explicit owner review within the approved baseline before implementation.

Rollback for a future approved implementation: retain the pre-change Git commit and Wappler target/connection configuration through supported Wappler export/snapshot mechanisms; restore the existing SQLite Development target and prior Wappler settings in the Wappler GUI; stop/delete only Stage 2B-owned disposable test services and synthetic test databases; never revert or reset unrelated owner files, MAMP data/services, production or the accepted GUI. Re-run the route/config regression before returning to work.

## 15. Owner decisions and blockers before implementation

The following must be confirmed before Stage 2B starts:

1. Approval or revision of baseline TTP-2B-DEVELOPMENT-ENVIRONMENTS-DRAFT-01 and its AC/CT scope.
2. Exact MySQL 8.4.x build, isolated provisioning method and owner for Development/Test services; confirmation that tests will not use MAMP.
3. Whether MySQL instances or logical databases provide the required passport/IVP separation, and approved names/hosts/ports.
4. Wappler 7.9.9-native Node driver/dialect and the supported Node LTS after connection and regression tests; Node 23 is EOL.
5. Approved local and CI secret mechanisms, TLS/CA policy, backup encryption/retention and restore destination.
6. Test runner/dependency version and whether a tracked lockfile/test-only dependency may be added via Wappler-supported dependency management.
7. Whether the existing six moderate npm advisory groups receive a separate remediation package or remain documented with compensating controls pending upstream-compatible Wappler fixes.

Until these decisions are approved and the applicable tests pass, MySQL 8.4 compatibility remains unverified; Stage 2B remains NOT_STARTED. No Stage 2C database schema, migration, authentication or application business feature is included.

## 16. References

- [Wappler: Connecting to a Database](https://docs.wappler.io/guided/database-connection/)
- [Wappler: Database operations in Server Connect](https://docs.wappler.io/guided/database-operations-quick-overview/)
- [Wappler: Database Connection reference](https://docs.wappler.io/guided/dbconnector_connect-reference/)
- [MySQL: Innovation and LTS release tracks](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html)
- [MySQL 8.4 FAQ](https://dev.mysql.com/doc/refman/8.4/en/faqs-general.html)
- [MySQL 8.4 upgrade paths](https://dev.mysql.com/doc/refman/8.4/en/upgrade-paths.html)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [Knex MySQL dialect and driver guide](https://github.com/knex/knex/blob/master/docs/src/guide/index.md)
- [MySQL2 upstream CI matrix](https://github.com/sidorares/node-mysql2/blob/master/.github/workflows/ci-mysql.yml)
- [Stage 2A accepted GUI and test evidence](../evidence/TTP-2A/OWNER_CLOSURE_ACCEPTANCE.md)
- [Stage 1 technical review and dependency audit](../evidence/TTP-01A-01H/TECHNICAL_REVIEW_PRECHECK.md)
