---
name: audit-angular-accessibility
description: Audit, review, and improve accessibility in Angular frontend code. Use when Codex must inspect Angular templates, standalone components, shared UI fragments, forms, routing flows, dialogs, dynamic content, keyboard behavior, ARIA usage, focus management, translated UI text, or Playwright/browser checks for accessibility. Do not use for generic visual design review, non-Angular accessibility work, or unrelated test changes.
---

# Audit Angular Accessibility

## Operating Principles

Treat accessibility as a user-flow quality requirement, not as a checklist-only pass.

Prefer official guidance first:

- Angular accessibility guidance for Angular-specific patterns and CDK/ARIA utilities.
- WAI/WCAG guidance for user impact and acceptance criteria.
- Playwright accessibility and browser checks only when the task requires browser validation.

In this repository, inspect shared fragments before judging a feature template. Components such as inputs, buttons, checkboxes, validation messages, and translated text may be wrapped by reusable UI layers.

## Workflow

1. Define the user flow or component scope.
   - Identify the route, view, component, shared fragments, and form controls in scope.
   - Note whether the task is review-only or whether code changes are explicitly requested.
2. Inspect semantic structure first.
   - Prefer native HTML controls when possible.
   - Check headings, landmarks, buttons, links, lists, form controls, labels, and error regions.
   - Avoid adding ARIA to fix markup that should be native HTML.
3. Check keyboard access.
   - Confirm every interactive element is reachable and usable by keyboard.
   - Check logical tab order, visible focus, Enter/Space behavior, Escape behavior for dismissible overlays, and no keyboard traps.
4. Check form accessibility.
   - Confirm each input has an accessible name.
   - Confirm validation state is exposed clearly through text and programmatic relationships.
   - Prefer stable associations such as `for`/`id`, `aria-describedby`, and visible error text.
   - For translated errors, verify the error exists and is associated; do not rely on exact English copy unless the test scope requires it.
5. Check dynamic Angular behavior.
   - Inspect `@if`, `*ngIf`, async rendering, route changes, loading states, empty states, validation updates, and server error blocks.
   - Use `aria-live` only for meaningful asynchronous status updates that users of assistive tech need to hear.
   - Manage focus after route changes, modal/dialog open/close, form submission errors, and destructive actions.
6. Check ARIA use carefully.
   - Use ARIA only when native semantics are insufficient.
   - Confirm role, state, and property combinations are valid.
   - Do not add roles that conflict with native element semantics.
7. Check visual accessibility.
   - Review contrast, focus visibility, text truncation, responsive layout, zoom behavior, reduced motion, and disabled states.
   - Treat automated contrast results as a signal, not a complete audit.
8. Verify with the smallest useful method.
   - For code review, cite file paths and specific elements.
   - For browser behavior, run the smallest relevant Playwright/manual check if requested and available.
   - If no automated accessibility tooling exists in the repo, do not introduce new dependencies unless explicitly approved.

## Angular-Specific Review Targets

Prioritize:

- `src/app/features/**/*.html` and matching `.ts` files;
- `src/app/shared/**` UI fragments/components;
- form controls and validators;
- route transitions and guarded flows;
- translated user-facing text through `@ngx-translate/core`;
- `data-testid` only as a test contract, not as an accessibility substitute.

Watch for:

- clickable `<div>` or `<span>` without keyboard support;
- icon-only buttons without accessible names;
- inputs without labels;
- validation messages not associated with fields;
- focus lost after conditional rendering;
- low-contrast disabled/error/help text;
- custom checkboxes, dropdowns, tabs, dialogs, or menus missing expected keyboard behavior.

## Output Format

When reviewing, report findings first:

- Severity: `critical`, `high`, `medium`, `low`, or `info`.
- Location: file and element/component.
- User impact: who is affected and how.
- Evidence: what in the code or behavior supports the finding.
- Recommended fix: small, repository-consistent action.

When editing, also report:

- files changed;
- accessibility behavior improved;
- verification performed;
- remaining manual checks, especially screen reader, contrast, and browser-specific assumptions.

## Quality Bar

Do not claim full WCAG compliance from code inspection alone. State whether the result is a targeted audit, automated check, manual keyboard check, or implementation fix.
