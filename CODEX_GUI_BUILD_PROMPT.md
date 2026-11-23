# CODEX IMPLEMENTATION INSTRUCTION — TTPASSPORT GUI BASELINE

**Work package:** `GUI-BASELINE-01` (cross-cutting design-system deliverable supporting future roadmap packages 4, 5, 7, 11 and eKYC).
**Status:** Approved instruction for *GUI presentation work only*. This is **not** permission to build legal identity proofing, payment processing, passport issuance, courier operations or production deployment.
**Reference:** Repository root `AGENTS.md` is binding. Read it in full before editing.
**Visual inputs:** The accompanying `TTPASSPORT_GUI_Reference_Assets.zip` and its `ASSET_MANIFEST_GUI.md`.

## 0. Mission

Build the reusable **graphical user-interface foundation** for the Trinidad & Tobago Online Passport Management System using the current Wappler project and native Wappler/App Connect/Bootstrap 5 patterns. The outcome must look like a modern government service, informed by the Trinidad & Tobago national colors and heraldic palette: deep crimson, red, black, white, restrained gold, ivory, and semantic green. Match the supplied visual reference boards for layout hierarchy and atmosphere, not every AI-generated textual detail.

**This task is the shared design baseline for subsequent screens. It is NOT an 18-stage system implementation.** Create reusable shells, components, styles, responsive layouts and honest demonstration/empty states, so later modules reuse one consistent system rather than inventing new interfaces.

## 1. Mandatory inspection gate: inspect before edits

1. Open the actual repository and read root `AGENTS.md` in full. Read any narrower applicable agent instructions and existing project-specific GUI standards.
2. Report the actual repository path, Git branch/status, Wappler version/project structure, Node/runtime, target URL/port, existing UI/view conventions, Bootstrap 5 and App Connect availability, existing styles, authentication boundaries and actual routes. **Do not assume any path, version, port, database or Security Provider name.**
3. Inspect only relevant page/layout/assets and Wappler component files. Do not broadly scan `node_modules`, unrelated services, production credentials or other projects.
4. Confirm that the provided asset bundle was extracted and locate the reference mockups and selected hero asset. Inspect, do not blindly write.
5. Identify route collisions, existing branding and reusable components. Reuse existing Wappler conventions. Back up or commit the existing stable state before non-trivial edits.
6. If no usable Wappler scaffold is present, **STOP** without creating a competing React/Next/Vue/handwritten Express app. Report the minimum Wappler GUI scaffold setup needed and the missing path. If a permitted ordinary native GUI pattern is unavailable, propose an exception under `AGENTS.md` rather than silently circumvent it.
7. Produce a concise plan containing actual paths, screens, reusable components, asset mappings and proposed Wappler approach, then proceed with the approved GUI scope; do not request approval for each ordinary stylesheet or page.

## 2. Source/reference priority and image truthfulness

Use these visual references **as design references only**:

- `references/01_design_system_style_guide.png`: colors, cards, forms, headings, sections, alerts and stepper.
- `references/02_citizen_portal_home.png`: citizen public landing-page composition.
- `references/03_first_time_application.png`: application wizard layout and contextual sidebar.
- `references/04_immigration_backoffice.png`: dense but clear back-office sidebar, filters and queues.
- `references/05_user_selected_hero_layout.png`: the user's selected hero composition. In the bundle, its **text-free image** is `assets/ttpassport/banners/hero-citizen-passport.png` and takes precedence over the old hero.

Some AI reference text is fictional, inconsistent or inaccurate. Standardize the system name to **Trinidad & Tobago Passport Management System**, and keep the project limited to **passport functions**. Do NOT copy visa/permits/entry-exit navigation or fictitious 'official' policy wording from the back-office illustration. Never use AI-generated coats of arms/passport imagery as authoritative official insignia or documents. Where required, display a neutral emblem placeholder marked for replacement until a verified official emblem is provided. Keep all text and functional controls as live HTML, not flattened into background images.

## 3. Mandatory technology constraints

