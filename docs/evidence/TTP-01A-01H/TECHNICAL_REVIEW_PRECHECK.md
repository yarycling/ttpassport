# TTP-01A-01H Technical Review Precheck

- **Review package:** TTP-01A-01H-REVIEW
- **Review date:** 22 November 2026
- **Stage 1 status:** DEVELOPMENT_COMPLETE; not CLOSED_PASS
- **Recommendation:** **BLOCKED** pending an authoritative reference for the requested Option C policy and resolution of the documentation discrepancies below.

This record prepares Stage 1 for independent technical review. It does not approve legal policy, implement Stage 2, close Stage 1, or authorize a database, dependency, Wappler connection, application port, or GUI baseline change.

## Documents reviewed

- Root `AGENTS.md` (read in full; no nested `AGENTS.md` was found).
- `docs/project/PROJECT_CHARTER.md`.
- `docs/requirements/BUSINESS_REQUIREMENTS.md` and `docs/requirements/PASSPORT_FORM_MAPPING.md`.
- `docs/architecture/BUSINESS_WORKFLOWS.md` and `docs/architecture/SOLUTION_ARCHITECTURE.md`.
- `docs/governance/LEGAL_AND_POLICY_DEPENDENCIES.md` and `docs/integrations/INTEGRATION_REGISTER.md`.
- `docs/PROJECT_ROADMAP.md`, `docs/project/MASTER_DEVELOPMENT_REGISTER.md`, and `docs/project/PROJECT_STATUS.md`.
- `docs/evidence/TTP-01A-01H/command-test-record.md`.
- GUI baseline scope/acceptance records: `docs/GUI_BASELINE_01.md`, `docs/GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md`, and the existing GUI-BASELINE-01B evidence records. GUI acceptance remains separate from this technical review.

## Traceability and architecture findings

