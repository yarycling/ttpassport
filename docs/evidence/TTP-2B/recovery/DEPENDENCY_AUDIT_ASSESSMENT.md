# Application Dependency Audit Assessment

**Package:** TTP-2B-RECOVERY-01
**Audit date:** 2026-11-23
**Application:** Wappler 7.9.9 scaffold, Node.js application
**Result:** Reproducible; six moderate package vulnerability records remain open

## Reproducibility method

The Wappler project originally had no tracked lockfile, so both original application audit commands returned `ENOLOCK`. The installed npm hidden lockfile at `node_modules/.package-lock.json` was used only in a disposable directory under `/tmp/ttp2b-audit-recovery.*`. It contained 328 package records. `npm ls --all --json` reported no dependency-tree problems, and all 328 hidden-lock records were matched to installed `package.json` versions with zero missing packages or version differences (`installed-tree-lock-comparison.json`). The 25 direct dependency ranges in the root `package.json` were retained as-is; only the root lock metadata was added to the disposable lock candidate.

The candidate lockfile passed `npm ci --dry-run --ignore-scripts --offline --no-audit --no-fund` in the disposable copy. Both `npm audit --json` and `npm audit --omit=dev --json` executed against it. The validated candidate was added as the root [package-lock.json](../../../../package-lock.json), without changing `package.json`, the installed dependency tree or Wappler-generated files. The same clean-install dry run passed at the project root. The tracked lockfile is version 3, 142,286 bytes, SHA-256 `6fbca182932dd078aef0cae0e9299c537b0feb3e2130f4430c3ed89958726ac9`.

The two root audit commands now execute and return exit code 1 because they report vulnerabilities, not because of a lockfile error. Both report six moderate package vulnerability records, zero high or critical findings. `--omit=dev` reports the same six because the application currently declares no `devDependencies`; `nodemon` is declared under `dependencies`. Full JSON evidence is retained in [app-audit-all.json](app-audit-all.json) and [app-audit-runtime.json](app-audit-runtime.json). The disposable-copy results are retained separately in [disposable-app-audit-all.json](disposable-app-audit-all.json) and [disposable-app-audit-runtime.json](disposable-app-audit-runtime.json). No `npm audit fix`, override, package replacement or dependency upgrade was run.

## Six npm audit package groups

The six npm audit vulnerability records arise from two underlying moderate availability/denial-of-service advisories. The installed tree and dependency paths are:

| Package record | Directness and installed path | Exposure assessment | Available fix evidence |
|---|---|---|---|
| `archiver@7.0.1` | Direct runtime dependency; audit chains through `archiver-utils@5.0.2` and `zip-stream@6.0.1`. | Wappler's `lib/modules/zip.js` imports Archiver and calls `archive.glob('*', ...)`. The current accepted GUI has no Server Connect business API exposing a ZIP operation. Reachability of the vulnerable paths through this application is not established. | npm's aggregate fix is `archiver@8.0.0`, a major update. Validate Wappler ZIP action/runtime compatibility and regressions before remediation. |
| `archiver-utils@5.0.2` | Transitive: `archiver@7.0.1 → archiver-utils@5.0.2 → glob@10.5.0`. Also reached below `zip-stream`. | Runtime dependency of the Wappler ZIP module through Archiver. | npm points to the Archiver 8.0.0 major update; no dependency override was evaluated or applied. |
| `glob@10.5.0` | Transitive under `archiver-utils@5.0.2`; affected by GHSA-3g3m-2fjr-6pw4. | The advisory concerns traversal work continuing after AbortSignal cancellation. The accepted Wappler ZIP module uses a fixed `'*'` pattern; no externally reachable glob input was found in the current 15-screen scaffold. This is a code-path observation, not an exploitability certification. | Advisory patched version is `glob@14.0.2`. npm's dependency-tree remediation points to Archiver 8.0.0, so Wappler compatibility needs a regression review. |
| `minimatch@9.0.9` | Transitive below `glob@10.5.0`; affected by GHSA-g3hv-75wg-m249. | Pattern-amplification DoS risk if attacker-influenced patterns reach the package. No such application input is present in the accepted GUI or Server Connect inventory. | Advisory patched version is `minimatch@11.0.1`; the audit's Archiver path requires a major dependency-chain update. |
| `nodemon@3.1.14` | Direct dependency under `dependencies`; its nested `minimatch@10.2.6` is the second affected minimatch instance. `nodemonConfig` declares project watch paths. | Nodemon is a development watcher, not imported by current application handlers. It is still included by `npm audit --omit=dev` because it is declared as a runtime dependency. Watch patterns are project-configured rather than applicant-controlled. | npm reports a compatible fix as available (`fixAvailable: true`); re-check the exact release and Wappler development-runner behavior when separately authorized to remediate. |
| `zip-stream@6.0.1` | Transitive: `archiver@7.0.1 → zip-stream@6.0.1 → archiver-utils@5.0.2`. | Present in the runtime archive path; no accepted GUI business API exposes it today. | npm reports a compatible fix as available (`fixAvailable: true`) but does not name the resolved target in the audit record. Re-check and test with Wappler-managed dependency tooling before changing it. |

The advisory records identify the `glob` issue as [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) (CVE-2026-118773; patched in glob 14.0.2) and the `minimatch` issue as [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) (CVE-2026-118764; patched in minimatch 11.0.1). Both are moderate availability findings. The exact npm audit package paths, advisory titles, `fixAvailable` values and installed package versions are in the retained JSON results.

## Wappler compatibility and recommended handling

Adding the lockfile did not change the Wappler project manifest, installed versions, runtime driver availability, connections, routes or port. The npm clean-install dry run confirmed that the lock and manifest are consistent without changing `node_modules`. Wappler's GUI package-manager operation was not repeated with the new lockfile, so GUI package-manager behavior remains unverified. The original UI log shows Wappler identifying `mysql2` as a missing dependency to add; that dependency remains absent from the application and was not added in this recovery.

Do not treat the test harness's zero-advisory audit as the application audit. Keep all six package findings open for owner-reviewed remediation. Use Wappler-supported dependency management, test `archiver` 8 against the ZIP module and any configured Wappler actions, re-test the development watcher after a compatible Nodemon update, then rerun audits and the full route/runtime suite. Do not use overrides to bypass Wappler dependency constraints.
