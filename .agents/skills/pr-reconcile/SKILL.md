---
name: pr-reconcile
description: >-
  Use when review findings on a GitHub PR were implemented and the PR description
  or docs/pr-reviews/pr-*-review.md needs updating; after a Request changes
  audit; when the user says reconcile the PR, keep the original PR text, append
  review resolution, add lessons learned, or update the PR document after
  fixes. Also when tempted to rewrite a PR body or overwrite a saved audit.
---

# PR Reconcile

Append-only closeout after review findings land. Updates **both** the GitHub PR body **and** `docs/pr-reviews/pr-<n>-review.md`.

**Works in:** Cursor, Claude Code, Codex — canonical files live in `.agents/skills/pr-reconcile/`. Symlinks: `.claude/skills/pr-reconcile`, `.cursor/skills/pr-reconcile`, `.codex/skills/pr-reconcile`.

**Pair:** `pr-audit-review` writes the original audit. This skill never replaces that audit.

This skill does **not** implement code. Land the follow-up commit first (or reconcile only what actually landed).

---

## Iron law

**Never delete, rewrite, or replace original PR text or original audit text.** Fetch the current body. Patch it. Original verdict, findings, summaries, test plan, CodeRabbit, and Bugbot stay.

Violating the letter is violating the spirit.

---

## Before you start

1. Confirm git repo + `gh auth status`. Stop if `gh` is not authenticated.
2. Confirm the follow-up commit SHA and subject (`git log -1 --oneline` on the PR branch).
3. Confirm `docs/pr-reviews/pr-<n>-review.md` exists. If missing, tell the user; do not invent an audit.
4. Copy the checklist below and track it.

```text
- [ ] Step 1 — Confirm PR, review file, follow-up SHA
- [ ] Step 2 — Fetch current GitHub PR body (never reconstruct)
- [ ] Step 3 — Patch GitHub PR body (inline + mid table + bottom)
- [ ] Step 4 — Patch docs/pr-reviews/pr-<n>-review.md (inline + bottom)
- [ ] Step 5 — Optional: reply on addressed review threads
- [ ] Step 6 — Summarize for the user
```

---

## Step 1 — Confirm PR, review file, follow-up SHA

```bash
gh pr view <number> --json number,title,url,headRefName,body
```

Need: PR number, follow-up SHA, path `docs/pr-reviews/pr-<number>-review.md`.

If the user named a PR, use it. If several are open, confirm which one.

Mark a finding **Resolved** only when the landed commit actually fixes it. Unlanded items go under **What remains**.

---

## Step 2 — Fetch current GitHub PR body

```bash
gh pr view <number> --json body --jq .body > /tmp/pr-<number>-body.md
```

Edit that file. Do not draft a new description from the commits.

Preserve verbatim:

- Original Summary / Test plan copy
- HTML comment blocks (`<!-- ... coderabbit ... -->`, `<!-- CURSOR_SUMMARY -->` … `<!-- /CURSOR_SUMMARY -->`)
- Any other auto-generated or human text already on the PR

---

## Step 3 — Patch GitHub PR body

Three placements. All three. Templates: [reference.md](reference.md).

1. **Inline** on the original bullets the follow-up changed (`**Follow-up:** … (\`<sha>\`)`). Add matching test-plan checkboxes if the follow-up created new user-visible checks.
2. **Mid-body** after Summary (before Test plan / auto-generated blocks): `## Review follow-up (\`<sha>\`)` table — finding, status, how resolved — plus **Still open**.
3. **Bottom**, after every existing block including CodeRabbit and Bugbot: `## Review resolution (\`<sha>\`)` — original verdict, problem/fix/tests per finding, what remains, **exactly 3** lessons learned (pattern + **Avoid:**).

Then:

```bash
gh pr edit <number> --body-file /tmp/pr-<number>-body.md
```

Never `gh pr edit --body "…"`. Never `--body` from a reconstructed summary.

---

## Step 4 — Patch the review document

