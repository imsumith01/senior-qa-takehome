import { test, expect } from '../../src/api/fixtures/test';
import { postSchema } from '../../src/api/schemas/post';
import { parseWithSchema } from '../../src/api/schemas/validate';
import {
  EMPTY_OBJECT_BODY_TEXT,
  KNOWN_POST_1,
  MISSING_ID_PROBES,
  SMOKE_RESPONSE_TIME_LIMIT_MS,
} from '../../src/data/api';

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

// API-005 — every kind of miss — out-of-range, boundary zero, negative, and
// non-numeric — gets the identical 404 with a literal "{}" body. The API cannot
// tell a caller whether the id was malformed or merely absent, and the body is an
// empty object rather than an error message; consumers get no diagnostic at all.
for (const probedId of MISSING_ID_PROBES) {
  test(
    `GET /posts/${probedId} returns 404 with a literal empty-object body`,
    { tag: ['@negative', '@contract'] },
    async ({ postsClient }) => {
      // Act
      const response = await postsClient.getPostById(probedId);

      // Assert
      expect(response.status()).toBe(404);
      expect(await response.text()).toBe(EMPTY_OBJECT_BODY_TEXT);
    },
  );
}