- **Wappler native first**: Wappler App Connect, native Server Connect when needed, Wappler components/partials supported by the actual scaffold, Bootstrap 5, native dynamic attributes and events (`dmx-on:*`). Use Wappler's normal Run/target setup.
- CSS in an ordinary **project-owned** theme stylesheet; no hand-modification of Wappler-generated runtime or Bootstrap library code.
- Prefer Wappler-managed forms, modals (`is="dmx-bs5-modal"`), bindings, validations, responsive layouts and components. No static `onclick`, `onchange`, `onsubmit`, `onerror`, etc. for Wappler-managed interactions. No direct DOM-manipulation scripts to reproduce normal Wappler UI.
- No React, Angular, Vue, Tailwind pipeline, custom client-side router, new ORM, duplicate auth system, shadow Node server or custom Express controller to make this UI work.
- Reusable EJS/Wappler partials are permitted where genuinely supported by the current scaffold; inspect before inventing include syntax.
- No runtime raw SQL, databases/seed migration or live API integration merely for visual previews.
- Do not modify `public/dmxAppConnect/`, `dmxAppConnect.js`, `dmxFormatter.js`, Wappler framework libraries, or Bootstrap distribution files.
- Do not introduce new cloud services, external fonts, CDNs, paid icon kits or other dependencies without approval. Use installed/supported icons or lightweight project-owned SVGs where permitted.

## 4. Assets: exactly how to install and use

From the ZIP, copy `assets/ttpassport/**` into the **actual project's appropriate static asset directory**, ordinarily `public/assets/ttpassport/**` if this is valid for the scaffold. Preserve subdirectories `banners/`, `backgrounds/`, `panels/`, `accents/` and accompanying webp/png files. Avoid duplicate assets if already present; preserve user modifications. Do not copy `references/` into public production assets; those are reference screenshots.

Primary mapping:

| UI area | Asset |
|---|---|
| Shared masthead (all portal shells) | `banners/header-government-crimson.webp` |
| Citizen homepage main hero (latest selected background) | `banners/hero-citizen-passport.webp` |
| Citizen dashboard | `backgrounds/bg-citizen-dashboard.webp` |
| First-time application wizard | `backgrounds/bg-application-form.webp` |
| Login/registration | `backgrounds/bg-login-authentication.webp` |
| Staff/supervisor/admin areas | `backgrounds/bg-backoffice-dashboard.webp` |
| International office/fulfilment information | `backgrounds/bg-international-service.webp` |
| eKYC/identity explanation | `backgrounds/bg-security-guilloche.webp` |
| Optional decorative corner | `accents/hibiscus-corner-watermark.webp` |
| Optional patriotic accent | `accents/flag-wave-ribbon.webp` |
| Optional footer detail | `accents/footer-wave.webp` |
| Optional neutral, red, gold panels | `panels/panel-ivory-neutral.webp`, `panel-highlight-red.webp`, `panel-information-gold.webp` |

Use `background-size: cover`, sensible `background-position`, overlays and breakpoints. **Avoid text overlap with the passport/skyline on the right.** On narrow screens switch the hero to a simple crimson gradient or a crop that preserves text readability. Use CSS gradients for ordinary card/header backgrounds rather than stretching tiny source textures. Asset paths must be confirmed by an actual localhost HTTP request.

The backgrounds are illustrative concepts; they can include AI-generated, inexact heraldry, buildings and passport art. Label the build **DESIGN PREVIEW — NOT AN ACTIVE PASSPORT SERVICE** where needed, and do not publish as official before authorised government artwork and text are supplied.

## 5. Design tokens (initial values; refine only if contrast tests require it)

Create one reusable theme source, suggested `public/assets/ttpassport/css/ttpassport-theme.css` (adapt to the scaffold), plus an optional short design tokens document. Define CSS custom properties rather than scattering hardcoded values:

