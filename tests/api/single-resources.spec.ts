import { test, expect } from '../../src/api/fixtures/test';
import { postSchema } from '../../src/api/schemas/post';
import { parseWithSchema } from '../../src/api/schemas/validate';
import { KNOWN_POST_1, SMOKE_RESPONSE_TIME_LIMIT_MS } from '../../src/data/api';

// API-004 — the other smoke read, with the same generous hang-guard.
test(
  'GET /posts/1 answers within the hang-guard limit with the exact known post',
  { tag: ['@smoke', '@contract'] },
  async ({ postsClient }) => {
    // Act
    const startedAt = Date.now();
    const response = await postsClient.getPostById(KNOWN_POST_1.id);
    const elapsedMs = Date.now() - startedAt;

    // Assert
    expect(response.status()).toBe(200);
    expect(elapsedMs).toBeLessThan(SMOKE_RESPONSE_TIME_LIMIT_MS);
    const post = parseWithSchema(postSchema, await response.json(), 'GET /posts/1 body');
    expect(post).toEqual(KNOWN_POST_1);
  },
);

// API-005 — observed oddity, pinned rather than prettified: every kind of miss —
// out-of-range (9999), boundary (0), negative (-1), and non-numeric ('abc') — gets
// the identical 404 with a literal "{}" body. The API makes no distinction between
// "malformed id" and "well-formed id that doesn't exist", and the body is an empty
// object rather than an error message.
const missingIdProbes = ['0', '-1', 'abc', '9999'];

for (const probedId of missingIdProbes) {
  test(
    `GET /posts/${probedId} returns 404 with a literal empty-object body`,
    { tag: ['@negative', '@contract'] },
    async ({ postsClient }) => {
      // Act
      const response = await postsClient.getPostById(probedId);

      // Assert
      expect(response.status()).toBe(404);
      expect(await response.text()).toBe('{}');
    },
  );
}
