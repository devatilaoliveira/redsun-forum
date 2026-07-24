# RedSun

RedSun is a monorepo for an Angular frontend, Spring Boot API, and
Supabase-backed role-playing forum application. Unless noted otherwise, run
commands from the repository root in PowerShell.

## Clean first start

```powershell
# 1. Install frontend dependencies
Push-Location apps\web
npm ci
Pop-Location

# 2. Start Docker Desktop and verify it is ready
docker info

# 3. Initialize local Supabase and rebuild/start the API without cache
.\apps\api\supabase\scripts\start-local.ps1 -Reset -NoCache
```

`-Reset` is destructive and is intended only for first initialization or an
intentional clean reset. The lifecycle wrapper starts the local
Supabase/database services before the API container. `-NoCache` rebuilds only
the RedSun API image; Supabase uses published Docker images.

Start the fully local frontend:

```powershell
Push-Location apps\web
npm run start:local
Pop-Location
```

`npm run start:local` automatically prepares local runtime values before
Angular starts.

Primary endpoints:

- Frontend: `http://localhost:4200`
- Backend health: `http://localhost:8080/actuator/health`
- Supabase Studio: `http://localhost:54323`

## Daily local start

```powershell
.\apps\api\supabase\scripts\start-local.ps1

Push-Location apps\web
npm run start:local
Pop-Location
```

Stop containers while preserving local data:

```powershell
.\apps\api\supabase\scripts\stop-local.ps1
```

Do not use `npm ci`, `-Reset`, or `-NoCache` in the normal daily path.

## Local frontend against production

> **Caution:** only the Angular development server is local. API calls,
> authentication, Storage operations, and database-backed actions target
> production services and can affect production data.

```powershell
Push-Location apps\web
npm run start:local-prod
Pop-Location
```

This command does not require or start the local Supabase/backend stack.

## Optional Codex agent launcher

```powershell
.\scripts\codexLaucher.ps1 -App all
```

Other selections are `web`, `api`, and `repo`. Validate layer selection without
launching Codex:

```powershell
.\scripts\codexLaucher.ps1 -App all -DryRun
```

## Documentation

- [Local development](docs/local-development.md): installation, environment
  selection, Docker debugging, troubleshooting, Supabase schema and seed
  behavior, security, backup, restore, and remote database operations.
