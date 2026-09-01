import { test, expect } from '../../src/api/fixtures/test';
import {
  CORS_PROBE_ORIGIN,
  EXPECTED_JSON_CONTENT_TYPE,
  KNOWN_POST_1,
  NEW_POST_PROBE,
} from '../../src/data/api';

// API-019 — content type across the three response families (collection read,
// single read, write echo). Cache-control, rate-limit numbers, and cf-cache-status
// are deliberately NOT asserted: discovery caught a Cloudflare cache HIT serving
// stale values, so those assertions would flake with cache state.
test(
  'collection, single-resource, and write responses all declare JSON with utf-8',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const collectionResponse = await postsClient.getAllPosts();
    const singleResponse = await postsClient.getPostById(KNOWN_POST_1.id);
    const writeResponse = await postsClient.createPost(NEW_POST_PROBE);

    // Assert — statuses first: this API sends the same content-type on its error
    // responses, so without them the header checks would pass on broken endpoints.
    expect(collectionResponse.status()).toBe(200);
    expect(singleResponse.status()).toBe(200);
    expect(writeResponse.status()).toBe(201);
    expect(collectionResponse.headers()['content-type']).toBe(EXPECTED_JSON_CONTENT_TYPE);
    expect(singleResponse.headers()['content-type']).toBe(EXPECTED_JSON_CONTENT_TYPE);
    expect(writeResponse.headers()['content-type']).toBe(EXPECTED_JSON_CONTENT_TYPE);
  },
);

// API-020 — the CORS contract browser consumers depend on: the Origin is echoed
// back verbatim with credentials allowed.
test(
  'sending an Origin header gets it echoed back with credentials allowed',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.getAllPostsFromOrigin(CORS_PROBE_ORIGIN);

    // Assert
    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBe(CORS_PROBE_ORIGIN);
    expect(response.headers()['access-control-allow-credentials']).toBe('true');
  },
);
