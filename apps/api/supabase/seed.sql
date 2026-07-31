-- Deterministic local/CI seed data.
-- Supabase runs this after all migrations during first start and db reset.

INSERT INTO public.patch_notes (id, release_date, content_pt, content_en, content_de)
VALUES
  (
    '00000000-0000-0000-0000-000000000210',
    DATE '2026-07-06',
    $$
    {
      "title": "Patch 2.1",
      "summary": "Este patch melhora a navegação entre personagens, ajusta a apresentação dos locais e deixa os deploys do frontend mais estáveis.",
      "items": [
        {"title": "Autenticação mais estável", "description": "O fluxo de autenticação do frontend foi simplificado para usar redirecionamento direto, tratar melhor erros de callback e limpar a sessão quando o login não é concluído corretamente."},
        {"title": "Modos de postagem preservam melhor o conteúdo", "description": "Ao alternar entre texto, dados e ficha de personagem em um local, o compositor agora mantém ou limpa os campos de forma mais previsível, evitando perda desnecessária do que estava sendo escrito."},
        {"title": "Participantes levam ao perfil do personagem", "description": "A lista de participantes no gerenciamento da história agora abre o perfil do personagem, seguindo o mesmo comportamento do carrossel da história."},
        {"title": "Cartão de local mais compacto", "description": "O avatar do autor agora aparece na mesma linha do nome, liberando espaço em telas pequenas e mantendo o layout consistente em todos os tamanhos."},
        {"title": "Acesso ao personagem pelo local", "description": "Ao clicar no avatar do autor em um local, o jogador agora abre a ficha do personagem daquela história."},
        {"title": "Deploys mais seguros", "description": "O frontend ganhou regras de cache para Workers Static Assets e recupera automaticamente uma vez quando uma aba antiga tenta carregar arquivos de uma versão anterior."},
        {"title": "Melhoria de texto mais fiel ao narrador", "description": "A melhoria automática de postagens agora preserva melhor se o texto foi narrado em primeira pessoa pelo jogador ou em terceira pessoa pelo narrador."}
      ]
    }
    $$::jsonb,
    $$
    {
      "title": "Patch 2.1",
      "summary": "This patch improves character navigation, refines location presentation, and makes frontend deployments more reliable.",
      "items": [
        {"title": "More reliable authentication", "description": "The frontend authentication flow now uses direct redirects, handles callback errors more reliably, and clears the session when sign-in does not finish correctly."},
        {"title": "Post modes preserve content better", "description": "When switching between text, dice, and character sheet modes in a location, the composer now keeps or clears fields more predictably and avoids unnecessary loss of drafted content."},
        {"title": "Participants link to character profiles", "description": "The participant list in campaign management now opens the character profile, matching the behavior of the campaign carousel."},
        {"title": "More compact location cards", "description": "The author's avatar now appears on the same line as their name, freeing space on small screens and keeping the layout consistent at every size."},
        {"title": "Character access from locations", "description": "Selecting an author's avatar in a location now opens that player's character sheet for the campaign."},
        {"title": "Safer deployments", "description": "The frontend now includes cache rules for Workers Static Assets and automatically recovers once when an old tab requests files from a previous version."},
        {"title": "Text improvements stay true to the narrator", "description": "Automatic post improvement now better preserves whether the text was narrated in first person by the player or in third person by the narrator."}
      ]
    }
    $$::jsonb,
    $$
    {
      "title": "Patch 2.1",
      "summary": "Dieser Patch verbessert die Navigation zwischen Charakteren, die Darstellung von Orten und die Zuverlässigkeit von Frontend-Deployments.",
      "items": [
        {"title": "Stabilere Authentifizierung", "description": "Der Authentifizierungsablauf im Frontend verwendet nun direkte Weiterleitungen, behandelt Callback-Fehler zuverlässiger und löscht die Sitzung, wenn die Anmeldung nicht korrekt abgeschlossen wird."},
        {"title": "Beitragsmodi bewahren Inhalte besser", "description": "Beim Wechsel zwischen Text, Würfeln und Charakterbogen an einem Ort behält oder löscht der Editor Felder nun vorhersehbarer und verhindert unnötigen Verlust von Entwürfen."},
        {"title": "Teilnehmer führen zum Charakterprofil", "description": "Die Teilnehmerliste in der Kampagnenverwaltung öffnet nun das Charakterprofil und verhält sich damit wie das Kampagnenkarussell."},
        {"title": "Kompaktere Ortskarten", "description": "Der Avatar des Autors steht nun in derselben Zeile wie der Name. Das spart Platz auf kleinen Bildschirmen und sorgt für ein einheitliches Layout."},
        {"title": "Charakterzugriff über Orte", "description": "Ein Klick auf den Avatar des Autors an einem Ort öffnet nun dessen Charakterbogen für diese Kampagne."},
        {"title": "Sicherere Deployments", "description": "Das Frontend besitzt nun Cache-Regeln für Workers Static Assets und stellt sich einmal automatisch wieder her, wenn ein alter Tab Dateien einer vorherigen Version anfordert."},
        {"title": "Textverbesserung bleibt der Erzählperspektive treu", "description": "Die automatische Verbesserung von Beiträgen bewahrt nun besser, ob ein Text vom Spieler in der ersten Person oder vom Erzähler in der dritten Person erzählt wurde."}
      ]
    }
    $$::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000200',
    DATE '2026-07-05',
    $$
    {
      "title": "Patch 2.0",
      "summary": "Este patch melhora o jogo nas localizações, deixa os dados das postagens mais claros e ajusta pequenos pontos de acesso.",
      "items": [
        {"title": "Fichas RedSun compactas em locais", "description": "Jogadores em histórias RedSun podem abrir uma ficha compacta no compositor de postagens do local para consulta rápida durante o jogo."},
        {"title": "Compositor de postagens melhorado", "description": "Os modos texto, dados gerais e dados RedSun ficam mais fáceis de identificar, postagens podem ser maiores e o backend agora registra o tipo da postagem."},
        {"title": "Horários de postagem mais claros", "description": "Datas de postagens agora usam rótulos relativos localizados, como há menos de 1 h, horas, dias e há mais de uma semana."},
        {"title": "Acesso ao perfil pelo avatar", "description": "Ao clicar no avatar do autor em uma postagem, o jogador agora abre o perfil do personagem daquela história."}
      ]
    }
    $$::jsonb,
    $$
    {
      "title": "Patch 2.0",
      "summary": "This patch improves play in locations, makes post dice results clearer, and polishes a few access points.",
      "items": [
        {"title": "Compact RedSun sheets in locations", "description": "Players in RedSun campaigns can open a compact sheet from the location post composer for quick reference during play."},
        {"title": "Improved post composer", "description": "Text, general dice, and RedSun dice modes are easier to identify, posts can be longer, and the backend now records each post's type."},
        {"title": "Clearer post times", "description": "Post dates now use localized relative labels, such as less than an hour ago, hours, days, and more than a week ago."},
        {"title": "Profile access from avatars", "description": "Selecting an author's avatar on a post now opens that player's character profile for the campaign."}
      ]
    }
    $$::jsonb,
    $$
    {
      "title": "Patch 2.0",
      "summary": "Dieser Patch verbessert das Spiel an Orten, stellt Würfelergebnisse in Beiträgen klarer dar und optimiert einige Zugriffswege.",
      "items": [
        {"title": "Kompakte RedSun-Bögen an Orten", "description": "Spieler in RedSun-Kampagnen können im Beitragseditor eines Ortes einen kompakten Charakterbogen zur schnellen Einsicht während des Spiels öffnen."},
        {"title": "Verbesserter Beitragseditor", "description": "Text-, allgemeine Würfel- und RedSun-Würfelmodi sind leichter zu erkennen, Beiträge können länger sein und das Backend speichert nun den Beitragstyp."},
        {"title": "Klarere Beitragszeiten", "description": "Beitragsdaten verwenden nun lokalisierte relative Angaben wie vor weniger als einer Stunde, Stunden, Tagen oder vor mehr als einer Woche."},
        {"title": "Profilzugriff über Avatare", "description": "Ein Klick auf den Avatar eines Autors in einem Beitrag öffnet nun dessen Charakterprofil für die Kampagne."}
      ]
    }
    $$::jsonb
  );

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
    '1.0',
    '2026-01-01T00:00:00Z',
    '1.0'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'worker-login-2',
    'worker-login-2@redsun.com',
    'EMAIL',
    'Seeded local worker user 2.',
    '2026-01-01T00:00:00Z',
    '1.0',
    '2026-01-01T00:00:00Z',
    '1.0'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'worker-login-3',
    'worker-login-3@redsun.com',
    'EMAIL',
    'Seeded local worker user 3.',
    '2026-01-01T00:00:00Z',
    '1.0',
    '2026-01-01T00:00:00Z',
    '1.0'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_favorite_languages (
  user_id,
  preference_order,
  favorite_language
)
VALUES
  ('00000000-0000-0000-0000-000000000101', 0, 'EN'),
  ('00000000-0000-0000-0000-000000000101', 1, 'PT'),
  ('00000000-0000-0000-0000-000000000102', 0, 'DE'),
  ('00000000-0000-0000-0000-000000000102', 1, 'EN'),
  ('00000000-0000-0000-0000-000000000103', 0, 'PT'),
  ('00000000-0000-0000-0000-000000000103', 1, 'DE')
