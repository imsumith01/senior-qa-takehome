# Test Plan

Requirements input for the automation framework. Everything here is grounded in the two
discovery documents — [saucedemo-discovery.md](discovery/saucedemo-discovery.md) and
[jsonplaceholder-contract.md](discovery/jsonplaceholder-contract.md) — which record only
behaviour observed live. Where this plan covers something discovery marked _unverified_,
the test itself is the verification and is flagged as such.

## 1. Scope

### In scope

- **Web (saucedemo.com)**: authentication including every observed error message; access
  control for protected URLs; catalogue integrity; sorting; cart and badge behaviour;
  the full checkout flow including validation, pricing, and order completion; session
  behaviours (logout, cart persistence, Reset App State); and a small set of
  known-defect pins for the deliberately broken users.
- **API (jsonplaceholder.typicode.com)**: the full read contract for all six
  collections; single-resource and error semantics; nested-route/filter equivalence;
  the write _response_ contract and non-persistence, exercised against `/posts` as the
  representative resource; degenerate input handling; the safe subset of headers.

### Deliberately out of scope, and why

| Not automated                                                          | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual/pixel regression (screenshot diffing)                           | We don't control the deployment, so baselines rot at the site's release cadence; and `visual_user` randomizes prices per page load, which makes its screenshots nondeterministic by design. Several of its bugs are DOM-detectable (the misaligned-button class, the wrong backpack image src, the displaced cart icon's coordinates); one class-based pin (WEB-026) is kept, and the others are left in the discovery doc because they would repeat WEB-024's image-pin pattern without proving anything new about the framework. |
| Performance/latency assertions                                         | Shared public demo over the public internet — response time measures the network path, not the app. `performance_glitch_user` is covered functionally (login completes, WEB-008) with no timing threshold; the 5 s figure lives in the discovery doc. One deliberate exception, added in step 11: the API smoke reads carry a generous hang-guard (5 s) — not a performance benchmark, just a tripwire for a stuck network or dying service.                                                                                       |
| Exhaustive bug matrix for `problem_user`, `error_user`, `visual_user`  | These users are intentional, permanent fixtures — there is no developer who will fix them, so a full per-bug suite is maintenance without information. Three representative pins (WEB-024..026) prove the framework can express expected-failure states; the complete catalogue of their bugs is in the discovery doc.                                                                                                                                                                                                             |
| Full CRUD across all six API resources                                 | Writes are simulated identically everywhere; repeating the same echo assertions for 6 resources × 4 verbs is 24 near-copies of the `/posts` tests that can never fail independently. `/posts` is the representative; reads are covered for all six.                                                                                                                                                                                                                                                                                |
| The About link and photo URLs (`saucelabs.com`, `via.placeholder.com`) | Third-party hosts. Their observed values are recorded in the discovery docs; no test asserts anything about a host we don't control, including its URL shape — that would pin someone else's deployment.                                                                                                                                                                                                                                                                                                                           |
| Accessibility audit                                                    | Real gaps were observed (unnamed cart link, unlabelled username list) and are recorded in discovery §10; a proper audit needs axe integration and a remediation owner, which a demo site does not have. Noted as a natural extension.                                                                                                                                                                                                                                                                                              |
| Load, security, and fuzz testing                                       | No authorization to attack a shared public demo; explicitly against the "be gentle" constraint.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Mobile viewports                                                       | Discovery never explored viewports (a single 929 px window throughout), so there is no verified mobile behaviour to encode; a viewport matrix would multiply runtime to chase unpinned expectations.                                                                                                                                                                                                                                                                                                                               |

## 2. Risk table

Priorities are assigned from user cost × likelihood, and the rest of this plan is
ordered by them. Priority meanings: **P0** — run on every change, failure blocks;
**P1** — full regression; **P2** — pins and low-consequence conveniences.

| Feature area                                               | What failure costs a real user                         | Likelihood                                                                               | Priority        |
| ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------- |
| Login                                                      | Total lockout from the product                         | Medium — it has auth logic and five distinct error paths                                 | **P0/P1**       |
| Checkout flow (info → overview → complete)                 | Cannot spend money; direct revenue loss                | Medium — multi-step form with validation                                                 | **P0/P1**       |
| Pricing and tax on the overview                            | Wrong charges; trust and legal exposure                | Low — arithmetic, but the highest-cost failure on the site                               | **P0**          |
| Cart add/remove and badge                                  | Items silently not purchased, or unwanted items bought | Medium — state machine across pages (and 2 of the 6 demo users have exactly this broken) | **P0/P1**       |
| Access control on protected URLs                           | Checkout pages reachable anonymously                   | Low — but a security property                                                            | **P1**          |
| Catalogue integrity (names, prices, descriptions)          | Buying the wrong thing at the wrong price              | Low — static data                                                                        | **P1**          |
| Session behaviours (logout, cart persistence, reset)       | Shared-machine data leakage; stale state               | Medium — discovery already found two real oddities here                                  | **P1/P2**       |
| Sorting                                                    | Inconvenience only                                     | Medium — broken for 2 of 6 users, so clearly fragile code                                | **P2**          |
| API read contract (collections, single resources, filters) | Every consumer breaks at once                          | Low — static data, but consumer blast radius is total                                    | **P0–P2 (API)** |
| API error semantics (404s, empty filters)                  | Consumer error handling built on wrong assumptions     | Low                                                                                      | **P1 (API)**    |
| API write response contract + non-persistence              | Consumers believing writes stick                       | Certain — it _is_ non-persistent; the risk is tests/consumers assuming otherwise         | **P0/P1 (API)** |
| API degenerate input (500 + stack trace)                   | Leaks server internals; consumer retry loops on 500    | Low                                                                                      | **P2 (API)**    |
| API headers/CORS                                           | Browser consumers blocked                              | Low                                                                                      | **P2 (API)**    |

## 3. Test inventory

Tags: `@smoke` = fastest confidence subset, runs first; `@regression` = full suite;
`@negative` = error paths; `@contract` = shape/echo pins on the API. A test may carry
several tags. IDs are stable and live in a comment directly above each test (titles
stay pure English sentences per the readability rules; grep for the ID to find the
test).

### Web

| ID      | Description                                                                                                                                                                                                                      | Priority | Tags               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ |
| WEB-001 | standard_user logs in and lands on the inventory with all six products visible                                                                                                                                                   | P0       | @smoke             |
| WEB-002 | rejects a wrong password with the verbatim mismatch error banner                                                                                                                                                                 | P0       | @smoke @negative   |
| WEB-003 | rejects locked_out_user with the verbatim locked-out error                                                                                                                                                                       | P0       | @negative          |
| WEB-004 | rejects an empty username with the verbatim "Epic sadface: Username is required"                                                                                                                                                 | P1       | @negative          |
| WEB-005 | rejects an empty password with the verbatim "Epic sadface: Password is required"                                                                                                                                                 | P1       | @negative          |
| WEB-006 | error banner disappears when its dismiss button is clicked                                                                                                                                                                       | P1       | @regression        |
| WEB-007 | logout via the burger menu returns to the login page and ends the session                                                                                                                                                        | P1       | @regression        |
| WEB-008 | performance_glitch_user completes login and sees the inventory (no timing assertion — proves the suite's waits, not the site's speed)                                                                                            | P0       | @regression        |
| WEB-009 | every protected page redirects to login with the verbatim guard message when visited logged out (parameterized: inventory, cart, both checkout steps, complete; extends discovery, which verified two of the five)               | P1       | @negative          |
| WEB-011 | inventory lists exactly the six known products with their names and prices                                                                                                                                                       | P1       | @smoke @regression |
| WEB-012 | each sort option orders products correctly (parameterized az/za/lohi/hilo; price ties compared monotonically, never by position)                                                                                                 | P2       | @regression        |
| WEB-013 | product detail page shows the same name, description, and price as the listing                                                                                                                                                   | P1       | @regression        |
| WEB-014 | adding a product sets the badge to 1 and the cart lists it with quantity 1                                                                                                                                                       | P0       | @smoke             |
| WEB-015 | adding two products then removing one updates badge and cart rows                                                                                                                                                                | P1       | @regression        |
| WEB-016 | cart badge survives a full page reload                                                                                                                                                                                           | P1       | @regression        |
| WEB-017 | cart contents survive logout and re-login (pins observed persistence behaviour)                                                                                                                                                  | P2       | @regression        |
| WEB-018 | Reset App State empties the cart; buttons resynchronize after reload (pins the stale-button behaviour honestly)                                                                                                                  | P2       | @regression        |
| WEB-019 | full checkout of two known items shows Item total $39.98, Tax $3.20, Total $43.18 and completes with the thank-you page and an emptied cart                                                                                      | P0       | @smoke             |
| WEB-020 | checkout step one rejects each missing field with its verbatim message (parameterized: all empty, first missing, last missing, postal missing)                                                                                   | P0       | @negative          |
| WEB-021 | overview tax is 8% of item total, verified on a second, different basket against a computed expectation                                                                                                                          | P0       | @regression        |
| WEB-022 | cancel from step one returns to the cart; cancel from step two returns to the inventory (pins the observed asymmetry)                                                                                                            | P1       | @regression        |
| WEB-024 | defect pin: problem_user sees the 404-dog image on all six products                                                                                                                                                              | P2       | @regression        |
| WEB-025 | defect pin: error_user add-to-cart leaves the cart unchanged for Bolt T-Shirt, Fleece Jacket, and Test.allTheThings() — its loud failure mode (console error), unlike problem_user's silent one; the cart state is the assertion | P2       | @regression        |
| WEB-026 | defect pin: visual_user's Test.allTheThings() button carries the btn_inventory_misaligned class                                                                                                                                  | P2       | @regression        |
| WEB-027 | cart page lists exactly the added items with their names, descriptions, prices, and quantities (added in step 9)                                                                                                                 | P1       | @regression        |
| WEB-028 | removing an item on the cart page updates both the row list and the badge (added in step 9)                                                                                                                                      | P1       | @regression        |
| WEB-029 | Continue Shopping returns to the inventory with the cart intact (added in step 9)                                                                                                                                                | P1       | @regression        |
| WEB-030 | an empty cart checks out end to end: step one opens, step two shows zero items with the unformatted "Item total: $0", and Finish confirms a $0 order (pins behaviour observed 2026-09-01)                                        | P2       | @regression        |
| WEB-031 | core purchase flow as problem_user, asserting correct behaviour — declared test.fail: it runs on every suite run, the failure is expected, and the suite goes red if the demo site ever fixes the account                        | P2       | @known-defect      |
| WEB-032 | core purchase flow as error_user, asserting correct behaviour — declared test.fail: it runs on every suite run, the failure is expected, and the suite goes red if the demo site ever fixes the account                          | P2       | @known-defect      |

(WEB-010 and WEB-023 are unassigned — WEB-009 absorbed the second guard test when it
became parameterized, and the empty-cart idea was cut in §1, then revived under a
fresh ID (WEB-030) once the behaviour was actually observed. IDs are never reused.)

### API

| ID      | Description                                                                                                                                                                                                        | Priority | Tags                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------- |
| API-001 | GET /posts returns 200 with exactly 100 items of the documented shape                                                                                                                                              | P0       | @smoke @contract    |
| API-002 | every collection returns its documented count and uniform shape (parameterized over all six)                                                                                                                       | P0       | @contract           |
| API-003 | collection ids run 1..count with no gaps (first and last item of each)                                                                                                                                             | P1       | @contract           |
| API-004 | GET /posts/1 returns the exact known post                                                                                                                                                                          | P0       | @smoke @contract    |
| API-005 | GET /posts/{0, -1, abc, 9999} each return 404 with a literal empty-object body (parameterized)                                                                                                                     | P1       | @negative @contract |
| API-006 | /posts/1/comments deep-equals /comments?postId=1                                                                                                                                                                   | P1       | @contract           |
| API-007 | /users/1/todos deep-equals /todos?userId=1                                                                                                                                                                         | P1       | @contract           |
| API-008 | ?userId=1 returns exactly 10 posts and every one has userId 1 (count asserted — guards the ignored-typo trap)                                                                                                      | P1       | @regression         |
| API-009 | ?userId=9999 returns 200 with an empty array, not 404                                                                                                                                                              | P1       | @negative           |
| API-010 | unknown query parameters are ignored and return the full collection (pins the trap itself)                                                                                                                         | P2       | @contract           |
| API-011 | POST echoes the payload with synthesised id 101 and a Location header; the follow-up GET of /posts/101 is 404 and the collection still has 100 items — creation does not persist, and the test says so in its name | P0       | @smoke @contract    |
| API-012 | two consecutive POSTs both return id 101 — the id is computed, never allocated                                                                                                                                     | P1       | @contract           |
| API-013 | PUT /posts/1 with a full object echoes it back; a follow-up GET shows the original unchanged                                                                                                                       | P1       | @contract           |
| API-014 | PUT /posts/1 with only a title returns an object missing the omitted fields — replace, not merge                                                                                                                   | P1       | @contract           |
| API-015 | PATCH /posts/1 returns the real stored post with only the sent field changed — merge against actual data (the strongest write-side assertion this API allows); follow-up GET unchanged                             | P1       | @contract           |
| API-016 | DELETE /posts/1 returns 200 with an empty object and the post is still retrievable afterwards                                                                                                                      | P1       | @contract           |
| API-017 | malformed JSON with a JSON content-type returns 500 with a non-JSON stack-trace body (pins current behaviour; a fix to 400 should fail this loudly)                                                                | P2       | @negative           |
| API-018 | POST without a JSON content-type ignores the body and returns just the synthesised id                                                                                                                              | P2       | @negative           |
| API-019 | JSON endpoints respond with content-type application/json; charset=utf-8                                                                                                                                           | P2       | @contract           |
| API-020 | sending an Origin header gets it echoed in access-control-allow-origin with credentials allowed                                                                                                                    | P2       | @contract           |
| API-021 | cross-resource referential integrity: every post's userId corresponds to a real user (added in step 11)                                                                                                            | P1       | @contract           |

Deliberately absent, per discovery: assertions on rate-limit numbers, `age`,
`cf-cache-status`, or cache-control HIT/MISS differences — observed to change with
Cloudflare cache state, so any such test alternates pass/fail while proving nothing.

## 4. Test data strategy

- **Hardcoded, in `src/data/` as named constants**: the six users and the shared
  password (public demo credentials printed on the login page — not secrets); the
  six-product catalogue exactly as observed (names, prices, descriptions, ids); the
  sales tax rate (`SALES_TAX_RATE = 0.08`); every verbatim error message; checkout
  customer details (any static values — the app only checks non-emptiness); API
  collection counts and shapes; the known content of `/posts/1` and its comments.
- **Derived at runtime, never hardcoded**: expected sort orders (computed by sorting
  the catalogue constants — so a tie-break never gets baked in); expected totals
  (computed from the chosen items and `SALES_TAX_RATE`, then compared to what the page
  shows); expected filter results (count from constants, membership from the
  predicate).
- **Read back from the app**: nothing, as state. The API persists nothing a test
  writes (verified in discovery), and while SauceDemo _does_ persist the cart in
  browser storage — even across logout — that storage lives inside each test's own
  browser context and dies with it, so no test can ever read another test's leavings.
  The only read-back-then-assert pattern is within a single test (e.g. WEB-013
  compares the detail page against the listing it just read).
- **Independence**: no test depends on another test's outcome or ordering. Web tests
  build their own cart through their own UI actions in their own context; API tests
  hit a server that cannot be mutated. Anything that would create ordering (shared
  login state files, a shared cart) is explicitly rejected in §5.

## 5. Web isolation and state strategy

SauceDemo keeps auth in a `session-username` cookie and the cart in
`localStorage["cart-contents"]`, which survives logout (discovery §6). The strategy:

**Every test runs in a fresh Playwright browser context (the default).** A fresh
context has empty cookies and empty localStorage, so a known-clean state is
guaranteed by the browser, not by app code. On top of that clean base, tests that
operate _past_ the login page log in through the UI via a fixture parameterized by
user (standard_user unless the test says otherwise); tests whose subject _is_ the
login page (WEB-001..006, WEB-008) and the logged-out access-control tests (WEB-009)
drive or skip the login themselves. Login costs well under a second on this site
(measured 21 ms–352 ms for standard_user), so the honesty of entering through the
real front door costs almost nothing.

Alternatives considered and rejected:

- **`storageState` reuse (log in once, inject the saved state everywhere)** — saves
  ~1 s per test at the price of a shared fixture file across parallel workers, a
  bypassed login path in every test, and the risk that a stale saved state masks auth
  regressions. On a site where login is this cheap, it optimizes the wrong thing.
- **Seeding `localStorage["cart-contents"]` directly for cart tests** — fast, but it
  couples tests to an internal storage format we observed rather than a contract, and
  it skips the very add-to-cart transitions the suite exists to cover. Building a
  two-item cart through the UI is two clicks.
- **Reset App State as a cleanup mechanism** — rejected outright: discovery showed it
  leaves rendered Remove buttons stale until reload. Never build isolation on a
  mechanism you have already documented as buggy. It appears only as the _subject_ of
  WEB-018.
- **afterEach cleanup** — unnecessary. Contexts are discarded; there is nothing to
  clean. Cleanup code that can fail is worse than no cleanup.

## 6. Environment and execution

- **Browsers**: web project runs Desktop Chrome (Chromium) only, deliberately.
  Discovery observed nothing browser-specific (nor looked — it ran Chromium), so a
  three-browser matrix on an unowned demo would triple CI time chasing speculative
  value; Firefox/WebKit are a config-only addition if this were a real product. API
  project uses Playwright's request context — no browser at all.
- **Parallelism**: fully parallel within and across files — a requirement on the
  build step: `playwright.config.ts` does not yet set `fullyParallel: true` and must
  gain it. The API is stateless and web tests are context-isolated, so nothing shares
  state. One deliberate limit, also for the build step to add: **CI caps workers at
  2** — both targets are shared public demos, and a 16-worker burst from CI is
  exactly the "hammering" the discovery rules prohibit. Locally, Playwright's default
  worker count applies.
- **Retries**: CI 1, local 0 (already configured with reasoning in
  playwright.config.ts). A test that needs its CI retry gets investigated, not
  ignored — the trace from the first attempt is retained (`trace: on-first-retry`).
- **CI vs local**: CI adds `forbidOnly` (a stray `.only` fails the build), the single
  retry, the worker cap, and uploads the HTML report + traces as artifacts. Local
  runs open failures interactively (`test:headed`, `test:debug`, `report` scripts).
- **Tag-driven runs**: `@smoke` as the fast gate, full suite as the regression run
  (`--grep @smoke` / project filters via the existing npm scripts).

## 7. Entry and exit criteria

**Entry** (a run is worth starting):

- `npm ci` succeeds on Node 20+; Playwright browsers installed.
- `npm run lint` and `npm run typecheck` are green — style and type gates run before
  any test.
- Both targets respond (the `@smoke` tests themselves are the reachability check —
  a separate ping adds a request without adding information).

**Exit** (a run counts as passing / the suite is fit to hand over):

- 100% of planned tests pass — P2 included; no test is skipped silently (any skip
  carries a written reason in code). Priority governs how urgently a failure is
  acted on, not whether it counts.
- A failing defect pin deserves special note: it is not noise but a signal the demo
  itself changed, and the discovery docs plus this plan need updating before the pin
  is touched.
- Flake bar: the full suite passes 3 consecutive CI runs before the framework is
  called done; any test needing its retry twice across those runs gets fixed or
  quarantined with a written reason.
- Artifacts (HTML report, traces on retry) are produced and retrievable from CI.

## 8. Traceability matrix

| Feature (from discovery)                                           | Covered by                                              | Gaps, stated                                                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login: success                                                     | WEB-001, WEB-008                                        | —                                                                                                                                                       |
| Login: all five observed error cases (four distinct messages)      | WEB-002..005 (mismatch, locked out, username, password) | "username empty + password filled" produces the same message as "both empty" (observed), so both live in WEB-004                                        |
| Login: banner dismiss                                              | WEB-006                                                 | —                                                                                                                                                       |
| Access control (5 protected URLs)                                  | WEB-009                                                 | discovery verified 2 of 5; WEB-009 verifies the rest by running                                                                                         |
| Catalogue integrity                                                | WEB-011, WEB-013                                        | descriptions asserted on detail page only — listing text is identical by observation                                                                    |
| Sorting (4 options)                                                | WEB-012                                                 | tie order deliberately not asserted (unspecified behaviour)                                                                                             |
| Cart add/remove/badge                                              | WEB-014, WEB-015, WEB-016                               | quantity editing: no such UI exists — nothing to test                                                                                                   |
| Cart persistence across logout                                     | WEB-017                                                 | cross-user leakage variant not automated: inferred-only in discovery, and pinning user A's cart appearing for user B would bless a bug as a contract    |
| Reset App State                                                    | WEB-018                                                 | —                                                                                                                                                       |
| Checkout validation                                                | WEB-020                                                 | whitespace-only input: unobserved in discovery, not encoded; noted for exploration                                                                      |
| Checkout pricing/tax                                               | WEB-019, WEB-021                                        | rounding mode beyond observed baskets is unknowable (all prices end .99 — discovery §8)                                                                 |
| Checkout cancel navigation (step one → cart, step two → inventory) | WEB-022                                                 | —                                                                                                                                                       |
| Order completion                                                   | WEB-019                                                 | —                                                                                                                                                       |
| Session/logout                                                     | WEB-007                                                 | —                                                                                                                                                       |
| Burger menu: All Items                                             | —                                                       | **gap**, deliberate: it navigates to the page every logged-in test already starts on; asserting it adds a click, not information                        |
| Known-defect users                                                 | WEB-024..026 (one pin each)                             | full bug catalogue deliberately unautomated (§1)                                                                                                        |
| Cart page contents and navigation                                  | WEB-027, WEB-028, WEB-029                               | added in step 9 when the cart page gained dedicated coverage                                                                                            |
| Checkout with empty cart                                           | WEB-030                                                 | gap closed: behaviour observed in a follow-up session (discovery §10.16) and pinned                                                                     |
| Defect-detection flows (problem_user, error_user)                  | WEB-031, WEB-032                                        | assert correct behaviour against broken users via test.fail (run every time, failure expected) — docs/KNOWN_DEFECTS.md records what they catch and miss |
| About link, photo URLs                                             | —                                                       | **gap**, third-party (§1)                                                                                                                               |
| Accessibility findings                                             | —                                                       | **gap**, needs tooling + owner (§1)                                                                                                                     |
| API: collection contracts                                          | API-001..003                                            | —                                                                                                                                                       |
| API: single-resource + misses                                      | API-004, API-005                                        | —                                                                                                                                                       |
| API: nested ≡ filtered                                             | API-006, API-007                                        | other nested routes (e.g. /albums/1/photos) assumed symmetric — representative pair chosen per §1 rationale                                             |
| API: filters                                                       | API-008..010                                            | —                                                                                                                                                       |
| API: write echo + non-persistence                                  | API-011..016                                            | other resources' writes: representative-only (§1)                                                                                                       |
| API: degenerate input                                              | API-017, API-018                                        | —                                                                                                                                                       |
| API: headers/CORS                                                  | API-019, API-020                                        | rate-limit / cache values deliberately excluded (§3)                                                                                                    |
| API: cross-resource referential integrity                          | API-021                                                 | added in step 11                                                                                                                                        |
| API: preflight OPTIONS                                             | —                                                       | **gap**: observed 204 + allow-methods in discovery; low consumer value vs API-020, cut to keep the header suite lean                                    |

Every gap in the matrix is deliberate and carries its reason in place (most argued in
§1); everything else observed in discovery maps to at least one test ID.
