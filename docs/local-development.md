# Local Development

This guide covers workstation setup, environment selection, local startup,
Docker debugging, Supabase schema and seed behavior, database security,
backup, restore, remote database operations, and common failures.

Unless noted otherwise, run commands from the repository root in PowerShell.

## Topology and startup order

Start the system in dependency order:

1. Install frontend dependencies.
2. Start the Docker daemon.
3. Start local Supabase, including PostgreSQL, Auth, Storage, and Studio.
4. Build and start the RedSun API.
5. Start the Angular development server.

The lifecycle wrapper performs steps 3 and 4 in that order and waits for the
API health endpoint. The frontend then reads the running local Supabase
publishable key before Angular starts.

## Environment matrix

| Command | Frontend | Backend | Supabase/database |
| --- | --- | --- | --- |
| `npm run start:local` | Local Angular dev server | Local `http://localhost:8080` | Local `http://localhost:54321` |
| `npm run start:local-prod` | Local Angular dev server | Production API | Production Supabase |

Keep these commands separate. `start:local` generates local runtime values and
uses `environment.ts`; `start:local-prod` replaces that file with
`environment.prod.ts`. Running the local preparation hook for
`start:local-prod` would misleadingly overwrite `public/env.js`, even though
the compiled application uses production targets.

## Windows installation

Install the following tools:

