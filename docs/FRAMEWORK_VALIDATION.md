# Framework validation

Evidence, gathered 2026-09-01, that the suite fails correctly — not just that it
passes. Every output below is verbatim from an actual run on this machine.

## 1. False-positive check: five deliberate breaks

Method: for each target, break exactly the thing the test checks, run it, capture the
failure, revert. All five reverts were verified with a clean `git diff` afterwards.

### Break 1 — selector changed to something that doesn't exist

`LoginPage.usernameInput` → `[data-test="username-field"]`. WEB-001 failed naming the
broken locator, the page-object line, and the test call site:

```
Test timeout of 8000ms exceeded.
Error: locator.fill: Test timeout of 8000ms exceeded.
Call log:
  - waiting for locator('[data-test="username-field"]')
   at ..\src\web\pages\LoginPage.ts:31
> 31 |     await this.usernameInput.fill(credentials.username);
        at LoginPage.logInAs (...\src\web\pages\LoginPage.ts:31:30)
        at ...\tests\web\authentication.spec.ts:23:21
```

### Break 2 — expected value inverted

`SALES_TAX_RATE` 0.08 → 0.09. WEB-021 failed showing the computed-vs-real money:

```
Error: expect(locator).toHaveText(expected) failed
Locator:  locator('[data-test="tax-label"]')
Expected: "Tax: $5.94"
Received: "Tax: $5.28"
  14 × locator resolved to <div data-test="tax-label" class="summary_tax_label">Tax: $5.28</div>
```

### Break 3 — catalogue data corrupted

Backpack price 29.99 → 28.99. WEB-011 failed with a unified diff pinpointing the one
wrong element out of six:

```
Error: expect(locator).toHaveText(expected) failed
Locator: locator('.inventory_item_price')
- Expected  - 1
+ Received  + 1
  Array [
-   "$28.99",
+   "$29.99",
    "$9.99",
    ...
```

### Break 4 — schema field type flipped

`postSchema.userId` z.number() → z.string(). The validator named every offending
field path, capped for readability:

```
Error: GET /posts body does not match its schema:
  0.userId: Invalid input: expected string, received number
  1.userId: Invalid input: expected string, received number
  ...
  9.userId: Invalid input: expected string, received number
  … and 90 more issue(s)
```

### Break 5 — client pointed at a wrong path

`PostsClient.createPost` `/posts` → `/post`. API-011 failed at the exact assertion:

```
Error: expect(received).toBe(expected) // Object.is equality
Expected: 201
Received: 404
> 27 |     expect(createResponse.status()).toBe(201);
```

Verdict: all five failures were diagnosable from the message alone — locator, field
path, diff, or status — no debugger needed.

## 2. Flake hunt

Honesty first: **`--shuffle` does not exist in Playwright 1.62** (verified against
`npx playwright test --help`; also recorded when step 8 asked for it). Order
randomization is approximated by `fullyParallel` interleaving across workers, plus
the per-file isolation runs in §3.

`--repeat-each=5` = 325 test executions per burst. Four bursts were run:

| Burst | Configuration                                 | Result                                                                                                                                                                     |
| ----- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | per-test API contexts (as shipped), 4 workers | **324/325** — 1 hang: `GET /posts` collection test died as a blank `Test timeout of 30000ms exceeded`                                                                      |
| 2     | + 15 s per-request timeout, 4 workers         | **323/325** — 2 hangs, now crisply named: `TimeoutError: apiRequestContext.get: Timeout 15000ms exceeded → GET https://jsonplaceholder.typicode.com/photos` (and `/posts`) |
| 3     | same, 2 workers (CI profile)                  | **323/325** — 2 hangs again, so raw concurrency wasn't the cause                                                                                                           |
| 4     | + worker-scoped shared context, 4 workers     | **325/325 in 55.4 s**                                                                                                                                                      |

Root causes, fixed with **no retries and no timeout bumps** (the one timeout touched
went _down_, 30 s → 15 s):

1. **Diagnosability**: there was no request-level timeout below the test budget, so
   a hung request consumed the whole test and failed as an unexplained test
   timeout. The 15 s per-request timeout makes the same event fail fast, naming the
   URL.
2. **Connection churn** — the real stability fix: the built-in `request` fixture
   creates a fresh `APIRequestContext` (fresh TLS connections) per test, so a
   325-test burst opened hundreds of new connections to one host — exactly what
   edge proxies tarpit, and the hangs hit only the largest collection GETs. One
   context per worker reuses connections. The API is stateless, so isolation is
   unaffected. Corroborating evidence beyond the pass rate: the burst dropped from
   66–84 s to 55 s, and the normal 65-test run from 22.9 s to 12.1 s.

