# Angular Stack Defaults

Apply this file for Angular work in this repository or in similar Angular frontend projects.

## Framework Defaults

- Prefer Angular patterns that are already established in the codebase before introducing new framework features.
- Prefer standalone component patterns when the repository already uses them.
- Prefer dependency injection with `inject(...)` when that is the repository standard.
- Prefer strongly typed interfaces and DTOs for API-facing data.
- Keep HTTP access in services instead of embedding it directly in components or views.

## UI and State

- Keep components focused on presentation and interaction flow.
- Avoid unnecessary local state and duplicated derived state.
- Prefer existing shared components, fragments, and utility handlers before creating new abstractions.
- Keep templates readable and avoid pushing too much logic into markup.

## Frontend Safety

- Consider rendering cost, repeated subscriptions, and unnecessary change-triggering behavior.
- Preserve validation, loading, empty, and error states.
- Update user-facing text through the established translation flow instead of hardcoding strings when the app already uses i18n.
- Use the established environment/configuration pattern for runtime values.
