Validate the framework. I want evidence it fails correctly, not just evidence it passes.

1. False-positive check. Pick five meaningful tests. For each one in turn, temporarily
   break the thing it's supposed to be checking — change a selector to something that
   doesn't exist, invert an expected value, point a client at a wrong path. Confirm the
   test fails, and confirm the failure message tells you what went wrong without needing
   the debugger. Record the actual failure output for each. Revert every change.

2. Flake hunt. Run the full suite with `--repeat-each=5` and with `--shuffle`. Any test
   that isn't stable across all runs gets fixed at the root cause — never with a retry,
   never with a timeout bump. Report the pass rate before and after.

3. Isolation check. Run each test file on its own, then all together in parallel. Results
   must be identical.

4. Timing. Report total wall-clock for the full suite, and the five slowest tests. If
   anything is disproportionately slow, say why.

5. Trace check. Force one failure and confirm the trace, screenshot, and video are all
   captured and actually useful.

6. Cold-start check. In a temp directory, clone the repo fresh, run only what the README
   says to run, and confirm the suite passes with no undocumented step. Fix the README if
   it doesn't.

Write it all up in `docs/FRAMEWORK_VALIDATION.md`, including the verbatim failure output
from step 1. Append anything you learned to the running AI evaluation log.

Then commit and push.
