import { z } from 'zod';

// Shape observed in docs/discovery/jsonplaceholder-contract.md §1. Strict: an extra
// field is contract drift and should fail loudly.
export const postSchema = z.strictObject({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const postCollectionSchema = z.array(postSchema);

export type Post = z.infer<typeof postSchema>;

// What a client sends to create a post; the server synthesises the id.
export type NewPost = Omit<Post, 'id'>;
