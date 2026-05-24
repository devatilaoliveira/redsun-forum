# Spring Boot Stack Rules

Use this layer for Spring MVC, validation, security, configuration, and application wiring.

## Controllers

- Use `@RestController`, `@RequestMapping`, and method-level mappings consistently.
- Use `ResponseEntity` when status codes differ from the default `200 OK`.
- Use `@AuthenticationPrincipal AuthenticatedUser principal` for authenticated user context.
- Use `@Valid` for request DTOs and `@Validated` where parameter validation is needed.

## Services

- Use `@Service` for business services.
- Use `@Transactional` for write flows.
- Use `@Transactional(readOnly = true)` for read flows that load lazy relationships.
- Throw `ResponseStatusException` for domain-level HTTP failures, matching the existing codebase.

## Java Style

- Prefer records for immutable request and response DTOs.
- Keep controllers thin and move business rules into services.
- Use constructor injection for Spring dependencies.
- Use Jakarta validation annotations for inbound payload validation.
- Use `ResponseStatusException` consistently with existing service code when returning API errors.

## Architecture

- Preserve the controller -> service -> repository shape.
- Reuse existing access policy and service methods instead of duplicating authorization checks.
- Add abstractions only when they remove real duplication or match an existing local pattern.
- Avoid hidden side effects in read methods; mark read-only service methods with `@Transactional(readOnly = true)` when appropriate.
- Keep authorization in the backend service layer for API-owned flows; do not rely on frontend checks or database policies as the only guard.
- Do not expose secrets, service-role keys, cleanup tokens, JWTs, passwords, or privileged headers in committed code or client-facing artifacts.

## Configuration

- Add new application properties under `app`, `supabase`, or another existing namespace when appropriate.
- Prefer environment-variable backed values with safe defaults only when a safe default is meaningful.
