# Solution Architecture and Technical Foundation Assessment

**Work package:** TTP-01G (Stage 1G)
**Version:** 1.0
**Baseline date:** 22 November 2026
**Status:** Proposed architecture; owner technical review pending

This document describes the current scaffold and a reviewable direction. It does not authorize a new database, migration, service, authentication implementation, production exposure, or change to generated runtime code.

## 1. Verified current scaffold

| Item | Workspace evidence |
|---|---|
| Project | Existing Wappler web project `ttpassport`; repository branch `main`, clean before this documentation change |
| Wappler | Desktop Wappler `7.9.9` confirmed by accepted GUI-BASELINE-01B evidence |
| Runtime | Node `v23.6.0`, npm `10.9.2`; installed Express `5.3.0` (manifest range `^5.2.1`); `package.json` requires Node `>=22`; project uses Wappler-generated Node/Express server files |
| UI framework | Bootstrap `5.3.8` / Wappler Bootstrap 5 project configuration, local App Connect `2.2.5` |
| Target and port | Active `.wappler/project.json` target `Development`, URL `http://localhost:3002/`; `app/config/config.json` port `3002` |
| Routes/screens | 15 configured route entries in `app/config/routes.json`; all existing views/layouts remain present. See `../GUI_BASELINE_01.md` for the route list and GUI evidence |
| App Connect / Server Connect | App Connect and static EJS layouts are present. No business Server Connect actions or Security Providers are configured at this baseline |
| Database | Wappler Development target is SQLite, file `/db/db_dev.sqlite3`; target connection in `.wappler/targets/Development/databases/db.json` and `app/modules/connections/db.json`. `db/` is empty/ignored; no schema is established |
| MySQL evidence | `mysql --version` reports client distribution `5.7.39`; this does not establish a running MySQL server or its version. No `mysql`/`mysql2` driver is present in the current npm dependency tree |
| Git | `origin` is `https://github.com/yarycling/ttpassport.git`; remote `main` was verified at baseline commit `8c38241`. The repository is public per committed GUI-BASELINE-01B audit evidence |
| Current running app | At inspection, a Node process was already listening on port `3002`, and `GET /` returned HTTP 200. It was not stopped or restarted during this read-only assessment |

The [GUI baseline record](../GUI_BASELINE_01.md) and its evidence files document a fresh `npm start` restart, 15 route/resource checks, App Connect interaction, Wappler Design view, and visual owner acceptance. The owner accepted the 15-screen presentation baseline on 22 November 2026. That acceptance does not approve the unprotected staff preview routes for production; they remain static and without staff authentication or a Development-only route gate.

## 2. Proposed application architecture

```text
Citizen browser / staff browser
              |
       Wappler App Connect
              |
   Wappler-generated Node/Express runtime
      |               |                 |
 Wappler Security   Server Connect    static EJS/layouts
 Provider            actions/libraries
      |               |
      +---- native Wappler Database actions / transactions ---- proposed MySQL
                       |
              authenticated versioned IVP API
                       |
         isolated, separately deployable IVP boundary
         (specialist adapters only after Extension Request approval)
                       |
     approved government / finance / logistics interfaces
```

Ordinary application behavior stays inside GUI-maintainable Wappler App Connect and Server Connect components, native database actions, validators, conditions, transactions and Wappler Security Providers. Do not add custom Express business controllers/routes, middleware, an ORM, shadow authentication, runtime SQL, or generic hand-written JavaScript for standard page behavior.

## 3. Proposed modules and data ownership

| Module | Owns | Boundary / controls |
|---|---|---|
| Citizen accounts | `citizen_account`, account credentials/recovery and contact verification | Wappler-native Security Provider; account proof is not identity proof |
| Applicant profile and application | `applicant_profile`, `passport_application`, source form version, submitted snapshot, corrections, documents/evidence references | First-time and renewal types remain separate; evidence stored privately; application approval separate from identity and citizenship |
| IVP | `ekyc_subject`, client/tenant registry, verification sessions, checks/reviews, evidence references and assertions | Separate logical data owner and authenticated versioned API; no passport-specific table dependency or direct cross-database foreign key; every operation client/tenant scoped |
| Immigration case management | staff identity/roles, office/mission scope, assignments, queues, decisions, holds and safe audit references | Wappler Security Provider plus permission, jurisdiction, assignment, state and policy on every backend action |
| Finance | fee schedules, payment references, settlement/reconciliation, refund/reversal ledger | Separate accounting states from case decisions; decimal/minor units; idempotent callbacks |
| Production and issuance | production batches/events, QC, issuance records, official identifiers sourced through approved process | Manual recording initially; append-oriented history; no printer integration or invented passport number |
| Fulfilment | custody items, manifests, shipment, recipient authority, release and proof | Issuance ≠ release ≠ delivery; item-level reconciliation and authorized recipient checks |
| Audit and communications | event metadata, notifications, reports and delivery of approved safe messages | Least privilege, data minimization, safe logging, versioned templates and audited exports |

