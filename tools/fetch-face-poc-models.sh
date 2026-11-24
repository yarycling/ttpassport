#!/bin/sh
set -eu

ROOT="$(git rev-parse --show-toplevel)"
DEST="$ROOT/storage/ivp_dev/models"
REVISION="48b10fa505aeb51fbd127fc60a5c660040e823b7"
mkdir -p "$DEST"

curl -fL --retry 2 "https://media.githubusercontent.com/media/opencv/opencv_zoo/$REVISION/models/face_detection_yunet/face_detection_yunet_2023mar.onnx" -o "$DEST/face_detection_yunet_2023mar.onnx"
curl -fL --retry 2 "https://media.githubusercontent.com/media/opencv/opencv_zoo/$REVISION/models/face_recognition_sface/face_recognition_sface_2021dec.onnx" -o "$DEST/face_recognition_sface_2021dec.onnx"

python3 - "$DEST" <<'PY'
import hashlib
import pathlib
import sys

expected = {
    "face_detection_yunet_2023mar.onnx": "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4",
    "face_recognition_sface_2021dec.onnx": "0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79",
}
root = pathlib.Path(sys.argv[1])
for name, digest in expected.items():
    path = root / name
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != digest:
        raise SystemExit(f"SHA-256 mismatch for {name}")
    print(f"verified {name}: {actual}")
PY
