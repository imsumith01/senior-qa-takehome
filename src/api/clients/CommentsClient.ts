import type { APIRequestContext, APIResponse } from '@playwright/test';

export class CommentsClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllComments(): Promise<APIResponse> {
    return this.request.get('/comments');
  }

  async getCommentsFilteredByPostId(postId: number | string): Promise<APIResponse> {
    return this.request.get('/comments', { params: { postId } });
  }
}
