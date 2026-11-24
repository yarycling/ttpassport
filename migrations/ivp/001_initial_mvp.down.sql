-- Roll back only migration 001 objects in the isolated IVP Test database.
-- Never use this rollback against Development after demo data has been written.
DROP TABLE IF EXISTS ivp_ocr_results;
DROP TABLE IF EXISTS ivp_checks;
DROP TABLE IF EXISTS ivp_evidence;
DROP TABLE IF EXISTS ivp_consents;
DROP TABLE IF EXISTS ivp_sessions;
DROP TABLE IF EXISTS ivp_subjects;
DROP TABLE IF EXISTS ivp_demo_users;
DROP TABLE IF EXISTS ivp_clients;
