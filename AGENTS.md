# AGENTS.md — Trinidad & Tobago Online Passport Management System (TTPASSPORT)

**Version:** 1.0  
**Effective baseline:** 22 November 2026  
**Audience:** Codex and all code-generating agents working in this repository  
**Status:** Binding development instructions; **not** approval to begin implementation, use real identity data, or deploy  
**Primary framework:** Wappler-first, Wappler GUI-maintainable  
**Project owner:** Human solution owner / authorised government stakeholders

> **READ THIS ENTIRE FILE BEFORE MODIFYING THE PROJECT.** It applies to every directory unless a narrower `AGENTS.md` explicitly adds restrictions without weakening the controls here. Direct instructions from the human owner may alter scope, but security-sensitive exceptions and deviations must be explicit, recorded, and approved. Do not interpret a feature description or an architectural diagram as permission to implement or deploy it.

---

## 1. Project mission and boundaries

Build a national, secure, auditable **Trinidad & Tobago Online Passport Management System** for the Immigration Division. Its first citizen service is **first-time passport applications for people aged 16 and over**, including citizens resident in Trinidad & Tobago and citizens resident overseas. Design for a future **passport renewal stream** and later service categories, without conflating them with the first-time stream.

Main functional domains:

1. Citizen registration, authentication, accounts, drafts, profiles, supporting evidence.
2. First-time passport application based on the current, verified official Immigration form and instructions, with versioned rules.
3. An **independent, reusable eKYC/Identity Verification Platform (IVP)** developed inside this project, capable of later standalone deployment.
4. Photograph capture, quality checks, consent/declarations, guardian and recommender workflows.
5. Domestic passport offices, overseas missions, preferred-office selection, jurisdictions, assignment and routing.
6. Immigration Administrator, Supervisor and Staff workspaces, risk-based reviews, corrections, rejections and approvals.
7. Payments, policy-based fee timing, reconciliation, receipts and adjustments.
8. Passport production **recording** (manual in the initial release), quality control, official issuance and release authorisation.
9. Domestic TTPost fulfilment; authorised international couriers; mission or domestic office pickup; recipient controls and physical chain of custody.
10. Citizen tracking, notification, reporting, security, audit, testing and deployment.

**Confirmed operating decisions:**

- The proposed official operator is the Immigration Division; do not claim the agency has already approved remote issuance or this new platform.
- Applicants aged **16+** are within the first-time stream. Applicants aged **16–17** require the approved guardian-consent workflow.
- Fully online proofing/application is the **target**, contingent on government legal, identity and biometric approvals. Never silently replace an in-person legal requirement.
- Applicant selects from **eligible preferred offices**; actual intake, processing, issuance and fulfilment locations may differ.
- Both local and overseas citizens are supported in the data model and intended initial release.
- Payments occur at a configurable, policy-approved step; no hard-coded universal timing or fees.
- Risk-based approval: authorised officers may approve routine cases; defined exceptions require a **different authorised decision-maker**.
- Production and issuance events are manually recorded initially; do **not** build passport printer control or invent passport numbers.
- TTPost is the preferred domestic courier; only use actual documented/approved TTPost capabilities, never fictitious API routes.
- Overseas fulfilment may use eligible mission collection, approved courier, or authorised Trinidad & Tobago collection.
- A passport may be released to the applicant or an **explicitly authorised guardian/representative**, after identity and authority checks.
- **NOBIS is not an integration dependency.** The project will build its own reusable eKYC module; do not revive or reference NOBIS as a working provider.

**Trust boundaries that must remain separate:** account authentication ≠ identity proofing ≠ citizenship eligibility ≠ application approval ≠ passport issuance ≠ physical release ≠ confirmed delivery.

---

## 2. Non-negotiable Wappler-first development contract

