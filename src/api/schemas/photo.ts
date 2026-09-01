import { z } from 'zod';

// The url fields stay plain strings: they point at a third-party host whose format
// is not part of this API's contract (docs/TEST_PLAN.md §1).
export const photoSchema = z.strictObject({
  albumId: z.number(),
  id: z.number(),
  title: z.string(),
  url: z.string(),
  thumbnailUrl: z.string(),
});

export const photoCollectionSchema = z.array(photoSchema);

export type Photo = z.infer<typeof photoSchema>;
