-- TTP-2C / Stage 3 MVP: minimal IVP foundation for one configured client.
-- Apply only to the isolated IVP Test or Development database after identity verification.
-- Runtime application reads/writes remain Wappler Database actions.

CREATE TABLE ivp_clients (
  client_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_key VARCHAR(80) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (client_id),
  UNIQUE KEY uq_ivp_clients_client_key (client_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_demo_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  username VARCHAR(254) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_ivp_demo_users_client_username (client_id, username),
  UNIQUE KEY uq_ivp_demo_users_client_id (client_id, id),
  CONSTRAINT fk_ivp_demo_users_client FOREIGN KEY (client_id)
    REFERENCES ivp_clients (client_id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_subjects (
  subject_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (subject_id),
  UNIQUE KEY uq_ivp_subjects_client_owner (client_id, owner_user_id),
  UNIQUE KEY uq_ivp_subjects_client_subject (client_id, subject_id),
  CONSTRAINT fk_ivp_subjects_client FOREIGN KEY (client_id)
    REFERENCES ivp_clients (client_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_subjects_owner FOREIGN KEY (client_id, owner_user_id)
    REFERENCES ivp_demo_users (client_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_sessions (
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  subject_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('CONSENT_REQUIRED', 'IN_PROGRESS', 'PENDING', 'REVIEW_REQUIRED') NOT NULL DEFAULT 'CONSENT_REQUIRED',
  policy_version VARCHAR(40) NOT NULL DEFAULT 'DEV-DEMO-1.0',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (session_id),
  UNIQUE KEY uq_ivp_sessions_client_session (client_id, session_id),
  KEY ix_ivp_sessions_owner (client_id, created_by_user_id, created_at),
  CONSTRAINT fk_ivp_sessions_subject FOREIGN KEY (client_id, subject_id)
    REFERENCES ivp_subjects (client_id, subject_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_sessions_creator FOREIGN KEY (client_id, created_by_user_id)
    REFERENCES ivp_demo_users (client_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_consents (
  consent_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_user_id BIGINT UNSIGNED NOT NULL,
  consent_version VARCHAR(40) NOT NULL,
  accepted BOOLEAN NOT NULL,
  captured_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (consent_id),
  KEY ix_ivp_consents_session (client_id, session_id, captured_at),
  CONSTRAINT fk_ivp_consents_session FOREIGN KEY (client_id, session_id)
    REFERENCES ivp_sessions (client_id, session_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_consents_actor FOREIGN KEY (client_id, actor_user_id)
    REFERENCES ivp_demo_users (client_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_evidence (
  evidence_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  evidence_type ENUM('DOCUMENT', 'SELFIE') NOT NULL,
  storage_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  mime_type VARCHAR(80) NOT NULL,
  byte_size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (evidence_id),
  UNIQUE KEY uq_ivp_evidence_client_id (client_id, evidence_id),
  UNIQUE KEY uq_ivp_evidence_storage_key (storage_key),
  KEY ix_ivp_evidence_session (client_id, session_id, evidence_type),
  CONSTRAINT fk_ivp_evidence_session FOREIGN KEY (client_id, session_id)
    REFERENCES ivp_sessions (client_id, session_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_evidence_owner FOREIGN KEY (client_id, owner_user_id)
    REFERENCES ivp_demo_users (client_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_checks (
  check_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  evidence_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  check_code ENUM('DOCUMENT_CAPTURE', 'OCR_EXTRACTION', 'OCR_REVIEW', 'DOCUMENT_AUTHENTICITY', 'SELFIE_CAPTURE', 'FACE_COMPARISON', 'LIVENESS', 'AUTHORITATIVE_IDENTITY') NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REVIEW_REQUIRED', 'UNAVAILABLE', 'NOT_PERFORMED') NOT NULL,
  provider_name VARCHAR(80) NULL,
  model_version VARCHAR(120) NULL,
  details_json JSON NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (check_id),
  UNIQUE KEY uq_ivp_checks_client_id (client_id, check_id),
  KEY ix_ivp_checks_session (client_id, session_id, check_code, created_at),
  CONSTRAINT fk_ivp_checks_session FOREIGN KEY (client_id, session_id)
    REFERENCES ivp_sessions (client_id, session_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_checks_evidence FOREIGN KEY (client_id, evidence_id)
    REFERENCES ivp_evidence (client_id, evidence_id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ivp_ocr_results (
  ocr_result_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id BIGINT UNSIGNED NOT NULL,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  evidence_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  check_id BIGINT UNSIGNED NOT NULL,
  original_text MEDIUMTEXT NOT NULL,
  extracted_fields JSON NOT NULL,
  corrected_fields JSON NULL,
  confidence DECIMAL(5,2) NOT NULL,
  engine_version VARCHAR(40) NOT NULL,
  model_revision VARCHAR(160) NOT NULL,
  reviewed_by_user_id BIGINT UNSIGNED NULL,
  reviewed_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (ocr_result_id),
  UNIQUE KEY uq_ivp_ocr_results_client_id (client_id, ocr_result_id),
  KEY ix_ivp_ocr_results_session (client_id, session_id, created_at),
  CONSTRAINT fk_ivp_ocr_results_session FOREIGN KEY (client_id, session_id)
    REFERENCES ivp_sessions (client_id, session_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_ocr_results_evidence FOREIGN KEY (client_id, evidence_id)
    REFERENCES ivp_evidence (client_id, evidence_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_ocr_results_check FOREIGN KEY (client_id, check_id)
    REFERENCES ivp_checks (client_id, check_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_ivp_ocr_results_reviewer FOREIGN KEY (client_id, reviewed_by_user_id)
    REFERENCES ivp_demo_users (client_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