All **ordinary application runtime behaviour** must be implemented with supported, GUI-maintainable Wappler components where available. This file adapts the retrieved **MyCashless `AGENTS.md`** and **`AI_DEVELOPMENT_STANDARDS.md`** Wappler-first rules, alongside the earlier Cashbook modular-development principles. The exact original eCashbook agent file was not available for a direct line-by-line comparison. Adapt the rules, **not** the old project paths, credentials, database names, routes or portal-specific business logic.

**Prefer these native capabilities:**

- Wappler Server Connect actions and reusable Server Connect Libraries.
- Native Wappler Security Provider, Security Restrict, Security Identify and supported session management.
- Native Database Query, Database Single Query, Insert, Update, permitted Delete, Database Transaction.
- Validators, Conditions, Repeat, Set Value, formatter steps, Wappler Mailer and File Upload.
- Wappler App Connect, dynamic attributes/events, forms and components.
- Bootstrap 5 components built and maintained in Wappler.
- Wappler-managed dependencies and supported configuration.

**Not permitted unless separately approved as a justified exception:**

- Custom Express routes, standalone Node business-controller layers or an alternative application framework **inside the Wappler app**.
- A second/shadow authentication or authorisation scheme bypassing Wappler Security Providers.
- New ORM or runtime data-access abstraction replacing Wappler Database actions.
- Raw runtime SQL in application endpoints or scripted queries used as a shortcut around Wappler.
- Handwritten JavaScript implementing standard Wappler forms, modal flows, filters, CRUD, validation or page state.
- Direct DOM manipulation or generic Bootstrap JS in place of App Connect components.
- Custom middleware, plugins or packages added solely for developer convenience.
- Hidden/"ghost" routes, server files, scheduled tasks, service accounts or parallel workflows not represented in the design and repo documentation.

**Very important:** Wappler-first is **not** equivalent to "everything must run inside Wappler". Specialised **OCR, biometric/PAD, cryptographic verification, authoritative-source adapters, reliable queues or provider-specific integration** may not be safely achievable using native Wappler actions alone. For such cases, use the controlled exception process in Section 3. Never force a security-critical feature into inadequate native components, and never use the existence of specialised services as blanket permission to replace ordinary Wappler functionality.

---

## 3. Extension and specialised-service approval gate

When native Wappler capabilities are insufficient, **STOP the affected implementation slice** and submit a short **Extension Request** containing:

1. Work-package ID and exact capability gap; native approaches considered and why inadequate.
2. Whether this is a Wappler Extension, isolated service/worker, approved SDK, or external provider adapter.
3. Inputs/outputs, API or Server Connect entry points, authentication, authorisation and data ownership.
4. Data types processed (especially face images, IDs, certificates, payment/courier data), storage, encryption and retention.
5. Exact dependencies, licenses/model-weight usage rights, deployment/network requirements and update compatibility.
6. Threats, error handling, audit trail, fallback, tests, rollback and operating costs.
7. Whether the extension is **extractable with IVP** or is passport-specific.
8. Clear owner/government/security approvals required.

**Implementation starts only after explicit approval.** Approved extensions must be version-controlled, documented, isolated, callable through declared contracts and never patch Wappler-generated runtime. If approval is pending, implement only unrelated safe Wappler-native work and report the affected package as `BLOCKED`.

### Specialised eKYC carve-out — proposal, not blanket approval

- A **separately deployed Python/document/biometric worker** may be proposed for OCR, image quality, face comparison and PAD; the Wappler application orchestrates it over an approved authenticated interface.
- Evaluate independently tested biometric engines for official high-assurance use; open-source OCR or face models are **not automatically production certified**.
- No unreviewed model weights, remote biometric SaaS, facial identification database, or third-party transfer of citizen evidence.
- Face similarity or liveness success must **never alone** produce a legally verified identity or passport approval.
- For eKYC, separation into a service is intended to enable future standalone deployment; it does not allow bypassing the primary Wappler business workflow.

---

## 4. Wappler UI, event and responsiveness rules

