# Wappler Editor Cleanup and Credential Incident

**Package:** TTP-2B-RECOVERY-02
**Observed:** 2026-11-23
**Accepted application state:** Unchanged at starting commit `9b94dc883f3350b816b108371ab3df4f288e3653` during inspection.

## Editor artifact cleanup

- The active Wappler window was the disposable project `TTP2B-R02-SQLite-New`, Wappler 7.9.9, Development target. Its saved `db` connection is SQLite and its package-owned diagnostic action is `r02-query-test`.
- The temporary MySQL connection dialog for `passport_test` was canceled using Wappler's Cancel control. Its password field was blank; no password was entered, and no MySQL connection was saved to the disposable project or accepted application.
- A search of the accepted application and disposable app folders found no saved `passport_test.json` or `stage2b_db_probe` action/connection file. The only Server Connect action in the active disposable project is the reviewed synthetic SQLite action `app/api/r02-query-test.json`.
- The disposable Wappler server was stopped through Wappler's own run control; a subsequent local check found no listener on port 3000. The accepted application continued to return HTTP 200 on port 3002.
- The accepted application's `app/config/config.json`, `app/modules/connections/db.json`, `app/config/routes.json`, `package.json`, `package-lock.json` and `.wappler` tree have no Git changes. The configuration guard confirms port 3002, SQLite connection `db`, and all 15 accepted routes.
- **Wappler restart/reopen is pending.** A computer-use credential handoff became necessary after local credential material surfaced in an accessibility snapshot. Do not restart or open another project until the owner completes the rotation and the recovery is resumed. Wappler's five-project license limit remains respected; no limit was bypassed.

## Local credential exposure and required owner action

While inspecting an already-open private TextEdit document, the accessibility snapshot displayed all eight password values from the private Stage 2B connection configuration: Passport and IVP runtime/schema principals in both Test and Development. A separate, unrelated open document surfaced a key identifier and public-key material only; no private-key block was displayed. No credential or key material was written into repository files, copied into Wappler, or added to command logs. TextEdit was quit immediately after the additional open document was noticed.

Because the eight database passwords were exposed in local tool output, pause all credential-dependent Wappler work. The owner must rotate the eight synthetic principals on the package-owned MySQL 8.4.13 Test and Development services and update the matching private password files and `db-connections.json` under `~/.codex/ttpassport-stage2b-secrets`. Do not send replacement passwords in chat. This agent must not enter replacement passwords or change database credentials; the computer-use handoff rule requires the owner to enter and submit new credentials personally. After the owner confirms rotation, rerun authenticated identity, connection, isolation and recovery checks before Wappler MySQL UI testing.

The package-owned MySQL containers and volumes were not modified in response to this incident. They remained available on their existing loopback-only ports during inspection. The owner should complete rotation before resuming any database credential testing.

## Disposition

Editor cleanup is **PARTIAL**: the unsaved MySQL form is canceled and no `passport_test` connection was saved, but a Wappler restart and reopening the accepted project could not be verified before the credential handoff. CT-2B-011 remains **BLOCKED** until the editor is reopened on TTPASSPORT and the accepted Development target/configuration is verified through Wappler.
