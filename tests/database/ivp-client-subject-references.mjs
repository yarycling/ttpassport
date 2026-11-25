import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';

const target = process.argv.find(arg => arg.startsWith('--target='))?.split('=')[1];
const direction = process.argv.find(arg => arg.startsWith('--direction='))?.split('=')[1];
if (!['ivp-test', 'ivp-development'].includes(target) || !['up', 'down'].includes(direction)) {
  throw new Error('Usage: node tests/database/ivp-client-subject-references.mjs --target=ivp-test|ivp-development --direction=up|down');
}

const secretsDirectory = process.env.TTP2B_SECRETS_DIR || path.join(os.homedir(), '.codex', 'ttpassport-stage2b-secrets');
const config = JSON.parse(await readFile(path.join(secretsDirectory, 'db-connections.json'), 'utf8'));
const environment = target === 'ivp-test' ? 'test' : 'development';
const expectedPort = target === 'ivp-test' ? 3307 : 3308;
const connectionConfig = config[environment]?.ivpSchema;
if (!connectionConfig || connectionConfig.host !== '127.0.0.1' || Number(connectionConfig.port) !== expectedPort || connectionConfig.database !== (target === 'ivp-test' ? 'ivp_test' : 'ivp_dev')) {
  throw new Error('The configured IVP schema principal does not match the explicitly selected local target.');
}

const repositoryRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const migrationName = `002_client_subject_references.${direction}.sql`;
const migration = await readFile(path.join(repositoryRoot, 'migrations/ivp', migrationName), 'utf8');
const statements = migration.replace(/^\s*--.*$/gm, '').split(';').map(value => value.trim()).filter(Boolean);
const expectedColumns = [
  ['ivp_subjects', 'client_subject_ref'],
  ['ivp_sessions', 'created_by_client_subject_ref'],
  ['ivp_consents', 'actor_client_subject_ref'],
  ['ivp_evidence', 'owner_client_subject_ref'],
  ['ivp_ocr_results', 'reviewed_by_client_subject_ref']
];
const connection = await mysql.createConnection({
  host: connectionConfig.host,
  port: Number(connectionConfig.port),
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  connectTimeout: 2500
});

try {
  const [[identity]] = await connection.query('SELECT VERSION() AS serverVersion, @@version_comment AS serverComment, DATABASE() AS databaseName, @@port AS serverPort, CURRENT_USER() AS principal');
  const expectedPrincipal = `${connectionConfig.user}@%`;
  if (!/^8\.4\./.test(identity.serverVersion) || !/mysql/i.test(identity.serverComment) || /mariadb/i.test(identity.serverComment) || identity.databaseName !== connectionConfig.database || Number(identity.serverPort) !== 3306 || identity.principal !== expectedPrincipal) {
    throw new Error('Unexpected MySQL identity; migration stopped before DDL.');
  }

  const [present] = await connection.execute(
    'SELECT table_name AS table_name, column_name AS column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND ((table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?))',
    expectedColumns.flat()
  );
  const presentSet = new Set(present.map(row => `${row.table_name}.${row.column_name}`));
  if (direction === 'up' && presentSet.size === expectedColumns.length) {
    console.log(`PASS ${target}: all client-subject reference columns already exist on MySQL ${identity.serverVersion}.`);
  } else if (direction === 'up' && presentSet.size > 0) {
    throw new Error('A partial migration is present; no further DDL was run.');
  } else if (direction === 'down' && presentSet.size !== expectedColumns.length) {
    throw new Error('Rollback requires the complete client-subject reference migration.');
  } else {
    for (const statement of statements) await connection.query(statement);
    const [verified] = await connection.execute(
      'SELECT table_name AS table_name, column_name AS column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND ((table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?) OR (table_name = ? AND column_name = ?))',
      expectedColumns.flat()
    );
    if ((direction === 'up' && verified.length !== expectedColumns.length) || (direction === 'down' && verified.length !== 0)) {
      throw new Error('Post-migration schema verification failed.');
    }
    console.log(`PASS ${target}: ${direction} migration verified on MySQL ${identity.serverVersion} in ${identity.databaseName} as ${identity.principal}.`);
  }
} finally {
  await connection.end();
}
