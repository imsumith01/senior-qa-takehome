export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
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
