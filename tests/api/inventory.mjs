import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requestExistingEndpoint } from './client.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const routes = JSON.parse(await readFile(path.join(repoRoot, 'app/config/routes.json'), 'utf8')).routes;
const routeConfig = await readFile(path.join(repoRoot, 'app/config/routes.json'), 'utf8');
const serverConnectFiles = await (async () => {
  const { readdir } = await import('node:fs/promises');
  const walk = async directory => {
    let entries = [];
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return []; }
    const found = [];
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) found.push(...await walk(absolute));
      else if (/\.(json|ejs)$/i.test(entry.name) && /api|server/i.test(directory)) found.push(path.relative(repoRoot, absolute));
    }
    return found;
  };
  return walk(path.join(repoRoot, 'app'));
})();

if (routes.length !== 15) throw new Error(`Expected the accepted 15 GUI routes; observed ${routes.length}.`);
if (!routeConfig.includes('"routeType": "page"')) throw new Error('Route inventory is not readable as Wappler page routes.');
const expectedIvpActions = [
  'auth_state.json',
  'consent.json',
  'document_upload.json',
  'login.json',
  'liveness_result.json',
  'logout.json',
  'register.json',
  'review.json',
  'selfie_upload.json',
  'session_create.json',
  'session_latest.json',
  'session_load.json'
].map(name => `app/api/ivp/${name}`).sort();
const ivpActions = serverConnectFiles.filter(name => name.startsWith('app/api/ivp/')).sort();
assert.deepEqual(ivpActions, expectedIvpActions, 'Only the approved eKYC development actions should be exposed.');
for (const filename of ivpActions) {
  const action = JSON.parse(await readFile(path.join(repoRoot, filename), 'utf8'));
  assert.ok(Array.isArray(action.exec?.steps), `${filename} must contain a Wappler Server Connect workflow.`);
}
const homeResponse = await requestExistingEndpoint('/');
assert.equal(homeResponse.status, 200, 'loopback API client should reach the existing Wappler route');
await assert.rejects(
  requestExistingEndpoint('/', { baseURL: 'https://example.com' }),
  /loopback target/,
  'API test client must reject a non-loopback target'
);
await assert.rejects(
  requestExistingEndpoint('//example.com'),
  /configured loopback origin/,
  'API test client must reject a path that overrides its loopback origin'
);
console.log(JSON.stringify({
  approvedGuiRoutes: routes.length,
  serverConnectApiFiles: serverConnectFiles,
  approvedIvpActions: ivpActions.map(name => path.basename(name, '.json')),
  loopbackClient: 'GET / returned HTTP 200; non-loopback base and authority-overriding path rejected',
  businessApiAssertions: 'Wappler-native IVP action inventory verified; runtime behavior covered by the eKYC browser/API tests'
}, null, 2));
