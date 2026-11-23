import { readFile } from 'node:fs/promises';
import process from 'node:process';
import mysql from 'mysql2/promise';

const configPath = process.env.TTP2B_DB_CONFIG;
if (!configPath) throw new Error('Set TTP2B_DB_CONFIG to the external, private Stage 2B connection JSON.');
const configuration = JSON.parse(await readFile(configPath, 'utf8'));
const failures = [];

function check(name, passed, detail = '') {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!passed) failures.push(name);
}

async function connect(entry, overrides = {}) {
  return mysql.createConnection({
    host: entry.host,
    port: entry.port,
    user: entry.user,
    password: entry.password,
    database: entry.database,
    connectTimeout: 2500,
    ...overrides
  });
}

async function denied(entry, sql, values = []) {
  let connection;
  try {
    connection = await connect(entry);
    await connection.execute(sql, values);
    return false;
  } catch (error) {
    return ['ER_TABLEACCESS_DENIED_ERROR', 'ER_DBACCESS_DENIED_ERROR', 'ER_SPECIFIC_ACCESS_DENIED_ERROR', 'ER_TABLE_EXISTS_ERROR'].includes(error.code);
  } finally {
    await connection?.end().catch(() => {});
  }
}

async function testPrincipal(label, entry, siblingDb) {
  const connection = await connect(entry);
  try {
    const [[identity]] = await connection.query('SELECT VERSION() AS serverVersion, @@version_comment AS serverComment, DATABASE() AS databaseName, @@port AS serverPort, CURRENT_USER() AS currentUser');
    check(`${label} authenticated identity`, /^8\.4\./.test(identity.serverVersion) && /mysql/i.test(identity.serverComment) && !/mariadb/i.test(identity.serverComment) && identity.databaseName === entry.database, 'authenticated server response matches expected MySQL 8.4 database');
    const expectedPrincipal = `${entry.user}@%`;
    check(`${label} principal scope`, identity.currentUser === expectedPrincipal, 'authenticated principal is the expected database-specific account');

    const [[probe]] = await connection.query('SELECT probe_value FROM __ttp2b_synthetic_probe WHERE probe_key = ?', ['fixture']);
    check(`${label} read-own-boundary`, typeof probe?.probe_value === 'string' && probe.probe_value.startsWith(label === 'passport' ? 'passport' : 'ivp'), 'synthetic fixture read from assigned database');

    const dmlKey = `dml-${label}`;
    await connection.execute('INSERT INTO __ttp2b_synthetic_probe (probe_key, probe_value) VALUES (?, ?)', [dmlKey, 'before-update']);
    await connection.execute('UPDATE __ttp2b_synthetic_probe SET probe_value = ? WHERE probe_key = ?', ['after-update', dmlKey]);
    const [[dmlResult]] = await connection.execute('SELECT probe_value FROM __ttp2b_synthetic_probe WHERE probe_key = ?', [dmlKey]);
    await connection.execute('DELETE FROM __ttp2b_synthetic_probe WHERE probe_key = ?', [dmlKey]);
    check(`${label} scoped-DML`, dmlResult?.probe_value === 'after-update', 'own-database insert, update, select and delete succeeded');

    check(`${label} sibling-database-denial`, await denied(entry, `SELECT probe_value FROM ${siblingDb}.__ttp2b_synthetic_probe`), 'sibling database access was denied');
    check(`${label} DDL-denial`, await denied(entry, 'CREATE TABLE __ttp2b_forbidden_ddl (id INT)'), 'runtime principal cannot create schema objects');
    check(`${label} account-admin-denial`, await denied(entry, "CREATE USER 'ttp2b_forbidden_user'@'%' IDENTIFIED BY 'fixture-denied'"), 'runtime principal cannot create users');
    check(`${label} privilege-grant-denial`, await denied(entry, `GRANT SELECT ON ${siblingDb}.* TO CURRENT_USER`), 'runtime principal cannot grant privileges');

    const transactionKey = `rollback-${label}`;
    await connection.beginTransaction();
    await connection.execute('INSERT INTO __ttp2b_synthetic_probe (probe_key, probe_value) VALUES (?, ?)', [transactionKey, 'synthetic-rollback-check']);
    await connection.rollback();
    const [[rollback]] = await connection.execute('SELECT COUNT(*) AS rowCount FROM __ttp2b_synthetic_probe WHERE probe_key = ?', [transactionKey]);
    check(`${label} transaction-rollback`, Number(rollback.rowCount) === 0, 'rolled-back synthetic row is absent');

    const [[types]] = await connection.query("SELECT CAST(12.34 AS DECIMAL(8,2)) AS decimalValue, TRUE AS trueValue, NULL IS NULL AS nullValue, JSON_EXTRACT(JSON_OBJECT('key','value'), '$.key') AS jsonValue, @@time_zone AS sessionTimeZone, @@sql_mode AS sqlMode");
    check(`${label} compatibility-types`, String(types.decimalValue) === '12.34' && Number(types.trueValue) === 1 && Number(types.nullValue) === 1 && String(types.jsonValue).includes('value'), 'DECIMAL, boolean, NULL, JSON, timezone and SQL mode query succeeded');
  } catch (error) {
    check(`${label} runtime-check`, false, `${error.code || 'ERROR'} without connection details`);
  } finally {
    await connection.end().catch(() => {});
  }
}

