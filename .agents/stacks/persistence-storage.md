# Persistence And Storage Rules

Use this layer for JPA entities, repositories, SQL files, Supabase Storage, and schema changes.

## JPA

- Keep entity column names aligned with `apps/api/db/schema.sql`.
- Do not rely on Hibernate DDL generation; this project validates schema with `ddl-auto: validate`.
- Preserve UUID identifiers and existing table relationships.
- Be careful with lazy relationships in DTO mapping.

## SQL

- Update `apps/api/db/schema.sql` when persistence shape changes.
- Keep wipe/reset scripts consistent with schema and storage changes.

## Storage
