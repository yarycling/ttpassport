# Wappler Editor Cleanup and Credential Incident

**Package:** TTP-2B-RECOVERY-02
**Observed:** 2026-11-23
**Accepted application state:** Unchanged at starting commit `9b94dc883f3350b816b108371ab3df4f288e3653` during inspection.

## Initial editor state before resumed testing

- The active Wappler window was the disposable project `TTP2B-R02-SQLite-New`, Wappler 7.9.9, Development target. Its saved `db` connection is SQLite and its package-owned diagnostic action is `r02-query-test`.
- The temporary MySQL connection dialog for `passport_test` was canceled using Wappler's Cancel control. Its password field was blank; no password was entered, and no MySQL connection was saved to the disposable project or accepted application.
- A search of the accepted application and disposable app folders found no saved `passport_test.json` or `stage2b_db_probe` action/connection file. The only Server Connect action in the active disposable project is the reviewed synthetic SQLite action `app/api/r02-query-test.json`.
- The disposable Wappler server was stopped through Wappler's own run control; a subsequent local check found no listener on port 3000. The accepted application continued to return HTTP 200 on port 3002.
- The accepted application's `app/config/config.json`, `app/modules/connections/db.json`, `app/config/routes.json`, `package.json`, `package-lock.json` and `.wappler` tree have no Git changes. The configuration guard confirms port 3002, SQLite connection `db`, and all 15 accepted routes.
- At this initial checkpoint, Wappler restart/reopen was pending and credential-dependent testing was paused after local credential material surfaced in an accessibility snapshot. The owner later authorized continuation without rotation using only the existing synthetic Passport Test credential. Wappler's five-project license limit remains respected; no limit was bypassed.

## Historical local credential exposure and initial owner action request

While inspecting an already-open private TextEdit document, the accessibility snapshot displayed all eight password values from the private Stage 2B connection configuration: Passport and IVP runtime/schema principals in both Test and Development. A separate, unrelated open document surfaced a key identifier and public-key material only; no private-key block was displayed. No credential or key material was written into repository files, copied into Wappler, or added to command logs. TextEdit was quit immediately after the additional open document was noticed.

The initial incident response requested rotation of the eight synthetic principals on the package-owned MySQL 8.4.13 Test and Development services and updating matching private password files and `db-connections.json` under `~/.codex/ttpassport-stage2b-secrets`. This was a request made before the owner's later decision to continue without rotation; no rotation was performed. Do not send replacement passwords in chat. The subsequent tests were limited to the existing synthetic Passport Test credential as authorized by the owner.

The package-owned MySQL containers and volumes were not modified in response to this incident. They remained available on their existing loopback-only ports during the initial inspection. The initial rotation request above is historical: the owner later elected to continue without rotation using only the existing synthetic Passport Test credential, as recorded in the subsequent sections.

## First resumed inspection — 2026-11-23

The owner chose to continue without rotating credentials and explicitly authorised use of the existing synthetic Passport Test credential for the package-owned Test database. No new credential was requested or entered. This owner disposition permits the limited continuation; it does not undo or remove the prior local transcript exposure. No Development credential or any of the other Test principals was used. The temporary saved connection/action and running server state in this section are historical; the later cleanup section records the final state.

Wappler remained open on the disposable project `TTP2B-R02-SQLite-New`. The temporary `passport_test` connection is now saved in that disposable project's Wappler configuration, and its Test schema and a synthetic fixture read were verified in Database Manager. The temporary Server Connect action `r02-mysql-test.json` is still empty. At the end of the observation, Wappler Run had the disposable server listening on port 3000. These temporary artifacts have **not** been cleaned up, and CT-2B-011 remains **BLOCKED**. Do not treat the earlier canceled form as describing this later state.

The accepted TTPPASSPORT repository was clean at `78d4c3c854d4a4a2a5c76236773d51d335e2fc06` at the start of this resumed pass; its Development port 3002, SQLite `db` connection and 15 routes remain unchanged. The new native Database Manager observation is recorded in [WAPPLER_MYSQL_DATABASE_MANAGER_OBSERVATION.txt](WAPPLER_MYSQL_DATABASE_MANAGER_OBSERVATION.txt). No screenshot was persisted.

Historical disposition before the resumed inspection: editor cleanup was **PARTIAL**; the unsaved MySQL form was canceled and no `passport_test` connection had been saved at that point. CT-2B-011 remained **BLOCKED** pending a Wappler restart/reopen and accepted-project verification. The resumed inspection above records the later saved disposable-project connection state.

## Final disposable artifact cleanup — 2026-11-23

After the native MySQL query and outage/recovery tests, Wappler Database Manager deleted the disposable project's saved `passport_test` connection. The `r02-mysql-test.json` tab was closed and its diagnostic action file was removed from `/private/tmp/ttp2b-recovery02/app/api/`. The synthetic SQLite `db` connection and `r02-query-test` action/project were preserved. Searches found no `passport_test`, `r02-mysql-test`, or `stage2b_db_probe` references in the disposable `.wappler`, `app/config`, or `app/api` paths.

With the disposable server still running, `/api/r02-mysql-test` returned HTTP 404. The Wappler local server was then stopped through its Wappler control; port 3000 had no listener afterward. The accepted app returned HTTP 200 on port 3002 and its configuration guard retained SQLite `db` and all 15 routes. The package-owned Test and Development MySQL services remained running and healthy. MAMP PRO remained running; port 3306 had no listener during the final check, and no MAMP or unrelated database control was used.

The owner authorized only the existing synthetic Passport Test credential for this continuation. The Passport Test runtime principal's grants exclude `passport_test_restore`; no root credential or additional principal was used, no grant was widened, and Wappler readback of restored records remains **BLOCKED**. Temporary connection/action cleanup passed, but CT-2B-011 remains **BLOCKED overall** because Wappler was not restarted/reopened on the accepted TTPPASSPORT project. The cleanup transcript is [resumed-wappler-cleanup.txt](resumed-wappler-cleanup.txt).
