import { test as base } from '@playwright/test';
import { PostsClient } from '../clients/PostsClient';
import { CommentsClient } from '../clients/CommentsClient';
import { UsersClient } from '../clients/UsersClient';
import { TodosClient } from '../clients/TodosClient';
import { AlbumsClient } from '../clients/AlbumsClient';
import { PhotosClient } from '../clients/PhotosClient';

interface ApiFixtures {
  postsClient: PostsClient;
  commentsClient: CommentsClient;
  usersClient: UsersClient;
  todosClient: TodosClient;
  albumsClient: AlbumsClient;
  photosClient: PhotosClient;
}

// The built-in request fixture already carries the api project's baseURL.
export const test = base.extend<ApiFixtures>({
  postsClient: async ({ request }, use) => {
    await use(new PostsClient(request));
  },
  commentsClient: async ({ request }, use) => {
    await use(new CommentsClient(request));
  },
  usersClient: async ({ request }, use) => {
    await use(new UsersClient(request));
  },
  todosClient: async ({ request }, use) => {
    await use(new TodosClient(request));
  },
  albumsClient: async ({ request }, use) => {
    await use(new AlbumsClient(request));
  },
  photosClient: async ({ request }, use) => {
    await use(new PhotosClient(request));
  },
});

export { expect } from '@playwright/test';
