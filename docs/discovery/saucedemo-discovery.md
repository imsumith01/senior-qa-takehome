# saucedemo.com discovery notes

Recorded 2026-09-01 from a live exploration session against https://www.saucedemo.com/
using the Playwright MCP browser (`@playwright/mcp` 0.0.80, Chromium). Every selector,
attribute, message, price, and behaviour in the main body of this document was observed
directly in the accessibility tree or DOM during this session. Anything remembered but
not confirmed live is quarantined in the final section, "Unverified — do not build on
this".

## Method and one environment caveat

Investigation used accessibility snapshots, DOM attribute dumps via `page.evaluate`,
Playwright `fill()` for inputs, and `selectOption()` for the sort dropdown.

Caveat that matters when reading this document: in this MCP session, **real synthetic
mouse clicks intermittently never reached the page at all**. An instrumented
`document.addEventListener` capture recorded zero pointer/mouse/click events during
several `locator.click()` calls that Playwright reported as successful, on two separate
browser sessions, while the same buttons responded normally to DOM-level
`element.click()`. Login-page clicks mostly worked; post-login pages mostly dropped
events; one login click also dropped. Because of that, all interactions below were
driven by `element.click()` inside `page.evaluate`. React's handlers do not distinguish
trusted from untrusted events, so the _site behaviour_ recorded here is unaffected —
but the committed test suite must use ordinary Playwright clicks and will re-verify
that path itself. This is judged to be a quirk of the MCP browser environment, not a
site bug (the same flows are exercised by ordinary Playwright clicks industry-wide).

Timing was measured with wall-clock time around `waitForURL` in the Playwright server
process, because two earlier measurement attempts produced garbage — see
`docs/AI_EVALUATION_LOG.md` for both dead ends (back/forward cache invalidated
`performance` navigation timing entirely).

The site was treated gently: one browser at a time, sequential steps, cart emptied and
session logged out at the end (`Reset App State` + `Logout`).

## 1. Login page

URL `https://www.saucedemo.com/`, document title `Swag Labs`.

| Element                | Tag      | Attributes observed                                                                                                                          |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Username input         | `input`  | `id="user-name"`, `name="user-name"`, `data-test="username"`, `placeholder="Username"`, `type="text"`, `class="input_error form_input"`      |
| Password input         | `input`  | `id="password"`, `name="password"`, `data-test="password"`, `placeholder="Password"`, `type="password"`, `class="input_error form_input"`    |
| Login button           | `input`  | `id="login-button"`, `name="login-button"`, `data-test="login-button"`, `type="submit"`, `value="Login"`, `class="submit-button btn_action"` |
| Error banner container | `div`    | `class="error-message-container"` (gains class `error` when showing)                                                                         |
| Error message          | `h3`     | `data-test="error"` (only present while an error is showing)                                                                                 |
| Error dismiss button   | `button` | `data-test="error-button"`, `class="error-button"` — removes the banner (verified)                                                           |
| Credentials panel      | `div`    | `id="login_credentials"`, `data-test="login-credentials"`                                                                                    |
| Password panel         | `div`    | `class="login_password"`, `data-test="login-password"`                                                                                       |
| Outer containers       | `div`    | `data-test="login-container"`, `data-test="login-credentials-container"`                                                                     |

The credentials panel lists exactly six usernames: `standard_user`,
`locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`,
`visual_user`. The password panel reads "Password for all users:" / `secret_sauce`.
In the accessibility tree the six usernames render as one unbroken text run
(`standard_userlocked_out_user…`) because they are separated only by `<br>`-style
layout, not list markup.

Login error messages, all captured verbatim this session:

| Case                                | Verbatim error                                                              |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Both fields empty                   | `Epic sadface: Username is required`                                        |
| Username filled, password empty     | `Epic sadface: Password is required`                                        |
| Username empty, password filled     | `Epic sadface: Username is required`                                        |
| Wrong password for a real user      | `Epic sadface: Username and password do not match any user in this service` |
| `locked_out_user`, correct password | `Epic sadface: Sorry, this user has been locked out.`                       |

When an error shows, both inputs gain the `error` class and an `svg.error_icon`
appears inside each field wrapper (2 icons on the login form).

