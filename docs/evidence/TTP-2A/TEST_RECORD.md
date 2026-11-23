# Stage 2A — Command and Automated Browser Test Record

**Package:** 2A — Project Repository and Code Structure<br>
**Baseline:** `TTP-2A-BASELINE-DRAFT-01`, owner-approved 22 November 2026<br>
**Execution date:** 22 November 2026<br>
**Environment:** macOS; Wappler 7.9.9; Node.js v23.6.0; npm 10.9.2; Wappler Development target `http://localhost:3002/`; Firefox Responsive Design Mode and installed Wappler Design view<br>
**Repository:** `main`; source revision at start `3389381`; package implementation/evidence commit `ef417fd`; register update commit `bffc5d2`<br>
**Test status:** 7 PASS, 1 FAIL, 1 N/A; Stage 2A remains `TESTING`; GUI/business acceptance is pending.

## Scope and safety

Only repository orientation, documentation, acceptance records, and the tests in the approved baseline were in scope. No application views, layouts, routes, assets, Server Connect actions, dependencies, database/connection files, Wappler runtime, or generated framework files were changed. No database was created and no authentication, passport, eKYC, payment, approval, issuance or fulfilment behavior was implemented. The Development server was already running as `node ./index.js` on port 3002; it was not restarted to avoid starting a second listener. No real identity or financial data was entered.

The installed Wappler Project Settings UI displayed project type `web`, NodeJS server model and routing handler. The Targets settings displayed the `Development` target, Usage `Development`, URL `http://localhost:3002/`, SQLite, and `/db/db_dev.sqlite3`. The Settings UI did not expose or define the `.wappler/project.json` field `runtime: "capacitor"`. Its meaning remains unconfirmed, but does not affect this package because no target or packaging setting depends on it; the field was left unchanged.

## Acceptance criteria

| Acceptance ID | Result | Evidence / finding |
|---|---|---|
| AC-2A-001 | PASS | Root `README.md` and approved repository baseline document the inspected project, Wappler Development run method, port, map, protected paths, test evidence and preview/security limitations. CT-2A-001. |
| AC-2A-002 | PASS | Existing EJS paths, layouts and partials remain in place. Logical module boundaries are documented without creating application modules or endpoints. CT-2A-001, CT-2A-002. |
| AC-2A-003 | PASS | All 15 configured paths map to existing pages/layouts, return HTTP 200, and render at each tested viewport. Port 3002 and both SQLite path records are unchanged. CT-2A-002–005. |
| AC-2A-004 | PASS | IVP, account, passport, case, payment, issuance/release, fulfilment, audit and reporting boundaries remain explicit in the approved baseline. Static preview/source review found no new cross-boundary implementation. CT-2A-008. |
| AC-2A-005 | PASS | Targeted secret/private-file review found no credential, key, database, upload or identity evidence in package changes. Screenshot evidence contains static empty-state previews and no real identity data. CT-2A-007. |
| AC-2A-006 | PASS | No route, application endpoint, Server Connect action, database, authentication, service, dependency, public deployment or Wappler runtime/configuration change was introduced. CT-2A-003, CT-2A-007–009. |
| AC-2A-007 | PASS (limited) | Wappler 7.9.9 opened the project in Design view and rendered `index.ejs`; Project Settings confirmed the active target. The retained route/view/layout configuration was independently parsed and smoke-tested. No reorganization was attempted. `runtime: "capacitor"` meaning is unconfirmed and has no effect on this scope. CT-2A-002–004. |
| AC-2A-008 | PASS (evidence recorded; blocker remains) | All nine planned test cases are recorded here, with browser screenshots under `screenshots/`. CT-2A-005 fails on an existing implicit `/favicon.ico` 404; therefore package readiness is blocked despite results being recorded. |

## Planned test results