- Use Bootstrap 5 components provided/supported through Wappler, App Connect bindings and Wappler-valid markup.
- Bootstrap 5 modals must use `is="dmx-bs5-modal"` and Wappler component methods such as `modalId.show()` and `modalId.hide()`.
- Use **only** App Connect dynamic events `dmx-on:*`; do not introduce static `onclick`, `onchange`, `onsubmit`, `onsuccess`, `onerror` or hand-written DOM listeners for ordinary behaviour.
- Use component methods: `serverConnectId.load()`, `formId.reset()`, etc.
- Bind filter parameters directly to the actual filter control value, e.g. `dmx-param:status="statusSelect.value"`.
- Use `dmx-on:change` for selects/date filters (**not** `dmx-on:changed`); `dmx-on:input` for live text search.
- When refreshing with multiple filters, always retain **all current filters**.
- After successful mutations, refresh the existing affected Server Connect component; avoid forced page reloads and duplicate data components.
- Prevent duplicate submissions; display loading, success and non-sensitive errors using native components.
- Responsive test sizes: approximately **1440, 1024, 768 and 375 px**. No page-level horizontal overflow. Use stacked cards for mobile where wide tables are unsuitable.
- Support keyboard navigation, accessible labels, readable errors, mobile camera permission/denial/retry and citizen connectivity interruptions.
- Any uploaded photos must keep originals; quality checks/crops may create distinct derivatives. Do not beautify or synthesize facial features.

Examples of acceptable App Connect event expressions:

```html
<button dmx-on:click="editModal.show()">Edit</button>
<select id="statusSelect" dmx-on:change="listSC.load({status:statusSelect.value}, true)"></select>
<form dmx-on:success="listSC.load();editModal.hide()"></form>
<div class="modal fade" is="dmx-bs5-modal" id="editModal"></div>
```

The examples are illustrative; validate exact component placement in the installed Wappler version and generated project markup.

---

## 5. Protect the Wappler runtime and respect the actual scaffold

Never directly edit, recreate, patch, replace or vendor:

```text
dmxAppConnect.js
dmxFormatter.js
public/dmxAppConnect/
Wappler-generated runtime libraries
Bootstrap runtime bundles
Wappler framework loader/runtime internals
```

Use supported Wappler dependency management and regeneration. Never fix an application defect by modifying framework internals.

**Do not assume** a repository path, live URL, localhost port, Wappler version, Node runtime, current schema name, connection name, Security Provider name or production cloud host. On first repository access, **inspect and report the actual scaffold**. A proposed target is Wappler/Node.js/Express/Bootstrap 5/MySQL, but exact versions/settings require owner approval and environment evidence.

Do not copy MyCashless-specific `/wallet`, `/store`, `cashless_db`, `adminSecurity`, or Cashbook-specific routes into this project.

---

## 6. Architectural separation and modularity

Implement **separable modules** with narrow purpose-specific Wappler Server Connect APIs. Keep UI, actions, data and permissions grouped by functional module/screen as far as Wappler supports.

Logical boundaries:

- Citizen account/authentication and passport applicant profile.
- First-time/renewal application records and versioned submitted snapshots.
- eKYC subject, evidence, sessions, checks, reviews and signed assertions.
- Immigration case management and office-scoped workflow.
- Payments, financial adjustments and reconciliation.
- Passport production, issuance, stock/custody and release controls.
- Shipment, courier tracking, proof of receipt and physical custody.
- Audit, notifications and reporting.

**IVP extraction invariant:** The eKYC module must not depend on passport-specific tables, passport case-status semantics or direct cross-database foreign keys. The passport system is **Client #1** of eKYC and communicates through authenticated versioned APIs. Future client/tenant separation must be included in the data model and checked on every API operation. No global identity lookup across unrelated tenants without an independently approved legal and technical design.

Keep these IDs/concepts distinct: `citizen_account`, `applicant_profile`, `passport_application`, `ekyc_subject`, `verification_session`, `passport_issuance`, `fulfilment_request`, `shipment`, `delivery_batch`, `recipient_authorisation`.

