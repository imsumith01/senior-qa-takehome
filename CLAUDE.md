# CLAUDE.md

Standing rules for this repository. They were set by the project owner at the start of
the exercise and apply to every session and every step. The section markers have been
converted to markdown headings; the rule text itself is verbatim from the original
prompt, which is archived at `prompts/01-project-rules.md`.

## Project

Build an automated testing framework from scratch covering two targets:

- Web: https://www.saucedemo.com/
- API: https://jsonplaceholder.typicode.com/

Stack: TypeScript + Playwright Test for both targets. Node 20+.

The repository must be created fresh and should be public for this exercise. Do not
clone, fork, copy, or adapt any existing automation framework. Libraries and official
docs are fine as reference; the structure and code must be written here.

## Readability rules (these are the hard constraints)

The grader is a human reading this on a screen. Optimise for a reviewer who has never
seen the code, not for line count.

1. Names are full words. `checkoutOverviewPage`, not `cop`. `expectedTotalWithTax`, not
   `tot`. No single-letter variables except loop indices, and prefer not even then.
2. One function does one thing. If a function is longer than about 20 lines, split it.
3. No clever syntax. No nested ternaries, no chained optional-chaining gymnastics, no
   regex where a string method reads better, no array method chains more than two links
   long. If you can write it as a plain `for...of` loop and it reads better, do that.
4. No custom exception classes. No exception hierarchies. No error wrapping.
5. No try/catch unless you are handling a genuinely expected failure and doing something
   meaningful with it. Never swallow an error. Never catch just to re-log and re-throw.
   Let Playwright's native failure messages surface — they are better than anything we'd
   write.
6. No abstract base classes, no `BasePage` god class, no inheritance between page
   objects. Composition or plain standalone classes only.
7. No `any`. No type assertions (`as`) unless you write a one-line comment saying why.
8. No barrel files (`index.ts` re-export hubs). Import directly from the source file so a
   reader can follow a path.
9. No magic strings or numbers in tests. Named constants in a test-data file, e.g.
   `const SALES_TAX_RATE = 0.08;`
10. Web-first assertions only: `await expect(locator).toBeVisible()`. Never
    `waitForTimeout`, never `sleep`, never manual polling loops.
11. Every page object declares its locators once, as named readonly properties at the top
    of the class. Never inline a raw selector string inside a test file.
12. Test names read as English sentences describing behaviour and expected outcome.
    Example: `test('rejects login when the password is wrong and shows the error banner')`
13. Structure every test as Arrange / Act / Assert, separated by blank lines, with a short
    comment on each section when the test is non-obvious.
14. Comments explain *why*, never *what*. Delete any comment that restates the code.
15. Prefer a little duplication over a shared abstraction that's hard to follow. If two
    tests each set up their own cart, that's fine.

## Git workflow (follow this for every single step)

For each step the project owner gives, in this exact order:

1. Save the verbatim prompt to `prompts/NN-short-slug.md` (NN = zero-padded step number).
   Copy it exactly as typed, including any typos. Do not paraphrase or clean it up.
2. Do the work.
3. `git add -A`
4. Write the commit message to a temp file, then commit with `git commit -F <file>`.
   Do not try to pass a long message with -m; the escaping will break.
   Format:

   ```
   <type>(<scope>): <imperative subject line, under 72 chars>

   What changed
   - bullet
   - bullet

   Decisions and trade-offs
   - bullet

   Prompt used (verbatim, also saved at prompts/NN-short-slug.md):
   ---
   <the full prompt text, verbatim>
   ---
   ```

5. `git push`

If a step is large, make several smaller commits instead of one giant one. Each of those
commits repeats the same verbatim prompt in its body and adds a line saying which slice
of the step it covers.

Never combine two prompts into one commit. Never commit without pushing.

## Running log

Maintain `docs/AI_EVALUATION_LOG.md` from the very first step. Every time something goes
wrong — a selector that didn't exist, an assumption about the API that turned out false,
a test that passed for the wrong reason, code that had to be rewritten because it was
unreadable — append a dated entry at that moment with: what was produced, why it was
wrong, how it was caught, what the fix was. Write these as they happen. Do not
reconstruct them at the end; reconstructed notes are generic and useless.

## How to use Playwright MCP

Use the Playwright MCP browser to *investigate* the live site: navigate, snapshot the
accessibility tree, read real attributes, confirm behaviour. Every selector committed
must be one actually observed through MCP, not one recalled from training data. If you
find yourself writing a selector from memory, stop and go look.

MCP is for exploration and verification only. The committed test suite is ordinary
`@playwright/test` code and must run standalone with `npx playwright test`, with no MCP
dependency whatsoever.

## Tone

When you disagree with something the project owner asked for, say so before doing it.
When you're guessing, say you're guessing. Do not say something works until you've
run it.
