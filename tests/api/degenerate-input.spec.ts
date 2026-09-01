import { test, expect } from '../../src/api/fixtures/test';
import { NEW_POST_PROBE, SYNTHESISED_POST_ID } from '../../src/data/api';

// API-017 — odd but observed, pinned rather than prettified: a malformed JSON body
// with a JSON content type produces a 500 (not a 400) whose body is a plain-text
// body-parser stack trace leaking server paths. If the API ever starts returning a
// proper 400, this test should fail and force the contract doc to be updated.
test(
  'POST /posts with malformed JSON returns a 500 carrying a parser stack trace',
  { tag: ['@negative'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.createPostFromRawBody(
      '{"title": "broken",',
      'application/json',
    );

    // Assert
    expect(response.status()).toBe(500);
    expect(await response.text()).toContain('SyntaxError');
  },
);

// API-018 — without a JSON content type the body-parser never engages: the payload
// is ignored wholesale and only the synthesised id comes back. Same for no body at
// all.
test(
  'POST /posts ignores the body entirely when the content type is not JSON',
  { tag: ['@negative'] },
  async ({ postsClient }) => {
    // Act
    const withWrongContentType = await postsClient.createPostFromRawBody(
      JSON.stringify(NEW_POST_PROBE),
      'text/plain',
    );

    // Assert
    expect(withWrongContentType.status()).toBe(201);
    expect(await withWrongContentType.json()).toEqual({ id: SYNTHESISED_POST_ID });

    // Act — no body at all behaves identically.
    const withNoBody = await postsClient.createPostWithoutBody();

    // Assert
    expect(withNoBody.status()).toBe(201);
    expect(await withNoBody.json()).toEqual({ id: SYNTHESISED_POST_ID });
  },
);
