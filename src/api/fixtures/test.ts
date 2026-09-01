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
  // Worker-scoped with a per-request timeout, replacing the built-in per-test
  // context; the flake evidence behind both choices is in FRAMEWORK_VALIDATION §2.
  // The API is stateless, so sharing the context does not couple tests.
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
