Switch roles. You are now a senior QA lead reviewing this repository as a hiring decision.
You did not write it. You have twenty minutes.

Review it critically and write `docs/SELF_REVIEW.md` containing:

1. The three strongest things about this submission.
2. The three weakest. Be harsh. What would make you pass on this candidate?
3. Any test that looks like it's asserting something but isn't.
4. Any place the readability rules in CLAUDE.md were quietly violated.
5. Anything that would break if the site changed slightly, or that depends on a
   coincidence of the current data.
6. Anything that reads as machine-generated rather than authored — repetitive comment
   patterns, uniform phrasing, tests that exist for symmetry rather than because a risk
   justified them.
7. Coverage gaps the test plan doesn't acknowledge.

Then fix everything in categories 3, 4, and 6, and anything in 5 that's cheap to fix.
Leave the rest documented as known limitations with a note on why it wasn't addressed.

Commit the review and the fixes separately so the diff between them is visible.
