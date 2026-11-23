# Business Requirements

**Work package:** TTP-01B (Stage 1B)
**Version:** 1.0
**Baseline date:** 22 November 2026
**Status:** Requirements baseline drafted; owner and government validation pending

Requirements below describe intended capabilities, not approved legal rules or implemented behavior. Package mappings use stable stage/package IDs from [`../PROJECT_ROADMAP.md`](../PROJECT_ROADMAP.md). Detailed per-package titles are used only where the owner supplied them for Stage 1.

| ID | Requirement | Roadmap mapping | Acceptance evidence / caveat |
|---|---|---|---|
| BR-001 | The service shall keep citizen account authentication separate from identity proofing and passport eligibility decisions. | 4A–4G, 3A–3L, 15A–15H | Separate server-side policies and negative access tests |
| BR-002 | A citizen shall be able to register and manage a profile, using approved recovery and verification rules. | 4A–4G | Account policy, account recovery, abuse and expiry tests pending approval |
| BR-003 | The citizen shall be able to create, save, resume and withdraw an eligible draft where policy allows. | 4A–4G, 5A–5K | Wappler-native forms/state; no drafts implemented in current GUI |
| BR-004 | The service shall support local and overseas citizen applicants without assuming the same office, address, proofing or fulfilment path. | 4A–4G, 5A–5K, 6A–6G | Jurisdiction and cross-border policy required |
| BR-005 | The reusable IVP shall support tenant/client-scoped identity-verification subjects, sessions, evidence references, checks, reviews and assertions. | 3A–3L, 18A–18G | IVP boundary and assertion contract require separate approved baseline |
| BR-006 | The IVP shall distinguish identity resolution, document validation, person-to-evidence checks and citizenship eligibility. | 3A–3L, 5A–5K | No single OCR, face-match, liveness or account signal may mark legal identity/citizenship verified |
| BR-007 | Each verification result shall record approved policy/provider/version, checks, timestamps, evidence references and review disposition. | 3A–3L, 15A–15H | Do not collect unsupported sensitive confidence data; retention policy required |
| BR-008 | Unavailable or incomplete required evidence/source checks shall remain pending, review-required or blocked under approved policy; they shall not become a pass. | 3A–3L, 15A–15H | Negative provider/failure tests required |
| BR-009 | The first-time service shall be a separate application category for citizens aged 16 and over; renewal and lost/replacement flows shall not be conflated with it. | 5A–5K, 13A–13I | Age 16–17 consent and eligibility policies require approval |
| BR-010 | The application shall preserve source-form version, field mappings, declarations, evidence versions, submission snapshot and later correction history. | 5A–5K | Versioned schema and append-oriented event history required |
| BR-011 | The application shall collect names and name history, personal details, addresses, citizenship basis, prior travel-document history, recommender and references only as supported by the approved form/policy. | 5A–5K | See form map; requiredness for blank paper fields is not inferred |
| BR-012 | The service shall collect a proposed passport photograph separately from KYC/selfie/liveness evidence. | 3A–3L, 5A–5K | Camera, quality checks, retention and print-photo rules require approval |
| BR-013 | The service shall validate uploaded files for approved format, content, size and malware, keep originals and link each version to a case/evidence owner. | 3A–3L, 5A–5K | Private storage only; upload implementation is not authorized here |
| BR-014 | Applicant declarations, recommender declarations and guardian permission shall be attributed to the corresponding person and retained as evidence. | 5A–5K | Electronic-signature equivalence and guardian authentication pending legal approval |
| BR-015 | A recommender or guardian shall act as themself through an approved flow; an applicant may not impersonate them. | 4A–4G, 5A–5K, 15A–15H | Identity, consent, recovery and link-expiry tests required |
| BR-016 | Applicant-selected office shall be a preference limited to eligible choices; intake, processing, issuing and fulfilment locations shall be tracked separately. | 6A–6G, 7A–7J | Government office capability and jurisdiction data required |
| BR-017 | Staff access shall require an approved Wappler Security Provider and server-side role, office/mission jurisdiction, assignment, workflow-state and policy checks. | 7A–7J, 15A–15H | Hiding UI controls is insufficient; role/office/IDOR negative tests required |
| BR-018 | Administrator, Supervisor and Staff shall be primary back-office categories with granular permissions assigned separately. | 7A–7J | Approved privilege matrix and independent controls required |
| BR-019 | Supervisors shall be able to manage authorised office queues and case assignments; staff shall handle assigned work only. | 7A–7J | Assignment concurrency and audit tests required |
| BR-020 | The workflow shall support routine cases, enhanced review, security holds and independent decision-maker controls. | 7A–7J, 15A–15H | Risk policy and authority matrix pending; no invented risk thresholds |
| BR-021 | Corrections, rejection, reconsideration and any appeal shall be distinct workflow outcomes with approved notice and authority. | 5A–5K, 7A–7J | No universal appeal right or rejection basis assumed |
| BR-022 | Payment timing, fees, exemptions, refunds and settlement shall be policy-configured, effective-dated and auditable. | 8A–8H | Provider and government fee rules unconfirmed; no live transactions |
| BR-023 | Browser redirects shall not be treated as proof of payment; approved provider callbacks/reconciliation shall be authenticated and idempotent. | 8A–8H, 14A–14G | Provider contract and sandbox required |
| BR-024 | Production, quality control, legal issuance, release authorisation and physical delivery shall be separate events/states. | 9A–9H, 10A–10K | No printer control, invented passport numbers, or automatic release |
| BR-025 | The system shall support approved domestic office pickup, TTPost delivery, overseas mission pickup, approved international courier and authorised representative release when policy permits. | 10A–10K | Actual capabilities, territory, recipient authority and contracts required |
| BR-026 | Passport custody records shall reconcile each physical item through controlled production, QC, issuance, dispatch, handover and exception handling. | 9A–9H, 10A–10K | Lost/damaged/unaccounted items require security exception; no auto-reissue |
| BR-027 | Citizen tracking and notifications shall expose only safe, applicant-authorized statuses and shall not reveal internal risk/investigation flags. | 11A–11F | Opaque references and object-level authorization required |
| BR-028 | Operational and analytical reports shall use least-privilege access, privacy-safe aggregation and audited exports. | 12A–12F, 15A–15H | Reporting purposes and disclosure rules pending |
| BR-029 | Audit events shall record actor, time, action, subject reference, source, prior/new state and safe reason without embedding sensitive identity/biometric/payment data in generic logs. | 15A–15H, all workflow packages | Event integrity, retention and access policy required |
| BR-030 | The application shall use responsive, accessible, keyboard-operable flows with visible errors and resilient save/retry behavior. | 4A–4G, 5A–5K, 7A–7J, 16A–16I | Human GUI acceptance is closed for presentation baseline; functional accessibility acceptance remains future |
| BR-031 | A future renewal service shall remain separately versioned, with its own verified eligibility, evidence and fee rules. | 13A–13I | Future release only; not included in initial stream |
| BR-032 | Integration failures, timeouts and unavailable authoritative sources shall have safe, auditable recovery paths without false success. | 3A–3L, 8A–8H, 10A–10K, 14A–14G | Contract-specific failure tests required |

## Actors

- Citizen applicant; applicant aged 16–17; guardian; recommender; references; authorised representative/recipient.
- Immigration Administrator, Supervisor and Staff, with distinct permissions and jurisdiction/assignment scopes.
- IVP service/client contexts, approved authoritative-source owners, payment provider, TTPost, overseas missions, and approved couriers.

## Acceptance boundary

The current 15-screen GUI is an accepted **visual baseline** only. It has no real account, case, identity, payment, approval, issuance or fulfilment behavior. Human GUI baseline acceptance is recorded in [`../GUI_BASELINE_01.md`](../GUI_BASELINE_01.md); it does not accept these unimplemented requirements or close legal/security dependencies.
