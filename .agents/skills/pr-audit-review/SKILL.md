---
name: pr-audit-review
description: >-
  Principal-engineer-level pull request audit and review. Use when the user wants
  to review, audit, critique, or assess a pull request — e.g. "review my PR",
  "audit PR 37", "check this PR before merge", "is this PR safe to merge", or
  any PR review request. Confirms which PR to review, runs a rigorous
  evidence-grounded analysis (no code changes), and saves the report to
  docs/pr-reviews/.
---

# PR Audit & Review

Produce an honest, evidence-grounded review of a GitHub pull request and save it as Markdown under `docs/pr-reviews/`.

The review rubric is fixed in [references/review-prompt.md](references/review-prompt.md). Follow it **exactly** for analysis structure and deliverable sections. This file covers the **workflow** (pick PR → review → save report).

**Works in:** Cursor, Claude Code, Codex — canonical files live in `.agents/skills/pr-audit-review/`. Claude Code loads via symlink at `.claude/skills/pr-audit-review`.

**Output:** `docs/pr-reviews/pr-<number>-review.md` (create the folder if missing).

---

## Before you start

1. Confirm you're in a git repo with a GitHub remote.
2. Confirm `gh` works: `gh auth status`. If not authenticated, stop and tell the user.
3. Do **not** modify PR code — analysis only.

---

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — List open PRs
- [ ] Step 2 — Confirm which PR to review
- [ ] Step 3 — Gather PR context and diff
- [ ] Step 4 — Run the review (review-prompt.md)
- [ ] Step 5 — Save report to docs/pr-reviews/
- [ ] Step 6 — Summarize for the user
```

### Step 1 — List open PRs

```bash
gh pr list --state open --json number,title,headRefName,author,updatedAt \
  --template '{{range .}}#{{.number}}  {{.title}}  ({{.headRefName}}, @{{.author.login}}){{"\n"}}{{end}}'
```

- No remote / not a repo → tell the user and stop.
- Zero open PRs → say so; offer to review a specific number (closed/merged PRs still work).

### Step 2 — Confirm which PR to review

**Always confirm with the user** before reviewing — even if they named a PR in the request.

Use `AskQuestion` when available: one option per open PR (`#<number> <short title>`). If the user already named a PR, put that option first as the recommended choice.

If there are more PRs than fit in the picker, list them in chat and ask the user to pick by number or URL.

Do not start the review until the user confirms.

### Step 3 — Gather PR context and diff

```bash
gh pr view <number> --json title,body,additions,deletions,changedFiles,headRefName,baseRefName,state,url
gh pr diff <number>
```

Open surrounding files when the diff alone does not explain behavior. Read project conventions as needed — see [reference.md](reference.md).

Optionally run `pnpm check` / `pnpm test` when quick and relevant. If you skip them, say so in the report.

### Step 4 — Run the review

Read [references/review-prompt.md](references/review-prompt.md) and follow it exactly:

- Ground every claim in `file:line` evidence.
- If something cannot be verified from the diff or repo, say so explicitly.
- Produce all **7 sections**: Executive Summary, PR Map, Findings, Strengths, Risk Assessment, Fix Plan, Open Questions.
- Tag each finding with Critical / High / Medium / Low.
- End Risk Assessment with one verdict: Approve, Approve with minor comments, Request changes, or Block merge.

Formatting details: [reference.md](reference.md).

### Step 5 — Save report to docs/pr-reviews/

1. Ensure `docs/pr-reviews/` exists (create if missing).
2. Write `docs/pr-reviews/pr-<number>-review.md`.
3. Use a self-contained Markdown file: title line with PR stats, then the seven `##` sections.

Tell the user the saved path when done.

### Step 6 — Summarize for the user

In chat, give a short summary:

- Verdict (Approve / Request changes / etc.)
- Top 1–3 findings (or "no serious issues")
- Path to the full report

Do not paste the entire review into chat unless the user asks.

---

## Notes

- **Fixed rubric.** Do not improvise a different review structure. If the user wants a lighter review, shorten within the same 7-section skeleton.
- **No code changes.** This skill audits only.
- **Prefer high-confidence findings** over speculative nitpicks.
- **Existing reports.** Overwriting `docs/pr-reviews/pr-<number>-review.md` is fine when re-reviewing the same PR **from scratch**; mention if you replaced a prior file. After findings were implemented, use **pr-reconcile** instead — append to the existing audit and GitHub PR body; never overwrite.

---

## Platform notes

| Platform | Invoke |
|----------|--------|
| **Cursor** | Attach skill or `@pr-audit-review` |
| **Claude Code** | `/pr-audit-review` or skill picker |
| **Codex** | Load project skill `pr-audit-review` from `.agents/skills/` |

---

## Additional resources

- Review rubric (verbatim): [references/review-prompt.md](references/review-prompt.md)
- gh commands, output format, Cairno context: [reference.md](reference.md)
