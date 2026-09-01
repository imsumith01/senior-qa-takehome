import { test, expect } from '../../src/api/fixtures/test';
import { postCollectionSchema } from '../../src/api/schemas/post';
import { commentCollectionSchema } from '../../src/api/schemas/comment';
import { albumCollectionSchema } from '../../src/api/schemas/album';
import { photoCollectionSchema } from '../../src/api/schemas/photo';
import { todoCollectionSchema } from '../../src/api/schemas/todo';
import { userCollectionSchema } from '../../src/api/schemas/user';
import { parseWithSchema } from '../../src/api/schemas/validate';
import {
  POSTS_COUNT,
  COMMENTS_COUNT,
  ALBUMS_COUNT,
  PHOTOS_COUNT,
  TODOS_COUNT,
  USERS_COUNT,
  SMOKE_RESPONSE_TIME_LIMIT_MS,
} from '../../src/data/api';

// First+last-id checks cannot see a gap or duplicate in the middle, so the whole
// sequence is compared.
function sequentialIdsUpTo(count: number): number[] {
  return Array.from({ length: count }, (unusedValue, index) => index + 1);
}

// The five per-collection tests below are deliberately written out rather than
// looped: their zod output types differ, and the generics needed to unify them
// would trade real readability for brevity (CLAUDE.md rule 15). /posts itself is
// covered by API-001, which owns the smoke tag and the hang-guard.

// API-001 + API-002 + API-003 for /posts. The timing check is a hang-guard for a
// stuck network or dying service, not a latency benchmark (docs/TEST_PLAN.md §1).
test(
  'GET /posts answers within the hang-guard limit with 100 schema-valid, gap-free posts',
  { tag: ['@smoke', '@contract'] },
  async ({ postsClient }) => {
    // Act
    const startedAt = Date.now();
    const response = await postsClient.getAllPosts();
    const elapsedMs = Date.now() - startedAt;

    // Assert
    expect(response.status()).toBe(200);
    expect(elapsedMs).toBeLessThan(SMOKE_RESPONSE_TIME_LIMIT_MS);
    const posts = parseWithSchema(postCollectionSchema, await response.json(), 'GET /posts body');
    expect(posts.map((post) => post.id)).toEqual(sequentialIdsUpTo(POSTS_COUNT));
  },
);

// API-002 + API-003
test(
  'GET /comments returns the full collection with ids running 1..500 gap-free',
  { tag: ['@contract'] },
  async ({ commentsClient }) => {
    // Act
    const response = await commentsClient.getAllComments();

    // Assert
    expect(response.status()).toBe(200);
    const comments = parseWithSchema(
      commentCollectionSchema,
      await response.json(),
      'GET /comments body',
    );
    expect(comments.map((comment) => comment.id)).toEqual(sequentialIdsUpTo(COMMENTS_COUNT));
  },
);

// API-002 + API-003
test(
  'GET /albums returns the full collection with ids running 1..100 gap-free',
  { tag: ['@contract'] },
  async ({ albumsClient }) => {
    // Act
    const response = await albumsClient.getAllAlbums();

    // Assert
    expect(response.status()).toBe(200);
    const albums = parseWithSchema(
      albumCollectionSchema,
      await response.json(),
      'GET /albums body',
    );
    expect(albums.map((album) => album.id)).toEqual(sequentialIdsUpTo(ALBUMS_COUNT));
  },
);

// API-002 + API-003
test(
  'GET /photos returns the full collection with ids running 1..5000 gap-free',
  { tag: ['@contract'] },
  async ({ photosClient }) => {
    // Act
    const response = await photosClient.getAllPhotos();

    // Assert
    expect(response.status()).toBe(200);
    const photos = parseWithSchema(
      photoCollectionSchema,
      await response.json(),
      'GET /photos body',
    );
    expect(photos.map((photo) => photo.id)).toEqual(sequentialIdsUpTo(PHOTOS_COUNT));
  },
);

// API-002 + API-003
test(
  'GET /todos returns the full collection with ids running 1..200 gap-free',
  { tag: ['@contract'] },
  async ({ todosClient }) => {
    // Act
    const response = await todosClient.getAllTodos();

    // Assert
    expect(response.status()).toBe(200);
    const todos = parseWithSchema(todoCollectionSchema, await response.json(), 'GET /todos body');
    expect(todos.map((todo) => todo.id)).toEqual(sequentialIdsUpTo(TODOS_COUNT));
  },
);

// API-002 + API-003
test(
  'GET /users returns the full collection with ids running 1..10 gap-free',
  { tag: ['@contract'] },
  async ({ usersClient }) => {
    // Act
    const response = await usersClient.getAllUsers();

    // Assert
    expect(response.status()).toBe(200);
    const users = parseWithSchema(userCollectionSchema, await response.json(), 'GET /users body');
    expect(users.map((user) => user.id)).toEqual(sequentialIdsUpTo(USERS_COUNT));
  },
);
