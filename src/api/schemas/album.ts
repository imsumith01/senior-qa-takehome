import { z } from 'zod';

// Shape observed in docs/discovery/jsonplaceholder-contract.md §1.
export const albumSchema = z.strictObject({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
});

export const albumCollectionSchema = z.array(albumSchema);

export type Album = z.infer<typeof albumSchema>;
