// Application routes as observed in discovery. Paths are relative so they resolve
// against the web project's baseURL.

export const WEB_BASE_URL = 'https://www.saucedemo.com';

export const ROUTE_LOGIN = '/';
export const ROUTE_INVENTORY = '/inventory.html';
export const ROUTE_CART = '/cart.html';
export const ROUTE_CHECKOUT_STEP_ONE = '/checkout-step-one.html';
export const ROUTE_CHECKOUT_STEP_TWO = '/checkout-step-two.html';
export const ROUTE_CHECKOUT_COMPLETE = '/checkout-complete.html';

export function productDetailRouteFor(productId: number): string {
  return `/inventory-item.html?id=${productId}`;
}

// Every page the logged-out guard protects. Discovery verified the guard on two of
// these; WEB-009 verifies the remaining three by running.
export const PROTECTED_ROUTES: string[] = [
  ROUTE_INVENTORY,
  ROUTE_CART,
  ROUTE_CHECKOUT_STEP_ONE,
  ROUTE_CHECKOUT_STEP_TWO,
  ROUTE_CHECKOUT_COMPLETE,
];
