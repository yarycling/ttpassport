# GUI-BASELINE-01 — Build and Test Record

**Status:** `UAT_PENDING`  
**Baseline:** `CODEX_GUI_BUILD_PROMPT.md`, 22 November 2026  
**Scope:** GUI presentation only. No passport processing, identity verification, payment, approval, issuance, fulfilment or production deployment.

**Latest package update:** `GUI-BASELINE-01B` — Government branding, GitHub configuration and Wappler port. Human GUI acceptance remains `UAT_PENDING`.

## G0 — Scaffold audit

- Project root: the existing TTPASSPORT Wappler workspace (local machine paths are omitted from public documentation).
- Git at the initial G0 inspection: no `.git` directory; branch, commit and normal Git diff were unavailable. See `GUI-BASELINE-01B` below for the initial GitHub setup.
- Wappler project: `.wappler/project.json` identifies project `ttpassport`, Bootstrap 5, local App Connect, Node project server model, web root `/public`, and a local Development target at `http://localhost:3000/`. The target database is SQLite at `/db/db_dev.sqlite3`; these GUI pages do not query it.
- Runtime: Node `v23.6.0`; `package.json` requires Node `>=22`. Wappler App Connect runtime reports `2.2.5`. At the initial G0 inspection, Wappler desktop `7.9.9` had another project open; the later GUI-BASELINE-01B check opened TTPASSPORT in its Design view.
- Installed UI assets: local Bootstrap 5 CSS/JS and `public/dmxAppConnect/dmxAppConnect.js` plus routing runtime. No Bootstrap or Wappler runtime file was changed. The local Bootstrap file did not expose a readable version marker in its header.
- Existing UI conventions: EJS page views under `views/`, layouts under `views/layouts/`, route declarations in `app/config/routes.json`. The only original route was `/` using `views/index.ejs` and `views/layouts/main.ejs`.
- Existing security/backend boundary: no Security Provider, staff restriction, Server Connect action or application API was configured in this scaffold. The configured database connection is not used by these pages.
- References: visually reviewed all five files in `references/`. The passport-only design hierarchy was retained; unrelated visa/permit navigation and illustrative official crests were excluded. At the initial GUI-BASELINE-01 build, a neutral `TT` placeholder was used; GUI-BASELINE-01B replaced the shared masthead/footer placeholder with the owner-supplied Coat of Arms.
- Assets: the manifest’s `public/assets/ttpassport/**` assets were already present. They were not recopied or modified. The selected text-free `hero-citizen-passport.webp` is used as a CSS background behind editable HTML.

## Screens and routes

| Screen | Route | Wappler-editable view/layout |
|---|---|---|
| GUI-01 Shared government shell | Shared across routes | `views/layouts/main.ejs`, `views/layouts/backoffice.ejs`, `views/partials/` |
| GUI-02 Public citizen home | `/` | `views/index.ejs` |
| GUI-03 Sign-in | `/account/sign-in` | `views/account-sign-in.ejs` |
| GUI-03 Registration | `/account/register` | `views/account-register.ejs` |
| GUI-03 Email verification | `/account/verify-email` | `views/account-verify-email.ejs` |
| GUI-03 Forgot password | `/account/forgot-password` | `views/account-forgot-password.ejs` |
| GUI-03 Reset password | `/account/reset-password` | `views/account-reset-password.ejs` |
| GUI-04 Citizen dashboard shell | `/citizen/dashboard` | `views/citizen-dashboard.ejs` |
| GUI-05 First-time application wizard shell | `/citizen/apply/first-time` | `views/citizen-application-first-time.ejs` |
| GUI-06 Tracking shell | `/citizen/track` | `views/citizen-tracking.ejs` |
| GUI-07 Back-office shell | `/design-preview/backoffice/*` | `views/layouts/backoffice.ejs`, `views/partials/backoffice-sidebar.ejs` |
| GUI-08 Supervisor overview | `/design-preview/backoffice/overview` | `views/backoffice-overview.ejs` |
| GUI-08 Queue and workload | `/design-preview/backoffice/applications` | `views/backoffice-applications.ejs` |
| GUI-09 Staff review shell | `/design-preview/backoffice/review` | `views/backoffice-review.ejs` |
| GUI-10 Administration shell | `/design-preview/backoffice/administration` | `views/backoffice-administration.ejs` |
| GUI-11 Capture guidance | `/verification/preview` | `views/verification-capture.ejs` |
| GUI-11 Review status | `/verification/preview/review` | `views/verification-review.ejs` |

