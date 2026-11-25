-- TTP-4F: allow an authenticated IVP client to use an opaque, client-scoped subject reference.
-- Passport application data remains in passport_dev; this stores only its opaque application key.

ALTER TABLE ivp_subjects
  MODIFY owner_user_id BIGINT UNSIGNED NULL,
  ADD COLUMN client_subject_ref VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER owner_user_id,
  ADD UNIQUE KEY uq_ivp_subjects_client_subject_ref (client_id, client_subject_ref),
  ADD CONSTRAINT chk_ivp_subject_owner_present CHECK (owner_user_id IS NOT NULL OR client_subject_ref IS NOT NULL);

ALTER TABLE ivp_sessions
  MODIFY created_by_user_id BIGINT UNSIGNED NULL,
  ADD COLUMN created_by_client_subject_ref VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER created_by_user_id,
  ADD KEY ix_ivp_sessions_client_subject_ref (client_id, created_by_client_subject_ref, created_at),
  ADD CONSTRAINT chk_ivp_session_creator_present CHECK (created_by_user_id IS NOT NULL OR created_by_client_subject_ref IS NOT NULL);

ALTER TABLE ivp_consents
  MODIFY actor_user_id BIGINT UNSIGNED NULL,
  ADD COLUMN actor_client_subject_ref VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER actor_user_id,
  ADD CONSTRAINT chk_ivp_consent_actor_present CHECK (actor_user_id IS NOT NULL OR actor_client_subject_ref IS NOT NULL);

ALTER TABLE ivp_evidence
  MODIFY owner_user_id BIGINT UNSIGNED NULL,
  ADD COLUMN owner_client_subject_ref VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER owner_user_id,
  ADD CONSTRAINT chk_ivp_evidence_owner_present CHECK (owner_user_id IS NOT NULL OR owner_client_subject_ref IS NOT NULL);

ALTER TABLE ivp_ocr_results
  ADD COLUMN reviewed_by_client_subject_ref VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER reviewed_by_user_id;