## 2. The six users, compared

| User                      | Login          | What differs (all observed)                                                                                                                                                                                                                                                                   |
| ------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `standard_user`           | succeeds       | Baseline. Everything in sections 3–9 was recorded as this user.                                                                                                                                                                                                                               |
| `locked_out_user`         | blocked        | Stays on `/`; `h3[data-test="error"]` reads `Epic sadface: Sorry, this user has been locked out.`                                                                                                                                                                                             |
| `problem_user`            | succeeds       | See per-user detail below.                                                                                                                                                                                                                                                                    |
| `performance_glitch_user` | succeeds, slow | Login click → inventory rendered took **5019 ms**, versus **21 ms** for `standard_user` measured through the identical instrumented path moments later. The delay happens before navigation starts (the document itself then loads in ~100 ms). Only login was timed; other actions untested. |
| `error_user`              | succeeds       | See per-user detail below.                                                                                                                                                                                                                                                                    |
| `visual_user`             | succeeds       | See per-user detail below.                                                                                                                                                                                                                                                                    |

### problem_user detail

- Every one of the six inventory images is replaced by the same file:
  `/assets/sl-404-Cq1a9k9X.jpg` (a dog photo used as the 404 image). Under
  `standard_user` each product has its own distinct image (listed in section 4).
- Sorting is a silent no-op: selecting `Name (Z to A)` leaves the order exactly
  `Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings()` —
  the A-to-Z order. No error, no alert.
- Add to cart works for only three products: Backpack (id 4), Bike Light (id 0), and
  Onesie (id 2). Clicking the buttons for Bolt T-Shirt, Fleece Jacket, and
  Test.allTheThings() changes nothing — `cart-contents` stayed `[4,0]` and `[4,0,2]`
  through those clicks, silently, and those buttons never flip to "Remove".
- Product title links navigate to the wrong product: clicking `#item_4_title_link`
  (Sauce Labs Backpack) opened `/inventory-item.html?id=5` showing Sauce Labs Fleece
  Jacket, with the correct fleece image on the detail page.
- Checkout step one, filling First Name `FIRSTNAME` then Last Name `LASTNAME` then
  Postal Code `99999` left the fields as: firstName=`LASTNAME`, lastName=`` (empty),
  postalCode=`99999`. Typing into Last Name lands in First Name. Submit was not
  attempted for this user in this session.

### error_user detail

- Product images are the normal, correct six images.
- Selecting a sort option leaves the order unchanged and fires a JavaScript `alert`
  with the verbatim text: `Sorting is broken! This error has been reported to
Backtrace.`
- Add to cart splits exactly like problem_user — Backpack, Bike Light, Onesie work;
  Bolt, Fleece, Test.allTheThings() fail — but loudly instead of silently: each broken
  click throws an uncaught `Error: Failed to add item to the cart.` to the console.
- Remove is broken: clicking Remove for the Backpack left `cart-contents` at
  `[4,0,2]` and threw `Error: Failed to remove item from cart.`
- Checkout step one: the Last Name field's `onChange` handler throws
  `TypeError: Cannot read properties of undefined (reading 'value')`, so the typed
  value never sticks (DOM value read back empty after `fill('LASTNAME')`). Despite the
  empty Last Name, Continue navigated to step two with no validation error — the
  required-field check that blocks `standard_user` is bypassed.
- Step two totals were arithmetically correct for the basket `[4,0,2]`:
  `Item total: $47.97`, `Tax: $3.84`, `Total: $51.81` (8% again).
- Finish is a no-op: the URL stayed on `/checkout-step-two.html` and the console
  showed `TypeError: ai.cesetRart is not a function` (a scrambled `resetCart`). This
  user can never complete an order.

### visual_user detail

- Inventory prices are randomized on every page load. First load:
  Backpack `$35.56`, Bike Light `$95.2`, Bolt `$14.41`, Fleece `$38.78`, Onesie
  `$6.09`, Test.allTheThings() `$12.24`. After one reload: `$23.49`, `$5.28`,
  `$62.11`, `$86.09`, `$9.87`, `$61.02`. Note `$95.2` — one decimal place, a price
  formatting bug on top of the wrong values.
