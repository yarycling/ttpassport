'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { createWorker, OEM } = require('tesseract.js');

const MODEL_DIR = path.join(__dirname, 'tessdata');
const MODEL_REVISION = 'tessdata_fast@87416418657359cb625c412a48b6e1d6d41c29bd';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const MAX_PIXELS = 20_000_000;

function imageDimensions(buffer) {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(pngSignature)) {
    return { format: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Unsupported image format. Use a valid JPEG or PNG image.');
  }

  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (offset + 2 > buffer.length) break;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
    if (frameMarkers.has(marker) && segmentLength >= 7) {
      return {
        format: 'jpeg',
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  throw new Error('The JPEG image is incomplete or unreadable.');
}

async function readPrivateImage(imagePath) {
  const configuredRoot = process.env.IVP_OCR_EVIDENCE_ROOT;
  if (!configuredRoot) throw new Error('Private OCR evidence storage is not configured.');
  if (typeof imagePath !== 'string' || imagePath.trim() === '') throw new Error('A private image path is required.');

  const root = await fs.realpath(path.resolve(configuredRoot));
  const candidate = path.resolve(root, imagePath);
  const rootPrefix = `${root}${path.sep}`;
  if (candidate !== root && !candidate.startsWith(rootPrefix)) {
    throw new Error('The image is outside the configured private evidence area.');
  }

  const filePath = await fs.realpath(candidate);
  if (!filePath.startsWith(rootPrefix)) throw new Error('The image is outside the configured private evidence area.');
  const info = await fs.stat(filePath);
  if (!info.isFile()) throw new Error('The selected image is unavailable.');
  if (info.size <= 0 || info.size > MAX_IMAGE_BYTES) throw new Error('The image must be no larger than 5 MB.');

  const buffer = await fs.readFile(filePath);
  const { format, width, height } = imageDimensions(buffer);
  if (!width || !height || width < MIN_WIDTH || height < MIN_HEIGHT) {
    throw new Error('The image is too small for OCR. Use at least 320 × 200 pixels.');
  }
  if (width * height > MAX_PIXELS) throw new Error('The image dimensions exceed the OCR evaluation limit.');

  return { buffer, format, width, height };
}

exports.recognize = async function recognize(options) {
  const sourcePath = this.parse(options.imagePath);
  const image = await readPrivateImage(sourcePath);
  let worker;

  try {
    worker = await createWorker('eng', OEM.LSTM_ONLY, {
      langPath: MODEL_DIR,
      gzip: false,
      cacheMethod: 'none',
      logger: () => {},
    });
    const { data } = await worker.recognize(image.buffer);
    const text = String(data.text || '').trim();

    return {
      text,
      ocrConfidence: Number(data.confidence || 0),
      documentReadable: text.length > 0,
      status: text.length > 0 ? 'REVIEW_REQUIRED' : 'UNREADABLE',
      engine: 'Tesseract.js 7.0.0',
      language: 'eng',
      modelRevision: MODEL_REVISION,
      imageFormat: image.format,
      authenticityVerified: false,
      identityVerified: false,
    };
  } finally {
    if (worker) await worker.terminate();
  }
};
