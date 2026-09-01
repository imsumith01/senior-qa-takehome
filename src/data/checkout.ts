import type { Product } from './products';

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function itemTotalInDollarsFor(basket: Product[]): number {
  let total = 0;
  for (const product of basket) {
    total += product.priceInDollars;
  }
  return roundToCents(total);
}

// Matches all observed baskets: 8% of the item total, rounded to the cent
// (discovery §8 — half-up vs ceiling is indistinguishable on this catalogue).
export function taxInDollarsFor(itemTotalInDollars: number): number {
  return roundToCents(itemTotalInDollars * SALES_TAX_RATE);
}

// Confirmed against three observed baskets; see
// docs/discovery/saucedemo-discovery.md §8.
export const SALES_TAX_RATE = 0.08;

// The app only validates that each field is non-empty, so any static values work.
export const VALID_CHECKOUT_DETAILS: CheckoutDetails = {
  firstName: 'Harshita',
  lastName: 'Tester',
  postalCode: '12345',
};

// The invalid baseline; per-field-missing variants are built in tests by spreading
// VALID_CHECKOUT_DETAILS with one field from here.
export const EMPTY_CHECKOUT_DETAILS: CheckoutDetails = {
  firstName: '',
  lastName: '',
  postalCode: '',
};
