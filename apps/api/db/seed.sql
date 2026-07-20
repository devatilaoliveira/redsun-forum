-- Deterministic local/CI seed data.
-- Run this only after the schema, auth wipe, storage setup, Data API hardening,
-- and app role grants have been applied.

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
VALUES (
  '00000000-0000-0000-0000-000000000301',
  'Seeded RedSun Tale',
  '00000000-0000-0000-0000-000000000101',
  true,
  null,
  'Seeded tale for full browser E2E workflows.',
  'EN',
  'REDSUN',
  '2026-01-01T00:00:00Z',
  '2026-01-01T00:00:00Z',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tale_participants (
  tale_id,
  participant_id
)
VALUES (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000101'
)
ON CONFLICT (tale_id, participant_id) DO NOTHING;

INSERT INTO public.basic_sheets (
  id,
  tale_id,
  character_id,
  character_name,
  character_description,
  character_image_url,
  change_history
)
VALUES (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000101',
  'no_given_name_yet',
  null,
  null,
  null
)
ON CONFLICT (tale_id, character_id) DO NOTHING;
