# RedSun Supabase Guide

This directory owns RedSun's Supabase CLI configuration, SQL snapshots, local
lifecycle scripts, and database backup/restore tools.

The local Supabase stack is for development and CI only. It uses development
credentials, has no production hardening, and must not be exposed publicly.
Production never starts this local stack: the root `docker-compose.yml` starts
only the API and connects it to a hosted Supabase project through environment
variables.

Unless a section says otherwise, run commands from the repository root.

## Required tools and versions

| Tool | Required version | Check |
| --- | --- | --- |
| Docker | Docker Engine 24 or newer with Docker Compose v2 | `docker --version`; `docker compose version` |
| PowerShell | Windows PowerShell 5.1 or PowerShell 7.4 or newer | `$PSVersionTable.PSVersion` |
| PostgreSQL client | PostgreSQL 17.x client tools (`psql`, `pg_dump`, and `pg_restore`) | `psql --version`; `pg_dump --version`; `pg_restore --version` |
| Supabase CLI | Stable `>= 2.108.0` and `< 3.0.0`; CI is pinned to `2.109.1` | `supabase --version` |

PostgreSQL client 17 matches the local PostgreSQL major version in
`config.toml`. Start Docker Desktop before running a lifecycle command.

Install the Supabase CLI from a normal, non-administrator PowerShell session:

```powershell
$previousExecutionPolicy = Get-ExecutionPolicy -Scope CurrentUser
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Invoke-RestMethod https://get.scoop.sh | Invoke-Expression
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase --version
```

If needed, restore the previous execution policy:

```powershell
if ($previousExecutionPolicy -eq "Undefined") {
  Set-ExecutionPolicy -ExecutionPolicy Undefined -Scope CurrentUser
} else {
  Set-ExecutionPolicy -ExecutionPolicy $previousExecutionPolicy -Scope CurrentUser
}
```

The lifecycle scripts reject an incompatible Supabase CLI version and report
missing Docker, Compose, Supabase CLI, or PostgreSQL tools before changing the
database.

## First-time startup

The first startup must initialize the application schema, local runtime role,
seed users/data, RLS and grants, Storage buckets/access posture, and Auth
records:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Reset
```

The first run can take several minutes while Docker downloads Supabase and API
images. The command starts the required Supabase services, generates the ignored
`apps/api/.env.local.container`, performs the explicit reset, builds the API
container, and waits for `http://127.0.0.1:8080/actuator/health` to report
`UP`.

The lifecycle command always excludes unused Logflare Analytics, Vector,
Realtime, Edge Runtime, imgproxy, PostgREST, and Supavisor services. It keeps
PostgreSQL, Auth, Storage, the API gateway, Studio with pgMeta, and Mailpit.
Studio remains available as the local browser UI, and Mailpit supports local
Auth email flows. No manual `--exclude` argument is required.

The Supabase CLI project namespace is `redsun-supabase`. Supabase still creates
one container per service, using names such as
`supabase_db_redsun-supabase`; it cannot represent the stack as a single
container named `redsun-supabase`.

`config.toml` deliberately disables Supabase migrations and automatic seeding.
The reset wrapper applies the repository SQL files in this order:

1. `db/schema.sql`
2. `db/private-wipe.sql`
3. `db/storage.sql`
4. `db/storage-wipe.sql`
5. `db/auth-wipe.sql`
6. `db/data-api-hardening.sql`
7. `db/app-role-grants.sql`
8. `db/seed.sql`

## Daily start and stop

Start the existing local stack and API without replacing data:

```powershell
.\apps\api\supabase\scripts\start-local.ps1
```

Stop the API and Supabase while preserving local database volumes, Auth users,
and Storage data:

```powershell
.\apps\api\supabase\scripts\stop-local.ps1
```

Normal stop/start is the persistence path. Do not add `--no-backup` to
`supabase stop`; that flag deletes local data.

## Destructive reset

> **Warning:** `-Reset` destroys the local application schema and configured
> application-owned Auth and Storage records before restoring the committed
> seed state. It is not a repair or normal startup command.

Run an intentional local reset with:

```powershell
.\apps\api\supabase\scripts\start-local.ps1 -Reset
```

`reset-local-supabase.ps1` refuses non-local database hosts and refuses
`prod`/`production` environment markers. It also creates or updates only the
validated local runtime role `redsun_dev`, runs SQL with `ON_ERROR_STOP`, and
verifies that the restricted runtime login can execute `SELECT 1`.

The Storage SQL creates the public `avatars`, `tales`, `locations`, and
`characters` buckets. There are intentionally no custom `storage.objects` RLS
policies: public object reads use the public bucket endpoints, while all
uploads and deletes go through the backend with `SUPABASE_SECRET_KEY`. That key
bypasses Storage RLS and must never be exposed to the frontend. Verification
should confirm both the four bucket definitions and the absence of unintended
client write policies.

## Local endpoints

| Service | Host-run endpoint |
| --- | --- |
| Supabase Studio | `http://127.0.0.1:54323` |
| Supabase API gateway (Auth and Storage) | `http://127.0.0.1:54321` |
| PostgreSQL | `127.0.0.1:54322` |
| RedSun backend | `http://127.0.0.1:8080` |
| Backend health | `http://127.0.0.1:8080/actuator/health` |
| Mailpit | `http://127.0.0.1:54324` |

Use `supabase status --workdir apps/api` to inspect the required local service
status. Do not commit keys printed by that command.

## Host-run Maven and container-run API connectivity

Processes on the host connect through `127.0.0.1`/`localhost`. Generate a
host-local environment after Supabase is running, then run Maven:

