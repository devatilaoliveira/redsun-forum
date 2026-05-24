---
name: tests-writer
description: Write, update, review, and debug Playwright end-to-end tests in Angular frontend repositories. Use when Codex must work on browser-level E2E coverage, Playwright specs, page objects, fixtures, test helpers, test IDs, browser-native validation, navigation flows, authentication flows, storage/cookie behavior, or Playwright configuration. Do not use for Karma/Jasmine/Vitest unit tests, generic Angular testing, or code changes that do not require real browser automation.
---

# Maintain E2E Tests

## Operating Principles

Treat this skill as a Playwright-only E2E workflow for Angular applications.

Prefer the local repository's existing E2E structure over generic examples. In this repository, inspect `playwright.config.ts`, `e2e/**/*.spec.ts`, `e2e/**/*.page.ts`, `e2e/shared/**`, and the Angular feature files that drive the tested behavior before editing.

Base decisions on official guidance when possible:

- OpenAI Skills guidance: make a skill a reusable workflow with clear name, description, instructions, resources, and final checks when using the packaged Skill format.
- Angular E2E guidance: E2E tests validate the full application from the user's perspective and are decoupled from implementation details.
- Playwright best practices: test user-visible behavior, keep tests isolated, prefer locators, use web-first assertions, avoid arbitrary waits, and use page objects when they reduce duplication and improve maintenance.

## Workflow

1. Confirm that the request truly needs Playwright E2E coverage.
   - Use this skill for browser behavior, full user flows, navigation, validation, storage, authentication, and cross-browser concerns.
   - Do not use this skill for isolated Angular unit tests, service tests, or component-only behavior unless the user explicitly asks for browser E2E.
2. Inspect the existing E2E pattern before changing anything.
   - Read the closest spec file, page object, fixture, helper, and `playwright.config.ts`.
   - Read the Angular component, template, service, fragment, or route that produces the behavior under test.
3. Reuse established local structure.
   - Put specs near similar specs under `e2e/<feature>/`.
   - Extend existing page objects instead of duplicating locators directly in specs.
   - Reuse fixtures and API helpers for setup and cleanup when they already exist.
4. Prefer stable, user-aligned locators.
   - Use `getByRole`, `getByLabel`, `getByText`, and other accessibility/user-facing locators when stable.
   - Use `getByTestId` for explicit test contracts already exposed by shared components or feature templates.
   - Avoid brittle CSS selectors, DOM-depth selectors, and implementation-only details.
5. Write deterministic assertions.
   - Prefer Playwright web-first assertions such as `await expect(locator).toBeVisible()` or `toHaveURL()`.
   - Avoid `waitForTimeout`.
   - Assert visible outcomes and meaningful side effects: URL changes, enabled/disabled state, validation state, rendered errors, storage/cookie changes, API-created data, or navigation.
6. Keep each test isolated.
   - Do not depend on test order.
   - Create data through fixtures/API helpers when available.
   - Clean up created data when the repository provides cleanup helpers.
7. Handle browser-native validation carefully.
   - Do not assert exact `validationMessage` text across browsers or locales unless the test is intentionally browser-specific.
   - Prefer `checkValidity()`, `validity.valueMissing`, `validity.typeMismatch`, element focus behavior, invalid state, or visible app-level error elements.
   - Gate browser-specific expectations with `test.skip` or equivalent when needed.
8. Run the smallest useful verification.
   - Prefer a targeted Playwright command for the changed spec first.
   - If the failure is environmental, report the exact command and blocker.
   - If the failure exposes a real product or test issue in scope, fix it before finalizing.

## Page Objects And Helpers

Use page objects to keep specs readable and selectors centralized, especially when a flow has repeated fields, buttons, or navigation steps.

Prefer small, task-named methods:

- `goto()`
- `fillEmail(email)`
- `fillPassword(password)`
- `submit()`
- `expectSubmitDisabled()`
- `expectValidationErrorVisible(testId)`

Avoid page objects that hide the actual assertion intent. A spec should still read like a user scenario.

## Angular-Specific Notes

When a Playwright failure appears related to Angular behavior, inspect the template and component state before adding waits. Common causes include disabled buttons, reactive form validity, async route guards, translated text, deferred rendering, and shared UI fragments that wrap native inputs.

For this repository, prefer the configured test ID contract from `playwright.config.ts` and shared fragments that expose `data-testid`.

## Final Response

Report:

- files changed;
- behavior covered;
- exact Playwright command run;
- result of the command;
- remaining assumptions, especially browser-specific, locale-specific, backend-dependent, or environment-dependent assumptions.