---

## 7. Authentication, RBAC, office scope and separation of duties

- Use Wappler-native Security Providers and backend restrictions for Wappler app users; separate citizen, staff/administrator and machine-client trust contexts.
- Maintain **Administrator, Supervisor, Staff** as primary back-office role categories; assign granular permissions independently.
- Enforce **permission + office/mission jurisdiction + case assignment + current workflow state + applicable policy** on every sensitive backend action.
- Hiding a button does not provide authorisation. Do not trust `office_id`, `role_id`, `tenant_id`, applicant ID or application ID directly from browser parameters without server verification.
- A privileged administrator must not self-grant passport issuing/release authority without approved independent control.
- Ordinary reviewers cannot clear their own independent-review/security-hold requirements.
- Routine cases may be approved by an authorised officer when every policy gate passes; enhanced cases require a **different authorised officer**. Security holds require designated authority.
- Approval, production, legal issuance, release and physical delivery confirmation are separate operations and permissions.
- Overseas mission users see only assigned/jurisdiction-authorised data. Access must be reevaluated after office transfers.
- Recommenders, guardians and authorised recipients must authenticate/verify **as themselves** and cannot be impersonated by the applicant.
- High-risk actions require fresh authentication/step-up as approved; do not expose privileged APIs using only weak email OTP.
- All authorisation and denied-access behaviour must be covered by negative API tests, including altered object IDs and cross-office/cross-tenant attempts.

---

## 8. eKYC verification integrity

- The project builds its own eKYC platform; **never assume NOBIS is available**.
- Treat **identity resolution**, **document validation**, **person-to-evidence verification** and **citizenship eligibility** as distinct controls.
- OCR extraction is *not* proof that a document is authentic; face similarity is *not* proof of legal identity; liveness is *not* proof of citizenship.
- Never emit `VERIFIED` unless the approved policy's required trustworthy evidence and source checks have actually succeeded, or a separately authorised alternative proofing process legitimately satisfies that policy.
- Required-but-unavailable authoritative source → `PENDING`, `REVIEW_REQUIRED` or `BLOCKED` according to approved policy; **never fake PASS**.
- Store provider, model version, policy version, actual checks, confidence details where permitted, timestamps and evidence references.
- Use safe threshold configuration backed by evaluated performance and permitted operating policy. Do not invent "98%" or other thresholds to make demos pass.
- No production biometric matching without independently accepted efficacy/PAD testing, licensing, privacy and government approval.
- Use **synthetic or explicitly authorised** test evidence only. Never upload real identities to unapproved external APIs.
- Separate KYC selfie/liveness evidence from the applicant's proposed passport-print photograph.
- If an API uses mock verification providers for development, mark records clearly `MOCK / NON-PRODUCTION`; mocks must **not** issue production-grade assertions or unlock real issuance.
- Assertions must be signed/verifiable, audience-bound, expiring, replay-resistant, revocable, and scoped to a client; callbacks alone are not proof.
- Retain biometric evidence minimally under approved retention rules; do not make or centralise biometric templates without a documented basis.

---

## 9. First-time passport application rules

- Use version-controlled mappings of actual approved Immigration forms/instructions; do not invent mandatory government fields or legal rules.
- First-time service starts at age **16**; ages 16–17 require verified guardian consent per applicable policy.
- Support multiple names/name history, citizenship categories, prior travel documents, recommender and references, international addresses, required documents and declarations.
- Treat applicant, guardian, recommender and references as distinct identities with separate permissions and interactions.
- Capture source form version, applicant declarations/signature evidence, document versions, initial submission snapshot and subsequent corrections.
- Show a **clearly labelled specimen** preview only; never create a realistic passport credential that could be used as an official ID.
- Citizen-selected office is a preference subject to actual jurisdiction, capability and processing requirements.
- A first-time application is not a renewal. Prior document history and duplicates must be assessed rather than silently treated as first-time eligibility.
- Do not auto-reject for overseas residence, unusual names, inaccessible record sources or ambiguous biometric results; route appropriate exceptions for human review.

