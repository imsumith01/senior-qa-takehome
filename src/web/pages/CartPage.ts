import type { Locator, Page } from '@playwright/test';
import type { Product } from '../../data/products';
import { ROUTE_CART } from '../../data/routes';

export class CartPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly itemQuantities: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('.cart_item');
    this.itemQuantities = page.locator('[data-test="item-quantity"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTE_CART);
  }

  removeButtonFor(product: Product): Locator {
    return this.page.locator(`[data-test="remove-${product.dataTestSlug}"]`);
  }

  async removeProductFromCart(product: Product): Promise<void> {
    await this.removeButtonFor(product).click();
  }

  async beginCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async namesOfItemsInCart(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }
}
