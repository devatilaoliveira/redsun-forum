# Local Development

Run commands from the repository root in PowerShell unless a command says
otherwise.

## Supported environments

RedSun has two environments only:

| Environment | Frontend | API | Database, Auth, Storage |
| --- | --- | --- | --- |
| Local | Angular on the host | Docker container | Local Supabase in Docker |
| Production | Cloudflare | Coolify | Hosted Supabase |

Local code does not load production dotenv files. There is no stage mode and
no command for running the local frontend against production services.

## Requirements

- Docker Desktop using Linux containers and Docker Compose v2
- Supabase CLI exactly `2.109.1`
- Node `>=24.15.0 <25`
- PowerShell 7 on Linux/macOS, or Windows PowerShell 5.1/PowerShell 7 on Windows
- Java 21 only when running Maven directly on the host

Verify the required local tools:

```powershell
docker info
docker compose version
supabase --version
node --version
```

The Supabase local stack is development-only. Do not expose its ports publicly.

## First start

Install the pinned frontend dependencies:

```powershell
Push-Location apps\web
npm ci
Pop-Location
```

Start Supabase and the API:

```powershell
.\local.ps1 start
```

On a fresh Supabase instance, `supabase start` applies every committed
migration and then runs `seed.sql`. The lifecycle script subsequently:

1. Reads the CLI-issued publishable/anon and service-role keys from
   `supabase status --output env`.
2. Changes `redsun_dev` into a local login using the committed
   `local-redsun-password`.
3. Writes the service-role key to ignored `apps/api/.env.local.keys`.
4. Writes fixed browser-local URLs and the publishable key to ignored
   `apps/web/public/env.js`.
5. Builds and starts the API container.
6. Waits for `http://localhost:8080/actuator/health` to report `UP`.

Start Angular in another terminal:

```powershell
Push-Location apps\web
npm run start:local
Pop-Location
```

Angular does not discover Supabase keys itself. If `public/env.js` is missing or
stale, rerun `.\local.ps1 start`.

## Lifecycle commands

### Start or resume

```powershell
.\local.ps1 start
```

This preserves database, Auth, and Storage mutations. It refreshes generated
keys/configuration and recreates the API container.

Use the same entrypoint for an uncached API image build or JVM debugging:

```powershell
.\local.ps1 start -NoCache
.\local.ps1 start -DebugApi
```

Debug mode exposes JDWP on `localhost:5005` with `suspend=n`.

### Reset

```powershell
.\local.ps1 reset
```

Reset runs:

```text
supabase db reset --local
  -> migrations in timestamp order
  -> apps/api/supabase/seed.sql
  -> local redsun_dev password provisioning
  -> runtime key/config refresh
  -> API restart and health check
```

It removes all local database mutations, including records created by E2E, and
restores the deterministic seed state. No custom table/Auth/Storage wipe
sequence is used.

### Stop

```powershell
.\local.ps1 stop
```

This stops the API Compose project and Supabase without using
`supabase stop --no-backup`, so local state is preserved.

## Fixed local configuration

The API container gets fixed non-secret values directly from
`apps/api/docker-compose.yml`:

| Setting | Local value |
| --- | --- |
| Frontend and CORS origin | `http://localhost:4200` |
| Database URL | `jdbc:postgresql://host.docker.internal:54322/postgres?sslmode=disable` |
| Database role | `redsun_dev` |
| Database password | `local-redsun-password` |
| Supabase URL | `http://host.docker.internal:54321` |
| Supabase JWT issuer | `http://127.0.0.1:54321/auth/v1` |
| Storage URL | `http://host.docker.internal:54321/storage/v1/object/public/` |
| Brevo/Gemini credentials | Non-secret local placeholders |

Only the dynamically issued API service-role key is stored in
`apps/api/.env.local.keys`.

The browser runtime file contains:

- `APP_ENV=local`
- `BASE_URL=http://localhost:4200`
- `API_BASE_URL=http://localhost:8080`
- `SUPABASE_URL=http://127.0.0.1:54321`
- The CLI-issued publishable/anon key

It never contains the service-role/secret key.

## Migrations and seed data

`apps/api/supabase/config.toml` retains PostgreSQL 17, enables migrations, and
enables the standard `seed.sql` lifecycle.

`apps/api/supabase/migrations/` contains:

- The provisional production schema baseline.
- A separate forward migration for the private schema, `redsun_dev` role and
  grants, explicit Data API revocations, public/private RLS, and the four
  Storage bucket definitions.

There are no declarative schema files. Create future migration files with:

```powershell
supabase migration new <descriptive-name> --workdir apps/api
```

Then verify the complete history with `.\local.ps1 reset`.

`apps/api/supabase/seed.sql` contains deterministic synthetic fixtures only:

- Three login-capable Supabase Auth users and identities
- Matching application users and subscriptions
- A seeded tale, owner participant, and character sheet
- Localized patch-note fixtures

Seeded browser credentials:

| Email | Password |
| --- | --- |
| `worker-login-1@redsun.com` | `123redsun1` |
| `worker-login-2@redsun.com` | `123redsun2` |
| `worker-login-3@redsun.com` | `123redsun3` |

Production data is never copied into local or CI. Production `db push` must
never use `--include-seed`.

## Database security

Migrations define `redsun_dev` without assigning production credentials. The
role is explicitly denied superuser, role creation, database creation,
replication, and `BYPASSRLS` privileges.