---

## 10. Database, SQL, evidence and transactional rules

- Inspect actual Wappler project and MySQL version before choosing the development schema or migration syntax. The proposed separate eKYC database is **not** permission to create a live database without authorisation.
- Raw SQL is allowed **only** for controlled schema creation, versioned migrations, seed fixtures and separately authorised data corrections; not for runtime app business queries.
- Use Wappler Database components for runtime reads/writes, server-side filtering, pagination, transactions and validations.
- Use transactions for related operations: application submission + snapshot + history; assignment; decision + audit; payment settlement record; issuance + production state; release + custody; batch handover.
- Protect concurrency with database constraints, lock/version checks and idempotency keys. Never rely on client UI alone to prevent duplicates.
- Monetary data must use DECIMAL/integer minor-unit discipline, never floating-point money calculations. Keep accounting state separate from passport decisions.
- Use stable opaque references in citizen/courier-facing APIs; no sequential DB IDs as sole access controls.
- Sensitive documents/photos/biometric samples must be in private, encrypted storage; never under `/public`, publicly accessible URLs, or broad web server directories.
- Use generated storage object keys, file-type/content/size checks, antivirus or equivalent scanning and server-verified download permissions. Never trust user-supplied file paths.
- Document history, issuance history, case decisions, courier custody and finance ledger entries are append-oriented, not ordinarily editable/deletable.
- Preserve original evidence; corrections create new versions. Any deletion follows approved retention and legal hold policy.
- Every event records actor, time, action, subject reference, source, prior/new state and safe reason; **no DOB, identity numbers, face images, full addresses, access tokens or payment secrets in generic logs**.
- Rehearse backups/rollback; never alter production tables, destroy data, reset environments or widen DB grants without explicit authorisation.

---

## 11. Passport case processing and legal decisions

- Supervisor owns office queues and assignments; Staff handles assigned reviews and authorised case actions.
- Allow routine approval only after all mandatory identity, citizenship, documentation, recommender, guardian and legal declaration checks succeed.
- Enhanced review must be independent; a reviewer cannot approve their own recommended enhanced case.
- Security holds are **independent blocking flags**, not destructive rewrites of legal case status.
- Rejection must have an authorised basis and recorded decision; citizen corrections are not the same as rejection. Do not invent universal appeal rights.
- Payment may be required at different policy stages and must not bypass substantive application verification.
- Passport production/issuance is a separate legal record, not a simple boolean on the application.
- Do not generate, reserve, guess or overwrite legal passport numbers except within explicitly authorised official processes.
- An issued passport is **not** automatically authorised for release.

---

## 12. Domestic/international fulfilment, TTPost and custody

- Approved options: domestic TTPost delivery; eligible domestic office pickup; eligible overseas mission pickup; approved international courier; authorised representative/guardian pickup where policy permits.
- Track preferred office, intake office, processing office, issuing office and fulfilment location separately.
- Configure office/mission service capabilities and courier service zones; do not infer an API, collection service or geographic coverage that has not been verified.
- Each physical passport item must have controlled production, QC, issuance, release and custody records.
- Shipment ≠ passport issuance ≠ dispatch batch. Batch manifests contain individually reconciled physical items.
- Verify nominated recipient's identity and specific authority at handover. Courier drivers are transport custodians, not authorised ultimate passport recipients.
- Courier event `delivered` is not automatically equivalent to legally confirmed handover; proof-of-delivery and recipient verification must satisfy approved policy.
- Lost, damaged, unaccounted-for or incorrectly released passports trigger security exceptions; **never auto-issue a replacement**.
- TTPost is a proposed domestic integration partner. No invented TTPost endpoints; manual fallbacks require explicit approval and full custody audit.
- Authenticate courier callbacks, validate state transitions, prevent replay/duplicates and reconcile external statuses.

