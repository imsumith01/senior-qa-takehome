Explore https://jsonplaceholder.typicode.com/ the same way. Use curl or a scratch script,
not the browser. Write no test code. The output is a document.

Investigate and record:

1. Every resource collection: /posts, /comments, /albums, /photos, /todos, /users. For
   each: item count, exact response shape with field types, and one real sample item.
2. Single-resource GETs. Status codes and bodies for a valid id, id 0, a negative id, a
   non-numeric id, and an id well past the end of the collection.
3. Nested routes such as /posts/1/comments and /users/1/todos. Confirm the nested result
   matches what you get by filtering the parent collection with a query parameter.
4. Query filtering, e.g. ?userId=1. Test a value that matches nothing.
5. Write operations. POST, PUT, PATCH, DELETE against /posts. For each, record: status
   code, response body, and critically — whether the change actually persists. Verify
   persistence by doing a follow-up GET, not by assuming.
6. What happens on POST with a malformed body, a missing content-type, or no body at all.
7. Response headers worth asserting on: content-type, caching, CORS, and any rate-limit
   headers.
8. Note whether ids returned by POST are stable or synthesised.

Write it to `docs/discovery/jsonplaceholder-contract.md`.

Add a section titled "Consequences for test design" that answers directly: given that this
API does not persist writes, what can we honestly assert, and what would be a test that
appears to pass but actually proves nothing? I want this reasoning visible — it's a large
part of what's being assessed.

Then commit and push.
