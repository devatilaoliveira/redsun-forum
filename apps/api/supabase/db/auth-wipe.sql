-- Wipe all Supabase Auth users.
DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE NOTICE 'auth.users not found; skipping auth wipe.';
    RETURN;
  END IF;

  DELETE FROM auth.users;
END
$$;