---

## 13. Payments and financial controls

- Fee schedules, currency, exemptions, application category, overseas rules and payment timing are effective-dated and government-authorised.
- Payment initiation, gateway authorisation, capture/settlement, reconciliation, refund and reversal are separate states.
- Never assume a successful browser redirect equals payment success; verify server-to-server with the approved provider.
- Secure callbacks, idempotency keys, immutable transaction references and daily reconciliation are required.
- Do not store cardholder data, CVV, access credentials or provider signing secrets in application tables/logs.
- Do not submit **real financial transactions** unless the owner explicitly authorises the specific environment, amounts and test scenario.
- Do not invent a payment gateway, banking settlement route or fee rule when not approved.

---

## 14. External providers and operational reliability

- All external providers (national registries, biometric engines, payment gateway, TTPost, overseas carriers) are **unconfirmed until actual specifications, access rights and contracts are available**.
- Centralise provider contracts behind documented, approved interfaces. Preserve versioned schemas and test fixtures.
- Protect credentials and secrets through approved environment/secret-management methods; never commit `.env`, private keys, API tokens, DB exports or test identities.
- Every integration must support timeout, failure recovery, idempotency, reconciliation, rate limiting and safe diagnostics.
- Never report integration `PASS` from only mocked HTTP calls or static code inspection; distinguish `MOCK PASS` from `LIVE SANDBOX PASS` and `PRODUCTION ACCEPTANCE`.
- Avoid unapproved outbound requests that could leak passport or biometric information.
- Time events should use consistent stored timestamps and display relevant local time zones for applicants and missions.

---

## 15. Security, privacy, accessibility and compliance

- Threat-model identity spoofing, injected camera media, fake documents, privilege escalation, IDOR, cross-tenant/office exposure, insider fraud, duplicate issuance, payment fraud and courier custody compromise.
- Apply least-privilege service accounts, role/office restrictions, rate limits, secure cookies, CSRF protections where appropriate, secure HTTP headers and secure account recovery.
- Enforce encryption in transit and at rest, controlled key management, audited access, safe logging and data-minimisation.
- Produce privacy impact and retention requirements for local and overseas applicants; identify legal basis and permitted cross-border transfers before use.
- Apply government-approved requirements for electronic signatures, remote identity proofing, passport photography, accessibility and official issuance. NIST/ICAO/OWASP/ISO references are engineering benchmarks, **not** automatic legal authorisation or certification.
- Protect operational, investigative and risk flags from citizen and courier views.
- No real biometric datasets, real personal identity documents, sensitive production integrations or public internet exposure without explicit approval and security review.
- User errors must not expose SQL, stack traces, internal file paths, security configuration or sensitive attributes.

---

## 16. Development roadmap and stable work-package IDs

The master plan has **18 stages and 150 lettered work packages** (the earlier narrative mistakenly said 142; 150 is the sum of the defined ranges). Preserve IDs across project work and reports.

| Stage | Scope | IDs | Packages |
|---|---|---|---:|
| 1 | Governance and Requirements | 1A–1H | 8 |
| 2 | Architecture and Core Infrastructure | 2A–2H | 8 |
| 3 | Reusable eKYC Platform | 3A–3L | 12 |
| 4 | Citizen Registration and Accounts | 4A–4G | 7 |
| 5 | First-Time Passport Application | 5A–5K | 11 |
| 6 | Geographic Routing and Offices | 6A–6G | 7 |
| 7 | Immigration Back Office | 7A–7J | 10 |
| 8 | Payments and Reconciliation | 8A–8H | 8 |
| 9 | Production and Issuance | 9A–9H | 8 |
| 10 | Fulfilment and Logistics | 10A–10K | 11 |
| 11 | Tracking and Notifications | 11A–11F | 6 |
| 12 | Reporting and Analytics | 12A–12F | 6 |
| 13 | Passport Renewals (later release) | 13A–13I | 9 |
| 14 | External Integrations | 14A–14G | 7 |
| 15 | Security and Compliance | 15A–15H | 8 |
| 16 | Testing and Acceptance | 16A–16I | 9 |
| 17 | Deployment and Rollout | 17A–17H | 8 |
| 18 | Standalone eKYC Readiness (later release) | 18A–18G | 7 |
| | **Total** | | **150** |

