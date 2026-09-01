import { test, expect } from '../../src/web/fixtures/test';
import { PROBLEM_USER, ERROR_USER } from '../../src/data/users';
import {
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  SAUCE_LABS_BOLT_T_SHIRT,
} from '../../src/data/products';
import { VALID_CHECKOUT_DETAILS } from '../../src/data/checkout';
import { badgeTextFor } from '../../src/data/messages';
import { ROUTE_INVENTORY, ROUTE_CHECKOUT_STEP_TWO } from '../../src/data/routes';

// Defect pins for the deliberately broken demo accounts. Each test asserts the
// DEFECTIVE behaviour precisely, so it passes while the defect exists and goes red
// the moment the site fixes it — or the moment anything else breaks (a rotted
// selector, a removed account). Earlier designs (test.fixme, then test.fail) could
// not raise that alarm; the full history and defect register are in
// docs/KNOWN_DEFECTS.md.

// WEB-031
test(
  'problem_user clicks Add to cart on the Bolt T-Shirt and nothing happens',
  { tag: ['@known-defect', '@regression'] },
  async ({ loginPage, inventoryPage, page }) => {
    // Arrange — one working add proves the cart machinery is alive for this user.
    await loginPage.open();
    await loginPage.logInAs(PROBLEM_USER);
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));

    // Act
    await inventoryPage.addProductToCart(SAUCE_LABS_BOLT_T_SHIRT);

    // Assert — the dead button: badge unchanged, button never flips to Remove.
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
    await expect(inventoryPage.addToCartButtonFor(SAUCE_LABS_BOLT_T_SHIRT)).toBeVisible();
  },
);

// WEB-033
test(
  'problem_user types a last name and it lands in the first-name field instead',
  { tag: ['@known-defect', '@regression'] },
  async ({ loginPage, inventoryPage, cartPage, checkoutInformationPage, page }) => {
    // Arrange — reach checkout step one with a product this user CAN add.
    await loginPage.open();
    await loginPage.logInAs(PROBLEM_USER);
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.openCart();
    await cartPage.beginCheckout();

    // Act — fill first name, then last name.
    await checkoutInformationPage.fillDetails(VALID_CHECKOUT_DETAILS);

    // Assert — the last keystrokes overwrote the first-name field, and the
    // last-name field kept nothing.
    await expect(checkoutInformationPage.firstNameInput).toHaveValue(
      VALID_CHECKOUT_DETAILS.lastName,
    );
    await expect(checkoutInformationPage.lastNameInput).toHaveValue('');
  },
);

// WEB-032
test(
  'error_user clicks Finish and stays stranded on the checkout overview',
  { tag: ['@known-defect', '@regression'] },
  async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    page,
  }) => {
    // Arrange — a basket of products this user can add, carried to the overview.
    await loginPage.open();
    await loginPage.logInAs(ERROR_USER);
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.addProductToCart(SAUCE_LABS_BIKE_LIGHT);
    await inventoryPage.openCart();
    await cartPage.beginCheckout();
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);
    await expect(page).toHaveURL(ROUTE_CHECKOUT_STEP_TWO);

    // Act
    await checkoutOverviewPage.finishOrder();

    // Assert — Finish is a no-op: no navigation, no confirmation, no order. This
    // user can never complete a purchase.
    await expect(page).toHaveURL(ROUTE_CHECKOUT_STEP_TWO);
    await expect(checkoutOverviewPage.finishButton).toBeVisible();
  },
);
