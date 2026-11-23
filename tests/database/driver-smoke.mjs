import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const configPath = process.env.TTP2B_DB_CONFIG;
if (!configPath) throw new Error('Set TTP2B_DB_CONFIG to the external Stage 2B configuration.');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const entry = config.test.passport;
const host = process.env.TTP2B_NODE_HOST || entry.host;
const port = Number(process.env.TTP2B_NODE_PORT || entry.port);
const connection = await mysql.createConnection({
  host,
  port,
  user: entry.user,
  password: entry.password,
  database: entry.database,
  connectTimeout: 5000
});
try {
  const [[row]] = await connection.query('SELECT VERSION() AS serverVersion, DATABASE() AS databaseName, 1 AS connected');
  if (!/^8\.4\./.test(row.serverVersion) || row.databaseName !== entry.database || Number(row.connected) !== 1) {
    throw new Error('Driver smoke checks did not match the expected MySQL 8.4 test target.');
  }
  console.log(JSON.stringify({
    nodeVersion: process.version,
    mysql2Version: JSON.parse(await readFile(new URL('../node_modules/mysql2/package.json', import.meta.url), 'utf8')).version,
    serverVersion: row.serverVersion,
    database: row.databaseName,
    result: 'PASS'
  }));
} finally {
  await connection.end();
}