The IDs listed in root `AGENTS.md` remain distinct. No global identity lookup across unrelated IVP tenants is allowed without a separate legal/technical approval.

### Conceptual data model for Stage 2 review (no DDL)

The following is a workshop foundation, not an approved schema. Validate exact cardinalities, keys, effective dates, legal holds, retention, and event ownership with the package owner before any migration.

| Record group | Conceptual relationship |
|---|---|
| Citizen account and applicant profile | An authenticated account may have an applicant profile; profile data and account credentials have separate access/retention rules. A person may participate as applicant, guardian, recommender or recipient through distinct role records, never by impersonation. |
| Applicant profile and passport application | A profile may reference multiple separately categorized applications. Each application stores its service/form version, submitted snapshot, correction versions, evidence references and state history. First-time and renewal are not conflated. |
| Application and IVP | IVP subject/session/check/assertion records are owned by IVP and scoped to client/tenant. Passport stores only an opaque, versioned assertion/evidence reference returned through the API; no cross-database foreign key or passport-specific status inside IVP. |
| Application and office routing | Preferred office is an applicant preference; intake, processing, issuing and fulfilment locations are separate records/events linked to jurisdiction and capability references. |
| Staff, roles, offices and assignment | Staff identity is distinct from granular permissions and effective-dated office/mission grants. Assignment links an authorized actor and target case with current-state version and audit event. |
| Application, decision and finance | Case decisions and holds are append-oriented case events. Fee assessment, payment intent, settlement, refund and reconciliation are separate finance records linked by opaque application references. |
| Application, production and issuance | Production, QC, legal issuance and any official number assignment are separate records with approved authority and event history; issuance is not a boolean on the application. |
| Issuance, fulfilment and physical custody | A fulfilment request references an issued item only when policy permits. Shipment/manifest events record each physical item; recipient authorization, release and delivery confirmation are separate records. |
| Cross-cutting audit | Events reference actors and opaque subject IDs, record safe state transitions, and avoid raw identity/biometric/payment data. Retention, tamper evidence and export rules need approval. |

Schema constraints to evaluate include stable opaque external references, unique/idempotency keys, application/version concurrency, transactional event writes, append-oriented decision/issuance/custody/ledger histories, and no cascade deletion of regulated evidence.

## 4. Authentication and authorization boundaries

- Separate citizen, staff/administrator, and machine-client trust contexts; do not share a weak authentication factor as authorization.
- Use Wappler Security Providers and backend `Security Restrict`/identify capabilities in the actual installed version. Confirm configuration via Wappler before implementing.
- Back-office role categories are Administrator, Supervisor and Staff; granular permissions are separate. Enforce permission + office/mission jurisdiction + case assignment + state + policy server-side.
- Re-evaluate jurisdiction after transfers. Recommenders, guardians and representatives authenticate as themselves.
- Step-up/fresh authentication requirements for privileged actions need policy approval. Email OTP alone must not secure privileged APIs.
- Test altered object IDs, cross-office and cross-tenant access, expired sessions, denied mutations and self-approval conflicts before acceptance.

## 5. Database strategy and controlled SQLite-to-MySQL proposal

### Current development state

Development is configured for SQLite at `/db/db_dev.sqlite3`. The file is ignored and absent; no live/local schema or data has been inspected. There is no evidenced MySQL server. The installed MySQL CLI is version `5.7.39`, which is a client binary version only. The Wappler project currently lacks a MySQL Node driver in its npm dependency tree, so MySQL connection compatibility is not yet demonstrated.

### Proposed direction for owner review

