-- Repository-intended objects and security posture layered on the production baseline.
-- This migration defines the backend role without setting production credentials.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.username_counters (
  prefix text PRIMARY KEY,
  last_value integer NOT NULL DEFAULT 0
);

INSERT INTO private.username_counters (prefix, last_value)
VALUES ('Aventureiro', 0)
ON CONFLICT (prefix) DO NOTHING;

CREATE OR REPLACE FUNCTION private.next_username(username_prefix text)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  next_value integer;
BEGIN
  INSERT INTO private.username_counters (prefix, last_value)
  VALUES (username_prefix, 0)
  ON CONFLICT (prefix) DO NOTHING;

  UPDATE private.username_counters
  SET last_value = last_value + 1
  WHERE prefix = username_prefix
  RETURNING last_value INTO next_value;

  RETURN username_prefix || next_value;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'redsun_dev') THEN
    CREATE ROLE redsun_dev
      NOLOGIN
      NOINHERIT;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'redsun_dev'
      AND (
        rolsuper
        OR rolcreatedb
        OR rolcreaterole
        OR rolinherit
        OR rolreplication
        OR rolbypassrls
      )
  ) THEN
    RAISE EXCEPTION 'redsun_dev has elevated role attributes';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO redsun_dev;
GRANT USAGE ON SCHEMA public, private TO redsun_dev;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public, private TO redsun_dev;
REVOKE INSERT, UPDATE, DELETE ON public.patch_notes FROM redsun_dev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, private TO redsun_dev;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public, private TO redsun_dev;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO redsun_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO redsun_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO redsun_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  GRANT USAGE, SELECT ON SEQUENCES TO redsun_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO redsun_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  GRANT EXECUTE ON FUNCTIONS TO redsun_dev;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;

ALTER TABLE private.username_counters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS backend_runtime_access ON private.username_counters;
CREATE POLICY backend_runtime_access
  ON private.username_counters
  FOR ALL
  TO redsun_dev
  USING (true)
  WITH CHECK (true);

DO $$
DECLARE
  application_table regclass;
BEGIN
  FOREACH application_table IN ARRAY ARRAY[
    'public.users'::regclass,
    'public.client_error_reports'::regclass,
    'public.user_settings'::regclass,
    'public.subscriptions'::regclass,
    'public.patch_notes'::regclass,
    'public.user_contacts'::regclass,
    'public.user_favorite_languages'::regclass,
    'public.user_favorite_rules'::regclass,
    'public.user_favorite_roles'::regclass,
    'public.tales'::regclass,
    'public.tale_participants'::regclass,
    'public.basic_sheets'::regclass,
    'public.redsun_sheets'::regclass,
    'public.locations'::regclass,
    'public.posts'::regclass,
    'public.letters'::regclass,
    'public.letter_recipients'::regclass,
    'public.letter_read_by'::regclass
  ]
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', application_table);
    EXECUTE format('DROP POLICY IF EXISTS backend_runtime_access ON %s', application_table);

    IF application_table = 'public.patch_notes'::regclass THEN
      EXECUTE format(
        'CREATE POLICY backend_runtime_access ON %s FOR SELECT TO redsun_dev USING (true)',
        application_table
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY backend_runtime_access ON %s FOR ALL TO redsun_dev USING (true) WITH CHECK (true)',
        application_table
      );
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'storage.buckets is required before application bucket migration';
  END IF;

  INSERT INTO storage.buckets (id, name, "public", file_size_limit)
  VALUES
    ('avatars', 'avatars', true, 2048 * 1024),
    ('tales', 'tales', true, 2048 * 1024),
    ('locations', 'locations', true, 2048 * 1024),
    ('characters', 'characters', true, 2048 * 1024)
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    "public" = EXCLUDED."public",
    file_size_limit = EXCLUDED.file_size_limit;
END
$$;
