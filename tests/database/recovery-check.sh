#!/bin/bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
secrets_dir="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
private_dir="$secrets_dir/private-evidence"
mkdir -p "$private_dir"
chmod 700 "$private_dir"
export TTP2B_DB_CONFIG="$secrets_dir/db-connections.json"

"$repo_root/infra/stage2b/run-compose.sh" --profile test stop mysql-test >/dev/null
set +e
(cd "$repo_root/tests" && npm run test:db -- --connection-check-only) > "$private_dir/expected-outage.log" 2>&1
failure_code=$?
set -e
if [[ $failure_code -eq 0 ]]; then
  echo "FAIL isolated Test connection did not fail while its package-owned service was stopped"
  exit 1
fi
echo "PASS Test connection failed while only ttp2b-mysql-test was stopped"

"$repo_root/infra/stage2b/run-compose.sh" --profile test start mysql-test >/dev/null
recovery_log="$private_dir/recovery-connection-check.log"
recovered=0
for attempt in $(seq 1 30); do
  if (cd "$repo_root/tests" && npm run test:db -- --connection-check-only) >"$recovery_log" 2>&1; then
    cat "$recovery_log"
    recovered=1
    break
  fi
  sleep 1
done
if [[ $recovered -ne 1 ]]; then
  echo "FAIL isolated Test service did not restore an authenticated connection within 30 seconds"
  tail -n 24 "$recovery_log"
  exit 1
fi
echo "PASS Test service recovered and authenticated connection succeeded"
