# Recovery 02 Wappler Comparison Matrix

**Package:** TTP-2B-RECOVERY-02
**Observed:** 2026-11-23
**Wappler:** 7.9.9
**Disposition:** SQLite scenario A passed; scenarios B–D remain blocked; Query Builder root cause unconfirmed.

| Scenario | Project and connection | Query Builder phase/result | Native Server Connect | Disposition |
|---|---|---|---|---|
| A — New Wappler NodeJS project with SQLite | Disposable `TTP2B-R02-SQLite-New`; Development target; synthetic SQLite `db`; Wappler Run served this disposable project on port 3000. Accepted port 3002 was not used. | The Query Builder opened, displayed table `synthetic_recovery` with `fixture_id` and `label`, and showed `select * from \`synthetic_recovery\``. Executing the query displayed one row: `702 / r02-sqlite-ok`. | `GET http://127.0.0.1:3000/api/r02-query-test` returned HTTP 200 and `{"query":[{"fixture_id":702,"label":"r02-sqlite-ok"}]}`. | PASS for this SQLite project scenario. This does not establish MySQL support or prove the accepted TTPPASSPORT scaffold works in Wappler. |
| B — Disposable TTPPASSPORT scaffold with SQLite | Isolated copies exist outside the repository. Opening another Wappler project was refused at the observed five-project license limit; no license or project limit was bypassed. | Query Builder was not reached in Wappler for this scenario. | Not run. | BLOCKED — Wappler project capacity prevented a supported comparison. |
| C — New Wappler NodeJS project with MySQL 8.4.13 | A temporary MySQL connection form was opened for the package-owned Test service. The form was canceled before the password was entered or saved. The MySQL 8.4.13 service is reachable in separate test-harness checks. | MySQL Query Builder, driver/dialect selection and schema load were not attempted in this recovery after a local credential-exposure incident. | Not run. | BLOCKED — owner must rotate the eight exposed synthetic Test/Development principal credentials before Wappler credentials are handled again. Wappler GUI `mysql2` installation was not performed. |
| D — Disposable TTPPASSPORT scaffold with MySQL 8.4.13 | Opening another Wappler project is blocked by the same project capacity. No Test credentials were entered or saved in the accepted application. | Not reached. | Not run. | BLOCKED — Wappler project capacity and credential rotation prerequisites. |

## Interpretation

The earlier `Cannot read properties of undefined (reading 'track')` exception is **not confirmed as a universal Query Builder failure**: it was reproduced in earlier TTPPASSPORT/MySQL diagnostic attempts, while a later new NodeJS/SQLite project opened the Query Builder and executed a native query. These tests differ in both project scaffold and database type, and the TTPPASSPORT-copy and Wappler/MySQL comparisons remain unrun. The log fields `siteName=undefined, target=undefined` and the `track` property name do not establish whether context was missing, whether the fields are normal for this window, or whether the missing MySQL driver caused the earlier failure.

Current evidence therefore does **not** distinguish conclusively among a Wappler editor initialization issue, TTPPASSPORT project/target metadata, connection configuration, the missing Wappler application `mysql2` driver, MySQL compatibility, or another cause. Do not report a root cause or vendor defect without the blocked comparisons and a reproducible Wappler log/test case.

The earlier redacted Wappler failure excerpts and stack traces remain preserved in [WAPPLER_LOG_EXCERPT_REDACTED.txt](WAPPLER_LOG_EXCERPT_REDACTED.txt), [WAPPLER_DIAGNOSIS.md](../recovery/WAPPLER_DIAGNOSIS.md), and [WAPPLER_STACK_TRACE_REDACTED.txt](../recovery/WAPPLER_STACK_TRACE_REDACTED.txt). The current successful UI observation is transcribed in [WAPPLER_SQLITE_SUCCESS_OBSERVATION.txt](WAPPLER_SQLITE_SUCCESS_OBSERVATION.txt); no image file was persisted from the native-app screenshot API.
