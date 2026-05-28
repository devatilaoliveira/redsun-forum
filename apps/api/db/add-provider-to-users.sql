ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS provider varchar(20) NOT NULL DEFAULT 'EMAIL';

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_provider_check;

ALTER TABLE public.users
ADD CONSTRAINT users_provider_check CHECK (provider IN ('EMAIL','GOOGLE'));
