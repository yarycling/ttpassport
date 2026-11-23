import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const config = JSON.parse(await readFile(path.join(root, 'app/config/config.json'), 'utf8'));
const connection = JSON.parse(await readFile(path.join(root, 'app/modules/connections/db.json'), 'utf8'));
const routes = JSON.parse(await readFile(path.join(root, 'app/config/routes.json'), 'utf8')).routes;
const accepted = JSON.parse(await readFile(path.join(root, 'tests/fixtures/accepted-route-map.json'), 'utf8'));

if (config.port !== 3002) throw new Error(`Expected Development port 3002; observed ${config.port}.`);
if (connection.name !== 'db' || connection.options?.client !== 'sqlite3' || connection.options?.connection?.filename !== '/db/db_dev.sqlite3') {
  throw new Error('The accepted SQLite connection `db` changed.');
}
if (JSON.stringify(routes) !== JSON.stringify(accepted)) throw new Error('The accepted 15-screen route mapping changed.');
console.log('PASS Wappler port 3002, SQLite connection db, and all 15 accepted routes/layouts are unchanged.');
