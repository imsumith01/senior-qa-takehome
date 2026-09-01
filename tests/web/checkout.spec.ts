import { test, expect } from '../../src/web/fixtures/test';
import type { InventoryPage } from '../../src/web/pages/InventoryPage';
import type { CartPage } from '../../src/web/pages/CartPage';
import {
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_FLEECE_JACKET,
  SAUCE_LABS_BOLT_T_SHIRT,
} from '../../src/data/products';
import {
  VALID_CHECKOUT_DETAILS,
  EMPTY_CHECKOUT_DETAILS,
  itemTotalInDollarsFor,
  taxInDollarsFor,
  roundToCents,
} from '../../src/data/checkout';
import {
  badgeTextFor,
  CHECKOUT_ERROR_FIRST_NAME_REQUIRED,
  CHECKOUT_ERROR_LAST_NAME_REQUIRED,
  CHECKOUT_ERROR_POSTAL_CODE_REQUIRED,
  PAGE_TITLE_YOUR_CART,
  PAYMENT_INFORMATION_VALUE,
  SHIPPING_INFORMATION_VALUE,
  itemTotalLabelFor,
  taxLabelFor,
  grandTotalLabelFor,
} from '../../src/data/messages';
import { ROUTE_INVENTORY, ROUTE_CART } from '../../src/data/routes';

async function startCheckoutWithOneItem(
  inventoryPage: InventoryPage,
  cartPage: CartPage,
): Promise<void> {
  await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
  await inventoryPage.openCart();
  await cartPage.beginCheckout();
}

// WEB-020 — the observed validation priority is first name, then last name, then
// postal code, one message at a time.
const validationCases = [
  {
    missingField: 'everything',
    details: EMPTY_CHECKOUT_DETAILS,
    expectedError: CHECKOUT_ERROR_FIRST_NAME_REQUIRED,
  },
  {
    missingField: 'the first name',
    details: { ...VALID_CHECKOUT_DETAILS, firstName: '' },
    expectedError: CHECKOUT_ERROR_FIRST_NAME_REQUIRED,
  },
  {
    missingField: 'the last name',
    details: { ...VALID_CHECKOUT_DETAILS, lastName: '' },
    expectedError: CHECKOUT_ERROR_LAST_NAME_REQUIRED,
  },
  {
    missingField: 'the postal code',
    details: { ...VALID_CHECKOUT_DETAILS, postalCode: '' },
    expectedError: CHECKOUT_ERROR_POSTAL_CODE_REQUIRED,
  },
];

for (const validationCase of validationCases) {
  test(
    `rejects checkout information when ${validationCase.missingField} is missing`,
    { tag: ['@negative'] },
    async ({ loggedInAsStandardUser, inventoryPage, cartPage, checkoutInformationPage }) => {
      // Arrange
      await startCheckoutWithOneItem(inventoryPage, cartPage);

      // Act
      await checkoutInformationPage.fillDetailsAndContinue(validationCase.details);

      // Assert
      await expect(checkoutInformationPage.errorMessage).toHaveText(validationCase.expectedError);
    },
  );
}

// WEB-022
test(
  'cancel from checkout information returns to the cart',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, cartPage, checkoutInformationPage, page }) => {
    // Arrange
    await startCheckoutWithOneItem(inventoryPage, cartPage);

    // Act
    await checkoutInformationPage.cancel();

    // Assert
    await expect(page).toHaveURL(ROUTE_CART);
    await expect(cartPage.pageTitle).toHaveText(PAGE_TITLE_YOUR_CART);
    await expect(cartPage.itemNames).toHaveText([SAUCE_LABS_BACKPACK.name]);
  },
);

// WEB-022 — the asymmetry is deliberate on the site's part: step two cancels to the
// inventory, not back to the cart (discovery §3).
test(
  'cancel from the checkout overview returns to the inventory, not the cart',
  { tag: ['@regression'] },
  async ({
    loggedInAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    page,
  }) => {
    // Arrange
    await startCheckoutWithOneItem(inventoryPage, cartPage);
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Act
    await checkoutOverviewPage.cancel();

    // Assert — cart is untouched by the cancelled checkout.
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
  },
);

// WEB-021 — expectations are computed from the basket and the tax constant, never
// hardcoded, so this test survives a basket change (docs/TEST_PLAN.md §4). The
// basket deliberately differs from the one in the end-to-end journey.
test(
  'shows an item total, 8% tax, and grand total that match the basket arithmetic',
  { tag: ['@regression'] },
  async ({
    loggedInAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // Arrange
    const basket = [SAUCE_LABS_FLEECE_JACKET, SAUCE_LABS_BOLT_T_SHIRT];
    const expectedItemTotal = itemTotalInDollarsFor(basket);
    const expectedTax = taxInDollarsFor(expectedItemTotal);
    const expectedGrandTotal = roundToCents(expectedItemTotal + expectedTax);
    for (const product of basket) {
      await inventoryPage.addProductToCart(product);
    }
    await inventoryPage.openCart();
    await cartPage.beginCheckout();

    // Act
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Assert
    await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(
      itemTotalLabelFor(expectedItemTotal),
    );
    await expect(checkoutOverviewPage.taxLabel).toHaveText(taxLabelFor(expectedTax));
    await expect(checkoutOverviewPage.totalLabel).toHaveText(
      grandTotalLabelFor(expectedGrandTotal),
    );
  },
);

// WEB-021 — the static halves of the overview, split from the arithmetic test to
// keep each under the length limit.
test(
  'shows the payment and shipping information on the checkout overview',
  { tag: ['@regression'] },
  async ({
    loggedInAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // Arrange
    await startCheckoutWithOneItem(inventoryPage, cartPage);

    // Act
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Assert
    await expect(checkoutOverviewPage.paymentInformation).toHaveText(PAYMENT_INFORMATION_VALUE);
    await expect(checkoutOverviewPage.shippingInformation).toHaveText(SHIPPING_INFORMATION_VALUE);
  },
);
