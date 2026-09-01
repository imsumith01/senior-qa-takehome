import { test, expect } from '../../src/web/fixtures/test';
import {
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  displayPriceFor,
} from '../../src/data/products';
import { VALID_CHECKOUT_DETAILS } from '../../src/data/checkout';
import {
  PAGE_TITLE_YOUR_CART,
  PAGE_TITLE_CHECKOUT_OVERVIEW,
  ORDER_COMPLETE_HEADER,
  EMPTY_CART_ITEM_TOTAL_TEXT,
  taxLabelFor,
  grandTotalLabelFor,
} from '../../src/data/messages';
import { ROUTE_INVENTORY, ROUTE_CHECKOUT_STEP_ONE } from '../../src/data/routes';

// WEB-027
test(
  'shows exactly the added items with their names, descriptions, prices, and quantities',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, cartPage }) => {
    // Arrange
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.addProductToCart(SAUCE_LABS_BIKE_LIGHT);

    // Act
    await inventoryPage.openCart();

    // Assert — insertion order, one row per product, quantity always 1.
    await expect(cartPage.pageTitle).toHaveText(PAGE_TITLE_YOUR_CART);
    await expect(cartPage.itemNames).toHaveText([
      SAUCE_LABS_BACKPACK.name,
      SAUCE_LABS_BIKE_LIGHT.name,
    ]);
    await expect(cartPage.itemDescriptions).toHaveText([
      SAUCE_LABS_BACKPACK.description,
      SAUCE_LABS_BIKE_LIGHT.description,
    ]);
    await expect(cartPage.itemPrices).toHaveText([
      displayPriceFor(SAUCE_LABS_BACKPACK),
      displayPriceFor(SAUCE_LABS_BIKE_LIGHT),
    ]);
    await expect(cartPage.itemQuantities).toHaveText(['1', '1']);
  },
);

// WEB-028
test(
  'removing an item on the cart page updates both the row list and the badge',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, cartPage }) => {
    // Arrange
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.addProductToCart(SAUCE_LABS_BIKE_LIGHT);
    await inventoryPage.openCart();
    await expect(cartPage.cartItems).toHaveCount(2);

    // Act
    await cartPage.removeProductFromCart(SAUCE_LABS_BACKPACK);

    // Assert
    await expect(cartPage.itemNames).toHaveText([SAUCE_LABS_BIKE_LIGHT.name]);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
  },
);

// WEB-029
test(
  'Continue Shopping returns to the inventory with the cart intact',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, cartPage, page }) => {
    // Arrange
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.openCart();

    // Act
    await cartPage.continueShopping();

    // Assert
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    await expect(inventoryPage.removeFromCartButtonFor(SAUCE_LABS_BACKPACK)).toBeVisible();
  },
);

// WEB-030 — pins observed behaviour (discovery §10.16): the app happily sells
// nothing, and the empty subtotal drops its decimal places.
test(
  'lets an empty cart check out all the way to a zero-dollar order confirmation',
  { tag: ['@regression'] },
  async ({
    loggedInAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }) => {
    // Arrange — anchor on the cart page first: a zero-count alone would also pass
    // before navigation finishes, since no other page has cart rows either.
    await inventoryPage.openCart();
    await expect(cartPage.pageTitle).toHaveText(PAGE_TITLE_YOUR_CART);
    await expect(cartPage.cartItems).toHaveCount(0);

    // Act
    await cartPage.beginCheckout();

    // Assert — checkout starts despite the empty cart.
    await expect(page).toHaveURL(ROUTE_CHECKOUT_STEP_ONE);

    // Act — continue to the overview.
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Assert — anchored on the overview page first, then zero line items; note the
    // "$0" subtotal (no decimals) next to the properly formatted zero tax and total.
    await expect(checkoutOverviewPage.pageTitle).toHaveText(PAGE_TITLE_CHECKOUT_OVERVIEW);
    await expect(checkoutOverviewPage.lineItems).toHaveCount(0);
    await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(EMPTY_CART_ITEM_TOTAL_TEXT);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(taxLabelFor(0));
    await expect(checkoutOverviewPage.totalLabel).toHaveText(grandTotalLabelFor(0));

    // Act
    await checkoutOverviewPage.finishOrder();

    // Assert — the $0 order is confirmed like any other.
    await expect(checkoutCompletePage.completeHeader).toHaveText(ORDER_COMPLETE_HEADER);
  },
);
