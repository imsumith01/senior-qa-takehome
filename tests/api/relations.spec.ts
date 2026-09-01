import { test, expect } from '../../src/api/fixtures/test';
import { commentCollectionSchema } from '../../src/api/schemas/comment';
import { todoCollectionSchema } from '../../src/api/schemas/todo';
import { postCollectionSchema } from '../../src/api/schemas/post';
import { userCollectionSchema } from '../../src/api/schemas/user';
import { parseWithSchema } from '../../src/api/schemas/validate';
import {
  COMMENTS_ON_POST_1,
  TODOS_FOR_USER_1,
  PROBED_POST_ID,
  PROBED_USER_ID,
  POSTS_COUNT,
  USERS_COUNT,
} from '../../src/data/api';

// API-006
test(
  'nested /posts/1/comments returns only comments of post 1 and equals the postId filter',
  { tag: ['@contract'] },
  async ({ postsClient, commentsClient }) => {
    // Act
    const nestedResponse = await postsClient.getCommentsForPost(PROBED_POST_ID);
    const filteredResponse = await commentsClient.getCommentsFilteredByPostId(PROBED_POST_ID);

    // Assert — every foreign key matches, not just a non-empty array.
    expect(nestedResponse.status()).toBe(200);
    expect(filteredResponse.status()).toBe(200);
    const nestedComments = parseWithSchema(
      commentCollectionSchema,
      await nestedResponse.json(),
      'GET /posts/1/comments body',
    );
    expect(nestedComments).toHaveLength(COMMENTS_ON_POST_1);
    const strayComments = nestedComments.filter((comment) => comment.postId !== PROBED_POST_ID);
    expect(strayComments).toEqual([]);

    const filteredComments = parseWithSchema(
      commentCollectionSchema,
      await filteredResponse.json(),
      'GET /comments?postId=1 body',
    );
    expect(nestedComments).toEqual(filteredComments);
  },
);

// API-007
test(
  'nested /users/1/todos returns only todos of user 1 and equals the userId filter',
  { tag: ['@contract'] },
  async ({ usersClient, todosClient }) => {
    // Act
    const nestedResponse = await usersClient.getTodosForUser(PROBED_USER_ID);
    const filteredResponse = await todosClient.getTodosFilteredByUserId(PROBED_USER_ID);

    // Assert
    expect(nestedResponse.status()).toBe(200);
    expect(filteredResponse.status()).toBe(200);
    const nestedTodos = parseWithSchema(
      todoCollectionSchema,
      await nestedResponse.json(),
      'GET /users/1/todos body',
    );
    expect(nestedTodos).toHaveLength(TODOS_FOR_USER_1);
    const strayTodos = nestedTodos.filter((todo) => todo.userId !== PROBED_USER_ID);
    expect(strayTodos).toEqual([]);

    const filteredTodos = parseWithSchema(
      todoCollectionSchema,
      await filteredResponse.json(),
      'GET /todos?userId=1 body',
    );
    expect(nestedTodos).toEqual(filteredTodos);
  },
);

// API-021 — cross-resource referential integrity: a post pointing at a userId with
// no matching user would break every consumer that joins the two.
test(
  'every post belongs to a user that actually exists',
  { tag: ['@contract'] },
  async ({ postsClient, usersClient }) => {
    // Act
    const postsResponse = await postsClient.getAllPosts();
    const usersResponse = await usersClient.getAllUsers();

    // Assert — anchored on status and size first: an empty response would make the
    // join check below vacuously true. A failure lists the offending post ids.
    expect(postsResponse.status()).toBe(200);
    expect(usersResponse.status()).toBe(200);
    const posts = parseWithSchema(
      postCollectionSchema,
      await postsResponse.json(),
      'GET /posts body',
    );
    const users = parseWithSchema(
      userCollectionSchema,
      await usersResponse.json(),
      'GET /users body',
    );
    expect(posts).toHaveLength(POSTS_COUNT);
    expect(users).toHaveLength(USERS_COUNT);
    const knownUserIds = new Set(users.map((user) => user.id));
    const orphanedPostIds = posts
      .filter((post) => !knownUserIds.has(post.userId))
      .map((post) => post.id);
    expect(orphanedPostIds).toEqual([]);
  },
);