Account inputs, uploads, selectors, filters and administrative controls are disabled. The wizard uses native App Connect `dmx-value`, `dmx-show`, `dmx-text` and `dmx-on:click` behavior to move through nine visual stages. The staff review sections use the same native App Connect state pattern. No fake success state or backend call is present.

## Shared components and assets

- Reusable partials: `government-masthead`, `public-navigation`, `government-footer`, `backoffice-sidebar`.
- Back-office context chrome includes a disabled office-scope selector placeholder; it does not choose or enforce an office.
- Theme source: `public/assets/ttpassport/css/ttpassport-theme.css`. It defines the design tokens, responsive layouts, forms, service cards, notices, status chips, empty states, wizard, review workspace, and focus states.
- Referenced Wappler/Bootstrap structures: responsive Bootstrap 5 grid and navbar; App Connect app/layout shell; shared EJS partials supported by the existing layout include pattern.
- Backgrounds loaded by the UI: `/assets/ttpassport/banners/header-government-crimson.webp`, `/assets/ttpassport/banners/hero-citizen-passport.webp`, `/assets/ttpassport/backgrounds/bg-login-authentication.webp`, `bg-citizen-dashboard.webp`, `bg-application-form.webp`, `bg-backoffice-dashboard.webp`, `bg-international-service.webp`, and `bg-security-guilloche.webp`.
- The selected hero is text-free and editable content sits above it. At narrow widths, the hero switches to a crimson gradient for readability.

## Files changed

- `app/config/routes.json`
- `public/assets/ttpassport/css/ttpassport-theme.css`
- `views/layouts/main.ejs`
- `views/layouts/backoffice.ejs`
- `views/partials/government-masthead.ejs`
- `views/partials/public-navigation.ejs`
- `views/partials/government-footer.ejs`
- `views/partials/backoffice-sidebar.ejs`
- `views/index.ejs`
- `views/account-sign-in.ejs`
- `views/account-register.ejs`
- `views/account-verify-email.ejs`
- `views/account-forgot-password.ejs`
- `views/account-reset-password.ejs`
- `views/citizen-dashboard.ejs`
- `views/citizen-application-first-time.ejs`
- `views/citizen-tracking.ejs`
- `views/backoffice-overview.ejs`
- `views/backoffice-applications.ejs`
- `views/backoffice-review.ejs`
- `views/backoffice-administration.ejs`
- `views/verification-capture.ejs`
- `views/verification-review.ejs`
- `docs/GUI_BASELINE_01.md`
- `docs/GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md`

No asset, package manifest, database, Wappler runtime or Bootstrap distribution file was modified. `npm install --no-save --package-lock=false` populated local `node_modules` for validation; it did not create a lockfile or change `package.json`.

## Command and configuration tests

