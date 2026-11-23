#!/bin/bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
export TTP2B_SECRETS_DIR="${TTP2B_SECRETS_DIR:-$HOME/.codex/ttpassport-stage2b-secrets}"
exec docker compose -f "$repo_root/infra/stage2b/compose.yml" "$@"
