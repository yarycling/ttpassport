# Stage 2A — Project Repository and Code Structure

**Package:** 2A — Project Repository and Code Structure<br>
**Baseline reference:** TTP-2A-BASELINE-DRAFT-01 (owner-approved 22 November 2026)<br>
**Status:** APPROVED FOR IMPLEMENTATION; package work is in progress and test results are recorded separately<br>
**Prepared:** 22 November 2026<br>
**Source revision inspected:** `9a16cf8` on `main` (published to `origin/main`)<br>
**Stage 1:** Documentation, requirements, architecture and governance-register deliverables for 1A–1H are `CLOSED_PASS` by project-owner acceptance dated 22 November 2026; unresolved government and release dependencies remain open.

## 1. Purpose and approval boundary

Define the approved repository and code-structure baseline that fits the **actual Wappler scaffold** and preserves the owner-accepted 15-screen GUI baseline. The project owner approved reference `TTP-2A-BASELINE-DRAFT-01` on 22 November 2026. This approval authorizes only the scope and acceptance criteria in this document.

Package 2A is limited to repository orientation, Wappler-compatible file-organization conventions, documentation, and safe repository hygiene. It must not add application behavior or expand the GUI.

### Approved scope

- Document the existing repository, Wappler-managed locations, project entry points, and rules for placing future files.
- Add or update a concise root `README.md` describing the actual Wappler project, how to open/run its Development target, the port, and protected locations.
- Keep a source-controlled architecture note for the approved repository map and logical module boundaries.
- Check repository ignore rules and public-repository hygiene; make only narrowly justified documentation or `.gitignore` changes if the approved baseline authorizes them.
- Preserve all 15 existing routes, page views, layouts, shared partials, visual assets, App Connect behavior, and port 3002.

### Explicit exclusions

- No database creation, schema, migrations, seeds, connection changes, or data access.
- No citizen/staff authentication, authorization provider, Server Connect business action, API endpoint, or live data flow.
- No passport processing, eKYC execution, payments, approvals, production, issuance, release, courier, or notification behavior.
- No specialized service, worker, provider SDK, package installation, dependency update, or lockfile creation.
- No route redesign, GUI redesign, view relocation, new screen, public deployment, or production configuration.
- No edits to `lib/`, `public/dmxAppConnect/`, `public/bootstrap/5/`, generated Wappler runtime, or framework internals.

## 2. Observed project baseline

Read-only inspection of the current workspace found:

| Area | Observed state | 2A constraint |
|---|---|---|
| Wappler metadata | `.wappler/project.json`: project `ttpassport`, project type `web`, hosting type `wappler`, Node project server model, Node routing handler, web root `/public`, Bootstrap 5 and local App Connect; Wappler `7.9.9` Design-view acceptance is recorded in `docs/evidence/GUI-BASELINE-01B/`. | Preserve the Wappler project and verify file operations through the installed Wappler GUI where applicable. |
| Development target | Active target `Development`, URL `http://localhost:3002/`; `app/config/config.json` sets port `3002`. | Keep port and target unchanged. Do not introduce a parallel launcher. |
| Runtime metadata | `.wappler/project.json` contains `runtime: "capacitor"` alongside `projectType: "web"`. Its meaning for this scaffold has not been independently confirmed. | Do not alter it. If a proposed package change depends on this field, confirm its intended value in Wappler before changing it. |
| Node/npm | Local inspection: Node `v23.6.0`, npm `10.9.2`; `package.json` requires Node `>=22` and `npm start` runs `node ./index.js`. | Document observed values and Wappler Run; do not add a custom startup wrapper or test framework. |
| Database | Wappler Development target and `app/modules/connections/db.json` use SQLite at `/db/db_dev.sqlite3`; ignored local `db/` has no database file. No MySQL connection is configured. | Preserve the connection. Database Foundation is package 2C, not 2A. |
| Routes and views | `app/config/routes.json` defines 15 routes. Each maps to an existing EJS view and either `main` or `backoffice` layout, as inventoried below. | Keep all 15 route/view/layout mappings unchanged. |
| App Connect and Bootstrap | Local `public/dmxAppConnect/dmxAppConnect.js`, routing runtime and local `public/bootstrap/5/{css,js}` are present. | Treat these generated/runtime bundles as protected. Use Wappler and App Connect components for future UI behavior. |
| Server Connect/API | `app/api/` exists but is empty. No business Server Connect action, application API, or Security Provider is configured. | Do not create a hidden endpoint or imply backend behavior. Later actions must be Wappler-maintainable and package-authorized. |
| Connections and sockets | `app/modules/connections/db.json` and Wappler socket configuration files exist. No project business module or socket workflow was found. | Keep connection ownership in Wappler. Do not add socket behavior under this package. |
| Views | Fifteen EJS page views remain at the `views/` root; shared layouts are in `views/layouts/`; shared partials are in `views/partials/`. | Do not relocate or duplicate pages in 2A. Any later grouping requires a Wappler Design-view proof and route regression. |
| Static assets | `public/assets/branding/` and `public/assets/ttpassport/` contain the accepted crest, theme, backgrounds, banners, panels and accents. | Keep public assets presentation-only; private identity, passport, payment, or evidence files must never be stored under `public/`. |
| Wappler server runtime | `lib/` contains the Wappler server runtime/module structure. | Do not reorganize or patch Wappler runtime files. |
| Repository hygiene | `.gitignore` excludes environment secrets, key/certificate files, local database files, uploads, storage, logs, caches, and OS detritus. No root `README.md` exists. No tracked package lock or project test script was found. | Recheck ignore rules and add no dependencies as a convenience. |