| Test ID | Acceptance | Command / environment | Expected | Actual | Result |
|---|---|---|---|---|---|
| CT-GUI-BASELINE-01-001 | GUI-AC-004, 014 | Parse `.wappler/project.json` and `app/config/routes.json`; check every route’s view and layout file | Valid JSON and no missing files | 15 routes; all referenced pages/layouts exist | PASS |
| CT-GUI-BASELINE-01-002 | GUI-AC-004 | `npm install --no-save --package-lock=false` | Install existing declared dependencies without project manifest changes | 328 packages installed; `package.json` unchanged and no lockfile created | PASS (install); npm reported 6 moderate dependency advisories |
| CT-GUI-BASELINE-01-003 | GUI-AC-004 | `npm start` on configured `localhost:3000` | Node server starts on the configured Development URL | `EADDRINUSE`; port 3000 was owned by a Wappler Helper process. The Wappler UI also showed a conflict on 3001. A GET to port 3000 returned an empty reply. | BLOCKED at configured port |
| CT-GUI-BASELINE-01-004 | GUI-AC-004, 005 | `PORT=55362 npm start` (OS-selected available test port) | Same Wappler Node app starts without changing target configuration | `App listening at http://localhost:55362` | PASS (temporary local test URL) |
| CT-GUI-BASELINE-01-005 | GUI-AC-005 | Node `fetch` against all configured routes at `http://127.0.0.1:55362` | Each screen returns HTTP 200 | All 15 route paths returned HTTP 200 and rendered EJS layouts | PASS |
| CT-GUI-BASELINE-01-006 | GUI-AC-002, 012 | Node `fetch` against selected hero, masthead, mapped backgrounds, theme CSS, Bootstrap and App Connect resources at port 55362 | Resources return successfully with expected MIME types | All 15 requested resources returned HTTP 200; images returned `image/webp`, CSS returned `text/css`, JS returned `text/javascript` | PASS |
| CT-GUI-BASELINE-01-007 | GUI-AC-004, 013 | `rg` scan for static event attributes and exact dead `href="#"` links in `views/` | No static handlers or dead placeholder links | No matches. Skip link and help links point to real in-page anchors. | PASS |
| CT-GUI-BASELINE-01-008 | GUI-AC-006, 009 | Browser interaction on wizard and review screens at port 55362 | Native App Connect controls change the visible UI, with no false verification state | Wizard moved from stage 1 to stage 2 and displayed the personal-details shell. Review tab switched to citizenship and displayed “evidence not available.” | PASS |
| CT-GUI-BASELINE-01-009 | GUI-AC-010, 011 | Browser viewport and DOM checks for all 15 routes at 1440, 1024, 768 and 375 px | No page-level overflow, duplicate IDs or unlabeled controls | 60 route/viewport checks; zero horizontal overflow. At 375 px, zero duplicate IDs and zero unlabeled form controls. Back-office scope control is labeled and active nav updates. Keyboard Tab focuses the skip link with a visible 3px outline; mobile nav opens and reports `aria-expanded=true`. | PASS |
| CT-GUI-BASELINE-01-010 | GUI-AC-010, 011 | Browser console errors/warnings at port 55362 | No page errors during preview checks | No warnings or errors reported | PASS |
| CT-GUI-BASELINE-01-011 | GUI-AC-008 | Inspect staff routes and configured Wappler security | Staff interface is protected or isolated to Development | Routes are explicitly under `/design-preview/backoffice/`; they render only empty/static UI, with no live data or actions. No Security Provider or route restriction exists, and the route file is not target-gated. | BLOCKED before any production/public target |
| CT-GUI-BASELINE-01-012 | GUI-AC-004 | Wappler visual editor check | Target project opens and remains GUI-maintainable in Wappler | The installed Wappler 7.9.9 UI was open to `secretangel`, not TTPASSPORT. Browser checks confirmed the target Node renderer and App Connect runtime, but the target project was not opened in the visual designer. | BLOCKED/PENDING |

The project currently has no `test` script in `package.json`; no database or Server Connect business tests apply to this GUI-only slice. No actual GUI acceptance is claimed by these browser checks.

## Acceptance status

