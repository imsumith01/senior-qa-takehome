import type { NewPost, Post } from '../api/schemas/post';

// Everything here was observed live; see docs/discovery/jsonplaceholder-contract.md.

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const POSTS_COUNT = 100;
export const COMMENTS_COUNT = 500;
export const ALBUMS_COUNT = 100;
export const PHOTOS_COUNT = 5000;
export const TODOS_COUNT = 200;
export const USERS_COUNT = 10;

export const COMMENTS_ON_POST_1 = 5;
export const TODOS_FOR_USER_1 = 20;
export const POSTS_BY_USER_1 = 10;

// The id every POST /posts response synthesises (max id + 1 over the static data,
// recomputed per request, never allocated — discovery §8).
export const SYNTHESISED_POST_ID = 101;

// GET /posts/1, verbatim.
export const KNOWN_POST_1: Post = {
  userId: 1,
  id: 1,
  title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
  body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
};

export const NEW_POST_PROBE: NewPost = {
  title: 'contract probe title',
  body: 'contract probe body',
  userId: 1,
};

export const EXPECTED_JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

export const CORS_PROBE_ORIGIN = 'https://example.com';

// A hang-guard for the smoke reads, not a performance benchmark: the plan excludes
// latency assertions in general (network path, not app), so this is set generously
// enough that only a stuck network or a dying service trips it.
export const SMOKE_RESPONSE_TIME_LIMIT_MS = 5000;

// Per-request timeout, deliberately half the 30 s test budget: a hung request then
// fails as "request timed out" naming its URL instead of eating the whole test and
// dying as an unexplained test timeout. Added after the framework-validation flake
// hunt caught exactly that failure mode (docs/FRAMEWORK_VALIDATION.md).
export const API_REQUEST_TIMEOUT_MS = 15000;