```powershell
Push-Location apps\api
.\supabase\scripts\prepare-local-api-env.ps1 -OutputFile .env.local
.\mvnw.cmd test
Pop-Location
```

For `spring-boot:run`, load the values from `.env.local` into the process using
your normal IDE or shell environment configuration. The relevant host
connections are:

```dotenv
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:54322/postgres?sslmode=disable
SUPABASE_URL=http://127.0.0.1:54321
```

The API container cannot use the host's `127.0.0.1`. `start-local.ps1`
therefore generates `apps/api/.env.local.container` with
`host.docker.internal:54322` for PostgreSQL and
`http://host.docker.internal:54321` for Supabase. The app-local
`apps/api/docker-compose.yml` consumes that file automatically. No shared
external Docker network is required.

## Local verification checklist

After a clean `start-local.ps1 -Reset`, verify the restricted runtime login:

```powershell
$previousPgPassword = $env:PGPASSWORD
$env:PGPASSWORD = "local-redsun-password"
psql -h 127.0.0.1 -p 54322 -U redsun_dev -d postgres `
  -v ON_ERROR_STOP=1 -c "SELECT 1;"
$env:PGPASSWORD = $previousPgPassword
```

Expected infrastructure state:

- the schema matches the JPA entities and the API container passes
  `spring.jpa.hibernate.ddl-auto=validate`;
- the three seeded users, subscriptions, seeded tale, participant, character
  sheet, Auth users, and Auth identities exist;
- `redsun_dev` is a login role without superuser, role creation, database
  creation, replication, or `BYPASSRLS`;
- all application tables have RLS enabled, `anon`/`authenticated` have no
  application-table grants, and `redsun_dev` has the backend policies/grants;
- the four public Storage buckets exist and no unintended client write policy
  exists on `storage.objects`; and
- local Auth accepts a seeded login and a backend Storage upload/delete works
  with the local secret key.

For a persistence check, insert an independent marker through the runtime
role:

```sql
INSERT INTO public.client_error_reports (message, name)
VALUES ('persistence-marker', 'local-verification');
```

Run `stop-local.ps1`, start without `-Reset`, and confirm that the marker still
exists. Then run `start-local.ps1 -Reset`; the marker count must return to zero
and the three seeded users must exist again.

Finish with Maven and the same workflow commands used by CI. GitHub Actions
pins Supabase CLI `2.109.1`:

```powershell
Push-Location apps\api
.\supabase\scripts\prepare-local-api-env.ps1 -OutputFile .env.local
.\mvnw.cmd -B -ntp test
Pop-Location
```

The API and E2E workflow definitions are
`../../../.github/workflows/api-ci.yml` and
`../../../.github/workflows/e2e-ci.yml`.

## Remote database backup and reset

Remote commands use an app-local environment file such as `apps/api/.env`.
Relative `-EnvFile` paths resolve from `apps/api`; SQL and backup paths resolve
from `apps/api/supabase`.

Create a logical backup of the application schemas before a remote reset:

```powershell
Push-Location apps\api
.\supabase\scripts\backup-db.ps1 -EnvFile .env -OverrideEnv
Pop-Location
```

Include Supabase Auth and Storage metadata only when the snapshot requires it:

```powershell
Push-Location apps\api
.\supabase\scripts\backup-db.ps1 `
  -Schemas public,private,auth,storage `
  -EnvFile .env `
  -OverrideEnv
Pop-Location
```

Backups are written to the ignored `apps/api/supabase/backups/` directory.
Database dumps contain Storage metadata, not the stored object files
themselves.

The following remote reset is destructive and has no interactive confirmation.
Use it only after checking every selected environment value and taking a
backup:

```powershell
Push-Location apps\api
.\supabase\scripts\run-supabase-sql.ps1 -EnvFile .env -OverrideEnv
Pop-Location
```

Remote reset protections and limitations:

- `-EnvFile` makes the target explicit and `-OverrideEnv` prevents stale shell
  values from silently winning.
- Supavisor pooler users are rejected unless they include a project reference
  in the expected `role.<project-ref>` form.
- SQL stops on the first error.
- Reapplying `app-role-grants.sql` ends with a restricted runtime login check.
- The script does **not** ask for confirmation and does **not** reject a
  production marker. The operator must verify `DB_HOST`, `DB_ADMIN_HOST`,
  `DB_NAME`, and the project-qualified users before running it.

To execute only selected SQL files instead of the full reset:

```powershell
Push-Location apps\api
.\supabase\scripts\run-supabase-sql.ps1 `
  -EnvFile .env `
  -OverrideEnv `
  -SqlFiles db/data-api-hardening.sql,db/app-role-grants.sql
Pop-Location
```

## Restore protections

Restore is also destructive, so the restore script requires exact confirmation:

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

- refuses `prod`/`production` environment markers;
- refuses non-local hosts unless `-AllowRemote` is explicitly supplied;
- requires administrator credentials;
- requires the exact `RESTORE <DB_NAME>` confirmation;
- uses `--clean --if-exists` unless `-NoClean` is explicitly supplied; and
- stops on the first restore error.

`-AllowRemote` is only for a non-production test database. After a restore,
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

## Directory layout

- `config.toml` configures the required local Supabase services.
- `db/` contains schema, wipe, hardening, grants, Storage, and seed SQL.
- `scripts/` contains lifecycle, environment, reset, backup, and restore tools.
- `backups/` is created on demand and ignored by Git.

See the official Supabase guides for
[local development](https://supabase.com/docs/guides/local-development) and
[database backups](https://supabase.com/docs/guides/platform/backups).
