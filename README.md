# RedSun

RedSun is a monorepo for a role-playing forum application.

- `apps/api`: Spring Boot backend for authentication, tales, locations, posts, letters, character sheets, storage, and Supabase integration.
- `apps/web`: Angular frontend.
- `scripts`: repository-level helper scripts, including the Codex agent launcher.

Unless noted otherwise, commands in this README start from the repository root.

## Prerequisites

- Docker and the Docker Compose plugin for the API.
- Node.js 22 and npm for the web app.
- PostgreSQL command line tools for database scripts (`psql`, `pg_dump`, `pg_restore`).

## Codex Agent Sessions

Use the root launcher to start a layered Codex session:

```powershell
.\scripts\rsAgents.ps1 -App repo
.\scripts\rsAgents.ps1 -App api
.\scripts\rsAgents.ps1 -App web
.\scripts\rsAgents.ps1 -App all
```

`-App repo` loads only the shared core layer for repository-level tasks.
`-App api` loads the shared core, API project, domain map, Spring Boot, and persistence/storage layers.
`-App web` loads the shared core, web project, and Angular layers.
`-App all` loads both app layer sets.

Model overrides are available for a single session:

```powershell
.\scripts\rsAgents.ps1 -App api -Model gpt-5.4-mini -ReasoningEffort medium
.\scripts\rsAgents.ps1 -App web -ModelPreset Balanced -ReasoningEffort medium
.\scripts\rsAgents.ps1 -App all -ModelPreset Frontier -ReasoningEffort xhigh
```

Available presets:

- `Frontier`: `gpt-5.5`
- `Balanced`: `gpt-5.4`
- `Mini`: `gpt-5.4-mini`

Use `-Model` for exact OpenAI model IDs. Use `-ModelPreset` for convenience aliases. Do not pass both in the same command.

Validate layer resolution without starting Codex:

```powershell
.\scripts\rsAgents.ps1 -App api -DryRun
```

## API

The API project lives in `apps/api`.

Environment files, Docker Compose files, SQL files, and database scripts are app-local:

- `apps/api/.env.local`
- `apps/api/.env.prod`
- `apps/api/docker-compose.yml`
- `apps/api/docker-compose.debug.yml`
- `apps/api/db/*.sql`
- `apps/api/scripts/*.ps1`

### Local Environment

Create an app-local environment file before running the API:

```powershell
Copy-Item apps\api\.env.template apps\api\.env.local
```

Edit `apps/api/.env.local` with the Supabase, database, JWT, and email values for the target environment.

### Docker

Run these commands from `apps/api`, not from the repository root. The root Compose file is production-only.
In PowerShell, type only the command text. Do not paste the prompt prefix such as `PS C:\...\redsun>`.

The API Compose file expects the external Docker network `rs-net`. Create it once:

```powershell
docker network create rs-net
```

Build the API image from a clean Docker state with no layer cache:

```powershell
Push-Location apps\api
docker compose build --no-cache --pull
Pop-Location
```

Run the already-built API container:

```powershell
Push-Location apps\api
docker compose up -d
Pop-Location
```

Build and run the API container in one command:

```powershell
Push-Location apps\api
docker compose up -d --build
Pop-Location
```

Build from a clean Docker state and then run:

```powershell
Push-Location apps\api
docker compose build --no-cache --pull
docker compose up -d
Pop-Location
```

Use another app-local env file by setting `APP_ENV_FILE` before running Compose. The path is resolved from `apps/api`:

```powershell
$env:APP_ENV_FILE = ".env.prod"
Push-Location apps\api
docker compose up -d --build
Pop-Location
Remove-Item env:APP_ENV_FILE -ErrorAction SilentlyContinue
```

### Debug With IntelliJ

Start the API container with the debug override:

```powershell
Push-Location apps\api
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d --build
Pop-Location
```

Create an IntelliJ Remote JVM Debug configuration:

- Host: `localhost`
- Port: `5005`

To rebuild the debug container without Docker layer cache:

```powershell
Push-Location apps\api
docker compose -f docker-compose.yml -f docker-compose.debug.yml build --no-cache --pull
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d
Pop-Location
```

### Database Reset

