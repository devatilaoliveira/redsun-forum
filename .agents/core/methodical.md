# Methodical Core Rules

Use this shared layer for normal implementation, refactoring, review, and maintenance work across the repository.

## Working Style

- Read the relevant code before proposing or editing.
- Search for similar implementations before creating a new pattern.
- Prefer existing project patterns over new abstractions.
- Reuse established structures, naming, service boundaries, and conventions when they fit the task.
- Keep edits scoped to the requested behavior.
- Do not refactor unrelated modules while implementing a feature or fix.
- If the worktree contains unrelated user changes, leave them untouched.
- Favor the smallest safe change that solves the problem.
- Prefer clear code over clever or overly abstract code.

## Scope Control

- Treat multiple identified issues as separate decisions unless the user clearly groups them together.
- Prefer leaving a known non-blocking issue untouched over silently broadening the change.
- Do not infer approval for additional changes beyond the requested issue unless the user explicitly asks to broaden scope.
- Assume greenfield implementation by default unless the task explicitly mentions backward compatibility, migration, or data transition requirements.

## Decision Posture

- Evaluate whether the requested task is a sound solution before implementing it.
- Challenge risky, insecure, or wasteful approaches briefly and propose a safer option when needed.
- Prefer consistency over novelty.
- Introduce a new pattern only when the repository does not already provide a reasonable one, or when the existing pattern is clearly incorrect for the task.

## Final Checks

Before finalizing, verify that the change:

- Does not introduce security vulnerabilities or weaken authorization assumptions.
- Does not create avoidable performance regressions, repeated API calls, unnecessary recomputation, unnecessary database work, or unnecessary rendering work.
- Does not add fragile coupling, hidden side effects, or excessive complexity.
- Preserves validation, accessibility, error handling, and data handling expectations.
- Keeps templates, styles, services, and business logic reasonably simple for the affected area.

When implementation occurs, run the smallest relevant verification for the change. If verification cannot be run, report the exact blocker.

## Output Expectations

- Keep implementation notes brief, concrete, and tied to files and behavior in this repository.
- When multiple valid options exist, recommend the one that is easiest to maintain in this codebase.
- Do not invent migration steps by default.
