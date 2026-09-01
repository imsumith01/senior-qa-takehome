# AI Evaluation Log

A running log of mistakes made while building this framework: wrong selectors, false
assumptions about the targets, tests that passed for the wrong reason, code rewritten
for readability. Entries are appended at the moment the mistake is caught, never
reconstructed after the fact.

Entry format:

```
## YYYY-MM-DD — short title
- What was produced:
- Why it was wrong:
- How it was caught:
- What the fix was:
```

## 2026-09-01 — commit message temp file at a path git could not read

- What was produced: the step-1 commit message was written to the session scratchpad, a
  temp directory nested roughly 260 characters deep on Windows.
- Why it was wrong: `git commit -F` failed with `fatal: could not read log file ...
Filename too long` — Windows' MAX_PATH limit, which the scratchpad path exceeds.
- How it was caught: the commit command exited with code 128 on the first attempt.
- What the fix was: copy the message to `.git/COMMIT_MSG.txt` (short path, never
  tracked) and commit from there. That location is the standing pattern for all future
  commits in this repo.

## 2026-09-01 — devDependencies versions written from memory, all outdated

- What was produced: a hand-rewritten `package.json` whose devDependencies block listed
  versions recalled from training data (`eslint ^9.44.0`, `typescript ^5.9.4`,
  `@types/node ^24.14.1`, `@playwright/test ^1.58.2`) instead of what npm had just
  installed (eslint 10.9.1, typescript 6.0.3, @types/node 26.4.0, playwright 1.62.1).
- Why it was wrong: the ranges no longer matched the lockfile, so the dependency tree
  was invalid, and the numbers were fabricated rather than observed.
- How it was caught: `npm ls --depth=0` failed with ELSPROBLEMS, flagging three
  packages as invalid.
- What the fix was: read the real versions out of `package-lock.json` and set the
  ranges from those. Same lesson as the selector rule in CLAUDE.md: never write down
  a fact about the environment without observing it first.

## 2026-09-01 — eslint.config.mjs imported a package that was never installed

- What was produced: an ESLint flat config opening with `import eslint from
'@eslint/js'`, without `@eslint/js` in the dependency tree.
- Why it was wrong: the import pattern was recalled from projects where that package
  came along implicitly; here nothing had installed it, so the config could not load.
- How it was caught: the first `npm run lint` failed with ERR_MODULE_NOT_FOUND before
  linting anything.
- What the fix was: `npm install --save-dev @eslint/js` (10.0.1).

## 2026-09-01 — tsconfig used a moduleResolution deprecated in TypeScript 6

- What was produced: `"module": "CommonJS", "moduleResolution": "Node"` — a pattern
  that was standard under TypeScript 5.
- Why it was wrong: the installed TypeScript is 6.0.3, where `node10` resolution is
  deprecated; `tsc` refuses the config outright with TS5107.
- How it was caught: the first `npm run typecheck` failed before checking any file.
- What the fix was: `"module": "preserve", "moduleResolution": "bundler"`, which also
  matches how Playwright's esbuild pipeline actually resolves test imports.

## 2026-09-01 — assumed MCP clicks are equivalent to user clicks; they were not delivered at all

- What was produced: discovery-step interactions driven by the MCP `browser_click`
  tool, on the assumption they behave like real user clicks.
- Why it was wrong: in this session most post-login clicks never reached the page. An
  instrumented `document.addEventListener` capture recorded zero
  pointerdown/mousedown/mouseup/click events across several clicks that the tool
  reported as successful, in two separate browser sessions; one login-page click also
  dropped. `element.click()` via `page.evaluate` worked every time.
- How it was caught: an Add to cart click produced no badge, no localStorage change,
  and an empty event log; `document.elementFromPoint` ruled out an overlay first.
- What the fix was: drive exploration through DOM-level clicks (React does not care
  about event trust), record the quirk prominently in the discovery doc, and treat
  "trusted clicks work" as unverified until the real `@playwright/test` suite proves
  it in a normal environment.

## 2026-09-01 — nearly recorded a false site behaviour from one flaky observation