**Canonical descriptions:** Use the human-approved 18-stage master roadmap. If a copy is not in the repository, prepare `docs/PROJECT_ROADMAP.md` for review from the approved roadmap; do not silently invent, remove, renumber or relabel work packages. Later/future stages are not implicitly authorised by initial project setup.

**Progress record:** Once the owner supplies/approves the project workspace, maintain `docs/PROJECT_STATUS.md` with one record per package: ID, title, release, status, scope, baseline/AC IDs, latest test evidence, blockers, reviewer, approval date, commit, and next action.

Statuses: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `DEVELOPMENT_COMPLETE`, `TESTING`, `UAT_PENDING`, `CLOSED_PASS`. Do not treat design discussions or generated source as completed development. Initial status is `NOT_STARTED / NOT VERIFIED` until actual workspace evidence establishes otherwise.

---

## 17. Mandatory package workflow and approval gates

### 17.1 Before writing code

For each authorised package (for example `3A`, `5H` or `7I`):

1. Read root/nested `AGENTS.md`, approved roadmap, status register and relevant source files.
2. Confirm current Git branch/commit, application/runtime configuration, Wappler project, target database and environment. Report uncertainty instead of guessing.
3. Confirm business goal, scope/exclusions, affected actors, routes/screens, data model and approved dependencies.
4. Produce stable acceptance IDs (`AC-<package>-001`) and command test IDs (`CT-<package>-001`), mapping tests to criteria.
5. Identify access/security checks, negative paths, concurrency, retention, data migrations, rollback and extension needs.
6. Obtain **owner approval of the package baseline** before materially changing architecture, adding services, or developing unapproved scope.

Within an approved package, Codex may implement and fix ordinary in-scope defects without repeatedly asking for approval on every component. Do not expand scope or bypass a blocked decision.

### 17.2 During implementation

- Implement in small reviewable increments; preserve established Wappler project conventions.
- Build actual Wappler-compatible Server Connect/App Connect functionality; verify real file availability before reporting modifications.
- Prefer existing libraries and components; do not create duplicate flows or unnecessary frameworks.
- Keep Git changes scoped and well described. Do not rewrite unrelated modules or runtime files.
- Do not modify or run commands against production/private systems without explicit authorisation.
- After an error, repair the underlying defect; do not alter tests to make broken behaviour pass.

### 17.3 COMMAND TEST — Codex responsibility

Execute **actual** relevant commands/API/database tests against the approved non-production environment:

- Application starts in the actual Wappler target; real Server Connect action and DB connectivity verified.
- Positive, negative, boundary, expired-session, invalid-input and failure-recovery tests.
- Backend role, office-scope, tenant-scope, record-level authorisation and IDOR tests.
- Migration integrity, transaction rollback, locking/concurrency and idempotency tests.
- eKYC mock/real provider distinctions; incomplete checks cannot issue verified assertion.
- Payment webhook/replay/reconciliation and courier custody tests where relevant.
- Regressions affecting existing accepted packages.

For every test report: `Test ID | Acceptance ID | environment | command | expected | actual | PASS/FAIL/BLOCKED | evidence path`.

**Never:** claim a browser test, production biometric assurance, live provider acceptance, signed assertion verification or government approval has passed based solely on unit tests, mocks or source inspection.

### 17.4 GUI TEST — human owner responsibility

Codex prepares a concise manual GUI checklist covering visible flows, errors, mobile/layout and expected results. The **human owner** performs GUI/browser acceptance and explicitly reports PASS/FAIL. Codex may run command-line tests and automation of non-GUI functions; GUI acceptance stays `PENDING` until the owner confirms it.

