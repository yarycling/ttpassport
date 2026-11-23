#!/bin/bash
set -euo pipefail

umask 077
secrets_dir="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
mkdir -p "$secrets_dir"
chmod 700 "$secrets_dir"

for name in \
  test-root-password \
  passport-test-password \
  ivp-test-password \
  passport-test-schema-password \
  ivp-test-schema-password \
  development-root-password \
  passport-development-password \
  ivp-development-password \
  passport-development-schema-password \
  ivp-development-schema-password; do
  path="$secrets_dir/$name.txt"
  if [[ ! -e "$path" ]]; then
    openssl rand -hex 32 > "$path"
    chmod 600 "$path"
  fi
done

for env_name in test development; do
  root_password="$(cat "$secrets_dir/$env_name-root-password.txt")"
  printf '[client]\nuser=root\npassword=%s\nprotocol=socket\n' "$root_password" > "$secrets_dir/$env_name-root-client.cnf"
  chmod 600 "$secrets_dir/$env_name-root-client.cnf"
done

TTP2B_SECRETS_DIR="$secrets_dir" node <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const directory = process.env.TTP2B_SECRETS_DIR;
const read = name => fs.readFileSync(path.join(directory, name), 'utf8').trim();
const config = {
  test: {
    passport: { host: '127.0.0.1', port: 3307, database: 'passport_test', user: 'passport_test_user', password: read('passport-test-password.txt') },
    ivp: { host: '127.0.0.1', port: 3307, database: 'ivp_test', user: 'ivp_test_user', password: read('ivp-test-password.txt') },
    passportSchema: { host: '127.0.0.1', port: 3307, database: 'passport_test', user: 'passport_test_schema', password: read('passport-test-schema-password.txt') },
    ivpSchema: { host: '127.0.0.1', port: 3307, database: 'ivp_test', user: 'ivp_test_schema', password: read('ivp-test-schema-password.txt') }
  },
  development: {
    passport: { host: '127.0.0.1', port: 3308, database: 'passport_dev', user: 'passport_dev_user', password: read('passport-development-password.txt') },
    ivp: { host: '127.0.0.1', port: 3308, database: 'ivp_dev', user: 'ivp_dev_user', password: read('ivp-development-password.txt') },
    passportSchema: { host: '127.0.0.1', port: 3308, database: 'passport_dev', user: 'passport_dev_schema', password: read('passport-development-schema-password.txt') },
    ivpSchema: { host: '127.0.0.1', port: 3308, database: 'ivp_dev', user: 'ivp_dev_schema', password: read('ivp-development-schema-password.txt') }
  }
};
const output = path.join(directory, 'db-connections.json');
fs.writeFileSync(output, JSON.stringify(config, null, 2), { mode: 0o600 });
fs.chmodSync(output, 0o600);
NODE

cat <<EOF
Stage 2B secret files are stored outside the repository at:
$secrets_dir

Set TTP2B_SECRETS_DIR to that path when invoking docker compose.
The private connection file is db-connections.json in that directory.
Do not print, commit, screenshot, or paste these values.
EOF