ON CONFLICT (user_id, preference_order) DO NOTHING;

INSERT INTO public.user_favorite_rules (
  user_id,
  preference_order,
  favorite_rules
)
VALUES
  ('00000000-0000-0000-0000-000000000101', 0, 'REDSUN'),
  ('00000000-0000-0000-0000-000000000101', 1, 'DND'),
  ('00000000-0000-0000-0000-000000000102', 0, 'PATHFINDER'),
  ('00000000-0000-0000-0000-000000000102', 1, 'STORYTELLER'),
  ('00000000-0000-0000-0000-000000000103', 0, 'FIM_DO_MUNDO'),
  ('00000000-0000-0000-0000-000000000103', 1, 'CUSTOM')
ON CONFLICT (user_id, preference_order) DO NOTHING;

INSERT INTO public.user_favorite_roles (
  user_id,
  preference_order,
  favorite_role
)
VALUES
  ('00000000-0000-0000-0000-000000000101', 0, 'DM'),
  ('00000000-0000-0000-0000-000000000101', 1, 'PLAYER'),
  ('00000000-0000-0000-0000-000000000102', 0, 'PLAYER'),
  ('00000000-0000-0000-0000-000000000102', 1, 'DM'),
  ('00000000-0000-0000-0000-000000000103', 0, 'DM'),
  ('00000000-0000-0000-0000-000000000103', 1, 'PLAYER')
