# Domain Map

Use this layer when tracing request flows or deciding where code belongs.

## Request Flow

- Controllers live under each domain package and translate HTTP requests to service calls.
- Services enforce business rules, authorization, validation that depends on persisted state, and side effects.
- Repository interfaces define domain persistence contracts.
- `persistence` adapters wrap Spring Data JPA repositories where a domain abstraction exists.
- DTOs live under each domain's `dto` package.

## Cross-Domain Rules

- Tale access is central. Reuse `TaleAccessPolicy`, `TaleService`, or existing domain services before adding new authorization logic.
- Character sheets are tied to tale participants and rule systems.
- Storage services should stay separate from domain services except for upload/delete orchestration.
- Email providers should remain behind `EmailService`.

## Places To Check First

- Security and endpoint access: `apps/api/src/main/java/com/rpg/redsunapi/configuration/SecurityConfig.java`
- JWT auth flow: `apps/api/src/main/java/com/rpg/redsunapi/jwt/`
- Tale visibility: ` apps/api/src/main/java/com/rpg/redsunapi/tale/TaleAccessPolicy.java`
- Supabase buckets and database shape: `apps/api/db/`
- Environment configuration: ` apps/api/src/main/resources/application.yml`
