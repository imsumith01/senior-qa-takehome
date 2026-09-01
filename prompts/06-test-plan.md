Write `docs/TEST_PLAN.md` based on the two discovery documents. This is the requirements
input for everything that follows. Still no test code.

Include:

1. Scope: what's in, what's out, and why. Be explicit about what you are deliberately not
   automating and give the reason — a reviewer respects a stated boundary more than
   silent omission.
2. A risk table: feature area, what failure would cost a real user, likelihood, resulting
   test priority. Order the whole plan by this, not by what's convenient to automate.
3. A test inventory. Every planned test gets a stable ID (WEB-001, API-001), a one-line
   description, a priority, and a tag (@smoke, @regression, @negative, @contract).
4. Test data strategy. What's hardcoded, what's derived at runtime, what's read back from
   the app, and how you avoid tests depending on each other.
5. Isolation and state strategy for the web suite. SauceDemo persists cart state in
   browser storage — say exactly how each test starts from a known state and why you chose
   that approach over the alternatives.
6. Environment and execution: browsers, parallelism, retry policy, how CI differs from
   local.
7. Entry and exit criteria.
8. A traceability matrix mapping each application feature to the test IDs covering it, so
   gaps are visible.

Be opinionated. If you think a commonly-automated scenario is low value here, say so and
leave it out with a justification.

Then commit and push.
