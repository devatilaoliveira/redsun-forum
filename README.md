# RedSun

RedSun is a monorepo for a role-playing forum application:

- `apps/api` — Spring Boot backend.
- `apps/web` — Angular frontend.
- `apps/api/supabase` — local Supabase infrastructure and database utilities.

Unless noted otherwise, run commands from the repository root.

## Local development

The complete API, database, Auth, and Storage setup is documented in the
[focused Supabase guide](apps/api/supabase/README.md).

First-time or intentionally clean API startup:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Reset
```

Daily API start and data-preserving stop:

```powershell
.\apps\api\supabase\scripts\start-local.ps1
.\apps\api\supabase\scripts\stop-local.ps1
```

`-Reset` is destructive. The focused guide covers required tool versions,
endpoints, host-run Maven connectivity, container connectivity, remote
backup/reset commands, restore protections, and local verification.

Run the web app:

```powershell
Push-Location apps\web
npm ci
npm run start:local
Pop-Location
```

Open `http://localhost:4200/`.

## Production

Production never starts the local Supabase stack. The root
`docker-compose.yml` contains only the RedSun API service and receives hosted
Supabase/database settings from `apps/api/.env.prod` by default:

```powershell
docker compose up -d --build
```

To select another hosted environment file whose path is relative to the
repository root:

```powershell
$env:API_ENV_FILE = "apps/api/.env.prod"
docker compose up -d --build
Remove-Item env:API_ENV_FILE -ErrorAction SilentlyContinue
```

The local Supabase configuration under `apps/api/supabase` is development/CI
infrastructure and is never started by production Compose.

## Verification

Run API tests against an initialized local stack:

```powershell
Push-Location apps\api
.\supabase\scripts\prepare-local-api-env.ps1 -OutputFile .env.local
.\mvnw.cmd test
Pop-Location
```

API and browser E2E automation live in:

- `.github/workflows/api-ci.yml`
- `.github/workflows/e2e-ci.yml`

Do not run full frontend builds from the agent environment; use the E2E
workflow or targeted non-build checks instead.

## Codex agent sessions

Start a layered repository session with:

```powershell
.\scripts\codexLaucher.ps1 -App repo
.\scripts\codexLaucher.ps1 -App api
.\scripts\codexLaucher.ps1 -App web
.\scripts\codexLaucher.ps1 -App all
```

Validate layer resolution without launching Codex:

```powershell
.\scripts\codexLaucher.ps1 -App api -DryRun
```