- The Backpack's product detail page (`/inventory-item.html?id=4`) simultaneously
  showed the correct `$29.99` and the correct backpack image — listing and detail
  disagree.
- The Backpack inventory image is the 404 dog (`/assets/sl-404-Cq1a9k9X.jpg`); the
  other five images are correct.
- The Test.allTheThings() add-to-cart button carries an extra class,
  `btn_inventory_misaligned` (absent for `standard_user`) — the CSS hook for its
  skewed rendering, detectable from the DOM.
- The shopping cart icon is displaced: its bounding box origin was (668, 39) for
  `visual_user` versus (854, 10) for `standard_user` at the same 929 px viewport.
- Burger menu container style and position were identical to `standard_user`.

## 3. Happy path walkthrough (standard_user)

Snapshots were captured at every stage (accessibility-tree YAML via MCP). URLs and
state transitions observed:

1. **Login** `/` → submit valid credentials → full navigation to `/inventory.html`.
   A cookie `session-username=standard_user` is set. First full document load measured
   at 352 ms.
2. **Inventory** `/inventory.html` — title `Products`. Six `.inventory_item` cards,
   each with image link, title link, description, price, and an Add to cart button.
   Header: burger menu, "Swag Labs" logo, cart link, sort dropdown. Footer: Twitter /
   Facebook / LinkedIn links and `© 2026 Sauce Labs. All Rights Reserved. Terms of
Service | Privacy Policy`.
3. **Product detail** — title links navigate client-side to
   `/inventory-item.html?id=4` (Backpack verified; id 5 = Fleece verified via the
   problem_user wrong-link bug). Page shows one product with `data-test`
   `inventory-item-name` / `inventory-item-desc` / `inventory-item-price`, a
   `#back-to-products` "Back to products" button, and a single generic
   `#add-to-cart` / `#remove` button (unlike the per-product ids on the inventory
   page).
4. **Add to cart** (from detail page) — `localStorage["cart-contents"]` became `[4]`;
   badge `span[data-test="shopping-cart-badge"]` appeared with text `1`; the button
   re-rendered as Remove. Added Bike Light from the inventory page later:
   `cart-contents` `[4,0]`, badge `2`.
5. **Cart** `/cart.html` — title `Your Cart`. Column headers QTY / Description. Each
   `.cart_item` (`data-test="inventory-item"`) shows `data-test="item-quantity"` = 1,
   name, description, price, and a per-product Remove button. Footer buttons:
   `#continue-shopping` and `#checkout`. The badge (`2`) survived this full page
   navigation.
6. **Checkout step one** `/checkout-step-one.html` — title
   `Checkout: Your Information`. Three inputs (First Name, Last Name, Zip/Postal
   Code), `#cancel` and `#continue`. Validation detailed in section 7.
7. **Checkout step two** `/checkout-step-two.html` — title `Checkout: Overview`.
   Line items repeat the cart rows. Summary block, all verbatim:
   `Payment Information:` / `SauceCard #31337`, `Shipping Information:` /
   `Free Pony Express Delivery!`, `Price Total` /
   `Item total: $39.98` / `Tax: $3.20` / `Total: $43.18`. Buttons `#cancel` and
   `#finish`. Cancel from here returns to `/inventory.html` (verified), not to the
   cart.
8. **Checkout complete** `/checkout-complete.html` — title `Checkout: Complete!`.
   `data-test="complete-header"`: `Thank you for your order!`;
   `data-test="complete-text"`: `Your order has been dispatched, and will arrive just
as fast as the pony can get there!`; an image `alt="Pony Express"` whose file is
   actually `/assets/checkmark-VLWQafip.png`; a `Back Home` button reusing the id
   `#back-to-products`. After Finish, the badge is gone and
   `localStorage["cart-contents"]` is removed.

## 4. Product catalogue (exact, as shown for standard_user)

Item ids come from the `item_{N}_img_link` / `item_{N}_title_link` element ids and,
for 4 and 5, were confirmed against `?id=` detail navigation.