| Acceptance ID | Result | Notes |
|---|---|---|
| GUI-AC-001 | PASS | Shared crimson, gold, ivory and charcoal tokens. |
| GUI-AC-002 | PASS | Selected hero asset visibly renders behind live HTML. |
| GUI-AC-003 | PASS | Shared masthead, navigation, footer and office sidebar partials. |
| GUI-AC-004 | PASS / Wappler editor pending | Existing EJS/layout/routes conventions and App Connect runtime retained; Wappler GUI session was on a different project. |
| GUI-AC-005 | PASS | Implemented pages link to real preview routes; renewal is plainly planned/unavailable. |
| GUI-AC-006 | PASS | Nine-stage wizard, labels, guidance, disabled save, and functional App Connect step switching. |
| GUI-AC-007 | PASS | Back-office nav contains passport functions only. |
| GUI-AC-008 | BLOCKED for future deployment | Static previews contain no real records/actions, but there is no route-level Development-only gate or staff security provider. Exclude or gate these routes before any production/public target. |
| GUI-AC-009 | PASS | eKYC visuals show “Not assessed/Not connected”; no camera, evidence upload or verification claim works. |
| GUI-AC-010 | PASS | All 15 screens tested at 1440, 1024, 768 and 375 px without page overflow. |
| GUI-AC-011 | PASS / owner visual review pending | Labels, focus ring, skip link and mobile navigation were checked; contrast, zoom and usability still need owner review. |
| GUI-AC-012 | PASS | Selected assets return successfully; no generated runtime or Bootstrap files changed. |
| GUI-AC-013 | PASS | No API, authentication, schema, payment, identity, approval, issuance or courier workflow added. |
| GUI-AC-014 | PASS | This report and the owner checklist are in `docs/`. |

## Security, limits and review

- Citizen authentication screens, dashboard, application, tracking, staff, administration and verification pages are presentational only. All relevant form controls are disabled; no submissions or records are created.
- Back-office preview routes are not access-controlled because the scaffold has no staff Security Provider. They return static empty layouts only. Keep them off any production/public target until an approved Development-only gate or later staff security package is in place.
- At the initial GUI-BASELINE-01 build, no official coat of arms had been supplied. GUI-BASELINE-01B uses the owner-supplied 2025 Coat of Arms; official forms, privacy wording, service rules, live account source, photo capture, eKYC, payment and external integrations remain unimplemented.
- Wappler GUI acceptance, business suitability and final visual fidelity remain for the owner. Color contrast has not been formally measured.
- `npm install` reported 6 moderate dependency advisories. No dependency changes were made as part of this package.
- Historical G0 note (superseded by GUI-BASELINE-01B): Wappler initially used a target URL on port `3000`, which was occupied, and the temporary test preview used port `55362`. The current Development target and Node runtime use `http://localhost:3002/`; the latest evidence is recorded below.

## Rollback

For GUI-BASELINE-01, the original three-file snapshot was kept in the local temporary workspace (`views/layouts/main.ejs`, `views/index.ejs`, and `app/config/routes.json`). For GUI-BASELINE-01B, revert the package commit recorded in the Git history to restore the previous branding and port configuration. No database schema or backend workflow was added.

## Next step

Owner GUI review only. Use `docs/GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md`; report visual GUI acceptance as `PASS` or `FAIL`. Do not start backend modules automatically.

## GUI-BASELINE-01B — Government branding, GitHub configuration and Wappler port

**Package status:** `UAT_PENDING`  
**Scope:** preserve the existing 15-screen GUI, add owner-supplied government branding, configure the existing Wappler Development target for port `3002`, publish the project baseline to the owner-specified public repository, and update the owner review instructions. No backend passport workflow was added.

### Changes

