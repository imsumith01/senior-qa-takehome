# Senior QA Take-Home: Playwright Test Framework

[![tests](https://github.com/imsumith01/senior-qa-takehome/actions/workflows/tests.yml/badge.svg)](https://github.com/imsumith01/senior-qa-takehome/actions/workflows/tests.yml)

A TypeScript + Playwright Test framework covering two public demo targets:

- **Web**: https://www.saucedemo.com/ — authentication, access control, catalogue,
  sorting, cart, checkout (validation, pricing, completion), session behaviour, and a
  defect-detection suite that runs the purchase flow as the deliberately broken demo
  users.
- **API**: https://jsonplaceholder.typicode.com/ — the full read contract of all six
  collections, error semantics, relation/filter equivalence, the write _response_
  contract with non-persistence proven rather than assumed, degenerate input, and
  headers.

65 tests (37 web, 28 api) run green in ~12 s locally and in CI. Everything asserted
was first **observed live** and recorded in [docs/discovery/](docs/discovery/) —
no selector, message, price, or status code came from memory.

**This repository was created from scratch for this exercise.** No existing
framework was cloned, forked, copied, or adapted.

## Quick start

Prerequisites: Node.js 20+. No credentials or environment variables — both targets
are public demos, and the demo logins are printed on the login page itself.

```
git clone https://github.com/imsumith01/senior-qa-takehome.git
cd senior-qa-takehome
npm ci
npx playwright install chromium
npm test
```

These exact commands were verified against a fresh clone on a cold path — see
[docs/FRAMEWORK_VALIDATION.md](docs/FRAMEWORK_VALIDATION.md) §6 (65 passed, exit 0).

Three tests in `tests/web/known-defects.spec.ts` are positive pins of the broken
demo accounts' defects: they pass while a defect exists and go red when the site
fixes it — [docs/KNOWN_DEFECTS.md](docs/KNOWN_DEFECTS.md) has the register and the
alarm-design history.

## Repository layout

| Path                       | What it is                                                                                                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/web/pages/`           | One page object per page, no inheritance; conventions in its own [README](src/web/pages/README.md)                                                                                                                                                               |
| `src/web/fixtures/`        | Playwright fixtures exposing the page objects and a `loggedInAsStandardUser` fixture                                                                                                                                                                             |
| `src/api/clients/`         | One thin client per API resource, returning raw `APIResponse`                                                                                                                                                                                                    |
| `src/api/schemas/`         | zod schemas — the runtime API contract; TypeScript types are derived from them                                                                                                                                                                                   |
| `src/data/`                | Every constant the tests use: credentials, catalogue, messages, routes, tax rate, API counts                                                                                                                                                                     |
| `tests/web/`, `tests/api/` | The suites; each test carries its plan ID (WEB-0xx / API-0xx) in a comment above it                                                                                                                                                                              |
| `docs/`                    | Discovery notes, [TEST_PLAN.md](docs/TEST_PLAN.md), [KNOWN_DEFECTS.md](docs/KNOWN_DEFECTS.md), [FRAMEWORK_VALIDATION.md](docs/FRAMEWORK_VALIDATION.md), [AI_EVALUATION.md](docs/AI_EVALUATION.md), and the raw [AI_EVALUATION_LOG.md](docs/AI_EVALUATION_LOG.md) |
| `prompts/`                 | The verbatim prompt for every build step, with an [index](prompts/README.md)                                                                                                                                                                                     |
| `scripts/`                 | `ci-step-summary.mjs`, which writes the CI step summary                                                                                                                                                                                                          |
| `.github/workflows/`       | The CI pipeline: lint/typecheck → api → web, plus a nightly drift run                                                                                                                                                                                            |

## Running subsets

```
npm run test:web                          # web project only
npm run test:api                          # api project only
npx playwright test --grep @smoke         # fast confidence subset
npx playwright test --grep @negative      # error paths only
npm run test:headed                       # watch the web suite in a real window
npm run test:debug                        # Playwright inspector
npx playwright test -g "locked_out_user"  # a single test by unique title fragment
npx playwright test tests/web/checkout.spec.ts   # one file (use forward slashes)
```

Tags in use: `@smoke`, `@regression`, `@negative`, `@contract`, `@known-defect`.
`npm run lint`, `npm run typecheck`, and `npm run format` are the quality gates.

## Reading a failure

- **Terminal**: the list reporter prints the failing assertion with expected vs
  received, the locator or field path, and the source line.
- **HTML report**: `npm run report` opens the report from the last run
  (`playwright-report/`).
- **Screenshots and videos**: captured only on failure, under `test-results/<test>/`
  (`test-failed-1.png`, `video.webm`).
- **Traces**: recorded on the first retry (`trace: 'on-first-retry'`), so CI
  (retries: 1) always has one for a genuine failure at
  `test-results/<test>/trace.zip` — open with `npx playwright show-trace <zip>`.
  Locally, reproduce with `--retries=1` to get a trace.
- **CI**: every run uploads `playwright-report` + `test-results` as artifacts
  (14-day retention) and writes a pass/fail table to the step summary, so the
  verdict is visible without downloading anything.

What the failure output looks like in practice — five deliberately broken runs with
their verbatim messages — is recorded in
[docs/FRAMEWORK_VALIDATION.md](docs/FRAMEWORK_VALIDATION.md) §1.

## Adding a page object and a test

Suppose SauceDemo grew a wishlist page.

**1. Observe first.** Open the live page, capture the real selectors, and add them to
the selector table in
[docs/discovery/saucedemo-discovery.md](docs/discovery/saucedemo-discovery.md).
The standing rule: a selector nobody has observed does not get committed.

**2. Write the page object** (`src/web/pages/WishlistPage.ts`) — locators declared
`readonly` at the top, assigned in the constructor, intent-named methods, no
assertions, no inheritance:

```ts
import type { Locator, Page } from '@playwright/test';
import type { Product } from '../../data/products';
import { ROUTE_WISHLIST } from '../../data/routes';

export class WishlistPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly wishlistItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.wishlistItems = page.locator('[data-test="wishlist-item"]');
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTE_WISHLIST);
  }

  removeButtonFor(product: Product): Locator {
    return this.page.locator(`[data-test="remove-wish-${product.dataTestSlug}"]`);
  }
}
```

**3. Register the fixture** in `src/web/fixtures/test.ts`:

```ts
wishlistPage: async ({ page }, use) => {
  await use(new WishlistPage(page));
},
```

**4. Write the test** — plan ID in a comment, tag, sentence title,
Arrange/Act/Assert with blank lines, web-first assertions, all data from
`src/data/`:

```ts
// WEB-034
test(
  'shows a wished product on the wishlist page',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, wishlistPage }) => {
    // Arrange
    await inventoryPage.addProductToWishlist(SAUCE_LABS_BACKPACK);

    // Act
    await wishlistPage.open();

    // Assert
    await expect(wishlistPage.wishlistItems).toHaveCount(1);
  },
);
```

**5.** Add the ID to the inventory and traceability matrix in
[docs/TEST_PLAN.md](docs/TEST_PLAN.md), then run `npm run lint` and
`npm run typecheck` — the lint config enforces most of the conventions mechanically.

## Design decisions, with the rejected alternatives

**One runner (Playwright Test) for both targets.**
_Rejected: a dedicated API tool (supertest/vitest, Postman/newman)._ One mental
model serves both suites — the same `test()`, `expect()`, fixtures, parallelism,
and HTML report — and Playwright's `APIRequestContext` is a first-class HTTP
client that fully covers this API's needs. A second tool would double configs,
reporters, lint targets, and CI jobs while adding no capability at this scope. The
cost accepted: no contract-testing ecosystem (OpenAPI validation); the zod schema
layer covers what this exercise needs of that.

**Page objects without inheritance.**
_Rejected: a `BasePage` with shared navigation/waiting helpers._ Each page object
is a standalone class readable in one screenful, with its entire selector surface
declared at the top. Inheritance hides behaviour in a parent file, invites a god
class, and saves almost nothing here — the "shared" code would be a constructor
assignment. Also rejected: no page objects at all — raw selectors in tests died
the moment one product's ids turned out to contain `.` and `()`.

**Runtime schema validation (zod) on top of TypeScript.**
_Rejected: relying on the TS types alone._ Types are erased at compile time and
never touch wire data — `await response.json()` typechecks identically whether the
server returned posts or an error page. The schema is the only artifact that can
_fail_ when the contract drifts, and `z.infer` derives the static types from it so
the two cannot disagree. Proven in validation: flipping one schema field produced
"0.userId: Invalid input: expected string, received number" × 100, named per field.

**State isolation: fresh browser context + UI login per test.**
_Rejected: `storageState` reuse (shared fixture file across workers, bypassed auth
path, stale-state risk — to save a login measured at well under a second);
localStorage seeding (couples tests to an internal storage format and skips the
transitions under test); Reset App State as cleanup (observed leaving stale
buttons — never build isolation on a mechanism documented as buggy)._ A fresh
context guarantees clean cookies and localStorage at the browser level; the cart
that SauceDemo persists across logout dies with the context.

**Retry policy: 1 in CI, 0 locally, trace on first retry.**
_Rejected: blanket retries everywhere (they hide real flakes — the validation
step's flake hunt fixed its finding at the root instead: a worker-scoped API
context, no retry, no timeout bump); also rejected: zero retries in CI (a shared
public target over the public internet has genuine infrastructure noise, and the
first retry is exactly when the trace is captured)._ A test that needs its CI
retry gets investigated, not ignored.

## Known limitations, and what I'd do next

- **Planned but unimplemented tests**: WEB-008 (performance_glitch_user login),
  WEB-017/018 (cart-across-logout and Reset App State pins), and the three narrow
  defect pins WEB-024..026. They are in the plan's inventory and traceability
  matrix; the defect _flow_ tests cover part of that ground. First thing I'd
  implement with more time.
- **Chromium only.** Deliberate (see TEST_PLAN §6); Firefox/WebKit are a
  config-only addition.
- **No accessibility audit** despite discovery documenting real gaps (unnamed cart
  link, unlabelled username list). An axe-core smoke on the four main pages is the
  natural next step.
- **No visual regression** — argued in the plan (unowned deployment, and
  visual_user randomizes prices per load by design).
- **The plan's exit criterion of three consecutive green CI runs** has one data
  point so far; the nightly schedule will accumulate the rest.
- **Validation-scale bursts can trip the API's edge throttling** (first-connection
  tarpits after ~2,000 requests/hour — FRAMEWORK_VALIDATION §2). Normal runs are
  unaffected; failures are crisp and named when it happens.
- With more time beyond the above: schema-driven contract tests for the remaining
  write resources, a nightly-failure GitHub issue hook so drift files itself, and
  extending the validation step's sabotage exercise into scripted mutation testing.

## Provenance

Built step by step from the prompts archived in [prompts/](prompts/README.md), with
every selector and expectation observed live before being encoded, and every
mistake made along the way logged as it happened in
[docs/AI_EVALUATION_LOG.md](docs/AI_EVALUATION_LOG.md). The assessed write-up of
that process is [docs/AI_EVALUATION.md](docs/AI_EVALUATION.md).
