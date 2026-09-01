import type { Locator, Page } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly lineItems: Locator;
  readonly itemNames: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly paymentInformation: Locator;
  readonly shippingInformation: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.lineItems = page.locator('.cart_item');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.paymentInformation = page.locator('[data-test="payment-info-value"]');
    this.shippingInformation = page.locator('[data-test="shipping-info-value"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