Edit `docs/pr-reviews/pr-<number>-review.md` in place. Do not write a new file. Do not overwrite.

Keep the original **Verdict** / **Final verdict** lines. Add follow-up SHA + new verdict **next to** them, not instead of them.

Inline on the existing sections (do not delete the original paragraphs):

| Location | Add |
| --- | --- |
| Header | `**Follow-up:** \`<sha>\` (\`subject\`)` + status after follow-up |
| Executive Summary | Short **Follow-up (\`<sha>\`):** what is now fixed |
| PR Map rows | `**Follow-up:**` on rows the commit changed |
| Each finding | `**Status (\`<sha>\`): Resolved.**` (or Still open) + how |
| Strengths / Risk / Fix Plan / Open Questions / Verification | `**Follow-up:**` / **Done** / **Decided** / extra verification block |
| After original final verdict | `**Follow-up verdict:** …` |

Bottom of the file: the same `## Review resolution (\`<sha>\`)` shape as the PR (problem / fix / tests, remains, 3 lessons). Lessons on the PR and in the doc must match.

Do not commit the review file unless the user asks.

---

## Step 5 — Optional review-thread replies

If GitHub review threads exist for findings this commit fixed:

```bash
gh api repos/<owner>/<repo>/pulls/<number>/comments
```

Reply on the thread. Do not hide or resolve threads unless the user asks. Do not delete prior comments.

---

## Step 6 — Summarize for the user

- PR URL
- Follow-up SHA
- What was marked resolved vs still open
- Path to the patched review file
- That original PR body and original audit were kept

Do not paste both full documents into chat.

---

## Lessons learned (required)

Exactly **3**. Each is a reusable failure mode, not a changelog of files.

```markdown
N. **<generalizable pattern>.** <what went wrong in this PR, one or two sentences>
   **Avoid:** <concrete prevention a future PR can follow>
```

Not: "we fixed LeftoverSlot." Yes: "a production card without its persistence callback is silent success."

---

## Rationalizations

| Excuse | Reality |
| --- | --- |
| "The old Summary is stale; a clean rewrite is clearer." | Stale bullets get a **Follow-up:** clause. The original stays. |
| "CodeRabbit / Bugbot is outdated after the fix." | Those blocks stay verbatim. Resolution goes after them. |
| "I'll replace Request changes with Approve." | Keep the original verdict. Add a follow-up verdict beside it. |
| "The audit file is long; a new review is enough." | Patch the existing file. History of the finding is the point. |
| "GitHub PR is enough; skip the markdown." | Both surfaces. Always. |
| "Markdown is enough; skip the GitHub body." | Both surfaces. Always. |
| "Lessons learned are optional fluff." | Exactly 3, with **Avoid:**. Required. |
| "I'll reconstruct the PR body from memory." | `gh pr view` first. `--body-file` the patched copy. |
| "Unfixed nits can be marked Resolved to close the review." | Resolved = landed in the SHA. Else **What remains**. |

## Red flags — stop

- Drafting a new PR description instead of editing the fetched body
- `gh pr edit --body` with a short rewrite
- Deleting CodeRabbit / Bugbot / original test plan
- Changing the original **Verdict:** line in place
- Writing a new `pr-<n>-review.md` instead of editing the existing one
- Updating only GitHub or only the review file
- Zero or more than three lessons, or lessons without **Avoid:**
- Marking an unlanded finding Resolved

---

## When not to use

- First review of a PR → `pr-audit-review`
- Implementing the review fixes → write code and tests; come back here after they land
- User asked to replace the PR description from scratch — confirm; that is not this skill

---

## Platform notes

| Platform | Invoke |
| --- | --- |
| **Cursor** | Attach skill or `@pr-reconcile` |
| **Claude Code** | `/pr-reconcile` or skill picker |
| **Codex** | `.codex/skills/pr-reconcile` → `.agents/skills/pr-reconcile` |

---

## Additional resources

- Templates and `gh` commands: [reference.md](reference.md)
