---
name: review-angular-security
description: Review Angular frontend code for security risks and defensive implementation issues. Use when Codex must inspect Angular templates, standalone components, services, interceptors, route guards, environment configuration, authentication flows, token handling, user-controlled rendering, dependency risk, CSP/Trusted Types readiness, or frontend parts of OWASP-style web risks. Do not use for offensive exploitation, backend/database migrations, infrastructure hardening, or generic non-Angular code review.
---

# Review Angular Security

## Operating Principles

Treat this as a repository-grounded defensive security review. Anchor claims to code evidence and keep assumptions explicit.

Prefer official guidance first:

- Angular security guidance for sanitization, DOM APIs, `DomSanitizer`, Trusted Types, and Content Security Policy.
- OWASP Top 10 for web risk framing, especially broken access control, injection, security misconfiguration, vulnerable dependencies, authentication failures, and software/data integrity failures.
- OpenAI curated security skill patterns: define scope, identify assets and trust boundaries, distinguish evidence from assumptions, prioritize realistic risk, and recommend concrete mitigations.

Do not provide offensive exploit instructions, payload chains, credential theft guidance, or steps to bypass a live system. Keep examples defensive and minimal.

## Workflow

1. Define scope and security context.
   - Identify the feature, route, component, service, or flow under review.
   - Note known assumptions: auth model, backend enforcement, deployment environment, data sensitivity, and internet exposure.
   - If context is missing and materially changes severity, ask a targeted question or mark the assumption explicitly.
2. Map frontend trust boundaries.
   - User input into Angular forms or route params.
   - API responses into templates or client state.
   - Browser storage, cookies, tokens, and session state.
   - External links, embedded media, third-party scripts, and environment config.
3. Inspect Angular rendering and DOM safety.
   - Prefer Angular template binding over direct DOM manipulation.
   - Flag `[innerHTML]`, direct `ElementRef.nativeElement` writes, `document`/`window` mutation, dynamic script/style injection, and bypass APIs.
   - Treat `bypassSecurityTrustHtml`, `bypassSecurityTrustUrl`, `bypassSecurityTrustResourceUrl`, `bypassSecurityTrustScript`, and `bypassSecurityTrustStyle` as high-review areas requiring clear provenance and validation.
4. Inspect input, output, and navigation flows.
   - Check form validation, route params, query params, redirects, return URLs, and external URLs.
   - Do not treat frontend validation as a security boundary; backend authorization and validation must still exist.
   - Flag open redirect patterns, unsafe URL construction, and assumptions that hidden UI equals authorization.
5. Inspect authentication and authorization handling.
   - Review route guards, interceptors, token reads/writes, logout behavior, and auth-dependent UI.
   - Distinguish UX gating from real authorization.
   - Flag sensitive tokens in `localStorage` or broad browser storage when safer cookie/session patterns may be required by the threat model.
6. Inspect API usage and error handling.
   - Check service boundaries, `environment.apiBaseUrl`, request construction, credential handling, and error display.
   - Flag leaking sensitive backend errors, stack traces, tokens, emails, verification codes, or internal IDs into logs/UI.
7. Inspect configuration and dependencies.
   - Check whether secrets are accidentally stored in Angular environment files.
   - Review security-relevant dependencies if the task includes dependency risk.
   - Do not add security tooling or dependencies unless explicitly requested.
8. Prioritize and recommend fixes.
   - Rate severity using likelihood, impact, exploit preconditions, and existing controls.
   - Prefer small, concrete mitigations tied to file paths and Angular patterns already used in the repo.
   - Separate must-fix issues from defense-in-depth improvements.
   - Output a report with findings and recommendations, save in folder /reports .md extension. Naming should be security_audit_YYYYMMDD_HH-MM-SS.md.

## Angular-Specific Review Targets

Prioritize:

- `src/app/features/**/*.ts` and `.html` files;
- `src/app/services/**`, infrastructure helpers, and API clients;
- route guards, interceptors, and auth/session helpers;
- `src/environments/**`;
- shared UI fragments that render user-provided or API-provided content;
- `package.json` and lockfiles only when dependency risk is in scope.

Watch for:

- unsafe `innerHTML` or trusted-value bypass without documented sanitization;
- direct DOM writes using user-controlled data;
- dynamic URL/resource construction from route params or API values;
- client-only authorization decisions;
- tokens or sensitive data in browser storage;
- secrets in frontend config;
- verbose errors shown to users;
- missing cleanup on logout;
- user-controlled redirects;
- dependency or script usage that changes the trust model.

## Output Format

When reviewing, report findings first:

- Severity: `critical`, `high`, `medium`, `low`, or `info`.
- Location: file and symbol/template area.
- Risk: realistic attacker goal and affected asset.
- Evidence: code behavior that supports the finding.
- Assumptions: anything not proven from the repo.
- Recommendation: concrete, repository-consistent mitigation.

When editing, also report:

- files changed;
- risk reduced;
- verification performed;
- remaining backend, deployment, CSP, Trusted Types, or manual security review assumptions.

## Quality Bar

Do not claim that the frontend is secure in isolation. Angular can reduce DOM XSS risk through framework protections, but authentication, authorization, validation, rate limiting, logging, and sensitive data protection must be enforced by the backend and deployment environment too.
