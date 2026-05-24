# RedSun

RedSun is a monorepo for a role-playing forum application.

- `apps/api`: Spring Boot backend for authentication, tales, locations, posts, letters, character sheets, storage, and Supabase integration.
- `apps/web`: Angular frontend.
- `scripts`: repository-level helper scripts, including the Codex agent launcher.

Unless noted otherwise, commands in this README start from the repository root.

## Prerequisites

- Java 21 and Maven wrapper support for the API.
- Node.js 22 and npm for the web app.
- Docker for containerized runs.
- PostgreSQL command line tools for database scripts (`psql`, `pg_dump`, `pg_restore`).

## Production Deploy

Production deploys are handled by GitHub Actions on pushes to `main`.
The workflow builds `apps/api/Dockerfile` and `apps/web/Dockerfile`, pushes both images to AWS ECR, then connects to the EC2 host and runs the root Compose file from the deployed clone.

Create these ECR repositories before the first deploy:

- `redsun-api`
- `redsun-web`

Configure GitHub with these repository variables or secrets:

- `AWS_REGION`, for example `sa-east-1`
- `AWS_ROLE_TO_ASSUME`, the GitHub OIDC role allowed to push to ECR
- `ECR_REGISTRY`, for example `<account-id>.dkr.ecr.<region>.amazonaws.com`
- `DEPLOY_PATH`, optional, defaults to `/opt/redsun`

Configure these as GitHub secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

On the EC2 host, install Docker, the Docker Compose plugin, Git, and AWS CLI. Clone the repository at `/opt/redsun` or the configured `DEPLOY_PATH`, attach an IAM role with read-only ECR permissions, and create a root `.env` file outside Git:

```env
ECR_REGISTRY=<account-id>.dkr.ecr.<region>.amazonaws.com
IMAGE_TAG=latest
API_ENV_FILE=apps/api/.env.prod
BASE_URL=http://<ec2-host>:4200
API_BASE_URL=http://<ec2-host>:8080
SUPABASE_URL=<supabase-url>
SUPABASE_ANON_KEY=<supabase-anon-key>
```

Keep production secrets in the API env file referenced by `API_ENV_FILE`; do not commit `.env`, `.env.local`, `.env.prod`, private keys, or cloud credentials.

## Codex Agent Sessions

Use the root launcher to start a layered Codex session:

```powershell
.\scripts\rsAgents.ps1 -App api
.\scripts\rsAgents.ps1 -App web
.\scripts\rsAgents.ps1 -App all
```

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

### Run Locally

```powershell
Push-Location apps\api
.\mvnw spring-boot:run
Pop-Location
```

The default Spring profile is `local`. Override it when needed:

```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
Push-Location apps\api
.\mvnw spring-boot:run
Pop-Location
```

### Docker

The API Compose file expects the external Docker network `rs-net`:

```powershell
docker network create rs-net
```

Run the API container:

```powershell
Push-Location apps\api
docker compose build --no-cache
docker compose up -d
Pop-Location
```

Use another app-local env file by setting `APP_ENV_FILE` before running Compose:

```powershell
$env:APP_ENV_FILE = ".env.prod"
Push-Location apps\api
docker compose up -d --build
Pop-Location
Remove-Item env:APP_ENV_FILE -ErrorAction SilentlyContinue
```

### Debug With IntelliJ

Start the API with the debug override:

```powershell
Push-Location apps\api
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d --build
Pop-Location
```

Create an IntelliJ Remote JVM Debug configuration:

- Host: `localhost`
- Port: `5005`

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

```powershell
Push-Location apps\api
.\scripts\run-supabase-sql.ps1 -EnvFile .env.prod -OverrideEnv
Pop-Location
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

### Runtime Config

The app reads runtime values from `apps/web/public/env.js` through `window.__env`:

- `BASE_URL`
- `API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

For local development, placeholder values in `public/env.js` fall back to defaults in `src/environments/environment.ts`.

### Docker

The web Compose file expects the external Docker network `rs-net`:

```powershell
docker network create rs-net
```

Run the web container:

```powershell
Push-Location apps\web
docker compose build --no-cache
docker compose up -d
Pop-Location
```

The app is available at `http://localhost:4200/`.

### Other Web Scripts

```powershell
Push-Location apps\web
npm run build
npm run lint
npm test
npm run e2e
Pop-Location
```
