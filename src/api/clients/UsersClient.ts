import type { APIRequestContext, APIResponse } from '@playwright/test';

export class UsersClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllUsers(): Promise<APIResponse> {
    return this.request.get('/users');
  }

  async getTodosForUser(userId: number): Promise<APIResponse> {
    return this.request.get(`/users/${userId}/todos`);
  }
}
