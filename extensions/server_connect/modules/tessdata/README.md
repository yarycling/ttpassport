# Local OCR language data

The English `eng.traineddata` file is from the official Tesseract `tessdata_fast` repository at commit `87416418657359cb625c412a48b6e1d6d41c29bd`.

- SHA-256: `7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2`
- Size: 4,113,088 bytes
- License: Apache-2.0; see [LICENSE](LICENSE).
- Source: https://github.com/tesseract-ocr/tessdata_fast

The adapter reads this file from disk with gzip disabled and the Tesseract.js cache disabled. The model is not fetched from a CDN at runtime.
