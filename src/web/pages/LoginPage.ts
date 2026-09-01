import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../../data/users';
import { ROUTE_LOGIN } from '../../data/routes';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorDismissButton: Locator;
  readonly acceptedUsernamesPanel: Locator;
  readonly passwordPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorDismissButton = page.locator('[data-test="error-button"]');
    this.acceptedUsernamesPanel = page.locator('[data-test="login-credentials"]');
    this.passwordPanel = page.locator('[data-test="login-password"]');
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTE_LOGIN);
  }

  async logInAs(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.errorDismissButton.click();
  }
}
