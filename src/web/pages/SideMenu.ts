import type { Locator, Page } from '@playwright/test';

// Component object for the react-burger-menu drawer present on every logged-in page.
// The links exist in the DOM even while the drawer is closed, but are hidden, so every
// interaction goes through open() the way a user would.
export class SideMenu {
  readonly page: Page;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly menuDrawer: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openMenuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.menuDrawer = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async open(): Promise<void> {
    await this.openMenuButton.click();
  }

  async close(): Promise<void> {
    await this.closeMenuButton.click();
  }

  async logOut(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.open();
    await this.resetAppStateLink.click();
    await this.close();
  }

  async goToAllItems(): Promise<void> {
    await this.open();
    await this.allItemsLink.click();
  }
}
