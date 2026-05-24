---
name: audit-angular-performance
description: Audit Angular frontend performance issues and recommend measurable improvements. Use when Codex must inspect Angular components, templates, services, RxJS flows, signals, routes, assets, images, repeated backend calls, caching opportunities, rendering cost, bundle/loading behavior, or Core Web Vitals. Do not use for unrelated refactors, backend performance tuning, infrastructure scaling, or speculative optimization without code evidence.
---

# Audit Angular Performance

## Operating Principles

Treat performance as a measured user experience problem, not a style preference.

Prefer official guidance first:

- Angular performance guidance for route lazy loading, `@defer`, change detection, SSR, and runtime rendering cost.
- Angular `NgOptimizedImage` guidance for image loading, LCP prioritization, lazy loading, dimensions, `srcset`, and layout shift prevention.
- Web.dev Core Web Vitals guidance for loading, interactivity, and visual stability.

Separate:

- observed evidence from the repository;
- likely bottlenecks inferred from code;
- measurements that still need browser, Lighthouse, Angular DevTools, network, or production telemetry validation.

Do not introduce new dependencies, caching layers, SSR, service workers, state libraries, or architectural rewrites unless the user explicitly asks for implementation and the repository context supports it.

## Workflow

1. Define scope and performance goal.
   - Identify the route, component, user flow, asset, API call, or loading behavior under review.
   - Clarify whether the user wants review-only or code changes.
   - Map the issue to user impact: initial load, repeated navigation, interaction delay, network waste, layout shift, or memory/runtime cost.
2. Inspect the current implementation.
   - Read the target Angular component, template, services, route config, shared fragments, and relevant assets.
   - Search for similar patterns already used in the repo before recommending a new pattern.
   - Check whether the app already uses signals, RxJS sharing, lazy routes, `@defer`, `NgOptimizedImage`, interceptors, or service-level caching.
3. Review network and backend call behavior.
   - Look for duplicate HTTP calls from repeated subscriptions, repeated lifecycle execution, repeated signal/effect execution, or template-triggered methods.
   - Keep HTTP access in services; avoid moving network logic into components.
   - Prefer repository-consistent service-level caching or request sharing when the same data is reused.
   - Do not cache user-sensitive, auth-dependent, or fast-changing data without clear invalidation rules.
4. Review rendering cost.
   - Flag expensive template expressions, method calls from templates, large repeated lists, missing `track`/`trackBy`, unnecessary derived state, and avoidable recomputation.
   - Check subscriptions, signals, computed values, effects, and component state for duplicated work.
   - Prefer simple derived state over manually synchronized duplicate state.
5. Review images and visual assets.
   - Identify above-the-fold/LCP images, large images, missing dimensions, missing lazy loading, layout shift risks, and CSS background images used for important content.
   - Consider `NgOptimizedImage` where it fits the current Angular version and codebase pattern.
   - Mark the likely LCP image as priority only when it is truly above the fold and important to initial render.
   - Avoid deferring visible initial content in a way that worsens CLS or perceived loading.
6. Review loading strategy and bundle impact.
   - Check route lazy loading for feature routes not needed on initial load.
   - Consider `@defer` for heavy below-the-fold components, non-critical widgets, or heavy third-party UI.
   - Avoid nested or simultaneous defers that cause cascading requests.
   - Treat bundle-size claims as needing build output or analyzer evidence unless the code clearly imports a large dependency in a hot path.
7. Review UI states and perceived performance.
   - Preserve loading, empty, and error states.
   - Prefer predictable skeletons/spinners only when they reduce confusion and do not cause layout shift.
   - Check whether slow actions disable repeated submit/click behavior without blocking unrelated UI.
8. Recommend small, measurable improvements.
   - Prioritize changes by expected user impact and implementation risk.
   - Prefer fixes that can be verified with a targeted command, browser network panel, Lighthouse, Angular DevTools, Playwright trace, or simple request count.
   - Avoid optimization that makes code harder to maintain without a plausible performance benefit.
   - Output a report with findings and recommendations, save in folder /reports .md extension. Naming should be performance_audit_YYYYMMDD_HH-MM-SS.md.

## Angular-Specific Review Targets

Prioritize:

- `src/app/features/**/*.ts` and `.html` files;
- services that call `HttpClient`;
- route configuration and lazy-loaded feature boundaries;
- shared UI fragments that render lists, images, forms, or repeated components;
- assets under `public/` and Angular asset references;
- `package.json`, `angular.json`, and build config only when loading/bundle behavior is in scope.

Watch for:

- repeated API calls caused by multiple subscriptions to a cold observable;
- data fetched both in parent and child components;
- data fetched again on every route revisit when reuse/cache would be valid;
- component methods called from templates for expensive computation;
- missing `track`/`trackBy` in repeated lists;
- unnecessary local state duplicating derivable values;
- large images without dimensions or lazy loading;
- above-the-fold images not prioritized;
- below-the-fold components loaded eagerly;
- heavy third-party imports in initial routes;
- layout shift from late-loading content;
- manual timers or polling without cleanup.

## Output Format

When reviewing, report findings first:

- Severity: `high`, `medium`, `low`, or `info`.
- Location: file and component/service/template area.
- Performance area: network, rendering, image, loading, bundle, state, or perceived performance.
- Evidence: code behavior or measurement that supports the finding.
- User impact: what may become slower or wasteful.
- Recommendation: smallest repository-consistent improvement.
- Verification: how to measure whether the change helped.

When editing, also report:

- files changed;
- behavior optimized;
- exact command or manual check run;
- result of the verification;
- remaining measurement gaps or assumptions.

## Quality Bar

Do not claim a performance improvement is proven unless it was measured. If only code inspection was performed, state the finding as a likely risk and explain how to validate it.
