// The catalogue exactly as observed live on 2026-09-01; see
// docs/discovery/saucedemo-discovery.md §4. Names, prices, and descriptions are
// verbatim. The slug is recorded from the site's own data-test attributes rather than
// derived from the name, so a site-side renaming cannot hide behind our derivation.
export interface Product {
  // Numeric id used in inventory-item.html?id=… and in item_{id}_title_link elements.
  id: number;
  name: string;
  priceInDollars: number;
  description: string;
  // The exact slug saucedemo embeds in add-to-cart-…, remove-…, and
  // inventory-item-…-img data-test attributes.
  dataTestSlug: string;
}

export const SAUCE_LABS_BACKPACK: Product = {
  id: 4,
  name: 'Sauce Labs Backpack',
  priceInDollars: 29.99,
  description:
    'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
  dataTestSlug: 'sauce-labs-backpack',
};

export const SAUCE_LABS_BIKE_LIGHT: Product = {
  id: 0,
  name: 'Sauce Labs Bike Light',
  priceInDollars: 9.99,
  description:
    "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
  dataTestSlug: 'sauce-labs-bike-light',
};

export const SAUCE_LABS_BOLT_T_SHIRT: Product = {
  id: 1,
  name: 'Sauce Labs Bolt T-Shirt',
  priceInDollars: 15.99,
  description:
    'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
  dataTestSlug: 'sauce-labs-bolt-t-shirt',
};

export const SAUCE_LABS_FLEECE_JACKET: Product = {
  id: 5,
  name: 'Sauce Labs Fleece Jacket',
  priceInDollars: 49.99,
  description:
    "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
  dataTestSlug: 'sauce-labs-fleece-jacket',
};

export const SAUCE_LABS_ONESIE: Product = {
  id: 2,
  name: 'Sauce Labs Onesie',
  priceInDollars: 7.99,
  description:
    "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
  dataTestSlug: 'sauce-labs-onesie',
};

export const TEST_ALL_THE_THINGS_T_SHIRT: Product = {
  id: 3,
  name: 'Test.allTheThings() T-Shirt (Red)',
  priceInDollars: 15.99,
  description:
    'This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.',
  dataTestSlug: 'test.allthethings()-t-shirt-(red)',
};

export function displayPriceFor(product: Product): string {
  return `$${product.priceInDollars.toFixed(2)}`;
}

// In the order the inventory displays them under the default Name (A to Z) sort.
export const FULL_CATALOGUE: Product[] = [
  SAUCE_LABS_BACKPACK,
  SAUCE_LABS_BIKE_LIGHT,
  SAUCE_LABS_BOLT_T_SHIRT,
  SAUCE_LABS_FLEECE_JACKET,
  SAUCE_LABS_ONESIE,
  TEST_ALL_THE_THINGS_T_SHIRT,
];
