# Project Charter — TTPASSPORT

**Work package:** TTP-01A (Stage 1A)
**Version:** 1.0
**Baseline date:** 22 November 2026
**Status:** Development complete; owner technical review pending

## Purpose

Establish a secure, auditable online service for Trinidad and Tobago citizens to prepare and track passport services, with a Wappler-maintainable application and a reusable identity-verification platform. The first planned citizen service is a first-time passport application for applicants aged 16 and over, including citizens living in Trinidad and Tobago and citizens living overseas.

The GUI baseline is a presentation-only prototype. This charter and the Stage 1 documents define the intended product and its constraints; they do not authorise backend processing, legal equivalence for online procedures, production use, or government deployment.

## Intended operator and stakeholders

- **Intended operator:** Immigration Division, Ministry of Homeland Security. The project does not claim that the Division or Government has approved this platform or remote passport issuance.
- **Owner:** Human solution owner and authorised government stakeholders.
- **Applicants:** Trinidad and Tobago citizens aged 16+, locally resident or overseas. The identity and service policy for any applicant must follow verified official rules.
- **Government staff:** Proposed Administrator, Supervisor, and Staff roles, subject to approved job functions and delegated authority.
- **Future partners:** Civil Registry and other authoritative record owners, approved identity/biometric providers, payment provider, TTPost, overseas missions, and eligible couriers. None is an active technical integration at this baseline.

## Objectives

1. Provide a versioned, accessible first-time application experience that maps to current official forms and instructions.
2. Keep account authentication, identity proofing, citizenship eligibility, case approval, legal issuance, release authority, and delivery confirmation as separate controls.
3. Build a reusable eKYC/Identity Verification Platform (IVP) with a passport client boundary, tenant/client isolation, and a future standalone deployment path.
4. Support policy-controlled review by Immigration staff, independent review for defined exceptions, auditable decisions, and separate production, issuance, release, and fulfilment records.
5. Support configurable fee policy, reconciliation, domestic TTPost delivery, authorised collection, and approved overseas fulfilment without inventing providers or capabilities.
6. Preserve Wappler GUI maintainability for ordinary runtime behavior and use approved extensions only where specialized functions require them.

## Scope

### Intended initial release

- Citizen accounts, profiles, drafts, notifications, and tracking.
- First-time applications for applicants aged 16+; guardian consent workflow for applicants aged 16–17 when approved.
- Supporting-document intake, applicant declarations, recommender/reference workflows, and evidence versioning.
- Reusable IVP capabilities and isolated, authenticated interfaces, subject to the extension approval gate.
- Eligible office preferences and jurisdiction-aware intake/routing.
- Administrator, Supervisor, and Staff workspaces; assignment, review, correction, risk routing, and authorised decisions.
- Configurable payments and financial reconciliation, separate from substantive decisions.
- Manual production and issuance event recording; release and fulfilment custody controls.
- Citizen status tracking, notices, reporting, audit, security, and operational evidence.

### Future capability

- Passport renewal stream as a distinct service category with its own verified rules.
- Standalone IVP deployment for other authorised client systems.
- Additional service categories only after owner approval and a separately baselined package.

## Exclusions for this baseline

- Passport processing or issuance, eKYC checks, payment transactions, case approvals, courier transactions, or production deployment.
- Replacement of any in-person legal or operational requirement with online completion without explicit approval.
- Passport printer control, creation or reservation of passport numbers, or realistic passport credentials.
- Live integrations, real identity evidence, biometric processing, real financial transactions, or public exposure of staff screens.
- New Express business routes, alternate authentication, an ORM, runtime SQL, unapproved packages/services, or changes to Wappler runtime files.
- Selecting a production database host/schema, creating a database, executing migrations, or changing the current Wappler connection.

## Confirmed owner decisions and pending decisions

| Topic | Confirmed direction | Pending approval or evidence |
|---|---|---|
| Operator | Immigration Division is the intended operator | Government sponsorship, operating authority, service ownership, and deployment approval |
| First-time age | Applicants aged 16+ are in scope | Approved evidence and policy for age calculation and age 16–17 consent |
| Local and overseas applicants | Both are in the intended model | Remote service legality, overseas mission processes, residency and jurisdiction rules |
| Online proofing | Fully online service is a target | Current official instructions require an in-person appointment; legal, identity, and biometric approval is required before changing this |
| eKYC | Project will build its own reusable IVP | Data controller/processor roles, approved evidence/source checks, assurance policy, and any specialist extension approval |
| Fees | Timing and fee rules must be configurable | Government-authorised fee schedules, exemptions, payment provider, and policy timing |
| Decisions | Risk-based review; defined exceptions require a different authorised decision-maker | Delegations, risk policy, rejection bases, reconsideration/appeal rules |
| Production and release | Manual event recording initially; issuance and release are distinct | Legal powers, passport-number handling, QC, recipient/representative controls |
| Delivery | TTPost is preferred domestically; approved overseas options are contemplated | Actual documented service capabilities, contracts, geographic zones, API/callback specifications |
| Platform | Wappler-first, GUI-maintainable; MySQL is a proposed operational target | Owner approval, server version, hosting, driver compatibility, and migration plan |

## Success measures for later acceptance

- Every service rule and field is mapped to a current approved source or explicitly routed for human decision.
- Every sensitive action is enforced server-side by permission, office/jurisdiction, assignment, workflow state, and policy.
- Account, IVP, application, issuance, fulfilment, and finance data boundaries are auditable and independently testable.
- Accessibility, responsive behavior, failure recovery, data retention, security, and rollback criteria have evidence before release.
- Human GUI acceptance and owner closure are recorded separately from command tests and government approvals.

## Dependencies and constraints

See [`../governance/LEGAL_AND_POLICY_DEPENDENCIES.md`](../governance/LEGAL_AND_POLICY_DEPENDENCIES.md), [`../integrations/INTEGRATION_REGISTER.md`](../integrations/INTEGRATION_REGISTER.md), and [`../architecture/SOLUTION_ARCHITECTURE.md`](../architecture/SOLUTION_ARCHITECTURE.md). The official instructions currently state that applicants must appear in person for their scheduled appointment. Any digital equivalent is a policy and legal decision, not an implementation assumption.

## Approval record

This charter is a Stage 1 deliverable. Owner technical review of the foundation is pending; no Stage 2 implementation is authorised by this document.
