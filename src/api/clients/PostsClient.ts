import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { NewPost, Post } from '../schemas/post';

// Every method returns the raw APIResponse: tests own the status and header
// assertions, and a helper that threw on non-2xx would make the negative-path
// tests impossible to write.
export class PostsClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllPosts(): Promise<APIResponse> {
    return this.request.get('/posts');
  }

  // Accepts strings so tests can probe non-numeric and malformed ids.
  async getPostById(postId: number | string): Promise<APIResponse> {
    return this.request.get(`/posts/${postId}`);
  }

  async getCommentsForPost(postId: number): Promise<APIResponse> {
    return this.request.get(`/posts/${postId}/comments`);
  }

  async getPostsFilteredByUserId(userId: number | string): Promise<APIResponse> {
    return this.request.get('/posts', { params: { userId } });
  }

  // For probing how the API treats parameters it does not know about.
  async getPostsFilteredBy(query: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/posts', { params: query });
  }

  async createPost(newPost: NewPost): Promise<APIResponse> {
    return this.request.post('/posts', { data: newPost });
  }

  // For degenerate-body probes: sends the string exactly as given, with exactly the
  // content type given.
  async createPostFromRawBody(rawBody: string, contentType: string): Promise<APIResponse> {
    return this.request.post('/posts', {
      headers: { 'Content-Type': contentType },
      data: rawBody,
    });
  }

  async createPostWithoutBody(): Promise<APIResponse> {
    return this.request.post('/posts');
  }

  // PUT has replace semantics on this API; Partial lets tests probe what happens to
  // omitted fields.
  async replacePost(postId: number, replacement: Partial<Post>): Promise<APIResponse> {
    return this.request.put(`/posts/${postId}`, { data: replacement });
  }

  async patchPost(postId: number, changes: Partial<Post>): Promise<APIResponse> {
    return this.request.patch(`/posts/${postId}`, { data: changes });
  }

  async deletePost(postId: number): Promise<APIResponse> {
    return this.request.delete(`/posts/${postId}`);
  }
}
