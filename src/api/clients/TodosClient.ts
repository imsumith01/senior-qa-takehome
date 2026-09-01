import type { APIRequestContext, APIResponse } from '@playwright/test';

export class TodosClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllTodos(): Promise<APIResponse> {
    return this.request.get('/todos');
  }

  async getTodosFilteredByUserId(userId: number | string): Promise<APIResponse> {
    return this.request.get('/todos', { params: { userId } });
  }
}
