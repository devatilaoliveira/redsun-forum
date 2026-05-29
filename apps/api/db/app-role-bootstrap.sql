-- Create/update the application runtime role used by Spring Boot.
-- Run this explicitly for first-time setup or intentional password rotation.
--
-- This file is run by scripts/run-supabase-sql.ps1 with:
--   APP_DB_ROLE     = DB_APP_ROLE
--   APP_DB_PASSWORD = DB_PASSWORD
--
-- The executing user must be DB_ADMIN_USER and must be allowed to create roles.

SELECT format(
  'CREATE ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS',
  :'APP_DB_ROLE',
  :'APP_DB_PASSWORD'
)
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_roles
  WHERE rolname = :'APP_DB_ROLE'
)
\gexec

ALTER ROLE :"APP_DB_ROLE"
WITH LOGIN PASSWORD :'APP_DB_PASSWORD';
