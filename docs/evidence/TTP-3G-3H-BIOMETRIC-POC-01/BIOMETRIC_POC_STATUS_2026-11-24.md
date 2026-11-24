# TTPASSPORT eKYC Biometric POC 01 — Status

- **Date:** 2026-11-24
- **Scope:** Stage 3G — Facial Capture and Comparison; Stage 3H — Liveness and Anti-Spoofing
- **Starting commit:** `9b6c6ac2e86d687f3888ef93cd058463db56f479`
- **Status:** `BLOCKED` at the licensing prerequisite; no biometric implementation started.

> **Historical checkpoint, superseded:** This record documents the Luxand-only evaluation before the owner deferred Luxand and authorized the open-source POC. Its statement that implementation had not started is accurate only for that checkpoint. The later implementation, test outcomes, current 3G/3H status and remaining limits are recorded in [OPEN_SOURCE_BIOMETRIC_POC_RESULTS_2026-11-24.md](OPEN_SOURCE_BIOMETRIC_POC_RESULTS_2026-11-24.md).

## Current environment and eKYC baseline

- The accepted Wappler Development app responds on loopback port 3002 (HTTP 200). Node is v23.6.0, ARM64.
- The host is ARM64. The default `/usr/local/bin/python3` is Python 3.13.5 x86_64. `/usr/bin/python3` has an ARM64 slice and runs as Python 3.9.6 when invoked with `arch -arm64`.
- No Luxand `fsdk` Python module or `libfsdk.dylib` was found in the inspected project and standard library locations. No evaluation key was supplied to the workspace.
- Luxand lists FaceSDK macOS ARM64 binaries and a Python wrapper. This establishes a plausible local target, not successful runtime compatibility; the native library has not been loaded or tested. [Luxand downloads](https://www.luxand.com/facesdk/download/) · [Distribution guide](https://www.luxand.com/facesdk/documentation/distribution.php)
- The existing Wappler/IVP workflow records `FACE_COMPARISON` and `LIVENESS` as `NOT_PERFORMED`. The existing `ivp_checks` schema already has `evidence_id`, `status`, `provider_name`, `model_version`, and `details_json`; minimum result persistence may be possible without a schema change, subject to Wappler implementation review. See `migrations/ivp/001_initial_mvp.sql` and `app/api/ivp/session_create.json`.
- No application, database, route, dependency, or GUI changes were made. No image was supplied to or transferred to Luxand. The separately licensed iBeta service remains excluded.

## Licensing gate

Luxand's published trial offer provides an evaluation key by email after a form requiring name, company, business email, and phone; it advertises 14 days followed by $99/month. The offer describes a single-developer, single-machine Developer License and directs server use to Luxand for suitable licensing. The EULA restricts a Developer License to one device that is not a Server. The documents do not clearly say whether a local Python adapter called by Wappler Server Connect on the same development machine is allowed. [Trial terms](https://www.luxand.com/facesdk/trial/) · [FaceSDK EULA](https://www.luxand.com/download/Luxand_FaceSDK_License_Agreement.pdf)

No trial form was submitted, vendor was not contacted, and nothing was purchased or activated. Required decision: obtain written confirmation from Luxand that this specific local-only evaluation topology is permitted and provide an authorized evaluation key, or explicitly authorize a vendor clarification/trial request and provide the business contact details required by the form. No installation or activation should occur before that is resolved. A valid key must be passed to `FSDK_ActivateLibrary`; some keys may be hardware-restricted. [Activation requirements](https://www.luxand.com/facesdk/documentation/activation.php)

## POC acceptance and test map

These additive criteria preserve the existing roadmap IDs and do not close 3G or 3H.

| Acceptance ID | Criterion | Test ID | Actual disposition |
|---|---|---|---|
| AC-3G-003 | Licensed local SDK detects usable portrait/selfie faces and returns an actual 1:1 comparison result; records provider, version, check status and private evidence reference without inventing a threshold. | CT-3G-003 (activation/platform); CT-3G-004 (same-person and non-matching pairs) | BLOCKED — no authorized key or SDK installation. |
| AC-3G-004 | Missing, unusable, and low-quality inputs return clear non-success/error states and cannot create a positive comparison result. | CT-3G-005 | BLOCKED — SDK unavailable. |
| AC-3H-001 | Licensed passive liveness runs on live capture frames and records actual provider result; available print/screen replay attempts are evaluated. | CT-3H-001 | BLOCKED — SDK unavailable; no consented live/replay samples supplied. |
| AC-3G-005 | Wappler Server Connect uses the existing private evidence and owner-scoped IVP records, persists actual outcomes, and degrades truthfully when the adapter is unavailable. Overall session remains `REVIEW_REQUIRED` absent authoritative identity requirements. | CT-3G-006 (integration, persistence, ownership, unavailable-adapter behavior) | BLOCKED — adapter not implemented pending licensing. |
| AC-3G-001 (existing MVP) | Preserve synthetic selfie upload and saved results. | Existing focused eKYC browser test (`CT-3B-001` group, including `CT-3G-001`) | PASS — 1/1 test, 9.6s; details below. |
| AC-3G-002 (existing MVP) | Verify physical-device camera permission/capture/cancel/retry behavior. | CT-3G-002 | BLOCKED — no physical mobile device was available; headless upload is not camera evidence. |

### Executed regression evidence

| Test ID | Environment and method | Expected | Actual | Result |
|---|---|---|---|---|
| Existing CT-3B-001 group, including CT-3G-001 | Wappler Development at `http://127.0.0.1:3002`; `npm --prefix tests run test:gui -- --grep 'CT-3B-001'`; Playwright 1.65.1 | Synthetic session, consent, OCR review, selfie upload, saved results, and ownership flow remain functional. | One browser test passed in 9.6s (10.3s total). | PASS for this existing regression only. |

The test refreshed four tracked screenshot artifacts; those generated changes were restored. Physical camera, SDK matching, liveness/replay, SDK error handling, and Wappler-to-adapter integration were not executed and remain BLOCKED. This run is not device evidence or biometric acceptance.

## Next action

Wait for the licensing decision above. If cleared, use synthetic or expressly consented adult imagery only, implement the narrow local Python adapter and Wappler Server Connect actions, then execute CT-3G-003 through CT-3G-006 and CT-3H-001. Preserve all OCR/session behavior and keep identity/citizenship `REVIEW_REQUIRED`.
