Build the web framework structure. Page objects and fixtures only — no tests yet.

1. One page object per page under `src/web/pages/`: LoginPage, InventoryPage,
   ProductDetailPage, CartPage, CheckoutInformationPage, CheckoutOverviewPage,
   CheckoutCompletePage, and a small SideMenu component object.

   Each page object:
   - Takes `page: Page` in the constructor and nothing else.
   - Declares every locator as a named readonly property at the top, using the selectors
     you verified in discovery.
   - Exposes methods named after user intent (`enterCredentialsAndSubmit`,
     `sortProductsBy`, `addProductToCartByName`), not mechanics (`clickButton3`).
   - Contains no assertions. Page objects describe the page; tests decide what's correct.
   - Has no inheritance and no base class.

2. `src/data/` for test data: user credentials as named constants, the product catalogue,
   the sales tax rate, and valid/invalid checkout details. No magic values anywhere else.

3. `src/web/fixtures/` with a custom test fixture exposing the page objects, so a test
   reads `test('...', async ({ loginPage, inventoryPage }) => {...})`. Add a
   `loggedInAsStandardUser` fixture that handles authentication.

4. Add a short `src/web/pages/README.md` explaining the conventions, so the next engineer
   knows how to add a page.

Constraints: no `any`, no inheritance, no try/catch, no selector strings outside page
objects, no method longer than about 20 lines. `npm run typecheck` and `npm run lint` must
both pass before you commit.

Then commit and push.
