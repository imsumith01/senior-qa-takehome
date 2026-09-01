# Page object conventions

How the page objects in this folder work, and how to add one.

## The rules

- **One class per page** (plus `SideMenu`, a component that lives on every logged-in
  page). No inheritance, no base class — each file stands alone and can be read alone.
- **The constructor takes `page: Page` and nothing else.** All locators are assigned
  there and declared as named `readonly` properties at the top of the class, so the
  full selector surface of a page is visible in one screenful.
- **Every selector is verified.** A selector may only be added if it appears in the
  selector table of
  [docs/discovery/saucedemo-discovery.md](../../../docs/discovery/saucedemo-discovery.md),
  which records only what was actually observed in the live DOM. If you need a
  selector that isn't there, go observe it first and add it to the table — do not
  write it from memory.
- **Prefer `[data-test="…"]` attribute selectors.** Ids look tempting, but one product
  has `.` and `()` in its ids, which breaks raw `#id` CSS selectors (discovery §10).
  Attribute form works for everything, so everything uses it.
- **Per-product elements are locator factories**, e.g.
  `addToCartButtonFor(product)`. They take a `Product` from
  [src/data/products.ts](../../data/products.ts) — never a raw string — and build the
  selector from the product's recorded `dataTestSlug`.
- **Methods are named after user intent** (`logInAs`, `sortProductsBy`,
  `beginCheckout`), not mechanics. A method does one user-visible thing.
- **No assertions in page objects, and no value-reader methods either.** They
  describe what is on the page and how to act on it; tests assert web-first against
  the exposed locators (`expect(locator).toHaveText(...)`). A method that returns
  page text for a plain `expect(value)` would be an escape hatch from the web-first
  rule, so none exist.
- **No waits.** Playwright locators auto-wait on interaction; anything beyond that is
  the test's decision via `expect`.

## Adding a page

1. Observe the page: every selector you intend to use must land in the discovery
   doc's selector table first.
2. Create `YourPage.ts`: locators declared `readonly` at the top, assigned in the
   `constructor(page: Page)`, intent-named methods below.
3. Register it in [src/web/fixtures/test.ts](../fixtures/test.ts) so tests receive it
   as a fixture.
4. `npm run lint` and `npm run typecheck` must pass — the lint config enforces most
   of the rules above (no `any`, no inheritance, complexity and length limits).
