# Business Workflows

**Work package:** TTP-01D (Stage 1D)
**Version:** 1.0
**Baseline date:** 22 November 2026
**Status:** Conceptual workflows; policy, role and service approvals pending

These are workflow specifications, not implemented routes or approved legal procedures. A missing required source or policy decision must lead to a pending, review-required or blocked state, never a fabricated pass.

## Required separation of outcomes

**Identity verification → Citizenship eligibility → Application approval → Passport issuance → Release authorisation → Delivery confirmation**

These are distinct decisions and records. Account login, OCR extraction, face similarity, liveness, payment success, or a courier status cannot substitute for a later decision.

## 1. Citizen registration

1. Applicant opens a Wappler-native registration flow and receives a clear privacy notice based on an approved notice.
2. The system validates account fields, applies rate limits, creates an unverified account, and sends a non-sensitive verification link/code using an approved messaging service.
3. Applicant completes verification; the backend validates expiry, replay protection, and account state before activating the account.
4. Recovery uses an approved secure process. Account activation proves control of an account channel only; it does not establish identity or citizenship.

**Stops/controls:** Duplicate or abusive attempts are rate-limited and logged safely; no secrets or identity documents enter generic logs.

## 2. eKYC identity verification

1. A passport client requests a tenant-scoped IVP subject/session through a versioned authenticated interface.
2. The IVP presents approved notice/consent and capture guidance; citizen evidence is uploaded to private storage with generated object identifiers and content checks.
3. Approved document, identity-resolution, person-to-evidence, and optional PAD checks run as separate recorded checks.
4. Incomplete/unavailable source checks produce pending/review/blocked; exceptions enter authorized human review.
5. An assertion is returned only if approved policy passes. It is audience/client bound, expiring, replay resistant, revocable, verifiable, and scoped; a callback alone is not proof.

**Stops/controls:** No production biometrics until independent performance/PAD, privacy, legal, licensing and extension approvals. KYC selfie is separate from print-photo proposal.

## 3. First-time passport application

1. Authenticated citizen selects first-time service; service explains that the current official instructions require an in-person scheduled appointment.
2. The application uses the approved source-form version and collects only approved fields; eligibility, age and citizenship rules are versioned.
3. Applicant uploads private evidence, records separate consent/declarations, invites guardian (for ages 16–17) and recommender to act as themselves, and supplies references where required.
4. System runs approved completeness and evidence checks without treating OCR as authenticity proof; applicant reviews a submission snapshot.
5. If remote submission is not approved, the product can only present an approved preparation/appointment path and must not imply legal completion. After any authorized submission, it records immutable snapshot/version, receipt and event history.

**Stops/controls:** Prior TT passport/travel-document history is assessed rather than silently treated as first-time eligibility. Applicant's preferred office is not a processing promise.

## 4. Applicant corrections

1. Authorized reviewer identifies missing or conflicting information and records a safe reason and requested correction.
2. Applicant receives a scoped request and may submit a new version of the affected field/evidence; prior versions remain in history.
3. System revalidates only affected rules, preserves the submitted snapshot, and returns the case to the approved queue.

**Stops/controls:** Correction is not rejection. No deletion or overwrite of evidence history; no sensitive reviewer notes exposed to the applicant.

## 5. Office routing

1. Applicant records an eligible office preference from an approved capability/jurisdiction directory.
2. Backend checks jurisdiction and service capability; stores preferred office separately from intake, processing, issuing, and fulfilment offices.
3. Authorized routing policy assigns actual office or a human review queue; transfers are re-authorized and audited.

**Stops/controls:** Browser-supplied office IDs are not trusted. Overseas residence or unavailable records do not cause automatic rejection.

## 6. Supervisor assignment

1. Supervisor authenticates through the approved staff Security Provider and receives only queues within authorized office/mission scope.
2. Supervisor claims/assigns work to a qualified staff member under current role, office, case assignment and workflow-state rules.
3. Backend records assignment actor, recipient, time, reason and prior/new assignment with concurrency protection.

**Stops/controls:** Cross-office/mission assignment needs explicit permission; assignment conflicts are rejected and audited.

## 7. Staff review

1. Assigned staff member opens only the assigned case and permitted evidence via server-authorized retrieval.
2. Staff checks form/version, evidence presence, source-check status, guardian/recommender/reference evidence, declarations, and exception flags.
3. Staff records recommendations, correction request, escalation, or review completion. Every action rechecks permission and current state.

