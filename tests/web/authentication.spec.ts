import { test, expect } from '../../src/web/fixtures/test';
import { STANDARD_USER, LOCKED_OUT_USER, WRONG_PASSWORD } from '../../src/data/users';
import { FULL_CATALOGUE } from '../../src/data/products';
import {
  LOGIN_ERROR_USERNAME_REQUIRED,
  LOGIN_ERROR_PASSWORD_REQUIRED,
  LOGIN_ERROR_CREDENTIALS_MISMATCH,
  LOGIN_ERROR_LOCKED_OUT,
  PAGE_TITLE_PRODUCTS,
  loggedOutAccessErrorFor,
} from '../../src/data/messages';
import { ROUTE_LOGIN, ROUTE_INVENTORY, PROTECTED_ROUTES } from '../../src/data/routes';

// WEB-001
test(
  'logs in as standard_user and lands on the inventory with all products visible',
  { tag: ['@smoke'] },
  async ({ loginPage, inventoryPage, page }) => {
    // Arrange
    await loginPage.open();

    // Act
    await loginPage.logInAs(STANDARD_USER);

    // Assert
    await expect(page).toHaveURL(ROUTE_INVENTORY);
    await expect(inventoryPage.pageTitle).toHaveText(PAGE_TITLE_PRODUCTS);
    await expect(inventoryPage.productCards).toHaveCount(FULL_CATALOGUE.length);
  },
);

// WEB-002
test(
  'rejects login when the password is wrong and shows the mismatch error banner',
  { tag: ['@smoke', '@negative'] },
  async ({ loginPage, page }) => {
    // Arrange
    await loginPage.open();

    // Act
    await loginPage.logInAs({ username: STANDARD_USER.username, password: WRONG_PASSWORD });

    // Assert
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERROR_CREDENTIALS_MISMATCH);
    await expect(page).toHaveURL(ROUTE_LOGIN);
  },
);

// WEB-003
test(
  'rejects locked_out_user with the locked-out error even though the password is right',
  { tag: ['@negative'] },
  async ({ loginPage, page }) => {
    // Arrange
    await loginPage.open();

    // Act
    await loginPage.logInAs(LOCKED_OUT_USER);

    // Assert
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERROR_LOCKED_OUT);
    await expect(page).toHaveURL(ROUTE_LOGIN);
  },
);

// WEB-004
test(
  'rejects login when the username is empty and says the username is required',
  { tag: ['@negative'] },
  async ({ loginPage }) => {
    // Arrange
    await loginPage.open();

    // Act
    await loginPage.logInAs({ username: '', password: STANDARD_USER.password });

    // Assert
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERROR_USERNAME_REQUIRED);
  },
);

// WEB-005
test(
  'rejects login when the password is empty and says the password is required',
  { tag: ['@negative'] },
  async ({ loginPage }) => {
    // Arrange
    await loginPage.open();

    // Act
    await loginPage.logInAs({ username: STANDARD_USER.username, password: '' });

    // Assert
    await expect(loginPage.errorMessage).toHaveText(LOGIN_ERROR_PASSWORD_REQUIRED);
  },
);

// WEB-006
test(
  'clears the error banner when its dismiss button is clicked',
  { tag: ['@regression'] },
  async ({ loginPage }) => {
    // Arrange — provoke an error so there is a banner to dismiss.
    await loginPage.open();
    await loginPage.logInAs({ username: STANDARD_USER.username, password: WRONG_PASSWORD });
    await expect(loginPage.errorMessage).toBeVisible();

    // Act
    await loginPage.dismissError();

    // Assert
    await expect(loginPage.errorMessage).toBeHidden();
  },
);

// WEB-009 — discovery verified the guard message for two of these routes; running
// this against all five verifies the interpolation pattern holds everywhere.
for (const protectedRoute of PROTECTED_ROUTES) {
  test(
    `blocks direct navigation to ${protectedRoute} when logged out and says why`,
    { tag: ['@negative'] },
    async ({ loginPage, page }) => {
      // Act
      await page.goto(protectedRoute);

      // Assert — observed behaviour: bounced to the login page with the path
      // interpolated into the error, not a silent redirect.
      await expect(page).toHaveURL(ROUTE_LOGIN);
      await expect(loginPage.errorMessage).toHaveText(loggedOutAccessErrorFor(protectedRoute));
    },
  );
}

// WEB-007
test(
  'logs out via the burger menu and the session does not survive the back button',
  { tag: ['@regression'] },
  async ({ loggedInAsStandardUser, sideMenu, loginPage, page }) => {
    // Act
    await sideMenu.logOut();

    // Assert
    await expect(page).toHaveURL(ROUTE_LOGIN);
    await expect(loginPage.loginButton).toBeVisible();

    // Act — try to resurrect the session from browser history.
    await page.goBack();

    // Assert — the guard bounces straight back to login with its message.
    await expect(page).toHaveURL(ROUTE_LOGIN);
    await expect(loginPage.errorMessage).toHaveText(loggedOutAccessErrorFor(ROUTE_INVENTORY));
  },
);
