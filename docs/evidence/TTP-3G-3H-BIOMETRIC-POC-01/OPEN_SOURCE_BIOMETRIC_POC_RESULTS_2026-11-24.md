# Open-source biometric POC results — 2026-11-24

**Scope:** Owner-authorized local, non-production comparison experiment. Starting commit: `9b6c6ac2e86d687f3888ef93cd058463db56f479`. Stage 3G remains `TESTING`; Stage 3H is `BLOCKED` after the reviewed liveness candidate failed the compatibility and capability gate. Human acceptance is pending.

## Acceptance criteria

- **AC-3G-003:** Run genuine 1:1 face similarity locally between one portrait in a clearly marked non-official specimen and a separate selfie. Report the provider, model, exact score and errors. Do not configure a match threshold or claim a match.
- **AC-3G-004:** Invoke comparison through the Wappler Server Connect extension boundary, using only current-client, current-session, owner-scoped private evidence and the new face-processing consent version. Persist results in existing `ivp_checks`; keep session, identity and citizenship `REVIEW_REQUIRED`.
- **AC-3H-001:** Evaluate one liveness candidate independently. Keep liveness `NOT_PERFORMED` unless compatible genuine live/spoof testing can be performed without treating a still-image classifier as proof of liveness.

## Go/no-go findings

### YuNet + SFace — GO for local POC only

- Pinned source: OpenCV Zoo commit `48b10fa505aeb51fbd127fc60a5c660040e823b7`.
- YuNet `face_detection_yunet_2023mar.onnx`: MIT license in its model directory; SHA-256 `8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4`. The Zoo README links the model to Shiqi Yu's `libfacedetection.train` source and WIDER Face validation results.
- SFace `face_recognition_sface_2021dec.onnx`: Apache-2.0 license in its model directory; SHA-256 `0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79`. The Zoo README identifies Yaoyao Zhong's contribution, MobileFaceNet/SFace loss, the research paper and ONNX conversion from the original code. It does not identify the training dataset; this provenance gap prohibits any production or government deployment clearance claim.
- Runtime tested on macOS 15.2 ARM64 with isolated Python 3.9.6 ARM64, `opencv-python-headless==4.11.0.86` (OpenCV 4.11.0) and NumPy 2.0.2. The wheel installed and both models executed on this host. Wrapper distribution license: MIT; OpenCV library: Apache-2.0; NumPy: BSD-3-Clause. No Node application dependency was added.
- The two models are fetched from the pinned Zoo revision into ignored local `storage/ivp_dev/models/`; `tools/fetch-face-poc-models.sh` verifies both hashes. No model weights or adult images are committed.
- The adapter reads files beneath the private IVP evidence root, detects exactly one face in each input, computes OpenCV SFace cosine similarity, records provider/model/evidence references, and returns no match classification. A `COMPLETED` check means only that a numeric calculation ran. No external document transfer or outbound request exists in the inference path.

### Faceplugin liveness candidate — NO-GO for this milestone

- The reviewed repository commit was `d17efe7dd1bd94d4ddf35dd32ffb78fcca808d24`; repository license is MIT No Attribution (MIT-0), and its README applies that license to source and trained weights. `weights/liveness.hdf5` is 32,111,648 bytes; SHA-256 `3959f4d4979a1943f99bbb24fa77d07d2844abea2388524ba0d4bee887e121ca`.
- Dependencies are TensorFlow `>=2.16` and `opencv-python`. The README requires Python 3.10+ and lists Windows/Linux, not macOS. This Development host is Python 3.9.6 ARM64; the candidate's Mac ARM support was not established, and installing TensorFlow would be an additional large runtime dependency.
- The model classifies a **single still image** and returns a spoof score. Its code reads and resizes the whole image without face detection; its README gives an example default threshold of `0.10`. That is not a temporal or challenge-based live-capture check and the example threshold is not an approved policy. No attack/replay images were supplied for a genuine spoof test.
- No liveness dependency or weight was installed or run. The existing Wappler check remains `NOT_PERFORMED`; use a sequence-based, locally compatible candidate and consented live/photo-replay test set in a separately authorized increment.

## Test results

