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
