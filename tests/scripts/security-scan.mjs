import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const changed = new Set();
for (const args of [
  ['diff', '--name-only', 'origin/main'],
  ['ls-files', '--others', '--exclude-standard']
]) {
  const output = execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  for (const file of output.split(/\r?\n/).filter(Boolean)) changed.add(file);
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /(?:mysql|postgres(?:ql)?):\/\/[^\s:/]+:[^\s/@]+@[^\s/]+/i,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{24,}["']/i
];
const sensitivePath = /(^|\/)(?:\.env(?:\..*)?|id_rsa|id_ed25519|.*\.(?:pem|p12|pfx|key|sqlite3?|db|dump|sql\.gz))$/i;
const findings = [];

for (const relative of changed) {
  const absolute = path.join(root, relative);
  if (sensitivePath.test(relative)) findings.push(`${relative}: sensitive filename`);
  let contents;
  try { contents = await readFile(absolute, 'utf8'); } catch { continue; }
  if (contents.includes('\u0000')) continue;
  const lines = contents.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (secretPatterns.some(pattern => pattern.test(line))) findings.push(`${relative}:${index + 1}: secret-like pattern (value redacted)`);
  });
}

if (findings.length) {
  console.error(`FAIL scanned ${changed.size} changed/untracked files; ${findings.length} finding(s):`);
  for (const finding of findings) console.error(finding);
  process.exitCode = 1;
} else {
  console.log(`PASS scanned ${changed.size} changed/untracked files and the current diff against origin/main; no configured secret/private-file patterns found.`);
}
