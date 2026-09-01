import type { APIRequestContext, APIResponse } from '@playwright/test';

export class AlbumsClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllAlbums(): Promise<APIResponse> {
    return this.request.get('/albums');
  }
}
