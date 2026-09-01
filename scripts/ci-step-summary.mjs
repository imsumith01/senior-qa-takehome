// Appends a pass/fail table for one suite run to the GitHub step summary, so a
// reviewer sees the outcome without downloading artifacts. Reads the JSON report
// the CI reporter configuration writes (playwright.config.ts).
import { appendFileSync, readFileSync } from 'node:fs';

const [reportPath, suiteName] = process.argv.slice(2);
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (!reportPath || !suiteName || !summaryPath) {
  console.error(
    'usage: ci-step-summary.mjs <results.json> <suite name> (needs GITHUB_STEP_SUMMARY)',
  );
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const stats = report.stats;

const failedTestTitles = [];
function collectFailures(suite, breadcrumb) {
  for (const spec of suite.specs ?? []) {
    if (!spec.ok) {
      failedTestTitles.push(`${breadcrumb}${spec.title}`);
    }
  }
  for (const childSuite of suite.suites ?? []) {
    collectFailures(childSuite, `${breadcrumb}${childSuite.title} › `);
  }
}
for (const topSuite of report.suites ?? []) {
  collectFailures(topSuite, `${topSuite.title} › `);
}

const verdict = stats.unexpected === 0 ? '✅ passed' : '❌ failed';
const seconds = (stats.duration / 1000).toFixed(1);
const lines = [
  `## ${suiteName}: ${verdict}`,
  '',
  '| Passed | Failed | Flaky | Skipped | Duration |',
  '| --- | --- | --- | --- | --- |',
  `| ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${seconds}s |`,
  '',
];
if (failedTestTitles.length > 0) {
  lines.push('**Failed tests:**', '');
  for (const title of failedTestTitles) {
    lines.push(`- ${title}`);
  }
  lines.push('');
}
appendFileSync(summaryPath, lines.join('\n'));
