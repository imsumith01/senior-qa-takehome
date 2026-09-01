import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Each project narrows to its own folder below; this is the umbrella.
  testDir: './tests',

  // A stray test.only would silently shrink the suite to one test; fail CI instead.
  forbidOnly: !!process.env.CI,

  // Nothing shares state (fresh context per test, stateless API), so files and the
  // tests inside them run fully parallel; ordering dependencies cannot hide.
  fullyParallel: true,

  // Both targets are shared public demos; CI would otherwise burst with one worker
  // per core, which is exactly the hammering the discovery ground rules prohibit.
  workers: process.env.CI ? 2 : undefined,

  // One retry in CI separates real regressions from infrastructure flakes. Locally,
  // retries are off so a flaky test fails loudly while it is being written.
  retries: process.env.CI ? 1 : 0,

  // list streams live progress to the terminal; html is the artifact a reviewer opens
  // afterwards. open: 'never' keeps CI and scripted runs from blocking on a browser.
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Trace only on the retry of a failed test: full debugging detail exactly when a
    // failure needs investigating, zero overhead on the healthy path.
    trace: 'on-first-retry',

    // Screenshots and videos carry no information for passing tests; keep artifacts
    // small and attention on failures.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://jsonplaceholder.typicode.com',
      },
    },
  ],
});
