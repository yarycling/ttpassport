#!/bin/bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
secrets_dir="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
container="ttp2b-mysql-test"
backup_dir="$secrets_dir/backups"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
umask 077

server_identity="$(docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names -e 'SELECT CONCAT(VERSION(), "|", @@port)')"
if [[ "$server_identity" != 8.4.*\|3306 ]]; then
  echo "BLOCKED refusing backup/restore because authenticated server identity is not the pinned Stage 2B Test server"
  exit 1
fi

for name in passport ivp; do
  if [[ "$name" == passport ]]; then source_db=passport_test; restore_db=passport_test_restore; else source_db=ivp_test; restore_db=ivp_test_restore; fi
  source_exists="$(docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names -e "SHOW DATABASES LIKE '$source_db'")"
  if [[ "$source_exists" != "$source_db" ]]; then
    echo "BLOCKED expected synthetic source database is missing"
    exit 1
  fi
  docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names \
    -e "DROP DATABASE IF EXISTS $restore_db; CREATE DATABASE $restore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"
  docker exec -e LC_ALL=C "$container" mysqldump --defaults-extra-file=/run/secrets/root_client.cnf --no-create-db --skip-triggers --no-tablespaces --order-by-primary --skip-comments --single-transaction "$source_db" > "$backup_dir/$source_db.sql"
  docker exec -i "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf "$restore_db" < "$backup_dir/$source_db.sql"
  source_digest="$(docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names -e "SELECT CONCAT(COUNT(*), ':', SHA2(GROUP_CONCAT(CONCAT_WS(':', probe_key, probe_value) ORDER BY probe_key SEPARATOR '|'), 256)) FROM $source_db.__ttp2b_synthetic_probe")"
  restore_digest="$(docker exec "$container" mysql --defaults-extra-file=/run/secrets/root_client.cnf --batch --skip-column-names -e "SELECT CONCAT(COUNT(*), ':', SHA2(GROUP_CONCAT(CONCAT_WS(':', probe_key, probe_value) ORDER BY probe_key SEPARATOR '|'), 256)) FROM $restore_db.__ttp2b_synthetic_probe")"
  if [[ "$source_digest" != "$restore_digest" ]]; then
    echo "FAIL $name backup/restore integrity differs"
    exit 1
  fi
  checksum="$(LC_ALL=C shasum -a 256 "$backup_dir/$source_db.sql" | awk '{print $1}')"
  echo "PASS $name backup restored and synthetic-fixture digest matches (backup sha256 $checksum)"
done

echo "PASS private backups and restored fixtures remain outside the repository"
