# Stage 2B isolated MySQL environments

This Compose project provisions only package-owned MySQL 8.4.13 Test and Development services. It does not alter the Wappler `db` SQLite connection or any MAMP service. The services use separate Docker bridge networks, data volumes, root credentials, application principals, databases, and loopback-only host bindings (`127.0.0.1:3307` for Test and `127.0.0.1:3308` for Development). They do not bind host port 3306 or expose a public inbound address. The loopback mapping is required for the Wappler host GUI and local test runner to connect.

## Bootstrap

1. Run `bash infra/stage2b/bootstrap-secrets.sh` from the repository root. Secret files are created outside Git under `~/.codex/ttpassport-stage2b-secrets` with mode 0600.
2. Set `TTP2B_SECRETS_DIR` to the printed directory.
3. Start Test first: `docker compose --profile test -f infra/stage2b/compose.yml up -d mysql-test`.
4. Verify the authenticated server identity with `SELECT VERSION(), @@version_comment, @@port` through a package-owned Test principal. Never infer server version from a host client.
5. Only after Test compatibility checks pass, start the separate Development service with `--profile development up -d mysql-development`.

The `mysql-init/10-create-boundaries.sh` initializer creates only synthetic `__ttp2b_synthetic_probe` tables and narrowly scoped DML principals. It creates no Stage 2C application schema. Deleting `ttp2b-mysql-test-data` or `ttp2b-mysql-development-data` is destructive; do so only for these explicitly disposable, package-owned environments after preserving required evidence.

## Teardown

Stop only Stage 2B services with the same Compose file and environment: `docker compose --profile test --profile development -f infra/stage2b/compose.yml stop mysql-test mysql-development`. Preserve volumes for reproducible retesting. Remove a service or its volume only for the documented Stage 2B rollback, and confirm the exact container/volume names before removal. Never run broad `docker system prune`, `docker volume prune`, or cleanup against MAMP or unrelated Compose projects.
