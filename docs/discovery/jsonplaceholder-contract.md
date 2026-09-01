# jsonplaceholder.typicode.com contract notes

Recorded 2026-09-01 by a scratch Node script (global `fetch`, sequential requests —
about 35 total, gentle pace). Every status code, body, header, and count below is from
live responses observed in this session. The raw JSON report the script produced was
kept during the session but not committed; the script itself was scratch and is not
part of the framework.

Base URL: `https://jsonplaceholder.typicode.com`. Server stack, as the responses
themselves reveal: Express (`x-powered-by: Express`) behind heroku-router and
Cloudflare, backed by static data with json-server-style routing.

## 1. Resource collections

All six collections return `200` with a JSON array. Shapes were computed from every
item, not just the first — all six collections are uniform (every item matches the
signature). Ids run `1..count` with no gaps (first and last ids verified).

| Collection  | Count | Shape (field: type)                                                                                                                                                                                                     |
| ----------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/posts`    | 100   | `userId: number, id: number, title: string, body: string`                                                                                                                                                               |
| `/comments` | 500   | `postId: number, id: number, name: string, email: string, body: string`                                                                                                                                                 |
| `/albums`   | 100   | `userId: number, id: number, title: string`                                                                                                                                                                             |
| `/photos`   | 5000  | `albumId: number, id: number, title: string, url: string, thumbnailUrl: string`                                                                                                                                         |
| `/todos`    | 200   | `userId: number, id: number, title: string, completed: boolean`                                                                                                                                                         |
| `/users`    | 10    | `id: number, name: string, username: string, email: string, address: {street, suite, city, zipcode: string, geo: {lat: string, lng: string}}, phone: string, website: string, company: {name, catchPhrase, bs: string}` |

Details worth keeping:

- `users.address.geo.lat` and `.lng` are **strings**, not numbers (`"-37.3159"`).
- Photo `url`/`thumbnailUrl` point at `https://via.placeholder.com/…` — a third-party
  host; do not assert those URLs resolve, only their shape.
- Post/comment text is lorem-ipsum Latin and contains literal `\n` newlines inside
  string values.

Real sample item from each collection (verbatim):

```json
// /posts/1
{ "userId": 1, "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto" }

// /comments/1
{ "postId": 1, "id": 1, "name": "id labore ex et quam laborum", "email": "Eliseo@gardner.biz",
  "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium" }

// /albums/1
{ "userId": 1, "id": 1, "title": "quidem molestiae enim" }

// /photos/1
{ "albumId": 1, "id": 1, "title": "accusamus beatae ad facilis cum similique qui sunt",
  "url": "https://via.placeholder.com/600/92c952", "thumbnailUrl": "https://via.placeholder.com/150/92c952" }

// /todos/1
{ "userId": 1, "id": 1, "title": "delectus aut autem", "completed": false }

// /users/1
{ "id": 1, "name": "Leanne Graham", "username": "Bret", "email": "Sincere@april.biz",
  "address": { "street": "Kulas Light", "suite": "Apt. 556", "city": "Gwenborough",
    "zipcode": "92998-3874", "geo": { "lat": "-37.3159", "lng": "81.1496" } },
  "phone": "1-770-736-8031 x56442", "website": "hildegard.org",
  "company": { "name": "Romaguera-Crona", "catchPhrase": "Multi-layered client-server neural-net",
    "bs": "harness real-time e-markets" } }
```

## 2. Single-resource GETs (`/posts/{id}`)

| id     | Status | Body                 |
| ------ | ------ | -------------------- |
| `1`    | 200    | the full post object |
| `0`    | 404    | `{}`                 |
| `-1`   | 404    | `{}`                 |
| `abc`  | 404    | `{}`                 |
| `9999` | 404    | `{}`                 |

Every miss is the same: **404 with a literal empty JSON object `{}`** as the body —
not an empty body, not an error message, and no distinction between "malformed id"
and "well-formed id that doesn't exist".

## 3. Nested routes vs query filters

Both pairs tested returned byte-identical JSON (deep equality of the full arrays):

