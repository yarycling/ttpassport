# Owner Desktop Walkthrough — Adult Citizen MVP

**Environment:** local Development only. Use synthetic values and files. Do not enter real identity, passport, citizenship or biometric evidence. The visual baseline remains **PENDING OWNER APPROVAL**.

## Local pages

- Development portal: <http://127.0.0.1:3002>
- Registration: <http://127.0.0.1:3002/account/register>
- Email verification: <http://127.0.0.1:3002/account/verify-email>
- Sign-in: <http://127.0.0.1:3002/account/sign-in>
- Password recovery: <http://127.0.0.1:3002/account/forgot-password>
- Local MailHog inbox: <http://127.0.0.1:8025>
- Citizen dashboard: <http://127.0.0.1:3002/citizen/dashboard>
- First-time application: <http://127.0.0.1:3002/citizen/apply/first-time>
- Linked eKYC capture: <http://127.0.0.1:3002/verification/preview>
- Linked eKYC results: <http://127.0.0.1:3002/verification/preview/review>

The Development application and local MailHog must be running. Its Wappler Mailer reads the existing local-only SMTP values from `TTP_MAILHOG_USERNAME` and `TTP_MAILHOG_PASSWORD` in the ignored `.env` file; no password is included here or in Git. No test account password is included in this record. The owner can register a fresh synthetic adult account, choose a private password, and follow the one-time link delivered to local MailHog. Do not reuse or publish automated test credentials. For password recovery, request a link at the recovery page and open it from MailHog.

## Walkthrough

1. Register a fresh test account using an owner-controlled local test email address and a self-chosen private password. Verify the address from MailHog, then sign in.
2. Review the account verification and password recovery screens. Confirm unverified sign-in is blocked and recovery requires the one-time email link.
3. Open the citizen dashboard and start a first-time application. Use a self-reported adult (18+) synthetic profile. Save personal, family and citizenship information and applicant-supplied recommender/reference details. No external person is contacted or represented as having consented.
4. Upload a clearly synthetic supporting document and a separate synthetic proposed passport photo. Confirm the application review lists private evidence metadata and distinguishes the proposed passport photo from IVP evidence.
5. Start or resume the application-linked IVP session. Review the explicit consent, synthetic document upload, local OCR output and human-correction step; then review the separate selfie evidence. If the owner chooses to run desktop camera liveness, do so only with an expressly consenting adult. It remains an experimental client-reported result. Any face score is descriptive only; no threshold or match decision is approved.
6. Return to application review. Confirm saved applicant/family/citizenship/prior-document details, missing fields, recommender status, evidence, and completed/pending/unavailable/review-required IVP checks are shown truthfully. Identity and citizenship must remain `REVIEW_REQUIRED`.
7. Submit only to the local `DEMO_SUBMITTED` state. Confirm the immutable snapshot and internal demonstration reference persist after refresh. This is not an Immigration submission, receipt, approval or passport request.
8. As a separate boundary check, use a distinct test account to confirm it cannot read the first account's application or evidence. A self-reported 16–17 application must remain blocked from demonstration submission because the guardian workflow is not implemented.

## Screens for visual acceptance

- Registration, verification, sign-in, forgot-password and reset-password.
- Citizen dashboard and first-time application wizard.
- Application review, including private evidence metadata, IVP status and missing-information sections.
- eKYC capture/consent, OCR correction, separate selfie, and results pages.
- Final local `DEMO_SUBMITTED` review state.

Responsive captures at 1440, 1024, 768 and 375 px are retained under [`TTP-4B-5E-5J/screenshots`](../TTP-4B-5E-5J/screenshots/). They are synthetic Development captures, not an approved visual baseline. After review, the owner may accept these screens as the baseline for later regression. No physical mobile-device acceptance is required for this desktop demonstration.

## Demonstration limits

This is a non-production design preview. It does not provide government identity or citizenship verification, certified biometric anti-spoof protection, official declarations, government submission, passport processing, payment or issuance. Production email delivery and the 16–17 guardian workflow remain unfinished.
