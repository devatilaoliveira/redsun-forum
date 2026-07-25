# Production Database Deployment

Production database changes are manual and operator-controlled. GitHub Actions
does not receive production Supabase credentials, and seed data is never
deployed.

## One-time baseline adoption

The committed `20260724000000_production_baseline.sql` is a provisional
repository baseline derived from the previous schema definition. Before the
first production push, an authenticated operator must establish the actual
production schema as migration history:

1. Create a clean working branch and authenticate with `supabase login`.
2. Link `apps/api` to the production project with
   `supabase link --project-ref <project-ref> --workdir apps/api`.
3. Temporarily move the entire provisional `migrations/` directory out of the
   working tree so the pull starts with no local schema history.
4. Run `supabase db pull --workdir apps/api`.
5. Review the generated migration for unexpected platform-default differences,
   including extension changes.
6. Confirm the generated SQL is identical to the current production
   application schema. Keep repository-intended corrections in the later
   backend security/Storage migration.
7. Keep the generated baseline filename and timestamp. Restore the
   backend security/Storage SQL through a newly created migration whose
   timestamp is later than the generated baseline, then commit both files.

`db pull` records its generated baseline as applied in the linked remote
migration history, so a later `db push` does not replay it. Do not run the first
production `db push` until the generated baseline has replaced the provisional
file, the forward migration sorts after it, and migration history has been
reviewed.

This one-time step cannot be completed from CI or an unauthenticated agent
environment.

## Deploy pending migrations

From an authenticated operator workstation:

```powershell
supabase migration list --workdir apps/api
supabase db push --dry-run --workdir apps/api
```

Review the pending SQL and confirm:

- The baseline is already applied remotely.
- Only intended forward migrations are pending.
- No command includes `--include-seed`.

Apply and verify:

```powershell
supabase db push --workdir apps/api
supabase migration list --workdir apps/api
```

Then check production application health. `db push` applies only unapplied
migrations tracked in `supabase_migrations.schema_migrations`.

Never use `supabase db reset --linked` against production. Do not make
production schema changes through the SQL or Table editor after baseline
adoption; create and review a migration instead. Production backups, credential
management, and recovery remain Supabase/operator responsibilities.
