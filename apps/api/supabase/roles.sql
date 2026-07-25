-- Cluster-level role created by the Supabase CLI before migrations.
-- Credentials remain environment-specific and are assigned outside this file.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'redsun_dev') THEN
    CREATE ROLE redsun_dev
      NOLOGIN
      NOINHERIT;
  END IF;
END
$$;