| id  | Name                              | Price  | Image file                                      | Description (verbatim)                                                                                                                                                 |
| --- | --------------------------------- | ------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | Sauce Labs Backpack               | $29.99 | `/assets/sauce-backpack-1200x1500-CjRW-Djj.jpg` | carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.                                 |
| 0   | Sauce Labs Bike Light             | $9.99  | `/assets/bike-light-1200x1500-DxcZRFOA.jpg`     | A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.        |
| 1   | Sauce Labs Bolt T-Shirt           | $15.99 | `/assets/bolt-shirt-1200x1500-mR0ldpVS.jpg`     | Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.                        |
| 5   | Sauce Labs Fleece Jacket          | $49.99 | `/assets/sauce-pullover-1200x1500-BfbI-PSd.jpg` | It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office. |
| 2   | Sauce Labs Onesie                 | $7.99  | `/assets/red-onesie-1200x1500-BrSuq0ic.jpg`     | Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.        |
| 3   | Test.allTheThings() T-Shirt (Red) | $15.99 | `/assets/red-tatt-1200x1500-E-qp6aYf.jpg`       | This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.              |

Note the ids do not follow display order: A-to-Z display is 4, 0, 1, 5, 2, 3.

## 5. Sort options and resulting orders

`select.product_sort_container` (`data-test="product-sort-container"`); the visible
current choice is mirrored in `span.active_option`. Options and observed results:

| Option text         | value          | Resulting order (names, with prices)                                                                                   |
| ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Name (A to Z)       | `az` (default) | Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() $15.99 |
| Name (Z to A)       | `za`           | Test.allTheThings() $15.99, Onesie $7.99, Fleece Jacket $49.99, Bolt T-Shirt $15.99, Bike Light $9.99, Backpack $29.99 |
| Price (low to high) | `lohi`         | Onesie $7.99, Bike Light $9.99, Bolt T-Shirt $15.99, Test.allTheThings() $15.99, Backpack $29.99, Fleece Jacket $49.99 |
| Price (high to low) | `hilo`         | Fleece Jacket $49.99, Backpack $29.99, Bolt T-Shirt $15.99, Test.allTheThings() $15.99, Bike Light $9.99, Onesie $7.99 |

Tie caution: the two $15.99 shirts appeared as Bolt-then-Test.allTheThings() in both
price sorts _in this session_, but nothing guarantees that tie order. Tests should
assert price monotonicity (and set membership), not exact positions of tied items.

## 6. Cart badge behaviour

- The badge is `span.shopping_cart_badge` (`data-test="shopping-cart-badge"`) inside
  `a.shopping_cart_link` (`data-test="shopping-cart-link"`). The link itself has no
  accessible name and does not appear as a named node in the accessibility tree.
- Absent entirely when the cart is empty; appears with text `1` on the first add.
- It counts cart line items. Quantity per line is always 1 — no UI was found that
  increases quantity, and adding the same product twice is impossible because its
  button becomes Remove.
- Backing state is `localStorage["cart-contents"]`, a JSON array of item ids in
  insertion order (observed `[4]`, `[4,0]`, `[5]`, `[4,0,2]`).
- Survives full page navigations (observed across `goto` to `/cart.html` and others).
- Survives logout and re-login: logging out cleared the `session-username` cookie but
  left `cart-contents` at `[5]`; logging back in as `standard_user` showed badge `1`
  and the Fleece button still as Remove.
- Cleared by completing checkout (Finish) and by Reset App State. Both remove the
  localStorage key and the badge.

## 7. Checkout step one validation (verbatim)

Submitting via Continue with various field states. Priority is first-name, then
last-name, then postal code; exactly one message shows at a time, in
`h3[data-test="error"]`:

| First Name | Last Name | Postal Code | Verbatim error                   |
| ---------- | --------- | ----------- | -------------------------------- |
| empty      | empty     | empty       | `Error: First Name is required`  |
| empty      | filled    | filled      | `Error: First Name is required`  |
| filled     | empty     | filled      | `Error: Last Name is required`   |
| filled     | filled    | empty       | `Error: Postal Code is required` |

With all three filled, Continue navigates to `/checkout-step-two.html`. On error, all
three inputs gain the `error` class and three `svg.error_icon` elements appear
(regardless of which single field is missing).

