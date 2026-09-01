import type { Locator, Page } from '@playwright/test';
import type { CheckoutDetails } from '../../data/checkout';

export class CheckoutInformationPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  // The camelCase data-test values are the site's own inconsistency; see discovery §10.
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async fillDetails(details: CheckoutDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.postalCodeInput.fill(details.postalCode);
  }

  async submitDetails(): Promise<void> {
    await this.continueButton.click();
  }

  async fillDetailsAndContinue(details: CheckoutDetails): Promise<void> {
    await this.fillDetails(details);
    await this.submitDetails();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