| Test ID | Acceptance ID | Environment | Command / method | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|---|
| CT-2A-001 | AC-2A-001, 002 | Local repository | Python `pathlib`/JSON checks of README references, directories, Wappler metadata, package script and approved structure map | Local links resolve; documentation matches actual scaffold | README local links resolve; documented directories and values match configuration and inspected project. No new launcher or dependency is described. | PASS | `README.md`; approved Stage 2A baseline; `command-output.txt` |
| CT-2A-002 | AC-2A-002, 003 | Local repository | Node JSON parse of `app/config/routes.json`; assert 15 unique paths and existing page/layout targets | Exact configured route inventory remains resolvable | 15 unique page routes; all 15 page files and both referenced layouts exist; existing view paths are unchanged. | PASS | `app/config/routes.json`; `command-output.txt` |
| CT-2A-003 | AC-2A-003, 006 | Local repo and Wappler Project Settings | Parse `.wappler/project.json`, `app/config/config.json`, `app/modules/connections/db.json`; compare protected config paths with `HEAD` and confirm via Wappler UI | Port 3002, Development target and SQLite path unchanged | Target URL `http://localhost:3002/`; app port `3002`; SQLite `/db/db_dev.sqlite3`; project type web; `runtime: "capacitor"` unchanged. No Wappler configuration diff. Wappler UI does not expose the runtime field/meaning; it has no package effect. | PASS | Wappler Project Settings observation; `.wappler/project.json`; `app/config/config.json`; connection file; `command-output.txt` |
| CT-2A-004 | AC-2A-003, 008 | Actual Wappler Development target on port 3002 | `node` fetch loop against all configured paths; inspect listener with `lsof` and process with `ps` | Actual target serves all 15 screens successfully | All 15 routes returned HTTP 200, with page, layout and title present. The existing `node ./index.js` process is listening on TCP 3002. Local process identifier and OS account were omitted from public evidence. The existing server was left running. | PASS | `command-output.txt`; `browser-test-summary.md` |
| CT-2A-005 | AC-2A-003, 007, 008 | Firefox, local Wappler Development target | Native browser automation via Firefox Responsive Design Mode; 15 routes × 1440, 1024, 768, 375 CSS px; inspect `innerWidth`, `documentElement.scrollWidth`, image load/alt attributes, accessible names; keyboard Tab check; inspect Web Console network/error output | Every screen loads with no overflow, broken assets, console errors, or basic accessible-name defects; keyboard reaches skip link; screenshots saved | 60/60 route/viewport combinations rendered at the requested CSS width; all had `scrollWidth == innerWidth`, 0 broken `<img>`, 0 missing image `alt`, and 0 unnamed buttons/inputs/selects/textareas. Tab focused the “Skip to main content” link (`/#content`). No JavaScript runtime errors were observed. Firefox reported an implicit `GET /favicon.ico` HTTP 404 on pages; this violates the no-broken-resource expectation. Existing favicon omission predates 2A; adding a favicon or changing view/layout/config assets is outside the approved documentation/structure scope, so no visual/runtime change was made. | **FAIL** — pre-existing favicon 404 | `browser-test-summary.md`; `screenshots/*-1440.png`; `screenshots/*-375.png`; browser console observation |
| CT-2A-006 | AC-2A-003, 008 | Local package diff and browser screenshots | Compare changed paths with all GUI/source paths; capture route screenshots | Visual regression is performed if user-facing sources change; otherwise N/A is justified | No view, layout, CSS, image, font, icon or route file changed. Screenshots were captured for all 15 routes at 1440 and 375 px as review artifacts. Pixel comparison against the historical GUI baseline is N/A because this package made no visual changes; previous baseline evidence did not retain source screenshots. | N/A — no UI files changed | `git diff --name-only`; `screenshots/` |
| CT-2A-007 | AC-2A-005, 006 | Local repository | `git status`, ignore-rule review, targeted secret/private-data scan and protected-path diff inspection | No credentials, identity data, local DB/storage or protected runtime changes | Package additions are README, documentation/acceptance records and static browser screenshots. No secret/key patterns, real identity evidence, local database, upload/storage files, or protected Wappler/Bootstrap runtime diff was found. | PASS | `command-output.txt`; `git diff --check`; final commit review |
| CT-2A-008 | AC-2A-004, 006 | Local source and route configuration | Static review of route types, `app/api/`, back-office view text and preview state | Back-office routes remain static design previews with no live records/actions; no new authorization claim/endpoint | Four `/design-preview/backoffice/...` routes remain page previews, and their views state that staff access/data/actions are not configured. `app/api/` remains empty; no Server Connect business action, security provider or new route exists. | PASS | `app/config/routes.json`; `app/api/`; back-office screenshots; `command-output.txt` |
| CT-2A-009 | AC-2A-006, 008 | Local repository and Development app | Review package/dependency/runtime diffs; rerun all 15 route smoke and 60 browser route/viewport checks | No unapproved dependency/runtime change and no regression to existing accepted screens | `package.json`, installed dependency metadata, Wappler runtime/config and GUI sources are unchanged; routes continue to render. No repository test script exists, so no `npm test` suite was claimed. Browser resource issue is separately captured under CT-2A-005. | PASS | `git diff --name-only`; `command-output.txt`; `browser-test-summary.md` |

## Screenshots and responsive browser findings

The browser matrix used Firefox Responsive Design Mode with a verified CSS viewport of exactly 1440, 1024, 768 and 375 px. For each screen and viewport, the observed application `innerWidth` matched the selected viewport; page `scrollWidth` matched `innerWidth`. All 60 rows rendered their route heading, all page `<img>` elements loaded and had an `alt` attribute, and the accessible-name scan found no unnamed buttons or form controls.