One measurement note: an earlier attempt at the "missing last name" case appeared to
pass validation with an empty field. That turned out to be this environment dropping
the `fill('')` input event (React state kept the old value while the DOM showed
empty). The table above is from re-runs whose field values were read back and
confirmed immediately before each submit. `docs/AI_EVALUATION_LOG.md` has the full
story — and the same dropped-event mechanism is why `error_user`'s genuinely broken
Last Name field (section 2) must not be confused with this artefact.

## 8. Totals and tax rate

Observed on `/checkout-step-two.html`, all verbatim:

| Basket                                      | Item total           | Tax          | Total           |
| ------------------------------------------- | -------------------- | ------------ | --------------- |
| Backpack + Bike Light (standard_user)       | `Item total: $39.98` | `Tax: $3.20` | `Total: $43.18` |
| Fleece Jacket alone (standard_user)         | `Item total: $49.99` | `Tax: $4.00` | `Total: $53.99` |
| Backpack + Bike Light + Onesie (error_user) | `Item total: $47.97` | `Tax: $3.84` | `Total: $51.81` |

All three fit tax = 8% of the item total, rounded up to the cent at the observed
values (39.98 × 0.08 = 3.1984 → 3.20; 49.99 × 0.08 = 3.9992 → 4.00;
47.97 × 0.08 = 3.8376 → 3.84). Because every catalogue price ends in .99, every
reachable tax fraction rounds upward, so ordinary half-up rounding and ceiling are
indistinguishable from live observation. Tests should compute
`round(subtotal * 0.08)` to 2 decimals, which matches all observed values.

## 9. Burger menu

Implemented with react-burger-menu. Open: `#react-burger-menu-btn` (button, inside
`div.bm-burger-button` which carries inline `z-index: 1000`). Close:
`#react-burger-cross-btn`. The drawer `div.bm-menu-wrap` toggles
`aria-hidden="true"` when closed. The four links exist in the DOM even while the menu
is closed:

| Item            | Selector                                                         | Observed behaviour                                                                                                                                                                                                         |
| --------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All Items       | `#inventory_sidebar_link` (`data-test="inventory-sidebar-link"`) | Client-side navigation to the inventory list.                                                                                                                                                                              |
| About           | `#about_sidebar_link` (`data-test="about-sidebar-link"`)         | `href="https://saucelabs.com/"` — external link. href read from DOM; not followed in this session.                                                                                                                         |
| Logout          | `#logout_sidebar_link` (`data-test="logout-sidebar-link"`)       | Returns to `/`; clears the `session-username` cookie; leaves `cart-contents` in localStorage (section 6).                                                                                                                  |
| Reset App State | `#reset_sidebar_link` (`data-test="reset-sidebar-link"`)         | Removes `cart-contents` and the badge immediately — but inventory buttons already rendered as "Remove" keep saying "Remove" until the next reload (observed: fleece button stale after reset, correct again after reload). |

## 10. Deliberate bugs and inconsistencies (all observed, except where flagged)

1. **Logged-out URL guard**: navigating directly to a protected page while logged out
   redirects to `/` with a verbatim error that interpolates the path.
   Verified for two pages:
   `Epic sadface: You can only access '/inventory.html' when you are logged in.` and
   `Epic sadface: You can only access '/checkout-complete.html' when you are logged
in.` (Other protected pages presumably follow the pattern — unverified.)
2. **Reset App State leaves stale button state** (section 9) — cart is emptied but
   rendered Remove buttons stay until re-render.
3. **Cart persists across logout** (section 6) — `cart-contents` is not cleared on
   logout and is not namespaced by user.
4. **`data-test` naming is inconsistent**: checkout inputs use camelCase
   (`firstName`, `lastName`, `postalCode`) while everything else on the site uses
   kebab-case (`login-button`, `shopping-cart-badge`, …).
5. **Duplicate id across pages**: `#back-to-products` is both "Back to products" on
   the product detail page and "Back Home" on the order-complete page.
6. **Button id scheme changes between pages**: per-product
   `#add-to-cart-sauce-labs-backpack` on the list page vs generic `#add-to-cart` /
   `#remove` on the detail page.
7. **Selector-hostile ids**: the sixth product's controls are
   `add-to-cart-test.allthethings()-t-shirt-(red)` — dots and parentheses make raw
   `#id` CSS selectors invalid without escaping. Attribute selectors
   (`[data-test="..."]`) are the safe form.
