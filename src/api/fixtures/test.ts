import { test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from '../../data/api';
import { PostsClient } from '../clients/PostsClient';
import { CommentsClient } from '../clients/CommentsClient';
import { UsersClient } from '../clients/UsersClient';
import { TodosClient } from '../clients/TodosClient';
import { AlbumsClient } from '../clients/AlbumsClient';
import { PhotosClient } from '../clients/PhotosClient';

interface ApiWorkerFixtures {
  apiRequest: APIRequestContext;
}

interface ApiFixtures {
  postsClient: PostsClient;
  commentsClient: CommentsClient;
  usersClient: UsersClient;
  todosClient: TodosClient;
  albumsClient: AlbumsClient;
  photosClient: PhotosClient;
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // A dedicated request context instead of the built-in one, for two reasons found
  // during framework validation (docs/FRAMEWORK_VALIDATION.md):
  // 1. The per-request timeout — half the test budget — makes a hung request fail
  //    as "request timed out" naming its URL, not as an unexplained test timeout.
  // 2. Worker scope: the built-in fixture opens a fresh context (fresh TLS
  //    connections) per test, and a repeat-run burst of hundreds of new
  //    connections to one host is what edge proxies throttle. One context per
  //    worker reuses connections. The API is stateless, so tests stay isolated.
  apiRequest: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: API_BASE_URL,
        timeout: API_REQUEST_TIMEOUT_MS,
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],
  postsClient: async ({ apiRequest }, use) => {
    await use(new PostsClient(apiRequest));
  },
  commentsClient: async ({ apiRequest }, use) => {
    await use(new CommentsClient(apiRequest));
  },
  usersClient: async ({ apiRequest }, use) => {
    await use(new UsersClient(apiRequest));
  },
  todosClient: async ({ apiRequest }, use) => {
    await use(new TodosClient(apiRequest));
  },
  albumsClient: async ({ apiRequest }, use) => {
    await use(new AlbumsClient(apiRequest));
  },
  photosClient: async ({ apiRequest }, use) => {
    await use(new PhotosClient(apiRequest));
  },
});

export { expect } from '@playwright/test';
