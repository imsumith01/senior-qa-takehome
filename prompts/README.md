# Prompt archive

Every step of this exercise was driven by a prompt from the project owner, saved here
verbatim — typos, numbering gaps, and all — before any work on the step began. The
same verbatim prompt is also embedded in the body of every commit belonging to that
step (large steps repeat it across their slice commits), so the history is
self-contained even without this folder.

To read the prompts straight from the history:

```
git log --reverse --grep="Prompt used (verbatim"
```

## Index

| File | Step produced |
| --- | --- |
| [01-project-rules.md](01-project-rules.md) | CLAUDE.md with the standing rules (readability constraints, git workflow, running log, MCP policy, tone), plus the AI evaluation log — which gained its first entry during this very step |
| [02-repo-skeleton.md](02-repo-skeleton.md) | .gitignore, the directory skeleton with .gitkeep placeholders, and a placeholder README |
| [03-toolchain.md](03-toolchain.md) | npm project, Playwright/TypeScript/ESLint/Prettier at observed versions, playwright.config.ts with web+api projects, npm scripts — and the one-runner-for-both-targets reasoning in the commit body |
| [04-saucedemo-discovery.md](04-saucedemo-discovery.md) | docs/discovery/saucedemo-discovery.md: live MCP exploration of all six users, the full happy path, sorts, totals, menu, guard pages — every selector observed, none recalled |
| [05-jsonplaceholder-discovery.md](05-jsonplaceholder-discovery.md) | docs/discovery/jsonplaceholder-contract.md from ~35 live probes, including the write matrix with persistence disproven and the "Consequences for test design" section |
| [06-test-plan.md](06-test-plan.md) | docs/TEST_PLAN.md: risk-ordered scope, 44-test inventory with stable IDs, data and isolation strategy, traceability matrix — corrected on 13 points by a pre-commit cross-check |
| [07-web-framework.md](07-web-framework.md) | src/data constants, eight page objects, fixtures, page-object conventions README — after live-verifying the one selector the discovery doc had asserted without observation |
| [08-auth-inventory-tests.md](08-auth-inventory-tests.md) | tests/web/authentication.spec.ts and inventory.spec.ts — 22 tests, all green, which also settled the trusted-clicks question the MCP session had left open |
| [09-cart-checkout-tests.md](09-cart-checkout-tests.md) | Cart/checkout/journey suites, the empty-cart observation (a completable $0 order), and the defect-detection suite plus docs/KNOWN_DEFECTS.md — where review flipped test.fixme to test.fail |
| [10-api-layer.md](10-api-layer.md) | Six API clients, zod schemas with types derived from them, the parseWithSchema validator, API fixtures — with the runtime-validation rationale in the commit body |
| [11-api-tests.md](11-api-tests.md) | The 28-test API contract suite: collections, misses, relations, filters, write echoes with non-persistence proven, degenerate input, headers |
| [12-framework-validation.md](12-framework-validation.md) | docs/FRAMEWORK_VALIDATION.md: five sabotage runs with verbatim failures, the flake hunt that found and fixed a real fixture-design flake, isolation/timing/trace/cold-start evidence, and the real README |
| [13-ci.md](13-ci.md) | .github/workflows/tests.yml (push/PR/dispatch/nightly, caching, artifacts, step summaries), the CI reporters, the badge — green on the first run |
| [14-final-docs.md](14-final-docs.md) | This documentation set: the final README, this index, docs/AI_EVALUATION.md, and the expanded docs/KNOWN_DEFECTS.md |
