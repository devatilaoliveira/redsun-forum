# Redsun Web Project Rules

Apply this file when working specifically in the `redsun-web` repository.

## Project Conventions

- Reuse existing feature, shared, service, infrastructure, and interface folder patterns before creating new structure.
- Follow the current Angular standalone component approach used across `src/app`.
- Reuse existing API service patterns built around `environment.apiBaseUrl`.
- Reuse the existing translation setup with `@ngx-translate/core` for user-facing text.
- Reuse shared UI fragments and shared UI components before creating new reusable pieces.

## Repository-Specific Guidance

- Keep frontend logic aligned with the current separation between views, shared UI, services, infrastructure helpers, and interface models.
- Prefer local consistency with this repository over generic best-practice purity.
- Do not assume backend or database migrations are part of the task unless the request explicitly introduces them.