- Added the owner-supplied 2025 Coat of Arms WebP at `public/assets/branding/coat-of-arms-trinidad-and-tobago-2025.webp`. The file remains WebP, keeps its transparent background and original `1280 × 1248` dimensions, and is byte-for-byte identical to the supplied asset.
- Updated the shared government masthead and footer partials. The masthead uses descriptive alternative text; the footer copy is decorative. Both citizen and back-office layouts use the same shared partials, so branding reaches all 15 routes without duplicated headers.
- Kept proportional, contain-fit sizing and an ivory backing in `public/assets/ttpassport/css/ttpassport-theme.css` so the emblem remains legible against the crimson masthead.
- The active Development target in `.wappler/project.json` points to `http://localhost:3002/`; `app/config/config.json` sets the Wappler Node runtime port to `3002`.
- Added `.gitignore` rules for dependencies, environment secrets, keys/certificates, local databases, private uploads/storage, logs, temporary files, Wappler caches and OS detritus.
- Opened this project in Wappler `7.9.9` Design view. The home page rendered and the App Connect inspector was available. Existing layouts, routes, Bootstrap 5 and App Connect behavior were preserved.
- No new screens or routes were created; the existing 15-screen baseline remains in place.

### GUI-BASELINE-01B files touched

- `.gitignore`
- `.wappler/project.json`
- `app/config/config.json`
- `public/assets/branding/coat-of-arms-trinidad-and-tobago-2025.webp`
- `public/assets/ttpassport/css/ttpassport-theme.css`
- `views/partials/government-masthead.ejs`
- `views/partials/government-footer.ejs`
- `docs/GUI_BASELINE_01.md`
- `docs/GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md`
- `docs/evidence/GUI-BASELINE-01B/`

### Public repository audit

- The repository was initialized on `main` with `origin` set to `https://github.com/yarycling/ttpassport.git`. GitHub reported the repository as public and the pre-push `git ls-remote --heads origin` check returned no branches.
- Staged files were reviewed before publication. `.env` files, credentials, private keys/certificates, database files, uploads, storage, temporary files, `node_modules` and `.DS_Store` are excluded. The staged Wappler Development database connection files contain only the SQLite client and local database path; the database itself is ignored.
- The owner-specified initial baseline was committed as `5ccaf77` and pushed to `main` without force-pushing or replacing remote history. GitHub `origin/main` was verified at the same commit after push.

### GUI-BASELINE-01B command and configuration tests