8. **Item ids don't match display order** (section 4): A-to-Z shows ids 4, 0, 1, 5,
   2, 3 — relevant when mapping list rows to `?id=` URLs.
9. **Console noise on every page**: Backtrace telemetry fails constantly — 401s to
   `events.backtrace.io` with literal placeholder credentials (`universe=UNIVERSE&
token=TOKEN`) and CORS failures to `submit.backtrace.io/UNIVERSE/TOKEN/json`. A
   "no console errors" assertion is impossible site-wide without filtering these.
10. **error_user validation bypass**: reaches checkout step two with an empty Last
    Name (section 2) — the required-field rule enforced for standard_user is skipped.
11. **error_user cannot finish an order**: Finish throws
    `TypeError: ai.cesetRart is not a function` and stays on step two.
12. **problem_user title links open the wrong product** (`item_4_title_link` →
    `?id=5`).
13. **visual_user prices are random per page load and disagree with the detail
    page**; `$95.2` also shows a one-decimal formatting bug.
14. **Price-sort tie order is unspecified** for the two $15.99 shirts (section 5).
15. **Accessibility gaps**: the cart link has no accessible name; the six usernames
    render as a single unbroken text run; the login inputs lack `autocomplete`
    attributes (Chrome logs a suggestion for `current-password`).
16. **An empty cart can be checked out end to end** (observed in a follow-up session
    on 2026-09-01, closing the gap the original session left): with zero items,
    Checkout opens step one, valid details reach step two showing zero line items
    with `Item total: $0`, `Tax: $0.00`, `Total: $0.00`, and Finish lands on the
    normal "Thank you for your order!" page. Two defects in one: a $0 order is
    accepted, and the empty subtotal drops its decimal places (`$0`, not `$0.00`)
    while Tax and Total keep theirs.

## Session and state storage (how the app remembers things)

- Auth: cookie `session-username=<username>` (no token, plain username). Deleted on
  logout.
- Cart: `localStorage["cart-contents"]` = JSON array of item ids, e.g. `[4,0,2]`.
  Removed on order completion and Reset App State; kept on logout.
- Telemetry: `localStorage["backtrace-guid"]`, `localStorage["backtrace-last-active"]`.

## Selector table

All selectors below were observed in the DOM/accessibility tree this session.
Preferred form is the `data-test` attribute where one exists.

