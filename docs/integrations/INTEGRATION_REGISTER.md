# Integration Register

**Work package:** TTP-01F (Stage 1F)
**Version:** 1.0
**Baseline date:** 22 November 2026
**Status:** Candidate dependency inventory; no production or sandbox integrations configured

All external systems are unconfirmed until a named owner, lawful basis, contract, interface specification, access, environment, support model and test evidence are approved. No provider URL, endpoint, schema or credential is invented here.

| ID | Candidate system / capability | Proposed purpose | System owner / dependency | Required interface and data | Security, availability and controls | Status |
|---|---|---|---|---|---|---|
| INT-001 | Government identity records | Authoritative identity resolution or document/record verification | Government record owner unknown; Immigration authority required | Versioned, documented query or verification contract; minimum necessary attributes and stable source references | Strong service authentication, least privilege, encryption, source audit, rate limits, timeout, denial/failure semantics, reconciliation | UNCONFIRMED; access and legal basis absent |
| INT-002 | Civil Registry | Verify birth, marriage, adoption, citizenship-related civil records where authorised | Civil Registry owner and legal/data-sharing agreement unknown | Approved source query/response, record status, correction path, source timestamps | High-impact PII controls, exact matching policy, audited reads, false-match handling, source availability contract | UNCONFIRMED |
| INT-003 | Immigration passport records | Detect prior TT passports/travel documents and support case adjudication | Immigration Division record owner; interface unknown | Authorised search by approved identity attributes with reviewable source evidence | Staff authorization, office scope, safe no-match semantics, audit, duplicate/conflict review | UNCONFIRMED |
| INT-004 | Biometric/document technology | Optional capture quality, OCR, face comparison, presentation attack detection (PAD) within IVP | No provider selected; government approval and extension gate required | Isolated, versioned IVP adapter contracts; evidence references and explicit checks/results | No unapproved external biometric SaaS or evidence transfer; independent efficacy/PAD evaluation, licensing, privacy, model/version provenance, retention and secure error handling | BLOCKED pending Extension Request and policy approval |
| INT-005 | Payment provider / settlement service | Initiation, authorisation/capture, settlement, refund and reconciliation | Provider and finance owner unknown | Approved server-to-server APIs/webhooks, immutable transaction refs, daily settlement files/API | PCI responsibility boundary, signing keys outside source control, authenticated callbacks, idempotency/replay defense, DECIMAL/minor units | UNCONFIRMED; no provider or fees approved |
| INT-006 | TTPost | Proposed domestic passport delivery and custody updates | TTPost capability/contract/technical owner must confirm | Documented approved shipment/manifest/events interface, if any; no endpoint assumed | Authenticated custody events, recipient controls, reconciliation, duplicate/replay defense, incident/lost-item process | PROPOSED; no verified API/coverage/service contract |
| INT-007 | Overseas missions / Foreign Affairs | Mission collection and authorized local support for overseas applicants | Ministry of Foreign and CARICOM Affairs and Immigration owners unknown | Approved mission/service directory, jurisdiction, assignment, pickup, recipient and audit contract | Cross-border access basis, office isolation, identity/authority verification, local incident and retention controls | UNCONFIRMED |
| INT-008 | Overseas courier services | Approved international transport where allowed | Carrier/territory and government procurement owner unknown | Documented service-zone, label, tracking, custody and proof-of-delivery contracts | No driver treated as passport recipient; authenticated callbacks, signature/evidence protection, reconciliation and lost-item response | UNCONFIRMED; no courier selected |
| INT-009 | Email/SMS service | Account verification, notifications, and safe status updates | Government communications owner/provider unknown | Approved transactional message provider contract and message templates | No sensitive identity/status detail in messages, secret management, delivery failure/retry, abuse limits, consent and localization | UNCONFIRMED |
| INT-010 | Government hosting, secrets, audit/monitoring | Runtime deployment, private files, key management, observability and incident response | Hosting/security owner not identified | Approved environments, secret manager, storage API, audit export, monitoring/alert contracts | Residency, encryption, least privilege, backups, restore test, logging minimization, break-glass audit | UNCONFIRMED; current local Development only |

## Integration boundary requirements

- Keep provider adapters behind versioned, documented contracts and narrow Wappler Server Connect entry points.
- Treat a timeout or unavailable required authoritative source as pending/review/blocked per approved policy, never as a successful check.
- Use synthetic or explicitly authorised test fixtures. No real personal evidence is to be sent to an unapproved endpoint.
- Record provider version, policy version, request/response reference, actor/client context, timestamp, idempotency key and safe outcome; never log tokens or raw identity/biometric data.
- Separate `MOCK / NON-PRODUCTION`, live sandbox, and production evidence. A mock does not prove acceptance or issue a production-grade assertion.
- Any specialised OCR, biometric/PAD, cryptographic, reliable-queue, or provider SDK gap must go through the Section 3 Extension Request process in root `AGENTS.md` before implementation.