```css
:root {
  --ttp-crimson: #900b2f;
  --ttp-crimson-dark: #64051f;
  --ttp-red: #b30b32;
  --ttp-gold: #d4af37;
  --ttp-gold-light: #f2d471;
  --ttp-charcoal: #1f2023;
  --ttp-ivory: #faf7f0;
  --ttp-surface: #ffffff;
  --ttp-border: #dedede;
  --ttp-muted: #5b616b;
  --ttp-success: #256744;
  --ttp-warning: #8a5708;
  --ttp-danger: #a51e32;
  --ttp-focus: #155ec4;
  --ttp-radius-card: 12px;
  --ttp-radius-control: 8px;
  --ttp-shadow-card: 0 2px 9px rgba(15, 15, 20, .08);
}
```

- Headings: formal, legible serif appearance (Georgia fallback; use an approved installed alternative only if available). Body: clean system sans-serif. Avoid embedding unauthorized font files.
- Body text has high contrast on ivory/white. White text only on sufficiently dark crimson/charcoal. Gold buttons have dark text. Ensure visible keyboard focus independent of color.
- Use red/crimson for primary government branding, gold sparingly as an accent, green for *actual positive statuses* only, and distinct text/icons for errors/warnings.
- Typical sizing: readable body 16px, heading hierarchy around 34/26/20px (responsive), minimum tappable controls ~44px, comfortable vertical spacing, consistent 8/12px cards and form controls.
- Provide states for hover, keyboard focus, disabled, loading, error, empty, active and successful transitions. Use Wappler/App Connect bindings when states are dynamic.
- Define reusable CSS classes for header, nav, hero, card, section-heading, tab, stepper, form-label, field-help, validation, status-chip, alert, empty-state, responsive table/card, footer and back-office sidebar.

## 6. Build scope — GUI baseline screens (no simulated backend success)

Build these actual Wappler-compatible pages/partials or adapt existing pages if present. Record actual routes in the report; paths are **not preapproved**, do not force guessed routes on an existing scaffold.

### GUI-01 — Shared Government Shell
- Reusable masthead: logo placeholder for later **authorised official coat of arms**, two-line government/system identity, image background on large screens, clean fallback on small screens.
- Shared responsive navigation, breadcrumbs, content container and dark footer containing accessibility/privacy/help placeholder links only when pages exist.
- Public portal, signed-in citizen, back-office and eKYC shells inherit the same design tokens. Back-office gets office/context chrome but retains recognizable national identity.
- A visible **design preview** label is required until official launch approval.

### GUI-02 — Public Citizen Home
- National red-gradient hero, with the **selected text-free hero asset** behind real editable HTML: small `CITIZEN PORTAL` eyebrow, headline `Apply, Renew and Manage Your Trinidad and Tobago Passport`, readable explanatory sentence, primary `Apply Now` and secondary `Sign In` controls.
- Three service cards: First-Time Application, Renewal, Track Application. Renewal may be visually marked `Planned / Not yet available` until implemented; never route to fictitious completion.
- Eligibility/Help panel: Who Can Apply, Required Documents, Support (do not invent government requirements).
- Trusted service/info panel with **accurate proposed design language**, no assertions that live identity verification already operates.
- Actual links to implemented pages; if feature is unimplemented, use honest disabled or coming-soon states, not dead `href="#"` controls.

### GUI-03 — Authentication Pages
- Citizen sign-in, registration, email verification, forgot/reset-password *visual* pages using native Wappler forms and validation affordances.
- If backend auth is not approved/available, these are labeled UI-only previews, do not create fake successful sign-in, fake security provider, or accept real credentials.
- Registration and accessibility cues, privacy text placeholders requiring legal approval.

### GUI-04 — Citizen Dashboard Shell
- Application summary cards, `Start application`, draft/status list, correction/action-needed block, a safe empty-state when no legitimate backend is connected.
- No fabricated application IDs or apparently real applicant names in non-preview mode. Any illustrative fixtures must be clearly labeled synthetic and restricted to development previews.
- Accessible responsive cards and action paths.

