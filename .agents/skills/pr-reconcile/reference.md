# PR Reconcile — Templates

Run after reading [SKILL.md](SKILL.md).

Worked example of this pattern: GitHub PR #136 body + `docs/pr-reviews/pr-136-review.md` after follow-up `82fcb0ac`.

---

## Fetch and write the GitHub body

```bash
gh pr view <number> --json body --jq .body > /tmp/pr-<number>-body.md
# edit /tmp/pr-<number>-body.md — append only
gh pr edit <number> --body-file /tmp/pr-<number>-body.md
```

Confirm the auto-generated blocks survived:

```bash
gh pr view <number> --json body --jq .body | grep -E 'coderabbit|CURSOR_SUMMARY'
```

---

## GitHub PR — inline

On the original Summary (or equivalent) bullet the follow-up changed, append a clause. Do not replace the bullet.

```markdown
- Original sentence about the feature. **Follow-up:** what is now true after the fix. (`<sha>`)
```

On Test plan, keep existing checkboxes. Add new ones the follow-up created:

```markdown
- [ ] Original check.
- [ ] New check that the follow-up made testable. **Added in follow-up** — one line why it was missing.
```

---

## GitHub PR — mid-body table

Insert **after** Summary and **before** Test plan and auto-generated comment blocks.

```markdown
## Review follow-up (`<sha>`)

Addresses the merge-blocking items from the PR-<n> audit.

| Finding | Status | How it was resolved |
| --- | --- | --- |
| Short finding label | **Fixed** | One to three sentences: where, what changed, how it persists/tests. |
| Short finding label | **Fixed** | … |
| Short finding label | **Open** | Only if this SHA did not land it. |

### Still open
- Item not in this commit, and why.
```

Use **Fixed** / **Open**. Do not delete older follow-up tables if a previous reconcile already added one — add a new table for the new SHA below the old one.

---

## GitHub PR — bottom resolution

Append **after** every existing block, including:

```html
<!-- This is an auto-generated comment: release notes by coderabbit.ai -->
…
<!-- end of auto-generated comment: release notes by coderabbit.ai -->

<!-- CURSOR_SUMMARY -->
…
<!-- /CURSOR_SUMMARY -->
```

```markdown
---

## Review resolution (`<sha>`)

Audit originally **requested changes**. Follow-up commit `<sha>` (`<subject>`) landed the merge-blocking fixes. Verdict after follow-up: **approve with minor comments**.

### What each issue addressed, and how

**1. <Finding title> (<Severity>)**
*Problem:* …
*Fix:* …
*Tests:* …

**2. <Finding title> (<Severity>)**
*Problem:* …
*Fix:* …

### What remains

- …

`pnpm check` / targeted tests / suite notes go here if they are facts from this follow-up.

### Lessons learned

1. **<Generalizable pattern>.** <What went wrong.>
   **Avoid:** <Concrete prevention.>

2. **<Generalizable pattern>.** <What went wrong.>
   **Avoid:** <Concrete prevention.>

3. **<Generalizable pattern>.** <What went wrong.>
   **Avoid:** <Concrete prevention.>
```

Verdict wording matches the audit scale: Approve / Approve with minor comments / Request changes / Block merge.

---

## Review document — header

Keep the original verdict line. Add follow-up next to it:

```markdown
**Verdict:** **Request changes**
**Follow-up:** `<sha>` (`<subject>`) — original findings kept below. Status after follow-up: **Approve with minor comments**.
```

---

## Review document — finding status

Immediately after the original finding body (after Acceptance / suggested fix), add:

```markdown
**Status (`<sha>`): Resolved.** <How the landed commit fixed it. Files/tests in one or two sentences.>
```

Or, if not landed:

```markdown
**Status (`<sha>`): Still open.** <Why it was deferred.>
```

Do not delete **Where / What / Why it matters / Suggested fix**.

---

## Review document — other sections

| Section | Append |
| --- | --- |
| Executive Summary | `**Follow-up (\`<sha>\`):**` the merge-blocking items that are now fixed; remaining are named. |
| PR Map | `**Follow-up:**` on changed rows only. |
| Strengths | One line if the follow-up added coverage worth noting. |
| Risk Assessment | `**Follow-up:** residual …` on each affected row. Optional residual paragraph under the table. |
| Fix Plan | `**Done (\`<sha>\`):**` on completed must-fix items. `**Still open.**` on the rest. |
| Open Questions | `**Decided:**` the user's call. Keep the original question. |
| Verification | New `**Follow-up verification (\`<sha>\`):**` list. Keep the original `pnpm check` / `pnpm test` results even if they failed — that was true at audit time. |
| Final verdict | Keep `**Final verdict: Request changes.** …` then add `**Follow-up verdict:** …` |

---

## Review document — bottom

Same resolution shape as the GitHub PR. Lessons **must match** the PR body (same three patterns, same Avoid lines). Extra local detail (file paths, test file names) is fine in *Problem* / *Fix* / *Tests*.

```markdown
---

## Review resolution (`<sha>`)

Original audit requested changes at `<audit-head-sha>`. Follow-up commit `<sha>` (`<subject>`) landed the merge-blocking fixes.

### What they address, and how each was resolved

**1. …**
*Problem:* …
*Fix:* …
*Tests:* …

### What remains

- …

### Lessons learned

1. **…**
   **Avoid:** …
```

---

## Review threads

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments --jq '.[] | {id, path, line, body: .body[0:120]}'
```

Reply:

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments/<comment-id>/replies -f body='Landed in <sha>: <one sentence how.>'
```

Only for comments this SHA actually addressed.

---

## Do not commit unless asked

`docs/pr-reviews/` updates stay unstaged until the user asks to commit. Do not add `.vitest-attachments/` or screenshot dumps that appeared while verifying the follow-up.
