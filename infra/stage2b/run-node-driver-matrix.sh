#!/bin/bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
export TTP2B_SECRETS_DIR="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
config_file="$TTP2B_SECRETS_DIR/db-connections.json"
test_dir="$repo_root/tests"
network="ttp2b-mysql-test-private"

for image in \
  'node:24.22.3@sha256:9e7ec64106f43779ecb669cb299cce07a033ac6c41603c1039dea7b51119e550' \
  'node:26.13.1@sha256:f577ca28c1ceb1c337e63be73bc745266640e2dc91dee3cd27270bd02dc8eb3b'; do
  docker run --rm --platform linux/arm64/v8 --network "$network" \
    --mount "type=bind,source=$test_dir,target=/workspace/tests,readonly" \
    --mount "type=bind,source=$config_file,target=/run/secrets/db-connections.json,readonly" \
    --workdir /workspace/tests \
    --env TTP2B_DB_CONFIG=/run/secrets/db-connections.json \
    --env TTP2B_NODE_HOST=mysql-test \
    --env TTP2B_NODE_PORT=3306 \
    "$image" node database/driver-smoke.mjs
done
