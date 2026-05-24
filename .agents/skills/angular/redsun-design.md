---
name: redsun-design
description: Convert normal HTML/CSS/SCSS UI suggestions, mockups, snippets, or component ideas into Redsun Web Angular patterns. Use when adapting component, fragment, view, layout, styling, accessibility, dark/light theme, or design-system suggestions for this repository by reusing existing `rs-*` components, `src/styles/_colors.scss`, `src/styles/_typography.scss`, `src/styles/_layout.scss`, and established Angular standalone conventions.
---

# Redsun Design

## Operating Principles

Treat generic HTML/SCSS suggestions as design intent, not as code to copy directly.

Prefer the repository's existing UI language first:

- shared fragments and UI components under `src/app/shared/fragments/` and `src/app/shared/ui/`;
- semantic CSS variables from `src/styles/_colors.scss`;
- typography variables from `src/styles/_typography.scss`;
- spacing and radius variables from `src/styles/_layout.scss`;
- Angular standalone component patterns already present in nearby files;
- translation with `@ngx-translate/core` for user-facing text.

Separate:

- what the suggestion visually asks for;
- what the repository already provides;
- what must be newly implemented;
- what is a design tradeoff or accessibility correction.

Do not introduce a parallel design system, one-off color palette, hardcoded light/dark styling, or generic CSS framework classes when local patterns can express the same UI.

## Workflow

1. Understand the UI request.
   - Identify whether the user wants explanation, review, conversion guidance, or code changes.
   - If code changes are requested, inspect the target `.ts`, `.html`, and `.scss` files before editing.
   - Identify whether the result belongs in `features`, `shared/ui`, or `shared/fragments`.
2. Inspect existing patterns.
   - Search for existing `rs-*` components before creating raw markup.
   - Compare with nearby cards, forms, modals, tables, grids, headers, and navigation components.
   - Prefer local consistency over a generic "best practice" implementation.
3. Map generic HTML to Redsun components.
   - Search `src/app/shared/fragments/` for existing reusable primitives before writing raw controls.
   - Search `src/app/shared/ui/` for larger reusable UI pieces such as cards, shells, grids, tables, modals, and navigation.
   - Treat specific `rs-*` names as examples from the current repository, not as a complete catalog.
   - If no existing fragment fits, create or recommend a new fragment only when it is likely to be reused and belongs in the shared design language.
4. Convert styles to tokens.
   - Replace hardcoded colors with semantic variables such as `--color-background`, `--color-text`, `--color-muted`, `--color-surface`, `--color-surface-muted`, `--color-border`, `--color-hover`, `--color-primary`, `--color-secondary`, `--color-success`, `--color-warning`, and `--color-danger`.
   - Replace arbitrary font values with `--font-family-body`, `--font-family-heading`, `--text-*`, `--font-weight-*`, and `--line-height-*`.
   - Replace arbitrary spacing and radius with `--space-*` and `--radius-*`.
   - Use fixed pixel values only for real icon, asset, or control dimensions that match nearby components.
5. Preserve theme compatibility.
   - Remember that the default `:root` is dark and `:root[data-theme='light']` overrides semantic tokens.
   - Avoid direct values like `#fff`, `#111`, `#333`, and light-only shadows unless there is a documented reason.
   - If a new semantic color is necessary, explain how it should behave in both light and dark mode before adding it.
6. Apply accessibility as part of the conversion.
   - Use semantic HTML: `button`, `a`, `form`, `label`, `nav`, `header`, `main`, `section`, `table`, `ul`, and `li`.
   - Do not replace buttons or links with clickable `div` or `span`.
   - Give icon-only controls a translated `aria-label`.
   - Keep keyboard operation and visible focus states.
   - Connect form errors with existing component APIs or `aria-describedby` / `aria-errormessage`.
   - Use `aria-live`, `aria-busy`, `aria-invalid`, `aria-expanded`, and `role="dialog"` only when the behavior actually requires them.
   - Check color contrast against both light and dark theme variables.
7. Keep Angular code repository-consistent.
   - Keep `.ts`, `.html`, and `.scss` separated like nearby components.
   - Prefer `input(...)`, `output(...)`, `computed(...)`, `signal(...)`, and `inject(...)` where local files use them.
   - Keep HTTP and persistence out of visual components.
   - Use `@if`, `@for`, bindings, and outputs consistently with surrounding templates.
   - Do not hardcode user-facing text; use translation keys and `TranslatePipe` or `TranslateService` according to local usage.
   - Prefer simple local class names in component styles, such as `.title`, `.chips`, or `.header`. Avoid BEM-style names like `.card__title` unless matching an existing file, because Angular component style scoping already prevents ordinary class conflicts.

## Generic To Redsun Mapping

Use these mappings as examples, then search `src/app/shared/fragments/` and verify against the actual component APIs:

- `<button class="primary">Save</button>` -> `<rs-button [variant]="EVariant.PRIMARY">{{ 'SAVE' | translate }}</rs-button>`
- `<button class="icon">...</button>` -> `<rs-round-icon-button [ariaLabel]="'KEY' | translate" ... />`
- `<input>` with label/error -> `<rs-input [label]="'KEY' | translate" [errorMessage]="'KEY' | translate" ... />`
- `<textarea>` -> `<rs-textarea ... />`
- `<select>` -> `<rs-select ... />`
- checkbox or binary choice -> `<rs-checkbox ... />`
- card shell -> `rs-box` for static content or `rs-box-clickable` for clickable cards.
- modal or popup -> `rs-dialog-modal`.
- badge or status pill -> `rs-badge`.
- loading indicator -> `rs-spinner`.
- user image or initials -> `rs-avatar`.
- page title/subtitle -> `rs-view-header` when used by nearby views.

## SCSS Conversion Example

Prefer:

```scss
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-1);
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

Avoid:

```scss
.panel {
  color: #ffffff;
  background: #171717;
  border-color: #333333;
  border-radius: 12px;
}
```

## Output Format

When reviewing or converting without editing code, explain:

- which generic elements map to existing Redsun components;
- which colors, typography, spacing, and radius tokens should replace hardcoded styles;
- what accessibility changes are required;
- which translation keys may need to be added;
- any tradeoff where a new shared component or new semantic token might be justified.

When editing code, also report:

- files changed;
- existing components reused;
- user-facing translation keys added or needed;
- accessibility behavior preserved or improved;
- commands or manual checks run;
- remaining theme or accessibility assumptions.

## Quality Bar

Do not copy a visual suggestion verbatim if it conflicts with existing Redsun components, theme tokens, or accessibility requirements.

If a design requires a new component, justify why existing fragments are not enough and keep the new component aligned with the surrounding folder structure and naming style.
