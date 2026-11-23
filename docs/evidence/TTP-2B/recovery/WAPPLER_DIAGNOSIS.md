# Wappler Query Builder Diagnosis

**Package:** TTP-2B-RECOVERY-01
**Observed:** 2026-11-23
**Wappler version:** 7.9.9
**Disposition:** Failure phase confirmed; root cause unconfirmed

## Observed failure

The Wappler 7.9.9 Query Builder fails while its guest window is being opened from a Server Connect Database Query action using the temporary `passport_test` connection. The Wappler log records `initUI - Database Query Builder`, then `inspectConnectionFile` for `passport_test`, followed by an uncaught main-process `TypeError: Cannot read properties of undefined (reading 'track')` at `main_init.jsc:1:41437`. The same exception was recorded twice, at 00:50:01 and 00:52:12 local log time.

The failure occurs during the Query Builder window/open initialization. No interactive schema selection, table selection, SQL preview or query execution was reached. The stack is inside the packed Wappler application main process (`WebContents` listener / `openGuestWindow` path); the source location is a single minified line. The exact undefined object and caller state cannot be established from this stack alone.

The prior Stage 2B record reports that Wappler's Database Manager connection test to the isolated MySQL Test service succeeded. The Wappler log also records creation/inspection of the temporary connection metadata and reports `mysql2` as a missing dependency to add. The saved temporary connection/action files have since been removed from the project and target. No connection password or connection JSON is retained in this evidence. The application root currently has neither `mysql` nor `mysql2`; Knex 3.3.0 contains a MySQL2 dialect which requires the `mysql2` module. The isolated harness's MySQL2 3.24.6 smoke test is separate and does not prove the Wappler runtime can execute a query.

## What remains unconfirmed

- The term `track` does not identify the root cause. There is no evidence here that the failure is caused by MySQL, telemetry or a particular third-party library.
- A read-only Query Builder comparison against the active SQLite `db` connection was not completed. The Wappler editor's temporary `stage2b_db_probe` action and `passport_test` connection tabs were already unsaved in-memory artifacts; they were preserved and not saved, closed or discarded.
- Reproduction in a separate disposable Wappler project was not performed. The failure is reproducible in the accepted project's Wappler UI, but that is not sufficient to claim a general Wappler product defect.
- The exact temporary connection JSON cannot be inspected after rollback. The Wappler save/inspect log and earlier Database Manager connection-test record are the remaining metadata evidence.
- Wappler-native Server Connect execution, actual runtime driver/dialect identification, backup-restored row readback, and Wappler-native connection failure/recovery remain unverified.

The redacted stack excerpt is in [WAPPLER_STACK_TRACE_REDACTED.txt](WAPPLER_STACK_TRACE_REDACTED.txt). No support report was submitted because a Wappler defect and a minimal reproducible example have not been established. No Wappler framework or generated runtime file was modified.

## Retest boundary

The isolated MySQL server, test-only driver, backup/restore, database boundary checks and the existing browser regression suite passed as recorded in [SUPPLEMENTAL_RETEST_2026-11-23.md](SUPPLEMENTAL_RETEST_2026-11-23.md). They do not remove this Wappler compatibility blocker. CT-2B-002, CT-2B-003, CT-2B-006 and CT-2B-007 remain `BLOCKED` until the Wappler-native path can be verified safely.
