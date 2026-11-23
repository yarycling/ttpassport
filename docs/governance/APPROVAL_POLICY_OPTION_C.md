# Option C — Risk-Based Approval

- **Policy identifier:** `TTP-APPROVAL-OPTION-C`
- **Design version:** 1.0
- **Owner decision:** CONFIRMED
- **Government operational-policy approval:** PENDING
- **Source:** Human-approved TTPASSPORT project design decision
- **Implementation status:** NOT STARTED

## Purpose and status

This document records the project owner's confirmed choice of **Option C — Risk-Based Approval** as the design policy for application review and decision routing. It is a project design decision, not evidence that the Immigration Division or Government has approved operational risk rules, delegated authorities, or legal decision powers.

This policy is a versioned reference for requirements and workflow design. Government policy approval is required for classification triggers, detailed criteria, authority delegation, designated specialist authority, thresholds, and any automated implementation. Until that approval exists, affected operational behavior remains unimplemented and blocked.

## Proposed risk classifications

| Code | Classification | Design treatment |
|---|---|---|
| R0 | Routine | Eligible for single-officer approval by an appropriately authorised officer, after every mandatory verification and eligibility gate passes. |
| R1 | Correction Required | Missing or correctable information must be obtained before a decision. A correction request is not a rejection. |
| R2 | Enhanced Review | Material identity, citizenship, guardianship, or documentary concerns require independent review and a final decision by an authorised decision-maker different from the original recommending/reviewing officer. |
| R3 | Security Hold | Significant integrity or fraud concerns require designated specialist authority. Affected approval, production, and release actions remain suspended until properly resolved. |

The classification is a routing and control label. It does not itself determine an outcome. In particular, R1, R2, or R3 does not automatically reject an application.

## Decision and separation controls

1. A decision-maker must have explicit authority for the action and the case's current jurisdiction, assignment, workflow state, and applicable policy.
2. R0 is eligible for single-officer approval only when every mandatory verification and eligibility gate passes and the officer has explicit decision authority.
3. For R2, the final decision-maker must be a different authorised person from the original recommending or reviewing officer.
4. R3 suspends affected approval, production, and release actions until designated authority resolves the hold under approved policy. A hold is an independent blocking condition, not a destructive rewrite of the case's legal status.
5. A risk classification alone does not require rejection. A rejection requires an authorised decision and a documented legal or policy basis.
6. Application approval, passport production, legal issuance, release authorisation, and physical delivery remain separately controlled actions and records.
7. Technical administrators do not automatically receive or grant themselves legal issuance authority. Administrative access and delegated decision/issuance authority remain separate.
8. No automated passport approval or rejection logic may be activated until the applicable official rules are approved, baselined, and implemented with the required independent controls and tests.

## Government approval still required

The owner-confirmed design does not close `LP-013`. Government operational-policy approval must establish and document at least:

- R0–R3 definitions, detailed triggers, criteria, and any permitted thresholds.
- Officer and specialist qualifications, delegation, jurisdiction, conflicts, and separation-of-duty rules.
- Hold placement, review, clearance, audit, and escalation authority.
- Authorised rejection bases, notices, corrections, and any reconsideration or appeal process.
- Effective date, policy versioning, review cadence, and approved test evidence.

Until these decisions are approved, the classifications remain design guidance only. No risk classifier or automatic decision behavior is implemented by this document.
