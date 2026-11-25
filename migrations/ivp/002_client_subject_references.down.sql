-- Roll back TTP-4F only after IVP rows created with client_subject_ref have been removed or migrated.
-- The MODIFY ... NOT NULL operations intentionally fail if external-owner rows remain.

ALTER TABLE ivp_ocr_results
  DROP COLUMN reviewed_by_client_subject_ref;

ALTER TABLE ivp_evidence
  DROP CHECK chk_ivp_evidence_owner_present,
  DROP COLUMN owner_client_subject_ref,
  MODIFY owner_user_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE ivp_consents
  DROP CHECK chk_ivp_consent_actor_present,
  DROP COLUMN actor_client_subject_ref,
  MODIFY actor_user_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE ivp_sessions
  DROP CHECK chk_ivp_session_creator_present,
  DROP INDEX ix_ivp_sessions_client_subject_ref,
  DROP COLUMN created_by_client_subject_ref,
  MODIFY created_by_user_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE ivp_subjects
  DROP CHECK chk_ivp_subject_owner_present,
  DROP INDEX uq_ivp_subjects_client_subject_ref,
  DROP COLUMN client_subject_ref,
  MODIFY owner_user_id BIGINT UNSIGNED NOT NULL;
