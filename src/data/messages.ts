// Every string in this file is verbatim from live observation; see
// docs/discovery/saucedemo-discovery.md §1, §3, and §7.

export const LOGIN_ERROR_USERNAME_REQUIRED = 'Epic sadface: Username is required';
export const LOGIN_ERROR_PASSWORD_REQUIRED = 'Epic sadface: Password is required';
export const LOGIN_ERROR_CREDENTIALS_MISMATCH =
  'Epic sadface: Username and password do not match any user in this service';
export const LOGIN_ERROR_LOCKED_OUT = 'Epic sadface: Sorry, this user has been locked out.';

export const CHECKOUT_ERROR_FIRST_NAME_REQUIRED = 'Error: First Name is required';
export const CHECKOUT_ERROR_LAST_NAME_REQUIRED = 'Error: Last Name is required';
export const CHECKOUT_ERROR_POSTAL_CODE_REQUIRED = 'Error: Postal Code is required';

export const ORDER_COMPLETE_HEADER = 'Thank you for your order!';
export const ORDER_COMPLETE_TEXT =
  'Your order has been dispatched, and will arrive just as fast as the pony can get there!';

export const PAYMENT_INFORMATION_VALUE = 'SauceCard #31337';
export const SHIPPING_INFORMATION_VALUE = 'Free Pony Express Delivery!';

export const PAGE_TITLE_PRODUCTS = 'Products';
export const PAGE_TITLE_YOUR_CART = 'Your Cart';
export const PAGE_TITLE_CHECKOUT_INFORMATION = 'Checkout: Your Information';
export const PAGE_TITLE_CHECKOUT_OVERVIEW = 'Checkout: Overview';
export const PAGE_TITLE_CHECKOUT_COMPLETE = 'Checkout: Complete!';

export const ADD_TO_CART_BUTTON_LABEL = 'Add to cart';
export const REMOVE_BUTTON_LABEL = 'Remove';

// The site interpolates the attempted path into the guard message.
export function loggedOutAccessErrorFor(path: string): string {
  return `Epic sadface: You can only access '${path}' when you are logged in.`;
}