### Approved screen and route inventory

The source of truth is the accepted GUI baseline and current `app/config/routes.json`. This table records existing routes; it does not authorize account or staff functionality.

| Screen | Route | Page view | Layout |
|---|---|---|---|
| Public citizen home | `/` | `views/index.ejs` | `main` |
| Sign in | `/account/sign-in` | `views/account-sign-in.ejs` | `main` |
| Register | `/account/register` | `views/account-register.ejs` | `main` |
| Verify email | `/account/verify-email` | `views/account-verify-email.ejs` | `main` |
| Forgot password | `/account/forgot-password` | `views/account-forgot-password.ejs` | `main` |
| Reset password | `/account/reset-password` | `views/account-reset-password.ejs` | `main` |
| Citizen dashboard | `/citizen/dashboard` | `views/citizen-dashboard.ejs` | `main` |
| First-time application preview | `/citizen/apply/first-time` | `views/citizen-application-first-time.ejs` | `main` |
| Tracking preview | `/citizen/track` | `views/citizen-tracking.ejs` | `main` |
| Back-office overview preview | `/design-preview/backoffice/overview` | `views/backoffice-overview.ejs` | `backoffice` |
| Back-office applications preview | `/design-preview/backoffice/applications` | `views/backoffice-applications.ejs` | `backoffice` |
| Back-office review preview | `/design-preview/backoffice/review` | `views/backoffice-review.ejs` | `backoffice` |
| Back-office administration preview | `/design-preview/backoffice/administration` | `views/backoffice-administration.ejs` | `backoffice` |
| Verification capture preview | `/verification/preview` | `views/verification-capture.ejs` | `main` |
| Verification review preview | `/verification/preview/review` | `views/verification-review.ejs` | `main` |

The account, application, tracking, verification, and back-office pages are presentational. Back-office preview routes have no Security Provider or route restriction and contain no live records/actions; keep them design-only and off any public production target until an approved security package implements server-side controls.

## 3. Repository and module boundaries

### Repository layout

The package should retain the actual scaffold and document these ownership boundaries. Folder creation or Wappler-managed file movement is subject to baseline approval and a Wappler GUI compatibility check.

```text
README.md                         project orientation and safe Development run notes
AGENTS.md                         binding development/security/testing contract
.wappler/                         Wappler project and target metadata; preserve
app/config/                       Wappler-managed configuration and routes
app/api/                          Wappler Server Connect actions; currently empty
app/modules/connections/          Wappler-managed database connections
app/sockets/                      existing Wappler socket configuration; no business use
views/                            current 15 EJS screens; preserve their paths in 2A
views/layouts/                    citizen and back-office shells
views/partials/                   reusable government masthead/navigation/footer/sidebar
public/assets/                    public presentation assets only
public/bootstrap/5/               Wappler-managed Bootstrap runtime; protected
public/dmxAppConnect/             Wappler App Connect runtime; protected
lib/                              Wappler server runtime; protected
docs/                             approved requirements, architecture and package records
docs/evidence/<PACKAGE-ID>/       test records and non-sensitive package evidence
```

