import { test, expect } from '../../src/api/fixtures/test';
import { postCollectionSchema } from '../../src/api/schemas/post';
import { parseWithSchema } from '../../src/api/schemas/validate';
import { POSTS_BY_USER_1, POSTS_COUNT } from '../../src/data/api';

// API-008 — the count matters as much as the membership: an ignored (e.g. typo'd)
// parameter returns the whole collection with 200, so "an array of posts came back"
// proves nothing on its own.
test(
  'filtering posts by userId=1 returns exactly the ten posts that all belong to user 1',
  { tag: ['@regression', '@contract'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.getPostsFilteredByUserId(1);

    // Assert
    expect(response.status()).toBe(200);
    const posts = parseWithSchema(
      postCollectionSchema,
      await response.json(),
      'GET /posts?userId=1 body',
    );
    expect(posts).toHaveLength(POSTS_BY_USER_1);
    const strayPosts = posts.filter((post) => post.userId !== 1);
    expect(strayPosts).toEqual([]);
  },
);

// API-009
test(
  'filtering posts by a userId that matches nothing returns 200 with an empty array',
  { tag: ['@negative'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.getPostsFilteredByUserId(9999);

    // Assert — an empty result is a success, not an error.
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  },
);

// API-010 — pins the trap itself: unknown parameters are silently ignored, so a
// typo in a filter name returns the entire collection instead of failing.
test(
  'an unknown filter parameter is ignored and the full collection comes back',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.getPostsFilteredBy({ nosuchfield: '1' });

    // Assert
    expect(response.status()).toBe(200);
    const posts = parseWithSchema(
      postCollectionSchema,
      await response.json(),
      'GET /posts?nosuchfield=1 body',
    );
    expect(posts).toHaveLength(POSTS_COUNT);
  },
);
