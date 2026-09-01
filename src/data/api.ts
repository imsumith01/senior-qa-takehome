import type { NewPost, Post } from '../api/schemas/post';

// Everything here was observed live; see docs/discovery/jsonplaceholder-contract.md.

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const POSTS_COUNT = 100;
export const COMMENTS_COUNT = 500;
export const ALBUMS_COUNT = 100;
export const PHOTOS_COUNT = 5000;
export const TODOS_COUNT = 200;
export const USERS_COUNT = 10;

export const PROBED_POST_ID = 1;
export const PROBED_USER_ID = 1;
export const COMMENTS_ON_POST_1 = 5;
export const TODOS_FOR_USER_1 = 20;
export const POSTS_BY_USER_1 = 10;

export const NON_EXISTENT_USER_ID = 9999;

// Ids that must all miss: boundary, negative, non-numeric, out of range.
export const MISSING_ID_PROBES = ['0', '-1', 'abc', '9999'];

// A parameter name the API has never heard of; it ignores it (discovery §4).
export const UNKNOWN_FILTER_PROBE = { nosuchfield: '1' };

// Every kind of miss, and DELETE, answers with this exact body.
export const EMPTY_OBJECT_BODY_TEXT = '{}';

// The id every POST /posts response synthesises (discovery §8).
export const SYNTHESISED_POST_ID = 101;

export const PROBE_TITLE_REPLACED = 'replaced title probe';
export const PROBE_TITLE_ONLY = 'only a title';
export const PROBE_TITLE_PATCHED = 'patched title probe';

export const MALFORMED_JSON_PROBE = '{"title": "broken",';
export const CONTENT_TYPE_JSON = 'application/json';
export const CONTENT_TYPE_PLAIN_TEXT = 'text/plain';

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

// Half the test budget, so a hung request fails naming its URL rather than as a
// bare test timeout (docs/FRAMEWORK_VALIDATION.md §2).
export const API_REQUEST_TIMEOUT_MS = 15000;
