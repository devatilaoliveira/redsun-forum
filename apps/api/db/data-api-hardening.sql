-- Harden Supabase Data API access for a backend-owned database model.
-- This script blocks Supabase Data API roles from application tables while
-- keeping direct backend database access controlled by the configured DB_APP_ROLE.
-- It runs before db/app-role.sql in the default full reset flow.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tale_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.basic_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.letter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.letter_read_by ENABLE ROW LEVEL SECURITY;
