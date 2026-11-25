# Test Command Results — 2026-11-24

Environment: Wappler 7.9.9 Development target at `127.0.0.1:3002`; Node `v23.6.0`; Playwright `1.65.1` with Chromium; local MailHog; Passport/IVP Development databases; synthetic accounts and files.

| Command | Expected | Actual | Result |
|---|---|---|---|
| `npm --prefix tests run test:gui -- gui/citizen-completion.spec.mjs gui/citizen-ivp.spec.mjs gui/citizen-mvp.spec.mjs` | Completion, IVP ownership and prior citizen flow pass. | `3 passed (1.0m)`; the three named browser specs passed. | PASS |
| `npm --prefix tests run test:config` | Preserve port 3002, SQLite `db`, accepted routes/layouts. | `PASS Wappler port 3002, SQLite connection db, and all 15 accepted routes/layouts are unchanged.` | PASS |
| `npm --prefix tests run test:api:inventory` | Accurate route/action inventory; loopback helper restrictions. | 15 GUI routes; actual citizen/IVP Server Connect actions inventoried; `GET /` returned 200; non-loopback base and authority-overriding path rejected. | PASS |
| `npm --prefix tests run test:security` | Scan current diff and changed/untracked repository files for configured sensitive patterns. | `PASS scanned 123 changed/untracked files and the current diff against origin/main; no configured secret/private-file patterns found.` Manual inspection separately found credential-bearing test traces; see the implementation record. | PASS WITH FINDING |
| `git diff --check` | No whitespace errors. | Exit code 0; no output. | PASS |
| `curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:3002/` | Development target responds. | `HTTP 200` | PASS |
| `node --version`; `npm exec --prefix tests -- playwright --version` | Record actual local runtimes. | `v23.6.0`; `Version 1.65.1` | INFO |

The application-root package does not define `test:config`, `test:api:inventory`, or `test:security` scripts. Those initial root-level invocations were not test executions; the same checks were run successfully through the approved `tests/` harness above.

### Browser evidence

Passing screenshots are under `screenshots/citizen-completion/`, `screenshots/citizen-regression/`, and `screenshots/ivp-regression/`. Earlier failed-run screenshots and text contexts, along with credential-bearing trace archives, are preserved in a private local archive outside the repository and are not part of the publication set. The root `test-results/` directory was not changed.

Subsequent MVP release-candidate reruns wrote additional local browser output under the root `test-results/` directory. It remains untracked and is excluded from publication.

The new saved-application review state has no matching approved pixel baseline. Responsive/browser checks passed, but formal pixel comparison remains `BLOCKED` and is not reported as a pass.