ON CONFLICT (user_id, preference_order) DO NOTHING;

INSERT INTO public.user_settings (
  user_id,
  app_language,
  app_theme,
  redirect_to_favorite
)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'PT',
    'DARK',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'PT',
    'DARK',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'PT',
    'DARK',
    false
  )
ON CONFLICT (user_id) DO NOTHING;

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

INSERT INTO public.tales (
  id,
  tale_name,
  owner_id,
  is_public,
  image_url,
  description,
  language,
  rules,
  creation_date,
  last_time_active,
  status
)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'A Coroa Rubra',
    '00000000-0000-0000-0000-000000000101',
    true,
    null,
    'História pública RedSun com vários participantes, locais e postagens para testes manuais.',
    'PT',
    'REDSUN',
    '2026-06-01T18:00:00Z',
    '2026-07-28T18:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Segredos de Salmar',
    '00000000-0000-0000-0000-000000000102',
    false,
    null,
    'História privada D&D: worker 1 participa, worker 3 deve receber acesso negado.',
    'EN',
    'DND',
    '2026-06-10T18:00:00Z',
    '2026-07-27T20:00:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'Das Echo von Falkenstein',
    '00000000-0000-0000-0000-000000000103',
    true,
    null,
    'Öffentliche Pathfinder-Geschichte, die auch Nichtteilnehmer ansehen können.',
    'DE',
    'PATHFINDER',
    '2026-06-15T18:00:00Z',
    '2026-07-26T19:00:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    'Crônicas Adormecidas',
    '00000000-0000-0000-0000-000000000101',
    false,
    null,
    'História em estado SLEEP, usada para confirmar o comportamento de não encontrado.',
    'PT',
    'STORYTELLER',
    '2025-01-01T18:00:00Z',
    '2025-02-01T18:00:00Z',
    'SLEEP'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tale_participants (
  tale_id,
  participant_id
)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000103')
ON CONFLICT (tale_id, participant_id) DO NOTHING;

UPDATE public.user_settings
SET
  favorite_tale_id = CASE user_id
    WHEN '00000000-0000-0000-0000-000000000101' THEN '00000000-0000-0000-0000-000000000301'::uuid
    WHEN '00000000-0000-0000-0000-000000000102' THEN '00000000-0000-0000-0000-000000000302'::uuid
    WHEN '00000000-0000-0000-0000-000000000103' THEN '00000000-0000-0000-0000-000000000303'::uuid
  END,
  redirect_to_favorite = user_id = '00000000-0000-0000-0000-000000000102'
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103'
);

INSERT INTO public.user_contacts (user_id, contact_id)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000101')
ON CONFLICT (user_id, contact_id) DO NOTHING;

