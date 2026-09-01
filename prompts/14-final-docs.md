Write the final documentation. This is the graded deliverable, so give it real effort.

1. `README.md`, complete rewrite:
   - What this is and what it covers.
   - Quick start: clone, install, run. Verified to work from cold.
   - Repository layout with a one-line explanation per directory.
   - How to run subsets: by project, by tag, headed, debug, single test.
   - How to read a failure: where the report, trace, and video are.
   - How to add a new page object and a new test, with a short worked example.
   - The design decisions, each with the alternative that was rejected and why:
     one runner for both targets, page objects without inheritance, runtime schema
     validation, the state-isolation approach, the retry policy.
   - Known limitations and what you'd do next with more time.
   - A statement that the repo was created from scratch for this exercise.

2. `prompts/README.md`: an index of every prompt file in order, with a line on what each
   step produced. Note that the full verbatim prompt is also in the corresponding commit
   message body, and show a `git log` command that displays them.

3. `docs/AI_EVALUATION.md` — the main assessed artefact. Build it from the running log,
   not from memory. Structure:

   - Approach: how the work was split between me and you, and why in that order.
   - What worked well: be specific and cite the actual file or commit. "Good at
     boilerplate" is worthless; "generated all eight page objects with consistent
     structure in one pass, needing only selector corrections" is useful.
   - What did not work: this section must be honest and concrete. Every hallucinated
     selector, wrong assumption about the API, test that passed for the wrong reason,
     over-abstracted code that had to be simplified, and CI/local divergence. Include the
     specific example and how it was caught.
   - Where AI output was actively misleading — cases where the generated code looked
     correct and plausible but was wrong. These are the most valuable entries because they
     are the ones a reviewer worries about.
   - What I changed and why: the specific human interventions, tied to commits.
   - What the reconnaissance step changed: compare what you would have written from memory
     against what the live site actually does.
   - Guardrails that made the difference: the readability rules, the
     verify-before-you-write-a-selector rule, the false-positive validation step.
   - What I'd do differently next time.

   Do not write this as marketing copy for AI-assisted development. A balanced, critical
   evaluation scores better than an enthusiastic one, and the brief explicitly asks for
   what did not work.

4. `docs/KNOWN_DEFECTS.md`: the SauceDemo defects found, how they were found, which are
   deliberate, and how the suite responds to each.

Then commit and push.