| Nested route        | Equivalent filter    | Count | Identical |
| ------------------- | -------------------- | ----- | --------- |
| `/posts/1/comments` | `/comments?postId=1` | 5     | yes       |
| `/users/1/todos`    | `/todos?userId=1`    | 20    | yes       |

## 4. Query filtering

| Request                | Status | Result                                                      |
| ---------------------- | ------ | ----------------------------------------------------------- |
| `/posts?userId=1`      | 200    | 10 posts, every `userId` is 1                               |
| `/posts?userId=9999`   | 200    | `[]` — empty array, not 404                                 |
| `/posts?userId=abc`    | 200    | `[]` — no type error, just no match                         |
| `/posts?nosuchfield=1` | 200    | **all 100 posts** — unknown parameters are silently ignored |

That last row is a trap: a typo in a filter parameter name doesn't fail, it returns
the entire collection. A test that asserts "response is an array with items" after
filtering would pass on a typo'd parameter while testing nothing.

## 5. Write operations against `/posts` — and what actually persists

| Operation                            | Status | Response body (observed)                                                                                | Follow-up GET                                             | Persisted? |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| `POST /posts` (JSON body)            | 201    | echo of sent fields + `"id": 101`                                                                       | `GET /posts/101` → **404 `{}`**; `/posts` count still 100 | **No**     |
| `PUT /posts/1` (full object)         | 200    | echo of the sent object                                                                                 | `GET /posts/1` → original title                           | **No**     |
| `PUT /posts/1` (only `{"title": …}`) | 200    | `{"title": "only a title", "id": 1}` — **replace semantics**: omitted fields are gone from the response | `GET /posts/1` → original intact                          | **No**     |
| `PATCH /posts/1` (`{"title": …}`)    | 200    | the **real stored post with only the title replaced** — merge semantics against actual data             | `GET /posts/1` → original title                           | **No**     |
| `DELETE /posts/1`                    | 200    | `{}`                                                                                                    | `GET /posts/1` → 200, original post still there           | **No**     |

Extra observations:

- POST sets a `Location: https://jsonplaceholder.typicode.com/posts/101` header —
  which points at a URL that returns 404. The header is also listed in
  `access-control-expose-headers: Location`.
- PUT vs PATCH semantics are real server logic even though nothing persists: PUT's
  response contains only what you sent (plus `id`), PATCH's response is the stored
  resource merged with your fields. This asymmetry is assertable.
- DELETE returns 200 (not 204) with body `{}`.

## 6. Degenerate POSTs

| Case                                                                    | Status  | Body                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Malformed JSON with `Content-Type: application/json`                    | **500** | a full Express/body-parser **stack trace as plain text**, starting `SyntaxError: Unexpected end of JSON input` and leaking server paths (`/app/node_modules/body-parser/…`) |
| Valid JSON string, but content-type `text/plain` (no JSON content-type) | 201     | `{"id": 101}` — the body is ignored entirely, only the synthesised id comes back                                                                                            |
| No body at all                                                          | 201     | `{"id": 101}`                                                                                                                                                               |

So the parse error path is 500 (not 400), and anything the JSON body-parser doesn't
handle is simply treated as "no fields".

## 7. Response headers worth asserting on (all observed)

On `GET /posts` (Cloudflare cache HIT):

- `content-type: application/json; charset=utf-8`
- `cache-control: max-age=43200` (12 h) — alongside the contradictory legacy pair
  `expires: -1` and `pragma: no-cache`
- `etag: W/"6b80-…"` (weak etag), `age`, `cf-cache-status: HIT`
- `x-ratelimit-limit: 1000`, `x-ratelimit-remaining`, `x-ratelimit-reset` —
  **cached responses carry stale rate-limit values** (a HIT showed a reset timestamp
  months old while a fresh POST showed a current one); do not assert on the numbers
- `server: cloudflare`, `via: 2.0 heroku-router`, `x-powered-by: Express`,
  `x-content-type-options: nosniff`

On `POST /posts`: `cache-control: no-cache`, `cf-cache-status: DYNAMIC`,
`access-control-expose-headers: Location`, plus the same content-type and
rate-limit families.