**Stops/controls:** No staff action relies on hidden buttons; access to sensitive evidence and denied requests is audited without copying raw evidence into logs.

## 8. Risk-based approval

1. Approved policy classifies routine, enhanced-review, or security-hold paths using authorized evidence and configured policy version.
2. Routine case is approved only by a currently authorized officer after all mandatory checks pass.
3. Enhanced case is independently decided by a different authorized officer than the recommender/reviewer.
4. Security hold is an independent blocking flag; only designated authority can clear it.

**Stops/controls:** No invented score/threshold. Policy/source unavailable means hold or review. Approval does not issue or release a passport.

## 9. Rejection and reconsideration

1. Authorized decision-maker selects an approved basis and records reason, evidence references, policy version and notice.
2. Citizen receives only approved safe notice and any available correction/reconsideration path.
3. Any review/appeal is opened only under an approved legal/policy procedure and assigned to an appropriately independent decision-maker.

**Stops/controls:** No universal appeal right, deadline or rejection ground is inferred. Correction, rejection, administrative review and appeal remain separate outcomes.

## 10. Payment

1. Policy service determines whether a fee is due and at which approved step using effective-dated schedule and applicant/service context.
2. Wappler Server Connect initiates with an approved provider and idempotency reference; no cardholder data is stored by this platform unless specifically approved.
3. Server-to-server confirmation/callback is authenticated, replay-protected and reconciled; browser redirect is informational only.
4. Settlement, refunds, reversals and reconciliation are separate ledger events and do not change substantive case decisions.

**Stops/controls:** No live transactions until provider, environment, fee and test scenario are approved. Use decimal/minor units, never floating-point money.

## 11. Passport production and issuance

1. A separately authorized production queue receives a legally approved case.
2. Authorized staff manually record production and QC events, custody and exception status; no printer control is assumed.
3. Issuance is recorded only by the designated legal authority with the official number sourced from the approved process.

**Stops/controls:** Never generate, reserve or guess legal passport numbers. Production, QC and issuance are separate; issuance does not permit release.

## 12. Domestic collection

1. Eligible office pickup is selected under approved location/service policy.
2. Item is transferred through recorded custody to the office; recipient identity and any representative authority are verified at handover by authorized staff.
3. Release event records item, recipient, authority, actor, time and proof; delivery/receipt is confirmed under approved policy.

**Stops/controls:** No release solely because the applicant logged in or the case was issued. Missing authority or ID mismatch blocks handover.

## 13. TTPost delivery

1. Authorized staff request a documented TTPost service for an eligible item and territory.
2. Item enters a reconciled dispatch manifest with custody handover and approved recipient/address data.
3. Authenticated carrier events update transport custody; proof of delivery and recipient-authority requirements are separately evaluated.

**Stops/controls:** No assumed API, endpoint, coverage or manual fallback. A carrier `delivered` event alone is not legal handover confirmation. Reconcile lost/duplicate/missing events.

## 14. Overseas mission collection

1. Approved policy determines eligible mission and jurisdiction; a mission user accesses only authorized cases/items.
2. Shipment or transfer to mission records item-level custody, manifest and acceptance.
3. Mission officer verifies applicant or separately authorized representative, records handover evidence and closes custody event.

**Stops/controls:** Foreign Affairs/Immigration authorization, local privacy rules and mission capability are prerequisites. No shared global case visibility.

## 15. International courier delivery

1. Policy and approved carrier service zone establish eligibility; applicant selects only an available option.
2. Authorized staff hand over an individually reconciled passport item to approved carrier custody and record manifest/event references.
3. Authenticated callback events are verified for signature, state order, replay and idempotency.
4. Final delivery is confirmed only after approved proof and identity/authority checks; discrepancy enters security exception workflow.

**Stops/controls:** Drivers are transport custodians, not ultimate passport recipients. No automatic replacement for lost, damaged or unaccounted items.

## Workflow-wide controls

- Enforce permission + tenant/client + office/mission + assignment + current workflow state + policy at every backend operation.
- Recheck sensitive authorization server-side and cover denied/altered-ID/cross-office/cross-tenant paths with negative API tests.
- Use transactions for related decisions, history and audit writes; use idempotency and concurrency controls.
- Use safe, non-sensitive errors; include rollback, failure recovery and audit evidence before runtime acceptance.