| Test ID | Acceptance ID | Environment / command | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
| `CT-GUI-BASELINE-01B-001` | `AC-GUI-BASELINE-01B-002` | Local macOS, Node `v23.6.0`; stop and restart with `npm start`, then read Wappler config and fetch `/` | Development target and runtime remain on port 3002; homepage returns 200 | Active target `Development`, target URL `http://localhost:3002/`, runtime port `3002`, homepage HTTP 200 after restart | PASS | [`startup-config-check.txt`](evidence/GUI-BASELINE-01B/startup-config-check.txt) |
| `CT-GUI-BASELINE-01B-002` | `AC-GUI-BASELINE-01B-003` | Node fetch smoke harness against `http://localhost:3002/` using `app/config/routes.json` | All 15 GUI routes and their local CSS, JS and image resources return 200 | 15/15 routes and 27/27 unique resources returned HTTP 200; coat-of-arms markup present on all 15 routes | PASS | [`route-resource-check.txt`](evidence/GUI-BASELINE-01B/route-resource-check.txt) |
| `CT-GUI-BASELINE-01B-003` | `AC-GUI-BASELINE-01B-001` | `sips`, `md5`, `cmp`, route markup/resource check | Use the supplied WebP without distortion, conversion or missing requests | Image is `1280 × 1248`, source and copy MD5 match, `cmp` reports identical bytes, resource MIME is `image/webp` | PASS | [`asset-integrity-check.txt`](evidence/GUI-BASELINE-01B/asset-integrity-check.txt) and [`route-resource-check.txt`](evidence/GUI-BASELINE-01B/route-resource-check.txt) |
| `CT-GUI-BASELINE-01B-004` | `AC-GUI-BASELINE-01B-004` | Browser check of all 15 routes at 1440, 1024, 768 and 375 px | No horizontal overflow, broken images or missing emblems | 60 route/viewport checks; zero horizontal overflow, broken images or missing emblems | PASS | [`browser-check-record.txt`](evidence/GUI-BASELINE-01B/browser-check-record.txt) |
| `CT-GUI-BASELINE-01B-005` | `AC-GUI-BASELINE-01B-004` | Browser interaction check at port 3002 | Existing App Connect wizard, review tabs and responsive navigation continue to work | Wizard advanced from stage 1 to 2; Citizenship tab showed its empty state; navigation expanded and collapsed with matching accessibility state | PASS | [`browser-check-record.txt`](evidence/GUI-BASELINE-01B/browser-check-record.txt) |
| `CT-GUI-BASELINE-01B-006` | `AC-GUI-BASELINE-01B-005` | Wappler `7.9.9`, open TTPASSPORT `index.ejs` in Design view | Page remains editable through the installed Wappler designer | Home page rendered in Design view and the App Connect inspector showed page/layout properties | PASS | [`browser-check-record.txt`](evidence/GUI-BASELINE-01B/browser-check-record.txt) |
| `CT-GUI-BASELINE-01B-007` | `AC-GUI-BASELINE-01B-006` | `git status`, staged path/diff review, `.gitignore` checks, GitHub repository view and `git ls-remote --heads origin` | Publish only intended source/config/assets/docs, with no secrets or private application data | Public repository was empty before first push; ignored local data was absent from staged paths; commit `5ccaf77` was pushed without force; `origin/main` matches | PASS | [`git-audit-check.txt`](evidence/GUI-BASELINE-01B/git-audit-check.txt) |
| `CT-GUI-BASELINE-01B-008` | `AC-GUI-BASELINE-01B-006` | `git diff --cached --check` over the full initial commit; repeat scoped to 01B config/theme/partials | No unintended trailing whitespace in the published change | Whole-tree check reports intentional Markdown hard-break spaces and trailing whitespace in existing Wappler source; the scoped 01B config/theme/partial check is clean | FAIL (non-blocking formatting audit) | [`git-audit-check.txt`](evidence/GUI-BASELINE-01B/git-audit-check.txt) |

### Acceptance status

| Acceptance ID | Result | Notes |
|---|---|---|
| `AC-GUI-BASELINE-01B-001` | PASS | Owner-provided Coat of Arms copied byte-for-byte, displayed through shared masthead/footer partials and loaded on all 15 routes. |
| `AC-GUI-BASELINE-01B-002` | PASS | Wappler Development target and runtime configuration use port `3002`; fresh `npm start` restart served the citizen homepage. |
| `AC-GUI-BASELINE-01B-003` | PASS | All 15 routes and 27 local resources return HTTP 200 on port `3002`. |
| `AC-GUI-BASELINE-01B-004` | PASS | Responsive, no-overflow and App Connect interaction checks passed; browser console showed no new errors during checked flows. |
| `AC-GUI-BASELINE-01B-005` | PASS | TTPASSPORT home rendered in Wappler `7.9.9` Design view with App Connect inspector available. |
| `AC-GUI-BASELINE-01B-006` | PASS | Public GitHub baseline was audited, committed on `main` and pushed to the requested origin. |
| `AC-GUI-BASELINE-01B-007` | PENDING | Human GUI review and explicit owner acceptance remain outstanding. |

### Outstanding issues and owner review

- GUI acceptance remains `UAT_PENDING`; owner review is required using [`GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md`](GUI_REVIEW_CHECKLIST_GUI_BASELINE_01.md).
- Existing GUI-AC-008 remains a deployment blocker: the static back-office preview routes have no staff authentication or Development-only route gate. Keep this local preview on `localhost`; do not deploy or expose it publicly.
- The whole-tree whitespace audit remains non-blocking; it flags existing Wappler source whitespace and Markdown hard-break formatting. The 01B runtime config, theme and shared partial changes pass the scoped check.
- No passport processing, eKYC, payment, approval, issuance, fulfilment or production deployment work was performed.
