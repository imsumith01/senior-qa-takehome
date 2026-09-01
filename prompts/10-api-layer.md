Build the API layer.

1. `src/api/clients/` with one small client per resource (PostsClient, UsersClient,
   CommentsClient, TodosClient). Each:
   - Takes Playwright's `APIRequestContext` in the constructor.
   - Has one method per endpoint, named for the operation (`getPostById`, `createPost`).
   - Returns the raw `APIResponse` so tests can assert on status and headers, not just the
     body. Do not hide the status code behind a helper that throws.
   - Contains no assertions and no try/catch.

2. `src/api/schemas/` with a runtime schema per resource. Use zod — it's the most readable
   option and the schemas double as documentation. Derive the TypeScript types from the
   schemas so there's one source of truth.

3. A single small helper that validates a response body against a schema and produces a
   readable failure message naming the offending field. One function, no class, no custom
   error type.

4. A fixture exposing the clients to tests.

Explain in the commit message why runtime schema validation is worth having when
TypeScript types already exist — a reviewer will ask.

Then commit and push.
