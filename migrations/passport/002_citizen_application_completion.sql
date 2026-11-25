-- TTP-4B/5E-5J limited local citizen application demonstration.
-- Apply only to identity-verified passport_test or passport_dev using its schema principal.
-- No IVP tables, credentials, official submission, or production data are changed.

CREATE TABLE IF NOT EXISTS citizen_email_verification_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_citizen_email_token_hash (token_hash),
  KEY ix_citizen_email_tokens_account (account_id, consumed, expires_at),
  CONSTRAINT fk_citizen_email_token_account
    FOREIGN KEY (account_id) REFERENCES citizen_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS citizen_password_recovery_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  consumed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_citizen_recovery_token_hash (token_hash),
  KEY ix_citizen_recovery_tokens_account (account_id, consumed, expires_at),
  CONSTRAINT fk_citizen_recovery_token_account
    FOREIGN KEY (account_id) REFERENCES citizen_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- These are applicant-entered suggestions only. No recommender declarations,
-- recommender signatures, identity-document numbers, or stamps are represented.
CREATE TABLE IF NOT EXISTS passport_application_recommenders (
  application_id BIGINT UNSIGNED NOT NULL,
  first_name TEXT NULL,
  surname TEXT NULL,
  occupation TEXT NULL,
  firm_name TEXT NULL,
  address_street TEXT NULL,
  address_city TEXT NULL,
  address_postal_code TEXT NULL,
  address_country TEXT NULL,
  office_telephone TEXT NULL,
  home_telephone TEXT NULL,
  years_known DECIMAL(4,1) NULL,
  data_source VARCHAR(32) NOT NULL DEFAULT 'APPLICANT_PROVIDED',
  declaration_status VARCHAR(32) NOT NULL DEFAULT 'NOT_RECEIVED',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (application_id),
  CONSTRAINT chk_recommender_years_known CHECK (years_known IS NULL OR years_known >= 0),
  CONSTRAINT chk_recommender_source CHECK (data_source = 'APPLICANT_PROVIDED'),
  CONSTRAINT chk_recommender_declaration CHECK (declaration_status = 'NOT_RECEIVED'),
  CONSTRAINT fk_passport_recommender_application
    FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS passport_application_references (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  reference_slot VARCHAR(16) NOT NULL,
  first_name TEXT NULL,
  surname TEXT NULL,
  address_street TEXT NULL,
  address_city TEXT NULL,
  address_postal_code TEXT NULL,
  address_country TEXT NULL,
  telephone TEXT NULL,
  years_known DECIMAL(4,1) NULL,
  applicant_reports_not_relative TINYINT(1) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_passport_reference_slot (application_id, reference_slot),
  CONSTRAINT chk_passport_reference_slot CHECK (reference_slot IN ('REFERENCE_1', 'REFERENCE_2')),
  CONSTRAINT chk_passport_reference_years CHECK (years_known IS NULL OR years_known >= 0),
  CONSTRAINT fk_passport_reference_application
    FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Files remain outside /public and have no relationship to IVP evidence rows.
CREATE TABLE IF NOT EXISTS passport_application_evidence (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evidence_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  application_id BIGINT UNSIGNED NOT NULL,
  uploaded_by_account_id BIGINT UNSIGNED NOT NULL,
  evidence_kind VARCHAR(24) NOT NULL,
  document_category VARCHAR(40) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  byte_size BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL DEFAULT 1,
  evidence_status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
  replaces_evidence_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_passport_evidence_key (evidence_key),
  UNIQUE KEY uq_passport_evidence_storage (storage_key),
  UNIQUE KEY uq_passport_evidence_version (application_id, evidence_kind, document_category, version_number),
  KEY ix_passport_evidence_owner (application_id, evidence_kind, evidence_status),
  CONSTRAINT chk_passport_evidence_kind CHECK (evidence_kind IN ('SUPPORTING_DOCUMENT', 'PASSPORT_PHOTOGRAPH')),
  CONSTRAINT chk_passport_evidence_status CHECK (evidence_status IN ('ACTIVE', 'REPLACED')),
  CONSTRAINT fk_passport_evidence_application
    FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE RESTRICT,
  CONSTRAINT fk_passport_evidence_account
    FOREIGN KEY (uploaded_by_account_id) REFERENCES citizen_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_passport_evidence_replacement
    FOREIGN KEY (replaces_evidence_id) REFERENCES passport_application_evidence(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Each snapshot is insert-only through the exposed Wappler workflow and contains
-- Passport-owned state plus the opaque IVP application reference only.
CREATE TABLE IF NOT EXISTS passport_application_demo_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  submission_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  internal_demo_reference VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  application_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,
  snapshot_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  application_snapshot_json LONGTEXT NOT NULL,
  recommender_snapshot_json LONGTEXT NOT NULL,
  references_snapshot_json LONGTEXT NOT NULL,
  evidence_snapshot_json LONGTEXT NOT NULL,
  ivp_application_ref CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  submission_status VARCHAR(24) NOT NULL DEFAULT 'DEMO_SUBMITTED',
  submitted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_passport_demo_submission_key (submission_key),
  UNIQUE KEY uq_passport_demo_reference (internal_demo_reference),
  UNIQUE KEY uq_passport_demo_application (application_id),
  CONSTRAINT chk_passport_demo_status CHECK (submission_status = 'DEMO_SUBMITTED'),
  CONSTRAINT chk_passport_demo_application_json CHECK (JSON_VALID(application_snapshot_json)),
  CONSTRAINT chk_passport_demo_recommender_json CHECK (JSON_VALID(recommender_snapshot_json)),
  CONSTRAINT chk_passport_demo_references_json CHECK (JSON_VALID(references_snapshot_json)),
  CONSTRAINT chk_passport_demo_evidence_json CHECK (JSON_VALID(evidence_snapshot_json)),
  CONSTRAINT fk_passport_demo_application
    FOREIGN KEY (application_id) REFERENCES passport_applications(id) ON DELETE RESTRICT,
  CONSTRAINT fk_passport_demo_account
    FOREIGN KEY (account_id) REFERENCES citizen_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
