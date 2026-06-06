-- Enable UUID generator (pgcrypto) for UUID defaults
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to start from scratch
DROP TABLE IF EXISTS public.client_error_reports CASCADE;
DROP TABLE IF EXISTS public.letter_read_by CASCADE;
DROP TABLE IF EXISTS public.letter_recipients CASCADE;
DROP TABLE IF EXISTS public.letters CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.redsun_sheets CASCADE;
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
  username varchar(25) NOT NULL UNIQUE,
  email varchar(254) NOT NULL UNIQUE,
  provider varchar(20) NOT NULL DEFAULT 'EMAIL' CHECK (provider IN ('EMAIL','GOOGLE')),
  description varchar(4000),
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
    'REDSUN','FIM_DO_MUNDO','DND','STORYTELLER','PATHFINDER','BRP','GURPS','SWADE','OTHER','CUSTOM'
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

-- Client error reports
CREATE TABLE public.client_error_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  user_email varchar(254),
  message varchar(2000) NOT NULL,
  name varchar(200) NOT NULL,
  stack varchar(10000),
  cause varchar(2000),
  route varchar(1000),
  method varchar(20),
  status_code integer CHECK (status_code IS NULL OR status_code BETWEEN 100 AND 599),
  user_agent varchar(1000),
  environment varchar(50),
  client_timestamp timestamptz,
  metadata varchar(4000),
  reported_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_client_error_reports_user ON public.client_error_reports(user_id);
CREATE INDEX idx_client_error_reports_reported_at ON public.client_error_reports(reported_at DESC);
ALTER TABLE public.client_error_reports ENABLE ROW LEVEL SECURITY;

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
    'REDSUN','FIM_DO_MUNDO','DND','STORYTELLER','PATHFINDER','BRP','GURPS','SWADE','OTHER','CUSTOM'
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