Pass rate before: 324/325 (99.7%). After: **325/325 (100%)**, at the original
concurrency.

Residual truth, recorded rather than hidden: after roughly 2,000 requests in an
hour, the service intermittently tarpits the first request on a brand-new connection
(observed once more during §3's isolated runs, gone minutes later). That is
environmental backpressure from validation-scale load — the discovery ground rules
("don't hammer") predicting their own consequence. When it happens it now fails
crisp and named; normal-profile runs are unaffected.

## 3. Isolation check

Each of the 13 spec files run alone, then everything together:

| File                         | Alone                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| api/collections.spec.ts      | 7 passed                                                                                 |
| api/degenerate-input.spec.ts | 2 passed                                                                                 |
| api/filters.spec.ts          | 3 passed                                                                                 |
| api/headers.spec.ts          | 2 passed                                                                                 |
| api/relations.spec.ts        | 3 passed                                                                                 |
| api/single-resources.spec.ts | 4 passed + 1 environmental hang (§2's residual, named by the 15 s timeout); 5/5 on rerun |
| api/writes.spec.ts           | 6 passed                                                                                 |
| web/authentication.spec.ts   | 12 passed                                                                                |
| web/cart.spec.ts             | 4 passed                                                                                 |
| web/checkout.spec.ts         | 8 passed                                                                                 |
| web/inventory.spec.ts        | 10 passed                                                                                |
| web/known-defects.spec.ts    | 2 passed (expected failures under test.fail)                                             |
| web/purchase-journey.spec.ts | 1 passed                                                                                 |

All together, 4 workers: **65 passed** — identical outcomes. No test's result
depends on which file ran with it.

## 4. Timing

Full suite: **65 tests, 12.1 s wall-clock, 4 workers** (down from 22.9 s before the
worker-scoped context). Five slowest, from the JSON reporter:

| ms   | Test                                     |
| ---- | ---------------------------------------- |
| 5912 | error_user defect flow (known-defects)   |
| 5695 | problem_user defect flow (known-defects) |
| 1475 | logout + back-button (authentication)    |
| 831  | overview tax arithmetic (checkout)       |
| 797  | full purchase journey (purchase-journey) |

The two defect flows are disproportionate **by design**: a `test.fail` test must
exhaust its 5 s auto-waiting assertion timeout to prove the app did _not_ do the
right thing — that wait is the assertion. The logout test performs three
navigations. Nothing else exceeds a second.

## 5. Trace check

Forced failure: WEB-014's badge expectation flipped to `'2'`, run with
`--retries=1` (matching CI, since the config traces `on-first-retry`).

Captured, all non-empty and inspected:

- `test-failed-1.png` (206 KB) — shows the inventory with the badge reading "1" and
  the Backpack button already "Remove": the failure is diagnosable from the image
  alone (the app was right; the expectation was wrong).
- `video.webm` (~250 KB per attempt).
- `trace.zip` (785 KB, retry attempt) — contains the action trace, a
  `0-trace.network` file, page screencast frames, and TypeScript source snapshots;
  opens in the trace viewer.

Note the deliberate consequence of `on-first-retry`: local zero-retry runs produce
screenshot + video but no trace; CI (retries: 1) always gets a trace for a real
failure. Local reproduction is one `--retries=1` flag away.

## 6. Cold-start check

The README at the start of this step documented **nothing runnable** (title, targets,
one line of provenance — a placeholder from step 2, now outgrown). It was rewritten
with prerequisites, setup, run commands, the expected-failure note, and a repository
map — then verified against a truly fresh clone from GitHub:

```
git clone https://github.com/imsumith01/senior-qa-takehome.git
npm ci                          → added 98 packages
npx playwright install chromium
npm test                        → 65 passed (12.6s), exit 0
```

No undocumented step. (One environment footnote: the clone had to live in a short
temp path — this session's deep scratch directory exceeds Windows MAX_PATH for git
worktrees, the same limit the step-1 commit hit.)

## What the framework earned from this step

- A worker-scoped API request context with a per-request timeout (src/api/fixtures)
  — found by the flake hunt, verified by burst 4.
- A real README — found by the cold-start check.
- Confidence with receipts: five sabotages produced five immediately-diagnosable
  failures, and the two changes made for stability were architectural, not
  retries or timeout inflation.
