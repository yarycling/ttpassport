'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const ADAPTER_PATH = path.join(__dirname, 'ivp_face_compare.py');
const MAX_OUTPUT_BYTES = 256 * 1024;
const TIMEOUT_MS = 45000;
const PROVIDER = 'OpenCV YuNet + SFace';
const MODEL_VERSION = 'YuNet 2023mar / SFace 2021dec @ OpenCV Zoo 48b10fa505aeb51fbd127fc60a5c660040e823b7';
// The local Development target may set IVP_FACE_PYTHON to an isolated ARM64 environment.

function unavailable(code, message) {
  const details = {
    decision: 'NO_THRESHOLD_CONFIGURED',
    identity_assertion: false,
    citizenship_assertion: false,
  };
  return {
    status: 'UNAVAILABLE',
    providerName: PROVIDER,
    modelVersion: MODEL_VERSION,
    scoreType: 'cosine_similarity',
    similarityScore: null,
    faceCountReference: null,
    faceCountSelfie: null,
    errorCode: code,
    errorMessage: message,
    detailsJson: JSON.stringify(details),
  };
}

function runAdapter(request, pythonExecutable) {
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timer = null;
    const finish = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    let child;
    try {
      child = spawn(pythonExecutable, [ADAPTER_PATH], {
        cwd: PROJECT_ROOT,
        env: {
          ...process.env,
          IVP_FACE_MODEL_DIR: process.env.IVP_FACE_MODEL_DIR || path.join(PROJECT_ROOT, 'storage/ivp_dev/models'),
          IVP_FACE_EVIDENCE_ROOT: process.env.IVP_FACE_EVIDENCE_ROOT || process.env.IVP_OCR_EVIDENCE_ROOT || '',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch {
      finish(unavailable('PYTHON_UNAVAILABLE', 'The local Python comparison runtime is unavailable.'));
      return;
    }

    timer = setTimeout(() => {
      child.kill('SIGTERM');
      finish(unavailable('ADAPTER_TIMEOUT', 'The local face comparison timed out.'));
    }, TIMEOUT_MS);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
      if (Buffer.byteLength(stdout) > MAX_OUTPUT_BYTES) {
        child.kill('SIGTERM');
        finish(unavailable('ADAPTER_OUTPUT_INVALID', 'The local face comparison returned an invalid response.'));
      }
    });
    child.stderr.on('data', chunk => {
      stderr += chunk;
      if (Buffer.byteLength(stderr) > MAX_OUTPUT_BYTES) stderr = stderr.slice(-MAX_OUTPUT_BYTES);
    });
    child.on('error', () => finish(unavailable('PYTHON_UNAVAILABLE', 'The local Python comparison runtime is unavailable.')));
    child.on('close', code => {
      if (settled) return;
      if (code !== 0) {
        finish(unavailable('ADAPTER_EXITED', 'The local face comparison could not complete.'));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (!['COMPLETED', 'FAILED', 'REVIEW_REQUIRED', 'UNAVAILABLE'].includes(result.status)) throw new Error('status');
        const details = result.details && typeof result.details === 'object' ? result.details : {};
        finish({
          status: result.status,
          providerName: result.provider_name || PROVIDER,
          modelVersion: result.model_version || MODEL_VERSION,
          scoreType: result.score_type || 'cosine_similarity',
          similarityScore: Number.isFinite(result.similarity_score) ? result.similarity_score : null,
          faceCountReference: Number.isInteger(result.face_count_reference) ? result.face_count_reference : null,
          faceCountSelfie: Number.isInteger(result.face_count_selfie) ? result.face_count_selfie : null,
          errorCode: result.error_code || '',
          errorMessage: result.error_message || '',
          detailsJson: JSON.stringify(details),
        });
      } catch {
        finish(unavailable('ADAPTER_RESPONSE_INVALID', 'The local face comparison returned an invalid response.'));
      }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify(request));
  });
}

exports.compare = async function compare(options) {
  const referenceImagePath = this.parse(options.referenceImagePath);
  const selfieImagePath = this.parse(options.selfieImagePath);
  const referenceEvidenceId = this.parse(options.referenceEvidenceId);
  const selfieEvidenceId = this.parse(options.selfieEvidenceId);
  const pythonExecutable = process.env.IVP_FACE_PYTHON || 'python3';
  return runAdapter({
    reference_image_path: referenceImagePath,
    selfie_image_path: selfieImagePath,
    reference_evidence_id: referenceEvidenceId,
    selfie_evidence_id: selfieEvidenceId,
  }, pythonExecutable);
};
