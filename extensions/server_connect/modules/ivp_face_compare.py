#!/usr/bin/env python3
"""Local, non-production YuNet + SFace comparison adapter.

This process reads only files under the configured private IVP evidence root.
It returns a descriptive cosine similarity and never makes a match decision.
"""

from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import platform
import re
import sys
from pathlib import Path


ZOO_REVISION = "48b10fa505aeb51fbd127fc60a5c660040e823b7"
YUNET_FILE = "face_detection_yunet_2023mar.onnx"
YUNET_SHA256 = "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4"
SFACE_FILE = "face_recognition_sface_2021dec.onnx"
SFACE_SHA256 = "0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79"
MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_PIXELS = 20_000_000
MIN_WIDTH = 320
MIN_HEIGHT = 200


class AdapterError(Exception):
    def __init__(self, code: str, status: str, message: str):
        super().__init__(message)
        self.code = code
        self.status = status
        self.message = message


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as model:
        for chunk in iter(lambda: model.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _models():
    configured = os.environ.get("IVP_FACE_MODEL_DIR")
    root = Path(configured).expanduser() if configured else Path.cwd() / "storage/ivp_dev/models"
    yunet = root / YUNET_FILE
    sface = root / SFACE_FILE
    if not yunet.is_file() or not sface.is_file():
        raise AdapterError("MODELS_MISSING", "UNAVAILABLE", "The local face models are not installed.")
    if _sha256(yunet) != YUNET_SHA256 or _sha256(sface) != SFACE_SHA256:
        raise AdapterError("MODEL_HASH_MISMATCH", "UNAVAILABLE", "A local face model failed its integrity check.")
    return yunet, sface


def _private_image(image_path: str, evidence_root: Path, cv2, np):
    if not isinstance(image_path, str) or not image_path.strip():
        raise AdapterError("IMAGE_MISSING", "FAILED", "A required private image is missing.")

    root = evidence_root.resolve(strict=True)
    supplied = Path(image_path).expanduser()
    candidate = supplied if supplied.is_absolute() else root / supplied
    try:
        image_file = candidate.resolve(strict=True)
        image_file.relative_to(root)
    except (OSError, ValueError):
        raise AdapterError("IMAGE_UNAVAILABLE", "FAILED", "The required image is outside private evidence storage or unavailable.")

    if not image_file.is_file():
        raise AdapterError("IMAGE_UNAVAILABLE", "FAILED", "The required image is unavailable.")
    size = image_file.stat().st_size
    if size <= 0 or size > MAX_IMAGE_BYTES:
        raise AdapterError("IMAGE_SIZE_INVALID", "FAILED", "An image is empty or exceeds the 5 MB evaluation limit.")

    raw = image_file.read_bytes()
    is_png = raw.startswith(b"\x89PNG\r\n\x1a\n")
    is_jpeg = len(raw) >= 3 and raw[:3] == b"\xff\xd8\xff"
    if not (is_png or is_jpeg):
        raise AdapterError("IMAGE_FORMAT_INVALID", "FAILED", "Images must be valid JPEG or PNG files.")

    decoded = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if decoded is None:
        raise AdapterError("IMAGE_UNREADABLE", "FAILED", "An image could not be decoded.")
    height, width = decoded.shape[:2]
    if width < MIN_WIDTH or height < MIN_HEIGHT or width * height > MAX_PIXELS:
        raise AdapterError("IMAGE_DIMENSIONS_INVALID", "FAILED", "An image is outside the supported dimensions.")
    return decoded


def _safe_evidence_id(value):
    if isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9-]{1,64}", value):
        return value
    return None


def _face(image, detector, cv2, np, label: str):
    height, width = image.shape[:2]
    detector.setInputSize((width, height))
    result = detector.detect(image)
    faces = result[1]
    count = 0 if faces is None else int(len(faces))
    if count == 0:
        raise AdapterError("NO_FACE", "FAILED", "No usable face was detected in the " + label + " image.")
    if count != 1:
        raise AdapterError("AMBIGUOUS_FACE_COUNT", "REVIEW_REQUIRED", "Exactly one face is required in each image.")
    return faces[0]


