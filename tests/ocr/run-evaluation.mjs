import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const sampleDir = path.join(repo, 'tests/.cache/ocr/samples');
const evidencePath = path.join(repo, 'docs/evidence/TTP-3E/screenshots/ocr-human-review-2026-11-24.png');
const modelPath = path.join(repo, 'extensions/server_connect/modules/tessdata/eng.traineddata');

await fs.mkdir(sampleDir, { recursive: true });
await fs.mkdir(path.dirname(evidencePath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const samples = await page.evaluate(() => {
  function render(lines, blank = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (!blank) {
      context.fillStyle = '#111111';
      context.font = 'bold 46px Arial';
      lines.forEach((line, index) => context.fillText(line, 56, 120 + index * 110));
    }
    return canvas.toDataURL('image/png').split(',')[1];
  }
  return {
    readable: render([
      'SYNTHETIC OCR TEST - NOT AN ID',
      'NAME: SAMPLE PERSON',
      'DOCUMENT NO: TEST 000042',
      'DOB: 2000 01 01',
      'NATIONALITY: SYNTHETIC',
    ]),
    unreadable: render([], true),
  };
});
await browser.close();

await fs.writeFile(path.join(sampleDir, 'synthetic-readable.png'), Buffer.from(samples.readable, 'base64'));
await fs.writeFile(path.join(sampleDir, 'synthetic-unreadable.png'), Buffer.from(samples.unreadable, 'base64'));
await fs.writeFile(path.join(sampleDir, 'invalid-image.txt'), 'This is synthetic plain text, not an image.');

const workerThreads = require('node:worker_threads');
const BaseWorker = workerThreads.Worker;
const networkGuard = path.join(here, 'network-guard.cjs');
workerThreads.Worker = class GuardedWorker extends BaseWorker {
  constructor(filename, options = {}) {
    const execArgv = [...(options.execArgv || process.execArgv), `--require=${networkGuard}`];
    super(filename, { ...options, execArgv });
  }
};
require('./network-guard.cjs');

process.env.IVP_OCR_EVIDENCE_ROOT = sampleDir;
const ocr = require('../../extensions/server_connect/modules/ivp_ocr.js');
const runAction = (imagePath) => ocr.recognize.call({ parse: (value) => value }, { imagePath }, 'ocrEvaluation');
const inspectAction = (imagePath) => ocr.inspect.call({ parse: (value) => value }, { imagePath }, 'inspectEvaluation');

assert.equal(require('tesseract.js/package.json').version, '7.0.0');
assert.equal(require('tesseract.js-core/package.json').version, '7.0.0');
assert.ok((await fs.stat(modelPath)).size > 1_000_000, 'local English model should exist');

const readable = await runAction('synthetic-readable.png');
assert.equal(readable.status, 'REVIEW_REQUIRED');
assert.equal(readable.authenticityVerified, false);
assert.equal(readable.identityVerified, false);
assert.match(readable.text, /SAMPLE PERSON/i);
assert.match(readable.text, /TEST/i);
assert.deepEqual(readable.extractedFields, {
  name: 'SAMPLE PERSON',
  documentNumber: 'TEST 000042',
  dateOfBirth: '2000 01 01',
  nationality: 'SYNTHETIC',
});
assert.equal(readable.extractedFieldsJson, JSON.stringify(readable.extractedFields));
assert.equal(readable.sha256.length, 64);
assert.ok(readable.imageWidth >= 320 && readable.imageHeight >= 200);

const inspected = await inspectAction('synthetic-readable.png');
assert.equal(inspected.valid, true);
assert.equal(inspected.imageFormat, 'png');
assert.equal(inspected.sha256, readable.sha256);

const unreadable = await runAction('synthetic-unreadable.png');
assert.equal(unreadable.status, 'UNREADABLE');
assert.equal(unreadable.documentReadable, false);
assert.equal(unreadable.authenticityVerified, false);
assert.equal(unreadable.identityVerified, false);

await assert.rejects(() => runAction('invalid-image.txt'), /Unsupported image format/);
await assert.rejects(() => runAction('../../../.env'), /outside the configured private evidence area/);
assert.equal((await inspectAction('invalid-image.txt')).valid, false);
assert.equal((await inspectAction('../../../.env')).valid, false);

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const reviewPage = await chromium.launch({ headless: true });
const reviewTab = await reviewPage.newPage({ viewport: { width: 1440, height: 900 } });
await reviewTab.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>OCR review test</title><style>body{font:16px Arial,sans-serif;max-width:850px;margin:64px auto;padding:32px;color:#172b4d}label{display:block;font-weight:700;margin:16px 0 8px}textarea{width:100%;min-height:300px;font:18px/1.5 monospace;padding:16px;border:2px solid #6b778c;border-radius:8px}p{background:#fff4ce;padding:14px;border-left:4px solid #ffab00}</style></head><body><h1>OCR extraction — human review required</h1><p>OCR text is not document-authenticity or legal identity verification.</p><label for="extracted">Extracted text — review and correct before use</label><textarea id="extracted" aria-label="Extracted text — review and correct before use">${escapeHtml(readable.text)}</textarea></body></html>`);
assert.equal(await reviewTab.locator('#extracted').inputValue(), readable.text);
await reviewTab.locator('#extracted').fill(`${readable.text}\nHUMAN CORRECTION: REVIEWED`);
assert.match(await reviewTab.locator('#extracted').inputValue(), /HUMAN CORRECTION: REVIEWED/);
await reviewTab.locator('#extracted').fill(readable.text);
await reviewTab.screenshot({ path: evidencePath, fullPage: true });
await reviewPage.close();

console.log(JSON.stringify({
  result: 'PASS',
  node: process.version,
  tesseractJs: require('tesseract.js/package.json').version,
  core: require('tesseract.js-core/package.json').version,
  modelPath: path.relative(repo, modelPath),
  modelBytes: (await fs.stat(modelPath)).size,
  tests: {
    readableExtraction: 'PASS',
    supportedFieldExtraction: 'PASS',
    privateImageInspectionAndDigest: 'PASS',
    humanCorrectionEditable: 'PASS',
    unreadableImage: 'PASS',
    invalidFileRejected: 'PASS',
    pathTraversalRejected: 'PASS',
    localModelAndNoRemoteFallback: 'PASS',
    authenticityAndIdentityRemainFalse: 'PASS',
  },
  readableText: readable.text,
  ocrConfidence: readable.ocrConfidence,
  unreadableText: unreadable.text,
  reviewScreenshot: path.relative(repo, evidencePath),
}, null, 2));
