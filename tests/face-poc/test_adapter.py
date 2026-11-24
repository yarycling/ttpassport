"""Focused local tests for the YuNet + SFace adapter.

Requires the model files and consented fixtures described in the POC evidence.
The samples are intentionally not committed.
"""

import json
import os
import subprocess
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
ADAPTER = ROOT / "extensions/server_connect/modules/ivp_face_compare.py"
EVIDENCE_ROOT = os.environ.get("IVP_FACE_EVIDENCE_ROOT", "")
REFERENCE = os.environ.get("IVP_FACE_TEST_REFERENCE", "face-poc-specimen-a.png")
MATCH = os.environ.get("IVP_FACE_TEST_MATCH", "face-poc-match-a.jpeg")
NONMATCH = os.environ.get("IVP_FACE_TEST_NONMATCH", "face-poc-nonmatch-b.jpeg")
NO_FACE = os.environ.get("IVP_FACE_TEST_NO_FACE", "face-poc-no-face.png")
INVALID = os.environ.get("IVP_FACE_TEST_INVALID", "face-poc-invalid.txt")
TOO_SMALL = os.environ.get("IVP_FACE_TEST_TOO_SMALL", "face-poc-too-small.png")


class FaceAdapterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not EVIDENCE_ROOT:
            raise RuntimeError("IVP_FACE_EVIDENCE_ROOT must point to private local evidence fixtures")
        cls.root = Path(EVIDENCE_ROOT).resolve()
        for name in [REFERENCE, MATCH, NONMATCH, NO_FACE, INVALID, TOO_SMALL]:
            if not (cls.root / name).is_file():
                raise RuntimeError("Required private fixture is missing: " + name)

    def compare(self, reference, selfie):
        request = {
            "reference_image_path": reference,
            "selfie_image_path": selfie,
            "reference_evidence_id": "sample-reference-a",
            "selfie_evidence_id": "sample-selfie-a",
        }
        process = subprocess.run(
            [sys.executable, str(ADAPTER)],
            input=json.dumps(request),
            text=True,
            capture_output=True,
            check=True,
            cwd=ROOT,
            env=os.environ.copy(),
            timeout=45,
        )
        return json.loads(process.stdout)

    def test_matching_pair_returns_actual_unclassified_score(self):
        result = self.compare(REFERENCE, MATCH)
        self.assertEqual(result["status"], "COMPLETED")
        self.assertIsInstance(result["similarity_score"], float)
        self.assertEqual(result["details"]["decision"], "NO_THRESHOLD_CONFIGURED")
        self.assertIsNone(result["details"]["match_classification"])
        self.assertFalse(result["details"]["identity_assertion"])
        self.assertFalse(result["details"]["citizenship_assertion"])
        self.assertEqual(result["details"]["reference_evidence_id"], "sample-reference-a")

    def test_nonmatching_pair_returns_actual_unclassified_score(self):
        result = self.compare(REFERENCE, NONMATCH)
        self.assertEqual(result["status"], "COMPLETED")
        self.assertIsInstance(result["similarity_score"], float)
        self.assertEqual(result["details"]["decision"], "NO_THRESHOLD_CONFIGURED")

    def test_sample_pair_scores_are_ordered_without_a_policy_threshold(self):
        same_result = self.compare(REFERENCE, MATCH)
        different_result = self.compare(REFERENCE, NONMATCH)
        same_person = same_result["similarity_score"]
        different_person = different_result["similarity_score"]
        self.assertGreater(same_person, different_person)
        no_face = self.compare(NO_FACE, MATCH)
        invalid = self.compare(INVALID, MATCH)
        too_small = self.compare(TOO_SMALL, MATCH)
        traversal = self.compare("../../../../etc/passwd", MATCH)
        report = {
            "recorded_at_utc": datetime.now(timezone.utc).isoformat(),
            "provider": same_result["provider_name"],
            "model_version": same_result["model_version"],
            "same_adult_specimen_to_selfie": {"status": same_result["status"], "score_type": same_result["score_type"], "score": same_person},
            "different_adult_specimen_to_selfie": {"status": different_result["status"], "score_type": different_result["score_type"], "score": different_person},
            "no_face": {"status": no_face["status"], "error_code": no_face["error_code"]},
            "invalid_image": {"status": invalid["status"], "error_code": invalid["error_code"]},
            "low_resolution_image": {"status": too_small["status"], "error_code": too_small["error_code"]},
            "path_traversal": {"status": traversal["status"], "error_code": traversal["error_code"]},
            "threshold": None,
            "match_classification": None,
            "external_transfer": False,
        }
        output = ROOT / "docs/evidence/TTP-3G-3H-BIOMETRIC-POC-01/private/adapter-results.json"
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(report, indent=2) + "\n")

    def test_missing_face_is_reported_as_failed(self):
        result = self.compare(NO_FACE, MATCH)
        self.assertEqual(result["status"], "FAILED")
        self.assertEqual(result["error_code"], "NO_FACE")

    def test_invalid_and_low_resolution_images_are_rejected(self):
        invalid = self.compare(INVALID, MATCH)
        self.assertEqual(invalid["error_code"], "IMAGE_FORMAT_INVALID")
        too_small = self.compare(TOO_SMALL, MATCH)
        self.assertEqual(too_small["error_code"], "IMAGE_DIMENSIONS_INVALID")

    def test_private_root_boundary_rejects_traversal(self):
        result = self.compare("../../../../etc/passwd", MATCH)
        self.assertEqual(result["error_code"], "IMAGE_UNAVAILABLE")

    def test_missing_local_models_are_unavailable(self):
        previous = os.environ.get("IVP_FACE_MODEL_DIR")
        os.environ["IVP_FACE_MODEL_DIR"] = str(self.root / "models-do-not-exist")
        try:
            result = self.compare(REFERENCE, MATCH)
        finally:
            if previous is None:
                os.environ.pop("IVP_FACE_MODEL_DIR", None)
            else:
                os.environ["IVP_FACE_MODEL_DIR"] = previous
        self.assertEqual(result["status"], "UNAVAILABLE")
        self.assertEqual(result["error_code"], "MODELS_MISSING")

    def test_repeat_execution_is_reproducible(self):
        first = self.compare(REFERENCE, MATCH)["similarity_score"]
        second = self.compare(REFERENCE, MATCH)["similarity_score"]
        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main(verbosity=2)