### GUI-05 — First-Time Application Wizard Shell
- Multi-step progress navigation; logical sections can cover eligibility, personal details, citizenship/guardian, recommender/references, documents, photograph/eKYC, office/delivery, review/declarations, and payment/tracking placeholder.
- Do **not** assume the five-step visual example is the complete legally approved workflow; use the confirmed functional stages, with future step count configurable.
- Match the reference form layout: strong page title, horizontal desktop stepper, left primary field card, right contextual help/requirements/photo guidance, bottom Back / Save Draft / Continue command row.
- Build *presentational* form samples with labels, help/error states, conditional-field examples and keyboard-accessible navigation. Full official fields, persistence, signature, verification, camera capture and payment are not implemented by this GUI-only package.
- For upload/photo controls, show an honest `Not yet connected` or appropriate preview state; do not fake a valid photograph or eKYC PASS.
- Use real browser form elements and native Wappler components; no screenshot backgrounds as forms.

### GUI-06 — Public Tracking Shell
- Reference entry and/or signed-in application status layout, timeline component, status chips, empty state and secure error design.
- No unauthenticated lookup of real application data or hardcoded success on guessed references.

### GUI-07 — Immigration Back-Office Shell
- Reusable back-office top bar, scoped office selector placeholder, left responsive sidebar, active navigation, content header and breadcrumbs.
- Navigation limited to the **passport** project: Overview, Applications, Assignments/Workload, Identity Exceptions, Decisions, Production/Issuance, Fulfilment/TTPost, Reports, Administration.
- Do not reproduce immigration visa or other unrelated categories from the concept image.
- Secure pages remain behind existing appropriate Wappler security. If none exists, generate a development-only isolated visual preview; do not expose real staff interfaces on production/public targets.

### GUI-08 — Supervisor Dashboard / Application Queue
- Summary KPI cards, filter row, application queue styling, status/priority chips, pagination visual pattern, assignment/workload panel and operational alerts.
- Filters should use actual native control values, `dmx-on:change` / `dmx-on:input`, and retained active filter values. Without a backend, render a clearly labeled **sample-data preview** or a true empty state; do not claim that counts are live.
- Responsive alternative for wide tables at 375px.

### GUI-09 — Staff Review Workspace Shell
- Case header, applicant details panel, tabs/sections for citizenship, evidence, eKYC status, photograph, recommender, verification checks, decision readiness, history.
- Show a **non-actionable** example of verification checklist and gated decision controls when actual permissions/workflow aren't yet built. Never provide working `Approve`, `Reject`, or `Release` buttons without approved server-side checks.
- Privacy: do not use real identification numbers, authentic citizen images, documents, or production records in mockups.

### GUI-10 — Administration Shell
- Office/user/role management page layouts and forms as consistent components; no actual privilege mutation until the later approved backend work packages.
- Use empty states or development-only fixtures.

### GUI-11 — eKYC Capture / Review Shell
- Identity steps overview, capture guidance, document upload placeholder, photo positioning guide, review-status panel, accessible retry/help state.
- These are **visual screens only**. Do not implement live biometric inference, liveness claims, registry lookups, camera JS framework, or signed assertions in this package.
- eKYC shells should be reusable later outside the Passport Management System: no passport-only CSS class names or hardcoded policy logic in the reusable eKYC visual component layer.

## 7. Reusable component library

Create/document **one** source of truth for: `GovernmentMasthead`, `MainNavigation`, `PageHeader`, `SectionHeader`, `ActionButton`, `ServiceCard`, `StatusChip`, `NoticeAlert`, `FormField`, `FieldHelp`, `ValidationMessage`, `WizardStepper`, `ApplicationSummaryCard`, `ResponsiveDataTable`, `EmptyState`, `LoadingState`, `ConfirmationModal`, `Breadcrumbs`, `GovernmentFooter` (component naming conceptual; use actual Wappler/partials conventions).

Use CSS classes and shared Wappler markup for reusable structures. Do not build a custom JavaScript component framework. A component cannot imply working business logic without the corresponding authorised API.

## 8. Page interaction requirements

