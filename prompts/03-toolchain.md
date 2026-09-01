Set up the toolchain. Nothing site-specific yet.

1. `npm init`, then install: @playwright/test, typescript, @types/node, and the
   Playwright browsers.
2. Add ESLint + Prettier with a config that actively enforces the readability rules in
   CLAUDE.md. At minimum, turn on rules against: `any`, unused variables, nested
   ternaries, non-null assertions, floating promises, and empty catch blocks. Set a
   max-lines-per-function limit around 25 and a complexity limit around 6. If a rule can't
   be enforced by a linter, note it in a comment in the config so a reader knows it's a
   convention.
3. `tsconfig.json` in strict mode with `noUncheckedIndexedAccess` on.
4. `playwright.config.ts` with two projects: `web` and `api`. Set `baseURL` for each,
   `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`,
   HTML reporter plus list reporter, `retries: process.env.CI ? 1 : 0`, and `forbidOnly`
   in CI. Add a short comment above each option explaining why it's set that way.
5. npm scripts: `test`, `test:web`, `test:api`, `test:headed`, `test:debug`,
   `report`, `lint`, `format`, `typecheck`.
6. Confirm `npx playwright test --list` runs cleanly with zero tests.

Explain your reasoning for using one runner for both web and API rather than adding a
separate API tool — I want that reasoning captured in the commit message.

Then commit and push.
