import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';

const secretsDirectory = process.env.TTP2B_SECRETS_DIR;
if (!secretsDirectory) throw new Error('Set TTP2B_SECRETS_DIR to the private Stage 2B credential directory.');
const repositoryRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const migration = await readFile(path.join(repositoryRoot, 'migrations/passport/002_citizen_application_completion.sql'), 'utf8');
const statements = migration.replace(/^--.*$/gm, '').split(';').map(statement => statement.trim()).filter(Boolean);
const expectedTables = [
  'citizen_email_verification_tokens',
  'citizen_password_recovery_tokens',
  'passport_application_recommenders',
  'passport_application_references',
  'passport_application_evidence',
  'passport_application_demo_submissions',
];
const targets = [
  { label: 'Test', port: 3307, database: 'passport_test', user: 'passport_test_schema', passwordFile: 'passport-test-schema-password.txt' },
  { label: 'Development', port: 3308, database: 'passport_dev', user: 'passport_dev_schema', passwordFile: 'passport-development-schema-password.txt' },
];

let failed = false;
for (const target of targets) {
  const password = (await readFile(path.join(secretsDirectory, target.passwordFile), 'utf8')).trim();
  const connection = await mysql.createConnection({
    host: '127.0.0.1', port: target.port, user: target.user, password,
    database: target.database, connectTimeout: 2500,
  });
  try {
    const [[identity]] = await connection.query(
      'SELECT VERSION() AS serverVersion, @@version_comment AS serverComment, DATABASE() AS databaseName, @@port AS serverPort, CURRENT_USER() AS currentUser'
    );
    if (!/^8\.4\./.test(identity.serverVersion) || !/mysql/i.test(identity.serverComment) || /mariadb/i.test(identity.serverComment) || identity.databaseName !== target.database || Number(identity.serverPort) !== 3306 || identity.currentUser !== `${target.user}@%`) {
      throw new Error(`${target.label}: unexpected authenticated server identity; migration stopped before DDL.`);
    }
    const [passportTables] = await connection.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (?, ?, ?)',
      ['citizen_accounts', 'applicant_profiles', 'passport_applications'],
    );
    if (passportTables.length !== 3) throw new Error(`${target.label}: base Passport schema is incomplete; migration stopped.`);
    const [present] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (${expectedTables.map(() => '?').join(',')})`,
      expectedTables,
    );
    if (present.length !== 0 && present.length !== expectedTables.length) throw new Error(`${target.label}: partial completion schema exists; migration stopped for review.`);
    if (present.length === 0) {
      for (const statement of statements) await connection.query(statement);
      console.log(`PASS ${target.label}: completion migration applied to ${identity.databaseName} on MySQL ${identity.serverVersion}; authenticated schema principal verified.`);
    } else {
      console.log(`PASS ${target.label}: completion tables already present in ${identity.databaseName}; authenticated schema principal verified.`);
    }
    const [verified] = await connection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (${expectedTables.map(() => '?').join(',')})`,
      expectedTables,
    );
    if (verified.length !== expectedTables.length) throw new Error(`${target.label}: completion schema verification failed.`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${target.label}: ${error.message}`);
  } finally {
    await connection.end();
  }
}
if (failed) process.exitCode = 1;