| Review requirement | Source documents and exact sections | Finding |
|---|---|---|
| Account for all 150 package IDs | `AGENTS.md`, §16 “Development roadmap and stable work-package IDs”; `docs/PROJECT_ROADMAP.md`, stage table; `docs/project/MASTER_DEVELOPMENT_REGISTER.md`, package table; `docs/project/PROJECT_STATUS.md`, package table | PASS. The roadmap range totals 150. Both the master register and status register contain 150 unique expected IDs, with no missing, duplicate, or unexpected IDs. Future package titles are left for approved baselines rather than invented. |
| Stable business requirement identifiers | `docs/requirements/BUSINESS_REQUIREMENTS.md`, requirements table and “Acceptance boundary” | PASS. BR-001 through BR-032 are present once each and in sequence. Each row maps to stable roadmap package IDs and states an acceptance caveat. |
| Workflows agree with requirements and official-form constraints | `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-004, BR-009–BR-026 and BR-032; `docs/requirements/PASSPORT_FORM_MAPPING.md`, “Source and mapping rules”, “Supporting evidence checklist from 2026 instructions”, and “Open validation points”; `docs/architecture/BUSINESS_WORKFLOWS.md`, “Required separation of outcomes” and sections 1–15 | PASS with approvals pending. Both local and overseas applicants are included. The first-time flow preserves the documented in-person appointment requirement and says online preparation must not be represented as legal completion before approval. Age 16–17 guardian handling remains open for policy/legal validation. |
| eKYC is the project's own platform; no NOBIS dependency | `AGENTS.md`, §§1, 3, 6, and 8; `docs/project/PROJECT_CHARTER.md`, “Objectives” and “Confirmed owner decisions and pending decisions”; `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-005–BR-008; `docs/architecture/BUSINESS_WORKFLOWS.md`, §2 “eKYC identity verification”; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §§2–3 and 7; `docs/integrations/INTEGRATION_REGISTER.md`, integration table | PASS as a design requirement. The project owns the IVP concept and treats NOBIS as unavailable/not a dependency. No NOBIS provider is registered. This is not an implemented or operating IVP service: the current scaffold has no IVP API, data model, or Server Connect business action. |
| IVP remains extractable as a standalone service | `AGENTS.md`, §6 “Architectural separation and modularity” and §3 “Specialised eKYC carve-out”; `docs/project/PROJECT_CHARTER.md`, “Objectives”; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §3 “Proposed modules and data ownership” (IVP row and “Application and IVP” relationship), §7 “API and integration boundaries” | PASS as a proposed boundary, not as a demonstrated extraction. The design gives IVP its own data owner, client/tenant scope, authenticated versioned API, and no passport-specific tables or direct cross-database foreign keys. Future standalone deployment still needs approved contracts, service implementation, isolation tests, and extraction evidence. |
| Wappler Server Connect is the ordinary application framework | `AGENTS.md`, §§2, 4, 5, and 6; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §2 “Proposed application architecture”, §4 “Authentication and authorization boundaries”, and §7 “API and integration boundaries”; `docs/architecture/BUSINESS_WORKFLOWS.md`, §§6, 10, and 14 | PASS as the intended development rule. Wappler App Connect, Server Connect, native Database actions, and Security Providers remain primary for ordinary behavior. Current implementation status is accurately limited: App Connect/EJS layouts exist, but there are no business Server Connect actions or Security Providers. |
| Passport and IVP data boundaries stay separate | `AGENTS.md`, §6; `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-005–BR-008; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §3 module/data-ownership table and conceptual-model row “Application and IVP”; `docs/architecture/BUSINESS_WORKFLOWS.md`, §2 | PASS as a proposed architecture. Passport keeps an opaque, versioned IVP reference; IVP owns its subjects, sessions, checks, reviews, and assertions and enforces client/tenant scope. No contrary cross-database dependency was found in the reviewed documents. |
| Risk approvals follow the specified Option C policy | `AGENTS.md`, §7; `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-020; `docs/architecture/BUSINESS_WORKFLOWS.md`, §8 “Risk-based approval”; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §4; `docs/governance/LEGAL_AND_POLICY_DEPENDENCIES.md`, LP-013 | **BLOCKED.** No “Option C” text or approved Option C source was found in `AGENTS.md` or the reviewed repository documents. The available baseline only says routine cases may be approved by currently authorized officers, enhanced cases require a different authorized decision-maker, and security holds need designated authority. LP-013 leaves risk categories, delegations, hold authority, and conflict checks open. This general rule cannot be treated as proof of conformance to a specific Option C policy. |
| Domestic and overseas applicants are supported | `docs/project/PROJECT_CHARTER.md`, “Purpose”, “Intended operator and stakeholders”, and “Confirmed owner decisions and pending decisions”; `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-004 and BR-025; `docs/requirements/PASSPORT_FORM_MAPPING.md`, applicant address/evidence mappings and open validation point 5; `docs/architecture/BUSINESS_WORKFLOWS.md`, §§5, 14, and 15; `docs/governance/LEGAL_AND_POLICY_DEPENDENCIES.md`, LP-016 | PASS as intended scope; cross-border legality and mission/courier capability remain open. Supporting overseas applicants does not assert that remote proofing or cross-border evidence transfer is approved. |
| Payment, issuance, release, and delivery remain distinct | `AGENTS.md`, §§1, 11–13; `docs/requirements/BUSINESS_REQUIREMENTS.md`, BR-022–BR-026; `docs/architecture/BUSINESS_WORKFLOWS.md`, “Required separation of outcomes” and §§10–15; `docs/architecture/SOLUTION_ARCHITECTURE.md`, §§3 and 8 | PASS. Payment/settlement, application decision, production/QC, legal issuance, release authority, custody, and delivery confirmation are separate records and gates. No automatic issuance/release or invented provider capability is specified. |
| Government approvals and external dependencies remain explicit | `docs/project/PROJECT_CHARTER.md`, “Confirmed owner decisions and pending decisions”; `docs/governance/LEGAL_AND_POLICY_DEPENDENCIES.md`, LP-001–LP-020, “Source-backed operational constraints”, and “Gate before affected implementation”; `docs/integrations/INTEGRATION_REGISTER.md`, integration table and “Integration boundary requirements”; `docs/requirements/PASSPORT_FORM_MAPPING.md`, “Open validation points” | PASS. The documents identify unresolved authority, remote-service, identity, biometric, signature, privacy, retention, issuance, risk delegation, fee, cross-border, fulfilment, accessibility, and security decisions. They correctly leave affected implementation gated. |

## Documentation consistency findings

1. **Option C source is absent.** This is the principal acceptance gap. The approval model recorded in `AGENTS.md` and LP-013 is directionally consistent with independent review but does not name, define, or map to Option C. Obtain the authoritative approved policy/version or a human-approved mapping before claiming this criterion passes.
2. **Database statement needs a time qualifier.** `docs/architecture/SOLUTION_ARCHITECTURE.md`, §5 “Current development state”, says there is no evidenced MySQL server. This review found a local MAMP `mysqld` process listening on loopback port 3306. The process's server executable reports 5.7.39; an unauthenticated `SELECT VERSION()` was refused with access denied, so no SQL-reported server version was obtained. The earlier statement may describe the earlier inspection, but it is no longer an accurate unqualified current snapshot. Preserve the distinction between server executable and client versions and date-scope the old evidence in a later approved documentation update.
3. **Dependency evidence cross-reference is incomplete.** `docs/architecture/SOLUTION_ARCHITECTURE.md`, §9 says exact advisory ranges and results are recorded in `docs/evidence/TTP-01A-01H/command-test-record.md`. That record lists six affected package names/versions and the Archiver major-fix note, but does not include the affected ranges, advisory identifiers, full paths, or runtime/dev assessment requested here. This precheck supplies those details; the existing cross-reference should be reconciled during a documentation update.
4. **Form/legal status is consistently caveated.** `PASSPORT_FORM_MAPPING.md`, “Open validation points”, LP-002, and `BUSINESS_WORKFLOWS.md`, §3 all require confirmation of the current official form/instructions and retain the in-person appointment constraint. No claim of an approved fully online legal application was found.

No other contradiction was identified among the requirements, form mapping, workflows, architecture, policy register, and integration register. These documents are proposals/baselines subject to their stated owner and Government approvals, not evidence that the proposed workflows have been implemented or authorized.

## Documentation validation results

| Check | Command/method | Result |
|---|---|---|
| Package ID accounting | Python extraction of package-table IDs in the master and status registers against the 18 stage counts in `AGENTS.md` | PASS: 150/150 unique IDs in each register; no missing, duplicate, or unexpected IDs |
| BR identifier sequence | Python extraction of requirement-table IDs in `BUSINESS_REQUIREMENTS.md` | PASS: BR-001–BR-032, 32 unique rows |
| Local Markdown links | Python scan of relative links in `docs/**/*.md` | PASS: 19 local links checked; 0 missing targets |
| Option C search | Case-insensitive search across `AGENTS.md` and `docs/` | BLOCKED: no matching approved policy source |
| Wappler/database settings | Read-only inspection of `app/modules/connections/db.json`, `.wappler/targets/Development/databases/db.json`, `app/config/config.json`, package manifest, and installed dependency tree | PASS: SQLite remains configured; port remains 3002; no MySQL driver found; no DB or connection was created/changed |

## Database and MySQL 8.4 assessment

### Observed configuration and local server

- The active Wappler Development target and app connection both specify `sqlite3` and `/db/db_dev.sqlite3`. The ignored `db/` directory is empty; no SQLite database file or schema is present.
- The package manifest has no `mysql` or `mysql2` driver. No MySQL connection was added, no database was created, and no schema or data was read or modified.
- A local MAMP MySQL server process is listening on `127.0.0.1:3306`. The running `mysqld` executable reports **MySQL Community Server 5.7.39**. Separately, the `mysql --version` client output also reports a 5.7.39 distribution; that client output is not the basis for the server finding.
- A read-only `SELECT VERSION()` attempt without credentials returned MySQL error 1045 (access denied). Therefore, an authenticated SQL query did not independently return the running server version. The evidence establishes a reachable local MySQL listener and identifies the running executable's build, not access to its data or a Wappler connection.

### MySQL 8.4 compatibility conclusion

MySQL 8.4 is a reasonable **candidate** for evaluation because Oracle classifies 8.4 as an LTS series and documents it as production-supported. Oracle states that MySQL 5.7 active development ended in October 2023. The local 5.7.39 instance should not be treated as an approved or current production target. See [Oracle's MySQL release-track guidance](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html) and [MySQL 8.4 FAQ](https://dev.mysql.com/doc/refman/8.4/en/faqs-general.html).

The Wappler documentation supports configuring target-specific database connections through the visual Database Connections workflow ([Wappler database connection guide](https://docs.wappler.io/guided/database-connection/)). That is evidence for Wappler-managed connection configuration in general, not proof that this installed Wappler 7.9.9 project, a specific Node driver, and MySQL Server 8.4 interoperate correctly. The current project has no MySQL driver or connection, so **Wappler 7.9.9 + Node v23.6.0 + a Wappler-managed driver + MySQL 8.4 has not been tested**.

Before approving MySQL 8.4, use a disposable non-production server and Wappler's GUI-managed target to establish driver/runtime support, authentication/TLS, collation and SQL mode, date/time handling, JSON and constraint behavior, transactions/locking, migration and restore behavior, and backup/security configuration. Do not create that target or database as part of this precheck. Oracle's documentation also cautions that LTS status alone does not establish application compatibility; major-version changes require preparation and testing ([MySQL upgrade best practices](https://dev.mysql.com/doc/refman/8.4/en/upgrade-best-practices.html)).

## npm dependency advisory assessment

### Commands and audit scope

- `npm audit --json` in the repository: **BLOCKED / ENOLOCK**, because there is no tracked `package-lock.json` or `npm-shrinkwrap.json`.
- To inspect the installed dependency tree without changing repository files, copied `package.json` and `node_modules/.package-lock.json` into a temporary directory, then ran `npm audit --json` and `npm audit --omit=dev --json` there. Both exited 1 and reported six moderate vulnerability groups, zero high/critical findings. The temporary copy is evidence about the installed tree, not a reproducible audit of a committed lockfile.
- Both audit modes reported the same findings because the manifest has no `devDependencies` group and `nodemon` is declared under `dependencies`.
- `npm explain archiver archiver-utils glob minimatch zip-stream nodemon` confirmed the paths below. The two `minimatch` copies are `9.0.9` and nested `10.2.6`; audit groups them under one vulnerable package name.

| Installed vulnerable package | Direct/transitive and dependency path | Exposure in this scaffold | Available fix and Wappler impact |
|---|---|---|---|
| `archiver@7.0.1` | Direct (`package.json`); depends on `archiver-utils@5.0.2` and `zip-stream@6.0.1` | Runtime dependency. Wappler's `lib/modules/zip.js` imports it, but there are currently no application Server Connect actions, so an externally reachable path is not demonstrated. | npm's remediation path is `archiver@8.0.0`, a semver-major upgrade. Archiver 8 changes its dependency tree and API compatibility with Wappler's ZIP module has not been tested. Do not update the Wappler-managed runtime dependency here. |
| `archiver-utils@5.0.2` | Transitive: `archiver → archiver-utils`; also `archiver → zip-stream → archiver-utils` | Runtime transitive dependency of the Wappler ZIP module. | Affected through `glob` below; npm's aggregate remediation path is the Archiver 8 major update. No isolated compatible update was validated. |
| `glob@10.5.0` | Transitive: `archiver → archiver-utils → glob` | Runtime transitive dependency; attacker-controlled request reachability or use of abortable glob traversal is not established in current app actions. | GHSA-3g3m-2fjr-6pw4 affects `glob` 9.0.0–14.0.1; fixed in 14.0.2. Current parent requires `glob ^10.0.0`, so the fixed major is outside that range. The audit's package-level fix path is Archiver 8. |
| `minimatch@9.0.9` | Transitive: `archiver → archiver-utils → glob → minimatch` | Runtime transitive dependency on the ZIP module path. | GHSA-g3hv-75wg-m249 affects `minimatch` 7.0.0 through versions below 11.0.1; fixed in 11.0.1. The current parent ranges select 9.x, so the fix is outside the current major range. |
| `minimatch@10.2.6` | Transitive: `nodemon → minimatch` | `nodemon` is a development-oriented watcher by role, but the manifest places it in `dependencies`; `npm audit --omit=dev` therefore retains it. `npm start` runs `node ./index.js`, not `nodemon`; a deployed runtime call path is not established. | Fixed `minimatch` is 11.0.1, outside nodemon's current `^10.2.1` range. npm audit metadata reports a fix available for `nodemon`, but the dry-run did not establish a patched compatible resolution. Verify an upstream-compatible resolution before changing the Wappler-managed dependency tree. |
| `zip-stream@6.0.1` | Transitive: `archiver → zip-stream → archiver-utils` | Runtime transitive dependency of the Wappler ZIP module. | npm audit metadata marks a fix available, but the aggregate Archiver path requires Archiver 8. No exact compatible patched resolution or Wappler regression result was demonstrated. |
| `nodemon@3.1.14` | Direct (`package.json`) and listed under `dependencies` | Development tooling in practice; current `start` script does not invoke it. It is nevertheless included by production dependency installation and by `--omit=dev` audit. | npm audit metadata marks a fix available; exact compatible version/resolution and Wappler Development behavior remain unverified. Reclassifying or updating it needs a Wappler-compatible dependency baseline and reproducible lockfile. |

The underlying reviewed advisories describe availability/denial-of-service risks: [GitHub Advisory GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) for `glob` and [GitHub Advisory GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) for `minimatch`. Package presence alone does not prove exposure through an application route. A committed lockfile and Wappler-supported dependency remediation are required before a reproducible clean audit can be claimed. No dependency was upgraded or replaced.

## Git publication review

Before this precheck was added, `main` was two commits ahead of `origin/main`: `20c7c03` (`docs(stage1): establish TTPASSPORT foundation`) and `f28543b` (`docs(status): record Stage 1 commit evidence`). The range contained only documentation and GUI acceptance records; no application source, Wappler runtime, dependency manifest/lockfile, connection, route, port, or database files.

The review scan found no tracked credential/private-key/database/upload paths in the commit range and zero matches for private-key blocks, AWS access-key tokens, GitHub tokens, credential assignments, or database connection URIs in added lines. No dedicated `gitleaks`, `trufflehog`, or `detect-secrets` executable is installed, so this is a documented pattern scan plus manual review, not a claim from a dedicated secret-scanning product. No real identity data or provider secrets were found. The new precheck records only the local loopback listener and binary version, without credentials or personal data.

Publication decision: the reviewed changes are suitable to publish to the existing public `main` branch. The planned push must remain a normal fast-forward push; do not force-push or rewrite history. Re-fetch and verify remote state immediately before publishing, then verify `origin/main` equals the pushed local commit.

## Review evidence summary

| Check ID | Acceptance area | Command/method | Expected | Observed result |
|---|---|---|---|---|
| TR-001 | Package coverage | Python count/sequence check over both registers | Exactly 150 unique IDs | PASS: both registers contain 150/150 |
| TR-002 | Requirement traceability | Python check over BR rows | Stable BR-001–BR-032 IDs | PASS: 32/32 unique and sequential |
| TR-003 | Documentation references | Relative Markdown link scan | All local links resolve | PASS: 19 checked, none missing |
| TR-004 | Option C policy | Case-insensitive source search and section review | Authoritative policy/version and mapped rule | BLOCKED: no Option C source in `AGENTS.md` or `docs/` |
| TR-005 | Dependency audit | `npm audit --json`; temporary hidden-lock audits with and without dev packages | No advisories or fully assessed remediation | FAIL/BLOCKED: direct audit cannot run without tracked lock; temporary audits find six moderate groups |
| TR-006 | MySQL availability/configuration | Read-only config/process/listener inspection; unauthenticated `SELECT VERSION()` | Identify SQLite state and distinguish client/server evidence | PASS: SQLite confirmed; local MySQL listener and server executable found; SQL version query denied; no connection/database change |
| TR-007 | Public commit safety | `git diff --check`, changed-path review, targeted secret-pattern scan | Documentation-only changes, no secrets/sensitive data | PASS: reviewed range is documentation/acceptance material; no matches in reviewed secret patterns |

## Outstanding items for independent review

1. Supply the approved Option C policy/source and version, or an authorized written mapping from it to the general workflow already recorded. Keep LP-013 open until the risk/authority matrix is approved.
2. Review the proposed IVP boundary as architecture only; require a later approved baseline and extraction/isolation evidence before claiming standalone readiness.
3. Correct or date-scope the stale MySQL server statement and the dependency-detail cross-reference in a separately reviewed documentation update.
4. Obtain a tracked, Wappler-approved lockfile/dependency baseline and assess the fixes without changing Wappler-managed packages in this review.
5. Approve a non-production MySQL target and verify Wappler/driver/server compatibility through Wappler GUI before any database migration work.
6. Preserve GUI acceptance as owner-reviewed and do not mark Stage 1 CLOSED_PASS. Stage 2 remains unstarted.

**Final precheck recommendation: BLOCKED.** The documentation is substantially traceable and internally consistent, but the specific Option C acceptance criterion is unverifiable from the approved project record. This report does not close Stage 1 or authorize Stage 2.