INSERT INTO public.basic_sheets (
  id,
  tale_id,
  character_id,
  character_name,
  character_description,
  character_image_url,
  change_history
)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000101',
    'Aurelius',
    'Guardião da Coroa Rubra e personagem do dono da história.',
    null,
    'Ficha criada pelo seed local.'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000102',
    'Lysandra',
    'Diplomata viajante e personagem de participante.',
    null,
    'Ficha criada pelo seed local.'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000103',
    'Kael',
    'Batedor estrangeiro e personagem de participante.',
    null,
    'Ficha criada pelo seed local.'
  ),
  (
    '00000000-0000-0000-0000-000000000411',
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000101',
    'Mira Stone',
    'Ranger convidada para investigar Salmar.',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000412',
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000102',
    'Dungeon Master',
    'Narrador de Segredos de Salmar.',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000421',
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000103',
    'Gerwin Falk',
    'Pathfinder aus Falkenstein.',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000431',
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000101',
    'Memória',
    'Ficha pertencente a uma história adormecida.',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000432',
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000103',
    'Eco',
    'Segunda ficha pertencente a uma história adormecida.',
    null,
    null
  )
ON CONFLICT (tale_id, character_id) DO NOTHING;

INSERT INTO public.redsun_sheets (
  id,
  nature,
  demeanor,
  strength,
  dexterity,
  stamina,
  presence,
  empathy,
  influence,
  perception,
  intellect,
  determination,
  alertness,
  sports,
  intuition,
  leadership,
  diplomacy,
  talent_1_name,
  talent_1_level,
  talent_2_name,
  talent_2_level,
  survival,
  stealth,
  history,
  investigation,
  calling_1_name,
  calling_1_level,
  martial_arts,
  melee_throwing,
  ranged_weapons,
  willpower_max,
  willpower_current,
  impetus_max,
  impetus_current,
  vitality_damage,
  experience,
  equipment,
  notes
)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'Protetor',
    'Comandante',
    3, 2, 3, 3, 2, 3, 2, 2, 4,
    2, 1, 2, 3, 2,
    'Voz de comando', 3, 'Sangue frio', 2,
    1, 1, 2, 2,
    'Guardião', 3,
    3, 2, 1,
    6, 5, 6, 2, 1,
    '12 XP',
    'Espada longa, escudo rubro e provisões.',
    'Tem uma dívida antiga com a guilda de Salmar.'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'Mediadora',
    'Erudita',
    1, 3, 2, 4, 4, 3, 2, 4, 3,
    1, 1, 3, 2, 4,
    'Poliglota', 3, 'Leitura de ambiente', 3,
    1, 2, 3, 2,
    'Emissária', 4,
    1, 1, 1,
    7, 7, 5, 3, 0,
    '18 XP',
    'Cartas diplomáticas, adaga e kit de escrita.',
    'Procura uma solução pacífica para o conflito.'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'Explorador',
    'Reservado',
    2, 4, 2, 1, 2, 1, 4, 2, 3,
    4, 3, 3, 1, 1,
    'Olhos de águia', 4, 'Passos leves', 3,
    4, 4, 1, 3,
    'Batedor', 4,
    2, 2, 4,
    5, 3, 7, 4, 2,
    '9 XP',
    'Arco, duas facas e capa de viagem.',
    'Foi o primeiro a encontrar a passagem oculta.'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.locations (
  id,
  tale_id,
  location_name,
  author,
  description,
  image_url,
  last_time_active,
  status
)
VALUES
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000301',
    'Portões de Cinábrio',
    '00000000-0000-0000-0000-000000000101',
    'Entrada fortificada da capital.',
    null,
    '2026-07-28T18:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000301',
    'Mercado das Lanternas',
    '00000000-0000-0000-0000-000000000102',
    'Mercado noturno repleto de rumores.',
    null,
    '2026-07-28T17:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000301',
    'Arquivo Imperial',
    '00000000-0000-0000-0000-000000000103',
    'Biblioteca onde documentos proibidos são guardados.',
    null,
    '2026-07-28T16:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000301',
    'Jardins Suspensos',
    '00000000-0000-0000-0000-000000000101',
    'Ponto de encontro dos nobres da corte.',
    null,
    '2026-07-28T15:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000301',
    'Catacumbas do Sol',
    '00000000-0000-0000-0000-000000000102',
    'Ruínas sob o templo principal.',
    null,
    '2026-07-28T14:30:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000301',
    'Antiga Casa da Moeda',
    '00000000-0000-0000-0000-000000000103',
    'Local encerrado, mantido para testar paginação e estados inativos.',
    null,
    '2026-07-28T13:30:00Z',
    'INACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000302',
    'Docks of Salmar',
    '00000000-0000-0000-0000-000000000102',
    'Fog-covered docks of the private campaign.',
    null,
    '2026-07-27T20:00:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000512',
    '00000000-0000-0000-0000-000000000302',
    'The Broken Compass',
    '00000000-0000-0000-0000-000000000101',
    'A tavern known only to campaign participants.',
    null,
    '2026-07-27T19:00:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000303',
    'Burgruine Falkenstein',
    '00000000-0000-0000-0000-000000000103',
    'Öffentlicher Schauplatz für Besucher.',
    null,
    '2026-07-26T19:00:00Z',
    'ACTIVE'
  ),
  (
    '00000000-0000-0000-0000-000000000531',
    '00000000-0000-0000-0000-000000000304',
    'Salão Esquecido',
    '00000000-0000-0000-0000-000000000101',
    'Local de uma história que deve se comportar como não encontrada.',
    null,
    '2025-02-01T18:00:00Z',
    'INACTIVE'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (
  id,
  location,
  author,
  content,
  creation_date,
  status,
  type
)
VALUES
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000101',
    'Aurelius ergue a mão e pede silêncio diante dos portões.',
    '2026-07-28T18:00:00Z',
    'ACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000102',
    'Lysandra tenta perceber se os guardas estão escondendo algo. Resultado: 3 sucessos.',
    '2026-07-28T18:10:00Z',
    'ACTIVE',
    'RSDICEROLL'
  ),
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000103',
    'Kael observa pegadas recentes junto à muralha. d20: 17.',
    '2026-07-28T18:20:00Z',
    'ACTIVE',
    'GENERALDICEROLL'
  ),
  (
    '00000000-0000-0000-0000-000000000604',
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000101',
    'Rascunho inativo visível apenas para o dono da história.',
    '2026-07-28T18:25:00Z',
    'INACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000605',
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000102',
    'Uma mercadora oferece um mapa incompleto das catacumbas.',
    '2026-07-28T17:15:00Z',
    'ACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000606',
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000103',
    'O selo do documento combina com o símbolo encontrado nos portões.',
    '2026-07-28T16:15:00Z',
    'ACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000611',
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000102',
    'The harbor master refuses to name the ship that arrived at midnight.',
    '2026-07-27T19:45:00Z',
    'ACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000612',
    '00000000-0000-0000-0000-000000000512',
    '00000000-0000-0000-0000-000000000101',
    'Mira places the recovered compass on the table.',
    '2026-07-27T18:45:00Z',
    'ACTIVE',
    'GENERALDICEROLL'
  ),
  (
    '00000000-0000-0000-0000-000000000621',
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000103',
    'Gerwin betritt vorsichtig die verfallene Burg.',
    '2026-07-26T18:45:00Z',
    'ACTIVE',
    'TEXT'
  ),
  (
    '00000000-0000-0000-0000-000000000631',
    '00000000-0000-0000-0000-000000000531',
    '00000000-0000-0000-0000-000000000101',
    'Esta postagem não deve ser alcançável pelos fluxos normais.',
    '2025-02-01T17:45:00Z',
    'ACTIVE',
    'TEXT'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letters (
  id,
  sender,
  sent_at,
  subject,
  content
)
VALUES
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000101',
    '2026-07-28T10:00:00Z',
    'Conselho nos portões',
    'Encontrem-me nos Portões de Cinábrio antes do anoitecer.'
  ),
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000102',
    '2026-07-28T11:00:00Z',
    'Mapa das catacumbas',
    'Enviei uma cópia do mapa. Ainda faltam duas passagens.'
  ),
  (
    '00000000-0000-0000-0000-000000000703',
    '00000000-0000-0000-0000-000000000103',
    '2026-07-28T12:00:00Z',
    'Spuren an der Mauer',
    'Ich habe neue Spuren am nördlichen Tor gefunden.'
  ),
  (
    '00000000-0000-0000-0000-000000000704',
    '00000000-0000-0000-0000-000000000101',
    '2026-07-28T13:00:00Z',
    null,
    'Carta sem assunto para validar o campo opcional.'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.letter_recipients (letter_id, recipient_id)
VALUES
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000103')
ON CONFLICT (letter_id, recipient_id) DO NOTHING;

INSERT INTO public.letter_read_by (letter_id, user_id)
VALUES
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000102')
ON CONFLICT (letter_id, user_id) DO NOTHING;
