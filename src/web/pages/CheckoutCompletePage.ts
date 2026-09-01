import type { Locator, Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    // The site reuses the back-to-products id here for its "Back Home" button.
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async returnToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