### 17.5 Independent review and closure

- ChatGPT/technical reviewer may critically assess source and evidence; reviewing a Codex-generated log is **not** independent execution.
- `CLOSED_PASS` requires actual relevant COMMAND TEST evidence, human GUI acceptance (where applicable), documentation/rollback, no unresolved release blockers and explicit owner closure approval.
- Never automatically advance to the next package, declare legal/security approval or deploy to production on AI authority alone.
- If blocked, report exact issue and continue unrelated safe approved work when possible.

---

## 18. Codex report template (every package)

```text
PROJECT: TTPASSPORT
PACKAGE: [e.g., 3A — eKYC Client/Tenant Management]
APPROVED BASELINE: [version/date/reference]
STATUS: NOT_STARTED | IN_PROGRESS | BLOCKED | DEVELOPMENT_COMPLETE | TESTING | UAT_PENDING | CLOSED_PASS
ENVIRONMENT: [actual Wappler, Node, DB, target, Git branch/commit]
IMPLEMENTED: [screens, Wappler actions, libraries, schema changes]
WAPPLER-NATIVE IMPLEMENTATION: [which native components and how GUI-editable]
APPROVED EXTENSIONS: [reference or NONE]
FILES / MIGRATIONS: [actual changed paths]
COMMAND TEST: PASS __ / FAIL __ / BLOCKED __
EVIDENCE: [CT ID | AC ID | environment | command | expected | actual | result | evidence path]
RBAC / OFFICE / TENANT ISOLATION: [evidence]
TRANSACTION / IDEMPOTENCY / AUDIT: [evidence]
REGRESSIONS: [checked]
RISKS / UNTESTED / BLOCKERS: [plainly stated]
ROLLBACK: [how to undo safely]
GUI CHECKLIST: [3–6 specific owner-run tests]
GUI ACCEPTANCE: PENDING HUMAN RESULT
GIT: [branch and commit]
NEXT ACTION: [request technical review / owner GUI acceptance / blocker decision]
```

Do not use fabricated sample IDs, imaginary successful API responses or GUI screenshots as evidence of actual production readiness.

---

## 19. Safe first actions in a new repository

When the owner asks Codex to start:

1. **Inspect only:** verify the actual project directory, Git state, Wappler project structure, runtime/version, configured target/port and DB connection. **Do not assume** prior projects' paths or credentials.
2. Read these instructions and the approved work-package plan. Confirm what is already implemented versus only designed.
3. Check how normal **Wappler Run** starts the app; do not create a custom startup tool or replace Wappler's launcher just to satisfy an agent.
4. Verify Wappler-native App Connect, Server Connect, database connection and Security Provider facilities without guessing names.
5. Report a concise baseline and proposed first package (normally `1A`, subject to owner approval). Do **not** create an alternate Express architecture or initialise an unrelated prototype.
6. Never access or modify private databases, live financial providers, real passport applications or real biometric evidence without explicit scope and authorisation.

If the repo/project path has not been provided, the correct next step is to request the Wappler scaffold location and provide the minimum Wappler setup instructions—not to invent a path or clone an unrelated project.

---

## 20. Definition of Done and instruction hierarchy

An accepted package must be: Wappler maintainable (except explicitly approved specialist services), secure at the server and data boundaries, properly scoped, tested with reproducible evidence, documented, rollback-ready, and explicitly signed off by the owner.

Never weaken legal identity, approval, financial or custody controls for convenience or to make a demo work. Never assert that the platform is government-authorised, certified or production-ready without corresponding official approvals.

If instructions conflict, apply the following order: explicit current owner direction within lawful safety bounds; more specific compatible `AGENTS.md`; this root `AGENTS.md`; approved module specification/roadmap; existing project conventions. **Security-sensitive or architectural exceptions still require explicit recorded authorisation.**
