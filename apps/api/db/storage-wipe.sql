-- Wipe Supabase Storage objects for application image buckets.
-- Keep this list aligned with `supabase.bucket.*` in application.yml.
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects not found; skipping storage wipe.';
    RETURN;
  END IF;

  -- Supabase protects direct deletes unless this session flag is enabled.
  PERFORM set_config('storage.allow_delete_query', 'true', true);

  DELETE FROM storage.objects
  WHERE bucket_id IN ('avatars', 'tales', 'locations', 'characters');
END
$$;
