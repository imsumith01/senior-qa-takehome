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
| 13  | problem_user            | Add to cart dead for 3 of 6 products (Bolt, Fleece, Test.allTheThings())                                                                                                                      | **Pinned by WEB-031** (positive form: badge provably unchanged after the dead click)                         |
| 14  | problem_user            | Product title links open the wrong product (`item_4_title_link` → `?id=5`)                                                                                                                    | **Documented** (discovery §2)                                                                                |
| 15  | problem_user            | Typing into Last Name lands in First Name                                                                                                                                                     | **Pinned by WEB-033** (positive form: the typed last name provably lands in the first-name field)            |
| 16  | error_user              | Add to cart throws (console error) for the same 3 products                                                                                                                                    | **Avoided by design** in WEB-032's basket so the pin can reach defect 19; documented                         |
| 17  | error_user              | Remove from cart fails, loudly                                                                                                                                                                | **Documented** (discovery §2)                                                                                |
| 18  | error_user              | Sorting fires the alert "Sorting is broken! This error has been reported to Backtrace." and does nothing                                                                                      | **Documented**, message captured verbatim                                                                    |
| 19  | error_user              | **Finish is a no-op** (`TypeError: ai.cesetRart is not a function`) — this user can never complete a purchase, and the Last Name crash is masked by a validation bypass (two defects stacked) | **Pinned by WEB-032** (positive form: the URL provably stays on the overview after Finish)                   |
| 20  | visual_user             | Inventory prices randomized per page load (`$95.2` shows a one-decimal formatting bug); detail page disagrees with the listing                                                                | **Documented**; kills screenshot testing by design (TEST_PLAN §1)                                            |
| 21  | visual_user             | Backpack image is the 404-dog; Test.allTheThings() button carries `btn_inventory_misaligned`; cart icon displaced (668,39 vs 854,10)                                                          | **Documented**; planned pin WEB-026 for the class hook                                                       |

## How the defect pins work

[tests/web/known-defects.spec.ts](../tests/web/known-defects.spec.ts) (WEB-031,
WEB-032, WEB-033) pins three defects in **positive form**: each test asserts the
defective behaviour precisely — the badge provably does _not_ change after clicking
the dead button, the URL provably _stays_ on the overview after Finish, the typed
last name provably lands in the first-name field. Each test therefore **passes
while its defect exists** and **fails red** the moment the site fixes that defect
— or the moment anything else breaks: a rotted selector, a removed account, an
outage. Red always means "go look"; green always means "the pinned defect is still
exactly as documented."

That alarm design took three attempts, each caught by review (AI_EVALUATION_LOG
entries 11 and 13): `test.fixme` never ran anything; `test.fail` ran the flow but
turned _every_ failure mode — including selector rot — into green, alarming only on
total success. A suite that goes green against a deliberately broken user is not
testing anything; the positive pins are the form in which that sentence is actually
true.

### The original flow failures (verbatim, from the test.fail era)

These runs are what located the pinned defects; kept as evidence of where each
user's flow actually dies.

`problem_user` — failed while building the basket (defect 13):

```
Error: expect(locator).toHaveText(expected) failed
Locator:  locator('[data-test="shopping-cart-badge"]')
Expected: "2"
Received: "1"
  14 × locator resolved to <span class="shopping_cart_badge" data-test="shopping-cart-badge">1</span>
```

`error_user` — sailed through the whole checkout, then failed on the last click
(defect 19):

```
Error: expect(page).toHaveURL(expected) failed
Expected: "https://www.saucedemo.com/checkout-complete.html"
Received: "https://www.saucedemo.com/checkout-step-two.html"
```

### One pin per defect, and why

A broken-flow test is fail-fast: it can only ever surface the first defect on its
path, and stacked defects hide behind each other — error_user's Last Name crash is
concealed by its own validation bypass, one defect masking another. Pinning each
defect in its own test means each pin flips independently when its defect is fixed.
The register above marks the remaining deliberate defects **Documented**; those are
what the still-unimplemented narrow pins (WEB-024..026) would close.