### Logical module boundaries

These are future domain boundaries, not a directive to create or implement them in 2A. Keep ordinary application behavior in native Wappler pages, Server Connect actions, Security Providers, and Database actions. Use a folder or Server Connect library grouping only after confirming that the installed Wappler GUI can create and maintain it.

| Domain | Responsibility boundary | Separation rule |
|---|---|---|
| Shared presentation | Existing layouts and partials; shared government styling and navigation | Presentation components contain no authorization decision or sensitive workflow rule. Preserve shared masthead/footer and the current 15 routes. |
| Citizen account | Registration, authentication, recovery, account preferences | Separate account identity from applicant profile and passport application; package 2D owns the authentication foundation. |
| Passport application | First-time/renewal forms, drafts, submitted snapshots, correction history | Application-specific data and case state stay outside IVP storage. Do not implement forms/workflows in 2A. |
| Identity Verification Platform (IVP) | Tenant/client-scoped subjects, verification sessions, evidence references, checks, reviews, assertions | Extractable service boundary; no passport table dependency, passport status semantics, direct cross-database foreign keys, or global identity lookup. Any specialized worker needs the Section 3 extension gate. |
| Immigration case management | Assignment, office scope, risk class, correction, independent review and decisions | Enforce server-side permission, jurisdiction, assignment, workflow state and separation-of-duties controls in later approved packages. |
| Payments and reconciliation | Fee policy, initiation, settlement, reconciliation, refund/adjustment | Payment state and ledger remain distinct from application approval; no provider or transaction in 2A. |
| Production, issuance and release | Manual production records, QC, legal issuance, release authority and custody | Separate events and authorities; never invent passport numbers or treat issuance as release permission. |
| Fulfilment and delivery | Office/mission pickup, courier shipment, recipient authority, handover and delivery confirmation | Shipment, dispatch batch, passport issuance, recipient verification and delivery remain distinct. No undocumented provider endpoints. |
| Audit, notifications and reporting | Append-oriented event history, citizen/staff notices and reporting | Safe logs only; no identity data, secrets, or risk flags in public views. |

Use narrow purpose-specific Wappler Server Connect actions at approved boundaries. Do not introduce custom Express routes, an alternative controller framework, a new ORM, handwritten replacements for native App Connect interactions, or undocumented routes/jobs. Where native Wappler capability is insufficient for a specialist function, stop that implementation slice and use the explicit extension approval process in `AGENTS.md` §3.

## 4. Approved files and implementation increments

| Path | Purpose | Baseline constraint |
|---|---|---|
| `README.md` (new) | Project orientation, Wappler Development target/run steps, port 3002, current stack, directory map, testing/evidence locations, and explicit preview-only/security caveats | Document observed settings; no new startup script, secret, or production claim. |
| `docs/architecture/STAGE_2A_PROJECT_REPOSITORY_AND_CODE_STRUCTURE_BASELINE.md` (this file) | Approved package scope, scaffold inventory, module boundaries, acceptance criteria, tests, security and rollback | Owner-approved baseline `TTP-2A-BASELINE-DRAFT-01`, authorized 22 November 2026. |
| `.gitignore` (conditional) | Maintain exclusions for credentials, local databases, uploads, private storage, logs and machine-local Wappler files | Current rules already cover the observed cases; change only for a demonstrated gap and review the complete diff. Do not ignore required source/runtime files. |
| `docs/project/MASTER_DEVELOPMENT_REGISTER.md` and `docs/project/PROJECT_STATUS.md` | Record the approved baseline, stable AC/CT IDs, status and evidence after package authorization/implementation | Do not report 2A `DEVELOPMENT_COMPLETE` or `CLOSED_PASS` from this preparation document. |
| `docs/evidence/TTP-2A/` (implementation evidence) | Retain command output, browser results/screenshots, Wappler compatibility notes, regression results and unresolved blockers | Do not include credentials, real identities, local database contents, or private infrastructure details. |
| `app/api/<domain>/` (conditional, Wappler-managed) | Future organization of Server Connect actions by the logical domain boundaries above | `app/api/` is empty. Create no actions in 2A; only create domain folders if Wappler GUI supports the structure and an approved package requires them. |