All 18 application tables in `public` have RLS enabled. The private username
counter also has defense-in-depth RLS. `anon` and `authenticated` receive no
application-table privileges and cannot use the private schema. The backend
role has the required table, sequence, function, and RLS-policy access;
`patch_notes` remains read-only to the backend.

The application migration defines four public Storage buckets:

- `avatars`
- `tales`
- `locations`
- `characters`

Uploads and deletes go through the API using the service-role key. The
frontend receives only the publishable/anon key.

## Verification

### Health, role, RLS, and fixtures

After reset:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health

docker exec supabase_db_redsun-supabase psql -U postgres -d postgres -c `
  "select rolcanlogin, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls from pg_roles where rolname = 'redsun_dev';"

docker exec supabase_db_redsun-supabase psql -U postgres -d postgres -c `
  "select count(*) as seeded_auth_users from auth.users;"

docker exec supabase_db_redsun-supabase psql -U postgres -d postgres -c `
  "select id from storage.buckets where id in ('avatars','tales','locations','characters') order by id;"

docker exec supabase_db_redsun-supabase psql -U postgres -d postgres -c `
  "select n.nspname, c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public','private') and c.relkind = 'r' order by 1,2;"
```

Expected results:

- `redsun_dev` can log in locally and every elevated attribute is false.
- Exactly three seeded Auth users exist.
- All four application buckets exist.
- Every application table reports RLS enabled.

The Playwright suite logs in with the seeded credentials, providing a real
email/password Auth verification against local Supabase.

### Persistence versus reset

Create a marker through the restricted backend role:

```powershell
docker exec -e PGPASSWORD=local-redsun-password supabase_db_redsun-supabase `
  psql -h 127.0.0.1 -U redsun_dev -d postgres -v ON_ERROR_STOP=1 -c `
  "insert into public.client_error_reports (message, name) values ('persistence-marker', 'local-verification');"
```

Run `.\local.ps1 stop`, then `.\local.ps1 start`, and confirm the marker still
exists. Run `.\local.ps1 reset` and confirm it is gone and the seed users are
restored.

### Maven tests

Run the API directly against local Supabase:

```powershell
$env:DB_USER = "redsun_dev"
$env:DB_PASSWORD = "local-redsun-password"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://127.0.0.1:54322/postgres?sslmode=disable"
$env:SUPABASE_URL = "http://127.0.0.1:54321"
$env:SUPABASE_STORAGE_URL = "http://127.0.0.1:54321/storage/v1/object/public/"
$env:SUPABASE_SECRET_KEY = (
  supabase status --workdir apps/api --output env |
    Select-String '^SERVICE_ROLE_KEY='
).Line.Split('=', 2)[1].Trim('"')

Push-Location apps\api
.\mvnw.cmd -B -ntp test
Pop-Location
```

Hibernate uses `ddl-auto: validate`, so application startup and the Maven suite
validate the JPA mapping against the migrated schema.

### Playwright

With the lifecycle stack running:

```powershell
Push-Location apps\web
npm run e2e -- --workers=1
Pop-Location
```

The suite runs the configured Chromium, Firefox, and WebKit projects. A later
`.\local.ps1 reset` removes E2E-created tales, participants, locations, users,
and other database records.

## CI behavior

API CI runs for pull requests to `main` and manual dispatch. It:

1. Starts local Supabase.
2. Runs a standard reset and seed.
3. Provisions the restricted local login and exports the discovered key.
4. Verifies role attributes, public/private RLS, Data API isolation, seeded Auth
   users, and Storage buckets.
5. Runs Maven tests with JPA schema validation.

E2E CI runs for pull requests to `main` and manual dispatch. It calls
`local.ps1 reset`, uses the Docker API, runs all Playwright browser projects
with one worker, and stores API logs and the Playwright report on failure.

Web CI retains Angular lint and full build verification. Do not run the full
frontend build from the agent environment because it is known to fail there
with `spawn EPERM`; use targeted lint/static checks locally.

## Production boundary

Production values are supplied externally:

- Cloudflare supplies frontend build/runtime values.
- Coolify supplies API/database/integration values.
- Supabase retains hosted platform configuration and migration history.

The repository does not contain production credentials and GitHub Actions does
not receive production database access.

The current baseline file is provisional because this repository session had
no authenticated production connection. Before the first production push, an
operator must replace it through the `supabase db pull` workflow and ensure the
forward hardening migration sorts after the pulled baseline. Follow
[production database deployment](production-database.md).

## Troubleshooting

### Supabase CLI version rejected

Install exactly `2.109.1`, matching `local.ps1` and GitHub Actions.

### Docker unavailable

Start Docker Desktop, wait for the Linux engine, then run `docker info`.

### Frontend reports missing runtime values

Stop Angular, run `.\local.ps1 start`, and restart `npm run start:local`.
Do not manually copy a service-role key into `public/env.js`.

### API health timeout

Inspect API logs:

```powershell
docker compose --project-directory apps/api `
  --file apps/api/docker-compose.yml logs --no-color --tail 200 api
```

Confirm ports `8080`, `54321`, `54322`, `54323`, and `54324` are free.

### Schema or fixture drift

Run `.\local.ps1 reset`. Do not restore a remote dump or recreate the removed
wipe/reset scripts.
