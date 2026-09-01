# Self-review: hiring-decision read of this repository

Written in role: a senior QA lead who did not build this, twenty minutes on the
clock, deciding whether to advance the candidate. Findings were gathered by five
independent adversarial review passes (vacuous assertions, rule compliance,
brittleness, machine-generation tells, coverage gaps) and verified against the
files quoted. Each finding carries a disposition: **[FIXED]** items are corrected
in the commit that follows this one; **[DOCUMENTED]** items are left with the
reason they were not addressed.

## 1. The three strongest things

1. **The provenance chain is real, and it shows in the results.** Selector table
   observed live → page objects built only from it → tests that passed on their
   first execution (22 web, then 28 API, per the commit history). Most take-homes
   assert from memory and debug into passing; this one can show _why_ it didn't
   have to.
2. **The framework was validated by trying to break it, and the breakage taught
   something.** Five sabotage runs with verbatim failure output, and a flake hunt
   that didn't stop at "the network is flaky" — four controlled bursts isolated
   connection churn and produced an architectural fix (worker-scoped request
   context) with a measured 2× speedup. No retries, no timeout inflation.
3. **The honesty infrastructure.** A mistake log written at the moment of each
   error, verbatim prompts embedded in every commit, a plan with named gaps, and
   an evaluation document whose own pre-commit review caught it fabricating a
   number. You can audit this repo without trusting its author.

## 2. The three weakest — what would make me pass

1. **The flagship "defect-detection" mechanism is wrong, for the second time.**
   WEB-031/032 use `test.fail()`, and the file's header comment promises that "a
   selector rots … the verdict flips and the suite goes red." That is exactly
   backwards: under `test.fail`, _any_ failure — rotted selector, deleted demo
   account, site outage — is the expected outcome and reports **green**. The
   suite goes red only on total unexpected success. These tests cannot
   distinguish "the known defect is present" from "everything is broken." The
   first version of this file had the mirror-image error (`test.fixme`, which
   runs nothing). A candidate who twice documents, in confident prose, a safety
   mechanism that does the opposite of its description — in the very file whose
   purpose is proving the suite has teeth — is the single thing that would make
   me pass. **[FIXED — redesigned as positive pins: each test asserts the
   defective behaviour precisely (badge _stays_ 1, URL _stays_ on step two), so
   it passes while the defect exists and fails red on either a site-side fix or
   any unrelated breakage.]**
2. **The traceability system quietly lies.** The plan's inventory and matrix
   list WEB-008, WEB-017, WEB-018, and WEB-024..026 with no gap marker, and §7's
   exit criterion says "100% of planned tests pass" — but none of those six
   tests exist. The README admits it under "known limitations"; the plan, which
   is the artifact that claims to make gaps visible, does not. A traceability
   matrix that papers over a fifth of its own web inventory is worse than no
   matrix. **[FIXED — matrix and inventory rows now carry explicit
   "unimplemented" markers; the exit criterion now excludes them by name.]**
3. **A pattern of titles promising more than the assertions deliver.** "…with
   sequential ids" asserts first + last + length (id 43 missing and 42
   duplicated passes); "renders … each with a name, description, price, and
   image" asserts element counts and visibility, never content; "sorts products
   alphabetically" asserts an order identical to the page's default (a dead sort
   handler passes). Individually small; together they are the exact vacuity the
   candidate's own documentation lectures about, which makes them damning.
   **[FIXED — see §3.]**

Verdict if nothing were fixed: pass on the candidate, with regret — the process
discipline is genuinely strong, but items 1 and 3 are correctness-of-verification
failures, and that is the job.

## 3. Tests that look like they assert something but don't

- **inventory.spec.ts, A-to-Z sort**: expected order equals the untouched default
  order; the detour through `za` is never asserted, so a dead `<select>` handler
  leaves everything green. **[FIXED — the za order is now asserted before
  flipping back.]**
- **known-defects.spec.ts, both tests**: under `test.fail`, every failure mode is
  green (see §2.1); WEB-031's "deeper tripwire" assertions were additionally
  unreachable on every possible run, and guaranteed the test could only go red if
  _all_ of a user's defects were fixed simultaneously. **[FIXED — positive pins,
  one defect per test.]**