- Every visible nav/action should do what its label says, or be plainly disabled/marked as a future feature.
- Avoid inert control-looking decoration and `href="#"` anchors as substitutes for behaviour.
- Forms expose appropriate required/help/error visual states and labels. GUI validation is illustrative only until server actions exist.
- Modals, tab navigation, stepper state, dropdowns, alert dismissal and filter changes use native App Connect/bootstrap-compatible Wappler patterns. If the required interaction is not possible natively, report limitation and leave that specific feature unimplemented.
- Buttons and links have obvious focus and responsive touch targets.
- No fake success notices such as `Payment successful`, `Identity verified` or `Application approved` unless they are clearly in a synthetic, development-only demo state.
- Use honest loading and error states in UI preview pages.

## 9. Accessibility, responsive design, performance

Verify widths at 1440, 1024, 768 and 375px. There must be no page-level horizontal scroll. Mobile hero stays readable; navigation collapses accessibly, cards stack, long forms remain usable, tables convert to sensible stacked cards or explicitly contained scrolling, stepper becomes compact, and important actions remain easy to reach.

Aim for WCAG 2.2 AA: proper landmarks, heading order, labels, contrast, focus, keyboard access, meaningful errors, visible skip link, appropriate `aria` for navigation and dialogs, reduced-motion safety, decorative images hidden from accessibility tree. Test at 200% zoom and keyboard-only use where practical. Optimize assets (use webp where appropriate), avoid blocking media, constrain hero sizes, and prevent layout shift.

## 10. Security boundaries of this GUI-only work

- No real passport or identity data in example markup, fixtures, images or commits.
- No claims of official authorization, active NOBIS integration, active eKYC, certified biometrics or approved online issuance.
- Never expose an unprotected back-office route that serves real or sensitive data.
- Do not create new API endpoints or permissions merely to make a dashboard populate.
- Do not implement payments, registration backends, application submission, photograph compliance decisions, production, TTPost integration or legal approval logic in this scope.
- No production deployment without human approval. All sample values must be visibly **sample/mock** and development-only.

## 11. Delivery sequence

**G0 — Baseline audit:** Confirm actual Wappler scaffold and proposed change paths.

**G1 — Assets and design tokens:** Install selected assets, theme CSS, typography, buttons, forms, cards, status badges, sections, alerts and visible focus styling.

**G2 — Shared layouts:** Implement public, citizen, application, back-office and eKYC shells using supported reuse patterns.

**G3 — Citizen baseline screens:** Build public home, authentication layouts, citizen dashboard, first-time wizard and tracking shell.

**G4 — Back-office baseline screens:** Build supervisor dashboard/queue, staff review, administration shell.

**G5 — eKYC baseline screens:** Build document/photo capture guidance and verification status/review layouts (visual only).

**G6 — Responsive and accessibility pass:** Test breakpoints, contrast, focus, navigation, form readability and mobile layout.

**G7 — Evidence and owner review:** Run command-level checks and supply screenshots/GUI acceptance checklist. Do not self-close the package.

Work incrementally and fix ordinary in-scope defects without restarting the architecture. This GUI package is an approved design-system task, not implicit approval to advance to development roadmap Stage 3 eKYC or any other backend package.

## 12. Mandatory acceptance checks (stable IDs)

| AC ID | Condition | Expected result |
|---|---|---|
| GUI-AC-001 | All pages share approved national design tokens | Consistent crimson/gold/ivory/charcoal palette |
| GUI-AC-002 | Selected latest hero is installed and actually loaded | Hero shows empty red left region, passport/skyline right; HTML heading/buttons on top |
| GUI-AC-003 | Main header/footer/navigation reused | No inconsistent duplicates across citizen and back office |
| GUI-AC-004 | Native Wappler structure preserved | All UI markup/components remain Wappler editable |
| GUI-AC-005 | Public home actions connect to real approved UI pages or honest pending state | No broken or deceptive CTAs |
| GUI-AC-006 | Application wizard shell is accessible | Labels, stepper, help panel, navigation and save placeholder states rendered correctly |
| GUI-AC-007 | Back-office shell is passport-specific | No visa/permit/other generic immigration features copied from concept |
| GUI-AC-008 | Sensitive staff UI is protected or development-only | No public access to live records |
| GUI-AC-009 | eKYC status/capture UI does not fake verification | No false `VERIFIED`/biometric claims |
| GUI-AC-010 | Responsive breakpoints | Pass at 1440 / 1024 / 768 / 375px |
| GUI-AC-011 | Accessibility | Keyboard, focus, labels, contrast, zoom and mobile navigation |
| GUI-AC-012 | Asset and runtime integrity | No missing images, framework runtime modifications or new UI framework |
| GUI-AC-013 | No backend scope creep | No unapproved schema, provider integration, auth or business workflow implementations |
| GUI-AC-014 | Documentation and ownership | Screens, routes, assets, CSS tokens, limitations and test evidence recorded |

