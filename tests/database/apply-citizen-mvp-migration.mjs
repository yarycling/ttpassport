import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';

const secretsDirectory = process.env.TTP2B_SECRETS_DIR;
if (!secretsDirectory) throw new Error('Set TTP2B_SECRETS_DIR to the private Stage 2B credential directory.');

const repositoryRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const migration = await readFile(path.join(repositoryRoot, 'migrations/passport/001_citizen_mvp.sql'), 'utf8');
const statements = migration.replace(/^--.*$/gm, '').split(';').map(statement => statement.trim()).filter(Boolean);
const expectedTables = ['citizen_accounts', 'applicant_profiles', 'passport_applications'];
const targets = [
  { label: 'Test', port: 3307, database: 'passport_test', user: 'passport_test_schema', passwordFile: 'passport-test-schema-password.txt' },
  { label: 'Development', port: 3308, database: 'passport_dev', user: 'passport_dev_schema', passwordFile: 'passport-development-schema-password.txt' },
];

let failed = false;
for (const target of targets) {
  const password = (await readFile(path.join(secretsDirectory, target.passwordFile), 'utf8')).trim();
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: target.port,
    user: target.user,
    password,
    database: target.database,
    connectTimeout: 2500,
  });

  try {
    const [[identity]] = await connection.query(
      'SELECT VERSION() AS serverVersion, @@version_comment AS serverComment, DATABASE() AS databaseName, @@port AS serverPort, CURRENT_USER() AS currentUser'
    );
    const expectedPrincipal = `${target.user}@%`;
    if (!/^8\.4\./.test(identity.serverVersion) || !/mysql/i.test(identity.serverComment) || /mariadb/i.test(identity.serverComment) || identity.databaseName !== target.database || Number(identity.serverPort) !== 3306 || identity.currentUser !== expectedPrincipal) {
      throw new Error(`${target.label}: unexpected authenticated server identity; migration stopped before DDL.`);
    }

    const [present] = await connection.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (?, ?, ?)',
      expectedTables,
    );
    if (present.length > 0 && present.length !== expectedTables.length) {
      throw new Error(`${target.label}: partial table set already exists; migration stopped for review.`);
    }

    if (present.length === 0) {
      for (const statement of statements) await connection.query(statement);
      console.log(`PASS ${target.label}: migration applied to ${identity.databaseName} on MySQL ${identity.serverVersion} using ${identity.currentUser}.`);
    } else {
      console.log(`PASS ${target.label}: complete migration table set already exists in ${identity.databaseName} on MySQL ${identity.serverVersion}.`);
    }

    const [verified] = await connection.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (?, ?, ?)',
      expectedTables,
    );
    if (verified.length !== expectedTables.length) throw new Error(`${target.label}: migration verification failed.`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${target.label}: ${error.message}`);
  } finally {
    await connection.end();
  }
}

if (failed) process.exitCode = 1;
