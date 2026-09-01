// Every schema in this folder transcribes the shapes observed live in
// docs/discovery/jsonplaceholder-contract.md §1.
import type { ZodType } from 'zod';

const MAX_ISSUES_TO_REPORT = 10;

// Validates a parsed response body against a schema. On mismatch it throws a plain
// Error whose message names each offending field path, so a contract drift reads as
// e.g. "3.userId: expected number, received string" instead of a TypeError three
// assertions later. Returns the typed data on success, giving tests one source of
// truth for both the runtime check and the static type.
export function parseWithSchema<SchemaOutput>(
  schema: ZodType<SchemaOutput>,
  body: unknown,
  responseDescription: string,
): SchemaOutput {
  const result = schema.safeParse(body);
  if (result.success) {
    return result.data;
  }
  const reportedIssues = result.error.issues.slice(0, MAX_ISSUES_TO_REPORT);
  const issueLines = reportedIssues.map(
    (issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  const hiddenCount = result.error.issues.length - reportedIssues.length;
  if (hiddenCount > 0) {
    issueLines.push(`  … and ${hiddenCount} more issue(s)`);
  }
  throw new Error(`${responseDescription} does not match its schema:\n${issueLines.join('\n')}`);
}
