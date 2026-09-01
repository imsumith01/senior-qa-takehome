import { z } from 'zod';

// The email field stays a plain string: only the type was observed as contract,
// not a format.
export const commentSchema = z.strictObject({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  email: z.string(),
  body: z.string(),
});

export const commentCollectionSchema = z.array(commentSchema);

export type Comment = z.infer<typeof commentSchema>;
