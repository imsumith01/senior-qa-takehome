Write the authentication and inventory tests from the test plan. Use the fixtures and page
objects — no raw selectors in test files.

Authentication:
- Successful login lands on the inventory page with products visible.
- Locked-out user is rejected with the exact error text you captured in discovery.
- Wrong password is rejected.
- Empty username and empty password each produce their own specific error.
- Error banner can be dismissed.
- Direct navigation to /inventory.html while logged out redirects or errors — assert the
  actual observed behaviour, not the behaviour you'd hope for.
- Logout returns to login and the session does not survive a back-button press.

Inventory:
- All six products render with a name, description, price, and image.
- Product names and prices match the catalogue captured in discovery.
- Each sort option produces the correct order. Assert the actual order of the rendered
  list, not just that the dropdown value changed.
- Add to cart flips the button to Remove and increments the badge.
- Remove decrements it.
- Clicking a product name opens the correct detail page.
- Cart contents survive navigation between inventory and detail pages.

Requirements:
- Every test independent. No test depends on another having run. Verify by running the
  file with `--shuffle`.
- Tag each test per the plan.
- Reference the test plan ID in a comment above each test.
- Arrange / Act / Assert with blank lines between the sections.
- Web-first assertions only.

Run the suite. Show me the actual output. If anything fails, tell me whether it's a
framework bug or a real application defect before you fix anything — and if it's an
application defect, the test stays as it is and gets documented.

Then commit and push.