-- RedSun character sheets
CREATE TABLE public.redsun_sheets (
  id uuid PRIMARY KEY REFERENCES public.basic_sheets(id) ON DELETE CASCADE,
  nature varchar(120),
  demeanor varchar(120),
  strength integer NOT NULL DEFAULT 0,
  dexterity integer NOT NULL DEFAULT 0,
  stamina integer NOT NULL DEFAULT 0,
  presence integer NOT NULL DEFAULT 0,
  empathy integer NOT NULL DEFAULT 0,
  influence integer NOT NULL DEFAULT 0,
  perception integer NOT NULL DEFAULT 0,
  intellect integer NOT NULL DEFAULT 0,
  determination integer NOT NULL DEFAULT 0,
  alertness integer NOT NULL DEFAULT 0,
  sports integer NOT NULL DEFAULT 0,
  intuition integer NOT NULL DEFAULT 0,
  intimidation integer NOT NULL DEFAULT 0,
  subterfuge integer NOT NULL DEFAULT 0,
  leadership integer NOT NULL DEFAULT 0,
  diplomacy integer NOT NULL DEFAULT 0,
  talent_1_name varchar(120),
  talent_1_level integer NOT NULL DEFAULT 0,
  talent_2_name varchar(120),
  talent_2_level integer NOT NULL DEFAULT 0,
  animal_handling integer NOT NULL DEFAULT 0,
  riding integer NOT NULL DEFAULT 0,
  legerdemain integer NOT NULL DEFAULT 0,
  survival integer NOT NULL DEFAULT 0,
  stealth integer NOT NULL DEFAULT 0,
  athletics integer NOT NULL DEFAULT 0,
  performance integer NOT NULL DEFAULT 0,
  history integer NOT NULL DEFAULT 0,
  religion integer NOT NULL DEFAULT 0,
  language integer NOT NULL DEFAULT 0,
  occultism integer NOT NULL DEFAULT 0,
  investigation integer NOT NULL DEFAULT 0,
  psychology integer NOT NULL DEFAULT 0,
  business integer NOT NULL DEFAULT 0,
  calling_1_name varchar(120),
  calling_1_level integer NOT NULL DEFAULT 0,
  calling_2_name varchar(120),
  calling_2_level integer NOT NULL DEFAULT 0,
  calling_3_name varchar(120),
  calling_3_level integer NOT NULL DEFAULT 0,
  calling_4_name varchar(120),
  calling_4_level integer NOT NULL DEFAULT 0,
  calling_5_name varchar(120),
  calling_5_level integer NOT NULL DEFAULT 0,
  martial_arts integer NOT NULL DEFAULT 0,
  herbalism integer NOT NULL DEFAULT 0,
  rituals integer NOT NULL DEFAULT 0,
  meditation integer NOT NULL DEFAULT 0,
  craft integer NOT NULL DEFAULT 0,
  melee_throwing integer NOT NULL DEFAULT 0,
  ranged_weapons integer NOT NULL DEFAULT 0,
  unarmed integer NOT NULL DEFAULT 0,
  willpower_max integer NOT NULL DEFAULT 0,
  willpower_current integer NOT NULL DEFAULT 0,
  impetus_max integer NOT NULL DEFAULT 0,
  impetus_current integer NOT NULL DEFAULT 0,
  bruised boolean NOT NULL DEFAULT FALSE,
  hurt boolean NOT NULL DEFAULT FALSE,
  injured boolean NOT NULL DEFAULT FALSE,
  badly_wounded boolean NOT NULL DEFAULT FALSE,
  mauled boolean NOT NULL DEFAULT FALSE,
  crippled boolean NOT NULL DEFAULT FALSE,
  incapacitated boolean NOT NULL DEFAULT FALSE,
  torpor boolean NOT NULL DEFAULT FALSE,
  final_death boolean NOT NULL DEFAULT FALSE,
  experience varchar(120),
  equipment text,
  notes text,
  active_rituals_effects text,
  combat_maneuvers text,
  arsenal text,
  learned_rituals text,
  craft_details text,
  CONSTRAINT chk_redsun_rank_values CHECK (
    strength BETWEEN 0 AND 5
    AND dexterity BETWEEN 0 AND 5
    AND stamina BETWEEN 0 AND 5
    AND presence BETWEEN 0 AND 5
    AND empathy BETWEEN 0 AND 5
    AND influence BETWEEN 0 AND 5
    AND perception BETWEEN 0 AND 5
    AND intellect BETWEEN 0 AND 5
    AND determination BETWEEN 0 AND 5
    AND alertness BETWEEN 0 AND 5
    AND sports BETWEEN 0 AND 5
    AND intuition BETWEEN 0 AND 5
    AND intimidation BETWEEN 0 AND 5
    AND subterfuge BETWEEN 0 AND 5
    AND leadership BETWEEN 0 AND 5
    AND diplomacy BETWEEN 0 AND 5
    AND talent_1_level BETWEEN 0 AND 5
    AND talent_2_level BETWEEN 0 AND 5
    AND animal_handling BETWEEN 0 AND 5
    AND riding BETWEEN 0 AND 5
    AND legerdemain BETWEEN 0 AND 5
    AND survival BETWEEN 0 AND 5
    AND stealth BETWEEN 0 AND 5
    AND athletics BETWEEN 0 AND 5
    AND performance BETWEEN 0 AND 5
    AND history BETWEEN 0 AND 5
    AND religion BETWEEN 0 AND 5
    AND language BETWEEN 0 AND 5
    AND occultism BETWEEN 0 AND 5
    AND investigation BETWEEN 0 AND 5
    AND psychology BETWEEN 0 AND 5
    AND business BETWEEN 0 AND 5
    AND calling_1_level BETWEEN 0 AND 5
    AND calling_2_level BETWEEN 0 AND 5
    AND calling_3_level BETWEEN 0 AND 5
    AND calling_4_level BETWEEN 0 AND 5
    AND calling_5_level BETWEEN 0 AND 5
    AND martial_arts BETWEEN 0 AND 5
    AND herbalism BETWEEN 0 AND 5
    AND rituals BETWEEN 0 AND 5
    AND meditation BETWEEN 0 AND 5
    AND craft BETWEEN 0 AND 5
    AND melee_throwing BETWEEN 0 AND 5
    AND ranged_weapons BETWEEN 0 AND 5
    AND unarmed BETWEEN 0 AND 5
  ),
  CONSTRAINT chk_redsun_resource_values CHECK (
    willpower_max BETWEEN 0 AND 10
    AND willpower_current BETWEEN 0 AND 10
    AND impetus_max BETWEEN 0 AND 10
    AND impetus_current BETWEEN 0 AND 10
  )
);

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
