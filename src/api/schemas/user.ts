import { z } from 'zod';

// Shape observed in docs/discovery/jsonplaceholder-contract.md §1. Note geo.lat and
// geo.lng: the API serves them as strings, not numbers — an observed quirk this
// schema deliberately pins.
export const userSchema = z.strictObject({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  address: z.strictObject({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
    geo: z.strictObject({
      lat: z.string(),
      lng: z.string(),
    }),
  }),
  phone: z.string(),
  website: z.string(),
  company: z.strictObject({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export const userCollectionSchema = z.array(userSchema);

export type User = z.infer<typeof userSchema>;