- Node 24 LTS satisfying `>=24.15.0 <25` from the
  [official Node download](https://nodejs.org/en/download). Verify with
  `node --version`.
- Docker Engine 24 or newer with Docker Compose v2, provided by Docker Desktop
  configured for WSL 2 and Linux containers using the
  [official Windows guide](https://docs.docker.com/desktop/setup/install/windows-install/).
  Verify the daemon with `docker info` and Compose with
  `docker compose version`.
- A stable Supabase CLI `>=2.108.0 <3.0.0` using the
  [official CLI guide](https://supabase.com/docs/guides/local-development/cli/getting-started).
  CI currently pins `2.109.1`; verify with `supabase --version`.
- PostgreSQL 17 client tools (`psql`, `pg_dump`, and `pg_restore`) from the
  [official PostgreSQL Windows page](https://www.postgresql.org/download/windows/).
  Ensure the tools are on `PATH`.
- Windows PowerShell 5.1 or PowerShell 7.4 or newer. Verify with
  `$PSVersionTable.PSVersion`.

Java 21 is optional for running the API outside Docker. IntelliJ IDEA is
optional for backend development and remote JVM debugging; configure the
project SDK and Maven runner to use Java 21.

## Clean first start

Install the frontend dependencies:

```powershell
Push-Location apps\web
npm ci
Pop-Location
```

`npm ci` installs the exact dependency versions from `package-lock.json`.

Start Docker Desktop, verify it is ready, then initialize local data and
rebuild the API image from fresh base layers:

```powershell
docker info
.\apps\api\supabase\scripts\start-local.ps1 -Reset -NoCache
```

`-Reset` is destructive. Use it only for first initialization or an
intentional clean reset. `-NoCache` applies only to the RedSun API image:
Compose builds it with `--no-cache --pull`, while Supabase services continue
to use their published Docker images.

The lifecycle wrapper starts the required Supabase services, generates the
ignored `apps/api/.env.local.container`, performs the explicit reset, builds
the API container, and waits for the backend health endpoint to report `UP`.
The first run can take several minutes while Docker downloads images.

Start the fully local frontend:

```powershell
Push-Location apps\web
npm run start:local
Pop-Location
```

The `prestart:local` npm hook reads the publishable key from the running local
Supabase stack and writes local frontend, API, and Supabase values to
`public/env.js`. If Supabase is unavailable, it fails before Angular starts.

Primary endpoints:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:4200` |
| Backend health | `http://localhost:8080/actuator/health` |
| Supabase Studio | `http://localhost:54323` |
| Supabase API gateway (Auth and Storage) | `http://localhost:54321` |
| PostgreSQL | `localhost:54322` |
| Mailpit | `http://localhost:54324` |

## Daily start and stop

Start the existing local data and API, then the frontend:

```powershell
.\apps\api\supabase\scripts\start-local.ps1

Push-Location apps\web
npm run start:local
Pop-Location
```

Stop containers while preserving local database, Auth, and Storage data:

```powershell
.\apps\api\supabase\scripts\stop-local.ps1
```

Do not use `npm ci`, `-Reset`, or `-NoCache` in the normal daily path.
Do not add `--no-backup` to `supabase stop`; that flag deletes local data.

## Backend Docker debugging

Start the API with its existing JDWP configuration:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Debug
```

Add `-NoCache` if the API image itself needs a clean rebuild:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Debug -NoCache
```

The flags also combine with `-Reset` when an intentional database reset is
needed. Attach an IntelliJ **Remote JVM Debug** configuration to
`localhost:5005`. The container uses `suspend=n`, so the API starts immediately
instead of waiting for the debugger. Port `8080` remains the HTTP endpoint.

Inspect API logs with the same Compose overlay used for debugging:

```powershell
docker compose --project-directory apps/api `
  --file apps/api/docker-compose.yml `
  --file apps/api/docker-compose.debug.yml `
  logs --no-color --tail 200 api
```

The lifecycle wrapper automatically uses both Compose files for startup and
failure logs when `-Debug` is set.

## Frontend workflows

### Fully local

`npm run start:local` runs Angular's `local` configuration. It keeps
`src/environments/environment.ts`, disables optimization and license
extraction, enables source maps, and disables output hashing. Its pre-hook
regenerates `public/env.js` on every start, so stale production placeholders
or values do not survive into a local session.

### Local frontend against production

```powershell
Push-Location apps\web
npm run start:local-prod
Pop-Location
```

Only the Angular development server is local. API calls, authentication,
Storage operations, and database-backed actions target production services.
Application actions can affect production data, so use this mode carefully.
It neither requires nor starts the local Supabase/backend stack and does not
run the local environment preparation script.

## Supabase and database operations

The local Supabase stack is for development and CI only. Production Compose
starts only the RedSun API and connects it to hosted database and Supabase
services through environment variables.

The lifecycle command excludes unused Logflare Analytics, Vector, Realtime,
Edge Runtime, imgproxy, PostgREST, and Supavisor services. It keeps PostgreSQL,
Auth, Storage, the API gateway, Studio with pgMeta, and Mailpit. No manual
`--exclude` argument is required.

The Supabase CLI project namespace is `redsun-supabase`. The CLI creates one
container per service, using names such as
`supabase_db_redsun-supabase`; it does not create one combined container.

Use the following command to inspect local service status. Its output contains
keys, so do not commit or share it:

```powershell
supabase status --workdir apps/api
```

### Database reset and seed behavior

> **Warning:** `-Reset` destroys the local application schema and configured
> application-owned Auth and Storage records before restoring the committed
> seed state. It is not a repair or normal startup command.

Run an intentional reset with:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Reset
```

The Supabase `config.toml` deliberately disables CLI migrations and automatic
seeding. The reset wrapper applies these repository files in order:

1. `apps/api/supabase/db/schema.sql`
2. `apps/api/supabase/db/private-wipe.sql`
3. `apps/api/supabase/db/storage.sql`
4. `apps/api/supabase/db/storage-wipe.sql`
5. `apps/api/supabase/db/auth-wipe.sql`
6. `apps/api/supabase/db/data-api-hardening.sql`
7. `apps/api/supabase/db/app-role-grants.sql`
8. `apps/api/supabase/db/seed.sql`

`reset-local-supabase.ps1` refuses non-local database hosts and
`prod`/`production` environment markers. It creates or updates only the
validated local runtime role `redsun_dev`, runs SQL with `ON_ERROR_STOP`, and
verifies that the restricted runtime login can execute `SELECT 1`.

### Security and Storage posture

The Storage SQL creates the public `avatars`, `tales`, `locations`, and
`characters` buckets. There are intentionally no custom `storage.objects` RLS
policies: public object reads use public bucket endpoints, while uploads and
deletes go through the backend with `SUPABASE_SECRET_KEY`.

The secret/service-role key bypasses Storage RLS and must never be exposed to
the frontend. Verification should confirm the four bucket definitions and the
absence of unintended client write policies.

All application tables have RLS enabled. The `anon` and `authenticated` roles
have no application-table grants; the restricted `redsun_dev` backend role
receives the required policies and grants.

### Host-run API connectivity

Processes on the host connect through `127.0.0.1` or `localhost`. Generate a
host-local API environment after Supabase is running:

```powershell
Push-Location apps\api
.\supabase\scripts\prepare-local-api-env.ps1 -OutputFile .env.local
.\mvnw.cmd test
Pop-Location
```

For `spring-boot:run`, load `.env.local` through the IDE or shell. Its relevant
host connections are:

```dotenv
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:54322/postgres?sslmode=disable
SUPABASE_URL=http://127.0.0.1:54321
```

An API container cannot use the host's `127.0.0.1`. `start-local.ps1`
therefore generates `apps/api/.env.local.container` with
`host.docker.internal:54322` for PostgreSQL and
`http://host.docker.internal:54321` for Supabase. The app-local Compose file
consumes that environment automatically; no shared external Docker network is
required.

### Local database verification

After a clean reset, verify the restricted runtime login:

```powershell
$previousPgPassword = $env:PGPASSWORD
$env:PGPASSWORD = "local-redsun-password"
psql -h 127.0.0.1 -p 54322 -U redsun_dev -d postgres `
  -v ON_ERROR_STOP=1 -c "SELECT 1;"
$env:PGPASSWORD = $previousPgPassword
```

Expected infrastructure state:

- The schema matches the JPA entities and passes
  `spring.jpa.hibernate.ddl-auto=validate`.
- The three seeded users, subscriptions, tale, participant, character sheet,
  Auth users, and Auth identities exist.
- `redsun_dev` is a login role without superuser, role creation, database
  creation, replication, or `BYPASSRLS`.
- The four public Storage buckets exist with no unintended client write policy
  on `storage.objects`.
- Local Auth accepts a seeded login, and backend Storage upload/delete works
  with the local secret key.

For a persistence check, insert an independent marker through the runtime
role:

```sql
INSERT INTO public.client_error_reports (message, name)
VALUES ('persistence-marker', 'local-verification');
```

Run `stop-local.ps1`, start without `-Reset`, and confirm the marker remains.
Then run `start-local.ps1 -Reset`; the marker count must return to zero and the
three seeded users must exist again.

Finish with the Maven workflow used by CI:

```powershell
Push-Location apps\api
.\supabase\scripts\prepare-local-api-env.ps1 -OutputFile .env.local
.\mvnw.cmd -B -ntp test
Pop-Location
```

GitHub Actions pins Supabase CLI `2.109.1` in
[API CI](../.github/workflows/api-ci.yml) and
[E2E CI](../.github/workflows/e2e-ci.yml).

### Remote database backup and reset

Remote commands use an app-local environment file such as `apps/api/.env`.
Relative `-EnvFile` paths resolve from `apps/api`; SQL and backup paths resolve
from `apps/api/supabase`.

Create a logical backup before a remote reset:

```powershell
Push-Location apps\api
.\supabase\scripts\backup-db.ps1 -EnvFile .env -OverrideEnv
Pop-Location
```

Include Auth and Storage metadata only when required:

```powershell
Push-Location apps\api
.\supabase\scripts\backup-db.ps1 `
  -Schemas public,private,auth,storage `
  -EnvFile .env `
  -OverrideEnv
Pop-Location
```

Backups are written to the ignored `apps/api/supabase/backups/` directory.
Database dumps contain Storage metadata, not the stored object files.

The remote reset below is destructive and has no interactive confirmation.
Verify every target value and take a backup first:

```powershell
Push-Location apps\api
.\supabase\scripts\run-supabase-sql.ps1 -EnvFile .env -OverrideEnv
Pop-Location
```

Remote reset protections and limitations:

- `-EnvFile` makes the target explicit; `-OverrideEnv` prevents stale shell
  values from taking precedence.
- Supavisor pooler users are rejected unless they include a project reference
  in the expected `role.<project-ref>` form.
- SQL stops on the first error.
- Reapplying `app-role-grants.sql` ends with a restricted runtime login check.
- The script does not ask for confirmation or reject a production marker. The
  operator must verify `DB_HOST`, `DB_ADMIN_HOST`, `DB_NAME`, and all
  project-qualified users.

To execute selected SQL files instead of the full reset:

```powershell
Push-Location apps\api
.\supabase\scripts\run-supabase-sql.ps1 `
  -EnvFile .env `
  -OverrideEnv `
  -SqlFiles db/data-api-hardening.sql,db/app-role-grants.sql
Pop-Location
```

### Restore protections

Restore is destructive and requires exact confirmation:

```powershell
Push-Location apps\api
.\supabase\scripts\restore-db.ps1 `
  -BackupFile backups\postgres-YYYYMMDD-HHMMSS.dump `
  -EnvFile .env.local `
  -OverrideEnv `
  -ConfirmRestore "RESTORE postgres"
Pop-Location
```

The restore script:

- Refuses `prod`/`production` environment markers.
- Refuses non-local hosts unless `-AllowRemote` is supplied.
- Requires administrator credentials and the exact
  `RESTORE <DB_NAME>` confirmation.
- Uses `--clean --if-exists` unless `-NoClean` is supplied.
- Stops on the first restore error.

`-AllowRemote` is only for a non-production test database. After restoring,
reapply Data API hardening and runtime grants:

```powershell
Push-Location apps\api
.\supabase\scripts\run-supabase-sql.ps1 `
  -EnvFile .env.local `
  -OverrideEnv `
  -SslMode disable `
  -SqlFiles db/data-api-hardening.sql,db/app-role-grants.sql
Pop-Location
```

### Supabase directory layout

- `apps/api/supabase/config.toml` configures local services.
- `apps/api/supabase/db/` contains schema, wipe, hardening, grants, Storage,
  and seed SQL.
- `apps/api/supabase/scripts/` contains lifecycle, environment, reset, backup,
  and restore tools.
- `apps/api/supabase/backups/` is created on demand and ignored by Git.

See the official Supabase guides for
[local development](https://supabase.com/docs/guides/local-development) and
[database backups](https://supabase.com/docs/guides/platform/backups).

## Optional Codex agent launcher

Start a layered session for the whole repository:

```powershell
.\scripts\codexLaucher.ps1 -App all
```

Valid app selections are `web`, `api`, `repo`, and `all`. Validate layer
resolution without launching Codex:

```powershell
.\scripts\codexLaucher.ps1 -App all -DryRun
```

## Troubleshooting

### Unsupported Node or Supabase CLI version

Compare `node --version` with `>=24.15.0 <25` and `supabase --version` with
`>=2.108.0 <3.0.0`. The Node range is declared in `apps/web/package.json`;
the API lifecycle wrapper stops with an explicit Supabase version error before
startup.

### Docker is unavailable

Start Docker Desktop and wait until its engine is ready. Run `docker info`.
If that fails, confirm WSL 2 and Linux containers are enabled and restart
Docker Desktop.

### A port is occupied

Check ports `4200`, `5005`, `54321` through `54324`, `54322`, and `8080`:

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object LocalPort -In 4200,5005,54321,54322,54323,54324,8080
```

Stop the conflicting process or container before retrying. Port `5005` matters
only with `-Debug`.

### `psql` is missing

Install PostgreSQL 17 client tools, add their `bin` directory to `PATH`, open a
new PowerShell session, and run `psql --version`. `-Reset` requires `psql`;
ordinary data-preserving startup does not.

### Local Supabase status fails

Run:

```powershell
supabase status --workdir apps/api
```

If it fails, start the stack through `start-local.ps1` and inspect the
Supabase/Docker output. `npm run start:local` intentionally refuses to start
when it cannot read a local publishable key.

### Frontend has stale environment output

Stop Angular and run `npm run start:local` again. The pre-hook rewrites
`apps/web/public/env.js`. Do not manually copy production keys into this file,
and never expose a Supabase secret/service-role key to the frontend.

### API health times out

Inspect the failure logs printed by `start-local.ps1`, then run:

```powershell
docker compose --project-directory apps/api `
  --file apps/api/docker-compose.yml `
  logs --no-color --tail 200 api
```

Confirm port `8080` is free, Docker has adequate resources, and the local
schema has been initialized. Use `-Reset` only when a destructive reset is
intended.

## Safety boundaries

The local Supabase stack is development-only, uses development credentials,
and must not be exposed publicly. The repository's production Compose file
contains only the RedSun API service; it never launches local Supabase.
