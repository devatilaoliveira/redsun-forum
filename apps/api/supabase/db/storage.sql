-- Ensure Supabase Storage buckets exist for application image uploads.
-- Keep this list aligned with `supabase.bucket.*` in application.yml.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets not found; skipping bucket creation.';
    RETURN;
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
