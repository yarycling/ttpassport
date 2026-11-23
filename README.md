# TTPASSPORT

The Trinidad & Tobago Online Passport Management System repository contains a Wappler web project and its approved 15-screen design preview. The current screens are presentation-only; they do not submit passport applications, authenticate users, perform identity verification, process payments, or make government decisions. This repository does not represent government or production approval.

## Open and run the project

1. Open this project folder in Wappler.
2. Select the `Development` target and use Wappler's Run control.
3. Open the local target at <http://localhost:3002/>.

The installed Wappler version observed during Stage 2A is 7.9.9. The configured server model and route handler are NodeJS; the target uses SQLite at `/db/db_dev.sqlite3`. The package manifest requires Node.js 22 or later and `npm start` runs `node ./index.js`. Use the Wappler Development target as the project launcher; do not start a second server on the same port.

## Repository map

| Path | Purpose and ownership |
|---|---|
| `.wappler/` | Wappler project metadata and target configuration; maintain through Wappler. |
| `app/config/` | Wappler-managed application configuration and the 15 route declarations. |
| `app/api/` | Reserved for future Wappler Server Connect actions; currently contains no application endpoints. |
| `app/modules/connections/` | Wappler-managed database connections. |
| `app/sockets/` | Existing Wappler socket configuration; no passport business workflow is implemented. |
| `views/` | The existing EJS screen files. Keep their paths aligned with `app/config/routes.json`. |
| `views/layouts/` and `views/partials/` | Shared public and back-office preview layouts and presentation components. |
| `public/assets/` | Public presentation assets only. Never store identity evidence, passport records, private uploads, payment data, or secrets here. |
| `public/dmxAppConnect/`, `public/bootstrap/5/`, and `lib/` | Wappler-managed or generated framework/runtime files; do not patch or reorganize directly. |
| `docs/` | Approved requirements, architecture, governance, integration, package and status records. |
| `docs/evidence/<PACKAGE-ID>/` | Non-sensitive command, browser, configuration and acceptance evidence for a package. |

Keep ordinary application behavior in Wappler-compatible App Connect and Server Connect components. Future work must follow the binding restrictions in [AGENTS.md](AGENTS.md) and the approved package baseline. Logical domain boundaries are documented in [the Stage 2A repository and code-structure baseline](docs/architecture/STAGE_2A_PROJECT_REPOSITORY_AND_CODE_STRUCTURE_BASELINE.md); they do not authorize implementation by themselves.

## Preview and security boundary

All 15 routes are design previews. The four `/design-preview/backoffice/...` routes are unauthenticated static design previews and must remain isolated from public deployment. Do not publish this application as an operational passport service. No live citizen identity data, payment, government registry, biometric, courier, or passport-production integration is configured.

## Validation evidence

Package status is tracked in [the project status register](docs/project/PROJECT_STATUS.md) and [the master development register](docs/project/MASTER_DEVELOPMENT_REGISTER.md). Stage evidence is kept under `docs/evidence/`. Stage 2A test results are recorded in `docs/evidence/TTP-2A/TEST_RECORD.md`. Do not treat local command or browser checks as human GUI acceptance, government approval, or production acceptance.
