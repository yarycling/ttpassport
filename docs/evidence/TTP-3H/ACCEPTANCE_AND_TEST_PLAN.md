# Stage 3H — Liveness Integration Test Plan

**Package:** Stage 3H — Narrow non-production desktop liveness integration<br>
**Owner approval:** TTPASSPORT Stage 3H approval, 2026-11-24<br>
**Starting commit:** `82816c5f84c593ee38ac629ecd5ec78cd208578b`
**Candidate:** `open-face-liveness` v0.1.0, commit `740b0a885d8a032e1e6c5370bddd8e09d5d0c0fa`

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC-3H-001 | The approved candidate runs from locally hosted browser assets through a Wappler-compatible App Connect component; no remote runtime/model/CDN requests or camera frame uploads are introduced. |
| AC-3H-002 | A real camera session executes the candidate’s active movement prompts and passive spoof sampling. The stored status describes execution only; no threshold, anti-spoof accuracy, identity or citizenship decision is invented. |
| AC-3H-003 | A native Wappler Server Connect action requires an authenticated account, owned session, current explicit consent and an existing LIVENESS check before storing the minimal client-reported result. |
| AC-3H-004 | Denied/cancelled camera access, model failure, unusable/incomplete video and failed persistence cannot be recorded as a completed run; retry remains available. |
| AC-3H-005 | Existing OCR, human correction, selfie upload and YuNet/SFace comparison continue to work. Identity and citizenship remain `REVIEW_REQUIRED`; no IVP schema migration is added. |
| AC-3H-006 | The changed capture/results screens work at 1440, 1024, 768 and 375 px, support keyboard use, show no new console/resource errors, and retain screenshots. |

## Command and browser tests

| Test ID | AC mapping | Method / evidence |
| --- | --- | --- |
| CT-3H-001 | AC-3H-001 | Parse changed Wappler JSON, syntax-check App Connect component, verify candidate commit/license notices and that all generated model/WASM requests are same-origin local assets. |
| CT-3H-002 | AC-3H-001, AC-3H-005 | Verify the existing Wappler Development app responds on port 3002 and all 15 accepted GUI routes remain available. |
| CT-3H-003 | AC-3H-001 | Browser-load the actual pinned candidate and local model/WASM assets; verify model initialization without camera access or external transfer. |
| CT-3H-004 | AC-3H-003, AC-3H-005 | With the approved synthetic test account, save a bounded experimental result through the native Wappler Server Connect action and verify IVP status/details and unchanged overall review status. |
| CT-3H-005 | AC-3H-003 | Verify guest access, another account’s session, missing current consent and altered session IDs cannot save a result. |
| CT-3H-006 | AC-3H-004 | Verify incomplete claimed completion is rejected; exercise denial/cancel/model-unavailable/unusable paths where browser tooling permits. |
| CT-3H-007 | AC-3H-006 | Playwright capture-screen responsive, keyboard, accessibility labels, console, failed-resource and screenshot checks at all required widths. |
| CT-3H-008 | AC-3H-002 | Integrated desktop camera run with actual video; record challenge completion and actual passive outputs. If physical interaction/access is unavailable, mark `BLOCKED` and do not infer success from headless tests. |
| CT-3H-009 | AC-3H-005 | Run existing synthetic OCR/selfie/face-comparison regressions affected by the consent/layout/action changes. |
| CT-3H-010 | AC-3H-002, AC-3H-004 | Attempt local screen-replay presentation where feasible; incomplete replay is `INCONCLUSIVE`, not a liveness pass or accuracy claim. |

## Test boundaries

- No passport application, government integration, legal identity assertion or citizenship decision is in scope.
- `COMPLETED` means the candidate returned its configured active movement sequence and passive model samples; it does not mean “live person passed”.
- The browser result is untrusted, client-reported and marked experimental/non-production. Camera video and frames remain in the browser.
- Physical mobile-camera acceptance remains deferred and untested.
- Rollback is to restore the files changed in this package and remove the added local static candidate asset directory; the existing LIVENESS row and database schema remain usable with `NOT_PERFORMED`.