MySQL is the proposed operational database. Evaluate an approved **MySQL 8.4 LTS** service as the candidate target; the version line is actively maintained by Oracle as of this assessment. This is a candidate, not a selected/approved server. Confirm hosting support, security patch policy, backups, encryption, residency, Wappler 7.9.9 compatibility, installed driver, collation, SQL mode, isolation, constraints, JSON/time types, and migration/restore behavior before choosing a version. See [Oracle's MySQL 8.4 release notes](https://dev.mysql.com/doc/relnotes/mysql/8.4/en/) and [release-track guidance](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html).

The Wappler documentation describes adding database connections through **Workflows → Globals → Database Connections**, with per-target connection details where targets differ ([Wappler database connection guide](https://docs.wappler.io/guided/database-connection/)). After owner approval, use Wappler Database Manager/connection configuration to add a distinct non-production MySQL target; verify the exact GUI and generated configuration in installed Wappler before any migration. Do not edit the existing SQLite connection or create a database now.

### Controlled migration sequence (proposal only)

1. Approve environment, server/version, data classification, credentials method, database name/owner/grants, backup owner and target-specific connection values.
2. Create a disposable non-production MySQL environment through an approved operator; record server version, charset/collation, SQL mode, TLS, least-privilege grants and restore point.
3. In Wappler GUI, create a separate MySQL connection for the approved target and verify the native driver/configuration without replacing SQLite Development.
4. Approve versioned schema definitions and synthetic fixtures. Use Wappler-native Database Manager/actions for runtime operations; any raw SQL is limited to reviewed, versioned schema/migration fixtures under root `AGENTS.md` rules.
5. Rehearse forward migration, data consistency, rollback/restore and concurrency/transaction behavior on disposable data; preserve existing source data and prove rollback before cutover.
6. Owner/security reviewer approves a separate migration package before any target switch. Retain SQLite until the migration is accepted and rollback window closes.

## 6. Private files and evidence

Sensitive evidence, document images, photographs and biometric samples must be outside `public/` in approved private encrypted storage. Use generated opaque object keys, content/size/type validation, malware scanning or approved equivalent, access checks on every read, and server-side linkage to subject/case. Preserve originals; derivatives are separately versioned. Storage provider, keys, region, retention and deletion rules remain unselected pending government privacy/security review.

## 7. API and integration boundaries

- Passport application is Client #1 of IVP through authenticated, versioned, client-scoped contracts; no direct passport-to-IVP database foreign keys.
- External government, biometric, payment and courier providers sit behind documented provider adapters. No interface, endpoint or provider is assumed available.
- Use opaque public references, server-side authorization, idempotency, replay defense, rate limits, timeouts, safe errors, reconciliation and versioned schemas.
- OCR, biometrics/PAD, cryptographic verification, authoritative-source adapters, reliable queues and provider-specific SDKs may require specialist capabilities. Stop that slice and submit the exact Section 3 Extension Request required by `AGENTS.md` before adding a service, SDK, Wappler extension or worker.

## 8. Transactions, audit and concurrency

Use Wappler Database Transaction for coupled operations such as submission + snapshot + history; assignment; decision + audit; payment settlement; production/issuance; release + custody; and dispatch batch handover. Enforce uniqueness, state/version checks, row locking where supported, and idempotency. Record append-oriented event metadata (actor, UTC time, action, opaque subject, source, prior/new state and safe reason). Do not put DOB, identity numbers, full addresses, face images, raw evidence, credentials, access tokens, card data or provider secrets in generic logs.

## 9. Public GitHub and dependency risk

The remote repository is public according to the prior GUI-BASELINE-01B audit. Before each commit, review the exact staged diff and run secret/private-data scans. Keep `.env`, keys/certificates, database files, uploads, storage, test identities and exports out of Git; `.gitignore` has these patterns and local `/db` is ignored. Public source can disclose route shape and implementation details, so no real secrets or operationally sensitive configuration belongs in source/docs.

`package.json` has no tracked lockfile; `node_modules/.package-lock.json` is local and ignored. A current `npm audit` was run against a temporary copy of the manifest plus the installed hidden lock. It reported **six moderate advisories** affecting `archiver@7.0.1`, `archiver-utils@5.0.2`, `glob@10.5.0`, `minimatch@9.0.9` and `10.2.6`, `nodemon@3.1.14`, and `zip-stream@6.0.1`. The audit shows the available `archiver` remediation path requires major version 8; it reports a fix available for the `nodemon` and `zip-stream` findings. Exact advisory ranges and results are recorded in `docs/evidence/TTP-01A-01H/command-test-record.md`. No dependency was upgraded; review a reproducible lockfile, production dependency reachability, advisory details and an owner-approved remediation plan before changing packages.

## 10. Environment and deployment requirements

Current environment is local Wappler Development only. Production/staging target, domain, cloud/hosting owner, network segments, TLS termination, WAF/rate limits, secrets manager, backup region, observability, incident response, support model, data residency, CI/CD and release/rollback procedure remain undecided. Keep staff preview routes inaccessible from public/production targets until an approved security package adds Wappler-native restrictions or removes those routes.

## 11. Unresolved architecture decisions

1. Government service owner, data controller and legal operating mandate.
2. Whether and how any application step can be remote given current in-person appointment instruction.
3. Approved identity/citizenship sources, IVP assurance policy, biometrics/PAD and retention.
4. MySQL hosting, exact version, Wappler/driver compatibility, service boundaries, backup and key management.
5. Private document storage service, region, scanning and retention.
6. Staff/citizen Security Provider configuration, recovery, MFA/step-up and permission/office matrices.
7. Payment, TTPost, mission/courier contracts and exact interfaces.
8. Legal issuance delegation, audit evidence, approval/reconsideration rules and records retention.

## 12. Next package boundary

Stage 2A is the next proposed development package. Do not begin its implementation automatically. The owner must review this foundation and approve a concrete Stage 2A baseline; database migration, authentication and IVP implementation each remain separately gated by their own approvals.

## Documentation rollback

These Stage 1 changes are documentation and acceptance-record updates only. Revert their Git commit(s) with a normal `git revert` if the owner rejects the baseline. No database, Wappler runtime, application route, port configuration, dependency, or production data needs rollback for this package.
