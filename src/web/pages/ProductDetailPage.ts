import type { Locator, Page } from '@playwright/test';
import type { Product } from '../../data/products';
import { productDetailRouteFor } from '../../data/routes';

export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  // Unlike the inventory page, the detail page uses generic button ids.
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('[data-test="inventory-item-name"]');
    this.productDescription = page.locator('[data-test="inventory-item-desc"]');
    this.productPrice = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.removeButton = page.locator('[data-test="remove"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async openForProduct(product: Product): Promise<void> {
    await this.page.goto(productDetailRouteFor(product.id));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async returnToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
