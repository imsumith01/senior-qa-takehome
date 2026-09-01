import { z } from 'zod';

// Shape observed in docs/discovery/jsonplaceholder-contract.md §1.
export const todoSchema = z.strictObject({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

export const todoCollectionSchema = z.array(todoSchema);

export type Todo = z.infer<typeof todoSchema>;
