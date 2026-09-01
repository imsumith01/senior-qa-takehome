# Known defects and what the suite actually catches

SauceDemo ships three deliberately broken accounts: `problem_user` and `error_user`
break the purchase _flow_, and `visual_user` breaks _presentation_ (randomized
per-load prices with a one-decimal `$95.2` formatting bug, the 404-dog backpack
image, a misaligned button, a displaced cart icon — discovery §2). This document and
the flow tests cover the two flow-breaking accounts; `visual_user`'s display-level
defects need targeted pins, not a journey (the planned WEB-024..026 pattern), because
its purchase flow itself is not what is broken.

The defect-detection tests in
[tests/web/known-defects.spec.ts](../tests/web/known-defects.spec.ts) (WEB-031,
WEB-032) run the core purchase flow as the two flow-breaking users and assert
**correct** behaviour — so they fail, on purpose.

That is the point. **A suite that goes green against a deliberately broken user is
not testing anything**: it would mean the assertions are too weak to notice a shop
where buttons do nothing and orders never complete. These two tests are the proof
that the suite has teeth.

They are declared with `test.fail()`, not `test.fixme()`. The difference matters:
`test.fixme` skips the body entirely — a "defect-detection suite" that never executes
detects nothing, not even the rot of its own selectors. `test.fail` runs the full
flow on every suite run and treats the failure as expected, so the main run stays
green today — and the day the demo site fixes one of these accounts (or a selector
breaks for an unrelated reason), the verdict flips and the suite goes red, which is
exactly the alarm that this document has gone stale. The failures below are from an
actual run on 2026-09-01 (`npx playwright test tests/web/known-defects.spec.ts`,
retries 0, before the expected-failure marking was applied).

## Observed failures (verbatim from the run)

WEB-031, `problem_user` — fails while building the basket:

```
Error: expect(locator).toHaveText(expected) failed
Locator:  locator('[data-test="shopping-cart-badge"]')
Expected: "2"
Received: "1"
  14 × locator resolved to <span class="shopping_cart_badge" data-test="shopping-cart-badge">1</span>
```

WEB-032, `error_user` — sails through the whole checkout, then fails on the last
click:

```
Error: expect(page).toHaveURL(expected) failed
Expected: "https://www.saucedemo.com/checkout-complete.html"
Received: "https://www.saucedemo.com/checkout-step-two.html"
```

## What each flow test catches — and what it misses

A flow test is fail-fast: it stops at the first broken assertion, so it catches the
_earliest_ defect on its path and never reaches later ones. Everything below is from
[docs/discovery/saucedemo-discovery.md](discovery/saucedemo-discovery.md) §2, where
each defect was observed directly.

### problem_user (WEB-031)

| Defect (observed in discovery)                                        | Flow test verdict                                                                                                                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add to cart dead for Bolt T-Shirt, Fleece Jacket, Test.allTheThings() | **Caught** — the badge assertion fails the moment the second add silently does nothing                                                                      |
| All six product images replaced by the 404-dog image                  | **Missed** — the flow never asserts image sources; the planned pin WEB-024 covers it                                                                        |
| Sort is a silent no-op                                                | **Missed** — the flow never sorts; discovery §2 records it                                                                                                  |
| Title links open the wrong product                                    | **Missed** — the flow adds from the list without opening details                                                                                            |
| Typing into Last Name lands in First Name                             | **Masked** — the flow dies at the badge before reaching the form; the test's later `toHaveValue` assertions would catch it if the earlier defect were fixed |

### error_user (WEB-032)

The basket (Backpack + Bike Light) deliberately avoids this user's dead add buttons
so the flow can travel as deep as possible before failing.

| Defect (observed in discovery)                                                                     | Flow test verdict                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Finish button is a no-op (`TypeError: ai.cesetRart is not a function`); no order can ever complete | **Caught** — the flow reaches the very last click and fails on the missing confirmation page                                                                                                                           |
| Add to cart throws for Bolt T-Shirt, Fleece Jacket, Test.allTheThings()                            | **Missed by design** — the basket avoids those products to reach the deeper defect; swap one in and the test fails at the badge instead                                                                                |
| Remove from cart fails                                                                             | **Missed** — the flow never removes                                                                                                                                                                                    |
| Sort fires the "Sorting is broken!" alert                                                          | **Missed** — the flow never sorts                                                                                                                                                                                      |
| Last Name onChange crashes and the value never sticks                                              | **Masked, revealingly** — the flow passes checkout information _because_ this user also skips the last-name validation (a second defect hiding the first); the flow proceeds where a correct app would have blocked it |

## Consequences

- One flow test per broken user demonstrates detection; it does not enumerate. The
  narrow per-defect pins (WEB-024, WEB-025, WEB-026 in the plan) exist precisely
  because fail-fast flows leave later defects unexercised.
- The "masked" rows are the interesting ones: a defect can hide behind another
  (error_user's validation bypass conceals the broken Last Name field from any
  flow-level test). Only targeted tests can separate them.
- If the demo site ever fixes one of these accounts, the corresponding `test.fail`
  test stops failing, Playwright reports the unexpected pass as a failure, and the
  suite itself announces that this document is out of date. (An earlier draft claimed
  `fixme` would do this — it would not, because fixme'd tests never run; see
  AI_EVALUATION_LOG for that catch.)
