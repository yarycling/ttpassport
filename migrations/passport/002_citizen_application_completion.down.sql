-- Rollback for 002_citizen_application_completion.sql.
-- Run only after verifying the explicit isolated Test or Development identity.
DROP TABLE IF EXISTS passport_application_demo_submissions;
DROP TABLE IF EXISTS passport_application_evidence;
DROP TABLE IF EXISTS passport_application_references;
DROP TABLE IF EXISTS passport_application_recommenders;
DROP TABLE IF EXISTS citizen_password_recovery_tokens;
DROP TABLE IF EXISTS citizen_email_verification_tokens;
