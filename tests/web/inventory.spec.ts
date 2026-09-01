import { test, expect } from '../../src/web/fixtures/test';
import {
  FULL_CATALOGUE,
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  displayPriceFor,
} from '../../src/data/products';
import { REMOVE_BUTTON_LABEL, badgeTextFor } from '../../src/data/messages';
import { productDetailRouteFor } from '../../src/data/routes';

// Expected orders are derived from the catalogue at runtime so a tie-break, a price
// change, or the data file's declaration order never gets baked into this file
// (docs/TEST_PLAN.md §4).
const catalogueByName = [...FULL_CATALOGUE].sort((first, second) =>
  first.name.localeCompare(second.name),
);
const namesAscending = catalogueByName.map((product) => product.name);
const namesDescending = [...namesAscending].reverse();
const pricesAscending = FULL_CATALOGUE.map((product) => product.priceInDollars).sort(
  (first, second) => first - second,
);
const priceTextsAscending = pricesAscending.map((price) => `$${price.toFixed(2)}`);
const priceTextsDescending = [...priceTextsAscending].reverse();

// WEB-011
test(
  'renders all six products, each with a name, description, price, and image',
  { tag: ['@smoke', '@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Assert — content, not just element counts: blank descriptions or a swapped
    // image (the problem_user failure mode) must fail here.
    await expect(inventoryPage.productCards).toHaveCount(FULL_CATALOGUE.length);
    await expect(inventoryPage.productDescriptions).toHaveText(
      catalogueByName.map((product) => product.description),
    );
    for (const product of FULL_CATALOGUE) {
      await expect(inventoryPage.imageFor(product)).toBeVisible();
      await expect(inventoryPage.imageFor(product)).toHaveAttribute('src', product.imageFile);
    }
  },
);

// WEB-011
test(
  'shows exactly the known product names and prices from the catalogue',
  { tag: ['@smoke', '@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Arrange — the default display order is Name (A to Z), derived here rather
    // than trusted from the data file's declaration order.
    const expectedPrices = catalogueByName.map((product) => displayPriceFor(product));

    // Assert
    await expect(inventoryPage.productNames).toHaveText(namesAscending);
    await expect(inventoryPage.productPrices).toHaveText(expectedPrices);
  },
);

// WEB-012
test(
  'sorts products alphabetically when Name (A to Z) is selected',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Arrange — leave the default order first, and prove the departure: without
    // this assertion, a dead sort handler would leave the default A-to-Z order in
    // place and the final check would pass vacuously.
    await inventoryPage.sortProductsBy('za');
    await expect(inventoryPage.productNames).toHaveText(namesDescending);

    // Act
    await inventoryPage.sortProductsBy('az');

    // Assert
    await expect(inventoryPage.productNames).toHaveText(namesAscending);
  },
);

// WEB-012
test(
  'sorts products reverse-alphabetically when Name (Z to A) is selected',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Act
    await inventoryPage.sortProductsBy('za');

    // Assert
    await expect(inventoryPage.productNames).toHaveText(namesDescending);
  },
);

// WEB-012 — asserted on price texts: the two $15.99 products make name order under
// price sorting an unspecified tie (discovery §5), but the price sequence itself is
// fully determined.
test(
  'sorts products cheapest-first when Price (low to high) is selected',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Act
    await inventoryPage.sortProductsBy('lohi');

    // Assert
    await expect(inventoryPage.productPrices).toHaveText(priceTextsAscending);
  },
);

// WEB-012
test(
  'sorts products dearest-first when Price (high to low) is selected',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Act
    await inventoryPage.sortProductsBy('hilo');

    // Assert
    await expect(inventoryPage.productPrices).toHaveText(priceTextsDescending);
  },
);

// WEB-014
test(
  'flips the button to Remove and shows a badge of 1 when a product is added to the cart',
  { tag: ['@smoke'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Act
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);

    // Assert
    await expect(inventoryPage.removeFromCartButtonFor(SAUCE_LABS_BACKPACK)).toHaveText(
      REMOVE_BUTTON_LABEL,
    );
    await expect(inventoryPage.addToCartButtonFor(SAUCE_LABS_BACKPACK)).toBeHidden();
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
  },
);

// WEB-015
test(
  'decrements the badge on remove and hides it entirely once the cart is empty',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage }) => {
    // Arrange — with a guard that both adds actually took.
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await inventoryPage.addProductToCart(SAUCE_LABS_BIKE_LIGHT);
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(2));

    // Act
    await inventoryPage.removeProductFromCart(SAUCE_LABS_BIKE_LIGHT);

    // Assert
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
    await expect(inventoryPage.addToCartButtonFor(SAUCE_LABS_BIKE_LIGHT)).toBeVisible();

    // Act — empty the cart completely.
    await inventoryPage.removeProductFromCart(SAUCE_LABS_BACKPACK);

    // Assert
    await expect(inventoryPage.shoppingCartBadge).toBeHidden();
  },
);

// WEB-013
test(
  'opens the correct product detail page when a product name is clicked',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, productDetailPage, page }) => {
    // Act
    await inventoryPage.openProductDetails(SAUCE_LABS_BACKPACK);

    // Assert
    await expect(page).toHaveURL(productDetailRouteFor(SAUCE_LABS_BACKPACK.id));
    await expect(productDetailPage.productName).toHaveText(SAUCE_LABS_BACKPACK.name);
    await expect(productDetailPage.productDescription).toHaveText(SAUCE_LABS_BACKPACK.description);
    await expect(productDetailPage.productPrice).toHaveText(displayPriceFor(SAUCE_LABS_BACKPACK));
  },
);

// WEB-016
test(
  'keeps the cart badge across detail-page navigation and a full reload',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, inventoryPage, productDetailPage, page }) => {
    // Arrange — with a guard that the add took before navigating away.
    await inventoryPage.addProductToCart(SAUCE_LABS_BACKPACK);
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));

    // Act
    await inventoryPage.openProductDetails(SAUCE_LABS_BACKPACK);

    // Assert — the detail page agrees the product is in the cart.
    await expect(productDetailPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
    await expect(productDetailPage.removeButton).toBeVisible();

    // Act — go back and reload the document entirely.
    await productDetailPage.returnToProducts();
    await page.reload();

    // Assert
    await expect(inventoryPage.shoppingCartBadge).toHaveText(badgeTextFor(1));
    await expect(inventoryPage.removeFromCartButtonFor(SAUCE_LABS_BACKPACK)).toBeVisible();
  },
);