Before running the API the first time, initialize the Supabase/Postgres database schema and policies.

`apps/api/db/schema.sql` drops and recreates the application tables. The reset flow also applies private schema cleanup, RLS policies, storage setup and wipe scripts, Supabase Data API hardening, and application role grants.

Run a local reset:

```powershell
Push-Location apps\api
.\scripts\run-supabase-sql.ps1 -OverrideEnv
Pop-Location
```

Run with an explicit app-local env file:

```powershell
Push-Location apps\api
.\scripts\run-supabase-sql.ps1 -EnvFile .env.local -OverrideEnv
Pop-Location
```

Production schema changes should only be run with intentional production credentials:
This command wipes application data and reapplies schema, cleanup scripts, RLS policies, storage setup, Data API hardening, and runtime role policies:

```powershell
Push-Location apps\api; .\scripts\run-supabase-sql.ps1 -EnvFile .env.prod -OverrideEnv; Pop-Location
```

### Database Backup And Restore

Backups are written under `apps/api/backups/`, which is ignored by Git when commands are run from `apps/api`.

Create a backup:

```powershell
Push-Location apps\api
.\scripts\backup-db.ps1 -EnvFile .env.local -OverrideEnv
Pop-Location
```

Include Supabase auth and storage schemas when a test snapshot needs them:

```powershell
Push-Location apps\api
.\scripts\backup-db.ps1 -Schemas public,private,auth,storage -EnvFile .env.local -OverrideEnv
Pop-Location
```

Storage object files are not included in the database dump.

Restore a local database from a backup:

```powershell
Push-Location apps\api
.\scripts\restore-db.ps1 -BackupFile .\backups\postgres-YYYYMMDD-000000.dump -ConfirmRestore "RESTORE postgres" -OverrideEnv
Pop-Location
```

The confirmation text must match the target database name: `RESTORE <DB_NAME>`.

Restore protections:

- Refuses production markers such as `SPRING_PROFILES_ACTIVE=prod`, `APP_ENV=prod`, or `ENV=prod`.
- Refuses remote database hosts unless `-AllowRemote` is passed.
- Requires `DB_ADMIN_USER` and `DB_ADMIN_PASSWORD`.
- Uses `--clean --if-exists` by default so backup objects replace current objects.

After restoring a snapshot, refresh the application role grants:

```powershell
Push-Location apps\api
.\scripts\run-supabase-sql.ps1 -EnvFile .env.local -OverrideEnv -SqlFiles db/app-role.sql
Pop-Location
```

Reapply Supabase Data API hardening as well:

```powershell
Push-Location apps\api
.\scripts\run-supabase-sql.ps1 -EnvFile .env.local -OverrideEnv -SqlFiles db/data-api-hardening.sql,db/app-role.sql
Pop-Location
```

Restart the API container:

```powershell
Push-Location apps\api
docker compose restart api
Pop-Location
```

## Web

The web project lives in `apps/web`.

### Run Locally

```powershell
Push-Location apps\web
npm ci
npm start
Pop-Location
```

Open `http://localhost:4200/`.

### Test On Mobile

To open the Angular dev server from a phone on the same Wi-Fi network, serve the web app on all network interfaces:

```powershell
npx ng serve --host 0.0.0.0 --port 4200
Pop-Location
```

Then open the network URL on the phone:

```text
Network: http://192.168.178.80:4200/
```

### Runtime Config

The app reads runtime values from `apps/web/public/env.js` through `window.__env`:

- `BASE_URL`
- `API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

For local development, placeholder values in `public/env.js` fall back to defaults in `src/environments/environment.ts`.
`npm run build` regenerates `public/env.js` from environment variables before Angular builds.

### Cloudflare Pages

Deploy the web app with Cloudflare Pages:

- Root directory: `apps/web`
- Build command: `npm ci && npm run build`
- Output directory: `dist/redsun-web/browser`

Set only public frontend values in Cloudflare Pages environment variables:

- `BASE_URL`
- `API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Direct route refreshes are handled by `public/_redirects`.

### Other Web Scripts

```powershell
Push-Location apps\web
npm run build
npm run lint
npm test
npm run e2e
Pop-Location
```
