import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettierConfig from 'eslint-config-prettier';

// Enforces the readability rules from CLAUDE.md wherever a linter can. The rules a
// linter cannot check remain conventions; they are listed at the bottom of this file
// so a reader knows they are deliberate and not forgotten.
export default tseslint.config(
  {
    ignores: ['node_modules', 'test-results', 'playwright-report', 'blob-report'],
  },

  eslint.configs.recommended,
  // Type-checked rules make no-floating-promises possible; a forgotten `await` in a
  // Playwright test otherwise passes silently and asserts nothing.
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // CLAUDE.md rule 7: `any` turns the type checker off exactly where a reader
      // most needs its help.
      '@typescript-eslint/no-explicit-any': 'error',

      // CLAUDE.md rule 7: assertions are banned outright; the rare justified one is
      // written as `// eslint-disable-next-line ... -- <why>`, which forces the
      // one-line justification the rule demands.
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],

      // A non-null assertion is a hidden, unjustified cast.
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Playwright fixtures activate by their mere presence in a test's destructured
      // parameters (e.g. loggedInAsStandardUser logs in without ever being
      // referenced); the rule cannot know that, so those names are exempted.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^loggedInAs' }],
      '@typescript-eslint/no-floating-promises': 'error',

      // CLAUDE.md rule 3: no clever syntax.
      'no-nested-ternary': 'error',

      // Covers empty catch blocks (CLAUDE.md rule 5: never swallow an error).
      'no-empty': 'error',

      // CLAUDE.md rule 2: one function does one thing, "about 20 lines". Line count
      // and cyclomatic complexity are the closest measurable proxies; the cap is 25,
      // deliberately — a hard 20 would punish the rule's own "about".
      'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 6],

      // CLAUDE.md rule 1: names are full words, so no single-letter identifiers.
      'id-length': ['error', { min: 2 }],

      // CLAUDE.md rules 4 and 6: no inheritance anywhere — neither page-object
      // hierarchies nor custom exception classes extending Error.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration[superClass]',
          message:
            'CLAUDE.md forbids inheritance: no base page objects, no custom exception classes. Use composition or a standalone class.',
        },
      ],
    },
  },

  // Plain-JavaScript files (this config, the CI summary script) sit outside the
  // TypeScript project, so the type-aware rules cannot run on them — and they run
  // under Node, whose globals the linter must be told about.
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  // CLAUDE.md rule 10: web-first assertions only. The plugin catches waitForTimeout,
  // element handles, and assertions that miss their await.
  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/no-wait-for-timeout': 'error',
    },
  },

  // Must come last: turns off any layout rule above so Prettier owns formatting.
  prettierConfig,

  // Conventions a linter cannot enforce — deliberate, reviewed by humans instead:
  // - CLAUDE.md rule 5: try/catch only for expected failures handled meaningfully
  //   (no-empty catches the worst case; intent needs a human).
  // - CLAUDE.md rule 8: no barrel files; import from the source file directly.
  // - CLAUDE.md rule 9: no magic values in tests (no-magic-numbers is too noisy to
  //   run project-wide; constants live in src/data/).
  // - CLAUDE.md rules 12-14: sentence-style test names, Arrange/Act/Assert structure,
  //   comments that explain why rather than what.
);
