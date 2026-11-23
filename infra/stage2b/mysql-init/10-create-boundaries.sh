#!/bin/bash
set -euo pipefail

mode="${TTP2B_ENV_MODE:?TTP2B_ENV_MODE must be development or test}"
root_password="$(cat /run/secrets/root_password_for_init)"
passport_password="$(cat /run/secrets/passport_password)"
ivp_password="$(cat /run/secrets/ivp_password)"
passport_schema_password="$(cat /run/secrets/passport_schema_password)"
ivp_schema_password="$(cat /run/secrets/ivp_schema_password)"

# bootstrap-secrets.sh generates hexadecimal passwords, avoiding SQL metacharacters.
case "$mode" in
  test)
    MYSQL_PWD="$root_password" mysql --protocol=socket --user=root --default-character-set=utf8mb4 <<SQL
CREATE DATABASE passport_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE ivp_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'passport_test_user'@'%' IDENTIFIED BY '$passport_password';
CREATE USER 'ivp_test_user'@'%' IDENTIFIED BY '$ivp_password';
CREATE USER 'passport_test_schema'@'%' IDENTIFIED BY '$passport_schema_password';
CREATE USER 'ivp_test_schema'@'%' IDENTIFIED BY '$ivp_schema_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON passport_test.* TO 'passport_test_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON ivp_test.* TO 'ivp_test_user'@'%';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON passport_test.* TO 'passport_test_schema'@'%';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON ivp_test.* TO 'ivp_test_schema'@'%';
CREATE TABLE passport_test.__ttp2b_synthetic_probe (probe_key VARCHAR(64) NOT NULL PRIMARY KEY, probe_value VARCHAR(128) NOT NULL);
CREATE TABLE ivp_test.__ttp2b_synthetic_probe (probe_key VARCHAR(64) NOT NULL PRIMARY KEY, probe_value VARCHAR(128) NOT NULL);
INSERT INTO passport_test.__ttp2b_synthetic_probe VALUES ('fixture', 'passport-boundary-synthetic');
INSERT INTO ivp_test.__ttp2b_synthetic_probe VALUES ('fixture', 'ivp-boundary-synthetic');
SQL
    ;;
  development)
    MYSQL_PWD="$root_password" mysql --protocol=socket --user=root --default-character-set=utf8mb4 <<SQL
CREATE DATABASE passport_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE ivp_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'passport_dev_user'@'%' IDENTIFIED BY '$passport_password';
CREATE USER 'ivp_dev_user'@'%' IDENTIFIED BY '$ivp_password';
CREATE USER 'passport_dev_schema'@'%' IDENTIFIED BY '$passport_schema_password';
CREATE USER 'ivp_dev_schema'@'%' IDENTIFIED BY '$ivp_schema_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON passport_dev.* TO 'passport_dev_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON ivp_dev.* TO 'ivp_dev_user'@'%';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON passport_dev.* TO 'passport_dev_schema'@'%';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON ivp_dev.* TO 'ivp_dev_schema'@'%';
CREATE TABLE passport_dev.__ttp2b_synthetic_probe (probe_key VARCHAR(64) NOT NULL PRIMARY KEY, probe_value VARCHAR(128) NOT NULL);
CREATE TABLE ivp_dev.__ttp2b_synthetic_probe (probe_key VARCHAR(64) NOT NULL PRIMARY KEY, probe_value VARCHAR(128) NOT NULL);
INSERT INTO passport_dev.__ttp2b_synthetic_probe VALUES ('fixture', 'passport-boundary-synthetic');
INSERT INTO ivp_dev.__ttp2b_synthetic_probe VALUES ('fixture', 'ivp-boundary-synthetic');
SQL
    ;;
  *)
    echo "Unsupported Stage 2B environment mode" >&2
    exit 2
    ;;
esac

unset root_password passport_password ivp_password passport_schema_password ivp_schema_password
