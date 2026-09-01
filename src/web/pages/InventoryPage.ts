import type { Locator, Page } from '@playwright/test';
import type { Product } from '../../data/products';
import { ROUTE_INVENTORY } from '../../data/routes';

// The option values of the sort <select>, as observed in discovery §5.
export type SortOptionValue = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productDescriptions: Locator;
  readonly productPrices: Locator;
  readonly sortDropdown: Locator;
  readonly activeSortLabel: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.productCards = page.locator('.inventory_item');
    this.productNames = page.locator('.inventory_item_name');
    this.productDescriptions = page.locator('.inventory_item_desc');
    this.productPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.activeSortLabel = page.locator('.active_option');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTE_INVENTORY);
  }

  addToCartButtonFor(product: Product): Locator {
    return this.page.locator(`[data-test="add-to-cart-${product.dataTestSlug}"]`);
  }

  removeFromCartButtonFor(product: Product): Locator {
    return this.page.locator(`[data-test="remove-${product.dataTestSlug}"]`);
  }

  imageFor(product: Product): Locator {
    return this.page.locator(`[data-test="inventory-item-${product.dataTestSlug}-img"]`);
  }

  titleLinkFor(product: Product): Locator {
    return this.page.locator(`[data-test="item-${product.id}-title-link"]`);
  }

  async addProductToCart(product: Product): Promise<void> {
    await this.addToCartButtonFor(product).click();
  }

  async removeProductFromCart(product: Product): Promise<void> {
    await this.removeFromCartButtonFor(product).click();
  }

  async openProductDetails(product: Product): Promise<void> {
    await this.titleLinkFor(product).click();
  }

  async sortProductsBy(option: SortOptionValue): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  async visibleProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async visibleProductPrices(): Promise<string[]> {
    return this.productPrices.allTextContents();
  }
}