| Page                         | Element                  | Selector                                                                   | Verified via MCP | Notes                                                                                                                                            |
| ---------------------------- | ------------------------ | -------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login                        | Username input           | `[data-test="username"]`                                                   | yes              | also `#user-name`                                                                                                                                |
| Login                        | Password input           | `[data-test="password"]`                                                   | yes              | also `#password`                                                                                                                                 |
| Login                        | Login button             | `[data-test="login-button"]`                                               | yes              | `<input type="submit">`, not `<button>`                                                                                                          |
| Login                        | Error message            | `[data-test="error"]`                                                      | yes              | `h3`; only in DOM while error shows; same selector on checkout step one                                                                          |
| Login                        | Error dismiss            | `[data-test="error-button"]`                                               | yes              | removes the banner                                                                                                                               |
| Login                        | Accepted usernames panel | `[data-test="login-credentials"]`                                          | yes              | also `#login_credentials`                                                                                                                        |
| Login                        | Password panel           | `[data-test="login-password"]`                                             | yes              | class `login_password`                                                                                                                           |
| Header (all logged-in pages) | Burger open              | `#react-burger-menu-btn`                                                   | yes              | no data-test                                                                                                                                     |
| Header                       | Burger close             | `#react-burger-cross-btn`                                                  | yes              | no data-test                                                                                                                                     |
| Header                       | Menu drawer              | `.bm-menu-wrap`                                                            | yes              | `aria-hidden="true"` when closed                                                                                                                 |
| Header                       | Menu: All Items          | `[data-test="inventory-sidebar-link"]`                                     | yes              | also `#inventory_sidebar_link`                                                                                                                   |
| Header                       | Menu: About              | `[data-test="about-sidebar-link"]`                                         | yes              | href `https://saucelabs.com/`                                                                                                                    |
| Header                       | Menu: Logout             | `[data-test="logout-sidebar-link"]`                                        | yes              | also `#logout_sidebar_link`                                                                                                                      |
| Header                       | Menu: Reset App State    | `[data-test="reset-sidebar-link"]`                                         | yes              | also `#reset_sidebar_link`                                                                                                                       |
| Header                       | Cart link                | `[data-test="shopping-cart-link"]`                                         | yes              | no accessible name; class `shopping_cart_link`                                                                                                   |
| Header                       | Cart badge               | `[data-test="shopping-cart-badge"]`                                        | yes              | absent when cart empty                                                                                                                           |
| Header                       | Page title               | `[data-test="title"]`                                                      | yes              | `Products` / `Your Cart` / `Checkout: …`                                                                                                         |
| Inventory                    | Item card                | `.inventory_item`                                                          | yes              | class only on the list page                                                                                                                      |
| Inventory                    | Item name                | `.inventory_item_name`                                                     | yes              | text node inside the title link                                                                                                                  |
| Inventory                    | Item description         | `.inventory_item_desc`                                                     | yes              |                                                                                                                                                  |
| Inventory                    | Item price               | `.inventory_item_price`                                                    | yes              |                                                                                                                                                  |
| Inventory                    | Item image               | `img.inventory_item_img`                                                   | yes              | per-product `data-test="inventory-item-sauce-labs-backpack-img"` etc.                                                                            |
| Inventory                    | Title link (per item)    | `[data-test="item-4-title-link"]`                                          | yes              | N = item id, section 4; also `#item_4_title_link`                                                                                                |
| Inventory                    | Add to cart (per item)   | `[data-test="add-to-cart-sauce-labs-backpack"]`                            | yes              | kebab-cased product name; sixth product needs the attribute form (note 7)                                                                        |
| Inventory                    | Remove (per item)        | `[data-test="remove-sauce-labs-backpack"]`                                 | yes              | appears after adding                                                                                                                             |
| Inventory                    | Sort dropdown            | `[data-test="product-sort-container"]`                                     | yes              | `<select>`; values `az`, `za`, `lohi`, `hilo`                                                                                                    |
| Inventory                    | Active sort label        | `.active_option`                                                           | yes              | mirrors selection                                                                                                                                |
| Product detail               | Container                | `[data-test="inventory-item"]`                                             | yes              | class `inventory_details_container`                                                                                                              |
| Product detail               | Name                     | `[data-test="inventory-item-name"]`                                        | yes              | class `inventory_details_name`                                                                                                                   |
| Product detail               | Description              | `[data-test="inventory-item-desc"]`                                        | yes              |                                                                                                                                                  |
| Product detail               | Price                    | `[data-test="inventory-item-price"]`                                       | yes              |                                                                                                                                                  |
| Product detail               | Image                    | `[data-test="item-sauce-labs-backpack-img"]`                               | yes              | per-product                                                                                                                                      |
| Product detail               | Add to cart              | `[data-test="add-to-cart"]`                                                | yes              | generic here, unlike list page                                                                                                                   |
| Product detail               | Remove                   | `[data-test="remove"]`                                                     | yes              | generic; appears after adding. Verified in a follow-up session 2026-09-01 — the original session wrote it from inference (see AI_EVALUATION_LOG) |
| Product detail               | Back to products         | `[data-test="back-to-products"]`                                           | yes              | id `#back-to-products`                                                                                                                           |
| Cart                         | List                     | `[data-test="cart-list"]`                                                  | yes              |                                                                                                                                                  |
| Cart                         | Row                      | `[data-test="inventory-item"]`                                             | yes              | class `cart_item`; same data-test as detail container                                                                                            |
| Cart                         | Quantity                 | `[data-test="item-quantity"]`                                              | yes              | always `1`                                                                                                                                       |
| Cart                         | Row name / price         | `[data-test="inventory-item-name"]` / `[data-test="inventory-item-price"]` | yes              | same data-tests as detail page                                                                                                                   |
| Cart                         | Row description          | `[data-test="inventory-item-desc"]`                                        | yes              | verified in a follow-up session 2026-09-01                                                                                                       |
| Cart                         | Remove (per item)        | `[data-test="remove-sauce-labs-backpack"]`                                 | yes              | same scheme as inventory                                                                                                                         |
| Cart                         | Continue Shopping        | `[data-test="continue-shopping"]`                                          | yes              |                                                                                                                                                  |
| Cart                         | Checkout                 | `[data-test="checkout"]`                                                   | yes              |                                                                                                                                                  |
| Checkout step one            | First Name               | `[data-test="firstName"]`                                                  | yes              | camelCase; id `#first-name`                                                                                                                      |
| Checkout step one            | Last Name                | `[data-test="lastName"]`                                                   | yes              | camelCase; id `#last-name`                                                                                                                       |
| Checkout step one            | Postal Code              | `[data-test="postalCode"]`                                                 | yes              | camelCase; id `#postal-code`, placeholder `Zip/Postal Code`                                                                                      |
| Checkout step one            | Continue                 | `[data-test="continue"]`                                                   | yes              | `<input type="submit">`                                                                                                                          |
| Checkout step one            | Cancel                   | `[data-test="cancel"]`                                                     | yes              | returns to cart page                                                                                                                             |
| Checkout step two            | Payment info             | `[data-test="payment-info-value"]`                                         | yes              | `SauceCard #31337`                                                                                                                               |
| Checkout step two            | Shipping info            | `[data-test="shipping-info-value"]`                                        | yes              | `Free Pony Express Delivery!`                                                                                                                    |
| Checkout step two            | Item total               | `[data-test="subtotal-label"]`                                             | yes              | text `Item total: $…`                                                                                                                            |
| Checkout step two            | Tax                      | `[data-test="tax-label"]`                                                  | yes              | text `Tax: $…`                                                                                                                                   |
| Checkout step two            | Total                    | `[data-test="total-label"]`                                                | yes              | text `Total: $…`                                                                                                                                 |
| Checkout step two            | Finish                   | `[data-test="finish"]`                                                     | yes              |                                                                                                                                                  |
| Checkout step two            | Cancel                   | `[data-test="cancel"]`                                                     | yes              | goes to inventory, not cart                                                                                                                      |
| Checkout complete            | Header                   | `[data-test="complete-header"]`                                            | yes              | `Thank you for your order!`                                                                                                                      |
| Checkout complete            | Body text                | `[data-test="complete-text"]`                                              | yes              | pony dispatch sentence, section 3                                                                                                                |
| Checkout complete            | Image                    | `[data-test="pony-express"]`                                               | yes              | file is `checkmark-VLWQafip.png`                                                                                                                 |
| Checkout complete            | Back Home                | `[data-test="back-to-products"]`                                           | yes              | duplicate id with detail page                                                                                                                    |

