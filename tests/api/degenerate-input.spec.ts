import { test, expect } from '../../src/api/fixtures/test';
import {
  CONTENT_TYPE_JSON,
  CONTENT_TYPE_PLAIN_TEXT,
  MALFORMED_JSON_PROBE,
  NEW_POST_PROBE,
  SYNTHESISED_POST_ID,
} from '../../src/data/api';

// API-017 — a malformed JSON body with a JSON content type produces a 500 (not the
// 400 a client would expect) whose body is a plain-text body-parser stack trace
// leaking server paths. That is what the API does today, so that is what this test
// requires; a fix to a proper 400 should fail here and force a contract-doc update.
test(
  'POST /posts with malformed JSON returns a 500 carrying a parser stack trace',
  { tag: ['@negative'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.createPostFromRawBody(
      MALFORMED_JSON_PROBE,
      CONTENT_TYPE_JSON,
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
      CONTENT_TYPE_PLAIN_TEXT,
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