Do not relocate the current flat `views/*.ejs` files in this package. Keep route configuration managed through Wappler. Do not change `.wappler/project.json`, target metadata, `app/config/config.json`, connection files, `package.json`, dependency versions, `lib/`, `public/dmxAppConnect/`, or `public/bootstrap/5/` under this baseline.

## 5. Acceptance criteria

These acceptance IDs are approved for this package. Results are recorded in `docs/evidence/TTP-2A/TEST_RECORD.md`.

| Acceptance ID | Acceptance criterion |
|---|---|
| AC-2A-001 | A root README and repository-structure document describe the observed Wappler project, actual Development target, safe run procedure, protected/generated directories, and evidence locations without inventing configuration. |
| AC-2A-002 | Repository organization and logical domain boundaries are documented in a Wappler-maintainable way; existing 15 view paths, shared layouts/partials and route declarations are not moved or duplicated. |
| AC-2A-003 | The exact 15 existing route/page/layout mappings remain resolvable; port 3002, the active Development target and SQLite connection remain unchanged. |
| AC-2A-004 | IVP, passport, account, case, payment, issuance/release, fulfilment, audit and reporting boundaries are explicit; IVP has no passport-table/status dependency or direct cross-database foreign key in the documented target structure. |
| AC-2A-005 | Repository hygiene is checked: secret/private-data files are excluded and absent from the package diff; public assets remain presentation-only; no sensitive evidence is committed. |
| AC-2A-006 | No unapproved route, server action, database, authentication provider, specialized service, dependency, public deployment or Wappler runtime modification is introduced. |
| AC-2A-007 | Wappler Design view can maintain the retained route/layout structure; any Wappler-specific metadata or file-placement uncertainty is recorded rather than guessed. |
| AC-2A-008 | Applicable automated command, browser, responsive, accessibility, security and regression results are recorded under `docs/evidence/TTP-2A/`; blocked tests remain blocked and owner GUI/business acceptance remains pending. |

## 6. Proposed automated test cases

Tests below are the approved package test plan. They are executed against the actual non-production Wappler Development target and recorded in `docs/evidence/TTP-2A/TEST_RECORD.md`. Use synthetic/non-sensitive data only.

| Test ID | AC mapping | Planned method | Expected result / evidence |
|---|---|---|---|
| CT-2A-001 | AC-2A-001, 002 | Markdown/link and repository-map validation; review the README against `.wappler/project.json`, route/config files, `package.json` and actual directories | All local references resolve and documented paths/settings match the scaffold; command output retained. |
| CT-2A-002 | AC-2A-002, 003 | Parse `app/config/routes.json`; verify exactly 15 unique paths and that each referenced page/layout exists | All current routes map to existing views/layouts with no route/path change; machine-readable result retained. |
| CT-2A-003 | AC-2A-003, 006 | Parse `.wappler/project.json`, `app/config/config.json` and both SQLite connection files; compare before/after | Development URL and app port remain 3002; SQLite remains `/db/db_dev.sqlite3`; no DB/connection is created or changed. |
| CT-2A-004 | AC-2A-003, 008 | Start via actual Wappler Development target / supported project start method; HTTP smoke test each configured route | App starts on port 3002; all 15 routes return their expected page response; no custom launcher is introduced. |
| CT-2A-005 | AC-2A-003, 007, 008 | Automated browser sweep across all 15 routes at 1440, 1024, 768 and 375 px; inspect console, broken assets, overflow, keyboard access and applicable accessibility checks | Expected preview content renders; no page-level overflow, broken assets or console errors; keyboard/focus behavior is recorded. Use an existing approved browser tool; unavailable required checks are `BLOCKED`. |
| CT-2A-006 | AC-2A-003, 008 | Capture route screenshots as package evidence; compare with approved GUI visual baselines if any view/layout/style/asset file changes | Any visual change is reviewed and materially different output is fixed or owner-approved. The existing GUI-BASELINE-01B record says screenshots/raw traces were not retained: visual comparison is `N/A` only if no visual files change; otherwise establish/approve reference screenshots first or mark it `BLOCKED`. |
| CT-2A-007 | AC-2A-005, 006 | Review `git status`, ignore rules and changed files; run targeted secret/private-data scan; inspect protected runtime diff | No credentials, identity records, private DB/uploads, hidden routes or edits to protected Wappler/Bootstrap runtime files. |
| CT-2A-008 | AC-2A-004, 006 | Static route/data-flow review of current preview pages and any package diff | Back-office URLs remain explicitly design-preview only with no live data/actions; no new authorization claims or public exposure. Authentication/API tests are `N/A` because 2A adds no such behavior; any discovered new endpoint blocks the package. |
| CT-2A-009 | AC-2A-006, 008 | Dependency and regression review against the accepted baseline; run relevant existing project checks without changing dependencies | No unapproved dependency/runtime changes; all regressions attributable to the package are resolved. Existing npm advisories remain tracked separately and are not auto-upgraded by 2A. |

