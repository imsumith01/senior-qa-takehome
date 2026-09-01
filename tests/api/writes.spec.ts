import { test, expect } from '../../src/api/fixtures/test';
import { postSchema } from '../../src/api/schemas/post';
import { parseWithSchema } from '../../src/api/schemas/validate';
import {
  API_BASE_URL,
  KNOWN_POST_1,
  NEW_POST_PROBE,
  POSTS_COUNT,
  SYNTHESISED_POST_ID,
} from '../../src/data/api';

// This API simulates writes and persists nothing (discovery §5). Every test below
// therefore asserts the response contract AND the non-persistence explicitly — a
// create-then-fetch-back test would be dishonest here, because fetching back can
// only ever 404 (see "Consequences for test design" in the contract doc).

// API-011
test(
  'POST /posts echoes the payload with a synthesised id and persists nothing',
  { tag: ['@smoke', '@contract'] },
  async ({ postsClient }) => {
    // Act
    const createResponse = await postsClient.createPost(NEW_POST_PROBE);

    // Assert — the echo contract: 201, payload plus synthesised id, and a Location
    // header pointing at a URL that (next assertion) does not exist.
    expect(createResponse.status()).toBe(201);
    const createdPost = parseWithSchema(
      postSchema,
      await createResponse.json(),
      'POST /posts body',
    );
    expect(createdPost).toEqual({ ...NEW_POST_PROBE, id: SYNTHESISED_POST_ID });
    expect(createResponse.headers()['location']).toBe(
      `${API_BASE_URL}/posts/${SYNTHESISED_POST_ID}`,
    );

    // Assert — non-persistence, proven rather than assumed.
    const fetchBackResponse = await postsClient.getPostById(SYNTHESISED_POST_ID);
    expect(fetchBackResponse.status()).toBe(404);
    const collectionResponse = await postsClient.getAllPosts();
    expect(await collectionResponse.json()).toHaveLength(POSTS_COUNT);
  },
);

// API-012 — the id is computed (max + 1 over static data), never allocated: two
// consecutive creates get the same one.
test(
  'two consecutive POSTs both return the same synthesised id',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const firstResponse = await postsClient.createPost(NEW_POST_PROBE);
    const secondResponse = await postsClient.createPost(NEW_POST_PROBE);

    // Assert
    expect(firstResponse.status()).toBe(201);
    expect(secondResponse.status()).toBe(201);
    const firstPost = parseWithSchema(postSchema, await firstResponse.json(), 'first POST body');
    const secondPost = parseWithSchema(postSchema, await secondResponse.json(), 'second POST body');
    expect(firstPost.id).toBe(SYNTHESISED_POST_ID);
    expect(secondPost.id).toBe(SYNTHESISED_POST_ID);
  },
);

// API-013
test(
  'PUT /posts/1 with a full object echoes it back and persists nothing',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Arrange
    const replacement = { ...KNOWN_POST_1, title: 'replaced title probe' };

    // Act
    const replaceResponse = await postsClient.replacePost(KNOWN_POST_1.id, replacement);

    // Assert — the echo, then the original untouched.
    expect(replaceResponse.status()).toBe(200);
    expect(await replaceResponse.json()).toEqual(replacement);
    const fetchBackResponse = await postsClient.getPostById(KNOWN_POST_1.id);
    expect(await fetchBackResponse.json()).toEqual(KNOWN_POST_1);
  },
);

// API-014 — odd but observed: PUT is a replace, so fields omitted from the request
// simply vanish from the response instead of being kept or rejected.
test(
  'PUT /posts/1 with only a title drops the omitted fields from the response',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const replaceResponse = await postsClient.replacePost(KNOWN_POST_1.id, {
      title: 'only a title',
    });

    // Assert — no userId, no body: replace semantics, pinned as observed.
    expect(replaceResponse.status()).toBe(200);
    expect(await replaceResponse.json()).toEqual({ title: 'only a title', id: KNOWN_POST_1.id });
  },
);

// API-015 — PATCH is the one write that provably reads stored data: the response
// merges the sent field into the real post, leaving every unspecified field alone.
test(
  'PATCH /posts/1 changes only the sent field, leaves the rest, and persists nothing',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const patchResponse = await postsClient.patchPost(KNOWN_POST_1.id, {
      title: 'patched title probe',
    });

    // Assert — merged into the real stored post; unspecified fields intact.
    expect(patchResponse.status()).toBe(200);
    expect(await patchResponse.json()).toEqual({ ...KNOWN_POST_1, title: 'patched title probe' });

    // Assert — and still nothing persisted.
    const fetchBackResponse = await postsClient.getPostById(KNOWN_POST_1.id);
    expect(await fetchBackResponse.json()).toEqual(KNOWN_POST_1);
  },
);

// API-016
test(
  'DELETE /posts/1 returns 200 with an empty object and deletes nothing',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const deleteResponse = await postsClient.deletePost(KNOWN_POST_1.id);

    // Assert — 200 (not 204) with a literal empty object, and the post survives.
    expect(deleteResponse.status()).toBe(200);
    expect(await deleteResponse.text()).toBe('{}');
    const fetchBackResponse = await postsClient.getPostById(KNOWN_POST_1.id);
    expect(fetchBackResponse.status()).toBe(200);
    expect(await fetchBackResponse.json()).toEqual(KNOWN_POST_1);
  },
);
