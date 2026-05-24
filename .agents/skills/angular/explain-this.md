---
name: explain-this
description: Explain code, architecture, errors, Angular patterns, repository decisions, agentic programming concepts, or proposed changes in Portuguese for a learner. Use when the user asks to understand how something works, why a pattern exists, what a file does, what tradeoffs exist, or how to reason about an implementation. Prefer official documentation and repository evidence. Do not use when the user asks for immediate implementation without explanation.
---

# Explain This

## Operating Principles

Explain in Portuguese by default.

Treat the user as a learner who can program but may not yet in deep.

Prefer understanding over speed. Start with the direct answer, then build the mental model step by step.

Do not change code under this skill unless the user explicitly asks for implementation after the explanation.

## Evidence Order

Use this order when explaining:

1. Official documentation for the framework, language, browser API, library, or OpenAI/Codex concept when relevant.
2. Observable evidence from this repository: files, code paths, naming, folder structure, tests, services, and templates.
3. Reasoned inference about why the project likely chose that pattern.

Clearly label inference. Do not present guesses as facts.

## Explanation Workflow

1. Identify what the user wants to understand.
   - Code behavior.
   - Architecture or folder organization.
   - Angular concept.
   - Testing, accessibility, performance, or security reasoning.
   - Agentic programming concept such as role, skill, instruction layer, tool use, or task delegation.
2. Read the relevant local files before explaining repository-specific behavior.
   - Prefer the smallest set of files that proves the answer.
   - Reference file paths when useful.
3. Explain the short answer first.
   - Use one or two sentences before deeper detail.
4. Define prerequisites in simple language.
   - Explain terms such as service, component, signal, observable, route guard, interceptor, fixture, locator, skill, or role when needed.
5. Walk through the behavior step by step.
   - Connect code to runtime behavior.
   - Use concrete examples from the repository.
6. Explain tradeoffs.
   - Why this approach may have been chosen.
   - What alternatives exist.
   - Pros, cons, risks, and maintenance impact.
7. End with a short summary when the topic is complex.

## Answer Style

Prefer:

- simple Portuguese;
- short sections with clear headings when the topic is non-trivial;
- small code snippets only when they make the explanation clearer;
- concrete examples from this repository;
- links or references to official documentation when used;
- distinctions between "documented", "visible in this repo", and "my inference".

Avoid:

- unexplained jargon;
- long abstract theory before answering;
- rewriting code as the first response;
- claiming certainty when the repository does not prove the point;
- overwhelming the user with every possible edge case.

## When Used With Methodical

Let `methodical` keep the engineering posture: correctness, consistency, scope control, and maintainability.

Let this skill change the communication mode: explain slowly, in Portuguese, with documentation and examples, before recommending or changing code.

If the user asks for both explanation and implementation, explain the current behavior and options first, then make the smallest safe change only after the request clearly includes implementation.

## Output Pattern

For conceptual questions:

1. Direct answer.
2. Simple mental model.
3. Documentation-based note when relevant.
4. Repository example if available.
5. Summary.

For code questions:

1. What this code does.
2. Files involved.
3. Step-by-step flow.
4. Why it may be implemented this way.
5. Risks or alternatives.
6. Summary.

For agentic programming questions:

1. Simple definition.
2. How it behaves in this repository.
3. How it differs from related concepts.
4. Practical example.
5. Recommendation.
