Write the cart and checkout tests.

Cart:
- Cart shows exactly the added items with correct names, descriptions, prices, quantities.
- Remove from cart updates both the list and the badge.
- Continue Shopping returns to inventory with the cart intact.
- Empty cart still allows checkout to start — assert the real behaviour you observed.

Checkout:
- Each required field, missing in turn, produces its own specific error message.
- Cancel from step one returns to the cart.
- Step two shows correct item totals, tax, and grand total. Compute the expected values in
  the test from the item prices and the tax constant rather than hardcoding a total, so
  the test still holds if the basket changes.
- Cancel from step two returns to inventory.
- Finish shows the confirmation and empties the cart.

End-to-end:
- One complete purchase journey, login through order confirmation, asserting the key state
  transition at each step rather than only at the end. Tag it @smoke.

Then add a small, clearly separated defect-detection suite:
- Run the core purchase flow as `problem_user` and as `error_user`.
- These are known-broken accounts. Write the tests to assert *correct* behaviour, let them
  fail, and then document in `docs/KNOWN_DEFECTS.md` exactly which defects the suite
  catches and which it misses.
- Mark them with `test.fixme()` or a dedicated `@known-defect` tag so the main suite stays
  green, and explain in a comment why they exist.

The point of that last part is to prove the suite has teeth. A suite that goes green
against a deliberately broken user is not testing anything. Say so in the doc.

Run everything. Show me the output. Then commit and push.