- **collections.spec.ts, all six**: "sequential ids" checked as first+last+length
  only. **[FIXED — full id sequence asserted; and the /posts block that
  duplicated API-001's fetch is folded into API-001.]**
- **inventory.spec.ts, render test**: counts and visibility only; blank
  descriptions or a wrong-image regression (the exact problem_user failure mode)
  would pass. **[FIXED — descriptions asserted verbatim; image src asserted
  against the observed asset path, now recorded in the catalogue data.]**
- **relations.spec.ts, API-021**: referential integrity is vacuously true on an
  empty response; no status or size anchor. **[FIXED — status and length anchors
  added; filtered-response statuses also added to API-006/007.]**
- **headers.spec.ts, API-019**: asserts content-type without statuses — this API
  serves the same content-type on its 404s, so all three "response families"
  could be broken and green. **[FIXED — statuses asserted.]**
- **fixtures/test.ts, loggedInAsStandardUser**: never verifies login succeeded;
  a rejected login surfaces as a mystery timeout in whatever the test touches
  next. **[FIXED — the fixture now anchors on the inventory URL before yielding.]**

## 4. Quiet violations of the CLAUDE.md readability rules

- **Rule 9 (no magic values), systematic**: badge literals `'1'`/`'2'` across
  four spec files (one file already used the compliant `String(basket.length)`,
  proving the author knew better); inline probe strings in writes.spec.ts
  (`'replaced title probe'`, `'only a title'`, `'patched title probe'` — the
  last two duplicated between act and assert within the same test); malformed
  body and content-type literals in degenerate-input.spec.ts; `9999` and
  `{ nosuchfield: '1' }` in filters.spec.ts; `'{}'` duplicated in two files;
  probe id `1` hardcoded throughout relations while its count constants live in
  src/data. **[FIXED — all hoisted to src/data/api.ts and
  src/data/messages.ts, or derived from the basket under test.]**
- **Rule 13 (strict AAA)**: assertions living under `// Act` comments
  (purchase-journey basket loop, known-defects); fresh API calls living under
  `// Assert` comments (four spots in writes.spec.ts); unlabelled guard
  assertions under bare `// Arrange`. **[FIXED — sections restructured or
  labelled as the repo's own better examples already do.]**
- **Rule 14 (comments restate code)**: stage narration like `// Act — log in.`
  above `logInAs(...)`. **[FIXED — restating clauses trimmed; explanatory ones
  kept.]**
- **Rule 2 ("about 20 lines")**: the lint cap is 25 while its comment claimed to
  enforce rule 2 — a quiet relaxation. **[FIXED — the comment now states
  honestly that 25 is the enforcement tolerance chosen for the rule's
  "about".]**
- **Rule 9 (letter of it)**: `missingIdProbes` was a named constant but lived in
  the spec, not the test-data file the rule names. **[FIXED — moved.]**

## 5. Brittleness and data coincidences

- **Expected A-Z order derived via `localeCompare`** while nothing establishes
  that this is the site's comparator — they agree only because the six names are
  plain ASCII. **[DOCUMENTED — with the za-order now asserted (§3), any
  comparator divergence surfaces as a loud failure on real data; switching
  comparators would be guessing at the site's implementation, which this repo
  refuses to do on principle.]**
- **WEB-011 relied on `FULL_CATALOGUE` declaration order coinciding with display
  order** — an invariant enforced nowhere. **[FIXED — cheap: expectations are
  now derived by sorting the catalogue, so declaration order is meaningless.]**
- **Image-src pins now added by §3's fix carry hashed asset filenames**
  (`sauce-backpack-1200x1500-CjRW-Djj.jpg`) that will break on a site redeploy.
  **[DOCUMENTED — accepted deliberately: it is the same contract-pin philosophy
  as pinning prices; a redeploy that changes assets _should_ fail the catalogue
  test and trigger a data refresh.]**
- **Every catalogue price ends in .99**, which makes the observed tax rounding
  unable to distinguish half-up from ceiling — already documented in discovery
  §8. **[DOCUMENTED — not addressable from outside the app.]**
- **The synthesised POST id 101 and counts 100/500/5000/etc.** are deliberate,
  documented contract pins, not coincidences. No change.

## 6. What reads as machine-generated rather than authored

- **A duplicated /posts collection test** that re-ran API-001's exact fetch and
  parse to complete a six-way pattern. **[FIXED — folded into API-001.]** The
  remaining five per-collection tests are risk-justified (distinct endpoints and
  data) and deliberately unrolled; the plan now says so instead of claiming they
  are parameterized.
- **The test.fail rationale recycled near-verbatim across five artifacts**, and
  the two plan rows for WEB-031/032 differing by one word. **[FIXED — the
  mechanism is explained once in KNOWN_DEFECTS.md; other sites reduced to a line
  and a link; the plan rows now describe what each flow uniquely pins.]**
- **Identical provenance trailers** stamped on all six schema files and most
  data files. **[FIXED — stated once; per-file quirk notes kept, because those
  vary and earn their place.]**
- **The connection-churn/timeout story told in five places** with recycled
  sentences (fixture comment, data comment, validation doc, log, README).
  **[FIXED — full story lives in FRAMEWORK_VALIDATION.md; code comments reduced
  to a line plus the reference.]**
- **A recycled rhetorical formula** ("odd but observed, pinned rather than
  prettified" and the broader X-not-Y cadence) as comment openers in three API
  specs. **[FIXED — reworded to say the specific thing in each place.]**
- **Build-session trailers ("added in step 9/11") leaking into the plan**, a
  requirements artifact narrating its own generation session. **[FIXED —
  removed; the commit history already carries provenance.]**

## 7. Coverage gaps the plan doesn't acknowledge

All are now named either in the plan or here; none are silently absent anymore.
None are implemented in the follow-up commit — each carries its reason.

- **jsonplaceholder's query surface is entirely unprobed** (`_page`, `_limit`,
  `_sort`, `_order`, `_embed`, `_expand`, `q`) while the plan claimed "the full
  read contract." **[DOCUMENTED — plan wording corrected and an out-of-scope row
  added; probing it right is a discovery pass of its own, not a quick test.]**
- **Keyboard submission** (Enter in the login and checkout forms — the most
  common real-user gesture on a login form) is never exercised. **[DOCUMENTED —
  plan gap row added; requires observing the form's Enter behaviour first.]**
- **Cookie forgery**: auth is a plain `session-username` cookie and only the
  absent-cookie side is tested; nothing pins whether `locked_out_user` or a
  garbage value in the cookie is admitted. **[DOCUMENTED — plan gap row added;
  needs live observation before an expectation can honestly be encoded.]**
- **The product detail page is missing from the access-control sweep** (five
  routes guarded, the sixth never checked) and **invalid `?id=` deep links**
  (e.g. `?id=99`) are unexplored — discovery flagged both and the plan dropped
  them. **[DOCUMENTED — restored as named plan gaps.]**
- **Add-to-cart from the detail page** — a distinct code path with its own
  generic controls — is never used as the acting path; WEB-016 only reads its
  state. **[DOCUMENTED — plan gap row added; a candidate test is sketched
  there.]**
- **Mid-checkout deep links while logged in** (straight to step two or the
  confirmation page) and **sort-state persistence across navigation** are
  untested and unobserved. **[DOCUMENTED — plan gap rows added.]**
- **Single-resource reads and 404 semantics are tested only on /posts**; the
  representativeness assumption was silent, unlike the equivalent (argued)
  assumption for writes. **[DOCUMENTED — assumption now stated in the plan
  matrix.]**
- **The checkout form's "only checks non-emptiness" claim** rests on one happy
  value; length/unicode/format robustness is unprobed. **[DOCUMENTED — §4 claim
  softened to what was observed.]**

## Disposition summary

Fixed in the follow-up commit: everything in §3, §4, and §6, plus the two cheap
items in §5. Documented with reasons, not fixed: the remainder of §5 and all of
§7 — each requires either live observation this review's timebox doesn't allow,
or is an accepted pin with the trade-off stated.