## Unverified — do not build on this

Everything here is either remembered from training data or inferred, and was NOT
confirmed live this session. Verify before relying on any of it.

- The logged-out guard for `/cart.html`, `/checkout-step-one.html`, and
  `/checkout-step-two.html`. Only `/inventory.html` and `/checkout-complete.html`
  were hit; the interpolated-path pattern presumably covers the rest.
- That the About link actually loads saucelabs.com when clicked (only the `href` was
  read; the link was never followed).
- Cross-user cart leakage: `cart-contents` is not namespaced by user, so a cart added
  by one user should appear for the next user logging in on the same browser —
  inferred from the storage design, never observed with two different users.
- `performance_glitch_user`: whether the ~5 s delay affects in-app navigation and
  sorting, or only login. Only login was measured.
- `problem_user` checkout submission behaviour (what happens on Continue after the
  field-mirroring) — not attempted.
- Item id ↔ product mapping for ids 0, 1, 2, 3 rests on the `item_N_img_link`
  element ids only; detail navigation was confirmed for ids 4 and 5.
- ~~Whether ordinary trusted Playwright clicks behave correctly against this site in a
  normal (non-MCP) environment.~~ **Resolved 2026-09-01**: the committed web suite
  (22 tests under plain `@playwright/test`, all clicking normally) passed end to end,
  confirming the dropped-input behaviour was an MCP-environment quirk, not site
  behaviour.
- Login as the same user in two tabs, deep-linking to `/inventory-item.html?id=…`
  while logged out, and invalid `?id=` values (e.g. `?id=99`) were not explored at
  all.
