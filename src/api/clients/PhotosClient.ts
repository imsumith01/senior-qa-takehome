import type { APIRequestContext, APIResponse } from '@playwright/test';

export class PhotosClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllPhotos(): Promise<APIResponse> {
    return this.request.get('/photos');
  }
}
