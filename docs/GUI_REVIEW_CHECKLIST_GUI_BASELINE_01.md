# GUI-BASELINE-01 — Owner GUI Review Checklist

**Human GUI acceptance:** `PENDING`  
**Latest update:** `GUI-BASELINE-01B` — government branding and port 3002  
**Review URL:** [Citizen home preview](http://localhost:3002/)  
**Target behavior:** visual acceptance only. Do not use real credentials, identity details or documents in these UI-only pages.

## GUI-BASELINE-01B — Branding and port review

Please review these additions alongside the original 12 GUI scenarios below. Leave final acceptance as `PENDING` until you have completed your review and report `PASS` or `FAIL`.

1. At [http://localhost:3002/](http://localhost:3002/), confirm the 2025 Coat of Arms displays at a clear size in the shared government masthead, with its proportions preserved and no clipping or pixelation.
2. Open a citizen screen and a back-office preview screen. Confirm both use the same government masthead and the footer emblem is legible against its backing.
3. Review the crest at 1440 px and 375 px. Confirm it remains readable on the deep-crimson theme without causing horizontal scrolling or crowding the navigation.
4. Confirm the homepage and a direct nested route still load at `http://localhost:3002/` after restarting the local Development app.
5. Confirm the existing preview warning remains clear and that no credential, application, verification or payment action is enabled.

Please review these 12 scenarios and report `PASS` or `FAIL` with notes:

1. At 1440 px, confirm the shared masthead, preview label, owner-supplied Coat of Arms and public navigation are legible.
2. At 1440 px, confirm the selected hero asset, editable heading and CTAs do not overlap the passport/skyline artwork.
3. Review the three service cards and eligibility/help panel. Confirm renewal is plainly unavailable and no policy or support text appears authoritative without approval.
4. At 1024 px and 768 px, review masthead/navigation, hero text placement, card stacking and the mobile navigation collapse.
5. At 375 px, open and close the navigation with keyboard and touch. Confirm the hero stays readable and no page-level horizontal scroll appears.
6. Review sign-in, registration, email verification, forgot password and reset password. Confirm disabled controls and warnings make clear that credentials are not accepted.
7. Review the citizen dashboard and tracking shell. Confirm empty states cannot be mistaken for real applications or a successful lookup.
8. Review the first-time wizard at `/citizen/apply/first-time`. Move through all nine stages with the stepper and Back/Continue. Confirm fields, upload and Save Draft remain disabled.
9. Review the back-office overview and queue. Confirm the passport-only navigation, explicit preview warning, no live counts and empty queue layout.
10. Review the staff workspace tabs and administration shell. Confirm no applicant records or actionable approve/reject/release/role controls are present.
11. Review `/verification/preview` and `/verification/preview/review`. Confirm no camera permission, real upload, biometric result or `VERIFIED` claim appears.
12. At 200% zoom and keyboard-only navigation, check heading order, visible focus, labels, notices, disabled states, touch targets and content readability.

## Review routes

- Citizen home: [http://localhost:3002/](http://localhost:3002/)
- Sign-in: [http://localhost:3002/account/sign-in](http://localhost:3002/account/sign-in)
- Registration: [http://localhost:3002/account/register](http://localhost:3002/account/register)
- Citizen dashboard: [http://localhost:3002/citizen/dashboard](http://localhost:3002/citizen/dashboard)
- First-time wizard: [http://localhost:3002/citizen/apply/first-time](http://localhost:3002/citizen/apply/first-time)
- Tracking: [http://localhost:3002/citizen/track](http://localhost:3002/citizen/track)
- Back-office overview: [http://localhost:3002/design-preview/backoffice/overview](http://localhost:3002/design-preview/backoffice/overview)
- Applications/queue: [http://localhost:3002/design-preview/backoffice/applications](http://localhost:3002/design-preview/backoffice/applications)
- Staff review: [http://localhost:3002/design-preview/backoffice/review](http://localhost:3002/design-preview/backoffice/review)
- Administration: [http://localhost:3002/design-preview/backoffice/administration](http://localhost:3002/design-preview/backoffice/administration)
- eKYC capture guidance: [http://localhost:3002/verification/preview](http://localhost:3002/verification/preview)
- eKYC review status: [http://localhost:3002/verification/preview/review](http://localhost:3002/verification/preview/review)
