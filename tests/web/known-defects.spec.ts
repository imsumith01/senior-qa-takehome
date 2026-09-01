import { test, expect } from '../../src/web/fixtures/test';
import { PROBLEM_USER, ERROR_USER } from '../../src/data/users';
import {
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  SAUCE_LABS_BOLT_T_SHIRT,
} from '../../src/data/products';
import {
  VALID_CHECKOUT_DETAILS,
  itemTotalInDollarsFor,
  taxInDollarsFor,
  roundToCents,
} from '../../src/data/checkout';
import {
  ORDER_COMPLETE_HEADER,
  itemTotalLabelFor,
  taxLabelFor,
  grandTotalLabelFor,
} from '../../src/data/messages';
import { ROUTE_INVENTORY, ROUTE_CHECKOUT_COMPLETE } from '../../src/data/routes';

// Defect-detection suite. These tests run the core purchase flow as two of the
// deliberately broken demo users and assert CORRECT behaviour — so they fail, which
// is the point: a suite that stays green against a broken user is not testing
// anything. They are declared with test.fail(), which RUNS the flow on every suite
// run and treats the failure as expected — the main run stays green, yet the day
// the demo site fixes one of these accounts (or a selector rots), the test's
// verdict flips and the suite goes red, announcing that docs/KNOWN_DEFECTS.md is
// out of date. (test.fixme would skip the body entirely and detect nothing.)

// WEB-031 — dies at the second add: problem_user's Bolt T-Shirt button is dead.
// The assertions beyond that point are deliberate deeper tripwires: if the dead
// button is ever fixed, the flow proceeds and the form-mangling defect (typing into
// Last Name lands in First Name) keeps this test failing-as-expected.
test.fail(
  'problem_user can complete the same purchase a standard user can',
  { tag: ['@known-defect'] },
  async ({ loginPage, inventoryPage, cartPage, checkoutInformationPage, page }) => {
    // Arrange
    await loginPage.open();
    await loginPage.logInAs(PROBLEM_USER);
    await expect(page).toHaveURL(ROUTE_INVENTORY);

    // Act — build a two-item basket.
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.addProductToCart(SAUCE_LABS_BOLT_T_SHIRT);

    // Assert — a working shop shows two items in the cart.
    await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

    // Act — check out.
    await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    await cartPage.beginCheckout();
    await checkoutInformationPage.fillDetails(VALID_CHECKOUT_DETAILS);

    // Assert — the form holds what was typed into it.
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(
      VALID_CHECKOUT_DETAILS.firstName,
    );
    await expect(checkoutInformationPage.lastNameInput).toHaveValue(
      VALID_CHECKOUT_DETAILS.lastName,
    );
  },
);

// WEB-032 — the basket avoids error_user's dead buttons on purpose, so the flow
// reaches the deepest defect: Finish silently does nothing and no order can ever
// be completed.
/* eslint-disable max-lines-per-function -- the flow must reach the deepest defect (Finish is a no-op), so its stages cannot be split without losing the sequence */
test.fail(
  'error_user can complete the same purchase a standard user can',
  { tag: ['@known-defect'] },
  async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }) => {
    // Arrange
    const basket = [SAUCE_LABS_BACKPACK, SAUCE_LABS_BIKE_LIGHT];
    const expectedItemTotal = itemTotalInDollarsFor(basket);
    const expectedTax = taxInDollarsFor(expectedItemTotal);
    const expectedGrandTotal = roundToCents(expectedItemTotal + expectedTax);
    await loginPage.open();
    await loginPage.logInAs(ERROR_USER);
    await expect(page).toHaveURL(ROUTE_INVENTORY);

    // Act — build the basket and check out.
    for (const product of basket) {
      await inventoryPage.addProductToCart(product);
    }
    await expect(inventoryPage.shoppingCartBadge).toHaveText(String(basket.length));
    await inventoryPage.openCart();
    await cartPage.beginCheckout();
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Assert — the arithmetic is right for this user too.
    await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(
      itemTotalLabelFor(expectedItemTotal),
    );
    await expect(checkoutOverviewPage.taxLabel).toHaveText(taxLabelFor(expectedTax));
    await expect(checkoutOverviewPage.totalLabel).toHaveText(
      grandTotalLabelFor(expectedGrandTotal),
    );

    // Act — place the order.
    await checkoutOverviewPage.finishOrder();

    // Assert — a working shop confirms the order.
    await expect(page).toHaveURL(ROUTE_CHECKOUT_COMPLETE);
    await expect(checkoutCompletePage.completeHeader).toHaveText(ORDER_COMPLETE_HEADER);
  },
);
/* eslint-enable max-lines-per-function */