| Route | 1440 | 1024 | 768 | 375 | Screenshot evidence |
|---|---|---|---|---|---|
| `/` | PASS | PASS | PASS | PASS | `home-1440.png`, `home-375.png` |
| `/account/sign-in` | PASS | PASS | PASS | PASS | `sign-in-1440.png`, `sign-in-375.png` |
| `/account/register` | PASS | PASS | PASS | PASS | `register-1440.png`, `register-375.png` |
| `/account/verify-email` | PASS | PASS | PASS | PASS | `verify-email-1440.png`, `verify-email-375.png` |
| `/account/forgot-password` | PASS | PASS | PASS | PASS | `forgot-password-1440.png`, `forgot-password-375.png` |
| `/account/reset-password` | PASS | PASS | PASS | PASS | `reset-password-1440.png`, `reset-password-375.png` |
| `/citizen/dashboard` | PASS | PASS | PASS | PASS | `dashboard-1440.png`, `dashboard-375.png` |
| `/citizen/apply/first-time` | PASS | PASS | PASS | PASS | `first-time-1440.png`, `first-time-375.png` |
| `/citizen/track` | PASS | PASS | PASS | PASS | `tracking-1440.png`, `tracking-375.png` |
| `/design-preview/backoffice/overview` | PASS | PASS | PASS | PASS | `backoffice-overview-1440.png`, `backoffice-overview-375.png` |
| `/design-preview/backoffice/applications` | PASS | PASS | PASS | PASS | `backoffice-applications-1440.png`, `backoffice-applications-375.png` |
| `/design-preview/backoffice/review` | PASS | PASS | PASS | PASS | `backoffice-review-1440.png`, `backoffice-review-375.png` |
| `/design-preview/backoffice/administration` | PASS | PASS | PASS | PASS | `backoffice-administration-1440.png`, `backoffice-administration-375.png` |
| `/verification/preview` | PASS | PASS | PASS | PASS | `verification-capture-1440.png`, `verification-capture-375.png` |
| `/verification/preview/review` | PASS | PASS | PASS | PASS | `verification-review-1440.png`, `verification-review-375.png` |

All 30 screenshots are in `docs/evidence/TTP-2A/screenshots/`. The four back-office screens are visual design previews only. These checks do not constitute a WCAG conformance audit or human GUI/business acceptance. Human acceptance remains `PENDING`.

## Known blocker and disposition

The browser automatically requests `/favicon.ico`; no such file exists and the local app returns HTTP 404. The request is not an application route defined in `app/config/routes.json`, and the defect is visible in Firefox's request console. The approved 2A implementation scope does not include favicon artwork or GUI/static asset changes. No asset or route was added to avoid silently expanding that approved scope or changing the accepted GUI. Resolve this through a separately approved narrow change or owner-confirmed scope update, then rerun CT-2A-005. No other in-scope defect was found.

## Validation iteration note

The first CT-2A-003 check used an incorrect harness assumption that the application port was nested under `webserver.port`; it returned `None` and failed that assertion. Inspection of the actual `app/config/config.json` showed the configured shape is `{ "port": 3002 }`. The corrected test reads that actual field, verified both SQLite configuration records and unchanged protected files, and passed. The repository was not changed to accommodate the test harness.

## Rollback and acceptance state

This package has no database or data rollback. The code/doc delta is reviewable and may be reversed with `git revert <package-commit>`; do not force-push or rewrite history. Stage 1A–1H remain `CLOSED_PASS` for owner-accepted documentation, requirements, architecture and governance-register deliverables dated 22 November 2026. LP-013 and other legal/government, biometric, integration and security dependencies remain open. Stage 2A remains `TESTING`, not `CLOSED_PASS`; final owner GUI/business acceptance is pending. Stage 2B is not started or authorized.

A supplementary register check initially used a narrow package-letter regular expression that omitted valid roadmap suffixes I–L, and a literal check required the exact phrase “LP-013 remains open.” The corrected checker accepts the roadmap's full letter range and verifies the actual status meaning (“LP-013 is not closed” / dependencies remain open). It then confirmed 150 identical IDs/titles and all eight Stage 1 `CLOSED_PASS` records in both registers. These were checker assumptions, not repository discrepancies.

## Supplemental disposition — favicon remediation

The tables and CT-2A-005 failure above are preserved as the original Stage 2A test run. The authorized correction `TTP-2A-FIX-01` and dated retest are recorded separately in [`favicon-remediation/RETEST_2026-11-22.md`](favicon-remediation/RETEST_2026-11-22.md). The retest passed CT-2A-005 across all 15 routes at 1440, 1024, 768 and 375 px; CT-2A-006 visual comparison and CT-2A-009 regression checks also passed. Stage 2A is now `UAT_PENDING` for human owner acceptance and remains not `CLOSED_PASS`; Stage 2B remains unstarted.