## 13. Testing: Codex COMMAND TEST vs owner's GUI TEST

Codex must run the applicable real checks against the actual changed files/environment. At minimum:

- Inspect Git diff and ensure only approved project-owned files changed; verify generated Wappler framework files untouched.
- Start using actual Wappler workflow if available, check expected HTTP status for pages and assets on the project's real development target. Do not invent port numbers or successful requests.
- Validate EJS/template syntax or Wappler layout compatibility using available tooling, and browser console/network errors where tools are available. If browser automation is unavailable, mark those checks `BLOCKED/PENDING` rather than claiming PASS.
- Inspect for static `onclick`/`onsubmit`, duplicate IDs, dead `href="#"`, inaccessible labels and content overflowing small screens.
- Check all referenced image paths exist and MIME/asset links load; confirm selected hero is used, not the older asset.
- Demonstrate a representative working native Wappler dynamic event such as tab/stepper/filter interaction where supported.
- Test any existing security gates for staff pages; **do not** create fake secure login to make them pass.
- Record command, expected result, actual result, outcome and evidence path for each test.

The human owner performs final **GUI TEST** of visual fidelity, usability, responsive behavior and business suitability. Codex prepares a concise checklist, preferably 8–12 screenshots/scenarios; **never report GUI acceptance as PASS until the owner explicitly does so.**

Do not call static screenshot inspection a runtime test. No demo artifact alone counts as acceptance of citizen data security or backend workflows.

## 14. Output and completion report

Report:

```text
PACKAGE: GUI-BASELINE-01
STATUS: DEVELOPMENT_COMPLETE | TESTING | BLOCKED | UAT_PENDING (not CLOSED_PASS)
ACTUAL PROJECT ROOT / GIT BRANCH / COMMIT:
WAPPLER / NODE / URL ACTUALLY VERIFIED:
SHARED COMPONENTS CREATED OR REUSED:
SCREENS BUILT (screen ID / actual route / Wappler-editable path):
ASSETS INSTALLED (exact paths; selected hero confirmed):
CSS/THEME FILES:
FILES MODIFIED:
UNAPPROVED BACKEND CHANGES: NONE
COMMAND TESTS: [test ID / command / expected / actual / PASS-FAIL-BLOCKED]
RESPONSIVE CHECKS: [1440, 1024, 768, 375]
SECURITY / OFFICE-SCOPE IMPACT:
KNOWN VISUAL OR FUNCTIONAL LIMITATIONS:
GUI REVIEW LINKS / SCREENSHOTS:
ROLLBACK:
HUMAN GUI ACCEPTANCE: PENDING
NEXT STEP: Ask owner to review GUI baseline; do NOT begin backend modules automatically.
```

If an asset or approved Wappler component is unavailable, deliver the safely completed portion and identify exactly which screen/check is blocked.

## 15. First Codex action

Begin with **G0**: inspect the real Wappler repository and `AGENTS.md`, inspect the provided assets and four reference mockups, report the actual scaffold and a concise implementation plan, and then implement **G1 through G7** in the approved GUI-only scope. Do not ask the owner to reconfirm already approved colours, hero artwork, baseline screen list, or Wappler-first requirements. Stop only for missing scaffold, required authorisation, or a material architecture/security dependency.
