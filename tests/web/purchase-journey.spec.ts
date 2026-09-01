import { test, expect } from '../../src/web/fixtures/test';
import { STANDARD_USER } from '../../src/data/users';
import {
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  FULL_CATALOGUE,
} from '../../src/data/products';
import {
  VALID_CHECKOUT_DETAILS,
  itemTotalInDollarsFor,
  taxInDollarsFor,
  roundToCents,
} from '../../src/data/checkout';
import {
  badgeTextFor,
  PAGE_TITLE_PRODUCTS,
  PAGE_TITLE_YOUR_CART,
  PAGE_TITLE_CHECKOUT_INFORMATION,
  PAGE_TITLE_CHECKOUT_OVERVIEW,
  PAGE_TITLE_CHECKOUT_COMPLETE,
  ORDER_COMPLETE_HEADER,
  ORDER_COMPLETE_TEXT,
  itemTotalLabelFor,
  taxLabelFor,
  grandTotalLabelFor,
} from '../../src/data/messages';
import { ROUTE_INVENTORY } from '../../src/data/routes';

// WEB-019 — the one full journey, login through confirmation, asserting the key
// state transition at every stage rather than only at the end.
/* eslint-disable max-lines-per-function -- an end-to-end journey is one user story; splitting it into helpers would scatter the very sequence of assertions this test exists to make */
test(
  'completes a full purchase from login to order confirmation with correct totals at every step',
  { tag: ['@smoke'] },
  async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
    page,
  }) => {
    const basket = [SAUCE_LABS_BACKPACK, SAUCE_LABS_BIKE_LIGHT];
    const expectedItemTotal = itemTotalInDollarsFor(basket);
    const expectedTax = taxInDollarsFor(expectedItemTotal);
    const expectedGrandTotal = roundToCents(expectedItemTotal + expectedTax);

    // Act
    await loginPage.open();
    await loginPage.logInAs(STANDARD_USER);

    // Assert — landed on the full inventory.
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await expect(inventoryPage.pageTitle).toHaveText(PAGE_TITLE_PRODUCTS);
    await expect(inventoryPage.productCards).toHaveCount(FULL_CATALOGUE.length);

    // Act
    for (const product of basket) {
      await inventoryPage.addProductToCart(product);
    }

    // Assert — every add flipped its button, and the badge counts them all.
    for (const product of basket) {
      await expect(inventoryPage.removeFromCartButtonFor(product)).toBeVisible();
    }
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(basket.length));

    // Act
    await inventoryPage.openCart();

    // Assert — the cart lists exactly the basket.
    await expect(cartPage.pageTitle).toHaveText(PAGE_TITLE_YOUR_CART);
    await expect(cartPage.itemNames).toHaveText(basket.map((product) => product.name));

    // Act — through step one with valid details, anchored on its title first.
    await cartPage.beginCheckout();
    await expect(checkoutInformationPage.pageTitle).toHaveText(PAGE_TITLE_CHECKOUT_INFORMATION);
    await checkoutInformationPage.fillDetailsAndContinue(VALID_CHECKOUT_DETAILS);

    // Assert — the overview arithmetic matches the basket.
    await expect(checkoutOverviewPage.pageTitle).toHaveText(PAGE_TITLE_CHECKOUT_OVERVIEW);
    await expect(checkoutOverviewPage.lineItems).toHaveCount(basket.length);
    await expect(checkoutOverviewPage.itemTotalLabel).toHaveText(
      itemTotalLabelFor(expectedItemTotal),
    );
    await expect(checkoutOverviewPage.taxLabel).toHaveText(taxLabelFor(expectedTax));
    await expect(checkoutOverviewPage.totalLabel).toHaveText(
      grandTotalLabelFor(expectedGrandTotal),
    );

    // Act
    await checkoutOverviewPage.finishOrder();

    // Assert
    await expect(checkoutCompletePage.pageTitle).toHaveText(PAGE_TITLE_CHECKOUT_COMPLETE);
    await expect(checkoutCompletePage.completeHeader).toHaveText(ORDER_COMPLETE_HEADER);
    await expect(checkoutCompletePage.completeText).toHaveText(ORDER_COMPLETE_TEXT);

    // Act
    await checkoutCompletePage.returnToProducts();

    // Assert — the order emptied the cart.
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();
  },
);
/* eslint-enable max-lines-per-function */