def run(request: dict):
    if not isinstance(request, dict):
        raise AdapterError("REQUEST_INVALID", "FAILED", "The local comparison request is invalid.")

    configured_root = os.environ.get("IVP_FACE_EVIDENCE_ROOT") or os.environ.get("IVP_OCR_EVIDENCE_ROOT")
    if not configured_root:
        raise AdapterError("EVIDENCE_ROOT_MISSING", "UNAVAILABLE", "Private IVP evidence storage is not configured.")

    try:
        import cv2
        import numpy as np
    except Exception:
        raise AdapterError("OPENCV_UNAVAILABLE", "UNAVAILABLE", "The local OpenCV runtime is unavailable.")

    yunet_path, sface_path = _models()
    evidence_root = Path(configured_root).expanduser()
    reference = _private_image(request.get("reference_image_path"), evidence_root, cv2, np)
    selfie = _private_image(request.get("selfie_image_path"), evidence_root, cv2, np)

    try:
        detector = cv2.FaceDetectorYN.create(str(yunet_path), "", (320, 320), 0.9, 0.3, 5000)
        recognizer = cv2.FaceRecognizerSF.create(str(sface_path), "")
    except Exception:
        raise AdapterError("MODEL_LOAD_FAILED", "UNAVAILABLE", "The local face models could not be loaded by OpenCV.")

    reference_face = _face(reference, detector, cv2, np, "reference portrait")
    selfie_face = _face(selfie, detector, cv2, np, "selfie")
    try:
        reference_crop = recognizer.alignCrop(reference, reference_face)
        selfie_crop = recognizer.alignCrop(selfie, selfie_face)
        reference_feature = recognizer.feature(reference_crop)
        selfie_feature = recognizer.feature(selfie_crop)
        score = float(recognizer.match(reference_feature, selfie_feature, cv2.FaceRecognizerSF_FR_COSINE))
    except Exception:
        raise AdapterError("COMPARISON_FAILED", "FAILED", "OpenCV could not complete the face comparison.")

    try:
        opencv_package = importlib.metadata.version("opencv-python-headless")
    except importlib.metadata.PackageNotFoundError:
        opencv_package = "unknown"
    try:
        numpy_version = np.__version__
    except Exception:
        numpy_version = "unknown"

    return {
        "status": "COMPLETED",
        "provider_name": "OpenCV YuNet + SFace",
        "model_version": "YuNet 2023mar / SFace 2021dec @ OpenCV Zoo " + ZOO_REVISION,
        "score_type": "cosine_similarity",
        "similarity_score": score,
        "face_count_reference": 1,
        "face_count_selfie": 1,
        "error_code": "",
        "error_message": "",
        "details": {
            "operation": "one_to_one_face_similarity",
            "similarity_score": score,
            "similarity_score_display": format(score, ".6f"),
            "score_type": "cosine_similarity",
            "decision": "NO_THRESHOLD_CONFIGURED",
            "match_classification": None,
            "identity_assertion": False,
            "citizenship_assertion": False,
            "face_count_reference": 1,
            "face_count_selfie": 1,
            "detector_score_threshold": 0.9,
            "opencv_package": opencv_package,
            "opencv_version": cv2.__version__,
            "numpy_version": numpy_version,
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "model_revision": ZOO_REVISION,
            "reference_evidence_id": _safe_evidence_id(request.get("reference_evidence_id")),
            "selfie_evidence_id": _safe_evidence_id(request.get("selfie_evidence_id")),
        },
    }


def main():
    try:
        request = json.load(sys.stdin)
        result = run(request)
    except AdapterError as error:
        result = {
            "status": error.status,
            "provider_name": "OpenCV YuNet + SFace",
            "model_version": "YuNet 2023mar / SFace 2021dec @ OpenCV Zoo " + ZOO_REVISION,
            "score_type": "cosine_similarity",
            "similarity_score": None,
            "face_count_reference": None,
            "face_count_selfie": None,
            "error_code": error.code,
            "error_message": error.message,
            "details": {
                "decision": "NO_THRESHOLD_CONFIGURED",
                "identity_assertion": False,
                "citizenship_assertion": False,
                "reference_evidence_id": _safe_evidence_id(request.get("reference_evidence_id")) if isinstance(request, dict) else None,
                "selfie_evidence_id": _safe_evidence_id(request.get("selfie_evidence_id")) if isinstance(request, dict) else None,
                "error_code": error.code,
                "error_message": error.message,
            },
        }
    except Exception:
        result = {
            "status": "UNAVAILABLE",
            "provider_name": "OpenCV YuNet + SFace",
            "model_version": "YuNet 2023mar / SFace 2021dec @ OpenCV Zoo " + ZOO_REVISION,
            "score_type": "cosine_similarity",
            "similarity_score": None,
            "face_count_reference": None,
            "face_count_selfie": None,
            "error_code": "ADAPTER_ERROR",
            "error_message": "The local face comparison adapter could not complete the request.",
            "details": {"identity_assertion": False, "citizenship_assertion": False},
        }
    json.dump(result, sys.stdout, separators=(",", ":"), allow_nan=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
