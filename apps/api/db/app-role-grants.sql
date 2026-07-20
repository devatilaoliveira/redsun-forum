-- Grant runtime privileges and recreate backend RLS bypass policies.
-- This file intentionally does not create the application role or change its password.
--
-- This file is run by scripts/run-supabase-sql.ps1 with:
--   APP_DB_NAME = DB_NAME
--   APP_DB_ROLE = DB_APP_ROLE
--
-- The executing user must be DB_ADMIN_USER and must own the application tables
-- and grant privileges on public/private schemas.

GRANT CONNECT ON DATABASE :"APP_DB_NAME" TO :"APP_DB_ROLE";

GRANT USAGE ON SCHEMA public TO :"APP_DB_ROLE";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"APP_DB_ROLE";
REVOKE INSERT, UPDATE, DELETE ON public.patch_notes FROM :"APP_DB_ROLE";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"APP_DB_ROLE";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO :"APP_DB_ROLE";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"APP_DB_ROLE";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO :"APP_DB_ROLE";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO :"APP_DB_ROLE";

SELECT format('GRANT USAGE ON SCHEMA %I TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT USAGE, SELECT ON SEQUENCES TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT EXECUTE ON FUNCTIONS TO %I', 'private', :'APP_DB_ROLE')
WHERE EXISTS (
  SELECT 1
  FROM information_schema.schemata
  WHERE schema_name = 'private'
)
\gexec

SELECT format('DROP POLICY IF EXISTS backend_runtime_access ON %I.%I', schemaname, tablename)
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'client_error_reports',
    'user_settings',
    'subscriptions',
    'patch_notes',
    'user_contacts',
    'user_favorite_languages',
    'user_favorite_rules',
    'user_favorite_roles',
    'tales',
    'tale_participants',
    'basic_sheets',
    'redsun_sheets',
    'locations',
    'posts',
    'letters',
    'letter_recipients',
    'letter_read_by'
)
\gexec

SELECT format(
  'CREATE POLICY backend_runtime_access ON %I.%I FOR SELECT TO %I USING (true)',
  'public',
  'patch_notes',
  :'APP_DB_ROLE'
)
WHERE to_regclass('public.patch_notes') IS NOT NULL
\gexec

SELECT format(
  'CREATE POLICY backend_runtime_access ON %I.%I FOR ALL TO %I USING (true) WITH CHECK (true)',
  schemaname,
  tablename,
  :'APP_DB_ROLE'
)
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'client_error_reports',
    'user_settings',
    'subscriptions',
    'user_contacts',
    'user_favorite_languages',
    'user_favorite_rules',
    'user_favorite_roles',
    'tales',
    'tale_participants',
    'basic_sheets',
    'redsun_sheets',
    'locations',
    'posts',
    'letters',
    'letter_recipients',
    'letter_read_by'
  )
\gexec
