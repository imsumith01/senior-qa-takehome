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
