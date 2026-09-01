# Known defects: SauceDemo

Every defect found in SauceDemo during this exercise, how it was found, whether it is
deliberate, and what the suite does about it. Sources: the live MCP discovery
session ([discovery/saucedemo-discovery.md](discovery/saucedemo-discovery.md)),
follow-up observation sessions, and the running suite itself.

"Deliberate" here means: part of SauceDemo's design as a testing playground (the
broken demo accounts exist to be found). "Genuine" means: behaviour that looks like
an ordinary bug or design flaw in the shop itself, present even for
`standard_user`.

## Defect register

### Genuine (affect standard_user)

| #   | Defect                                                                                                                                      | How found                                                                            | Suite response                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | An empty cart checks out end to end to a confirmed **$0 order**                                                                             | Follow-up observation session (step 9), closing a gap discovery had flagged          | **Pinned** — WEB-030 walks the whole $0 flow and will fail the day the app starts blocking it                                   |
| 2   | The empty-cart subtotal renders as **`Item total: $0`** — no decimals — while Tax and Total keep theirs                                     | Same session, same page                                                              | **Pinned** inside WEB-030 (verbatim text assertion)                                                                             |
| 3   | **Cart persists across logout** (`cart-contents` in localStorage survives; a shared machine shows the next person your cart)                | MCP discovery §6: logout observed leaving the key intact; badge returned on re-login | **Planned pin** WEB-017 (unimplemented — see README limitations); behaviour documented in discovery §6                          |
| 4   | **Reset App State leaves stale Remove buttons** until the next reload (cart empties, rendered buttons don't)                                | MCP discovery §9, observed live with an item in the cart                             | **Planned pin** WEB-018 (unimplemented); rejected as a cleanup mechanism in TEST_PLAN §5 because of this defect                 |
| 5   | Checkout **step-two Cancel returns to the inventory**, not the cart you came from (step-one Cancel does return to the cart)                 | MCP discovery §3 happy-path walk                                                     | **Pinned as observed** — WEB-022's second test asserts the asymmetry by name                                                    |
| 6   | **Accessibility gaps**: cart link has no accessible name; the six usernames render as one unbroken text run; login inputs lack autocomplete | Accessibility-tree snapshots during discovery (§10.15)                               | **Documented only** — an audit needs axe tooling and an owner (TEST_PLAN §1)                                                    |
| 7   | **Console noise on every page**: Backtrace telemetry fails with literal placeholder credentials (401s, CORS errors)                         | Console capture during discovery (§10.9)                                             | **Documented only** — makes any "no console errors" assertion impossible without filtering; deliberately not asserted           |
| 8   | Selector-hostile ids: one product's controls contain `.` and `()` (`add-to-cart-test.allthethings()-t-shirt-(red)`)                         | DOM attribute dumps during discovery (§10.7)                                         | **Designed around** — the whole framework uses `[data-test]` attribute selectors; the product's recorded slug lives in src/data |

### Deliberate — the broken demo accounts

SauceDemo ships three intentionally broken users. `problem_user` and `error_user`
break the purchase _flow_; `visual_user` breaks _presentation_. All defects below
were observed directly in the discovery session (§2), never recalled.

| #   | User                    | Defect                                                                                                                                                                                        | Suite response                                                                                               |
| --- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 9   | locked_out_user         | Cannot log in at all ("Epic sadface: Sorry, this user has been locked out.")                                                                                                                  | **Tested** — WEB-003 asserts the exact rejection (this one is correct behaviour to keep)                     |
| 10  | performance_glitch_user | Login takes ~5 s (5019 ms vs 21 ms control, measured)                                                                                                                                         | **Planned** WEB-008 (functional completion, no timing assertion — TEST_PLAN §1); measurement in discovery §2 |
| 11  | problem_user            | All six product images replaced by the 404-dog image                                                                                                                                          | **Documented**; planned pin WEB-024                                                                          |
| 12  | problem_user            | Sorting is a silent no-op                                                                                                                                                                     | **Documented** (discovery §2)                                                                                |
| 13  | problem_user            | Add to cart dead for 3 of 6 products (Bolt, Fleece, Test.allTheThings())                                                                                                                      | **Caught by WEB-031** — the flow test fails at the badge, verbatim output in §"Observed failures" below      |
| 14  | problem_user            | Product title links open the wrong product (`item_4_title_link` → `?id=5`)                                                                                                                    | **Documented** (discovery §2)                                                                                |
| 15  | problem_user            | Typing into Last Name lands in First Name                                                                                                                                                     | **Tripwired** — WEB-031 carries `toHaveValue` assertions that engage if defect 13 is ever fixed              |
| 16  | error_user              | Add to cart throws (console error) for the same 3 products                                                                                                                                    | **Avoided by design** in WEB-032 so the flow can reach defect 19; documented                                 |
| 17  | error_user              | Remove from cart fails, loudly                                                                                                                                                                | **Documented** (discovery §2)                                                                                |
| 18  | error_user              | Sorting fires the alert "Sorting is broken! This error has been reported to Backtrace." and does nothing                                                                                      | **Documented**, message captured verbatim                                                                    |
| 19  | error_user              | **Finish is a no-op** (`TypeError: ai.cesetRart is not a function`) — this user can never complete a purchase, and the Last Name crash is masked by a validation bypass (two defects stacked) | **Caught by WEB-032** — the flow reaches the last click and fails on the missing confirmation                |
| 20  | visual_user             | Inventory prices randomized per page load (`$95.2` shows a one-decimal formatting bug); detail page disagrees with the listing                                                                | **Documented**; kills screenshot testing by design (TEST_PLAN §1)                                            |
| 21  | visual_user             | Backpack image is the 404-dog; Test.allTheThings() button carries `btn_inventory_misaligned`; cart icon displaced (668,39 vs 854,10)                                                          | **Documented**; planned pin WEB-026 for the class hook                                                       |

## How the defect-detection tests work

[tests/web/known-defects.spec.ts](../tests/web/known-defects.spec.ts) (WEB-031,
WEB-032) runs the core purchase flow as the two flow-breaking users and asserts
**correct** behaviour — so the tests fail, on purpose.

That is the point. **A suite that goes green against a deliberately broken user is
not testing anything**: it would mean the assertions are too weak to notice a shop
where buttons do nothing and orders never complete. These two tests are the proof
that the suite has teeth.

They are declared with `test.fail()`, not `test.fixme()`. The difference matters:
`test.fixme` skips the body entirely — a "defect-detection suite" that never
executes detects nothing, not even the rot of its own selectors. `test.fail` runs
the full flow on every suite run and treats the failure as expected, so the main
run stays green today — and the day the demo site fixes one of these accounts (or
a selector breaks for an unrelated reason), the verdict flips and the suite goes
red, which is exactly the alarm that this document has gone stale. (An earlier
draft used `fixme` and claimed it would self-announce — it would not; see
AI_EVALUATION_LOG for that catch.)

### Observed failures (verbatim, from the run before the expected-failure marking)

WEB-031, `problem_user` — fails while building the basket (defect 13):

```
Error: expect(locator).toHaveText(expected) failed
Locator:  locator('[data-test="shopping-cart-badge"]')
Expected: "2"
Received: "1"
  14 × locator resolved to <span class="shopping_cart_badge" data-test="shopping-cart-badge">1</span>
```

WEB-032, `error_user` — sails through the whole checkout, then fails on the last
click (defect 19):

```
Error: expect(page).toHaveURL(expected) failed
Expected: "https://www.saucedemo.com/checkout-complete.html"
Received: "https://www.saucedemo.com/checkout-step-two.html"
```

### What the flow tests catch and what they miss

A flow test is fail-fast: it stops at the first broken assertion, so it catches the
_earliest_ defect on its path (WEB-031, defect 13) or — by routing around known
dead buttons — the _deepest_ (WEB-032, defect 19), and never both plus everything
between. The register above marks each deliberate defect accordingly: **Caught**,
**Tripwired** (assertions that engage once an earlier defect is fixed), **Avoided
by design**, or **Documented** — the last group being exactly what the planned
narrow pins (WEB-024..026, unimplemented) exist to close.

Two register entries deserve emphasis because they show why flow tests alone are
insufficient:

- Defect 15 is **masked** for problem_user: the flow dies at the badge before the
  form is ever reached.
- Defect 19's companion: error_user's Last Name crash is hidden by a _validation
  bypass_ — one defect concealing another. Only a targeted test can separate
  stacked defects; a flow test sails through the bypass.
