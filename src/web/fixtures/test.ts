import { test as base } from '@playwright/test';
import { STANDARD_USER } from '../../data/users';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInformationPage } from '../pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { SideMenu } from '../pages/SideMenu';

interface WebFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  sideMenu: SideMenu;
  // Depend on this fixture to start the test already authenticated as standard_user,
  // through the real login form (see docs/TEST_PLAN.md §5 for why not storageState).
  loggedInAsStandardUser: void;
}

export const test = base.extend<WebFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
  sideMenu: async ({ page }, use) => {
    await use(new SideMenu(page));
  },
  loggedInAsStandardUser: async ({ loginPage }, use) => {
    await loginPage.open();
    await loginPage.logInAs(STANDARD_USER);
    await use();
  },
});

export { expect } from '@playwright/test';
