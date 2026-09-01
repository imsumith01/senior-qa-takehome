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

// API-001 — the smoke read carries the hang-guard timing check: generous by design,
// because latency here measures the network path, not the app (docs/TEST_PLAN.md §1).
test(
  'GET /posts answers within the hang-guard limit with 100 schema-valid posts',
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
    expect(posts).toHaveLength(POSTS_COUNT);
  },
);

// API-002 + API-003, per collection: documented count, every item schema-valid, and
// ids running 1..count with no gaps (first and last item checked).

test(
  'GET /posts returns the full collection with sequential ids',
  { tag: ['@contract'] },
  async ({ postsClient }) => {
    // Act
    const response = await postsClient.getAllPosts();

    // Assert
    expect(response.status()).toBe(200);
    const posts = parseWithSchema(postCollectionSchema, await response.json(), 'GET /posts body');
    expect(posts).toHaveLength(POSTS_COUNT);
    expect(posts[0]?.id).toBe(1);
    expect(posts[POSTS_COUNT - 1]?.id).toBe(POSTS_COUNT);
  },
);

test(
  'GET /comments returns the full collection with sequential ids',
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
    expect(comments).toHaveLength(COMMENTS_COUNT);
    expect(comments[0]?.id).toBe(1);
    expect(comments[COMMENTS_COUNT - 1]?.id).toBe(COMMENTS_COUNT);
  },
);

test(
  'GET /albums returns the full collection with sequential ids',
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
    expect(albums).toHaveLength(ALBUMS_COUNT);
    expect(albums[0]?.id).toBe(1);
    expect(albums[ALBUMS_COUNT - 1]?.id).toBe(ALBUMS_COUNT);
  },
);

test(
  'GET /photos returns the full collection with sequential ids',
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
    expect(photos).toHaveLength(PHOTOS_COUNT);
    expect(photos[0]?.id).toBe(1);
    expect(photos[PHOTOS_COUNT - 1]?.id).toBe(PHOTOS_COUNT);
  },
);

test(
  'GET /todos returns the full collection with sequential ids',
  { tag: ['@contract'] },
  async ({ todosClient }) => {
    // Act
    const response = await todosClient.getAllTodos();

    // Assert
    expect(response.status()).toBe(200);
    const todos = parseWithSchema(todoCollectionSchema, await response.json(), 'GET /todos body');
    expect(todos).toHaveLength(TODOS_COUNT);
    expect(todos[0]?.id).toBe(1);
    expect(todos[TODOS_COUNT - 1]?.id).toBe(TODOS_COUNT);
  },
);

test(
  'GET /users returns the full collection with sequential ids',
  { tag: ['@contract'] },
  async ({ usersClient }) => {
    // Act
    const response = await usersClient.getAllUsers();

    // Assert
    expect(response.status()).toBe(200);
    const users = parseWithSchema(userCollectionSchema, await response.json(), 'GET /users body');
    expect(users).toHaveLength(USERS_COUNT);
    expect(users[0]?.id).toBe(1);
    expect(users[USERS_COUNT - 1]?.id).toBe(USERS_COUNT);
  },
);