async function testSchemaPrincipal(label, entry, siblingDb) {
  const connection = await connect(entry);
  const tableName = '__ttp2b_schema_principal_probe';
  try {
    await connection.query(`CREATE TABLE ${tableName} (probe_id INT NOT NULL PRIMARY KEY)`);
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN probe_note VARCHAR(32) NULL`);
    const crossBoundaryDenied = await denied(entry, `CREATE TABLE ${siblingDb}.${tableName} (probe_id INT NOT NULL PRIMARY KEY)`);
    const dataReadDenied = await denied(entry, `SELECT * FROM ${tableName}`);
    check(`${label} schema-manager own-scope DDL`, true, 'own database table create/alter succeeded');
    check(`${label} schema-manager sibling-scope denied`, crossBoundaryDenied, 'schema principal cannot create objects in sibling database');
    check(`${label} schema-manager data-access denied`, dataReadDenied, 'schema principal has no application data read grant');
  } catch (error) {
    check(`${label} schema-manager DDL`, false, `${error.code || 'ERROR'} without connection details`);
  } finally {
    await connection.query(`DROP TABLE IF EXISTS ${tableName}`).catch(() => {});
    await connection.end().catch(() => {});
  }
}

if (process.argv.includes('--connection-check-only')) {
  const entry = configuration.test.passport;
  const connection = await connect(entry);
  try {
    const [[result]] = await connection.query('SELECT VERSION() AS serverVersion, DATABASE() AS databaseName');
    console.log(JSON.stringify({ serverVersion: result.serverVersion, databaseName: result.databaseName }));
  } finally {
    await connection.end();
  }
  process.exit(0);
}

await testPrincipal('passport', configuration.test.passport, 'ivp_test');
await testPrincipal('ivp', configuration.test.ivp, 'passport_test');
await testSchemaPrincipal('passport Test', configuration.test.passportSchema, 'ivp_test');
await testSchemaPrincipal('IVP Test', configuration.test.ivpSchema, 'passport_test');

if (configuration.development?.passport && configuration.development?.ivp && !process.argv.includes('--test-only')) {
  await testPrincipal('passport', configuration.development.passport, 'ivp_dev');
  await testPrincipal('ivp', configuration.development.ivp, 'passport_dev');
  await testSchemaPrincipal('passport Development', configuration.development.passportSchema, 'ivp_dev');
  await testSchemaPrincipal('IVP Development', configuration.development.ivpSchema, 'passport_dev');

  for (const [name, entry, otherServicePort] of [
    ['test passport credential rejected by Development', configuration.test.passport, configuration.development.passport.port],
    ['Development passport credential rejected by Test', configuration.development.passport, configuration.test.passport.port]
  ]) {
    let failed = false;
    try {
      const connection = await connect(entry, { port: otherServicePort });
      await connection.end();
    } catch (error) {
      failed = error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED';
    }
    check(name, failed, 'credential/environment boundary prevented connection');
  }
} else {
  console.log('BLOCKED Development/Test cross-environment checks require both isolated services.');
}

if (failures.length) process.exitCode = 1;