- What was produced: an observation that checkout step one accepted an empty Last
  Name for standard_user (submit navigated to step two), on track to be written up as
  "Last Name is not validated".
- Why it was wrong: the earlier `fill('')` event had been dropped by the same
  unreliable input channel, so React state still held the previous value while the
  DOM read back empty. The validation exists and blocks correctly.
- How it was caught: re-ran the case from a clean page, read all three field values
  back immediately before submitting, and got the verbatim
  `Error: Last Name is required`. A follow-up probe confirmed fill events are
  delivered only intermittently.
- What the fix was: for every validation case, assert the observed input state before
  acting on the outcome; the discovery doc documents only re-verified results and
  flags the artefact explicitly (it matters because error_user's Last Name field is
  genuinely broken in a way that looks identical at first glance).

## 2026-09-01 — two broken attempts at measuring the performance_glitch_user delay

- What was produced: first, a login-duration measurement using
  `performance.getEntriesByType('navigation')` on the inventory page (107 ms — no
  glitch visible); second, a click-epoch-in-localStorage scheme compared against the
  next page's `performance.timeOrigin`.
- Why it was wrong: the post-login inventory page was restored from the back/forward
  cache, so the navigation entry described a load from a minute earlier — the second
  scheme returned a negative delay (−55 s), which exposed the first one as garbage
  too. The glitch happens before navigation starts, where document timing never sees
  it.
- How it was caught: the −55 s number was impossible on its face.
- What the fix was: wall-clock timing around `waitForURL` in the Playwright server
  process, with an identical standard_user control run: 5019 ms vs 21 ms. Lesson for
  the test suite: assert on user-perceived latency (click → page usable), never on
  navigation timing APIs, and always run a control.

## 2026-09-01 — discovery script nearly produced a false "no Location header" claim

- What was produced: the jsonplaceholder scratch script reported
  `headers: { location: null }` for POST — a hardcoded placeholder, because
  `location` was missing from the list of headers the script actually read.
- Why it was wrong: the report made it look observed-and-absent when it was simply
  never captured. The response's own `access-control-expose-headers: Location` hinted
  the opposite.
- How it was caught: noticed the mismatch between the placeholder and the
  expose-headers value while analysing the report, before writing the doc.
- What the fix was: a follow-up probe that read the header directly — POST does set
  `Location: https://jsonplaceholder.typicode.com/posts/101` (pointing at a URL that
  404s, now documented). Lesson: a claim that something is absent needs
  instrumentation that could have seen it present.

## 2026-09-01 — first draft of the test plan failed its own cross-check on 13 points

- What was produced: a draft docs/TEST_PLAN.md that read well but contained real
  defects: §4 claimed "neither target persists anything a test writes" while the web
  discovery doc (and the plan's own §5 and WEB-017) document SauceDemo's cart
  surviving logout; WEB-022 existed in the inventory but nowhere in the traceability
  matrix; §5's "every test logs in via a fixture" contradicted the seven login-page
  tests that never complete a login; four risk-table priorities disagreed with the
  inventory; §6 stated fullyParallel and a CI worker cap as facts that exist in no
  config file yet; the exit criteria gave non-pin P2 tests no pass condition; plus
  smaller drift (truncated "verbatim" quotes, "all five error messages" vs four
  distinct strings, WEB-025 describing error_user's loud failure as silent, scope
  rationales asserting unobserved facts about viewports/browsers/Cloudflare, and an
  uncovered All Items menu link missing from the matrix).
- Why it was wrong: the plan was written top-down from memory of the discovery docs
  in one pass; consistency between its own eight sections was assumed, not checked.
- How it was caught: a deliberate pre-commit cross-check pass against both discovery
  documents, checking every factual claim, every ID in both directions, and the
  plan's own arithmetic. All 13 findings were verified against discovery text before
  fixing.
- What the fix was: all 13 corrected before the commit — the non-persistence claim
  now attributes web isolation to per-test browser contexts rather than to a
  persistence property the site does not have; config-dependent claims are phrased
  as requirements on the build step; the matrix gained the missing rows and the
  exit criteria now cover all planned tests.
