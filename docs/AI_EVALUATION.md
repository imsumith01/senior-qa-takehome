# AI evaluation

How this exercise was actually built with an AI assistant (Claude), what the AI got
right, what it got wrong, and what made the difference. This document is assembled
from [AI_EVALUATION_LOG.md](AI_EVALUATION_LOG.md) — twelve dated entries written at
the moment each mistake was caught, per the standing rule against reconstructing
notes — and from the commit history, which embeds every prompt verbatim. Where a
claim cites a commit or log entry, it is checkable.

## Approach

The split: **I designed the harness; the AI did the work inside it.** Every artifact
in this repository — discovery documents, plan, page objects, tests, configs, CI,
these docs — was AI-generated. My contribution was the fourteen step prompts
([prompts/](../prompts/README.md)) and, more importantly, the constraints inside
them: rules written down before any code (step 1), reconnaissance before any test
(steps 4–5), a plan before any implementation (step 6), selectors only from live
observation, a mistake log written in the moment, and a dedicated step whose only
purpose was proving the suite _fails_ correctly (step 12).

The ordering was deliberate. An LLM's most dangerous failure mode is confident
recall of stale or imagined specifics, so the sequence forces observation to
precede assertion at every level: observe the site → write it down → plan from the
document → build from the plan → validate by sabotage. The log shows this wasn't
theoretical caution — the observation-first rules fired constantly (see "What did
not work").

## What worked well

- **All eight page objects landed in one pass** (`d292c08`) with identical
  structure, and needed **zero selector corrections afterwards** — every selector
  came from the discovery doc's observed table. The 22 authentication/inventory
  tests then **passed on their first execution** (`5429431`), as did all 28 API
  tests (`a6a9b98`). First-run green suites are not AI magic; they are what
  happens when nothing in the code is guessed.
- **Instrumented debugging instead of shrugging.** When the MCP browser silently
  dropped real mouse clicks during discovery, the AI attached DOM event listeners,
  ruled out an overlay with `elementFromPoint`, proved zero events were arriving,
  and switched to a workaround with the caveat documented — rather than concluding
  "the site is broken" (discovery doc, Method section; log entry 5).
- **Root-cause debugging under pressure.** The validation flake hunt ran four
  325-test bursts varying one factor at a time, killed the "too much parallelism"
  hypothesis with a controlled run, and landed on connection churn — fixed
  architecturally (worker-scoped request context, `8b54abb`), making the suite
  nearly 2× faster as a side effect. No retry, no timeout bump.
- **Self-review with teeth.** The test plan was cross-checked against the
  discovery docs before committing and failed on 13 points, all fixed pre-commit
  (`7fe5592`; log entry 9). A three-reviewer adversarial pass on the step-9 tests
  produced the most important catch of the project (the `test.fixme` error, below)
  plus the further fixes enumerated in log entry 11 and the `6c685a4` commit body.
- **Discipline that held across every commit** (21 at the time of writing, before
  this step's own): verbatim prompts in every commit body, conventional format,
  per-step slices, lint/typecheck/prettier green at every commit, and pushes after
  every commit without exception. Fittingly, the pre-commit review of _this
  document_ caught it claiming "25+ commits" — a plausible number from nowhere, in
  the very artifact cataloguing that failure mode.

## What did not work

Every entry here is in the log with its date and fix.

- **Facts recalled from memory were wrong at a remarkable rate.** Hand-written
  devDependency versions: all four that had moved since training were stale
  (eslint 9 vs actual 10, TypeScript 5.9 vs 6.0, wrong @types/node and Playwright)
  — caught by `npm ls` failing (log 2). A tsconfig pattern deprecated by
  TypeScript 6 (log 4). An ESLint config importing `@eslint/js` that was never
  installed (log 3). The lesson repeated until it stuck: **versions, flags, and
  API semantics must be observed, never recalled.**
- **A selector was asserted without observation despite the rule against it.**
  The discovery doc's prose claimed the detail page has a generic `#remove`
  button; the session had never actually seen it (the broken-click episode meant
  the button never flipped). Caught in step 7 when the page object wanted the
  selector; re-verified live in 30 seconds — it happened to be right, which makes
  it worse, not better (log 10; `280ac4f`).
- **An environment artifact nearly became a false "finding".** A dropped
  `fill('')` event made checkout appear to accept an empty last name; the AI was
  one step from documenting "Last Name is not validated" as site behaviour.
  Caught only by re-running with field values read back before each submit
  (log 6). Two timing approaches also produced garbage (a bfcache'd page made a
  login look 107 ms; the replacement scheme returned −55 s, exposing both) before
  wall-clock measurement settled it: 5019 ms vs 21 ms (log 7).
- **Over-abstraction, mild but real.** Page objects grew value-reader methods
  (`displayedTaxInDollars()`, `visibleProductNames()`, `namesOfItemsInCart()`)
  that no test ever called — label-composition assertions turned out to be both
  web-first and sufficient. The review pass deleted them as escape hatches from
  the web-first rule (`ce285b8`; log 11's review findings).
- **A guard assertion that could pass while proving nothing**: WEB-030's
  empty-cart check asserted `toHaveCount(0)` on cart rows — which is also true on
  every page that _isn't_ the cart, including mid-navigation. Caught by the
  vacuity reviewer; fixed by anchoring on the page title first (log 11).
- **CI/local divergence: none observed.** The first CI run was green
  (run 33554967712: quality-gates 17 s, api 20 s, web 58 s). That is one data
  point, not proof — the nightly schedule exists to accumulate more. Honesty
  requires reporting the absence rather than inventing an entry.

## Where AI output was actively misleading

These are the cases where the output _looked_ correct and would have survived a
casual review.

1. **The defect-detection suite that could not detect.** The AI wrote WEB-031/032
   with `test.fixme(title, body)` and documented, in confident prose, that "a
   passing fixme is reported as a failure, so the suite will announce this
   document is out of date." That is `test.fail` semantics; `test.fixme` **never
   executes the body**. The suite whose entire purpose was proving the tests have
   teeth would have executed zero assertions forever — while its own header
   lectured that "a suite that stays green against a broken user is not testing
   anything." Plausible, well-written, self-contradictory, wrong. Caught by the
   adversarial review (all three reviewers independently), fixed to `test.fail`
   and proven by run (log 11; `6c685a4`).
2. **A factual sentence contradicting the project's own documents.** The plan's
   first draft stated "neither target persists anything a test writes" — fluent,
   confident, and false: the web discovery had _proven_ SauceDemo's cart survives
   logout, and the plan's own §5 depended on that fact. Isolation comes from
   fresh browser contexts, not from a persistence property the site lacks
   (log 9).
3. **Plausible version numbers.** `"eslint": "^9.44.0"` and friends look exactly
   like real semver and passed visual inspection; every one was fabricated-stale
   (log 2). Nothing about a wrong version number looks wrong.
4. **A hardcoded `location: null`** in the API discovery script's report made
   "POST sets no Location header" look observed when the header was simply never
   read. The response's own `access-control-expose-headers: Location` contradicted
   it; a direct probe found the header present — pointing at a URL that 404s,
   which became a documented finding instead of a false absence (log 8).
5. **The lucky guess.** The `#remove` selector written from inference (above) was
   _correct_. That is the most dangerous case in this list: verification
   discipline exists precisely because being right by luck is indistinguishable,
   on the page, from being right by observation.

## What I changed and why

My interventions were process-level, and each one is visible as a change the AI
would not have made unprompted:

- **Step 9's "assert the real behaviour you observed"** forced a live check of the
  empty-cart premise instead of encoding the prompt's own assumption ("still
  allows checkout to start"). Observation found more than the premise: a
  completable $0 order and a `"Item total: $0"` formatting bug, both now pinned
(`2da2012`, WEB-030).
- **Step 12's demand for failure evidence** is why the fixture-design flake was
  found at all — it had existed since step 10 and every normal run was green over
  it (`8b54abb`; log 12).
- **The step-1 constraints became mechanical enforcement**, not advice: the lint
  config encodes the readability rules (`91b135c`), which later caught real
  issues (undeclared Node globals, an over-long test that had to be split).
- Two of my instructions were **pushed back on with evidence rather than obeyed**,
  which I count as the process working: `--shuffle` does not exist in Playwright
  1.62 (verified against `--help`, substitutes documented — `5429431`), and
  `test.fixme` — offered by my own prompt as an option — was rejected for
  `test.fail` after review proved fixme detects nothing (`6c685a4`).

## What the reconnaissance step changed

Comparing what would have been written from training-data memory against what the
live sites actually do — every one of these is a place memory-first code would
have been wrong or silently thin:

- Product item ids do **not** match display order (Backpack is id 4, Bike Light
  id 0) — `?id=` deep links and `item_N_title_link` selectors guessed from
  position would be wrong.
- Checkout inputs use **camelCase** `data-test` values (`firstName`) on a site
  that is otherwise kebab-case — a "consistent" guess would miss all three.
- The logged-out guard **interpolates the attempted path** into its message; a
  memorized static string would fail four of five routes.
- An **empty cart checks out to a confirmed $0 order**, with the subtotal
  rendered as `$0` while tax and total keep their decimals.
- `visual_user`'s prices are **randomized per page load** (including a
  one-decimal `$95.2`), which single-handedly kills screenshot testing for that
  account — and the detail page simultaneously shows the correct price.
- The cart **survives logout** (localStorage key untouched), and Reset App State
  leaves rendered Remove buttons stale until reload.
- The API: unknown filter params silently return the **entire collection**;
  PUT's echo **drops omitted fields**; POST's Location header points at a URL
  that 404s; malformed JSON yields a **500 with a leaked stack trace**, not a
  400; cached responses carry **stale rate-limit headers**; `users.geo.lat/lng`
  are strings. Six of those became tests; the stale-header finding became a
  documented _non_-assertion.
- Memory would also have "known" things that are false: the `#remove` guess,
  four dependency versions, a deprecated tsconfig idiom, `--shuffle`, and
  `test.fixme` semantics.

The two discovery documents are the single highest-leverage artifacts in the
repository: every first-run-green suite traces back to them.

## Guardrails that made the difference

- **Observe-before-you-write-a-selector.** Zero selector fixes were needed across
  the bring-up of 65 tests. The one violation of the rule (the `#remove` prose
  claim) is the exception that proves it — it slipped past intention and was
  caught by enforcement at the moment code wanted the selector.
- **The readability rules, mechanically enforced.** `no-explicit-any`, banned
  inheritance, banned assertions-as-casts, function-length and complexity caps —
  encoded in eslint so compliance is checked, not remembered. The visible cost
  (two documented `eslint-disable` blocks for journey tests, each with a written
  reason) is the system working.
- **The in-the-moment mistake log.** Twelve entries that made this document
  buildable from records. Written-at-the-end retrospectives would have lost at
  least the near-misses, which are the most instructive entries.
- **The falsification step.** Five sabotage runs proved failures are diagnosable
  from the message alone; the burst runs found the one real flake. A suite
  validated only by passing had, in fact, a defect-detection file that could
  never detect (fixme) and a fixture design that fell over at scale — both found
  only by trying to break things.
- **Adversarial review before commit** on the highest-stakes artifacts (plan,
  step-9 tests, this documentation step). Reviewer convergence — three
  independent agents flagging `test.fixme` — is a strong signal a finding is
  real.

## What I'd do differently next time

- **Run the falsification step earlier and repeatedly** — after the first suite
  exists, not at the end. The fixture flaw shipped in step 10 and was invisible
  to every green run until step 12's bursts.
- **Treat "from memory" as a taint at the tooling level**, not just as
  discipline: the version-number and flag mistakes all happened _after_ the rule
  existed. A pre-commit probe that re-checks data constants against a live
  request would convert the discipline into a gate.
- **Budget discovery for edge states, not just features** — the empty-cart
  behaviour had to be observed in a backfill session in step 9 because step 4's
  exploration followed the happy paths and the broken users, not the degenerate
  states.
- **Pin dependencies exactly** (no caret ranges) in a repo that will be reviewed
  and re-run later; the lockfile protects `npm ci`, but exact pins make the
  intent explicit.
- **Interleave narrow defect pins with the flow tests** in the same step rather
  than deferring them (WEB-024..026 remain unimplemented); fail-fast flow tests
  leave documented gaps that the pins were designed to close.
