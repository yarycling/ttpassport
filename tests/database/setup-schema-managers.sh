#!/bin/bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
secrets_dir="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
mode="${1:-test}"

case "$mode" in
  test)
    container=ttp2b-mysql-test
    passport_db=passport_test
    ivp_db=ivp_test
    passport_user=passport_test_schema
    ivp_user=ivp_test_schema
    passport_pw="$secrets_dir/passport-test-schema-password.txt"
    ivp_pw="$secrets_dir/ivp-test-schema-password.txt"
    ;;
  development)
    container=ttp2b-mysql-development
    passport_db=passport_dev
    ivp_db=ivp_dev
    passport_user=passport_dev_schema
    ivp_user=ivp_dev_schema
    passport_pw="$secrets_dir/passport-development-schema-password.txt"
    ivp_pw="$secrets_dir/ivp-development-schema-password.txt"
    ;;
  *) echo "Expected test or development" >&2; exit 2 ;;
esac

server_version="$(docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names -e 'SELECT VERSION()')"
if [[ "$server_version" != 8.4.* ]]; then
  echo "BLOCKED: refusing account setup on an unverified Stage 2B server"
  exit 1
fi

passport_password="$(cat "$passport_pw")"
ivp_password="$(cat "$ivp_pw")"
docker exec -i "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf <<SQL
CREATE USER IF NOT EXISTS '$passport_user'@'%' IDENTIFIED BY '$passport_password';
CREATE USER IF NOT EXISTS '$ivp_user'@'%' IDENTIFIED BY '$ivp_password';
ALTER USER '$passport_user'@'%' IDENTIFIED BY '$passport_password';
ALTER USER '$ivp_user'@'%' IDENTIFIED BY '$ivp_password';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON $passport_db.* TO '$passport_user'@'%';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON $ivp_db.* TO '$ivp_user'@'%';
SQL
unset passport_password ivp_password
echo "PASS Stage 2B schema-management principals are separate and database-scoped ($mode)"
