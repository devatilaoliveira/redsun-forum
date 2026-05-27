-- Enable UUID generator (pgcrypto) for UUID defaults
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to start from scratch
DROP TABLE IF EXISTS public.letter_read_by CASCADE;
DROP TABLE IF EXISTS public.letter_recipients CASCADE;
DROP TABLE IF EXISTS public.letters CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.basic_sheets CASCADE;
DROP TABLE IF EXISTS public.tale_participants CASCADE;
DROP TABLE IF EXISTS public.tales CASCADE;
DROP TABLE IF EXISTS public.user_contacts CASCADE;
DROP TABLE IF EXISTS public.user_favorite_roles CASCADE;
DROP TABLE IF EXISTS public.user_favorite_rules CASCADE;
DROP TABLE IF EXISTS public.user_favorite_languages CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  username varchar(20) NOT NULL UNIQUE,
  email varchar(254) NOT NULL UNIQUE,
  description varchar(2000),
  image_url varchar(500),
  deleted boolean NOT NULL DEFAULT FALSE,
  deleted_at timestamptz,
  terms_accepted_at timestamptz,
  terms_version varchar(20),
  privacy_acknowledged_at timestamptz,
  privacy_version varchar(20),
  last_sign_in_at timestamptz
);

-- User preferences
CREATE TABLE public.user_favorite_languages (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preference_order integer NOT NULL CHECK (preference_order BETWEEN 0 AND 9),
  favorite_language varchar(10) NOT NULL CHECK (favorite_language IN ('EN','DE','PT')),
  PRIMARY KEY (user_id, preference_order)
);

CREATE TABLE public.user_favorite_rules (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preference_order integer NOT NULL CHECK (preference_order BETWEEN 0 AND 9),
  favorite_rules varchar(20) NOT NULL CHECK (favorite_rules IN (
    'DND_5E','STORYTELLER','PATHFINDER_2E','BRP','GURPS','SWADE','OTHER','CUSTOM','FIM_DO_MUNDO'
  )),
  PRIMARY KEY (user_id, preference_order)
);

CREATE TABLE public.user_favorite_roles (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  preference_order integer NOT NULL CHECK (preference_order BETWEEN 0 AND 9),
  favorite_role varchar(10) NOT NULL CHECK (favorite_role IN ('DM','PLAYER')),
  PRIMARY KEY (user_id, preference_order)
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  plan varchar(10) NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE','PREMIUM','MAX')),
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','TRIALING','CANCELED','EXPIRED','PAST_DUE')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT FALSE
);

-- User contacts
CREATE TABLE public.user_contacts (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, contact_id),
  CHECK (user_id <> contact_id)
);
CREATE INDEX idx_user_contacts_contact_id ON public.user_contacts(contact_id);

-- Tales
CREATE TABLE public.tales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tale_name varchar(120) NOT NULL CHECK (char_length(btrim(tale_name)) BETWEEN 1 AND 120),
  owner_id uuid NOT NULL REFERENCES public.users(id),
  is_public boolean NOT NULL DEFAULT FALSE,
  image_url varchar(500),
  description varchar(4000),
  language varchar(10) CHECK (language IS NULL OR language IN ('EN','DE','PT')),
  rules varchar(15) NOT NULL CHECK (rules IN (
    'DND_5E','STORYTELLER','PATHFINDER_2E','BRP','GURPS','SWADE','OTHER','CUSTOM','FIM_DO_MUNDO'
  )),
  creation_date timestamptz NOT NULL DEFAULT now(),
  last_time_active timestamptz NOT NULL DEFAULT now(),
  status varchar(15) CHECK (status IN ('ACTIVE','INACTIVE','SLEEP'))
);
CREATE INDEX idx_tales_owner ON public.tales(owner_id);
CREATE INDEX idx_tales_is_public ON public.tales(is_public);
CREATE INDEX idx_tales_last_active ON public.tales(last_time_active DESC, creation_date DESC);

-- Tale participants
CREATE TABLE public.tale_participants (
  tale_id uuid NOT NULL REFERENCES public.tales(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (tale_id, participant_id)
);
CREATE INDEX idx_tale_participants_participant_tale ON public.tale_participants(participant_id, tale_id);

-- Basic character sheets
CREATE TABLE public.basic_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tale_id uuid NOT NULL REFERENCES public.tales(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  character_name varchar(120),
  character_description varchar(4000),
  character_image_url varchar(500),
  CONSTRAINT uk_basic_sheets_tale_character UNIQUE (tale_id, character_id)
);
CREATE INDEX idx_basic_sheets_tale ON public.basic_sheets(tale_id);
CREATE INDEX idx_basic_sheets_character ON public.basic_sheets(character_id);

-- Locations
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tale_id uuid NOT NULL,
  location_name varchar(120) NOT NULL,
  author uuid NOT NULL REFERENCES public.users(id),
  description varchar(2000),
  image_url varchar(500),
  last_time_active timestamptz NOT NULL DEFAULT now(),
  status varchar(15) NOT NULL CHECK (status IN ('ACTIVE','INACTIVE'))
);
CREATE INDEX idx_locations_tale ON public.locations(tale_id);
CREATE INDEX idx_locations_author ON public.locations(author);

-- Posts
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location uuid NOT NULL,
  author uuid NOT NULL REFERENCES public.users(id),
  content varchar(1000),
  creation_date timestamptz NOT NULL DEFAULT now(),
  status varchar(15) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);
CREATE INDEX idx_posts_location ON public.posts(location);
CREATE INDEX idx_posts_author ON public.posts(author);

-- Letters
CREATE TABLE public.letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender uuid NOT NULL REFERENCES public.users(id),
  sent_at timestamptz NOT NULL DEFAULT now(),
  subject varchar(200),
  content varchar(4000) NOT NULL
);
CREATE INDEX idx_letters_sender ON public.letters(sender);
CREATE INDEX idx_letters_sent_at ON public.letters(sent_at DESC);

-- Letter recipients
CREATE TABLE public.letter_recipients (
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (letter_id, recipient_id)
);
CREATE INDEX idx_letter_recipients_recipient ON public.letter_recipients(recipient_id);

-- Letter read-by
CREATE TABLE public.letter_read_by (
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (letter_id, user_id)
);
CREATE INDEX idx_letter_read_by_user ON public.letter_read_by(user_id);
