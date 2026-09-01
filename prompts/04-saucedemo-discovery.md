This is the step that separates a real submission from a generated one. Don't rush it.

```
Explore https://www.saucedemo.com/ with the Playwright MCP browser. Write no test code in
this step. The output is a document.

Investigate and record:

1. The login page. Every input, button, and the accepted-usernames panel. Capture the
   exact attributes used for selectors.
2. Log in as each of the six users listed on the page and record exactly what differs:
   which succeed, which fail, what breaks, how slow they are. Be specific — "images are
   wrong" is not enough, say which images and what they're replaced with.
3. As standard_user, walk the entire happy path: inventory -> product detail -> add to
   cart -> cart -> checkout step one -> checkout step two -> checkout complete. Snapshot
   each page.
4. Record the full product catalogue: every name, price, and description, exactly as
   shown.
5. Record every sort option in the sort dropdown, its underlying value, and the exact
   order the products end up in for each one.
6. Record the cart badge behaviour: when it appears, disappears, what it counts, whether
   it survives navigation and logout.
7. Checkout step one: submit it empty, then with each field missing in turn. Record the
   verbatim error message text for every case.
8. Checkout step two: record the item total, tax, and grand total for a known basket.
   Work out the tax rate and confirm it against a second, different basket.
9. The burger menu: every item and what each one does, including Reset App State.
10. Anything that looks like a deliberate bug or an inconsistency, including URL
    behaviour when you navigate directly to a page while logged out.

Write it all to `docs/discovery/saucedemo-discovery.md`, including a selector table with
columns: Page | Element | Selector | Verified via MCP (yes/no) | Notes.

Rules for this document:
- Every selector must be one you actually saw in the accessibility tree or DOM during this
  session. If you did not verify it, do not write it down.
- If you recall something from training data that you could not confirm on the live site,
  put it in a clearly separated "Unverified — do not build on this" section.
- Be gentle with the site. It's a shared public demo. Don't hammer it.

Then commit and push.
```
