-- Roll back only the TTP-4A-5C tables after preserving required synthetic evidence.
DROP TABLE IF EXISTS passport_applications;
DROP TABLE IF EXISTS applicant_profiles;
DROP TABLE IF EXISTS citizen_accounts;
