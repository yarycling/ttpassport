# TTP-TEST-STANDARD-01 Policy Test Record

**Package:** TTP-TEST-STANDARD-01 — Mandatory Automated Testing Policy
**Date:** 22 November 2026
**Scope:** `AGENTS.md` testing responsibilities and report template; no application functionality changed.
**Acceptance:** `AC-TTP-TEST-STANDARD-01-001` — Require Codex-executed applicable automated tests for every development package, including browser, responsive, accessibility and visual regression tests when the UI changes, while retaining human final acceptance.

## Results

| Test ID | Acceptance ID | Environment | Command / method | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|---|
| CT-TTP-TEST-STANDARD-01-001 | AC-TTP-TEST-STANDARD-01-001 | Local repository | Python structural/content assertions against `AGENTS.md` | Required sections, test ownership, browser automation, viewports, screenshot comparison, blocked-test handling, owner sign-off and Wappler protections are present | All nine assertions passed; Markdown fences are balanced | PASS | `AGENTS.md` |
| CT-TTP-TEST-STANDARD-01-002 | AC-TTP-TEST-STANDARD-01-001 | Local Git worktree | `git diff --check` | No whitespace errors in the patch | Exit code 0; no output | PASS | `AGENTS.md` |
| CT-TTP-TEST-STANDARD-01-003 | AC-TTP-TEST-STANDARD-01-001 | Local Git worktree | `git status --short`; inspect tracked and untracked paths and protected runtime paths | Only policy/evidence documentation changes; no application or Wappler runtime changes | `AGENTS.md` and this evidence record only; no application or protected runtime files changed | PASS | Git status and diff |
| CT-TTP-TEST-STANDARD-01-004 | AC-TTP-TEST-STANDARD-01-001 | Local repository | App/browser/backend/database suite applicability review | Run package-relevant tests; mark unrelated application suites N/A with scope reason | No GUI, server, database, authentication, API, or application behavior changed; these suites are N/A for this policy-only package | N/A | This record |

## Validation limitations

No Markdown parser or dedicated Markdown linter was installed in the workspace. Validation therefore used Git whitespace checking, balanced-fence and required-section/content assertions, and manual diff review. No extra dependency was installed for this policy-only change.

During validation, an initial whole-file whitespace assertion also flagged existing intentional Markdown hard-break spaces in unchanged `AGENTS.md` content; the final whitespace check was scoped to added lines and `git diff --check`. An initial changed-path check used `git diff --name-only`, which omits untracked files; the final scope audit included untracked paths from Git status.

## Acceptance state

Human owner review and final acceptance remain pending. This policy change does not close another package or authorise Stage 2 work.
