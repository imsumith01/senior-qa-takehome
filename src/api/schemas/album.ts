import { z } from 'zod';

export const albumSchema = z.strictObject({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
});

export const albumCollectionSchema = z.array(albumSchema);

export type Album = z.infer<typeof albumSchema>;