For the planned implementation, run all applicable cases and report `PASS`, `FAIL`, `BLOCKED`, or scope-justified `N/A` under the current `AGENTS.md` testing policy. A visual comparison cannot pass without actual before/after evidence. Browser, responsive, keyboard/accessibility, and screenshots are required when the implementation changes user-facing screens or interactions.

## 7. Security, privacy and operational considerations

- This is a public GitHub repository. Review every changed file before push for keys, environment values, local paths, personal identity data, DB contents, private operational details and generated secrets. `.gitignore` is a safeguard, not proof of safety.
- Do not put passport/eKYC evidence, biometrics, private uploads, access tokens or citizen data in the repository or `public/`.
- Preserve the separation of account authentication, identity proofing, citizenship eligibility, application decision, issuance, release, custody and delivery.
- Do not introduce a shadow authentication path, client-trusted office/tenant identifiers, hidden route, custom Express controller, unapproved service or undocumented job.
- Keep the four `/design-preview/backoffice/...` pages static and non-public. They currently have no server-side authorization and are not safe for production exposure; package 2A must not imply otherwise or add real staff data.
- Preserve the existing owner-approved crimson/gold/ivory/charcoal design, coat of arms and `public/assets/ttpassport/` backgrounds. No GUI or accessibility baseline waiver is included.
- Maintain local Development port 3002 and SQLite configuration. This package must not touch MySQL, the ignored `db/` directory, or any private database.
- Do not change Wappler-managed dependencies or generated runtime bundles. The six moderate npm advisory groups and unverified MySQL 8.4 compatibility remain separate tracked matters, not justification for an unapproved change in 2A.
- Wappler 7.9.9 Project Settings were inspected through the installed application. The `Targets` panel displayed Development, Usage `Development`, Web Server URL `http://localhost:3002/`, and SQLite `/db/db_dev.sqlite3`; the General panel displayed a NodeJS server model and NodeJS routing handler. Neither visible panel displayed the `runtime` field or supplied a definition for `runtime: "capacitor"`. Its meaning is therefore unconfirmed. This package does not change targets, packaging, or runtime metadata, so the value has no effect on the approved 2A scope and remains unchanged. Revisit only if a later approved package depends on it.

## 8. Rollback

- Keep implementation changes in a single reviewable package commit after owner approval. Roll back using `git revert <package-commit>`; do not force-push or rewrite published history.
- No database or data rollback is expected because 2A creates no database, schema, migration, or business record.
- Do not move the 15 views or modify routes, target settings, port, connections, runtime files or visual assets. If an approved change nevertheless affects these files, retain the before-state in Git and verify all 15 route/browser checks after revert.
- Restore only package-owned documentation, README or approved repository-hygiene changes. Do not delete or reset unrelated owner work.

## 9. Readiness and pending decisions

- **Preparation:** complete; actual scaffold and the accepted 15-screen route inventory are recorded.
- **Stage 1:** 1A–1H `CLOSED_PASS` for the owner-approved documentation, requirements, architecture and governance-register scope. Government/legal, biometric, integration, security and production dependencies remain open; LP-013 is not closed.
- **Stage 2A baseline:** `TTP-2A-BASELINE-DRAFT-01`, approved by the owner on 22 November 2026 for implementation within this document's scope.
- **Implementation status:** `TESTING`; actual outcomes and blockers are in `docs/evidence/TTP-2A/TEST_RECORD.md`.
- **Outstanding before implementation:** none for this authorized scope. The observed `runtime: "capacitor"` metadata remains undefined in Wappler's visible settings, but does not affect this package because no target or packaging changes are included. GUI/business acceptance and Stage 2A owner closure remain pending.
- **Subsequent package boundary:** Database Foundation is 2C; Authentication and Authorisation Foundation is 2D. Neither is included here.