CORS: with an `Origin` header, responses echo it back
(`access-control-allow-origin: https://example.com`) with
`access-control-allow-credentials: true` and `vary: Origin, Accept-Encoding`;
without an `Origin`, no ACAO header appears. Preflight
`OPTIONS /posts` returned **204** with
`access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE` and the requested
headers echoed.

Safe header assertions: content-type on JSON endpoints; presence (not values) of the
rate-limit family; CORS echo when sending an Origin. Unsafe: cache-control
differences between HIT and MISS, `age`, rate-limit numbers, anything Cloudflare
varies.

## 8. Are POSTed ids stable or synthesised?

Synthesised, statelessly. Two consecutive POSTs both returned `"id": 101` — the
value is `max(existing ids) + 1` over the static dataset (100 posts), recomputed per
request, never allocated. Nothing increments; nothing is reserved; `/posts/101`
still 404s afterwards.

## Consequences for test design

This API is a **stateless simulator of a REST API**, not a database-backed one.
Every write returns a plausible response and changes nothing. That must shape what
the suite claims to prove.

**What we can honestly assert:**

- The full read-side contract: counts, uniform shapes and field types, id
  sequencing, single-resource retrieval, 404-with-`{}` for every kind of missing id,
  nested-route ≡ query-filter equivalence, empty-array (never 404) for unmatched
  filters.
- The write-side **response contract**: POST returns 201 with an echo plus
  synthesised `id: 101` and a `Location` header; PUT echoes exactly what was sent
  (replace semantics — omitted fields disappear from the response); PATCH returns
  the stored resource with only the sent fields changed (merge semantics — this one
  provably reads real stored data); DELETE returns 200 `{}`.
- **Non-persistence itself, as a documented property**: POST-then-GET-101 returns
  404; PUT/PATCH-then-GET returns the original; DELETE-then-GET still returns the
  resource. These are honest, stable assertions _about the simulator_ — and they
  are the suite's proof that it verified persistence instead of assuming it.
- Degenerate input behaviour: 500 + stack trace for malformed JSON, body ignored
  without a JSON content-type.
- Header contract within the safe list above.

**Tests that would appear to pass but prove nothing:**

- `POST /posts` → assert 201 and `id` present → _conclude "creating posts works"._
  This passes forever while no post is ever created. The assertion tests the echo,
  not the effect. Honest version: assert the response contract _and_ assert the
  follow-up GET returns 404, and name the test accordingly ("returns a synthesised
  id and does not persist").
- `PUT /posts/1` with a new title → assert the response contains the new title →
  _conclude "updates are applied"._ The response is a mirror; `GET /posts/1` still
  has the old title. The assertion can't fail even if the server discarded
  everything — which it did.
- `DELETE /posts/1` → assert status 200 → _conclude "deletion works"._ 200 here
  means "request received", nothing more; the resource is still retrievable one
  request later.
- Any filter test that only asserts "got an array of posts" — a typo'd parameter
  name returns all 100 posts with status 200 (section 4), so shape-only assertions
  pass on a broken filter. Filters must assert that _every_ returned item matches
  the predicate **and** that the count is the expected one.
- Asserting rate-limit numbers or cache-status: values differ between Cloudflare
  HITs and MISSes, so such a test alternates between passing and failing without
  anything changing — the inverse failure mode, flakiness that proves nothing.

**Design decisions that follow:**

- Name write tests after what they demonstrably prove: "POST echoes the payload and
  synthesises id 101", not "POST creates a post". The test name is part of the
  claim.
- Chain write → read only to assert **non**-persistence, never to fetch created
  state. There is no scenario here where a test may depend on an earlier test's
  write.
- Because no state is shared or mutated, the API suite is trivially safe to run
  fully parallel and needs no setup/teardown — worth exploiting, and worth a comment
  in the suite so a reader knows it's deliberate, not an oversight.
- Idempotency is assertable for free: identical requests return identical responses
  (two POSTs both yield id 101).
- Treat PATCH as the one write that provably touches stored data (its response
  merges into the real resource) — it is the strongest write-side assertion
  available on this API.
