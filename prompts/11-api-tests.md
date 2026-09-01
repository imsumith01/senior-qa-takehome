Write the API tests from the test plan.

Reads:
- Each collection returns 200, the expected item count, and every item validates against
  its schema.
- Single resource by valid id returns 200 and a schema-valid body with the id requested.
- Nested resources return only children belonging to the parent — assert that every
  returned item's foreign key matches, not just that the array is non-empty.
- Query filtering returns only matching items, and a non-matching filter returns an empty
  array with 200, not an error.
- Cross-resource consistency: every post's userId corresponds to a real user.

Negative:
- Non-existent id returns 404 with the body you actually observed in discovery.
- Malformed ids. Assert the real behaviour, and where the API does something odd, say so
  in a comment rather than writing an assertion that pretends it's sensible.

Writes:
- POST returns the documented status and echoes the payload with an id.
- PUT and PATCH return the documented status and body, and PATCH leaves unspecified fields
  alone.
- DELETE returns the documented status.
- For each of these, add an explicit assertion or comment covering non-persistence. Do not
  write a test that creates a resource and then asserts it can be fetched back — it can't,
  and a test that appears to prove otherwise is worse than no test.

Contract:
- Content-type headers on every response.
- Response time under a sane threshold for the smoke-tagged reads.

Run everything. Show me the output and the timings. Then commit and push.
