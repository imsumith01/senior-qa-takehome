# Senior QA Take-Home: Playwright Test Framework

[![tests](https://github.com/imsumith01/senior-qa-takehome/actions/workflows/tests.yml/badge.svg)](https://github.com/imsumith01/senior-qa-takehome/actions/workflows/tests.yml)

Automated testing framework covering two targets:

- Web: https://www.saucedemo.com/
- API: https://jsonplaceholder.typicode.com/

This repository was created from scratch for this exercise.

## Prerequisites

- Node.js 20 or newer
- No credentials or environment variables — both targets are public demos, and the
  demo logins are printed on the login page itself

## Setup

```
npm ci
npx playwright install chromium
```

(Only Chromium is needed; the web project runs Desktop Chrome deliberately — see
docs/TEST_PLAN.md §6.)

## Running the tests

```
npm test               # everything: web + api
npm run test:web       # web suite only
npm run test:api       # api suite only
npx playwright test --grep @smoke    # the fast confidence subset
npm run report         # open the HTML report from the last run
```

Also available: `npm run test:headed`, `npm run test:debug`, `npm run lint`,
`npm run format`, `npm run typecheck`.

Two tests in `tests/web/known-defects.spec.ts` are declared `test.fail()` — they run
the purchase flow as deliberately broken demo users and are _expected_ to fail; the
run stays green. See docs/KNOWN_DEFECTS.md for why.

## Repository layout

- `src/web/pages/` — page objects (conventions in its README)
- `src/web/fixtures/` — Playwright fixtures exposing the page objects
- `src/api/clients/` — one thin client per API resource
- `src/api/schemas/` — zod schemas: the runtime API contract, one per resource
- `src/data/` — every constant the tests use: credentials, catalogue, messages,
  routes, tax rate, API counts
- `tests/web/`, `tests/api/` — the suites; plan IDs (WEB-0xx / API-0xx) sit in a
  comment above each test
- `docs/` — the reading path: discovery notes (everything was observed live before
  being encoded), TEST_PLAN.md (risk-ordered plan + traceability),
  KNOWN_DEFECTS.md, FRAMEWORK_VALIDATION.md, and AI_EVALUATION_LOG.md (a dated log
  of every mistake made while building this, recorded as it happened)
- `prompts/` — the verbatim prompt for every build step, numbered

## How this was built

Every selector, message, price, and behaviour encoded in the tests was first
observed live and recorded in `docs/discovery/` before any test asserted it. The
test plan derives from those observations; the tests reference the plan by ID.
