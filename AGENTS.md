# Repository Agent Rules

This repository uses layered instruction files stored under the root `.agents/` directory.

## Baseline

- Treat this `AGENTS.md` file as always-on baseline guidance.
- Treat files under `.agents/` as optional layers unless the user or the session launcher explicitly activates them.
- Do not use app-local `AGENTS.md` files; the root file is the single repository entrypoint.
- When optional layers are activated, prefer instructions in this order:
  1. Explicit task and user instructions
  2. Skill-specific files
  3. Core files
  4. Project-specific files
  5. Stack-specific files

## Known Verification Constraint

- Do not run full frontend build commands from the agent environment, such as `npm run build` or `ng build`; this environment is known to fail those commands with `spawn EPERM` because child process spawning is blocked by authorization.
- For frontend changes, prefer the smallest relevant alternative checks that do not hit the blocked build path. If no safe check is available, report that build verification is skipped because of the known `spawn EPERM` agent-environment limitation.

## App Selection

Use `scripts/rsAgents.ps1` from the repository root to start a layered Codex session.

- `-App web` activates the shared core, `redsun-web`, and `angular` layers.
- `-App api` activates the shared core, `redsun-api`, `domain-map`, `spring-boot`, and `persistence-storage` layers.
- `-App all` activates the shared core, both project layers, and both stack layers.
- `-App repo` activates only the shared core layer for repository-level tasks.

The launcher accepts `-Core`, `-Project`, `-Stack`, and `-Skill` overrides for explicit sessions.

## Layer Index

- Shared engineering baseline: `.agents/core/methodical.md`
- Teaching mode: `.agents/core/teacher.md`
- Playwright E2E testing mode: `.agents/core/playwright-tester.md`
- RedSun web project map: `.agents/projects/redsun-web.md`
- RedSun API project map: `.agents/projects/redsun-api.md`
- Domain boundaries: `.agents/projects/domain-map.md`
- Angular stack rules: `.agents/stacks/angular.md`
- Spring Boot stack rules: `.agents/stacks/spring-boot.md`
- Persistence and storage rules: `.agents/stacks/persistence-storage.md`
- Angular skills: `.agents/skills/angular/*.md`
