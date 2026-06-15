-- Deterministic local/CI seed data.
-- Run this only after the schema, auth wipe, storage setup, Data API hardening,
-- and app role grants have been applied.

DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE NOTICE 'auth.users not found; skipping Supabase Auth seed users.';
    RETURN;
  END IF;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES
    (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000101',
      'authenticated',
      'authenticated',
      'worker-login-1@redsun.com',
      crypt('123redsun1', gen_salt('bf')),
      '2026-01-01T00:00:00Z',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:00:00Z',
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000102',
      'authenticated',
      'authenticated',
      'worker-login-2@redsun.com',
      crypt('123redsun2', gen_salt('bf')),
      '2026-01-01T00:00:00Z',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:00:00Z',
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000103',
      'authenticated',
      'authenticated',
      'worker-login-3@redsun.com',
      crypt('123redsun3', gen_salt('bf')),
      '2026-01-01T00:00:00Z',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      '2026-01-01T00:00:00Z',
      '2026-01-01T00:00:00Z',
      '',
      '',
      '',
      ''
    )
  ON CONFLICT (id) DO NOTHING;

  IF to_regclass('auth.identities') IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES
      (
        '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000101',
        'worker-login-1@redsun.com',
        '{"sub":"00000000-0000-0000-0000-000000000101","email":"worker-login-1@redsun.com"}'::jsonb,
        'email',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z'
      ),
      (
        '00000000-0000-0000-0000-000000000202',
        '00000000-0000-0000-0000-000000000102',
        'worker-login-2@redsun.com',
        '{"sub":"00000000-0000-0000-0000-000000000102","email":"worker-login-2@redsun.com"}'::jsonb,
        'email',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z'
      ),
      (
        '00000000-0000-0000-0000-000000000203',
        '00000000-0000-0000-0000-000000000103',
        'worker-login-3@redsun.com',
        '{"sub":"00000000-0000-0000-0000-000000000103","email":"worker-login-3@redsun.com"}'::jsonb,
        'email',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z',
        '2026-01-01T00:00:00Z'
      )
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

INSERT INTO public.users (
  id,
  username,
  email,
  provider,
  description,
  terms_accepted_at,
  terms_version,
  privacy_acknowledged_at,
  privacy_version
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'worker-login-1',
    'worker-login-1@redsun.com',
    'EMAIL',
    'Seeded local worker user 1.',
    '2026-01-01T00:00:00Z',
    'seed',
    '2026-01-01T00:00:00Z',
    'seed'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'worker-login-2',
    'worker-login-2@redsun.com',
    'EMAIL',
    'Seeded local worker user 2.',
    '2026-01-01T00:00:00Z',
    'seed',
    '2026-01-01T00:00:00Z',
    'seed'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'worker-login-3',
    'worker-login-3@redsun.com',
    'EMAIL',
    'Seeded local worker user 3.',
    '2026-01-01T00:00:00Z',
    'seed',
    '2026-01-01T00:00:00Z',
    'seed'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subscriptions (
  user_id,
  plan,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'FREE',
    'ACTIVE',
    '2026-01-01T00:00:00Z',
    '2027-01-01T00:00:00Z',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'FREE',
    'ACTIVE',
    '2026-01-01T00:00:00Z',
    '2027-01-01T00:00:00Z',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'FREE',
    'ACTIVE',
    '2026-01-01T00:00:00Z',
    '2027-01-01T00:00:00Z',
    false
  )
ON CONFLICT (user_id) DO NOTHING;
