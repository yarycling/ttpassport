# CT-2A-005 Browser and Responsive Test Summary

**Environment:** Firefox on macOS; Wappler Development app at `http://localhost:3002/`; Wappler 7.9.9 project target. Browser Responsive Design Mode.<br>
**Execution date:** 22 November 2026<br>
**Method:** Codex-controlled native Firefox UI; route navigation through address bar; Firefox Web Console evaluated read-only page metrics; exact CSS viewport set to 1440, 1024, 768 and 375 px. Screenshots were captured from the responsive viewport at 1440 and 375 px. No user data was entered.

## Route and viewport results

The same 15 routes were loaded at each of the four widths (60 route/viewport observations total). Every route rendered its page heading. For every measurement, `window.innerWidth` matched the configured CSS viewport and `document.documentElement.scrollWidth` matched `innerWidth`. Each page had zero incomplete/broken `<img>` elements, zero `<img>` elements missing `alt`, and zero unnamed buttons or form controls (button/input/select/textarea with no visible text, accessible name, label or title).

| Route | 1440 px | 1024 px | 768 px | 375 px |
|---|---|---|---|---|
| `/` | PASS | PASS | PASS | PASS |
| `/account/sign-in` | PASS | PASS | PASS | PASS |
| `/account/register` | PASS | PASS | PASS | PASS |
| `/account/verify-email` | PASS | PASS | PASS | PASS |
| `/account/forgot-password` | PASS | PASS | PASS | PASS |
| `/account/reset-password` | PASS | PASS | PASS | PASS |
| `/citizen/dashboard` | PASS | PASS | PASS | PASS |
| `/citizen/apply/first-time` | PASS | PASS | PASS | PASS |
| `/citizen/track` | PASS | PASS | PASS | PASS |
| `/design-preview/backoffice/overview` | PASS | PASS | PASS | PASS |
| `/design-preview/backoffice/applications` | PASS | PASS | PASS | PASS |
| `/design-preview/backoffice/review` | PASS | PASS | PASS | PASS |
| `/design-preview/backoffice/administration` | PASS | PASS | PASS | PASS |
| `/verification/preview` | PASS | PASS | PASS | PASS |
| `/verification/preview/review` | PASS | PASS | PASS | PASS |

## Keyboard and accessibility checks

- At 375 px, Firefox keyboard navigation with `Tab` focused the first in-page link, “Skip to main content,” which targets `/#content`.
- Accessible-name checks found no unnamed visible buttons or form controls across the route/viewport checks. Page images had alternative text.
- These focused checks are not a complete WCAG conformance audit. Human GUI/business acceptance remains pending.

## Console and failed resource

- No JavaScript runtime error was observed in Firefox Web Console during the route sweep.
- Firefox made an implicit `GET /favicon.ico` request, which returned HTTP 404. This request is not configured in the 15-route application map and has no corresponding static asset. The finding is the reason CT-2A-005 is recorded `FAIL`, despite the 60 layout/accessibility observations passing.
- The favicon is outside the approved Stage 2A documentation/repository-structure scope. No view, route, configuration, or visual asset was changed to address it. Resolve it through an approved scope update and rerun the affected browser checks.

## Screenshot inventory

Full responsive screenshots are in `docs/evidence/TTP-2A/screenshots/`: one per route at 1440 px and one per route at 375 px (30 screenshots). Screenshot names use the route slug plus `-1440.png` or `-375.png`. No screen, layout, style, route or asset source changed in Stage 2A, so screenshot pixel comparison against the earlier GUI baseline is `N/A` for this package. The historical GUI evidence did not retain raw baseline screenshots.