| Test ID | Acceptance | Result | Evidence |
|---|---|---|---|
| CT-3G-003 | AC-3G-003 | PASS — focused local adapter suite, 8/8; matching/nonmatching pairs, no face, invalid and low-resolution files, traversal, missing models, repeatability and no threshold assertion | `tests/face-poc/test_adapter.py`; exact private outputs in `private/adapter-results.json` |
| CT-3G-004 | AC-3G-004 | PASS — Wappler selfie upload called the extension, persisted `FACE_COMPARISON` and evidence references, left `LIVENESS` `NOT_PERFORMED` and the session `REVIEW_REQUIRED` | `tests/gui/ekyc.spec.mjs`; exact private record in `private/wappler-integration-result.json` |
| CT-3G-005 | AC-3G-004 | PASS — 2 eKYC Playwright flows; 1440, 1024, 768 and 375 px; no horizontal overflow; keyboard focus and page-error checks passed | Private screenshots: `private/screenshots/face-results/` |
| CT-3G-006 | AC-3G-004 | PASS — Wappler JSON/HJSON, Python/JavaScript syntax, port 3002, SQLite `db`, 15-route inventory, owner-isolation/browser regression, secret scan, private-file URL denial and unavailable-runtime fallback | `npm run test:config`, `npm run test:api:inventory`, `npm run test:security`; `/storage/...` returned 404 |
| CT-3G-007 | AC-3G-004 | PASS WITH EXPECTED CONTENT CHANGE — screenshot diff against accepted Stage 3E results baseline: common-area change 2.31% at 1440, 2.92% at 1024, 3.78% at 768 and 4.94% at 375. Differences are the consent, descriptive score and liveness limitation text; responsive check found no overflow. Baseline was not replaced. | Private current screenshots compared with `docs/evidence/TTP-3E/screenshots/results/` |
| CT-3H-001 | AC-3H-001 | PASS — repository/licence/dependency/platform review supports the no-go decision | This report; upstream Faceplugin README, requirements, source and weight hash |
| CT-3H-002 | AC-3H-001 | BLOCKED / NOT PERFORMED — no genuine live/spoof classification executed because this candidate is a single-image classifier, Mac ARM64 support is undocumented, and no replay samples were supplied | Liveness remains `NOT_PERFORMED` |

Repeatable local methods: run `"$IVP_FACE_PYTHON" tests/face-poc/test_adapter.py` with `IVP_FACE_EVIDENCE_ROOT` and `IVP_FACE_MODEL_DIR` pointing to the ignored local samples and pinned models; run `npm --prefix tests run test:gui -- gui/ekyc.spec.mjs` with the private synthetic specimen and selfie paths set as `IVP_FACE_TEST_DOCUMENT_PATH` and `IVP_FACE_TEST_SELFIE_PATH`. Both methods were executed against local Wappler Development; their generated numeric results and screenshots remain in ignored private storage.

The pre-existing `CT-3G-001` flow remains covered by the passing eKYC browser regression. `CT-3G-002` physical mobile-camera behavior remains blocked pending owner execution on a device; this POC did not claim a physical camera test.

`npm run test:visual` also passed its existing four home/back-office baseline comparisons. These do not replace the affected verification-results comparison recorded above.

## Data, GUI and rollback

- Consent version is now `TTP-DEV-CONSENT-1.1-FACE-POC`; older sessions do not run comparison. The updated text identifies local face-similarity processing and its limits.
- Existing Wappler `ivp` connection, IVP schema, database configuration, port 3002, 15 GUI routes and generated runtime files are unchanged. The existing pre-created `FACE_COMPARISON` and `LIVENESS` check rows are updated through native Wappler database actions; no migration or new API route was added.
- Private samples, models, scores, integration JSON and result screenshots are excluded by `.gitignore`. The database has only local Development test records; no real identity document or production source was used.
- Rollback: revert the extension, Server Connect action wiring, consent copy/version, result binding and scoped CSS. Existing local test check records remain in the Development DB as test evidence; do not delete or reset the database as part of source rollback.

## Source references

- [OpenCV Zoo YuNet README and model source](https://github.com/opencv/opencv_zoo/tree/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_detection_yunet) · [YuNet MIT license](https://github.com/opencv/opencv_zoo/blob/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_detection_yunet/LICENSE)
- [OpenCV Zoo SFace README and model provenance](https://github.com/opencv/opencv_zoo/tree/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_recognition_sface) · [SFace Apache-2.0 license](https://github.com/opencv/opencv_zoo/blob/48b10fa505aeb51fbd127fc60a5c660040e823b7/models/face_recognition_sface/LICENSE)
- [OpenCV Python headless 4.11.0.86 package](https://pypi.org/project/opencv-python-headless/4.11.0.86/)
- [Faceplugin liveness repository](https://github.com/Faceplugin-ltd/Open-Source-Face-Liveness-Detection-SDK) · [requirements](https://github.com/Faceplugin-ltd/Open-Source-Face-Liveness-Detection-SDK/blob/main/requirements.txt) · [MIT-0 license](https://github.com/Faceplugin-ltd/Open-Source-Face-Liveness-Detection-SDK/blob/main/LICENSE)
